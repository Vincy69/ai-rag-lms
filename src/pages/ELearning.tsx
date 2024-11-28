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
            )
          ),
          chapters:skill_blocks(
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

      // Get lesson progress for each block
      const lessonProgressPromises = data.map(async (enrollment) => {
        const { data: lessonProgress } = await supabase
          .from("lesson_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("block_id", enrollment.block_id)
          .eq("is_completed", true);
        return { blockId: enrollment.block_id, completedLessons: lessonProgress?.length || 0 };
      });

      // Get quiz attempts for each block
      const quizAttemptsPromises = data.map(async (enrollment) => {
        const { data: quizAttempts } = await supabase
          .from("quiz_attempts")
          .select("*")
          .eq("user_id", user.id)
          .eq("is_completed", true)
          .in("quiz_id", enrollment.chapters.chapters.flatMap(chapter => 
            chapter.quizzes.map(quiz => quiz.id)
          ));
        return { blockId: enrollment.block_id, completedQuizzes: quizAttempts?.length || 0 };
      });

      const lessonProgress = await Promise.all(lessonProgressPromises);
      const quizAttempts = await Promise.all(quizAttemptsPromises);

      return data.map(enrollment => ({
        id: enrollment.block_id,
        name: enrollment.skill_blocks.name,
        description: enrollment.skill_blocks.description,
        orderIndex: enrollment.skill_blocks.order_index,
        status: enrollment.status,
        progress: enrollment.progress,
        formationName: enrollment.skill_blocks.formations?.name,
        totalLessons: enrollment.chapters.chapters.reduce((acc, chapter) => 
          acc + chapter.lessons.length, 0
        ),
        totalQuizzes: enrollment.chapters.chapters.reduce((acc, chapter) => 
          acc + chapter.quizzes.length, 0
        ),
        completedLessons: lessonProgress.find(p => p.blockId === enrollment.block_id)?.completedLessons || 0,
        completedQuizzes: quizAttempts.find(a => a.blockId === enrollment.block_id)?.completedQuizzes || 0,
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
        <div className="container mx-auto py-8 space-y-6">
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

          <div className="space-y-4">
            {enrolledBlocks.map((block) => (
              <Card
                key={block.id}
                className="group hover:shadow-md transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                          <BookOpen className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{block.name}</h3>
                          {block.formationName && (
                            <p className="text-sm text-muted-foreground">
                              Formation : {block.formationName}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        className="gap-2"
                        onClick={() => setSearchParams({ blockId: block.id })}
                      >
                        Accéder au contenu
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
                            {block.completedLessons} / {block.totalLessons} leçons
                          </span>
                          <span className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4" />
                            {block.completedQuizzes} / {block.totalQuizzes} quiz
                          </span>
                        </div>
                        <span>{Math.round(block.progress)}%</span>
                      </div>
                    </div>

                    {block.description && (
                      <p className="text-sm text-muted-foreground">
                        {block.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
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