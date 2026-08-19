import { Card } from "@/components/ui/card";
import { Rocket, Shield, Zap, TrendingUp } from "lucide-react";

const benefits = [
  {
    icon: Rocket,
    title: "10x Faster",
    description: "Reduce data pipeline development from months to minutes with automated modeling and validation.",
    stat: "90% Time Saved",
  },
  {
    icon: Shield,
    title: "Enterprise-Grade Security",
    description: "Built on Azure infrastructure with role-based access, encryption, and compliance certifications.",
    stat: "SOC 2 Compliant",
  },
  {
    icon: Zap,
    title: "Zero Code Required",
    description: "Intuitive UI and AI assistant handle complex data operations without writing a single line of code.",
    stat: "No Coding",
  },
  {
    icon: TrendingUp,
    title: "Scalable to Millions",
    description: "From prototype to production, handle billions of records with automatic scaling and optimization.",
    stat: "1B+ Records",
  },
];

const BenefitsSection = () => {
  return (
    <section id="benefits" className="py-20 bg-feature-bg" >
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Why Our Platform?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover the powerful features that set us apart from the competition and help you make data-driven decisions faster than ever before
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={index}
                className="group p-6 hover:shadow-xl hover:shadow-primary/20 transition-all duration-500 hover:scale-105 animate-slide-up bg-card/80 backdrop-blur border-2 hover:border-primary/50 relative overflow-hidden"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-hero-from to-hero-to flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-500 shadow-lg">
                      <Icon className="text-white" size={26} />
                    </div>
                    <div className="text-xl font-bold bg-gradient-to-r from-hero-from to-hero-to bg-clip-text text-transparent">{benefit.stat}</div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 group-hover:text-foreground transition-colors duration-300">{benefit.description}</p>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
