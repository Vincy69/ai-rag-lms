import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

interface UserDialogProps {
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
  type: "edit" | "create" | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function UserDialog({
  user,
  type,
  open,
  onOpenChange,
  onSuccess,
}: UserDialogProps) {
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(user?.role || "student");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (type === "create") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              role,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (!data.user) throw new Error("No user returned from signup");

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ role })
          .eq("id", data.user.id);

        if (profileError) throw profileError;

      } else if (type === "edit" && user) {
        if (password) {
          const { error: passwordError } = await supabase.auth.admin.updateUserById(
            user.id,
            { password }
          );
          if (passwordError) throw passwordError;
        }

        const { error: profileError } = await supabase
          .from("profiles")
          .update({ role })
          .eq("id", user.id);

        if (profileError) throw profileError;
      }

      toast({
        title: "Succès",
        description: type === "create" ? "Utilisateur créé" : "Utilisateur modifié",
      });
      onSuccess();
    } catch (error) {
      console.error("Error managing user:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "create" ? "Créer un utilisateur" : "Modifier l'utilisateur"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={type === "edit"}
              required={type === "create"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              {type === "create" ? "Mot de passe" : "Nouveau mot de passe (optionnel)"}
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required={type === "create"}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Rôle</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="student">Étudiant</SelectItem>
                <SelectItem value="teacher">Professeur</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <div className="animate-spin">⌛</div>
              ) : type === "create" ? (
                "Créer"
              ) : (
                "Modifier"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}