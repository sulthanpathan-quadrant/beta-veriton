// import { useState, useMemo, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { ArrowLeft, ChevronDown, GitCompare } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// // import { ImportedDataset } from '@/components/modals/UnifiedImportModal'
// import { ImportedDataset } from "../modals/UnifiedImportModal";
// import { useLocation } from "react-router-dom";
// import Header from "../layout/Header";
// import { toast } from "sonner";
// import Header1 from "../layout/Header1";

// interface CompareTabProps {
//   dataset?: ImportedDataset | null;
// }

// type MetricSpec = { key: string; label: string; isLowerBetter?: boolean };

// const modelsByTask: Record<string, string[]> = {
//   Classification: [
//     "Logistic Regression",
//     "Random Forest",
//     "Gradient Boosting",
//     "XGBoost",
//   ],
//   Regression: ["Ridge", "Random Forest", "Gradient Boosting", "XGBoost"],
//   Forecasting: ["ARIMA", "Prophet", "XGBoost", "LightGBM", "CatBoost"],
//   Clustering: ["KMeans", "KMeans++", "DBSCAN", "GMM"],
//   "Anomaly Detection": [
//     "Isolation Forest",
//     "One-Class SVM",
//     "Local Outlier Factor (LOF)",
//     "Elliptic Envelope",
//   ],
//   Multi_Step_Forecasting: ["XGBoost", "CatBoost", "LightGBM"],
// };

// const metricsByTask: Record<string, MetricSpec[]> = {
//   Classification: [
//     { key: "accuracy", label: "Accuracy" },
//     { key: "f1", label: "F1 Score" },
//     { key: "precision", label: "Precision" },
//     { key: "recall", label: "Recall" },
//     { key: "roc_auc", label: "ROC-AUC" },
//     { key: "precision_recall_auc", label: "PR-AUC" },
//   ],
//   Regression: [
//     { key: "rmse", label: "RMSE", isLowerBetter: true },
//     { key: "mae", label: "MAE", isLowerBetter: true },
//     { key: "r2", label: "R²" },
//     { key: "mape", label: "MAPE", isLowerBetter: true },
//     { key: "mean_residual", label: "Mean Residual", isLowerBetter: true },
//     { key: "std_residual", label: "Std Residual", isLowerBetter: true },
//     { key: "pred_mean", label: "Pred Mean" },
//     { key: "pred_std", label: "Pred Std" },
//   ],
//   Forecasting: [
//     { key: "rmse", label: "RMSE", isLowerBetter: true },
//     { key: "mae", label: "MAE", isLowerBetter: true },
//     { key: "r2", label: "R²" },
//     { key: "mape", label: "MAPE", isLowerBetter: true },
//     { key: "mse", label: "MSE", isLowerBetter: true },
//     { key: "mean_residual", label: "Mean Residual", isLowerBetter: true },
//     { key: "std_residual", label: "Std Residual", isLowerBetter: true },
//     { key: "pred_mean", label: "Pred Mean" },
//     { key: "pred_std", label: "Pred Std" },
//   ],
//   Clustering: [
//     { key: "n_clusters", label: "Number of Clusters" },
//     { key: "n_noise_points", label: "Noise Points" },
//     { key: "silhouette_score", label: "Silhouette Score" },
//     {
//       key: "davies_bouldin_score",
//       label: "Davies-Bouldin",
//       isLowerBetter: true,
//     },
//     { key: "calinski_harabasz", label: "Calinski-Harabasz" },
//   ],
//   "Anomaly Detection": [
//     { key: "n_anomalies", label: "Number of Anomalies" },
//     { key: "anomaly_percentage", label: "Anomaly Percentage (%)" },
//     { key: "anomaly_score", label: "Anomaly Score" },
//     { key: "avg_anomaly_score", label: "Avg Anomaly Score" },
//     { key: "std_anomaly_score", label: "Std Anomaly Score" },
//     { key: "min_anomaly_score", label: "Min Anomaly Score" },
//     { key: "max_anomaly_score", label: "Max Anomaly Score" },
//   ],
//   Multi_Step_Forecasting: [
//     { key: "avg_rmse", label: "Avg RMSE", isLowerBetter: true },
//     { key: "avg_mae", label: "Avg MAE", isLowerBetter: true },
//     { key: "avg_r2", label: "Avg R²" },
//     { key: "avg_mape", label: "Avg MAPE", isLowerBetter: true },
//   ],
// };

// // Best-effort mapping from human model name -> API key (extendable)
// function modelNameToApiKey(name: string) {
//   if (!name) return name;
//   const mapping: Record<string, string> = {
//     "Logistic Regression": "logistic_regression",
//     "Random Forest": "random_forest",
//     "Gradient Boosting": "gradient_boosting",
//     XGBoost: "xgboost",
//     Ridge: "ridge",
//     ARIMA: "arima",
//     Prophet: "prophet",
//     LightGBM: "lightgbm",
//     CatBoost: "catboost",
//     KMeans: "kmeans",
//     "KMeans++": "kmeans_plusplus",
//     DBSCAN: "dbscan",
//     GMM: "gmm",
//     "Isolation Forest": "isolation_forest",
//     "One-Class SVM": "one_class_svm",
//     "Local Outlier Factor (LOF)": "lof",
//     "Elliptic Envelope": "elliptic_envelope",
//   };
//   if (mapping[name]) return mapping[name];
//   return name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
// }

// // Generates mock values appropriate for given task + metric

// const TRAINING_STATUS_API =
//   "https://api.veriton.ai/api/service3/training-status";

// const CompareTab = ({}: CompareTabProps) => {
//   const navigate = useNavigate();
//   const [selectedTask, setSelectedTask] = useState(""); // previously selectedFunction
//   const [selectedModel1, setSelectedModel1] = useState("");
//   const [selectedModel2, setSelectedModel2] = useState("");
//   const [selectedFeature, setSelectedFeature] = useState<"all" | string>("all");
//   const [isComparing, setIsComparing] = useState(false);
//   const [comparisonComplete, setComparisonComplete] = useState(false);
//   const [model1Metrics, setModel1Metrics] = useState<Record<
//     string,
//     any
//   > | null>(null);
//   const [model2Metrics, setModel2Metrics] = useState<Record<
//     string,
//     any
//   > | null>(null);
//   const [apiResponseRaw, setApiResponseRaw] = useState<any | null>(null);
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);
//   const [blobPath, setBlobPath] = useState<string | null>(null);
//   const location = useLocation();
//   const [allTaskFeatures, setAllTaskFeatures] = useState<any>(null);
//   const [blobPathReady, setBlobPathReady] = useState(false);
//   const filePath = (location.state as any)?.filePath || "";
//   const registerAbortRef = useRef<AbortController | null>(null);
//   const datasetName = (location.state as any)?.datasetName || "";
//   const cameFromJobs1 = location.state?.origin === "jobs1";
//   const cameFromHub = location.state?.origin === "automlhub";
//   const [jobId, setJobId] = useState<string | null>(null);
//   const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
//   const pollingRef = useRef(false);
//   const trainingToastRef = useRef<string | number | null>(null);
//   const [analysisMetadata, setAnalysisMetadata] = useState<any>(null);
//   const [needsTransformation, setNeedsTransformation] = useState(false);
//   const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
//   const [selectedMeasures, setSelectedMeasures] = useState<string[]>([]);
//   const [yearColumn, setYearColumn] = useState("");
//   const [horizon, setHorizon] = useState(12);
//   const featureToastRef = useRef<string | number | null>(null);

//   const dimensions = analysisMetadata?.dataset_structure?.dimensions || [];

//   const measures = analysisMetadata?.dataset_structure?.measures || [];

//   const [showDimensions, setShowDimensions] = useState(false);
//   const [showMeasures, setShowMeasures] = useState(false);
//   const [hasConfigChanged, setHasConfigChanged] = useState(true);

//   useEffect(() => {
//     if (!filePath) return;

