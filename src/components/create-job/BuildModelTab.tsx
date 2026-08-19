// import { useState, useMemo, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion } from "framer-motion";
// import { Sparkles } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useLocation } from "react-router-dom";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import Header from "@/components/layout/Header";
// import { toast } from "sonner";
// import Header1 from "../layout/Header1";

// const modelsByFunction: Record<string, string[]> = {
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
//     "One_Class SVM",
//     "Local Outlier Factor (LOF)",
//     "Elliptic Envelope",
//   ],
//   Multi_Step_Forecasting: ["XGBoost", "CatBoost", "LightGBM"],
// };

// const functionTypes = Object.keys(modelsByFunction);

// const metricsByTask: Record<
//   string,
//   { key: string; label: string; isLowerBetter?: boolean }[]
// > = {
//   Classification: [
//     { key: "accuracy", label: "Accuracy" },
//     { key: "f1", label: "F1 Score" },
//     { key: "precision", label: "Precision" },
//     { key: "recall", label: "Recall" },
//     { key: "roc_auc", label: "ROC-AUC" },
//   ],
//   Regression: [
//     { key: "rmse", label: "RMSE", isLowerBetter: true },
//     { key: "mae", label: "MAE", isLowerBetter: true },
//     { key: "r2", label: "R²" },
//     { key: "mape", label: "MAPE", isLowerBetter: true },
//   ],
//   Forecasting: [
//     { key: "rmse", label: "RMSE", isLowerBetter: true },
//     { key: "mae", label: "MAE", isLowerBetter: true },
//     { key: "r2", label: "R²" },
//     { key: "mape", label: "MAPE", isLowerBetter: true },
//   ],
//   Clustering: [
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

// function modelNameToApiKey(name: string) {
//   if (!name) return name.toLowerCase();
//   const mapping: Record<string, string> = {
//     "Logistic Regression": "logistic_regression",
//     "Random Forest": "random_forest",
//     "RF Regressor": "random_forest",
//     XGBoost: "xgboost",
//     "XGBoost Regressor": "xgboost",
//     "Gradient Boosting": "gradient_boosting",
//     LightGBM: "lightgbm",
//     "LightGBM Regressor": "lightgbm",
//     "Linear/ElasticNet": "ridge",
//     "KMeans++": "kmeans_plusplus",
//     "Isolation Forest": "isolation_forest_fast", // or 'isolation_forest_precise'
//     "Local Outlier Factor (LOF)": "local_outlier_factor",
//     "Elliptic Envelope": "elliptic_envelope",
//     "One-Class SVM": "one_class_svm",
//     KMeans: "kmeans",
//     DBSCAN: "dbscan",
//     GMM: "gmm",
//     ARIMA: "arima",
//     Prophet: "prophet",
//     CatBoost: "catboost",
//     // Add more mappings as needed
//   };
//   return mapping[name] || name.toLowerCase().replace(/ /g, "_");
// }

// const DRIFT_API = "https://api.veriton.ai/api/service3/drift/report";
// const TRAINING_STATUS_API =
//   "https://api.veriton.ai/api/service3/training-status";

// const BuildModelTab = () => {
//   const location = useLocation();
//   // Get dataset from navigation state
//   const filePath = location.state?.filePath || "";
//   const datasetName = location.state?.datasetName || "";
//   const cameFromHub = location.state?.origin === "automlhub";

//   const navigate = useNavigate();
//   const [selectedFunction, setSelectedFunction] = useState("Classification");
//   const [selectedModel, setSelectedModel] = useState<string | undefined>(
//     undefined,
//   );
//   const [selectedTarget, setSelectedTarget] = useState("");
//   const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
//   const [isBuilding, setIsBuilding] = useState(false);
//   const [showResults, setShowResults] = useState(false);
//   const [modelResults, setModelResults] = useState<any>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [primaryMetric, setPrimaryMetric] = useState("");
//   const [primaryScore, setPrimaryScore] = useState(0);
//   const [hasConfigChanged, setHasConfigChanged] = useState(false);
//   const [allModelsResults, setAllModelsResults] = useState<any>(null);
//   const [bestModelKey, setBestModelKey] = useState<string>("");
//   const [blobPath, setBlobPath] = useState<string>("");
//   const [validTargets, setValidTargets] = useState<string[]>([]);
//   const [isFetchingTargets, setIsFetchingTargets] = useState(false);
//   const [textSummary, setTextSummary] = useState<string>("");
//   const [horizon, setHorizon] = useState(12);
//   const [driftReport, setDriftReport] = useState<any>(null);
//   const [isFetchingDrift, setIsFetchingDrift] = useState(false);
//   // ADD THESE NEW STATES (after existing useState declarations)
//   const [analysisMetadata, setAnalysisMetadata] = useState<any>(null);
//   const [needsTransformation, setNeedsTransformation] = useState(false);
//   const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
//   const [selectedMeasures, setSelectedMeasures] = useState<string[]>([]);
//   const [yearColumn, setYearColumn] = useState("");
//   const [allTaskFeatures, setAllTaskFeatures] = useState<any>(null);
//   const registerAbortRef = useRef<AbortController | null>(null);
//   const [blobPathReady, setBlobPathReady] = useState(false);
//   const [jobId, setJobId] = useState<string | null>(null);
//   const [pollError, setPollError] = useState<string | null>(null);
//   const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
//   const pollingRef = useRef(false);
//   const trainingToastRef = useRef<string | number | null>(null);
//   const featureToastRef = useRef<string | number | null>(null);
//   const cameFromJobs1 = location.state?.origin === "jobs1";
//   const [transformationMessage, setTransformationMessage] = useState<
//     string | null
//   >(null);
//   const [initialConfig, setInitialConfig] = useState({
//     function: "Classification",
//     model: "Logistic Regression",
//     target: "",
//     targets: [] as string[], // NEW
//     horizon: 12,
//   });

//   useEffect(() => {
//     return () => {
//       if (pollIntervalRef.current) {
//         clearInterval(pollIntervalRef.current);
//       }
//     };
//   }, []);

//   useEffect(() => {
//   return () => {
//     if (featureToastRef.current) {
//       toast.dismiss(featureToastRef.current);
//     }
//     if (trainingToastRef.current) {
//       toast.dismiss(trainingToastRef.current);
//     }
//   };
// }, []);

//   useEffect(() => {
//     if (!filePath) return;

//     const registerFile = async () => {
//       const userEmail = getUserEmailFromLocal();
//       if (!userEmail) return;

//       try {
//         // ✅ create abort controller
//         registerAbortRef.current = new AbortController();
//         featureToastRef.current = toast.loading("Fetching dataset features...");
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
//           setAnalysisMetadata(json.analysis_metadata);

//           const needsTransform =
//             json.analysis_metadata?.dataset_structure?.needs_transformation ||
//             false;

//           setNeedsTransformation(needsTransform);
//           if (needsTransform) {
//             // Auto-set function
//             setSelectedFunction("Multi_Step_Forecasting");

//             // IMPORTANT: Also sync initialConfig so hasConfigChanged starts as false
//             setInitialConfig({
//               function: "Multi_Step_Forecasting",
//               model: "", // no model selected yet → user must pick one
//               target: "",
//               targets: [],
//               horizon: 12, // or keep current horizon value if you prefer
//             });

//             // Optional but recommended: show message to user
//             toast.info(
//               "This dataset appears to be in wide format and requires transformation. " +
//                 "The function has been automatically set to Multi-Step Forecasting.",
//             );
//           }
//         }

//         if (json.features?.tasks) {
//           setAllTaskFeatures(json.features.tasks);

//           const taskKey =
//             selectedFunction === "Multi_Step_Forecasting"
//               ? "multistep_forecasting"
//               : selectedFunction.toLowerCase().replace(/ /g, "_");

//           setValidTargets(json.features.tasks[taskKey]?.features || []);
//         }

//         setBlobPathReady(true);
//         if (featureToastRef.current) {
//           toast.success("Features fetched successfully!", {
//             id: featureToastRef.current,
//             duration: 3000,
//           });
//         }
//       } catch (err: any) {
//         // ✅ ignore abort error
//         if (err.name === "AbortError") {
//           console.log("Registration API aborted");

//           return;
//         }

//         console.error("File registration error:", err);
//       }
//     };

//     registerFile();

//     // ✅ cleanup
//     return () => {
//       if (registerAbortRef.current) {
//         registerAbortRef.current.abort();
//       }
//     };
//   }, [filePath]);

//   const availableModels = useMemo(() => {
//     return selectedFunction ? modelsByFunction[selectedFunction] || [] : [];
//   }, [selectedFunction]);

//   // ADD THESE AFTER availableModels
//   const dimensions = analysisMetadata?.dataset_structure?.dimensions || [];
//   const measures = analysisMetadata?.dataset_structure?.measures || [];

//   const checkConfigChange = (
//     func: string,
//     model: string,
//     target: string,
//     targets: string[],
//     hor: number,
//   ) => {
//     const changed =
//       func !== initialConfig.function ||
//       model !== initialConfig.model ||
//       target !== initialConfig.target ||
//       JSON.stringify(targets) !== JSON.stringify(initialConfig.targets) ||
//       hor !== initialConfig.horizon;
//     setHasConfigChanged(changed);
//   };

//   const formatTextSummary = (summary: string): string => {
//     if (!summary) return "";

//     // Remove common success headers that we don't want to show twice
//     let cleaned = summary
//       .replace(/^Model trained successfully!?\s*\n*/i, "")
//       .replace(/^Model built successfully!?\s*\n*/i, "")
//       .replace(/^Training completed!?\s*\n*/i, "")
//       .trim();

//     // If after cleaning it's empty or too generic, return nothing
//     if (!cleaned || cleaned.length < 10) {
//       return "";
//     }

//     return cleaned;
//   };

//   const handleFunctionChange = async (value: string) => {
//     if (needsTransformation && value !== "Multi_Step_Forecasting") {
//       return;
//     }

//     setSelectedFunction(value);
//     setSelectedModel(undefined);
//     setSelectedTarget("");
//     setSelectedTargets([]);

//     // Switch targets based on newly selected task
//     if (allTaskFeatures) {
//       const taskKey =
//         value === "Multi_Step_Forecasting"
//           ? "multistep_forecasting"
//           : value.toLowerCase().replace(/ /g, "_");
//       setValidTargets(allTaskFeatures[taskKey]?.features || []);
//     }

//     if (value !== "Multi-Step Forecasting") {
//       setHorizon(12);
//     }

//     checkConfigChange(
//       value,
//       "",
//       "",
//       [],
//       value === "Multi-Step Forecasting" ? horizon : 12,
//     );
//   };

//   const handleModelChange = (value: string) => {
//     setSelectedModel(value);
//     checkConfigChange(
//       selectedFunction,
//       value,
//       selectedTarget,
//       selectedTargets,
//       horizon,
//     );
//   };
//   const handleTargetChange = (value: string) => {
//     setSelectedTarget(value);
//     checkConfigChange(
//       selectedFunction,
//       selectedModel || "",
//       value,
//       selectedTargets,
//       horizon,
//     );
//   };

//   const handleMultiSelectToggle = (value: string) => {
//     let newTargets: string[];

//     if (selectedTargets.includes(value)) {
//       newTargets = selectedTargets.filter((t) => t !== value);
//     } else {
//       newTargets = [...selectedTargets, value];
//     }

//     setSelectedTargets(newTargets);
//     checkConfigChange(
//       selectedFunction,
//       selectedModel || "",
//       selectedTarget,
//       newTargets,
//       horizon,
//     );
//   };

//   // ADD THESE NEW HANDLERS
//   const handleDimensionToggle = (value: string) => {
//     let newDimensions: string[];

//     if (selectedDimensions.includes(value)) {
//       newDimensions = selectedDimensions.filter((d) => d !== value);
//     } else {
//       newDimensions = [...selectedDimensions, value];
//     }

//     setSelectedDimensions(newDimensions);
//     checkConfigChange(
//       selectedFunction,
//       selectedModel || "",
//       selectedTarget,
//       selectedTargets,
//       horizon,
//     );
//   };

//   const handleMeasureToggle = (value: string) => {
//     let newMeasures: string[];

//     if (selectedMeasures.includes(value)) {
//       newMeasures = selectedMeasures.filter((m) => m !== value);
//     } else {
//       newMeasures = [...selectedMeasures, value];
//     }

//     setSelectedMeasures(newMeasures);
//     checkConfigChange(
//       selectedFunction,
//       selectedModel || "",
//       selectedTarget,
//       selectedTargets,
//       horizon,
//     );
//   };

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

//   const fetchDriftReport = async ({
//     mode,
//     modelId,
//   }: {
//     mode: "build" | "test";
//     modelId: string;
//   }) => {
//     const userEmail = getUserEmailFromLocal();
//     if (!userEmail) return;

//     setIsFetchingDrift(true);

//     try {
//       // ✅ URL-encoded body (matches curl)
//       const params = new URLSearchParams();
//       params.append("mode", mode);
//       params.append("user_email", userEmail);

//       if (mode === "build") {
//         params.append("model_id", modelId);
//         params.append("test_result_id", "");
//       }

//       if (mode === "test") {
//         params.append("test_result_id", modelId);
//         params.append("model_id", "");
//       }

//       const res = await fetch(DRIFT_API, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//           accept: "application/json",
//         },
//         body: params.toString(),
//       });

//       if (!res.ok) {
//         const txt = await res.text();
//         throw new Error(`Drift API failed ${res.status}: ${txt}`);
//       }

//       const json = await res.json();
//       console.log("");

//       setDriftReport(json.drift_report);
//     } catch (err) {
//       console.error("Drift fetch error:", err);
//     } finally {
//       setIsFetchingDrift(false);
//     }
//   };

//   const pollTrainingStatus = async (jobId: string) => {
//     const userEmail = getUserEmailFromLocal();
//     if (!userEmail) return;

//     if (pollingRef.current) return; // prevent multiple polling loops
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
//           setIsBuilding(false);
//           pollingRef.current = false; // stop polling

//           if (trainingToastRef.current) {
//             toast.success("Model training completed. Results are ready!", {
//               id: trainingToastRef.current,
//               duration: 3000,
//             });
//           }

//           if (selectedModel) {
//             const modelKey = modelNameToApiKey(selectedModel);
//             const results = json.all_models[modelKey];

//             setModelResults(results);
//             setAllModelsResults(null);
//             setBestModelKey("");
//           } else {
//             setAllModelsResults(json.all_models);
//             setBestModelKey(json.best_model);
//             setModelResults(null);
//           }

//           setPrimaryMetric(json.primary_metric);
//           setPrimaryScore(json.primary_score);
//           setTextSummary(json.text_summary || "");
//           setShowResults(true);
//           setHasConfigChanged(false);

//           if (json.model_id) {
//             await fetchDriftReport({
//               mode: "build",
//               modelId: json.model_id,
//             });
//           }

//           break;
//         }

//         // wait 30 seconds before next poll
//         await new Promise((resolve) => setTimeout(resolve, 30000));
//       }
//     } catch (err) {
//       console.error("Polling error:", err);
//       pollingRef.current = false;
//       setIsBuilding(false);
//     }
//   };

//   const handleBuild = async () => {
//     setError(null);
//     setIsBuilding(true);
//     setShowResults(false);

//     const userEmail = getUserEmailFromLocal();
//     if (!userEmail) {
//       setError("User email not found. Please login again.");
//       setIsBuilding(false);
//       return;
//     }

//     // Validation based on transformation needs
//     if (needsTransformation) {
//       // For wide format data needing transformation
//       if (selectedDimensions.length === 0) {
//         setError("Please select at least one dimension.");
//         setIsBuilding(false);
//         return;
//       }
//       if (selectedMeasures.length === 0) {
//         setError("Please select at least one measure.");
//         setIsBuilding(false);
//         return;
//       }
//     } else {
//       // For normal flow
//       if (selectedFunction === "Multi_Step_Forecasting") {
//         if (selectedTargets.length === 0) {
//           setError("Please select at least one target feature.");
//           setIsBuilding(false);
//           return;
//         }
//       } else {
//         if (!selectedTarget) {
//           setError("Please select a target feature.");
//           setIsBuilding(false);
//           return;
//         }
//       }
//     }

//     // ── Call 2: Actual training ──
//     const formData = new URLSearchParams();
//     formData.append("file_path", filePath);
//     formData.append("upload_file_path", "false");

//     // ✅ Handle task and target based on transformation needs
//     if (needsTransformation) {
//       // For wide format transformation
//       formData.append("task", "multistep_forecasting");
//       formData.append("target", "target"); // ✅ Simple "target" string as per API

//       // Add transformation config
//       const transformConfig = {
//         group_by: selectedDimensions,
//         measures: selectedMeasures,
//         year_column: yearColumn,
//         horizon: horizon,
//         needs_transformation: true,
//       };
//       formData.append("transformation_config", JSON.stringify(transformConfig));
//     } else {
//       // Normal flow
//       formData.append(
//         "task",
//         selectedFunction === "Multi_Step_Forecasting"
//           ? "multistep_forecasting"
//           : selectedFunction.toLowerCase().replace(/ /g, "_"),
//       );

