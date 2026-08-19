import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  Database,
  BarChart3,
  GitBranch,
  Table as TableIcon,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "../ThemeToggle";
import { useEffect, useState } from "react";
 
const Header1 = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
    const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userName = user?.name || user?.email?.split("@")[0] || "User";
  const userId = user?.id || user?.user_id;
 
 
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
 
    window.addEventListener("scroll", handleScroll);
 
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
 
  const handleLogout = () => {
    logout();
 
    // optional: clear everything if needed
    localStorage.clear();
 
    navigate("/");
  };
 
  return (
    <header
      className={`border-b border-border sticky top-0 z-50 transition-all duration-300
      ${
        isScrolled
          ? "bg-background/70 backdrop-blur-md shadow-sm"
          : "bg-background"
      }`}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            {/* Logo */}
            <a href="/" className="flex-shrink-0">
              <img
                src="/logo2.png"
                alt="Veriton"
                className="
                  h-10               /* mobile base size */
                  sm:h-10
                  md:h-9 lg:h-10    /* larger on desktop */
                  w-auto
                  object-contain
                  drop-shadow-[0_4px_16px_rgba(99,102,241,0.7)]
                  transition-transform duration-200
                  hover:scale-105
                "
              />
            </a>
 
            {/* Welcome text – side by side */}
            <div className="flex flex-col">
              <p className="text-sm md:text-base text-muted-foreground">
                Welcome, <span className="text-primary font-medium">{userName || "User"}</span>
              </p>
            </div>
          </div>
 
          {/* Right */}
          <nav className="flex items-center gap-6">
            {/* <Button
              variant="outline"
              onClick={() =>
                navigate(location.state?.from || "/workflow/path-selection")
              }
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Path Selection
            </Button> */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
 
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-primary/10 rounded-full"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
 
export default Header1;
 