//     const registerFile = async () => {
//       const userEmail = getUserEmailFromLocal();

//       if (!userEmail) return;

//       try {
//         // ✅ Create AbortController
//         registerAbortRef.current = new AbortController();

//         const params = new URLSearchParams();

//         params.append("file_path", filePath);
//         params.append("upload_file_path", "true");
//         params.append("user_email", userEmail);
//         params.append("optuna_trials", "2");
//         params.append("preprocessing_mode", "simple");
//         params.append("use_cleaning", "true");
//         params.append("use_optuna", "true");
//         params.append("test_size", "0.2");
//         params.append("time_budget", "180");
//         params.append("horizon", "12");

//         featureToastRef.current = toast.loading(
//   "Fetching dataset features..."
// );

//         const res = await fetch(
//           "https://api.veriton.ai/api/service3/build_ml_model_v",
//           {
//             method: "POST",

//             headers: {
//               "Content-Type": "application/x-www-form-urlencoded",
//               accept: "application/json",
//             },

//             body: params.toString(),

//             // ✅ attach signal
//             signal: registerAbortRef.current.signal,
//           },
//         );

//         if (!res.ok) throw new Error(`Registration failed: ${res.status}`);

//         const json = await res.json();

//         setBlobPath(json.blob_path);

//         if (json.analysis_metadata) {
//           setAnalysisMetadata(json.analysis_metadata); // ✅ MISSING

//           const needsTransform =
//             json.analysis_metadata?.dataset_structure?.needs_transformation ||
//             false;

//           setNeedsTransformation(needsTransform); // ✅ MISSING

//           if (needsTransform) {
//             setSelectedTask("Multi_Step_Forecasting");
//           }
//         }
//         if (json.features?.tasks) {
//           setAllTaskFeatures(json.features.tasks);
//         }

//         setBlobPathReady(true);
//         if (featureToastRef.current) {
//   toast.success("Features fetched successfully!", {
//     id: featureToastRef.current,
//     duration: 3000,
//   });

//         }
//       } catch (err: any) {
//         // ✅ IMPORTANT: ignore abort error
//         if (err.name === "AbortError") {
//           console.log("Registration API aborted");

//           return;
//         }

//         console.error("File registration error:", err);
//       }
//     };

//     registerFile();

//     // ✅ cleanup when leaving page
//     return () => {
//       if (registerAbortRef.current) {
//         registerAbortRef.current.abort();
//       }
//       toast.dismiss();
//     };
//   }, [filePath]);

//   useEffect(() => {
//     const handleClickOutside = () => {
//       setShowDimensions(false);
//       setShowMeasures(false);
//     };

//     window.addEventListener("click", handleClickOutside);

//     return () => {
//       window.removeEventListener("click", handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     if (isComparing) return;

//     setHasConfigChanged(true); // ✅ unlock when user changes anything
//   }, [
//     selectedModel1,
//     selectedModel2,
//     selectedDimensions,
//     selectedMeasures,
//     selectedTask,
//   ]);

//   // Reset models & results when task changes
//   useEffect(() => {
//     setSelectedModel1("");
//     setSelectedModel2("");
//     setComparisonComplete(false);
//     setModel1Metrics(null);
//     setModel2Metrics(null);
//     setApiResponseRaw(null);
//     setErrorMessage(null);
//     setSelectedFeature("all");
//   }, [selectedTask]);

//   useEffect(() => {
//     return () => {
//       if (pollIntervalRef.current) {
//         clearInterval(pollIntervalRef.current);
//       }
//     };
//   }, []);

//   const availableModels = useMemo(() => {
//     return selectedTask ? modelsByTask[selectedTask] || [] : [];
//   }, [selectedTask]);

//   const taskSpecificFeatures = useMemo(() => {
//     if (!allTaskFeatures || !selectedTask) return [];
//     const taskKey = selectedTask.toLowerCase().replace(/\s+/g, "_");
//     return allTaskFeatures[taskKey]?.features || [];
//   }, [allTaskFeatures, selectedTask]);

//   const getUserEmailFromLocal = (): string | null => {
//     try {
//       const raw = localStorage.getItem("aivolve_user");
//       if (!raw) return null;
//       const parsed = JSON.parse(raw);
//       return parsed?.email ?? null;
//     } catch {
//       return null;
//     }
//   };

//   const canCompare = useMemo(() => {
//     if (!selectedTask || !selectedModel1 || !selectedModel2) return false;

//     if (selectedModel1 === selectedModel2) return false;

//     if (needsTransformation) {
//       return selectedDimensions.length > 0 && selectedMeasures.length > 0;
//     }

//     return true;
//   }, [
//     selectedTask,
//     selectedModel1,
//     selectedModel2,
//     selectedDimensions,
//     selectedMeasures,
//     needsTransformation,
//   ]);

//   const fetchAndCompare = async () => {
//     setErrorMessage(null);
//     setIsComparing(true);
//     setComparisonComplete(false);
//     setModel1Metrics(null);
//     setModel2Metrics(null);
//     setApiResponseRaw(null);
//     setHasConfigChanged(false); // 🔒 lock after clicking compare
//     let startedPolling = false;

//     const userEmail = getUserEmailFromLocal();
//     if (!userEmail) {
//       setErrorMessage("User email not found. Please login again.");
//       setIsComparing(false);
//       return;
//     }

//     if (!blobPath) {
//       setErrorMessage(
//         "Dataset not ready. Please wait or go back and try again.",
//       );
//       setIsComparing(false);
//       return;
//     }

//     if (needsTransformation) {
//       if (selectedDimensions.length === 0) {
//         setErrorMessage("Please select at least one dimension");
//         setIsComparing(false);
//         return;
//       }

//       if (selectedMeasures.length === 0) {
//         setErrorMessage("Please select at least one measure");
//         setIsComparing(false);
//         return;
//       }
//     }

//     try {
//       const params = new URLSearchParams();
//       params.append("file_path", filePath);
//       params.append("upload_file_path", "false");
//       params.append("user_email", userEmail);
//       if (needsTransformation) {
//         params.append("task", "multistep_forecasting");
//         params.append("target", "target");

//         const transformConfig = {
//           group_by: selectedDimensions,
//           measures: selectedMeasures,
//           year_column: yearColumn,
//           horizon: horizon,
//           needs_transformation: true,
//         };

//         params.append("transformation_config", JSON.stringify(transformConfig));
//       } else {
//         params.append(
//           "task",
//           selectedTask === "Multi_Step_Forecasting"
//             ? "multistep_forecasting"
//             : selectedTask.toLowerCase().replace(/\s+/g, "_"),
//         );

//         params.append(
//           "target",
//           selectedFeature === "all" ? "" : selectedFeature,
//         );
//       }
//       const model1Key = modelNameToApiKey(selectedModel1);
//       const model2Key = modelNameToApiKey(selectedModel2);
//       params.append("models", `${model1Key} , ${model2Key}`);
//       params.append("optuna_trials", "2");
//       params.append("preprocessing_mode", "simple");
//       params.append("use_cleaning", "true");
//       params.append("use_optuna", "true");
//       params.append("use_feature_selection", "false");
//       params.append("test_size", "0.2");
//       params.append("time_budget", "300");
//       params.append("horizon", "12");

//       const res = await fetch(
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

//       if (!res.ok) {
//         const txt = await res.text();
//         throw new Error(`API error ${res.status}: ${txt}`);
//       }

//       const json = await res.json();
//       if (json.status === "model has started running") {
//         const jobId = json.job_id;

//         setJobId(jobId);
//         setIsComparing(true);

//         startedPolling = true; // ✅ IMPORTANT

//         trainingToastRef.current = toast.loading(
//           "Model comparison started. This may take a few minutes...",
//         );

//         pollTrainingStatus(jobId);

//         return;
//       }
//       setApiResponseRaw(json);

//       const allModels = json?.all_models ?? {};

