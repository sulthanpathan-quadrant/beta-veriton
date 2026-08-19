import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const LandingHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { label: "Features", id: "features" },
    { label: "How It Works", id: "process" },
    { label: "Benefits", id: "benefits" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      {/* <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-hero-from to-hero-to flex items-center justify-center">
              <span className="text-white font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold text-foreground">Veritas AI</span>
          </div> */}

<div className="container mx-auto px-4 py-5">
  <div className="flex items-center justify-between">
    <a href="/" className="flex items-center shrink-0">
      <img
        src="/logo2.png"
        alt="Veriton"
        className="
          h-12               /* mobile – start bigger */
          sm:h-14
          md:h-12 lg:h-18    /* desktop – clearly visible size */
          w-auto
          object-contain
          drop-shadow-[0_4px_16px_rgba(99,102,241,0.7)]
          transition-transform duration-200
          hover:scale-105
        "
      />
    </a>

    

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-foreground hover:text-primary transition-colors duration-200"
              >
                {item.label}
              </button>
            ))}
            <Button
              onClick={() => navigate("/auth")}
              className="ml-4"
            >
              Sign In
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <nav className="md:hidden mt-4 pb-4 flex flex-col space-y-4 animate-fade-in">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-foreground hover:text-primary transition-colors duration-200 text-left"
              >
                {item.label}
              </button>
            ))}
            <Button
              onClick={() => navigate("/auth")}
              className="w-full"
            >
              Sign In
            </Button>
          </nav>
        )}
      </div>
    </header>
  );
};

export default LandingHeader;
