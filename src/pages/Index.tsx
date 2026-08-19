import LandingHeader from "@/components/LandingHeader";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import ProcessSection from "@/components/ProcessSection";
import BenefitsSection from "@/components/BenefitsSection";
import CTASection from "@/components/CTASection";
import LandingFooter from "@/components/LandingFooter";

const Index = () => {
  return (
    <div className="min-h-screen">
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <ProcessSection />
      <BenefitsSection />
      <CTASection />
      <LandingFooter />
    </div>
  );
};

export default Index;
