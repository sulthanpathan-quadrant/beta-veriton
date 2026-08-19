// import { useState, useEffect, useMemo } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   X,
//   Settings2,
//   Loader2,
//   CheckCircle2,
//   ChevronDown,
//   Check,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { useJobs } from "../contexts/JobsContext";
// import { Job } from "../types/jobs";
// import { cn } from "@/lib/utils";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   // CommandInput,    // ← uncomment if you want search
//   CommandItem,
//   CommandList,
// } from "@/components/ui/command";
 
// interface JobEditModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   job: Job | null;
//   onTrainingComplete?: (job: Job) => void;
// }
 
// // UI Display Names
// const modelsByFeature: Record<string, string[]> = {
//   Classification: [
//     "Logistic Regression",
//     "Random Forest",
//     "Gradient Boosting",
//     "XGBoost",
//   ],
//   Regression: ["Ridge", "Random Forest", "Gradient Boosting", "XGBoost"],
//   Forecasting: ["ARIMA", "Prophet", "XGBoost", "LightGBM", "CatBoost"],
//   Multi_Step_Forecasting: ["XGBoost", "LightGBM", "CatBoost"],
//   Clustering: ["KMeans", "KMeans++", "DBSCAN", "GMM"],
//   "Anomaly Detection": [
//     "Isolation Forest",
//     "One-Class SVM",
//     "Local Outlier Factor (LOF)",
//     "Elliptic Envelope",
//   ],
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
 
// // ✅ Reverse mapping: API names to UI names
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
 
// const featureTypes = Object.keys(modelsByFeature);
 
// // Map UI feature names to API task names
// const featureToTaskMap: Record<string, string> = {
//   Classification: "classification",
//   Regression: "regression",
//   Forecasting: "forecasting",
//   Clustering: "clustering",
//   Multi_Step_Forecasting: "multistep_forecasting",
//   "Anomaly Detection": "anomaly_detection",
// };
 
// const taskToFeatureMap: Record<string, string> = {
//   classification: "Classification",
//   regression: "Regression",
//   forecasting: "Forecasting",
//   multistep_forecasting: "Multi_Step_Forecasting",
//   clustering: "Clustering",
//   anomaly_detection: "Anomaly Detection",
// };
 
// const JobEditModal = ({
//   isOpen,
//   onClose,
//   job,
//   onTrainingComplete,
// }: JobEditModalProps) => {
//   const { updateJob } = useJobs();
//   const [selectedFeature, setSelectedFeature] = useState("");
//   const [selectedModel, setSelectedModel] = useState("");
//   const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
//   const [selectedTarget, setSelectedTarget] = useState("");
//   const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
//   const [blobPath, setBlobPath] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [training, setTraining] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);
//   const [dimensions, setDimensions] = useState<string[]>([]);
//   const [measures, setMeasures] = useState<string[]>([]);
//   const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
//   const [selectedMeasures, setSelectedMeasures] = useState<string[]>([]);
//   const [initialDimensions, setInitialDimensions] = useState<string[]>([]);
//   const [initialMeasures, setInitialMeasures] = useState<string[]>([]);
//   const [hasChanges, setHasChanges] = useState(false);
//   const [showDimensionsDropdown, setShowDimensionsDropdown] = useState(false);
//   const [showMeasuresDropdown, setShowMeasuresDropdown] = useState(false);
 
//   // ========== EFFECT 1: INITIALIZE STATE FROM JOB ==========
//   useEffect(() => {
//     if (job && isOpen) {
//       console.log("🔍 Initializing modal with job:", job);
 
//       let taskType = "";
 
//       if (job.task_type) {
//         const normalizedTask = job.task_type.toLowerCase().replace(/\s+/g, "_");
//         taskType = taskToFeatureMap[normalizedTask] || "";
//         console.log("📋 Task from API:", job.task_type, "→", taskType);
//       }
 
//       if (!taskType && job.category) {
//         taskType = job.category;
//         console.log("📋 Task from category:", taskType);
//       }
 
//       if (!taskType && job.feature) {
//         taskType = job.feature;
//         console.log("📋 Task from feature:", taskType);
//       }
 
//       setSelectedFeature(taskType);
//       console.log("✅ Set feature to:", taskType);
 
//       let modelToSet = "";
//       if (job.model) {
//         if (Object.keys(modelNameToAPI).includes(job.model)) {
//           modelToSet = job.model;
//         } else {
//           const normalizedModel = job.model.toLowerCase();
//           modelToSet = apiModelToUI[normalizedModel] || "";
//         }
//       }
 
//       if (!modelToSet && job.best_model) {
//         const normalizedModel = job.best_model.toLowerCase();
//         modelToSet = apiModelToUI[normalizedModel] || "";
//       }
 
//       setSelectedModel(modelToSet);
//       console.log("✅ Set model to:", modelToSet);
 
//       setSelectedTarget(job.target || "");
//       console.log("✅ Set target to:", job.target);
 
//       setSelectedFeatures(job.features || []);
 
//       setHasChanges(false);
//       setSuccessMessage(null);
//       setError(null);
//     }
//   }, [job, isOpen]);
 
//   // ========== ✅✅✅ EFFECT 2: FETCH DATASET FEATURES (ADD THIS!) ==========
//   useEffect(() => {
//     if (isOpen && job?.datasetName) {
//       console.log("📥 Fetching dataset features for:", job.datasetName);
//       fetchDatasetFeatures();
//     }
//   }, [isOpen, job?.datasetName]);
 
//   // ========== EFFECT 3: TRACK CHANGES ==========
//   useEffect(() => {
//     if (!job) return;
 
//     const normalize = (val?: string) =>
//       (val || "").toLowerCase().replace(/\s+/g, "_");
 
//     const featureChanged =
//       normalize(selectedFeature) !== normalize(job.category || job.feature);
 
//     const modelChanged = normalize(selectedModel) !== normalize(job.model);
 
//     const targetChanged = selectedTarget !== (job.target || "");
 
//     let forecastingChanged = false;
 
//     if (selectedFeature === "Multi_Step_Forecasting") {
//       const dimsChanged =
//         JSON.stringify([...selectedDimensions].sort()) !==
//         JSON.stringify([...initialDimensions].sort());
 
//       const measChanged =
//         JSON.stringify([...selectedMeasures].sort()) !==
//         JSON.stringify([...initialMeasures].sort());
 
//       forecastingChanged = dimsChanged || measChanged;
//     }
 
//     setHasChanges(
//       featureChanged || modelChanged || targetChanged || forecastingChanged,
//     );
//   }, [
//     selectedFeature,
//     selectedModel,
//     selectedTarget,
//     selectedDimensions,
//     selectedMeasures,
//     job,
//   ]);
 
