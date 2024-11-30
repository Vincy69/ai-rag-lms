import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, BookOpen, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentItemProps {
  item: {
    id: string;
    title: string;
    type: 'lesson' | 'quiz';
    duration?: number;
  };
  isBeingDragged?: boolean;
}

export function ContentItem({ item, isBeingDragged }: ContentItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = item.type === 'lesson' ? BookOpen : ClipboardList;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-background p-3",
        isDragging && "opacity-50",
        isBeingDragged && "shadow-lg"
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-1 hover:text-primary"
        aria-label="Réorganiser le contenu"
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="flex-1 text-sm">{item.title}</span>
      {item.type === 'lesson' && item.duration && (
        <span className="text-xs text-muted-foreground">
          {item.duration} min
        </span>
      )}
    </div>
  );
}