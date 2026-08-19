


// import { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { WorkflowLayout } from "@/components/WorkflowLayout";
// import { Button } from "@/components/ui/button";
// import { Database, Edit, Trash2, Loader2, X, Upload, Plus } from "lucide-react";
// import { Checkbox } from "@/components/ui/checkbox";
// import { ValidationProgressDialog } from "@/components/ValidationProgressDialog";
// import { ValidationCompleteDialog } from "@/components/ValidationCompleteDialog";
// import { AnalysisCompleteDialog } from "@/components/AnalysisCompleteDialog";
// import { QuickFixDialog } from "@/components/QuickFixDialog";
// import { toast } from "sonner";
// import { ArrowLeft, ArrowRight, Plus as PlusIcon, Save, Table as TableIcon, ChevronDown, ChevronUp, History, LayoutGrid, SkipForward, Paperclip } from "lucide-react";
// import Papa from "papaparse";
// import * as XLSX from "xlsx";

// interface DQRule {
//   name: string;
//   type: string;
//   condition: string;
// }

// interface ValidationResult {
//   rules_passed: number;
//   rules_failed: number;
//   issues: Record<string, any>;
//   proposed_solutions: Record<string, string>;
// }

// interface FixResult {
//   success: boolean;
//   message: string;
// }

// interface DatasetFile {
//   filename: string;
//   date_modified: string;
//   file_size?: number; // NEW: only populated for Databricks-sourced datasets
// }

// type RulesSource = "generated" | "uploaded" | null;

// // ── NEW: Databricks-platform "list datasets" source ─────────────────────
// interface DatabricksDataset {
//   file_name: string;
//   file_size: number;
//   last_modified: string; // ISO timestamp
// }

// interface DatabricksListDatasetsResponse {
//   user_id: string;
//   job_id: string;
//   datasets: DatabricksDataset[];
// }

// /**
//  * Reads the "user" object from localStorage and returns true if the user's
//  * dataplatform is "Databricks". Same check used across the other workflow
//  * pages (Data Preview / Create Dataset).
//  */
// function isDatabricksUser(): boolean {
//   try {
//     const userData = localStorage.getItem("user");

//     if (!userData) return false;

//     const user = JSON.parse(userData);

//     return user?.dataplatform === "Databricks";
//   } catch (err) {
//     console.error("Failed to read dataplatform from localStorage user:", err);

//     return false;
//   }
// }

// const databricksListDatasetsUrl = (userId: string, jobId: string) =>
//   `https://api.veriton.ai/api/service-databricks/list-datasets?user_id=${userId}&job_id=${jobId}`;

// // ── NEW: Databricks DQ rules generation endpoint (multipart/form-data) ──
// const DATABRICKS_RUN_DQ_RULES_GENERATION_URL =
//   "https://api.veriton.ai/api/service-databricks/run-dq-rules-generation";

// export default function DataQuality() {
//   const navigate = useNavigate();

//   const [files, setFiles] = useState<DatasetFile[]>([]);
//   const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
//   const [rulesGenerated, setRulesGenerated] = useState(false);
//   const [rulesSource, setRulesSource] = useState<RulesSource>(null);
//   const [dataQualityRules, setDataQualityRules] = useState<DQRule[]>([]);
//   const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
//   const [fixResult, setFixResult] = useState<FixResult | null>(null);

//   const [validationProgress, setValidationProgress] = useState(0);
//   const [showValidationProgress, setShowValidationProgress] = useState(false);
//   const [showValidationComplete, setShowValidationComplete] = useState(false);
//   const [showAnalysisComplete, setShowAnalysisComplete] = useState(false);
//   const [showQuickFix, setShowQuickFix] = useState(false);
//   const [quickFixProgress, setQuickFixProgress] = useState(0);
//   const [quickFixComplete, setQuickFixComplete] = useState(false);

//   const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
//   const [editedRule, setEditedRule] = useState<DQRule | null>(null);
//   const [generating, setGenerating] = useState(false);
//   const [validating, setValidating] = useState(false);
//   const [fixing, setFixing] = useState(false);
//   const [loadingFiles, setLoadingFiles] = useState(true);
//   const [uploadingRules, setUploadingRules] = useState(false);

//   // ── NEW: an optional rules file the user can attach specifically to the
//   // "Generate DQ Rules" call for Databricks users (separate from the
//   // existing "Upload Rules" flow below, which bypasses generation
//   // entirely and sets rules directly from a parsed file). If nothing is
//   // attached, an empty value is sent for `rules_file` as the API expects.
//   const [pendingRulesFile, setPendingRulesFile] = useState<File | null>(null);
//   const pendingRulesFileInputRef = useRef<HTMLInputElement>(null);

//   // Delete-confirmation dialog state
//   const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

//   const rulesFileInputRef = useRef<HTMLInputElement>(null);

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

//   // Fetch ingested datasets
//   useEffect(() => {
//     if (!userId || !jobId) {
//       toast.error("Missing user or job information", {
//         duration: 3000,
//         action: closeToastButton,
//       });
//       setLoadingFiles(false);
//       return;
//     }

//     // ── Existing default (non-Databricks) datasets fetch — unchanged ────
//     const fetchDatasetsDefault = async () => {
//       const response = await fetch(
//         `https://api.veriton.ai/api/service2/list-datasets?user_id=${userId}&job_id=${jobId}`,
//         { headers: { accept: "application/json" } }
//       );

//       if (!response.ok) throw new Error("Failed to fetch datasets");

//       const result = await response.json();

//       if (result.datasets && Array.isArray(result.datasets)) {
//         setFiles(result.datasets);
//       } else {
//         setFiles([]);
//         toast.info("No datasets found for this job", {
//           duration: 3000,
//           action: closeToastButton,
//         });
//       }
//     };

//     // ── NEW: Databricks datasets fetch via /list-datasets ───────────────
//     const fetchDatasetsDatabricks = async () => {
//       const response = await fetch(databricksListDatasetsUrl(userId!, jobId!), {
//         headers: { accept: "application/json" },
//       });

//       if (!response.ok) throw new Error("Failed to fetch datasets");

//       const result: DatabricksListDatasetsResponse = await response.json();

//       if (result.datasets && Array.isArray(result.datasets)) {
//         const mappedFiles: DatasetFile[] = result.datasets.map((ds) => ({
//           filename: ds.file_name,
//           date_modified: ds.last_modified,
//           file_size: ds.file_size,
//         }));
//         setFiles(mappedFiles);
//       } else {
//         setFiles([]);
//         toast.info("No datasets found for this job", {
//           duration: 3000,
//           action: closeToastButton,
//         });
//       }
//     };

//     const fetchDatasets = async () => {
//       setLoadingFiles(true);
//       try {
//         if (isDatabricksUser()) {
//           await fetchDatasetsDatabricks();
//         } else {
//           await fetchDatasetsDefault();
//         }
//       } catch (error) {
//         console.error("Error fetching datasets:", error);
//         toast.error("Failed to load ingested files", {
//           duration: 4000,
//           action: closeToastButton,
//         });
//         setFiles([]);
//       } finally {
//         setLoadingFiles(false);
//       }
//     };

//     fetchDatasets();
//   }, [userId, jobId]);

//   const getSelectedBlobPaths = () => {
//     return Array.from(selectedFiles).map((filename) => {
//       const name = filename.endsWith(".csv") ? filename : `${filename}.csv`;
//       return `${userId}/${jobId}/${name}`;
//     });
//   };

//   const handlePendingRulesFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0] || null;
//     setPendingRulesFile(file);
//   };

//   const updateJobOptions = async () => {
//     if (!userId || !jobId) {
//       console.warn("Cannot update job options — missing userId or jobId");
//       return;
//     }

//     const payload = {
//       user_id: userId,
//       job_id: jobId,
//       dq: true,
//     };

//     try {
//       const response = await fetch("https://api.veriton.ai/api/service2/set-job-options", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Failed to update job options: ${response.status} - ${errorText}`);
//       }

//       const result = await response.json();

//       if (result.status === "success") {
//         console.log("DQ flag successfully set to true in job options");
//       } else {
//         throw new Error(result.message || "Unknown response from set-job-options");
//       }
//     } catch (err) {
//       console.error("Error updating job options (dq=true):", err);
//     }
//   };

//   const handleGenerateRules = async () => {
//     if (selectedFiles.size === 0) {
//       toast.error("Please select at least one file", {
//         duration: 3000,
//         action: closeToastButton,
//       });
//       return;
//     }

//     setGenerating(true);

