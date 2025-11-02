'use client';

import { TaskData, ClickUpMember, ClickUpSprint, ClickUpSpace } from '@/lib/types';
import { X, Clock, Users, Tag, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface TaskPreviewProps {
  taskData: TaskData;
  space: ClickUpSpace | null;
  sprint: ClickUpSprint | null;
  assignees: ClickUpMember[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isCreating: boolean;
}

export default function TaskPreview({
  taskData,
  space,
  sprint,
  assignees,
  isOpen,
  onClose,
  onConfirm,
  isCreating,
}: TaskPreviewProps) {
  if (!isOpen) return null;

  const priorityColors = {
    urgent: 'bg-red-100 text-red-800 border-red-300',
    high: 'bg-orange-100 text-orange-800 border-orange-300',
    normal: 'bg-blue-100 text-blue-800 border-blue-300',
    low: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const typeLabels = {
    task: 'Tarea',
    bug: 'Bug',
    meet: 'Reunión',
  };

  const priorityLabels = {
    urgent: 'Urgente',
    high: 'Alta',
    normal: 'Normal',
    low: 'Baja',
  };

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-background rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-background border-b p-6 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">Vista Previa de la Tarea</h2>
            <p className="text-sm text-muted-foreground">
              Revisa los detalles antes de crear la tarea en ClickUp
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isCreating}
            className="flex-shrink-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-2xl font-bold text-foreground">{taskData.name}</h3>
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline" className={priorityColors[taskData.priority]}>
              {priorityLabels[taskData.priority]}
            </Badge>
            <Badge variant="secondary">
              {typeLabels[taskData.type]}
            </Badge>
          </div>

          {/* Project and Sprint */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-1">
                Proyecto
              </label>
              <p className="text-foreground font-medium">{space?.name || 'No seleccionado'}</p>
            </div>
            {sprint && (
              <div>
                <label className="block text-sm font-semibold text-muted-foreground mb-1">
                  Sprint
                </label>
                <p className="text-foreground font-medium">{sprint.name}</p>
              </div>
            )}
          </div>

          {/* Time Estimate */}
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Estimación de Tiempo
            </label>
            <p className="text-lg text-foreground font-semibold">{formatTime(taskData.timeEstimate)}</p>
          </div>

          {/* Assignees */}
          {assignees.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Asignado a
              </label>
              <div className="flex flex-wrap gap-2">
                {assignees.map((member) => (
                  <Badge
                    key={member.id}
                    variant="secondary"
                    className="flex items-center gap-2 px-3 py-2"
                  >
                    {member.profilePicture && (
                      <img
                        src={member.profilePicture}
                        alt={member.username}
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span>{member.username}</span>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {taskData.tags && taskData.tags.length > 0 && (
            <div>
              <label className="block text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {taskData.tags.map((tag, index) => (
                  <Badge key={index} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-muted-foreground mb-2">
              Descripción
            </label>
            <div className="bg-muted/30 rounded-lg p-4 border">
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground">
                {taskData.description}
              </pre>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
              <p className="font-semibold mb-1">¿Todo correcto?</p>
              <p className="text-muted-foreground">
                Esta tarea se creará en ClickUp en el proyecto{' '}
                <strong className="text-foreground">{space?.name || 'seleccionado'}</strong>
                {sprint && (
                  <>
                    {' '}
                    dentro del sprint <strong className="text-foreground">{sprint.name}</strong>
                  </>
                )}
                . Podrás editarla después desde ClickUp.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-background border-t p-6 flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isCreating}
          >
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isCreating}
          >
            {isCreating ? 'Creando en ClickUp...' : 'Confirmar y Crear Tarea'}
          </Button>
        </div>
      </div>
    </div>
  );
}

