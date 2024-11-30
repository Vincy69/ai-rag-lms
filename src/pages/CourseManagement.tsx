import Layout from "@/components/Layout";
import { FormationContent } from "@/components/course-management/formation/FormationContent";
import { FormationSelector } from "@/components/course-management/FormationSelector";
import { useState } from "react";

export default function CourseManagement() {
  const [selectedFormationId, setSelectedFormationId] = useState<string | null>(null);

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-8">
        <h1 className="text-2xl font-bold">Gestion des formations</h1>
        
        <div className="space-y-6">
          <FormationSelector 
            onFormationSelect={setSelectedFormationId} 
            selectedFormationId={selectedFormationId} 
          />

          {selectedFormationId && (
            <FormationContent formationId={selectedFormationId} />
          )}
        </div>
      </div>
    </Layout>
  );
}