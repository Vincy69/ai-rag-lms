import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FormationSelectorProps {
  onFormationSelect: (formationId: string) => void;
  selectedFormationId: string | null;
}

export function FormationSelector({ onFormationSelect, selectedFormationId }: FormationSelectorProps) {
  const { data: formations, isLoading } = useQuery({
    queryKey: ["formations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("formations")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Chargement des formations...</div>;
  }

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Formation</label>
      <Select
        value={selectedFormationId || undefined}
        onValueChange={onFormationSelect}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionnez une formation" />
        </SelectTrigger>
        <SelectContent>
          {formations?.map((formation) => (
            <SelectItem key={formation.id} value={formation.id}>
              {formation.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}