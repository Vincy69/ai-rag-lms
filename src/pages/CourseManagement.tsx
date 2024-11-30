import Layout from "@/components/Layout";
import { FormationsList } from "@/components/course-management/formations/FormationsList";
import { useNavigate } from "react-router-dom";

export default function CourseManagement() {
  const navigate = useNavigate();

  const handleFormationSelect = (formationId: string) => {
    navigate(`/admin/courses/${formationId}`);
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-8">
        <h1 className="text-2xl font-bold">Gestion des formations</h1>
        <FormationsList onFormationSelect={handleFormationSelect} />
      </div>
    </Layout>
  );
}