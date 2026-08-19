import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Settings, 
  BarChart3, 
  TestTube2, 
  Zap, 
  Brain, 
  TrendingUp,
  Target,
  Users,
  TriangleAlert,
  Clock,
  ArrowRight,
  Sparkles,
  Shield,
  Rocket
} from 'lucide-react';
import { Button } from '@/components/ui/button';
// import Footer from '@/components/FooterAIML';
import { Footer } from '@/components/Footer';

const modelLibrary = [
  {
    name: 'Classification',
    icon: Target,
    color: 'primary',
    description: 'Predict categorical outcomes with high accuracy',
    algorithms: ['Logistic Regression', 'Random Forest', 'XGBoost', 'LightGBM']
  },
  {
    name: 'Regression',
    icon: TrendingUp,
    color: 'accent',
    description: 'Forecast continuous values and trends',
    algorithms: ['ElasticNet', 'RF Regressor', 'LightGBM Regressor']
  },
  {
    name: 'Time-Series',
    icon: Clock,
    color: 'warm',
    description: 'Predict future values based on patterns',
    algorithms: ['Prophet', 'ARIMA', 'LSTM']
  },
  {
    name: 'Clustering',
    icon: Users,
    color: 'primary',
    description: 'Group similar data points automatically',
    algorithms: ['K-Means', 'DBSCAN', 'Hierarchical']
  },
  {
    name: 'NLP Models',
    icon: Brain,
    color: 'accent',
    description: 'Process and understand natural language',
    algorithms: ['BERT', 'DistilBERT', 'Transformers']
  },
  {
    name: 'Anomaly Detection',
    icon: TriangleAlert,
    color: 'warm',
    description: 'Identify outliers and unusual patterns',
    algorithms: ['Isolation Forest', 'One-Class SVM']
  }
];

const Index = () => {
  const navigate = useNavigate();

  const handleFeatureClick = (feature: string) => {
    localStorage.setItem('pendingFeature', feature);
    navigate('/auth');
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getIconContainerClass = (color: string) => {
    switch (color) {
      case 'accent':
        return 'icon-container-accent';
      case 'warm':
        return 'icon-container-warm';
      default:
        return 'icon-container';
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-x-hidden">
      {/* Background image */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 opacity-20"
        style={{
          backgroundImage: "url('/aivolve-bg.svg')", // put this file in /public or adjust path
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />

      {/* Fixed subtle header (always visible on scroll) */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-muted/90 backdrop-blur-xl border-b border-border/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-foreground">AIvolve</span>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/auth')}
              className="text-muted-foreground hover:text-foreground"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/auth')}
              className="btn-premium text-sm"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Main content padded so it doesn't go under the fixed header */}
      <main className="pt-16">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 hero-mesh overflow-x-hidden">
          <div className="orb orb-primary w-96 h-96 -top-48 -left-48" style={{ animationDelay: '0s' }} />
          <div className="orb orb-accent w-80 h-80 top-20 right-0" style={{ animationDelay: '2s' }} />
          <div className="orb orb-warm w-64 h-64 bottom-0 left-1/3" style={{ animationDelay: '4s' }} />
          
          <div className="max-w-6xl mx-auto px-6 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8"
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">AI-Powered Machine Learning Platform</span>
              </motion.div>
              
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-[1.1]">
                Build, Compare & Test
                <br />
                <span className="text-gradient-primary">ML Models</span> Effortlessly
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
                The complete platform for machine learning automation. Train models, compare algorithms, and deploy predictions — all without writing code.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button 
                  size="lg" 
                  onClick={scrollToFeatures}
                  className="btn-premium px-8 py-6 text-base gap-2"
                >
                  Explore Features
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>

              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap items-center justify-center gap-6 md:gap-8 mt-12 text-sm text-muted-foreground"
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>Enterprise Security</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>10x Faster Training</span>
                </div>
                <div className="flex items-center gap-2">
                  <Rocket className="w-4 h-4 text-sky-500" />
                  <span>No Code Required</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features-section" className="py-24 px-6 relative">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-sm font-medium mb-4">
                Powerful Features
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Everything You Need to
                <br />
                <span className="text-gradient-accent">Ship ML Products</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                From data import to model deployment, we've got you covered.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Build a Model */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                onClick={() => handleFeatureClick('build')}
                className="feature-card group cursor-pointer"
              >
                <div className="relative z-10">
                  <div className="icon-container bg-primary mb-6">
                    <Settings className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Build a Model</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Create jobs, choose datasources, and train ML models instantly with automated optimization.
                  </p>
                  <div className="flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>

              {/* Compare Models */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                onClick={() => handleFeatureClick('compare')}
                className="feature-card group cursor-pointer"
              >
                <div className="relative z-10">
                  <div className="icon-container bg-primary/90 mb-6">
                    <BarChart3 className="w-6 h-6 text-emerald-50" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Compare Models</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Compare datasets and model performances side-by-side with comprehensive metrics.
                  </p>
                  <div className="flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>

              {/* Test Models */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                onClick={() => handleFeatureClick('test')}
                className="feature-card group cursor-pointer"
              >
                <div className="relative z-10">
                  <div className="icon-container bg-primary/95 mb-6">
                    <TestTube2 className="w-6 h-6 text-sky-50" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-3">Test Models</h3>
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    Upload new datasets to generate predictions or validate performance instantly.
                  </p>
                  <div className="flex items-center text-primary font-medium group-hover:gap-3 gap-2 transition-all">
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why AIvolve */}
        <section className="py-24 px-6 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-muted/30 to-transparent" />
          <div className="max-w-6xl mx-auto relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Why Choose <span className="text-gradient-primary">AIvolve</span>?
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Built for teams who want to move fast without sacrificing quality.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="glass-card p-8 text-center"
              >
                <div className="icon-container mx-auto mb-6 bg-amber-500">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Lightning Fast</h3>
                <p className="text-muted-foreground">
                  Train models in minutes with automated hyperparameter tuning and optimization.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="glass-card p-8 text-center"
              >
                <div className="icon-container mx-auto mb-6 bg-sky-500">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Smart Recommendations</h3>
                <p className="text-muted-foreground">
                  Get intelligent algorithm suggestions based on your data characteristics.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="glass-card p-8 text-center"
              >
                <div className="icon-container mx-auto mb-6 bg-violet-500">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">Clear Insights</h3>
                <p className="text-muted-foreground">
                  Evaluation dashboards with clear metrics and actionable insights.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Model Library */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Model Library
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
                Comprehensive <span className="text-gradient-primary">Algorithm Suite</span>
              </h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Pre-configured algorithms for every machine learning task.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {modelLibrary.map((model, index) => {
                const Icon = model.icon;
                return (
                  <motion.div
                    key={model.name}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.05 }}
                    className="model-card"
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className={
                          'w-10 h-10 rounded-xl flex items-center justify-center ' +
                          getIconContainerClass(model.color)
                        }
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <h3 className="font-bold text-foreground">{model.name}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{model.description}</p>
                    <div className="flex flex-wrap gap-2">
                      {model.algorithms.map((algo) => (
                        <span key={algo} className="algo-chip">
                          {algo}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
};

export default Index;