//       if (selectedFunction === "Multi_Step_Forecasting") {
//         formData.append("target", selectedTargets.join(","));
//       } else {
//         formData.append("target", selectedTarget);
//       }
//     }

//     // Continue with rest of the formData appends...
//     formData.append("user_email", userEmail);
//     formData.append("optuna_trials", "2");

//     if (selectedModel) {
//       formData.append("models", modelNameToApiKey(selectedModel));
//     }
//     formData.append("use_feature_selection", "false");
//     formData.append("preprocessing_mode", "simple");
//     formData.append("use_optuna", "true");
//     formData.append("test_size", "0.2");
//     formData.append("use_cleaning", "true");
//     formData.append("time_budget", "180");
//     formData.append("horizon", horizon.toString());

//     try {
//       const res = await fetch(
//         "https://api.veriton.ai/api/service3/build_ml_model_v",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             accept: "application/json",
//           },
//           body: formData.toString(),
//         },
//       );

//       if (!res.ok) {
//         const txt = await res.text();
//         throw new Error(`API error ${res.status}: ${txt}`);
//       }

//       const json = await res.json();

//       /* NEW: job started response */
//       if (json.status === "model has started running") {
//         const jobId = json.job_id;

//         setJobId(jobId);
//         setIsBuilding(true);

//         trainingToastRef.current = toast.loading(
//           "Model training started. This may take a few minutes while results are generated...",
//         );

//         pollTrainingStatus(jobId);

//         return;
//       }

//       // ✅ Fetch drift report after successful build
//       if (json.model_id) {
//         await fetchDriftReport({
//           mode: "build",
//           modelId: json.model_id,
//         });
//       }

//       // Check if single model or all models
//       if (selectedModel) {
//         // Single model selected
//         const modelKey = modelNameToApiKey(selectedModel);
//         const results = json.all_models[modelKey];
//         if (!results) {
//           throw new Error("Selected model not found in response");
//         }
//         setModelResults(results);
//         setAllModelsResults(null);
//         setBestModelKey("");
//       } else {
//         // No model selected - show all models
//         setAllModelsResults(json.all_models);
//         setBestModelKey(json.best_model);
//         setModelResults(null);
//       }

//       setPrimaryMetric(json.primary_metric);
//       setPrimaryScore(json.primary_score);
//       setTextSummary(json.text_summary || "No summary available.");
//       setShowResults(true);

//       setInitialConfig({
//         function: selectedFunction,
//         model: selectedModel || "",
//         target: selectedTarget,
//         targets: selectedTargets,
//         horizon: horizon,
//       });
//       setHasConfigChanged(false);

//       setTimeout(() => {
//         window.scrollTo({
//           top: document.body.scrollHeight,
//           behavior: "smooth",
//         });
//       }, 100);
//     } catch (err: any) {
//       console.error(err);
//       setError(err.message || "An error occurred");
//     }
//   };

//   const canBuild = needsTransformation
//     ? selectedFunction === "Multi_Step_Forecasting" &&
//       selectedModel &&
//       selectedDimensions.length >= 1 &&
//       selectedMeasures.length >= 1 &&
//       horizon >= 1 &&
//       hasConfigChanged
//     : selectedFunction &&
//       (selectedFunction === "Multi_Step_Forecasting"
//         ? selectedTargets.length >= 1
//         : selectedTarget) &&
//       hasConfigChanged;

//   const renderMetricValue = (v: number | undefined) => {
//     return v != null ? v.toFixed(4) : "—";
//   };

//   // Results view - Single Model
//   if (showResults && modelResults) {
//     const metrics = metricsByTask[selectedFunction] || [];
//     const isDataDrift = driftReport?.overall_status === "data_drift";
//     const isPerformanceDrift =
//       driftReport?.performance_drift?.detected === true;

//     return (
//       <div className="min-h-screen bg-background flex flex-col overflow-hidden">
//         {cameFromJobs1 ? <Header1 /> : <Header />}

//         <div className="flex-1 overflow-auto">
//           <main className="px-6 py-6 max-w-7xl mx-auto w-full">
//             <div className="mb-8 flex items-center justify-between">
//               <div>
//                 <h1 className="text-3xl font-bold text-foreground">
//                   Build a Model
//                 </h1>
//                 <p className="text-muted-foreground mt-1">
//                   Configure and train your model using {datasetName}
//                 </p>
//               </div>
//               <div className="flex items-center gap-3">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     if (registerAbortRef.current) {
//                       registerAbortRef.current.abort();
//                     }

//                     // ✅ ADD THIS
//                     if (featureToastRef.current) {
//                       toast.dismiss(featureToastRef.current);
//                     }

//                     if (trainingToastRef.current) {
//                       toast.dismiss(trainingToastRef.current);
//                     }

//                     // ✅ THEN navigate based on origin
//                     if (cameFromJobs1) {
//                       navigate("/workflow/automl/jobs1");
//                     } else if (cameFromHub) {
//                       navigate("/workflow/automl/automlhub");
//                     } else {
//                       navigate("/workflow/automl");
//                     }
//                   }}
//                 >
//                   {cameFromJobs1
//                     ? "Back to Auto AI/ML"
//                     : cameFromHub
//                       ? "Back to Preview"
//                       : "Back to Jobs"}
//                 </Button>
//               </div>
//             </div>

//             {/* Model Information */}
//             <div className="bg-card rounded-xl border border-border p-6 mb-6">
//               <h2 className="text-lg font-bold text-foreground mb-4">
//                 Model Information
//               </h2>
//               <div className="border-t border-border pt-4">
//                 <p className="text-sm text-muted-foreground mb-1">Dataset</p>
//                 <p className="text-foreground font-medium">{datasetName}</p>
//               </div>
//             </div>

//             {/* Configure Training - Editable even after results */}
//             <div className="bg-card rounded-xl border border-border p-6 mb-6">
//               <h2 className="text-lg font-bold text-foreground mb-6">
//                 Configure Training
//               </h2>
//               {transformationMessage && (
//                 <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-300 text-sm">
//                   {transformationMessage}
//                 </div>
//               )}

//               <div
//                 className={`grid gap-4 ${
//                   needsTransformation
//                     ? "grid-cols-4"
//                     : selectedFunction === "Multi_Step_Forecasting"
//                       ? "grid-cols-4"
//                       : "grid-cols-3"
//                 }`}
//               >
//                 {/* Function - Show but disabled if needs transformation */}
//                 <div>
//                   <p className="text-sm text-muted-foreground mb-2">
//                     Choose Function
//                   </p>
//                   <Select
//                     value={selectedFunction}
//                     onValueChange={handleFunctionChange}
//                     disabled={needsTransformation} // Disable if transformation needed
//                   >
//                     <SelectTrigger className="w-full bg-background">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent className="bg-background border border-border z-[100]">
//                       {needsTransformation ? (
//                         <SelectItem value="Multi_Step_Forecasting">
//                           Multi_Step_Forecasting
//                         </SelectItem>
//                       ) : (
//                         functionTypes.map((func) => (
//                           <SelectItem key={func} value={func}>
//                             {func}
//                           </SelectItem>
//                         ))
//                       )}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Model */}
//                 <div>
//                   <p className="text-sm text-muted-foreground mb-2">
//                     Choose Model
//                   </p>
//                   <Select
//                     value={selectedModel}
//                     onValueChange={handleModelChange}
//                   >
//                     <SelectTrigger className="w-full bg-background">
//                       <SelectValue placeholder="Select model" />
//                     </SelectTrigger>
//                     <SelectContent className="bg-background border border-border z-[100]">
//                       {availableModels.map((model) => (
//                         <SelectItem key={model} value={model}>
//                           {model}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Conditional: Show Dimensions/Measures OR regular Target */}
//                 {needsTransformation ? (
//                   <>
//                     {/* Dimensions */}
//                     <div>
//                       <p className="text-sm text-muted-foreground mb-2">
//                         Dimensions (Group By)
//                       </p>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
//                             <span
//                               className={
//                                 selectedDimensions.length > 0
//                                   ? ""
//                                   : "text-muted-foreground"
//                               }
//                             >
//                               {selectedDimensions.length > 0
//                                 ? `${selectedDimensions.length} selected`
//                                 : "Select dimensions"}
//                             </span>
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               width="16"
//                               height="16"
//                               viewBox="0 0 24 24"
//                               fill="none"
//                               stroke="currentColor"
//                               strokeWidth="2"
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               className="h-4 w-4 opacity-50"
//                             >
//                               <polyline points="6 9 12 15 18 9"></polyline>
//                             </svg>
//                           </button>
//                         </PopoverTrigger>
//                         <PopoverContent
//                           className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
//                           align="start"
//                           side="bottom"
//                         >
//                           <div className="max-h-[300px] overflow-y-auto">
//                             {dimensions.length > 0 ? (
//                               dimensions.map((dim: string) => {
//                                 const isSelected =
//                                   selectedDimensions.includes(dim);
//                                 return (
//                                   <div
//                                     key={dim}
//                                     onClick={() => handleDimensionToggle(dim)}
//                                     className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
//                                   >
//                                     <div
//                                       className={`w-4 h-4 border rounded flex items-center justify-center ${
//                                         isSelected
//                                           ? "bg-green-500 border-green-500"
//                                           : "border-gray-300"
//                                       }`}
//                                     >
//                                       {isSelected && (
//                                         <svg
//                                           className="w-3 h-3 text-white"
//                                           fill="none"
//                                           strokeLinecap="round"
//                                           strokeLinejoin="round"
//                                           strokeWidth="2"
//                                           viewBox="0 0 24 24"
//                                           stroke="currentColor"
//                                         >
//                                           <path d="M5 13l4 4L19 7"></path>
//                                         </svg>
//                                       )}
//                                     </div>
//                                     <span className="text-sm">{dim}</span>
//                                   </div>
//                                 );
//                               })
//                             ) : (
//                               <div className="px-4 py-2 text-sm text-muted-foreground">
//                                 No dimensions available
//                               </div>
//                             )}
//                           </div>
//                         </PopoverContent>
//                       </Popover>
//                     </div>

//                     {/* Measures */}
//                     <div>
//                       <p className="text-sm text-muted-foreground mb-2">
//                         Measures
//                       </p>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
//                             <span
//                               className={
//                                 selectedMeasures.length > 0
//                                   ? ""
//                                   : "text-muted-foreground"
//                               }
//                             >
//                               {selectedMeasures.length > 0
//                                 ? `${selectedMeasures.length} selected`
//                                 : "Select measures"}
//                             </span>
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               width="16"
//                               height="16"
//                               viewBox="0 0 24 24"
//                               fill="none"
//                               stroke="currentColor"
//                               strokeWidth="2"
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               className="h-4 w-4 opacity-50"
//                             >
//                               <polyline points="6 9 12 15 18 9"></polyline>
//                             </svg>
//                           </button>
//                         </PopoverTrigger>
//                         <PopoverContent
//                           className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
//                           align="start"
//                           side="bottom"
//                         >
//                           <div className="max-h-[300px] overflow-y-auto">
//                             {measures.length > 0 ? (
//                               measures.map((measure: string) => {
//                                 const isSelected =
//                                   selectedMeasures.includes(measure);
//                                 return (
//                                   <div
//                                     key={measure}
//                                     onClick={() => handleMeasureToggle(measure)}
//                                     className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
//                                   >
//                                     <div
//                                       className={`w-4 h-4 border rounded flex items-center justify-center ${
//                                         isSelected
//                                           ? "bg-green-500 border-green-500"
//                                           : "border-gray-300"
//                                       }`}
//                                     >
//                                       {isSelected && (
//                                         <svg
//                                           className="w-3 h-3 text-white"
//                                           fill="none"
//                                           strokeLinecap="round"
//                                           strokeLinejoin="round"
//                                           strokeWidth="2"
//                                           viewBox="0 0 24 24"
//                                           stroke="currentColor"
//                                         >
//                                           <path d="M5 13l4 4L19 7"></path>
//                                         </svg>
//                                       )}
//                                     </div>
//                                     <span className="text-sm">{measure}</span>
//                                   </div>
//                                 );
//                               })
//                             ) : (
//                               <div className="px-4 py-2 text-sm text-muted-foreground">
//                                 No measures available
//                               </div>
//                             )}
//                           </div>
//                         </PopoverContent>
//                       </Popover>
//                     </div>
//                   </>
//                 ) : (
//                   // ✅ COMPLETE TARGET FIELD - NOW WITH ACTUAL CODE
//                   <div>
//                     <p className="text-sm text-muted-foreground mb-2">
//                       Choose Target
//                       {selectedFunction === "Multi_Step_Forecasting"
//                         ? "s (Select multiple)"
//                         : ""}
//                     </p>

//                     {selectedFunction === "Multi_Step_Forecasting" ? (
//                       // Multi-select for Multi_Step_Forecasting
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <button className="w-full bg-background border border-input rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground">
//                             {selectedTargets.length > 0
//                               ? `${selectedTargets.length} selected`
//                               : "Select targets"}
//                           </button>
//                         </PopoverTrigger>
//                         <PopoverContent
//                           className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
//                           align="start"
//                           side="bottom"
//                         >
//                           <div className="max-h-[300px] overflow-y-auto">
//                             {!blobPathReady ? (
//                               <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
//                                 <svg
//                                   className="animate-spin h-3 w-3"
//                                   xmlns="http://www.w3.org/2000/svg"
//                                   fill="none"
//                                   viewBox="0 0 24 24"
//                                 >
//                                   <circle
//                                     className="opacity-25"
//                                     cx="12"
//                                     cy="12"
//                                     r="10"
//                                     stroke="currentColor"
//                                     strokeWidth="4"
//                                   ></circle>
//                                   <path
//                                     className="opacity-75"
//                                     fill="currentColor"
//                                     d="M4 12a8 8 0 018-8v8z"
//                                   ></path>
//                                 </svg>
//                                 Loading targets...
//                               </div>
//                             ) : validTargets.length > 0 ? (
//                               validTargets.map((col) => {
//                                 const isSelected =
//                                   selectedTargets.includes(col);
//                                 return (
//                                   <div
//                                     key={col}
//                                     onClick={() => handleMultiSelectToggle(col)}
//                                     className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
//                                   >
//                                     <div
//                                       className={`w-4 h-4 border rounded flex items-center justify-center ${
//                                         isSelected
//                                           ? "bg-green-500 border-green-500"
//                                           : "border-gray-300"
//                                       }`}
//                                     >
//                                       {isSelected && (
//                                         <svg
//                                           className="w-3 h-3 text-white"
//                                           fill="none"
//                                           strokeLinecap="round"
//                                           strokeLinejoin="round"
//                                           strokeWidth="2"
//                                           viewBox="0 0 24 24"
//                                           stroke="currentColor"
//                                         >
//                                           <path d="M5 13l4 4L19 7"></path>
//                                         </svg>
//                                       )}
//                                     </div>
//                                     <span className="text-sm">{col}</span>
//                                   </div>
//                                 );
//                               })
//                             ) : (
//                               <div className="px-4 py-2 text-sm text-muted-foreground">
//                                 No valid targets
//                               </div>
//                             )}
//                           </div>
//                         </PopoverContent>
//                       </Popover>
//                     ) : (
//                       // Single-select for other functions
//                       <Select
//                         value={selectedTarget}
//                         onValueChange={handleTargetChange}
//                       >
//                         <SelectTrigger className="w-full bg-background">
//                           <SelectValue placeholder="Select target" />
//                         </SelectTrigger>
//                         <SelectContent
//                           className="bg-background border border-border z-[100]"
//                           position="popper"
//                           sideOffset={5}
//                           align="start"
//                           side="bottom"
//                         >
//                           {!blobPathReady ? (
//                             <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
//                               <svg
//                                 className="animate-spin h-3 w-3"
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 fill="none"
//                                 viewBox="0 0 24 24"
//                               >
//                                 <circle
//                                   className="opacity-25"
//                                   cx="12"
//                                   cy="12"
//                                   r="10"
//                                   stroke="currentColor"
//                                   strokeWidth="4"
//                                 ></circle>
//                                 <path
//                                   className="opacity-75"
//                                   fill="currentColor"
//                                   d="M4 12a8 8 0 018-8v8z"
//                                 ></path>
//                               </svg>
//                               Loading targets...
//                             </div>
//                           ) : validTargets.length > 0 ? (
//                             validTargets.map((col) => (
//                               <SelectItem key={col} value={col}>
//                                 {col}
//                               </SelectItem>
//                             ))
//                           ) : (
//                             <div className="px-4 py-2 text-sm text-muted-foreground">
//                               No valid targets
//                             </div>
//                           )}
//                         </SelectContent>
//                       </Select>
//                     )}
//                   </div>
//                 )}

//                 {/* Horizon - Show for both cases */}
//                 {(selectedFunction === "Multi_Step_Forecasting" ||
//                   needsTransformation) && (
//                   <div>
//                     <p className="text-sm text-muted-foreground mb-2">
//                       Horizon
//                     </p>
//                     <input
//                       type="number"
//                       value={horizon}
//                       onChange={(e) => {
//                         setHorizon(Number(e.target.value));
//                         checkConfigChange(
//                           selectedFunction,
//                           selectedModel || "",
//                           selectedTarget,
//                           selectedTargets,
//                           Number(e.target.value),
//                         );
//                       }}
//                       className="w-full bg-background border border-border rounded-md px-3 py-2"
//                       min="1"
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Build Button */}
//             <Button
//               onClick={handleBuild}
//               disabled={!canBuild || isBuilding}
//               size="sm"
//               className={!canBuild && !isBuilding ? "opacity-50" : ""}
//             >
//               {isBuilding ? (
//                 "Building..."
//               ) : (
//                 <>
//                   Build Model
//                   <Sparkles className="w-4 h-4 ml-2" />
//                 </>
//               )}
//             </Button>

