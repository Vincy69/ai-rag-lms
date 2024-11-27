import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { User } from "@/hooks/useUsers";

interface UsersTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onShowEnrollments: (user: User) => void;
  onShowHistory: (user: User) => void;
}

export function UsersTable({ 
  users, 
  onEdit, 
  onShowEnrollments, 
  onShowHistory 
}: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Email</TableHead>
          <TableHead>Rôle</TableHead>
          <TableHead>Date de création</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>{user.email}</TableCell>
            <TableCell className="capitalize">{user.role}</TableCell>
            <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
            <TableCell>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(user)}
                >
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShowEnrollments(user)}
                >
                  Inscriptions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onShowHistory(user)}
                >
                  Historique
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}