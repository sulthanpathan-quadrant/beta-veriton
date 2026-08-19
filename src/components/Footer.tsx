import { Database } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <Database className="h-5 w-5 text-primary" />
              <span className="font-bold">DataPlatform</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Transforming data into insights.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Features</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Pricing</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Integrations</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">API</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">About Us</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Careers</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Blog</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Documentation</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Support</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Case Studies</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Whitepapers</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a></li>
              <li><a href="#" className="text-sm text-muted-foreground hover:text-foreground">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
          © 2024 DataPlatform, Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
