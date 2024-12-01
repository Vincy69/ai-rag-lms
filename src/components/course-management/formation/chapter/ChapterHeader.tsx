import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GripVertical, Pencil, Trash2 } from "lucide-react";

interface ChapterHeaderProps {
  title: string;
  isEditing: boolean;
  editedTitle: string;
  onEditChange: (value: string) => void;
  onSave: (e: React.MouseEvent) => void;
  onCancelEdit: (e: React.MouseEvent) => void;
  onStartEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
  dragHandleProps: any;
}

export function ChapterHeader({
  title,
  isEditing,
  editedTitle,
  onEditChange,
  onSave,
  onCancelEdit,
  onStartEdit,
  onDelete,
  dragHandleProps
}: ChapterHeaderProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="flex items-center px-4" onClick={handleClick}>
      <button
        {...dragHandleProps}
        className="p-2 hover:text-primary"
        aria-label="Réorganiser le chapitre"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-4 flex-1">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <Input
              value={editedTitle}
              onChange={(e) => onEditChange(e.target.value)}
              className="h-8"
              onClick={handleClick}
            />
            <Button
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onSave(e);
              }}
            >
              Enregistrer
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onCancelEdit(e);
              }}
            >
              Annuler
            </Button>
          </div>
        ) : (
          <span className="font-medium">{title}</span>
        )}
      </div>

      <div className="flex items-center gap-2 ml-4">
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onStartEdit();
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(e);
          }}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}