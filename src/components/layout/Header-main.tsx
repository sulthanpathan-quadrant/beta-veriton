// import { useState } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { LogOut, BarChart3, GitBranch, TableIcon, Sparkles } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
// } from "@/components/ui/select";
// import { ThemeToggle } from "@/components/ThemeToggle";
// import { toast } from "sonner";

// interface HeaderProps {
//   /**
//    * Called AFTER the new platform value has been saved to localStorage.
//    * Pages should use this to immediately refetch whatever data depends on
//    * the data platform (jobs, pipelines, datasets, etc). This is what fixes
//    * the "only works after a page refresh" bug — previously nothing told
//    * the page's effects to re-run when the platform changed, so a page
//    * kept showing/fetching Fabric data even after switching to Databricks
//    * until it was remounted.
//    */
//   onDataPlatformChange?: (platform: string) => void;
// }

// const NAV_ITEMS = [
//   { path: "/jobs", label: "Jobs", icon: BarChart3 },
//   { path: "/pipelines", label: "Pipelines", icon: GitBranch },
//   { path: "/datasets", label: "Datasets", icon: TableIcon },
//   { path: "/workflow/automl/jobs1", label: "Auto AI/ML", icon: Sparkles },
// ];

// const getStoredUser = () => {
//   const raw = localStorage.getItem("user");
//   return raw ? JSON.parse(raw) : null;
// };

// const Header = ({ onDataPlatformChange }: HeaderProps) => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const user = getStoredUser();
//   const userName = user?.name || user?.email?.split("@")[0] || "User";

//   // Default to Fabric if the user object has no platform set yet.
//   const [dataPlatform, setDataPlatform] = useState<string>(
//     user?.dataplatform || "Fabric",
//   );

//   const isActive = (path: string) =>
//     location.pathname === path ||
//     (path === "/workflow/automl/jobs1" &&
//       location.pathname.startsWith("/workflow/automl"));

//   const handleLogout = () => {
//     localStorage.clear();
//     toast.success("Logged out successfully");
//     navigate("/", { replace: true });
//   };

//   const handleDataPlatformChange = (value: string) => {
//     setDataPlatform(value);

//     try {
//       const storedUserRaw = localStorage.getItem("user");
//       const userObj = storedUserRaw ? JSON.parse(storedUserRaw) : {};
//       const updatedUser = { ...userObj, dataplatform: value };
//       localStorage.setItem("user", JSON.stringify(updatedUser));

//       toast.success(`Data platform set to ${value}`);

//       // Tell whichever page is mounted to refetch right now, instead of
//       // silently waiting for the user to hit refresh.
//       onDataPlatformChange?.(value);
//     } catch (err) {
//       console.error("Failed to update data platform in localStorage", err);
//       toast.error("Failed to save data platform selection");
//     }
//   };

//   return (
//     <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
//       <div className="container mx-auto px-6 py-4">
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-3 md:gap-4">
//             <a href="/" className="flex-shrink-0">
//               <img
//                 src="/logo2.png"
//                 alt="Veriton"
//                 className="
//                   h-10
//                   sm:h-10
//                   md:h-9 lg:h-10
//                   w-auto
//                   object-contain
//                   drop-shadow-[0_4px_16px_rgba(99,102,241,0.7)]
//                   transition-transform duration-200
//                   hover:scale-105
//                 "
//               />
//             </a>

//             <div className="flex flex-col">
//               <p className="text-sm md:text-base text-muted-foreground">
//                 Welcome,{" "}
//                 <span className="text-primary font-medium">{userName}</span>
//               </p>
//             </div>
//           </div>

//           <nav className="flex items-center gap-6">
//             {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
//               <button
//                 key={path}
//                 onClick={() => navigate(path)}
//                 className={`flex items-center gap-2 pb-1 transition-colors ${
//                   isActive(path)
//                     ? "text-primary font-medium border-b-2 border-primary"
//                     : "text-muted-foreground hover:text-foreground"
//                 }`}
//               >
//                 <Icon className="w-4 h-4" />
//                 {label}
//               </button>
//             ))}

//             <Select value={dataPlatform} onValueChange={handleDataPlatformChange}>
//               <SelectTrigger className="w-auto text-lg min-w-[150px] h-8 border-none bg-transparent text-violet-600 hover:text-foreground focus:ring-0 gap-2 px-2 shadow-none">
//                 <span className="truncate">{dataPlatform || "Data platform"}</span>
//               </SelectTrigger>
//               <SelectContent>
//                 <SelectItem value="Fabric">Fabric</SelectItem>
//                 <SelectItem value="Snowflake">Snowflake</SelectItem>
//                 <SelectItem value="Databricks">Databricks</SelectItem>
//               </SelectContent>
//             </Select>

