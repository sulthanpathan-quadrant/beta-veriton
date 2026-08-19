// import { useState, useEffect } from "react";
// import { PowerBIMicrosoftLogin } from "./PowerBIMicrosoftLogin";
// import { PowerBIWorkspaces } from "./PowerBIWorkspaces";
// import { PowerBIReport } from "./PowerBIReport";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogDescription,
//   DialogClose,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { CheckCircle2, X, AlertCircle } from "lucide-react";
// // import { Workflowheader } from "../WorkFlowHeader1";
// import { PowerBIHeader } from "./PowerBIHeader";

// const API_BASE = "https://api.veriton.ai/api/service4";

// async function apiFetch(path: string, options: RequestInit = {}) {
//   return fetch(`${API_BASE}${path}`, {
//     ...options,
//     credentials: "include",
//     headers: {
//       "Content-Type": "application/json",
//       Accept: "application/json",
//       ...(options.headers as any),
//     },
//   });
// }

// type FlowStep = "microsoft" | "workspaces" | "report";

// export interface GenerateVisualsResponse {
//   file_name?: string;
//   total_rows?: number;
//   total_visuals_generated?: number;
//   detected_structure?: any;
//   visuals?: any[];
// }

// interface PowerBIFlowProps {
//   fileName: string;
//   onBack: () => void;
//   generateVisualsData?: GenerateVisualsResponse;
// }

// interface MigrateResult {
//   report_id: string;
//   dataset_id: string;
//   workspace_id: string;
//   embed_url: string;
//   embed_token: string | null;
//   embed_mode: "edit" | "view";
//   edit_url: string;
//   webUrl: string;
//   rows_pushed?: { fact_generic: number; fact_visual_points: number };
// }

// export function PowerBIFlow({
//   fileName,
//   onBack,
//   generateVisualsData,
// }: PowerBIFlowProps) {
//   const [step, setStep] = useState<FlowStep>("microsoft");
//   const [showSuccessDialog, setShowSuccessDialog] = useState(false);
//   const [isMigrating, setIsMigrating] = useState(false);
//   const [migrateError, setMigrateError] = useState<string | null>(null);
//   const [selectedWorkspaceName, setSelectedWsName] = useState("");
//   const [migrateResult, setMigrateResult] = useState<MigrateResult | null>(
//     null,
//   );

//   // ── Skip login if session alive ──
//   useEffect(() => {
//     const checkAuth = async () => {
//       const authTime = sessionStorage.getItem("pbi_auth_time");
//       const isRecent = authTime && Date.now() - parseInt(authTime) < 3600000;
//       if (isRecent) {
//         try {
//           const res = await apiFetch("/auth/me");
//           if (res.ok) {
//             console.log("[PowerBIFlow] ✓ Session alive — skipping login");
//             setStep("workspaces");
//             return;
//           }
//         } catch {}
//       }
//       sessionStorage.removeItem("pbi_auth_time");
//     };
//     checkAuth();
//   }, []);

//   // ---------- BUILD PAYLOAD ----------
//   const buildPayload = (workspaceName: string, workspaceId: string) => {
//     // Always prefer sessionStorage if prop visuals are empty
//     let data: any = generateVisualsData;

//     if (!data?.visuals?.length) {
//       try {
//         const stored = sessionStorage.getItem("pbi_generate_visuals");
//         if (stored) {
//           const parsed = JSON.parse(stored);
//           if (parsed?.visuals?.length) {
//             data = parsed;
//             console.log(
//               "[PowerBIFlow] ✓ Loaded from sessionStorage, visuals:",
//               data.visuals.length,
//             );
//           } else {
//             console.log("[PowerBIFlow] ❌ sessionStorage visuals also empty");
//           }
//         } else {
//           console.log("[PowerBIFlow] ❌ sessionStorage key not found");
//         }
//       } catch (e) {
//         console.log("[PowerBIFlow] ❌ sessionStorage parse error:", e);
//       }
//     }

//     data = data || { visuals: [] };

//     const resolvedFileName = fileName || data?.file_name || "dashboard";

//     console.log("🔴 RAW data:", JSON.stringify(data, null, 2));
//     console.log("Visuals count:", data.visuals?.length);

