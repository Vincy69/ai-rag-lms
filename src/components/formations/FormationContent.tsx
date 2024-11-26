import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface Skill {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
}

interface Block {
  id: string;
  name: string;
  description: string | null;
  order_index: number;
  skills: Skill[];
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

export function FormationContent({ formation }: FormationContentProps) {
  return (
    <div className="space-y-6">
      {formation.description && (
        <p className="text-muted-foreground">{formation.description}</p>
      )}

      <div>
        <h3 className="font-semibold mb-4">Blocs de compétences</h3>
        <Accordion type="single" collapsible className="space-y-4">
          {formation.blocks.map((block) => (
            <AccordionItem key={block.id} value={block.id} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-4">
                  <span className="font-medium">{block.name}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4 pt-4">
                  {block.description && (
                    <p className="text-sm text-muted-foreground">
                      {block.description}
                    </p>
                  )}
                  <div className="space-y-2">
                    {block.skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="text-sm p-3 rounded-lg bg-secondary/50"
                      >
                        {skill.name}
                      </div>
                    ))}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}