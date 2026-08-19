// import { ReactNode } from "react";
// import { useLocation } from "react-router-dom";
// import { WorkflowSidebar } from "./WorkflowSidebar";
// import { WorkflowHeader } from "./WorkFlowHeader";

// interface WorkflowLayoutProps {
//   children: ReactNode;
// }

// export function WorkflowLayout({ children }: WorkflowLayoutProps) {
//   const location = useLocation();

//   const fullscreenRoutes = [
//     "/workflow/etl-output",
//     "/workflow/powerbi-dashboard",
//     "/workflow/automl-dashboard",
//   ];

//   const hideSidebar = fullscreenRoutes.includes(location.pathname);

//   return (
//     <div className="h-screen bg-background overflow-hidden">
      
//       {/* Sticky Header */}
//       <WorkflowHeader />

//       {/* Content BELOW header */}
//       <div className="flex h-[calc(100vh-4rem)]">
        
//         {!hideSidebar && <WorkflowSidebar />}

//         {/* Scrollable page content */}
//         <main
//           className={`overflow-y-auto px-6  w-full ${
//             hideSidebar ? "ml-0" : "ml-60"
//           }`}
//         >
//           {children}
//         </main>

//       </div>
//     </div>
//   );
// }

 
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { WorkflowSidebar } from "./WorkflowSidebar";
import { WorkflowHeader } from "./WorkFlowHeader";
 
interface WorkflowLayoutProps {
  children: ReactNode;
}
 
export function WorkflowLayout({ children }: WorkflowLayoutProps) {
  const location = useLocation();
 
  const fullscreenRoutes = [
    "/workflow/etl-output",
    "/workflow/etl-output1",
    "/workflow/powerbi-dashboard",
    "/workflow/automl-dashboard",
    "PathSelection1",
    "/PowerBIDashboard1"
  ];
 
  const hideSidebar = fullscreenRoutes.includes(location.pathname);
 
  return (
    <div className="h-screen bg-background overflow-hidden">
     
      {/* Sticky Header */}
      <WorkflowHeader />
 
      {/* Content BELOW header */}
      <div className="flex h-[calc(100vh-4rem)]">
       
        {!hideSidebar && <WorkflowSidebar />}
 
        {/* Scrollable page content */}
        <main
          className={`overflow-y-auto px-6  w-full ${
            hideSidebar ? "ml-0" : "ml-60"
          }`}
        >
          {children}
        </main>
 
      </div>
    </div>
  );
}
 
 