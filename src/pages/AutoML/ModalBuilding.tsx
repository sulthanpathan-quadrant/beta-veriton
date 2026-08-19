// import { useNavigate, useParams } from "react-router-dom";
// import { motion } from "framer-motion";
// import {
//   ArrowLeft,
//   Download,
//   Database,
//   Cpu,
//   CheckCircle,
//   TrendingUp,
//   Play,
//   MessageSquare,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// // import { useAuth } from "@/contexts/AuthContext";
// import { useAuth } from "@/components/contexts/AuthContext";
// // import { useChatContext } from "@/contexts/ChatContext";
// import { useChatContext } from "@/components/contexts/ChatContext";
// import { useEffect, useMemo, useRef, useState } from "react";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";

// type SortMetric =
//   | "accuracy"
//   | "f1"
//   | "precision"
//   | "recall"
//   | "rmse"
//   | "auc"
//   | "mae"
//   | "r2"
//   | "mape";

// const MetricLabels: Record<SortMetric, string> = {
//   accuracy: "Accuracy",
//   f1: "F1",
//   precision: "Precision",
//   recall: "Recall",
//   rmse: "RMSE",
//   auc: "AUC",
//   mae: "MAE",
//   r2: "R²",
//   mape: "MAPE",
// };

// const ModalBuilding = () => {
//   const navigate = useNavigate();
//   const { buildId } = useParams<{ buildId: string }>();

//   const { isAuthenticated } = useAuth();

//   const {
//     getSessionByBuildId,
//     openChatWithSession,
//     setIsOpen,
//     setCurrentSessionId, // ← add this
//     setMessages, // ← add this
//   } = useChatContext();

//   const [sortBy, setSortBy] = useState<SortMetric>("rmse");
//   const continueButtonRef = useRef<HTMLButtonElement>(null);

//   // local UI state for fallback message or manual refresh
//   const [localMessage, setLocalMessage] = useState<string | null>(null);

//   type MetricSpec = {
//     key: string;
//     label: string;
//     isLowerBetter?: boolean;
//   };

//   const metricsByTask: Record<string, MetricSpec[]> = {
//     Classification: [
//       { key: "accuracy", label: "Accuracy" },
//       { key: "f1", label: "F1 Score" },
//       { key: "precision", label: "Precision" },
//       { key: "recall", label: "Recall" },
//       { key: "roc_auc", label: "ROC-AUC" },
//       { key: "precision_recall_auc", label: "PR-AUC" },
//     ],

//     Regression: [
//       { key: "rmse", label: "RMSE" },
//       { key: "mae", label: "MAE" },
//       { key: "r2", label: "R²" },
//       { key: "mape", label: "MAPE" },
//       { key: "mean_residual", label: "Mean Residual" },
//       { key: "std_residual", label: "Std Residual" },
//       { key: "pred_mean", label: "Pred Mean" },
//       { key: "pred_std", label: "Pred Std" },
//     ],

//     Forecasting: [
//       { key: "rmse", label: "RMSE" },
//       { key: "mae", label: "MAE" },
//       { key: "r2", label: "R²" },
//       { key: "mape", label: "MAPE" },
//       { key: "mse", label: "MSE" },
//     ],

//     Clustering: [
//       { key: "n_clusters", label: "Clusters" },
//       { key: "n_noise_points", label: "Noise Points" },
//       { key: "silhouette_score", label: "Silhouette Score" },
//       { key: "davies_bouldin_score", label: "Davies-Bouldin" },
//       { key: "calinski_harabasz", label: "Calinski-Harabasz" },
//     ],

//     "Anomaly Detection": [
//       { key: "n_anomalies", label: "Anomalies" },
//       { key: "anomaly_percentage", label: "Anomaly %" },
//       { key: "anomaly_score", label: "Anomaly Score" },
//     ],
//   };

//   // Try to find a session that has this build id
//   const session = buildId ? getSessionByBuildId(buildId) : null;

//   // Extract buildData from the session (search for a message with type 'build-complete')
//   const buildMessage = useMemo(() => {
//     if (!session) return null;
//     const found = session.messages?.find(
//       (m) => m.type === "build-complete" && (m as any).buildData,
//     );
//     return (found as any) ?? null;
//   }, [session]);

//   // Combined build data object (from buildMessage.buildData). If none, we display helpful instructions.
//   // Replace your current buildMessage + buildData logic with this
//   const buildData = useMemo(() => {
//     if (!session?.messages) return null;

//     // Try to find ANY message that contains AutoML-like data
//     for (const msg of session.messages) {
//       // Option 1: your original (type + buildData field)
//       if (msg.type === "build-complete" && (msg as any).buildData) {
//         return (msg as any).buildData;
//       }

