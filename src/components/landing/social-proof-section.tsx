
import { GlassCard } from "../ui/glass-card";

const SocialProofSection = () => {
  return (
    <section className="py-24 relative">
      {/* Gradient background effect */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-insight-blue opacity-20 blur-[120px] rounded-full" />
      </div>

      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Trusted by <span className="text-gradient">Innovative Founders</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how InsightValidator is helping founders validate their ideas and build successful products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard
            quote="InsightValidator helped me validate my SaaS idea in just 2 weeks instead of months. The AI market analysis was spot on!"
            author="Sarah Johnson"
            role="Founder, HealthTech Startup"
            delay="0.2s"
          />

          <TestimonialCard
            quote="The interview coach feature is a game-changer. I got so much better insights from my customer interviews with AI guidance."
            author="Michael Chen"
            role="Founder, EdTech Platform"
            delay="0.4s"
          />

          <TestimonialCard
            quote="Going from scattered notes to a clear MVP roadmap was seamless. InsightValidator saved me months of work and guesswork."
            author="Emma Rodriguez"
            role="Solo Founder, FinTech App"
            delay="0.6s"
          />
        </div>

        <div className="mt-20 flex flex-wrap justify-center gap-12 items-center opacity-70">
          <div className="text-2xl font-bold">TechCrunch</div>
          <div className="text-2xl font-bold">Forbes</div>
          <div className="text-2xl font-bold">Inc.</div>
          <div className="text-2xl font-bold">Startup Grind</div>
          <div className="text-2xl font-bold">Y Combinator</div>
        </div>
      </div>
    </section>
  );
};

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  delay: string;
}

const TestimonialCard = ({ quote, author, role, delay }: TestimonialCardProps) => {
  return (
    <GlassCard 
      className="p-8 animate-fade-in"
      style={{ animationDelay: delay }}
    >
      <div className="mb-6 text-3xl text-insight-blue">"</div>
      <p className="mb-6 text-muted-foreground">{quote}</p>
      <div>
        <p className="font-bold">{author}</p>
        <p className="text-sm text-muted-foreground">{role}</p>
      </div>
    </GlassCard>
  );
};

export { SocialProofSection };
