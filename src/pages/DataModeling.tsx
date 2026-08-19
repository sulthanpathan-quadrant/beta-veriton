// import { useState, useEffect, useCallback, useRef } from "react";
// import { WorkflowLayout } from "@/components/WorkflowLayout";
// import { Button } from "@/components/ui/button";
// import { Database, ArrowLeft, Loader2, X, RefreshCw, Link } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "sonner";
// import StarSchemaDiagram from "@/components/StarSchemaDiagram";
// import {
//   getModelingData,
//   submitMaterializeJob,
//   getMaterializeStatus,
//   addRelationship,
//   deleteRelationship,
//   patchEntity,
//   RelationshipPayload,
//   EntityPatchPayload,
// } from "@/components/api/api";

// // ── Progress steps for materialization pipeline ───────────────────────────
// const materializeSteps = [
//   { label: "Submitting Job",  threshold: 10 },
//   { label: "Materializing",   threshold: 30 },
//   { label: "Syncing Tables",  threshold: 60 },
//   { label: "Verifying",       threshold: 85 },
//   { label: "Done",            threshold: 100 },
// ];

// export default function DataModeling() {
//   const navigate = useNavigate();

//   const [modelingData, setModelingData] = useState<any>(null);
//   const [loadingData, setLoadingData] = useState(true);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   // ── NEW: progress bar state ──────────────────────────────────────────────
//   const [materializeProgress, setMaterializeProgress] = useState(0);
//   const [materializeStatus, setMaterializeStatus] = useState("");
//   // ────────────────────────────────────────────────────────────────────────
//   const isCancelledRef = useRef(false);

//   const userId = localStorage.getItem("user")
//     ? JSON.parse(localStorage.getItem("user") || "{}").id
//     : null;
//   const jobId = localStorage.getItem("current_job_id");

//   const closeToastButton = (
//     <button
//       onClick={() => toast.dismiss()}
//       className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
//       aria-label="Close toast"
//     >
//       <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
//     </button>
//   );

//   // ── Fetch fresh modeling data from API ────────────────────────────────────
//   const fetchModelingData = useCallback(
//     async (showRefreshToast = false) => {
//       if (!userId || !jobId) return;
//       showRefreshToast ? setIsRefreshing(true) : setLoadingData(true);
//       try {
//         const data = await getModelingData(userId, jobId);
//         setModelingData(data);
//         if (showRefreshToast) {
//           toast.success("Data refreshed", { duration: 1500, action: closeToastButton });
//         }
//       } catch (error: any) {
//         toast.error(error.message || "Failed to load modeling data", {
//           duration: 3000,
//           action: closeToastButton,
//         });
//       } finally {
//         setLoadingData(false);
//         setIsRefreshing(false);
//       }
//     },
//     [userId, jobId]
//   );

//   useEffect(() => {
//     if (!userId || !jobId) {
//       toast.warning("Missing user or job information.", {
//         duration: 2000,
//         action: closeToastButton,
//       });
//       setLoadingData(false);
//       return;
//     }
//     fetchModelingData();
//   }, [fetchModelingData]);

//   useEffect(() => {
//     isCancelledRef.current = false;
//     return () => {
//       isCancelledRef.current = true;
//     };
//   }, []);

//   // ── Delete relationship ───────────────────────────────────────────────────
//   const handleDeleteRelationship = useCallback(
//     async (relationshipId: string) => {
//       if (!userId || !jobId) return;
//       try {
//         await deleteRelationship(userId, jobId, relationshipId);
//         toast.success("Relationship deleted", { duration: 1500, action: closeToastButton });
//         await fetchModelingData();
//       } catch (error: any) {
//         toast.error(error.message || "Failed to delete relationship", {
//           duration: 3000,
//           action: closeToastButton,
//         });
//       }
//     },
//     [userId, jobId, fetchModelingData]
//   );

