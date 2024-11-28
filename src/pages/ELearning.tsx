import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { BlockContent } from "@/components/learning/BlockContent";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, RotateCcw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { FormationProgress } from "@/components/learning/FormationProgress";
import { BlockList } from "@/components/learning/BlockList";
import { Block } from "@/types/learning";

export default function ELearning() {
  const [searchParams, setSearchParams] = useSearchParams();
  const blockId = searchParams.get("blockId");
  const { toast } = useToast();

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
            order_index,
            formations (
              name
            ),
            chapters (
              id,
              lessons (
                id,
                title
              ),
              quizzes (
                id,
                title,
                quiz_type
              )
            )
          )
        `)
        .eq("user_id", user.id)
        .order("enrolled_at", { ascending: false });

      if (error) throw error;

      return data;
    },
  });

  const resetProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.functions.invoke('reset-progress', {
        body: { user_id: user.id },
      });

      if (error) throw error;

      toast({
        title: "Progression réinitialisée",
        description: "Votre progression a été réinitialisée avec succès.",
      });

      window.location.reload();
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast({
        title: "Erreur",
        description: "Impossible de réinitialiser la progression.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingBlocks) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!enrolledBlocks || Object.keys(enrolledBlocks).length === 0) {
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <Card className="p-6">
            <p className="text-center text-muted-foreground">
              Vous n'êtes inscrit à aucune UE. Rendez-vous sur la page Formations pour vous inscrire.
            </p>
          </Card>
        </div>
      </Layout>
    );
  }

  // Si aucun bloc n'est sélectionné, afficher la liste des UE
  if (!blockId) {
    const allBlocks = enrolledBlocks || [];
    const totalProgress = allBlocks.reduce((acc, block) => acc + (block.progress || 0), 0) / allBlocks.length;

    return (
      <Layout>
        <div className="container mx-auto py-8 space-y-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Ma formation</h1>
            <Button 
              variant="outline" 
              onClick={resetProgress}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser ma progression
            </Button>
          </div>

          <FormationProgress progress={totalProgress} />

          {Object.entries(enrolledBlocks).map(([formationName, blocks]) => (
            <BlockList
              key={formationName}
              formationName={formationName}
              blocks={blocks}
              onSelectBlock={(blockId) => setSearchParams({ blockId })}
            />
          ))}
        </div>
      </Layout>
    );
  }

  // Si un bloc est sélectionné, afficher son contenu
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <button
            onClick={() => setSearchParams({})}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Retour à ma formation
          </button>
        </div>
        
        <BlockContent blockId={blockId} />
      </div>
    </Layout>
  );
}