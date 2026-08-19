// import { useState, useMemo, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   Play,
//   Eye,
//   Edit,
//   Plus,
//   Grid3X3,
//   BarChart2,
//   RefreshCw,
//   Loader2,
//   Database,
//   TableIcon,
//   Sparkles,
//   GitBranch,
//   BarChart3,
//   X,
//   LogOut,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogFooter,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
// } from "@/components/ui/select";
// import Header from "@/components/layout/Header";
// import Chatbot from "@/components/chatbot/Chatbot";
// import { useJobs } from "@/components/contexts/JobsContext";
// import { useAuth } from "@/components/contexts/AuthContext";
// import { Job } from "@/components/types/jobs";
// import JobViewModal from "@/components/modals/JobViewModal";
// import JobEditModal from "@/components/modals/JobEditModal";
// import { toast } from "sonner";
// import { cn } from "@/lib/utils";
// import { ThemeToggle } from "@/components/ThemeToggle";

// // ─── Add these new interfaces ───
// interface GlobalDataset {
//   id: string;
//   jobName: string;
//   datasetName: string;
//   lastRun: string;
//   completedAt: string;
//   rows: number;
//   columns: number;
//   filePath: string;
//   isScheduled: boolean;
//   job_id?: string;
// }

// interface JobSpecificDataset {
//   filename: string;
//   date_modified: string;
// }

// interface PreviewData {
//   columns: string[];
//   preview_rows: Record<string, any>[];
//   total_rows: number;
//   preview_row_count: number;
//   // add more fields if your API returns them
// }

// // Map UI feature names to API task names
// const featureToTaskMap: Record<string, string> = {
//   Classification: "classification",
//   Regression: "regression",
//   Forecasting: "forecasting",
//   Clustering: "clustering",
//   "Anomaly Detection": "anomaly_detection",
// };

// // Map UI model names to API model names
// const modelNameToAPI: Record<string, string> = {
//   "Logistic Regression": "logistic_regression",
//   "Random Forest": "random_forest",
//   "Gradient Boosting": "gradient_boosting",
//   XGBoost: "xgboost",
//   Ridge: "ridge",
//   ARIMA: "arima",
//   Prophet: "prophet",
//   LightGBM: "lightgbm",
//   CatBoost: "catboost",
//   KMeans: "kmeans",
//   "KMeans++": "kmeans++",
//   DBSCAN: "dbscan",
//   GMM: "gmm",
//   "Isolation Forest": "isolation_forest",
//   "One-Class SVM": "one_class_svm",
//   "Local Outlier Factor (LOF)": "lof",
//   "Elliptic Envelope": "elliptic_envelope",
// };

// // Reverse mapping: API names to UI names
// const apiModelToUI: Record<string, string> = {
//   logistic_regression: "Logistic Regression",
//   random_forest: "Random Forest",
//   gradient_boosting: "Gradient Boosting",
//   xgboost: "XGBoost",
//   ridge: "Ridge",
//   arima: "ARIMA",
//   prophet: "Prophet",
//   lightgbm: "LightGBM",
//   catboost: "CatBoost",
//   kmeans: "KMeans",
//   "kmeans++": "KMeans++",
//   dbscan: "DBSCAN",
//   gmm: "GMM",
//   isolation_forest: "Isolation Forest",
//   one_class_svm: "One-Class SVM",
//   lof: "Local Outlier Factor (LOF)",
//   elliptic_envelope: "Elliptic Envelope",
// };

// const AutoMLJobs1 = () => {
//   const navigate = useNavigate();
//   const { isAuthenticated } = useAuth();
//   const {
//     jobs,
//     loading,
//     error,
//     totalCount,
//     currentPage,
//     fetchJobs,
//     updateJob,
//     setCurrentPage,
//   } = useJobs();

//   const [statusFilter, setStatusFilter] = useState("completed");
//   const [selectedJob, setSelectedJob] = useState<Job | null>(null);
//   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [runningJobId, setRunningJobId] = useState<string | null>(null);
//   const [runningMessage, setRunningMessage] = useState<string>("");
//   const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
//   const [jobName, setJobName] = useState("");
//   // Add these new states after the existing ones (e.g. after setIsCreateModalOpen etc.)
//   const [globalDatasets, setGlobalDatasets] = useState<GlobalDataset[]>([]);
//   const [jobDatasets, setJobDatasets] = useState<JobSpecificDataset[]>([]);
//   const [selectedDataset, setSelectedDataset] = useState<
//     GlobalDataset | JobSpecificDataset | null
//   >(null);
//   const [previewData, setPreviewData] = useState<PreviewData | null>(null);
//   const [dsLoading, setDsLoading] = useState(true);
//   const [activeDsTab, setActiveDsTab] = useState<"global" | "job">("global");
//   const [previewLoading, setPreviewLoading] = useState(false);
//   const [selectedFilePath, setSelectedFilePath] = useState<string>("");

//   const itemsPerPage = 10;
//   const totalPages = Math.ceil(totalCount / itemsPerPage);
//   const storedUser = localStorage.getItem("user");
//   const user = storedUser ? JSON.parse(storedUser) : null;
//   const userName = user?.name || user?.email?.split("@")[0] || "User";
//   const userId = user?.id || user?.user_id;

//   // Data platform selection (Fabric / Snowflake / Databricks)
//   const [dataPlatform, setDataPlatform] = useState<string>(
//     user?.dataplatform || "",
//   );

//   const closeToastButton = (
//     <button
//       onClick={() => toast.dismiss()}
//       className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
//       aria-label="Close toast"
//     >
//       <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
//     </button>
//   );

//   // Replace or add this useEffect (make sure it's separate from the dataset loading one)
//   // (status filtering is done client-side on the loaded jobs — no need to send status to backend yet)
//   useEffect(() => {
//     fetchJobs(currentPage);
//   }, [currentPage]); // ← add fetchJobs to deps if it's from context

//   useEffect(() => {
//     if (statusFilter !== "all") {
//       setCurrentPage(1);
//     }
//   }, [statusFilter]);

//   // Add this complete useEffect block
//   useEffect(() => {
//     const loadDatasets = async () => {
//       setDsLoading(true);

//       const userRaw = localStorage.getItem("user");
//       if (!userRaw) {
//         toast.error("User information not found");
//         setDsLoading(false);
//         return;
//       }

//       const userData = JSON.parse(userRaw);
//       const userId = userData.user_id || userData.id;

//       if (!userId) {
//         toast.error("User ID not found");
//         setDsLoading(false);
//         return;
//       }

//       let fetchedGlobal: GlobalDataset[] = [];
//       let fetchedJob: JobSpecificDataset[] = [];

//       // A. Global datasets

//       // A. Global datasets
//       try {
//         const res = await fetch(
//           `https://api.veriton.ai/api/service2/datasets?user_id=${userId}`,
//         );
//         if (res.ok) {
//           const data = await res.json();
//           const mapped = data.map((item: any, idx: number) => ({
//             id: String(idx + 1),
//             jobName: item.job_name || "Unnamed Job",
//             datasetName: item.dataset_name || "Unnamed Dataset",
//             createdAt: item.created_at ? new Date(item.created_at) : null,
//             lastRun: item.last_run ? new Date(item.last_run) : null,
//             rows: item.rows || 0,
//             columns: item.columns_count || 0,
//             filePath: item.file_path || "",
//             isScheduled: item.is_scheduled || false,
//             job_id: item.job_id,
//           }));
//           fetchedGlobal = mapped;
//           setGlobalDatasets(mapped);
//         }
//       } catch (err) {
//         console.error("Global datasets fetch failed", err);
//       }

//       // B. Job-specific datasets
//       // const currentJobId = localStorage.getItem("current_job_id");
//       // if (currentJobId) {
//       //   try {
//       //     const res = await fetch(
//       //       `https://api.veriton.ai/api/service2/list-datasets?user_id=${userId}&job_id=${currentJobId}`,
//       //     );
//       //     if (res.ok) {
//       //       const data = await res.json();
//       //       fetchedJob = data.datasets || [];
//       //       setJobDatasets(fetchedJob);
//       //     }
//       //   } catch (err) {
//       //     console.error("Job-specific datasets fetch failed", err);
//       //   }
//       // }

