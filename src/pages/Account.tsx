import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";
import { FormationProgressCard } from "@/components/account/FormationProgressCard";

type UserRole = Database['public']['Enums']['user_role'];
type Formation = Database['public']['Tables']['formations']['Row'];
type Block = Database['public']['Tables']['skill_blocks']['Row'];
type Skill = Database['public']['Tables']['skills']['Row'];

interface FormationProgress {
  id: string;
  name: string;
  description: string | null;
  status: string;
  progress: number | null;
  blocks: Array<{
    id: string;
    name: string;
    description: string | null;
    status: string;
    progress: number | null;
    skills: Array<{
      id: string;
      name: string;
      level: number | null;
      score: number | null;
      attempts: number | null;
    }>;
  }>;
}

export default function Account() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formations, setFormations] = useState<FormationProgress[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching session...");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          console.log("No session found, redirecting to login");
          navigate("/login");
          return;
        }

        setEmail(session.user.email);
        console.log("Session found for email:", session.user.email);

        // Fetch profile with role
        console.log("Fetching profile data...");
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error("Profile fetch error:", profileError);
          throw profileError;
        }
        if (profileData) {
          console.log("Profile data found:", profileData);
          setRole(profileData.role as UserRole);
        }

        // First, get all formations the user is enrolled in
        console.log("Fetching enrollments...");
        const { data: enrollments, error: enrollmentsError } = await supabase
          .from('formation_enrollments')
          .select(`
            formation_id,
            status,
            progress,
            formations (
              id,
              name,
              description
            )
          `)
          .eq('user_id', session.user.id);

        if (enrollmentsError) {
          console.error("Enrollments fetch error:", enrollmentsError);
          throw enrollmentsError;
        }

        console.log("Enrollments found:", enrollments);

        // For each formation, get the blocks and their progress
        const formationsWithProgress = await Promise.all(
          enrollments.map(async (enrollment) => {
            console.log("Fetching blocks for formation:", enrollment.formation_id);
            // Get blocks for this formation
            const { data: blocks, error: blocksError } = await supabase
              .from('skill_blocks')
              .select(`
                id,
                name,
                description,
                block_enrollments!inner (
                  status,
                  progress
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
              `)
              .eq('formation_id', enrollment.formation_id)
              .eq('block_enrollments.user_id', session.user.id);

            if (blocksError) {
              console.error("Blocks fetch error:", blocksError);
              throw blocksError;
            }

            console.log("Blocks found:", blocks);

            return {
              id: enrollment.formation_id,
              name: enrollment.formations?.name || '',
              description: enrollment.formations?.description,
              status: enrollment.status,
              progress: enrollment.progress,
              blocks: blocks.map(block => ({
                id: block.id,
                name: block.name,
                description: block.description,
                status: block.block_enrollments[0]?.status || 'not_started',
                progress: block.block_enrollments[0]?.progress || 0,
                skills: block.skills.map(skill => ({
                  id: skill.id,
                  name: skill.name,
                  level: skill.skill_progress[0]?.level || null,
                  score: skill.skill_progress[0]?.score || null,
                  attempts: skill.skill_progress[0]?.attempts || null,
                })),
              })),
            };
          })
        );

        console.log("Final formations with progress:", formationsWithProgress);
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès",
      });
      navigate("/login");
    } catch (error) {
      console.error('Error during logout:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
    }
  };

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
        
        <Card>
          <CardHeader>
            <CardTitle>Informations du compte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="mt-1">{email}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Rôle</label>
              <p className="mt-1 capitalize">{role || 'Non défini'}</p>
            </div>
            
            <Button variant="destructive" onClick={handleLogout}>
              Se déconnecter
            </Button>
          </CardContent>
        </Card>

        {formations.length > 0 ? (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Mes formations</h2>
            <div className="space-y-6">
              {formations.map((formation) => (
                <FormationProgressCard key={formation.id} formation={formation} />
              ))}
            </div>
          </div>
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                Vous n'êtes inscrit à aucune formation pour le moment.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}