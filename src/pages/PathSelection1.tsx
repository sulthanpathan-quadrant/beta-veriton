// import { useState } from "react";
// import { WorkflowLayout } from "@/components/WorkflowLayout";
// import { Button } from "@/components/ui/button";
// import { Workflow, PieChart, Brain, ArrowLeft } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { WorkflowHeader } from "@/components/WorkFlowHeader";
// import { toast } from "sonner";
// import { prepareDataset } from "@/components/utils/preparedDataset";
 
// export default function PathSelection1() {
//   const navigate = useNavigate();
//   const [selectedPath, setSelectedPath] = useState<string>("Power BI Dashboard");
//   const [loading, setLoading] = useState(false);

// const handleAutoMLClick = async () => {
//   setLoading(true);
 
//   try {
//     // Get stored identifiers from DatasetTab navigation
//     const userId = localStorage.getItem("selected_user_id") || "";
//     const jobId = localStorage.getItem("selected_job_id") || "";
//     const datasetName = localStorage.getItem("selected_dataset_name") || "";
 
//     if (!userId || !jobId || !datasetName) {
//       toast.error("No dataset selected. Please go back and choose one.");
//       setLoading(false);
//       return;
//     }
 
//     // ── 1. Register / Login ──
//     const storedUser = localStorage.getItem("user");
//     if (!storedUser) {
//       toast.error("Base user information missing. Please login again.");
//       setLoading(false);
//       return;
//     }
 
//     const baseUser = JSON.parse(storedUser);
 
//     const formData = new URLSearchParams();
//     formData.append("email", baseUser.email);
//     formData.append("full_name", baseUser.name);
 
//     const res = await fetch(
//       "https://api.veriton.ai/api/service3/automl_register_login",
//       {
//         method: "POST",
//         headers: {
//           accept: "application/json",
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: formData.toString(),
//       }
//     );
 
//     if (!res.ok) {
//       throw new Error(`Register/login failed: ${res.status}`);
//     }
 
//     const data = await res.json();
 
//     const aivolveUser = {
//       ...data.user,
//       agent_id: data.agent_id,
//       agent_name: data.agent_name,
//       session_id: data.session_id,
//       total_chats: data.total_chats,
//     };
 
//     localStorage.setItem("aivolve_user", JSON.stringify(aivolveUser));
//     window.dispatchEvent(new Event("storage"));
 
//     // toast.success("AutoML session ready");
 
//     // ── 2. Navigate to hub immediately ──
//     navigate("/workflow/automl/automlhub", {
//       state: {
//         // Optional: pass identifiers if you want to avoid localStorage read
//         userId,
//         jobId,
//         datasetName,
//       },
//     });
 
//   } catch (err: any) {
//     console.error(err);
//     toast.error("AutoML initialization failed: " + (err.message || "Unknown error"));
//   } finally {
//     setLoading(false);
//   }
// };
 
 
// // ... rest of PathSelection1 remains the same
 
//   const paths = [
//     {
//       id: "etl",
//       title: "ETL Pipeline",
//       description: "Prepare and export the data for use in other systems or data warehouses.",
//       icon: Workflow,
//       route: "/workflow/etl-output1",
//     },
//     {
//       id: "powerbi",
//       title: "Power BI Dashboard",
//       description: "Connect the data to Power BI for immediate visualization and reporting.",
//       icon: PieChart,
//       route: "/PowerBIDashboard1",
//     },
//     {
//       id: "aiml",
//       title: "Auto AI/ML Model",
//       description: "Use the data to train or run an automated machine learning model.",
//       icon: Brain,
//       route: "/workflow/automl/automlhub",
//     },
   
//   ];
 
//   return (
//     <div>
//         <WorkflowHeader/>
//       <div className="p-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-foreground mb-3">
//             Choose Your Output Path
//           </h1>
//           <p className="text-muted-foreground text-lg">
//             Select how you want to use your processed data.
//           </p>
//         </div>
 
//         {/* Path Cards */}
//         <div className="grid grid-cols-3 gap-6 mb-12">
//           {paths.map((path) => {
//             const Icon = path.icon;
//             const isSelected = selectedPath === path.title;
 
