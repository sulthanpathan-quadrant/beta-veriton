import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Database, BarChart3, Sparkles } from "lucide-react";
import workflowDiagram from "@/assets/workflow-diagram.png";
import networkGraph from "@/assets/network-graph.png";

const LearnMore = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />

      {/* Hero Banner */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--hero-gradient-start))] to-[hsl(var(--hero-gradient-end))]"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-32 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl lg:text-6xl font-bold mb-6">
              Unlock the Full Potential of Your Data
            </h1>
            <p className="text-xl text-muted-foreground">
              Dive deep into the advanced capabilities of our platform. Discover how advanced data
              orchestration, intelligent modeling, and customizable outputs can transform your data
              strategy.
            </p>
          </div>
        </div>
      </section>

      {/* Advanced Data Orchestration */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl font-bold mb-6">Advanced Data Orchestration</h2>
            <p className="text-muted-foreground mb-8">
              Go beyond simple data ingestion. Our platform offers a complete user orchestration
              engine that intelligently manages your entire data workflow. From complex
              dependencies to streamlined processing, automate every step with precision and
              reliability. Reduce manual overhead and ensure your data flows exactly where it needs
              to, precisely when it's needed.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Robust Connectors:</h3>
                  <p className="text-sm text-muted-foreground">
                    Seamlessly integrate with dozens of data sources, from cloud warehouses to
                    on-premise databases and third-party APIs.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Visual Workflow Builder:</h3>
                  <p className="text-sm text-muted-foreground">
                    Design, schedule, and monitor complex data pipelines with an intuitive drag-and-drop
                    interface. No coding required.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Real-time Monitoring:</h3>
                  <p className="text-sm text-muted-foreground">
                    Gain full visibility into your data pipelines with live monitoring, logging, and
                    automated alerting.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-teal-900/50 to-teal-950/50 rounded-xl p-8 flex items-center justify-center min-h-[400px]">
            <img 
              src={workflowDiagram} 
              alt="Workflow Diagram" 
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </section>

      {/* Intelligent Data Modeling */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 bg-gradient-to-br from-teal-900/50 to-teal-950/50 rounded-xl p-8 flex items-center justify-center min-h-[400px]">
            <img 
              src={networkGraph} 
              alt="Network Graph" 
              className="w-full h-auto rounded-lg"
            />
          </div>

          <div className="order-1 lg:order-2">
            <h2 className="text-4xl font-bold mb-6">Intelligent Data Modeling</h2>
            <p className="text-muted-foreground mb-8">
              Our platform doesn't just store data; it understands it. Leverage our AI-powered
              modeling engine to automatically detect schemas, uncover hidden relationships between
              tables and fields, and build comprehensive data models that accelerate analysis and
              reporting, eliminating weeks of manual effort.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Automated Schema Detection:</h3>
                  <p className="text-sm text-muted-foreground">
                    Ingest data and let the platform infer the optimal schema and data
                    types automatically.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">AI-Powered Relationship Discovery:</h3>
                  <p className="text-sm text-muted-foreground">
                    Uncover hidden correlations between tables and fields to build a
                    comprehensive data model.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Data Lineage & Impact Analysis:</h3>
                  <p className="text-sm text-muted-foreground">
                    Track data transformations from source to destination and understand the impact
                    of any changes.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Choose Your Output */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">Choose Your Output</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your processed data, ready for any destination. Select how you want to use your
            analysis-ready data, whether for traditional BI, no-code analysis, or advanced machine
            learning applications.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="bg-card border border-card-border rounded-xl p-8 hover:bg-card-hover transition-colors text-center">
            <Database className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">ETL Output</h3>
            <p className="text-muted-foreground">
              Generate standardized tables ready for analysis in any data warehouse.
            </p>
          </div>

          <div className="bg-card border-2 border-primary rounded-xl p-8 relative text-center">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
              Popular
            </div>
            <BarChart3 className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Power BI Dashboard</h3>
            <p className="text-muted-foreground">
              Auto-generate interactive dashboards with KPIs for instant insights.
            </p>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-8 hover:bg-card-hover transition-colors text-center">
            <Sparkles className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Auto AI/ML</h3>
            <p className="text-muted-foreground">
              Build predictive models with automated machine learning pipelines.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-4xl mx-auto bg-card border border-card-border rounded-2xl p-12 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-primary/20 rounded-full mx-auto flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-primary" />
            </div>
          </div>
          <blockquote className="text-xl lg:text-2xl italic mb-8 text-foreground">
            "This platform has fundamentally changed how we approach data. What used to take our team
            of engineers weeks now takes a single analyst a few hours. The intelligent modeling is a
            game-changer, and it has allowed us to focus on generating insights, not just managing
            data pipelines."
          </blockquote>
          <div>
            <p className="font-semibold text-lg">Jane Doe</p>
            <p className="text-muted-foreground">Head of Analytics, Tech Solutions Inc.</p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Data?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Join leading teams who are building faster, more resilient data pipelines. Start your free
            trial today and experience the future of data automation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8">
              Request a Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LearnMore;
