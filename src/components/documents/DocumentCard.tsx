import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Trash2, Edit2, Eye, FileCode, FileJson, Book, File } from "lucide-react";
import { Document } from "@/types/document";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { formatBytes } from "@/lib/utils";

interface DocumentCardProps {
  document: Document;
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const getDocumentIcon = (contentType: string) => {
  switch (contentType) {
    case "application/pdf":
      return <FileText className="h-8 w-8 text-primary" />;
    case "text/plain":
      return <File className="h-8 w-8 text-primary" />;
    case "application/json":
      return <FileJson className="h-8 w-8 text-primary" />;
    case "application/msword":
    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      return <Book className="h-8 w-8 text-primary" />;
    default:
      return <FileCode className="h-8 w-8 text-primary" />;
  }
};

export function DocumentCard({ document, onView, onEdit, onDelete }: DocumentCardProps) {
  return (
    <Card className="glass p-4 space-y-4">
      <div className="flex items-center gap-3">
        {getDocumentIcon(document.content_type)}
        <div className="flex-1">
          <h3 className="font-semibold">{document.name}</h3>
          <p className="text-sm text-muted-foreground">{document.category}</p>
          <p className="text-sm text-muted-foreground">{formatBytes(document.size)}</p>
          <div className="text-xs text-muted-foreground mt-1 space-y-1">
            <p>Créé le {format(new Date(document.created_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
            <p>Dernière modification le {format(new Date(document.updated_at), "dd MMMM yyyy 'à' HH:mm", { locale: fr })}</p>
          </div>
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