import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { ArrowRight, Database, Key } from "lucide-react";

export default function Documentation() {
  return (
    <Layout>
      <div className="container mx-auto py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Documentation</h1>
        
        <div className="space-y-10">
          <section className="doc-section">
            <h2 className="doc-title flex items-center gap-2">
              <Database className="h-6 w-6" />
              Base de données Supabase
            </h2>
            
            <div className="space-y-6">
              <Card className="doc-card">
                <h3 className="doc-subtitle">Tables principales</h3>
                <div className="prose prose-invert max-w-none">
                  <h4 className="text-foreground/90 font-medium mt-4 mb-3">Formations et Blocs</h4>
                  <ul className="doc-list">
                    <li className="doc-list-item">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="doc-link">formations</span>
                        <span className="ml-2">Table principale des formations</span>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li className="flex items-start gap-2">
                            <Key className="h-4 w-4 text-primary mt-0.5" />
                            <span className="font-medium">id</span>
                            <span className="text-muted-foreground">(uuid, PK, auto-généré)</span>
                          </li>
                          <li>• name <span className="text-muted-foreground">(text, obligatoire)</span></li>
                          <li>• description <span className="text-muted-foreground">(text, optionnel)</span></li>
                          <li>• category <span className="text-muted-foreground">(text, FK vers categories.name)</span></li>
                          <li>• created_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                          <li>• updated_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                        </ul>
                      </div>
                    </li>
                    <li className="doc-list-item">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="doc-link">skill_blocks</span>
                        <span className="ml-2">Blocs de compétences</span>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li className="flex items-start gap-2">
                            <Key className="h-4 w-4 text-primary mt-0.5" />
                            <span className="font-medium">id</span>
                            <span className="text-muted-foreground">(uuid, PK, auto-généré)</span>
                          </li>
                          <li>• formation_id <span className="text-muted-foreground">(uuid, FK vers formations.id)</span></li>
                          <li>• name <span className="text-muted-foreground">(text, obligatoire)</span></li>
                          <li>• description <span className="text-muted-foreground">(text, optionnel)</span></li>
                          <li>• order_index <span className="text-muted-foreground">(integer, obligatoire)</span></li>
                          <li>• created_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                          <li>• updated_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                        </ul>
                      </div>
                    </li>
                  </ul>

                  <h4 className="text-foreground/90 font-medium mt-6 mb-3">Structure pédagogique</h4>
                  <ul className="doc-list">
                    <li className="doc-list-item">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="doc-link">chapters</span>
                        <span className="ml-2">Chapitres des blocs</span>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li className="flex items-start gap-2">
                            <Key className="h-4 w-4 text-primary mt-0.5" />
                            <span className="font-medium">id</span>
                            <span className="text-muted-foreground">(uuid, PK, auto-généré)</span>
                          </li>
                          <li>• block_id <span className="text-muted-foreground">(uuid, FK vers skill_blocks.id)</span></li>
                          <li>• title <span className="text-muted-foreground">(text, obligatoire)</span></li>
                          <li>• description <span className="text-muted-foreground">(text, optionnel)</span></li>
                          <li>• order_index <span className="text-muted-foreground">(integer, obligatoire)</span></li>
                          <li>• created_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                          <li>• updated_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                        </ul>
                      </div>
                    </li>
                    <li className="doc-list-item">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="doc-link">lessons</span>
                        <span className="ml-2">Leçons des chapitres</span>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li className="flex items-start gap-2">
                            <Key className="h-4 w-4 text-primary mt-0.5" />
                            <span className="font-medium">id</span>
                            <span className="text-muted-foreground">(uuid, PK, auto-généré)</span>
                          </li>
                          <li>• chapter_id <span className="text-muted-foreground">(uuid, FK vers chapters.id)</span></li>
                          <li>• title <span className="text-muted-foreground">(text, obligatoire)</span></li>
                          <li>• content <span className="text-muted-foreground">(text, obligatoire)</span></li>
                          <li>• duration <span className="text-muted-foreground">(integer, optionnel, en minutes)</span></li>
                          <li>• order_index <span className="text-muted-foreground">(integer, obligatoire)</span></li>
                          <li>• created_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                          <li>• updated_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                        </ul>
                      </div>
                    </li>
                  </ul>

                  <h4 className="text-foreground/90 font-medium mt-6 mb-3">Évaluation et Quiz</h4>
                  <ul className="doc-list">
                    <li className="doc-list-item">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="doc-link">quizzes</span>
                        <span className="ml-2">Quiz (chapitre ou bloc)</span>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li className="flex items-start gap-2">
                            <Key className="h-4 w-4 text-primary mt-0.5" />
                            <span className="font-medium">id</span>
                            <span className="text-muted-foreground">(uuid, PK, auto-généré)</span>
                          </li>
                          <li>• block_id <span className="text-muted-foreground">(uuid, FK vers skill_blocks.id)</span></li>
                          <li>• chapter_id <span className="text-muted-foreground">(uuid, FK vers chapters.id, optionnel)</span></li>
                          <li>• title <span className="text-muted-foreground">(text, obligatoire)</span></li>
                          <li>• description <span className="text-muted-foreground">(text, optionnel)</span></li>
                          <li>• quiz_type <span className="text-muted-foreground">(text, obligatoire)</span></li>
                          <li>• created_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                          <li>• updated_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                        </ul>
                      </div>
                    </li>
                    <li className="doc-list-item">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="doc-link">quiz_questions</span>
                        <span className="ml-2">Questions des quiz</span>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li className="flex items-start gap-2">
                            <Key className="h-4 w-4 text-primary mt-0.5" />
                            <span className="font-medium">id</span>
                            <span className="text-muted-foreground">(uuid, PK, auto-généré)</span>
                          </li>
                          <li>• quiz_id <span className="text-muted-foreground">(uuid, FK vers quizzes.id)</span></li>
                          <li>• question <span className="text-muted-foreground">(text, obligatoire)</span></li>
                          <li>• explanation <span className="text-muted-foreground">(text, optionnel)</span></li>
                          <li>• order_index <span className="text-muted-foreground">(integer, obligatoire)</span></li>
                          <li>• created_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                        </ul>
                      </div>
                    </li>
                    <li className="doc-list-item">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="doc-link">quiz_answers</span>
                        <span className="ml-2">Réponses aux questions</span>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li className="flex items-start gap-2">
                            <Key className="h-4 w-4 text-primary mt-0.5" />
                            <span className="font-medium">id</span>
                            <span className="text-muted-foreground">(uuid, PK, auto-généré)</span>
                          </li>
                          <li>• question_id <span className="text-muted-foreground">(uuid, FK vers quiz_questions.id)</span></li>
                          <li>• answer <span className="text-muted-foreground">(text, obligatoire)</span></li>
                          <li>• is_correct <span className="text-muted-foreground">(boolean, obligatoire)</span></li>
                          <li>• explanation <span className="text-muted-foreground">(text, obligatoire)</span></li>
                          <li>• order_index <span className="text-muted-foreground">(integer, obligatoire)</span></li>
                          <li>• created_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                        </ul>
                      </div>
                    </li>
                  </ul>

                  <h4 className="text-foreground/90 font-medium mt-6 mb-3">Suivi des utilisateurs</h4>
                  <ul className="doc-list">
                    <li className="doc-list-item">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="doc-link">profiles</span>
                        <span className="ml-2">Profils utilisateurs</span>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li className="flex items-start gap-2">
                            <Key className="h-4 w-4 text-primary mt-0.5" />
                            <span className="font-medium">id</span>
                            <span className="text-muted-foreground">(uuid, PK, FK vers auth.users.id)</span>
                          </li>
                          <li>• first_name <span className="text-muted-foreground">(text, optionnel)</span></li>
                          <li>• last_name <span className="text-muted-foreground">(text, optionnel)</span></li>
                          <li>• role <span className="text-muted-foreground">(enum: student, teacher, manager, admin)</span></li>
                          <li>• created_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                        </ul>
                      </div>
                    </li>
                    <li className="doc-list-item">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="doc-link">formation_enrollments</span>
                        <span className="ml-2">Inscriptions aux formations</span>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li className="flex items-start gap-2">
                            <Key className="h-4 w-4 text-primary mt-0.5" />
                            <span className="font-medium">id</span>
                            <span className="text-muted-foreground">(uuid, PK, auto-généré)</span>
                          </li>
                          <li>• user_id <span className="text-muted-foreground">(uuid, FK vers profiles.id)</span></li>
                          <li>• formation_id <span className="text-muted-foreground">(uuid, FK vers formations.id)</span></li>
                          <li>• status <span className="text-muted-foreground">(text, défaut: 'in_progress')</span></li>
                          <li>• progress <span className="text-muted-foreground">(float, optionnel)</span></li>
                          <li>• enrolled_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                          <li>• completed_at <span className="text-muted-foreground">(timestamp, optionnel)</span></li>
                        </ul>
                      </div>
                    </li>
                    <li className="doc-list-item">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="doc-link">block_enrollments</span>
                        <span className="ml-2">Inscriptions aux blocs</span>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li className="flex items-start gap-2">
                            <Key className="h-4 w-4 text-primary mt-0.5" />
                            <span className="font-medium">id</span>
                            <span className="text-muted-foreground">(uuid, PK, auto-généré)</span>
                          </li>
                          <li>• user_id <span className="text-muted-foreground">(uuid, FK vers profiles.id)</span></li>
                          <li>• block_id <span className="text-muted-foreground">(uuid, FK vers skill_blocks.id)</span></li>
                          <li>• status <span className="text-muted-foreground">(text, défaut: 'in_progress')</span></li>
                          <li>• progress <span className="text-muted-foreground">(float, optionnel)</span></li>
                          <li>• enrolled_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                          <li>• completed_at <span className="text-muted-foreground">(timestamp, optionnel)</span></li>
                        </ul>
                      </div>
                    </li>
                    <li className="doc-list-item">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="doc-link">lesson_progress</span>
                        <span className="ml-2">Progression des leçons</span>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li className="flex items-start gap-2">
                            <Key className="h-4 w-4 text-primary mt-0.5" />
                            <span className="font-medium">id</span>
                            <span className="text-muted-foreground">(uuid, PK, auto-généré)</span>
                          </li>
                          <li>• user_id <span className="text-muted-foreground">(uuid, FK vers profiles.id)</span></li>
                          <li>• lesson_id <span className="text-muted-foreground">(uuid, FK vers lessons.id)</span></li>
                          <li>• chapter_id <span className="text-muted-foreground">(uuid, FK vers chapters.id)</span></li>
                          <li>• block_id <span className="text-muted-foreground">(uuid, FK vers skill_blocks.id)</span></li>
                          <li>• is_completed <span className="text-muted-foreground">(boolean, défaut: false)</span></li>
                          <li>• completed_at <span className="text-muted-foreground">(timestamp, optionnel)</span></li>
                          <li>• created_at <span className="text-muted-foreground">(timestamp, auto)</span></li>
                        </ul>
                      </div>
                    </li>
                  </ul>
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
        </div>
      </div>
    </Layout>
  );
}