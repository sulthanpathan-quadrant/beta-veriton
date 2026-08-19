// import { useState, useEffect } from "react";
// import { WorkflowLayout } from "@/components/WorkflowLayout";
// import { Button } from "@/components/ui/button";
// import {
//   ArrowLeft,
//   Calendar,
//   Clock,
//   Code2,
//   Edit,
//   Eye,
//   Loader2,
//   Play,
//   Plus,
//   Settings2,
//   Trash,
//   X,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { toast, useToast } from "@/hooks/use-toast";
// import { AddBusinessRuleDialog } from "@/components/AddBusinessRuleDialog";
// import { BusinessRuleValidationDialog } from "@/components/BusinessRuleValidationDialog";
// import { BusinessRuleCompleteDialog } from "@/components/BusinessRuleCompleteDialog";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// // import { Workflowheader} from "@/components/Workflowheader1";
// import { Workflowheader } from "@/components/WorkFlowHeader1";

// interface Column {
//   name: string;
//   table: string;
//   type: string;
// }

// interface BuiltDataset {
//   name: string;
//   columns: Column[];
//   sampleRows: Record<string, any>[];
// }

// export default function ETLOutput() {
//   const navigate = useNavigate();
//   const { dismiss } = useToast();

//   const [builtDataset, setBuiltDataset] = useState<BuiltDataset | null>(null);
//   const [fullPreviewData, setFullPreviewData] = useState<Record<string, any>[]>([]);
//   const [showFullPreview, setShowFullPreview] = useState(false);
//   const [isPreviewLoading, setIsPreviewLoading] = useState(false);

//   // Business rules
//   const [rules, setRules] = useState<any[]>([]);
//   const [showAddRuleDialog, setShowAddRuleDialog] = useState(false);
//   const [showValidationDialog, setShowValidationDialog] = useState(false);
//   const [validating, setValidating] = useState(false);
//   const [showCompleteDialog, setShowCompleteDialog] = useState(false);
//   const [editingRule, setEditingRule] = useState<number | null>(null);
//   const [jobInfo, setJobInfo] = useState<{ correlation_id?: string; databricks_run_id?: string; message?: string } | null>(null);

//   // Schedule dialog
//   const [showScheduleDialog, setShowScheduleDialog] = useState(false);
//   const [triggerType, setTriggerType] = useState<"schedule" | "file">("schedule");
//   const [frequency, setFrequency] = useState("");
//   const [time, setTime] = useState("");
//   const [jobName, setJobName] = useState("");
//   const [loading, setLoading] = useState(false);

//   const [workflowStep, setWorkflowStep] = useState<"preview" | "business-rules">("preview");
//  const [showFullPreviewInline, setShowFullPreviewInline] = useState(false);

//   const closeToastButton = (
//     <button
//       onClick={() => dismiss()}
//       className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
//       aria-label="Close toast"
//     >
//       <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
//     </button>
//   );

//   // Fetch dataset columns + preview rows (only used for full preview)
//   useEffect(() => {
//     const userId = localStorage.getItem("selected_user_id");
//     const jobId = localStorage.getItem("selected_job_id");
//     const datasetName = localStorage.getItem("selected_dataset_name");

//     if (!userId || !jobId || !datasetName) {
//       toast({
//         title: "Missing Information",
//         description: "User ID, Job ID or Dataset name not found",
//         variant: "destructive",
//         action: closeToastButton,
//       });
//       return;
//     }

//     const fetchData = async () => {
//       setIsPreviewLoading(true);
//       try {
//         // Columns
//         const columnsRes = await fetch(
//           `https://api.veriton.ai/api/service2/dataset-list-columns?user_id=${userId}&job_id=${jobId}&filename=${datasetName}`,
//           { headers: { accept: "application/json" } }
//         );
//         if (!columnsRes.ok) throw new Error("Columns fetch failed");
//         const columnsData = await columnsRes.json();
//         const columns = columnsData.columns?.map((c: { name: string; type: string }) => ({
//           name: c.name,
//           type: c.type,
//           table: datasetName,
//         })) ?? [];

//         // Preview rows (for full preview dialog)
//         const previewRes = await fetch(
//           `https://api.veriton.ai/api/service2/preview-dataset?user_id=${userId}&job_id=${jobId}&datasetname=${encodeURIComponent(datasetName)}`,
//           { headers: { accept: "application/json" } }
//         );
//         if (!previewRes.ok) throw new Error("Preview fetch failed");
//         const previewJson = await previewRes.json();
//         const rows = previewJson.preview_rows ?? previewJson.rows ?? previewJson ?? [];

//         const sampleRows = Array.isArray(rows) ? rows : [];

//         setBuiltDataset({
//           name: datasetName,
//           columns,
//           sampleRows,
//         });
//         setFullPreviewData(sampleRows);
//       } catch (err: any) {
//         console.error(err);
//         toast({
//           title: "Load Error",
//           description: err.message || "Failed to load dataset information",
//           variant: "destructive",
//           action: closeToastButton,
//         });
//       } finally {
//         setIsPreviewLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   // Job name from localStorage
//   useEffect(() => {
//     const etlJobName = localStorage.getItem("currentJobName");
//     const etlTableName = localStorage.getItem("etlTableName");
//     if (etlJobName) setJobName(etlJobName);
//     else if (etlTableName) setJobName(`Job_${etlTableName}`);
//   }, []);

//   const getUserId = () => localStorage.getItem("selected_user_id");

//   const scheduleJob = async () => {
//     if (triggerType === "schedule" && !frequency) {
//       toast({
//         variant: "destructive",
//         title: "Validation Error",
//         description: "Please select a frequency",
//         action: closeToastButton,
//       });
//       return;
//     }

