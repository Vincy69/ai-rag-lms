import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, ArrowRight } from "lucide-react";

interface Chapter {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
}

interface ChapterListProps {
  chapters: Chapter[];
  onSelectChapter: (chapterId: string) => void;
  selectedChapterId?: string;
}

export function ChapterList({ chapters, onSelectChapter, selectedChapterId }: ChapterListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
      <div className="space-y-4">
        {chapters.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => onSelectChapter(chapter.id)}
            className={`w-full p-4 rounded-lg transition-colors group hover:bg-accent ${
              selectedChapterId === chapter.id ? "bg-accent" : "bg-card"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <BookOpen className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="font-medium group-hover:text-primary transition-colors">
                  {chapter.title}
                </h3>
                {chapter.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    {chapter.description}
                  </p>
                )}
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </ScrollArea>
  );
}