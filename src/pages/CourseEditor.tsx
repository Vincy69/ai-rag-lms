import Layout from "@/components/Layout";
import { FormationContent } from "@/components/course-management/formation/FormationContent";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function CourseEditor() {
  const { formationId } = useParams();
  const navigate = useNavigate();

  if (!formationId) {
    return null;
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-8">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/admin/courses')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <h1 className="text-2xl font-bold">Modifier la formation</h1>
        </div>
        
        <FormationContent formationId={formationId} />
      </div>
    </Layout>
  );
}