//     try {
//       const useDatabricksRoute = isDatabricksUser();

//       if (!useDatabricksRoute) {
//         // Set DQ flag in job options — this is specific to the default
//         // (service2/Fabric) pipeline; the Databricks job doesn't use this
//         // flag, so it's skipped for Databricks users below.
//         await updateJobOptions();
//       }

//       if (useDatabricksRoute) {
//         // ── NEW: Databricks users call run-dq-rules-generation as
//         // multipart/form-data. The endpoint only documents a single
//         // `databricks_path` string per call (no array form), so to support
//         // selecting multiple files this calls the endpoint once per
//         // selected file (in parallel) and merges the results. If the API
//         // actually accepts an array of paths in one call, this can be
//         // simplified back down to a single request.

//         const selectedFileNames = Array.from(selectedFiles);

//         const databricksPaths = selectedFileNames.map(
//           (name) => `${userId}/${jobId}/${name}`,
//         );

//         console.log("Calling Databricks DQ Rules Generation API for:", databricksPaths, {
//           rulesFileAttached: !!pendingRulesFile,
//         });

//         const generationResults = await Promise.all(
//           databricksPaths.map(async (databricksPath) => {
//             const payload = {
//               input_type: "databricks",
//               databricks_path: databricksPath,
//             };

//             const formData = new FormData();
//             formData.append("payload", JSON.stringify(payload));

//             // Only attach rules_file when a real file is present — the API
//             // expects either an UploadFile or the field omitted entirely;
//             // sending an empty string throws a validation error
//             // ("Expected UploadFile, received: <class 'str'>").
//             if (pendingRulesFile) {
//               formData.append("rules_file", pendingRulesFile);
//             }

//             // NOTE: deliberately not setting a Content-Type header — the
//             // browser sets the correct multipart/form-data boundary
//             // automatically when the body is a FormData instance.
//             const response = await fetch(DATABRICKS_RUN_DQ_RULES_GENERATION_URL, {
//               method: "POST",
//               headers: { Accept: "application/json" },
//               body: formData,
//             });

//             if (!response.ok) {
//               const errorText = await response.text();
//               throw new Error(
//                 `API error ${response.status} for ${databricksPath}: ${errorText}`,
//               );
//             }

//             return response.json();
//           }),
//         );

//         const combinedRules: DQRule[] = [];
//         let totalGenerated = 0;
//         let totalUploaded = 0;

//         for (const result of generationResults) {
//           if (result.success && result.data?.file) {
//             combinedRules.push(
//               ...result.data.file.map((r: any) => ({
//                 name: r.rule,
//                 type: r.severity,
//                 condition: r.description,
//               })),
//             );

//             totalGenerated += result.meta?.generated_rules_count ?? result.data.file.length;
//             totalUploaded += result.meta?.uploaded_rules_count ?? 0;
//           }
//         }

//         if (combinedRules.length === 0) {
//           throw new Error("No rules were generated for the selected file(s)");
//         }

//         setDataQualityRules(combinedRules);
//         setRulesGenerated(true);
//         setRulesSource("generated");

//         const fileCountLabel = `${selectedFileNames.length} file${selectedFileNames.length !== 1 ? "s" : ""}`;

//         const summary =
//           totalUploaded > 0
//             ? `Generated ${totalGenerated} rule(s) across ${fileCountLabel} and included ${totalUploaded} uploaded rule(s)`
//             : `Generated ${combinedRules.length} data quality rules across ${fileCountLabel}`;

//         toast.success(summary, {
//           duration: 3000,
//           action: closeToastButton,
//         });

//         return;
//       }

//       // 2. Prepare payload for DQ rules generation API (default flow)
//       const blobPaths = getSelectedBlobPaths();
//       const firstBlobPath = blobPaths[0]; // Using first selected file

//       const payload = {
//         input_type: "azure",
//         azure_blob_path: firstBlobPath,
//       };

//       console.log("Calling DQ Rules Generation API with:", payload);

//       const response = await fetch("https://api.veriton.ai/api/service2/run-dq-rules-generation", {
//         method: "POST",
//         headers: {
//           "Accept": "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//       });

//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`API error ${response.status}: ${errorText}`);
//       }

//       const result = await response.json();

//       if (result.success && result.data?.file) {
//         const generatedRules = result.data.file.map((r: any) => ({
//           name: r.rule,
//           type: r.severity,
//           condition: r.description,
//         }));

//         setDataQualityRules(generatedRules);
//         setRulesGenerated(true);
//         setRulesSource("generated");
//         toast.success(`Generated ${generatedRules.length} data quality rules`, {
//           duration: 3000,
//           action: closeToastButton,
//         });
//       } else {
//         throw new Error(result.message || "Invalid response format");
//       }
//     } catch (error: any) {
//       console.error("DQ Rules Generation failed:", error);
//       toast.error(error.message || "Failed to generate DQ rules", {
//         duration: 4000,
//         action: closeToastButton,
//       });
//     } finally {
//       setGenerating(false);
//     }
//   };

//   // ---- Upload Rules (CSV / Excel / JSON) ----

//   const handleUploadRulesClick = () => {
//     rulesFileInputRef.current?.click();
//   };

//   const normalizeRow = (row: Record<string, any>): DQRule | null => {
//     // Accept a variety of common key casings/aliases for "rule" and "description"
//     const getField = (keys: string[]) => {
//       for (const key of Object.keys(row)) {
//         if (keys.includes(key.trim().toLowerCase())) {
//           return row[key];
//         }
//       }
//       return undefined;
//     };

//     const name = getField(["rule", "rule_name", "name"]);
//     const condition = getField(["description", "condition", "rule_description"]);

//     if (!name || String(name).trim() === "") return null;

//     return {
//       name: String(name).trim(),
//       type: "",
//       condition: condition ? String(condition).trim() : "",
//     };
//   };

//   const parseRulesFile = async (file: File): Promise<DQRule[]> => {
//     const extension = file.name.split(".").pop()?.toLowerCase();

//     if (extension === "json") {
//       const text = await file.text();
//       const data = JSON.parse(text);
//       const arr = Array.isArray(data) ? data : data.rules || data.data || [];
//       return arr
//         .map((item: any) => normalizeRow(item))
//         .filter((r: DQRule | null): r is DQRule => r !== null);
//     }

//     if (extension === "csv") {
//       const text = await file.text();
//       const parsed = Papa.parse(text, {
//         header: true,
//         skipEmptyLines: true,
//       });
//       if (parsed.errors && parsed.errors.length > 0) {
//         console.warn("CSV parse warnings:", parsed.errors);
//       }
//       return (parsed.data as Record<string, any>[])
//         .map((row) => normalizeRow(row))
//         .filter((r): r is DQRule => r !== null);
//     }

//     if (extension === "xlsx" || extension === "xls") {
//       const buffer = await file.arrayBuffer();
//       const workbook = XLSX.read(buffer, { type: "array" });
//       const sheetName = workbook.SheetNames[0];
//       const sheet = workbook.Sheets[sheetName];
//       const json = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
//       return json
//         .map((row) => normalizeRow(row))
//         .filter((r): r is DQRule => r !== null);
//     }

//     throw new Error("Unsupported file type. Please upload a CSV, Excel (.xlsx/.xls), or JSON file.");
//   };

//   const handleRulesFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     setUploadingRules(true);
//     try {
//       const parsedRules = await parseRulesFile(file);

//       if (parsedRules.length === 0) {
//         throw new Error("No valid rules found in the file. Make sure it contains 'rule' and 'description' fields.");
//       }

//       setDataQualityRules(parsedRules);
//       setRulesGenerated(true);
//       setRulesSource("uploaded");
//       toast.success(`Uploaded ${parsedRules.length} rule${parsedRules.length !== 1 ? "s" : ""}`, {
//         duration: 3000,
//         action: closeToastButton,
//       });
//     } catch (error: any) {
//       console.error("Error uploading rules file:", error);
//       toast.error(error.message || "Failed to upload rules file", {
//         duration: 4000,
//         action: closeToastButton,
//       });
//     } finally {
//       setUploadingRules(false);
//       // reset so the same file can be re-selected if needed
//       if (rulesFileInputRef.current) {
//         rulesFileInputRef.current.value = "";
//       }
//     }
//   };

//   const handleRunValidation = async () => {
//     if (dataQualityRules.length === 0) return;

//     setValidating(true);
//     setValidationProgress(0);
//     setShowValidationProgress(true);
//     setValidationResult(null);

