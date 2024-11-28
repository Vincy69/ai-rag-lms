import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Award, BookOpen, Check, GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface Skill {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
}

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  quiz_type: 'chapter_quiz' | 'block_quiz';
  chapter_id: string | null;
}

interface Block {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  skills: Skill[];
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
    .replace(/[:\-–—]/g, '') // Supprime les caractères spéciaux
    .replace(/\s+/g, ' ')    // Normalise les espaces
    .trim();                 // Supprime les espaces au début et à la fin
};

// Fonction pour regrouper les blocs similaires
const getUniqueBlocks = (blocks: Block[]): Block[] => {
  const blockMap = new Map<string, Block>();
  
  blocks.forEach(block => {
    const normalizedName = normalizeBlockName(block.name);
    const existingBlock = blockMap.get(normalizedName);
    
    if (!existingBlock || (block.order_index < existingBlock.order_index)) {
      blockMap.set(normalizedName, block);
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

                  {/* Skills Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      Compétences à acquérir
                    </h4>
                    <div className="grid gap-2">
                      {block.skills.map((skill) => (
                        <div
                          key={skill.id}
                          className="text-sm p-3 rounded-lg bg-secondary/50 hover:bg-secondary/70 transition-colors"
                        >
                          {skill.name}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quizzes Section */}
                  {block.quizzes && block.quizzes.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
                        Évaluations
                      </h4>
                      <div className="grid gap-2">
                        {block.quizzes.map((quiz) => (
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
                              <Award className="h-4 w-4 text-primary" />
                            ) : (
                              <GraduationCap className="h-4 w-4 text-primary" />
                            )}
                            <span className="flex-1">{quiz.title}</span>
                          </div>
                        ))}
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