import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabaseAdmin } from "@/integrations/supabase/client";
import type { User } from "@/hooks/useUsers";

interface UserEnrollmentsProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Enrollment {
  id: string;
  formation_name: string;
  status: string;
  progress: number;
  enrolled_at: string;
  completed_at: string | null;
}

export function UserEnrollments({
  user,
  open,
  onOpenChange,
}: UserEnrollmentsProps) {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user && open) {
      loadEnrollments();
    }
  }, [user, open]);

  const loadEnrollments = async () => {
    try {
      const { data, error } = await supabaseAdmin
        .from("formation_enrollments")
        .select(`
          id,
          status,
          progress,
          enrolled_at,
          completed_at,
          formations (
            name
          )
        `)
        .eq("user_id", user?.id);

      if (error) throw error;

      setEnrollments(
        (data || []).map((enrollment) => ({
          id: enrollment.id,
          formation_name: enrollment.formations?.name || "N/A",
          status: enrollment.status,
          progress: enrollment.progress || 0,
          enrolled_at: enrollment.enrolled_at,
          completed_at: enrollment.completed_at,
        }))
      );
    } catch (error) {
      console.error("Error loading enrollments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Inscriptions de {user?.firstName} {user?.lastName}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Formation</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Date de complétion</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {enrollments.map((enrollment) => (
                <TableRow key={enrollment.id}>
                  <TableCell>{enrollment.formation_name}</TableCell>
                  <TableCell className="capitalize">
                    {enrollment.status}
                  </TableCell>
                  <TableCell>{Math.round(enrollment.progress)}%</TableCell>
                  <TableCell>
                    {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {enrollment.completed_at
                      ? new Date(enrollment.completed_at).toLocaleDateString()
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}