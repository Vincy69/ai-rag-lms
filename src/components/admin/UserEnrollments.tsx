import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus } from "lucide-react";

interface UserEnrollmentsProps {
  user: {
    id: string;
    email: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Formation {
  id: string;
  name: string;
}

interface Block {
  id: string;
  name: string;
  formation_id: string;
}

interface Enrollment {
  formation_id: string;
  formation_name: string;
  progress: number;
  status: string;
  blocks: {
    id: string;
    name: string;
    progress: number;
    status: string;
  }[];
}

export function UserEnrollments({
  user,
  open,
  onOpenChange,
}: UserEnrollmentsProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formations, setFormations] = useState<Formation[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedFormation, setSelectedFormation] = useState<string>("");
  const [selectedBlock, setSelectedBlock] = useState<string>("");
  const { toast } = useToast();

  const loadEnrollments = async () => {
    if (!user) return;

    try {
      // Fetch formation enrollments
      const { data: formationEnrollments, error: formationError } = await supabase
        .from("formation_enrollments")
        .select(`
          formation_id,
          formations (
            name
          ),
          progress,
          status
        `)
        .eq("user_id", user.id);

      if (formationError) throw formationError;

      // Fetch block enrollments
      const { data: blockEnrollments, error: blockError } = await supabase
        .from("block_enrollments")
        .select(`
          block_id,
          skill_blocks (
            id,
            name,
            formation_id
          ),
          progress,
          status
        `)
        .eq("user_id", user.id);

      if (blockError) throw blockError;

      // Organize data
      const organized = formationEnrollments.map((fe) => ({
        formation_id: fe.formation_id,
        formation_name: fe.formations?.name || "Formation inconnue",
        progress: fe.progress || 0,
        status: fe.status,
        blocks: blockEnrollments
          .filter(
            (be) =>
              be.skill_blocks?.formation_id === fe.formation_id
          )
          .map((be) => ({
            id: be.skill_blocks?.id || "",
            name: be.skill_blocks?.name || "Bloc inconnu",
            progress: be.progress || 0,
            status: be.status,
          })),
      }));

      setEnrollments(organized);
    } catch (error) {
      console.error("Error loading enrollments:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les inscriptions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadFormationsAndBlocks = async () => {
    try {
      const { data: formationsData, error: formationsError } = await supabase
        .from("formations")
        .select("id, name");

      if (formationsError) throw formationsError;
      setFormations(formationsData);

      const { data: blocksData, error: blocksError } = await supabase
        .from("skill_blocks")
        .select("id, name, formation_id");

      if (blocksError) throw blocksError;
      setBlocks(blocksData);
    } catch (error) {
      console.error("Error loading formations and blocks:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les formations et blocs",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (open && user) {
      loadEnrollments();
      loadFormationsAndBlocks();
    }
  }, [open, user]);

  const handleEnroll = async () => {
    if (!user || (!selectedFormation && !selectedBlock)) return;

    try {
      if (selectedFormation) {
        const { error } = await supabase.from("formation_enrollments").insert({
          user_id: user.id,
          formation_id: selectedFormation,
        });

        if (error) throw error;
      }

      if (selectedBlock) {
        const { error } = await supabase.from("block_enrollments").insert({
          user_id: user.id,
          block_id: selectedBlock,
        });

        if (error) throw error;
      }

      toast({
        title: "Succès",
        description: "Inscription effectuée",
      });

      setSelectedFormation("");
      setSelectedBlock("");
      loadEnrollments();
    } catch (error) {
      console.error("Error enrolling:", error);
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer l'inscription",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Inscriptions de {user.email}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Nouvelle inscription</h3>
              <div className="flex gap-4">
                <Select
                  value={selectedFormation}
                  onValueChange={setSelectedFormation}
                >
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Formation" />
                  </SelectTrigger>
                  <SelectContent>
                    {formations.map((formation) => (
                      <SelectItem key={formation.id} value={formation.id}>
                        {formation.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedBlock} onValueChange={setSelectedBlock}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Bloc" />
                  </SelectTrigger>
                  <SelectContent>
                    {blocks
                      .filter(
                        (block) =>
                          !selectedFormation ||
                          block.formation_id === selectedFormation
                      )
                      .map((block) => (
                        <SelectItem key={block.id} value={block.id}>
                          {block.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleEnroll}
                  disabled={!selectedFormation && !selectedBlock}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Inscrire
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.formation_id}
                  className="border rounded-lg p-4 space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{enrollment.formation_name}</h4>
                      <span className="text-sm text-muted-foreground capitalize">
                        {enrollment.status}
                      </span>
                    </div>
                    <Progress value={enrollment.progress} className="h-2" />
                  </div>

                  {enrollment.blocks.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="text-sm font-medium">Blocs inscrits</h5>
                      <div className="grid gap-2">
                        {enrollment.blocks.map((block) => (
                          <div
                            key={block.id}
                            className="bg-secondary/50 rounded-lg p-3 space-y-2"
                          >
                            <div className="flex justify-between items-center">
                              <span className="text-sm">{block.name}</span>
                              <span className="text-sm text-muted-foreground capitalize">
                                {block.status}
                              </span>
                            </div>
                            <Progress value={block.progress} className="h-1.5" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {enrollments.length === 0 && (
                <p className="text-center text-muted-foreground">
                  Aucune inscription
                </p>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}