//       setDsLoading(false);

//       // Auto-select first dataset directly from fetched local variables
//       const allFetched = [...fetchedJob, ...fetchedGlobal];
//       if (allFetched.length > 0) {
//         handleSelectDataset(allFetched[0]);
//       }
//     };

//     loadDatasets();
//   }, []);

//   const filteredJobs = useMemo(() => {
//     return jobs.filter((job) => job.status === statusFilter);
//   }, [jobs, statusFilter]);

//   const paginatedJobs = useMemo(() => {
//     const start = (currentPage - 1) * itemsPerPage;

//     const end = start + itemsPerPage;

//     return filteredJobs.slice(start, end);
//   }, [filteredJobs, currentPage]);

//   const formatDate = (date: Date | null) => {
//     if (!date) return "—";

//     const day = String(date.getDate()).padStart(2, "0");
//     const month = String(date.getMonth() + 1).padStart(2, "0");
//     const year = date.getFullYear();

//     return `${day}-${month}-${year}`;
//   };

//   const getStatusBadge = (status: Job["status"]) => {
//     const styles = {
//       completed: "bg-emerald-100 text-emerald-700",
//       pending: "bg-amber-100 text-amber-700",
//       running: "bg-amber-100 text-amber-700",
//       failed: "bg-red-100 text-red-700",
//     };

//     const labels = {
//       completed: "Completed",
//       pending: "Running",
//       running: "Running",
//       failed: "Failed",
//     };

//     return (
//       <span
//         className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
//       >
//         {labels[status]}
//       </span>
//     );
//   };

//   const extractFileName = (path: string) => {
//     if (!path) return "";
//     return path.split("/").pop() || path;
//   };

//   const handleRun = async (job: Job) => {
//     console.log("Job config:", {
//       category: job.category,
//       features: job.features,
//       target: job.target,
//       datasetName: job.datasetName,
//     });

//     if (!job.category && !job.feature) {
//       alert("Job is missing task type (category). Please edit the job first.");
//       return;
//     }

//     if (!job.datasetName) {
//       alert("Job is missing dataset. Please edit the job first.");
//       return;
//     }

//     setRunningJobId(job.id);
//     setRunningMessage("Preparing job...");

//     try {
//       const userDataString = localStorage.getItem("aivolve_user");
//       if (!userDataString) throw new Error("User not found");

//       const userData = JSON.parse(userDataString);
//       const userEmail = userData.email;

//       if (!userEmail) throw new Error("User email missing");

//       // ============================
//       // ✅ STEP 1: GET TARGET
//       // ============================
//       let targetColumn = job.target;

//       if (!targetColumn) {
//         setRunningMessage("Fetching target column...");

//         const modelId = job.id;

//         const metricsUrl = `https://api.veriton.ai/api/service3/model_detailed_metrics/${modelId}?user_email=${encodeURIComponent(
//           userEmail,
//         )}`;

//         const metricsResponse = await fetch(metricsUrl, {
//           method: "GET",
//           headers: { accept: "application/json" },
//         });

//         if (!metricsResponse.ok) {
//           throw new Error(
//             `Failed to fetch model details: ${metricsResponse.status}`,
//           );
//         }

//         const metricsData = await metricsResponse.json();

//         targetColumn = metricsData.target;

//         if (!targetColumn) {
//           throw new Error("Target not found in model details");
//         }

//         console.log("✅ Target fetched:", targetColumn);
//       }

//       if (targetColumn) {
//         updateJob(job.id, {
//           ...job,
//           target: targetColumn, // ✅ store immediately
//         });
//       }

//       // ============================
//       // ✅ STEP 2: CALL TRAINING API
//       // ============================
//       setRunningMessage("Starting training...");

//       const params = new URLSearchParams();

//       params.append("file_path", job.veriton_file_path);
//       params.append("upload_file_path", "false");
//       params.append("user_email", userEmail);

//       params.append(
//         "task",
//         featureToTaskMap[job.category] || job.category?.toLowerCase(),
//       );

//       params.append("target", targetColumn);

//       const apiModelName = job.model
//         ? modelNameToAPI[job.model] ||
//           job.model.toLowerCase().replace(/\s+/g, "_")
//         : "";

//       params.append("models", apiModelName);

//       params.append("metric", "");
//       params.append("preprocessing_mode", "simple");
//       params.append("use_cleaning", "true");
//       params.append("use_feature_selection", "true");
//       params.append("use_optuna", "true");
//       params.append("optuna_trials", "2");
//       params.append("time_budget", "180");
//       params.append("test_size", "0.2");
//       params.append("horizon", "12");

//       const buildResponse = await fetch(
//         "https://api.veriton.ai/api/service3/build_ml_model_v",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             accept: "application/json",
//           },
//           body: params.toString(),
//         },
//       );

//       if (!buildResponse.ok) {
//         const errorData = await buildResponse.json().catch(() => ({}));
//         throw new Error(
//           errorData.detail || `API failed: ${buildResponse.status}`,
//         );
//       }

//       const startResult = await buildResponse.json();

//       console.log("🚀 Training started:", startResult);

//       const trainingJobId = startResult.job_id;

//       // ============================
//       // ✅ STEP 3: POLLING
//       // ============================
//       const pollInterval = setInterval(async () => {
//         try {
//           const res = await fetch(
//             `https://api.veriton.ai/api/service3/training-status/${trainingJobId}?user_email=${encodeURIComponent(
//               userEmail,
//             )}`,
//           );

//           if (!res.ok) return;

//           const result = await res.json();

//           console.log("Training status:", result);

//           if (result.status === "success") {
//             clearInterval(pollInterval);

//             const uiModelName =
//               apiModelToUI[result.best_model?.toLowerCase()] ||
//               result.best_model;

//             updateJob(job.id, {
//               ...job,
//               id: result.model_id,
//               model: uiModelName,
//               target: targetColumn,
//               status: "completed",
//               task_type: result.task_type,
//               testAccuracy: result.primary_score?.toString(),
//               lastRun: job.lastRun || new Date(),
//               createdAt: job.createdAt || new Date(),
//               datasetName: job.datasetName,
//               veriton_file_path: job.veriton_file_path,
//             });

//             setRunningMessage("Training complete! Opening results...");

//             setTimeout(() => {
//               setSelectedJob({
//                 ...job,
//                 id: result.model_id,
//                 model: uiModelName,
//                 target: targetColumn,
//                 status: "completed",
//                 lastRun: new Date(),
//               });

//               setIsViewModalOpen(true);
//             }, 500);

//             setRunningJobId(null);
//             setRunningMessage("");
//           }

//           if (result.status === "failed") {
//             clearInterval(pollInterval);

//             updateJob(job.id, {
//               ...job,
//               status: "failed",
//             });

//             const cleanError = result?.error?.includes(
//               "No models were successfully trained",
//             )
//               ? "Training failed: No models could be trained. Try changing dataset or features."
//               : result.message || result.error || "Training failed";

//             alert(cleanError);

//             setRunningJobId(null);
//             setRunningMessage("");
//           }
//         } catch (err) {
//           console.error("Polling error:", err);
//         }
//       }, 10000);
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : "Failed to train model";

//       alert(`Error: ${errorMessage}`);
//       console.error("Error training model:", err);

//       setRunningJobId(null);
//       setRunningMessage("");
//     }
//   };

//   // Add these two functions (e.g. after handleRun or before return)
//   const handleSelectDataset = async (
//     ds: GlobalDataset | JobSpecificDataset,
//   ) => {
//     setSelectedDataset(ds);
//     setPreviewData(null);
//     setPreviewLoading(true);

//     const userRaw = localStorage.getItem("user");
//     const user = userRaw ? JSON.parse(userRaw) : null;
//     const userId = user?.user_id || user?.id;

//     if (!userId) {
//       toast.error("User ID not found");
//       setPreviewLoading(false);
//       return;
//     }

