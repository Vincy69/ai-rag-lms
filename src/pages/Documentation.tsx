import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";

export default function Documentation() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Documentation</h1>
        <Card className="p-6">
          <div className="prose dark:prose-invert max-w-none">
            <h2>Bienvenue dans la documentation</h2>
            <p>Cette section contient toute la documentation nécessaire pour utiliser l'application.</p>
          </div>
        </Card>
      </div>
    </Layout>
  );
}