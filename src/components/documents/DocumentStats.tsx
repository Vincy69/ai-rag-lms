import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { FileText, HardDrive, Network } from "lucide-react";
import { formatBytes } from "@/lib/utils";

export function DocumentStats() {
  const { data: stats } = useQuery({
    queryKey: ["document-stats"],
    queryFn: async () => {
      const { data: documents, error } = await supabase
        .from("documents")
        .select("size, pinecone_id");

      if (error) throw error;

      const totalSize = documents.reduce((acc, doc) => acc + doc.size, 0);
      // Count only documents that have a non-null pinecone_id
      const totalVectors = documents.filter(doc => doc.pinecone_id !== null).length;
      const totalDocuments = documents.length;

      return {
        totalSize,
        totalVectors,
        totalDocuments,
      };
    },
  });

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card className="p-4 flex items-center space-x-4">
        <FileText className="h-8 w-8 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">Documents</p>
          <p className="text-2xl font-bold">{stats?.totalDocuments ?? 0}</p>
        </div>
      </Card>
      <Card className="p-4 flex items-center space-x-4">
        <HardDrive className="h-8 w-8 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">Taille totale</p>
          <p className="text-2xl font-bold">{stats ? formatBytes(stats.totalSize) : '0 B'}</p>
        </div>
      </Card>
      <Card className="p-4 flex items-center space-x-4">
        <Network className="h-8 w-8 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">Vecteurs</p>
          <p className="text-2xl font-bold">{stats?.totalVectors ?? 0}</p>
        </div>
      </Card>
    </div>
  );
}