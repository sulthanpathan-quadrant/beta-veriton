
// import {
//   Database,
//   Home,
//   Layers,
//   CheckCircle,
//   Hash,
//   Workflow,
//   TrendingUp,
//   LogOut,
//   GitMerge,
//   Eye,
//   ArrowLeft,
//   MessageCircle,
// } from "lucide-react";
// import { NavLink } from "./NavLink";
// // import { ArrowLeft, Bell, UserCircle ,Database} from "lucide-react";
// import { Button } from "./ui/button";
// import { useNavigate } from "react-router-dom";
// export function WorkflowSidebar() {
//   const navigate = useNavigate()
//   return (
//     <aside className="fixed top-20 left-0 z-40 h-[calc(100vh-4rem)] w-60 bg-card border-r border-border flex flex-col">

//       {/* <div className="flex items-center gap-4 ml-3 mt-2 w-6">
//             <Button variant="outline" onClick={() => navigate("/jobs")}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back to Jobs
//           </Button>     
//         </div> */}


//       {/* Scrollable navigation ONLY */}
//       <nav className="flex-1 overflow-y-auto p-3 space-y-1">
//         <NavLink to="/workflow/data-ingestion" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent  transition" activeClassName="bg-primary text-primary-foreground font-medium">
//           <Database className="h-4 w-4" />
//           <span>Data Ingestion</span>
//         </NavLink>

//         <NavLink to="/workflow/landing-zone" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition" activeClassName="bg-primary text-primary-foreground font-medium">
//           <Home className="h-4 w-4" />
//           <span>Landing Zone</span>
//         </NavLink>

//         <NavLink to="/workflow/data-modeling" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition" activeClassName="bg-primary text-primary-foreground font-medium">
//           <Layers className="h-4 w-4" />
//           <span>Data Modeling</span>
//         </NavLink>

//         <NavLink to="/workflow/data-preview" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition" activeClassName="bg-primary text-primary-foreground font-medium">
//           <Eye className="h-4 w-4" />
//           <span>Data Preview</span>
//         </NavLink>

//         <NavLink to="/workflow/data-creation" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition" activeClassName="bg-primary text-primary-foreground font-medium">
//           <GitMerge className="h-4 w-4" />
//           <span>Create Dataset</span>
//         </NavLink>

//         <NavLink to="/workflow/data-quality" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition" activeClassName="bg-primary text-primary-foreground font-medium">
//           <CheckCircle className="h-4 w-4" />
//           <span>Data Quality</span>
//         </NavLink>

//         <NavLink to="/workflow/ner" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition" activeClassName="bg-primary text-primary-foreground font-medium">
//           <Hash className="h-4 w-4" />
//           <span>Name Entity Resolution</span>
//         </NavLink>

//         <NavLink to="/workflow/business-logic" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition" activeClassName="bg-primary text-primary-foreground font-medium">
//           <Workflow className="h-4 w-4" />
//           <span>Business Logic</span>
//         </NavLink>

//         <NavLink to="/workflow/path-selection" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition" activeClassName="bg-primary text-primary-foreground font-medium">
//           <TrendingUp className="h-4 w-4" />
//           <span>Path Selection</span>
//         </NavLink>
      

//         <NavLink to="/workflow/chatbot" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition" activeClassName="bg-primary text-primary-foreground font-medium">
//           <MessageCircle className="h-4 w-4" />
//           <span>Veriton Chat</span>
//         </NavLink>
//       </nav>

//       {/* Logout (fixed at bottom, no scroll) */}
//       <div className="p-3 border-t border-border">
//         <button
//           onClick={() => {
//             localStorage.clear();
//             window.location.href = "/";
//           }}
//           className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition"
//         >
//           <LogOut className="h-4 w-4" />
//           <span>Logout</span>
//         </button>
//       </div>
//     </aside>
//   );
// }

import {
  Database,
  Home,
  Layers,
  CheckCircle,
  Hash,
  Workflow,
  TrendingUp,
  LogOut,
  GitMerge,
  Eye,
  MessageCircle,
} from "lucide-react";
import { NavLink } from "./NavLink";
import { useNavigate } from "react-router-dom";
import { startCreateThread } from "./threadManager";

export function WorkflowSidebar() {
  const navigate = useNavigate();

  const handleChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    // 1. Fire create-thread immediately in the background (no await)
    startCreateThread();
    // 2. Navigate instantly — VeritonChatBot will show its own loading spinner
    navigate("/workflow/chatbot");
  };

  return (
    <aside className="fixed top-20 left-0 z-40 h-[calc(100vh-4rem)] w-60 bg-card border-r border-border flex flex-col">

      {/* Scrollable navigation ONLY */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <NavLink
          to="/workflow/data-ingestion"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition"
          activeClassName="bg-primary text-primary-foreground font-medium"
        >
          <Database className="h-4 w-4" />
          <span>Data Ingestion</span>
        </NavLink>

        <NavLink
          to="/workflow/landing-zone"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition"
          activeClassName="bg-primary text-primary-foreground font-medium"
        >
          <Home className="h-4 w-4" />
          <span>Landing Zone</span>
        </NavLink>

        <NavLink
          to="/workflow/data-modeling"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition"
          activeClassName="bg-primary text-primary-foreground font-medium"
        >
          <Layers className="h-4 w-4" />
          <span>Data Modeling</span>
        </NavLink>

        <NavLink
          to="/workflow/data-preview"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition"
          activeClassName="bg-primary text-primary-foreground font-medium"
        >
          <Eye className="h-4 w-4" />
          <span>Data Preview</span>
        </NavLink>

        <NavLink
          to="/workflow/data-creation"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition"
          activeClassName="bg-primary text-primary-foreground font-medium"
        >
          <GitMerge className="h-4 w-4" />
          <span>Create Dataset</span>
        </NavLink>

        <NavLink
          to="/workflow/data-quality"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition"
          activeClassName="bg-primary text-primary-foreground font-medium"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Data Quality</span>
        </NavLink>

        <NavLink
          to="/workflow/ner"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition"
          activeClassName="bg-primary text-primary-foreground font-medium"
        >
          <Hash className="h-4 w-4" />
          <span>Name Entity Resolution</span>
        </NavLink>

        <NavLink
          to="/workflow/business-logic"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition"
          activeClassName="bg-primary text-primary-foreground font-medium"
        >
          <Workflow className="h-4 w-4" />
          <span>Business Logic</span>
        </NavLink>

        <NavLink
          to="/workflow/path-selection"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition"
          activeClassName="bg-primary text-primary-foreground font-medium"
        >
          <TrendingUp className="h-4 w-4" />
          <span>Path Selection</span>
        </NavLink>

        {/* Veriton Chat — fires create-thread on click, navigates instantly.
            Loading spinner is shown inside VeritonChatBot, not here. */}
        <NavLink
          to="/workflow/chatbot"
          onClick={handleChatClick}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition"
          activeClassName="bg-primary text-primary-foreground font-medium"
        >
          <MessageCircle className="h-4 w-4" />
          <span>Veriton Chat</span>
        </NavLink>
      </nav>

      {/* Logout — fixed at bottom, no scroll */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = "/";
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm hover:bg-accent transition"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}