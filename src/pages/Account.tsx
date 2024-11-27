import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['user_role'];

export default function Account() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session?.user) {
          navigate("/login");
          return;
        }

        setEmail(session.user.email);

        console.log("Fetching profile for user:", session.user.id);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          throw profileError;
        }

        console.log("Profile data received:", profileData);

        if (profileData) {
          setRole(profileData.role);
        } else {
          console.error('No profile data found');
        }

      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Error",
          description: "Failed to load profile information",
          variant: "destructive",
        });
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

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-8">Mon compte</h1>
        
        <Card className="max-w-2xl">
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
              <p className="mt-1 capitalize">{role || 'Chargement...'}</p>
            </div>
            
            <Button variant="destructive" onClick={handleLogout}>
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}