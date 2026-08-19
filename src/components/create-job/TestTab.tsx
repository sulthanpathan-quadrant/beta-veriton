// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import {
//   Eye,
//   Upload,
//   TestTube2,
//   X,
//   FileText,
//   AlertCircle,
//   Download,
//   Loader2,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import { toast } from "@/hooks/use-toast";
// import Header from "../layout/Header";
// import { cn } from "@/lib/utils";

// // get user email from localStorage
// const getUserFromLocalStorage = () => {
//   try {
//     const raw = localStorage.getItem("user");
//     if (!raw) return null;
//     return JSON.parse(raw) as { email?: string; [k: string]: any };
//   } catch (e) {
//     return null;
//   }
// };

// interface TrainedModel {
//   id: string;
//   dataset: string;
//   function: string;
//   modelName: string;
//   targetColumn: string;
//   testResults?: TestResults;
// }

// interface TestMetric {
//   name: string;
//   testing: number;
// }

// interface TestHistoryEntry {
//   testResultId: string;
//   testFileName: string;
//   groundTruthAvailable: boolean;
//   metrics?: TestMetric[];
//   blobPath?: string;
// }

// interface TestResults {
//   modelId: string;
//   modelName: string;
//   task: string;
//   targetColumn: string;
//   groundTruthAvailable: boolean;
//   metrics?: TestMetric[];
//   training_test_metrics?: {
//     avg_rmse?: number;
//     avg_mae?: number;
//     avg_r2?: number;
//   };
//   predictions?: {
//     customerId: string;
//     tenure: number;
//     monthlyCharges: string;
//     predictedValue: number;
//   }[];
//   blobPath?: string;
//   testResultId?: string;

//   testHistory?: TestHistoryEntry[];
//   drift_report?: {
//     overall_status:
//       | "stable"
//       | "data_drift"
//       | "degraded"
//       | "critical"
//       | "activated";
//     summary_message?: string;
//     details?: string;
//     recommendation?: string;

//     data_drift?: {
//       detected: boolean;
//       overall_psi?: number;
//       drifted_features_count?: number;
//       drifted_features?: string[];
//       status?: string;
//     };

//     performance_drift?: {
//       detected: boolean;
//       relative_drop_percent?: number;
//       baseline_metric?: number;
//       current_metric?: number;
//       status?: string;
//     };
//   };
// }

// // Add these interfaces if not already present
// interface DatasetOption {
//   id: string;
//   name: string; // datasetName or filename
//   job_id?: string;
//   user_id?: string;
//   rows?: number;
//   columns?: number;
//   last_modified?: string;
//   type: "global" | "job-specific";
// }

// interface PreviewData {
//   columns: string[];
//   preview_rows: Record<string, any>[];
//   total_rows: number;
//   preview_row_count: number;
// }

// const JOBS_API = "https://api.veriton.ai/api/service3/user_models_summary";

// const MODEL_TEST_HISTORY_API =
//   "https://api.veriton.ai/api/service3/model_test_history";

// type UploadSource =
//   | "choose"
//   | "adls"
//   | "delta"
//   | "onelake"
//   | "local"
//   | "preview";

// const TestTab = () => {
//   const navigate = useNavigate();
//   const [trainedModels, setTrainedModels] = useState<TrainedModel[]>([]);
//   const [uploadModalOpen, setUploadModalOpen] = useState(false);
//   const [uploadWizardStep, setUploadWizardStep] = useState<
//     UploadSource | "preview"
//   >("choose");
//   // Add this inside the TestTab component function
//   const mapMetrics = (obj: any): TestMetric[] | undefined => {
//     if (!obj) return undefined;
//     return Object.entries(obj).map(([name, value]) => ({
//       name: String(name),
//       testing: Number(value),
//     }));
//   };

//   // upload-source specific states
//   const [selectedUploadSource, setSelectedUploadSource] =
//     useState<UploadSource | null>(null);

//   // Reuse existing test UI state
//   const [viewResultsModalOpen, setViewResultsModalOpen] = useState(false);
//   const [selectedModel, setSelectedModel] = useState<TrainedModel | null>(null);
//   const [uploadedFile, setUploadedFile] = useState<File | null>(null);
//   const [isRunningTest, setIsRunningTest] = useState(false);
//   const [testResults, setTestResults] = useState<TestResults | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const PAGE_SIZE = 10;

//   const [page, setPage] = useState(0); // current page index
//   const [hasNextPage, setHasNextPage] = useState(true);
//   const [datasetSelectionOpen, setDatasetSelectionOpen] = useState(false);
//   const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

//   const [datasetModalOpen, setDatasetModalOpen] = useState(false);
//   const [datasets, setDatasets] = useState<DatasetOption[]>([]);
//   const [selectedTestDataset, setSelectedTestDataset] =
//     useState<DatasetOption | null>(null);
//   const [datasetPreview, setDatasetPreview] = useState<PreviewData | null>(
//     null,
//   ); // reuse type from Jobs.tsx or define similar
//   const [previewLoading, setPreviewLoading] = useState(false);
//   const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
//   const [datasetsLoading, setDatasetsLoading] = useState(false);

//   // Fetch jobs on mount
//   useEffect(() => {
//     const fetchJobs = async () => {
//       const user = getUserFromLocalStorage();
//       const email = user?.email;
//       if (!email) {
//         console.warn("aivolve_user not found in localStorage; using mock data");
//         return;
//       }

//       setIsLoading(true);
//       setHasNextPage(false);
//       try {
//         const start = page * PAGE_SIZE;

//         const url =
//           `${JOBS_API}?user_email=${encodeURIComponent(email)}` +
//           `&start=${start}&limit=${PAGE_SIZE}`;

//         const res = await fetch(url, {
//           method: "GET",
//           headers: { accept: "application/json" },
//         });

//         if (!res.ok) {
//           const txt = await res.text();
//           console.error("Failed to fetch user models summary:", txt);
//           toast({
//             title: "Failed to load jobs",
//             description: "Server returned an error.",
//           });
//           setIsLoading(false);
//           return;
//         }

//         const data = await res.json();

//         let rawJobs: any[] = [];
//         if (Array.isArray(data)) {
//           rawJobs = data;
//         } else if (Array.isArray((data as any).models)) {
//           rawJobs = (data as any).models;
//         } else if (Array.isArray((data as any).data)) {
//           rawJobs = (data as any).data;
//         } else {
//           const arr = Object.values(data).find((v) => Array.isArray(v));
//           if (arr) rawJobs = arr as any[];
//         }

//         if (!rawJobs || rawJobs.length === 0) {
//           setTrainedModels([]);
//           setIsLoading(false);
//           return;
//         }

//         const mapped: TrainedModel[] = rawJobs.map((item: any, idx: number) => {
//           let dataset =
//             item.table_name ||
//             item.dataset_name ||
//             item.dataset ||
//             item.file_name ||
//             item.blob_path ||
//             item.name ||
//             `dataset-${idx}`;

//           // ✅ Extract table name from path like "Tables/iris/part-00000-..."
//           if (dataset.includes("Tables/") && dataset.includes("/")) {
//             const parts = dataset.split("/");
//             const tableIndex = parts.indexOf("Tables");
//             if (tableIndex !== -1 && parts.length > tableIndex + 1) {
//               dataset = parts[tableIndex + 1]; // Get the table name after "Tables/"
//             }
//           }

//           // ✅ Remove file extensions (.csv, .parquet, etc.)
//           dataset = dataset
//             .replace(/\.snappy\.parquet\.csv$/i, "")
//             .replace(/\.parquet\.csv$/i, "")
//             .replace(/\.csv$/i, "")
//             .replace(/\.parquet$/i, "");

//           const func = item.task_type || item.function || item.task || "—";

//           const modelName =
//             item.best_model ||
//             item.model_name ||
//             item.model ||
//             item.name ||
//             `model-${idx}`;

//           const id =
//             item.model_id ||
//             item.id ||
//             `${modelName}-${idx}-${Math.random().toString(36).slice(2, 6)}`;

//           const target = item.target || item.target_column || item.label || "";

//           const testResults =
//             item.test_results || item.testResults || item.metrics || undefined;

//           return {
//             id: String(id),
//             dataset: String(dataset),
//             function: String(func),
//             modelName: String(modelName),
//             targetColumn: String(target),
//             testResults,
//           } as TrainedModel;
//         });

//         setTrainedModels(mapped);
//         setHasNextPage(rawJobs.length === PAGE_SIZE);
//       } catch (err) {
//         console.error("Error fetching jobs:", err);
//         toast({ title: "Error", description: "Could not load jobs." });
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     void fetchJobs();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [page]);

//   const loadAvailableDatasets = async () => {
//     setDatasetsLoading(true);
//     const user = getUserFromLocalStorage();
//     const userId = user?.user_id || user?.id; // Adjust based on your localStorage key
//     const userEmail = user?.email;

//     if (!userId || !userEmail) {
//       toast({
//         title: "Error",
//         description: "Missing user info",
//         variant: "destructive",
//       });
//       setDatasetsLoading(false);
//       return;
//     }

//     const allDatasets: DatasetOption[] = [];

