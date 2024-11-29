import { Card } from "@/components/ui/card";
import { Database, ArrowRight } from "lucide-react";
import { TableSection } from "./TableSection";

const mainTables = [
  {
    name: "formations",
    description: "Table principale des formations",
    columns: [
      { name: "name", type: "text", required: true },
      { name: "description", type: "text" },
      { name: "category", type: "text", required: true, description: "FK vers categories.name" },
      { name: "created_at", type: "timestamp", required: true, description: "auto" },
      { name: "updated_at", type: "timestamp", required: true, description: "auto" }
    ]
  },
  {
    name: "skill_blocks",
    description: "Blocs de compétences",
    columns: [
      { name: "formation_id", type: "uuid", required: true, description: "FK vers formations.id" },
      { name: "name", type: "text", required: true },
      { name: "description", type: "text" },
      { name: "order_index", type: "integer", required: true },
      { name: "created_at", type: "timestamp", required: true, description: "auto" },
      { name: "updated_at", type: "timestamp", required: true, description: "auto" }
    ]
  }
];

const structureTables = [
  {
    name: "chapters",
    description: "Chapitres des blocs",
    columns: [
      { name: "block_id", type: "uuid", required: true, description: "FK vers skill_blocks.id" },
      { name: "title", type: "text", required: true },
      { name: "description", type: "text" },
      { name: "order_index", type: "integer", required: true },
      { name: "created_at", type: "timestamp", required: true, description: "auto" },
      { name: "updated_at", type: "timestamp", required: true, description: "auto" }
    ]
  },
  {
    name: "lessons",
    description: "Leçons des chapitres",
    columns: [
      { name: "chapter_id", type: "uuid", required: true, description: "FK vers chapters.id" },
      { name: "title", type: "text", required: true },
      { name: "content", type: "text", required: true },
      { name: "duration", type: "integer", description: "en minutes" },
      { name: "order_index", type: "integer", required: true },
      { name: "created_at", type: "timestamp", required: true, description: "auto" },
      { name: "updated_at", type: "timestamp", required: true, description: "auto" }
    ]
  }
];

const userTrackingTables = [
  {
    name: "formation_enrollments",
    description: "Inscriptions aux formations",
    columns: [
      { name: "user_id", type: "uuid", required: true, description: "FK vers profiles.id" },
      { name: "formation_id", type: "uuid", required: true, description: "FK vers formations.id" },
      { name: "status", type: "text", required: true, description: "défaut: 'in_progress'" },
      { name: "progress", type: "float" },
      { name: "enrolled_at", type: "timestamp", required: true, description: "auto" },
      { name: "completed_at", type: "timestamp" },
      { name: "last_accessed", type: "timestamp", description: "dernière interaction" }
    ]
  },
  {
    name: "block_enrollments",
    description: "Inscriptions aux blocs",
    columns: [
      { name: "user_id", type: "uuid", required: true, description: "FK vers profiles.id" },
      { name: "block_id", type: "uuid", required: true, description: "FK vers skill_blocks.id" },
      { name: "status", type: "text", required: true, description: "défaut: 'in_progress'" },
      { name: "progress", type: "float" },
      { name: "enrolled_at", type: "timestamp", required: true, description: "auto" },
      { name: "completed_at", type: "timestamp" },
      { name: "last_accessed", type: "timestamp", description: "dernière interaction" }
    ]
  },
  {
    name: "lesson_progress",
    description: "Progression des leçons",
    columns: [
      { name: "user_id", type: "uuid", required: true, description: "FK vers profiles.id" },
      { name: "lesson_id", type: "uuid", required: true, description: "FK vers lessons.id" },
      { name: "chapter_id", type: "uuid", required: true, description: "FK vers chapters.id" },
      { name: "block_id", type: "uuid", required: true, description: "FK vers skill_blocks.id" },
      { name: "is_completed", type: "boolean", description: "défaut: false" },
      { name: "completed_at", type: "timestamp" },
      { name: "last_accessed", type: "timestamp", description: "dernière interaction" }
    ]
  }
];

export function DatabaseSection() {
  return (
    <section className="doc-section" id="database">
      <h2 className="doc-title flex items-center gap-2">
        <Database className="h-6 w-6" />
        Base de données Supabase
      </h2>
      
      <div className="space-y-6">
        <Card className="doc-card">
          <h3 className="doc-subtitle">Tables principales</h3>
          <div className="prose prose-invert max-w-none">
            <TableSection title="Formations et Blocs" tables={mainTables} />
            <TableSection title="Structure pédagogique" tables={structureTables} />
            <TableSection title="Suivi des utilisateurs" tables={userTrackingTables} />
          </div>
        </Card>

        <Card className="doc-card">
          <h3 className="doc-subtitle">Relations clés</h3>
          <div className="prose prose-invert max-w-none">
            <ul className="space-y-2 text-foreground/80">
              <li>• Une formation contient plusieurs blocs de compétences</li>
              <li>• Un bloc contient plusieurs chapitres</li>
              <li>• Un chapitre contient plusieurs leçons</li>
              <li>• Les quiz peuvent être attachés à un chapitre ou à un bloc</li>
              <li>• Les utilisateurs peuvent s'inscrire à plusieurs formations</li>
              <li>• La progression est suivie au niveau des leçons et des quiz</li>
            </ul>
          </div>
        </Card>
      </div>
    </section>
  );
}