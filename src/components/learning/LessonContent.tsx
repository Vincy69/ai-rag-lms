import { ScrollArea } from "@/components/ui/scroll-area";

interface Lesson {
  id: string;
  title: string;
  content: string;
  duration: number | null;
}

interface LessonContentProps {
  lesson: Lesson;
}

export function LessonContent({ lesson }: LessonContentProps) {
  return (
    <ScrollArea className="h-[calc(100vh-16rem)] pr-4">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-semibold">{lesson.title}</h2>
          {lesson.duration && (
            <p className="text-sm text-muted-foreground mt-1">
              Durée estimée : {lesson.duration} minutes
            </p>
          )}
        </div>
        
        <div className="prose prose-gray dark:prose-invert max-w-none">
          {lesson.content.split('\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}