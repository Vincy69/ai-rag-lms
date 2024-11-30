import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormationSelector } from "./FormationSelector";
import { FormationBlocks } from "./formation/FormationBlocks";
import { FormationLessons } from "./formation/FormationLessons";
import { FormationQuizzes } from "./formation/FormationQuizzes";
import { Layers, BookOpen, ClipboardList } from "lucide-react";
import { useState } from "react";

export function CourseManagementTabs() {
  const [selectedFormationId, setSelectedFormationId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <FormationSelector 
        onFormationSelect={setSelectedFormationId} 
        selectedFormationId={selectedFormationId} 
      />

      {selectedFormationId ? (
        <Tabs defaultValue="blocks" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="blocks" className="space-x-2">
              <Layers className="h-4 w-4" />
              <span>Blocs</span>
            </TabsTrigger>
            <TabsTrigger value="lessons" className="space-x-2">
              <BookOpen className="h-4 w-4" />
              <span>Leçons</span>
            </TabsTrigger>
            <TabsTrigger value="quizzes" className="space-x-2">
              <ClipboardList className="h-4 w-4" />
              <span>Quiz</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="blocks">
            <FormationBlocks formationId={selectedFormationId} />
          </TabsContent>
          <TabsContent value="lessons">
            <FormationLessons formationId={selectedFormationId} />
          </TabsContent>
          <TabsContent value="quizzes">
            <FormationQuizzes formationId={selectedFormationId} />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center text-muted-foreground">
          Sélectionnez une formation pour gérer son contenu
        </div>
      )}
    </div>
  );
}