//             {/* Train vs Test Results */}
//             <div className="bg-card rounded-xl border border-border p-6 mt-6">
//               <h2 className="text-lg font-bold text-foreground mb-6">
//                 Train vs Test Results
//               </h2>
//               <div className="overflow-x-auto">
//                 <table className="w-full">
//                   <thead>
//                     <tr className="border-b border-border">
//                       <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground"></th>
//                       {metrics.map((spec) => (
//                         <th
//                           key={spec.key}
//                           className="text-left py-3 px-4 text-sm font-medium text-primary uppercase tracking-wide"
//                         >
//                           {spec.label}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     <tr className="border-b border-border/50">
//                       <td className="py-4 px-4 text-foreground font-medium">
//                         Training Results
//                       </td>
//                       {metrics.map((spec) => (
//                         <td
//                           key={spec.key}
//                           className="py-4 px-4 text-foreground"
//                         >
//                           {renderMetricValue(modelResults.train[spec.key])}
//                           {spec.key === primaryMetric && (
//                             <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
//                               Train {spec.label}
//                             </span>
//                           )}
//                         </td>
//                       ))}
//                     </tr>
//                     <tr>
//                       <td className="py-4 px-4 text-foreground font-medium">
//                         Testing Results
//                       </td>
//                       {metrics.map((spec) => (
//                         <td
//                           key={spec.key}
//                           className="py-4 px-4 text-foreground"
//                         >
//                           {renderMetricValue(modelResults.test[spec.key])}
//                           {spec.key === primaryMetric && (
//                             <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
//                               Test {spec.label}
//                             </span>
//                           )}
//                         </td>
//                       ))}
//                     </tr>
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//             {/* </div> */}
//             {/* </main> */}
//             {/* NEW: Text Summary - Shown only after successful build */}

//             {textSummary && (
//               <motion.div
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.6 }}
//                 className="relative bg-card rounded-xl border border-border p-6 mt-6 border-l-4 border-l-indigo-500 max-w-7xl mx-auto w-full"
//               >
//                 {/* Badge */}
//                 <div className="absolute top-4 right-4">
//                   <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
//                     Model Insights
//                   </span>
//                 </div>

//                 {/* Header */}
//                 <div className="flex items-center gap-3 mb-4">
//                   <div className="p-2 rounded-md bg-indigo-100">
//                     <Sparkles className="w-5 h-5 text-indigo-600" />
//                   </div>
//                   <h3 className="text-lg font-bold text-foreground">
//                     Model Insights & Explanation
//                   </h3>
//                 </div>

//                 {/* Content */}
//                 <div className="space-y-4 text-sm leading-relaxed text-foreground">
//                   {textSummary
//                     .replace(/^Model trained successfully!?\s*\n*/gim, "")
//                     .replace(/^Model built successfully!?\s*\n*/gim, "")
//                     .replace(/^Training completed!?\s*\n*/gim, "")
//                     .trim()
//                     .split("\n")
//                     .map((line, i) => {
//                       const trimmed = line.trim();

//                       // Spacer for empty lines
//                       if (!trimmed) return <div key={i} className="h-2" />;

//                       // Section headers
//                       if (
//                         /^(Best model|Performance|Why this worked|Note|Key insights|Explanation|Top features):/i.test(
//                           trimmed,
//                         )
//                       ) {
//                         return (
//                           <p
//                             key={i}
//                             className="font-semibold text-foreground text-base mt-4 mb-2"
//                           >
//                             {trimmed}
//                           </p>
//                         );
//                       }

//                       // Bullet points
//                       if (/^[•\-\*]\s/.test(trimmed)) {
//                         return (
//                           <p key={i} className="flex items-start gap-2">
//                             <span className="text-indigo-600 mt-1 text-lg leading-none">
//                               •
//                             </span>
//                             <span>
//                               {trimmed.replace(/^[•\-\*]\s*/, "").trim()}
//                             </span>
//                           </p>
//                         );
//                       }

//                       // Normal text
//                       return (
//                         <p key={i} className="text-muted-foreground">
//                           {trimmed}
//                         </p>
//                       );
//                     })}
//                 </div>
//               </motion.div>
//             )}

//             {driftReport && (
//               <div className="max-w-7xl mx-auto w-full">
//                 <div
//                   className={`relative bg-card rounded-xl border border-border p-6 mt-6
//       ${
//         isDataDrift
//           ? "border-l-4 border-l-amber-500"
//           : isPerformanceDrift
//             ? "border-l-4 border-l-red-500"
//             : "border-l-4 border-l-green-500"
//       }`}
//                 >
//                   {/* Status Badge */}
//                   <div className="absolute top-4 right-4">
//                     {isDataDrift && (
//                       <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
//                         Data Drift
//                       </span>
//                     )}
//                     {isPerformanceDrift && (
//                       <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
//                         Performance Drift
//                       </span>
//                     )}
//                     {!isDataDrift && !isPerformanceDrift && (
//                       <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
//                         Stable
//                       </span>
//                     )}
//                   </div>

//                   {/* Header */}
//                   <div className="flex items-center gap-3 mb-2">
//                     <span className="text-xl">
//                       {isDataDrift ? "⚠️" : isPerformanceDrift ? "📉" : "✅"}
//                     </span>
//                     <h2 className="text-lg font-bold text-foreground">
//                       Drift Monitoring
//                     </h2>
//                   </div>

//                   {/* Drift Status Message */}
//                   <div className="mb-4">
//                     {isDataDrift && (
//                       <p className="text-amber-600 font-bold text-base">
//                         Data Drift Detected
//                       </p>
//                     )}

//                     {isPerformanceDrift && (
//                       <p className="text-red-600 font-bold text-base">
//                         Performance Drift Detected
//                       </p>
//                     )}

//                     {!isDataDrift && !isPerformanceDrift && (
//                       <p className="text-green-600 font-bold text-base">
//                         No Drift Detected – Model is Stable
//                       </p>
//                     )}

//                     <p className="text-muted-foreground mt-2">
//                       {driftReport?.summary_message}
//                     </p>
//                   </div>

//                   {/* Metadata */}
//                   <div className="mb-6">
//                     <p className="text-sm text-muted-foreground">
//                       Total Model Versions
//                     </p>
//                     <p className="text-foreground font-semibold text-lg">
//                       {driftReport?.total_versions ?? "—"}
//                     </p>
//                   </div>

//                   {/* ===================== DATA DRIFT ===================== */}
//                   <h3 className="text-base font-semibold text-foreground mb-3">
//                     Data Drift Details
//                   </h3>

//                   <div className="grid grid-cols-3 gap-4 mb-4">
//                     <div>
//                       <p className="text-sm text-muted-foreground">
//                         Overall PSI
//                       </p>
//                       <p
//                         className={`text-lg font-bold ${
//                           driftReport?.data_drift?.overall_psi > 0.25
//                             ? "text-amber-600"
//                             : "text-foreground"
//                         }`}
//                       >
//                         {driftReport?.data_drift?.overall_psi ?? "—"}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-sm text-muted-foreground">
//                         Drifted Features
//                       </p>
//                       <p className="text-lg font-bold text-foreground">
//                         {driftReport?.data_drift?.drifted_features_count ?? 0}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-sm text-muted-foreground">Status</p>
//                       <p className="capitalize text-foreground font-medium">
//                         {driftReport?.data_drift?.status ?? "stable"}
//                       </p>
//                     </div>
//                   </div>

//                   {/* Drifted Features */}
//                   {driftReport?.data_drift?.drifted_features?.length > 0 && (
//                     <div className="mt-3">
//                       <p className="text-sm text-muted-foreground mb-2">
//                         Drifted Columns
//                       </p>
//                       <div className="flex flex-wrap gap-2">
//                         {driftReport?.data_drift?.drifted_features.map(
//                           (f: string) => (
//                             <span
//                               key={f}
//                               className="px-3 py-1 text-xs rounded-full
//                 bg-amber-100 text-amber-900
//                 border border-amber-200"
//                             >
//                               {f}
//                             </span>
//                           ),
//                         )}
//                       </div>
//                     </div>
//                   )}

//                   {driftReport?.details && (
//                     <p className="mt-4 text-sm text-muted-foreground whitespace-pre-line">
//                       {driftReport?.details}
//                     </p>
//                   )}

//                   {/* ===================== PERFORMANCE DRIFT ===================== */}
//                   <h3 className="text-base font-semibold text-foreground mb-3 mt-6">
//                     Performance Drift Details
//                   </h3>

//                   <div className="grid grid-cols-3 gap-4">
//                     <div>
//                       <p className="text-sm text-muted-foreground">
//                         Baseline Metric
//                       </p>
//                       <p className="text-lg font-bold text-foreground">
//                         {driftReport?.performance_drift?.baseline_metric ?? "—"}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-sm text-muted-foreground">
//                         Current Metric
//                       </p>
//                       <p className="text-lg font-bold text-foreground">
//                         {driftReport?.performance_drift?.current_metric ?? "—"}
//                       </p>
//                     </div>

//                     <div>
//                       <p className="text-sm text-muted-foreground">Change %</p>
//                       <p className="text-lg font-bold text-foreground">
//                         {driftReport?.performance_drift?.change_percent ?? "0"}%
//                       </p>
//                     </div>
//                   </div>

//                   {/* Recommendation */}
//                   <div className="mt-6 rounded-md bg-muted/50 p-4">
//                     <p className="text-sm font-semibold text-foreground">
//                       Recommendation
//                     </p>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       {driftReport?.recommendation}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </main>
//         </div>
//       </div>
//     );
//   }

//   // Results view - All Models
//   if (showResults && allModelsResults) {
//     const metrics = metricsByTask[selectedFunction] || [];
//     const modelKeys = Object.keys(allModelsResults);

//     // Sort so best model comes first
//     const sortedModelKeys = [
//       bestModelKey,
//       ...modelKeys.filter((k) => k !== bestModelKey),
//     ];
//     const isDataDrift = driftReport?.overall_status === "data_drift";
//     const isPerformanceDrift = driftReport.performance_drift?.detected === true;

//     return (
//       <div className="min-h-screen bg-background flex flex-col overflow-hidden">
//         <Header />

//         <div className="flex-1 overflow-auto">
//           <main className="px-6 py-6 max-w-7xl mx-auto w-full">
//             <div className="mb-8 flex items-center justify-between">
//               <div>
//                 <h1 className="text-3xl font-bold text-foreground">
//                   Build a Model
//                 </h1>
//                 <p className="text-muted-foreground mt-1">
//                   Configure and train your model using {datasetName}
//                 </p>
//               </div>
//               <div className="flex items-center gap-3">
//                 {/* <Button
//                   variant='outline'
//                   onClick={() =>
//                     navigate('/workflow/automl/compare', {
//                       state: { mode: 'compare' }
//                     })
//                   }
//                 >
//                   Compare Models
//                 </Button> */}

//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     if (featureToastRef.current)
//                       toast.dismiss(featureToastRef.current);
//                     if (trainingToastRef.current)
//                       toast.dismiss(trainingToastRef.current);

//                     navigate("/workflow/automl/select-dataset");
//                   }}
//                 >
//                   Back to Dataset
//                 </Button>
//               </div>
//             </div>

//             {/* Model Information */}
//             <div className="bg-card rounded-xl border border-border p-6 mb-6">
//               <h2 className="text-lg font-bold text-foreground mb-4">
//                 Model Information
//               </h2>
//               <div className="border-t border-border pt-4">
//                 <p className="text-sm text-muted-foreground mb-1">Dataset</p>
//                 <p className="text-foreground font-medium">{datasetName}</p>
//               </div>
//             </div>

//             {/* Configure Training - Editable even after results */}
//             <div className="bg-card rounded-xl border border-border p-6 mb-6">
//               <h2 className="text-lg font-bold text-foreground mb-6">
//                 Configure Training
//               </h2>

//               <div
//                 className={`grid gap-4 ${
//                   needsTransformation
//                     ? "grid-cols-4"
//                     : selectedFunction === "Multi_Step_Forecasting"
//                       ? "grid-cols-4"
//                       : "grid-cols-3"
//                 }`}
//               >
//                 {/* Function - Show but disabled if needs transformation */}
//                 <div>
//                   <p className="text-sm text-muted-foreground mb-2">
//                     Choose Function
//                   </p>
//                   <Select
//                     value={selectedFunction}
//                     onValueChange={handleFunctionChange}
//                     disabled={needsTransformation} // Disable if transformation needed
//                   >
//                     <SelectTrigger className="w-full bg-background">
//                       <SelectValue />
//                     </SelectTrigger>
//                     <SelectContent className="bg-background border border-border z-[100]">
//                       {needsTransformation ? (
//                         <SelectItem value="Multi_Step_Forecasting">
//                           Multi_Step_Forecasting
//                         </SelectItem>
//                       ) : (
//                         functionTypes.map((func) => (
//                           <SelectItem key={func} value={func}>
//                             {func}
//                           </SelectItem>
//                         ))
//                       )}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Model */}
//                 <div>
//                   <p className="text-sm text-muted-foreground mb-2">
//                     Choose Model
//                   </p>
//                   <Select
//                     value={selectedModel}
//                     onValueChange={handleModelChange}
//                   >
//                     <SelectTrigger className="w-full bg-background">
//                       <SelectValue placeholder="Select model" />
//                     </SelectTrigger>
//                     <SelectContent className="bg-background border border-border z-[100]">
//                       {availableModels.map((model) => (
//                         <SelectItem key={model} value={model}>
//                           {model}
//                         </SelectItem>
//                       ))}
//                     </SelectContent>
//                   </Select>
//                 </div>

//                 {/* Conditional: Show Dimensions/Measures OR regular Target */}
//                 {needsTransformation ? (
//                   <>
//                     {/* Dimensions */}
//                     <div>
//                       <p className="text-sm text-muted-foreground mb-2">
//                         Dimensions (Group By)
//                       </p>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
//                             <span
//                               className={
//                                 selectedDimensions.length > 0
//                                   ? ""
//                                   : "text-muted-foreground"
//                               }
//                             >
//                               {selectedDimensions.length > 0
//                                 ? `${selectedDimensions.length} selected`
//                                 : "Select dimensions"}
//                             </span>
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               width="16"
//                               height="16"
//                               viewBox="0 0 24 24"
//                               fill="none"
//                               stroke="currentColor"
//                               strokeWidth="2"
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               className="h-4 w-4 opacity-50"
//                             >
//                               <polyline points="6 9 12 15 18 9"></polyline>
//                             </svg>
//                           </button>
//                         </PopoverTrigger>
//                         <PopoverContent
//                           className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
//                           align="start"
//                           side="bottom"
//                         >
//                           <div className="max-h-[300px] overflow-y-auto">
//                             {dimensions.length > 0 ? (
//                               dimensions.map((dim: string) => {
//                                 const isSelected =
//                                   selectedDimensions.includes(dim);
//                                 return (
//                                   <div
//                                     key={dim}
//                                     onClick={() => handleDimensionToggle(dim)}
//                                     className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
//                                   >
//                                     <div
//                                       className={`w-4 h-4 border rounded flex items-center justify-center ${
//                                         isSelected
//                                           ? "bg-green-500 border-green-500"
//                                           : "border-gray-300"
//                                       }`}
//                                     >
//                                       {isSelected && (
//                                         <svg
//                                           className="w-3 h-3 text-white"
//                                           fill="none"
//                                           strokeLinecap="round"
//                                           strokeLinejoin="round"
//                                           strokeWidth="2"
//                                           viewBox="0 0 24 24"
//                                           stroke="currentColor"
//                                         >
//                                           <path d="M5 13l4 4L19 7"></path>
//                                         </svg>
//                                       )}
//                                     </div>
//                                     <span className="text-sm">{dim}</span>
//                                   </div>
//                                 );
//                               })
//                             ) : (
//                               <div className="px-4 py-2 text-sm text-muted-foreground">
//                                 No dimensions available
//                               </div>
//                             )}
//                           </div>
//                         </PopoverContent>
//                       </Popover>
//                     </div>