//     // ─── This is the important change ───
//     let jobId: string | undefined;
//     let datasetName: string;

//     if ("job_id" in ds && ds.job_id) {
//       // Global dataset from /datasets API → use its own job_id
//       jobId = ds.job_id;
//       datasetName = ds.datasetName;
//     } else if ("filename" in ds) {
//       // Job-specific dataset from /list-datasets → fallback to current_job_id
//       jobId = localStorage.getItem("current_job_id") || undefined;
//       datasetName = ds.filename;
//     }

//     if (!jobId) {
//       toast.error("Cannot preview: no job ID associated with this dataset");
//       setPreviewLoading(false);
//       return;
//     }

//     try {
//       const url = `https://api.veriton.ai/api/service2/preview-dataset?user_id=${userId}&job_id=${jobId}&datasetname=${encodeURIComponent(datasetName)}`;

//       const res = await fetch(url);
//       if (!res.ok) {
//         const errText = await res.text().catch(() => "");
//         throw new Error(`Preview failed (${res.status}): ${errText}`);
//       }

//       const data = await res.json();
//       setPreviewData(data);
//       const filePath = `Files/Datasets/${data.user_id}/${data.job_id}/${data.dataset}.csv`;
//       setSelectedFilePath(filePath);
//     } catch (err: any) {
//       console.error("Preview error:", err);
//       toast.error(err.message || "Failed to load dataset preview");
//     } finally {
//       setPreviewLoading(false);
//     }
//   };

//   const handleLogout = () => {
//     localStorage.clear();
//     toast.success("Logged out successfully", {
//       action: closeToastButton,
//     });
//     navigate("/", { replace: true });
//   };

//   // Persist the selected data platform onto the "user" object in localStorage
//   const handleDataPlatformChange = (value: string) => {
//     setDataPlatform(value);
//     try {
//       const storedUserRaw = localStorage.getItem("user");
//       const userObj = storedUserRaw ? JSON.parse(storedUserRaw) : {};
//       const updatedUser = { ...userObj, dataplatform: value };
//       localStorage.setItem("user", JSON.stringify(updatedUser));
//       toast.success(`Data platform set to ${value}`, {
//         action: closeToastButton,
//       });
//     } catch (err) {
//       console.error("Failed to update data platform in localStorage", err);
//       toast.error("Failed to save data platform selection");
//     }
//   };

//   const startWorkflow = async (mode: "build" | "compare") => {
//     if (!selectedDataset) return;

//     const userRaw = localStorage.getItem("user");
//     const user = userRaw ? JSON.parse(userRaw) : null;
//     const userId = user?.user_id || user?.id;

//     let jobId: string | undefined;
//     let filename: string;

//     if ("job_id" in selectedDataset && selectedDataset.job_id) {
//       jobId = selectedDataset.job_id;
//       filename = selectedDataset.datasetName;
//     } else if ("filename" in selectedDataset) {
//       jobId = localStorage.getItem("current_job_id") || undefined;
//       filename = selectedDataset.filename;
//     }

//     if (!userId || !jobId || !filename) {
//       toast.error("Cannot start: missing job ID or filename");
//       return;
//     }

//     try {
//       navigate(
//         mode === "compare"
//           ? "/workflow/automl/compare"
//           : "/workflow/automl/build-model",
//         {
//           state: {
//             filePath: selectedFilePath,
//             datasetName: filename,
//             origin: "jobs1",
//             mode: mode === "compare" ? "compare" : undefined,
//           },
//         },
//       );
//     } catch (err: any) {
//       toast.error(`Preparation failed for "${filename}": ${err.message}`);
//     }
//   };

//   const handleView = (job: Job) => {
//     setSelectedJob({
//       ...job,
//       error_message: (job as any).error_message || null,
//     });
//     setIsViewModalOpen(true);
//   };

//   const handleEdit = (job: Job) => {
//     setSelectedJob(job);
//     setIsEditModalOpen(true);
//   };

//   const handleCreateJob = () => {
//     if (jobName.trim()) {
//       navigate("/workflow/automl/select-dataset", {
//         state: { jobName: jobName.trim(), initialTab: "data-source" },
//       });
//       setIsCreateModalOpen(false);
//       setJobName("");
//     }
//   };

//   const handleRefresh = async () => {
//     await fetchJobs(currentPage);
//   };

//   //   if (!isAuthenticated) return null;

//   return (
//     <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
//       <header className="border-b border-border backdrop-blur sticky">
//         <div className="container mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3 md:gap-4">
//               {/* Logo */}
//               <a href="/" className="flex-shrink-0">
//                 <img
//                   src="/logo2.png"
//                   alt="Veriton"
//                   className="
//                     h-10               /* mobile base size */
//                     sm:h-10
//                     md:h-9 lg:h-10    /* larger on desktop */
//                     w-auto
//                     object-contain
//                     drop-shadow-[0_4px_16px_rgba(99,102,241,0.7)]
//                     transition-transform duration-200
//                     hover:scale-105
//                   "
//                 />
//               </a>

//               {/* Welcome text – side by side */}
//               <div className="flex flex-col">
//                 <p className="text-sm md:text-base text-muted-foreground">
//                   Welcome,{" "}
//                   <span className="text-primary font-medium">
//                     {userName || "User"}
//                   </span>
//                 </p>
//               </div>
//             </div>

//             <nav className="flex items-center gap-6">
//               <button
//                 onClick={() => navigate("/jobs")}
//                 className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
//               >
//                 <BarChart3 className="w-4 h-4" />
//                 Jobs
//               </button>
//               <button
//                 onClick={() => navigate("/pipelines")}
//                 className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
//               >
//                 <GitBranch className="w-4 h-4" />
//                 Pipelines
//               </button>

//               <button
//                 onClick={() => navigate("/datasets")} // or any route you prefer
//                 className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
//               >
//                 <TableIcon className="w-4 h-4" />{" "}
//                 {/* Perfect icon for datasets */}
//                 Datasets
//               </button>

//               <button
//                 onClick={() => navigate("/workflow/automl/jobs1")}
//                 className="flex items-center gap-2 text-primary font-medium border-b-2 border-primary pb-1"
//               >
//                 <Sparkles className="w-4 h-4" />
//                 Auto AI/ML
//               </button>

//               <Select
//                 value={dataPlatform}
//                 onValueChange={handleDataPlatformChange}
//               >
//                 <SelectTrigger className="w-auto min-w-[150px] h-8 border-none bg-transparent text-muted-foreground hover:text-foreground focus:ring-0 gap-2 px-2 shadow-none">
//                   <span className="truncate">Data platform</span>
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="Fabric">Fabric</SelectItem>
//                   <SelectItem value="Snowflake">Snowflake</SelectItem>
//                   <SelectItem value="Databricks">Databricks</SelectItem>
//                 </SelectContent>
//               </Select>

//               <div className="flex items-center gap-3">
//                 <ThemeToggle />

//                 <Button
//                   variant="ghost"
//                   size="icon"
//                   onClick={handleLogout}
//                   className="hover:bg-primary rounded-full"
//                   title="Logout"
//                 >
//                   <LogOut className="h-4 w-4" />
//                 </Button>
//               </div>
//             </nav>
//           </div>
//         </div>
//       </header>

//       <div className="flex-1 overflow-hidden">
//         <main className="h-full overflow-auto px-6 py-6">
//           <div className="max-w-7xl mx-auto w-full">
//             {/* ================= AutoML Intro ================= */}

//             <div className="mb-10 flex items-start justify-between">
//               <div>
//                 <h1 className="text-3xl font-bold text-foreground">
//                   AutoML Workspace
//                 </h1>

//                 <p className="text-muted-foreground mt-2 max-w-2xl">
//                   Build, compare, and test machine learning models automatically
//                   using your datasets. Manage all trained models below.
//                 </p>
//               </div>

