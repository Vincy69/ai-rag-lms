import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { SortableChapterList } from "./SortableChapterList";

interface Block {
  id: string;
  name: string;
  description: string | null;
  chapters: any[];
}

interface SortableBlockProps {
  block: Block;
}

export function SortableBlock({ block }: SortableBlockProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-card",
        isDragging && "opacity-50"
      )}
    >
      <Accordion type="single" collapsible>
        <AccordionItem value={block.id} className="border-0">
          <div className="flex items-center px-4">
            <button
              {...attributes}
              {...listeners}
              className="p-2 hover:text-primary"
              aria-label="Réorganiser le bloc"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <AccordionTrigger className="flex-1 hover:no-underline">
              <div className="flex flex-col items-start">
                <span className="text-base font-medium">{block.name}</span>
                {block.description && (
                  <span className="text-sm text-muted-foreground">
                    {block.description}
                  </span>
                )}
              </div>
            </AccordionTrigger>
          </div>
          <AccordionContent className="px-4 pb-4">
            <SortableChapterList blockId={block.id} chapters={block.chapters} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}