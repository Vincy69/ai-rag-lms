import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EnrollmentTabs } from "./EnrollmentTabs";
import { useEnrollmentActions } from "./useEnrollmentActions";
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
  const { isLoading } = useEnrollmentActions();

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Gestion des inscriptions de {user.firstName} {user.lastName}
          </DialogTitle>
        </DialogHeader>

        <EnrollmentTabs user={user} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
}