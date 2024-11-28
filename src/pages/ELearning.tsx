import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { BlockContent } from "@/components/learning/BlockContent";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, BookOpen, ChevronRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

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
        orderIndex: enrollment.skill_blocks.order_index,
        status: enrollment.status,
        progress: enrollment.progress,
        formationName: enrollment.skill_blocks.formations?.name
      }))
      .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    },
  });

  const resetProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase.functions.invoke('reset-progress', {
        body: { user_id: user.id },
      });

      if (error) throw error;

      toast({
        title: "Progression réinitialisée",
        description: "Votre progression a été réinitialisée avec succès.",
      });

      // Refresh the page to show updated progress
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

  if (!enrolledBlocks || enrolledBlocks.length === 0) {
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
    return (
      <Layout>
        <div className="container mx-auto py-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Mes UE</h1>
            <Button 
              variant="outline" 
              onClick={resetProgress}
              className="gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Réinitialiser ma progression
            </Button>
          </div>
          <div className="grid gap-4">
            {enrolledBlocks.map((block) => (
              <button
                key={block.id}
                onClick={() => setSearchParams({ blockId: block.id })}
                className="w-full p-4 rounded-lg bg-card hover:bg-accent transition-colors text-left group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate group-hover:text-primary transition-colors">
                      {block.name}
                    </h3>
                    {block.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {block.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <div className="w-full bg-secondary/20 rounded-full h-1.5">
                        <div
                          className="bg-primary rounded-full h-1.5 transition-all"
                          style={{ width: `${block.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        {block.progress}%
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-primary transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // Si un bloc est sélectionné, afficher le contenu avec la navigation en cascade
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <button
            onClick={() => setSearchParams({})}
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Retour aux UE
          </button>
        </div>
        
        <BlockContent blockId={blockId} />
      </div>
    </Layout>
  );
}
