import { NextRequest, NextResponse } from 'next/server';
import { ClickUpService } from '@/lib/clickup-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const workspaceId = searchParams.get('workspaceId');

    if (!workspaceId) {
      return NextResponse.json(
        { error: 'workspaceId es requerido' },
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
    const sprints = await clickupService.getSprints(workspaceId);

    return NextResponse.json(sprints);
  } catch (error: any) {
    console.error('Error fetching sprints:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener sprints' },
      { status: 500 }
    );
  }
}

