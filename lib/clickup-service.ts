import axios from 'axios';
import type { ClickUpWorkspace, ClickUpSpace, ClickUpList, ClickUpSprint, ClickUpMember, ClickUpEpic, ClickUpStatus, TaskData } from './types';

const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2';
const ROCKET_DIGITAL_WORKSPACE = 'Rocket Digital';

export class ClickUpService {
  private apiToken: string;

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  private getHeaders() {
    return {
      'Authorization': this.apiToken,
      'Content-Type': 'application/json',
    };
  }

  async getRocketDigitalWorkspace(): Promise<ClickUpWorkspace> {
    try {
      const response = await axios.get(`${CLICKUP_API_BASE}/team`, {
        headers: this.getHeaders(),
      });
      
      const workspace = response.data.teams.find(
        (team: any) => team.name === ROCKET_DIGITAL_WORKSPACE
      );

      if (!workspace) {
        throw new Error('Workspace "Rocket Digital" no encontrado');
      }

      return {
        id: workspace.id,
        name: workspace.name,
      };
    } catch (error) {
      console.error('Error fetching workspace:', error);
      throw new Error('No se pudo obtener el workspace de Rocket Digital');
    }
  }

  async getSpaces(workspaceId: string): Promise<ClickUpSpace[]> {
    try {
      const response = await axios.get(
        `${CLICKUP_API_BASE}/team/${workspaceId}/space?archived=false`,
        {
          headers: this.getHeaders(),
        }
      );
      return response.data.spaces.map((space: any) => ({
        id: space.id,
        name: space.name,
      }));
    } catch (error) {
      console.error('Error fetching spaces:', error);
      throw new Error('No se pudieron obtener los proyectos');
    }
  }

  async getSprints(workspaceId: string): Promise<ClickUpSprint[]> {
    try {
      // Primero obtener todos los spaces
      const spaces = await this.getSpaces(workspaceId);
      
      // Buscar el space "Tech"
      const techSpace = spaces.find(s => s.name.toLowerCase() === 'tech');
      
      if (!techSpace) {
        return [];
      }

      // Obtener folders del space Tech
      const response = await axios.get(
        `${CLICKUP_API_BASE}/space/${techSpace.id}/folder?archived=false`,
        {
          headers: this.getHeaders(),
        }
      );

      // Buscar folder "Sprint"
      const sprintFolder = response.data.folders.find(
        (folder: any) => folder.name.toLowerCase().includes('sprint')
      );

      if (!sprintFolder) {
        return [];
      }

      // Obtener listas dentro del folder Sprint
      const listsResponse = await axios.get(
        `${CLICKUP_API_BASE}/folder/${sprintFolder.id}/list?archived=false`,
        {
          headers: this.getHeaders(),
        }
      );

      return listsResponse.data.lists.map((list: any) => ({
        id: list.id,
        name: list.name,
      }));
    } catch (error) {
      console.error('Error fetching sprints:', error);
      return [];
    }
  }

  async getTeamMembers(workspaceId: string): Promise<ClickUpMember[]> {
    try {
      const response = await axios.get(
        `${CLICKUP_API_BASE}/team/${workspaceId}`,
        {
          headers: this.getHeaders(),
        }
      );

      // La respuesta tiene estructura: { team: { members: [...] } }
      const members = response.data.team?.members || [];
      
      return members.map((member: any) => ({
        id: member.user.id,
        username: member.user.username,
        email: member.user.email,
        color: member.user.color,
        profilePicture: member.user.profilePicture,
      }));
    } catch (error: any) {
      console.error('Error fetching team members:', error.response?.data || error);
      // No lanzar error, devolver array vacío
      return [];
    }
  }

  async getEpics(spaceId: string): Promise<ClickUpEpic[]> {
    try {
      const epics: ClickUpEpic[] = [];

      // Obtener todos los folders del espacio
      try {
        const foldersResponse = await axios.get(
          `${CLICKUP_API_BASE}/space/${spaceId}/folder?archived=false`,
          {
            headers: this.getHeaders(),
          }
        );

        const folders = foldersResponse.data.folders || [];
        console.log(`📁 Folders encontrados en space ${spaceId}:`, folders.map((f: any) => f.name));
        
        // Para cada folder, obtener sus listas (que serán las épicas)
        for (const folder of folders) {
          try {
            const listsResponse = await axios.get(
              `${CLICKUP_API_BASE}/folder/${folder.id}/list?archived=false`,
              {
                headers: this.getHeaders(),
              }
            );

            const lists = listsResponse.data.lists || [];
            console.log(`📋 Listas en folder "${folder.name}":`, lists.map((l: any) => l.name));
            
            // Cada lista se considera una épica
            lists.forEach((list: any) => {
              epics.push({
                id: list.id,
                name: list.name,
                color: list.color,
              });
            });
          } catch (error: any) {
            console.error(`Error fetching lists from folder ${folder.name}:`, error.message);
          }
        }
      } catch (error: any) {
        console.error('Error fetching folders:', error.response?.data || error.message);
      }

      // También buscar listas directas del espacio (sin folder)
      try {
        const listsResponse = await axios.get(
          `${CLICKUP_API_BASE}/space/${spaceId}/list?archived=false`,
          {
            headers: this.getHeaders(),
          }
        );

        const lists = listsResponse.data.lists || [];
        console.log(`📋 Listas directas del space:`, lists.map((l: any) => l.name));
        
        // Agregar todas las listas directas como épicas
        lists.forEach((list: any) => {
          epics.push({
            id: list.id,
            name: list.name,
            color: list.color,
          });
        });
      } catch (error: any) {
        console.error('Error fetching lists:', error.response?.data || error.message);
      }

      console.log(`✅ Total de épicas encontradas para space ${spaceId}:`, epics.length, epics);
      return epics;
    } catch (error: any) {
      console.error('❌ Error fetching epics:', error.response?.data || error);
      return [];
    }
  }