//       const findKey = (k: string | null) => {
//         if (!k) return null;
//         if (allModels[k]) return k;
//         const lower = k.toLowerCase();
//         const candidate = Object.keys(allModels).find(
//           (c) => c.toLowerCase() === lower,
//         );
//         if (candidate) return candidate;
//         const candidate2 = Object.keys(allModels).find((c) =>
//           c.toLowerCase().includes(lower),
//         );
//         if (candidate2) return candidate2;
//         return null;
//       };

//       const real1 = findKey(modelNameToApiKey(selectedModel1));
//       const real2 = findKey(modelNameToApiKey(selectedModel2));

//       const pickMetrics = (obj: any) => {
//         if (!obj) return null;
//         return { train: obj.train ?? null, test: obj.test ?? null };
//       };

//       setModel1Metrics(real1 ? pickMetrics(allModels[real1]) : null);
//       setModel2Metrics(real2 ? pickMetrics(allModels[real2]) : null);
//       setComparisonComplete(true);
//     } catch (err: any) {
//       console.error("Compare API error", err);
//       setErrorMessage(err?.message || "Error calling compare API.");
//     } finally {
//       if (!startedPolling) {
//         setIsComparing(false); // ✅ only reset if NOT polling
//       }
//     }
//   };

//   const pollTrainingStatus = async (jobId: string) => {
//     setHasConfigChanged(false); // 🔒 keep disabled after results
//     const userEmail = getUserEmailFromLocal();
//     if (!userEmail) return;

//     if (pollingRef.current) return;
//     pollingRef.current = true;

//     try {
//       while (true) {
//         const res = await fetch(
//           `${TRAINING_STATUS_API}/${jobId}?user_email=${encodeURIComponent(userEmail)}`,
//           {
//             method: "GET",
//             headers: { accept: "application/json" },
//           },
//         );

//         if (!res.ok) {
//           throw new Error("Failed to fetch training status");
//         }

//         const json = await res.json();

//         if (json.status === "success") {
//           pollingRef.current = false;
//           setIsComparing(false);

//           if (trainingToastRef.current) {
//             toast.success("Model comparison completed!", {
//               id: trainingToastRef.current,
//               duration: 3000,
//             });
//           }

//           const allModels = json.all_models ?? {};

//           const findKey = (k: string | null) => {
//             if (!k) return null;
//             if (allModels[k]) return k;

//             const lower = k.toLowerCase();
//             const candidate = Object.keys(allModels).find(
//               (c) => c.toLowerCase() === lower,
//             );

//             if (candidate) return candidate;

//             const candidate2 = Object.keys(allModels).find((c) =>
//               c.toLowerCase().includes(lower),
//             );

//             if (candidate2) return candidate2;

//             return null;
//           };

//           const real1 = findKey(modelNameToApiKey(selectedModel1));
//           const real2 = findKey(modelNameToApiKey(selectedModel2));

//           const pickMetrics = (obj: any) => {
//             if (!obj) return null;
//             return { train: obj.train ?? null, test: obj.test ?? null };
//           };

//           setModel1Metrics(real1 ? pickMetrics(allModels[real1]) : null);
//           setModel2Metrics(real2 ? pickMetrics(allModels[real2]) : null);

//           setComparisonComplete(true);

//           break;
//         }

//         await new Promise((resolve) => setTimeout(resolve, 30000));
//       }
//     } catch (err) {
//       console.error("Polling error:", err);
//       pollingRef.current = false;
//       setIsComparing(false);
//     }
//   };
//   // compare two metric values based on whether lower is better
//   const compareMetric = (
//     key: string,
//     a: any,
//     b: any,
//     isLowerBetter = false,
//   ) => {
//     if (a == null && b == null) return { aClass: "", bClass: "" };
//     // parse percent strings and numeric strings
//     const toNum = (v: any) => {
//       if (v == null) return NaN;
//       if (typeof v === "string" && v.includes("%"))
//         return parseFloat(v.replace("%", ""));
//       return parseFloat(String(v));
//     };
//     const na = toNum(a);
//     const nb = toNum(b);
//     if (isNaN(na) || isNaN(nb)) return { aClass: "", bClass: "" };
//     if (isLowerBetter) {
//       if (na < nb)
//         return {
//           aClass: "text-success font-semibold",
//           bClass: "text-muted-foreground",
//         };
//       if (nb < na)
//         return {
//           aClass: "text-muted-foreground",
//           bClass: "text-success font-semibold",
//         };
//     } else {
//       if (na > nb)
//         return {
//           aClass: "text-success font-semibold",
//           bClass: "text-muted-foreground",
//         };
//       if (nb > na)
//         return {
//           aClass: "text-muted-foreground",
//           bClass: "text-success font-semibold",
//         };
//     }
//     return { aClass: "text-foreground", bClass: "text-foreground" };
//   };

//   const renderMetricValue = (v: any) => {
//     if (v == null) return "—";

//     // If it's a string with %, return as is
//     if (typeof v === "string" && v.includes("%")) {
//       return v;
//     }

//     // Convert to number and check if it's valid
//     const num = typeof v === "number" ? v : parseFloat(String(v));

//     // If it's a valid number, format to 5 decimal places
//     if (!isNaN(num)) {
//       return num.toFixed(5);
//     }

//     // Otherwise return as string
//     return String(v);
//   };

//   return (
//     <div className="min-h-screen bg-background">
//       {cameFromJobs1 ? <Header1 /> : <Header />}

//       <main className="pt-6 px-8 pb-16 max-w-[1400px] mx-auto">
//         {/* Back button + title */}
//         <div className="mb-8 flex items-center justify-between">
//           <div className="flex items-center gap-6">
//             <div>
//               <h1 className="text-3xl font-semibold text-foreground">
//                 Compare Models
//               </h1>
//               <p className="text-muted-foreground mt-1">
//                 Compare performance of two models on the same dataset
//                 {datasetName && ` — ${datasetName}`}
//               </p>
//             </div>
//           </div>

//           <div className="flex items-center gap-4">
//             <Button
//               variant="outline"
//               onClick={() => {
//                 // ✅ STOP the API first
//                 if (registerAbortRef.current) {
//                   registerAbortRef.current.abort();
//                 }

//                 // ✅ THEN navigate based on origin
//                 if (cameFromJobs1) {
//                   navigate("/workflow/automl/jobs1");
//                 } else if (cameFromHub) {
//                   navigate("/workflow/automl/automlhub");
//                 } else {
//                   navigate("/workflow/automl");
//                 }
//               }}
//             >
//               {cameFromJobs1
//                 ? "Back to Auto AI/ML"
//                 : cameFromHub
//                   ? "Back to Preview"
//                   : "Back to Jobs"}
//             </Button>
//           </div>
//         </div>

//         {/* Configuration Card */}
//         <div className="bg-card rounded-xl border border-border p-6 mb-8 shadow-sm">
//           <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
//             <GitCompare className="w-5 h-5 text-primary" />
//             Comparison Setup
//           </h3>

//           <div
//             className={`grid gap-5 ${
//               needsTransformation ? "md:grid-cols-5" : "md:grid-cols-4"
//             }`}
//           >
//             {/* Task */}
//             <div>
//               <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
//                 Function
//               </label>
//               <Select
//                 value={selectedTask}
//                 onValueChange={setSelectedTask}
//                 disabled={needsTransformation}
//               >
//                 <SelectTrigger className="bg-background">
//                   <SelectValue placeholder="Select task" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {Object.keys(modelsByTask).map((task) => (
//                     <SelectItem key={task} value={task}>
//                       {task}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Model 1 */}
//             <div>
//               <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
//                 Model 1
//               </label>
//               <Select
//                 value={selectedModel1}
//                 onValueChange={setSelectedModel1}
//                 disabled={!selectedTask}
//               >
//                 <SelectTrigger className="bg-background">
//                   <SelectValue
//                     placeholder={
//                       selectedTask ? "Select Model 1" : "Select task first"
//                     }
//                   />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {availableModels.map((m) => (
//                     <SelectItem
//                       key={m}
//                       value={m}
//                       disabled={m === selectedModel2}
//                     >
//                       {m}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Model 2 */}
//             <div>
//               <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
//                 Model 2
//               </label>
//               <Select
//                 value={selectedModel2}
//                 onValueChange={setSelectedModel2}
//                 disabled={!selectedTask}
//               >
//                 <SelectTrigger className="bg-background">
//                   <SelectValue
//                     placeholder={
//                       selectedTask ? "Select Model 2" : "Select task first"
//                     }
//                   />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {availableModels.map((m) => (
//                     <SelectItem
//                       key={m}
//                       value={m}
//                       disabled={m === selectedModel1}
//                     >
//                       {m}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Target Feature */}
//             {needsTransformation ? (
//               <>
//                 {/* Dimensions */}
//                 {/* Dimensions */}
//                 <div className="relative">
//                   <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
//                     Dimensions
//                   </label>

