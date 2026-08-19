import { useNavigate } from "react-router-dom";
import { Database, LineChart, Cog, CheckCircle, Users, Zap, BarChart3, GitBranch, Bot } from "lucide-react";
import { Card } from "@/components/ui/card";
 
 
const features = [
  {
    icon: Database,
    title: "Multi-Source Data Ingestion",
    description: "Connect to S3, Azure Blob, Snowflake, SAP, OneLake, Delta tables, and databases. Select multiple files and tables with schema preview.",
  },
  {
    icon: GitBranch,
    title: "Automated Data Modeling",
    description: "Conceptual → Logical → Physical model generation with entity discovery, relationships, and interactive ER diagrams. Download all outputs as CSV.",
  },
  {
    icon: CheckCircle,
    title: "Data Quality Rules",
    description: "AI automatically creates smart validation rules and runs deep quality checks to guarantee accurate, complete, and consistent data.",
  },
  {
    icon: Users,
    title: "Named Entity Resolution",
    description: "Advanced AI identifies, standardizes, and merges entity references across datasets to create clean, unified, duplicate-free profiles.",
  },
  {
    icon: Cog,
    title: "Business Logic Generation",
    description: "Seamlessly implement custom business rules and domain-specific logic tailored to your unique processes and compliance needs.",
  },
  {
    icon: LineChart,
    title: "ETL Pipeline",
    description: "Generate Fact & Dimension tables with denormalized views. Export SQL scripts and table definitions.",
  },
  {
    icon: BarChart3,
    title: "Power BI Integration",
    description: "Auto-generated dashboards with KPIs, trend charts, and exportable datasets for Power BI.",
  },
  {
    icon: Bot,
    title: "Auto AI/ML",
    description: "Automated model training, performance tracking, and conversational AI assistant for data analysis with chat-based CSV uploads.",
  },
];
 
const FeaturesSection = () => {
    const navigate = useNavigate();
  return (
    <section id="features" className="py-20 bg-feature-bg">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            One Platform, Infinite Possibilities
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover how Veritas AI empowers your team with a suite of powerful tools for every step of your data journey
          </p>
        </div>
 
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.slice(0, 6).map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
              onClick={() => navigate("/auth")}
                key={index}
                className="group p-6 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 hover:scale-105 animate-slide-up bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50 hover:bg-gradient-to-br hover:from-card hover:to-primary/5"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-hero-from to-hero-to flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-primary/50">
                  <Icon className="text-white" size={26} />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">{feature.description}</p>
              </Card>
            );
          })}
        </div>
       
        {/* Last two cards centered */}
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto mt-6">
          {features.slice(6).map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card
                key={index + 6}
                className="group p-6 hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 hover:-translate-y-2 hover:scale-105 animate-slide-up bg-card/50 backdrop-blur-sm border-2 hover:border-primary/50 hover:bg-gradient-to-br hover:from-card hover:to-primary/5"
                style={{ animationDelay: `${(index + 6) * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-hero-from to-hero-to flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-lg group-hover:shadow-primary/50">
                  <Icon className="text-white" size={26} />
                </div>
                 
                <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">{feature.title}</h3>
                <p className="text-muted-foreground group-hover:text-foreground transition-colors duration-300">{feature.description}</p>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
 
export default FeaturesSection;
 
 