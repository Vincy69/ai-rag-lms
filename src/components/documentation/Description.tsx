import { Card } from "@/components/ui/card";

export function Description() {
  return (
    <section className="doc-section">
      <h2 className="doc-title">Description</h2>
      <Card className="doc-card">
        <div className="prose prose-invert max-w-none">
          <p className="doc-text">
            Cette application est une plateforme d'apprentissage complète qui permet aux utilisateurs de suivre des formations, 
            d'accéder à des ressources documentaires, et de suivre leur progression à travers différents modules et quiz.
          </p>
          
          <h3 className="doc-subtitle mt-6">Fonctionnalités principales</h3>
          <ul className="doc-list">
            <li className="doc-list-item">
              <span>• Gestion des formations et des parcours d'apprentissage</span>
            </li>
            <li className="doc-list-item">
              <span>• Suivi de progression personnalisé</span>
            </li>
            <li className="doc-list-item">
              <span>• Système de quiz et d'évaluation</span>
            </li>
            <li className="doc-list-item">
              <span>• Base documentaire intelligente avec recherche</span>
            </li>
            <li className="doc-list-item">
              <span>• Interface d'administration complète</span>
            </li>
          </ul>
        </div>
      </Card>
    </section>
  );
}