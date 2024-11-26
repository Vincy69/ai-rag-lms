import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: { id: string; name: string; category: string } | null;
  onDocumentChange: (field: string, value: string) => void;
  onSave: () => void;
  categories?: { name: string }[];
}

export function EditDocumentDialog({
  open,
  onOpenChange,
  document,
  onDocumentChange,
  onSave,
  categories,
}: EditDocumentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le document</DialogTitle>
          <DialogDescription>
            Modifiez les informations du document
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Nom
            </label>
            <Input
              id="name"
              value={document?.name ?? ""}
              onChange={(e) => onDocumentChange("name", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="category" className="text-sm font-medium">
              Catégorie
            </label>
            <Select
              value={document?.category}
              onValueChange={(value) => onDocumentChange("category", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une catégorie" />
              </SelectTrigger>
              <SelectContent>
                {categories?.map((cat) => (
                  <SelectItem key={cat.name} value={cat.name}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={onSave}>Enregistrer</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}