//   // ── Add relationship ──────────────────────────────────────────────────────
//   const handleAddRelationship = useCallback(
//     async (payload: RelationshipPayload) => {
//       if (!userId || !jobId) return;
//       try {
//         await addRelationship(userId, jobId, payload);
//         toast.success(
//           `Relationship added: ${payload.from_table} → ${payload.to_table}`,
//           { duration: 2000, action: closeToastButton }
//         );
//         await fetchModelingData();
//       } catch (error: any) {
//         toast.error(error.message || "Failed to add relationship", {
//           duration: 3000,
//           action: closeToastButton,
//         });
//       }
//     },
//     [userId, jobId, fetchModelingData]
//   );

//   // ── Edit entity ───────────────────────────────────────────────────────────
//   const handleEditEntity = useCallback(
//     async (entityName: string, payload: EntityPatchPayload) => {
//       if (!userId || !jobId) return;
//       try {
//         await patchEntity(userId, jobId, entityName, payload);
//         toast.success(`${entityName} updated`, { duration: 1500, action: closeToastButton });
//         await fetchModelingData();
//       } catch (error: any) {
//         toast.error(error.message || "Failed to update entity", {
//           duration: 3000,
//           action: closeToastButton,
//         });
//       }
//     },
//     [userId, jobId, fetchModelingData]
//   );

//   // ── Materialize + navigate to Data Preview ────────────────────────────────
//   const handleNextToDataPreview = async () => {
//     if (isProcessing) return;
//     if (!userId || !jobId) {
//       toast.error("Missing user or job information.", {
//         duration: 1000,
//         action: closeToastButton,
//       });
//       return;
//     }

//     setIsProcessing(true);
//     setMaterializeProgress(10);
//     setMaterializeStatus("Submitting materialization job...");

//     try {
//       const submitData = await submitMaterializeJob(userId, jobId);

//       if (!submitData.job_instance_id) {
//         throw new Error("No job_instance_id returned");
//       }

//       setMaterializeProgress(30);
//       setMaterializeStatus("Materializing tables...");

//       const maxAttempts = 60; // 10 minutes (10s interval)
//       let attempts = 0;

//       while (attempts < maxAttempts) {
//         if (isCancelledRef.current) {
//           setIsProcessing(false);
//           return;
//         }
//         attempts++;

//         const statusData = await getMaterializeStatus(
//           submitData.job_instance_id,
//           userId,
//           jobId
//         );

//         const s = statusData.fabric_status;

//         // Nudge progress forward while polling (capped at 82)
//         setMaterializeProgress(prev => (prev < 82 ? prev + 2 : prev));
//         setMaterializeStatus("Syncing and building tables...");

//         // ❌ Failed
//         if (s === "Failed" || s === "Error") {
//           const reason =
//             typeof statusData.error === "string"
//               ? statusData.error
//               : statusData.error?.message || "Unknown reason";
//           throw new Error(`Materialization failed: ${reason}`);
//         }

//         // ✅ Completed → verify preview API ready
//         if (s === "Succeeded" || s === "Completed") {
//           setMaterializeProgress(85);
//           setMaterializeStatus("Verifying preview readiness...");

//           await new Promise(res => setTimeout(res, 600));

//           if (!statusData.ready_for_preview) {
//             const failedList = statusData.failed_tables?.join(", ") || "unknown";
//             setMaterializeProgress(0);
//             setMaterializeStatus("");
//             setIsProcessing(false);
//             toast.error(
//               `Materialization completed but some tables failed: ${failedList}`,
//               { duration: 2000, action: closeToastButton }
//             );
//             return;
//           }

//           setMaterializeProgress(100);
//           setMaterializeStatus("Completed! Redirecting...");

//           toast.success("Materialization complete!", {
//             duration: 2000,
//             action: closeToastButton,
//           });

//           setTimeout(() => navigate("/workflow/data-preview"), 800);
//           return;
//         }

//         // Still running → wait 10 s before next poll
//         await new Promise(res => setTimeout(res, 10000));
//       }

//       throw new Error("Materialization timed out.");
//     } catch (error: any) {
//       setMaterializeProgress(0);
//       setMaterializeStatus("");
//       setIsProcessing(false);
//       toast.error(error.message || "Materialization failed", {
//         duration: 2000,
//         action: closeToastButton,
//       });
//     }
//   };

//   return (
//     <WorkflowLayout>
//       <div className="p-8">