//     try {
//       // Global datasets (/datasets API)
//       const globalRes = await fetch(
//         `https://api.veriton.ai/api/service2/datasets?user_id=${userId}`,
//       );
//       if (globalRes.ok) {
//         const data = await globalRes.json();
//         allDatasets.push(
//           ...data.map((item: any, idx: number) => ({
//             id: `global-${idx}`,
//             name: item.dataset_name || "Unnamed",
//             job_id: item.job_id,
//             user_id: userId,
//             rows: item.rows,
//             columns: item.columns_count,
//             last_modified: item.completed_at,
//             type: "global" as const,
//           })),
//         );
//       } else {
//         console.error("Global datasets failed:", globalRes.status);
//       }

//       // Job-specific datasets (/list-datasets API)
//       const currentJobId = localStorage.getItem("current_job_id"); // Or fetch if needed
//       if (currentJobId) {
//         const jobRes = await fetch(
//           `https://api.veriton.ai/api/service2/list-datasets?user_id=${userId}&job_id=${currentJobId}`,
//         );
//         if (jobRes.ok) {
//           const data = await jobRes.json();
//           allDatasets.push(
//             ...(data.datasets || []).map((d: any, idx: number) => ({
//               id: `job-${idx}`,
//               name: d.filename,
//               job_id: currentJobId,
//               user_id: userId,
//               last_modified: d.date_modified,
//               type: "job-specific" as const,
//             })),
//           );
//         } else {
//           console.error("Job datasets failed:", jobRes.status);
//         }
//       }

//       setDatasets(allDatasets);
//     } catch (err) {
//       console.error("Datasets fetch error:", err);
//       toast({ title: "Failed to load datasets", variant: "destructive" });
//     } finally {
//       setDatasetsLoading(false);
//     }
//   };

//   const handleSelectTestDataset = async (ds: DatasetOption) => {
//     setSelectedTestDataset(ds);
//     setPreviewLoading(true);
//     setDatasetPreview(null);

//     if (!ds.job_id || !ds.user_id) {
//       toast({
//         title: "Error",
//         description: "Missing job/user ID for preview",
//         variant: "destructive",
//       });
//       setPreviewLoading(false);
//       return;
//     }

//     try {
//       const url = `https://api.veriton.ai/api/service2/preview-dataset?user_id=${ds.user_id}&job_id=${ds.job_id}&datasetname=${encodeURIComponent(ds.name)}`;
//       const res = await fetch(url);
//       if (!res.ok) {
//         const errText = await res.text().catch(() => "");
//         throw new Error(`Preview failed: ${res.status} - ${errText}`);
//       }
//       const data = await res.json();
//       setDatasetPreview(data);
//       setSelectedJobId(ds.job_id); // Store for payload
//     } catch (err) {
//       console.error("Preview error:", err);
//       toast({ title: "Failed to load preview", variant: "destructive" });
//     } finally {
//       setPreviewLoading(false);
//     }
//   };

//   // ======= Upload modal flow =======
//   const openUploadWizard = () => {
//     setUploadModalOpen(true);
//     setSelectedTestDataset(null);
//     setDatasetPreview(null);
//     setSelectedJobId(null);
//     loadAvailableDatasets(); // Fetch datasets on open
//     setDatasetSelectionOpen(true);
//   };

//   const selectUploadSource = (src: UploadSource) => {
//     setSelectedUploadSource(src);
//     setUploadWizardStep(src);
//   };

//   const backToChoose = () => {
//     setUploadWizardStep("choose");
//     setSelectedUploadSource(null);
//   };

//   // ======= End upload modal flow =======

//   const handleUploadClick = (model: TrainedModel) => {
//     setSelectedModel(model);
//     setTestResults(null);
//     openUploadWizard(); // This now triggers dataset load
//   };

//   const handleViewResults = async (model: TrainedModel) => {
//     setSelectedModel(model);

//     const user = getUserFromLocalStorage();
//     const userEmail = user?.email;
//     if (!userEmail) {
//       toast({
//         title: "Auth error",
//         description: "User email not found.",
//         variant: "destructive",
//       });
//       return;
//     }

//     try {
//       const url = `${MODEL_TEST_HISTORY_API}/${encodeURIComponent(
//         model.id,
//       )}?user_email=${encodeURIComponent(userEmail)}`;
//       const res = await fetch(url, { method: "GET" });
//       const data = await res.json();

//       if (!data.test_history || data.test_history.length === 0) {
//         // No history found
//         setTestResults({
//           modelId: model.id,
//           modelName: model.modelName,
//           task: model.function,
//           targetColumn: model.targetColumn,
//           groundTruthAvailable: false,
//           testHistory: [],
//         });
//         setViewResultsModalOpen(true);
//         return;
//       }

//       // Convert backend test history → UI format
//       const history = data.test_history.map((test: any) => ({
//         testResultId: test.test_result_id,
//         testFileName: test.test_file_name,
//         groundTruthAvailable: test.has_ground_truth,
//         metrics: mapMetrics(test.test_metrics),
//         blobPath: test.predictions_file,
//       }));

//       setTestResults({
//         modelId: data.model_id,
//         modelName: data.model_name,
//         task: data.task,
//         targetColumn: model.targetColumn,
//         groundTruthAvailable: history.some((h) => h.groundTruthAvailable),
//         testHistory: history,
//       });

//       setViewResultsModalOpen(true);
//     } catch (err) {
//       console.error("Exception fetching test history:", err);
//       toast({
//         title: "Network error",
//         description: "Could not load test history.",
//         variant: "destructive",
//       });
//       setViewResultsModalOpen(true);
//     }
//   };

//   const fetchDriftReport = async (modelId: string, testResultId: string) => {
//     const userEmail = getUserFromLocalStorage()?.email;
//     if (!userEmail) return null;

//     const body = new URLSearchParams({
//       mode: "test",
//       user_email: userEmail,
//       model_id: modelId,
//       test_result_id: testResultId,
//     });

//     const res = await fetch(
//       "https://api.veriton.ai/api/service3/drift/report",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//           accept: "application/json",
//         },
//         body,
//       },
//     );

//     if (!res.ok) {
//       console.error("Failed to fetch drift report");
//       return null;
//     }

//     const json = await res.json();
//     return json.drift_report;
//   };

//   const handleRunTest = async () => {
//     if (!selectedModel || !selectedTestDataset || !selectedJobId) {
//       toast({
//         title: "Missing selection",
//         description: "Select a model and dataset first.",
//       });
//       return;
//     }

//     const user = getUserFromLocalStorage();
//     const userEmail = user?.email;
//     const userId = user?.user_id || user?.id; // Adjust as needed

//     if (!userEmail || !userId) {
//       toast({
//         title: "Auth error",
//         description: "User email/ID not found.",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsRunningTest(true);

//     try {
//       const filePath = `Files/Datasets/${userId}/${selectedJobId}/${selectedTestDataset.name}.csv`;

//       const payload = {
//         file_path: filePath,
//         model_id: selectedModel.id,
//         user_email: userEmail,
//       };
//       const params = new URLSearchParams();
//       params.append("file_path", filePath);
//       params.append("model_id", selectedModel.id);
//       params.append("user_email", userEmail);

//       const response = await fetch(
//         "https://api.veriton.ai/api/service3/test_model_v",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             Accept: "application/json",
//           },
//           body: params.toString(),
//         },
//       );

//       if (!response.ok) {
//         const errorText = await response.text();
//         console.error("Test model API error:", errorText);
//         toast({
//           title: "Test Failed",
//           description:
//             "Failed to run test on model. Check file path or server logs.",
//           variant: "destructive",
//         });
//         return;
//       }

//       const data = await response.json();

//       // Assuming response structure is similar; adapt as needed (e.g., data.status, data.test_metrics, etc.)
//       if (data.status !== "success") {
//         toast({
//           title: "Error",
//           description: data.message || "Test failed",
//           variant: "destructive",
//         });
//         return;
//       }

//       // Fetch drift report (keep as-is, or adapt if endpoint changes)
//       const driftReport = await fetchDriftReport(
//         selectedModel.id,
//         data.test_result_id,
//       );

//       // Map metrics (keep your existing mapMetrics function)
//       const metricsList = mapMetrics(data.test_metrics);

//       // History entry (adapt fields if response differs)
//       const historyEntry = {
//         testResultId: data.test_result_id,
//         testFileName: selectedTestDataset.name, // Use dataset name instead of file name
//         groundTruthAvailable: data.has_ground_truth,
//         metrics: metricsList,
//         blobPath: data.predictions_file?.blob_path,
//       };

//       // Final TestResults (adapt as needed)
//       const mappedResults: TestResults = {
//         modelId: data.model_info.model_id,
//         modelName: data.model_info.model_name,
//         task: data.model_info.task,
//         targetColumn: data.model_info.target,
//         groundTruthAvailable: data.has_ground_truth,
//         metrics: metricsList,
//         training_test_metrics: data.training_test_metrics,
//         drift_report: driftReport,
//         predictions:
//           data.predictions?.predicted
//             ?.slice(0, 10)
//             .map((pred: number, idx: number) => ({
//               customerId: `Row ${idx + 1}`,
//               predictedValue: pred,
//             })) || [],
//         blobPath: data.predictions_file?.blob_path,
//         testResultId: data.test_result_id,
//         testHistory: [historyEntry],
//       };

//       setTestResults(mappedResults);
//       setTrainedModels((prev) =>
//         prev.map((m) =>
//           m.id === selectedModel.id ? { ...m, testResults: mappedResults } : m,
//         ),
//       );

//       toast({
//         title: "Test Complete!",
//         description: data.message || "Model tested successfully.",
//       });

