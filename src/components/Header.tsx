// import { Database } from "lucide-react";
// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";

// export const Header = () => {
//   const scrollToSection = (sectionId: string) => {
//     const element = document.getElementById(sectionId);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth', block: 'start' });
//     }
//   };

//   return (
//     <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
//       <div className="container mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="flex h-16 items-center justify-between">
//           <Link to="/" className="flex items-center space-x-2">
//             <Database className="h-6 w-6 text-primary" />
//             <span className="text-xl font-bold">Veritas AI</span>
//           </Link>
          
//           <nav className="hidden md:flex items-center space-x-8">
//             <button 
//               onClick={() => scrollToSection('features')}
//               className="text-sm text-muted-foreground hover:text-foreground transition-colors"
//             >
//               Features
//             </button>
//             <button 
//               onClick={() => scrollToSection('how-it-works')}
//               className="text-sm text-muted-foreground hover:text-foreground transition-colors"
//             >
//               How It Works
//             </button>
//             <button 
//               onClick={() => scrollToSection('benefits')}
//               className="text-sm text-muted-foreground hover:text-foreground transition-colors"
//             >
//               Benefits
//             </button>
//           </nav>

//           <Button variant="outline" size="sm">
//             Sign In
//           </Button>
//         </div>
//       </div>
//     </header>
//   );
// };

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Header = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 md:space-x-3">
            {/* Icon version – logo.jpg (the glowing V symbol) */}
            <img
              src="/logo.jpg"
              alt="Veriton icon"
              className="h-7 w-7 object-contain"
            />

            {/* Text/wordmark version – logotxt.jpg (the "Veriton" text with glow) */}
            <img
              src="/logotxt.jpg"
              alt="Veriton"
              className="h-8 w-auto object-contain"
            />
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection("benefits")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Benefits
            </button>
          </nav>

          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </div>
      </div>
    </header>
  );
};