//         {/* Header */}
//         <div className="mb-6 flex items-start justify-between">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground mb-2">
//               Automated Data Modeling
//             </h1>
//             <p className="text-muted-foreground">
//               AI-generated schema from your data sources
//             </p>
//           </div>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={() => fetchModelingData(true)}
//             disabled={isRefreshing || loadingData}
//             className="gap-2 mt-1"
//           >
//             <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
//             Refresh
//           </Button>
//         </div>

//         {/* Diagram */}
//         <div className="border border-border rounded-lg p-6 bg-card mb-4">
//           <div className="flex items-center mb-4">
//             <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
//               <Database className="h-5 w-5" />
//               Schema — {modelingData?.model?.type || "STAR_SCHEMA"}
//             </h2>
//             {modelingData && (
//               <div className="ml-auto flex gap-4 text-sm text-muted-foreground">
//                 <span>
//                   <span className="font-medium text-foreground">
//                     {modelingData.summary?.total_tables ?? 0}
//                   </span>{" "}
//                   tables
//                 </span>
//                 <span>
//                   <span className="font-medium text-foreground">
//                     {modelingData.summary?.total_relationships ?? 0}
//                   </span>{" "}
//                   relationships
//                 </span>
//               </div>
//             )}
//           </div>

//           {loadingData ? (
//             <div className="flex items-center justify-center h-96">
//               <Loader2 className="h-10 w-10 animate-spin text-primary" />
//             </div>
//           ) : modelingData ? (
//             <StarSchemaDiagram
//               modelingData={modelingData}
//               onDeleteRelationship={handleDeleteRelationship}
//               onAddRelationship={handleAddRelationship}
//               onEditEntity={handleEditEntity}
//             />
//           ) : (
//             <div className="flex items-center justify-center h-96 text-muted-foreground">
//               No modeling data available. Run processing first.
//             </div>
//           )}
//         </div>

//         {/* Legend */}
//         <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-6 px-1">
//           <div className="flex items-center gap-1.5">
//             <div className="w-3 h-3 rounded border-2 border-cyan-500 bg-cyan-950/30" />
//             <span>Fact Table</span>
//           </div>
//           <div className="flex items-center gap-1.5">
//             <div className="w-3 h-3 rounded border border-blue-500 bg-card" />
//             <span>Dimension Table</span>
//           </div>
//           <span className="text-muted-foreground/60 ml-2">
//             Click node to edit columns · Click{" "}
//             <Link className="h-3 w-3 inline-block text-muted-foreground" /> on node
//             to link tables · Click edge to delete
//           </span>
//         </div>

//         {/* ── Bottom Actions + Progress Bar ── */}
//         <div className="flex flex-col gap-4 mt-4">

//           {/* Progress UI — only visible while materializing */}
//           {isProcessing && (
//             <div className="w-full rounded-xl border border-border bg-card/60 p-5 space-y-4">
//               {/* Step indicators */}
//               <div className="flex items-center justify-between">
//                 {materializeSteps.map((step, i) => {
//                   const reached = materializeProgress >= step.threshold;
//                   const active =
//                     materializeProgress >= step.threshold &&
//                     (i === materializeSteps.length - 1 ||
//                       materializeProgress < materializeSteps[i + 1].threshold);
//                   return (
//                     <div key={step.label} className="flex flex-col items-center gap-1 flex-1">
//                       <div
//                         className={[
//                           "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500",
//                           reached
//                             ? "bg-primary border-primary text-primary-foreground"
//                             : "bg-muted border-border text-muted-foreground",
//                           active ? "ring-2 ring-primary/40 ring-offset-2" : "",
//                         ].join(" ")}
//                       >
//                         {reached && !active ? (
//                           <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
//                             <path
//                               d="M2 6l3 3 5-5"
//                               stroke="currentColor"
//                               strokeWidth="2"
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                             />
//                           </svg>
//                         ) : (
//                           i + 1
//                         )}
//                       </div>
//                       <span
//                         className={[
//                           "text-[10px] font-medium text-center leading-tight",
//                           reached ? "text-primary" : "text-muted-foreground",
//                         ].join(" ")}
//                       >
//                         {step.label}
//                       </span>
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Bar */}
//               <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
//                 <div
//                   className="h-full rounded-full transition-all duration-700 ease-in-out"
//                   style={{
//                     width: `${materializeProgress}%`,
//                     background:
//                       materializeProgress === 100
//                         ? "hsl(var(--primary))"
//                         : "linear-gradient(90deg, hsl(var(--primary)/0.7), hsl(var(--primary)))",
//                   }}
//                 />
//               </div>

