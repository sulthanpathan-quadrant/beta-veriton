// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { WorkflowLayout } from "@/components/WorkflowLayout";
// import { Button } from "@/components/ui/button";
// import {
//   Code,
//   AlertTriangle,
//   CheckCircle,
//   Play,
//   Plus,
//   FileText,
//   ArrowLeft,
//   ArrowRight,
//   SkipForward,
//   Download,
//   Edit,
//   Trash,
//   Loader2,
//   X,
// } from "lucide-react";
// import { Badge } from "@/components/ui/badge";
// import { Checkbox } from "@/components/ui/checkbox";
// import { AddBusinessRuleDialog } from "@/components/AddBusinessRuleDialog";
// import { BusinessRuleValidationDialog } from "@/components/BusinessRuleValidationDialog";
// import { BusinessRuleCompleteDialog } from "@/components/BusinessRuleCompleteDialog";
// import { toast } from "sonner";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { Eye } from "lucide-react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// interface Rule {
//   name: string;
//   description: string;
//   logic: string;
//   status: string;
// }

// interface Dataset {
//   filename: string;
//   date_modified: string;
// }

// export default function BusinessLogic() {
//   const navigate = useNavigate();
//   const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
//   const [showAddRuleDialog, setShowAddRuleDialog] = useState(false);
//   const [showValidationDialog, setShowValidationDialog] = useState(false);
//   const [showCompleteDialog, setShowCompleteDialog] = useState(false);
//   const [rules, setRules] = useState<Rule[]>([]);
//   const [editingRule, setEditingRule] = useState<number | null>(null);
//   const [validating, setValidating] = useState(false);
//   const [jobInfo, setJobInfo] = useState<{
//     correlation_id?: string;
//     databricks_run_id?: string;
//     message?: string;
//   } | null>(null);

//   const [datasets, setDatasets] = useState<Dataset[]>([]);
//   const [loadingDatasets, setLoadingDatasets] = useState(true);

//   // Add near other state declarations
//   const [previewFile, setPreviewFile] = useState<string | null>(null);
//   const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
//   const [previewLoading, setPreviewLoading] = useState(false);
//   const [previewColumns, setPreviewColumns] = useState<string[]>([]);

//   const user = localStorage.getItem("user");
//   const userId = user ? JSON.parse(user).id : null;
//   const jobId = localStorage.getItem("current_job_id");

//   // Reusable close button for all toasts (Sonner style)
//   const closeToastButton = (
//     <button
//       onClick={() => toast.dismiss()}
//       className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
//       aria-label="Close toast"
//     >
//       <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
//     </button>
//   );

//   // Fetch available datasets
//   useEffect(() => {
//     if (!userId || !jobId) {
//       toast.error("Missing user or job information. Please log in again.", {
//         duration: 3000,
//         action: closeToastButton,
//       });
//       setLoadingDatasets(false);
//       return;
//     }

//     const fetchDatasets = async () => {
//       setLoadingDatasets(true);
//       try {
//         const url = `https://api.veriton.ai/api/service2/list-datasets?user_id=${userId}&job_id=${jobId}`;
//         const res = await fetch(url, {
//           headers: {
//             accept: "application/json",
//           },
//         });

//         if (!res.ok) {
//           throw new Error(`Failed to load datasets: ${res.status}`);
//         }

//         const data = await res.json();

//         if (data.datasets && Array.isArray(data.datasets)) {
//           setDatasets(data.datasets);
//         } else {
//           setDatasets([]);
//           toast.info(data.message || "No datasets available", {
//             duration: 3000,
//             action: closeToastButton,
//           });
//         }
//       } catch (err) {
//         console.error("Error fetching datasets:", err);
//         toast.error("Could not load available datasets", {
//           duration: 4000,
//           action: closeToastButton,
//         });
//       } finally {
//         setLoadingDatasets(false);
//       }
//     };

//     fetchDatasets();
//   }, [userId, jobId]);

//   const toggleFileSelection = (fileName: string) => {
//     setSelectedFiles((prev) =>
//       prev.includes(fileName)
//         ? prev.filter((f) => f !== fileName)
//         : [...prev, fileName],
//     );
//   };

//   const updateBusinessLogicOptions = async () => {
//     if (!userId || !jobId) {
//       console.warn(
//         "Cannot update business logic options — missing userId or jobId",
//       );
//       return false;
//     }

//     const rulesPayload: Record<string, string> = {};
//     rules.forEach((rule, index) => {
//       rulesPayload[rule.name] = rule.logic;
//     });

//     const payload = {
//       user_id: userId,
//       job_id: jobId,
//       business_logic: {
//         business_logic: true,
//         rules: rulesPayload,
//       },
//     };

//     console.log(payload);

