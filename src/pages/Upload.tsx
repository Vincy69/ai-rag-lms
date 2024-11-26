import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { UploadZone } from "@/components/upload/UploadZone";
import { FileList } from "@/components/upload/FileList";
import { UploadedFile } from "@/types/upload";
import { supabase } from "@/integrations/supabase/client";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export default function UploadPage() {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale autorisée est de 5MB.",
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

  const processFile = async (uploadedFile: UploadedFile) => {
    const blob = new Blob([await uploadedFile.file.arrayBuffer()], { 
      type: uploadedFile.file.type 
    });
    
    const { data, error } = await supabase.functions.invoke('process-document', {
      body: {
        file: {
          name: uploadedFile.file.name,
          type: uploadedFile.file.type,
          size: uploadedFile.file.size,
          data: await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          })
        },
        category: uploadedFile.category
      }
    });

    if (error) {
      throw new Error(`Erreur lors du traitement de ${uploadedFile.file.name}: ${error.message}`);
    }

    return data;
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

    setIsUploading(true);
    setUploadProgress(0);

    try {
      toast({
        title: "Upload en cours",
        description: "Vos documents sont en cours de traitement...",
      });

      const totalFiles = uploadedFiles.length;
      let processedFiles = 0;
      const batchSize = 2; // Process 2 files at a time

      // Process files in batches
      for (let i = 0; i < uploadedFiles.length; i += batchSize) {
        const batch = uploadedFiles.slice(i, i + batchSize);
        await Promise.all(batch.map(processFile));
        
        processedFiles += batch.length;
        setUploadProgress((processedFiles / totalFiles) * 100);
      }

      toast({
        title: "Upload réussi",
        description: "Vos documents ont été uploadés et traités avec succès.",
      });
      
      navigate("/documents");
    } catch (error) {
      toast({
        title: "Erreur lors de l'upload",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'upload des documents.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      setUploadedFiles([]);
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
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-sm text-muted-foreground text-center">
                  Upload en cours... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
            <Button 
              onClick={handleUpload} 
              className="w-full"
              disabled={isUploading}
            >
              {isUploading ? "Upload en cours..." : "Uploader les documents"}
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}