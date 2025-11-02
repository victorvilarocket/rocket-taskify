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
    const members = await clickupService.getTeamMembers(workspaceId);

    return NextResponse.json(members);
  } catch (error: any) {
    console.error('Error fetching team members:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener miembros del equipo' },
      { status: 500 }
    );
  }
}