//                     {/* Measures */}
//                     <div>
//                       <p className="text-sm text-muted-foreground mb-2">
//                         Measures
//                       </p>
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
//                             <span
//                               className={
//                                 selectedMeasures.length > 0
//                                   ? ""
//                                   : "text-muted-foreground"
//                               }
//                             >
//                               {selectedMeasures.length > 0
//                                 ? `${selectedMeasures.length} selected`
//                                 : "Select measures"}
//                             </span>
//                             <svg
//                               xmlns="http://www.w3.org/2000/svg"
//                               width="16"
//                               height="16"
//                               viewBox="0 0 24 24"
//                               fill="none"
//                               stroke="currentColor"
//                               strokeWidth="2"
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                               className="h-4 w-4 opacity-50"
//                             >
//                               <polyline points="6 9 12 15 18 9"></polyline>
//                             </svg>
//                           </button>
//                         </PopoverTrigger>
//                         <PopoverContent
//                           className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
//                           align="start"
//                           side="bottom"
//                         >
//                           <div className="max-h-[300px] overflow-y-auto">
//                             {measures.length > 0 ? (
//                               measures.map((measure: string) => {
//                                 const isSelected =
//                                   selectedMeasures.includes(measure);
//                                 return (
//                                   <div
//                                     key={measure}
//                                     onClick={() => handleMeasureToggle(measure)}
//                                     className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
//                                   >
//                                     <div
//                                       className={`w-4 h-4 border rounded flex items-center justify-center ${
//                                         isSelected
//                                           ? "bg-green-500 border-green-500"
//                                           : "border-gray-300"
//                                       }`}
//                                     >
//                                       {isSelected && (
//                                         <svg
//                                           className="w-3 h-3 text-white"
//                                           fill="none"
//                                           strokeLinecap="round"
//                                           strokeLinejoin="round"
//                                           strokeWidth="2"
//                                           viewBox="0 0 24 24"
//                                           stroke="currentColor"
//                                         >
//                                           <path d="M5 13l4 4L19 7"></path>
//                                         </svg>
//                                       )}
//                                     </div>
//                                     <span className="text-sm">{measure}</span>
//                                   </div>
//                                 );
//                               })
//                             ) : (
//                               <div className="px-4 py-2 text-sm text-muted-foreground">
//                                 No measures available
//                               </div>
//                             )}
//                           </div>
//                         </PopoverContent>
//                       </Popover>
//                     </div>
//                   </>
//                 ) : (
//                   // ✅ COMPLETE TARGET FIELD - NOW WITH ACTUAL CODE
//                   <div>
//                     <p className="text-sm text-muted-foreground mb-2">
//                       Choose Target
//                       {selectedFunction === "Multi_Step_Forecasting"
//                         ? "s (Select multiple)"
//                         : ""}
//                     </p>

//                     {selectedFunction === "Multi_Step_Forecasting" ? (
//                       // Multi-select for Multi_Step_Forecasting
//                       <Popover>
//                         <PopoverTrigger asChild>
//                           <button className="w-full bg-background border border-input rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground">
//                             {selectedTargets.length > 0
//                               ? `${selectedTargets.length} selected`
//                               : "Select targets"}
//                           </button>
//                         </PopoverTrigger>
//                         <PopoverContent
//                           className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
//                           align="start"
//                           side="bottom"
//                         >
//                           <div className="max-h-[300px] overflow-y-auto">
//                             {!blobPathReady ? (
//                               <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
//                                 <svg
//                                   className="animate-spin h-3 w-3"
//                                   xmlns="http://www.w3.org/2000/svg"
//                                   fill="none"
//                                   viewBox="0 0 24 24"
//                                 >
//                                   <circle
//                                     className="opacity-25"
//                                     cx="12"
//                                     cy="12"
//                                     r="10"
//                                     stroke="currentColor"
//                                     strokeWidth="4"
//                                   ></circle>
//                                   <path
//                                     className="opacity-75"
//                                     fill="currentColor"
//                                     d="M4 12a8 8 0 018-8v8z"
//                                   ></path>
//                                 </svg>
//                                 Loading targets...
//                               </div>
//                             ) : validTargets.length > 0 ? (
//                               validTargets.map((col) => {
//                                 const isSelected =
//                                   selectedTargets.includes(col);
//                                 return (
//                                   <div
//                                     key={col}
//                                     onClick={() => handleMultiSelectToggle(col)}
//                                     className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
//                                   >
//                                     <div
//                                       className={`w-4 h-4 border rounded flex items-center justify-center ${
//                                         isSelected
//                                           ? "bg-green-500 border-green-500"
//                                           : "border-gray-300"
//                                       }`}
//                                     >
//                                       {isSelected && (
//                                         <svg
//                                           className="w-3 h-3 text-white"
//                                           fill="none"
//                                           strokeLinecap="round"
//                                           strokeLinejoin="round"
//                                           strokeWidth="2"
//                                           viewBox="0 0 24 24"
//                                           stroke="currentColor"
//                                         >
//                                           <path d="M5 13l4 4L19 7"></path>
//                                         </svg>
//                                       )}
//                                     </div>
//                                     <span className="text-sm">{col}</span>
//                                   </div>
//                                 );
//                               })
//                             ) : (
//                               <div className="px-4 py-2 text-sm text-muted-foreground">
//                                 No valid targets
//                               </div>
//                             )}
//                           </div>
//                         </PopoverContent>
//                       </Popover>
//                     ) : (
//                       // Single-select for other functions
//                       <Select
//                         value={selectedTarget}
//                         onValueChange={handleTargetChange}
//                       >
//                         <SelectTrigger className="w-full bg-background">
//                           <SelectValue placeholder="Select target" />
//                         </SelectTrigger>
//                         <SelectContent
//                           className="bg-background border border-border z-[100]"
//                           position="popper"
//                           sideOffset={5}
//                           align="start"
//                           side="bottom"
//                         >
//                           {!blobPathReady ? (
//                             <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
//                               <svg
//                                 className="animate-spin h-3 w-3"
//                                 xmlns="http://www.w3.org/2000/svg"
//                                 fill="none"
//                                 viewBox="0 0 24 24"
//                               >
//                                 <circle
//                                   className="opacity-25"
//                                   cx="12"
//                                   cy="12"
//                                   r="10"
//                                   stroke="currentColor"
//                                   strokeWidth="4"
//                                 ></circle>
//                                 <path
//                                   className="opacity-75"
//                                   fill="currentColor"
//                                   d="M4 12a8 8 0 018-8v8z"
//                                 ></path>
//                               </svg>
//                               Loading targets...
//                             </div>
//                           ) : validTargets.length > 0 ? (
//                             validTargets.map((col) => (
//                               <SelectItem key={col} value={col}>
//                                 {col}
//                               </SelectItem>
//                             ))
//                           ) : (
//                             <div className="px-4 py-2 text-sm text-muted-foreground">
//                               No valid targets
//                             </div>
//                           )}
//                         </SelectContent>
//                       </Select>
//                     )}
//                   </div>
//                 )}

//                 {/* Horizon - Show for both cases */}
//                 {(selectedFunction === "Multi_Step_Forecasting" ||
//                   needsTransformation) && (
//                   <div>
//                     <p className="text-sm text-muted-foreground mb-2">
//                       Horizon
//                     </p>
//                     <input
//                       type="number"
//                       value={horizon}
//                       onChange={(e) => {
//                         setHorizon(Number(e.target.value));
//                         checkConfigChange(
//                           selectedFunction,
//                           selectedModel || "",
//                           selectedTarget,
//                           selectedTargets,
//                           Number(e.target.value),
//                         );
//                       }}
//                       className="w-full bg-background border border-border rounded-md px-3 py-2"
//                       min="1"
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Build Button */}
//             <Button
//               onClick={handleBuild}
//               disabled={!canBuild || isBuilding}
//               size="sm"
//               className={!canBuild && !isBuilding ? "opacity-50" : ""}
//             >
//               {isBuilding ? (
//                 "Building..."
//               ) : (
//                 <>
//                   Build Model
//                   <Sparkles className="w-4 h-4 ml-2" />
//                 </>
//               )}
//             </Button>

//             {/* All Models Results */}
//             {sortedModelKeys.map((modelKey, index) => {
//               const modelData = allModelsResults[modelKey];
//               const isBestModel = modelKey === bestModelKey;

//               return (
//                 <div
//                   key={modelKey}
//                   className="bg-card rounded-xl border border-border p-6 mt-6"
//                 >
//                   <div className="flex items-center gap-3 mb-6">
//                     <h2 className="text-lg font-bold text-foreground capitalize">
//                       {modelKey.replace(/_/g, " ")}
//                     </h2>
//                     {isBestModel && (
//                       <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full">
//                         Best Model
//                       </span>
//                     )}
//                   </div>
//                   <div className="overflow-x-auto">
//                     <table className="w-full">
//                       <thead>
//                         <tr className="border-b border-border">
//                           <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground"></th>
//                           {metrics.map((spec) => (
//                             <th
//                               key={spec.key}
//                               className="text-left py-3 px-4 text-sm font-medium text-primary uppercase tracking-wide"
//                             >
//                               {spec.label}
//                             </th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         <tr className="border-b border-border/50">
//                           <td className="py-4 px-4 text-foreground font-medium">
//                             Training Results
//                           </td>
//                           {metrics.map((spec) => (
//                             <td
//                               key={spec.key}
//                               className="py-4 px-4 text-foreground"
//                             >
//                               {renderMetricValue(modelData.train[spec.key])}
//                               {spec.key === primaryMetric && isBestModel && (
//                                 <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
//                                   Train {spec.label}
//                                 </span>
//                               )}
//                             </td>
//                           ))}
//                         </tr>
//                         <tr>
//                           <td className="py-4 px-4 text-foreground font-medium">
//                             Testing Results
//                           </td>
//                           {metrics.map((spec) => (
//                             <td
//                               key={spec.key}
//                               className="py-4 px-4 text-foreground"
//                             >
//                               {renderMetricValue(modelData.test[spec.key])}
//                               {spec.key === primaryMetric && isBestModel && (
//                                 <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
//                                   Test {spec.label}
//                                 </span>
//                               )}
//                             </td>
//                           ))}
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               );
//             })}
//             {textSummary && (
//               <div className="w-full">
//                 <motion.div
//                   initial={{ opacity: 0, y: 20 }}
//                   animate={{ opacity: 1, y: 0 }}
//                   transition={{ duration: 0.6 }}
//                   className="relative bg-card rounded-xl border border-border p-6 mt-6
//                   border-l-4 border-l-indigo-500"
//                 >
//                   {/* Badge */}
//                   <div className="absolute top-4 right-4">
//                     <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
//                       Model Insights
//                     </span>
//                   </div>

//                   {/* Header */}
//                   <div className="flex items-center gap-3 mb-4">
//                     <div className="p-2 rounded-md bg-indigo-100">
//                       <Sparkles className="w-5 h-5 text-indigo-600" />
//                     </div>
//                     <h3 className="text-lg font-bold text-foreground">
//                       Model Insights & Explanation
//                     </h3>
//                   </div>

//                   {/* Content */}
//                   <div className="space-y-4 text-sm leading-relaxed text-foreground">
//                     {textSummary
//                       .replace(/^Model trained successfully!?\s*\n*/gim, "")
//                       .replace(/^Model built successfully!?\s*\n*/gim, "")
//                       .replace(/^Training completed!?\s*\n*/gim, "")
//                       .trim()
//                       .split("\n")
//                       .map((line, i) => {
//                         const trimmed = line.trim();

//                         // Spacer for empty lines
//                         if (!trimmed) return <div key={i} className="h-2" />;

//                         // Section headers
//                         if (
//                           /^(Best model|Performance|Why this worked|Note|Key insights|Explanation|Top features):/i.test(
//                             trimmed,
//                           )
//                         ) {
//                           return (
//                             <p
//                               key={i}
//                               className="font-semibold text-foreground text-base mt-4 mb-2"
//                             >
//                               {trimmed}
//                             </p>
//                           );
//                         }

//                         // Bullet points
//                         if (/^[•\-\*]\s/.test(trimmed)) {
//                           return (
//                             <p key={i} className="flex items-start gap-2">
//                               <span className="text-indigo-600 mt-1 text-lg leading-none">
//                                 •
//                               </span>
//                               <span>
//                                 {trimmed.replace(/^[•\-\*]\s*/, "").trim()}
//                               </span>
//                             </p>
//                           );
//                         }

//                         // Normal text
//                         return (
//                           <p key={i} className="text-muted-foreground">
//                             {trimmed}
//                           </p>
//                         );
//                       })}
//                   </div>
//                 </motion.div>
//               </div>
//             )}

//             {driftReport && (
//               <div className="max-w-7xl mx-auto w-full">
//                 <div
//                   className={`relative bg-card rounded-xl border border-border p-6 mt-6
//                   ${
//                     isDataDrift
//                       ? "border-l-4 border-l-amber-500"
//                       : isPerformanceDrift
//                         ? "border-l-4 border-l-red-500"
//                         : "border-l-4 border-l-green-500"
//                   }`}
//                 >
//                   {/* Status Badge */}
//                   <div className="absolute top-4 right-4">
//                     {isDataDrift && (
//                       <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
//                         Data Drift
//                       </span>
//                     )}
//                     {isPerformanceDrift && (
//                       <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
//                         Performance Drift
//                       </span>
//                     )}
//                     {!isDataDrift && !isPerformanceDrift && (
//                       <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
//                         Stable
//                       </span>
//                     )}
//                   </div>

//                   {/* Header */}
//                   <div className="flex items-center gap-3 mb-2">
//                     <span className="text-xl">
//                       {isDataDrift ? "⚠️" : isPerformanceDrift ? "📉" : "✅"}
//                     </span>
//                     <h2 className="text-lg font-bold text-foreground">
//                       Drift Monitoring
//                     </h2>
//                   </div>

//                   <p className="text-muted-foreground mb-4">
//                     {driftReport.summary_message}
//                   </p>

//                   {/* Metadata (Total Versions only) */}
//                   <div className="mb-6">
//                     <p className="text-sm text-muted-foreground">
//                       Total Model Versions
//                     </p>
//                     <p className="text-foreground font-semibold text-lg">
//                       {driftReport.total_versions}
//                     </p>
//                   </div>

//                   {/* ===================== DATA DRIFT ===================== */}
//                   {isDataDrift && (
//                     <>
//                       <h3 className="text-base font-semibold text-foreground mb-3">
//                         Data Drift Details
//                       </h3>

//                       <div className="grid grid-cols-3 gap-4 mb-4">
//                         <div>
//                           <p className="text-sm text-muted-foreground">
//                             Overall PSI
//                           </p>
//                           <p
//                             className={`text-lg font-bold ${
//                               driftReport.data_drift.overall_psi > 0.25
//                                 ? "text-amber-600"
//                                 : "text-foreground"
//                             }`}
//                           >
//                             {driftReport.data_drift.overall_psi}
//                           </p>
//                         </div>

//                         <div>
//                           <p className="text-sm text-muted-foreground">
//                             Drifted Features
//                           </p>
//                           <p className="text-lg font-bold text-foreground">
//                             {driftReport.data_drift.drifted_features_count}
//                           </p>
//                         </div>

//                         <div>
//                           <p className="text-sm text-muted-foreground">
//                             Status
//                           </p>
//                           <p className="capitalize text-foreground font-medium">
//                             {driftReport.data_drift.status}
//                           </p>
//                         </div>
//                       </div>

//                       {/* Drifted Features */}
//                       {driftReport.data_drift.drifted_features?.length > 0 && (
//                         <div className="mt-3">
//                           <p className="text-sm text-muted-foreground mb-2">
//                             Drifted Columns
//                           </p>
//                           <div className="flex flex-wrap gap-2">
//                             {driftReport.data_drift.drifted_features.map(
//                               (f: string) => (
//                                 <span
//                                   key={f}
//                                   className="px-3 py-1 text-xs rounded-full
//                     bg-amber-100 text-amber-900
//                     border border-amber-200"
//                                 >
//                                   {f}
//                                 </span>
//                               ),
//                             )}
//                           </div>
//                         </div>
//                       )}

//                       {/* Details */}
//                       {driftReport.details && (
//                         <p className="mt-4 text-sm text-muted-foreground whitespace-pre-line">
//                           {driftReport.details}
//                         </p>
//                       )}
//                     </>
//                   )}

//                   {/* ===================== PERFORMANCE DRIFT ===================== */}
//                   {isPerformanceDrift && (
//                     <>
//                       <h3 className="text-base font-semibold text-foreground mb-3">
//                         Performance Drift Details
//                       </h3>

//                       <div className="grid grid-cols-3 gap-4">
//                         <div>
//                           <p className="text-sm text-muted-foreground">
//                             Baseline Metric
//                           </p>
//                           <p className="text-lg font-bold text-foreground">
//                             {driftReport.performance_drift.baseline_metric}
//                           </p>
//                         </div>

//                         <div>
//                           <p className="text-sm text-muted-foreground">
//                             Current Metric
//                           </p>
//                           <p className="text-lg font-bold text-foreground">
//                             {driftReport.performance_drift.current_metric ??
//                               "—"}
//                           </p>
//                         </div>

//                         <div>
//                           <p className="text-sm text-muted-foreground">
//                             Change %
//                           </p>
//                           <p className="text-lg font-bold text-foreground">
//                             {driftReport.performance_drift.change_percent}%
//                           </p>
//                         </div>
//                       </div>
//                     </>
//                   )}

//                   {/* Recommendation */}
//                   <div className="mt-6 rounded-md bg-muted/50 p-4">
//                     <p className="text-sm font-semibold text-foreground">
//                       Recommendation
//                     </p>
//                     <p className="text-sm text-muted-foreground mt-1">
//                       {driftReport.recommendation}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </main>{" "}
//           {/*this div */}
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="p-8 bg-muted/30 min-h-full">
//         <div className="w-full px-8">
//           <p className="text-destructive">{error}</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-background flex flex-col overflow-hidden">
//       {cameFromJobs1 ? <Header1 /> : <Header />}

