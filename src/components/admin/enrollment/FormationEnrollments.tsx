import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEnrollmentActions } from "./useEnrollmentActions";
import { supabaseAdmin } from "@/integrations/supabase/client";
import type { User } from "@/hooks/useUsers";

interface FormationEnrollmentsProps {
  user: User;
  isLoading: boolean;
}

export function FormationEnrollments({ user, isLoading: isLoadingAction }: FormationEnrollmentsProps) {
  const { handleFormationEnrollment } = useEnrollmentActions();

  const { data: formations, isLoading } = useQuery({
    queryKey: ["formations", user.id],
    queryFn: async () => {
      const { data: formationsData, error: formationsError } = await supabaseAdmin
        .from("formations")
        .select(`
          id,
          name,
          formation_enrollments!left (
            id,
            user_id
          )
        `);

      if (formationsError) throw formationsError;
      return formationsData;
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
              disabled={isLoadingAction}
              onClick={() =>
                handleFormationEnrollment(formation.id, user.id, !isEnrolled)
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