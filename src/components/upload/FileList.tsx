import { File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadedFile } from "@/types/upload";

interface FileListProps {
  files: UploadedFile[];
  onRemoveFile: (index: number) => void;
  onUpdateCategory: (index: number, category: string) => void;
}

export function FileList({ files, onRemoveFile, onUpdateCategory }: FileListProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Documents à uploader</h2>
      <div className="space-y-3">
        {files.map((uploadedFile, index) => (
          <div
            key={index}
            className="glass p-4 rounded-lg flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <File className="h-6 w-6 text-primary" />
              <span className="font-medium">{uploadedFile.file.name}</span>
            </div>
            <div className="flex items-center gap-4">
              <Select
                value={uploadedFile.category}
                onValueChange={(value) => onUpdateCategory(index, value)}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sélectionner une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Documentation technique">Documentation technique</SelectItem>
                  <SelectItem value="Procédures internes">Procédures internes</SelectItem>
                  <SelectItem value="Rapports">Rapports</SelectItem>
                  <SelectItem value="Autres">Autres</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemoveFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}