import { ArrowLeft, Bell, UserCircle ,Database} from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";


export function WorkflowHeader() {
    const navigate = useNavigate();
    const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userName = user?.name || user?.email?.split("@")[0] || "User";
  const userId = user?.id || user?.user_id;

  const handleBackToJobs = () => {
        // Clear modeling data and dataset-related keys
        localStorage.removeItem("modeling_data");
        localStorage.removeItem("current_dataset_name");
        localStorage.removeItem("current_dataset_path");
        localStorage.removeItem("current_onelake_path");
          localStorage.removeItem("current_thread_id");
          localStorage.removeItem("ingestion_sources")
        
        navigate("/jobs");
    };


  return (
    <header className="sticky top-0 z-50 h-20 w-full bg-card border-b border-border">
      <div className="h-full flex items-center justify-between px-6">
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
        {/* Right: Actions */}
        <div className="flex items-center gap-4">
            
          <div className="flex items-center gap-3">
                            <ThemeToggle />
          </div>
            <Button variant="outline" onClick={handleBackToJobs}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Jobs
          </Button>     
        </div>
      </div>
    </header>
  );
}
