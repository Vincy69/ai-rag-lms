import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

interface BlockHeaderProps {
  name: string;
  isEditing: boolean;
  editedName: string;
  onEditChange: (value: string) => void;
  onSave: (e: React.MouseEvent) => void;
  onCancelEdit: (e: React.MouseEvent) => void;
  onStartEdit: () => void;
  onDelete: () => void;
  dragHandleProps: any;
}

export function BlockHeader({
  name,
  isEditing,
  editedName,
  onEditChange,
  onSave,
  onCancelEdit,
  onStartEdit,
  onDelete,
  dragHandleProps
}: BlockHeaderProps) {
  return (
    <div className="flex items-center px-4 py-2">
      <button
        {...dragHandleProps}
        className="p-2 hover:text-primary"
        aria-label="Réorganiser le bloc"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-4 flex-1">
        {isEditing ? (
          <div 
            className="flex items-center gap-2 flex-1"
            onClick={(e) => e.stopPropagation()}
          >
            <Input
              value={editedName}
              onChange={(e) => onEditChange(e.target.value)}
              className="h-8"
            />
            <Button
              size="sm"
              onClick={onSave}
            >
              Enregistrer
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onCancelEdit}
            >
              Annuler
            </Button>
          </div>
        ) : (
          <span className="font-medium">{name}</span>
        )}
      </div>

      <div 
        className="flex items-center gap-2 ml-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Button
          size="sm"
          variant="ghost"
          onClick={onStartEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}