//   useEffect(() => {
//     if (isOpen && job?.datasetName && selectedFeature) {
//       fetchDatasetFeatures();
//     }
//   }, [selectedFeature]);
 
//   const fetchDatasetFeatures = async () => {
//     if (!job?.datasetName) {
//       setError("Dataset name not found");
//       return;
//     }
 
//     if (!selectedFeature) {
//       console.log("Function not selected yet");
//       return;
//     }
 
//     setLoading(true);
//     setError(null);
 
//     try {
//       const userDataString = localStorage.getItem("aivolve_user");
//       if (!userDataString) throw new Error("User not found");
 
//       const userData = JSON.parse(userDataString);
//       const userEmail = userData.email;
//       const agentName = userData.agent_name || userData.name || "default";
 
//       if (!userEmail) throw new Error("Email not found");
 
//       // -----------------------------
//       // STEP 1: Get blob_path
//       // -----------------------------
//       const listFilesUrl = `https://api.veriton.ai/api/service3/list_files?user_email=${encodeURIComponent(
//         userEmail,
//       )}&agent_name=${encodeURIComponent(agentName)}`;
 
//       const listResponse = await fetch(listFilesUrl, {
//         method: "GET",
//         headers: { accept: "application/json" },
//       });
 
//       if (!listResponse.ok) {
//         throw new Error(`Failed to fetch files list: ${listResponse.status}`);
//       }
 
//       const listData = await listResponse.json();
 
//       let matchingFile = null;
 
//       if (Array.isArray(listData.files)) {
//         matchingFile = listData.files.find(
//           (file: any) => file.filename === job.datasetName,
//         );
//       }
 
//       if (!matchingFile && Array.isArray(listData.build_model_files)) {
//         matchingFile = listData.build_model_files.find(
//           (file: any) => file.filename === job.datasetName,
//         );
//       }
 
//       if (!matchingFile) {
//         throw new Error(`Dataset "${job.datasetName}" not found`);
//       }
 
//       const blobPathFromAPI = matchingFile.blob_name;
 
//       setBlobPath(blobPathFromAPI);
 
//       console.log("Found blob path:", blobPathFromAPI);
 
//       // -----------------------------
//       // STEP 2: Call task_features
//       // -----------------------------
//       const task =
//         featureToTaskMap[selectedFeature] || selectedFeature.toLowerCase();
 
//       const taskFeaturesUrl = `https://api.veriton.ai/api/service3/task_features?blob_path=${encodeURIComponent(
//         blobPathFromAPI,
//       )}&task=${encodeURIComponent(task)}&user_email=${encodeURIComponent(
//         userEmail,
//       )}`;
 
//       console.log("Calling task_features:", taskFeaturesUrl);
 
//       const taskResponse = await fetch(taskFeaturesUrl, {
//         method: "GET",
//         headers: { accept: "application/json" },
//       });
 
//       if (!taskResponse.ok) {
//         throw new Error(
//           `Failed to fetch task features: ${taskResponse.status}`,
//         );
//       }
 
//       const taskData = await taskResponse.json();
 
//       console.log("Task features response:", taskData);
 
//       // -----------------------------
//       // HANDLE MULTI STEP FORECASTING
//       // -----------------------------
//       if (taskData.task === "multistep_forecasting") {
//         console.log("Multi Step Forecasting detected");
 
//         const dims = taskData.dimensions || [];
//         const meas = taskData.measures || [];
 
//         setDimensions(dims);
//         setMeasures(meas);
 
//         setSelectedDimensions(dims);
//         setSelectedMeasures(meas);
 
//         // store initial selections
//         setInitialDimensions(dims);
//         setInitialMeasures(meas);
 
//         setAvailableFeatures([]);
//         setSelectedTarget("");
//       } else {
//         // -----------------------------
//         // NORMAL TASKS
//         // -----------------------------
//         const features = taskData.features || [];
//         const targets = taskData.targets || [];
 
//         setAvailableFeatures(features);
 
//         if (!job.target && targets.length > 0) {
//           setSelectedTarget(targets[0]);
//         }
//       }
//     } catch (err) {
//       const errorMessage =
//         err instanceof Error ? err.message : "Failed to fetch dataset features";
 
//       setError(errorMessage);
//       console.error("Error fetching dataset features:", err);
 
//       setAvailableFeatures([]);
//     } finally {
//       setLoading(false);
//     }
//   };
 
//   const availableModels = useMemo(() => {
//     return selectedFeature ? modelsByFeature[selectedFeature] || [] : [];
//   }, [selectedFeature]);
 
//   const handleFeatureChange = (value: string) => {
//     setSelectedFeature(value);
//     setSelectedModel("");
//   };
 
//   const toggleFeature = (feature: string) => {
//     setSelectedFeatures((prev) =>
//       prev.includes(feature)
//         ? prev.filter((f) => f !== feature)
//         : [...prev, feature],
//     );
//   };
 
//   const toggleDimension = (col: string) => {
//     setSelectedDimensions((prev) =>
//       prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
//     );
//   };
 
//   const toggleMeasure = (col: string) => {
//     setSelectedMeasures((prev) =>
//       prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
//     );
//   };
 
//   useEffect(() => {
//     if (selectedTarget && selectedFeatures.includes(selectedTarget)) {
//       setSelectedFeatures((prev) => prev.filter((f) => f !== selectedTarget));
//     }
//   }, [selectedTarget]);
 
// const TRAINING_STATUS_API =
//   "https://api.veriton.ai/api/service3/training-status";
 
// const handleSave = async () => {
//   if (!job) {
//     setError("Job not found");
//     return;
//   }
 
//   if (!selectedFeature) {
//     setError("Please select a function");
//     return;
//   }
 
//   if (selectedFeature !== "Multi_Step_Forecasting" && !selectedTarget) {
//     setError("Please select a target column");
//     return;
//   }
 
//   setTraining(true);
//   setError(null);
//   setSuccessMessage(null);
 
//   try {
//     const userDataString = localStorage.getItem("aivolve_user");
//     if (!userDataString) throw new Error("User not found");
 
//     const userData = JSON.parse(userDataString);
//     const userEmail = userData.user_email || userData.email;
 
//     if (!userEmail) throw new Error("User email missing");
 
//     // ✅ file_path from job summary response
//     const filePath = job.veriton_file_path;
 
//     if (!filePath) {
//       throw new Error("File path not found in job data");
//     }
 
//     const params = new URLSearchParams();
 