//     const userId = getUserId();
//     if (!userId) {
//       toast({
//         variant: "destructive",
//         title: "Authentication Error",
//         description: "User ID not found",
//         action: closeToastButton,
//       });
//       return;
//     }

//     setLoading(true);

//     const jobId = localStorage.getItem("selected_job_id") || "";

//     const payload = {
//       job_id: jobId,
//       job_name: jobName || `Job_${new Date().toISOString().split("T")[0]}`,
//       schedule_details:
//         triggerType === "schedule" ? { frequency, time: time || "00:00" } : null,
//     };

//     try {
//       const url = `https://api.veriton.ai/api/service1/schedule-job?user_id=${userId}`;
//       const res = await fetch(url, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) {
//         const errText = await res.text();
//         throw new Error(errText || `HTTP ${res.status}`);
//       }

//       const data = await res.json();

//       if (data.message?.toLowerCase().includes("success")) {
//         toast({
//           title: "Success",
//           description: "Job scheduled successfully",
//           action: closeToastButton,
//         });

//         localStorage.removeItem("currentJobName");
//         localStorage.removeItem("etlTableName");

//         setShowScheduleDialog(false);
//         navigate("/jobs");
//       } else {
//         throw new Error(data.message || "Scheduling failed");
//       }
//     } catch (err: any) {
//       toast({
//         variant: "destructive",
//         title: "Error",
//         description: err.message || "Failed to schedule job",
//         action: closeToastButton,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleAddRule = (rule: any) => {
//     if (editingRule !== null) {
//       const updated = [...rules];
//       updated[editingRule] = { ...rule, status: "testing" };
//       setRules(updated);
//       setEditingRule(null);
//     } else {
//       setRules([...rules, { ...rule, status: "testing" }]);
//     }
//     setShowAddRuleDialog(false);
//     toast({
//       title: editingRule !== null ? "Rule Updated" : "Rule Added",
//       description: `Business rule ${editingRule !== null ? "updated" : "added"} successfully`,
//       duration: 1400,
//       action: closeToastButton,
//     });
//   };

//   const handleEditRule = (index: number) => {
//     setEditingRule(index);
//     setShowAddRuleDialog(true);
//   };

//   const handleDeleteRule = (index: number) => {
//     setRules(rules.filter((_, i) => i !== index));
//     toast({
//       title: "Rule Deleted",
//       description: "Business rule has been removed",
//       duration: 1200,
//       action: closeToastButton,
//     });
//   };

//   const handleRunAllRules = async () => {
//     if (rules.length === 0 || !builtDataset?.name) {
//       toast({
//         title: "Cannot Run",
//         description: rules.length === 0 ? "No rules defined" : "No dataset loaded",
//         variant: "destructive",
//         action: closeToastButton,
//       });
//       return;
//     }

//     let filename = builtDataset.name;
//     if (!filename.toLowerCase().endsWith(".csv")) filename += ".csv";

//     const userId = localStorage.getItem("selected_user_id");
//     const jobId = localStorage.getItem("selected_job_id");
//     if (!userId || !jobId) return;

//     const blobPath = `${userId}/${jobId}/${filename}`;

//     const rulesPayload: Record<string, string> = {};
//     rules.forEach((r) => (rulesPayload[r.name] = r.logic));

//     const payload = {
//       blob_path: blobPath,
//       rules: rulesPayload,
//       mode: "auto",
//       overwrite_source: false,
//       output_blob_path: `processed/${builtDataset.name.replace(/\.csv$/i, "")}_filtered.csv`,
//     };

//     setValidating(true);
//     setShowValidationDialog(true);
//     setJobInfo(null);

//     try {
//       const res = await fetch("https://api.veriton.ai/api/service2/api/v1/business-rules/process", {
//         method: "POST",
//         headers: { "Content-Type": "application/json", Accept: "application/json" },
//         body: JSON.stringify(payload),
//       });

//       if (!res.ok) throw new Error(`API error: ${res.status}`);

//       const result = await res.json();

//       if (result.status === "job_submitted") {
//         setJobInfo({
//           correlation_id: result.correlation_id,
//           databricks_run_id: result.databricks_run_id,
//           message: result.message,
//         });
//         toast({
//           title: "Job Submitted",
//           description: "Business rules processing started",
//           action: closeToastButton,
//         });
//       } else {
//         throw new Error(result.message || "Unexpected response");
//       }
//     } catch (err: any) {
//       toast({
//         title: "Submission Failed",
//         description: err.message || "Could not start business rules job",
//         variant: "destructive",
//         action: closeToastButton,
//       });
//     } finally {
//       setValidating(false);
//       setTimeout(() => {
//         setShowValidationDialog(false);
//         setShowCompleteDialog(true);
//       }, 1400);
//     }
//   };

//   const handleBack = () => {
//     setWorkflowStep("preview");
//   };

//   const toggleFullPreview = () => {
//     setShowFullPreviewInline((prev) => !prev);
//   };

//   return (
//     <div className="min-h-screen bg-background flex flex-col overflow-hidden">
//       <Workflowheader/>
//       <div className="p-6 md:p-8">
//         {/* Header + top-right buttons */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
//           <div>
//             <h1 className="text-3xl md:text-4xl font-bold">ETL Pipeline</h1>
//             <p className="text-muted-foreground mt-1">
//               {workflowStep === "preview" && "Review your dataset"}
//               {workflowStep === "business-rules" && "Apply business logic rules"}
//             </p>
//           </div>