  async getStatuses(spaceId: string): Promise<ClickUpStatus[]> {
    try {
      let firstListId: string | null = null;

      // 1. Intentar obtener listas de los folders
      try {
        const foldersResponse = await axios.get(
          `${CLICKUP_API_BASE}/space/${spaceId}/folder?archived=false`,
          {
            headers: this.getHeaders(),
          }
        );

        const folders = foldersResponse.data.folders || [];
        
        // Buscar en el primer folder
        if (folders.length > 0) {
          const listsResponse = await axios.get(
            `${CLICKUP_API_BASE}/folder/${folders[0].id}/list?archived=false`,
            {
              headers: this.getHeaders(),
            }
          );

          const lists = listsResponse.data.lists || [];
          if (lists.length > 0) {
            firstListId = lists[0].id;
            console.log(`📊 Obteniendo estados de la lista: ${lists[0].name} (${firstListId})`);
          }
        }
      } catch (error) {
        console.error('Error fetching lists from folders:', error);
      }

      // 2. Si no se encontró en folders, buscar listas directas
      if (!firstListId) {
        const listsResponse = await axios.get(
          `${CLICKUP_API_BASE}/space/${spaceId}/list?archived=false`,
          {
            headers: this.getHeaders(),
          }
        );

        const lists = listsResponse.data.lists || [];
        if (lists.length > 0) {
          firstListId = lists[0].id;
          console.log(`📊 Obteniendo estados de la lista directa: ${lists[0].name} (${firstListId})`);
        }
      }

      if (!firstListId) {
        console.log('⚠️ No se encontraron listas para obtener estados');
        return [];
      }

      // Obtener estados de la lista
      const statusesResponse = await axios.get(
        `${CLICKUP_API_BASE}/list/${firstListId}`,
        {
          headers: this.getHeaders(),
        }
      );

      const statuses = statusesResponse.data.statuses || [];
      console.log(`✅ Estados encontrados:`, statuses.map((s: any) => s.status));
      
      return statuses.map((status: any) => ({
        id: status.id || status.status,
        status: status.status,
        color: status.color,
        orderindex: status.orderindex,
        type: status.type,
      }));
    } catch (error: any) {
      console.error('❌ Error fetching statuses:', error.response?.data || error);
      return [];
    }
  }

  async createTask(spaceId: string, taskData: TaskData) {
    try {
      // Primero necesitamos obtener una lista del space para crear la tarea
      const listsResponse = await axios.get(
        `${CLICKUP_API_BASE}/space/${spaceId}/list?archived=false`,
        {
          headers: this.getHeaders(),
        }
      );

      if (!listsResponse.data.lists || listsResponse.data.lists.length === 0) {
        throw new Error('No se encontraron listas en el proyecto seleccionado');
      }

      // Usar la primera lista disponible
      const listId = listsResponse.data.lists[0].id;

      const priorityMap: Record<string, number> = {
        urgent: 1,
        high: 2,
        normal: 3,
        low: 4,
      };

      const payload: any = {
        name: taskData.name,
        description: taskData.description,
        priority: priorityMap[taskData.priority],
        time_estimate: taskData.timeEstimate * 60000, // Convert minutes to milliseconds
        tags: taskData.tags || [],
      };

      // Agregar assignees solo si se especificaron
      if (taskData.assignees && taskData.assignees.length > 0) {
        payload.assignees = taskData.assignees;
      }

      // Agregar estado si se especificó
      if (taskData.status) {
        payload.status = taskData.status;
      }

      // Agregar fecha límite si se especificó
      if (taskData.dueDate) {
        payload.due_date = taskData.dueDate;
      }

      // Agregar épica si se especificó
      if (taskData.epicId) {
        payload.parent = taskData.epicId;
      }

      // Si hay un sprint asignado, mover la tarea al sprint después de crearla
      console.log('📤 Enviando tarea a ClickUp - Payload:', JSON.stringify(payload, null, 2));
      
      const response = await axios.post(
        `${CLICKUP_API_BASE}/list/${listId}/task`,
        payload,
        {
          headers: this.getHeaders(),
        }
      );

      const createdTask = response.data;

      // Si se especificó un sprint, mover la tarea al sprint
      if (taskData.sprintId) {
        try {
          await axios.post(
            `${CLICKUP_API_BASE}/list/${taskData.sprintId}/task/${createdTask.id}`,
            {},
            {
              headers: this.getHeaders(),
            }
          );
        } catch (error) {
          console.error('Error moving task to sprint:', error);
          // No lanzar error, la tarea se creó exitosamente
        }
      }

      return createdTask;
    } catch (error: any) {
      console.error('Error creating task:', error);
      throw new Error('No se pudo crear la tarea en ClickUp');
    }
  }
}
