'use client';

import { useState, useEffect } from 'react';
import { Rocket, Sparkles, Paperclip, X, Loader2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { FileProcessor } from '@/lib/file-processor';
import type {
  TaskData,
  TaskType,
  TaskPriority,
  ClickUpWorkspace,
  ClickUpSpace,
  ClickUpSprint,
  ClickUpMember,
  TaskSuggestion,
} from '@/lib/types';

export default function Home() {
  // Description and files
  const [description, setDescription] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Task data
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('task');
  const [priority, setPriority] = useState<TaskPriority>('normal');
  const [timeEstimate, setTimeEstimate] = useState<number>(60); // minutes
  const [selectedAssignees, setSelectedAssignees] = useState<number[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);

  // ClickUp data
  const [workspace, setWorkspace] = useState<ClickUpWorkspace | null>(null);
  const [spaces, setSpaces] = useState<ClickUpSpace[]>([]);
  const [sprints, setSprints] = useState<ClickUpSprint[]>([]);
  const [teamMembers, setTeamMembers] = useState<ClickUpMember[]>([]);
  const [selectedSpace, setSelectedSpace] = useState<string>('');
  
  // Search states
  const [spaceSearch, setSpaceSearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');

  // UI states
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load workspace on mount
  useEffect(() => {
    loadWorkspace();
  }, []);

  // Load spaces, sprints and members when workspace is loaded
  useEffect(() => {
    if (workspace) {
      loadSpaces(workspace.id);
      loadSprints(workspace.id);
      loadTeamMembers(workspace.id);
    }
  }, [workspace]);

  const loadWorkspace = async () => {
    try {
      const response = await fetch('/api/clickup/rocket-digital');
      if (!response.ok) throw new Error('Error al cargar workspace');
      const data = await response.json();
      setWorkspace(data);
    } catch (error: any) {
      showMessage('error', error.message);
    }
  };

  const loadSpaces = async (workspaceId: string) => {
    try {
      const response = await fetch(`/api/clickup/spaces?workspaceId=${workspaceId}`);
      if (!response.ok) throw new Error('Error al cargar proyectos');
      const data = await response.json();
      setSpaces(data);
    } catch (error: any) {
      showMessage('error', error.message);
    }
  };

  const loadSprints = async (workspaceId: string) => {
    try {
      const response = await fetch(`/api/clickup/sprints?workspaceId=${workspaceId}`);
      if (!response.ok) throw new Error('Error al cargar sprints');
      const data = await response.json();
      setSprints(data);
    } catch (error: any) {
      console.error('Error loading sprints:', error);
    }
  };

  const loadTeamMembers = async (workspaceId: string) => {
    try {
      const response = await fetch(`/api/clickup/members?workspaceId=${workspaceId}`);
      if (!response.ok) throw new Error('Error al cargar miembros');
      const data = await response.json();
      setTeamMembers(data);
    } catch (error: any) {
      showMessage('error', error.message);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachedFiles((prev) => [...prev, ...Array.from(files)]);
    }
  };

  const removeFile = (index: number) => {
    setAttachedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSuggest = async () => {
    if (!description.trim() && attachedFiles.length === 0) {
      showMessage('error', 'Por favor, describe la tarea o adjunta archivos');
      return;
    }

    setIsSuggesting(true);
    try {
      let fullDescription = description;

      if (attachedFiles.length > 0) {
        const fileContent = await FileProcessor.processFiles(attachedFiles);
        fullDescription += '\n\n--- ARCHIVOS ADJUNTOS ---\n' + fileContent;
      }

      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: fullDescription,
          availableSpaces: spaces.map(s => ({ id: s.id, name: s.name })),
          availableMembers: teamMembers.map(m => ({ 
            id: m.id, 
            username: m.username || '', 
            email: m.email || '' 
          })),
          availableSprints: sprints.map(s => ({ id: s.id, name: s.name })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al generar sugerencias');
      }

      const suggestion: TaskSuggestion = await response.json();

      // Fill form with suggestions
      setTaskName(suggestion.name);
      setTaskDescription(suggestion.description);
      setTaskType(suggestion.type);
      setPriority(suggestion.priority);
      setTimeEstimate(suggestion.timeEstimate);
      setTags(suggestion.tags || []);

      // Apply suggested space, assignees and sprint if provided
      if (suggestion.suggestedSpaceId) {
        setSelectedSpace(suggestion.suggestedSpaceId);
        const space = spaces.find(s => s.id === suggestion.suggestedSpaceId);
        if (space) {
          setSpaceSearch(space.name);
        }
      }

      if (suggestion.suggestedAssigneeIds && suggestion.suggestedAssigneeIds.length > 0) {
        setSelectedAssignees(suggestion.suggestedAssigneeIds);
      }

      if (suggestion.suggestedSprintId) {
        setSelectedSprint(suggestion.suggestedSprintId);
      }

      showMessage('success', '¡Sugerencias generadas! Revisa y edita los campos según necesites');
    } catch (error: any) {
      showMessage('error', error.message);
    } finally {
      setIsSuggesting(false);
    }
  };

  const handleClickSubmit = () => {
    // Validate required fields
    if (!taskName.trim()) {
      showMessage('error', 'El nombre de la tarea es requerido');
      return;
    }
    if (!selectedSpace) {
      showMessage('error', 'Debes seleccionar un proyecto');
      return;
    }

    // Show confirmation dialog
    setShowConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmDialog(false);
    setIsCreating(true);
    try {
      const taskData: TaskData = {
        name: taskName,
        description: taskDescription,
        type: taskType,
        priority: priority,
        timeEstimate: timeEstimate,
        assignees: selectedAssignees,
        sprintId: selectedSprint || undefined,
        tags: tags.length > 0 ? tags : undefined,
      };

      const response = await fetch('/api/clickup/create-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId: selectedSpace,
          taskData,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al crear tarea');
      }

      showMessage('success', '¡Tarea creada exitosamente en ClickUp! 🚀');
      
      // Reset form
      setDescription('');
      setAttachedFiles([]);
      setTaskName('');
      setTaskDescription('');
      setTaskType('task');
      setPriority('normal');
      setTimeEstimate(60);
      setSelectedAssignees([]);
      setSelectedSprint('');
      setTags([]);
      setSelectedSpace('');
      setSpaceSearch('');
    } catch (error: any) {
      showMessage('error', error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const toggleAssignee = (memberId: number) => {
    setSelectedAssignees((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  // Filtered spaces and members for search
  const filteredSpaces = spaces.filter((space) =>
    space.name.toLowerCase().includes(spaceSearch.toLowerCase())
  );

  const filteredMembers = teamMembers.filter((member) =>
    (member.username?.toLowerCase() || '').includes(memberSearch.toLowerCase()) ||
    (member.email?.toLowerCase() || '').includes(memberSearch.toLowerCase())
  );

  const getSelectedMembers = () => teamMembers.filter((m) => selectedAssignees.includes(m.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Rocket className="w-12 h-12 text-primary" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Rocket Taskify
          </h1>
          </div>
         
         
        </div>

        {/* Message Banner */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-50 text-green-900 border-green-200'
                : 'bg-red-50 text-red-900 border-red-200'
            }`}
          >
            <p className="font-medium">{message.text}</p>
          </div>
        )}

        <div className="bg-card text-card-foreground shadow-lg border rounded-xl p-8 max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* 1. Description Input */}
            <div>
              <label className="block font-semibold mb-2">
                1. Descripción de la Tarea
              </label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[120px]"
                placeholder="Ej: Necesitamos crear una nueva sección en el tema de Shopify para mostrar productos destacados con un carrusel..."
                rows={5}
              />

              {/* File Upload */}
              <div className="mt-3">
                <label className="cursor-pointer flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <Paperclip className="w-4 h-4" />
                  <span>o adjunta archivos (TXT, JSON, PDF, imágenes)</span>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".txt,.json,.pdf,.doc,.docx,image/*"
                  />
                </label>

                {attachedFiles.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {attachedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border text-sm"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <Paperclip className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          <span className="truncate">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(index)}
                          className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 2. Suggest Button */}
            <div className="pt-2">
              <Button
                onClick={handleSuggest}
                disabled={isSuggesting || (!description.trim() && attachedFiles.length === 0)}
                className="w-full"
                size="lg"
              >
                {isSuggesting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Generando sugerencias con IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    2. Sugerir con IA
                  </>
                )}
              </Button>
            </div>

            <div className="border-t my-6 pt-4">
              <p className="text-sm text-muted-foreground text-center mb-4">
                ✏️ Los campos siguientes son editables. Modifica lo que necesites.
              </p>
            </div>

            {/* Task Name */}
            <div>
              <label className="block font-semibold mb-2">
                Nombre de la Tarea <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Ej: Crear sección de productos destacados en homepage"
              />
            </div>

            {/* Task Description */}
            <div>
              <label className="block font-semibold mb-2">Descripción</label>
              <Textarea
                value={taskDescription}
                onChange={(e) => setTaskDescription(e.target.value)}
                className="min-h-[150px]"
                placeholder="Descripción detallada con criterios de aceptación..."
                rows={6}
              />
            </div>

            {/* 3. Project Selector */}
            <div className="relative">
              <label className="block font-semibold mb-2">
                3. Proyecto (Space) <span className="text-red-500">*</span>
              </label>
              
              {/* Selected Project Display */}
              {selectedSpace ? (
                <div className="flex items-center gap-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex-1 font-medium text-foreground">
                    ✓ {spaces.find(s => s.id === selectedSpace)?.name}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedSpace('')}
                    className="h-7 w-7 p-0 hover:bg-destructive/10 hover:text-destructive"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                  <Input
                    type="text"
                    value={spaceSearch}
                    onChange={(e) => setSpaceSearch(e.target.value)}
                    className="pl-10"
                    placeholder="Escribe para buscar proyecto..."
                    autoComplete="off"
                  />
                  {spaceSearch.trim().length >= 2 && (
                    <div className="mt-2 max-h-60 overflow-y-auto border bg-popover rounded-lg shadow-xl absolute z-20 w-full left-0">
                      {filteredSpaces.length > 0 ? (
                        filteredSpaces.map((space) => (
                          <button
                            key={space.id}
                            onClick={() => {
                              setSelectedSpace(space.id);
                              setSpaceSearch('');
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-accent transition-colors border-b last:border-b-0 text-foreground"
                          >
                            {space.name}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                          No se encontraron proyectos con "{spaceSearch}"
                        </div>
                      )}
                    </div>
                  )}
                  {spaceSearch.trim().length > 0 && spaceSearch.trim().length < 2 && (
                    <p className="text-xs text-muted-foreground mt-1">Escribe al menos 2 caracteres</p>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 4. Task Type */}
              <div>
                <label className="block font-semibold mb-2">4. Tipo de Tarea</label>
                <Select value={taskType} onValueChange={(value) => setTaskType(value as TaskType)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="meet">Meet</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* 5. Priority */}
              <div>
                <label className="block font-semibold mb-2">5. Prioridad</label>
                <Select value={priority} onValueChange={(value) => setPriority(value as TaskPriority)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="urgent">Urgente</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="low">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 6. Time Estimate */}
            <div>
              <label className="block font-semibold mb-2">
                6. Estimación de Tiempo
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Horas</label>
                  <Input
                    type="number"
                    value={Math.floor(timeEstimate / 60)}
                    onChange={(e) => {
                      const hours = Number(e.target.value) || 0;
                      const minutes = timeEstimate % 60;
                      setTimeEstimate(hours * 60 + minutes);
                    }}
                    min="0"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Minutos</label>
                  <Input
                    type="number"
                    value={timeEstimate % 60}
                    onChange={(e) => {
                      const minutes = Number(e.target.value) || 0;
                      const hours = Math.floor(timeEstimate / 60);
                      setTimeEstimate(hours * 60 + minutes);
                    }}
                    min="0"
                    max="59"
                    placeholder="0"
                  />
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Total: {Math.floor(timeEstimate / 60)}h {timeEstimate % 60}m ({timeEstimate} minutos)
              </p>
            </div>

            {/* 7. Assignees */}
            <div className="relative">
              <label className="block font-semibold mb-2">
                7. Asignar a (selecciona uno o varios)
              </label>
              
              {/* Selected Members */}
              {selectedAssignees.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                  {getSelectedMembers().map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center gap-2 px-3 py-1.5 bg-background border rounded-full text-sm"
                    >
                      {member.profilePicture && (
                        <img
                          src={member.profilePicture}
                          alt={member.username || 'User'}
                          className="w-5 h-5 rounded-full"
                        />
                      )}
                      <span className="font-medium">{member.username || member.email}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleAssignee(member.id)}
                        className="h-5 w-5 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none z-10" />
                <Input
                  type="text"
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  className="pl-10"
                  placeholder="Escribe para buscar miembros..."
                  autoComplete="off"
                />
                
                {/* Members List */}
                {memberSearch.trim().length >= 2 && (
                  <div className="mt-2 max-h-60 overflow-y-auto border bg-popover rounded-lg shadow-xl absolute z-20 w-full left-0">
                    {filteredMembers.length > 0 ? (
                      filteredMembers.map((member) => (
                        <button
                          key={member.id}
                          onClick={() => {
                            toggleAssignee(member.id);
                            setMemberSearch('');
                          }}
                          className={`w-full text-left px-4 py-3 hover:bg-accent transition-colors flex items-center gap-3 border-b last:border-b-0 ${
                            selectedAssignees.includes(member.id) ? 'bg-accent' : ''
                          }`}
                        >
                          {member.profilePicture && (
                            <img
                              src={member.profilePicture}
                              alt={member.username || 'User'}
                              className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm text-foreground truncate">
                              {member.username || 'Sin nombre'}
                            </div>
                            {member.email && (
                              <div className="text-xs text-muted-foreground truncate">{member.email}</div>
                            )}
                          </div>
                          {selectedAssignees.includes(member.id) && (
                            <span className="text-primary text-lg flex-shrink-0">✓</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-sm text-muted-foreground text-center">
                        No se encontraron miembros con "{memberSearch}"
                      </div>
                    )}
                  </div>
                )}
                {memberSearch.trim().length > 0 && memberSearch.trim().length < 2 && (
                  <p className="text-xs text-muted-foreground mt-1">Escribe al menos 2 caracteres</p>
                )}
              </div>
              
              {/* Show message if no members loaded */}
              {teamMembers.length === 0 && !memberSearch && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Cargando miembros del equipo...
                </p>
              )}
            </div>

            {/* 8. Sprint */}
            <div>
              <label className="block font-semibold mb-2">8. Sprint (opcional)</label>
              <Select value={selectedSprint || undefined} onValueChange={(value) => setSelectedSprint(value || '')}>
                <SelectTrigger>
                  <SelectValue placeholder="Sin sprint asignado" />
                </SelectTrigger>
                <SelectContent>
                  {sprints.map((sprint) => (
                    <SelectItem key={sprint.id} value={sprint.id}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedSprint && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSprint('')}
                  className="mt-2 h-8 text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  Quitar sprint
                </Button>
              )}
            </div>

            {/* Tags (optional) */}
            <div>
              <label className="block font-semibold mb-2">Tags (opcional)</label>
              <Input
                type="text"
                value={tags.join(', ')}
                onChange={(e) =>
                  setTags(
                    e.target.value
                      .split(',')
                      .map((t) => t.trim())
                      .filter((t) => t)
                  )
                }
                placeholder="shopify, frontend, liquid"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t mt-6">
              <Button
                onClick={handleClickSubmit}
                disabled={!taskName.trim() || !selectedSpace || isCreating}
                className="w-full"
                size="lg"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Creando en ClickUp...
                  </>
                ) : (
                  'Enviar'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar creación de tarea?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 pt-2">
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Tarea:</p>
                  <p className="text-sm">{taskName}</p>
                </div>
                
                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Proyecto:</p>
                  <p className="text-sm">{spaces.find(s => s.id === selectedSpace)?.name}</p>
                </div>

                {selectedAssignees.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Asignado a:</p>
                    <div className="flex flex-wrap gap-1">
                      {getSelectedMembers().map((m) => (
                        <Badge key={m.id} variant="secondary" className="text-xs">
                          {m.username || m.email}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {selectedSprint && (
                  <div>
                    <p className="text-sm font-semibold text-foreground mb-1">Sprint:</p>
                    <p className="text-sm">{sprints.find(s => s.id === selectedSprint)?.name}</p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-foreground mb-1">Estimación:</p>
                  <p className="text-sm">
                    {Math.floor(timeEstimate / 60)}h {timeEstimate % 60}m
                  </p>
                </div>

                <div className="pt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    Esta tarea se creará en ClickUp. Podrás editarla después desde allí.
                  </p>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Confirmar y Crear
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