//       <div className="flex-1 overflow-auto">
//         <main className="px-6 py-6 max-w-7xl mx-auto w-full">
//           <div className="mb-8 flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-foreground">
//                 Build a Model
//               </h1>
//             </div>
//             <div className="flex items-center gap-3">
//               <Button
//                 variant="outline"
//                 onClick={() => {
//                   // ✅ STOP the API first
//                   if (registerAbortRef.current) {
//                     registerAbortRef.current.abort();
//                   }

//                   // ✅ THEN navigate based on origin
//                   if (cameFromJobs1) {
//                     navigate("/workflow/automl/jobs1");
//                   } else if (cameFromHub) {
//                     navigate("/workflow/automl/automlhub");
//                   } else {
//                     navigate("/workflow/automl");
//                   }
//                 }}
//               >
//                 {cameFromJobs1
//                   ? "Back to Auto AI/ML"
//                   : cameFromHub
//                     ? "Back to Preview"
//                     : "Back to Jobs"}
//               </Button>
//             </div>
//           </div>

//           {/* Model Information */}
//           <div className="bg-card rounded-xl border border-border p-6 mb-6">
//             <h2 className="text-lg font-bold text-foreground mb-4">
//               Model Information
//             </h2>
//             <div className="border-t border-border pt-4">
//               <p className="text-sm text-muted-foreground">Dataset</p>
//               <a href="#" className="text-primary hover:underline">
//                 {datasetName}
//               </a>
//             </div>
//           </div>

//           <div
//             className={`grid gap-4 ${
//               needsTransformation
//                 ? "grid-cols-4"
//                 : selectedFunction === "Multi_Step_Forecasting"
//                   ? "grid-cols-4"
//                   : "grid-cols-3"
//             }`}
//           >
//             {/* Function - Show but disabled if needs transformation */}
//             <div>
//               <p className="text-sm text-muted-foreground mb-2">
//                 Choose Function
//               </p>
//               <Select
//                 value={selectedFunction}
//                 onValueChange={handleFunctionChange}
//                 disabled={needsTransformation}
//               >
//                 <SelectTrigger className="w-full bg-background">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent className="bg-background border border-border z-[100]">
//                   {needsTransformation ? (
//                     <SelectItem value="Multi_Step_Forecasting">
//                       Multi_Step_Forecasting
//                     </SelectItem>
//                   ) : (
//                     functionTypes.map((func) => (
//                       <SelectItem key={func} value={func}>
//                         {func}
//                       </SelectItem>
//                     ))
//                   )}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Model */}
//             <div>
//               <p className="text-sm text-muted-foreground mb-2">Choose Model</p>
//               <Select value={selectedModel} onValueChange={handleModelChange}>
//                 <SelectTrigger className="w-full bg-background">
//                   <SelectValue placeholder="Select model" />
//                 </SelectTrigger>
//                 <SelectContent className="bg-background border border-border z-[100]">
//                   {availableModels.map((model) => (
//                     <SelectItem key={model} value={model}>
//                       {model}
//                     </SelectItem>
//                   ))}
//                 </SelectContent>
//               </Select>
//             </div>

//             {/* Conditional: Show Dimensions/Measures OR regular Target */}
//             {needsTransformation ? (
//               <>
//                 {/* Dimensions */}
//                 <div>
//                   <p className="text-sm text-muted-foreground mb-2">
//                     Dimensions (Group By)
//                   </p>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
//                         <span
//                           className={
//                             selectedDimensions.length > 0
//                               ? ""
//                               : "text-muted-foreground"
//                           }
//                         >
//                           {selectedDimensions.length > 0
//                             ? `${selectedDimensions.length} selected`
//                             : "Select dimensions"}
//                         </span>
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           width="16"
//                           height="16"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           className="h-4 w-4 opacity-50"
//                         >
//                           <polyline points="6 9 12 15 18 9"></polyline>
//                         </svg>
//                       </button>
//                     </PopoverTrigger>
//                     <PopoverContent
//                       className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
//                       align="start"
//                       side="bottom"
//                     >
//                       <div className="max-h-[300px] overflow-y-auto">
//                         {dimensions.length > 0 ? (
//                           dimensions.map((dim: string) => {
//                             const isSelected = selectedDimensions.includes(dim);
//                             return (
//                               <div
//                                 key={dim}
//                                 onClick={() => handleDimensionToggle(dim)}
//                                 className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
//                               >
//                                 <div
//                                   className={`w-4 h-4 border rounded flex items-center justify-center ${
//                                     isSelected
//                                       ? "bg-green-500 border-green-500"
//                                       : "border-gray-300"
//                                   }`}
//                                 >
//                                   {isSelected && (
//                                     <svg
//                                       className="w-3 h-3 text-white"
//                                       fill="none"
//                                       strokeLinecap="round"
//                                       strokeLinejoin="round"
//                                       strokeWidth="2"
//                                       viewBox="0 0 24 24"
//                                       stroke="currentColor"
//                                     >
//                                       <path d="M5 13l4 4L19 7"></path>
//                                     </svg>
//                                   )}
//                                 </div>
//                                 <span className="text-sm">{dim}</span>
//                               </div>
//                             );
//                           })
//                         ) : (
//                           <div className="px-4 py-2 text-sm text-muted-foreground">
//                             No dimensions available
//                           </div>
//                         )}
//                       </div>
//                     </PopoverContent>
//                   </Popover>
//                 </div>

//                 {/* Measures */}
//                 <div>
//                   <p className="text-sm text-muted-foreground mb-2">Measures</p>
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
//                         <span
//                           className={
//                             selectedMeasures.length > 0
//                               ? ""
//                               : "text-muted-foreground"
//                           }
//                         >
//                           {selectedMeasures.length > 0
//                             ? `${selectedMeasures.length} selected`
//                             : "Select measures"}
//                         </span>
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           width="16"
//                           height="16"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           stroke="currentColor"
//                           strokeWidth="2"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           className="h-4 w-4 opacity-50"
//                         >
//                           <polyline points="6 9 12 15 18 9"></polyline>
//                         </svg>
//                       </button>
//                     </PopoverTrigger>
//                     <PopoverContent
//                       className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
//                       align="start"
//                       side="bottom"
//                     >
//                       <div className="max-h-[300px] overflow-y-auto">
//                         {measures.length > 0 ? (
//                           measures.map((measure: string) => {
//                             const isSelected =
//                               selectedMeasures.includes(measure);
//                             return (
//                               <div
//                                 key={measure}
//                                 onClick={() => handleMeasureToggle(measure)}
//                                 className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
//                               >
//                                 <div
//                                   className={`w-4 h-4 border rounded flex items-center justify-center ${
//                                     isSelected
//                                       ? "bg-green-500 border-green-500"
//                                       : "border-gray-300"
//                                   }`}
//                                 >
//                                   {isSelected && (
//                                     <svg
//                                       className="w-3 h-3 text-white"
//                                       fill="none"
//                                       strokeLinecap="round"
//                                       strokeLinejoin="round"
//                                       strokeWidth="2"
//                                       viewBox="0 0 24 24"
//                                       stroke="currentColor"
//                                     >
//                                       <path d="M5 13l4 4L19 7"></path>
//                                     </svg>
//                                   )}
//                                 </div>
//                                 <span className="text-sm">{measure}</span>
//                               </div>
//                             );
//                           })
//                         ) : (
//                           <div className="px-4 py-2 text-sm text-muted-foreground">
//                             No measures available
//                           </div>
//                         )}
//                       </div>
//                     </PopoverContent>
//                   </Popover>
//                 </div>
//               </>
//             ) : (
//               // ✅ Regular Target Field - ONLY SHOWN WHEN needsTransformation = false
//               <div>
//                 <p className="text-sm text-muted-foreground mb-2">
//                   Choose Target
//                   {selectedFunction === "Multi_Step_Forecasting"
//                     ? "s (Select multiple)"
//                     : ""}
//                 </p>

//                 {selectedFunction === "Multi_Step_Forecasting" ? (
//                   // Multi-select for Multi_Step_Forecasting
//                   <Popover>
//                     <PopoverTrigger asChild>
//                       <button className="w-full bg-background border border-input rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground">
//                         {selectedTargets.length > 0
//                           ? `${selectedTargets.length} selected`
//                           : "Select targets"}
//                       </button>
//                     </PopoverTrigger>
//                     <PopoverContent
//                       className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
//                       align="start"
//                       side="bottom"
//                     >
//                       <div className="max-h-[300px] overflow-y-auto">
//                         {!blobPathReady ? (
//                           <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
//                             <svg
//                               className="animate-spin h-3 w-3"
//                               xmlns="http://www.w3.org/2000/svg"
//                               fill="none"
//                               viewBox="0 0 24 24"
//                             >
//                               <circle
//                                 className="opacity-25"
//                                 cx="12"
//                                 cy="12"
//                                 r="10"
//                                 stroke="currentColor"
//                                 strokeWidth="4"
//                               ></circle>
//                               <path
//                                 className="opacity-75"
//                                 fill="currentColor"
//                                 d="M4 12a8 8 0 018-8v8z"
//                               ></path>
//                             </svg>
//                             Loading targets...
//                           </div>
//                         ) : validTargets.length > 0 ? (
//                           validTargets.map((col) => {
//                             const isSelected = selectedTargets.includes(col);
//                             return (
//                               <div
//                                 key={col}
//                                 onClick={() => handleMultiSelectToggle(col)}
//                                 className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
//                               >
//                                 <div
//                                   className={`w-4 h-4 border rounded flex items-center justify-center ${
//                                     isSelected
//                                       ? "bg-green-500 border-green-500"
//                                       : "border-gray-300"
//                                   }`}
//                                 >
//                                   {isSelected && (
//                                     <svg
//                                       className="w-3 h-3 text-white"
//                                       fill="none"
//                                       strokeLinecap="round"
//                                       strokeLinejoin="round"
//                                       strokeWidth="2"
//                                       viewBox="0 0 24 24"
//                                       stroke="currentColor"
//                                     >
//                                       <path d="M5 13l4 4L19 7"></path>
//                                     </svg>
//                                   )}
//                                 </div>
//                                 <span className="text-sm">{col}</span>
//                               </div>
//                             );
//                           })
//                         ) : (
//                           <div className="px-4 py-2 text-sm text-muted-foreground">
//                             No valid targets
//                           </div>
//                         )}
//                       </div>
//                     </PopoverContent>
//                   </Popover>
//                 ) : (
//                   // Single-select for other functions
//                   <Select
//                     value={selectedTarget}
//                     onValueChange={handleTargetChange}
//                   >
//                     <SelectTrigger className="w-full bg-background">
//                       <SelectValue placeholder="Select target" />
//                     </SelectTrigger>
//                     <SelectContent
//                       className="bg-background border border-border z-[100]"
//                       position="popper"
//                       sideOffset={5}
//                       align="start"
//                       side="bottom"
//                     >
//                       {!blobPathReady ? (
//                         <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
//                           <svg
//                             className="animate-spin h-3 w-3"
//                             xmlns="http://www.w3.org/2000/svg"
//                             fill="none"
//                             viewBox="0 0 24 24"
//                           >
//                             <circle
//                               className="opacity-25"
//                               cx="12"
//                               cy="12"
//                               r="10"
//                               stroke="currentColor"
//                               strokeWidth="4"
//                             ></circle>
//                             <path
//                               className="opacity-75"
//                               fill="currentColor"
//                               d="M4 12a8 8 0 018-8v8z"
//                             ></path>
//                           </svg>
//                           Loading targets...
//                         </div>
//                       ) : validTargets.length > 0 ? (
//                         validTargets.map((col) => (
//                           <SelectItem key={col} value={col}>
//                             {col}
//                           </SelectItem>
//                         ))
//                       ) : (
//                         <div className="px-4 py-2 text-sm text-muted-foreground">
//                           No valid targets
//                         </div>
//                       )}
//                     </SelectContent>
//                   </Select>
//                 )}
//               </div>
//             )}

//             {/* Horizon - Show for both cases when applicable */}
//             {(selectedFunction === "Multi_Step_Forecasting" ||
//               needsTransformation) && (
//               <div>
//                 <p className="text-sm text-muted-foreground mb-2">Horizon</p>
//                 <input
//                   type="number"
//                   value={horizon}
//                   onChange={(e) => {
//                     setHorizon(Number(e.target.value));
//                     checkConfigChange(
//                       selectedFunction,
//                       selectedModel || "",
//                       selectedTarget,
//                       selectedTargets,
//                       Number(e.target.value),
//                     );
//                   }}
//                   className="w-full bg-background border border-border rounded-md px-3 py-2"
//                   min="1"
//                 />
//               </div>
//             )}
//           </div>

//           {/* Build Button */}
//           <Button
//             onClick={handleBuild}
//             disabled={!canBuild || isBuilding}
//             size="sm"
//             className={`mt-6 ${!canBuild && !isBuilding ? "opacity-50" : ""}`}
//           >
//             {isBuilding ? (
//               "Building..."
//             ) : (
//               <>
//                 Build Model
//                 <Sparkles className="w-4 h-4 ml-4" />
//               </>
//             )}
//           </Button>
//         </main>
//       </div>
//     </div>
//   );
// };
// export default BuildModelTab;



import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Header from "@/components/layout/Header";
import { toast } from "sonner";
import Header1 from "../layout/Header1";
import ReactMarkdown from "react-markdown";

const modelsByFunction: Record<string, string[]> = {
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
    "One_Class SVM",
    "Local Outlier Factor (LOF)",
    "Elliptic Envelope",
  ],
  Multi_Step_Forecasting: ["XGBoost", "CatBoost", "LightGBM"],
};

const functionTypes = Object.keys(modelsByFunction);

const metricsByTask: Record<
  string,
  { key: string; label: string; isLowerBetter?: boolean }[]
