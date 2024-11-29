import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnrollmentActions } from "./useEnrollmentActions";
import { supabaseAdmin } from "@/integrations/supabase/client";
import type { User } from "@/hooks/useUsers";

interface BlockEnrollmentsProps {
  user: User;
  isLoading: boolean;
}

export function BlockEnrollments({ user, isLoading: isLoadingAction }: BlockEnrollmentsProps) {
  const { handleBlockEnrollment } = useEnrollmentActions();

  const { data: blocks, isLoading } = useQuery({
    queryKey: ["blocks", user.id],
    queryFn: async () => {
      const { data, error } = await supabaseAdmin
        .from("skill_blocks")
        .select(`
          id,
          name,
          block_enrollments!left (
            id,
            user_id
          )
        `);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
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
              disabled={isLoadingAction}
              onClick={() =>
                handleBlockEnrollment(block.id, user.id, !isEnrolled)
              }
            >
              {isLoadingAction && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEnrolled ? "Désinscrire" : "Inscrire"}
            </Button>
          </div>
        );
      })}
    </div>
  );
}