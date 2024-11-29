import { Card } from "@/components/ui/card";
import { Award, BookOpen, GraduationCap, Trophy } from "lucide-react";

export function QuizProgressSection() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold" id="quiz-progression">Quiz & Progression</h2>

      <div className="space-y-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Types de Quiz
          </h3>
          <div className="space-y-4">
            <p>Il existe deux types de quiz dans l'application :</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Quiz de Chapitre</strong> : Évalue la compréhension du contenu d'un chapitre spécifique.
                Si réussi (score ≥ 70%), toutes les leçons du chapitre sont automatiquement marquées comme complétées.
              </li>
              <li>
                <strong>Quiz de Bloc</strong> : Évalue la maîtrise globale d'un bloc de compétences.
                Doit être réussi (score ≥ 70%) pour valider le bloc.
              </li>
            </ul>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Calcul des Progressions
          </h3>
          <div className="space-y-4">
            <h4 className="font-medium">Progression d'un Chapitre</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Sans quiz de chapitre : % de leçons complétées</li>
              <li>Avec quiz de chapitre : 
                <ul className="list-disc pl-6 mt-2">
                  <li>75% : Progression des leçons</li>
                  <li>25% : Quiz de chapitre (validé si score ≥ 70%)</li>
                </ul>
              </li>
            </ul>

            <h4 className="font-medium mt-6">Progression d'un Bloc</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>80% : Moyenne des progressions des chapitres</li>
              <li>20% : Quiz de bloc (validé si score ≥ 70%)</li>
            </ul>

            <h4 className="font-medium mt-6">Progression d'une Formation</h4>
            <ul className="list-disc pl-6 space-y-2">
              <li>Moyenne des progressions de tous les blocs de la formation</li>
              <li>Un bloc est considéré comme complété quand :
                <ul className="list-disc pl-6 mt-2">
                  <li>Tous ses chapitres sont complétés</li>
                  <li>Le quiz de bloc est réussi (si présent)</li>
                </ul>
              </li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}