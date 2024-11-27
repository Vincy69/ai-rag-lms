import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserSelectorProps {
  selectedUserId: string | null;
  onUserChange: (userId: string | null) => void;
}

export function UserSelector({ selectedUserId, onUserChange }: UserSelectorProps) {
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, role");

      if (error) throw error;
      return profiles;
    },
  });

  return (
    <Select
      value={selectedUserId || "all"}
      onValueChange={(value) => onUserChange(value === "all" ? null : value)}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Sélectionner un utilisateur" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Tous les utilisateurs</SelectItem>
        {users?.map((user) => (
          <SelectItem key={user.id} value={user.id}>
            Utilisateur {user.id.slice(0, 8)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}