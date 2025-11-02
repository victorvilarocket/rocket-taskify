# 🚀 Rocket Taskify

Aplicación web para crear tareas en ClickUp con ayuda de IA, diseñada específicamente para **Rocket Digital** y especializada en proyectos Shopify.

## ✨ Características

- **Workspace fijo**: Siempre trabaja con "Rocket Digital"
- **IA inteligente**: Sugerencias automáticas de campos usando Google Gemini (gratis)
- **Búsqueda de proyectos**: Encuentra rápidamente el proyecto (space) correcto
- **Múltiples tipos**: Task, Bug, Meet
- **Prioridades**: Urgente, Alta, Normal, Baja
- **Asignación múltiple**: Asigna a varios miembros del equipo
- **Sprints**: Asignación automática a sprints (Tech > Sprint folder)
- **Preview antes de crear**: Revisa la tarea antes de enviarla a ClickUp
- **Especializado en Shopify**: IA entrenada en desarrollo Shopify

## 📋 Flujo de Trabajo

1. **Describe la tarea** (o adjunta archivos)
2. **Click en "Sugerir con IA"** → La IA rellena los campos automáticamente
3. **Edita los campos** según necesites:
   - Nombre de la tarea
   - Descripción detallada
   - Proyecto (Space) - con buscador
   - Tipo de tarea (Task/Bug/Meet)
   - Prioridad
   - Estimación de tiempo
   - Asignar a miembros del equipo - con buscador
   - Sprint (opcional)
   - Tags (opcional)
4. **Click en "Ver Preview"** → Revisa cómo quedará la tarea
5. **Confirma o cancela** → La tarea se crea en ClickUp

## 🛠️ Tecnologías

- **Next.js 16** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **Google Gemini AI** (modelo gratuito)
- **ClickUp API**

## 🚀 Instalación

### 1. Instalar dependencias

```bash
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz:

```env
# ClickUp API Token (ya configurado)
CLICKUP_API_TOKEN=pk_87854781_31AXTGS22U6JRHX7U7AA65T2CC3OJZ1X

# Google Gemini API Key (obtener GRATIS)
GEMINI_API_KEY=tu_gemini_key_aqui
```

**Obtener Gemini API Key (gratis, 2 minutos):**
1. Ve a [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Inicia sesión con Google
3. Click en "Create API Key"
4. Copia y pega en `.env.local`

### 3. Ejecutar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

## 📖 Cómo Usar

### Ejemplo 1: Crear tarea rápida

1. Describe: "Crear sección de productos destacados en homepage"
2. Click "Sugerir con IA"
3. La IA rellena automáticamente:
   - Nombre: "Crear sección de productos destacados en homepage"
   - Descripción: Con objetivos y criterios de aceptación
   - Tipo: Task
   - Prioridad: Normal
   - Tiempo: 120 minutos
   - Tags: shopify, frontend, liquid
4. Edita lo que necesites
5. Selecciona proyecto y miembros
6. Preview y crear

### Ejemplo 2: Bug urgente

1. Describe: "El carrito de compras no está sumando correctamente los descuentos"
2. Click "Sugerir con IA"
3. La IA detecta que es un bug y sugiere:
   - Tipo: Bug
   - Prioridad: High o Urgent
   - Descripción con pasos para reproducir
4. Asigna al equipo correcto
5. Preview y crear

### Ejemplo 3: Con archivo adjunto

1. Adjunta un wireframe (imagen)
2. Describe: "Implementar este diseño en la página de producto"
3. La IA analiza la descripción y el archivo
4. Genera sugerencias basadas en el contexto
5. Edita y crea

## 🎯 Tipos de Tarea

- **Task**: Desarrollo general, features, implementaciones
- **Bug**: Errores, problemas que arreglar
- **Meet**: Reuniones, llamadas, sesiones

## 🎨 Prioridades

- **Urgente** 🔴: Crítico, bloquea todo
- **Alta** 🟠: Importante, debe hacerse pronto
- **Normal** 🔵: Tarea estándar
- **Baja** ⚪: Puede esperar

## 👥 Asignación de Tareas

- Busca miembros del equipo por nombre o email
- Selecciona múltiples personas
- Los miembros se obtienen automáticamente de ClickUp

## 📅 Sprints

Los sprints se obtienen automáticamente de:
- **Workspace**: Rocket Digital
- **Space**: Tech
- **Folder**: Sprint

Puedes asignar la tarea a un sprint específico o dejarla sin sprint.

## 🏗️ Estructura del Proyecto

```
taskify/
├── app/
│   ├── api/
│   │   ├── ai/
│   │   │   └── suggest/          # Sugerencias de IA
│   │   └── clickup/
│   │       ├── rocket-digital/   # Obtener workspace Rocket Digital
│   │       ├── spaces/           # Obtener proyectos
│   │       ├── sprints/          # Obtener sprints
│   │       ├── members/          # Obtener miembros del equipo
│   │       └── create-task/      # Crear tarea
│   ├── page.tsx                  # Página principal
│   ├── layout.tsx                # Layout
│   └── globals.css               # Estilos
├── components/
│   └── TaskPreview.tsx           # Modal de preview
├── lib/
│   ├── ai-service.ts            # Servicio Google Gemini
│   ├── clickup-service.ts       # Servicio ClickUp API
│   ├── file-processor.ts        # Procesamiento de archivos
│   └── types.ts                 # Tipos TypeScript
└── README.md
```

## 🔧 Configuración de ClickUp

La aplicación busca automáticamente:

1. **Workspace**: "Rocket Digital" (hardcoded)
2. **Spaces**: Todos los proyectos disponibles
3. **Sprints**: Lista dentro de Tech > Sprint folder
4. **Miembros**: Todos los miembros del workspace

## 🎨 Personalización

### Modificar tipos de tarea

Edita `lib/types.ts`:

```typescript
export type TaskType = 'task' | 'bug' | 'meet' | 'documentation';
```

### Ajustar prompts de IA

Edita `lib/ai-service.ts` en el método `buildPrompt()`.

## 🚀 Despliegue

### Vercel (Recomendado)

1. Push a GitHub
2. Conecta en [Vercel](https://vercel.com)
3. Configura variables de entorno:
   - `CLICKUP_API_TOKEN`
   - `GEMINI_API_KEY`
4. Deploy

## 📝 Roadmap

- [x] Sugerencias de IA
- [x] Preview de tareas
- [x] Asignación múltiple
- [x] Búsqueda de proyectos y miembros
- [x] Soporte para archivos adjuntos
- [ ] Plantillas de tareas predefinidas
- [ ] Historial de tareas creadas
- [ ] Integración con otros workspaces

## 🤝 Soporte

Si tienes problemas:

1. Verifica que el workspace "Rocket Digital" existe en ClickUp
2. Asegúrate de tener la Gemini API key configurada
3. Revisa que el token de ClickUp tenga permisos correctos
4. Verifica que existe un folder "Sprint" en el space "Tech"

## 📄 Licencia

MIT

## 💡 Créditos

- Desarrollado para **Rocket Digital**
- Powered by [Google Gemini](https://ai.google.dev/)
- Integrado con [ClickUp](https://clickup.com/)

---

**¡Crea tareas perfectas con IA! 🚀**
