import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { BlockContent } from "@/components/learning/BlockContent";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export default function ELearning() {
  const [searchParams] = useSearchParams();
  const blockId = searchParams.get("blockId");

  const { data: block, isLoading } = useQuery({
    queryKey: ["block", blockId],
    queryFn: async () => {
      if (!blockId) return null;

      const { data, error } = await supabase
        .from("skill_blocks")
        .select(`
          id,
          name,
          description,
          formations (
            name
          )
        `)
        .eq("id", blockId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!blockId,
  });

  if (!blockId) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">E-Learning</h1>
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Sélectionnez un bloc de compétences depuis votre profil pour commencer à apprendre.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">{block?.name}</h1>
          {block?.formations?.name && (
            <p className="text-muted-foreground">
              Formation : {block.formations.name}
            </p>
          )}
          {block?.description && (
            <p className="text-muted-foreground">{block.description}</p>
          )}
        </div>

        <BlockContent blockId={blockId} />
      </div>
    </Layout>
  );
}