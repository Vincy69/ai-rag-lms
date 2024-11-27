import { useState, useEffect } from "react";
import { supabaseAdmin } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { useToast } from "@/components/ui/use-toast";

type UserRole = Database['public']['Enums']['user_role'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  created_at: string;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("*") as { data: Profile[] | null, error: Error | null };

      if (profilesError) throw profilesError;

      if (!profiles) {
        throw new Error("No profiles found");
      }

      const mergedUsers = profiles.map(profile => ({
        id: profile.id,
        firstName: profile.first_name || 'N/A',
        lastName: profile.last_name || 'N/A',
        role: profile.role,
        created_at: profile.created_at,
      }));

      setUsers(mergedUsers);
    } catch (error) {
      console.error("Error loading users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des utilisateurs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [toast]);

  return { users, isLoading, loadUsers };
}