//           {workflowStep === "preview" && (
//             <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
//               <Button
//                 onClick={() => setWorkflowStep("business-rules")}
//                 className="bg-primary hover:bg-primary/90 min-w-[180px]"
//               >
//                 <Settings2 className="mr-2 h-4 w-4" />
//                 Apply Business Logic
//               </Button>
//               {/* <Button
//                 variant="outline"
//                 onClick={() => setShowScheduleDialog(true)}
//                 className="min-w-[150px]"
//               >
//                 <Calendar className="mr-2 h-4 w-4" />
//                 Schedule Job
//               </Button> */}
//             </div>
//           )}
//         </div>

//         {/* Preview step – info panel + full preview button */}
//         {/* {workflowStep === "preview" && (
//           <div className="space-y-6">
//             <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
//               <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                 <div>
//                   <p className="text-lg">
//                     <span className="font-semibold">Dataset:</span>{" "}
//                     <span className="text-primary font-medium">
//                       {builtDataset?.name || "Not loaded"}
//                     </span>
//                   </p>
//                   <p className="text-sm text-muted-foreground mt-1">
//                     {builtDataset?.columns.length || 0} columns •{" "}
//                     {builtDataset?.sampleRows.length || 0} rows available
//                   </p>
//                 </div>
//                 <Button
//                   variant="outline"
//                   onClick={() => setShowFullPreview(true)}
//                   disabled={isPreviewLoading || !builtDataset || fullPreviewData.length === 0}
//                 >
//                   <Eye className="mr-2 h-4 w-4" />
//                   View Full Preview
//                 </Button>
//               </div>
//             </div>

//             {isPreviewLoading ? (
//               <div className="flex justify-center py-20">
//                 <Loader2 className="h-10 w-10 animate-spin text-primary" />
//               </div>
//             ) : !builtDataset ? (
//               <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl bg-card/50">
//                 Loading dataset information...
//               </div>
//             ) : (
//               <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl bg-card/50">
//                 <p className="text-lg font-medium mb-2">Dataset is ready</p>
//                 <p className="text-sm mb-6">
//                   Use "View Full Preview" to inspect the data before applying rules or scheduling.
//                 </p>
//               </div>
//             )}
//           </div>
//         )} */}

//       <div className="flex-1">
//           {/* Preview step */}
//           {workflowStep === "preview" && (
//             <div className="space-y-6">
//               <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
//                 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//                   <div>
//                     <p className="text-lg">
//                       <span className="font-semibold">Dataset:</span>{" "}
//                       <span className="text-primary font-medium">
//                         {builtDataset?.name || "Not loaded"}
//                       </span>
//                     </p>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       {builtDataset?.columns.length || 0} columns •{" "}
//                       {builtDataset?.sampleRows.length || 0} rows available
//                     </p>
//                   </div>
//                   <Button
//                     variant="outline"
//                     onClick={toggleFullPreview}
//                     disabled={isPreviewLoading || !builtDataset || fullPreviewData.length === 0}
//                   >
//                     <Eye className="mr-2 h-4 w-4" />
//                     {showFullPreviewInline ? "Hide Preview" : "View Full Preview"}
//                   </Button>
//                 </div>
//               </div>

//               {isPreviewLoading ? (
//                 <div className="flex justify-center py-20">
//                   <Loader2 className="h-10 w-10 animate-spin text-primary" />
//                 </div>
//               ) : !builtDataset ? (
//                 <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl bg-card/50">
//                   Loading dataset information...
//                 </div>
//               ) : (
//                 <>
//                   {/* <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl bg-card/50">
//                     <p className="text-lg font-medium mb-2">Dataset is ready</p>
//                     <p className="text-sm">
//                       {showFullPreviewInline
//                         ? "Full preview is shown below"
//                         : "Click \"View Full Preview\" to inspect the data"}
//                     </p>
//                   </div> */}

//                   {/* Inline Full Preview Table */}
//                   {showFullPreviewInline && (
//                     <div className="border rounded-lg overflow-hidden">
                      
