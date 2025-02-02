import { File, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadedFile } from "@/types/upload";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface FileListProps {
  files: UploadedFile[];
  onRemoveFile: (index: number) => void;
  onUpdateCategory: (index: number, category: string) => void;
}

export function FileList({ files, onRemoveFile, onUpdateCategory }: FileListProps) {
  // Fetch categories from Supabase
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("name")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

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
                  {categories?.map((category) => (
                    <SelectItem key={category.name} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
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