//     const normalizedVisuals = Array.isArray(data.visuals)
//       ? data.visuals.map((v) => ({
//           ...v,
//           chart_type: (v.chart_type ?? "").toLowerCase(),
//         }))
//       : [];

//     const detected_structure = {
//       ...(data.detected_structure ?? {}),
//       domain: data.detected_structure?.domain ?? "General",
//     };

//     return {
//       visuals: normalizedVisuals,
//       detected_structure,
//       report_name: `${resolvedFileName.replace(".csv", "")}_dashboard`,
//       target_workspace_id: workspaceId,
//     };
//   };

//   // ---------- MIGRATE REPORT ----------
//   const handleMigrate = async (workspace: { id: string; name: string }) => {
//     setSelectedWsName(workspace.name);
//     setIsMigrating(true);
//     setMigrateError(null);

//     try {
//       const body = buildPayload(workspace.name, workspace.id);

//       console.log(
//         "[PowerBIFlow] Sending payload:",
//         JSON.stringify(body, null, 2),
//       );

//       const res = await apiFetch("/powerbi/clone-and-preview-to-workspace", {
//         method: "POST",
//         body: JSON.stringify(body),
//       });

//       if (!res.ok) {
//         const errData = await res.json().catch(() => ({}));
//         throw new Error(errData?.detail ?? "Migration failed");
//       }

//       const data: MigrateResult = await res.json();

//       console.log("[PowerBIFlow] Migration result:", data);

//       setMigrateResult(data);
//       setShowSuccessDialog(true);
//     } catch (err: any) {
//       setMigrateError(err.message ?? "Unexpected error");
//     } finally {
//       setIsMigrating(false);
//     }
//   };

//   const handleViewReport = () => {
//     setShowSuccessDialog(false);
//     setStep("report");
//   };

//   // ---------- REPORT VIEW ----------
//   if (step === "report") {
//     return (
//     //   <div className="min-h-screen flex flex-col bg-background">
//     //     <PowerBIHeader onBack={() => setStep("workspaces")} />
//     <>

//         <div className="flex-1 pt-4">
//           <PowerBIReport
//             workspaceName={selectedWorkspaceName}
//             embedUrl={migrateResult?.embed_url}
//             embedToken={migrateResult?.embed_token ?? undefined}
//             editUrl={migrateResult?.edit_url ?? migrateResult?.webUrl}
//             reportId={migrateResult?.report_id}
//             workspaceId={migrateResult?.workspace_id}
//             datasetId={migrateResult?.dataset_id}
//             onBack={() => setStep("workspaces")}
//           />
//         </div>
//       </>
//     );
//   }

//   // ---------- WORKSPACES ----------
//   if (step === "workspaces") {
//     return (
//       <div className="min-h-screen flex flex-col bg-background">
//         <PowerBIHeader onBack={() => setStep("microsoft")} />

//         <div className="flex-1 pt-4">
//           <PowerBIWorkspaces
//             onBack={() => setStep("microsoft")}
//             onMigrate={handleMigrate}
//             fileName={fileName}
//             isMigrating={isMigrating}
//           />

//           {migrateError && (
//             <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-destructive text-destructive-foreground px-5 py-3 rounded-xl shadow-lg">
//               <AlertCircle className="w-5 h-5 shrink-0" />
//               <span className="text-sm font-medium">{migrateError}</span>

//               <button
//                 onClick={() => setMigrateError(null)}
//                 className="ml-2 opacity-70 hover:opacity-100"
//               >
//                 <X className="w-4 h-4" />
//               </button>
//             </div>
//           )}
//         </div>

//         <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
//           <DialogContent className="sm:max-w-sm p-0 bg-card border-border rounded-2xl overflow-hidden">
//             <DialogClose asChild>
//               <button className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
//                 <X className="h-5 w-5" />
//               </button>
//             </DialogClose>

//             <div className="flex flex-col items-center gap-5 py-8 px-6">
//               <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
//                 <CheckCircle2 className="w-8 h-8 text-primary" />
//               </div>

//               <DialogHeader className="space-y-3 text-center items-center">
//                 <DialogTitle className="text-2xl font-bold">
//                   Success!
//                 </DialogTitle>

//                 <DialogDescription>
//                   Report migrated to "{selectedWorkspaceName}"
//                 </DialogDescription>
//               </DialogHeader>

