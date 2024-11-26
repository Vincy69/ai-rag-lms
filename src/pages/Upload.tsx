import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Upload, File, X } from "lucide-react";

const ACCEPTED_FILE_TYPES = {
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "text/plain": "TXT",
};

const CATEGORIES = [
  "Documentation technique",
  "Procédures internes",
  "Rapports",
  "Autres",
];

interface UploadedFile {
  file: File;
  category: string;
  tags: string[];
}

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateFile = (file: File) => {
    if (!Object.keys(ACCEPTED_FILE_TYPES).includes(file.type)) {
      toast({
        title: "Type de fichier non supporté",
        description: `Seuls les fichiers ${Object.values(ACCEPTED_FILE_TYPES).join(", ")} sont acceptés.`,
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const validFiles = files.filter(validateFile);
    const newUploadedFiles = validFiles.map((file) => ({
      file,
      category: "",
      tags: [],
    }));
    setUploadedFiles([...uploadedFiles, ...newUploadedFiles]);
  };

  const removeFile = (index: number) => {
    const newFiles = [...uploadedFiles];
    newFiles.splice(index, 1);
    setUploadedFiles(newFiles);
  };

  const updateFileCategory = (index: number, category: string) => {
    const newFiles = [...uploadedFiles];
    newFiles[index].category = category;
    setUploadedFiles(newFiles);
  };

  const handleUpload = async () => {
    // Vérification que tous les fichiers ont une catégorie
    const hasUncategorizedFiles = uploadedFiles.some((file) => !file.category);
    if (hasUncategorizedFiles) {
      toast({
        title: "Catégorisation requise",
        description: "Veuillez assigner une catégorie à tous les documents.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Upload en cours",
        description: "Vos documents sont en cours de traitement...",
      });

      // TODO: Implémenter l'upload vers Pinecone
      console.log("Files to upload:", uploadedFiles);

      toast({
        title: "Upload réussi",
        description: "Vos documents ont été uploadés avec succès.",
      });
      
      setUploadedFiles([]);
    } catch (error) {
      toast({
        title: "Erreur lors de l'upload",
        description: "Une erreur est survenue lors de l'upload des documents.",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold">Upload de Documents</h1>
          <p className="text-muted-foreground">
            Uploadez vos documents pour enrichir la base de connaissances de votre assistant
          </p>
        </div>

        <div
          className={`glass p-8 rounded-lg border-2 border-dashed transition-colors ${
            dragActive ? "border-primary" : "border-muted"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-lg">
                Glissez-déposez vos fichiers ici ou{" "}
                <label className="text-primary hover:underline cursor-pointer">
                  parcourez
                  <Input
                    type="file"
                    className="hidden"
                    multiple
                    accept={Object.keys(ACCEPTED_FILE_TYPES).join(",")}
                    onChange={handleFileInput}
                  />
                </label>
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Formats supportés : PDF, DOCX, TXT
              </p>
            </div>
          </div>
        </div>

        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Documents à uploader</h2>
            <div className="space-y-3">
              {uploadedFiles.map((uploadedFile, index) => (
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
                      onValueChange={(value) => updateFileCategory(index, value)}
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Sélectionner une catégorie" />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORIES.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={handleUpload} className="w-full">
              Uploader les documents
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}