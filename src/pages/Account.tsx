import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import type { UserRole } from "@/integrations/supabase/types/enums";

interface Enrollment {
  id: string;
  status: string;
  progress: number;
  formation: {
    name: string;
    description: string | null;
  } | null;
}

interface BlockEnrollment {
  id: string;
  status: string;
  progress: number;
  skill_block: {
    name: string;
    description: string | null;
  } | null;
}

interface SkillProgress {
  id: string;
  level: number;
  score: number;
  attempts: number;
  skill: {
    name: string;
  } | null;
}

export default function Account() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [blockEnrollments, setBlockEnrollments] = useState<BlockEnrollment[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
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

        setEmail(session.user.email);

        // Fetch profile with role
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) throw profileError;
        if (profileData) setRole(profileData.role);

        // Fetch formation enrollments
        const { data: formationData, error: formationError } = await supabase
          .from('formation_enrollments')
          .select(`
            id,
            status,
            progress,
            formation:formations (
              name,
              description
            )
          `)
          .eq('user_id', session.user.id);

        if (formationError) throw formationError;
        setEnrollments(formationData);

        // Fetch block enrollments
        const { data: blockData, error: blockError } = await supabase
          .from('block_enrollments')
          .select(`
            id,
            status,
            progress,
            skill_block:skill_blocks (
              name,
              description
            )
          `)
          .eq('user_id', session.user.id);

        if (blockError) throw blockError;
        setBlockEnrollments(blockData);

        // Fetch skill progress
        const { data: skillData, error: skillError } = await supabase
          .from('skill_progress')
          .select(`
            id,
            level,
            score,
            attempts,
            skill:skills (
              name
            )
          `)
          .eq('user_id', session.user.id);

        if (skillError) throw skillError;
        setSkillProgress(skillData);

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

        {enrollments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mes formations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {enrollments.map((enrollment) => (
                <div key={enrollment.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{enrollment.formation?.name}</h3>
                    <span className="text-sm text-muted-foreground capitalize">{enrollment.status}</span>
                  </div>
                  <Progress value={enrollment.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{enrollment.formation?.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {blockEnrollments.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Mes blocs de compétences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {blockEnrollments.map((block) => (
                <div key={block.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{block.skill_block?.name}</h3>
                    <span className="text-sm text-muted-foreground capitalize">{block.status}</span>
                  </div>
                  <Progress value={block.progress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{block.skill_block?.description}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {skillProgress.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Progression des compétences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {skillProgress.map((progress) => (
                <div key={progress.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">{progress.skill?.name}</h3>
                    <span className="text-sm text-muted-foreground">
                      Niveau {progress.level} • Score {progress.score}%
                    </span>
                  </div>
                  <Progress value={progress.score} className="h-2" />
                  <p className="text-sm text-muted-foreground">
                    {progress.attempts} tentative{progress.attempts !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}