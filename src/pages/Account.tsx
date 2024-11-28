import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { AccountFormations } from "@/components/account/AccountFormations";
import { AccountInfo } from "@/components/account/AccountInfo";

export default function Account() {
  const [isLoading, setIsLoading] = useState(true);
  const [formations, setFormations] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      try {
        setIsLoading(true);
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          navigate("/login");
          return;
        }

        // Fetch formations with complete progress data
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('formation_enrollments')
          .select(`
            formation_id,
            status,
            progress,
            formations (
              id,
              name,
              description,
              skill_blocks (
                id,
                name,
                description,
                block_enrollments!inner (
                  status,
                  progress
                ),
                chapters (
                  id,
                  title,
                  lessons (
                    id
                  ),
                  lesson_progress!inner (
                    is_completed
                  ),
                  quizzes (
                    id,
                    title
                  )
                ),
                skills (
                  id,
                  name,
                  skill_progress!inner (
                    level,
                    score,
                    attempts
                  )
                )
              )
            )
          `)
          .eq('user_id', session.user.id);

        if (enrollmentsError) throw enrollmentsError;

        const formationsWithProgress = enrollments.map(enrollment => ({
          id: enrollment.formation_id,
          name: enrollment.formations?.name || '',
          description: enrollment.formations?.description,
          status: enrollment.status,
          progress: enrollment.progress,
          blocks: enrollment.formations?.skill_blocks.map(block => ({
            id: block.id,
            name: block.name,
            description: block.description,
            status: block.block_enrollments[0]?.status || 'not_started',
            progress: block.block_enrollments[0]?.progress || 0,
            chapters: block.chapters?.map(chapter => ({
              id: chapter.id,
              title: chapter.title,
              completedLessons: chapter.lesson_progress?.filter(p => p.is_completed).length || 0,
              lessons: chapter.lessons || [],
              quizzes: chapter.quizzes || [],
            })) || [],
            skills: block.skills.map(skill => ({
              id: skill.id,
              name: skill.name,
              level: skill.skill_progress[0]?.level || null,
              score: skill.skill_progress[0]?.score || null,
              attempts: skill.skill_progress[0]?.attempts || null,
            })),
          })) || [],
        }));

        setFormations(formationsWithProgress);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les informations du profil",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    getProfile();
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-8 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8 space-y-8">
        <h1 className="text-2xl font-bold">Mon compte</h1>
        <AccountInfo />
        <AccountFormations formations={formations} />
      </div>
    </Layout>
  );
}