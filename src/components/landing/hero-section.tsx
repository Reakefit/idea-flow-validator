
import { GradientButton } from "../ui/gradient-button";
import { GlassCard } from "../ui/glass-card";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative pt-32 pb-24 overflow-hidden">
      {/* Gradient background effects */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-insight-blue opacity-20 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-insight-purple opacity-20 blur-[120px] rounded-full" />
      </div>

      {/* Floating elements */}
      <div className="absolute top-1/4 right-1/3 w-24 h-24 glass-card rounded-xl animate-float" />
      <div className="absolute bottom-1/4 left-1/3 w-16 h-16 glass-card rounded-xl animate-float" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 right-1/4 w-20 h-20 glass-card rounded-xl animate-float" style={{ animationDelay: "3s" }} />

      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Transform Ideas into Validated 
            <span className="text-gradient"> Opportunities</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
            All-in-one AI-powered platform that helps founders validate ideas, 
            conduct market research, and build product roadmaps - all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link to="/chat">
              <GradientButton size="lg">
                Start Validating
              </GradientButton>
            </Link>
            <Link to="/demo">
              <GradientButton size="lg" variant="secondary">
                Watch Demo
              </GradientButton>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <GlassCard className="text-center p-8 animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path>
                  <line x1="2" y1="20" x2="2" y2="20"></line>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Articulate</h3>
              <p className="text-muted-foreground">Define your problem clearly through AI-guided conversations</p>
            </GlassCard>

            <GlassCard className="text-center p-8 animate-fade-in" style={{ animationDelay: "0.4s" }}>
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Analyze</h3>
              <p className="text-muted-foreground">Get deep AI-powered market analysis and competitor insights</p>
            </GlassCard>

            <GlassCard className="text-center p-8 animate-fade-in" style={{ animationDelay: "0.6s" }}>
              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Validate</h3>
              <p className="text-muted-foreground">Schedule interviews and capture insights with AI assistance</p>
            </GlassCard>
          </div>
        </div>
      </div>
    </section>
  );
};

export { HeroSection };
