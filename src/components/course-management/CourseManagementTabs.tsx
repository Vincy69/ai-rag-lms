import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormationsList } from "./formations/FormationsList";
import { BlocksList } from "./blocks/BlocksList";
import { LessonsList } from "./lessons/LessonsList";
import { QuizzesList } from "./quizzes/QuizzesList";
import { CategoriesList } from "./categories/CategoriesList";
import { GraduationCap, Layers, BookOpen, ClipboardList, List } from "lucide-react";

export function CourseManagementTabs() {
  return (
    <Tabs defaultValue="formations" className="space-y-6">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="formations" className="space-x-2">
          <GraduationCap className="h-4 w-4" />
          <span>Formations</span>
        </TabsTrigger>
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
        <TabsTrigger value="categories" className="space-x-2">
          <List className="h-4 w-4" />
          <span>Catégories</span>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="formations">
        <FormationsList />
      </TabsContent>
      <TabsContent value="blocks">
        <BlocksList />
      </TabsContent>
      <TabsContent value="lessons">
        <LessonsList />
      </TabsContent>
      <TabsContent value="quizzes">
        <QuizzesList />
      </TabsContent>
      <TabsContent value="categories">
        <CategoriesList />
      </TabsContent>
    </Tabs>
  );
}