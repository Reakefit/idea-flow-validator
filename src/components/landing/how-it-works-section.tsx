
import { GlassCard } from "../ui/glass-card";

const HowItWorksSection = () => {
  return (
    <section className="py-24 relative">
      {/* Gradient background effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-insight-pink opacity-20 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            <span className="text-gradient">How It Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From idea to validated MVP in four simple steps
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <StepCard
            number="1"
            title="Define Your Problem"
            description="Chat with our AI to clearly articulate the problem you're solving and your initial hypotheses."
            delay="0.2s"
          />

          <StepCard
            number="2"
            title="AI Market Analysis"
            description="Our AI agents analyze market size, competitors, and customer pain points to validate your idea."
            delay="0.4s"
          />

          <StepCard
            number="3"
            title="Interview Customers"
            description="Schedule and conduct interviews with our AI coach to gather valuable feedback and insights."
            delay="0.6s"
          />

          <StepCard
            number="4"
            title="Build MVP Roadmap"
            description="Review consolidated insights and build a prioritized MVP roadmap to launch your product."
            delay="0.8s"
          />
        </div>

        <div className="mt-20 text-center">
          <GlassCard className="inline-block p-8 max-w-2xl animate-fade-in">
            <h3 className="text-2xl font-bold mb-4">Ready to validate your idea?</h3>
            <p className="text-muted-foreground mb-6">
              Get started today and turn your idea into a validated opportunity.
            </p>
            <a href="/chat" className="inline-block bg-gradient-primary hover:opacity-90 transition-opacity text-white font-medium px-6 py-3 rounded-lg">
              Start for Free
            </a>
          </GlassCard>
        </div>
      </div>
    </section>
  );
};

interface StepCardProps {
  number: string;
  title: string;
  description: string;
  delay: string;
}

const StepCard = ({ number, title, description, delay }: StepCardProps) => {
  return (
    <GlassCard 
      className="p-8 text-center relative animate-fade-in"
      style={{ animationDelay: delay }}
    >
      <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
        <span className="text-white font-bold">{number}</span>
      </div>
      <h3 className="text-xl font-bold mt-4 mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </GlassCard>
  );
};

export { HowItWorksSection };