//     params.append("file_path", filePath);
//     params.append("upload_file_path", "false");
//     params.append(
//       "task",
//       featureToTaskMap[selectedFeature] || selectedFeature.toLowerCase(),
//     );
//     params.append("user_email", userEmail);
 
//     if (selectedFeature === "Multi_Step_Forecasting") {
//       const transformationConfig = {
//         group_by: selectedDimensions,
//         measures: selectedMeasures,
//         year_column: "",
//         horizon: 12,
//         needs_transformation: true,
//       };
 
//       params.append("target", "target");
//       params.append(
//         "transformation_config",
//         JSON.stringify(transformationConfig),
//       );
//       params.append("horizon", "12");
//     } else {
//       params.append("target", selectedTarget);
//     }
 
//     const apiModelName = selectedModel
//       ? modelNameToAPI[selectedModel] ||
//         selectedModel.toLowerCase().replace(/\s+/g, "_")
//       : "";
 
//     params.append("models", apiModelName);
//     params.append("metric", "");
//     params.append("preprocessing_mode", "simple");
//     params.append("use_cleaning", "true");
//     params.append("use_feature_selection", "true");
//     params.append("use_optuna", "true");
//     params.append("optuna_trials", "2");
//     params.append("time_budget", "180");
//     params.append("test_size", "0.2");
 
//     console.log("Starting background training...");
 
//     const buildResponse = await fetch(
//       "https://api.veriton.ai/api/service3/build_ml_model_v",
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//           accept: "application/json",
//         },
//         body: params.toString(),
//       },
//     );
 
//     if (!buildResponse.ok) {
//       const errorData = await buildResponse.json().catch(() => ({}));
//       throw new Error(
//         errorData.detail || `API failed: ${buildResponse.status}`,
//       );
//     }
 
//     const startResult = await buildResponse.json();
 
//     console.log("Training started:", startResult);
 
//     const jobId = startResult.job_id;
 
//     pollTrainingStatus(jobId, userEmail);
 
//   } catch (err) {
//     const errorMessage =
//       err instanceof Error ? err.message : "Failed to start training";
//     setError(errorMessage);
//     console.error(err);
//     setTraining(false);
//   }
// };
 
// const pollTrainingStatus = async (jobId: string, userEmail: string) => {
//   const interval = setInterval(async () => {
//     try {
//       const res = await fetch(
//         `${TRAINING_STATUS_API}/${jobId}?user_email=${encodeURIComponent(
//           userEmail
//         )}`,
//         {
//           method: "GET",
//           headers: { accept: "application/json" },
//         }
//       );
 
//       if (!res.ok) return;
 
//       const result = await res.json();
 
//       console.log("Training status:", result);
 
//       if (result.status === "success") {
//         clearInterval(interval);
 
//         const uiModelName =
//           apiModelToUI[result.best_model?.toLowerCase()] || result.best_model;
 
//         // Create updated job object
//         const updatedJob: Job = {
//           ...job!,
//           id: result.model_id,
//           feature: selectedFeature,
//           model: uiModelName,
//           category: selectedFeature,
//           target: selectedTarget,
//           status: "completed",
//           task_type: result.task_type,
//           testAccuracy: result.primary_score?.toString(),
//         };
 
//         // Update job in context
//         updateJob(job!.id, updatedJob);
 
//         setSuccessMessage(
//           `✓ Model trained successfully! ${result.primary_metric}: ${result.primary_score.toFixed(
//             2
//           )}`
//         );
 
//         setTraining(false);
 
//         setTimeout(() => {
//           onClose();
 
//           // ✅ Automatically open JobViewModal
//           if (onTrainingComplete) {
//             onTrainingComplete(updatedJob);
//           }
//         }, 1000);
//       }
//     } catch (err) {
//       console.error("Polling error:", err);
//     }
//   }, 10000); // Poll every 10 seconds
// };
 
//   const handleClose = () => {
//     setError(null);
//     setSuccessMessage(null);
//     setAvailableFeatures([]);
//     onClose();
//   };
 
//   if (!job) return null;
 
//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300]"
//             onClick={handleClose}
//           />
 
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95, y: 20 }}
//             className="fixed inset-0 flex items-center justify-center z-[301] p-4"
//           >
//             <div
//               className="relative w-[550px] max-w-[90vw] max-h-[90vh] overflow-hidden bg-card rounded-2xl border border-border shadow-2xl flex flex-col"
//               role="dialog"
//               aria-modal="true"
//               aria-labelledby="job-edit-modal-title"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <div className="flex-shrink-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
//                     <Settings2 className="w-5 h-5 text-primary" />
//                   </div>
//                   <div>
//                     <h2
//                       id="job-edit-modal-title"
//                       className="text-lg font-semibold text-foreground"
//                     >
//                       Edit Job Configuration
//                     </h2>
//                     {job.datasetName && (
//                       <p className="text-xs text-muted-foreground mt-0.5">
//                         Dataset: {job.datasetName}
//                       </p>
//                     )}
//                   </div>
//                 </div>
//                 <button
//                   onClick={handleClose}
//                   disabled={training}
//                   className="p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
//                   aria-label="Close modal"
//                 >
//                   <X className="w-5 h-5 text-muted-foreground" />
//                 </button>
//               </div>
 
//               <div className="flex-1 overflow-y-auto p-6 space-y-5">
//                 {successMessage && (
//                   <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
//                     <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
//                     <p className="text-green-800 text-sm font-medium">
//                       {successMessage}
//                     </p>
//                   </div>
//                 )}
 
//                 {error && (
//                   <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
//                     <p className="text-red-700 text-sm font-medium">{error}</p>
//                     {!training && (
//                       <Button
//                         variant="outline"
//                         size="sm"
//                         onClick={fetchDatasetFeatures}
//                         className="mt-3"
//                       >
//                         Retry
//                       </Button>
//                     )}
//                   </div>
//                 )}
 
//                 <div>
//                   <label className="text-sm font-medium text-foreground mb-2 block">
//                     Function <span className="text-red-500">*</span>
//                   </label>
//                   <Select
//                     value={selectedFeature}
//                     onValueChange={handleFeatureChange}
//                     disabled={training}
//                   >
//                     <SelectTrigger className="w-full bg-background">
//                       <SelectValue placeholder="Select Function" />
//                     </SelectTrigger>
//                     <SelectContent className="bg-background border border-border z-[400]">
//                       {featureTypes.map((type) => (
//                         <SelectItem key={type} value={type}>
//                           {type}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
 