//       // Option 2: message has the shape of your API response directly
//       if ((msg as any).status === "success" && (msg as any).all_models) {
//         return msg as any; // the whole response becomes buildData
//       }

//       // Option 3: sometimes stored in content or payloa
//     }

//     return null;
//   }, [session]);

//   console.log("=== BUILD DATA DEBUG ===");
//   console.log("session:", session);
//   console.log("buildMessage:", buildMessage);
//   console.log("buildData:", buildData);
//   console.log("has analysis?:", !!buildData?.analysis);
//   console.log("has suggestions?:", !!buildData?.suggestions);
//   console.log("analysis content preview:", buildData?.analysis?.slice(0, 100));

//   // Extract task type from buildData
//   const taskType = buildData?.task_type || "Classification";

//   const metricSpecs = metricsByTask[taskType] || [];

//   // Update sortBy based on task type
//   useEffect(() => {
//     if (buildData?.task_type === "Regression") {
//       setSortBy("rmse");
//     } else if (buildData?.task_type === "Classification") {
//       setSortBy("accuracy");
//     }
//   }, [buildData?.task_type]);

//   // Compose dataset preview / models from buildData.results if available; otherwise empty
//   const datasetInfo =
//     buildData?.dataset ||
//     buildData?.blob_file_used?.split("/").pop() ||
//     buildData?.dataset_name ||
//     "Unknown dataset";

//   const datasetRows =
//     (buildData?.rows ?? buildData?.results?.train?.class_distribution)
//       ? null
//       : null;
//   // Models information — try to extract from buildData.results.all_models or from a `models` field
//   const allModelsFromResults = buildData?.results?.all_models;

//   const modelsList = useMemo(() => {
//     console.log("=== DEBUG MODEL PARSING ===");
//     console.log("allModelsFromResults:", allModelsFromResults);

//     if (!allModelsFromResults) {
//       console.log(
//         "allModelsFromResults is null/undefined - returning empty array",
//       );
//       return [];
//     }

//     console.log(
//       "allModelsFromResults keys:",
//       Object.keys(allModelsFromResults),
//     );

//     const models: Array<any> = [];

//     // Iterate through each model in all_models
//     for (const modelName of Object.keys(allModelsFromResults)) {
//       const modelData = allModelsFromResults[modelName];
//       console.log(`Processing model: ${modelName}`, modelData);

//       // Get test metrics (prefer test, fallback to train)
//       const metrics = modelData?.test || modelData?.train || {};

//       // Get params if available
//       const params = modelData?.train?.params || modelData?.params || {};

//       models.push({
//         name: modelName,
//         type: "Model",
//         params: params,
//         metrics: metrics,
//       });
//     }

//     console.log("Final models array:", models);
//     return models;
//   }, [allModelsFromResults]);

//   const handleContinueChat = () => {
//     if (!buildId) {
//       // Fallback – just open if no buildId
//       setIsOpen(true);
//       return;
//     }

//     const targetSession = getSessionByBuildId(buildId);

//     if (targetSession) {
//       // 1. Switch to the correct session
//       setCurrentSessionId(targetSession.id);
//       setMessages(targetSession.messages || []);

//       // 2. Navigate back to the page that has <Chatbot />
//       navigate("/workflow/automl/jobs1"); // ← or whatever the real path to Jobs1 is

//       // 3. Open chat after navigation (small delay helps)
//       setTimeout(() => {
//         setIsOpen(true);
//       }, 300); // give time for page to mount Chatbot
//     } else {
//       // No session → navigate anyway and open chat
//       navigate("/workflow/automl/jobs1");
//       setTimeout(() => setIsOpen(true), 300);
//     }
//   };

//   const formatAnalysisToMarkdown = (text: string) => {
//     if (!text) return "";

//     return (
//       text
//         // Headings
//         .replace(/^Task Summary/gm, "\n\n### Task Summary\n")
//         .replace(/^Performance Metrics.*$/gm, "\n\n### $&\n")
//         .replace(/^Feature Insights.*$/gm, "\n\n### $&\n")
//         .replace(/^Recommendations/gm, "\n\n### Recommendations\n")
//         .replace(/^Next Steps/gm, "\n\n### Next Steps\n")
//         .replace(/^Overall Verdict/gm, "\n\n### Overall Verdict\n")

//         // Sub-headings
//         .replace(/^([A-Za-z /()_-]+:)/gm, "\n\n**$1**\n")

//         // Bullets
//         .replace(/^\s*-\s/gm, "- ")

