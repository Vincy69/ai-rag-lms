import Layout from "@/components/Layout";
import { Card } from "@/components/ui/card";

export default function Documentation() {
  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">Documentation</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold mb-4">Base de données Supabase</h2>
            
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Tables principales</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <h4>Formations et Blocs</h4>
                  <ul>
                    <li><strong>formations</strong> : Table principale des formations
                      <ul>
                        <li>Liée à <code>categories</code> via <code>category</code></li>
                        <li>Contient : nom, description, catégorie</li>
                      </ul>
                    </li>
                    <li><strong>skill_blocks</strong> : Blocs de compétences
                      <ul>
                        <li>Liée à <code>formations</code> via <code>formation_id</code></li>
                        <li>Contient : nom, description, ordre</li>
                      </ul>
                    </li>
                  </ul>

                  <h4>Structure pédagogique</h4>
                  <ul>
                    <li><strong>chapters</strong> : Chapitres des blocs
                      <ul>
                        <li>Liée à <code>skill_blocks</code> via <code>block_id</code></li>
                        <li>Contient : titre, description, ordre</li>
                      </ul>
                    </li>
                    <li><strong>lessons</strong> : Leçons des chapitres
                      <ul>
                        <li>Liée à <code>chapters</code> via <code>chapter_id</code></li>
                        <li>Contient : titre, contenu, durée, ordre</li>
                      </ul>
                    </li>
                  </ul>

                  <h4>Évaluation et Quiz</h4>
                  <ul>
                    <li><strong>quizzes</strong> : Quiz (chapitre ou bloc)
                      <ul>
                        <li>Liée à <code>chapters</code> via <code>chapter_id</code> (optionnel)</li>
                        <li>Liée à <code>skill_blocks</code> via <code>block_id</code></li>
                      </ul>
                    </li>
                    <li><strong>quiz_questions</strong> : Questions des quiz
                      <ul>
                        <li>Liée à <code>quizzes</code> via <code>quiz_id</code></li>
                      </ul>
                    </li>
                    <li><strong>quiz_answers</strong> : Réponses aux questions
                      <ul>
                        <li>Liée à <code>quiz_questions</code> via <code>question_id</code></li>
                      </ul>
                    </li>
                  </ul>

                  <h4>Suivi des utilisateurs</h4>
                  <ul>
                    <li><strong>profiles</strong> : Profils utilisateurs
                      <ul>
                        <li>Liée à <code>auth.users</code> via <code>id</code></li>
                        <li>Contient : rôle, nom, prénom</li>
                      </ul>
                    </li>
                    <li><strong>formation_enrollments</strong> : Inscriptions aux formations
                      <ul>
                        <li>Liée à <code>profiles</code> via <code>user_id</code></li>
                        <li>Liée à <code>formations</code> via <code>formation_id</code></li>
                      </ul>
                    </li>
                    <li><strong>block_enrollments</strong> : Inscriptions aux blocs
                      <ul>
                        <li>Liée à <code>profiles</code> via <code>user_id</code></li>
                        <li>Liée à <code>skill_blocks</code> via <code>block_id</code></li>
                      </ul>
                    </li>
                    <li><strong>lesson_progress</strong> : Progression dans les leçons
                      <ul>
                        <li>Liée à <code>profiles</code> via <code>user_id</code></li>
                        <li>Liée à <code>lessons</code> via <code>lesson_id</code></li>
                      </ul>
                    </li>
                    <li><strong>quiz_attempts</strong> : Tentatives de quiz
                      <ul>
                        <li>Liée à <code>profiles</code> via <code>user_id</code></li>
                        <li>Liée à <code>quizzes</code> via <code>quiz_id</code></li>
                      </ul>
                    </li>
                  </ul>

                  <h4>Gestion documentaire</h4>
                  <ul>
                    <li><strong>categories</strong> : Catégories de documents
                      <ul>
                        <li>Utilisée par <code>documents</code> et <code>formations</code></li>
                      </ul>
                    </li>
                    <li><strong>documents</strong> : Documents
                      <ul>
                        <li>Liée à <code>categories</code> via <code>category</code></li>
                      </ul>
                    </li>
                  </ul>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Relations clés</h3>
                <div className="prose dark:prose-invert max-w-none">
                  <ul>
                    <li>Une formation contient plusieurs blocs de compétences</li>
                    <li>Un bloc contient plusieurs chapitres</li>
                    <li>Un chapitre contient plusieurs leçons</li>
                    <li>Les quiz peuvent être attachés à un chapitre ou à un bloc</li>
                    <li>Les utilisateurs peuvent s'inscrire à plusieurs formations</li>
                    <li>La progression est suivie au niveau des leçons et des quiz</li>
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