import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SkillProgressCard } from "./SkillProgressCard";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BlockContent } from "../learning/BlockContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateBlockProgress, calculateChapterProgress } from "@/lib/progress";
import { GraduationCap } from "lucide-react";

interface BlockDetailsDialogProps {
  block: {
    id: string;
    name: string | null;
    description: string | null;
    status: string;
    progress: number | null;
    skills: Array<{
      name: string | null;
      level: number | null;
      score: number | null;
      attempts: number | null;
    }>;
    chapters?: Array<{
      id: string;
      title?: string;
      completedLessons: number;
      lessons: Array<any>;
      quizzes?: Array<{
        id: string;
        title: string;
        quiz_type: string;
        chapter_id: string | null;
      }>;
    }>;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BlockDetailsDialog({
  block,
  open,
  onOpenChange,
}: BlockDetailsDialogProps) {
  if (!block) return null;

  const blockProgress = calculateBlockProgress(block);
  
  // Séparation des quiz de bloc et de chapitre
  const blockQuizzes = block.chapters?.[0]?.quizzes?.filter(q => 
    q.quiz_type === 'block_quiz'
  ) || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{block.name}</span>
            <span className="text-base font-normal text-muted-foreground">
              {blockProgress > 0 ? `${Math.round(blockProgress)}%` : 'Non commencé'}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="content" className="mt-4">
          <TabsList>
            <TabsTrigger value="content">Contenu</TabsTrigger>
            <TabsTrigger value="progress">Progression</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="mt-4">
            <BlockContent blockId={block.id} />
          </TabsContent>

          <TabsContent value="progress" className="mt-4">
            <ScrollArea className="pr-4 max-h-[calc(80vh-8rem)]">
              <div className="space-y-6">
                {block.description && (
                  <p className="text-sm text-muted-foreground">{block.description}</p>
                )}
                
                <Progress 
                  value={blockProgress} 
                  className="h-2 transition-all duration-300"
                />
                
                <div className="space-y-4">
                  {block.chapters && block.chapters.length > 0 ? (
                    <>
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Chapitres</h3>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            {block.chapters.reduce((acc, chapter) => acc + chapter.completedLessons, 0)} / {
                              block.chapters.reduce((acc, chapter) => acc + chapter.lessons.length, 0)
                            } leçons complétées
                          </span>
                          {blockQuizzes.length > 0 && (
                            <span className="text-sm text-primary flex items-center gap-2">
                              <GraduationCap className="w-4 h-4" />
                              {blockQuizzes.length} quiz{blockQuizzes.length > 1 ? 's' : ''} de bloc
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-4">
                        {block.chapters.map((chapter) => {
                          // Filtrer les quiz pour ce chapitre spécifique uniquement
                          const chapterQuizzes = chapter.quizzes?.filter(q => 
                            q.quiz_type === 'chapter_quiz' && q.chapter_id === chapter.id
                          ) || [];
                          
                          return (
                            <div key={chapter.id} className="space-y-2">
                              <h4 className="text-sm font-medium">{chapter.title}</h4>
                              <Progress 
                                value={calculateChapterProgress(
                                  chapter.completedLessons,
                                  chapter.lessons.length
                                )} 
                                className="h-2"
                              />
                              <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{chapter.completedLessons} / {chapter.lessons.length} leçons</span>
                                {chapterQuizzes.length > 0 && (
                                  <span className="flex items-center gap-2">
                                    <GraduationCap className="w-4 h-4" />
                                    {chapterQuizzes.length} quiz{chapterQuizzes.length > 1 ? 's' : ''}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Compétences du bloc</h3>
                        <span className="text-sm text-muted-foreground">
                          {block.skills.filter(s => s.score && s.score > 0).length} / {block.skills.length} compétences évaluées
                        </span>
                      </div>
                      <div className="space-y-4">
                        {block.skills.map((skill, index) => (
                          <SkillProgressCard key={index} skill={skill} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}