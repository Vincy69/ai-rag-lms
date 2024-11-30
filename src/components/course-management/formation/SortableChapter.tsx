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
import { SortableContentList } from "./SortableContentList";

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  lessons: any[];
  quizzes: any[];
}

interface SortableChapterProps {
  chapter: Chapter;
}

export function SortableChapter({ chapter }: SortableChapterProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: chapter.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Combine and sort lessons and quizzes by order_index
  const content = [
    ...chapter.lessons.map(l => ({ ...l, type: 'lesson' })),
    ...chapter.quizzes.map(q => ({ ...q, type: 'quiz' }))
  ].sort((a, b) => a.order_index - b.order_index);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-accent/50",
        isDragging && "opacity-50"
      )}
    >
      <Accordion type="single" collapsible>
        <AccordionItem value={chapter.id} className="border-0">
          <div className="flex items-center px-4">
            <button
              {...attributes}
              {...listeners}
              className="p-2 hover:text-primary"
              aria-label="Réorganiser le chapitre"
            >
              <GripVertical className="h-4 w-4" />
            </button>
            <AccordionTrigger className="flex-1 hover:no-underline">
              <div className="flex flex-col items-start">
                <span className="text-base font-medium">{chapter.title}</span>
                {chapter.description && (
                  <span className="text-sm text-muted-foreground">
                    {chapter.description}
                  </span>
                )}
              </div>
            </AccordionTrigger>
          </div>
          <AccordionContent className="px-4 pb-4">
            <SortableContentList 
              chapterId={chapter.id} 
              content={content}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}