import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { FormationCard } from "@/components/formations/FormationCard";
import { FormationDialog } from "@/components/formations/FormationDialog";
import { useState } from "react";

export default function Formations() {
  const [selectedFormation, setSelectedFormation] = useState<string | null>(null);

  const { data: formations, isLoading } = useQuery({
    queryKey: ["formations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  return (
    <Layout>
      <div className="container py-8 space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold">Parcours de formation</h1>
          <p className="text-muted-foreground mt-2">
            Découvrez nos parcours de formation et leurs contenus
          </p>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-48 rounded-lg border bg-card animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {formations?.map((formation) => (
              <FormationCard
                key={formation.id}
                formation={formation}
                onClick={() => setSelectedFormation(formation.id)}
              />
            ))}
          </div>
        )}

        <FormationDialog
          formationId={selectedFormation}
          open={!!selectedFormation}
          onOpenChange={(open) => !open && setSelectedFormation(null)}
        />
      </div>
    </Layout>
  );
}