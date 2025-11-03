import { NextRequest, NextResponse } from 'next/server';
import { ClickUpService } from '@/lib/clickup-service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const spaceId = searchParams.get('spaceId');

    if (!spaceId) {
      return NextResponse.json(
        { error: 'spaceId es requerido' },
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
    const epics = await clickupService.getEpics(spaceId);

    return NextResponse.json(epics);
  } catch (error: any) {
    console.error('Error fetching epics:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener épicas' },
      { status: 500 }
    );
  }
}