//               <div className="flex items-center gap-3">
//                 <Button
//                   variant="outline"
//                   onClick={() =>
//                     navigate("/workflow/automl/test", {
//                       state: {
//                         initialTab: "test",
//                         origin: "jobs1",
//                       },
//                     })
//                   }
//                 >
//                   Test Model
//                 </Button>
//               </div>
//             </div>
//             {/* ─── NEW: Dataset Selection Section ─── */}
//             {/* ================= DATASET SECTION ================= */}

//             <div className="bg-card border border-border rounded-xl shadow-sm mb-10 h-[480px] flex flex-col shrink-0">
//               {/* Header */}
//               <div className="px-6 py-4 border-b">
//                 <h2 className="text-lg font-semibold">Select Dataset</h2>
//               </div>

//               <div className="flex flex-1 overflow-hidden">
//                 {" "}
//                 {/* subtract border if needed */}
//                 {/* ================= Sidebar – Datasets List ================= */}
//                 <div className="w-[300px] border-r bg-muted/20">
//                   <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent">
//                     {dsLoading ? (
//                       <div className="p-6 text-sm text-muted-foreground">
//                         Loading datasets...
//                       </div>
//                     ) : globalDatasets.length === 0 &&
//                       jobDatasets.length === 0 ? (
//                       <div className="p-6 text-sm text-muted-foreground">
//                         No datasets available
//                       </div>
//                     ) : (
//                       // Flat combined list: job-specific + global
//                       [...jobDatasets, ...globalDatasets].map((ds) => {
//                         const isGlobal = "datasetName" in ds;
//                         const name = isGlobal ? ds.datasetName : ds.filename;

//                         const rows = isGlobal ? ds.rows : null;
//                         const columns = isGlobal ? ds.columns : null;
//                         const dateInfo = isGlobal
//                           ? ds.lastRun
//                           : ds.date_modified;

//                         const isSelected =
//                           selectedDataset &&
//                           ((isGlobal &&
//                             "datasetName" in selectedDataset &&
//                             selectedDataset.datasetName === name) ||
//                             (!isGlobal &&
//                               "filename" in selectedDataset &&
//                               selectedDataset.filename === name));

//                         return (
//                           <button
//                             key={`${isGlobal ? "g" : "j"}-${name}`}
//                             onClick={() => handleSelectDataset(ds)}
//                             className={cn(
//                               "w-full text-left px-5 py-4 border-l-2 transition-all duration-200",
//                               isSelected
//                                 ? "border-primary bg-background"
//                                 : "border-transparent hover:bg-background/60",
//                             )}
//                           >
//                             <div className="font-medium text-sm truncate">
//                               {name}
//                             </div>

//                             <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-2">
//                               {rows != null && (
//                                 <>
//                                   {rows} rows<span className="mx-1">•</span>
//                                 </>
//                               )}
//                               {columns != null && (
//                                 <>
//                                   {columns} columns
//                                   <span className="mx-1">•</span>
//                                 </>
//                               )}
//                               {dateInfo && (
//                                 <span>
//                                   {isGlobal ? "Last run: " : "Modified: "}
//                                   {dateInfo}
//                                 </span>
//                               )}
//                             </div>
//                           </button>
//                         );
//                       })
//                     )}
//                   </div>
//                 </div>
//                 {/* ================= Preview Panel ================= */}
//                 <div className="flex-1 bg-background overflow-hidden flex flex-col min-h-0">
//                   {selectedDataset ? (
//                     <div className="h-full flex flex-col">
//                       {/* Header */}
//                       <div className="px-6 py-4 border-b flex items-center justify-between bg-background">
//                         <div>
//                           <h3 className="font-semibold">
//                             {"datasetName" in selectedDataset
//                               ? selectedDataset.datasetName
//                               : "filename" in selectedDataset
//                                 ? selectedDataset.filename
//                                 : "Unnamed Dataset"}
//                           </h3>
//                           <p className="text-xs text-muted-foreground">
//                             Dataset Preview •{" "}
//                             {previewData
//                               ? `${previewData.preview_row_count} / ${previewData.total_rows} rows shown`
//                               : ""}
//                           </p>
//                         </div>

//                         <div className="flex gap-2">
//                           <Button
//                             size="sm"
//                             onClick={() => startWorkflow("build")}
//                             disabled={!previewData || previewLoading}
//                           >
//                             Build Model
//                           </Button>

//                           <Button
//                             size="sm"
//                             variant="outline"
//                             onClick={() => startWorkflow("compare")}
//                             disabled={!previewData || previewLoading}
//                           >
//                             Compare
//                           </Button>
//                         </div>
//                       </div>

//                       {/* Scrollable Table Container */}
//                       <div className="flex-1 min-h-0 min-w-0 overflow-auto relative ">
//                         {/* Optional hint for wide tables */}
//                         {previewData && previewData.columns.length > 6 && (
//                           <div className="sticky top-0 left-0 right-0 z-20 px-4 py-1.5 text-xs text-muted-foreground bg-background/90 border-b backdrop-blur-sm">
//                             Scroll horizontally →
//                           </div>
//                         )}

//                         {previewLoading ? (
//                           <div className="flex justify-center items-center h-full text-muted-foreground">
//                             Loading preview...
//                           </div>
//                         ) : previewData &&
//                           previewData.preview_rows?.length > 0 ? (
//                           <div className="inline-block min-w-max">
//                             <table className="min-w-max w-full border-collapse table-auto">
//                               {/* NO sticky anymore */}
//                               <thead className="bg-muted/30">
//                                 <tr>
//                                   {previewData.columns.map((col) => (
//                                     <th
//                                       key={col}
//                                       className="px-5 py-3 text-left text-sm font-medium border-b whitespace-nowrap"
//                                     >
//                                       {col}
//                                     </th>
//                                   ))}
//                                 </tr>
//                               </thead>

//                               <tbody>
//                                 {previewData.preview_rows.map((row, index) => (
//                                   <tr
//                                     key={index}
//                                     className="hover:bg-muted/50 transition-colors even:bg-muted/10"
//                                   >
//                                     {previewData.columns.map((col) => (
//                                       <td
//                                         key={col}
//                                         className="px-5 py-3 text-sm border-b whitespace-nowrap"
//                                       >
//                                         {row[col] ?? "—"}
//                                       </td>
//                                     ))}
//                                   </tr>
//                                 ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         ) : (
//                           <div className="flex justify-center items-center h-full text-muted-foreground">
//                             No preview rows available
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   ) : (
//                     <div className="flex justify-center items-center h-full text-muted-foreground italic">
//                       Select a dataset to preview
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Header */}
//             <div className="flex items-start justify-between mb-8">
//               <div>
//                 <h1 className="text-3xl font-bold text-foreground mb-1">
//                   Trained Models
//                 </h1>
//                 {/* <p className="text-muted-foreground">All machine learning models created using AutoML.</p> */}
//               </div>
//               <div className="flex items-center gap-3"></div>
//             </div>

//             {/* Error Display */}
//             {error && (
//               <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
//                 <p className="text-red-700 text-sm">{error}</p>
//                 <Button variant="outline" size="sm" onClick={handleRefresh}>
//                   Try Again
//                 </Button>
//               </div>
//             )}

//             {/* Running Job Status */}
//             {runningJobId && (
//               <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
//                 <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
//                 <div>
//                   <p className="text-blue-800 font-medium text-sm">
//                     Training in progress...
//                   </p>
//                   <p className="text-blue-600 text-xs mt-0.5">
//                     {runningMessage}
//                   </p>
//                 </div>
//               </div>
//             )}

//             {/* Filters Row */}
//             <div className="flex items-center justify-between mb-6">
//               <div className="flex items-center gap-1 bg-muted/50 rounded-full p-1">
//                 {["completed", "failed"].map((status) => (
//                   <button
//                     key={status}
//                     onClick={() => setStatusFilter(status)}
//                     className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
//                       statusFilter === status
//                         ? "bg-primary text-primary-foreground"
//                         : "text-muted-foreground hover:text-foreground"
//                     }`}
//                   >
//                     {status === "all"
//                       ? "All"
//                       : status.charAt(0).toUpperCase() + status.slice(1)}
//                   </button>
//                 ))}
//               </div>
//             </div>