//     const blobPaths = getSelectedBlobPaths();
//     const user = JSON.parse(localStorage.getItem("user"));
//     const email = user.email;

//     const payload = {
//       input_type: "azure",
//       azure_blob_path: blobPaths[0],
//       rules: dataQualityRules.map((r) => ({
//         rule: r.name,
//         description: r.condition,
//         severity: r.type,
//       })),
//       user_email: email,
//     };

//     try {
//       const response = await fetch("https://api.veriton.ai/api/service2/run-dq-validation", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const result = await response.json();

//       if (response.ok) {
//         setValidationResult(result);
//         toast.success("Validation completed", {
//           duration: 3000,
//           action: closeToastButton,
//         });
//       } else {
//         throw new Error("Validation failed");
//       }
//     } catch (error: any) {
//       toast.error("Validation failed", {
//         duration: 4000,
//         action: closeToastButton,
//       });
//     } finally {
//       setValidating(false);
//       setTimeout(() => {
//         setShowValidationProgress(false);
//         setShowValidationComplete(true);
//       }, 1000);
//     }
//   };

//   const handleQuickFix = async () => {
//     if (!validationResult || validationResult.rules_failed === 0) {
//       toast.info("No issues to fix", {
//         duration: 3000,
//         action: closeToastButton,
//       });
//       return;
//     }

//     setFixing(true);
//     setQuickFixProgress(0);
//     setShowQuickFix(true);
//     setFixResult(null);

//     const failedRules = Object.entries(validationResult.issues || {}).map(([column, data]: [string, any]) => ({
//       column,
//       rule: data.rule,
//       reason_for_failure: data.reason_for_failure,
//     }));

//     const blobPaths = getSelectedBlobPaths();

//     const payload = {
//       input_type: "azure",
//       azure_blob_path: blobPaths[0],
//       rules: failedRules,
//       proposed_solutions: validationResult.proposed_solutions || {},
//     };

//     try {
//       const response = await fetch("https://api.veriton.ai/api/service2/run-dq-fixing", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(payload),
//       });

//       const result = await response.json();

//       if (response.ok && result.success) {
//         setFixResult(result);
//         toast.success(result.message || "Data fixed successfully", {
//           duration: 3000,
//           action: closeToastButton,
//         });
//       }
//     } catch (error: any) {
//       // silent fail
//     } finally {
//       setFixing(false);
//       setTimeout(() => setQuickFixComplete(true), 1000);
//     }
//   };

//   const toggleFileSelection = (filename: string) => {
//     setSelectedFiles((prev) => {
//       const newSet = new Set(prev);
//       if (newSet.has(filename)) {
//         newSet.delete(filename);
//       } else {
//         newSet.add(filename);
//       }
//       return newSet;
//     });
//   };

//   const handleEditRule = (index: number) => {
//     const rule = dataQualityRules[index];
//     setEditingRuleIndex(index);
//     setEditedRule({ ...rule });
//   };

//   const handleSaveRule = (index: number) => {
//     if (editedRule) {
//       if (!editedRule.name.trim()) {
//         toast.error("Rule name cannot be empty", {
//           duration: 3000,
//           action: closeToastButton,
//         });
//         return;
//       }
//       const updatedRules = [...dataQualityRules];
//       updatedRules[index] = editedRule;
//       setDataQualityRules(updatedRules);
//       setEditingRuleIndex(null);
//       setEditedRule(null);
//       toast.success("Rule updated", {
//         duration: 2500,
//         action: closeToastButton,
//       });
//     }
//   };

//   const handleCancelEdit = () => {
//     // If the row being cancelled is a freshly added, still-empty rule, remove it
//     if (
//       editingRuleIndex !== null &&
//       dataQualityRules[editingRuleIndex] &&
//       !dataQualityRules[editingRuleIndex].name.trim()
//     ) {
//       setDataQualityRules((prev) => prev.filter((_, i) => i !== editingRuleIndex));
//     }
//     setEditingRuleIndex(null);
//     setEditedRule(null);
//   };

//   // Opens the confirmation dialog instead of deleting immediately
//   const handleDeleteRule = (index: number) => {
//     setDeleteConfirmIndex(index);
//   };

//   // Actually removes the rule once the user confirms "Yes"
//   const confirmDeleteRule = () => {
//     if (deleteConfirmIndex === null) return;
//     setDataQualityRules((prev) => prev.filter((_, i) => i !== deleteConfirmIndex));
//     toast.success("Rule deleted", {
//       duration: 2500,
//       action: closeToastButton,
//     });
//     setDeleteConfirmIndex(null);
//   };

//   const cancelDeleteRule = () => {
//     setDeleteConfirmIndex(null);
//   };

//   const handleAddRule = () => {
//     const newRule: DQRule = {
//       name: "",
//       type: rulesSource === "uploaded" ? "" : "medium",
//       condition: "",
//     };
//     setDataQualityRules((prev) => {
//       const updated = [...prev, newRule];
//       setEditingRuleIndex(updated.length - 1);
//       setEditedRule(newRule);
//       return updated;
//     });
//   };

//   const handleAnalyzeFailures = () => {
//     setShowValidationComplete(false);
//     setShowAnalysisComplete(true);
//   };

//   const handleQuickFixContinue = () => {
//     setShowQuickFix(false);
//     navigate("/workflow/ner");
//   };

//   const handleProceedToNER = () => {
//     setShowValidationComplete(false);
//     navigate("/workflow/ner");
//   };

//   const showTypeColumn = rulesSource !== "uploaded";

//   return (
//     <WorkflowLayout>
//       <div className="p-8">
//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-foreground mb-2">Data Quality Rules</h1>
//         </div>

//         {/* Hidden file input for uploading rules */}
//         <input
//           ref={rulesFileInputRef}
//           type="file"
//           accept=".csv,.xlsx,.xls,.json,application/json,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//           className="hidden"
//           onChange={handleRulesFileChange}
//         />

//         {/* ── NEW: hidden file input for the optional Databricks
//              generate-rules attachment ── */}
//         <input
//           ref={pendingRulesFileInputRef}
//           type="file"
//           accept=".csv,.xlsx,.xls,.json,application/json,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
//           className="hidden"
//           onChange={handlePendingRulesFileChange}
//         />

//         {/* Select Files Section */}
//         {!rulesGenerated && (
//           <div className="border border-border rounded-lg p-6 bg-card mb-6">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-semibold text-foreground">Select files</h2>
//               <div className="flex items-center gap-3">
//                 {/* ── NEW: optional rules-file attach, Databricks only ── */}
//                 {isDatabricksUser() && (
//                   <div className="flex items-center gap-2">
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => pendingRulesFileInputRef.current?.click()}
//                       disabled={generating}
//                     >
//                       <Paperclip className="h-4 w-4 mr-2" />
//                       {pendingRulesFile ? "Change rules file" : "Attach rules file (optional)"}
//                     </Button>
//                     {pendingRulesFile && (
//                       <span className="flex items-center gap-1 text-xs text-muted-foreground">
//                         {pendingRulesFile.name}
//                         <button
//                           onClick={() => {
//                             setPendingRulesFile(null);
//                             if (pendingRulesFileInputRef.current) {
//                               pendingRulesFileInputRef.current.value = "";
//                             }
//                           }}
//                           className="hover:text-foreground"
//                           aria-label="Remove attached rules file"
//                         >
//                           <X className="h-3 w-3" />
//                         </button>
//                       </span>
//                     )}
//                   </div>
//                 )}
//                 <Button
//                   onClick={handleUploadRulesClick}
//                   disabled={selectedFiles.size === 0 || uploadingRules || generating}
//                 >
//                   {uploadingRules ? (
//                     <>
//                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                       Uploading...
//                     </>
//                   ) : (
//                     <>
//                       <Upload className="h-4 w-4 mr-2" />
//                       Upload Rules
//                     </>
//                   )}
//                 </Button>
//                 <Button
//                   onClick={handleGenerateRules}
//                   disabled={selectedFiles.size === 0 || generating || uploadingRules}
//                 >
//                   {generating ? (
//                     <>
//                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                       Generating...
//                     </>
//                   ) : (
//                     "Generate DQ Rules"
//                   )}
//                 </Button>
//               </div>
//             </div>

