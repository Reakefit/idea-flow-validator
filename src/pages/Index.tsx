
import { Navbar } from "@/components/navigation/navbar";
import { HeroSection } from "@/components/landing/hero-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { SocialProofSection } from "@/components/landing/social-proof-section";
import { Footer } from "@/components/landing/footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-insight-dark text-foreground">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SocialProofSection />
      <Footer />
    </div>
  );
};

export default Index;