//         // 👇 THIS LINE YOU ASKED ABOUT
//         .replace(/^([A-Za-z ]+):/gm, "**$1:**")

//         // Spacing
//         .replace(/\n{2,}/g, "\n\n")
//     );
//   };

//   // If we have no build data, show helpful instructions and option to open the chat (where build happened)
//   if (!buildData) {
//     return (
//       <div className="min-h-screen bg-background">
//         <header className="sticky top-0 bg-card backdrop-blur-sm border-b border-border z-40">
//           <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
//             {/* <motion.button
//               initial={{ opacity: 0, x: -20 }}
//               animate={{ opacity: 1, x: 0 }}
//               onClick={() => navigate("/")}
//               className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
//             >
//               <ArrowLeft className="w-4 h-4" />
//               <span className="text-sm font-medium">Back to Home</span>
//             </motion.button> */}

//             <div className="flex items-center gap-3">
//               <Button
//                 ref={continueButtonRef}
//                 variant="outline"
//                 size="sm"
//                 onClick={handleContinueChat}
//                 className="gap-2"
//               >
//                 <MessageSquare className="w-4 h-4" />
//                 Continue Chat
//               </Button>
//               <div className="flex items-center gap-2">
//                 <CheckCircle className="w-5 h-5 text-success" />
//                 <span className="text-sm font-medium text-foreground">
//                   No Build Data
//                 </span>
//               </div>
//             </div>
//           </div>
//         </header>

//         <main className="max-w-7xl mx-auto p-6">
//           <motion.div
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             className="mb-8"
//           >
//             <h1 className="text-2xl font-bold text-foreground mb-1 ">
//               Model Build Results
//             </h1>
//             <motion.div
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               className="w-full flex flex-col gap-6 mb-6"
//             >
//               <h2 className="text-sm font-semibold mb-4 text-foreground">
//                 Run Info
//               </h2>

//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
//                 <div className="p-3 bg-secondary/30 rounded">
//                   <p className="text-xs text-muted-foreground">Dataset</p>
//                   <p className="font-medium">
//                     {buildData?.blob_file_used?.split("/").pop()}
//                   </p>
//                 </div>

//                 <div className="p-3 bg-secondary/30 rounded">
//                   <p className="text-xs text-muted-foreground">Task Type</p>
//                   <p className="font-medium">{taskType}</p>
//                 </div>

//                 <div className="p-3 bg-secondary/30 rounded">
//                   <p className="text-xs text-muted-foreground">
//                     Primary Metric
//                   </p>
//                   <p className="font-medium">
//                     {buildData?.primary_metric?.toUpperCase()}
//                   </p>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>

//           <div className="glass-card rounded-xl p-6">
//             <h2 className="text-lg font-semibold text-foreground mb-2">
//               No build details found
//             </h2>
//             <p className="text-sm text-muted-foreground mb-4">
//               We couldn't find saved build results for this build id. This
//               usually means:
//             </p>
//             <ul className="list-disc ml-6 text-sm text-muted-foreground mb-4">
//               <li>
//                 The build completed but wasn't saved to the chat session (race
//                 condition).
//               </li>
//               <li>
//                 You opened this page directly (deep link) and the app doesn't
//                 have the build stored locally.
//               </li>
//               <li>The build id in the URL is incorrect or trimmed.</li>
//             </ul>

//             <div className="flex gap-3">
//               <Button variant="outline" onClick={() => navigate("/")}>
//                 Back Home
//               </Button>
//               <Button onClick={handleContinueChat}>Open Chat</Button>
//             </div>

//             <p className="text-xs text-muted-foreground mt-4">
//               Tip: Open the chat where you built the model — the build results
//               are saved there and we will display them here once available.
//             </p>
//           </div>
//         </main>
//       </div>
//     );
//   }

//   // Build data exists — render the actual UI using buildData & modelsList
//   // Format helper for numeric metrics
//   const fmt = (v: any, isPercentage: boolean = false) => {
//     if (v === null || v === undefined) return "-";
//     if (typeof v === "number") {
//       if (isPercentage && v <= 1) {
//         // Convert decimal to percentage (0.778 → 77.8%)
//         return (Math.round(v * 1000) / 10).toFixed(1);
//       }
//       return Number.isFinite(v)
//         ? (Math.round(v * 1000) / 1000).toString()
//         : String(v);
//     }
//     return String(v);
//   };

//   // ... (imports and hooks remain the same)