//             {loadingFiles ? (
//               <div className="flex justify-center py-8">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
//               </div>
//             ) : files.length === 0 ? (
//               <div className="text-center py-8 text-muted-foreground">
//                 No datasets found. Please ingest files first.
//               </div>
//             ) : (
//               <div className="border border-border rounded-lg overflow-hidden">
//                 <table className="w-full">
//                   <thead className="bg-muted/50 border-b border-border">
//                     <tr>
//                       <th className="text-left p-4 text-sm font-medium text-muted-foreground w-12"></th>
//                       <th className="text-left p-4 text-sm font-medium text-muted-foreground">File Name</th>
//                       <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Modified</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {files.map((file) => (
//                       <tr
//                         key={file.filename}
//                         onClick={() => toggleFileSelection(file.filename)}
//                         className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${
//                           selectedFiles.has(file.filename) ? "bg-primary/10" : ""
//                         }`}
//                       >
//                         <td className="p-4">
//                           <Checkbox
//                             checked={selectedFiles.has(file.filename)}
//                             onCheckedChange={() => toggleFileSelection(file.filename)}
//                             onClick={(e) => e.stopPropagation()}
//                           />
//                         </td>
//                         <td className="p-4">
//                           <div className="flex items-center gap-3">
//                             <Database className="h-5 w-5 text-primary" />
//                             <span className="font-medium text-foreground">{file.filename}</span>
//                           </div>
//                         </td>
//                         <td className="p-4 text-sm text-muted-foreground">
//                           {new Date(file.date_modified).toLocaleString()}
//                           {file.file_size !== undefined && (
//                             <> &middot; {(file.file_size / 1024).toFixed(1)} KB</>
//                           )}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}

//             {selectedFiles.size > 0 && (
//               <div className="mt-3 text-sm text-muted-foreground">
//                 {selectedFiles.size} file{selectedFiles.size !== 1 ? "s" : ""} selected
//               </div>
//             )}
//           </div>
//         )}

//         {/* Smart Rule Proposal Section */}
//         {rulesGenerated && (
//           <div className="border border-border rounded-lg p-6 bg-card mb-6">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="text-lg font-semibold text-foreground">Smart Rule Proposal</h2>
//               <div className="flex gap-3">
//                 <Button variant="outline" onClick={handleAddRule}>
//                   <Plus className="h-4 w-4 mr-2" />
//                   Add Rule
//                 </Button>
//                 <Button onClick={handleRunValidation} disabled={validating}>
//                   {validating ? (
//                     <>
//                       <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                       Running...
//                     </>
//                   ) : (
//                     "Run DQ Validation"
//                   )}
//                 </Button>
//               </div>
//             </div>

//             <div className="border border-border rounded-lg overflow-hidden">
//               <table className="w-full table-fixed">
//                 <thead className="bg-muted/50 border-b border-border">
//                   <tr>
//                     <th className="text-left p-4 text-sm font-medium text-muted-foreground w-1/4">RULE NAME</th>
//                     {showTypeColumn && (
//                       <th className="text-left p-4 text-sm font-medium text-muted-foreground w-24">TYPE</th>
//                     )}
//                     <th className="text-left p-4 text-sm font-medium text-muted-foreground">CONDITION</th>
//                     <th className="text-right p-4 text-sm font-medium text-muted-foreground w-28">ACTIONS</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {dataQualityRules.length === 0 ? (
//                     <tr>
//                       <td
//                         colSpan={showTypeColumn ? 4 : 3}
//                         className="p-8 text-center text-muted-foreground"
//                       >
//                         No rules yet. Click "Add Rule" to create one.
//                       </td>
//                     </tr>
//                   ) : (
//                     dataQualityRules.map((rule, index) => {
//                       const isEditing = editingRuleIndex === index;
//                       const displayRule = isEditing && editedRule ? editedRule : rule;

//                       return (
//                         <tr
//                           key={index}
//                           className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${
//                             isEditing ? "align-top" : ""
//                           }`}
//                         >
//                           <td className="p-4 text-sm font-medium text-foreground align-top">
//                             {isEditing ? (
//                               <textarea
//                                 value={displayRule.name}
//                                 onChange={(e) => setEditedRule({ ...displayRule, name: e.target.value })}
//                                 placeholder="Rule name"
//                                 rows={2}
//                                 className="w-full bg-background border border-border rounded px-2 py-1 resize-y min-h-[44px] whitespace-pre-wrap break-words"
//                                 autoFocus
//                               />
//                             ) : (
//                               <span className="whitespace-pre-wrap break-words">{displayRule.name}</span>
//                             )}
//                           </td>
//                           {showTypeColumn && (
//                             <td className="p-4 text-sm text-muted-foreground align-top">
//                               {isEditing ? (
//                                 <textarea
//                                   value={displayRule.type}
//                                   onChange={(e) => setEditedRule({ ...displayRule, type: e.target.value })}
//                                   placeholder="e.g. high"
//                                   rows={2}
//                                   className="w-full bg-background border border-border rounded px-2 py-1 resize-y min-h-[44px] whitespace-pre-wrap break-words"
//                                 />
//                               ) : (
//                                 <span className="whitespace-pre-wrap break-words">{displayRule.type}</span>
//                               )}
//                             </td>
//                           )}
//                           <td className="p-4 text-sm text-muted-foreground align-top">
//                             {isEditing ? (
//                               <textarea
//                                 value={displayRule.condition}
//                                 onChange={(e) => setEditedRule({ ...displayRule, condition: e.target.value })}
//                                 placeholder="Description / condition"
//                                 rows={4}
//                                 className="w-full bg-background border border-border rounded px-2 py-1 resize-y min-h-[88px] whitespace-pre-wrap break-words"
//                               />
//                             ) : (
//                               <span className="whitespace-pre-wrap break-words">{displayRule.condition}</span>
//                             )}
//                           </td>
//                           <td className="p-4 text-right align-top">
//                             <div className="flex justify-end gap-2">
//                               {isEditing ? (
//                                 <>
//                                   <Button variant="outline" size="sm" className="h-8" onClick={() => handleSaveRule(index)}>
//                                     Save
//                                   </Button>
//                                   <Button variant="ghost" size="sm" className="h-8" onClick={handleCancelEdit}>
//                                     Cancel
//                                   </Button>
//                                 </>
//                               ) : (
//                                 <>
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="h-8 w-8"
//                                     onClick={() => handleEditRule(index)}
//                                   >
//                                     <Edit className="h-4 w-4" />
//                                   </Button>
//                                   <Button
//                                     variant="ghost"
//                                     size="icon"
//                                     className="h-8 w-8"
//                                     onClick={() => handleDeleteRule(index)}
//                                   >
//                                     <Trash2 className="h-4 w-4" />
//                                   </Button>
//                                 </>
//                               )}
//                             </div>
//                           </td>
//                         </tr>
//                       );
//                     })
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {/* Bottom Action Buttons */}
//         {rulesGenerated && (
//           <div className="flex justify-between gap-3">
//             <div className="flex gap-3">
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   setRulesGenerated(false);
//                   setRulesSource(null);
//                 }}
//               >
//                 <ArrowLeft className="mr-2 h-4 w-4" />
//                 Back to Select Datasets
//               </Button>
//             </div>
//           </div>
//         )}

//         <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
//           <Button variant="outline" onClick={() => navigate("/workflow/data-creation")}>
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back to Create Dataset
//           </Button>

//           <Button
//             onClick={() => navigate("/workflow/ner")}
//             className="bg-primary hover:bg-primary/90"
//           >
//             <SkipForward className="h-4 w-4" />
//             Skip
//           </Button>
//         </div>
//       </div>

//       {/* Delete confirmation dialog */}
//       {deleteConfirmIndex !== null && (
//         <div
//           className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
//           onClick={cancelDeleteRule}
//         >
//           <div
//             className="bg-card border border-border rounded-lg shadow-lg w-full max-w-sm p-6"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <h3 className="text-lg font-semibold text-foreground mb-2">Delete rule?</h3>
//             <p className="text-sm text-muted-foreground mb-6">
//               Are you sure you want to delete{" "}
//               <span className="font-medium text-foreground">
//                 {dataQualityRules[deleteConfirmIndex]?.name || "this rule"}
//               </span>
//               ? This action cannot be undone.
//             </p>
//             <div className="flex justify-end gap-3">
//               <Button variant="outline" onClick={cancelDeleteRule}>
//                 No
//               </Button>
//               <Button
//                 className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
//                 onClick={confirmDeleteRule}
//               >
//                 Yes, delete
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Dialogs */}
//       <ValidationProgressDialog
//         open={showValidationProgress}
//         onOpenChange={setShowValidationProgress}
//         rulesCount={dataQualityRules.length}
//       />