//             {/* Jobs Table */}
//             <motion.div
//               initial={{ opacity: 0, y: 20 }}
//               animate={{ opacity: 1, y: 0 }}
//               className="bg-card rounded-xl border border-border overflow-hidden"
//             >
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="border-b border-border">
//                       <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
//                         Job
//                       </th>
//                       <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
//                         Category
//                       </th>
//                       <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
//                         Model
//                       </th>
//                       <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
//                         Created At
//                       </th>
//                       <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
//                         Last Run
//                       </th>
//                       <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
//                         Status
//                       </th>
//                       <th className="px-6 py-4 text-left text-sm font-medium text-primary">
//                         Actions
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {loading ? (
//                       <tr>
//                         <td colSpan={7} className="px-6 py-12 text-center">
//                           <div className="flex items-center justify-center gap-2">
//                             <RefreshCw className="w-5 h-5 animate-spin text-primary" />
//                             <span className="text-muted-foreground">
//                               Loading jobs...
//                             </span>
//                           </div>
//                         </td>
//                       </tr>
//                     ) : jobs.length === 0 ? (
//                       // No jobs at all
//                       <tr>
//                         <td colSpan={7} className="px-6 py-16 text-center">
//                           <h3 className="text-lg font-semibold mb-2">
//                             No models created yet
//                           </h3>
//                           <p className="text-sm text-muted-foreground mb-4">
//                             Start by building your first AutoML model.
//                           </p>
//                         </td>
//                       </tr>
//                     ) : filteredJobs.length === 0 ? (
//                       // Jobs exist but none match filter
//                       <tr>
//                         <td colSpan={7} className="px-6 py-16 text-center">
//                           <h3 className="text-lg font-semibold mb-2">
//                             No {statusFilter} models found
//                           </h3>
//                           <p className="text-sm text-muted-foreground">
//                             There are no models with status "{statusFilter}".
//                           </p>
//                         </td>
//                       </tr>
//                     ) : (
//                       filteredJobs.map((job, index) => {
//                         const jobNumber =
//                           (currentPage - 1) * itemsPerPage + index + 1;
//                         return (
//                           <motion.tr
//                             key={job.id}
//                             initial={{ opacity: 0 }}
//                             animate={{ opacity: 1 }}
//                             transition={{ delay: index * 0.03 }}
//                             className="border-b border-border/50 hover:bg-muted/20"
//                           >
//                             <td className="px-6 py-4 font-medium text-foreground">
//                               Job_{jobNumber}
//                             </td>
//                             <td className="px-6 py-4 text-primary">
//                               {job.category || "Unknown"}
//                             </td>
//                             <td className="px-6 py-4 text-muted-foreground">
//                               {job.model}
//                             </td>
//                             <td className="px-6 py-4 text-muted-foreground">
//                               {formatDate(job.createdAt)}
//                             </td>
//                             <td className="px-6 py-4 text-muted-foreground">
//                               {formatDate(job.lastRun)}
//                             </td>
//                             <td className="px-6 py-4">
//                               {getStatusBadge(job.status)}
//                             </td>
//                             <td className="px-6 py-4">
//                               <div className="flex items-center gap-3">
//                                 {job.status !== "failed" && (
//                                   <button
//                                     onClick={() => handleRun(job)}
//                                     disabled={runningJobId === job.id}
//                                     className="text-muted-foreground hover:text-foreground transition-colors"
//                                     title="Run job"
//                                   >
//                                     {runningJobId === job.id ? (
//                                       <Loader2 className="w-5 h-5 animate-spin" />
//                                     ) : (
//                                       <Play className="w-5 h-5" />
//                                     )}
//                                   </button>
//                                 )}

//                                 <button
//                                   onClick={() => handleView(job)}
//                                   className="text-muted-foreground hover:text-foreground transition-colors"
//                                   title="View details"
//                                 >
//                                   <Eye className="w-5 h-5" />
//                                 </button>

//                                 {job.status !== "failed" && (
//                                   <button
//                                     onClick={() => handleEdit(job)}
//                                     className="text-muted-foreground hover:text-foreground transition-colors"
//                                     title="Edit job"
//                                   >
//                                     <Edit className="w-5 h-5" />
//                                   </button>
//                                 )}
//                               </div>
//                             </td>
//                           </motion.tr>
//                         );
//                       })
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </motion.div>

//             {/* Pagination */}
//             {statusFilter === "completed" && totalPages > 1 && (
//               <div className="flex items-center justify-center gap-2 mt-6">
//                 <button
//                   onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
//                   disabled={currentPage === 1}
//                   className="p-2 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-50"
//                 >
//                   ‹
//                 </button>
//                 {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
//                   const page = i + 1;
//                   if (
//                     totalPages <= 10 ||
//                     page <= 3 ||
//                     page > totalPages - 2 ||
//                     Math.abs(page - currentPage) <= 1
//                   ) {
//                     return (
//                       <button
//                         key={page}
//                         onClick={() => setCurrentPage(page)}
//                         className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
//                           currentPage === page
//                             ? "bg-primary text-primary-foreground"
//                             : "text-muted-foreground hover:text-foreground"
//                         }`}
//                       >
//                         {page}
//                       </button>
//                     );
//                   } else if (page === 4 && currentPage > 5) {
//                     return (
//                       <span key="dots1" className="text-muted-foreground">
//                         ...
//                       </span>
//                     );
//                   } else if (
//                     page === totalPages - 2 &&
//                     currentPage < totalPages - 4
//                   ) {
//                     return (
//                       <span key="dots2" className="text-muted-foreground">
//                         ...
//                       </span>
//                     );
//                   }
//                   return null;
//                 })}
//                 <button
//                   onClick={() =>
//                     setCurrentPage((p) => Math.min(totalPages, p + 1))
//                   }
//                   disabled={currentPage === totalPages}
//                   className="p-2 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-50"
//                 >
//                   ›
//                 </button>
//               </div>
//             )}
//           </div>
//         </main>

//         {/* Create Job Modal */}
//         <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
//           <DialogContent className="sm:max-w-md">
//             <DialogHeader>
//               <DialogTitle>Create New Job</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4 py-4">
//               <div className="space-y-2">
//                 <Label htmlFor="job-name">Job Name</Label>
//                 <Input
//                   id="job-name"
//                   placeholder="Enter job name..."
//                   value={jobName}
//                   onChange={(e) => setJobName(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") handleCreateJob();
//                   }}
//                   autoFocus
//                 />
//               </div>
//             </div>
//             <DialogFooter>
//               <Button
//                 variant="outline"
//                 onClick={() => setIsCreateModalOpen(false)}
//               >
//                 Cancel
//               </Button>
//               <Button onClick={handleCreateJob} disabled={!jobName.trim()}>
//                 Next: Select Datasource
//               </Button>
//             </DialogFooter>
//           </DialogContent>
//         </Dialog>

//         {/* Modals */}
//         <JobViewModal
//           isOpen={isViewModalOpen}
//           onClose={() => setIsViewModalOpen(false)}
//           job={selectedJob}
//         />

//         <JobEditModal
//           isOpen={isEditModalOpen}
//           onClose={() => setIsEditModalOpen(false)}
//           job={selectedJob}
//           onTrainingComplete={(updatedJob) => {
//             setSelectedJob(updatedJob);
//             setIsViewModalOpen(true);
//           }}
//         />

//         {/* Chatbot */}
//         <Chatbot />
//       </div>
//     </div>
//   );
// };

// export default AutoMLJobs1;



import { useState, useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Play,
  Eye,
  Edit,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/layout/Header-main";
import Chatbot from "@/components/chatbot/Chatbot";
import { useJobs } from "@/components/contexts/JobsContext";
import { useAuth } from "@/components/contexts/AuthContext";
import { Job } from "@/components/types/jobs";
import JobViewModal from "@/components/modals/JobViewModal";
import JobEditModal from "@/components/modals/JobEditModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Dataset interfaces ───
interface GlobalDataset {
  id: string;
  jobName: string;
  datasetName: string;
  lastRun: string;
  completedAt: string;
  rows: number;
  columns: number;
  filePath: string;
  isScheduled: boolean;
  job_id?: string;
}

interface JobSpecificDataset {
  filename: string;
  date_modified: string;
}

interface PreviewData {
  columns: string[];
  preview_rows: Record<string, any>[];
  total_rows: number;
  preview_row_count: number;
}

// Map UI feature names to API task names
const featureToTaskMap: Record<string, string> = {
  Classification: "classification",
  Regression: "regression",
  Forecasting: "forecasting",
  Clustering: "clustering",
  "Anomaly Detection": "anomaly_detection",
};

// Map UI model names to API model names
const modelNameToAPI: Record<string, string> = {
  "Logistic Regression": "logistic_regression",
  "Random Forest": "random_forest",
  "Gradient Boosting": "gradient_boosting",
  XGBoost: "xgboost",
  Ridge: "ridge",
  ARIMA: "arima",
  Prophet: "prophet",
  LightGBM: "lightgbm",
  CatBoost: "catboost",
  KMeans: "kmeans",
  "KMeans++": "kmeans++",
  DBSCAN: "dbscan",
  GMM: "gmm",
  "Isolation Forest": "isolation_forest",
  "One-Class SVM": "one_class_svm",
  "Local Outlier Factor (LOF)": "lof",
  "Elliptic Envelope": "elliptic_envelope",
};

// Reverse mapping: API names to UI names
const apiModelToUI: Record<string, string> = {
  logistic_regression: "Logistic Regression",
  random_forest: "Random Forest",
  gradient_boosting: "Gradient Boosting",
  xgboost: "XGBoost",
  ridge: "Ridge",
  arima: "ARIMA",
  prophet: "Prophet",
  lightgbm: "LightGBM",
  catboost: "CatBoost",
  kmeans: "KMeans",
  "kmeans++": "KMeans++",
  dbscan: "DBSCAN",
  gmm: "GMM",
  isolation_forest: "Isolation Forest",
  one_class_svm: "One-Class SVM",
  lof: "Local Outlier Factor (LOF)",
  elliptic_envelope: "Elliptic Envelope",
};

const AutoMLJobs1 = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    jobs,
    loading,
    error,
    totalCount,
    currentPage,
    fetchJobs,
    updateJob,
    setCurrentPage,
  } = useJobs();

  const [statusFilter, setStatusFilter] = useState("completed");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [runningJobId, setRunningJobId] = useState<string | null>(null);
  const [runningMessage, setRunningMessage] = useState<string>("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [jobName, setJobName] = useState("");

  const [globalDatasets, setGlobalDatasets] = useState<GlobalDataset[]>([]);
  const [jobDatasets, setJobDatasets] = useState<JobSpecificDataset[]>([]);
  const [selectedDataset, setSelectedDataset] = useState<
    GlobalDataset | JobSpecificDataset | null
  >(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [dsLoading, setDsLoading] = useState(true);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState<string>("");

  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  const closeToastButton = (
    <button
      onClick={() => toast.dismiss()}
      className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
      aria-label="Close toast"
    >
      ×
    </button>
  );

  useEffect(() => {
    fetchJobs(currentPage);
  }, [currentPage]);

  useEffect(() => {
    if (statusFilter !== "all") {
      setCurrentPage(1);
    }
  }, [statusFilter]);

  // ─── Dataset loading, extracted so it can be called both on mount AND
  // whenever the data platform changes (see handlePlatformChange below). ───
  const loadDatasets = useCallback(async () => {
    setDsLoading(true);

    const userRaw = localStorage.getItem("user");
    if (!userRaw) {
      toast.error("User information not found");
      setDsLoading(false);
      return;
    }

    const userData = JSON.parse(userRaw);
    const userId = userData.user_id || userData.id;

    if (!userId) {
      toast.error("User ID not found");
      setDsLoading(false);
      return;
    }

    let fetchedGlobal: GlobalDataset[] = [];
    const fetchedJob: JobSpecificDataset[] = [];

    // A. Global datasets
    try {
      const res = await fetch(
        `https://api.veriton.ai/api/service2/datasets?user_id=${userId}`,
      );
      if (res.ok) {
        const data = await res.json();
        const mapped = data.map((item: any, idx: number) => ({
          id: String(idx + 1),
          jobName: item.job_name || "Unnamed Job",
          datasetName: item.dataset_name || "Unnamed Dataset",
          createdAt: item.created_at ? new Date(item.created_at) : null,
          lastRun: item.last_run ? new Date(item.last_run) : null,
          rows: item.rows || 0,
          columns: item.columns_count || 0,
          filePath: item.file_path || "",
          isScheduled: item.is_scheduled || false,
          job_id: item.job_id,
        }));
        fetchedGlobal = mapped;
        setGlobalDatasets(mapped);
      }
    } catch (err) {
      console.error("Global datasets fetch failed", err);
    }

    setJobDatasets(fetchedJob);
    setDsLoading(false);

    // Auto-select first dataset directly from fetched local variables
    const allFetched = [...fetchedJob, ...fetchedGlobal];
    if (allFetched.length > 0) {
      handleSelectDataset(allFetched[0]);
    } else {
      setSelectedDataset(null);
      setPreviewData(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadDatasets();
  }, [loadDatasets]);

  // Called by <Header /> the instant the data platform changes — this is
  // what fixes the "only refreshes after a manual page reload" bug, since
  // nothing previously re-ran the fetch effects when the platform changed.
  const handlePlatformChange = useCallback(
    (_platform: string) => {
      loadDatasets();
      fetchJobs(currentPage);
    },
    [loadDatasets, fetchJobs, currentPage],
  );

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => job.status === statusFilter);
  }, [jobs, statusFilter]);

  const formatDate = (date: Date | null) => {
    if (!date) return "—";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const getStatusBadge = (status: Job["status"]) => {
    const styles = {
      completed: "bg-emerald-100 text-emerald-700",
      pending: "bg-amber-100 text-amber-700",
      running: "bg-amber-100 text-amber-700",
      failed: "bg-red-100 text-red-700",
    };

    const labels = {
      completed: "Completed",
      pending: "Running",
      running: "Running",
      failed: "Failed",
    };

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const handleRun = async (job: Job) => {
    console.log("Job config:", {
      category: job.category,
      features: job.features,
      target: job.target,
      datasetName: job.datasetName,
    });

    if (!job.category && !job.feature) {
      alert("Job is missing task type (category). Please edit the job first.");
      return;
    }

    if (!job.datasetName) {
      alert("Job is missing dataset. Please edit the job first.");
      return;
    }

    setRunningJobId(job.id);
    setRunningMessage("Preparing job...");

    try {
      const userDataString = localStorage.getItem("aivolve_user");
      if (!userDataString) throw new Error("User not found");

      const userData = JSON.parse(userDataString);
      const userEmail = userData.email;

      if (!userEmail) throw new Error("User email missing");

      // STEP 1: GET TARGET
      let targetColumn = job.target;

      if (!targetColumn) {
        setRunningMessage("Fetching target column...");

        const modelId = job.id;

        const metricsUrl = `https://api.veriton.ai/api/service3/model_detailed_metrics/${modelId}?user_email=${encodeURIComponent(
          userEmail,
        )}`;

        const metricsResponse = await fetch(metricsUrl, {
          method: "GET",
          headers: { accept: "application/json" },
        });

        if (!metricsResponse.ok) {
          throw new Error(
            `Failed to fetch model details: ${metricsResponse.status}`,
          );
        }

        const metricsData = await metricsResponse.json();

        targetColumn = metricsData.target;

        if (!targetColumn) {
          throw new Error("Target not found in model details");
        }

        console.log("Target fetched:", targetColumn);
      }

      if (targetColumn) {
        updateJob(job.id, {
          ...job,
          target: targetColumn,
        });
      }

      // STEP 2: CALL TRAINING API
      setRunningMessage("Starting training...");

      const params = new URLSearchParams();

      params.append("file_path", job.veriton_file_path);
      params.append("upload_file_path", "false");
      params.append("user_email", userEmail);

      params.append(
        "task",
        featureToTaskMap[job.category] || job.category?.toLowerCase(),
      );

      params.append("target", targetColumn);

      const apiModelName = job.model
        ? modelNameToAPI[job.model] ||
          job.model.toLowerCase().replace(/\s+/g, "_")
        : "";

      params.append("models", apiModelName);

      params.append("metric", "");
      params.append("preprocessing_mode", "simple");
      params.append("use_cleaning", "true");
      params.append("use_feature_selection", "true");
      params.append("use_optuna", "true");
      params.append("optuna_trials", "2");
      params.append("time_budget", "180");
      params.append("test_size", "0.2");
      params.append("horizon", "12");

      const buildResponse = await fetch(
        "https://api.veriton.ai/api/service3/build_ml_model_v",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json",
          },
          body: params.toString(),
        },
      );

      if (!buildResponse.ok) {
        const errorData = await buildResponse.json().catch(() => ({}));
        throw new Error(
          errorData.detail || `API failed: ${buildResponse.status}`,
        );
      }

      const startResult = await buildResponse.json();

      console.log("Training started:", startResult);

      const trainingJobId = startResult.job_id;

      // STEP 3: POLLING
      const pollInterval = setInterval(async () => {
        try {
          const res = await fetch(
            `https://api.veriton.ai/api/service3/training-status/${trainingJobId}?user_email=${encodeURIComponent(
              userEmail,
            )}`,
          );

          if (!res.ok) return;

          const result = await res.json();

          console.log("Training status:", result);

          if (result.status === "success") {
            clearInterval(pollInterval);

            const uiModelName =
              apiModelToUI[result.best_model?.toLowerCase()] ||
              result.best_model;

            updateJob(job.id, {
              ...job,
              id: result.model_id,
              model: uiModelName,
              target: targetColumn,
              status: "completed",
              task_type: result.task_type,
              testAccuracy: result.primary_score?.toString(),
              lastRun: job.lastRun || new Date(),
              createdAt: job.createdAt || new Date(),
              datasetName: job.datasetName,
              veriton_file_path: job.veriton_file_path,
            });

            setRunningMessage("Training complete! Opening results...");

            setTimeout(() => {
              setSelectedJob({
                ...job,
                id: result.model_id,
                model: uiModelName,
                target: targetColumn,
                status: "completed",
                lastRun: new Date(),
              });

              setIsViewModalOpen(true);
            }, 500);

            setRunningJobId(null);
            setRunningMessage("");
          }

          if (result.status === "failed") {
            clearInterval(pollInterval);

            updateJob(job.id, {
              ...job,
              status: "failed",
            });

            const cleanError = result?.error?.includes(
              "No models were successfully trained",
            )
              ? "Training failed: No models could be trained. Try changing dataset or features."
              : result.message || result.error || "Training failed";

            alert(cleanError);

            setRunningJobId(null);
            setRunningMessage("");
          }
        } catch (err) {
          console.error("Polling error:", err);
        }
      }, 10000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to train model";

      alert(`Error: ${errorMessage}`);
      console.error("Error training model:", err);

      setRunningJobId(null);
      setRunningMessage("");
    }
  };

  const handleSelectDataset = async (
    ds: GlobalDataset | JobSpecificDataset,
  ) => {
    setSelectedDataset(ds);
    setPreviewData(null);
    setPreviewLoading(true);

    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const userId = user?.user_id || user?.id;

    if (!userId) {
      toast.error("User ID not found");
      setPreviewLoading(false);
      return;
    }

    let jobId: string | undefined;
    let datasetName: string;

    if ("job_id" in ds && ds.job_id) {
      jobId = ds.job_id;
      datasetName = ds.datasetName;
    } else if ("filename" in ds) {
      jobId = localStorage.getItem("current_job_id") || undefined;
      datasetName = ds.filename;
    }

    if (!jobId) {
      toast.error("Cannot preview: no job ID associated with this dataset");
      setPreviewLoading(false);
      return;
    }

    try {
      const url = `https://api.veriton.ai/api/service2/preview-dataset?user_id=${userId}&job_id=${jobId}&datasetname=${encodeURIComponent(datasetName)}`;

      const res = await fetch(url);
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        throw new Error(`Preview failed (${res.status}): ${errText}`);
      }

      const data = await res.json();
      setPreviewData(data);
      const filePath = `Files/Datasets/${data.user_id}/${data.job_id}/${data.dataset}.csv`;
      setSelectedFilePath(filePath);
    } catch (err: any) {
      console.error("Preview error:", err);
      toast.error(err.message || "Failed to load dataset preview");
    } finally {
      setPreviewLoading(false);
    }
  };

  const startWorkflow = async (mode: "build" | "compare") => {
    if (!selectedDataset) return;

    const userRaw = localStorage.getItem("user");
    const user = userRaw ? JSON.parse(userRaw) : null;
    const userId = user?.user_id || user?.id;

    let jobId: string | undefined;
    let filename: string;

    if ("job_id" in selectedDataset && selectedDataset.job_id) {
      jobId = selectedDataset.job_id;
      filename = selectedDataset.datasetName;
    } else if ("filename" in selectedDataset) {
      jobId = localStorage.getItem("current_job_id") || undefined;
      filename = selectedDataset.filename;
    }

    if (!userId || !jobId || !filename) {
      toast.error("Cannot start: missing job ID or filename");
      return;
    }

    try {
      navigate(
        mode === "compare"
          ? "/workflow/automl/compare"
          : "/workflow/automl/build-model",
        {
          state: {
            filePath: selectedFilePath,
            datasetName: filename,
            origin: "jobs1",
            mode: mode === "compare" ? "compare" : undefined,
          },
        },
      );
    } catch (err: any) {
      toast.error(`Preparation failed for "${filename}": ${err.message}`);
    }
  };

  const handleView = (job: Job) => {
    setSelectedJob({
      ...job,
      error_message: (job as any).error_message || null,
    });
    setIsViewModalOpen(true);
  };

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setIsEditModalOpen(true);
  };

  const handleCreateJob = () => {
    if (jobName.trim()) {
      navigate("/workflow/automl/select-dataset", {
        state: { jobName: jobName.trim(), initialTab: "data-source" },
      });
      setIsCreateModalOpen(false);
      setJobName("");
    }
  };

  const handleRefresh = async () => {
    await fetchJobs(currentPage);
  };

  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
      <Header onDataPlatformChange={handlePlatformChange} />

      <div className="flex-1 overflow-hidden">
        <main className="h-full overflow-auto px-6 py-6">
          <div className="max-w-7xl mx-auto w-full">
            {/* ================= AutoML Intro ================= */}
            <div className="mb-10 flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  AutoML Workspace
                </h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">
                  Build, compare, and test machine learning models automatically
                  using your datasets. Manage all trained models below.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() =>
                    navigate("/workflow/automl/test", {
                      state: {
                        initialTab: "test",
                        origin: "jobs1",
                      },
                    })
                  }
                >
                  Test Model
                </Button>
              </div>
            </div>

            {/* ================= DATASET SECTION ================= */}
            <div className="bg-card border border-border rounded-xl shadow-sm mb-10 h-[480px] flex flex-col shrink-0">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold">Select Dataset</h2>
              </div>

              <div className="flex flex-1 overflow-hidden">
                {/* Sidebar – Datasets List */}
                <div className="w-[300px] border-r bg-muted/20">
                  <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted-foreground/50 scrollbar-track-transparent">
                    {dsLoading ? (
                      <div className="p-6 text-sm text-muted-foreground">
                        Loading datasets...
                      </div>
                    ) : globalDatasets.length === 0 &&
                      jobDatasets.length === 0 ? (
                      <div className="p-6 text-sm text-muted-foreground">
                        No datasets available
                      </div>
                    ) : (
                      [...jobDatasets, ...globalDatasets].map((ds) => {
                        const isGlobal = "datasetName" in ds;
                        const name = isGlobal ? ds.datasetName : ds.filename;

                        const rows = isGlobal ? ds.rows : null;
                        const columns = isGlobal ? ds.columns : null;
                        const dateInfo = isGlobal
                          ? ds.lastRun
                          : ds.date_modified;

                        const isSelected =
                          selectedDataset &&
                          ((isGlobal &&
                            "datasetName" in selectedDataset &&
                            selectedDataset.datasetName === name) ||
                            (!isGlobal &&
                              "filename" in selectedDataset &&
                              selectedDataset.filename === name));

                        return (
                          <button
                            key={`${isGlobal ? "g" : "j"}-${name}`}
                            onClick={() => handleSelectDataset(ds)}
                            className={cn(
                              "w-full text-left px-5 py-4 border-l-2 transition-all duration-200",
                              isSelected
                                ? "border-primary bg-background"
                                : "border-transparent hover:bg-background/60",
                            )}
                          >
                            <div className="font-medium text-sm truncate">
                              {name}
                            </div>

                            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-2">
                              {rows != null && (
                                <>
                                  {rows} rows<span className="mx-1">•</span>
                                </>
                              )}
                              {columns != null && (
                                <>
                                  {columns} columns
                                  <span className="mx-1">•</span>
                                </>
                              )}
                              {dateInfo && (
                                <span>
                                  {isGlobal ? "Last run: " : "Modified: "}
                                  {dateInfo}
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Preview Panel */}
                <div className="flex-1 bg-background overflow-hidden flex flex-col min-h-0">
                  {selectedDataset ? (
                    <div className="h-full flex flex-col">
                      <div className="px-6 py-4 border-b flex items-center justify-between bg-background">
                        <div>
                          <h3 className="font-semibold">
                            {"datasetName" in selectedDataset
                              ? selectedDataset.datasetName
                              : "filename" in selectedDataset
                                ? selectedDataset.filename
                                : "Unnamed Dataset"}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            Dataset Preview •{" "}
                            {previewData
                              ? `${previewData.preview_row_count} / ${previewData.total_rows} rows shown`
                              : ""}
                          </p>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => startWorkflow("build")}
                            disabled={!previewData || previewLoading}
                          >
                            Build Model
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startWorkflow("compare")}
                            disabled={!previewData || previewLoading}
                          >
                            Compare
                          </Button>
                        </div>
                      </div>

                      <div className="flex-1 min-h-0 min-w-0 overflow-auto relative">
                        {previewData && previewData.columns.length > 6 && (
                          <div className="sticky top-0 left-0 right-0 z-20 px-4 py-1.5 text-xs text-muted-foreground bg-background/90 border-b backdrop-blur-sm">
                            Scroll horizontally →
                          </div>
                        )}

                        {previewLoading ? (
                          <div className="flex justify-center items-center h-full text-muted-foreground">
                            Loading preview...
                          </div>
                        ) : previewData &&
                          previewData.preview_rows?.length > 0 ? (
                          <div className="inline-block min-w-max">
                            <table className="min-w-max w-full border-collapse table-auto">
                              <thead className="bg-muted/30">
                                <tr>
                                  {previewData.columns.map((col) => (
                                    <th
                                      key={col}
                                      className="px-5 py-3 text-left text-sm font-medium border-b whitespace-nowrap"
                                    >
                                      {col}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              <tbody>
                                {previewData.preview_rows.map((row, index) => (
                                  <tr
                                    key={index}
                                    className="hover:bg-muted/50 transition-colors even:bg-muted/10"
                                  >
                                    {previewData.columns.map((col) => (
                                      <td
                                        key={col}
                                        className="px-5 py-3 text-sm border-b whitespace-nowrap"
                                      >
                                        {row[col] ?? "—"}
                                      </td>
                                    ))}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="flex justify-center items-center h-full text-muted-foreground">
                            No preview rows available
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center h-full text-muted-foreground italic">
                      Select a dataset to preview
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Header */}
            <div className="flex items-start justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-1">
                  Trained Models
                </h1>
              </div>
              <div className="flex items-center gap-3"></div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
                <p className="text-red-700 text-sm">{error}</p>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  Try Again
                </Button>
              </div>
            )}

            {/* Running Job Status */}
            {runningJobId && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-3">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                <div>
                  <p className="text-blue-800 font-medium text-sm">
                    Training in progress...
                  </p>
                  <p className="text-blue-600 text-xs mt-0.5">
                    {runningMessage}
                  </p>
                </div>
              </div>
            )}

            {/* Filters Row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-1 bg-muted/50 rounded-full p-1">
                {["completed", "failed"].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                      statusFilter === status
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {status === "all"
                      ? "All"
                      : status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Jobs Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Job
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Category
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Model
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Created At
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Last Run
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-muted-foreground">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-medium text-primary">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                            <span className="text-muted-foreground">
                              Loading jobs...
                            </span>
                          </div>
                        </td>
                      </tr>
                    ) : jobs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <h3 className="text-lg font-semibold mb-2">
                            No models created yet
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Start by building your first AutoML model.
                          </p>
                        </td>
                      </tr>
                    ) : filteredJobs.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-16 text-center">
                          <h3 className="text-lg font-semibold mb-2">
                            No {statusFilter} models found
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            There are no models with status "{statusFilter}".
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredJobs.map((job, index) => {
                        const jobNumber =
                          (currentPage - 1) * itemsPerPage + index + 1;
                        return (
                          <motion.tr
                            key={job.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className="border-b border-border/50 hover:bg-muted/20"
                          >
                            <td className="px-6 py-4 font-medium text-foreground">
                              Job_{jobNumber}
                            </td>
                            <td className="px-6 py-4 text-primary">
                              {job.category || "Unknown"}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {job.model}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {formatDate(job.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                              {formatDate(job.lastRun)}
                            </td>
                            <td className="px-6 py-4">
                              {getStatusBadge(job.status)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {job.status !== "failed" && (
                                  <button
                                    onClick={() => handleRun(job)}
                                    disabled={runningJobId === job.id}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    title="Run job"
                                  >
                                    {runningJobId === job.id ? (
                                      <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                      <Play className="w-5 h-5" />
                                    )}
                                  </button>
                                )}

                                <button
                                  onClick={() => handleView(job)}
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                  title="View details"
                                >
                                  <Eye className="w-5 h-5" />
                                </button>

                                {job.status !== "failed" && (
                                  <button
                                    onClick={() => handleEdit(job)}
                                    className="text-muted-foreground hover:text-foreground transition-colors"
                                    title="Edit job"
                                  >
                                    <Edit className="w-5 h-5" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

            {/* Pagination */}
            {statusFilter === "completed" && totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  ‹
                </button>
                {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => {
                  const page = i + 1;
                  if (
                    totalPages <= 10 ||
                    page <= 3 ||
                    page > totalPages - 2 ||
                    Math.abs(page - currentPage) <= 1
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-full text-sm font-medium transition-colors ${
                          currentPage === page
                            ? "bg-primary text-primary-foreground"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === 4 && currentPage > 5) {
                    return (
                      <span key="dots1" className="text-muted-foreground">
                        ...
                      </span>
                    );
                  } else if (
                    page === totalPages - 2 &&
                    currentPage < totalPages - 4
                  ) {
                    return (
                      <span key="dots2" className="text-muted-foreground">
                        ...
                      </span>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg text-muted-foreground hover:text-foreground disabled:opacity-50"
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </main>

        {/* Create Job Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="job-name">Job Name</Label>
                <Input
                  id="job-name"
                  placeholder="Enter job name..."
                  value={jobName}
                  onChange={(e) => setJobName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleCreateJob();
                  }}
                  autoFocus
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateJob} disabled={!jobName.trim()}>
                Next: Select Datasource
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modals */}
        <JobViewModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          job={selectedJob}
        />

        <JobEditModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          job={selectedJob}
          onTrainingComplete={(updatedJob) => {
            setSelectedJob(updatedJob);
            setIsViewModalOpen(true);
          }}
        />

        {/* Chatbot */}
        <Chatbot />
      </div>
    </div>
  );
};

export default AutoMLJobs1;