//               {/* Status text + percentage */}
//               <div className="flex items-center justify-between text-sm">
//                 <div className="flex items-center gap-2 text-muted-foreground">
//                   {materializeProgress < 100 ? (
//                     <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
//                   ) : (
//                     <svg
//                       className="w-3.5 h-3.5 text-primary flex-shrink-0"
//                       viewBox="0 0 12 12"
//                       fill="none"
//                     >
//                       <path
//                         d="M2 6l3 3 5-5"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                   )}
//                   <span>{materializeStatus}</span>
//                 </div>
//                 <span className="font-semibold text-primary tabular-nums">
//                   {materializeProgress}%
//                 </span>
//               </div>

//               {materializeProgress < 100 && (
//                 <p className="text-xs text-muted-foreground">
//                   Please wait — materializing tables may take several minutes.
//                 </p>
//               )}
//             </div>
//           )}

//           {/* Back + Next row */}
//           <div className="flex justify-between items-center">
//             <Button
//               variant="outline"
//               onClick={() => navigate("/workflow/landing-zone")}
//             >
//               <ArrowLeft className="mr-2 h-4 w-4" />
//               Back
//             </Button>

//             <Button
//               onClick={handleNextToDataPreview}
//               disabled={isProcessing || loadingData || !modelingData}
//               className="gap-2 min-w-[220px]"
//             >
//               {isProcessing ? (
//                 <>
//                   <Loader2 className="h-4 w-4 animate-spin" />
//                   Materializing Tables...
//                 </>
//               ) : (
//                 "Next to Data Preview"
//               )}
//             </Button>
//           </div>
//         </div>

//       </div>
//     </WorkflowLayout>
//   );
// }



import { useState, useEffect, useCallback, useRef } from "react";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import { Database, ArrowLeft, Loader2, X, RefreshCw, Link } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import StarSchemaDiagram from "@/components/StarSchemaDiagram";
import {
  getModelingData,
  submitMaterializeJob,
  getMaterializeStatus,
  addRelationship,
  deleteRelationship,
  patchEntity,
  RelationshipPayload,
  EntityPatchPayload,
} from "@/components/api/api";

// ── Progress steps for materialization pipeline ───────────────────────────
const materializeSteps = [
  { label: "Submitting Job",  threshold: 10 },
  { label: "Materializing",   threshold: 30 },
  { label: "Syncing Tables",  threshold: 60 },
  { label: "Verifying",       threshold: 85 },
  { label: "Done",            threshold: 100 },
];

// ── NEW: helpers for the Databricks-platform datamodel route ───────────────

/**
 * Reads the "user" object from localStorage and returns true if the user's
 * dataplatform is "Databricks". This decides whether we call the
 * Databricks datamodel-generation API instead of the default getModelingData().
 */
function isDatabricksUser(): boolean {
  try {
    const userData = localStorage.getItem("user");

    if (!userData) return false;

    const user = JSON.parse(userData);

    return user?.dataplatform === "Databricks";
  } catch (err) {
    console.error("Failed to read dataplatform from localStorage user:", err);

    return false;
  }
}

const databricksGenerateDatamodelUrl = (userId: string, jobId: string) =>
  `https://api.veriton.ai/api/service-databricks/datamodel/${userId}/${jobId}`;

const databricksInvokeDataPreviewUrl = (userId: string, jobId: string) =>
  `https://api.veriton.ai/api/service-databricks/invoke-data-preview/${userId}/${jobId}`;

/**
 * StarSchemaDiagram does exact string matches against "FACT" / "DIM" to
 * decide layout (which table is the central fact node, badge labels, etc).
 * Databricks has been observed returning full words like "DIMENSION"
 * instead of "DIM" — normalize anything that isn't clearly a fact table
 * down to "DIM" so that logic keeps working regardless of exact wording.
 */