//       <ValidationCompleteDialog
//         open={showValidationComplete}
//         onOpenChange={setShowValidationComplete}
//         onAnalyzeFailures={handleAnalyzeFailures}
//         onProceedToNER={handleProceedToNER}
//         passed={validationResult?.rules_passed ?? 0}
//         failed={validationResult?.rules_failed ?? 0}
//       />

//       <AnalysisCompleteDialog
//         open={showAnalysisComplete}
//         onOpenChange={setShowAnalysisComplete}
//         onQuickFix={handleQuickFix}
//         validationResult={validationResult}
//       />

//       {/* <QuickFixDialog
//         open={showQuickFix}
//         onOpenChange={setShowQuickFix}
//         isComplete={quickFixComplete}
//         onContinue={handleQuickFixContinue}
//         fixMessage={fixResult?.message}
//       /> */}
//     </WorkflowLayout>
//   );
// }


import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import { Database, Edit, Trash2, Loader2, X, Upload, Plus } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { ValidationProgressDialog } from "@/components/ValidationProgressDialog";
import { ValidationCompleteDialog } from "@/components/ValidationCompleteDialog";
import { AnalysisCompleteDialog } from "@/components/AnalysisCompleteDialog";
import { QuickFixDialog } from "@/components/QuickFixDialog";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Plus as PlusIcon, Save, Table as TableIcon, ChevronDown, ChevronUp, History, LayoutGrid, SkipForward } from "lucide-react";
import Papa from "papaparse";
import * as XLSX from "xlsx";

interface DQRule {
  name: string;
  type: string;
  condition: string;
  source?: string; // NEW: preserved from generation (ai_generated / user_uploaded / user_added) so it can be echoed back to run-dq-validation for Databricks
}

interface ValidationResult {
  rules_passed: number;
  rules_failed: number;
  issues: Record<string, any>;
  proposed_solutions: Record<string, string>;
}

interface FixResult {
  success: boolean;
  message: string;
}

interface DatasetFile {
  filename: string;
  date_modified: string;
  file_size?: number; // NEW: only populated for Databricks-sourced datasets
}

type RulesSource = "generated" | "uploaded" | null;

// ── NEW: Databricks-platform "list datasets" source ─────────────────────
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
 * pages (Data Preview / Create Dataset).
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

// ── NEW: Databricks DQ rules generation endpoint (multipart/form-data) ──
const DATABRICKS_RUN_DQ_RULES_GENERATION_URL =
  "https://api.veriton.ai/api/service-databricks/run-dq-rules-generation";

// ── NEW: Databricks DQ validation endpoint (application/json) ──
const DATABRICKS_RUN_DQ_VALIDATION_URL =
  "https://api.veriton.ai/api/service-databricks/run-dq-validation";

// ── NEW: Databricks "record job state" endpoint (application/json) —
// the Databricks equivalent of service2/set-job-options; sets dq=true
// (defaults to false) when the user clicks "Generate DQ Rules".
const DATABRICKS_RECORD_STATE_URL =
  "https://api.veriton.ai/api/service-databricks/record-state";

// File types accepted for the "Upload Rules" picker, per platform.
// Databricks: backend parses the raw file server-side (yaml/txt/json/xlsx/csv).
// Default (Fabric/Azure): still parsed client-side, so only the types
// parseRulesFile() actually understands are accepted.
const DATABRICKS_ALLOWED_RULES_EXTENSIONS = ["yaml", "yml", "txt", "json", "xlsx", "csv"];
const DEFAULT_ALLOWED_RULES_EXTENSIONS = ["csv", "xlsx", "xls", "json"];

