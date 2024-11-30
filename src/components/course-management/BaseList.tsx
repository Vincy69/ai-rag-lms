import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface BaseListProps<T> {
  title: string;
  items: T[];
  isLoading: boolean;
  columns: {
    header: string;
    accessor: keyof T;
  }[];
  onAdd: () => void;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void;
}

export function BaseList<T extends { id: string }>({
  title,
  items,
  isLoading,
  columns,
  onAdd,
  onEdit,
  onDelete,
}: BaseListProps<T>) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Ajouter
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.accessor)}>{column.header}</TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                {columns.map((column) => (
                  <TableCell key={`${item.id}-${String(column.accessor)}`}>
                    {String(item[column.accessor])}
                  </TableCell>
                ))}
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => onEdit(item)}>
                    Modifier
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => onDelete(item)}>
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}