> = {
  Classification: [
    { key: "accuracy", label: "Accuracy" },
    { key: "f1", label: "F1 Score" },
    { key: "precision", label: "Precision" },
    { key: "recall", label: "Recall" },
    { key: "roc_auc", label: "ROC-AUC" },
  ],
  Regression: [
    { key: "rmse", label: "RMSE", isLowerBetter: true },
    { key: "mae", label: "MAE", isLowerBetter: true },
    { key: "r2", label: "R²" },
    { key: "mape", label: "MAPE", isLowerBetter: true },
  ],
  Forecasting: [
    { key: "rmse", label: "RMSE", isLowerBetter: true },
    { key: "mae", label: "MAE", isLowerBetter: true },
    { key: "r2", label: "R²" },
    { key: "mape", label: "MAPE", isLowerBetter: true },
  ],
  Clustering: [
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

function modelNameToApiKey(name: string) {
  if (!name) return name.toLowerCase();
  const mapping: Record<string, string> = {
    "Logistic Regression": "logistic_regression",
    "Random Forest": "random_forest",
    "RF Regressor": "random_forest",
    XGBoost: "xgboost",
    "XGBoost Regressor": "xgboost",
    "Gradient Boosting": "gradient_boosting",
    LightGBM: "lightgbm",
    "LightGBM Regressor": "lightgbm",
    "Linear/ElasticNet": "ridge",
    "KMeans++": "kmeans_plusplus",
    "Isolation Forest": "isolation_forest_fast", // or 'isolation_forest_precise'
    "Local Outlier Factor (LOF)": "local_outlier_factor",
    "Elliptic Envelope": "elliptic_envelope",
    "One-Class SVM": "one_class_svm",
    KMeans: "kmeans",
    DBSCAN: "dbscan",
    GMM: "gmm",
    ARIMA: "arima",
    Prophet: "prophet",
    CatBoost: "catboost",
    // Add more mappings as needed
  };
  return mapping[name] || name.toLowerCase().replace(/ /g, "_");
}

const DRIFT_API = "https://api.veriton.ai/api/service3/drift/report";
const TRAINING_STATUS_API =
  "https://api.veriton.ai/api/service3/training-status";

const BuildModelTab = () => {
  const location = useLocation();
  // Get dataset from navigation state
  const filePath = location.state?.filePath || "";
  const datasetName = location.state?.datasetName || "";
  const cameFromHub = location.state?.origin === "automlhub";

  const navigate = useNavigate();
  const [selectedFunction, setSelectedFunction] = useState("Classification");
  const [selectedModel, setSelectedModel] = useState<string | undefined>(
    undefined,
  );
  const [selectedTarget, setSelectedTarget] = useState("");
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [modelResults, setModelResults] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [primaryMetric, setPrimaryMetric] = useState("");
  const [primaryScore, setPrimaryScore] = useState(0);
  const [hasConfigChanged, setHasConfigChanged] = useState(false);
  const [allModelsResults, setAllModelsResults] = useState<any>(null);
  const [bestModelKey, setBestModelKey] = useState<string>("");
  const [blobPath, setBlobPath] = useState<string>("");
  const [validTargets, setValidTargets] = useState<string[]>([]);
  const [isFetchingTargets, setIsFetchingTargets] = useState(false);
  const [textSummary, setTextSummary] = useState<string>("");
  const [horizon, setHorizon] = useState(12);
  const [driftReport, setDriftReport] = useState<any>(null);
  const [isFetchingDrift, setIsFetchingDrift] = useState(false);
  // ADD THESE NEW STATES (after existing useState declarations)
  const [analysisMetadata, setAnalysisMetadata] = useState<any>(null);
  const [needsTransformation, setNeedsTransformation] = useState(false);
  const [selectedDimensions, setSelectedDimensions] = useState<string[]>([]);
  const [selectedMeasures, setSelectedMeasures] = useState<string[]>([]);
  const [yearColumn, setYearColumn] = useState("");
  const [allTaskFeatures, setAllTaskFeatures] = useState<any>(null);
  const registerAbortRef = useRef<AbortController | null>(null);
  const [blobPathReady, setBlobPathReady] = useState(false);
  const [jobId, setJobId] = useState<string | null>(null);
  const [pollError, setPollError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef(false);
  const trainingToastRef = useRef<string | number | null>(null);
  const featureToastRef = useRef<string | number | null>(null);
  const cameFromJobs1 = location.state?.origin === "jobs1";
  const [transformationMessage, setTransformationMessage] = useState<
    string | null
  >(null);
  const [initialConfig, setInitialConfig] = useState({
    function: "Classification",
    model: "Logistic Regression",
    target: "",
    targets: [] as string[], // NEW
    horizon: 12,
  });

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (featureToastRef.current) {
        toast.dismiss(featureToastRef.current);
      }
      if (trainingToastRef.current) {
        toast.dismiss(trainingToastRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!filePath) return;

    const registerFile = async () => {
      const userEmail = getUserEmailFromLocal();
      if (!userEmail) return;

      try {
        // ✅ create abort controller
        registerAbortRef.current = new AbortController();
        featureToastRef.current = toast.loading("Fetching dataset features...");
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
          setAnalysisMetadata(json.analysis_metadata);

          const needsTransform =
            json.analysis_metadata?.dataset_structure?.needs_transformation ||
            false;

          setNeedsTransformation(needsTransform);
          if (needsTransform) {
            // Auto-set function
            setSelectedFunction("Multi_Step_Forecasting");

            // IMPORTANT: Also sync initialConfig so hasConfigChanged starts as false
            setInitialConfig({
              function: "Multi_Step_Forecasting",
              model: "", // no model selected yet → user must pick one
              target: "",
              targets: [],
              horizon: 12, // or keep current horizon value if you prefer
            });

            // Optional but recommended: show message to user
            toast.info(
              "This dataset appears to be in wide format and requires transformation. " +
                "The function has been automatically set to Multi-Step Forecasting.",
            );
          }
        }

        if (json.features?.tasks) {
          setAllTaskFeatures(json.features.tasks);

          const taskKey =
            selectedFunction === "Multi_Step_Forecasting"
              ? "multistep_forecasting"
              : selectedFunction.toLowerCase().replace(/ /g, "_");

          setValidTargets(json.features.tasks[taskKey]?.features || []);
        }

        setBlobPathReady(true);
        if (featureToastRef.current) {
          toast.success("Features fetched successfully!", {
            id: featureToastRef.current,
            duration: 3000,
          });
        }
      } catch (err: any) {
        // ✅ ignore abort error
        if (err.name === "AbortError") {
          console.log("Registration API aborted");

          return;
        }

        console.error("File registration error:", err);
      }
    };

    registerFile();

    // ✅ cleanup
    return () => {
      if (registerAbortRef.current) {
        registerAbortRef.current.abort();
      }
    };
  }, [filePath]);

  const availableModels = useMemo(() => {
    return selectedFunction ? modelsByFunction[selectedFunction] || [] : [];
  }, [selectedFunction]);

  // ADD THESE AFTER availableModels
  const dimensions = analysisMetadata?.dataset_structure?.dimensions || [];
  const measures = analysisMetadata?.dataset_structure?.measures || [];

  const checkConfigChange = (
    func: string,
    model: string,
    target: string,
    targets: string[],
    hor: number,
  ) => {
    const changed =
      func !== initialConfig.function ||
      model !== initialConfig.model ||
      target !== initialConfig.target ||
      JSON.stringify(targets) !== JSON.stringify(initialConfig.targets) ||
      hor !== initialConfig.horizon;
    setHasConfigChanged(changed);
  };

const formatSummary = (text: string) => {
  if (!text) return "";

  let formatted = text;

  // ❌ Remove broken trailing **
  formatted = formatted.replace(/\*\*/g, "");

  // ✅ Remove starting success lines
  formatted = formatted.replace(
    /^Model (trained|built) successfully!?\s*/i,
    ""
  );

  // ✅ Fix section headers → make them bold markdown
  formatted = formatted.replace(
    /(Best model:|Performance:|Why this worked best:|Key insights:|Explanation:)/gi,
    "\n\n**$1**"
  );

  // ✅ Add bullets for lines under "Why this worked best"
  formatted = formatted.replace(
    /\n(?!\*\*)([A-Z][^\n]+)/g,
    (match, p1) => {
      if (
        /^(Best model:|Performance:|Why this worked best:)/i.test(p1)
      ) {
        return "\n" + p1;
      }
      return `\n- ${p1}`;
    }
  );

  return formatted.trim();
};

  const handleFunctionChange = async (value: string) => {
    if (needsTransformation && value !== "Multi_Step_Forecasting") {
      return;
    }

    setSelectedFunction(value);
    setSelectedModel(undefined);
    setSelectedTarget("");
    setSelectedTargets([]);

    // Switch targets based on newly selected task
    if (allTaskFeatures) {
      const taskKey =
        value === "Multi_Step_Forecasting"
          ? "multistep_forecasting"
          : value.toLowerCase().replace(/ /g, "_");
      setValidTargets(allTaskFeatures[taskKey]?.features || []);
    }

    if (value !== "Multi-Step Forecasting") {
      setHorizon(12);
    }

    checkConfigChange(
      value,
      "",
      "",
      [],
      value === "Multi-Step Forecasting" ? horizon : 12,
    );
  };

  const handleModelChange = (value: string) => {
    setSelectedModel(value);
    checkConfigChange(
      selectedFunction,
      value,
      selectedTarget,
      selectedTargets,
      horizon,
    );
  };
  const handleTargetChange = (value: string) => {
    setSelectedTarget(value);
    checkConfigChange(
      selectedFunction,
      selectedModel || "",
      value,
      selectedTargets,
      horizon,
    );
  };

  const handleMultiSelectToggle = (value: string) => {
    let newTargets: string[];

    if (selectedTargets.includes(value)) {
      newTargets = selectedTargets.filter((t) => t !== value);
    } else {
      newTargets = [...selectedTargets, value];
    }

    setSelectedTargets(newTargets);
    checkConfigChange(
      selectedFunction,
      selectedModel || "",
      selectedTarget,
      newTargets,
      horizon,
    );
  };

  // ADD THESE NEW HANDLERS
  const handleDimensionToggle = (value: string) => {
    let newDimensions: string[];

    if (selectedDimensions.includes(value)) {
      newDimensions = selectedDimensions.filter((d) => d !== value);
    } else {
      newDimensions = [...selectedDimensions, value];
    }

    setSelectedDimensions(newDimensions);
    checkConfigChange(
      selectedFunction,
      selectedModel || "",
      selectedTarget,
      selectedTargets,
      horizon,
    );
  };

  const handleMeasureToggle = (value: string) => {
    let newMeasures: string[];

    if (selectedMeasures.includes(value)) {
      newMeasures = selectedMeasures.filter((m) => m !== value);
    } else {
      newMeasures = [...selectedMeasures, value];
    }

    setSelectedMeasures(newMeasures);
    checkConfigChange(
      selectedFunction,
      selectedModel || "",
      selectedTarget,
      selectedTargets,
      horizon,
    );
  };

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

  const fetchDriftReport = async ({
    mode,
    modelId,
  }: {
    mode: "build" | "test";
    modelId: string;
  }) => {
    const userEmail = getUserEmailFromLocal();
    if (!userEmail) return;

    setIsFetchingDrift(true);

    try {
      // ✅ URL-encoded body (matches curl)
      const params = new URLSearchParams();
      params.append("mode", mode);
      params.append("user_email", userEmail);

      if (mode === "build") {
        params.append("model_id", modelId);
        params.append("test_result_id", "");
      }

      if (mode === "test") {
        params.append("test_result_id", modelId);
        params.append("model_id", "");
      }

      const res = await fetch(DRIFT_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
        body: params.toString(),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Drift API failed ${res.status}: ${txt}`);
      }

      const json = await res.json();
      console.log("");

      setDriftReport(json.drift_report);
    } catch (err) {
      console.error("Drift fetch error:", err);
    } finally {
      setIsFetchingDrift(false);
    }
  };

  const pollTrainingStatus = async (jobId: string) => {
    const userEmail = getUserEmailFromLocal();
    if (!userEmail) return;

    if (pollingRef.current) return; // prevent multiple polling loops
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

        if (json.status === "success") {
          setIsBuilding(false);
          pollingRef.current = false; // stop polling

          if (trainingToastRef.current) {
            toast.success("Model training completed. Results are ready!", {
              id: trainingToastRef.current,
              duration: 3000,
            });
          }

          if (selectedModel) {
            const modelKey = modelNameToApiKey(selectedModel);
            const results = json.all_models[modelKey];

            setModelResults(results);
            setAllModelsResults(null);
            setBestModelKey("");
          } else {
            setAllModelsResults(json.all_models);
            setBestModelKey(json.best_model);
            setModelResults(null);
          }

          setPrimaryMetric(json.primary_metric);
          setPrimaryScore(json.primary_score);
          setTextSummary(json.text_summary || "");
          setShowResults(true);
          setHasConfigChanged(false);

          if (json.model_id) {
            await fetchDriftReport({
              mode: "build",
              modelId: json.model_id,
            });
          }

          break;
        }

        if (json.status === "failed") {
          pollingRef.current = false;
          setIsBuilding(false);

          // ✅ Show error message from API
          const errorMessage =
            json.message ||
            json.error ||
            "Model building failed. Please try again.";

          setError(errorMessage);

          // ✅ Show toast
          if (trainingToastRef.current) {
            toast.error(errorMessage, {
              id: trainingToastRef.current,
              duration: 4000,
            });
          }

          // ✅ VERY IMPORTANT: enable rebuild
          setHasConfigChanged(true);

          return; // stop polling loop
        }

        // wait 30 seconds before next poll
        await new Promise((resolve) => setTimeout(resolve, 30000));
      }
    } catch (err) {
      console.error("Polling error:", err);
      pollingRef.current = false;
      setIsBuilding(false);
    }
  };

  const handleBuild = async () => {
    setError(null);
    setIsBuilding(true);
    setShowResults(false);

    const userEmail = getUserEmailFromLocal();
    if (!userEmail) {
      setError("User email not found. Please login again.");
      setIsBuilding(false);
      return;
    }

    // Validation based on transformation needs
    if (needsTransformation) {
      // For wide format data needing transformation
      if (selectedDimensions.length === 0) {
        setError("Please select at least one dimension.");
        setIsBuilding(false);
        return;
      }
      if (selectedMeasures.length === 0) {
        setError("Please select at least one measure.");
        setIsBuilding(false);
        return;
      }
    } else {
      // For normal flow
      if (selectedFunction === "Multi_Step_Forecasting") {
        if (selectedTargets.length === 0) {
          setError("Please select at least one target feature.");
          setIsBuilding(false);
          return;
        }
      } else {
        if (!selectedTarget) {
          setError("Please select a target feature.");
          setIsBuilding(false);
          return;
        }
      }
    }

    // ── Call 2: Actual training ──
    const formData = new URLSearchParams();
    formData.append("file_path", filePath);
    formData.append("upload_file_path", "false");

    // ✅ Handle task and target based on transformation needs
    if (needsTransformation) {
      // For wide format transformation
      formData.append("task", "multistep_forecasting");
      formData.append("target", "target"); // ✅ Simple "target" string as per API

      // Add transformation config
      const transformConfig = {
        group_by: selectedDimensions,
        measures: selectedMeasures,
        year_column: yearColumn,
        horizon: horizon,
        needs_transformation: true,
      };
      formData.append("transformation_config", JSON.stringify(transformConfig));
    } else {
      // Normal flow
      formData.append(
        "task",
        selectedFunction === "Multi_Step_Forecasting"
          ? "multistep_forecasting"
          : selectedFunction.toLowerCase().replace(/ /g, "_"),
      );

      if (selectedFunction === "Multi_Step_Forecasting") {
        formData.append("target", selectedTargets.join(","));
      } else {
        formData.append("target", selectedTarget);
      }
    }

    // Continue with rest of the formData appends...
    formData.append("user_email", userEmail);
    formData.append("optuna_trials", "2");

    if (selectedModel) {
      formData.append("models", modelNameToApiKey(selectedModel));
    }
    formData.append("use_feature_selection", "false");
    formData.append("preprocessing_mode", "simple");
    formData.append("use_optuna", "true");
    formData.append("test_size", "0.2");
    formData.append("use_cleaning", "true");
    formData.append("time_budget", "180");
    formData.append("horizon", horizon.toString());

    try {
      const res = await fetch(
        "https://api.veriton.ai/api/service3/build_ml_model_v",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json",
          },
          body: formData.toString(),
        },
      );

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`API error ${res.status}: ${txt}`);
      }

      const json = await res.json();

      /* NEW: job started response */
      if (json.status === "model has started running") {
        const jobId = json.job_id;

        setJobId(jobId);
        setIsBuilding(true);

        trainingToastRef.current = toast.loading(
          "Model training started. This may take a few minutes while results are generated...",
        );

        pollTrainingStatus(jobId);

        return;
      }

      // ✅ Fetch drift report after successful build
      if (json.model_id) {
        await fetchDriftReport({
          mode: "build",
          modelId: json.model_id,
        });
      }

      // Check if single model or all models
      if (selectedModel) {
        // Single model selected
        const modelKey = modelNameToApiKey(selectedModel);
        const results = json.all_models[modelKey];
        if (!results) {
          throw new Error("Selected model not found in response");
        }
        setModelResults(results);
        setAllModelsResults(null);
        setBestModelKey("");
      } else {
        // No model selected - show all models
        setAllModelsResults(json.all_models);
        setBestModelKey(json.best_model);
        setModelResults(null);
      }

      setPrimaryMetric(json.primary_metric);
      setPrimaryScore(json.primary_score);
      setTextSummary(json.text_summary || "No summary available.");
      setShowResults(true);

      setInitialConfig({
        function: selectedFunction,
        model: selectedModel || "",
        target: selectedTarget,
        targets: selectedTargets,
        horizon: horizon,
      });
      setHasConfigChanged(false);

      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred");
    }
  };

  const canBuild = needsTransformation
    ? selectedFunction === "Multi_Step_Forecasting" &&
      selectedModel &&
      selectedDimensions.length >= 1 &&
      selectedMeasures.length >= 1 &&
      horizon >= 1 &&
      hasConfigChanged
    : selectedFunction &&
      (selectedFunction === "Multi_Step_Forecasting"
        ? selectedTargets.length >= 1
        : selectedTarget) &&
      hasConfigChanged;

  const renderMetricValue = (v: number | undefined) => {
    return v != null ? v.toFixed(4) : "—";
  };

  // Results view - Single Model
  if (showResults && modelResults) {
    const metrics = metricsByTask[selectedFunction] || [];
    const isDataDrift = driftReport?.overall_status === "data_drift";
    const isPerformanceDrift =
      driftReport?.performance_drift?.detected === true;

    return (
      <div className="min-h-screen bg-background flex flex-col overflow-hidden">
        {cameFromJobs1 ? <Header1 /> : <Header />}

        <div className="flex-1 overflow-auto">
          <main className="px-6 py-6 max-w-7xl mx-auto w-full">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Build a Model
                </h1>
                <p className="text-muted-foreground mt-1">
                  Configure and train your model using {datasetName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    if (registerAbortRef.current) {
                      registerAbortRef.current.abort();
                    }

                    // ✅ ADD THIS
                    if (featureToastRef.current) {
                      toast.dismiss(featureToastRef.current);
                    }

                    if (trainingToastRef.current) {
                      toast.dismiss(trainingToastRef.current);
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

            {/* Model Information */}
            <div className="bg-card rounded-xl border border-border p-6 mb-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Model Information
              </h2>
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-1">Dataset</p>
                <p className="text-foreground font-medium">{datasetName}</p>
              </div>
            </div>

            {/* Configure Training - Editable even after results */}
            <div className="bg-card rounded-xl border border-border p-6 mb-6">
              <h2 className="text-lg font-bold text-foreground mb-6">
                Configure Training
              </h2>
              {transformationMessage && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-300 text-sm">
                  {transformationMessage}
                </div>
              )}

              <div
                className={`grid gap-4 ${
                  needsTransformation
                    ? "grid-cols-4"
                    : selectedFunction === "Multi_Step_Forecasting"
                      ? "grid-cols-4"
                      : "grid-cols-3"
                }`}
              >
                {/* Function - Show but disabled if needs transformation */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose Function
                  </p>
                  <Select
                    value={selectedFunction}
                    onValueChange={handleFunctionChange}
                    disabled={needsTransformation} // Disable if transformation needed
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-[100]">
                      {needsTransformation ? (
                        <SelectItem value="Multi_Step_Forecasting">
                          Multi_Step_Forecasting
                        </SelectItem>
                      ) : (
                        functionTypes.map((func) => (
                          <SelectItem key={func} value={func}>
                            {func}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose Model
                  </p>
                  <Select
                    value={selectedModel}
                    onValueChange={handleModelChange}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-[100]">
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional: Show Dimensions/Measures OR regular Target */}
                {needsTransformation ? (
                  <>
                    {/* Dimensions */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Dimensions (Group By)
                      </p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <span
                              className={
                                selectedDimensions.length > 0
                                  ? ""
                                  : "text-muted-foreground"
                              }
                            >
                              {selectedDimensions.length > 0
                                ? `${selectedDimensions.length} selected`
                                : "Select dimensions"}
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 opacity-50"
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
                          align="start"
                          side="bottom"
                        >
                          <div className="max-h-[300px] overflow-y-auto">
                            {dimensions.length > 0 ? (
                              dimensions.map((dim: string) => {
                                const isSelected =
                                  selectedDimensions.includes(dim);
                                return (
                                  <div
                                    key={dim}
                                    onClick={() => handleDimensionToggle(dim)}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
                                  >
                                    <div
                                      className={`w-4 h-4 border rounded flex items-center justify-center ${
                                        isSelected
                                          ? "bg-green-500 border-green-500"
                                          : "border-gray-300"
                                      }`}
                                    >
                                      {isSelected && (
                                        <svg
                                          className="w-3 h-3 text-white"
                                          fill="none"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                      )}
                                    </div>
                                    <span className="text-sm">{dim}</span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="px-4 py-2 text-sm text-muted-foreground">
                                No dimensions available
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Measures */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Measures
                      </p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <span
                              className={
                                selectedMeasures.length > 0
                                  ? ""
                                  : "text-muted-foreground"
                              }
                            >
                              {selectedMeasures.length > 0
                                ? `${selectedMeasures.length} selected`
                                : "Select measures"}
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 opacity-50"
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
                          align="start"
                          side="bottom"
                        >
                          <div className="max-h-[300px] overflow-y-auto">
                            {measures.length > 0 ? (
                              measures.map((measure: string) => {
                                const isSelected =
                                  selectedMeasures.includes(measure);
                                return (
                                  <div
                                    key={measure}
                                    onClick={() => handleMeasureToggle(measure)}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
                                  >
                                    <div
                                      className={`w-4 h-4 border rounded flex items-center justify-center ${
                                        isSelected
                                          ? "bg-green-500 border-green-500"
                                          : "border-gray-300"
                                      }`}
                                    >
                                      {isSelected && (
                                        <svg
                                          className="w-3 h-3 text-white"
                                          fill="none"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                      )}
                                    </div>
                                    <span className="text-sm">{measure}</span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="px-4 py-2 text-sm text-muted-foreground">
                                No measures available
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
                ) : (
                  // ✅ COMPLETE TARGET FIELD - NOW WITH ACTUAL CODE
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Choose Target
                      {selectedFunction === "Multi_Step_Forecasting"
                        ? "s (Select multiple)"
                        : ""}
                    </p>

                    {selectedFunction === "Multi_Step_Forecasting" ? (
                      // Multi-select for Multi_Step_Forecasting
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="w-full bg-background border border-input rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground">
                            {selectedTargets.length > 0
                              ? `${selectedTargets.length} selected`
                              : "Select targets"}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
                          align="start"
                          side="bottom"
                        >
                          <div className="max-h-[300px] overflow-y-auto">
                            {!blobPathReady ? (
                              <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                                <svg
                                  className="animate-spin h-3 w-3"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                  ></path>
                                </svg>
                                Loading targets...
                              </div>
                            ) : validTargets.length > 0 ? (
                              validTargets.map((col) => {
                                const isSelected =
                                  selectedTargets.includes(col);
                                return (
                                  <div
                                    key={col}
                                    onClick={() => handleMultiSelectToggle(col)}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
                                  >
                                    <div
                                      className={`w-4 h-4 border rounded flex items-center justify-center ${
                                        isSelected
                                          ? "bg-green-500 border-green-500"
                                          : "border-gray-300"
                                      }`}
                                    >
                                      {isSelected && (
                                        <svg
                                          className="w-3 h-3 text-white"
                                          fill="none"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                      )}
                                    </div>
                                    <span className="text-sm">{col}</span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="px-4 py-2 text-sm text-muted-foreground">
                                No valid targets
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      // Single-select for other functions
                      <Select
                        value={selectedTarget}
                        onValueChange={handleTargetChange}
                      >
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                        <SelectContent
                          className="bg-background border border-border z-[100]"
                          position="popper"
                          sideOffset={5}
                          align="start"
                          side="bottom"
                        >
                          {!blobPathReady ? (
                            <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                              <svg
                                className="animate-spin h-3 w-3"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8z"
                                ></path>
                              </svg>
                              Loading targets...
                            </div>
                          ) : validTargets.length > 0 ? (
                            validTargets.map((col) => (
                              <SelectItem key={col} value={col}>
                                {col}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-muted-foreground">
                              No valid targets
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {/* Horizon - Show for both cases */}
                {(selectedFunction === "Multi_Step_Forecasting" ||
                  needsTransformation) && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Horizon
                    </p>
                    <input
                      type="number"
                      value={horizon}
                      onChange={(e) => {
                        setHorizon(Number(e.target.value));
                        checkConfigChange(
                          selectedFunction,
                          selectedModel || "",
                          selectedTarget,
                          selectedTargets,
                          Number(e.target.value),
                        );
                      }}
                      className="w-full bg-background border border-border rounded-md px-3 py-2"
                      min="1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Build Button */}
            <Button
              onClick={handleBuild}
              disabled={!canBuild || isBuilding}
              size="sm"
              className={!canBuild && !isBuilding ? "opacity-50" : ""}
            >
              {isBuilding ? (
                "Building..."
              ) : (
                <>
                  Build Model
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {/* Train vs Test Results */}
            <div className="bg-card rounded-xl border border-border p-6 mt-6">
              <h2 className="text-lg font-bold text-foreground mb-6">
                Train vs Test Results
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground"></th>
                      {metrics.map((spec) => (
                        <th
                          key={spec.key}
                          className="text-left py-3 px-4 text-sm font-medium text-primary uppercase tracking-wide"
                        >
                          {spec.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border/50">
                      <td className="py-4 px-4 text-foreground font-medium">
                        Training Results
                      </td>
                      {metrics.map((spec) => (
                        <td
                          key={spec.key}
                          className="py-4 px-4 text-foreground"
                        >
                          {renderMetricValue(modelResults.train[spec.key])}
                          {spec.key === primaryMetric && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                              Train {spec.label}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                    <tr>
                      <td className="py-4 px-4 text-foreground font-medium">
                        Testing Results
                      </td>
                      {metrics.map((spec) => (
                        <td
                          key={spec.key}
                          className="py-4 px-4 text-foreground"
                        >
                          {renderMetricValue(modelResults.test[spec.key])}
                          {spec.key === primaryMetric && (
                            <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                              Test {spec.label}
                            </span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            {/* </div> */}
            {/* </main> */}
            {/* NEW: Text Summary - Shown only after successful build */}

            {textSummary && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative bg-card rounded-xl border border-border p-6 mt-6 border-l-4 border-l-indigo-500 max-w-7xl mx-auto w-full"
              >
                {/* Badge */}
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                    Model Insights
                  </span>
                </div>

                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-md bg-indigo-100">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    Model Insights & Explanation
                  </h3>
                </div>

                {/* Content */}
                <div className="prose prose-sm max-w-none text-foreground">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => (
                        <p className="mb-2 text-muted-foreground">{children}</p>
                      ),
                      strong: ({ children }) => (
                        <strong className="text-foreground font-semibold">
                          {children}
                        </strong>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc ml-5 space-y-1 mt-2">
                          {children}
                        </ul>
                      ),
                      li: ({ children }) => (
                        <li className="text-muted-foreground">{children}</li>
                      ),
                    }}
                  >
                    {formatSummary(textSummary)}
                  </ReactMarkdown>
                </div>
              </motion.div>
            )}

            {driftReport && (
              <div className="max-w-7xl mx-auto w-full">
                <div
                  className={`relative bg-card rounded-xl border border-border p-6 mt-6
      ${
        isDataDrift
          ? "border-l-4 border-l-amber-500"
          : isPerformanceDrift
            ? "border-l-4 border-l-red-500"
            : "border-l-4 border-l-green-500"
      }`}
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {isDataDrift && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                        Data Drift
                      </span>
                    )}
                    {isPerformanceDrift && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Performance Drift
                      </span>
                    )}
                    {!isDataDrift && !isPerformanceDrift && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Stable
                      </span>
                    )}
                  </div>

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">
                      {isDataDrift ? "⚠️" : isPerformanceDrift ? "📉" : "✅"}
                    </span>
                    <h2 className="text-lg font-bold text-foreground">
                      Drift Monitoring
                    </h2>
                  </div>

                  {/* Drift Status Message */}
                  <div className="mb-4">
                    {isDataDrift && (
                      <p className="text-amber-600 font-bold text-base">
                        Data Drift Detected
                      </p>
                    )}

                    {isPerformanceDrift && (
                      <p className="text-red-600 font-bold text-base">
                        Performance Drift Detected
                      </p>
                    )}

                    {!isDataDrift && !isPerformanceDrift && (
                      <p className="text-green-600 font-bold text-base">
                        No Drift Detected – Model is Stable
                      </p>
                    )}

                    <p className="text-muted-foreground mt-2">
                      {driftReport?.summary_message}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground">
                      Total Model Versions
                    </p>
                    <p className="text-foreground font-semibold text-lg">
                      {driftReport?.total_versions ?? "—"}
                    </p>
                  </div>

                  {/* ===================== DATA DRIFT ===================== */}
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    Data Drift Details
                  </h3>

                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Overall PSI
                      </p>
                      <p
                        className={`text-lg font-bold ${
                          driftReport?.data_drift?.overall_psi > 0.25
                            ? "text-amber-600"
                            : "text-foreground"
                        }`}
                      >
                        {driftReport?.data_drift?.overall_psi ?? "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Drifted Features
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {driftReport?.data_drift?.drifted_features_count ?? 0}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Status</p>
                      <p className="capitalize text-foreground font-medium">
                        {driftReport?.data_drift?.status ?? "stable"}
                      </p>
                    </div>
                  </div>

                  {/* Drifted Features */}
                  {driftReport?.data_drift?.drifted_features?.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-2">
                        Drifted Columns
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {driftReport?.data_drift?.drifted_features.map(
                          (f: string) => (
                            <span
                              key={f}
                              className="px-3 py-1 text-xs rounded-full
                bg-amber-100 text-amber-900
                border border-amber-200"
                            >
                              {f}
                            </span>
                          ),
                        )}
                      </div>
                    </div>
                  )}

                  {driftReport?.details && (
                    <p className="mt-4 text-sm text-muted-foreground whitespace-pre-line">
                      {driftReport?.details}
                    </p>
                  )}

                  {/* ===================== PERFORMANCE DRIFT ===================== */}
                  <h3 className="text-base font-semibold text-foreground mb-3 mt-6">
                    Performance Drift Details
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Baseline Metric
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {driftReport?.performance_drift?.baseline_metric ?? "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">
                        Current Metric
                      </p>
                      <p className="text-lg font-bold text-foreground">
                        {driftReport?.performance_drift?.current_metric ?? "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-muted-foreground">Change %</p>
                      <p className="text-lg font-bold text-foreground">
                        {driftReport?.performance_drift?.change_percent ?? "0"}%
                      </p>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="mt-6 rounded-md bg-muted/50 p-4">
                    <p className="text-sm font-semibold text-foreground">
                      Recommendation
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {driftReport?.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  // Results view - All Models
  if (showResults && allModelsResults) {
    const metrics = metricsByTask[selectedFunction] || [];
    const modelKeys = Object.keys(allModelsResults);

    // Sort so best model comes first
    const sortedModelKeys = [
      bestModelKey,
      ...modelKeys.filter((k) => k !== bestModelKey),
    ];
    const isDataDrift = driftReport?.overall_status === "data_drift";
    const isPerformanceDrift = driftReport.performance_drift?.detected === true;

    return (
      <div className="min-h-screen bg-background flex flex-col overflow-hidden">
        <Header />

        <div className="flex-1 overflow-auto">
          <main className="px-6 py-6 max-w-7xl mx-auto w-full">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">
                  Build a Model
                </h1>
                <p className="text-muted-foreground mt-1">
                  Configure and train your model using {datasetName}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* <Button
                  variant='outline'
                  onClick={() =>
                    navigate('/workflow/automl/compare', {
                      state: { mode: 'compare' }
                    })
                  }
                >
                  Compare Models
                </Button> */}

                <Button
                  variant="outline"
                  onClick={() => {
                    if (featureToastRef.current)
                      toast.dismiss(featureToastRef.current);
                    if (trainingToastRef.current)
                      toast.dismiss(trainingToastRef.current);

                    navigate("/workflow/automl/select-dataset");
                  }}
                >
                  Back to Dataset
                </Button>
              </div>
            </div>

            {/* Model Information */}
            <div className="bg-card rounded-xl border border-border p-6 mb-6">
              <h2 className="text-lg font-bold text-foreground mb-4">
                Model Information
              </h2>
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground mb-1">Dataset</p>
                <p className="text-foreground font-medium">{datasetName}</p>
              </div>
            </div>

            {/* Configure Training - Editable even after results */}
            <div className="bg-card rounded-xl border border-border p-6 mb-6">
              <h2 className="text-lg font-bold text-foreground mb-6">
                Configure Training
              </h2>

              <div
                className={`grid gap-4 ${
                  needsTransformation
                    ? "grid-cols-4"
                    : selectedFunction === "Multi_Step_Forecasting"
                      ? "grid-cols-4"
                      : "grid-cols-3"
                }`}
              >
                {/* Function - Show but disabled if needs transformation */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose Function
                  </p>
                  <Select
                    value={selectedFunction}
                    onValueChange={handleFunctionChange}
                    disabled={needsTransformation} // Disable if transformation needed
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-[100]">
                      {needsTransformation ? (
                        <SelectItem value="Multi_Step_Forecasting">
                          Multi_Step_Forecasting
                        </SelectItem>
                      ) : (
                        functionTypes.map((func) => (
                          <SelectItem key={func} value={func}>
                            {func}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Model */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Choose Model
                  </p>
                  <Select
                    value={selectedModel}
                    onValueChange={handleModelChange}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                    <SelectContent className="bg-background border border-border z-[100]">
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Conditional: Show Dimensions/Measures OR regular Target */}
                {needsTransformation ? (
                  <>
                    {/* Dimensions */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Dimensions (Group By)
                      </p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <span
                              className={
                                selectedDimensions.length > 0
                                  ? ""
                                  : "text-muted-foreground"
                              }
                            >
                              {selectedDimensions.length > 0
                                ? `${selectedDimensions.length} selected`
                                : "Select dimensions"}
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 opacity-50"
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
                          align="start"
                          side="bottom"
                        >
                          <div className="max-h-[300px] overflow-y-auto">
                            {dimensions.length > 0 ? (
                              dimensions.map((dim: string) => {
                                const isSelected =
                                  selectedDimensions.includes(dim);
                                return (
                                  <div
                                    key={dim}
                                    onClick={() => handleDimensionToggle(dim)}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
                                  >
                                    <div
                                      className={`w-4 h-4 border rounded flex items-center justify-center ${
                                        isSelected
                                          ? "bg-green-500 border-green-500"
                                          : "border-gray-300"
                                      }`}
                                    >
                                      {isSelected && (
                                        <svg
                                          className="w-3 h-3 text-white"
                                          fill="none"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                      )}
                                    </div>
                                    <span className="text-sm">{dim}</span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="px-4 py-2 text-sm text-muted-foreground">
                                No dimensions available
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    {/* Measures */}
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Measures
                      </p>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                            <span
                              className={
                                selectedMeasures.length > 0
                                  ? ""
                                  : "text-muted-foreground"
                              }
                            >
                              {selectedMeasures.length > 0
                                ? `${selectedMeasures.length} selected`
                                : "Select measures"}
                            </span>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-4 w-4 opacity-50"
                            >
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
                          align="start"
                          side="bottom"
                        >
                          <div className="max-h-[300px] overflow-y-auto">
                            {measures.length > 0 ? (
                              measures.map((measure: string) => {
                                const isSelected =
                                  selectedMeasures.includes(measure);
                                return (
                                  <div
                                    key={measure}
                                    onClick={() => handleMeasureToggle(measure)}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
                                  >
                                    <div
                                      className={`w-4 h-4 border rounded flex items-center justify-center ${
                                        isSelected
                                          ? "bg-green-500 border-green-500"
                                          : "border-gray-300"
                                      }`}
                                    >
                                      {isSelected && (
                                        <svg
                                          className="w-3 h-3 text-white"
                                          fill="none"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                      )}
                                    </div>
                                    <span className="text-sm">{measure}</span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="px-4 py-2 text-sm text-muted-foreground">
                                No measures available
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </>
                ) : (
                  // ✅ COMPLETE TARGET FIELD - NOW WITH ACTUAL CODE
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Choose Target
                      {selectedFunction === "Multi_Step_Forecasting"
                        ? "s (Select multiple)"
                        : ""}
                    </p>

                    {selectedFunction === "Multi_Step_Forecasting" ? (
                      // Multi-select for Multi_Step_Forecasting
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="w-full bg-background border border-input rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground">
                            {selectedTargets.length > 0
                              ? `${selectedTargets.length} selected`
                              : "Select targets"}
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
                          align="start"
                          side="bottom"
                        >
                          <div className="max-h-[300px] overflow-y-auto">
                            {!blobPathReady ? (
                              <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                                <svg
                                  className="animate-spin h-3 w-3"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v8z"
                                  ></path>
                                </svg>
                                Loading targets...
                              </div>
                            ) : validTargets.length > 0 ? (
                              validTargets.map((col) => {
                                const isSelected =
                                  selectedTargets.includes(col);
                                return (
                                  <div
                                    key={col}
                                    onClick={() => handleMultiSelectToggle(col)}
                                    className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
                                  >
                                    <div
                                      className={`w-4 h-4 border rounded flex items-center justify-center ${
                                        isSelected
                                          ? "bg-green-500 border-green-500"
                                          : "border-gray-300"
                                      }`}
                                    >
                                      {isSelected && (
                                        <svg
                                          className="w-3 h-3 text-white"
                                          fill="none"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth="2"
                                          viewBox="0 0 24 24"
                                          stroke="currentColor"
                                        >
                                          <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                      )}
                                    </div>
                                    <span className="text-sm">{col}</span>
                                  </div>
                                );
                              })
                            ) : (
                              <div className="px-4 py-2 text-sm text-muted-foreground">
                                No valid targets
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    ) : (
                      // Single-select for other functions
                      <Select
                        value={selectedTarget}
                        onValueChange={handleTargetChange}
                      >
                        <SelectTrigger className="w-full bg-background">
                          <SelectValue placeholder="Select target" />
                        </SelectTrigger>
                        <SelectContent
                          className="bg-background border border-border z-[100]"
                          position="popper"
                          sideOffset={5}
                          align="start"
                          side="bottom"
                        >
                          {!blobPathReady ? (
                            <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                              <svg
                                className="animate-spin h-3 w-3"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v8z"
                                ></path>
                              </svg>
                              Loading targets...
                            </div>
                          ) : validTargets.length > 0 ? (
                            validTargets.map((col) => (
                              <SelectItem key={col} value={col}>
                                {col}
                              </SelectItem>
                            ))
                          ) : (
                            <div className="px-4 py-2 text-sm text-muted-foreground">
                              No valid targets
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                )}

                {/* Horizon - Show for both cases */}
                {(selectedFunction === "Multi_Step_Forecasting" ||
                  needsTransformation) && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Horizon
                    </p>
                    <input
                      type="number"
                      value={horizon}
                      onChange={(e) => {
                        setHorizon(Number(e.target.value));
                        checkConfigChange(
                          selectedFunction,
                          selectedModel || "",
                          selectedTarget,
                          selectedTargets,
                          Number(e.target.value),
                        );
                      }}
                      className="w-full bg-background border border-border rounded-md px-3 py-2"
                      min="1"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Build Button */}
            <Button
              onClick={handleBuild}
              disabled={!canBuild || isBuilding}
              size="sm"
              className={!canBuild && !isBuilding ? "opacity-50" : ""}
            >
              {isBuilding ? (
                "Building..."
              ) : (
                <>
                  Build Model
                  <Sparkles className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>

            {/* All Models Results */}
            {sortedModelKeys.map((modelKey, index) => {
              const modelData = allModelsResults[modelKey];
              const isBestModel = modelKey === bestModelKey;

              return (
                <div
                  key={modelKey}
                  className="bg-card rounded-xl border border-border p-6 mt-6"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <h2 className="text-lg font-bold text-foreground capitalize">
                      {modelKey.replace(/_/g, " ")}
                    </h2>
                    {isBestModel && (
                      <span className="px-3 py-1 text-xs font-semibold bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full">
                        Best Model
                      </span>
                    )}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground"></th>
                          {metrics.map((spec) => (
                            <th
                              key={spec.key}
                              className="text-left py-3 px-4 text-sm font-medium text-primary uppercase tracking-wide"
                            >
                              {spec.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-border/50">
                          <td className="py-4 px-4 text-foreground font-medium">
                            Training Results
                          </td>
                          {metrics.map((spec) => (
                            <td
                              key={spec.key}
                              className="py-4 px-4 text-foreground"
                            >
                              {renderMetricValue(modelData.train[spec.key])}
                              {spec.key === primaryMetric && isBestModel && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded">
                                  Train {spec.label}
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-4 px-4 text-foreground font-medium">
                            Testing Results
                          </td>
                          {metrics.map((spec) => (
                            <td
                              key={spec.key}
                              className="py-4 px-4 text-foreground"
                            >
                              {renderMetricValue(modelData.test[spec.key])}
                              {spec.key === primaryMetric && isBestModel && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                                  Test {spec.label}
                                </span>
                              )}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
            {textSummary && (
              <div className="w-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="relative bg-card rounded-xl border border-border p-6 mt-6
                  border-l-4 border-l-indigo-500"
                >
                  {/* Badge */}
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-100 text-indigo-800">
                      Model Insights
                    </span>
                  </div>

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-md bg-indigo-100">
                      <Sparkles className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">
                      Model Insights & Explanation
                    </h3>
                  </div>

                  {/* Content */}
                  <div className="prose prose-sm max-w-none text-foreground">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-2 text-muted-foreground">
                            {children}
                          </p>
                        ),
                        strong: ({ children }) => (
                          <strong className="text-foreground font-semibold">
                            {children}
                          </strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc ml-5 space-y-1 mt-2">
                            {children}
                          </ul>
                        ),
                        li: ({ children }) => (
                          <li className="text-muted-foreground">{children}</li>
                        ),
                      }}
                    >
                      {formatSummary(textSummary)}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              </div>
            )}

            {driftReport && (
              <div className="max-w-7xl mx-auto w-full">
                <div
                  className={`relative bg-card rounded-xl border border-border p-6 mt-6
                  ${
                    isDataDrift
                      ? "border-l-4 border-l-amber-500"
                      : isPerformanceDrift
                        ? "border-l-4 border-l-red-500"
                        : "border-l-4 border-l-green-500"
                  }`}
                >
                  {/* Status Badge */}
                  <div className="absolute top-4 right-4">
                    {isDataDrift && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800">
                        Data Drift
                      </span>
                    )}
                    {isPerformanceDrift && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Performance Drift
                      </span>
                    )}
                    {!isDataDrift && !isPerformanceDrift && (
                      <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        Stable
                      </span>
                    )}
                  </div>

                  {/* Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">
                      {isDataDrift ? "⚠️" : isPerformanceDrift ? "📉" : "✅"}
                    </span>
                    <h2 className="text-lg font-bold text-foreground">
                      Drift Monitoring
                    </h2>
                  </div>

                  <p className="text-muted-foreground mb-4">
                    {driftReport.summary_message}
                  </p>

                  {/* Metadata (Total Versions only) */}
                  <div className="mb-6">
                    <p className="text-sm text-muted-foreground">
                      Total Model Versions
                    </p>
                    <p className="text-foreground font-semibold text-lg">
                      {driftReport.total_versions}
                    </p>
                  </div>

                  {/* ===================== DATA DRIFT ===================== */}
                  {isDataDrift && (
                    <>
                      <h3 className="text-base font-semibold text-foreground mb-3">
                        Data Drift Details
                      </h3>

                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Overall PSI
                          </p>
                          <p
                            className={`text-lg font-bold ${
                              driftReport.data_drift.overall_psi > 0.25
                                ? "text-amber-600"
                                : "text-foreground"
                            }`}
                          >
                            {driftReport.data_drift.overall_psi}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            Drifted Features
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {driftReport.data_drift.drifted_features_count}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            Status
                          </p>
                          <p className="capitalize text-foreground font-medium">
                            {driftReport.data_drift.status}
                          </p>
                        </div>
                      </div>

                      {/* Drifted Features */}
                      {driftReport.data_drift.drifted_features?.length > 0 && (
                        <div className="mt-3">
                          <p className="text-sm text-muted-foreground mb-2">
                            Drifted Columns
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {driftReport.data_drift.drifted_features.map(
                              (f: string) => (
                                <span
                                  key={f}
                                  className="px-3 py-1 text-xs rounded-full
                    bg-amber-100 text-amber-900
                    border border-amber-200"
                                >
                                  {f}
                                </span>
                              ),
                            )}
                          </div>
                        </div>
                      )}

                      {/* Details */}
                      {driftReport.details && (
                        <p className="mt-4 text-sm text-muted-foreground whitespace-pre-line">
                          {driftReport.details}
                        </p>
                      )}
                    </>
                  )}

                  {/* ===================== PERFORMANCE DRIFT ===================== */}
                  {isPerformanceDrift && (
                    <>
                      <h3 className="text-base font-semibold text-foreground mb-3">
                        Performance Drift Details
                      </h3>

                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Baseline Metric
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {driftReport.performance_drift.baseline_metric}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            Current Metric
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {driftReport.performance_drift.current_metric ??
                              "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-muted-foreground">
                            Change %
                          </p>
                          <p className="text-lg font-bold text-foreground">
                            {driftReport.performance_drift.change_percent}%
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Recommendation */}
                  <div className="mt-6 rounded-md bg-muted/50 p-4">
                    <p className="text-sm font-semibold text-foreground">
                      Recommendation
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {driftReport.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </main>{" "}
          {/*this div */}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 bg-muted/30 min-h-full">
        <div className="w-full px-8">
          <p className="text-destructive">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {cameFromJobs1 ? <Header1 /> : <Header />}

      <div className="flex-1 overflow-auto">
        <main className="px-6 py-6 max-w-7xl mx-auto w-full">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Build a Model
              </h1>
            </div>
            <div className="flex items-center gap-3">
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

          {/* Model Information */}
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              Model Information
            </h2>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground">Dataset</p>
              <a href="#" className="text-primary hover:underline">
                {datasetName}
              </a>
            </div>
          </div>

          <div
            className={`grid gap-4 ${
              needsTransformation
                ? "grid-cols-4"
                : selectedFunction === "Multi_Step_Forecasting"
                  ? "grid-cols-4"
                  : "grid-cols-3"
            }`}
          >
            {/* Function - Show but disabled if needs transformation */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Choose Function
              </p>
              <Select
                value={selectedFunction}
                onValueChange={handleFunctionChange}
                disabled={needsTransformation}
              >
                <SelectTrigger className="w-full bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-[100]">
                  {needsTransformation ? (
                    <SelectItem value="Multi_Step_Forecasting">
                      Multi_Step_Forecasting
                    </SelectItem>
                  ) : (
                    functionTypes.map((func) => (
                      <SelectItem key={func} value={func}>
                        {func}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Model */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">Choose Model</p>
              <Select value={selectedModel} onValueChange={handleModelChange}>
                <SelectTrigger className="w-full bg-background">
                  <SelectValue placeholder="Select model" />
                </SelectTrigger>
                <SelectContent className="bg-background border border-border z-[100]">
                  {availableModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conditional: Show Dimensions/Measures OR regular Target */}
            {needsTransformation ? (
              <>
                {/* Dimensions */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Dimensions (Group By)
                  </p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <span
                          className={
                            selectedDimensions.length > 0
                              ? ""
                              : "text-muted-foreground"
                          }
                        >
                          {selectedDimensions.length > 0
                            ? `${selectedDimensions.length} selected`
                            : "Select dimensions"}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 opacity-50"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
                      align="start"
                      side="bottom"
                    >
                      <div className="max-h-[300px] overflow-y-auto">
                        {dimensions.length > 0 ? (
                          dimensions.map((dim: string) => {
                            const isSelected = selectedDimensions.includes(dim);
                            return (
                              <div
                                key={dim}
                                onClick={() => handleDimensionToggle(dim)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
                              >
                                <div
                                  className={`w-4 h-4 border rounded flex items-center justify-center ${
                                    isSelected
                                      ? "bg-green-500 border-green-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="none"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  )}
                                </div>
                                <span className="text-sm">{dim}</span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            No dimensions available
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Measures */}
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Measures</p>
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                        <span
                          className={
                            selectedMeasures.length > 0
                              ? ""
                              : "text-muted-foreground"
                          }
                        >
                          {selectedMeasures.length > 0
                            ? `${selectedMeasures.length} selected`
                            : "Select measures"}
                        </span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-4 w-4 opacity-50"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
                      align="start"
                      side="bottom"
                    >
                      <div className="max-h-[300px] overflow-y-auto">
                        {measures.length > 0 ? (
                          measures.map((measure: string) => {
                            const isSelected =
                              selectedMeasures.includes(measure);
                            return (
                              <div
                                key={measure}
                                onClick={() => handleMeasureToggle(measure)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
                              >
                                <div
                                  className={`w-4 h-4 border rounded flex items-center justify-center ${
                                    isSelected
                                      ? "bg-green-500 border-green-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="none"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  )}
                                </div>
                                <span className="text-sm">{measure}</span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            No measures available
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </>
            ) : (
              // ✅ Regular Target Field - ONLY SHOWN WHEN needsTransformation = false
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Choose Target
                  {selectedFunction === "Multi_Step_Forecasting"
                    ? "s (Select multiple)"
                    : ""}
                </p>

                {selectedFunction === "Multi_Step_Forecasting" ? (
                  // Multi-select for Multi_Step_Forecasting
                  <Popover>
                    <PopoverTrigger asChild>
                      <button className="w-full bg-background border border-input rounded-md px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground">
                        {selectedTargets.length > 0
                          ? `${selectedTargets.length} selected`
                          : "Select targets"}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0 bg-background border border-border"
                      align="start"
                      side="bottom"
                    >
                      <div className="max-h-[300px] overflow-y-auto">
                        {!blobPathReady ? (
                          <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                            <svg
                              className="animate-spin h-3 w-3"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v8z"
                              ></path>
                            </svg>
                            Loading targets...
                          </div>
                        ) : validTargets.length > 0 ? (
                          validTargets.map((col) => {
                            const isSelected = selectedTargets.includes(col);
                            return (
                              <div
                                key={col}
                                onClick={() => handleMultiSelectToggle(col)}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-muted cursor-pointer"
                              >
                                <div
                                  className={`w-4 h-4 border rounded flex items-center justify-center ${
                                    isSelected
                                      ? "bg-green-500 border-green-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && (
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="none"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth="2"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path d="M5 13l4 4L19 7"></path>
                                    </svg>
                                  )}
                                </div>
                                <span className="text-sm">{col}</span>
                              </div>
                            );
                          })
                        ) : (
                          <div className="px-4 py-2 text-sm text-muted-foreground">
                            No valid targets
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  // Single-select for other functions
                  <Select
                    value={selectedTarget}
                    onValueChange={handleTargetChange}
                  >
                    <SelectTrigger className="w-full bg-background">
                      <SelectValue placeholder="Select target" />
                    </SelectTrigger>
                    <SelectContent
                      className="bg-background border border-border z-[100]"
                      position="popper"
                      sideOffset={5}
                      align="start"
                      side="bottom"
                    >
                      {!blobPathReady ? (
                        <div className="px-4 py-2 text-sm text-muted-foreground flex items-center gap-2">
                          <svg
                            className="animate-spin h-3 w-3"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v8z"
                            ></path>
                          </svg>
                          Loading targets...
                        </div>
                      ) : validTargets.length > 0 ? (
                        validTargets.map((col) => (
                          <SelectItem key={col} value={col}>
                            {col}
                          </SelectItem>
                        ))
                      ) : (
                        <div className="px-4 py-2 text-sm text-muted-foreground">
                          No valid targets
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Horizon - Show for both cases when applicable */}
            {(selectedFunction === "Multi_Step_Forecasting" ||
              needsTransformation) && (
              <div>
                <p className="text-sm text-muted-foreground mb-2">Horizon</p>
                <input
                  type="number"
                  value={horizon}
                  onChange={(e) => {
                    setHorizon(Number(e.target.value));
                    checkConfigChange(
                      selectedFunction,
                      selectedModel || "",
                      selectedTarget,
                      selectedTargets,
                      Number(e.target.value),
                    );
                  }}
                  className="w-full bg-background border border-border rounded-md px-3 py-2"
                  min="1"
                />
              </div>
            )}
          </div>

          {/* Build Button */}
          <Button
            onClick={handleBuild}
            disabled={!canBuild || isBuilding}
            size="sm"
            className={`mt-6 ${!canBuild && !isBuilding ? "opacity-50" : ""}`}
          >
            {isBuilding ? (
              "Building..."
            ) : (
              <>
                Build Model
                <Sparkles className="w-4 h-4 ml-4" />
              </>
            )}
          </Button>
        </main>
      </div>
    </div>
  );
};

export default BuildModelTab;