//       setViewResultsModalOpen(true); // Auto-open results
//     } catch (err) {
//       console.error("Exception during test:", err);
//       toast({
//         title: "Network Error",
//         description: "Could not connect to test service.",
//         variant: "destructive",
//       });
//     } finally {
//       setIsRunningTest(false);
//     }
//   };

//   const closeAllModals = () => {
//     setViewResultsModalOpen(false);
//     setDatasetSelectionOpen(false);
//     setPreviewDialogOpen(false);
//     setUploadModalOpen(false);

//     setSelectedModel(null);
//     setSelectedTestDataset(null);
//     setDatasetPreview(null);
//   };

//   return (
//     <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
//       <Header />
//       <div className="flex-1 flex flex-col overflow-auto">
//         <main className="px-6 py-6">
//           <div className="max-w-7xl mx-auto w-full">
//             <div className="mb-8 flex items-start justify-between">
//               <div>
//                 <h1 className="text-2xl font-semibold text-foreground">
//                   Test Results
//                 </h1>
//                 <p className="text-muted-foreground mt-1">
//                   View and test your trained models with new data
//                 </p>
//               </div>
//               <div className="flex items-center gap-3">
//                 <Button
//                   variant="outline"
//                   onClick={() => navigate("/workflow/automl")}
//                 >
//                   Back to Jobs
//                 </Button>
//               </div>
//             </div>

//             {/* Models Grid */}
//             <div className="bg-card border border-border rounded-xl overflow-hidden">
//               <Table>
//                 <TableHeader>
//                   <TableRow className="bg-muted/50">
//                     <TableHead className="font-semibold">Dataset</TableHead>
//                     <TableHead className="font-semibold">Function</TableHead>
//                     <TableHead className="font-semibold">Model Name</TableHead>
//                     <TableHead className="font-semibold text-right">
//                       Actions
//                     </TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {isLoading && (
//                     <TableRow>
//                       <TableCell
//                         colSpan={4}
//                         className="py-6 text-center text-muted-foreground"
//                       >
//                         Loading jobs…
//                       </TableCell>
//                     </TableRow>
//                   )}

//                   {!isLoading && trainedModels.length === 0 && (
//                     <TableRow>
//                       <TableCell
//                         colSpan={4}
//                         className="py-6 text-center text-muted-foreground"
//                       >
//                         No trained models found.
//                       </TableCell>
//                     </TableRow>
//                   )}

//                   {!isLoading &&
//                     trainedModels.map((model) => (
//                       <TableRow key={model.id} className="hover:bg-muted/30">
//                         <TableCell className="font-medium">
//                           {model.dataset}
//                         </TableCell>
//                         <TableCell>{model.function}</TableCell>
//                         <TableCell>{model.modelName}</TableCell>
//                         <TableCell className="text-right">
//                           <div className="flex items-center justify-end gap-2">
//                             <Button
//                               variant="outline"
//                               size="sm"
//                               onClick={() => handleUploadClick(model)}
//                               className="gap-2"
//                             >
//                               <Upload className="w-4 h-4" />
//                               Upload
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={() => handleViewResults(model)}
//                               className="gap-2"
//                             >
//                               <Eye className="w-4 h-4" />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                 </TableBody>
//               </Table>
//             </div>
//             {/* Pagination */}
//             {/* Pagination */}
//             {(page > 0 || hasNextPage) && (
//               <div className="flex justify-center mt-6">
//                 <div className="flex items-center gap-4">
//                   {/* Previous → only if not first page */}
//                   {page > 0 && (
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setPage((p) => p - 1)}
//                     >
//                       Previous
//                     </Button>
//                   )}

//                   <span className="text-sm text-muted-foreground">
//                     Page {page + 1}
//                   </span>

//                   {/* Next → ONLY if backend confirms more jobs */}
//                   {hasNextPage && (
//                     <Button
//                       variant="outline"
//                       size="sm"
//                       onClick={() => setPage((p) => p + 1)}
//                     >
//                       Next
//                     </Button>
//                   )}
//                 </div>
//               </div>
//             )}

//             {trainedModels.length === 0 && !isLoading && (
//               <div className="bg-card border border-border rounded-xl p-12 text-center mt-4">
//                 <TestTube2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
//                 <h3 className="text-lg font-semibold text-foreground mb-2">
//                   No Trained Models
//                 </h3>
//                 <p className="text-muted-foreground max-w-md mx-auto">
//                   Build a model first to test it with new data.
//                 </p>
//               </div>
//             )}
//           </div>
//         </main>
//       </div>

//       {/* Upload Wizard Modal */}
//       <Dialog
//         open={datasetSelectionOpen}
//         onOpenChange={setDatasetSelectionOpen}
//       >
//         <DialogContent className="max-w-2xl max-h-[85vh]">
//           <DialogHeader>
//             <DialogTitle>Select Dataset to Test</DialogTitle>
//             <DialogDescription>
//               Choose a dataset to run predictions with model:{" "}
//               <strong>{selectedModel?.modelName}</strong>
//             </DialogDescription>
//           </DialogHeader>

//           <div className="mt-4 max-h-[55vh] overflow-y-auto pr-2">
//             {datasetsLoading ? (
//               <div className="py-12 text-center text-muted-foreground">
//                 Loading datasets...
//               </div>
//             ) : datasets.length === 0 ? (
//               <div className="py-12 text-center text-muted-foreground">
//                 No datasets available
//               </div>
//             ) : (
//               <div className="space-y-1.5">
//                 {datasets.map((ds) => (
//                   <button
//                     key={ds.id}
//                     onClick={() => {
//                       handleSelectTestDataset(ds); // ← this already sets selected + fetches preview
//                       setPreviewDialogOpen(true); // ← open preview dialog
//                       // Do NOT close selection dialog yet — keep it open behind
//                     }}
//                     className={cn(
//                       "w-full text-left p-3.5 rounded-lg border transition",
//                       selectedTestDataset?.id === ds.id
//                         ? "border-primary bg-primary/5"
//                         : "border-border hover:border-primary/40 hover:bg-muted/50",
//                     )}
//                   >
//                     <div className="font-medium truncate">{ds.name}</div>
//                     <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
//                       <span>{ds.type}</span>
//                       {ds.rows && (
//                         <span>• {ds.rows.toLocaleString()} rows</span>
//                       )}
//                       {ds.columns && <span>• {ds.columns} cols</span>}
//                       {ds.last_modified && <span>• {ds.last_modified}</span>}
//                     </div>
//                   </button>
//                 ))}
//               </div>
//             )}
//           </div>

//           <DialogFooter className="mt-6">
//             <Button
//               variant="outline"
//               onClick={closeAllModals}
//             >
//               Cancel
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//       <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
//         <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
//           <DialogHeader>
//             <DialogTitle className="flex items-center justify-between">
//               <span>Dataset Preview: {selectedTestDataset?.name}</span>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 className="h-8 px-2"
//                 onClick={() => {
//                   setPreviewDialogOpen(false);
//                 }}
//               >
//                 Back to datasets
//               </Button>
//             </DialogTitle>
//           </DialogHeader>

