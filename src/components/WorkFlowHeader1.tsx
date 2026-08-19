// import { ArrowLeft, Bell, UserCircle ,Database} from "lucide-react";
// import { Button } from "./ui/button";
// import { useNavigate } from "react-router-dom";
// import { ThemeToggle } from "./ThemeToggle";


// export function WorkflowHeader() {
//     const navigate = useNavigate();
//     const storedUser = localStorage.getItem("user");
//   const user = storedUser ? JSON.parse(storedUser) : null;
//   const userName = user?.name || user?.email?.split("@")[0] || "User";
//   const userId = user?.id || user?.user_id;
//   return (
//     <header className="sticky top-0 z-50 h-20 w-full bg-card border-b border-border">
//       <div className="h-full flex items-center justify-between px-6">
        
//         {/* Left: Title */}
//             <div className="flex items-center gap-3 md:gap-4">
//             {/* Logo */}
//             <a href="/" className="flex-shrink-0">
//               <img
//                 src="/logo2.png"
//                 alt="Veriton"
//                 className="
//                   h-10               /* mobile base size */
//                   sm:h-10
//                   md:h-9 lg:h-10    /* larger on desktop */
//                   w-auto
//                   object-contain
//                   drop-shadow-[0_4px_16px_rgba(99,102,241,0.7)]
//                   transition-transform duration-200
//                   hover:scale-105
//                 "
//               />
//             </a>
//             {/* Welcome text – side by side */}
//             <div className="flex flex-col">
//               <p className="text-sm md:text-base text-muted-foreground">
//                 Welcome, <span className="text-primary font-medium">{userName || "User"}</span>
//               </p>
//             </div>
//           </div>
//         {/* Right: Actions */}
//         <div className="flex items-center gap-4">
            
//           <div className="flex items-center gap-3">
//                             <ThemeToggle />
//           </div>
//             <Button variant="outline" onClick={() =>  navigate("/PathSelection1")}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Path Selection
//           </Button>     
//         </div>
//       </div>
//     </header>
//   );
// }

import { ArrowLeft, Bell, UserCircle, Database } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { ThemeToggle } from "./ThemeToggle";

export function Workflowheader() {
  const navigate = useNavigate();
  const location = useLocation();

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userName = user?.name || user?.email?.split("@")[0] || "User";

  // Determine correct back path based on current URL
  const getBackPath = () => {
    const pathname = location.pathname;

    // Group 1 → back to /workflow/path-selection
    if (
      pathname === "/workflow/etl-output" ||
      pathname === "/workflow/powerbi-dashboard" ||
      pathname === "/workflow/automl"||
      pathname === "//workflow/powerbi-flow"
    ) {
      return "/workflow/path-selection";
    }

    // Group 2 → back to /PathSelection1
    if (
      pathname === "/workflow/etl-output1" ||
      pathname === "/PowerBIDashboard1" ||
      pathname === "/workflow/automl/automlhub"
    ) {
      return "/PathSelection1";
    }

    // Fallback (for any other workflow-related page)
    return "/workflow/path-selection";
  };

  const backPath = getBackPath();

  return (
    <header className="sticky top-0 z-50 h-20 w-full bg-card border-b border-border">
      <div className="h-full flex items-center justify-between px-6">
        {/* Left: Logo + Welcome */}
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

          {/* Welcome text */}
          <div className="flex flex-col">
            <p className="text-sm md:text-base text-muted-foreground">
              Welcome, <span className="text-primary font-medium">{userName}</span>
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>

          <Button variant="outline" onClick={() => navigate(backPath)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Path Selection
          </Button>
        </div>
      </div>
    </header>
  );
}