import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormationEnrollments } from "./FormationEnrollments";
import { BlockEnrollments } from "./BlockEnrollments";
import type { User } from "@/hooks/useUsers";

interface EnrollmentTabsProps {
  user: User;
  isLoading: boolean;
}

export function EnrollmentTabs({ user, isLoading }: EnrollmentTabsProps) {
  return (
    <Tabs defaultValue="formations">
      <TabsList>
        <TabsTrigger value="formations">Formations</TabsTrigger>
        <TabsTrigger value="blocks">Blocs</TabsTrigger>
      </TabsList>

      <TabsContent value="formations">
        <FormationEnrollments user={user} isLoading={isLoading} />
      </TabsContent>

      <TabsContent value="blocks">
        <BlockEnrollments user={user} isLoading={isLoading} />
      </TabsContent>
    </Tabs>
  );
}