//               {migrateResult?.rows_pushed && (
//                 <div className="flex gap-4 text-xs text-muted-foreground">
//                   <span>
//                     ✓ {migrateResult.rows_pushed.fact_generic} KPI rows
//                   </span>
//                   <span>
//                     ✓ {migrateResult.rows_pushed.fact_visual_points} table rows
//                   </span>
//                 </div>
//               )}

//               <Button
//                 onClick={handleViewReport}
//                 className="w-[180px] rounded-full bg-primary text-primary-foreground h-11"
//               >
//                 View Report
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>
//     );
//   }

//   // ---------- MICROSOFT LOGIN ----------
//   return (
//     <div className="min-h-screen flex flex-col bg-background">
//       <PowerBIHeader onBack={onBack} hideBackButton={false} />

//       <div className="flex-1 pt-4">
//         <PowerBIMicrosoftLogin
//           onBack={onBack}
//           onSignInWithMicrosoft={() => setStep("workspaces")}
//         />
//       </div>
//     </div>
//   );
// }








import { useState, useEffect } from "react";
import { PowerBIMicrosoftLogin } from "./PowerBIMicrosoftLogin";
import { PowerBIWorkspaces } from "./PowerBIWorkspaces";
import { PowerBIReport } from "./PowerBIReport";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, X, AlertCircle } from "lucide-react";
 import { Workflowheader } from "../WorkFlowHeader1";
import { PowerBIHeader } from "./PowerBIHeader";

const API_BASE = "https://api.veriton.ai/api/service4";

// Token Helper
export function getStoredToken(): string | null {
  return localStorage.getItem("pbi_access_token");
}

// Reliable apiFetch
async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error(errData?.detail || errData?.message || `HTTP ${res.status}`),
      { status: res.status }
    );
  }
  return res.json();
}

// Types
type FlowStep = "microsoft" | "workspaces" | "report";

export interface GenerateVisualsResponse {
  file_name?: string;
  total_rows?: number;
  total_visuals_generated?: number;
  detected_structure?: any;
  visuals?: any[];
}

interface PowerBIFlowProps {
  fileName: string;
  onBack: () => void;
  generateVisualsData?: GenerateVisualsResponse;
}

interface MigrateResult {
  report_id: string;
  dataset_id: string;
  workspace_id: string;
  embed_url: string;
  embed_token: string | null;
  embed_mode: "edit" | "view";
  edit_url: string;
  webUrl: string;
  rows_pushed?: { fact_generic: number; fact_visual_points: number };
}