//             return (
//               <div
//                 key={path.id}
//                 onClick={() => {
//                   setSelectedPath(path.title);
//                    if (path.id === "aiml") {
//                     handleAutoMLClick();
//                   } else {
//                     navigate(path.route);
//                   }
//                 }}
//                 className={`border rounded-lg p-8 cursor-pointer transition-all ${
//                   isSelected
//                     ? "border-primary bg-primary/5"
//                     : "border-border bg-card hover:bg-muted/30"
//                 } ${loading && path.id === "aiml" ? "opacity-60 pointer-events-none" : ""}`}
//               >
//                 <div className="mb-6">
//                   <div
//                     className={`w-14 h-14 rounded-lg flex items-center justify-center ${
//                       isSelected ? "bg-primary/10" : "bg-muted"
//                     }`}
//                   >
//                     <Icon className={`h-7 w-7 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
//                   </div>
//                 </div>
//                 <h3 className="text-xl font-semibold text-foreground mb-3">
//                   {path.title}
//                 </h3>
//                 <p className="text-sm text-muted-foreground leading-relaxed">
//                   {path.description}
//                 </p>
//               </div>
//               );
//             })}
//           </div>
 
//         {/* Bottom Navigation */}
//         {/* <div className="flex items-center justify-between pt-8 border-t border-border">
//           <Button variant="outline" onClick={() => navigate("/workflow/business-logic")}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back
//           </Button>
//         </div> */}
//       </div>
//     </div>
//   );
// }
 
import { useState } from "react";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import { Workflow, PieChart, Brain, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WorkflowHeader } from "@/components/WorkFlowHeader";
import { toast } from "sonner";

 
export default function PathSelection1() {
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState<string>("Power BI Dashboard");
  const [loading, setLoading] = useState(false);

  // Update to PathSelection1.tsx (only showing the changed parts)

const handleAutoMLClick = async () => {
  setLoading(true);

  try {
    // Get stored identifiers from DatasetTab navigation
    const userId = localStorage.getItem("selected_user_id") || "";
    const jobId = localStorage.getItem("selected_job_id") || "";
    const datasetName = localStorage.getItem("selected_dataset_name") || "";

    if (!userId || !jobId || !datasetName) {
      toast.error("No dataset selected. Please go back and choose one.");
      setLoading(false);
      return;
    }

    // ── 1. Register / Login ──
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      toast.error("Base user information missing. Please login again.");
      setLoading(false);
      return;
    }

    const baseUser = JSON.parse(storedUser);

    const formData = new URLSearchParams();
    formData.append("email", baseUser.email);
    formData.append("full_name", baseUser.name);

    const res = await fetch(
      "https://api.veriton.ai/api/service3/automl_register_login",
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    if (!res.ok) {
      throw new Error(`Register/login failed: ${res.status}`);
    }

    const data = await res.json();

    const aivolveUser = {
      ...data.user,
      agent_id: data.agent_id,
      agent_name: data.agent_name,
      session_id: data.session_id,
      total_chats: data.total_chats,
    };

    localStorage.setItem("aivolve_user", JSON.stringify(aivolveUser));
    window.dispatchEvent(new Event("storage"));

    toast.success("AutoML session ready");

    // ── 2. Navigate to hub immediately ──
navigate("/workflow/automl/automlhub", {
  state: {
    userId,
    jobId,
    datasetName,
    from: "/PathSelection1", // ✅ add this
  },
});

  } catch (err: any) {
    console.error(err);
    toast.error("AutoML initialization failed: " + (err.message || "Unknown error"));
  } finally {
    setLoading(false);
  }
};
// ... rest of PathSelection1 remains the same
 
  const paths = [
    {
      id: "etl",
      title: "ETL Pipeline",
      description: "Prepare and export the data for use in other systems or data warehouses.",
      icon: Workflow,
      route: "/workflow/etl-output1",
    },
    {
      id: "powerbi",
      title: "Power BI Dashboard",
      description: "Connect the data to Power BI for immediate visualization and reporting.",
      icon: PieChart,
      route: "/PowerBIDashboard1",
    },
    {
      id: "aiml",
      title: "AutoML Model",
      description: "Use the data to train or run an automated machine learning model.",
      icon: Brain,
      route: "/workflow/automl/automlhub",
    },
    
  ];
 
  return (
    <div>
        <WorkflowHeader/>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-3">
            Choose Your Output Path
          </h1>
          <p className="text-muted-foreground text-lg">
            Select how you want to use your processed data.
          </p>
        </div>
 
        {/* Path Cards */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {paths.map((path) => {
            const Icon = path.icon;
            const isSelected = selectedPath === path.title;
 
            return (
              <div
                key={path.id}
                onClick={() => {
                  setSelectedPath(path.title);
                   if (path.id === "aiml") {
                    handleAutoMLClick();
                  } else {
                    navigate(path.route);
                  }
                }}
                className={`border rounded-lg p-8 cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-muted/30"
                } ${loading && path.id === "aiml" ? "opacity-60 pointer-events-none" : ""}`}
              >
                <div className="mb-6">
                  <div
                    className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <Icon className={`h-7 w-7 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {path.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {path.description}
                </p>
              </div>
              );
            })}
          </div>
 
      </div>
    </div>
  );
}
 
 
 
 