//           <div className="flex-1 overflow-hidden flex flex-col">
//             {previewLoading ? (
//               <div className="flex-1 flex items-center justify-center text-muted-foreground">
//                 Loading preview...
//               </div>
//             ) : datasetPreview ? (
//               <>
//                 <div className="overflow-auto flex-1 px-1">
//                   <Table>
//                     <TableHeader className="sticky top-0 bg-background z-10">
//                       <TableRow>
//                         {datasetPreview.columns.map((col) => (
//                           <TableHead key={col} className="whitespace-nowrap">
//                             {col}
//                           </TableHead>
//                         ))}
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       {datasetPreview.preview_rows.map((row, i) => (
//                         <TableRow key={i}>
//                           {datasetPreview.columns.map((col) => (
//                             <TableCell key={col} className="py-2">
//                               {row[col] ?? "—"}
//                             </TableCell>
//                           ))}
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </div>

//                 <div className="pt-4 border-t mt-2 flex justify-end gap-3 shrink-0">
//                   <Button
//                     variant="outline"
//                     onClick={closeAllModals}
//                   >
//                     Cancel
//                   </Button>
//                   <Button
//                     onClick={handleRunTest}
//                     disabled={isRunningTest || !datasetPreview}
//                   >
//                     {isRunningTest && (
//                       <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     )}
//                     Run Test
//                   </Button>
//                 </div>
//               </>
//             ) : (
//               <div className="flex-1 flex items-center justify-center text-muted-foreground">
//                 Preview not available
//               </div>
//             )}
//           </div>
//         </DialogContent>
//       </Dialog>
//       {/* Upload/Test Modal (when user clicks model Upload we open wizard; after wizard closes user can run test) */}
//       <Dialog
//         open={viewResultsModalOpen}
//         onOpenChange={(open) => {
//           if (!open) closeAllModals();
//           else setViewResultsModalOpen(true);
//         }}
//       >
//         <DialogContent className="max-w-4xl p-0 border border-border rounded-2xl overflow-hidden shadow-xl">
//           {/* Header */}
//           <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
//             <div>
//               <DialogTitle className="text-xl font-semibold">
//                 Test Results
//               </DialogTitle>

//               {selectedModel && (
//                 <p className="text-muted-foreground text-sm mt-1">
//                   Results for {selectedModel.modelName} on{" "}
//                   {selectedModel.dataset}
//                 </p>
//               )}
//             </div>

//             <Button
//               variant="ghost"
//               size="icon"
//               className="h-8 w-8 rounded-full"
//               onClick={closeAllModals}
//             >
//               <X className="h-5 w-5" />
//             </Button>
//           </div>

//           {/* Scrollable Body */}
//           <div className="max-h-[75vh] overflow-y-auto px-6 py-4">
//             {testResults && <TestResultsDisplay results={testResults} />}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// const TestResultsDisplay = ({ results }: { results: TestResults }) => {
//   const userEmail = getUserFromLocalStorage()?.email || "";
//   const overallStatus = results.drift_report?.overall_status ?? "unknown";
//   const [predictionsPreviews, setPredictionsPreviews] = useState<
//     Record<string, { rows: any[]; predictedCol?: string }>
//   >({}); // Now stores rows + detected predicted column
//   const [loadingPreviews, setLoadingPreviews] = useState<Set<string>>(
//     new Set(),
//   );

//   const PREDICTION_KEYWORDS = [
//     "predicted",
//     "prediction",
//     "pred",
//     "forecast",
//     "score",
//     "probability",
//     "label", // sometimes for classification
//     results.targetColumn
//       ? `predicted_${results.targetColumn.toLowerCase()}`
//       : "",
//   ].filter(Boolean);

//   const detectPredictedColumn = (headers: string[]): string | undefined => {
//     const lowerHeaders = headers.map((h) => h.toLowerCase().trim());

//     // Exact matches first
//     for (const keyword of PREDICTION_KEYWORDS) {
//       const index = lowerHeaders.findIndex((h) =>
//         h.includes(keyword.toLowerCase()),
//       );
//       if (index !== -1) {
//         return headers[index];
//       }
//     }

//     // Fallback: columns containing "pred" or ending with "_pred"
//     return headers.find(
//       (h) =>
//         h.toLowerCase().includes("pred") || h.toLowerCase().endsWith("_pred"),
//     );
//   };

//   const fetchPredictionsPreview = async (
//     testResultId: string,
//     blobPath: string,
//   ) => {
//     if (predictionsPreviews[testResultId]) return;

//     setLoadingPreviews((prev) => new Set(prev).add(testResultId));
//     setPredictionsPreviews((prev) => ({
//       ...prev,
//       [testResultId]: { rows: [], predictedCol: undefined },
//     }));

//     try {
//       const url = `https://api.veriton.ai/api/service3/download_predictions?blob_path=${encodeURIComponent(
//         blobPath,
//       )}&user_email=${encodeURIComponent(userEmail)}`;

//       const res = await fetch(url);
//       if (!res.ok) throw new Error("Failed to fetch predictions");

//       const text = await res.text();
//       const lines = text.trim().split("\n");
//       if (lines.length < 1) throw new Error("Empty file");

//       const headers = lines[0]
//         .split(",")
//         .map((h) => h.trim().replace(/"/g, ""));
//       const dataLines = lines.slice(1, 6); // first 5 rows

//       const rows = dataLines.map((line) => {
//         const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
//         return Object.fromEntries(headers.map((h, i) => [h, values[i] || ""]));
//       });

//       const predictedCol = detectPredictedColumn(headers);

//       setPredictionsPreviews((prev) => ({
//         ...prev,
//         [testResultId]: { rows, predictedCol },
//       }));
//     } catch (err) {
//       console.error("Failed to load predictions preview:", err);
//       setPredictionsPreviews((prev) => ({
//         ...prev,
//         [testResultId]: { rows: [], predictedCol: undefined },
//       }));
//       toast({
//         title: "Preview failed",
//         description: "Could not load prediction preview.",
//         variant: "destructive",
//       });
//     } finally {
//       setLoadingPreviews((prev) => {
//         const next = new Set(prev);
//         next.delete(testResultId);
//         return next;
//       });
//     }
//   };

//   const handleDownload = async (blobPath: string, fileName: string) => {
//     try {
//       const url = `https://api.veriton.ai/api/service3/download_predictions?blob_path=${encodeURIComponent(
//         blobPath,
//       )}&user_email=${encodeURIComponent(userEmail)}`;

//       const res = await fetch(url);
//       if (!res.ok) throw new Error("Download failed");

//       const blob = await res.blob();
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(blob);
//       link.download = fileName;
//       link.click();
//       URL.revokeObjectURL(link.href);
//     } catch (err) {
//       toast({
//         title: "Download failed",
//         description: "Could not download predictions.",
//         variant: "destructive",
//       });
//     }
//   };

//   if (!results.testHistory || results.testHistory.length === 0) {
//     return (
//       <div className="py-10 text-center text-muted-foreground">
//         <TestTube2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
//         No test history available.
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-8 py-5">
//       {results.testHistory.map((test, idx) => {
//         const previewData = predictionsPreviews[test.testResultId];
//         const { rows = [], predictedCol } = previewData || {};
//         const isLoading = loadingPreviews.has(test.testResultId);

//         return (
//           <div
//             key={test.testResultId}
//             className="border border-border rounded-xl bg-card p-6"
//           >
//             <div className="flex justify-between items-start mb-5">
//               <div>
//                 <p className="font-semibold text-lg">
//                   Test #{results.testHistory!.length - idx}
//                 </p>
//                 <p className="text-sm text-muted-foreground">
//                   {test.testFileName}
//                 </p>
//                 <p className="text-xs text-muted-foreground mt-1">
//                   ID: {test.testResultId}
//                 </p>
//               </div>

//               {test.blobPath && (
//                 <Button
//                   size="sm"
//                   variant="outline"
//                   className="gap-2"
//                   onClick={() =>
//                     handleDownload(
//                       test.blobPath!,
//                       test.testFileName.replace(".csv", "_predictions.csv"),
//                     )
//                   }
//                 >
//                   <Download className="w-4 h-4" />
//                   Download predictions
//                 </Button>
//               )}
//             </div>

//             {/* Metrics */}
//             {test.metrics && test.metrics.length > 0 && (
//               <div className="mb-6">
//                 <h4 className="font-medium mb-3">Metrics</h4>
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       <TableHead>Metric</TableHead>
//                       <TableHead className="text-right">Value</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {test.metrics
//                       .filter((m) => {
//                         // For multistep forecasting, only show avg_ metrics
//                         if (results.task?.toLowerCase().includes("multistep")) {
//                           return m.name.toLowerCase().startsWith("avg_");
//                         }
//                         return true;
//                       })
//                       .map((m) => (
//                         <TableRow key={m.name}>
//                           <TableCell className="capitalize">
//                             {m.name.replace(/_/g, " ")}
//                           </TableCell>
//                           <TableCell className="text-right font-medium">
//                             {typeof m.testing === "number"
//                               ? m.testing.toFixed(4)
//                               : m.testing}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                   </TableBody>
//                 </Table>
//               </div>
//             )}

//             {/* 🔥 Multistep forecasting fallback metrics */}
//             {results.task === "multistep_forecasting" &&
//               (!test.metrics || test.metrics.length === 0) &&
//               results.training_test_metrics && (
//                 <div className="mb-6">
//                   <h4 className="font-medium mb-3">Metrics</h4>
//                   <Table>
//                     <TableHeader>
//                       <TableRow>
//                         <TableHead>Metric</TableHead>
//                         <TableHead className="text-right">Value</TableHead>
//                       </TableRow>
//                     </TableHeader>
//                     <TableBody>
//                       <TableRow>
//                         <TableCell>Avg RMSE</TableCell>
//                         <TableCell className="text-right font-medium">
//                           {results.training_test_metrics.avg_rmse?.toFixed(4)}
//                         </TableCell>
//                       </TableRow>
//                       <TableRow>
//                         <TableCell>Avg MAE</TableCell>
//                         <TableCell className="text-right font-medium">
//                           {results.training_test_metrics.avg_mae?.toFixed(4)}
//                         </TableCell>
//                       </TableRow>
//                       <TableRow>
//                         <TableCell>Avg R²</TableCell>
//                         <TableCell className="text-right font-medium">
//                           {results.training_test_metrics.avg_r2?.toFixed(4)}
//                         </TableCell>
//                       </TableRow>
//                     </TableBody>
//                   </Table>

//                   <p className="text-xs text-muted-foreground mt-2">
//                     Metrics are averaged across forecast horizons
//                   </p>
//                 </div>
//               )}
//             {/* ================= Drift Report ================= */}
//             {results.drift_report && (
//               <div className="mb-6 border border-border rounded-xl p-4">
//                 {/* Header */}
//                 <div className="flex items-center justify-between mb-2">
//                   <h4 className="font-semibold">Drift Report</h4>

//                   <span
//                     className={`text-xs px-2 py-1 rounded font-medium ${
//                       overallStatus === "stable"
//                         ? "bg-green-100 text-green-700"
//                         : overallStatus === "activated"
//                           ? "bg-blue-100 text-blue-700"
//                           : overallStatus === "data_drift"
//                             ? "bg-yellow-100 text-yellow-700"
//                             : overallStatus === "degraded"
//                               ? "bg-orange-100 text-orange-700"
//                               : "bg-red-100 text-red-700"
//                     }`}
//                   >
//                     {overallStatus.toUpperCase()}
//                   </span>
//                 </div>

//                 {/* Summary */}
//                 {results.drift_report.summary_message && (
//                   <p className="text-sm mb-2">
//                     {results.drift_report.summary_message}
//                   </p>
//                 )}

//                 {/* Details */}
//                 {results.drift_report.details && (
//                   <p className="text-sm text-muted-foreground whitespace-pre-line mb-3">
//                     {results.drift_report.details}
//                   </p>
//                 )}

//                 {/* ================= Data Drift ================= */}
//                 {results.drift_report.data_drift?.detected && (
//                   <div className="mb-3 p-3 rounded bg-yellow-500/5 border border-yellow-500/20">
//                     <p className="font-medium text-sm mb-1">
//                       Data Drift Detected
//                     </p>
//                     <p className="text-sm">
//                       PSI: {results.drift_report.data_drift.overall_psi}
//                     </p>
//                     <p className="text-sm">
//                       Drifted features (
//                       {results.drift_report.data_drift.drifted_features_count}):
//                     </p>
//                     <ul className="list-disc list-inside text-sm">
//                       {results.drift_report.data_drift.drifted_features?.map(
//                         (f) => (
//                           <li key={f}>{f}</li>
//                         ),
//                       )}
//                     </ul>
//                   </div>
//                 )}

//                 {/* ================= Performance Drift ================= */}
//                 {results.drift_report.performance_drift?.detected && (
//                   <div className="mb-3 p-3 rounded bg-red-500/5 border border-red-500/20">
//                     <p className="font-medium text-sm mb-1">
//                       Performance Degradation
//                     </p>
//                     <p className="text-sm">
//                       Drop:{" "}
//                       {
//                         results.drift_report.performance_drift
//                           .relative_drop_percent
//                       }
//                       %
//                     </p>
//                     <p className="text-sm">
//                       Baseline:{" "}
//                       {results.drift_report.performance_drift.baseline_metric} →
//                       Current:{" "}
//                       {results.drift_report.performance_drift.current_metric}
//                     </p>
//                   </div>
//                 )}

//                 {/* Recommendation */}
//                 {results.drift_report.recommendation && (
//                   <p className="text-sm font-medium mt-2">
//                     Recommendation: {results.drift_report.recommendation}
//                   </p>
//                 )}
//               </div>
//             )}

//             {/* Prediction Preview */}
//             {test.blobPath && (
//               <div>
//                 <div className="flex items-center justify-between mb-3">
//                   <h4 className="font-medium">
//                     Prediction Preview (first 5 rows)
//                     {predictedCol && (
//                       <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
//                         Predicted: <strong>{predictedCol}</strong>
//                       </span>
//                     )}
//                   </h4>
//                   {previewData === undefined && (
//                     <Button
//                       size="sm"
//                       variant="secondary"
//                       onClick={() =>
//                         fetchPredictionsPreview(
//                           test.testResultId,
//                           test.blobPath!,
//                         )
//                       }
//                       disabled={isLoading}
//                     >
//                       {isLoading ? "Loading..." : "Load Preview"}
//                     </Button>
//                   )}
//                 </div>

//                 {isLoading && (
//                   <p className="text-sm text-muted-foreground">
//                     Loading preview...
//                   </p>
//                 )}

//                 {rows.length > 0 && (
//                   <div className="overflow-x-auto border border-border rounded-lg">
//                     <Table>
//                       <TableHeader>
//                         <TableRow className="bg-muted/50">
//                           {Object.keys(rows[0]).map((col) => (
//                             <TableHead
//                               key={col}
//                               className={`whitespace-nowrap ${
//                                 col === predictedCol
//                                   ? "bg-primary/20 text-primary font-semibold"
//                                   : ""
//                               }`}
//                             >
//                               {col}
//                               {col === predictedCol && " ⭐"}
//                             </TableHead>
//                           ))}
//                         </TableRow>
//                       </TableHeader>
//                       <TableBody>
//                         {rows.map((row, i) => (
//                           <TableRow key={i}>
//                             {Object.keys(row).map((col) => (
//                               <TableCell
//                                 key={col}
//                                 className={`whitespace-nowrap max-w-xs ${
//                                   col === predictedCol
//                                     ? "bg-primary/5 font-semibold text-primary"
//                                     : ""
//                                 }`}
//                               >
//                                 <span className="block truncate">
//                                   {row[col]}
//                                 </span>
//                               </TableCell>
//                             ))}
//                           </TableRow>
//                         ))}
//                       </TableBody>
//                     </Table>
//                   </div>
//                 )}

//                 {previewData !== undefined && rows.length === 0 && (
//                   <div className="text-center py-6 text-muted-foreground border border-border rounded-lg">
//                     <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
//                     <p>Failed to load prediction preview</p>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         );
//       })}
//     </div>
//   );
// };

// export default TestTab;


import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  Upload,
  TestTube2,
  X,
  FileText,
  AlertCircle,
  Download,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import Header from "../layout/Header";
import { cn } from "@/lib/utils";
import Header1 from "../layout/Header1";

// get user email from localStorage
const getUserFromLocalStorage = () => {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return JSON.parse(raw) as { email?: string; [k: string]: any };
  } catch (e) {
    return null;
  }
};

interface TrainedModel {
  id: string;
  dataset: string;
  function: string;
  modelName: string;
  targetColumn: string;
  testResults?: TestResults;
}

interface TestMetric {
  name: string;
  testing: number;
}

interface TestHistoryEntry {
  testResultId: string;
  testFileName: string;
  groundTruthAvailable: boolean;
  metrics?: TestMetric[];
  blobPath?: string;
}

interface TestResults {
  modelId: string;
  modelName: string;
  task: string;
  targetColumn: string;
  groundTruthAvailable: boolean;
  metrics?: TestMetric[];
  training_test_metrics?: {
    avg_rmse?: number;
    avg_mae?: number;
    avg_r2?: number;
  };
  predictions?: {
    customerId: string;
    tenure: number;
    monthlyCharges: string;
    predictedValue: number;
  }[];
  blobPath?: string;
  testResultId?: string;

  testHistory?: TestHistoryEntry[];
  drift_report?: {
    overall_status:
      | "stable"
      | "data_drift"
      | "degraded"
      | "critical"
      | "activated";
    summary_message?: string;
    details?: string;
    recommendation?: string;

    data_drift?: {
      detected: boolean;
      overall_psi?: number;
      drifted_features_count?: number;
      drifted_features?: string[];
      status?: string;
    };

    performance_drift?: {
      detected: boolean;
      relative_drop_percent?: number;
      baseline_metric?: number;
      current_metric?: number;
      status?: string;
    };
  };
}

// Add these interfaces if not already present
interface DatasetOption {
  id: string;
  name: string; // datasetName or filename
  job_id?: string;
  user_id?: string;
  rows?: number;
  columns?: number;
  last_modified?: string;
  type: "global" | "job-specific";
}

interface PreviewData {
  columns: string[];
  preview_rows: Record<string, any>[];
  total_rows: number;
  preview_row_count: number;
}

const JOBS_API = "https://api.veriton.ai/api/service3/user_models_summary";

const MODEL_TEST_HISTORY_API =
  "https://api.veriton.ai/api/service3/model_test_history";

type UploadSource =
  | "choose"
  | "adls"
  | "delta"
  | "onelake"
  | "local"
  | "preview";

const TestTab = () => {
  const navigate = useNavigate();
  const [trainedModels, setTrainedModels] = useState<TrainedModel[]>([]);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadWizardStep, setUploadWizardStep] = useState<
    UploadSource | "preview"
  >("choose");
  // Add this inside the TestTab component function
  const mapMetrics = (obj: any): TestMetric[] | undefined => {
    if (!obj) return undefined;
    return Object.entries(obj).map(([name, value]) => ({
      name: String(name),
      testing: Number(value),
    }));
  };

  // upload-source specific states
  const [selectedUploadSource, setSelectedUploadSource] =
    useState<UploadSource | null>(null);

  // Reuse existing test UI state
  const [viewResultsModalOpen, setViewResultsModalOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<TrainedModel | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const PAGE_SIZE = 10;

  const [page, setPage] = useState(0); // current page index
  const [hasNextPage, setHasNextPage] = useState(true);
  const [datasetSelectionOpen, setDatasetSelectionOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);

  const [datasetModalOpen, setDatasetModalOpen] = useState(false);
  const [datasets, setDatasets] = useState<DatasetOption[]>([]);
  const [selectedTestDataset, setSelectedTestDataset] =
    useState<DatasetOption | null>(null);
  const [datasetPreview, setDatasetPreview] = useState<PreviewData | null>(
    null,
  ); // reuse type from Jobs.tsx or define similar
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [datasetsLoading, setDatasetsLoading] = useState(false);
  const location = useLocation();
  const cameFromJobs1 = location.state?.origin === "jobs1";

  // Fetch jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      const user = getUserFromLocalStorage();
      const email = user?.email;
      if (!email) {
        console.warn("aivolve_user not found in localStorage; using mock data");
        return;
      }

      setIsLoading(true);
      setHasNextPage(false);
      try {
        const start = page * PAGE_SIZE;

        const url =
          `${JOBS_API}?user_email=${encodeURIComponent(email)}` +
          `&start=${start}&limit=${PAGE_SIZE}`;

        const res = await fetch(url, {
          method: "GET",
          headers: { accept: "application/json" },
        });

        if (!res.ok) {
          const txt = await res.text();
          console.error("Failed to fetch user models summary:", txt);
          toast({
            title: "Failed to load jobs",
            description: "Server returned an error.",
          });
          setIsLoading(false);
          return;
        }

        const data = await res.json();

        let rawJobs: any[] = [];
        if (Array.isArray(data)) {
          rawJobs = data;
        } else if (Array.isArray((data as any).models)) {
          rawJobs = (data as any).models;
        } else if (Array.isArray((data as any).data)) {
          rawJobs = (data as any).data;
        } else {
          const arr = Object.values(data).find((v) => Array.isArray(v));
          if (arr) rawJobs = arr as any[];
        }

        if (!rawJobs || rawJobs.length === 0) {
          setTrainedModels([]);
          setIsLoading(false);
          return;
        }

        const mapped: TrainedModel[] = rawJobs.map((item: any, idx: number) => {
          let dataset =
            item.table_name ||
            item.dataset_name ||
            item.dataset ||
            item.file_name ||
            item.blob_path ||
            item.name ||
            `dataset-${idx}`;

          // ✅ Extract table name from path like "Tables/iris/part-00000-..."
          if (dataset.includes("Tables/") && dataset.includes("/")) {
            const parts = dataset.split("/");
            const tableIndex = parts.indexOf("Tables");
            if (tableIndex !== -1 && parts.length > tableIndex + 1) {
              dataset = parts[tableIndex + 1]; // Get the table name after "Tables/"
            }
          }

          // ✅ Remove file extensions (.csv, .parquet, etc.)
          dataset = dataset
            .replace(/\.snappy\.parquet\.csv$/i, "")
            .replace(/\.parquet\.csv$/i, "")
            .replace(/\.csv$/i, "")
            .replace(/\.parquet$/i, "");

          const func = item.task_type || item.function || item.task || "—";

          const modelName =
            item.best_model ||
            item.model_name ||
            item.model ||
            item.name ||
            `model-${idx}`;

          const id =
            item.model_id ||
            item.id ||
            `${modelName}-${idx}-${Math.random().toString(36).slice(2, 6)}`;

          const target = item.target || item.target_column || item.label || "";

          const testResults =
            item.test_results || item.testResults || item.metrics || undefined;

          return {
            id: String(id),
            dataset: String(dataset),
            function: String(func),
            modelName: String(modelName),
            targetColumn: String(target),
            testResults,
          } as TrainedModel;
        });

        setTrainedModels(mapped);
        setHasNextPage(rawJobs.length === PAGE_SIZE);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        toast({ title: "Error", description: "Could not load jobs." });
      } finally {
        setIsLoading(false);
      }
    };

    void fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const loadAvailableDatasets = async () => {
    setDatasetsLoading(true);
    const user = getUserFromLocalStorage();
    const userId = user?.user_id || user?.id; // Adjust based on your localStorage key
    const userEmail = user?.email;

    if (!userId || !userEmail) {
      toast({
        title: "Error",
        description: "Missing user info",
        variant: "destructive",
      });
      setDatasetsLoading(false);
      return;
    }

    const allDatasets: DatasetOption[] = [];

    try {
      // Global datasets (/datasets API)
      const globalRes = await fetch(
        `https://api.veriton.ai/api/service2/datasets?user_id=${userId}`,
      );
      if (globalRes.ok) {
        const data = await globalRes.json();
        allDatasets.push(
          ...data.map((item: any, idx: number) => ({
            id: `global-${idx}`,
            name: item.dataset_name || "Unnamed",
            job_id: item.job_id,
            user_id: userId,
            rows: item.rows,
            columns: item.columns_count,
            last_modified: item.completed_at,
            type: "global" as const,
          })),
        );
      } else {
        console.error("Global datasets failed:", globalRes.status);
      }

      // Job-specific datasets (/list-datasets API)
      const currentJobId = localStorage.getItem("current_job_id"); // Or fetch if needed
      if (currentJobId) {
        const jobRes = await fetch(
          `https://api.veriton.ai/api/service2/list-datasets?user_id=${userId}&job_id=${currentJobId}`,
        );
        if (jobRes.ok) {
          const data = await jobRes.json();
          allDatasets.push(
            ...(data.datasets || []).map((d: any, idx: number) => ({
              id: `job-${idx}`,
              name: d.filename,
              job_id: currentJobId,
              user_id: userId,
              last_modified: d.date_modified,
              type: "job-specific" as const,
            })),
          );
        } else {
          console.error("Job datasets failed:", jobRes.status);
        }
      }

      setDatasets(allDatasets);
    } catch (err) {
      console.error("Datasets fetch error:", err);
      toast({ title: "Failed to load datasets", variant: "destructive" });
    } finally {
      setDatasetsLoading(false);
    }
  };

  const handleSelectTestDataset = async (ds: DatasetOption) => {
    setSelectedTestDataset(ds);
    setPreviewLoading(true);
    setDatasetPreview(null);

    if (!ds.job_id || !ds.user_id) {
      toast({
        title: "Error",
        description: "Missing job/user ID for preview",
        variant: "destructive",
      });
      setPreviewLoading(false);
      return;
    }

    try {
      const url = `https://api.veriton.ai/api/service2/preview-dataset?user_id=${ds.user_id}&job_id=${ds.job_id}&datasetname=${encodeURIComponent(ds.name)}`;
      const res = await fetch(url);
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Preview failed: ${res.status} - ${errText}`);
      }
      const data = await res.json();
      setDatasetPreview(data);
      setSelectedJobId(ds.job_id); // Store for payload
    } catch (err) {
      console.error("Preview error:", err);
      toast({ title: "Failed to load preview", variant: "destructive" });
    } finally {
      setPreviewLoading(false);
    }
  };

  // ======= Upload modal flow =======
  const openUploadWizard = () => {
    setUploadModalOpen(true);
    setSelectedTestDataset(null);
    setDatasetPreview(null);
    setSelectedJobId(null);
    loadAvailableDatasets(); // Fetch datasets on open
    setDatasetSelectionOpen(true);
  };

  const selectUploadSource = (src: UploadSource) => {
    setSelectedUploadSource(src);
    setUploadWizardStep(src);
  };

  const backToChoose = () => {
    setUploadWizardStep("choose");
    setSelectedUploadSource(null);
  };

  // ======= End upload modal flow =======

  const handleUploadClick = (model: TrainedModel) => {
    setSelectedModel(model);
    setTestResults(null);
    openUploadWizard(); // This now triggers dataset load
  };

  const handleViewResults = async (model: TrainedModel) => {
    setSelectedModel(model);

    const user = getUserFromLocalStorage();
    const userEmail = user?.email;
    if (!userEmail) {
      toast({
        title: "Auth error",
        description: "User email not found.",
        variant: "destructive",
      });
      return;
    }

    try {
      const url = `${MODEL_TEST_HISTORY_API}/${encodeURIComponent(
        model.id,
      )}?user_email=${encodeURIComponent(userEmail)}`;
      const res = await fetch(url, { method: "GET" });
      const data = await res.json();

      if (!data.test_history || data.test_history.length === 0) {
        // No history found
        setTestResults({
          modelId: model.id,
          modelName: model.modelName,
          task: model.function,
          targetColumn: model.targetColumn,
          groundTruthAvailable: false,
          testHistory: [],
        });
        setViewResultsModalOpen(true);
        return;
      }

      // Convert backend test history → UI format
      const history = data.test_history.map((test: any) => ({
        testResultId: test.test_result_id,
        testFileName: test.test_file_name,
        groundTruthAvailable: test.has_ground_truth,
        metrics: mapMetrics(test.test_metrics),
        blobPath: test.predictions_file,
      }));

      setTestResults({
        modelId: data.model_id,
        modelName: data.model_name,
        task: data.task,
        targetColumn: model.targetColumn,
        groundTruthAvailable: history.some((h) => h.groundTruthAvailable),
        testHistory: history,
      });

      setViewResultsModalOpen(true);
    } catch (err) {
      console.error("Exception fetching test history:", err);
      toast({
        title: "Network error",
        description: "Could not load test history.",
        variant: "destructive",
      });
      setViewResultsModalOpen(true);
    }
  };

  const fetchDriftReport = async (modelId: string, testResultId: string) => {
    const userEmail = getUserFromLocalStorage()?.email;
    if (!userEmail) return null;

    const body = new URLSearchParams({
      mode: "test",
      user_email: userEmail,
      model_id: modelId,
      test_result_id: testResultId,
    });

    const res = await fetch(
      "https://api.veriton.ai/api/service3/drift/report",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
        body,
      },
    );

    if (!res.ok) {
      console.error("Failed to fetch drift report");
      return null;
    }

    const json = await res.json();
    return json.drift_report;
  };

  const handleRunTest = async () => {
    if (!selectedModel || !selectedTestDataset || !selectedJobId) {
      toast({
        title: "Missing selection",
        description: "Select a model and dataset first.",
      });
      return;
    }

    const user = getUserFromLocalStorage();
    const userEmail = user?.email;
    const userId = user?.user_id || user?.id; // Adjust as needed

    if (!userEmail || !userId) {
      toast({
        title: "Auth error",
        description: "User email/ID not found.",
        variant: "destructive",
      });
      return;
    }

    setIsRunningTest(true);

    try {
      const filePath = `Files/Datasets/${userId}/${selectedJobId}/${selectedTestDataset.name}.csv`;

      const payload = {
        file_path: filePath,
        model_id: selectedModel.id,
        user_email: userEmail,
      };
      const params = new URLSearchParams();
      params.append("file_path", filePath);
      params.append("model_id", selectedModel.id);
      params.append("user_email", userEmail);

      const response = await fetch(
        "https://api.veriton.ai/api/service3/test_model_v",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Accept: "application/json",
          },
          body: params.toString(),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Test model API error:", errorText);
        toast({
          title: "Test Failed",
          description:
            "Failed to run test on model. Check file path or server logs.",
          variant: "destructive",
        });
        return;
      }

      const data = await response.json();

      // Assuming response structure is similar; adapt as needed (e.g., data.status, data.test_metrics, etc.)
      if (data.status !== "success") {
        toast({
          title: "Error",
          description: data.message || "Test failed",
          variant: "destructive",
        });
        return;
      }

      // Fetch drift report (keep as-is, or adapt if endpoint changes)
      const driftReport = await fetchDriftReport(
        selectedModel.id,
        data.test_result_id,
      );

      // Map metrics (keep your existing mapMetrics function)
      const metricsList = mapMetrics(data.test_metrics);

      // History entry (adapt fields if response differs)
      const historyEntry = {
        testResultId: data.test_result_id,
        testFileName: selectedTestDataset.name, // Use dataset name instead of file name
        groundTruthAvailable: data.has_ground_truth,
        metrics: metricsList,
        blobPath: data.predictions_file?.blob_path,
      };

      // Final TestResults (adapt as needed)
      const mappedResults: TestResults = {
        modelId: data.model_info.model_id,
        modelName: data.model_info.model_name,
        task: data.model_info.task,
        targetColumn: data.model_info.target,
        groundTruthAvailable: data.has_ground_truth,
        metrics: metricsList,
        training_test_metrics: data.training_test_metrics,
        drift_report: driftReport,
        predictions:
          data.predictions?.predicted
            ?.slice(0, 10)
            .map((pred: number, idx: number) => ({
              customerId: `Row ${idx + 1}`,
              predictedValue: pred,
            })) || [],
        blobPath: data.predictions_file?.blob_path,
        testResultId: data.test_result_id,
        testHistory: [historyEntry],
      };

      setTestResults(mappedResults);
      setTrainedModels((prev) =>
        prev.map((m) =>
          m.id === selectedModel.id ? { ...m, testResults: mappedResults } : m,
        ),
      );

      toast({
        title: "Test Complete!",
        description: data.message || "Model tested successfully.",
      });

      setViewResultsModalOpen(true); // Auto-open results
    } catch (err) {
      console.error("Exception during test:", err);
      toast({
        title: "Network Error",
        description: "Could not connect to test service.",
        variant: "destructive",
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  const closeAllModals = () => {
    setViewResultsModalOpen(false);
    setDatasetSelectionOpen(false);
    setPreviewDialogOpen(false);
    setUploadModalOpen(false);

    setSelectedModel(null);
    setSelectedTestDataset(null);
    setDatasetPreview(null);
  };

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
      {cameFromJobs1 ? <Header1 /> : <Header />}
      <div className="flex-1 flex flex-col overflow-auto">
        <main className="px-6 py-6">
          <div className="max-w-7xl mx-auto w-full">
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  Test Results
                </h1>
                <p className="text-muted-foreground mt-1">
                  View and test your trained models with new data
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (cameFromJobs1) {
                      navigate("/workflow/automl/jobs1");
                    } else {
                      navigate("/workflow/automl");
                    }
                  }}
                >
                  {cameFromJobs1 ? "Back to Auto AI/ML" : "Back to Jobs"}
                </Button>
              </div>
            </div>

            {/* Models Grid */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">Dataset</TableHead>
                    <TableHead className="font-semibold">Function</TableHead>
                    <TableHead className="font-semibold">Model Name</TableHead>
                    <TableHead className="font-semibold text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-6 text-center text-muted-foreground"
                      >
                        Loading jobs…
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading && trainedModels.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="py-6 text-center text-muted-foreground"
                      >
                        No trained models found.
                      </TableCell>
                    </TableRow>
                  )}

                  {!isLoading &&
                    trainedModels.map((model) => (
                      <TableRow key={model.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">
                          {model.dataset}
                        </TableCell>
                        <TableCell>{model.function}</TableCell>
                        <TableCell>{model.modelName}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUploadClick(model)}
                              className="gap-2"
                            >
                              <Upload className="w-4 h-4" />
                              Upload
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewResults(model)}
                              className="gap-2"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            {/* Pagination */}
            {(page > 0 || hasNextPage) && (
              <div className="flex justify-center mt-6">
                <div className="flex items-center gap-4">
                  {/* Previous → only if not first page */}
                  {page > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p - 1)}
                    >
                      Previous
                    </Button>
                  )}

                  <span className="text-sm text-muted-foreground">
                    Page {page + 1}
                  </span>

                  {/* Next → ONLY if backend confirms more jobs */}
                  {hasNextPage && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                    >
                      Next
                    </Button>
                  )}
                </div>
              </div>
            )}

            {trainedModels.length === 0 && !isLoading && (
              <div className="bg-card border border-border rounded-xl p-12 text-center mt-4">
                <TestTube2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  No Trained Models
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Build a model first to test it with new data.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Upload Wizard Modal */}
      <Dialog
        open={datasetSelectionOpen}
        onOpenChange={setDatasetSelectionOpen}
      >
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle>Select Dataset to Test</DialogTitle>
            <DialogDescription>
              Choose a dataset to run predictions with model:{" "}
              <strong>{selectedModel?.modelName}</strong>
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 max-h-[55vh] overflow-y-auto pr-2">
            {datasetsLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                Loading datasets...
              </div>
            ) : datasets.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground">
                No datasets available
              </div>
            ) : (
              <div className="space-y-1.5">
                {datasets.map((ds) => (
                  <button
                    key={ds.id}
                    onClick={() => {
                      handleSelectTestDataset(ds); // ← this already sets selected + fetches preview
                      setPreviewDialogOpen(true); // ← open preview dialog
                      // Do NOT close selection dialog yet — keep it open behind
                    }}
                    className={cn(
                      "w-full text-left p-3.5 rounded-lg border transition",
                      selectedTestDataset?.id === ds.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/40 hover:bg-muted/50",
                    )}
                  >
                    <div className="font-medium truncate">{ds.name}</div>
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
                      <span>{ds.type}</span>
                      {ds.rows && (
                        <span>• {ds.rows.toLocaleString()} rows</span>
                      )}
                      {ds.columns && <span>• {ds.columns} cols</span>}
                      {ds.last_modified && <span>• {ds.last_modified}</span>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={closeAllModals}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Dataset Preview: {selectedTestDataset?.name}</span>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => {
                  setPreviewDialogOpen(false);
                }}
              >
                Back to datasets
              </Button>
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden flex flex-col">
            {previewLoading ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Loading preview...
              </div>
            ) : datasetPreview ? (
              <>
                <div className="overflow-auto flex-1 px-1">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        {datasetPreview.columns.map((col) => (
                          <TableHead key={col} className="whitespace-nowrap">
                            {col}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {datasetPreview.preview_rows.map((row, i) => (
                        <TableRow key={i}>
                          {datasetPreview.columns.map((col) => (
                            <TableCell key={col} className="py-2">
                              {row[col] ?? "—"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="pt-4 border-t mt-2 flex justify-end gap-3 shrink-0">
                  <Button variant="outline" onClick={closeAllModals}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleRunTest}
                    disabled={isRunningTest || !datasetPreview}
                  >
                    {isRunningTest && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Run Test
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                Preview not available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      {/* Upload/Test Modal (when user clicks model Upload we open wizard; after wizard closes user can run test) */}
      <Dialog
        open={viewResultsModalOpen}
        onOpenChange={(open) => {
          if (!open) closeAllModals();
          else setViewResultsModalOpen(true);
        }}
      >
        <DialogContent className="max-w-4xl p-0 border border-border rounded-2xl overflow-hidden shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background">
            <div>
              <DialogTitle className="text-xl font-semibold">
                Test Results
              </DialogTitle>

              {selectedModel && (
                <p className="text-muted-foreground text-sm mt-1">
                  Results for {selectedModel.modelName} on{" "}
                  {selectedModel.dataset}
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={closeAllModals}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Scrollable Body */}
          <div className="max-h-[75vh] overflow-y-auto px-6 py-4">
            {testResults && <TestResultsDisplay results={testResults} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const TestResultsDisplay = ({ results }: { results: TestResults }) => {
  const userEmail = getUserFromLocalStorage()?.email || "";
  const overallStatus = results.drift_report?.overall_status ?? "unknown";
  const [predictionsPreviews, setPredictionsPreviews] = useState<
    Record<string, { rows: any[]; predictedCol?: string }>
  >({}); // Now stores rows + detected predicted column
  const [loadingPreviews, setLoadingPreviews] = useState<Set<string>>(
    new Set(),
  );

  const PREDICTION_KEYWORDS = [
    "predicted",
    "prediction",
    "pred",
    "forecast",
    "score",
    "probability",
    "label", // sometimes for classification
    results.targetColumn
      ? `predicted_${results.targetColumn.toLowerCase()}`
      : "",
  ].filter(Boolean);

  const detectPredictedColumn = (headers: string[]): string | undefined => {
    const lowerHeaders = headers.map((h) => h.toLowerCase().trim());

    // Exact matches first
    for (const keyword of PREDICTION_KEYWORDS) {
      const index = lowerHeaders.findIndex((h) =>
        h.includes(keyword.toLowerCase()),
      );
      if (index !== -1) {
        return headers[index];
      }
    }

    // Fallback: columns containing "pred" or ending with "_pred"
    return headers.find(
      (h) =>
        h.toLowerCase().includes("pred") || h.toLowerCase().endsWith("_pred"),
    );
  };

  const fetchPredictionsPreview = async (
    testResultId: string,
    blobPath: string,
  ) => {
    if (predictionsPreviews[testResultId]) return;

    setLoadingPreviews((prev) => new Set(prev).add(testResultId));
    setPredictionsPreviews((prev) => ({
      ...prev,
      [testResultId]: { rows: [], predictedCol: undefined },
    }));

    try {
      const url = `https://api.veriton.ai/api/service3/download_predictions?blob_path=${encodeURIComponent(
        blobPath,
      )}&user_email=${encodeURIComponent(userEmail)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch predictions");

      const text = await res.text();
      const lines = text.trim().split("\n");
      if (lines.length < 1) throw new Error("Empty file");

      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/"/g, ""));
      const dataLines = lines.slice(1, 6); // first 5 rows

      const rows = dataLines.map((line) => {
        const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));
        return Object.fromEntries(headers.map((h, i) => [h, values[i] || ""]));
      });

      const predictedCol = detectPredictedColumn(headers);

      setPredictionsPreviews((prev) => ({
        ...prev,
        [testResultId]: { rows, predictedCol },
      }));
    } catch (err) {
      console.error("Failed to load predictions preview:", err);
      setPredictionsPreviews((prev) => ({
        ...prev,
        [testResultId]: { rows: [], predictedCol: undefined },
      }));
      toast({
        title: "Preview failed",
        description: "Could not load prediction preview.",
        variant: "destructive",
      });
    } finally {
      setLoadingPreviews((prev) => {
        const next = new Set(prev);
        next.delete(testResultId);
        return next;
      });
    }
  };

  const handleDownload = async (blobPath: string, fileName: string) => {
    try {
      const url = `https://api.veriton.ai/api/service3/download_predictions?blob_path=${encodeURIComponent(
        blobPath,
      )}&user_email=${encodeURIComponent(userEmail)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      toast({
        title: "Download failed",
        description: "Could not download predictions.",
        variant: "destructive",
      });
    }
  };

  if (!results.testHistory || results.testHistory.length === 0) {
    return (
      <div className="py-10 text-center text-muted-foreground">
        <TestTube2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
        No test history available.
      </div>
    );
  }

  return (
    <div className="space-y-8 py-5">
      {results.testHistory.map((test, idx) => {
        const previewData = predictionsPreviews[test.testResultId];
        const { rows = [], predictedCol } = previewData || {};
        const isLoading = loadingPreviews.has(test.testResultId);

        return (
          <div
            key={test.testResultId}
            className="border border-border rounded-xl bg-card p-6"
          >
            <div className="flex justify-between items-start mb-5">
              <div>
                <p className="font-semibold text-lg">
                  Test #{results.testHistory!.length - idx}
                </p>
                <p className="text-sm text-muted-foreground">
                  {test.testFileName}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  ID: {test.testResultId}
                </p>
              </div>

              {test.blobPath && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-2"
                  onClick={() =>
                    handleDownload(
                      test.blobPath!,
                      test.testFileName.replace(".csv", "_predictions.csv"),
                    )
                  }
                >
                  <Download className="w-4 h-4" />
                  Download predictions
                </Button>
              )}
            </div>

            {/* Metrics */}
            {test.metrics && test.metrics.length > 0 && (
              <div className="mb-6">
                <h4 className="font-medium mb-3">Metrics</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Metric</TableHead>
                      <TableHead className="text-right">Value</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {test.metrics
                      .filter((m) => {
                        // For multistep forecasting, only show avg_ metrics
                        if (results.task?.toLowerCase().includes("multistep")) {
                          return m.name.toLowerCase().startsWith("avg_");
                        }
                        return true;
                      })
                      .map((m) => (
                        <TableRow key={m.name}>
                          <TableCell className="capitalize">
                            {m.name.replace(/_/g, " ")}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {typeof m.testing === "number"
                              ? m.testing.toFixed(4)
                              : m.testing}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* 🔥 Multistep forecasting fallback metrics */}
            {results.task === "multistep_forecasting" &&
              (!test.metrics || test.metrics.length === 0) &&
              results.training_test_metrics && (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Metrics</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Metric</TableHead>
                        <TableHead className="text-right">Value</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>Avg RMSE</TableCell>
                        <TableCell className="text-right font-medium">
                          {results.training_test_metrics.avg_rmse?.toFixed(4)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Avg MAE</TableCell>
                        <TableCell className="text-right font-medium">
                          {results.training_test_metrics.avg_mae?.toFixed(4)}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>Avg R²</TableCell>
                        <TableCell className="text-right font-medium">
                          {results.training_test_metrics.avg_r2?.toFixed(4)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <p className="text-xs text-muted-foreground mt-2">
                    Metrics are averaged across forecast horizons
                  </p>
                </div>
              )}
            {/* ================= Drift Report ================= */}
            {results.drift_report && (
              <div className="mb-6 border border-border rounded-xl p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Drift Report</h4>

                  <span
                    className={`text-xs px-2 py-1 rounded font-medium ${
                      overallStatus === "stable"
                        ? "bg-green-100 text-green-700"
                        : overallStatus === "activated"
                          ? "bg-blue-100 text-blue-700"
                          : overallStatus === "data_drift"
                            ? "bg-yellow-100 text-yellow-700"
                            : overallStatus === "degraded"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-red-100 text-red-700"
                    }`}
                  >
                    {overallStatus.toUpperCase()}
                  </span>
                </div>

                {/* Summary */}
                {results.drift_report.summary_message && (
                  <p className="text-sm mb-2">
                    {results.drift_report.summary_message}
                  </p>
                )}

                {/* Details */}
                {results.drift_report.details && (
                  <p className="text-sm text-muted-foreground whitespace-pre-line mb-3">
                    {results.drift_report.details}
                  </p>
                )}

                {/* ================= Data Drift ================= */}
                {results.drift_report.data_drift?.detected && (
                  <div className="mb-3 p-3 rounded bg-yellow-500/5 border border-yellow-500/20">
                    <p className="font-medium text-sm mb-1">
                      Data Drift Detected
                    </p>
                    <p className="text-sm">
                      PSI: {results.drift_report.data_drift.overall_psi}
                    </p>
                    <p className="text-sm">
                      Drifted features (
                      {results.drift_report.data_drift.drifted_features_count}):
                    </p>
                    <ul className="list-disc list-inside text-sm">
                      {results.drift_report.data_drift.drifted_features?.map(
                        (f) => (
                          <li key={f}>{f}</li>
                        ),
                      )}
                    </ul>
                  </div>
                )}

                {/* ================= Performance Drift ================= */}
                {results.drift_report.performance_drift?.detected && (
                  <div className="mb-3 p-3 rounded bg-red-500/5 border border-red-500/20">
                    <p className="font-medium text-sm mb-1">
                      Performance Degradation
                    </p>
                    <p className="text-sm">
                      Drop:{" "}
                      {
                        results.drift_report.performance_drift
                          .relative_drop_percent
                      }
                      %
                    </p>
                    <p className="text-sm">
                      Baseline:{" "}
                      {results.drift_report.performance_drift.baseline_metric} →
                      Current:{" "}
                      {results.drift_report.performance_drift.current_metric}
                    </p>
                  </div>
                )}

                {/* Recommendation */}
                {results.drift_report.recommendation && (
                  <p className="text-sm font-medium mt-2">
                    Recommendation: {results.drift_report.recommendation}
                  </p>
                )}
              </div>
            )}

            {/* Prediction Preview */}
            {test.blobPath && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">
                    Prediction Preview (first 5 rows)
                    {predictedCol && (
                      <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Predicted: <strong>{predictedCol}</strong>
                      </span>
                    )}
                  </h4>
                  {previewData === undefined && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        fetchPredictionsPreview(
                          test.testResultId,
                          test.blobPath!,
                        )
                      }
                      disabled={isLoading}
                    >
                      {isLoading ? "Loading..." : "Load Preview"}
                    </Button>
                  )}
                </div>

                {isLoading && (
                  <p className="text-sm text-muted-foreground">
                    Loading preview...
                  </p>
                )}

                {rows.length > 0 && (
                  <div className="overflow-x-auto border border-border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          {Object.keys(rows[0]).map((col) => (
                            <TableHead
                              key={col}
                              className={`whitespace-nowrap ${
                                col === predictedCol
                                  ? "bg-primary/20 text-primary font-semibold"
                                  : ""
                              }`}
                            >
                              {col}
                              {col === predictedCol && " ⭐"}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rows.map((row, i) => (
                          <TableRow key={i}>
                            {Object.keys(row).map((col) => (
                              <TableCell
                                key={col}
                                className={`whitespace-nowrap max-w-xs ${
                                  col === predictedCol
                                    ? "bg-primary/5 font-semibold text-primary"
                                    : ""
                                }`}
                              >
                                <span className="block truncate">
                                  {row[col]}
                                </span>
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {previewData !== undefined && rows.length === 0 && (
                  <div className="text-center py-6 text-muted-foreground border border-border rounded-lg">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Failed to load prediction preview</p>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TestTab;
