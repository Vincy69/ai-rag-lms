import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

export default function Documentation() {
  return (
    <Layout>
      <div className="container mx-auto py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Documentation</h1>
        
        <div className="space-y-10">
          <section className="doc-section">
            <h2 className="doc-title">Base de données Supabase</h2>
            
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
                          <li>Liée à <span className="doc-link">categories</span> via <span className="doc-link">category</span></li>
                          <li>Contient : nom, description, catégorie</li>
                        </ul>
                      </div>
                    </li>
                    <li className="doc-list-item">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="doc-link">skill_blocks</span>
                        <span className="ml-2">Blocs de compétences</span>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li>Liée à <span className="doc-link">formations</span> via <span className="doc-link">formation_id</span></li>
                          <li>Contient : nom, description, ordre</li>
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
                          <li>Liée à <span className="doc-link">skill_blocks</span> via <span className="doc-link">block_id</span></li>
                          <li>Contient : titre, description, ordre</li>
                        </ul>
                      </div>
                    </li>
                    <li className="doc-list-item">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="doc-link">lessons</span>
                        <span className="ml-2">Leçons des chapitres</span>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li>Liée à <span className="doc-link">chapters</span> via <span className="doc-link">chapter_id</span></li>
                          <li>Contient : titre, contenu, durée, ordre</li>
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
                          <li>Liée à <span className="doc-link">chapters</span> via <span className="doc-link">chapter_id</span> (optionnel)</li>
                          <li>Liée à <span className="doc-link">skill_blocks</span> via <span className="doc-link">block_id</span></li>
                        </ul>
                      </div>
                    </li>
                    <li className="doc-list-item">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="doc-link">quiz_questions</span>
                        <span className="ml-2">Questions des quiz</span>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li>Liée à <span className="doc-link">quizzes</span> via <span className="doc-link">quiz_id</span></li>
                        </ul>
                      </div>
                    </li>
                    <li className="doc-list-item">
                      <ArrowRight className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <span className="doc-link">quiz_answers</span>
                        <span className="ml-2">Réponses aux questions</span>
                        <ul className="mt-2 space-y-1.5 text-sm">
                          <li>Liée à <span className="doc-link">quiz_questions</span> via <span className="doc-link">question_id</span></li>
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