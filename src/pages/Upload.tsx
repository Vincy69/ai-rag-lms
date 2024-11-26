import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { UploadZone } from "@/components/upload/UploadZone";
import { FileList } from "@/components/upload/FileList";
import { UploadedFile } from "@/types/upload";

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const { toast } = useToast();

  const validateFile = (file: File) => {
    const acceptedTypes = [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!acceptedTypes.includes(file.type)) {
      toast({
        title: "Type de fichier non supporté",
        description: "Seuls les fichiers PDF, TXT, DOC et DOCX sont acceptés.",
        variant: "destructive",
      });
      return false;
    }
    return true;
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

      for (const uploadedFile of uploadedFiles) {
        const formData = new FormData();
        formData.append('file', uploadedFile.file);
        formData.append('category', uploadedFile.category);

        const response = await fetch('/functions/process-document', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Erreur lors du traitement de ${uploadedFile.file.name}`);
        }
      }

      toast({
        title: "Upload réussi",
        description: "Vos documents ont été uploadés et traités avec succès.",
      });
      
      setUploadedFiles([]);
    } catch (error) {
      toast({
        title: "Erreur lors de l'upload",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'upload des documents.",
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

        <UploadZone
          onFilesSelected={handleFiles}
          dragActive={dragActive}
        />

        {uploadedFiles.length > 0 && (
          <div className="space-y-4">
            <FileList
              files={uploadedFiles}
              onRemoveFile={removeFile}
              onUpdateCategory={updateFileCategory}
            />
            <Button onClick={handleUpload} className="w-full">
              Uploader les documents
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}