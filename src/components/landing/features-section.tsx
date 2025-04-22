
import { GlassCard } from "../ui/glass-card";

const FeaturesSection = () => {
  return (
    <section className="py-24 relative">
      {/* Gradient background effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-insight-indigo opacity-20 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">Features</span> That Empower Founders
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI-powered platform provides all the tools you need to validate your idea
            and build a successful product.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            title="AI Market Analysis"
            description="Get deep insights into market size, trends, and opportunities using advanced AI algorithms."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10"></line>
                <line x1="12" y1="20" x2="12" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="14"></line>
                <line x1="2" y1="20" x2="22" y2="20"></line>
              </svg>
            }
            delay="0.2s"
          />

          <FeatureCard
            title="Competitor Analysis"
            description="Automatically discover and analyze competitors to identify gaps and opportunities."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
              </svg>
            }
            delay="0.4s"
          />

          <FeatureCard
            title="Customer Persona Generator"
            description="Create detailed customer personas based on market research and interview data."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            }
            delay="0.6s"
          />

          <FeatureCard
            title="AI Interview Coach"
            description="Get real-time guidance during customer interviews to ask the right questions."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            }
            delay="0.8s"
          />

          <FeatureCard
            title="Insight Consolidation"
            description="Automatically consolidate and analyze insights from multiple interviews."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            }
            delay="1s"
          />

          <FeatureCard
            title="MVP Roadmap Builder"
            description="Create a prioritized roadmap for your MVP based on validated insights."
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            }
            delay="1.2s"
          />
        </div>
      </div>
    </section>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  delay: string;
}

const FeatureCard = ({ title, description, icon, delay }: FeatureCardProps) => {
  return (
    <GlassCard 
      className="p-8 animate-fade-in"
      style={{ animationDelay: delay }}
    >
      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
        <span className="text-white">{icon}</span>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </GlassCard>
  );
};

export { FeaturesSection };