//   return (
//     <div className="min-h-screen bg-background">
//       <header className="sticky top-0 bg-card backdrop-blur-sm border-b border-border z-40">
//         <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
//           <motion.button
//             initial={{ opacity: 0, x: -20 }}
//             animate={{ opacity: 1, x: 0 }}
//             onClick={() => navigate("/")}
//             className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
//           >
//             {/* <ArrowLeft className="w-4 h-4" /> */}
//             {/* <span className="text-sm font-medium">Back to Home</span> */}
//           </motion.button>

//           <div className="flex items-center gap-3">
//             <Button
//               variant="outline"
//               size="sm"
//               onClick={handleContinueChat}
//               className="gap-2"
//             >
//               <MessageSquare className="w-4 h-4" />
//               Continue Chat
//             </Button>
//             <div className="flex items-center gap-2">
//               <CheckCircle className="w-5 h-5 text-green-500" />
//               <span className="text-sm font-medium">Build Complete</span>
//             </div>
//           </div>
//         </div>
//       </header>

//       <main className="max-w-7xl mx-auto px-6 py-8">
//         {/* Header Info */}
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           className="mb-10"
//         >
//           <h1 className="text-3xl font-bold text-foreground mb-2">
//             Model Build Results
//           </h1>
//           <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
//             {/* <p>Build ID: {buildData?.buildId ?? buildId}</p> */}
//             <span className="hidden sm:inline">•</span>
//             <p>Task: {taskType}</p>
//             <span className="hidden sm:inline">•</span>
//             <p>
//               Dataset:{" "}
//               <span className="font-medium text-foreground">
//                 {buildData?.blob_file_used?.split("/").pop() ||
//                   buildData?.dataset_name ||
//                   "sample11.csv"}
//               </span>
//             </p>
//           </div>
//         </motion.div>

//         {/* Model Cards – one per model, stacked vertically */}
//         <div className="space-y-8 mb-12">
//           {Object.entries(allModelsFromResults || {}).map(
//             ([modelName, modelData]: [string, any]) => (
//               <motion.div
//                 key={modelName}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
//               >
//                 {/* Model Header */}
//                 <div className="px-6 py-4 border-b bg-muted/40">
//                   <div className="flex items-center justify-between">
//                     <h3 className="text-xl font-semibold text-[hsl(var(--primary))]">
//                       {modelName}
//                     </h3>
//                     {modelName === buildData?.best_model && (
//                       <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
//                         <CheckCircle className="w-4 h-4" />
//                         Best Model
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 {/* Metrics Table */}
//                 <div className="p-6">
//                   <div className="overflow-x-auto">
//                     <table className="w-full text-sm">
//                       <thead>
//                         <tr className="border-b text-muted-foreground">
//                           <th className="text-left py-3 font-medium">Split</th>
//                           {metricSpecs.map((metric) => (
//                             <th
//                               key={metric.key}
//                               className="text-center py-3 font-medium"
//                             >
//                               {metric.label}
//                             </th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         <tr className="border-b">
//                           <td className="py-4 font-medium">Train</td>
//                           {metricSpecs.map((metric) => (
//                             <td key={metric.key} className="text-center py-4">
//                               {fmt(
//                                 modelData?.train?.[metric.key],
//                                 metric.key.includes("mape"),
//                               )}
//                             </td>
//                           ))}
//                         </tr>
//                         <tr>
//                           <td className="py-4 font-medium">Test</td>
//                           {metricSpecs.map((metric) => (
//                             <td key={metric.key} className="text-center py-4">
//                               {fmt(
//                                 modelData?.test?.[metric.key],
//                                 metric.key.includes("mape"),
//                               )}
//                             </td>
//                           ))}
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               </motion.div>
//             ),
//           )}
//         </div>

//         {/* Analysis Summary */}
//         {buildData?.analysis && (
//           <motion.section
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.2 }}
//             className="bg-card border border-border rounded-xl p-7 mb-10"
//           >
//             <h2 className="text-2xl font-semibold mb-5 text-[hsl(var(--primary))]">Analysis Summary</h2>
//             <div className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed">
//               <ReactMarkdown
//                 remarkPlugins={[remarkGfm]}
//                 components={{
//                   h2: ({ children }) => (
//                     <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">
//                       {children}
//                     </h2>
//                   ),
//                   h3: ({ children }) => (
//                     <h3 className="text-lg font-semibold mt-6 mb-2">
//                       {children}
//                     </h3>
//                   ),
//                   p: ({ children }) => (
//                     <p className="mb-3 leading-relaxed">{children}</p>
//                   ),
//                   li: ({ children }) => <li className="mb-1">{children}</li>,
//                   strong: ({ children }) => (
//                     <strong className="font-semibold">{children}</strong>
//                   ),

