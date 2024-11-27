import { useState } from "react";
import { Loader2, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserDialog } from "./UserDialog";
import { UserHistory } from "./UserHistory";
import { UserEnrollmentManager } from "./enrollment/UserEnrollmentManager";
import { UsersTable } from "./UsersTable";
import { useUsers } from "@/hooks/useUsers";
import type { User } from "@/hooks/useUsers";

export function UserManagement() {
  const { users, isLoading, loadUsers } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogType, setDialogType] = useState<"edit" | "create" | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [showEnrollmentManager, setShowEnrollmentManager] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Gestion des utilisateurs</h2>
        <Button onClick={() => {
          setSelectedUser(null);
          setDialogType("create");
        }}>
          <UserPlus className="h-4 w-4 mr-2" />
          Créer un utilisateur
        </Button>
      </div>

      <UsersTable 
        users={users}
        onEdit={(user) => {
          setSelectedUser(user);
          setDialogType("edit");
        }}
        onShowHistory={(user) => {
          setSelectedUser(user);
          setShowHistory(true);
        }}
        onManageEnrollments={(user) => {
          setSelectedUser(user);
          setShowEnrollmentManager(true);
        }}
      />

      <UserDialog
        user={selectedUser}
        type={dialogType}
        open={dialogType !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDialogType(null);
            setSelectedUser(null);
          }
        }}
        onSuccess={() => {
          loadUsers();
          setDialogType(null);
          setSelectedUser(null);
        }}
      />

      <UserHistory
        user={selectedUser}
        open={showHistory}
        onOpenChange={setShowHistory}
      />

      <UserEnrollmentManager
        user={selectedUser}
        open={showEnrollmentManager}
        onOpenChange={setShowEnrollmentManager}
      />
    </div>
  );
}