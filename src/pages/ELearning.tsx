import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { BlockContent } from "@/components/learning/BlockContent";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { BlockProgressCard } from "@/components/account/BlockProgressCard";

export default function ELearning() {
  const [searchParams, setSearchParams] = useSearchParams();
  const blockId = searchParams.get("blockId");

  const { data: enrolledBlocks, isLoading: isLoadingBlocks } = useQuery({
    queryKey: ["enrolled-blocks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("block_enrollments")
        .select(`
          block_id,
          status,
          progress,
          skill_blocks (
            id,
            name,
            description,
            skills (
              id,
              name,
              skill_progress (
                level,
                score,
                attempts
              )
            )
          )
        `)
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;

      return data.map(enrollment => ({
        id: enrollment.block_id,
        name: enrollment.skill_blocks.name,
        description: enrollment.skill_blocks.description,
        status: enrollment.status,
        progress: enrollment.progress,
        skills: enrollment.skill_blocks.skills.map(skill => ({
          name: skill.name,
          level: skill.skill_progress?.[0]?.level || 0,
          score: skill.skill_progress?.[0]?.score || 0,
          attempts: skill.skill_progress?.[0]?.attempts || 0,
        }))
      }));
    },
  });

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

  if (isLoadingBlocks) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!enrolledBlocks || enrolledBlocks.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">E-Learning</h1>
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Vous n'êtes inscrit à aucun bloc de compétences. Rendez-vous sur la page Formations pour vous inscrire.
              </p>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  if (!blockId) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <h1 className="text-2xl font-bold mb-6">E-Learning</h1>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {enrolledBlocks.map((block) => (
              <BlockProgressCard
                key={block.id}
                block={block}
                onClick={() => setSearchParams({ blockId: block.id })}
              />
            ))}
          </div>
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