// Main Component
export function PowerBIFlow({
  fileName,
  onBack,
  generateVisualsData,
}: PowerBIFlowProps) {
  const [step, setStep] = useState<FlowStep>("microsoft");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrateError, setMigrateError] = useState<string | null>(null);
  const [selectedWorkspaceName, setSelectedWsName] = useState("");
  const [migrateResult, setMigrateResult] = useState<MigrateResult | null>(null);

  // Auto-advance after successful login
  useEffect(() => {
    const checkAuth = async () => {
      const token = getStoredToken();
      const authTime = sessionStorage.getItem("pbi_auth_time");
      const isRecent = authTime && Date.now() - parseInt(authTime) < 3600000;

      if (!token || !isRecent) return;

      try {
        await apiFetch("/auth/me");
        // console.log("[PowerBIFlow] Token valid → workspaces");
        setStep("workspaces");
      } catch (err) {
        console.warn("Token invalid");
        localStorage.removeItem("pbi_access_token");
        sessionStorage.removeItem("pbi_auth_time");
      }
    };

    checkAuth();
  }, []);

  // reportName is passed in from PowerBIWorkspaces dialog — use it directly as-is
  const buildPayload = (reportName: string, workspaceId: string) => {
    let data: any = generateVisualsData;

    if (!data?.visuals?.length) {
      try {
        const stored = sessionStorage.getItem("pbi_generate_visuals");
        if (stored) data = JSON.parse(stored);
      } catch (e) {
        console.log("[PowerBIFlow] sessionStorage parse error");
      }
    }

    data = data || { visuals: [] };

    const normalizedVisuals = Array.isArray(data.visuals)
      ? data.visuals.map((v: any) => ({
          ...v,
          chart_type: (v.chart_type ?? "").toLowerCase(),
        }))
      : [];

    return {
      visuals: normalizedVisuals,
      detected_structure: {
        ...(data.detected_structure ?? {}),
        domain: data.detected_structure?.domain ?? "General",
      },
      // Use exactly what the user typed — no suffix appended
      report_name: reportName.trim(),
      target_workspace_id: workspaceId,
    };
  };

  // workspace = the selected workspace, reportName = what user typed in the dialog
  const handleMigrate = async (
    workspace: { id: string; name: string },
    reportName: string
  ) => {
    setSelectedWsName(workspace.name);
    setIsMigrating(true);
    setMigrateError(null);

    try {
      const body = buildPayload(reportName, workspace.id);
      // console.log("[PowerBIFlow] Sending payload:", JSON.stringify(body, null, 2));

      const res = await apiFetch("/powerbi/clone-and-preview-to-workspace", {
        method: "POST",
        body: JSON.stringify(body),
      });

      const data: MigrateResult = res;
      // console.log("[PowerBIFlow] Migration success:", data);

      setMigrateResult(data);
      setShowSuccessDialog(true);
    } catch (err: any) {
      console.error("[PowerBIFlow] Migration failed:", err);
      setMigrateError(err.message || "Migration failed. Please try again.");
    } finally {
      setIsMigrating(false);
    }
  };

  const handleViewReport = () => {
    setShowSuccessDialog(false);
    setStep("report");
  };

  if (step === "report" && migrateResult) {
    return (
  
  //  <div className="min-h-screen flex flex-col bg-background">
  //   <PowerBIHeader onBack={() => setStep("workspaces")} />
  <>
     <div className="flex-1 pt-4">
      <PowerBIReport
        workspaceName={selectedWorkspaceName}
        embedUrl={migrateResult.embed_url}
        embedToken={migrateResult.embed_token ?? undefined}
        editUrl={migrateResult.edit_url ?? migrateResult.webUrl}
        reportId={migrateResult.report_id}
        workspaceId={migrateResult.workspace_id}
        datasetId={migrateResult.dataset_id}
        onBack={() => setStep("workspaces")}
      />
   </div>
  </>
  
    );
  }

  if (step === "workspaces") {
    return (
       <div className="min-h-screen flex flex-col bg-background">
        <PowerBIHeader onBack={() => setStep("microsoft")} />

        <div className="flex-1 pt-4">
        <PowerBIWorkspaces
          onBack={() => setStep("microsoft")}
          onMigrate={handleMigrate}
          fileName={fileName}
          isMigrating={isMigrating}
        />

        {migrateError && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-destructive text-destructive-foreground px-5 py-3 rounded-xl shadow-lg">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-medium">{migrateError}</span>
            <button onClick={() => setMigrateError(null)} className="ml-2 opacity-70 hover:opacity-100">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        </div>

        <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
          <DialogContent className="sm:max-w-sm p-0 bg-card border-border rounded-2xl overflow-hidden">
            <DialogClose asChild>
              <button className="absolute right-4 top-4 p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </DialogClose>

            <div className="flex flex-col items-center gap-5 py-8 px-6">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-primary" />
              </div>

              <DialogHeader className="space-y-3 text-center items-center">
                <DialogTitle className="text-2xl font-bold">Success!</DialogTitle>
                <DialogDescription>
                  Report migrated to "{selectedWorkspaceName}"
                </DialogDescription>
              </DialogHeader>

              {migrateResult?.rows_pushed && (
                <div className="flex gap-4 text-xs text-muted-foreground">
                  <span>✓ {migrateResult.rows_pushed.fact_generic} KPI rows</span>
                  <span>✓ {migrateResult.rows_pushed.fact_visual_points} visual rows</span>
                </div>
              )}

              <Button onClick={handleViewReport} className="w-[180px] rounded-full bg-primary text-primary-foreground h-11">
                View Report
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
  <div className="min-h-screen flex flex-col bg-background">
  <PowerBIHeader onBack={onBack} hideBackButton={false} />
        <div className="flex-1 pt-4">
    <PowerBIMicrosoftLogin
      onBack={onBack}
      onSignInWithMicrosoft={() => setStep("workspaces")}
    />
      </div>
    </div>
  );
}