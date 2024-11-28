import { useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import { BlockContent } from "@/components/learning/BlockContent";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, BookOpen, ChevronRight, RotateCcw, GraduationCap } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { FormationTimeline } from "@/components/learning/FormationTimeline";

export default function ELearning() {
  const [searchParams, setSearchParams] = useSearchParams();
  const blockId = searchParams.get("blockId");
  const { toast } = useToast();

  const { data: enrolledBlocks, isLoading: isLoadingBlocks } = useQuery({
    queryKey: ["enrolled-blocks"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Fetch block enrollments with additional data
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

      // Group blocks by formation
      const blocksByFormation = data.reduce((acc, enrollment) => {
        const formationName = enrollment.skill_blocks.formations?.name;
        if (!acc[formationName]) {
          acc[formationName] = [];
        }
        
        const totalLessons = enrollment.skill_blocks.chapters?.reduce(
          (sum, chapter) => sum + (chapter.lessons?.length || 0), 
          0
        ) || 0;
        
        const totalQuizzes = enrollment.skill_blocks.chapters?.reduce(
          (sum, chapter) => sum + (chapter.quizzes?.length || 0),
          0
        ) || 0;

        acc[formationName].push({
          id: enrollment.block_id,
          name: enrollment.skill_blocks.name,
          description: enrollment.skill_blocks.description,
          orderIndex: enrollment.skill_blocks.order_index,
          status: enrollment.status,
          progress: enrollment.progress,
          formationName,
          totalLessons,
          totalQuizzes,
        });

        return acc;
      }, {});

      // Sort blocks within each formation by order_index
      Object.values(blocksByFormation).forEach(blocks => {
        blocks.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
      });

      return blocksByFormation;
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
    return (
      <Layout>
        <div className="container mx-auto py-8 space-y-8">
          <div className="flex justify-between items-center">
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

          {Object.entries(enrolledBlocks).map(([formationName, blocks]) => (
            <div key={formationName} className="space-y-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">{formationName}</h2>
                <FormationTimeline 
                  blocks={blocks}
                  onSelectBlock={(blockId) => setSearchParams({ blockId })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {blocks.map((block) => (
                  <Card
                    key={block.id}
                    className="group hover:shadow-md transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {/* Header */}
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <BookOpen className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold line-clamp-1">{block.name}</h3>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setSearchParams({ blockId: block.id })}
                          >
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>

                        {/* Progress */}
                        <div className="space-y-2">
                          <Progress value={block.progress} className="h-2" />
                          <div className="flex justify-between text-sm text-muted-foreground">
                            <div className="flex items-center gap-4">
                              <span className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                {block.totalLessons} leçons
                              </span>
                              <span className="flex items-center gap-2">
                                <GraduationCap className="w-4 h-4" />
                                {block.totalQuizzes} quiz
                              </span>
                            </div>
                            <span>{Math.round(block.progress)}%</span>
                          </div>
                        </div>

                        {block.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {block.description}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
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
