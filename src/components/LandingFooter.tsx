import { Mail, Linkedin, Github } from "lucide-react";
import { Instagram } from "lucide-react";


// X (Twitter) icon component
const XIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LandingFooter = () => {
  return (
    <footer className="bg-footer-bg border-t border-border/50 relative overflow-hidden">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-hero-from/10 via-transparent to-hero-accent/10 pointer-events-none" />
      
      <div className="container mx-auto px-4 py-12 relative">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-hero-from via-hero-to to-hero-accent bg-clip-text text-transparent mb-3">
              Veriton
            </h3>
            <p className="text-muted-foreground text-sm mb-4">
              Transform your data journey with AI-powered automation and intelligence.
            </p>
            <div className="flex gap-3">
              <a
                // href="https://linkedin.com"
                href="https://www.linkedin.com/company/quadranttechnologies-1"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-card border border-border hover:border-primary hover:bg-primary/10 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Linkedin size={18} className="text-foreground" />
              </a>
              <a
                href="https://x.com/Quadranttech2"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-card border border-border hover:border-secondary hover:bg-secondary/10 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <XIcon size={18} />
              </a>
              {/* <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-all duration-300 hover:scale-110"
              >
                <Github size={18} className="text-foreground" />
              </a> */}
            <a
              href="https://www.instagram.com/accounts/login/?next=%2FquadrantTechnologies1%2F&source=omni_redirect"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-lg bg-card border border-border hover:border-accent hover:bg-accent/10 flex items-center justify-center transition-all duration-300 hover:scale-110"
            >
              <Instagram size={18} className="text-foreground" />
            </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#process" className="text-muted-foreground hover:text-primary transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#benefits" className="text-muted-foreground hover:text-primary transition-colors">
                  Benefits
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Careers
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Get in Touch</h4>
            <div className="space-y-3 text-sm">
              <a
                href="mailto:contact@veritasai.com"
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors group"
              >
                <Mail size={16} className="group-hover:scale-110 transition-transform" />
                <span>info@quadranttechnologies.com</span>
              </a>
              <p className="text-muted-foreground">
                Ready to transform your data pipeline? Get started today.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 Veriton. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
