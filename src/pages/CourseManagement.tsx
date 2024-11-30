import Layout from "@/components/Layout";
import { CourseManagementTabs } from "@/components/course-management/CourseManagementTabs";

export default function CourseManagement() {
  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-8">
        <h1 className="text-2xl font-bold">Gestion des formations</h1>
        <CourseManagementTabs />
      </div>
    </Layout>
  );
}