//                   // ✅ ADD THESE
//                   table: ({ children }) => (
//                     <table className="w-full border border-border my-4 text-sm">
//                       {children}
//                     </table>
//                   ),
//                   thead: ({ children }) => (
//                     <thead className="bg-muted">{children}</thead>
//                   ),
//                   th: ({ children }) => (
//                     <th className="border px-3 py-2 text-left font-medium">
//                       {children}
//                     </th>
//                   ),
//                   td: ({ children }) => (
//                     <td className="border px-3 py-2">{children}</td>
//                   ),
//                 }}
//               >
//                 {formatAnalysisToMarkdown(buildData.analysis)}
//               </ReactMarkdown>
//             </div>
//           </motion.section>
//         )}

//         {/* Suggestions */}
//         {buildData?.suggestions?.length > 0 && (
//           <motion.section
//             initial={{ opacity: 0, y: 20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ delay: 0.3 }}
//             className="bg-card border border-border rounded-xl p-7"
//           >
//             <h2 className="text-2xl font-semibold mb-5 text-[hsl(var(--primary))]">
//               Next Steps & Suggestions
//             </h2>
//             <ul className="space-y-3 text-base">
//               {buildData.suggestions.map((s: string, i: number) => (
//                 <li key={i} className="flex items-start gap-3">
//                   <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
//                     {i + 1}
//                   </span>
//                   <span>{s}</span>
//                 </li>
//               ))}
//             </ul>
//           </motion.section>
//         )}

//         {/* Actions */}
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 0.4 }}
//           className="mt-12 flex flex-col sm:flex-row gap-4"
//         >
//           <Button className="flex-1 gap-2" variant="outline">
//             <Download className="w-4 h-4" />
//             Download Artifacts
//           </Button>
//           <Button className="flex-1 gap-2" onClick={handleContinueChat}>
//             <MessageSquare className="w-4 h-4" />
//             Continue in Chat
//           </Button>
//         </motion.div>
//       </main>
//     </div>
//   );
// };

// export default ModalBuilding;

// ModalBuilding.tsx
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Download,
  Database,
  Cpu,
  CheckCircle,
  TrendingUp,
  Play,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { useAuth } from "@/contexts/AuthContext";
import { useAuth } from "@/components/contexts/AuthContext";
// import { useChatContext } from "@/contexts/ChatContext";
import { useChatContext } from "@/components/contexts/ChatContext";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
 
type SortMetric =
  | "accuracy"
  | "f1"
  | "precision"
  | "recall"
  | "rmse"
  | "auc"
  | "mae"
  | "r2"
  | "mape";
 
const MetricLabels: Record<SortMetric, string> = {
  accuracy: "Accuracy",
  f1: "F1",
  precision: "Precision",
  recall: "Recall",
  rmse: "RMSE",
  auc: "AUC",
  mae: "MAE",
  r2: "R²",
  mape: "MAPE",
};
 