function normalizeDatabricksTableType(rawType: string | undefined): "FACT" | "DIM" {
  const upper = (rawType || "").toUpperCase();
  return upper.includes("FACT") ? "FACT" : "DIM";
}

/**
 * Maps a single Databricks table object into the shape StarSchemaDiagram
 * actually reads (`col.name`, `table.primary_keys` as an array, etc).
 * Databricks returns `column_name` (not `name`) per column and a singular
 * `primary_key` string (not a `primary_keys` array) per table.
 */
function mapDatabricksTable(table: any) {
  const columns = (table.columns || []).map((col: any) => ({
    name: col.column_name ?? col.name,
    display_label: col.display_label ?? col.column_name ?? col.name,
    data_type: col.data_type,
    is_primary_key: !!col.is_primary_key,
    is_foreign_key: !!col.is_foreign_key,
    is_surrogate: !!col.is_surrogate,
  }));

  const primary_keys: string[] = table.primary_keys
    ? table.primary_keys
    : table.primary_key
      ? [table.primary_key]
      : columns.filter((c: any) => c.is_primary_key).map((c: any) => c.name);

  return {
    table_name: table.table_name,
    table_type: normalizeDatabricksTableType(table.table_type),
    row_count: table.row_count ?? 0,
    primary_keys,
    columns,
  };
}

/**
 * Maps a single Databricks relationship object into the shape
 * StarSchemaDiagram actually reads (`from_table`/`from_column`/`to_table`/
 * `to_column`/`relationship_type`/`relationship_id`). Databricks returns
 * `parent_table`/`parent_column`/`child_table`/`child_column`/
 * `relationship` instead — this is why connection lines weren't rendering
 * even though the relationships array had data in it.
 */
function mapDatabricksRelationship(rel: any) {
  const fromTable = rel.parent_table ?? rel.from_table;
  const fromColumn = rel.parent_column ?? rel.from_column;
  const toTable = rel.child_table ?? rel.to_table;
  const toColumn = rel.child_column ?? rel.to_column;
  const relationshipType = rel.relationship ?? rel.relationship_type ?? "1:M";

  return {
    relationship_id:
      rel.relationship_id || `${fromTable}.${fromColumn}-->${toTable}.${toColumn}`,
    from_table: fromTable,
    from_column: fromColumn,
    to_table: toTable,
    to_column: toColumn,
    relationship_type: relationshipType,
  };
}

/**
 * Maps the Databricks /datamodel/{user_id}/{job_id} response into the shape
 * the rest of this component (and StarSchemaDiagram) expects from
 * getModelingData().
 */
function mapDatabricksDatamodelResponse(response: any) {
  const rawTables = response?.result?.tables || [];
  const rawRelationships = response?.result?.relationships || [];

  const tables = rawTables.map(mapDatabricksTable);
  const relationships = rawRelationships.map(mapDatabricksRelationship);

  return {
    model: { type: "STAR_SCHEMA" },

    summary: {
      total_tables: tables.length,
      total_relationships: relationships.length,
    },

    tables,
    relationships,

    // Keep the raw result around too, in case other consumers expect it.
    result: response?.result,
  };
}

