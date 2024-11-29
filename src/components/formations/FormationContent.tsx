import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Award, BookOpen, Check, GraduationCap, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  quiz_type: 'chapter_quiz' | 'block_quiz';
  chapter_id: string | null;
  score?: number;
}

interface Block {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  quizzes: Quiz[];
}

interface Formation {
  id: string;
  name: string;
  description: string | null;
  category: string;
  blocks: Block[];
}

interface FormationContentProps {
  formation: Formation;
}

// Fonction utilitaire pour normaliser les noms de blocs
const normalizeBlockName = (name: string): string => {
  return name.toLowerCase()
    .replace(/[:\-–—]/g, '')
    .replace(/\s+et\s+.*$/, '')
    .replace(/ue\s*(\d+).*$/i, 'ue$1')
    .replace(/\s+/g, '')
    .trim();
};

// Vérifie si un bloc a du contenu
const hasContent = (block: Block): boolean => {
  return block.quizzes && block.quizzes.length > 0;
};

// Fonction pour regrouper les blocs similaires
const getUniqueBlocks = (blocks: Block[]): Block[] => {
  const blockMap = new Map<string, Block>();
  
  blocks
    .filter(hasContent)
    .forEach(block => {
      const normalizedName = normalizeBlockName(block.name);
      const existingBlock = blockMap.get(normalizedName);
      
      if (!existingBlock || (block.order_index < existingBlock.order_index)) {
        const mergedQuizzes = existingBlock
          ? [...existingBlock.quizzes, ...block.quizzes]
          : block.quizzes;

        const uniqueQuizzes = Array.from(
          new Map(mergedQuizzes.map(quiz => [quiz.id, quiz])).values()
        );

        blockMap.set(normalizedName, {
          ...block,
          quizzes: uniqueQuizzes
        });
      }
    });
  
  return Array.from(blockMap.values())
    .sort((a, b) => a.order_index - b.order_index);
};

export function FormationContent({ formation }: FormationContentProps) {
  const uniqueBlocks = getUniqueBlocks(formation.blocks);

  return (
    <div className="space-y-6">
      {formation.description && (
        <p className="text-muted-foreground">{formation.description}</p>
      )}

      <div>
        <h3 className="font-semibold mb-4">Blocs de compétences</h3>
        <Accordion type="single" collapsible className="space-y-4">
          {uniqueBlocks.map((block) => (
            <AccordionItem key={block.id} value={block.id} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{block.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-6 pt-4">
                  {block.description && (
                    <p className="text-sm text-muted-foreground">
                      {block.description}
                    </p>
                  )}

                  {/* Quizzes Section */}
                  {block.quizzes && block.quizzes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        Évaluations
                      </h4>
                      <div className="grid gap-2">
                        {block.quizzes.map((quiz) => {
                          const isCompleted = quiz.score !== undefined;
                          const isPassed = quiz.score !== undefined && quiz.score >= 70;
                          
                          return (
                            <div
                              key={quiz.id}
                              className={cn(
                                "flex items-center gap-3 text-sm p-3 rounded-lg transition-colors",
                                quiz.quiz_type === 'block_quiz' 
                                  ? "bg-primary/10 hover:bg-primary/20" 
                                  : "bg-secondary/50 hover:bg-secondary/70"
                              )}
                            >
                              {quiz.quiz_type === 'block_quiz' ? (
                                <Award className={cn(
                                  "h-4 w-4",
                                  isCompleted ? (isPassed ? "text-green-500" : "text-red-500") : "text-primary"
                                )} />
                              ) : (
                                <GraduationCap className="h-4 w-4 text-primary" />
                              )}
                              <span className="flex-1">{quiz.title}</span>
                              {isCompleted && (
                                <>
                                  <span className={cn(
                                    "text-xs",
                                    isPassed ? "text-green-500" : "text-red-500"
                                  )}>
                                    {quiz.score}%
                                  </span>
                                  {isPassed ? (
                                    <Check className="h-4 w-4 text-green-500" />
                                  ) : (
                                    <X className="h-4 w-4 text-red-500" />
                                  )}
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}