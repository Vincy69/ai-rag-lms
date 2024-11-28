import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { BlockContent } from "@/components/learning/BlockContent";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

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

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="flex gap-6">
          {/* Navigation latérale */}
          <div className="w-80 shrink-0">
            <div className="sticky top-24 space-y-4">
              <h2 className="font-semibold text-lg mb-4">Mes blocs de compétences</h2>
              <div className="space-y-2">
                {enrolledBlocks.map((enrolledBlock) => (
                  <button
                    key={enrolledBlock.id}
                    onClick={() => setSearchParams({ blockId: enrolledBlock.id })}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3",
                      blockId === enrolledBlock.id
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent"
                    )}
                  >
                    <BookOpen className="w-5 h-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium truncate">{enrolledBlock.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-full bg-secondary/20 rounded-full h-1.5">
                          <div
                            className="bg-primary rounded-full h-1.5 transition-all"
                            style={{ width: `${enrolledBlock.progress}%` }}
                          />
                        </div>
                        <span className="shrink-0">{enrolledBlock.progress}%</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1 min-w-0">
            {blockId ? (
              isLoading ? (
                <div className="flex items-center justify-center h-[calc(100vh-16rem)]">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <BlockContent blockId={blockId} />
              )
            ) : (
              <div className="flex items-center justify-center h-[calc(100vh-16rem)] text-muted-foreground">
                Sélectionnez un bloc de compétences pour commencer
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}