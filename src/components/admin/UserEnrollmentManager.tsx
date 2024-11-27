import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { supabaseAdmin } from "@/integrations/supabase/client";
import type { User } from "@/hooks/useUsers";

interface UserEnrollmentManagerProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserEnrollmentManager({
  user,
  open,
  onOpenChange,
}: UserEnrollmentManagerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch formations
  const { data: formations, isLoading: isLoadingFormations } = useQuery({
    queryKey: ["formations"],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from("formations")
        .select(`
          id,
          name,
          formation_enrollments!inner (
            id,
            user_id
          )
        `);

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  // Fetch blocks
  const { data: blocks, isLoading: isLoadingBlocks } = useQuery({
    queryKey: ["blocks"],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from("skill_blocks")
        .select(`
          id,
          name,
          formation_id,
          block_enrollments!inner (
            id,
            user_id
          )
        `);

      if (error) throw error;
      return data;
    },
    enabled: open,
  });

  const handleFormationEnrollment = async (formationId: string, enroll: boolean) => {
    if (!user) return;

    try {
      setIsLoading(true);

      if (enroll) {
        const { error } = await supabaseAdmin
          .from("formation_enrollments")
          .insert({
            formation_id: formationId,
            user_id: user.id,
          });

        if (error) throw error;

        toast({
          title: "Succès",
          description: "L'utilisateur a été inscrit à la formation",
        });
      } else {
        const { error } = await supabaseAdmin
          .from("formation_enrollments")
          .delete()
          .eq("formation_id", formationId)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "L'utilisateur a été désinscrit de la formation",
        });
      }
    } catch (error) {
      console.error("Error managing formation enrollment:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockEnrollment = async (blockId: string, enroll: boolean) => {
    if (!user) return;

    try {
      setIsLoading(true);

      if (enroll) {
        const { error } = await supabaseAdmin
          .from("block_enrollments")
          .insert({
            block_id: blockId,
            user_id: user.id,
          });

        if (error) throw error;

        toast({
          title: "Succès",
          description: "L'utilisateur a été inscrit au bloc",
        });
      } else {
        const { error } = await supabaseAdmin
          .from("block_enrollments")
          .delete()
          .eq("block_id", blockId)
          .eq("user_id", user.id);

        if (error) throw error;

        toast({
          title: "Succès",
          description: "L'utilisateur a été désinscrit du bloc",
        });
      }
    } catch (error) {
      console.error("Error managing block enrollment:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Gestion des inscriptions de {user.firstName} {user.lastName}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="formations">
          <TabsList>
            <TabsTrigger value="formations">Formations</TabsTrigger>
            <TabsTrigger value="blocks">Blocs</TabsTrigger>
          </TabsList>

          <TabsContent value="formations" className="space-y-4">
            {isLoadingFormations ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {formations?.map((formation) => {
                  const isEnrolled = formation.formation_enrollments.some(
                    (enrollment) => enrollment.user_id === user.id
                  );

                  return (
                    <div
                      key={formation.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <span>{formation.name}</span>
                      <Button
                        variant={isEnrolled ? "destructive" : "default"}
                        disabled={isLoading}
                        onClick={() =>
                          handleFormationEnrollment(formation.id, !isEnrolled)
                        }
                      >
                        {isLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isEnrolled ? "Désinscrire" : "Inscrire"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="blocks" className="space-y-4">
            {isLoadingBlocks ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {blocks?.map((block) => {
                  const isEnrolled = block.block_enrollments.some(
                    (enrollment) => enrollment.user_id === user.id
                  );

                  return (
                    <div
                      key={block.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <span>{block.name}</span>
                      <Button
                        variant={isEnrolled ? "destructive" : "default"}
                        disabled={isLoading}
                        onClick={() =>
                          handleBlockEnrollment(block.id, !isEnrolled)
                        }
                      >
                        {isLoading && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {isEnrolled ? "Désinscrire" : "Inscrire"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}