//                       <div className="max-h-[60vh] overflow-auto">
//                         <table className="w-full text-sm">
//                           <thead className="sticky top-0 bg-primary">
//                             <tr>
//                               {builtDataset.columns.map((col) => (
//                                 <th
//                                   key={col.name}
//                                   className="text-left p-3 font-medium border-b whitespace-nowrap"
//                                 >
//                                   {col.name}
//                                   <div className="text-xs text-foreground">({col.type})</div>
//                                 </th>
//                               ))}
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {fullPreviewData.map((row, idx) => (
//                               <tr
//                                 key={idx}
//                                 className="border-b hover:bg-muted/40 transition-colors"
//                               >
//                                 {builtDataset.columns.map((col) => (
//                                   <td
//                                     key={col.name}
//                                     className="p-3 whitespace-nowrap"
//                                   >
//                                     {String(row[col.name] ?? "—")}
//                                   </td>
//                                 ))}
//                               </tr>
//                             ))}
//                             {fullPreviewData.length === 0 && (
//                               <tr>
//                                 <td
//                                   colSpan={builtDataset.columns.length}
//                                   className="p-12 text-center text-muted-foreground"
//                                 >
//                                   No preview data available
//                                 </td>
//                               </tr>
//                             )}
//                           </tbody>
//                         </table>
//                       </div>
//                     </div>
//                   )}
//                 </>
//               )}
//             <div className="mt-10 pt-6 ">
//           {/* <Button
//             variant="outline"
//             onClick={() => navigate("/PathSelection1")} // ← adjust route if needed
//             className="min-w-[220px]"
//           >
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back to Path Selection
//           </Button> */}
//         </div>
//             </div>
            
//           )}

//         {/* Business Rules view */}
//         {workflowStep === "business-rules" && (
//           <div className="space-y-6">
//             <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
//               <p className="text-sm">
//                 <span className="font-semibold">Working with:</span>{" "}
//                 <span className="text-primary">{builtDataset?.name || "—"}</span>
//               </p>
//             </div>

//             <div className="flex justify-end gap-3">
//               <Button
//                 variant="outline"
//                 onClick={handleRunAllRules}
//                 disabled={rules.length === 0 || validating}
//               >
//                 {validating ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     Submitting...
//                   </>
//                 ) : (
//                   <>
//                     <Play className="mr-2 h-4 w-4" />
//                     Run All Rules
//                   </>
//                 )}
//               </Button>
//               <Button onClick={() => setShowAddRuleDialog(true)}>
//                 <Plus className="mr-2 h-4 w-4" />
//                 Add New Rule
//               </Button>
//             </div>

//             <div className="border rounded-lg p-6 bg-card">
//               {rules.length === 0 ? (
//                 <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
//                   <Code2 className="h-12 w-12 text-muted-foreground mb-4" />
//                   <h3 className="text-lg font-semibold mb-2">No Business Rules Yet</h3>
//                   <p className="text-sm text-muted-foreground mb-4">
//                     Click "Add New Rule" to get started
//                   </p>
//                 </div>
//               ) : (
//                 <div className="space-y-4">
//                   {rules.map((rule, index) => (
//                     <div key={index} className="border rounded-lg p-4 bg-background">
//                       <div className="flex items-start justify-between mb-3">
//                         <div className="flex items-center gap-3">
//                           <h3 className="text-lg font-semibold">{rule.name}</h3>
//                           <span className="px-2 py-1 text-xs rounded bg-yellow-500/10 text-yellow-600">
//                             {rule.status}
//                           </span>
//                         </div>
//                         <div className="flex gap-2">
//                           <Button variant="outline" size="sm" onClick={() => handleEditRule(index)}>
//                             <Edit className="h-4 w-4 mr-2" />
//                             Edit
//                           </Button>
//                           <Button variant="outline" size="sm" onClick={() => handleDeleteRule(index)}>
//                             <Trash className="h-4 w-4" />
//                           </Button>
//                         </div>
//                       </div>
//                       <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
//                       <div className="bg-muted/50 rounded p-3 font-mono text-sm">
//                         <pre className="whitespace-pre-wrap">{rule.logic}</pre>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>

//             <div className="flex justify-start">
//               <Button variant="outline" onClick={handleBack}>
//                 <ArrowLeft className="mr-2 h-4 w-4" />
//                 Back to Preview
//               </Button>
//             </div>
//           </div>
//         )}
//         </div>

//         {/* <div className="mt-10 pt-6 border-t">
//           <Button
//             variant="outline"
//             onClick={() => navigate("/path-selection")} // ← adjust route if needed
//             className="min-w-[220px]"
//           >
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back to Path Selection
//           </Button>
//         </div> */}

//         {/* Dialogs */}
//         <AddBusinessRuleDialog
//           open={showAddRuleDialog}
//           onOpenChange={(open) => {
//             setShowAddRuleDialog(open);
//             if (!open) setEditingRule(null);
//           }}
//           onAddRule={handleAddRule}
//           initialRule={editingRule !== null ? rules[editingRule] : undefined}
//         />

//         <BusinessRuleValidationDialog
//           open={showValidationDialog}
//           onOpenChange={setShowValidationDialog}
//           rulesCount={rules.length}
//         />

//         <BusinessRuleCompleteDialog
//           open={showCompleteDialog}
//           onOpenChange={setShowCompleteDialog}
//           onContinue={() => {
//             localStorage.setItem("businessLogicStatus", "executed");
//             localStorage.setItem("etlTableName", builtDataset?.name || "");
//             setShowCompleteDialog(false);
//             setShowScheduleDialog(true);
//           }}
//           jobInfo={jobInfo}
//           isETLFlow={true}
//         /> 

//         <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
//           <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
//             <div className="mb-4 flex justify-between items-center">
//               <div>
//                 <h2 className="text-2xl font-bold text-foreground">Full Data Preview</h2>
//                 <p className="text-muted-foreground mt-1">
//                   Table: <span className="text-primary">{builtDataset?.name}</span> •{" "}
//                   {builtDataset?.columns.length} columns × {fullPreviewData.length} rows
//                 </p>
//               </div>
//               <Button variant="ghost" size="icon" onClick={() => setShowFullPreview(false)}>
//                 <X className="h-5 w-5" />
//               </Button>
//             </div>
//             <div className="flex-1 overflow-auto border border-border rounded-lg">
//               <table className="w-full">
//                 <thead className="sticky top-0 bg-primary/100 text-white">
//                   <tr>
//                     {builtDataset?.columns.map((col) => (
//                       <th
//                         key={`preview-${col.name}`}
//                         className="text-left p-4 text-sm font-medium whitespace-nowrap border-b border-border"
//                       >
//                         <div>{col.name}</div>
//                         <div className="text-xs opacity-80">({col.table})</div>
//                       </th>
//                     ))}
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {fullPreviewData.map((row, idx) => (
//                     <tr
//                       key={`preview-row-${idx}`}
//                       className="border-b border-border last:border-0 hover:bg-muted/50"
//                     >
//                       {builtDataset?.columns.map((col) => (
//                         <td
//                           key={`preview-${col.name}-${idx}`}
//                           className="p-4 text-sm text-foreground whitespace-nowrap"
//                         >
//                           {String(row[col.name] ?? "-")}
//                         </td>
//                       ))}
//                     </tr>
//                   ))}
//                   {fullPreviewData.length === 0 && (
//                     <tr>
//                       <td colSpan={builtDataset?.columns.length ?? 1} className="p-8 text-center text-muted-foreground">
//                         No data available for preview
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </DialogContent>
//         </Dialog>

//         {/* Schedule Job Dialog */}
       
//       </div>
//    </div>
//   );
// }



import { useState, useEffect } from "react";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Code2,
  Edit,
  Eye,
  Loader2,
  Play,
  Plus,
  Settings2,
  Trash,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, useToast } from "@/hooks/use-toast";
import { AddBusinessRuleDialog } from "@/components/AddBusinessRuleDialog";
import { BusinessRuleValidationDialog } from "@/components/BusinessRuleValidationDialog";
import { BusinessRuleCompleteDialog } from "@/components/BusinessRuleCompleteDialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { Workflowheader} from "@/components/Workflowheader1";
import { Workflowheader } from "@/components/WorkFlowHeader1";

interface Column {
  name: string;
  table: string;
  type: string;
}

interface BuiltDataset {
  name: string;
  columns: Column[];
  sampleRows: Record<string, any>[];
}

// ── NEW: Databricks-platform "list dataset columns" source ───────────────
interface DatabricksColumnInfo {
  name: string;
  type: string;
}

interface DatabricksDatasetColumns {
  dataset_name: string;
  columns: DatabricksColumnInfo[];
}

interface DatabricksListDatasetColumnsResponse {
  user_id: string;
  job_id: string;
  datasets: DatabricksDatasetColumns[];
}

// ── NEW: Databricks-platform "preview dataset" source ─────────────────────
interface DatabricksPreviewDatasetResponse {
  user_id: string;
  job_id: string;
  filename: string;
  rows: Record<string, any>[];
}

/**
 * Reads the "user" object from localStorage and returns true if the user's
 * dataplatform is "Databricks". Same check used across the other workflow
 * pages (Data Quality / NER / Business Logic / Data Preview / Create
 * Dataset / ETL Output).
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

const databricksListDatasetColumnsUrl = (userId: string, jobId: string) =>
  `https://api.veriton.ai/api/service-databricks/list-dataset-columns?user_id=${userId}&job_id=${jobId}`;

const databricksPreviewDatasetUrl = (userId: string, jobId: string, filename: string) =>
  `https://api.veriton.ai/api/service-databricks/preview-dataset?user_id=${userId}&job_id=${jobId}&filename=${encodeURIComponent(
    filename
  )}`;

export default function ETLOutput() {
  const navigate = useNavigate();
  const { dismiss } = useToast();

  const [builtDataset, setBuiltDataset] = useState<BuiltDataset | null>(null);
  const [fullPreviewData, setFullPreviewData] = useState<Record<string, any>[]>([]);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Business rules
  const [rules, setRules] = useState<any[]>([]);
  const [showAddRuleDialog, setShowAddRuleDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validating, setValidating] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<number | null>(null);
  const [jobInfo, setJobInfo] = useState<{ correlation_id?: string; databricks_run_id?: string; message?: string } | null>(null);

  // Schedule dialog
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [triggerType, setTriggerType] = useState<"schedule" | "file">("schedule");
  const [frequency, setFrequency] = useState("");
  const [time, setTime] = useState("");
  const [jobName, setJobName] = useState("");
  const [loading, setLoading] = useState(false);

  const [workflowStep, setWorkflowStep] = useState<"preview" | "business-rules">("preview");
 const [showFullPreviewInline, setShowFullPreviewInline] = useState(false);

  const closeToastButton = (
    <button
      onClick={() => dismiss()}
      className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
      aria-label="Close toast"
    >
      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
    </button>
  );

  // Fetch dataset columns + preview rows (only used for full preview)
  useEffect(() => {
    const userId = localStorage.getItem("selected_user_id");
    const jobId = localStorage.getItem("selected_job_id");
    const datasetName = localStorage.getItem("selected_dataset_name");

    if (!userId || !jobId || !datasetName) {
      toast({
        title: "Missing Information",
        description: "User ID, Job ID or Dataset name not found",
        variant: "destructive",
        action: closeToastButton,
      });
      return;
    }

    const fetchData = async () => {
      setIsPreviewLoading(true);
      try {
        let columns: Column[] = [];
        let sampleRows: Record<string, any>[] = [];

        if (isDatabricksUser()) {
          // ── NEW: Databricks columns fetch via /list-dataset-columns ──────
          // That endpoint returns columns for every dataset under this
          // job, so pull out just the entry matching our dataset. Its
          // dataset_name convention has no ".csv" suffix, so match against
          // both forms.
          const columnsRes = await fetch(
            databricksListDatasetColumnsUrl(userId, jobId),
            { headers: { accept: "application/json" } }
          );
          if (!columnsRes.ok) throw new Error("Columns fetch failed");
          const columnsData: DatabricksListDatasetColumnsResponse = await columnsRes.json();

          const baseName = datasetName.replace(/\.csv$/i, "");
          const matchedDataset = (columnsData.datasets || []).find(
            (ds) => ds.dataset_name === datasetName || ds.dataset_name === baseName
          );

          columns = (matchedDataset?.columns || []).map((c) => ({
            name: c.name,
            type: c.type,
            table: datasetName,
          }));

          // ── NEW: Databricks preview fetch via /preview-dataset ───────────
          const previewRes = await fetch(
            databricksPreviewDatasetUrl(userId, jobId, datasetName),
            { headers: { accept: "application/json" } }
          );
          if (!previewRes.ok) throw new Error("Preview fetch failed");
          const previewJson: DatabricksPreviewDatasetResponse = await previewRes.json();
          sampleRows = Array.isArray(previewJson?.rows) ? previewJson.rows : [];
        } else {
          // ── Existing default (non-Databricks) columns + preview fetch —
          // unchanged ───────────────────────────────────────────────────
          const columnsRes = await fetch(
            `https://api.veriton.ai/api/service2/dataset-list-columns?user_id=${userId}&job_id=${jobId}&filename=${datasetName}`,
            { headers: { accept: "application/json" } }
          );
          if (!columnsRes.ok) throw new Error("Columns fetch failed");
          const columnsData = await columnsRes.json();
          columns = columnsData.columns?.map((c: { name: string; type: string }) => ({
            name: c.name,
            type: c.type,
            table: datasetName,
          })) ?? [];

          // Preview rows (for full preview dialog)
          const previewRes = await fetch(
            `https://api.veriton.ai/api/service2/preview-dataset?user_id=${userId}&job_id=${jobId}&datasetname=${encodeURIComponent(datasetName)}`,
            { headers: { accept: "application/json" } }
          );
          if (!previewRes.ok) throw new Error("Preview fetch failed");
          const previewJson = await previewRes.json();
          const rows = previewJson.preview_rows ?? previewJson.rows ?? previewJson ?? [];
          sampleRows = Array.isArray(rows) ? rows : [];
        }

        setBuiltDataset({
          name: datasetName,
          columns,
          sampleRows,
        });
        setFullPreviewData(sampleRows);
      } catch (err: any) {
        console.error(err);
        toast({
          title: "Load Error",
          description: err.message || "Failed to load dataset information",
          variant: "destructive",
          action: closeToastButton,
        });
      } finally {
        setIsPreviewLoading(false);
      }
    };

    fetchData();
  }, []);

  // Job name from localStorage
  useEffect(() => {
    const etlJobName = localStorage.getItem("currentJobName");
    const etlTableName = localStorage.getItem("etlTableName");
    if (etlJobName) setJobName(etlJobName);
    else if (etlTableName) setJobName(`Job_${etlTableName}`);
  }, []);

  const getUserId = () => localStorage.getItem("selected_user_id");

  const scheduleJob = async () => {
    if (triggerType === "schedule" && !frequency) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a frequency",
        action: closeToastButton,
      });
      return;
    }

    const userId = getUserId();
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "User ID not found",
        action: closeToastButton,
      });
      return;
    }

    setLoading(true);

    const jobId = localStorage.getItem("selected_job_id") || "";
    const finalJobName = jobName || `Job_${new Date().toISOString().split("T")[0]}`;

    try {
      if (isDatabricksUser()) {
        // ── NEW: Databricks schedule fetch via /schedule-job ──────────────
        const dbPayload = {
          user_id: userId,
          job_id: jobId,
          job_name: finalJobName,
          frequency: frequency,
          time: time || "00:00",
        };

        const res = await fetch(
          "https://api.veriton.ai/api/service-databricks/schedule-job",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json",
            },
            body: JSON.stringify(dbPayload),
          }
        );

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || `HTTP ${res.status}`);
        }

        const data = await res.json();

        if (data.status === "scheduled") {
          toast({
            title: "Success",
            description: `Job "${data.job_name || finalJobName}" scheduled successfully!`,
            action: closeToastButton,
          });

          localStorage.removeItem("currentJobName");
          localStorage.removeItem("etlTableName");

          setShowScheduleDialog(false);
          navigate("/jobs");
        } else {
          throw new Error(data.message || data.job_status || "Scheduling failed");
        }
      } else {
        // ── Existing default (non-Databricks) schedule fetch — unchanged ──
        const payload = {
          job_id: jobId,
          job_name: finalJobName,
          schedule_details:
            triggerType === "schedule" ? { frequency, time: time || "00:00" } : null,
        };

        const url = `https://api.veriton.ai/api/service1/schedule-job?user_id=${userId}`;
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(errText || `HTTP ${res.status}`);
        }

        const data = await res.json();

        if (data.message?.toLowerCase().includes("success")) {
          toast({
            title: "Success",
            description: "Job scheduled successfully",
            action: closeToastButton,
          });

          localStorage.removeItem("currentJobName");
          localStorage.removeItem("etlTableName");

          setShowScheduleDialog(false);
          navigate("/jobs");
        } else {
          throw new Error(data.message || "Scheduling failed");
        }
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to schedule job",
        action: closeToastButton,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = (rule: any) => {
    if (editingRule !== null) {
      const updated = [...rules];
      updated[editingRule] = { ...rule, status: "testing" };
      setRules(updated);
      setEditingRule(null);
    } else {
      setRules([...rules, { ...rule, status: "testing" }]);
    }
    setShowAddRuleDialog(false);
    toast({
      title: editingRule !== null ? "Rule Updated" : "Rule Added",
      description: `Business rule ${editingRule !== null ? "updated" : "added"} successfully`,
      duration: 1400,
      action: closeToastButton,
    });
  };

  const handleEditRule = (index: number) => {
    setEditingRule(index);
    setShowAddRuleDialog(true);
  };

  const handleDeleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
    toast({
      title: "Rule Deleted",
      description: "Business rule has been removed",
      duration: 1200,
      action: closeToastButton,
    });
  };

  const handleRunAllRules = async () => {
    if (rules.length === 0 || !builtDataset?.name) {
      toast({
        title: "Cannot Run",
        description: rules.length === 0 ? "No rules defined" : "No dataset loaded",
        variant: "destructive",
        action: closeToastButton,
      });
      return;
    }

    let filename = builtDataset.name;
    if (!filename.toLowerCase().endsWith(".csv")) filename += ".csv";

    const userId = localStorage.getItem("selected_user_id");
    const jobId = localStorage.getItem("selected_job_id");
    if (!userId || !jobId) return;

    const blobPath = `${userId}/${jobId}/${filename}`;

    const rulesPayload: Record<string, string> = {};
    rules.forEach((r) => (rulesPayload[r.name] = r.logic));

    setValidating(true);
    setShowValidationDialog(true);
    setJobInfo(null);

    try {
      if (isDatabricksUser()) {
        // ── NEW: Databricks business rules processing via
        // /api/v1/business-rules/process on service-databricks. This
        // endpoint uses "file_path" (not "blob_path") and has no
        // "output_blob_path" field, and it responds synchronously with
        // "status": "success" rather than "job_submitted".
        const dbPayload = {
          user_id: userId,
          job_id: jobId,
          file_path: blobPath,
          rules: rulesPayload,
          mode: "auto",
          overwrite_source: false,
        };

        const res = await fetch(
          "https://api.veriton.ai/api/service-databricks/api/v1/business-rules/process",
          {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify(dbPayload),
          }
        );

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const result = await res.json();

        if (result.status === "success" || result.processed) {
          setJobInfo({
            correlation_id: result.correlation_id,
            databricks_run_id: result.databricks_run_id ?? undefined,
            message: result.message,
          });
          toast({
            title: "Job Submitted",
            description: result.message || "Business rules processing completed",
            action: closeToastButton,
          });
        } else {
          throw new Error(result.message || "Unexpected response");
        }
      } else {
        // ── Existing default (non-Databricks) business rules processing —
        // unchanged ────────────────────────────────────────────────────
        const payload = {
          blob_path: blobPath,
          rules: rulesPayload,
          mode: "auto",
          overwrite_source: false,
          output_blob_path: `processed/${builtDataset.name.replace(/\.csv$/i, "")}_filtered.csv`,
        };

        const res = await fetch("https://api.veriton.ai/api/service2/api/v1/business-rules/process", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`API error: ${res.status}`);

        const result = await res.json();

        if (result.status === "job_submitted") {
          setJobInfo({
            correlation_id: result.correlation_id,
            databricks_run_id: result.databricks_run_id,
            message: result.message,
          });
          toast({
            title: "Job Submitted",
            description: "Business rules processing started",
            action: closeToastButton,
          });
        } else {
          throw new Error(result.message || "Unexpected response");
        }
      }
    } catch (err: any) {
      toast({
        title: "Submission Failed",
        description: err.message || "Could not start business rules job",
        variant: "destructive",
        action: closeToastButton,
      });
    } finally {
      setValidating(false);
      setTimeout(() => {
        setShowValidationDialog(false);
        setShowCompleteDialog(true);
      }, 1400);
    }
  };

  const handleBack = () => {
    setWorkflowStep("preview");
  };

  const toggleFullPreview = () => {
    setShowFullPreviewInline((prev) => !prev);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      <Workflowheader/>
      <div className="p-6 md:p-8">
        {/* Header + top-right buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">ETL Pipeline</h1>
            <p className="text-muted-foreground mt-1">
              {workflowStep === "preview" && "Review your dataset"}
              {workflowStep === "business-rules" && "Apply business logic rules"}
            </p>
          </div>

          {workflowStep === "preview" && (
            <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
              <Button
                onClick={() => setWorkflowStep("business-rules")}
                className="bg-primary hover:bg-primary/90 min-w-[180px]"
              >
                <Settings2 className="mr-2 h-4 w-4" />
                Apply Business Logic
              </Button>
              {/* <Button
                variant="outline"
                onClick={() => setShowScheduleDialog(true)}
                className="min-w-[150px]"
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Job
              </Button> */}
            </div>
          )}
        </div>

        {/* Preview step – info panel + full preview button */}
        {/* {workflowStep === "preview" && (
          <div className="space-y-6">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <p className="text-lg">
                    <span className="font-semibold">Dataset:</span>{" "}
                    <span className="text-primary font-medium">
                      {builtDataset?.name || "Not loaded"}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {builtDataset?.columns.length || 0} columns •{" "}
                    {builtDataset?.sampleRows.length || 0} rows available
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setShowFullPreview(true)}
                  disabled={isPreviewLoading || !builtDataset || fullPreviewData.length === 0}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  View Full Preview
                </Button>
              </div>
            </div>

            {isPreviewLoading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : !builtDataset ? (
              <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl bg-card/50">
                Loading dataset information...
              </div>
            ) : (
              <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl bg-card/50">
                <p className="text-lg font-medium mb-2">Dataset is ready</p>
                <p className="text-sm mb-6">
                  Use "View Full Preview" to inspect the data before applying rules or scheduling.
                </p>
              </div>
            )}
          </div>
        )} */}

      <div className="flex-1">
          {/* Preview step */}
          {workflowStep === "preview" && (
            <div className="space-y-6">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-lg">
                      <span className="font-semibold">Dataset:</span>{" "}
                      <span className="text-primary font-medium">
                        {builtDataset?.name || "Not loaded"}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {builtDataset?.columns.length || 0} columns •{" "}
                      {builtDataset?.sampleRows.length || 0} rows available
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={toggleFullPreview}
                    disabled={isPreviewLoading || !builtDataset || fullPreviewData.length === 0}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {showFullPreviewInline ? "Hide Preview" : "View Full Preview"}
                  </Button>
                </div>
              </div>

              {isPreviewLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : !builtDataset ? (
                <div className="text-center py-16 text-muted-foreground border border-dashed rounded-xl bg-card/50">
                  Loading dataset information...
                </div>
              ) : (
                <>
                  {/* <div className="text-center py-10 text-muted-foreground border border-dashed rounded-xl bg-card/50">
                    <p className="text-lg font-medium mb-2">Dataset is ready</p>
                    <p className="text-sm">
                      {showFullPreviewInline
                        ? "Full preview is shown below"
                        : "Click \"View Full Preview\" to inspect the data"}
                    </p>
                  </div> */}

                  {/* Inline Full Preview Table */}
                  {showFullPreviewInline && (
                    <div className="border rounded-lg overflow-hidden">
                      
                      <div className="max-h-[60vh] overflow-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 bg-primary">
                            <tr>
                              {builtDataset.columns.map((col) => (
                                <th
                                  key={col.name}
                                  className="text-left p-3 font-medium border-b whitespace-nowrap"
                                >
                                  {col.name}
                                  <div className="text-xs text-foreground">({col.type})</div>
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {fullPreviewData.map((row, idx) => (
                              <tr
                                key={idx}
                                className="border-b hover:bg-muted/40 transition-colors"
                              >
                                {builtDataset.columns.map((col) => (
                                  <td
                                    key={col.name}
                                    className="p-3 whitespace-nowrap"
                                  >
                                    {String(row[col.name] ?? "—")}
                                  </td>
                                ))}
                              </tr>
                            ))}
                            {fullPreviewData.length === 0 && (
                              <tr>
                                <td
                                  colSpan={builtDataset.columns.length}
                                  className="p-12 text-center text-muted-foreground"
                                >
                                  No preview data available
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              )}
            <div className="mt-10 pt-6 ">
          {/* <Button
            variant="outline"
            onClick={() => navigate("/PathSelection1")} // ← adjust route if needed
            className="min-w-[220px]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Path Selection
          </Button> */}
        </div>
            </div>
            
          )}

        {/* Business Rules view */}
        {workflowStep === "business-rules" && (
          <div className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
              <p className="text-sm">
                <span className="font-semibold">Working with:</span>{" "}
                <span className="text-primary">{builtDataset?.name || "—"}</span>
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={handleRunAllRules}
                disabled={rules.length === 0 || validating}
              >
                {validating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run All Rules
                  </>
                )}
              </Button>
              <Button onClick={() => setShowAddRuleDialog(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add New Rule
              </Button>
            </div>

            <div className="border rounded-lg p-6 bg-card">
              {rules.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed rounded-lg">
                  <Code2 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Business Rules Yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Click "Add New Rule" to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rules.map((rule, index) => (
                    <div key={index} className="border rounded-lg p-4 bg-background">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{rule.name}</h3>
                          <span className="px-2 py-1 text-xs rounded bg-yellow-500/10 text-yellow-600">
                            {rule.status}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditRule(index)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteRule(index)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{rule.description}</p>
                      <div className="bg-muted/50 rounded p-3 font-mono text-sm">
                        <pre className="whitespace-pre-wrap">{rule.logic}</pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-start">
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Preview
              </Button>
            </div>
          </div>
        )}
        </div>

        {/* <div className="mt-10 pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => navigate("/path-selection")} // ← adjust route if needed
            className="min-w-[220px]"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Path Selection
          </Button>
        </div> */}

        {/* Dialogs */}
        <AddBusinessRuleDialog
          open={showAddRuleDialog}
          onOpenChange={(open) => {
            setShowAddRuleDialog(open);
            if (!open) setEditingRule(null);
          }}
          onAddRule={handleAddRule}
          initialRule={editingRule !== null ? rules[editingRule] : undefined}
        />

        <BusinessRuleValidationDialog
          open={showValidationDialog}
          onOpenChange={setShowValidationDialog}
          rulesCount={rules.length}
        />

        <BusinessRuleCompleteDialog
          open={showCompleteDialog}
          onOpenChange={setShowCompleteDialog}
          onContinue={() => {
            localStorage.setItem("businessLogicStatus", "executed");
            localStorage.setItem("etlTableName", builtDataset?.name || "");
            setShowCompleteDialog(false);
            setShowScheduleDialog(true);
          }}
          jobInfo={jobInfo}
          isETLFlow={true}
        /> 

        <Dialog open={showFullPreview} onOpenChange={setShowFullPreview}>
          <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Full Data Preview</h2>
                <p className="text-muted-foreground mt-1">
                  Table: <span className="text-primary">{builtDataset?.name}</span> •{" "}
                  {builtDataset?.columns.length} columns × {fullPreviewData.length} rows
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowFullPreview(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto border border-border rounded-lg">
              <table className="w-full">
                <thead className="sticky top-0 bg-primary/100 text-white">
                  <tr>
                    {builtDataset?.columns.map((col) => (
                      <th
                        key={`preview-${col.name}`}
                        className="text-left p-4 text-sm font-medium whitespace-nowrap border-b border-border"
                      >
                        <div>{col.name}</div>
                        <div className="text-xs opacity-80">({col.table})</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fullPreviewData.map((row, idx) => (
                    <tr
                      key={`preview-row-${idx}`}
                      className="border-b border-border last:border-0 hover:bg-muted/50"
                    >
                      {builtDataset?.columns.map((col) => (
                        <td
                          key={`preview-${col.name}-${idx}`}
                          className="p-4 text-sm text-foreground whitespace-nowrap"
                        >
                          {String(row[col.name] ?? "-")}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {fullPreviewData.length === 0 && (
                    <tr>
                      <td colSpan={builtDataset?.columns.length ?? 1} className="p-8 text-center text-muted-foreground">
                        No data available for preview
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </DialogContent>
        </Dialog>

        {/* Schedule Job Dialog */}
       
      </div>
   </div>
  );
}