//                 <div>
//                   <label className="text-sm font-medium text-foreground mb-2 block">
//                     Model <span className="text-red-500">*</span>
//                   </label>
//                   <Select
//                     value={selectedModel}
//                     onValueChange={setSelectedModel}
//                     disabled={!selectedFeature || training}
//                   >
//                     <SelectTrigger className="w-full bg-background">
//                       <SelectValue
//                         placeholder={
//                           selectedFeature
//                             ? "Auto-select best model"
//                             : "Select function first"
//                         }
//                       />
//                     </SelectTrigger>
//                     <SelectContent className="bg-background border border-border z-[400]">
//                       {availableModels.map((model) => (
//                         <SelectItem key={model} value={model}>
//                           {model}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>
//                 {selectedFeature !== "Multi_Step_Forecasting" && (
//                   <>
//                     <div>
//                       <label className="text-sm font-medium text-foreground mb-2 block">
//                         Target Column <span className="text-red-500">*</span>
//                       </label>
//                       <Select
//                         value={selectedTarget}
//                         onValueChange={setSelectedTarget}
//                         disabled={
//                           loading || training || availableFeatures.length === 0
//                         }
//                       >
//                         <SelectTrigger className="w-full bg-background">
//                           <SelectValue placeholder="Select target column" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-background border border-border z-[400]">
//                           {availableFeatures.map((col) => (
//                             <SelectItem key={col} value={col}>
//                               {col}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                       <p className="text-xs text-muted-foreground mt-1.5">
//                         Select the column you want to predict
//                       </p>
//                     </div>
 
//                     <div>
//                       <label className="text-sm font-medium text-foreground mb-2 block">
//                         Features{" "}
//                         {selectedFeatures.length > 0 &&
//                           `(${selectedFeatures.length} selected)`}
//                       </label>
 
//                       {loading ? (
//                         <div className="border border-border rounded-lg p-6 bg-background flex items-center justify-center">
//                           <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
//                           <span className="text-sm text-muted-foreground">
//                             Loading features...
//                           </span>
//                         </div>
//                       ) : availableFeatures.length === 0 && !error ? (
//                         <div className="border border-border rounded-lg p-6 bg-background text-center">
//                           <p className="text-sm text-muted-foreground">
//                             No features available
//                           </p>
//                         </div>
//                       ) : (
//                         <div className="border border-border rounded-lg p-3 max-h-[200px] overflow-y-auto bg-background">
//                           <div className="flex flex-wrap gap-2">
//                             {availableFeatures.map((column) => {
//                               const isTarget = column === selectedTarget;
//                               const isSelected =
//                                 selectedFeatures.includes(column);
 
//                               return (
//                                 <button
//                                   key={column}
//                                   onClick={() =>
//                                     !isTarget && toggleFeature(column)
//                                   }
//                                   disabled={training || isTarget}
//                                   className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
//                                     isTarget
//                                       ? "bg-yellow-100 text-yellow-800 border-yellow-300 cursor-not-allowed"
//                                       : isSelected
//                                         ? "bg-primary text-primary-foreground border-primary"
//                                         : "bg-muted text-muted-foreground border-border hover:border-primary/50"
//                                   } ${training ? "opacity-50 cursor-not-allowed" : ""}`}
//                                   title={
//                                     isTarget
//                                       ? "Target column (excluded from features)"
//                                       : ""
//                                   }
//                                 >
//                                   {column}
//                                   {isTarget && " (Target)"}
//                                 </button>
//                               );
//                             })}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </>
//                 )}
 
//                 {selectedFeature === "Multi_Step_Forecasting" && (
//                   <>
//                     {/* Dimensions */}
//                     <div>
//                       <label className="text-sm font-medium text-foreground mb-2 block">
//                         Dimensions <span className="text-red-500">*</span>
//                       </label>
 
//                       <Popover
//                         open={showDimensionsDropdown}
//                         onOpenChange={setShowDimensionsDropdown}
//                       >
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant="outline"
//                             role="combobox"
//                             aria-expanded={showDimensionsDropdown}
//                             className="w-full justify-between h-10 px-3 text-sm bg-background"
//                             disabled={training}
//                           >
//                             {selectedDimensions.length === 0
//                               ? "Select dimensions"
//                               : `${selectedDimensions.length} selected`}
//                             <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
//                           </Button>
//                         </PopoverTrigger>
 
//                         <PopoverContent
//                           side="bottom" // Force preference for opening below
//                           align="start"
//                           sideOffset={6} // Small gap from trigger
//                           avoidCollisions={false} // Prevents flipping to top when space is tight
//                           className="w-[var(--radix-popover-trigger-width)] p-0 max-h-60 overflow-hidden z-[500]"
//                         >
//                           <Command>
//                             <CommandList className="max-h-60 overflow-y-auto p-1">
//                               <CommandEmpty>No dimensions found.</CommandEmpty>
//                               <CommandGroup>
//                                 {dimensions.map((dim) => {
//                                   const isSelected =
//                                     selectedDimensions.includes(dim);
//                                   return (
//                                     <CommandItem
//                                       key={dim}
//                                       value={dim}
//                                       onSelect={() => toggleDimension(dim)}
//                                       className="cursor-pointer aria-selected:bg-accent"
//                                     >
//                                       <div
//                                         className={cn(
//                                           "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
//                                           isSelected
//                                             ? "bg-primary text-primary-foreground"
//                                             : "opacity-50 [&_svg]:invisible",
//                                         )}
//                                       >
//                                         <Check className="h-4 w-4" />
//                                       </div>
//                                       <span className="flex-1">{dim}</span>
//                                     </CommandItem>
//                                   );
//                                 })}
//                               </CommandGroup>
//                             </CommandList>
//                           </Command>
//                         </PopoverContent>
//                       </Popover>
 
//                       {/* Selected tags */}
//                       {selectedDimensions.length > 0 && (
//                         <div className="mt-2 flex flex-wrap gap-1.5">
//                           {selectedDimensions.map((dim) => (
//                             <span
//                               key={dim}
//                               className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
//                             >
//                               {dim}
//                               <button
//                                 type="button"
//                                 onClick={() => toggleDimension(dim)}
//                                 className="ml-1 text-primary/70 hover:text-primary focus:outline-none"
//                               >
//                                 <X className="h-3 w-3" />
//                               </button>
//                             </span>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                     {/* Measures */}
//                     <div className="mt-5">
//                       <label className="text-sm font-medium text-foreground mb-2 block">
//                         Measures <span className="text-red-500">*</span>
//                       </label>
 