export default function DataModeling() {
  const navigate = useNavigate();

  const [modelingData, setModelingData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  // ── NEW: progress bar state ──────────────────────────────────────────────
  const [materializeProgress, setMaterializeProgress] = useState(0);
  const [materializeStatus, setMaterializeStatus] = useState("");
  // ────────────────────────────────────────────────────────────────────────
  const isCancelledRef = useRef(false);

  const userId = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}").id
    : null;
  const jobId = localStorage.getItem("current_job_id");

  const closeToastButton = (
    <button
      onClick={() => toast.dismiss()}
      className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
      aria-label="Close toast"
    >
      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
    </button>
  );

  // ── Fetch fresh modeling data from API ────────────────────────────────────
  // ── NEW: branches to the Databricks datamodel-generation API when the
  // logged-in user's dataplatform is "Databricks", otherwise keeps the
  // existing getModelingData() call.
  const fetchModelingData = useCallback(
    async (showRefreshToast = false) => {
      if (!userId || !jobId) return;
      showRefreshToast ? setIsRefreshing(true) : setLoadingData(true);
      try {
        const useDatabricksRoute = isDatabricksUser();

        let data: any;

        if (useDatabricksRoute) {
          const response = await fetch(
            databricksGenerateDatamodelUrl(userId, jobId),
            {
              method: "POST",
              headers: { Accept: "application/json" },
            },
          );

          if (!response.ok) {
            const errText = await response.text();
            throw new Error(errText || "Failed to generate data model");
          }

          const result = await response.json();

          data = mapDatabricksDatamodelResponse(result);
        } else {
          data = await getModelingData(userId, jobId);
        }

        setModelingData(data);
        if (showRefreshToast) {
          toast.success("Data refreshed", { duration: 1500, action: closeToastButton });
        }
      } catch (error: any) {
        toast.error(error.message || "Failed to load modeling data", {
          duration: 3000,
          action: closeToastButton,
        });
      } finally {
        setLoadingData(false);
        setIsRefreshing(false);
      }
    },
    [userId, jobId]
  );

  useEffect(() => {
    if (!userId || !jobId) {
      toast.warning("Missing user or job information.", {
        duration: 2000,
        action: closeToastButton,
      });
      setLoadingData(false);
      return;
    }
    fetchModelingData();
  }, [fetchModelingData]);

  useEffect(() => {
    isCancelledRef.current = false;
    return () => {
      isCancelledRef.current = true;
    };
  }, []);

  // ── Delete relationship ───────────────────────────────────────────────────
  const handleDeleteRelationship = useCallback(
    async (relationshipId: string) => {
      if (!userId || !jobId) return;
      try {
        await deleteRelationship(userId, jobId, relationshipId);
        toast.success("Relationship deleted", { duration: 1500, action: closeToastButton });
        await fetchModelingData();
      } catch (error: any) {
        toast.error(error.message || "Failed to delete relationship", {
          duration: 3000,
          action: closeToastButton,
        });
      }
    },
    [userId, jobId, fetchModelingData]
  );

  // ── Add relationship ──────────────────────────────────────────────────────
  const handleAddRelationship = useCallback(
    async (payload: RelationshipPayload) => {
      if (!userId || !jobId) return;
      try {
        await addRelationship(userId, jobId, payload);
        toast.success(
          `Relationship added: ${payload.from_table} → ${payload.to_table}`,
          { duration: 2000, action: closeToastButton }
        );
        await fetchModelingData();
      } catch (error: any) {
        toast.error(error.message || "Failed to add relationship", {
          duration: 3000,
          action: closeToastButton,
        });
      }
    },
    [userId, jobId, fetchModelingData]
  );

  // ── Edit entity ───────────────────────────────────────────────────────────
  const handleEditEntity = useCallback(
    async (entityName: string, payload: EntityPatchPayload) => {
      if (!userId || !jobId) return;
      try {
        await patchEntity(userId, jobId, entityName, payload);
        toast.success(`${entityName} updated`, { duration: 1500, action: closeToastButton });
        await fetchModelingData();
      } catch (error: any) {
        toast.error(error.message || "Failed to update entity", {
          duration: 3000,
          action: closeToastButton,
        });
      }
    },
    [userId, jobId, fetchModelingData]
  );

  // ── Materialize + navigate to Data Preview ────────────────────────────────
  const handleNextToDataPreview = async () => {
    if (isProcessing) return;
    if (!userId || !jobId) {
      toast.error("Missing user or job information.", {
        duration: 1000,
        action: closeToastButton,
      });
      return;
    }

    setIsProcessing(true);
    setMaterializeProgress(10);
    setMaterializeStatus("Submitting materialization job...");

    try {
      const useDatabricksRoute = isDatabricksUser();

      if (useDatabricksRoute) {
        // ── NEW: Databricks users trigger the invoke-data-preview job
        // instead of the default submitMaterializeJob/getMaterializeStatus
        // flow below, which is wired for the Fabric materialization
        // pipeline and doesn't apply to Databricks.

        setMaterializeStatus("Materializing tables...");
        setMaterializeProgress(30);

        // NOTE: no status-polling endpoint was provided for this run_id
        // (unlike the /ingest/{run_id} route used elsewhere), so there's no
        // way to check real progress. Instead of jumping straight to 100%,
        // this just nudges the bar forward visually on a timer — no API
        // calls — for as long as the invoke-data-preview request is still
        // in flight, then jumps to 100% once the actual response comes back.
        const simInterval = setInterval(() => {
          setMaterializeProgress((prev) => (prev < 90 ? prev + 2 : prev));
        }, 1000);

        let response: Response;

        try {
          response = await fetch(
            databricksInvokeDataPreviewUrl(userId, jobId),
            {
              method: "POST",
              headers: { Accept: "application/json" },
            },
          );
        } finally {
          clearInterval(simInterval);
        }

        if (!response.ok) {
          throw new Error(
            `Data preview trigger failed: ${await response.text()}`,
          );
        }

        const triggerData = await response.json();

        console.log("Databricks data preview run triggered:", triggerData);

        // Persist run_id so DataPreview.tsx can poll the real run status
        // (GET /invoke-data-preview/status/{run_id}) before letting the
        // user proceed to Data Creation.
        if (triggerData?.run_id) {
          localStorage.setItem(
            `databricks_preview_run_id_${jobId}`,
            String(triggerData.run_id),
          );
        }

        setMaterializeProgress(100);
        setMaterializeStatus("Completed! Redirecting...");

        toast.success("Data preview generation triggered!", {
          duration: 2000,
          action: closeToastButton,
        });

        setTimeout(() => navigate("/workflow/data-preview"), 800);

        return;
      }

      const submitData = await submitMaterializeJob(userId, jobId);

      if (!submitData.job_instance_id) {
        throw new Error("No job_instance_id returned");
      }

      setMaterializeProgress(30);
      setMaterializeStatus("Materializing tables...");

      const maxAttempts = 60; // 10 minutes (10s interval)
      let attempts = 0;

      while (attempts < maxAttempts) {
        if (isCancelledRef.current) {
          setIsProcessing(false);
          return;
        }
        attempts++;

        const statusData = await getMaterializeStatus(
          submitData.job_instance_id,
          userId,
          jobId
        );

        const s = statusData.fabric_status;

        // Nudge progress forward while polling (capped at 82)
        setMaterializeProgress(prev => (prev < 82 ? prev + 2 : prev));
        setMaterializeStatus("Syncing and building tables...");

        // ❌ Failed
        if (s === "Failed" || s === "Error") {
          const reason =
            typeof statusData.error === "string"
              ? statusData.error
              : statusData.error?.message || "Unknown reason";
          throw new Error(`Materialization failed: ${reason}`);
        }

        // ✅ Completed → verify preview API ready
        if (s === "Succeeded" || s === "Completed") {
          setMaterializeProgress(85);
          setMaterializeStatus("Verifying preview readiness...");

          await new Promise(res => setTimeout(res, 600));

          if (!statusData.ready_for_preview) {
            const failedList = statusData.failed_tables?.join(", ") || "unknown";
            setMaterializeProgress(0);
            setMaterializeStatus("");
            setIsProcessing(false);
            toast.error(
              `Materialization completed but some tables failed: ${failedList}`,
              { duration: 2000, action: closeToastButton }
            );
            return;
          }

          setMaterializeProgress(100);
          setMaterializeStatus("Completed! Redirecting...");

          toast.success("Materialization complete!", {
            duration: 2000,
            action: closeToastButton,
          });

          setTimeout(() => navigate("/workflow/data-preview"), 800);
          return;
        }

        // Still running → wait 10 s before next poll
        await new Promise(res => setTimeout(res, 10000));
      }

      throw new Error("Materialization timed out.");
    } catch (error: any) {
      setMaterializeProgress(0);
      setMaterializeStatus("");
      setIsProcessing(false);
      toast.error(error.message || "Materialization failed", {
        duration: 2000,
        action: closeToastButton,
      });
    }
  };

  return (
    <WorkflowLayout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Automated Data Modeling
            </h1>
            <p className="text-muted-foreground">
              AI-generated schema from your data sources
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchModelingData(true)}
            disabled={isRefreshing || loadingData}
            className="gap-2 mt-1"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Diagram */}
        <div className="border border-border rounded-lg p-6 bg-card mb-4">
          <div className="flex items-center mb-4">
            <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Database className="h-5 w-5" />
              Schema — {modelingData?.model?.type || "STAR_SCHEMA"}
            </h2>
            {modelingData && (
              <div className="ml-auto flex gap-4 text-sm text-muted-foreground">
                <span>
                  <span className="font-medium text-foreground">
                    {modelingData.summary?.total_tables ?? 0}
                  </span>{" "}
                  tables
                </span>
                <span>
                  <span className="font-medium text-foreground">
                    {modelingData.summary?.total_relationships ?? 0}
                  </span>{" "}
                  relationships
                </span>
              </div>
            )}
          </div>

          {loadingData ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : modelingData ? (
            <StarSchemaDiagram
              modelingData={modelingData}
              onDeleteRelationship={handleDeleteRelationship}
              onAddRelationship={handleAddRelationship}
              onEditEntity={handleEditEntity}
            />
          ) : (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
              No modeling data available. Run processing first.
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mb-6 px-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border-2 border-cyan-500 bg-cyan-950/30" />
            <span>Fact Table</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded border border-blue-500 bg-card" />
            <span>Dimension Table</span>
          </div>
          <span className="text-muted-foreground/60 ml-2">
            Click node to edit columns · Click{" "}
            <Link className="h-3 w-3 inline-block text-muted-foreground" /> on node
            to link tables · Click edge to delete
          </span>
        </div>

        {/* ── Bottom Actions + Progress Bar ── */}
        <div className="flex flex-col gap-4 mt-4">

          {/* Progress UI — only visible while materializing */}
          {isProcessing && (
            <div className="w-full rounded-xl border border-border bg-card/60 p-5 space-y-4">
              {/* Step indicators */}
              <div className="flex items-center justify-between">
                {materializeSteps.map((step, i) => {
                  const reached = materializeProgress >= step.threshold;
                  const active =
                    materializeProgress >= step.threshold &&
                    (i === materializeSteps.length - 1 ||
                      materializeProgress < materializeSteps[i + 1].threshold);
                  return (
                    <div key={step.label} className="flex flex-col items-center gap-1 flex-1">
                      <div
                        className={[
                          "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500",
                          reached
                            ? "bg-primary border-primary text-primary-foreground"
                            : "bg-muted border-border text-muted-foreground",
                          active ? "ring-2 ring-primary/40 ring-offset-2" : "",
                        ].join(" ")}
                      >
                        {reached && !active ? (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none">
                            <path
                              d="M2 6l3 3 5-5"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          i + 1
                        )}
                      </div>
                      <span
                        className={[
                          "text-[10px] font-medium text-center leading-tight",
                          reached ? "text-primary" : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Bar */}
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-in-out"
                  style={{
                    width: `${materializeProgress}%`,
                    background:
                      materializeProgress === 100
                        ? "hsl(var(--primary))"
                        : "linear-gradient(90deg, hsl(var(--primary)/0.7), hsl(var(--primary)))",
                  }}
                />
              </div>

              {/* Status text + percentage */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {materializeProgress < 100 ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
                  ) : (
                    <svg
                      className="w-3.5 h-3.5 text-primary flex-shrink-0"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                  <span>{materializeStatus}</span>
                </div>
                <span className="font-semibold text-primary tabular-nums">
                  {materializeProgress}%
                </span>
              </div>

              {materializeProgress < 100 && (
                <p className="text-xs text-muted-foreground">
                  Please wait — materializing tables may take several minutes.
                </p>
              )}
            </div>
          )}

          {/* Back + Next row */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => navigate("/workflow/landing-zone")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            <Button
              onClick={handleNextToDataPreview}
              disabled={isProcessing || loadingData || !modelingData}
              className="gap-2 min-w-[220px]"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Materializing Tables...
                </>
              ) : (
                "Next to Data Preview"
              )}
            </Button>
          </div>
        </div>

      </div>
    </WorkflowLayout>
  );
}