//             <div className="flex items-center gap-3">
//               <ThemeToggle />
//               <Button
//                 variant="ghost"
//                 size="icon"
//                 onClick={handleLogout}
//                 className="hover:bg-primary rounded-full"
//                 title="Logout"
//               >
//                 <LogOut className="h-4 w-4" />
//               </Button>
//             </div>
//           </nav>
//         </div>
//       </div>
//     </header>
//   );
// };

// export default Header;


import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, BarChart3, GitBranch, TableIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toast } from "sonner";

interface HeaderProps {
  /**
   * Called AFTER the new platform value has been saved to localStorage.
   * Pages should use this to immediately refetch whatever data depends on
   * the data platform (jobs, pipelines, datasets, etc). This is what fixes
   * the "only works after a page refresh" bug — previously nothing told
   * the page's effects to re-run when the platform changed, so a page
   * kept showing/fetching Fabric data even after switching to Databricks
   * until it was remounted.
   */
  onDataPlatformChange?: (platform: string) => void;
}

const NAV_ITEMS = [
  { path: "/jobs", label: "Jobs", icon: BarChart3 },
  { path: "/pipelines", label: "Pipelines", icon: GitBranch },
  { path: "/datasets", label: "Datasets", icon: TableIcon },
  { path: "/workflow/automl/jobs1", label: "Auto AI/ML", icon: Sparkles },
];

const getStoredUser = () => {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
};

const Header = ({ onDataPlatformChange }: HeaderProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = getStoredUser();
  const userName = user?.name || user?.email?.split("@")[0] || "User";

  // Default to Fabric if the user object has no platform set yet.
  const [dataPlatform, setDataPlatform] = useState<string>(
    user?.dataplatform || "Fabric",
  );

  const isActive = (path: string) =>
    location.pathname === path ||
    (path === "/workflow/automl/jobs1" &&
      location.pathname.startsWith("/workflow/automl"));

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    navigate("/", { replace: true });
  };

  const handleDataPlatformChange = (value: string) => {
    setDataPlatform(value);

    try {
      const storedUserRaw = localStorage.getItem("user");
      const userObj = storedUserRaw ? JSON.parse(storedUserRaw) : {};
      const updatedUser = { ...userObj, dataplatform: value };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success(`Data platform set to ${value}`);

      // Tell whichever page is mounted to refetch right now, instead of
      // silently waiting for the user to hit refresh.
      onDataPlatformChange?.(value);
    } catch (err) {
      console.error("Failed to update data platform in localStorage", err);
      toast.error("Failed to save data platform selection");
    }
  };

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 md:gap-4">
            <a href="/" className="flex-shrink-0">
              <img
                src="/logo2.png"
                alt="Veriton"
                className="
                  h-10
                  sm:h-10
                  md:h-9 lg:h-10
                  w-auto
                  object-contain
                  drop-shadow-[0_4px_16px_rgba(99,102,241,0.7)]
                  transition-transform duration-200
                  hover:scale-105
                "
              />
            </a>

            <div className="flex flex-col">
              <p className="text-sm md:text-base text-muted-foreground">
                Welcome,{" "}
                <span className="text-primary font-medium">{userName}</span>
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-6">
            {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`flex items-center gap-2 pb-1 transition-colors ${
                  isActive(path)
                    ? "text-primary font-medium border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}

            {/* ── "DataPlatform" label sits inline, on the same row as the
                rest of the nav — not stacked above the value. Default
                behavior is unchanged: Fabric on first login, and the user
                can switch to Snowflake/Databricks from the same dropdown
                that was already there. ── */}
            <Select value={dataPlatform} onValueChange={handleDataPlatformChange}>
              <SelectTrigger className="w-auto min-w-[150px] h-8 border-none bg-transparent hover:text-foreground focus:ring-0 gap-2 px-2 shadow-none">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="text-sm font-medium text-muted-foreground">
                    DataPlatform:
                  </span>
                  <span className="text-lg text-violet-600 font-medium">
                    {dataPlatform || "Fabric"}
                  </span>
                </span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Fabric">Fabric</SelectItem>
                <SelectItem value="Snowflake">Snowflake</SelectItem>
                <SelectItem value="Databricks">Databricks</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="hover:bg-primary rounded-full"
                title="Logout"
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

export default Header;