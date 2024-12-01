import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { BlockList } from "./blocks/BlockList";

interface FormationContentProps {
  formationId: string;
}

export function FormationContent({ formationId }: FormationContentProps) {
  const { data: blocks, isLoading } = useQuery({
    queryKey: ["formation-blocks", formationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("skill_blocks")
        .select(`
          *,
          chapters (
            *,
            lessons (
              *,
              order_index
            ),
            quizzes (
              *
            ),
            order_index
          )
        `)
        .eq("formation_id", formationId)
        .order("order_index");

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return <BlockList blocks={blocks || []} formationId={formationId} />;
}