//                       <Popover
//                         open={showMeasuresDropdown}
//                         onOpenChange={setShowMeasuresDropdown}
//                       >
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant="outline"
//                             role="combobox"
//                             aria-expanded={showMeasuresDropdown}
//                             className="w-full justify-between h-10 px-3 text-sm bg-background"
//                             disabled={training}
//                           >
//                             {selectedMeasures.length === 0
//                               ? "Select measures"
//                               : `${selectedMeasures.length} selected`}
//                             <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
//                           </Button>
//                         </PopoverTrigger>
 
//                         <PopoverContent
//                           className="w-[var(--radix-popover-trigger-width)] p-0 max-h-60 overflow-hidden z-[500]"
//                           align="start"
//                           sideOffset={6}
//                         >
//                           <Command>
//                             <CommandList className="max-h-60 overflow-y-auto p-1">
//                               <CommandEmpty>No measures found.</CommandEmpty>
//                               <CommandGroup>
//                                 {measures.map((meas) => {
//                                   const isSelected =
//                                     selectedMeasures.includes(meas);
//                                   return (
//                                     <CommandItem
//                                       key={meas}
//                                       value={meas}
//                                       onSelect={() => toggleMeasure(meas)}
//                                       className="cursor-pointer aria-selected:bg-accent"
//                                     >
//                                       <div
//                                         className={cn(
//                                           "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
//                                           isSelected
//                                             ? "bg-primary text-primary-foreground"
//                                             : "opacity-50 [&_svg]:invisible",
//                                         )}
//                                       >
//                                         <Check className="h-4 w-4" />
//                                       </div>
//                                       <span className="flex-1">{meas}</span>
//                                     </CommandItem>
//                                   );
//                                 })}
//                               </CommandGroup>
//                             </CommandList>
//                           </Command>
//                         </PopoverContent>
//                       </Popover>
 
//                       {selectedMeasures.length > 0 && (
//                         <div className="mt-2 flex flex-wrap gap-1.5">
//                           {selectedMeasures.map((meas) => (
//                             <span
//                               key={meas}
//                               className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
//                             >
//                               {meas}
//                               <button
//                                 type="button"
//                                 onClick={() => toggleMeasure(meas)}
//                                 className="ml-1 text-primary/70 hover:text-primary focus:outline-none"
//                               >
//                                 <X className="h-3 w-3" />
//                               </button>
//                             </span>
//                           ))}
//                         </div>
//                       )}
//                     </div>
//                   </>
//                 )}
//               </div>
 
//               <div className="flex-shrink-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
//                 <Button
//                   variant="outline"
//                   onClick={handleClose}
//                   disabled={training}
//                 >
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={handleSave}
//                   disabled={
//                     !selectedFeature ||
//                     loading ||
//                     training ||
//                     (selectedFeature !== "Multi_Step_Forecasting" &&
//                       !selectedTarget) ||
//                     (selectedFeature === "Multi_Step_Forecasting" &&
//                       (selectedDimensions.length === 0 ||
//                         selectedMeasures.length === 0)) ||
//                     !hasChanges
//                   }
//                   className="min-w-[160px]"
//                 >
//                   {training ? (
//                     <>
//                       <Loader2 className="w-4 h-4 mr-2 animate-spin" />
//                       Training Model...
//                     </>
//                   ) : (
//                     "Save Changes & Run"
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// };
 
// export default JobEditModal;
 
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Settings2,
  Loader2,
  CheckCircle2,
  ChevronDown,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useJobs } from "../contexts/JobsContext";
import { Job } from "../types/jobs";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  // CommandInput,    // ← uncomment if you want search
  CommandItem,
  CommandList,
} from "@/components/ui/command";
 
interface JobEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onTrainingComplete?: (job: Job) => void;
}
 
