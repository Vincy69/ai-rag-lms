import { useState } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  dragActive: boolean;
}

export function UploadZone({ onFilesSelected, dragActive }: UploadZoneProps) {
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    onFilesSelected(files);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    onFilesSelected(files);
  };

  return (
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
                accept=".pdf,.txt,.doc,.docx"
                onChange={handleFileInput}
              />
            </label>
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Formats supportés : PDF, TXT, DOC, DOCX
          </p>
        </div>
      </div>
    </div>
  );
}