export default function DataQuality() {
  const navigate = useNavigate();

  const [files, setFiles] = useState<DatasetFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [rulesGenerated, setRulesGenerated] = useState(false);
  const [rulesSource, setRulesSource] = useState<RulesSource>(null);
  const [dataQualityRules, setDataQualityRules] = useState<DQRule[]>([]);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [fixResult, setFixResult] = useState<FixResult | null>(null);

  const [validationProgress, setValidationProgress] = useState(0);
  const [showValidationProgress, setShowValidationProgress] = useState(false);
  const [showValidationComplete, setShowValidationComplete] = useState(false);
  const [showAnalysisComplete, setShowAnalysisComplete] = useState(false);
  const [showQuickFix, setShowQuickFix] = useState(false);
  const [quickFixProgress, setQuickFixProgress] = useState(0);
  const [quickFixComplete, setQuickFixComplete] = useState(false);

  const [editingRuleIndex, setEditingRuleIndex] = useState<number | null>(null);
  const [editedRule, setEditedRule] = useState<DQRule | null>(null);
  const [generating, setGenerating] = useState(false);
  const [validating, setValidating] = useState(false);
  const [fixing, setFixing] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [uploadingRules, setUploadingRules] = useState(false);

  // NEW: for Databricks users, the rules file selected via "Upload Rules" is
  // held here (not parsed client-side) until "Generate DQ Rules" is clicked,
  // at which point it's attached to the multipart run-dq-rules-generation call.
  const [uploadedRulesFile, setUploadedRulesFile] = useState<File | null>(null);

  // Delete-confirmation dialog state
  const [deleteConfirmIndex, setDeleteConfirmIndex] = useState<number | null>(null);

  const rulesFileInputRef = useRef<HTMLInputElement>(null);

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

  // Fetch ingested datasets
  useEffect(() => {
    if (!userId || !jobId) {
      toast.error("Missing user or job information", {
        duration: 3000,
        action: closeToastButton,
      });
      setLoadingFiles(false);
      return;
    }

    // ── Existing default (non-Databricks) datasets fetch — unchanged ────
    const fetchDatasetsDefault = async () => {
      const response = await fetch(
        `https://api.veriton.ai/api/service2/list-datasets?user_id=${userId}&job_id=${jobId}`,
        { headers: { accept: "application/json" } }
      );

      if (!response.ok) throw new Error("Failed to fetch datasets");

      const result = await response.json();

      if (result.datasets && Array.isArray(result.datasets)) {
        setFiles(result.datasets);
      } else {
        setFiles([]);
        toast.info("No datasets found for this job", {
          duration: 3000,
          action: closeToastButton,
        });
      }
    };

    // ── NEW: Databricks datasets fetch via /list-datasets ───────────────
    const fetchDatasetsDatabricks = async () => {
      const response = await fetch(databricksListDatasetsUrl(userId!, jobId!), {
        headers: { accept: "application/json" },
      });

      if (!response.ok) throw new Error("Failed to fetch datasets");

      const result: DatabricksListDatasetsResponse = await response.json();

      if (result.datasets && Array.isArray(result.datasets)) {
        const mappedFiles: DatasetFile[] = result.datasets.map((ds) => ({
          filename: ds.file_name,
          date_modified: ds.last_modified,
          file_size: ds.file_size,
        }));
        setFiles(mappedFiles);
      } else {
        setFiles([]);
        toast.info("No datasets found for this job", {
          duration: 3000,
          action: closeToastButton,
        });
      }
    };

    const fetchDatasets = async () => {
      setLoadingFiles(true);
      try {
        if (isDatabricksUser()) {
          await fetchDatasetsDatabricks();
        } else {
          await fetchDatasetsDefault();
        }
      } catch (error) {
        console.error("Error fetching datasets:", error);
        toast.error("Failed to load ingested files", {
          duration: 4000,
          action: closeToastButton,
        });
        setFiles([]);
      } finally {
        setLoadingFiles(false);
      }
    };

    fetchDatasets();
  }, [userId, jobId]);

  const getSelectedBlobPaths = () => {
    return Array.from(selectedFiles).map((filename) => {
      const name = filename.endsWith(".csv") ? filename : `${filename}.csv`;
      return `${userId}/${jobId}/${name}`;
    });
  };

  const updateJobOptions = async () => {
    if (!userId || !jobId) {
      console.warn("Cannot update job options — missing userId or jobId");
      return;
    }

    const payload = {
      user_id: userId,
      job_id: jobId,
      dq: true,
    };

    try {
      const response = await fetch("https://api.veriton.ai/api/service2/set-job-options", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update job options: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        console.log("DQ flag successfully set to true in job options");
      } else {
        throw new Error(result.message || "Unknown response from set-job-options");
      }
    } catch (err) {
      console.error("Error updating job options (dq=true):", err);
    }
  };

  // ── NEW: Databricks equivalent of updateJobOptions — records dq=true
  // (defaults to false) via /record-state. Called when a Databricks user
  // clicks "Generate DQ Rules".
  const updateDatabricksJobState = async () => {
    if (!userId || !jobId) {
      console.warn("Cannot record job state — missing userId or jobId");
      return;
    }

    const payload = {
      user_id: userId,
      job_id: jobId,
      dq: true,
      ner: false,
      "business-logic": false,
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
      console.log("Databricks job state recorded (dq=true):", result);
    } catch (err) {
      console.error("Error recording Databricks job state (dq=true):", err);
    }
  };

  // ── NEW: maps one entry from the Databricks run-dq-rules-generation
  // response into a DQRule. The response mixes two different shapes in the
  // same `data.file` array:
  //   - AI-generated:  { rule, description, severity, source: "ai_generated" }
  //   - User-uploaded: { column, rule_type, severity, message, source: "user_uploaded", ...extra params }
  // The previous mapping only handled the first shape, so uploaded rules
  // rendered as blank rows.
  const mapDatabricksRule = (r: any): DQRule => {
    if (r.rule) {
      return {
        name: r.rule,
        type: r.severity ?? "",
        condition: r.description ?? "",
        source: r.source,
      };
    }

    // Uploaded-rule shape — build a readable name/condition from whatever
    // fields are present (extra params like `format`, `value`, `values`
    // vary by rule_type).
    const knownKeys = ["column", "rule_type", "severity", "message", "source"];
    const extraParams = Object.entries(r)
      .filter(([key]) => !knownKeys.includes(key))
      .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(", ") : value}`)
      .join(", ");

    const name = r.column
      ? `${r.column} — ${r.rule_type ?? "rule"}`
      : r.rule_type ?? "Uploaded rule";
    const condition = [r.message, extraParams].filter(Boolean).join(" — ");

    return {
      name,
      type: r.severity ?? "",
      condition,
      source: r.source,
    };
  };

  const handleGenerateRules = async () => {
    if (selectedFiles.size === 0) {
      toast.error("Please select at least one file", {
        duration: 3000,
        action: closeToastButton,
      });
      return;
    }

    setGenerating(true);

    try {
      if (useDatabricksRoute) {
        // NEW: sets dq=true for this job via /record-state (Databricks
        // equivalent of updateJobOptions for the default flow).
        await updateDatabricksJobState();
      } else {
        // Set DQ flag in job options — this is specific to the default
        // (service2/Fabric) pipeline; the Databricks job uses record-state
        // instead (handled above).
        await updateJobOptions();
      }

      if (useDatabricksRoute) {
        // ── NEW: Databricks users call run-dq-rules-generation as
        // multipart/form-data. The endpoint only documents a single
        // `databricks_path` string per call (no array form), so to support
        // selecting multiple files this calls the endpoint once per
        // selected file (in parallel) and merges the results. If the API
        // actually accepts an array of paths in one call, this can be
        // simplified back down to a single request.
        //
        // If the user attached a rules file via "Upload Rules", it's sent
        // as the `rules_file` multipart field on every call (the endpoint
        // only documents one file per call, so the same file is attached
        // to each selected dataset's request). The backend parses it
        // server-side (yaml/txt/json/xlsx/csv) and merges the uploaded
        // rules with the AI-generated ones in the response.

        const selectedFileNames = Array.from(selectedFiles);

        const databricksPaths = selectedFileNames.map(
          (name) => `${userId}/${jobId}/${name}`,
        );

        console.log("Calling Databricks DQ Rules Generation API for:", databricksPaths);
        if (uploadedRulesFile) {
          console.log("Attaching uploaded rules file:", uploadedRulesFile.name);
        }

        const generationResults = await Promise.all(
          databricksPaths.map(async (databricksPath) => {
            const payload = {
              input_type: "databricks",
              databricks_path: databricksPath,
            };

            const formData = new FormData();
            formData.append("payload", JSON.stringify(payload));

            // Only attach rules_file when the user actually selected one —
            // sending it as an empty string previously caused a validation
            // error: "Expected UploadFile, received: <class 'str'>" — the
            // API wants the field omitted entirely when there's nothing to
            // attach.
            if (uploadedRulesFile) {
              formData.append("rules_file", uploadedRulesFile, uploadedRulesFile.name);
            }

            // NOTE: deliberately not setting a Content-Type header — the
            // browser sets the correct multipart/form-data boundary
            // automatically when the body is a FormData instance.
            const response = await fetch(DATABRICKS_RUN_DQ_RULES_GENERATION_URL, {
              method: "POST",
              headers: { Accept: "application/json" },
              body: formData,
            });

            if (!response.ok) {
              const errorText = await response.text();
              throw new Error(
                `API error ${response.status} for ${databricksPath}: ${errorText}`,
              );
            }

            return response.json();
          }),
        );

        const combinedRules: DQRule[] = [];
        let totalGenerated = 0;
        let totalUploaded = 0;

        for (const result of generationResults) {
          if (result.success && result.data?.file) {
            combinedRules.push(...result.data.file.map(mapDatabricksRule));

            totalGenerated += result.meta?.generated_rules_count ?? 0;
            totalUploaded += result.meta?.uploaded_rules_count ?? 0;
          }
        }

        if (combinedRules.length === 0) {
          throw new Error("No rules were generated for the selected file(s)");
        }

        setDataQualityRules(combinedRules);
        setRulesGenerated(true);
        setRulesSource("generated");
        setUploadedRulesFile(null); // consumed — clear so it isn't silently reattached later

        const fileCountLabel = `${selectedFileNames.length} file${selectedFileNames.length !== 1 ? "s" : ""}`;

        const summary =
          totalUploaded > 0
            ? `Generated ${totalGenerated} rule(s) across ${fileCountLabel} and included ${totalUploaded} uploaded rule(s)`
            : `Generated ${combinedRules.length} data quality rules across ${fileCountLabel}`;

        toast.success(summary, {
          duration: 3000,
          action: closeToastButton,
        });

        return;
      }

      // 2. Prepare payload for DQ rules generation API (default flow)
      const blobPaths = getSelectedBlobPaths();
      const firstBlobPath = blobPaths[0]; // Using first selected file

      const payload = {
        input_type: "azure",
        azure_blob_path: firstBlobPath,
      };

      console.log("Calling DQ Rules Generation API with:", payload);

      const response = await fetch("https://api.veriton.ai/api/service2/run-dq-rules-generation", {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error ${response.status}: ${errorText}`);
      }

      const result = await response.json();

      if (result.success && result.data?.file) {
        const generatedRules = result.data.file.map((r: any) => ({
          name: r.rule,
          type: r.severity,
          condition: r.description,
        }));

        setDataQualityRules(generatedRules);
        setRulesGenerated(true);
        setRulesSource("generated");
        toast.success(`Generated ${generatedRules.length} data quality rules`, {
          duration: 3000,
          action: closeToastButton,
        });
      } else {
        throw new Error(result.message || "Invalid response format");
      }
    } catch (error: any) {
      console.error("DQ Rules Generation failed:", error);
      toast.error(error.message || "Failed to generate DQ rules", {
        duration: 4000,
        action: closeToastButton,
      });
    } finally {
      setGenerating(false);
    }
  };

  // ---- Upload Rules (CSV / Excel / JSON / YAML / TXT) ----

  const handleUploadRulesClick = () => {
    rulesFileInputRef.current?.click();
  };

  const normalizeRow = (row: Record<string, any>): DQRule | null => {
    // Accept a variety of common key casings/aliases for "rule" and "description"
    const getField = (keys: string[]) => {
      for (const key of Object.keys(row)) {
        if (keys.includes(key.trim().toLowerCase())) {
          return row[key];
        }
      }
      return undefined;
    };

    const name = getField(["rule", "rule_name", "name"]);
    const condition = getField(["description", "condition", "rule_description"]);

    if (!name || String(name).trim() === "") return null;

    return {
      name: String(name).trim(),
      type: "",
      condition: condition ? String(condition).trim() : "",
    };
  };

  const parseRulesFile = async (file: File): Promise<DQRule[]> => {
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (extension === "json") {
      const text = await file.text();
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : data.rules || data.data || [];
      return arr
        .map((item: any) => normalizeRow(item))
        .filter((r: DQRule | null): r is DQRule => r !== null);
    }

    if (extension === "csv") {
      const text = await file.text();
      const parsed = Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
      });
      if (parsed.errors && parsed.errors.length > 0) {
        console.warn("CSV parse warnings:", parsed.errors);
      }
      return (parsed.data as Record<string, any>[])
        .map((row) => normalizeRow(row))
        .filter((r): r is DQRule => r !== null);
    }

    if (extension === "xlsx" || extension === "xls") {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
      return json
        .map((row) => normalizeRow(row))
        .filter((r): r is DQRule => r !== null);
    }

    throw new Error("Unsupported file type. Please upload a CSV, Excel (.xlsx/.xls), or JSON file.");
  };

  const handleRulesFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();
    const allowedExtensions = useDatabricksRoute
      ? DATABRICKS_ALLOWED_RULES_EXTENSIONS
      : DEFAULT_ALLOWED_RULES_EXTENSIONS;

    if (!extension || !allowedExtensions.includes(extension)) {
      toast.error(
        `Unsupported file type. Please upload a ${allowedExtensions.join(", ").toUpperCase()} file.`,
        { duration: 4000, action: closeToastButton },
      );
      if (rulesFileInputRef.current) {
        rulesFileInputRef.current.value = "";
      }
      return;
    }

    if (useDatabricksRoute) {
      // NEW: Databricks flow no longer parses the rules file client-side.
      // The backend's run-dq-rules-generation endpoint accepts it directly
      // via the `rules_file` multipart field and parses it server-side
      // (confirmed working via Swagger — client-side parsing was the source
      // of the "No valid rules found" error on otherwise-valid files).
      // The file is held in state and attached when "Generate DQ Rules" is
      // clicked; it is NOT sent here.
      setUploadedRulesFile(file);
      toast.success(`Rules file attached: ${file.name}`, {
        duration: 3000,
        action: closeToastButton,
      });
      if (rulesFileInputRef.current) {
        rulesFileInputRef.current.value = "";
      }
      return;
    }

    // ── Existing default (non-Databricks) flow — client-side parse, unchanged ──
    setUploadingRules(true);
    try {
      const parsedRules = await parseRulesFile(file);

      if (parsedRules.length === 0) {
        throw new Error("No valid rules found in the file. Make sure it contains 'rule' and 'description' fields.");
      }

      setDataQualityRules(parsedRules);
      setRulesGenerated(true);
      setRulesSource("uploaded");
      toast.success(`Uploaded ${parsedRules.length} rule${parsedRules.length !== 1 ? "s" : ""}`, {
        duration: 3000,
        action: closeToastButton,
      });
    } catch (error: any) {
      console.error("Error uploading rules file:", error);
      toast.error(error.message || "Failed to upload rules file", {
        duration: 4000,
        action: closeToastButton,
      });
    } finally {
      setUploadingRules(false);
      // reset so the same file can be re-selected if needed
      if (rulesFileInputRef.current) {
        rulesFileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveUploadedRulesFile = () => {
    setUploadedRulesFile(null);
  };

  const handleRunValidation = async () => {
    if (dataQualityRules.length === 0) return;

    setValidating(true);
    setValidationProgress(0);
    setShowValidationProgress(true);
    setValidationResult(null);

    const user = JSON.parse(localStorage.getItem("user"));
    const email = user.email;

    try {
      if (useDatabricksRoute) {
        // ── Databricks users call run-dq-validation as application/json,
        // using the same databricks_path shape as run-dq-rules-generation.
        // Validates against the first selected file, matching the existing
        // default-flow behavior (blobPaths[0]).
        const databricksPaths = getSelectedBlobPaths();
        const databricksPath = databricksPaths[0];

        const payload = {
          input_type: "databricks",
          databricks_path: databricksPath,
          rules: dataQualityRules.map((r) => ({
            rule: r.name,
            description: r.condition,
            severity: r.type,
            ...(r.source ? { source: r.source } : {}),
          })),
          user_email: email,
        };

        console.log("Calling Databricks DQ Validation API with:", payload);

        const response = await fetch(DATABRICKS_RUN_DQ_VALIDATION_URL, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        setValidationResult(result);
        toast.success("Validation completed", {
          duration: 3000,
          action: closeToastButton,
        });
        return;
      }

      // ── Existing default (non-Databricks) flow — unchanged ────────────
      const blobPaths = getSelectedBlobPaths();

      const payload = {
        input_type: "azure",
        azure_blob_path: blobPaths[0],
        rules: dataQualityRules.map((r) => ({
          rule: r.name,
          description: r.condition,
          severity: r.type,
        })),
        user_email: email,
      };

      const response = await fetch("https://api.veriton.ai/api/service2/run-dq-validation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setValidationResult(result);
        toast.success("Validation completed", {
          duration: 3000,
          action: closeToastButton,
        });
      } else {
        throw new Error("Validation failed");
      }
    } catch (error: any) {
      console.error("DQ Validation failed:", error);
      toast.error(error.message || "Validation failed", {
        duration: 4000,
        action: closeToastButton,
      });
    } finally {
      setValidating(false);
      setTimeout(() => {
        setShowValidationProgress(false);
        setShowValidationComplete(true);
      }, 1000);
    }
  };

  const handleQuickFix = async () => {
    if (!validationResult || validationResult.rules_failed === 0) {
      toast.info("No issues to fix", {
        duration: 3000,
        action: closeToastButton,
      });
      return;
    }

    setFixing(true);
    setQuickFixProgress(0);
    setShowQuickFix(true);
    setFixResult(null);

    const failedRules = Object.entries(validationResult.issues || {}).map(([column, data]: [string, any]) => ({
      column,
      rule: data.rule,
      reason_for_failure: data.reason_for_failure,
    }));

    const blobPaths = getSelectedBlobPaths();

    const payload = {
      input_type: "azure",
      azure_blob_path: blobPaths[0],
      rules: failedRules,
      proposed_solutions: validationResult.proposed_solutions || {},
    };

    try {
      const response = await fetch("https://api.veriton.ai/api/service2/run-dq-fixing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setFixResult(result);
        toast.success(result.message || "Data fixed successfully", {
          duration: 3000,
          action: closeToastButton,
        });
      }
    } catch (error: any) {
      // silent fail
    } finally {
      setFixing(false);
      setTimeout(() => setQuickFixComplete(true), 1000);
    }
  };

  const toggleFileSelection = (filename: string) => {
    setSelectedFiles((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(filename)) {
        newSet.delete(filename);
      } else {
        newSet.add(filename);
      }
      return newSet;
    });
  };

  const handleEditRule = (index: number) => {
    const rule = dataQualityRules[index];
    setEditingRuleIndex(index);
    setEditedRule({ ...rule });
  };

  const handleSaveRule = (index: number) => {
    if (editedRule) {
      if (!editedRule.name.trim()) {
        toast.error("Rule name cannot be empty", {
          duration: 3000,
          action: closeToastButton,
        });
        return;
      }
      const updatedRules = [...dataQualityRules];
      updatedRules[index] = editedRule;
      setDataQualityRules(updatedRules);
      setEditingRuleIndex(null);
      setEditedRule(null);
      toast.success("Rule updated", {
        duration: 2500,
        action: closeToastButton,
      });
    }
  };

  const handleCancelEdit = () => {
    // If the row being cancelled is a freshly added, still-empty rule, remove it
    if (
      editingRuleIndex !== null &&
      dataQualityRules[editingRuleIndex] &&
      !dataQualityRules[editingRuleIndex].name.trim()
    ) {
      setDataQualityRules((prev) => prev.filter((_, i) => i !== editingRuleIndex));
    }
    setEditingRuleIndex(null);
    setEditedRule(null);
  };

  // Opens the confirmation dialog instead of deleting immediately
  const handleDeleteRule = (index: number) => {
    setDeleteConfirmIndex(index);
  };

  // Actually removes the rule once the user confirms "Yes"
  const confirmDeleteRule = () => {
    if (deleteConfirmIndex === null) return;
    setDataQualityRules((prev) => prev.filter((_, i) => i !== deleteConfirmIndex));
    toast.success("Rule deleted", {
      duration: 2500,
      action: closeToastButton,
    });
    setDeleteConfirmIndex(null);
  };

  const cancelDeleteRule = () => {
    setDeleteConfirmIndex(null);
  };

  const handleAddRule = () => {
    const newRule: DQRule = {
      name: "",
      type: rulesSource === "uploaded" ? "" : "medium",
      condition: "",
    };
    setDataQualityRules((prev) => {
      const updated = [...prev, newRule];
      setEditingRuleIndex(updated.length - 1);
      setEditedRule(newRule);
      return updated;
    });
  };

  const handleAnalyzeFailures = () => {
    setShowValidationComplete(false);
    setShowAnalysisComplete(true);
  };

  const handleQuickFixContinue = () => {
    setShowQuickFix(false);
    navigate("/workflow/ner");
  };

  const handleProceedToNER = () => {
    setShowValidationComplete(false);
    navigate("/workflow/ner");
  };

  const showTypeColumn = rulesSource !== "uploaded";

  // Accept attribute for the hidden file input — broadened for Databricks
  // users since the backend parses yaml/txt too.
  const rulesFileAccept = useDatabricksRoute
    ? ".yaml,.yml,.txt,.json,.xlsx,.csv,application/json,text/csv,text/plain,text/yaml,application/x-yaml,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : ".csv,.xlsx,.xls,.json,application/json,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

  return (
    <WorkflowLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Data Quality Rules</h1>
        </div>

        {/* Hidden file input for uploading rules */}
        <input
          ref={rulesFileInputRef}
          type="file"
          accept={rulesFileAccept}
          className="hidden"
          onChange={handleRulesFileChange}
        />

        {/* Select Files Section */}
        {!rulesGenerated && (
          <div className="border border-border rounded-lg p-6 bg-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Select files</h2>
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleUploadRulesClick}
                  disabled={selectedFiles.size === 0 || uploadingRules || generating}
                >
                  {uploadingRules ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Rules
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleGenerateRules}
                  disabled={selectedFiles.size === 0 || generating || uploadingRules}
                >
                  {generating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate DQ Rules"
                  )}
                </Button>
              </div>
            </div>

            {loadingFiles ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No datasets found. Please ingest files first.
              </div>
            ) : (
              <div className="border border-border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground w-12"></th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">File Name</th>
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Modified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {files.map((file) => (
                      <tr
                        key={file.filename}
                        onClick={() => toggleFileSelection(file.filename)}
                        className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer ${
                          selectedFiles.has(file.filename) ? "bg-primary/10" : ""
                        }`}
                      >
                        <td className="p-4">
                          <Checkbox
                            checked={selectedFiles.has(file.filename)}
                            onCheckedChange={() => toggleFileSelection(file.filename)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <Database className="h-5 w-5 text-primary" />
                            <span className="font-medium text-foreground">{file.filename}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-muted-foreground">
                          {new Date(file.date_modified).toLocaleString()}
                          {file.file_size !== undefined && (
                            <> &middot; {(file.file_size / 1024).toFixed(1)} KB</>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {selectedFiles.size > 0 && (
              <div className="mt-3 text-sm text-muted-foreground">
                {selectedFiles.size} file{selectedFiles.size !== 1 ? "s" : ""} selected
              </div>
            )}

            {/* NEW: shows the rules file attached for Databricks users, with a way to remove it */}
            {useDatabricksRoute && uploadedRulesFile && (
              <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  Rules file attached:{" "}
                  <span className="font-medium text-foreground">{uploadedRulesFile.name}</span>
                </span>
                <button
                  onClick={handleRemoveUploadedRulesFile}
                  className="text-xs underline hover:text-foreground"
                >
                  Remove
                </button>
              </div>
            )}
          </div>
        )}

        {/* Smart Rule Proposal Section */}
        {rulesGenerated && (
          <div className="border border-border rounded-lg p-6 bg-card mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Smart Rule Proposal</h2>
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleAddRule}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Rule
                </Button>
                <Button onClick={handleRunValidation} disabled={validating}>
                  {validating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Running...
                    </>
                  ) : (
                    "Run DQ Validation"
                  )}
                </Button>
              </div>
            </div>

            <div className="border border-border rounded-lg overflow-hidden">
              <table className="w-full table-fixed">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground w-1/4">RULE NAME</th>
                    {showTypeColumn && (
                      <th className="text-left p-4 text-sm font-medium text-muted-foreground w-24">TYPE</th>
                    )}
                    <th className="text-left p-4 text-sm font-medium text-muted-foreground">CONDITION</th>
                    <th className="text-right p-4 text-sm font-medium text-muted-foreground w-28">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {dataQualityRules.length === 0 ? (
                    <tr>
                      <td
                        colSpan={showTypeColumn ? 4 : 3}
                        className="p-8 text-center text-muted-foreground"
                      >
                        No rules yet. Click "Add Rule" to create one.
                      </td>
                    </tr>
                  ) : (
                    dataQualityRules.map((rule, index) => {
                      const isEditing = editingRuleIndex === index;
                      const displayRule = isEditing && editedRule ? editedRule : rule;

                      return (
                        <tr
                          key={index}
                          className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${
                            isEditing ? "align-top" : ""
                          }`}
                        >
                          <td className="p-4 text-sm font-medium text-foreground align-top">
                            {isEditing ? (
                              <textarea
                                value={displayRule.name}
                                onChange={(e) => setEditedRule({ ...displayRule, name: e.target.value })}
                                placeholder="Rule name"
                                rows={2}
                                className="w-full bg-background border border-border rounded px-2 py-1 resize-y min-h-[44px] whitespace-pre-wrap break-words"
                                autoFocus
                              />
                            ) : (
                              <span className="whitespace-pre-wrap break-words">{displayRule.name}</span>
                            )}
                          </td>
                          {showTypeColumn && (
                            <td className="p-4 text-sm text-muted-foreground align-top">
                              {isEditing ? (
                                <textarea
                                  value={displayRule.type}
                                  onChange={(e) => setEditedRule({ ...displayRule, type: e.target.value })}
                                  placeholder="e.g. high"
                                  rows={2}
                                  className="w-full bg-background border border-border rounded px-2 py-1 resize-y min-h-[44px] whitespace-pre-wrap break-words"
                                />
                              ) : (
                                <span className="whitespace-pre-wrap break-words">{displayRule.type}</span>
                              )}
                            </td>
                          )}
                          <td className="p-4 text-sm text-muted-foreground align-top">
                            {isEditing ? (
                              <textarea
                                value={displayRule.condition}
                                onChange={(e) => setEditedRule({ ...displayRule, condition: e.target.value })}
                                placeholder="Description / condition"
                                rows={4}
                                className="w-full bg-background border border-border rounded px-2 py-1 resize-y min-h-[88px] whitespace-pre-wrap break-words"
                              />
                            ) : (
                              <span className="whitespace-pre-wrap break-words">{displayRule.condition}</span>
                            )}
                          </td>
                          <td className="p-4 text-right align-top">
                            <div className="flex justify-end gap-2">
                              {isEditing ? (
                                <>
                                  <Button variant="outline" size="sm" className="h-8" onClick={() => handleSaveRule(index)}>
                                    Save
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8" onClick={handleCancelEdit}>
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleEditRule(index)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDeleteRule(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Bottom Action Buttons */}
        {rulesGenerated && (
          <div className="flex justify-between gap-3">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setRulesGenerated(false);
                  setRulesSource(null);
                  setUploadedRulesFile(null); // NEW: clear any attached rules file when leaving the review screen
                }}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Select Datasets
              </Button>
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
          <Button variant="outline" onClick={() => navigate("/workflow/data-creation")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Create Dataset
          </Button>

          <Button
            onClick={() => navigate("/workflow/ner")}
            className="bg-primary hover:bg-primary/90"
          >
            <SkipForward className="h-4 w-4" />
            Skip
          </Button>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      {deleteConfirmIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={cancelDeleteRule}
        >
          <div
            className="bg-card border border-border rounded-lg shadow-lg w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-foreground mb-2">Delete rule?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-foreground">
                {dataQualityRules[deleteConfirmIndex]?.name || "this rule"}
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={cancelDeleteRule}>
                No
              </Button>
              <Button
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={confirmDeleteRule}
              >
                Yes, delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <ValidationProgressDialog
        open={showValidationProgress}
        onOpenChange={setShowValidationProgress}
        rulesCount={dataQualityRules.length}
      />

      <ValidationCompleteDialog
        open={showValidationComplete}
        onOpenChange={setShowValidationComplete}
        onAnalyzeFailures={handleAnalyzeFailures}
        onProceedToNER={handleProceedToNER}
        passed={validationResult?.rules_passed ?? 0}
        failed={validationResult?.rules_failed ?? 0}
      />

      <AnalysisCompleteDialog
        open={showAnalysisComplete}
        onOpenChange={setShowAnalysisComplete}
        onQuickFix={handleQuickFix}
        validationResult={validationResult}
      />

      {/* <QuickFixDialog
        open={showQuickFix}
        onOpenChange={setShowQuickFix}
        isComplete={quickFixComplete}
        onContinue={handleQuickFixContinue}
        fixMessage={fixResult?.message}
      /> */}
    </WorkflowLayout>
  );
}