// UI Display Names
const modelsByFeature: Record<string, string[]> = {
  Classification: [
    "Logistic Regression",
    "Random Forest",
    "Gradient Boosting",
    "XGBoost",
  ],
  Regression: ["Ridge", "Random Forest", "Gradient Boosting", "XGBoost"],
  Forecasting: ["ARIMA", "Prophet", "XGBoost", "LightGBM", "CatBoost"],
  Multi_Step_Forecasting: ["XGBoost", "LightGBM", "CatBoost"],
  Clustering: ["KMeans", "KMeans++", "DBSCAN", "GMM"],
  "Anomaly Detection": [
    "Isolation Forest",
    "One-Class SVM",
    "Local Outlier Factor (LOF)",
    "Elliptic Envelope",
  ],
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
 
// ✅ Reverse mapping: API names to UI names
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
 
const featureTypes = Object.keys(modelsByFeature);
 
// Map UI feature names to API task names
const featureToTaskMap: Record<string, string> = {
  Classification: "classification",
  Regression: "regression",
  Forecasting: "forecasting",
  Clustering: "clustering",
  Multi_Step_Forecasting: "multistep_forecasting",
  "Anomaly Detection": "anomaly_detection",
};
 
const taskToFeatureMap: Record<string, string> = {
  classification: "Classification",
  regression: "Regression",
  forecasting: "Forecasting",
  multistep_forecasting: "Multi_Step_Forecasting",
  clustering: "Clustering",
  anomaly_detection: "Anomaly Detection",
};
 
const JobEditModal = ({
  isOpen,
  onClose,
  job,
  onTrainingComplete,
}: JobEditModalProps) => {
  const { updateJob } = useJobs();
  const [selectedFeature, setSelectedFeature] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedTarget, setSelectedTarget] = useState("");
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [blobPath, setBlobPath] = useState("");
  const [loading, setLoading] = useState(false);
  const [training, setTraining] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [dimensions, setDimensions] = useState<string[]>([]);
  const [measures, setMeasures] = useState<string[]>([]);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>([]);
  const [initialDimensions, setInitialDimensions] = useState<string[]>([]);
  const [initialMeasures, setInitialMeasures] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDimensionsDropdown, setShowDimensionsDropdown] = useState(false);
  const [showMeasuresDropdown, setShowMeasuresDropdown] = useState(false);
 
  // ========== EFFECT 1: INITIALIZE STATE FROM JOB ==========
  useEffect(() => {
    if (job && isOpen) {
      console.log("🔍 Initializing modal with job:", job);
 
      let taskType = "";
 
      if (job.task_type) {
        const normalizedTask = job.task_type.toLowerCase().replace(/\s+/g, "_");
        taskType = taskToFeatureMap[normalizedTask] || "";
        console.log("📋 Task from API:", job.task_type, "→", taskType);
      }
 
      if (!taskType && job.category) {
        taskType = job.category;
        console.log("📋 Task from category:", taskType);
      }
 
      if (!taskType && job.feature) {
        taskType = job.feature;
        console.log("📋 Task from feature:", taskType);
      }
 
      setSelectedFeature(taskType);
      console.log("✅ Set feature to:", taskType);
 
      let modelToSet = "";
      if (job.model) {
        if (Object.keys(modelNameToAPI).includes(job.model)) {
          modelToSet = job.model;
        } else {
          const normalizedModel = job.model.toLowerCase();
          modelToSet = apiModelToUI[normalizedModel] || "";
        }
      }
 
      if (!modelToSet && job.best_model) {
        const normalizedModel = job.best_model.toLowerCase();
        modelToSet = apiModelToUI[normalizedModel] || "";
      }
 
      setSelectedModel(modelToSet);
      console.log("✅ Set model to:", modelToSet);
 
      setSelectedTarget(job.target || "");
      console.log("✅ Set target to:", job.target);
 
      setSelectedFeatures(job.features || []);
 
      setHasChanges(false);
      setSuccessMessage(null);
      setError(null);
    }
  }, [job, isOpen]);
 
  // ========== ✅✅✅ EFFECT 2: FETCH DATASET FEATURES (ADD THIS!) ==========
  useEffect(() => {
    if (isOpen && job?.datasetName) {
      console.log("📥 Fetching dataset features for:", job.datasetName);
      fetchDatasetFeatures();
    }
  }, [isOpen, job?.datasetName]);
 
  // ========== EFFECT 3: TRACK CHANGES ==========
  useEffect(() => {
    if (!job) return;
 
    const normalize = (val?: string) =>
      (val || "").toLowerCase().replace(/\s+/g, "_");
 
    const featureChanged =
      normalize(selectedFeature) !== normalize(job.category || job.feature);
 
    const modelChanged = normalize(selectedModel) !== normalize(job.model);
 
    const targetChanged = selectedTarget !== (job.target || "");
 
    let forecastingChanged = false;
 
    if (selectedFeature === "Multi_Step_Forecasting") {
      const dimsChanged =
        JSON.stringify([...selectedDimensions].sort()) !==
        JSON.stringify([...initialDimensions].sort());
 
      const measChanged =
        JSON.stringify([...selectedMeasures].sort()) !==
        JSON.stringify([...initialMeasures].sort());
 
      forecastingChanged = dimsChanged || measChanged;
    }
 
    setHasChanges(
      featureChanged || modelChanged || targetChanged || forecastingChanged,
    );
  }, [
    selectedFeature,
    selectedModel,
    selectedTarget,
    selectedDimensions,
    selectedMeasures,
    job,
  ]);
 
  useEffect(() => {
    if (isOpen && job?.datasetName && selectedFeature) {
      fetchDatasetFeatures();
    }
  }, [selectedFeature]);
 
  const fetchDatasetFeatures = async () => {
    if (!job?.datasetName) {
      setError("Dataset name not found");
      return;
    }
 
    if (!selectedFeature) {
      console.log("Function not selected yet");
      return;
    }
 
    setLoading(true);
    setError(null);
 
    try {
      const userDataString = localStorage.getItem("aivolve_user");
      if (!userDataString) throw new Error("User not found");
 
      const userData = JSON.parse(userDataString);
      const userEmail = userData.email;
      const agentName = userData.agent_name || userData.name || "default";
 
      if (!userEmail) throw new Error("Email not found");
 
      // -----------------------------
      // STEP 1: Get blob_path
      // -----------------------------
      const listFilesUrl = `https://api.veriton.ai/api/service3/list_files?user_email=${encodeURIComponent(
        userEmail,
      )}&agent_name=${encodeURIComponent(agentName)}`;
 
      const listResponse = await fetch(listFilesUrl, {
        method: "GET",
        headers: { accept: "application/json" },
      });
 
      if (!listResponse.ok) {
        throw new Error(`Failed to fetch files list: ${listResponse.status}`);
      }
      const listData = await listResponse.json();
 
      const allFiles = [
        ...(listData.files || []),
        ...(listData.build_model_files || []),
      ];
 
      console.log("All files:", allFiles);
 
      // ✅ Extract filename from veriton path
      const fileNameFromPath = job.veriton_file_path?.split("/").pop();
 
      if (!fileNameFromPath) {
        throw new Error("Invalid veriton file path");
      }
 
      console.log("Looking for filename:", fileNameFromPath);
 
      const matchedFile = allFiles.find(
        (file: any) => file.filename === fileNameFromPath,
      );
 
      if (!matchedFile) {
        console.error(
          "❌ Available files:",
          allFiles.map((f) => f.filename),
        );
        throw new Error(`File not found in list_files: ${fileNameFromPath}`);
      }
 
      const blobPathFromAPI = matchedFile.blob_name;
 
      console.log("✅ Blob path found:", blobPathFromAPI);
 
      // -----------------------------
      // STEP 2: Call task_features
      // -----------------------------
      const task =
        featureToTaskMap[selectedFeature] || selectedFeature.toLowerCase();
 
      const taskFeaturesUrl = `https://api.veriton.ai/api/service3/task_features?blob_path=${encodeURIComponent(
        blobPathFromAPI,
      )}&task=${encodeURIComponent(task)}&user_email=${encodeURIComponent(
        userEmail,
      )}`;
 
      console.log("Calling task_features:", taskFeaturesUrl);
 
      const taskResponse = await fetch(taskFeaturesUrl, {
        method: "GET",
        headers: { accept: "application/json" },
      });
 
      if (!taskResponse.ok) {
        throw new Error(
          `Failed to fetch task features: ${taskResponse.status}`,
        );
      }
 
      const taskData = await taskResponse.json();
 
      console.log("Task features response:", taskData);
 
      // -----------------------------
      // HANDLE MULTI STEP FORECASTING
      // -----------------------------
      if (taskData.task === "multistep_forecasting") {
        console.log("Multi Step Forecasting detected");
 
        const dims = taskData.dimensions || [];
        const meas = taskData.measures || [];
 
        setDimensions(dims);
        setMeasures(meas);
 
        setSelectedDimensions(dims);
        setSelectedMeasures(meas);
 
        // store initial selections
        setInitialDimensions(dims);
        setInitialMeasures(meas);
 
        setAvailableFeatures([]);
        setSelectedTarget("");
      } else {
        // -----------------------------
        // NORMAL TASKS
        // -----------------------------
        const features = taskData.features || [];
        const targets = taskData.targets || [];
 
        setAvailableFeatures(features);
 
        if (!job.target && targets.length > 0) {
          setSelectedTarget(targets[0]);
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to fetch dataset features";
 
      setError(errorMessage);
      console.error("Error fetching dataset features:", err);
 
      setAvailableFeatures([]);
    } finally {
      setLoading(false);
    }
  };
 
  const availableModels = useMemo(() => {
    return selectedFeature ? modelsByFeature[selectedFeature] || [] : [];
  }, [selectedFeature]);
 
  const handleFeatureChange = (value: string) => {
    setSelectedFeature(value);
    setSelectedModel("");
  };
 
  const toggleFeature = (feature: string) => {
    setSelectedFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature],
    );
  };
 
  const toggleDimension = (col: string) => {
    setSelectedDimensions((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    );
  };
 
  const toggleMeasure = (col: string) => {
    setSelectedMeasures((prev) =>
      prev.includes(col) ? prev.filter((c) => c !== col) : [...prev, col],
    );
  };
 
  useEffect(() => {
    if (selectedTarget && selectedFeatures.includes(selectedTarget)) {
      setSelectedFeatures((prev) => prev.filter((f) => f !== selectedTarget));
    }
  }, [selectedTarget]);
 
  const TRAINING_STATUS_API =
    "https://api.veriton.ai/api/service3/training-status";
 
  const handleSave = async () => {
    if (!job) {
      setError("Job not found");
      return;
    }
 
    if (!selectedFeature) {
      setError("Please select a function");
      return;
    }
 
    if (selectedFeature !== "Multi_Step_Forecasting" && !selectedTarget) {
      setError("Please select a target column");
      return;
    }
 
    setTraining(true);
    setError(null);
    setSuccessMessage(null);
 
    try {
      const userDataString = localStorage.getItem("aivolve_user");
      if (!userDataString) throw new Error("User not found");
 
      const userData = JSON.parse(userDataString);
      const userEmail = userData.user_email || userData.email;
 
      if (!userEmail) throw new Error("User email missing");
 
      // ✅ file_path from job summary response
      const filePath = job.veriton_file_path;
 
      if (!filePath) {
        throw new Error("File path not found in job data");
      }
 
      const params = new URLSearchParams();
 
      params.append("file_path", filePath);
      params.append("upload_file_path", "false");
      params.append(
        "task",
        featureToTaskMap[selectedFeature] || selectedFeature.toLowerCase(),
      );
      params.append("user_email", userEmail);
 
      if (selectedFeature === "Multi_Step_Forecasting") {
        const transformationConfig = {
          group_by: selectedDimensions,
          measures: selectedMeasures,
          year_column: "",
          horizon: 12,
          needs_transformation: true,
        };
 
        params.append("target", "target");
        params.append(
          "transformation_config",
          JSON.stringify(transformationConfig),
        );
        params.append("horizon", "12");
      } else {
        params.append("target", selectedTarget);
      }
 
      const apiModelName = selectedModel
        ? modelNameToAPI[selectedModel] ||
          selectedModel.toLowerCase().replace(/\s+/g, "_")
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
 
      console.log("Starting background training...");
 
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
 
      const jobId = startResult.job_id;
 
      pollTrainingStatus(jobId, userEmail);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to start training";
      setError(errorMessage);
      console.error(err);
      setTraining(false);
    }
  };
 
  const pollTrainingStatus = async (jobId: string, userEmail: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(
          `${TRAINING_STATUS_API}/${jobId}?user_email=${encodeURIComponent(
            userEmail,
          )}`,
          {
            method: "GET",
            headers: { accept: "application/json" },
          },
        );
 
        if (!res.ok) return;
 
        const result = await res.json();
 
        console.log("Training status:", result);
 
        if (result.status === "success") {
          clearInterval(interval);
 
          const uiModelName =
            apiModelToUI[result.best_model?.toLowerCase()] || result.best_model;
 
          const updatedJob: Job = {
            ...job!,
            id: result.model_id,
            feature: selectedFeature,
            model: uiModelName,
            category: selectedFeature,
            target: selectedTarget,
            status: "completed",
            task_type: result.task_type,
            testAccuracy: result.primary_score?.toString(),
          };
 
          updateJob(job!.id, updatedJob);
 
          setSuccessMessage(
            `✓ Model trained successfully! ${result.primary_metric}: ${result.primary_score.toFixed(2)}`,
          );
 
          setTraining(false);
 
          setTimeout(() => {
            onClose();
            onTrainingComplete?.(updatedJob);
          }, 1000);
        } else if (result.status === "failed") {
          clearInterval(interval);
 
          console.error("❌ Training failed:", result);
 
          // ✅ Update job as failed
          const failedJob: Job = {
            ...job!,
            status: "failed",
            feature: selectedFeature,
            category: selectedFeature,
            target: selectedTarget,
          };
 
          updateJob(job!.id, failedJob);
 
          // ✅ Show error in UI
          const cleanError = result?.error?.includes(
            "No models were successfully trained",
          )
            ? "Training failed: No models could be trained. Try changing features or dataset."
            : result.message || result.error || "Training failed";
 
          setError(cleanError);
 
          setTraining(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 10000); // Poll every 10 seconds
  };
 
  const handleClose = () => {
    setError(null);
    setSuccessMessage(null);
    setAvailableFeatures([]);
    onClose();
  };
 
  if (!job) return null;
 
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300]"
            onClick={handleClose}
          />
 
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[301] p-4"
          >
            <div
              className="relative w-[550px] max-w-[90vw] max-h-[90vh] overflow-hidden bg-card rounded-2xl border border-border shadow-2xl flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-labelledby="job-edit-modal-title"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex-shrink-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2
                      id="job-edit-modal-title"
                      className="text-lg font-semibold text-foreground"
                    >
                      Edit Job Configuration
                    </h2>
                    {job.datasetName && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Dataset: {job.datasetName}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  disabled={training}
                  className="p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
 
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {successMessage && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <p className="text-green-800 text-sm font-medium">
                      {successMessage}
                    </p>
                  </div>
                )}
 
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                    {!training && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchDatasetFeatures}
                        className="mt-3"
                      >
                        Retry
                      </Button>
                    )}
                  </div>
                )}
 
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Function <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedFeature}
                    onValueChange={handleFeatureChange}
                    disabled={training}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select Function" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-[400]">
                      {featureTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
 
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Model <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={selectedModel}
                    onValueChange={setSelectedModel}
                    disabled={!selectedFeature || training}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue
                        placeholder={
                          selectedFeature
                            ? "Auto-select best model"
                            : "Select function first"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-[400]">
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedFeature !== "Multi_Step_Forecasting" && (
                  <>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Target Column <span className="text-red-500">*</span>
                      </label>
                      <Select
                        value={selectedTarget}
                        onValueChange={setSelectedTarget}
                        disabled={
                          loading || training || availableFeatures.length === 0
                        }
                      >
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select target column" />
                        </SelectTrigger>
                        <SelectContent className="bg-background border border-border z-[400]">
                          {availableFeatures.map((col) => (
                            <SelectItem key={col} value={col}>
                              {col}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Select the column you want to predict
                      </p>
                    </div>
 
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Features{" "}
                        {selectedFeatures.length > 0 &&
                          `(${selectedFeatures.length} selected)`}
                      </label>
 
                      {loading ? (
                        <div className="border border-border rounded-lg p-6 bg-background flex items-center justify-center">
                          <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                          <span className="text-sm text-muted-foreground">
                            Loading features...
                          </span>
                        </div>
                      ) : availableFeatures.length === 0 && !error ? (
                        <div className="border border-border rounded-lg p-6 bg-background text-center">
                          <p className="text-sm text-muted-foreground">
                            No features available
                          </p>
                        </div>
                      ) : (
                        <div className="border border-border rounded-lg p-3 max-h-[200px] overflow-y-auto bg-background">
                          <div className="flex flex-wrap gap-2">
                            {availableFeatures.map((column) => {
                              const isTarget = column === selectedTarget;
                              const isSelected =
                                selectedFeatures.includes(column);
 
                              return (
                                <button
                                  key={column}
                                  onClick={() =>
                                    !isTarget && toggleFeature(column)
                                  }
                                  disabled={training || isTarget}
                                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                                    isTarget
                                      ? "bg-yellow-100 text-yellow-800 border-yellow-300 cursor-not-allowed"
                                      : isSelected
                                        ? "bg-primary text-primary-foreground border-primary"
                                        : "bg-muted text-muted-foreground border-border hover:border-primary/50"
                                  } ${training ? "opacity-50 cursor-not-allowed" : ""}`}
                                  title={
                                    isTarget
                                      ? "Target column (excluded from features)"
                                      : ""
                                  }
                                >
                                  {column}
                                  {isTarget && " (Target)"}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
 
                {selectedFeature === "Multi_Step_Forecasting" && (
                  <>
                    {/* Dimensions */}
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Dimensions <span className="text-red-500">*</span>
                      </label>
 
                      <Popover
                        open={showDimensionsDropdown}
                        onOpenChange={setShowDimensionsDropdown}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={showDimensionsDropdown}
                            className="w-full justify-between h-10 px-3 text-sm bg-background"
                            disabled={training}
                          >
                            {selectedDimensions.length === 0
                              ? "Select dimensions"
                              : `${selectedDimensions.length} selected`}
                            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                          </Button>
                        </PopoverTrigger>
 
                        <PopoverContent
                          side="bottom" // Force preference for opening below
                          align="start"
                          sideOffset={6} // Small gap from trigger
                          avoidCollisions={false} // Prevents flipping to top when space is tight
                          className="w-[var(--radix-popover-trigger-width)] p-0 max-h-60 overflow-hidden z-[500]"
                        >
                          <Command>
                            <CommandList className="max-h-60 overflow-y-auto p-1">
                              <CommandEmpty>No dimensions found.</CommandEmpty>
                              <CommandGroup>
                                {dimensions.map((dim) => {
                                  const isSelected =
                                    selectedDimensions.includes(dim);
                                  return (
                                    <CommandItem
                                      key={dim}
                                      value={dim}
                                      onSelect={() => toggleDimension(dim)}
                                      className="cursor-pointer aria-selected:bg-accent"
                                    >
                                      <div
                                        className={cn(
                                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                          isSelected
                                            ? "bg-primary text-primary-foreground"
                                            : "opacity-50 [&_svg]:invisible",
                                        )}
                                      >
                                        <Check className="h-4 w-4" />
                                      </div>
                                      <span className="flex-1">{dim}</span>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
 
                      {/* Selected tags */}
                      {selectedDimensions.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {selectedDimensions.map((dim) => (
                            <span
                              key={dim}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                            >
                              {dim}
                              <button
                                type="button"
                                onClick={() => toggleDimension(dim)}
                                className="ml-1 text-primary/70 hover:text-primary focus:outline-none"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Measures */}
                    <div className="mt-5">
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Measures <span className="text-red-500">*</span>
                      </label>
 
                      <Popover
                        open={showMeasuresDropdown}
                        onOpenChange={setShowMeasuresDropdown}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={showMeasuresDropdown}
                            className="w-full justify-between h-10 px-3 text-sm bg-background"
                            disabled={training}
                          >
                            {selectedMeasures.length === 0
                              ? "Select measures"
                              : `${selectedMeasures.length} selected`}
                            <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
                          </Button>
                        </PopoverTrigger>
 
                        <PopoverContent
                          className="w-[var(--radix-popover-trigger-width)] p-0 max-h-60 overflow-hidden z-[500]"
                          align="start"
                          sideOffset={6}
                        >
                          <Command>
                            <CommandList className="max-h-60 overflow-y-auto p-1">
                              <CommandEmpty>No measures found.</CommandEmpty>
                              <CommandGroup>
                                {measures.map((meas) => {
                                  const isSelected =
                                    selectedMeasures.includes(meas);
                                  return (
                                    <CommandItem
                                      key={meas}
                                      value={meas}
                                      onSelect={() => toggleMeasure(meas)}
                                      className="cursor-pointer aria-selected:bg-accent"
                                    >
                                      <div
                                        className={cn(
                                          "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                          isSelected
                                            ? "bg-primary text-primary-foreground"
                                            : "opacity-50 [&_svg]:invisible",
                                        )}
                                      >
                                        <Check className="h-4 w-4" />
                                      </div>
                                      <span className="flex-1">{meas}</span>
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
 
                      {selectedMeasures.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {selectedMeasures.map((meas) => (
                            <span
                              key={meas}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20"
                            >
                              {meas}
                              <button
                                type="button"
                                onClick={() => toggleMeasure(meas)}
                                className="ml-1 text-primary/70 hover:text-primary focus:outline-none"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
 
              <div className="flex-shrink-0 bg-card border-t border-border px-6 py-4 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  disabled={training}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={
                    !selectedFeature ||
                    loading ||
                    training ||
                    (selectedFeature !== "Multi_Step_Forecasting" &&
                      !selectedTarget) ||
                    (selectedFeature === "Multi_Step_Forecasting" &&
                      (selectedDimensions.length === 0 ||
                        selectedMeasures.length === 0)) ||
                    !hasChanges
                  }
                  className="min-w-[160px]"
                >
                  {training ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Training Model...
                    </>
                  ) : (
                    "Save Changes & Run"
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
 
export default JobEditModal;
 
 
 