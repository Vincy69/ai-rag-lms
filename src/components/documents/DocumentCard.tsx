import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Edit2, Eye } from "lucide-react";
import { Document } from "@/types/document";

interface DocumentCardProps {
  document: Document;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function DocumentCard({ document, onView, onEdit, onDelete }: DocumentCardProps) {
  return (
    <Card className="glass p-4 space-y-4">
      <div className="flex items-center gap-3">
        <FileText className="h-8 w-8 text-primary" />
        <div className="flex-1">
          <h3 className="font-semibold">{document.name}</h3>
          <p className="text-sm text-muted-foreground">{document.category}</p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={() => onView(document.id)}>
          <Eye className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit(document.id)}>
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onDelete(document.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </Card>
  );
}