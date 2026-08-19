import { CheckCircle } from "lucide-react";
import dataOrchestration from "@/assets/data-orchestration.jpg";
import dataModeling from "@/assets/data-modeling.jpg";

const capabilities = [
  {
    title: "Advanced Data Orchestration",
    description: "Go beyond simple data ingestion. Our platform offers a strategic orchestration engine that intelligently manages your entire data workflow. From complex dependencies to streamlined processing, automate every step with precision and reliability. Reduce manual overhead and ensure your data flows directly where it needs to, when it needs to.",
    image: dataOrchestration,
    features: [
      {
        title: "Robust Connectors",
        description: "Seamlessly integrate with multiple data sources, from cloud warehouses to on-premises databases and third-party APIs.",
      },
      {
        title: "Visual Workflow Builder",
        description: "Design, schedule, and monitor complex data pipelines with an intuitive drag-and-drop interface. No coding required.",
      },
      {
        title: "Real-time Monitoring",
        description: "Gain full visibility into your data pipelines with live monitoring, logging, and automated alerting.",
      },
    ],
  },
  {
    title: "Intelligent Data Modeling",
    description: "Our platform doesn't just store data; it understands it. Leverage our AI-powered modeling engine to automatically discover entities, detect relationships, and infer the optimal schema and data patterns within your datasets. Generate optimized, business-ready data models that accelerate analysis and reporting, eliminating weeks of manual effort.",
    image: dataModeling,
    features: [
      {
        title: "Automated Schema Detection",
        description: "Ingest data and let AI automatically detect the optimal schema and data types, ensuring accuracy.",
      },
      {
        title: "AI-Powered Relationship Discovery",
        description: "Uncover hidden correlations between tables and fields to build a comprehensive data model.",
      },
      {
        title: "Data Lineage & Impact Analysis",
        description: "Track data transformations from source to destination and understand the impact of any changes.",
      },
    ],
  },
];

const ProcessSection = () => {
  return (
    <section id="process" className="py-20 bg-section-bg">
      <div className="container mx-auto px-4">
        {capabilities.map((capability, capIndex) => (
          <div
            key={capIndex}
            className={`mb-20 last:mb-0 ${capIndex % 2 === 0 ? '' : 'bg-card/30 -mx-4 px-4 py-12 rounded-2xl'}`}
          >
            <div className="max-w-6xl mx-auto">
              <div className="grid md:grid-cols-2 gap-12 items-center">
                <div className={`order-2 ${capIndex % 2 === 0 ? 'md:order-1' : 'md:order-2'}`}>
                  <h2 className="text-3xl md:text-4xl font-bold mb-6 animate-fade-in">
                    {capability.title}
                  </h2>
                  <p className="text-lg text-muted-foreground mb-8 animate-fade-in">
                    {capability.description}
                  </p>
                  <div className="space-y-6">
                    {capability.features.map((feature, featureIndex) => (
                      <div
                        key={featureIndex}
                        className="flex gap-4 animate-slide-up"
                        style={{ animationDelay: `${featureIndex * 0.1}s` }}
                      >
                        <CheckCircle className="flex-shrink-0 text-primary mt-1" size={24} />
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                          <p className="text-muted-foreground">{feature.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className={`order-1 ${capIndex % 2 === 0 ? 'md:order-2' : 'md:order-1'}`}>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-border/50 shadow-2xl animate-fade-in">
                    <img 
                      src={capability.image} 
                      alt={capability.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProcessSection;
