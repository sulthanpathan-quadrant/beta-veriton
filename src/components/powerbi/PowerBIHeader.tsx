import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle'; // adjust path

interface PowerBIHeaderProps {
  onBack: () => void;
  hideBackButton?: boolean;
//   title?: string;           // optional – can show step-specific title if desired
}

export function PowerBIHeader({ onBack,hideBackButton = false}: PowerBIHeaderProps) {
  const navigate = useNavigate();

  // Same user logic as your Workflowheader
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userName = user?.name || user?.email?.split("@")[0] || "User";

  return (
    <header className="sticky top-0 z-50 h-20 w-full bg-card border-b border-border">
      <div className="h-full flex items-center justify-between px-6">
        {/* Left: Logo + Welcome */}
        <div className="flex items-center gap-3 md:gap-4">
          <a href="/" className="flex-shrink-0">
            <img
              src="/logo2.png"
              alt="Veriton"
              className="
                h-10 sm:h-10 md:h-9 lg:h-10 w-auto object-contain
                drop-shadow-[0_4px_16px_rgba(99,102,241,0.7)]
                transition-transform duration-200 hover:scale-105
              "
            />
          </a>

          <div className="flex flex-col">
            <p className="text-sm md:text-base text-muted-foreground">
              Welcome, <span className="text-primary font-medium">{userName}</span>
            </p>
            {/* {title && (
              <p className="text-xs text-muted-foreground/80">{title}</p>
            )} */}
          </div>
        </div>

        {/* Right: Theme + Back */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          {/* <Button
            variant="outline"
            size="sm"
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button> */}

          {!hideBackButton && (                     // ← only show if NOT hidden
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}