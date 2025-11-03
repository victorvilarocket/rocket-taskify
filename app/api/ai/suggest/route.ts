import { NextRequest, NextResponse } from 'next/server';
import { AIService } from '@/lib/ai-service';
import type { TaskFormData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const formData: TaskFormData = await request.json();

    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      return NextResponse.json(
        { error: 'Gemini API key no configurada. Por favor, configura GEMINI_API_KEY en .env.local' },
        { status: 500 }
      );
    }

    const aiService = new AIService(apiKey);
    const suggestion = await aiService.suggestTaskFields(formData);

    return NextResponse.json(suggestion);
  } catch (error: any) {
    console.error('Error generating suggestion:', error);
    
    // Extraer el mensaje de error más relevante
    let errorMessage = 'Error al generar sugerencias con IA';
    
    if (error.message) {
      errorMessage = error.message;
    } else if (error.error?.message) {
      errorMessage = error.error.message;
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

