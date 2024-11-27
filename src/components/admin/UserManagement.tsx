import { useState, useEffect } from "react";
import { supabaseAdmin } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserDialog } from "./UserDialog";
import { UserEnrollments } from "./UserEnrollments";
import { UserHistory } from "./UserHistory";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['user_role'];
type Profile = Database['public']['Tables']['profiles']['Row'];

interface User {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogType, setDialogType] = useState<"edit" | "create" | null>(null);
  const [showEnrollments, setShowEnrollments] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const { toast } = useToast();

  const loadUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from("profiles")
        .select("*") as { data: Profile[] | null, error: Error | null };

      if (profilesError) throw profilesError;

      if (!profiles) {
        throw new Error("No profiles found");
      }

      // Fetch users from auth.admin API
      const { data: authData, error: authError } = await supabaseAdmin
        .auth.admin.listUsers();

      if (authError) throw authError;

      // Merge profiles with auth users data
      const mergedUsers = profiles.map(profile => {
        const authUser = authData.users.find(u => u.id === profile.id);
        return {
          id: profile.id,
          email: authUser?.email || 'Email non disponible',
          role: profile.role,
          created_at: profile.created_at,
        };
      });

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestion des utilisateurs</h2>
        <Button onClick={() => {
          setSelectedUser(null);
          setDialogType("create");
        }}>
          Créer un utilisateur
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Date de création</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>{user.email}</TableCell>
              <TableCell className="capitalize">{user.role}</TableCell>
              <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setDialogType("edit");
                    }}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowEnrollments(true);
                    }}
                  >
                    Inscriptions
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedUser(user);
                      setShowHistory(true);
                    }}
                  >
                    Historique
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <UserDialog
        user={selectedUser}
        type={dialogType}
        open={dialogType !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDialogType(null);
            setSelectedUser(null);
          }
        }}
        onSuccess={() => {
          loadUsers();
          setDialogType(null);
          setSelectedUser(null);
        }}
      />

      <UserEnrollments
        user={selectedUser}
        open={showEnrollments}
        onOpenChange={setShowEnrollments}
      />

      <UserHistory
        user={selectedUser}
        open={showHistory}
        onOpenChange={setShowHistory}
      />
    </div>
  );
}