//                   {/* Trigger */}
//                   <div
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setShowDimensions(!showDimensions);
//                       setShowMeasures(false);
//                     }}
//                     className="border border-input rounded-md px-3 py-2 bg-background cursor-pointer flex justify-between items-center"
//                   >
//                     <span className="text-sm">
//                       {selectedDimensions.length > 0
//                         ? `${selectedDimensions.length} selected`
//                         : "Select dimensions"}
//                     </span>
//                     <ChevronDown className="w-4 h-4 text-muted-foreground" />
//                   </div>

//                   {/* Dropdown */}
//                   {showDimensions && (
//                     <div
//                       onClick={(e) => e.stopPropagation()}
//                       className="absolute z-10 mt-1 w-full border border-input rounded-md bg-background shadow-lg max-h-40 overflow-y-auto"
//                     >
//                       {dimensions.map((dim: string) => {
//                         const isSelected = selectedDimensions.includes(dim);

//                         return (
//                           <div
//                             key={dim}
//                             onClick={() => {
//                               const updated = isSelected
//                                 ? selectedDimensions.filter((d) => d !== dim)
//                                 : [...selectedDimensions, dim];

//                               setSelectedDimensions(updated);
//                             }}
//                             className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted"
//                           >
//                             <input
//                               type="checkbox"
//                               checked={isSelected}
//                               readOnly
//                             />
//                             <span className="text-sm">{dim}</span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>

//                 {/* Measures */}
//                 <div className="relative">
//                   <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
//                     Measures
//                   </label>

//                   {/* Trigger */}
//                   <div
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setShowMeasures(!showMeasures);
//                       setShowDimensions(false);
//                     }}
//                     className="border border-input rounded-md px-3 py-2 bg-background cursor-pointer flex justify-between items-center"
//                   >
//                     <span className="text-sm">
//                       {selectedMeasures.length > 0
//                         ? `${selectedMeasures.length} selected`
//                         : "Select measures"}
//                     </span>
//                     <ChevronDown className="w-4 h-4 text-muted-foreground" />
//                   </div>

//                   {/* Dropdown */}
//                   {showMeasures && (
//                     <div
//                       onClick={(e) => e.stopPropagation()}
//                       className="absolute z-10 mt-1 w-full border border-input rounded-md bg-background shadow-lg max-h-40 overflow-y-auto"
//                     >
//                       {measures.map((m: string) => {
//                         const isSelected = selectedMeasures.includes(m);

//                         return (
//                           <div
//                             key={m}
//                             onClick={() => {
//                               const updated = isSelected
//                                 ? selectedMeasures.filter((d) => d !== m)
//                                 : [...selectedMeasures, m];

//                               setSelectedMeasures(updated);
//                             }}
//                             className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted"
//                           >
//                             <input
//                               type="checkbox"
//                               checked={isSelected}
//                               readOnly
//                             />
//                             <span className="text-sm">{m}</span>
//                           </div>
//                         );
//                       })}
//                     </div>
//                   )}
//                 </div>
//                 {/* Horizon */}
//                 <div>
//                   <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
//                     Horizon
//                   </label>

//                   <input
//                     type="number"
//                     value={horizon}
//                     min={1}
//                     onChange={(e) => setHorizon(Number(e.target.value))}
//                     className="w-full border border-input rounded-md px-3 py-2 bg-background"
//                   />
//                 </div>
//               </>
//             ) : (
//               /* OLD TARGET DROPDOWN */
//               <div>
//                 <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
//                   Target Column
//                 </label>

//                 <Select
//                   value={selectedFeature === "all" ? "all" : selectedFeature}
//                   onValueChange={(v) => setSelectedFeature(v as "all" | string)}
//                   disabled={!selectedTask || !blobPathReady}
//                 >
//                   <SelectTrigger className="bg-background">
//                     <SelectValue placeholder="Select target" />
//                   </SelectTrigger>

//                   <SelectContent>
//                     <SelectItem value="all">All features</SelectItem>

//                     {taskSpecificFeatures.map((col) => (
//                       <SelectItem key={col} value={col}>
//                         {col}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             )}
//           </div>

//           {errorMessage && (
//             <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
//               {errorMessage}
//             </div>
//           )}

//           <div className="mt-6">
//             <Button
//               onClick={fetchAndCompare}
//               disabled={
//                 !canCompare ||
//                 isComparing ||
//                 !blobPathReady ||
//                 !hasConfigChanged // ✅ IMPORTANT
//               }
//               size="lg"
//             >
//               {isComparing ? "Comparing..." : "Compare Models"}
//             </Button>
//           </div>
//         </div>

//         {/* Results */}
//         {comparisonComplete && (model1Metrics || model2Metrics) && (
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="space-y-4"
//           >
//             <div className="bg-card rounded-xl border border-border p-5">
//               <h4 className="text-base font-semibold text-foreground mb-4">
//                 Comparison Summary
//               </h4>
//               <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
//                 <div>
//                   <span className="text-muted-foreground">Task:</span>
//                   <span className="ml-2 text-foreground font-medium">
//                     {selectedTask}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Model 1:</span>
//                   <span className="ml-2 text-primary font-medium">
//                     {selectedModel1}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Model 2:</span>
//                   <span className="ml-2 text-primary font-medium">
//                     {selectedModel2}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Target:</span>
//                   <span className="ml-2 text-foreground font-medium">
//                     {selectedFeature === "all"
//                       ? "All features"
//                       : selectedFeature}
//                   </span>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-card rounded-xl border border-border overflow-hidden">
//               <div className="p-4 border-b border-border">
//                 <h3 className="text-sm font-semibold text-foreground">
//                   Model Comparison Results
//                 </h3>
//               </div>
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead>
//                     <tr className="bg-muted/30">
//                       <th className="px-4 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider border-b border-border">
//                         Model Name
//                       </th>
//                       <th className="px-4 py-3 text-center text-xs font-bold text-foreground uppercase tracking-wider border-b border-border">
//                         Metrics
//                       </th>
//                       {(metricsByTask[selectedTask] || []).map((spec) => (
//                         <th
//                           key={spec.key}
//                           className="px-4 py-3 text-center text-xs font-bold text-foreground uppercase tracking-wider border-b border-border"
//                         >
//                           {spec.label}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {/* Model 1 - Train Row */}
//                     <tr className="border-b border-border/50">
//                       <td
//                         className="px-4 py-4 font-bold text-blue-500 text-primary border-r border-border"
//                         rowSpan={2}
//                       >
//                         {selectedModel1}
//                       </td>
//                       <td className="px-4 py-3 text-center text-sm font-medium text-muted-foreground bg-muted/20">
//                         Train
//                       </td>
//                       {(metricsByTask[selectedTask] || []).map((spec) => {
//                         const value = model1Metrics?.train
//                           ? (model1Metrics.train[spec.key] ??
//                             model1Metrics.train[spec.key.replace(/\./g, "_")])
//                           : null;
//                         return (
//                           <td
//                             key={spec.key}
//                             className="px-4 py-3 text-center text-sm text-foreground"
//                           >
//                             {renderMetricValue(value)}
//                           </td>
//                         );
//                       })}
//                     </tr>
//                     {/* Model 1 - Test Row */}
//                     <tr className="border-b border-border">
//                       <td className="px-4 py-3 text-center text-sm font-medium text-muted-foreground bg-muted/20">
//                         Test
//                       </td>
//                       {(metricsByTask[selectedTask] || []).map((spec) => {
//                         const value = model1Metrics?.test
//                           ? (model1Metrics.test[spec.key] ??
//                             model1Metrics.test[spec.key.replace(/\./g, "_")])
//                           : null;
//                         return (
//                           <td
//                             key={spec.key}
//                             className="px-4 py-3 text-center text-sm text-foreground"
//                           >
//                             {renderMetricValue(value)}
//                           </td>
//                         );
//                       })}
//                     </tr>

