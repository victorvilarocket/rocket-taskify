import { NextRequest, NextResponse } from 'next/server';
import { ClickUpService } from '@/lib/clickup-service';

export async function POST(request: NextRequest) {
  try {
    const { spaceId, taskData } = await request.json();

    if (!spaceId || !taskData) {
      return NextResponse.json(
        { error: 'spaceId y taskData son requeridos' },
        { status: 400 }
      );
    }

    const apiToken = process.env.CLICKUP_API_TOKEN;
    
    if (!apiToken) {
      return NextResponse.json(
        { error: 'ClickUp API token no configurado' },
        { status: 500 }
      );
    }

    const clickupService = new ClickUpService(apiToken);
    const createdTask = await clickupService.createTask(spaceId, taskData);

    return NextResponse.json(createdTask);
  } catch (error: any) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear tarea en ClickUp' },
      { status: 500 }
    );
  }
}

