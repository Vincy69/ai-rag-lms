import { DocumentStats } from "./DocumentStats";

export function DocumentsHeader() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-left">
        <h1 className="text-4xl font-bold">Gestion des Documents</h1>
        <p className="text-muted-foreground">
          Visualisez, modifiez et organisez vos documents
        </p>
      </div>
      <DocumentStats />
    </div>
  );
}