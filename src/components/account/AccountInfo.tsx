import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['user_role'];

export function AccountInfo() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      setEmail(session.user.email);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profileData) {
        setRole(profileData.role as UserRole);
      }
    };

    getProfile();
  }, []);

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
  );
}