const ModalBuilding = () => {
  const navigate = useNavigate();
  const { buildId } = useParams<{ buildId: string }>();
 
  const { isAuthenticated } = useAuth();
 
  const {
    getSessionByBuildId,
    openChatWithSession,
    setIsOpen,
    setCurrentSessionId, // ← add this
    setMessages, // ← add this
  } = useChatContext();
 
  const [sortBy, setSortBy] = useState<SortMetric>("rmse");
  const continueButtonRef = useRef<HTMLButtonElement>(null);
 
  // local UI state for fallback message or manual refresh
  const [localMessage, setLocalMessage] = useState<string | null>(null);
 
  type MetricSpec = {
    key: string;
    label: string;
    isLowerBetter?: boolean;
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
      { key: "rmse", label: "RMSE" },
      { key: "mae", label: "MAE" },
      { key: "r2", label: "R²" },
      { key: "mape", label: "MAPE" },
      { key: "mean_residual", label: "Mean Residual" },
      { key: "std_residual", label: "Std Residual" },
      { key: "pred_mean", label: "Pred Mean" },
      { key: "pred_std", label: "Pred Std" },
    ],
 
    Forecasting: [
      { key: "rmse", label: "RMSE" },
      { key: "mae", label: "MAE" },
      { key: "r2", label: "R²" },
      { key: "mape", label: "MAPE" },
      { key: "mse", label: "MSE" },
    ],
 
    Clustering: [
      { key: "n_clusters", label: "Clusters" },
      { key: "n_noise_points", label: "Noise Points" },
      { key: "silhouette_score", label: "Silhouette Score" },
      { key: "davies_bouldin_score", label: "Davies-Bouldin" },
      { key: "calinski_harabasz", label: "Calinski-Harabasz" },
    ],
 
    "Anomaly Detection": [
      { key: "n_anomalies", label: "Anomalies" },
      { key: "anomaly_percentage", label: "Anomaly %" },
      { key: "anomaly_score", label: "Anomaly Score" },
    ],
 
    Multi_Step_Forecasting: [
      { key: "avg_rmse", label: "Avg RMSE", isLowerBetter: true },
      { key: "avg_mae", label: "Avg MAE", isLowerBetter: true },
      { key: "avg_r2", label: "Avg R²" },
      { key: "avg_mape", label: "Avg MAPE", isLowerBetter: true },
    ],
  };
 
  // Try to find a session that has this build id
  const session = buildId ? getSessionByBuildId(buildId) : null;
 
  // Extract buildData from the session (search for a message with type 'build-complete')
  const buildMessage = useMemo(() => {
    if (!session) return null;
    const found = session.messages?.find(
      (m) => m.type === "build-complete" && (m as any).buildData,
    );
    return (found as any) ?? null;
  }, [session]);
 
  // Combined build data object (from buildMessage.buildData). If none, we display helpful instructions.
  // Replace your current buildMessage + buildData logic with this
  const buildData = useMemo(() => {
    if (!session?.messages) return null;
 
    // Try to find ANY message that contains AutoML-like data
    for (const msg of session.messages) {
      // Option 1: your original (type + buildData field)
      if (msg.type === "build-complete" && (msg as any).buildData) {
        return (msg as any).buildData;
      }
 
      // Option 2: message has the shape of your API response directly
      if ((msg as any).status === "success" && (msg as any).all_models) {
        return msg as any; // the whole response becomes buildData
      }
 
      // Option 3: sometimes stored in content or payloa
    }
 
    return null;
  }, [session]);
 
  console.log("=== BUILD DATA DEBUG ===");
  console.log("session:", session);
  console.log("buildMessage:", buildMessage);
  console.log("buildData:", buildData);
  console.log("has analysis?:", !!buildData?.analysis);
  console.log("has suggestions?:", !!buildData?.suggestions);
  console.log("analysis content preview:", buildData?.analysis?.slice(0, 100));
 
  // Extract task type from buildData
  const taskType = buildData?.task_type || "Classification";
 
  const normalizedTaskType =
    taskType === "Multistep Forecasting" ? "Multi_Step_Forecasting" : taskType;
 
  const metricSpecs = metricsByTask[normalizedTaskType] || [];
 
  // Update sortBy based on task type
  useEffect(() => {
    if (buildData?.task_type === "Regression") {
      setSortBy("rmse");
    } else if (buildData?.task_type === "Classification") {
      setSortBy("accuracy");
    }
  }, [buildData?.task_type]);
 
  // Compose dataset preview / models from buildData.results if available; otherwise empty
  const datasetInfo =
    buildData?.dataset ||
    buildData?.blob_file_used?.split("/").pop() ||
    buildData?.dataset_name ||
    "Unknown dataset";
 
  const datasetRows =
    (buildData?.rows ?? buildData?.results?.train?.class_distribution)
      ? null
      : null;
  // Models information — try to extract from buildData.results.all_models or from a `models` field
  const allModelsFromResults =
    buildData?.results?.all_models || buildData?.all_models;
 
  const modelsList = useMemo(() => {
    console.log("=== DEBUG MODEL PARSING ===");
    console.log("allModelsFromResults:", allModelsFromResults);
 
    if (!allModelsFromResults) {
      console.log(
        "allModelsFromResults is null/undefined - returning empty array",
      );
      return [];
    }
 
    console.log(
      "allModelsFromResults keys:",
      Object.keys(allModelsFromResults),
    );
 
    const models: Array<any> = [];
 
    // Iterate through each model in all_models
    for (const modelName of Object.keys(allModelsFromResults)) {
      const modelData = allModelsFromResults[modelName];
      console.log(`Processing model: ${modelName}`, modelData);
 
      // Get test metrics (prefer test, fallback to train)
      const metrics = modelData?.test || modelData?.train || {};
 
      // Get params if available
      const params = modelData?.train?.params || modelData?.params || {};
 
      models.push({
        name: modelName,
        type: "Model",
        params: params,
        metrics: metrics,
      });
    }
 
    console.log("Final models array:", models);
    return models;
  }, [allModelsFromResults]);
 
  const handleContinueChat = () => {
    if (!buildId) {
      // Fallback – just open if no buildId
      setIsOpen(true);
      return;
    }
 
    const targetSession = getSessionByBuildId(buildId);
 
    if (targetSession) {
      // 1. Switch to the correct session
      setCurrentSessionId(targetSession.id);
      setMessages(targetSession.messages || []);
 
      // 2. Navigate back to the page that has <Chatbot />
      navigate("/workflow/automl/jobs1"); // ← or whatever the real path to Jobs1 is
 
      // 3. Open chat after navigation (small delay helps)
      setTimeout(() => {
        setIsOpen(true);
      }, 300); // give time for page to mount Chatbot
    } else {
      // No session → navigate anyway and open chat
      navigate("/workflow/automl/jobs1");
      setTimeout(() => setIsOpen(true), 300);
    }
  };
 