//     try {
//       const response = await fetch(
//         "https://api.veriton.ai/api/service2/set-job-options",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify(payload),
//         },
//       );

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(
//           `Failed to update business logic options: ${response.status} - ${errorText}`,
//         );
//       }

//       const result = await response.json();

//       if (result.status === "success") {
//         console.log(
//           "Successfully updated business_logic + rules in job options",
//         );
//         return true;
//       } else {
//         throw new Error(result.message || "Failed to update job options");
//       }
//     } catch (err) {
//       console.error("Error updating business logic options:", err);
//       return false;
//     }
//   };

//   const handleRunAllRules = async () => {
//     if (rules.length === 0) {
//       toast.error("No rules to run", {
//         duration: 3000,
//         action: closeToastButton,
//       });
//       return;
//     }
//     if (selectedFiles.length === 0) {
//       toast.error("Please select at least one file", {
//         duration: 3000,
//         action: closeToastButton,
//       });
//       return;
//     }

//     const selectedFilename = selectedFiles[0];
//     let filename = selectedFilename;
//     if (!filename.toLowerCase().endsWith(".csv")) {
//       filename += ".csv";
//     }

//     const blobPath = `${userId}/${jobId}/${filename}`;

//     const rulesPayloadForProcess: Record<string, string> = {};
//     rules.forEach((rule) => {
//       rulesPayloadForProcess[rule.name] = rule.logic;
//     });

//     const processPayload = {
//       blob_path: blobPath,
//       rules: rulesPayloadForProcess,
//       mode: "auto",
//       overwrite_source: true,
//       output_blob_path: "processed/Book1_1_filtered.csv",
//     };

//     console.log("Process payload:", processPayload);

//     setValidating(true);
//     setShowValidationDialog(true);
//     setJobInfo(null);

//     try {
//       await updateBusinessLogicOptions();

//       const response = await fetch(
//         "https://api.veriton.ai/api/service2/api/v1/business-rules/process",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Accept: "application/json",
//           },
//           body: JSON.stringify(processPayload),
//         },
//       );

//       if (!response.ok) {
//         const errorData = await response.json().catch(() => ({}));
//         throw new Error(errorData.message || `API error: ${response.status}`);
//       }

//       const result = await response.json();

//       if (result.status === "job_submitted") {
//         setJobInfo({
//           correlation_id: result.correlation_id,
//           databricks_run_id: result.databricks_run_id,
//           message: result.message,
//         });
//         toast.success("Business rules processing job submitted successfully!", {
//           duration: 3000,
//           action: closeToastButton,
//         });
//       } else {
//         throw new Error(result.message || "Unexpected response");
//       }
//     } catch (error: any) {
//       toast.error(error.message || "Failed to submit business rules job", {
//         duration: 4000,
//         action: closeToastButton,
//       });
//       setJobInfo(null);
//     } finally {
//       setValidating(false);
//       setTimeout(() => {
//         setShowValidationDialog(false);
//         setShowCompleteDialog(true);
//       }, 1200);
//     }
//   };

//   const handleAddRule = (rule: any) => {
//     if (editingRule !== null) {
//       const updatedRules = [...rules];
//       updatedRules[editingRule] = { ...rule, status: "testing" };
//       setRules(updatedRules);
//       setEditingRule(null);
//       toast.success("Rule Updated Successfully", {
//         duration: 2500,
//         action: closeToastButton,
//       });
//     } else {
//       setRules([...rules, { ...rule, status: "testing" }]);
//       toast.success("Rule Added Successfully", {
//         duration: 2500,
//         action: closeToastButton,
//       });
//     }
//     setShowAddRuleDialog(false);
//   };

//   const handleEditRule = (index: number) => {
//     setEditingRule(index);
//     setShowAddRuleDialog(true);
//   };

//   const handleDeleteRule = (index: number) => {
//     setRules(rules.filter((_, i) => i !== index));
//     toast.success("Rule Deleted Successfully", {
//       duration: 2500,
//       action: closeToastButton,
//     });
//   };

//   const handleDownloadCSV = () => {
//     const csvContent = [
//       ["Rule Name", "Description", "Logic", "Status"],
//       ...rules.map((rule) => [
//         rule.name,
//         rule.description,
//         rule.logic,
//         rule.status,
//       ]),
//     ]
//       .map((row) => row.join(","))
//       .join("\n");
//     const blob = new Blob([csvContent], { type: "text/csv" });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement("a");
//     a.href = url;
//     a.download = "business_rules.csv";
//     a.click();
//     window.URL.revokeObjectURL(url);
//     toast.success("Business rules exported to CSV", {
//       duration: 1000,
//       action: closeToastButton,
//     });
//   };

//   const fetchPreview = async (filename: string) => {
//     if (!userId || !jobId) {
//       toast.error("Missing user/job info", { duration: 1000 });
//       return;
//     }

//     setPreviewLoading(true);
//     setPreviewFile(filename);
//     setPreviewData([]);
//     setPreviewColumns([]);

//     try {
//       // Normalize filename (add .csv if missing)

//       const datasetName = filename;

//       // Optional: log what you're sending (for debugging)
//       console.log("Preview request:", {
//         userId,
//         jobId,
//         datasetname: datasetName,
//       });

//       const url = `https://api.veriton.ai/api/service2/preview-dataset?user_id=${userId}&job_id=${jobId}&datasetname=${encodeURIComponent(datasetName)}`;

//       const res = await fetch(url, {
//         headers: { accept: "application/json" },
//       });

//       if (!res.ok) {
//         throw new Error(`Preview failed: ${res.status}`);
//       }

//       const json = await res.json();

//       // Handle different possible response shapes
//       let rows: any[] = [];
//       if (Array.isArray(json)) {
//         rows = json;
//       } else if (json.preview_rows) {
//         rows = json.preview_rows;
//       } else if (json.rows) {
//         rows = json.rows;
//       } else if (json.data) {
//         rows = json.data;
//       }

//       if (rows.length === 0) {
//         toast.info("No preview data available", { duration: 2000 });
//         return;
//       }

//       // Extract columns from first row (or use known schema if available)
//       const columns = Object.keys(rows[0] || {});
//       setPreviewColumns(columns);
//       setPreviewData(rows.slice(0, 50)); // limit to avoid performance issues
//     } catch (err: any) {
//       console.error("Preview error:", err);
//       toast.error(err.message || "Failed to load data preview", {
//         duration: 2000,
//       });
//     } finally {
//       setPreviewLoading(false);
//     }
//   };

//   const stats = {
//     activeRules: rules.filter((r) => r.status === "active").length,
//     testing: rules.filter((r) => r.status === "testing").length,
//     totalRules: rules.length,
//     successRate: "N/A",
//   };

//   const canRunRules = rules.length > 0 && selectedFiles.length > 0;

//   return (
//     <WorkflowLayout>
//       <div className="p-8">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground mb-2">
//               Business Logic Rules
//             </h1>
//             <p className="text-muted-foreground">
//               Define and manage custom business rules for data processing and
//               validation
//             </p>
//           </div>
//           <div className="flex gap-3">
//             <Button
//               variant="outline"
//               onClick={handleDownloadCSV}
//               disabled={rules.length === 0}
//             >
//               <Download className="h-4 w-4 mr-2" />
//               Download CSV
//             </Button>
//             <Button
//               variant="outline"
//               onClick={handleRunAllRules}
//               disabled={!canRunRules || validating}
//             >
//               {validating ? (
//                 <>
//                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                   Submitting...
//                 </>
//               ) : (
//                 <>
//                   <Play className="h-4 w-4 mr-2" />
//                   Run All Rules
//                 </>
//               )}
//             </Button>
//             <Button
//               onClick={() => {
//                 setEditingRule(null);
//                 setShowAddRuleDialog(true);
//               }}
//             >
//               <Plus className="h-4 w-4 mr-2" />
//               Add New Rule
//             </Button>
//           </div>
//         </div>

//         {/* Stats Cards */}
//         <div className="grid grid-cols-4 gap-4 mb-6">
//           <div className="border border-border rounded-lg p-6 bg-card">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-sm text-muted-foreground">
//                 Active Rules
//               </span>
//               <CheckCircle className="h-5 w-5 text-green-500" />
//             </div>
//             <div className="text-3xl font-bold text-foreground">
//               {stats.activeRules}
//             </div>
//           </div>
//           <div className="border border-border rounded-lg p-6 bg-card">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-sm text-muted-foreground">Testing</span>
//               <AlertTriangle className="h-5 w-5 text-yellow-500" />
//             </div>
//             <div className="text-3xl font-bold text-foreground">
//               {stats.testing}
//             </div>
//           </div>
//           <div className="border border-border rounded-lg p-6 bg-card">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-sm text-muted-foreground">Total Rules</span>
//               <Code className="h-5 w-5 text-primary" />
//             </div>
//             <div className="text-3xl font-bold text-foreground">
//               {stats.totalRules}
//             </div>
//           </div>
//           <div className="border border-border rounded-lg p-6 bg-card">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-sm text-muted-foreground">
//                 Success Rate
//               </span>
//               <CheckCircle className="h-5 w-5 text-green-500" />
//             </div>
//             <div className="text-3xl font-bold text-foreground">
//               {stats.successRate}
//             </div>
//           </div>
//         </div>

//         {/* File Selection */}
//         <div className="mb-6">
//           <div className="flex items-center justify-between mb-3">
//             <h2 className="text-lg font-semibold text-foreground">
//               Select a file to apply rules
//             </h2>
//           </div>
//           <p className="text-sm text-muted-foreground mb-4">
//             Datasets available from your current job/ingestion.
//           </p>
//           <div className="border border-border rounded-lg overflow-hidden min-h-[200px]">
//             {loadingDatasets ? (
//               <div className="flex flex-col items-center justify-center h-64">
//                 <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
//                 <p className="text-muted-foreground">
//                   Loading available datasets...
//                 </p>
//               </div>
//             ) : datasets.length === 0 ? (
//               <div className="flex flex-col items-center justify-center h-64 text-center px-6">
//                 <FileText className="h-12 w-12 text-muted-foreground mb-4" />
//                 <p className="text-lg font-medium text-muted-foreground">
//                   No datasets available
//                 </p>
//                 <p className="text-sm text-muted-foreground mt-2">
//                   Complete previous steps or check job configuration
//                 </p>
//               </div>
//             ) : (
//               //     <Table>
//               //       <TableHeader>
//               //         <TableRow className="bg-muted/50 border-b border-border">
//               //           <TableHead className="w-12"></TableHead>
//               //           <TableHead className="font-medium">File Name</TableHead>
//               //           <TableHead className="font-medium">Last Modified</TableHead>
//               //           <TableHead className="w-16 text-center">Preview</TableHead>
//               //         </TableRow>
//               //       </TableHeader>
//               //       <TableBody>
//               //         {datasets.map((file) => {
//               //           const isSelected = selectedFiles.includes(file.filename);
//               //           return (
//               //             <TableRow
//               //               key={file.filename}
//               //               className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
//               //               onClick={() => toggleFileSelection(file.filename)}
//               //             >
//               //               <TableCell>
//               //                 <Checkbox checked={isSelected} />
//               //               </TableCell>
//               //               <TableCell className="font-medium">{file.filename}</TableCell>
//               //               <TableCell className="text-sm text-muted-foreground">
//               //                 {file.date_modified}
//               //               </TableCell>
//               //               <TableCell className="text-center">
//               //   <Button
//               //     variant="ghost"
//               //     size="icon"
//               //     className="h-8 w-8"
//               //     onClick={(e) => {
//               //       e.stopPropagation();           // ← important!
//               //       fetchPreview(file.filename);
//               //     }}
//               //   >
//               //     <Eye className="h-4 w-4" />
//               //   </Button>
//               // </TableCell>
//               //             </TableRow>
//               //           );
//               //         })}
//               //       </TableBody>
//               //     </Table>
//               <Table>
//                 <TableHeader>
//                   <TableRow className="bg-muted/60 border-b">
//                     <TableHead className="w-10 text-center">
//                       {" "}
//                       {/* checkbox */}
//                       <span className="sr-only">Select</span>
//                     </TableHead>
//                     <TableHead className="font-medium pl-4 min-w-[160px]">
//                       File Name
//                     </TableHead>
//                     <TableHead className="font-medium pr-10 min-w-[180px]">
//                       Last Modified
//                     </TableHead>
//                     <TableHead className="w-12 text-center">Preview</TableHead>{" "}
//                     {/* ← fixed width, centered */}
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {datasets.map((file) => {
//                     const isSelected = selectedFiles.includes(file.filename);
//                     return (
//                       <TableRow
//                         key={file.filename}
//                         className="hover:bg-muted/40 transition-colors cursor-pointer border-b last:border-b-0"
//                         onClick={() => toggleFileSelection(file.filename)}
//                       >
//                         <TableCell className="text-center">
//                           <Checkbox
//                             checked={isSelected}
//                             onClick={(e) => e.stopPropagation()}
//                             className="mx-auto"
//                           />
//                         </TableCell>
//                         <TableCell className="font-medium pl-4">
//                           {file.filename}
//                         </TableCell>
//                         <TableCell className="text-sm text-muted-foreground pr-10">
//                           {file.date_modified}
//                         </TableCell>
//                         <TableCell className="text-center">
//                           <Button
//                             variant="ghost"
//                             size="icon"
//                             className="h-8 w-8 "
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               fetchPreview(file.filename);
//                             }}
//                             title="Preview data"
//                           >
//                             <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     );
//                   })}
//                 </TableBody>
//               </Table>
//             )}
//           </div>
//         </div>

//         {/* Rules List */}
//         <div className="border border-border rounded-lg p-6 bg-card mb-6">
//           {rules.length === 0 ? (
//             <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
//               <Code className="h-12 w-12 text-muted-foreground mb-4" />
//               <h3 className="text-lg font-semibold text-foreground mb-2">
//                 No Business Rules Added Yet
//               </h3>
//               <p className="text-sm text-muted-foreground mb-4">
//                 Click '+ Add New Rule' to create your first business logic rule.
//               </p>
//             </div>
//           ) : (
//             <div className="space-y-4">
//               {rules.map((rule, index) => (
//                 <div
//                   key={index}
//                   className="border border-border rounded-lg p-4 bg-background"
//                 >
//                   <div className="flex items-start justify-between mb-3">
//                     <div className="flex items-center gap-3">
//                       <h3 className="text-lg font-semibold text-foreground">
//                         {rule.name}
//                       </h3>
//                       <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500">
//                         {rule.status}
//                       </span>
//                     </div>
//                     <div className="flex gap-2">
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="h-8"
//                         onClick={() => handleEditRule(index)}
//                       >
//                         <Edit className="h-4 w-4 mr-2" />
//                         Edit
//                       </Button>
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         className="h-8"
//                         onClick={() => handleDeleteRule(index)}
//                       >
//                         <Trash className="h-4 w-4" />
//                       </Button>
//                     </div>
//                   </div>
//                   <p className="text-sm text-muted-foreground mb-3">
//                     {rule.description}
//                   </p>
//                   <div className="bg-muted/50 rounded-lg p-3">
//                     <pre className="text-sm text-foreground font-mono">
//                       {rule.logic}
//                     </pre>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//        <Dialog
//   open={previewFile !== null}
//   onOpenChange={(open) => {
//     if (!open) {
//       setPreviewFile(null);
//       setPreviewData([]);
//       setPreviewColumns([]);
//     }
//   }}
// >
//   <DialogContent className="max-w-5xl h-[75vh] p-0 flex flex-col overflow-hidden">
//     {/* Header */}
//     <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
//       <div className="flex items-center justify-between">
//         <div>
//           <DialogTitle className="text-lg font-semibold">
//             Preview: {previewFile}
//           </DialogTitle>
//           <p className="text-xs text-muted-foreground mt-0.5">
//             First {previewData.length} rows • Scroll horizontally to view all columns
//           </p>
//         </div>
//         <Button
//           variant="ghost"
//           size="sm"
//           className="h-8 w-8 p-0"
//           onClick={() => setPreviewFile(null)}
//         >
//           <X className="h-4 w-4" />
//         </Button>
//       </div>
//     </DialogHeader>
 
//     {/* Content Area with Scroll */}
//     <div className="flex-1 overflow-hidden flex flex-col min-h-0">
//       {previewLoading ? (
//         <div className="flex flex-col items-center justify-center h-full gap-3">
//           <Loader2 className="h-9 w-9 animate-spin text-primary" />
//           <p className="text-sm text-muted-foreground">Loading preview...</p>
//         </div>
//       ) : previewData.length === 0 ? (
//         <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
//           <FileText className="h-12 w-12 text-muted-foreground/70" />
//           <div>
//             <h3 className="text-base font-medium">No data to preview</h3>
//             <p className="text-sm text-muted-foreground mt-1">
//               File might be empty or still processing.
//             </p>
//           </div>
//         </div>
//       ) : (
//         <ScrollArea className="flex-1 w-full h-full">
//           <div className="p-4">
//             <Table className="min-w-max w-full border-collapse">
//               <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur-sm z-10">
//                 <TableRow>
//                   {previewColumns.map((col) => (
//                     <TableHead
//                       key={col}
//                       className="h-11 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap border-r last:border-r-0 bg-muted"
//                     >
//                       {col}
//                     </TableHead>
//                   ))}
//                 </TableRow>
//               </TableHeader>
//               <TableBody>
//                 {previewData.map((row, rowIndex) => (
//                   <TableRow
//                     key={rowIndex}
//                     className="hover:bg-muted/50 border-b last:border-b-0"
//                   >
//                     {previewColumns.map((col) => (
//                       <TableCell
//                         key={col}
//                         className="px-4 py-3 text-sm whitespace-nowrap border-r last:border-r-0"
//                       >
//                         {row[col] != null ? String(row[col]) : "—"}
//                       </TableCell>
//                     ))}
//                   </TableRow>
//                 ))}
//               </TableBody>
//             </Table>
//           </div>
 
//           {/* Scrollbars */}
//           <ScrollBar orientation="vertical" className="z-30" />
//           <ScrollBar orientation="horizontal" className="z-30" />
//         </ScrollArea>
//       )}
//     </div>
//   </DialogContent>
// </Dialog>
 
//         {/* Bottom Navigation */}
//         <div className="flex items-center justify-between">
//           <Button variant="outline" onClick={() => navigate("/workflow/ner")}>
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back
//           </Button>
//           <div className="flex gap-3">
//             <Button
//               variant="outline"
//               onClick={() => navigate("/workflow/path-selection")}
//             >
//               <SkipForward className="h-4 w-4 mr-2" />
//               Skip
//             </Button>
//             <Button onClick={() => navigate("/workflow/path-selection")}>
//               Continue to Path Selection
//               <ArrowRight className="h-4 w-4 ml-2" />
//             </Button>
//           </div>
//         </div>
//       </div>

//       <AddBusinessRuleDialog
//         open={showAddRuleDialog}
//         onOpenChange={(open) => {
//           setShowAddRuleDialog(open);
//           if (!open) setEditingRule(null);
//         }}
//         onAddRule={handleAddRule}
//         initialRule={editingRule !== null ? rules[editingRule] : undefined}
//       />

//       <BusinessRuleValidationDialog
//         open={showValidationDialog}
//         onOpenChange={setShowValidationDialog}
//         rulesCount={rules.length}
//       />

//       <BusinessRuleCompleteDialog
//         open={showCompleteDialog}
//         onOpenChange={setShowCompleteDialog}
//         onContinue={() => navigate("/workflow/path-selection")}
//         jobInfo={jobInfo}
//       />
//     </WorkflowLayout>
//   );
// }





import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import {
  Code,
  AlertTriangle,
  CheckCircle,
  Play,
  Plus,
  FileText,
  ArrowLeft,
  ArrowRight,
  SkipForward,
  Download,
  Edit,
  Trash,
  Loader2,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { AddBusinessRuleDialog } from "@/components/AddBusinessRuleDialog";
import { BusinessRuleValidationDialog } from "@/components/BusinessRuleValidationDialog";
import { BusinessRuleCompleteDialog } from "@/components/BusinessRuleCompleteDialog";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Rule {
  name: string;
  description: string;
  logic: string;
  status: string;
}

interface Dataset {
  filename: string;
  date_modified: string;
}

// ── NEW: Databricks-platform "list datasets" response shape ─────────────
interface DatabricksDataset {
  file_name: string;
  file_size: number;
  last_modified: string; // ISO timestamp
}

interface DatabricksListDatasetsResponse {
  user_id: string;
  job_id: string;
  datasets: DatabricksDataset[];
}

/**
 * Reads the "user" object from localStorage and returns true if the user's
 * dataplatform is "Databricks". Same check used across the other workflow
 * pages (Data Quality / Data Preview / Create Dataset).
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

const databricksListDatasetsUrl = (userId: string, jobId: string) =>
  `https://api.veriton.ai/api/service-databricks/list-datasets?user_id=${userId}&job_id=${jobId}`;

// ── NEW: Databricks "record job state" endpoint (application/json) —
// the Databricks equivalent of service2/set-job-options; sets
// business-logic=true (defaults to false) when the user clicks
// "Run All Rules".
const DATABRICKS_RECORD_STATE_URL =
  "https://api.veriton.ai/api/service-databricks/record-state";

// ── NEW: Databricks equivalent of service2/api/v1/business-rules/process.
// Takes user_id/job_id/file_path (instead of a single blob_path) and has
// no output_blob_path — the backend derives the output location itself.
const DATABRICKS_BUSINESS_RULES_PROCESS_URL =
  "https://api.veriton.ai/api/service-databricks/api/v1/business-rules/process";

export default function BusinessLogic() {
  const navigate = useNavigate();
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [showAddRuleDialog, setShowAddRuleDialog] = useState(false);
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const [rules, setRules] = useState<Rule[]>([]);
  const [editingRule, setEditingRule] = useState<number | null>(null);
  const [validating, setValidating] = useState(false);
  const [jobInfo, setJobInfo] = useState<{
    correlation_id?: string;
    databricks_run_id?: string;
    message?: string;
    // NEW: only populated on the Databricks response
    status?: string;
    mode_used?: string;
    output_file_path?: string;
    failed_output_file_path?: string;
  } | null>(null);

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loadingDatasets, setLoadingDatasets] = useState(true);

  // Add near other state declarations
  const [previewFile, setPreviewFile] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewColumns, setPreviewColumns] = useState<string[]>([]);

  const user = localStorage.getItem("user");
  const userId = user ? JSON.parse(user).id : null;
  const jobId = localStorage.getItem("current_job_id");
  const useDatabricksRoute = isDatabricksUser();

  // Reusable close button for all toasts (Sonner style)
  const closeToastButton = (
    <button
      onClick={() => toast.dismiss()}
      className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
      aria-label="Close toast"
    >
      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
    </button>
  );

  // Fetch available datasets
  useEffect(() => {
    if (!userId || !jobId) {
      toast.error("Missing user or job information. Please log in again.", {
        duration: 3000,
        action: closeToastButton,
      });
      setLoadingDatasets(false);
      return;
    }

    // ── Existing default (non-Databricks) datasets fetch — unchanged ────
    const fetchDatasetsDefault = async () => {
      const url = `https://api.veriton.ai/api/service2/list-datasets?user_id=${userId}&job_id=${jobId}`;
      const res = await fetch(url, {
        headers: {
          accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load datasets: ${res.status}`);
      }

      const data = await res.json();

      if (data.datasets && Array.isArray(data.datasets)) {
        setDatasets(data.datasets);
      } else {
        setDatasets([]);
        toast.info(data.message || "No datasets available", {
          duration: 3000,
          action: closeToastButton,
        });
      }
    };

    // ── NEW: Databricks datasets fetch via /list-datasets ───────────────
    const fetchDatasetsDatabricks = async () => {
      const res = await fetch(databricksListDatasetsUrl(userId!, jobId!), {
        headers: {
          accept: "application/json",
        },
      });

      if (!res.ok) {
        throw new Error(`Failed to load datasets: ${res.status}`);
      }

      const data: DatabricksListDatasetsResponse = await res.json();

      if (data.datasets && Array.isArray(data.datasets)) {
        const mappedDatasets: Dataset[] = data.datasets.map((ds) => ({
          filename: ds.file_name,
          date_modified: ds.last_modified,
        }));
        setDatasets(mappedDatasets);
      } else {
        setDatasets([]);
        toast.info("No datasets available", {
          duration: 3000,
          action: closeToastButton,
        });
      }
    };

    const fetchDatasets = async () => {
      setLoadingDatasets(true);
      try {
        if (isDatabricksUser()) {
          await fetchDatasetsDatabricks();
        } else {
          await fetchDatasetsDefault();
        }
      } catch (err) {
        console.error("Error fetching datasets:", err);
        toast.error("Could not load available datasets", {
          duration: 4000,
          action: closeToastButton,
        });
      } finally {
        setLoadingDatasets(false);
      }
    };

    fetchDatasets();
  }, [userId, jobId]);

  const toggleFileSelection = (fileName: string) => {
    setSelectedFiles((prev) =>
      prev.includes(fileName)
        ? prev.filter((f) => f !== fileName)
        : [...prev, fileName],
    );
  };

  // Update job options → set business_logic: true + rules (default /
  // non-Databricks flow)
  const updateBusinessLogicOptions = async () => {
    if (!userId || !jobId) {
      console.warn(
        "Cannot update business logic options — missing userId or jobId",
      );
      return false;
    }

    const rulesPayload: Record<string, string> = {};
    rules.forEach((rule, index) => {
      rulesPayload[rule.name] = rule.logic;
    });

    const payload = {
      user_id: userId,
      job_id: jobId,
      business_logic: {
        business_logic: true,
        rules: rulesPayload,
      },
    };

    console.log(payload);

    try {
      const response = await fetch(
        "https://api.veriton.ai/api/service2/set-job-options",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Failed to update business logic options: ${response.status} - ${errorText}`,
        );
      }

      const result = await response.json();

      if (result.status === "success") {
        console.log(
          "Successfully updated business_logic + rules in job options",
        );
        return true;
      } else {
        throw new Error(result.message || "Failed to update job options");
      }
    } catch (err) {
      console.error("Error updating business logic options:", err);
      return false;
    }
  };

  // ── NEW: Databricks equivalent of updateBusinessLogicOptions — records
  // business-logic=true (defaults to false) via /record-state. Called
  // when a Databricks user clicks "Run All Rules".
  const updateDatabricksJobState = async () => {
    if (!userId || !jobId) {
      console.warn("Cannot record job state — missing userId or jobId");
      return false;
    }

    const payload = {
      user_id: userId,
      job_id: jobId,
      dq: false,
      ner: false,
      "business-logic": true,
    };

    try {
      const response = await fetch(DATABRICKS_RECORD_STATE_URL, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to record state: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      console.log("Databricks job state recorded (business-logic=true):", result);
      return true;
    } catch (err) {
      console.error("Error recording Databricks job state (business-logic=true):", err);
      return false;
    }
  };

  const handleRunAllRules = async () => {
    if (rules.length === 0) {
      toast.error("No rules to run", {
        duration: 3000,
        action: closeToastButton,
      });
      return;
    }
    if (selectedFiles.length === 0) {
      toast.error("Please select at least one file", {
        duration: 3000,
        action: closeToastButton,
      });
      return;
    }

    const selectedFilename = selectedFiles[0];
    let filename = selectedFilename;
    if (!filename.toLowerCase().endsWith(".csv")) {
      filename += ".csv";
    }

    const blobPath = `${userId}/${jobId}/${filename}`;

    const rulesPayloadForProcess: Record<string, string> = {};
    rules.forEach((rule) => {
      rulesPayloadForProcess[rule.name] = rule.logic;
    });

    setValidating(true);
    setShowValidationDialog(true);
    setJobInfo(null);

    try {
      // Update job option (set business-logic: true) — Databricks users
      // record state via /record-state, default (Fabric/Azure) users use
      // set-job-options.
      if (useDatabricksRoute) {
        await updateDatabricksJobState();
      } else {
        await updateBusinessLogicOptions();
      }

      if (useDatabricksRoute) {
        // ── NEW: Databricks flow calls the Databricks business-rules
        // process endpoint. Payload shape differs from the default flow:
        // user_id/job_id/file_path instead of a single blob_path, and no
        // output_blob_path (the backend derives the output location and
        // returns it as output_file_path / failed_output_file_path).
        const databricksProcessPayload = {
          user_id: userId,
          job_id: jobId,
          file_path: blobPath,
          rules: rulesPayloadForProcess,
          mode: "auto",
          overwrite_source: false,
        };

        console.log("Databricks process payload:", databricksProcessPayload);

        const response = await fetch(DATABRICKS_BUSINESS_RULES_PROCESS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(databricksProcessPayload),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `API error: ${response.status}`);
        }

        const result = await response.json();

        // Databricks responds synchronously with status "success" (not
        // "job_submitted" like the default flow) once processing completes.
        if (result.status === "success" || result.processed) {
          setJobInfo({
            correlation_id: result.correlation_id,
            databricks_run_id: result.databricks_run_id,
            message: result.message,
            status: result.status,
            mode_used: result.mode_used,
            output_file_path: result.output_file_path,
            failed_output_file_path: result.failed_output_file_path,
          });
          toast.success(result.message || "Business rules processed successfully!", {
            duration: 3000,
            action: closeToastButton,
          });
        } else {
          throw new Error(result.message || "Unexpected response");
        }

        return;
      }

      // ── Existing default (non-Databricks) flow — unchanged ────────────
      const processPayload = {
        blob_path: blobPath,
        rules: rulesPayloadForProcess,
        mode: "auto",
        overwrite_source: true,
        output_blob_path: "processed/Book1_1_filtered.csv",
      };

      console.log("Process payload:", processPayload);

      const response = await fetch(
        "https://api.veriton.ai/api/service2/api/v1/business-rules/process",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(processPayload),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status}`);
      }

      const result = await response.json();

      if (result.status === "job_submitted") {
        setJobInfo({
          correlation_id: result.correlation_id,
          databricks_run_id: result.databricks_run_id,
          message: result.message,
        });
        toast.success("Business rules processing job submitted successfully!", {
          duration: 3000,
          action: closeToastButton,
        });
      } else {
        throw new Error(result.message || "Unexpected response");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to submit business rules job", {
        duration: 4000,
        action: closeToastButton,
      });
      setJobInfo(null);
    } finally {
      setValidating(false);
      setTimeout(() => {
        setShowValidationDialog(false);
        setShowCompleteDialog(true);
      }, 1200);
    }
  };

  const handleAddRule = (rule: any) => {
    if (editingRule !== null) {
      const updatedRules = [...rules];
      updatedRules[editingRule] = { ...rule, status: "testing" };
      setRules(updatedRules);
      setEditingRule(null);
      toast.success("Rule Updated Successfully", {
        duration: 2500,
        action: closeToastButton,
      });
    } else {
      setRules([...rules, { ...rule, status: "testing" }]);
      toast.success("Rule Added Successfully", {
        duration: 2500,
        action: closeToastButton,
      });
    }
    setShowAddRuleDialog(false);
  };

  const handleEditRule = (index: number) => {
    setEditingRule(index);
    setShowAddRuleDialog(true);
  };

  const handleDeleteRule = (index: number) => {
    setRules(rules.filter((_, i) => i !== index));
    toast.success("Rule Deleted Successfully", {
      duration: 2500,
      action: closeToastButton,
    });
  };

  const handleDownloadCSV = () => {
    const csvContent = [
      ["Rule Name", "Description", "Logic", "Status"],
      ...rules.map((rule) => [
        rule.name,
        rule.description,
        rule.logic,
        rule.status,
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "business_rules.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Business rules exported to CSV", {
      duration: 1000,
      action: closeToastButton,
    });
  };

  const fetchPreview = async (filename: string) => {
    if (!userId || !jobId) {
      toast.error("Missing user/job info", { duration: 1000 });
      return;
    }

    setPreviewLoading(true);
    setPreviewFile(filename);
    setPreviewData([]);
    setPreviewColumns([]);

    try {
      // Normalize filename (add .csv if missing)

      const datasetName = filename;

      // Optional: log what you're sending (for debugging)
      console.log("Preview request:", {
        userId,
        jobId,
        datasetname: datasetName,
      });

      const url = `https://api.veriton.ai/api/service2/preview-dataset?user_id=${userId}&job_id=${jobId}&datasetname=${encodeURIComponent(datasetName)}`;

      const res = await fetch(url, {
        headers: { accept: "application/json" },
      });

      if (!res.ok) {
        throw new Error(`Preview failed: ${res.status}`);
      }

      const json = await res.json();

      // Handle different possible response shapes
      let rows: any[] = [];
      if (Array.isArray(json)) {
        rows = json;
      } else if (json.preview_rows) {
        rows = json.preview_rows;
      } else if (json.rows) {
        rows = json.rows;
      } else if (json.data) {
        rows = json.data;
      }

      if (rows.length === 0) {
        toast.info("No preview data available", { duration: 2000 });
        return;
      }

      // Extract columns from first row (or use known schema if available)
      const columns = Object.keys(rows[0] || {});
      setPreviewColumns(columns);
      setPreviewData(rows.slice(0, 50)); // limit to avoid performance issues
    } catch (err: any) {
      console.error("Preview error:", err);
      toast.error(err.message || "Failed to load data preview", {
        duration: 2000,
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const stats = {
    activeRules: rules.filter((r) => r.status === "active").length,
    testing: rules.filter((r) => r.status === "testing").length,
    totalRules: rules.length,
    successRate: "N/A",
  };

  const canRunRules = rules.length > 0 && selectedFiles.length > 0;

  return (
    <WorkflowLayout>
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Business Logic Rules
            </h1>
            <p className="text-muted-foreground">
              Define and manage custom business rules for data processing and
              validation
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleDownloadCSV}
              disabled={rules.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              Download CSV
            </Button>
            <Button
              variant="outline"
              onClick={handleRunAllRules}
              disabled={!canRunRules || validating}
            >
              {validating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Run All Rules
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                setEditingRule(null);
                setShowAddRuleDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Rule
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="border border-border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Active Rules
              </span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              {stats.activeRules}
            </div>
          </div>
          <div className="border border-border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Testing</span>
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              {stats.testing}
            </div>
          </div>
          <div className="border border-border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Rules</span>
              <Code className="h-5 w-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              {stats.totalRules}
            </div>
          </div>
          <div className="border border-border rounded-lg p-6 bg-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Success Rate
              </span>
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              {stats.successRate}
            </div>
          </div>
        </div>

        {/* File Selection */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">
              Select a file to apply rules
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Datasets available from your current job/ingestion.
          </p>
          <div className="border border-border rounded-lg overflow-hidden min-h-[200px]">
            {loadingDatasets ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">
                  Loading available datasets...
                </p>
              </div>
            ) : datasets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  No datasets available
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Complete previous steps or check job configuration
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/60 border-b">
                    <TableHead className="w-10 text-center">
                      {" "}
                      {/* checkbox */}
                      <span className="sr-only">Select</span>
                    </TableHead>
                    <TableHead className="font-medium pl-4 min-w-[160px]">
                      File Name
                    </TableHead>
                    <TableHead className="font-medium pr-10 min-w-[180px]">
                      Last Modified
                    </TableHead>
                    <TableHead className="w-12 text-center">Preview</TableHead>{" "}
                    {/* ← fixed width, centered */}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {datasets.map((file) => {
                    const isSelected = selectedFiles.includes(file.filename);
                    return (
                      <TableRow
                        key={file.filename}
                        className="hover:bg-muted/40 transition-colors cursor-pointer border-b last:border-b-0"
                        onClick={() => toggleFileSelection(file.filename)}
                      >
                        <TableCell className="text-center">
                          <Checkbox
                            checked={isSelected}
                            onClick={(e) => e.stopPropagation()}
                            className="mx-auto"
                          />
                        </TableCell>
                        <TableCell className="font-medium pl-4">
                          {file.filename}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground pr-10">
                          {file.date_modified}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 "
                            onClick={(e) => {
                              e.stopPropagation();
                              fetchPreview(file.filename);
                            }}
                            title="Preview data"
                          >
                            <Eye className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>

        {/* Rules List */}
        <div className="border border-border rounded-lg p-6 bg-card mb-6">
          {rules.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-lg">
              <Code className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No Business Rules Added Yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Click '+ Add New Rule' to create your first business logic rule.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {rules.map((rule, index) => (
                <div
                  key={index}
                  className="border border-border rounded-lg p-4 bg-background"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-foreground">
                        {rule.name}
                      </h3>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500">
                        {rule.status}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => handleEditRule(index)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8"
                        onClick={() => handleDeleteRule(index)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {rule.description}
                  </p>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <pre className="text-sm text-foreground font-mono">
                      {rule.logic}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
       <Dialog
  open={previewFile !== null}
  onOpenChange={(open) => {
    if (!open) {
      setPreviewFile(null);
      setPreviewData([]);
      setPreviewColumns([]);
    }
  }}
>
  <DialogContent className="max-w-5xl h-[75vh] p-0 flex flex-col overflow-hidden">
    {/* Header */}
    <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
      <div className="flex items-center justify-between">
        <div>
          <DialogTitle className="text-lg font-semibold">
            Preview: {previewFile}
          </DialogTitle>
          <p className="text-xs text-muted-foreground mt-0.5">
            First {previewData.length} rows • Scroll horizontally to view all columns
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setPreviewFile(null)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </DialogHeader>
 
    {/* Content Area with Scroll */}
    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
      {previewLoading ? (
        <div className="flex flex-col items-center justify-center h-full gap-3">
          <Loader2 className="h-9 w-9 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading preview...</p>
        </div>
      ) : previewData.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
          <FileText className="h-12 w-12 text-muted-foreground/70" />
          <div>
            <h3 className="text-base font-medium">No data to preview</h3>
            <p className="text-sm text-muted-foreground mt-1">
              File might be empty or still processing.
            </p>
          </div>
        </div>
      ) : (
        <ScrollArea className="flex-1 w-full h-full">
          <div className="p-4">
            <Table className="min-w-max w-full border-collapse">
              <TableHeader className="sticky top-0 bg-muted/95 backdrop-blur-sm z-10">
                <TableRow>
                  {previewColumns.map((col) => (
                    <TableHead
                      key={col}
                      className="h-11 px-4 text-xs font-medium text-muted-foreground whitespace-nowrap border-r last:border-r-0 bg-muted"
                    >
                      {col}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {previewData.map((row, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className="hover:bg-muted/50 border-b last:border-b-0"
                  >
                    {previewColumns.map((col) => (
                      <TableCell
                        key={col}
                        className="px-4 py-3 text-sm whitespace-nowrap border-r last:border-r-0"
                      >
                        {row[col] != null ? String(row[col]) : "—"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
 
          {/* Scrollbars */}
          <ScrollBar orientation="vertical" className="z-30" />
          <ScrollBar orientation="horizontal" className="z-30" />
        </ScrollArea>
      )}
    </div>
  </DialogContent>
</Dialog>
 
        {/* Bottom Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate("/workflow/ner")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate("/workflow/path-selection")}
            >
              <SkipForward className="h-4 w-4 mr-2" />
              Skip
            </Button>
            <Button onClick={() => navigate("/workflow/path-selection")}>
              Continue to Path Selection
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

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
        onContinue={() => navigate("/workflow/path-selection")}
        jobInfo={jobInfo}
      />
    </WorkflowLayout>
  );
}