//                     {/* Model 2 - Train Row */}
//                     <tr className="border-b border-border/50">
//                       <td
//                         className="px-4 py-4 font-bold text-purple-500 text-primary border-r border-border"
//                         rowSpan={2}
//                       >
//                         {selectedModel2}
//                       </td>
//                       <td className="px-4 py-3 text-center text-sm font-medium text-muted-foreground bg-muted/20">
//                         Train
//                       </td>
//                       {(metricsByTask[selectedTask] || []).map((spec) => {
//                         const value = model2Metrics?.train
//                           ? (model2Metrics.train[spec.key] ??
//                             model2Metrics.train[spec.key.replace(/\./g, "_")])
//                           : null;
//                         return (
//                           <td
//                             key={spec.key}
//                             className="px-4 py-3 text-center text-sm text-foreground"
//                           >
//                             {renderMetricValue(value)}
//                           </td>
//                         );
//                       })}
//                     </tr>
//                     {/* Model 2 - Test Row */}
//                     <tr className="border-b border-border">
//                       <td className="px-4 py-3 text-center text-sm font-medium text-muted-foreground bg-muted/20">
//                         Test
//                       </td>
//                       {(metricsByTask[selectedTask] || []).map((spec) => {
//                         const value = model2Metrics?.test
//                           ? (model2Metrics.test[spec.key] ??
//                             model2Metrics.test[spec.key.replace(/\./g, "_")])
//                           : null;
//                         return (
//                           <td
//                             key={spec.key}
//                             className="px-4 py-3 text-center text-sm text-foreground"
//                           >
//                             {renderMetricValue(value)}
//                           </td>
//                         );
//                       })}
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </main>
//     </div>
//   );
// };

// export default CompareTab;

import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronDown, GitCompare } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { ImportedDataset } from '@/components/modals/UnifiedImportModal'
import { ImportedDataset } from "../modals/UnifiedImportModal";
import { useLocation } from "react-router-dom";
import Header from "../layout/Header";
import { toast } from "sonner";
import Header1 from "../layout/Header1";

interface CompareTabProps {
  dataset?: ImportedDataset | null;
}

type MetricSpec = { key: string; label: string; isLowerBetter?: boolean };

const modelsByTask: Record<string, string[]> = {
  Classification: [
    "Logistic Regression",
    "Random Forest",
    "Gradient Boosting",
    "XGBoost",
  ],
  Regression: ["Ridge", "Random Forest", "Gradient Boosting", "XGBoost"],
  Forecasting: ["ARIMA", "Prophet", "XGBoost", "LightGBM", "CatBoost"],
  Clustering: ["KMeans", "KMeans++", "DBSCAN", "GMM"],
  "Anomaly Detection": [
    "Isolation Forest",
    "One-Class SVM",
    "Local Outlier Factor (LOF)",
    "Elliptic Envelope",
  ],
  Multi_Step_Forecasting: ["XGBoost", "CatBoost", "LightGBM"],
};

const metricsByTask: Record<string, MetricSpec[]> = {
  Classification: [
    { key: "accuracy", label: "Accuracy" },
    { key: "f1", label: "F1 Score" },
    { key: "precision", label: "Precision" },
    { key: "recall", label: "Recall" },
    { key: "roc_auc", label: "ROC-AUC" },
    { key: "precision_recall_auc", label: "PR-AUC" },
  ],
  Regression: [
    { key: "rmse", label: "RMSE", isLowerBetter: true },
    { key: "mae", label: "MAE", isLowerBetter: true },
    { key: "r2", label: "R²" },
    { key: "mape", label: "MAPE", isLowerBetter: true },
    { key: "mean_residual", label: "Mean Residual", isLowerBetter: true },
    { key: "std_residual", label: "Std Residual", isLowerBetter: true },
    { key: "pred_mean", label: "Pred Mean" },
    { key: "pred_std", label: "Pred Std" },
  ],
  Forecasting: [
    { key: "rmse", label: "RMSE", isLowerBetter: true },
    { key: "mae", label: "MAE", isLowerBetter: true },
    { key: "r2", label: "R²" },
    { key: "mape", label: "MAPE", isLowerBetter: true },
    { key: "mse", label: "MSE", isLowerBetter: true },
    { key: "mean_residual", label: "Mean Residual", isLowerBetter: true },
    { key: "std_residual", label: "Std Residual", isLowerBetter: true },
    { key: "pred_mean", label: "Pred Mean" },
    { key: "pred_std", label: "Pred Std" },
  ],
  Clustering: [
    { key: "n_clusters", label: "Number of Clusters" },
    { key: "n_noise_points", label: "Noise Points" },
    { key: "silhouette_score", label: "Silhouette Score" },
    {
      key: "davies_bouldin_score",
      label: "Davies-Bouldin",
      isLowerBetter: true,
    },
    { key: "calinski_harabasz", label: "Calinski-Harabasz" },
  ],
  "Anomaly Detection": [
    { key: "n_anomalies", label: "Number of Anomalies" },
    { key: "anomaly_percentage", label: "Anomaly Percentage (%)" },
    { key: "anomaly_score", label: "Anomaly Score" },
    { key: "avg_anomaly_score", label: "Avg Anomaly Score" },
    { key: "std_anomaly_score", label: "Std Anomaly Score" },
    { key: "min_anomaly_score", label: "Min Anomaly Score" },
    { key: "max_anomaly_score", label: "Max Anomaly Score" },
  ],
  Multi_Step_Forecasting: [
    { key: "avg_rmse", label: "Avg RMSE", isLowerBetter: true },
    { key: "avg_mae", label: "Avg MAE", isLowerBetter: true },
    { key: "avg_r2", label: "Avg R²" },
    { key: "avg_mape", label: "Avg MAPE", isLowerBetter: true },
  ],
};

