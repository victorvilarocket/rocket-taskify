import { GoogleGenAI } from '@google/genai';
import type { TaskSuggestion, TaskFormData } from './types';

export class AIService {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async suggestTaskFields(formData: TaskFormData): Promise<TaskSuggestion> {
    const prompt = this.buildPrompt(formData);

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: prompt,
      });

      const text = response.text || '';
      
      if (!text) {
        throw new Error('La IA no devolvió ninguna respuesta');
      }
      
      // Parse the JSON response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No se pudo parsear la respuesta de la IA');
      }

      const suggestion = JSON.parse(jsonMatch[0]);
      return suggestion;
    } catch (error) {
      console.error('Error generating task suggestion:', error);
      throw new Error('Error al generar sugerencias con IA');
    }
  }

  private buildPrompt(formData: TaskFormData): string {
    const spacesContext = formData.availableSpaces && formData.availableSpaces.length > 0
      ? `\n\nPROYECTOS/CLIENTES DISPONIBLES EN CLICKUP:\n${formData.availableSpaces.map(s => `- ${s.name} (ID: ${s.id})`).join('\n')}`
      : '';

    const membersContext = formData.availableMembers && formData.availableMembers.length > 0
      ? `\n\nMIEMBROS DEL EQUIPO DISPONIBLES:\n${formData.availableMembers.map(m => `- ${m.username || m.email} (ID: ${m.id})`).join('\n')}`
      : '';

    const sprintsContext = formData.availableSprints && formData.availableSprints.length > 0
      ? `\n\nSPRINTS DISPONIBLES:\n${formData.availableSprints.map(s => `- ${s.name} (ID: ${s.id})`).join('\n')}`
      : '';

    return `Actúa como un Product Manager senior especializado en proyectos Shopify (desarrollo de themes, migraciones, custom apps, etc.) e integraciones entre Shopify y terceros (e.g. ERP, CRMs, etc.).

Dado el siguiente input, genera UNA tarea clara y bien estructurada para el equipo técnico.

TEXTO DE ENTRADA DEL USUARIO:
${formData.description}
${spacesContext}
${membersContext}
${sprintsContext}

INSTRUCCIONES:
1. **Título de la tarea**: Claro, conciso y accionable (máx 80 caracteres)

2. **Descripción**: Debe incluir en formato markdown:
   - **Objetivo**: Qué se quiere lograr
   - **Criterios de Aceptación**: Lista específica y verificable (mínimo 3)
   - **Consideraciones Técnicas**: APIs de Shopify relevantes (Admin API, Storefront API, GraphQL, Liquid, Webhooks, etc.)
   - **Dependencias**: Si hay algo que debe hacerse antes

3. **Cliente/Proyecto sugerido**: Basándote en el input y el listado de proyectos disponibles, sugiere el ID del proyecto más apropiado. Si no estás seguro o no hay suficiente información, NO sugieras ninguno (deja el campo null).

4. **Tipo de tarea**:
   - "task": Desarrollo, implementación, features
   - "bug": Errores, problemas que arreglar
   - "meet": Reuniones, llamadas, sesiones de planificación

5. **Prioridad**: Determina según urgencia e impacto
   - "urgent": Crítico, bloquea el negocio o desarrollo
   - "high": Importante, debe hacerse pronto
   - "normal": Tarea estándar
   - "low": Puede esperar, mejoras menores

6. **Estimación**: Tiempo realista en MINUTOS. Considera:
   - Research/análisis: 30-60 min
   - Tareas pequeñas (cambios menores): 60-120 min
   - Tareas medianas (features simples): 120-240 min
   - Tareas grandes (features complejas): 240-480 min
   - Bugs simples: 30-90 min
   - Bugs complejos: 120-240 min
   - Reuniones: 30-60 min

7. **Asignación sugerida**: Si en el input se menciona nombres de personas o roles específicos, sugiere los IDs de los miembros del equipo correspondientes. Si no se menciona nadie específicamente, deja el array vacío.

8. **Sprint sugerido**: Si en el input se menciona un sprint específico o una fecha que coincide con un sprint, sugiere el ID del sprint. Si no, deja null.

9. **Tags**: Palabras clave relevantes (shopify, liquid, graphql, theme, app, migration, integration, frontend, backend, etc.)

RESPONDE ÚNICAMENTE CON UN JSON (sin markdown, sin explicaciones, sin texto adicional) con esta estructura EXACTA:

{
  "name": "Título claro y accionable de la tarea",
  "description": "## Objetivo\\n[Qué se quiere lograr]\\n\\n## Criterios de Aceptación\\n- [ ] Criterio específico 1\\n- [ ] Criterio específico 2\\n- [ ] Criterio específico 3\\n\\n## Consideraciones Técnicas\\n[APIs de Shopify, endpoints, webhooks, etc.]\\n\\n## Dependencias\\n[Si aplica]",
  "type": "task",
  "priority": "normal",
  "timeEstimate": 120,
  "tags": ["shopify", "tag1", "tag2"],
  "suggestedSpaceId": null,
  "suggestedAssigneeIds": [],
  "suggestedSprintId": null
}

REGLAS IMPORTANTES:
- timeEstimate SIEMPRE en MINUTOS (nunca en horas)
- Si no estás seguro del space, assignees o sprint, usa null o array vacío
- Solo sugiere assignees si se mencionan explícitamente en el input
- Solo sugiere sprint si se menciona explícitamente
- La descripción debe ser profesional y en español
- Usa formato markdown para mejor legibilidad
- Sé específico con tecnologías de Shopify cuando aplique`;
  }
}
