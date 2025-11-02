import { NextResponse } from 'next/server';
import { ClickUpService } from '@/lib/clickup-service';

export async function GET() {
  try {
    const apiToken = process.env.CLICKUP_API_TOKEN;
    
    if (!apiToken) {
      return NextResponse.json(
        { error: 'ClickUp API token no configurado' },
        { status: 500 }
      );
    }

    const clickupService = new ClickUpService(apiToken);
    const workspace = await clickupService.getRocketDigitalWorkspace();

    return NextResponse.json(workspace);
  } catch (error: any) {
    console.error('Error fetching Rocket Digital workspace:', error);
    return NextResponse.json(
      { error: error.message || 'Error al obtener workspace Rocket Digital' },
      { status: 500 }
    );
  }
}

