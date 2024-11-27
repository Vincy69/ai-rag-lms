import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { supabaseAdmin } from "@/integrations/supabase/client";
import type { User } from "@/hooks/useUsers";

const formSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  role: z.enum(["student", "teacher", "manager", "admin"]),
});

interface UserDialogProps {
  user: User | null;
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
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      role: user?.role || "student",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);

      if (type === "create") {
        // For new users, we'll generate a UUID
        const { data: newUser, error: createError } = await supabaseAdmin
          .from("profiles")
          .insert({
            id: crypto.randomUUID(),
            first_name: values.firstName,
            last_name: values.lastName,
            role: values.role,
          })
          .select()
          .single();

        if (createError) throw createError;

        toast({
          title: "Succès",
          description: "L'utilisateur a été créé avec succès",
        });
      } else if (type === "edit" && user) {
        const { error: updateError } = await supabaseAdmin
          .from("profiles")
          .update({
            first_name: values.firstName,
            last_name: values.lastName,
            role: values.role,
          })
          .eq("id", user.id);

        if (updateError) throw updateError;

        toast({
          title: "Succès",
          description: "L'utilisateur a été modifié avec succès",
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {type === "create" ? "Créer un utilisateur" : "Modifier l'utilisateur"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="student">Étudiant</SelectItem>
                      <SelectItem value="teacher">Professeur</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="admin">Administrateur</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {type === "create" ? "Créer" : "Modifier"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}