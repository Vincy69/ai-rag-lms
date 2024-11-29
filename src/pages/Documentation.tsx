import Layout from "@/components/Layout";
import { NavigationMenu } from "@/components/documentation/NavigationMenu";
import { Description } from "@/components/documentation/Description";
import { DatabaseSection } from "@/components/documentation/DatabaseSection";
import { QuizProgressSection } from "@/components/documentation/QuizProgressSection";

export default function Documentation() {
  return (
    <Layout>
      <div className="container mx-auto py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 text-foreground">Documentation</h1>
        
        <div className="grid grid-cols-12 gap-8">
          {/* Navigation sidebar */}
          <div className="col-span-3">
            <NavigationMenu />
          </div>
          
          {/* Content area */}
          <div className="col-span-9 space-y-12">
            <div id="description">
              <Description />
            </div>
            
            <div id="quiz-progression">
              <QuizProgressSection />
            </div>

            <div id="database">
              <DatabaseSection />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}