const getFileName = (buildData: any) => {
  const path =
    buildData?.blob_file_used ||
    buildData?.dataset_name ||
    buildData?.dataset;
 
  if (!path) return "—";
 
  const fileName = path.split("/").pop() || "";
 
  // remove extension + replace underscores
  return fileName
    .replace(/\.[^/.]+$/, "") // remove .csv
    .replace(/_/g, " ");
};
  const formatAnalysisToMarkdown = (text: string) => {
    if (!text) return "";
 
    return (
      text
        // Headings
        .replace(/^Task Summary/gm, "\n\n### Task Summary\n")
        .replace(/^Performance Metrics.*$/gm, "\n\n### $&\n")
        .replace(/^Feature Insights.*$/gm, "\n\n### $&\n")
        .replace(/^Recommendations/gm, "\n\n### Recommendations\n")
        .replace(/^Next Steps/gm, "\n\n### Next Steps\n")
        .replace(/^Overall Verdict/gm, "\n\n### Overall Verdict\n")
 
        // Sub-headings
        .replace(/^([A-Za-z /()_-]+:)/gm, "\n\n**$1**\n")
 
        // Bullets
        .replace(/^\s*-\s/gm, "- ")
 
        // 👇 THIS LINE YOU ASKED ABOUT
        .replace(/^([A-Za-z ]+):/gm, "**$1:**")
 
        // Spacing
        .replace(/\n{2,}/g, "\n\n")
    );
  };
 
  // If we have no build data, show helpful instructions and option to open the chat (where build happened)
  if (!buildData) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 bg-card backdrop-blur-sm border-b border-border z-40">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                ref={continueButtonRef}
                variant="outline"
                size="sm"
                onClick={handleContinueChat}
                className="gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Continue Chat
              </Button>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="text-sm font-medium text-foreground">
                  No Build Data
                </span>
              </div>
            </div>
          </div>
        </header>
 
        <main className="max-w-7xl mx-auto p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-2xl font-bold text-foreground mb-1 ">
              Model Build Results
            </h1>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full flex flex-col gap-6 mb-6"
            >
              <h2 className="text-sm font-semibold mb-4 text-foreground">
                Run Info
              </h2>
 
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground">Dataset</p>
                  <p className="font-medium">
                    <span className="font-medium text-foreground">
                      {getFileName(buildData)}
                    </span>
                  </p>
                </div>
 
                <div className="p-3 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground">Task Type</p>
                  <p className="font-medium">{taskType}</p>
                </div>
 
                <div className="p-3 bg-secondary/30 rounded">
                  <p className="text-xs text-muted-foreground">
                    Primary Metric
                  </p>
                  <p className="font-medium">
                    {buildData?.primary_metric?.toUpperCase()}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
 
          <div className="glass-card rounded-xl p-6">
            <h2 className="text-lg font-semibold text-foreground mb-2">
              No build details found
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              We couldn't find saved build results for this build id. This
              usually means:
            </p>
            <ul className="list-disc ml-6 text-sm text-muted-foreground mb-4">
              <li>
                The build completed but wasn't saved to the chat session (race
                condition).
              </li>
              <li>
                You opened this page directly (deep link) and the app doesn't
                have the build stored locally.
              </li>
              <li>The build id in the URL is incorrect or trimmed.</li>
            </ul>
 
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => navigate("/")}>
                Back Home
              </Button>
              <Button onClick={handleContinueChat}>Open Chat</Button>
            </div>
 
            <p className="text-xs text-muted-foreground mt-4">
              Tip: Open the chat where you built the model — the build results
              are saved there and we will display them here once available.
            </p>
          </div>
        </main>
      </div>
    );
  }
 
  // Build data exists — render the actual UI using buildData & modelsList
  // Format helper for numeric metrics
  const fmt = (v: any, isPercentage: boolean = false) => {
    if (v === null || v === undefined) return "-";
    if (typeof v === "number") {
      if (isPercentage && v <= 1) {
        // Convert decimal to percentage (0.778 → 77.8%)
        return (Math.round(v * 1000) / 10).toFixed(1);
      }
      return Number.isFinite(v)
        ? (Math.round(v * 1000) / 1000).toString()
        : String(v);
    }
    return String(v);
  };
 
  // ... (imports and hooks remain the same)
 
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 bg-card backdrop-blur-sm border-b border-border z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {/* <ArrowLeft className="w-4 h-4" /> */}
            {/* <span className="text-sm font-medium">Back to Home</span> */}
          </motion.button>
 
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleContinueChat}
              className="gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Continue Chat
            </Button>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">Build Complete</span>
            </div>
          </div>
        </div>
      </header>
 
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Header Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Model Build Results
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-muted-foreground">
            {/* <p>Build ID: {buildData?.buildId ?? buildId}</p> */}
            <span className="hidden sm:inline">•</span>
            <p>Task: {taskType}</p>
            <span className="hidden sm:inline">•</span>
            <p>
              Dataset:{" "}
              <span className="font-medium text-foreground">
                {getFileName(buildData)}
              </span>
            </p>
          </div>
        </motion.div>
 
        {/* Model Cards – one per model, stacked vertically */}
        <div className="space-y-8 mb-12">
          {Object.entries(allModelsFromResults || {}).map(
            ([modelName, modelData]: [string, any]) => (
              <motion.div
                key={modelName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
              >
                {/* Model Header */}
                <div className="px-6 py-4 border-b bg-muted/40">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-[hsl(var(--primary))]">
                      {modelName}
                    </h3>
                    {modelName === buildData?.best_model && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                        <CheckCircle className="w-4 h-4" />
                        Best Model
                      </span>
                    )}
                  </div>
                </div>
 
                {/* Metrics Table */}
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-muted-foreground">
                          <th className="text-left py-3 font-medium">Split</th>
                          {metricSpecs.map((metric) => (
                            <th
                              key={metric.key}
                              className="text-center py-3 font-medium"
                            >
                              {metric.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-4 font-medium">Train</td>
                          {metricSpecs.map((metric) => (
                            <td key={metric.key} className="text-center py-4">
                              {fmt(
                                modelData?.train?.[metric.key],
                                metric.key.includes("mape"),
                              )}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-4 font-medium">Test</td>
                          {metricSpecs.map((metric) => (
                            <td key={metric.key} className="text-center py-4">
                              {fmt(
                                modelData?.test?.[metric.key],
                                metric.key.includes("mape"),
                              )}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ),
          )}
        </div>
 
        {/* Analysis Summary */}
        {buildData?.analysis && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border rounded-xl p-7 mb-10"
          >
            <h2 className="text-2xl font-semibold mb-5 text-[hsl(var(--primary))]">
              Analysis Summary
            </h2>
            <div className="prose prose-neutral dark:prose-invert max-w-none text-base leading-relaxed">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h2: ({ children }) => (
                    <h2 className="text-xl font-bold mt-8 mb-3 text-foreground">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-semibold mt-6 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mb-3 leading-relaxed">{children}</p>
                  ),
                  li: ({ children }) => <li className="mb-1">{children}</li>,
                  strong: ({ children }) => (
                    <strong className="font-semibold">{children}</strong>
                  ),
 
                  // ✅ ADD THESE
                  table: ({ children }) => (
                    <table className="w-full border border-border my-4 text-sm">
                      {children}
                    </table>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-muted">{children}</thead>
                  ),
                  th: ({ children }) => (
                    <th className="border px-3 py-2 text-left font-medium">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="border px-3 py-2">{children}</td>
                  ),
                }}
              >
                {formatAnalysisToMarkdown(buildData.analysis)}
              </ReactMarkdown>
            </div>
          </motion.section>
        )}
 
        {/* Suggestions */}
        {buildData?.suggestions?.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card border border-border rounded-xl p-7"
          >
            <h2 className="text-2xl font-semibold mb-5 text-[hsl(var(--primary))]">
              Next Steps & Suggestions
            </h2>
            <ul className="space-y-3 text-base">
              {buildData.suggestions.map((s: string, i: number) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-1.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {i + 1}
                  </span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        )}
 
        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex flex-col sm:flex-row gap-4"
        >
          <Button className="flex-1 gap-2" variant="outline">
            <Download className="w-4 h-4" />
            Download Artifacts
          </Button>
          <Button className="flex-1 gap-2" onClick={handleContinueChat}>
            <MessageSquare className="w-4 h-4" />
            Continue in Chat
          </Button>
        </motion.div>
      </main>
    </div>
  );
};
 
export default ModalBuilding;
 
 