// Best-effort mapping from human model name -> API key (extendable)
function modelNameToApiKey(name: string) {
  if (!name) return name;
  const mapping: Record<string, string> = {
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
    "KMeans++": "kmeans_plusplus",
    DBSCAN: "dbscan",
    GMM: "gmm",
    "Isolation Forest": "isolation_forest",
    "One-Class SVM": "one_class_svm",
    "Local Outlier Factor (LOF)": "lof",
    "Elliptic Envelope": "elliptic_envelope",
  };
  if (mapping[name]) return mapping[name];
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

// Generates mock values appropriate for given task + metric

const TRAINING_STATUS_API =
  "https://api.veriton.ai/api/service3/training-status";

const CompareTab = ({}: CompareTabProps) => {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState(""); // previously selectedFunction
  const [selectedModel1, setSelectedModel1] = useState("");
  const [selectedModel2, setSelectedModel2] = useState("");
  const [selectedFeature, setSelectedFeature] = useState<"all" | string>("all");
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonComplete, setComparisonComplete] = useState(false);
  const [model1Metrics, setModel1Metrics] = useState<Record<
    string,
    any
  > | null>(null);
  const [model2Metrics, setModel2Metrics] = useState<Record<
    string,
    any
  > | null>(null);
  const [apiResponseRaw, setApiResponseRaw] = useState<any | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [blobPath, setBlobPath] = useState<string | null>(null);
  const location = useLocation();
  const [allTaskFeatures, setAllTaskFeatures] = useState<any>(null);
  const [blobPathReady, setBlobPathReady] = useState(false);
  const filePath = (location.state as any)?.filePath || "";
  const registerAbortRef = useRef<AbortController | null>(null);
  const datasetName = (location.state as any)?.datasetName || "";
  const cameFromJobs1 = location.state?.origin === "jobs1";
  const cameFromHub = location.state?.origin === "automlhub";
  const [jobId, setJobId] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef(false);
  const trainingToastRef = useRef<string | number | null>(null);
  const [analysisMetadata, setAnalysisMetadata] = useState<any>(null);
  const [needsTransformation, setNeedsTransformation] = useState(false);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>([]);
  const [yearColumn, setYearColumn] = useState("");
  const [horizon, setHorizon] = useState(12);
  const featureToastRef = useRef<string | number | null>(null);

  const dimensions = analysisMetadata?.dataset_structure?.dimensions || [];

  const measures = analysisMetadata?.dataset_structure?.measures || [];

  const [showDimensions, setShowDimensions] = useState(false);
  const [showMeasures, setShowMeasures] = useState(false);
  const [hasConfigChanged, setHasConfigChanged] = useState(true);

  useEffect(() => {
    if (!filePath) return;

    const registerFile = async () => {
      const userEmail = getUserEmailFromLocal();

      if (!userEmail) return;

      try {
        // ✅ Create AbortController
        registerAbortRef.current = new AbortController();

        const params = new URLSearchParams();

        params.append("file_path", filePath);
        params.append("upload_file_path", "true");
        params.append("user_email", userEmail);
        params.append("optuna_trials", "2");
        params.append("preprocessing_mode", "simple");
        params.append("use_cleaning", "true");
        params.append("use_optuna", "true");
        params.append("test_size", "0.2");
        params.append("time_budget", "180");
        params.append("horizon", "12");

        featureToastRef.current = toast.loading("Fetching dataset features...");

        const res = await fetch(
          "https://api.veriton.ai/api/service3/build_ml_model_v",
          {
            method: "POST",

            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              accept: "application/json",
            },

            body: params.toString(),

            // ✅ attach signal
            signal: registerAbortRef.current.signal,
          },
        );

        if (!res.ok) throw new Error(`Registration failed: ${res.status}`);

        const json = await res.json();

        setBlobPath(json.blob_path);

        if (json.analysis_metadata) {
          setAnalysisMetadata(json.analysis_metadata); // ✅ MISSING

          const needsTransform =
            json.analysis_metadata?.dataset_structure?.needs_transformation ||
            false;

          setNeedsTransformation(needsTransform); // ✅ MISSING

          if (needsTransform) {
            setSelectedTask("Multi_Step_Forecasting");
          }
        }
        if (json.features?.tasks) {
          setAllTaskFeatures(json.features.tasks);
        }

        setBlobPathReady(true);
        if (featureToastRef.current) {
          toast.success("Features fetched successfully!", {
            id: featureToastRef.current,
            duration: 3000,
          });
        }
      } catch (err: any) {
        // ✅ IMPORTANT: ignore abort error
        if (err.name === "AbortError") {
          console.log("Registration API aborted");

          return;
        }

        console.error("File registration error:", err);
      }
    };

    registerFile();

    // ✅ cleanup when leaving page
    return () => {
      if (registerAbortRef.current) {
        registerAbortRef.current.abort();
      }
      toast.dismiss();
    };
  }, [filePath]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowDimensions(false);
      setShowMeasures(false);
    };

    window.addEventListener("click", handleClickOutside);

    return () => {
      window.removeEventListener("click", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isComparing) return;

    setHasConfigChanged(true); // ✅ unlock when user changes anything
  }, [
    selectedModel1,
    selectedModel2,
    selectedDimensions,
    selectedMeasures,
    selectedTask,
  ]);

  // Reset models & results when task changes
  useEffect(() => {
    setSelectedModel1("");
    setSelectedModel2("");
    setComparisonComplete(false);
    setModel1Metrics(null);
    setModel2Metrics(null);
    setApiResponseRaw(null);
    setErrorMessage(null);
    setSelectedFeature("all");
  }, [selectedTask]);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const availableModels = useMemo(() => {
    return selectedTask ? modelsByTask[selectedTask] || [] : [];
  }, [selectedTask]);

  const taskSpecificFeatures = useMemo(() => {
    if (!allTaskFeatures || !selectedTask) return [];
    const taskKey = selectedTask.toLowerCase().replace(/\s+/g, "_");
    return allTaskFeatures[taskKey]?.features || [];
  }, [allTaskFeatures, selectedTask]);

  const getUserEmailFromLocal = (): string | null => {
    try {
      const raw = localStorage.getItem("aivolve_user");
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return parsed?.email ?? null;
    } catch {
      return null;
    }
  };

  const canCompare = useMemo(() => {
    if (!selectedTask || !selectedModel1 || !selectedModel2) return false;

    if (selectedModel1 === selectedModel2) return false;

    if (needsTransformation) {
      return selectedDimensions.length > 0 && selectedMeasures.length > 0;
    }

    return true;
  }, [
    selectedTask,
    selectedModel1,
    selectedModel2,
    selectedDimensions,
    selectedMeasures,
    needsTransformation,
  ]);

  const fetchAndCompare = async () => {
    setErrorMessage(null);
    setIsComparing(true);
    setComparisonComplete(false);
    setModel1Metrics(null);
    setModel2Metrics(null);
    setApiResponseRaw(null);
    setHasConfigChanged(false); // 🔒 lock after clicking compare
    let startedPolling = false;

    const userEmail = getUserEmailFromLocal();
    if (!userEmail) {
      setErrorMessage("User email not found. Please login again.");
      setIsComparing(false);
      return;
    }

    if (!blobPath) {
      setErrorMessage(
        "Dataset not ready. Please wait or go back and try again.",
      );
      setIsComparing(false);
      return;
    }

    if (needsTransformation) {
      if (selectedDimensions.length === 0) {
        setErrorMessage("Please select at least one dimension");
        setIsComparing(false);
        return;
      }

      if (selectedMeasures.length === 0) {
        setErrorMessage("Please select at least one measure");
        setIsComparing(false);
        return;
      }
    }

    try {
      const params = new URLSearchParams();
      params.append("file_path", filePath);
      params.append("upload_file_path", "false");
      params.append("user_email", userEmail);
      if (needsTransformation) {
        params.append("task", "multistep_forecasting");
        params.append("target", "target");

        const transformConfig = {
          group_by: selectedDimensions,
          measures: selectedMeasures,
          year_column: yearColumn,
          horizon: horizon,
          needs_transformation: true,
        };

        params.append("transformation_config", JSON.stringify(transformConfig));
      } else {
        params.append(
          "task",
          selectedTask === "Multi_Step_Forecasting"
            ? "multistep_forecasting"
            : selectedTask.toLowerCase().replace(/\s+/g, "_"),
        );

        params.append(
          "target",
          selectedFeature === "all" ? "" : selectedFeature,
        );
      }
      const model1Key = modelNameToApiKey(selectedModel1);
      const model2Key = modelNameToApiKey(selectedModel2);
      params.append("models", `${model1Key} , ${model2Key}`);
      params.append("optuna_trials", "2");
      params.append("preprocessing_mode", "simple");
      params.append("use_cleaning", "true");
      params.append("use_optuna", "true");
      params.append("use_feature_selection", "false");
      params.append("test_size", "0.2");
      params.append("time_budget", "300");
      params.append("horizon", "12");

      const res = await fetch(
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

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API error ${res.status}: ${txt}`);
      }

      const json = await res.json();
      if (json.status === "model has started running") {
        const jobId = json.job_id;

        setJobId(jobId);
        setIsComparing(true);

        startedPolling = true; // ✅ IMPORTANT

        trainingToastRef.current = toast.loading(
          "Model comparison started. This may take a few minutes...",
        );

        pollTrainingStatus(jobId);

        return;
      }
      setApiResponseRaw(json);

      const allModels = json?.all_models ?? {};

      const findKey = (k: string | null) => {
        if (!k) return null;
        if (allModels[k]) return k;
        const lower = k.toLowerCase();
        const candidate = Object.keys(allModels).find(
          (c) => c.toLowerCase() === lower,
        );
        if (candidate) return candidate;
        const candidate2 = Object.keys(allModels).find((c) =>
          c.toLowerCase().includes(lower),
        );
        if (candidate2) return candidate2;
        return null;
      };

      const real1 = findKey(modelNameToApiKey(selectedModel1));
      const real2 = findKey(modelNameToApiKey(selectedModel2));

      const pickMetrics = (obj: any) => {
        if (!obj) return null;
        return { train: obj.train ?? null, test: obj.test ?? null };
      };

      setModel1Metrics(real1 ? pickMetrics(allModels[real1]) : null);
      setModel2Metrics(real2 ? pickMetrics(allModels[real2]) : null);
      setComparisonComplete(true);
    } catch (err: any) {
      console.error("Compare API error", err);
      setErrorMessage(err?.message || "Error calling compare API.");
    } finally {
      if (!startedPolling) {
        setIsComparing(false); // ✅ only reset if NOT polling
      }
    }
  };

  const pollTrainingStatus = async (jobId: string) => {
    setHasConfigChanged(false); // 🔒 keep disabled after results
    const userEmail = getUserEmailFromLocal();
    if (!userEmail) return;

    if (pollingRef.current) return;
    pollingRef.current = true;

    try {
      while (true) {
        const res = await fetch(
          `${TRAINING_STATUS_API}/${jobId}?user_email=${encodeURIComponent(userEmail)}`,
          {
            method: "GET",
            headers: { accept: "application/json" },
          },
        );

        if (!res.ok) {
          throw new Error("Failed to fetch training status");
        }

        const json = await res.json();

        if (json.status === "failed") {
          pollingRef.current = false;
          setIsComparing(false);

          // ✅ Extract clean error message
          let errorMessage = json.message || "Model comparison failed";

          if (json.error) {
            try {
              const parsed = JSON.parse(json.error.split("500: ")[1]);
              errorMessage = parsed?.error || parsed?.details || errorMessage;
            } catch {
              errorMessage = json.error;
            }
          }

          // ✅ Show error in UI
          setErrorMessage(errorMessage);

          // ✅ Toast
          if (trainingToastRef.current) {
            toast.error(errorMessage, {
              id: trainingToastRef.current,
              duration: 4000,
            });
          }

          // ✅ VERY IMPORTANT → enable button again
          setHasConfigChanged(true);

          return; // stop polling
        }

        if (json.status === "success") {
          pollingRef.current = false;
          setIsComparing(false);

          if (trainingToastRef.current) {
            toast.success("Model comparison completed!", {
              id: trainingToastRef.current,
              duration: 3000,
            });
          }

          const allModels = json.all_models ?? {};

          const findKey = (k: string | null) => {
            if (!k) return null;
            if (allModels[k]) return k;

            const lower = k.toLowerCase();
            const candidate = Object.keys(allModels).find(
              (c) => c.toLowerCase() === lower,
            );

            if (candidate) return candidate;

            const candidate2 = Object.keys(allModels).find((c) =>
              c.toLowerCase().includes(lower),
            );

            if (candidate2) return candidate2;

            return null;
          };

          const real1 = findKey(modelNameToApiKey(selectedModel1));
          const real2 = findKey(modelNameToApiKey(selectedModel2));

          const pickMetrics = (obj: any) => {
            if (!obj) return null;
            return { train: obj.train ?? null, test: obj.test ?? null };
          };

          setModel1Metrics(real1 ? pickMetrics(allModels[real1]) : null);
          setModel2Metrics(real2 ? pickMetrics(allModels[real2]) : null);

          setComparisonComplete(true);

          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 30000));
      }
    } catch (err) {
      console.error("Polling error:", err);
      pollingRef.current = false;
      setIsComparing(false);
    }
  };
  // compare two metric values based on whether lower is better
  const compareMetric = (
    key: string,
    a: any,
    b: any,
    isLowerBetter = false,
  ) => {
    if (a == null && b == null) return { aClass: "", bClass: "" };
    // parse percent strings and numeric strings
    const toNum = (v: any) => {
      if (v == null) return NaN;
      if (typeof v === "string" && v.includes("%"))
        return parseFloat(v.replace("%", ""));
      return parseFloat(String(v));
    };
    const na = toNum(a);
    const nb = toNum(b);
    if (isNaN(na) || isNaN(nb)) return { aClass: "", bClass: "" };
    if (isLowerBetter) {
      if (na < nb)
        return {
          aClass: "text-success font-semibold",
          bClass: "text-muted-foreground",
        };
      if (nb < na)
        return {
          aClass: "text-muted-foreground",
          bClass: "text-success font-semibold",
        };
    } else {
      if (na > nb)
        return {
          aClass: "text-success font-semibold",
          bClass: "text-muted-foreground",
        };
      if (nb > na)
        return {
          aClass: "text-muted-foreground",
          bClass: "text-success font-semibold",
        };
    }
    return { aClass: "text-foreground", bClass: "text-foreground" };
  };

  const renderMetricValue = (v: any) => {
    if (v == null) return "—";

    // If it's a string with %, return as is
    if (typeof v === "string" && v.includes("%")) {
      return v;
    }

    // Convert to number and check if it's valid
    const num = typeof v === "number" ? v : parseFloat(String(v));

    // If it's a valid number, format to 5 decimal places
    if (!isNaN(num)) {
      return num.toFixed(5);
    }

    // Otherwise return as string
    return String(v);
  };

  return (
    <div className="min-h-screen bg-background">
      {cameFromJobs1 ? <Header1 /> : <Header />}

      <main className="pt-6 px-8 pb-16 max-w-[1400px] mx-auto">
        {/* Back button + title */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div>
              <h1 className="text-3xl font-semibold text-foreground">
                Compare Models
              </h1>
              <p className="text-muted-foreground mt-1">
                Compare performance of two models on the same dataset
                {datasetName && ` — ${datasetName}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => {
                // ✅ STOP the API first
                if (registerAbortRef.current) {
                  registerAbortRef.current.abort();
                }

                // ✅ THEN navigate based on origin
                if (cameFromJobs1) {
                  navigate("/workflow/automl/jobs1");
                } else if (cameFromHub) {
                  navigate("/workflow/automl/automlhub");
                } else {
                  navigate("/workflow/automl");
                }
              }}
            >
              {cameFromJobs1
                ? "Back to Auto AI/ML"
                : cameFromHub
                  ? "Back to Preview"
                  : "Back to Jobs"}
            </Button>
          </div>
        </div>

        {/* Configuration Card */}
        <div className="bg-card rounded-xl border border-border p-6 mb-8 shadow-sm">
          <h3 className="text-lg font-semibold mb-5 flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            Comparison Setup
          </h3>

          <div
            className={`grid gap-5 ${
              needsTransformation ? "md:grid-cols-5" : "md:grid-cols-4"
            }`}
          >
            {/* Task */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
                Function
              </label>
              <Select
                value={selectedTask}
                onValueChange={setSelectedTask}
                disabled={needsTransformation}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue placeholder="Select task" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(modelsByTask).map((task) => (
                    <SelectItem key={task} value={task}>
                      {task}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model 1 */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
                Model 1
              </label>
              <Select
                value={selectedModel1}
                onValueChange={setSelectedModel1}
                disabled={!selectedTask}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue
                    placeholder={
                      selectedTask ? "Select Model 1" : "Select task first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((m) => (
                    <SelectItem
                      key={m}
                      value={m}
                      disabled={m === selectedModel2}
                    >
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Model 2 */}
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
                Model 2
              </label>
              <Select
                value={selectedModel2}
                onValueChange={setSelectedModel2}
                disabled={!selectedTask}
              >
                <SelectTrigger className="bg-background">
                  <SelectValue
                    placeholder={
                      selectedTask ? "Select Model 2" : "Select task first"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableModels.map((m) => (
                    <SelectItem
                      key={m}
                      value={m}
                      disabled={m === selectedModel1}
                    >
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Feature */}
            {needsTransformation ? (
              <>
                {/* Dimensions */}
                {/* Dimensions */}
                <div className="relative">
                  <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
                    Dimensions
                  </label>

                  {/* Trigger */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDimensions(!showDimensions);
                      setShowMeasures(false);
                    }}
                    className="border border-input rounded-md px-3 py-2 bg-background cursor-pointer flex justify-between items-center"
                  >
                    <span className="text-sm">
                      {selectedDimensions.length > 0
                        ? `${selectedDimensions.length} selected`
                        : "Select dimensions"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* Dropdown */}
                  {showDimensions && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute z-10 mt-1 w-full border border-input rounded-md bg-background shadow-lg max-h-40 overflow-y-auto"
                    >
                      {dimensions.map((dim: string) => {
                        const isSelected = selectedDimensions.includes(dim);

                        return (
                          <div
                            key={dim}
                            onClick={() => {
                              const updated = isSelected
                                ? selectedDimensions.filter((d) => d !== dim)
                                : [...selectedDimensions, dim];

                              setSelectedDimensions(updated);
                            }}
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                            />
                            <span className="text-sm">{dim}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Measures */}
                <div className="relative">
                  <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
                    Measures
                  </label>

                  {/* Trigger */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMeasures(!showMeasures);
                      setShowDimensions(false);
                    }}
                    className="border border-input rounded-md px-3 py-2 bg-background cursor-pointer flex justify-between items-center"
                  >
                    <span className="text-sm">
                      {selectedMeasures.length > 0
                        ? `${selectedMeasures.length} selected`
                        : "Select measures"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* Dropdown */}
                  {showMeasures && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="absolute z-10 mt-1 w-full border border-input rounded-md bg-background shadow-lg max-h-40 overflow-y-auto"
                    >
                      {measures.map((m: string) => {
                        const isSelected = selectedMeasures.includes(m);

                        return (
                          <div
                            key={m}
                            onClick={() => {
                              const updated = isSelected
                                ? selectedMeasures.filter((d) => d !== m)
                                : [...selectedMeasures, m];

                              setSelectedMeasures(updated);
                            }}
                            className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              readOnly
                            />
                            <span className="text-sm">{m}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* Horizon */}
                <div>
                  <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
                    Horizon
                  </label>

                  <input
                    type="number"
                    value={horizon}
                    min={1}
                    onChange={(e) => setHorizon(Number(e.target.value))}
                    className="w-full border border-input rounded-md px-3 py-2 bg-background"
                  />
                </div>
              </>
            ) : (
              /* OLD TARGET DROPDOWN */
              <div>
                <label className="text-sm text-muted-foreground mb-1.5 block font-medium">
                  Target Column
                </label>

                <Select
                  value={selectedFeature === "all" ? "all" : selectedFeature}
                  onValueChange={(v) => setSelectedFeature(v as "all" | string)}
                  disabled={!selectedTask || !blobPathReady}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select target" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="all">All features</SelectItem>

                    {taskSpecificFeatures.map((col) => (
                      <SelectItem key={col} value={col}>
                        {col}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {errorMessage && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
              {errorMessage}
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={fetchAndCompare}
              disabled={
                !canCompare ||
                isComparing ||
                !blobPathReady ||
                !hasConfigChanged // ✅ IMPORTANT
              }
              size="lg"
            >
              {isComparing ? "Comparing..." : "Compare Models"}
            </Button>
          </div>
        </div>

        {/* Results */}
        {comparisonComplete && (model1Metrics || model2Metrics) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-card rounded-xl border border-border p-5">
              <h4 className="text-base font-semibold text-foreground mb-4">
                Comparison Summary
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Task:</span>
                  <span className="ml-2 text-foreground font-medium">
                    {selectedTask}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Model 1:</span>
                  <span className="ml-2 text-primary font-medium">
                    {selectedModel1}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Model 2:</span>
                  <span className="ml-2 text-primary font-medium">
                    {selectedModel2}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Target:</span>
                  <span className="ml-2 text-foreground font-medium">
                    {selectedFeature === "all"
                      ? "All features"
                      : selectedFeature}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="p-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">
                  Model Comparison Results
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/30">
                      <th className="px-4 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider border-b border-border">
                        Model Name
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-foreground uppercase tracking-wider border-b border-border">
                        Metrics
                      </th>
                      {(metricsByTask[selectedTask] || []).map((spec) => (
                        <th
                          key={spec.key}
                          className="px-4 py-3 text-center text-xs font-bold text-foreground uppercase tracking-wider border-b border-border"
                        >
                          {spec.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Model 1 - Train Row */}
                    <tr className="border-b border-border/50">
                      <td
                        className="px-4 py-4 font-bold text-blue-500 text-primary border-r border-border"
                        rowSpan={2}
                      >
                        {selectedModel1}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-muted-foreground bg-muted/20">
                        Train
                      </td>
                      {(metricsByTask[selectedTask] || []).map((spec) => {
                        const value = model1Metrics?.train
                          ? (model1Metrics.train[spec.key] ??
                            model1Metrics.train[spec.key.replace(/\./g, "_")])
                          : null;
                        return (
                          <td
                            key={spec.key}
                            className="px-4 py-3 text-center text-sm text-foreground"
                          >
                            {renderMetricValue(value)}
                          </td>
                        );
                      })}
                    </tr>
                    {/* Model 1 - Test Row */}
                    <tr className="border-b border-border">
                      <td className="px-4 py-3 text-center text-sm font-medium text-muted-foreground bg-muted/20">
                        Test
                      </td>
                      {(metricsByTask[selectedTask] || []).map((spec) => {
                        const value = model1Metrics?.test
                          ? (model1Metrics.test[spec.key] ??
                            model1Metrics.test[spec.key.replace(/\./g, "_")])
                          : null;
                        return (
                          <td
                            key={spec.key}
                            className="px-4 py-3 text-center text-sm text-foreground"
                          >
                            {renderMetricValue(value)}
                          </td>
                        );
                      })}
                    </tr>

                    {/* Model 2 - Train Row */}
                    <tr className="border-b border-border/50">
                      <td
                        className="px-4 py-4 font-bold text-purple-500 text-primary border-r border-border"
                        rowSpan={2}
                      >
                        {selectedModel2}
                      </td>
                      <td className="px-4 py-3 text-center text-sm font-medium text-muted-foreground bg-muted/20">
                        Train
                      </td>
                      {(metricsByTask[selectedTask] || []).map((spec) => {
                        const value = model2Metrics?.train
                          ? (model2Metrics.train[spec.key] ??
                            model2Metrics.train[spec.key.replace(/\./g, "_")])
                          : null;
                        return (
                          <td
                            key={spec.key}
                            className="px-4 py-3 text-center text-sm text-foreground"
                          >
                            {renderMetricValue(value)}
                          </td>
                        );
                      })}
                    </tr>
                    {/* Model 2 - Test Row */}
                    <tr className="border-b border-border">
                      <td className="px-4 py-3 text-center text-sm font-medium text-muted-foreground bg-muted/20">
                        Test
                      </td>
                      {(metricsByTask[selectedTask] || []).map((spec) => {
                        const value = model2Metrics?.test
                          ? (model2Metrics.test[spec.key] ??
                            model2Metrics.test[spec.key.replace(/\./g, "_")])
                          : null;
                        return (
                          <td
                            key={spec.key}
                            className="px-4 py-3 text-center text-sm text-foreground"
                          >
                            {renderMetricValue(value)}
                          </td>
                        );
                      })}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default CompareTab;
 