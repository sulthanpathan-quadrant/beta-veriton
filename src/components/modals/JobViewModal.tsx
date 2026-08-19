// import { useState, useEffect, useMemo } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { X, BarChart3, Loader2 } from 'lucide-react';
// import { Job } from '../types/jobs';
 
// interface JobViewModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   job: Job | null;
// }
 
// interface ModelMetrics {
//   accuracy?: number;
//   precision?: number;
//   recall?: number;
//   f1?: number;
//   roc_auc?: number;
//   rmse?: number;
//   mae?: number;
//   r2?: number;
//   mape?: number;
//   silhouette_score?: number;
//   davies_bouldin?: number;
//   calinski_harabasz?: number;
//   anomaly_score?: number;
//   avg_rmse?: number;      // ADD THESE 4 LINES
//   avg_mae?: number;
//   avg_r2?: number;
//   avg_mape?: number;
// }
 
// interface ModelData {
//   model_name: string;
//   is_best: boolean;
//   train_metrics: ModelMetrics;
//   test_metrics: ModelMetrics;
// }
 
// interface ApiResponse {
//   run_id: string;
//   model_id: string;
//   dataset_name: string;
//   task_type: string;
//   best_model: string;
//   target: string;
//   created_at: string;
//   all_models: ModelData[];
// }
 
// // Define which metrics to show for each task type
// const TASK_METRICS: Record<string, string[]> = {
//   'Classification': ['accuracy', 'precision', 'recall', 'f1', 'roc_auc'],
//   'Regression': ['rmse', 'mae', 'r2', 'mape'],
//   'Forecasting': ['rmse', 'mae', 'r2', 'mape'],
//   'Clustering': ['silhouette_score', 'davies_bouldin', 'calinski_harabasz'],
//   'Anomaly Detection': ['anomaly_score', 'precision', 'recall', 'f1'],
//   'Multistep_Forecasting': ['avg_rmse', 'avg_mae', 'avg_r2', 'avg_mape'],
// };
 
// // Metric display names
// const METRIC_LABELS: Record<string, string> = {
//   'accuracy': 'Accuracy',
//   'f1': 'F1 Score',
//   'precision': 'Precision',
//   'recall': 'Recall',
//   'roc_auc': 'ROC-AUC',
//   'rmse': 'RMSE',
//   'mae': 'MAE',
//   'r2': 'R²',
//   'mape': 'MAPE',
//   'silhouette_score': 'Silhouette Score',
//   'davies_bouldin': 'Davies-Bouldin',
//   'calinski_harabasz': 'Calinski-Harabasz',
//   'anomaly_score': 'Anomaly Score',
//    'avg_rmse': 'Avg RMSE',      // ADD THESE 4 LINES
//   'avg_mae': 'Avg MAE',
//   'avg_r2': 'Avg R²',
//   'avg_mape': 'Avg MAPE',
// };
 
// const JobViewModal = ({ isOpen, onClose, job }: JobViewModalProps) => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [apiData, setApiData] = useState<ApiResponse | null>(null);
 
// useEffect(() => {
//   if (isOpen && job && job.status !== "failed") {
//     fetchMetrics();
//   }
// }, [isOpen, job]);
 
//   const fetchMetrics = async () => {
//     if (!job) return;
 
//     setLoading(true);
//     setError(null);
 
//     try {
//       // Get email from localStorage
//       const userDataString = localStorage.getItem('aivolve_user');
//       if (!userDataString) {
//         throw new Error('User not found');
//       }
 
//       const userData = JSON.parse(userDataString);
//       const userEmail = userData.email;
 
//       console.log('Fetching metrics for model:', job.id, 'user:', userEmail);
 
//       const apiUrl = `https://api.veriton.ai/api/service3/model_detailed_metrics/${job.id}?user_email=${encodeURIComponent(userEmail)}`;
     
//       const response = await fetch(apiUrl, {
//         method: 'GET',
//         headers: {
//           'accept': 'application/json'
//         }
//       });
 
//       if (!response.ok) {
//         throw new Error(`API request failed with status ${response.status}`);
//       }
 
//       const data: ApiResponse = await response.json();
//       console.log('Metrics fetched:', data);
//       setApiData(data);
//     } catch (err) {
//       const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metrics';
//       setError(errorMessage);
//       console.error('Error fetching metrics:', err);
//     } finally {
//       setLoading(false);
//     }
//   };
 
//   // Get the best model from all_models array
//   const bestModel = useMemo(() => {
//     if (!apiData?.all_models) return null;
//     return apiData.all_models.find(model => model.is_best) || null;
//   }, [apiData]);
 
//   // Get relevant metrics based on task type
//   const relevantMetrics = useMemo(() => {
//     if (!apiData?.task_type) return [];
//     return TASK_METRICS[apiData.task_type] || [];
//   }, [apiData?.task_type]);
 
//   // Helper function to format metric values
//   const formatMetricValue = (value: any): string => {
//     if (value === undefined || value === null || value === '') return '—';
//     if (typeof value === 'number') {
//       return value.toFixed(4);
//     }
//     return String(value);
//   };
 
//   // Helper function to get metric value from metrics object
//   const getMetricValue = (metrics: ModelMetrics | undefined, metricKey: string): string => {
//     if (!metrics) return '—';
//     const value = metrics[metricKey as keyof ModelMetrics];
//     return formatMetricValue(value);
//   };
 
//   if (!job) return null;
//       if (job.status === "failed") {
//   const rawError = (job as any).error_message || "Unknown error";
 
//   // 🔥 Clean error message
//   const cleanError = rawError
//     .replace("AutoML training failed (FUN1_URL error):", "")
//     .replace(/FUN1 returned 500:/g, "")
//     .replace(/\\\"/g, '"')
//     .trim();
 
//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           {/* Backdrop */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300]"
//             onClick={onClose}
//           />
 
//           {/* Modal */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95, y: 20 }}
//             className="fixed inset-0 flex items-center justify-center z-[301] p-4"
//           >
//             <div className="relative w-[500px] bg-card rounded-2xl border border-border shadow-2xl p-6">
 
//               {/* Header */}
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold text-red-600">
//                   Model Training Failed
//                 </h2>
//                 <button onClick={onClose}>
//                   <X className="w-5 h-5 text-muted-foreground" />
//                 </button>
//               </div>
 
//               {/* Dataset Info */}
//               <p className="text-sm text-muted-foreground mb-2">
//                 Dataset: {job.datasetName}
//               </p>
 
//               {/* Error Box */}
//               <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 whitespace-pre-wrap">
//                 {cleanError}
//               </div>
 
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }
 
//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           {/* Backdrop */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300]"
//             onClick={onClose}
//           />
         
//           {/* Modal */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95, y: 20 }}
//             className="fixed inset-0 flex items-center justify-center z-[301] p-4"
//           >
//             <div
//               className="relative w-[55vw] max-w-[900px] h-[74vh] overflow-hidden bg-card rounded-2xl border border-border shadow-2xl flex flex-col"
//               role="dialog"
//               aria-modal="true"
//               aria-labelledby="job-view-modal-title"
//               onKeyDown={(e) => e.key === 'Escape' && onClose()}
//               tabIndex={-1}
//               ref={(el) => el?.focus()}
//             >
//               {/* Sticky Header */}
//               <div className="flex-shrink-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
//                 <div className="flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
//                     <BarChart3 className="w-5 h-5 text-primary" />
//                   </div>
//                   <div>
//                     <h2 id="job-view-modal-title" className="text-lg font-semibold text-foreground">Train vs Test Accuracy</h2>
//                     <p className="text-sm text-muted-foreground">Detailed metrics, parameters & analysis</p>
//                   </div>
//                 </div>
//                 <button
//                   onClick={onClose}
//                   className="p-2 rounded-lg hover:bg-secondary transition-colors"
//                   aria-label="Close modal"
//                 >
//                   <X className="w-5 h-5 text-muted-foreground" />
//                 </button>
//               </div>
 
//               {/* Content */}
//               <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
//                 {loading ? (
//                   <div className="flex items-center justify-center h-64">
//                     <div className="flex flex-col items-center gap-3">
//                       <Loader2 className="w-8 h-8 animate-spin text-primary" />
//                       <p className="text-sm text-muted-foreground">Loading metrics...</p>
//                     </div>
//                   </div>
//                 ) : error ? (
//                   <div className="flex items-center justify-center h-64">
//                     <div className="text-center">
//                       <p className="text-red-600 mb-2">{error}</p>
//                       <button
//                         onClick={fetchMetrics}
//                         className="text-sm text-primary hover:underline"
//                       >
//                         Try Again
//                       </button>
//                     </div>
//                   </div>
//                 ) : apiData && bestModel ? (
//                   <>
//                     {/* Job Info Summary */}
//                     <div className="mb-6 p-4 bg-muted/20 rounded-xl border border-border/50">
//                       <div className="flex items-center justify-between gap-4">
//                         <div className="flex-1">
//                           <p className="text-sm text-muted-foreground mb-1">Dataset</p>
//                           <p className="text-sm font-medium text-foreground">{apiData.dataset_name || job.datasetName || 'Unknown Dataset'}</p>
//                         </div>
 
//                         <div className="flex-1 text-center">
//                           <p className="text-sm text-muted-foreground mb-1">Task Type</p>
//                           <p className="text-sm font-medium text-foreground">{apiData.task_type || job.category}</p>
//                         </div>
 
//                         <div className="flex-1 text-right">
//                           <p className="text-sm text-muted-foreground mb-1">Best Model</p>
//                           <p className="text-sm font-medium text-primary">{bestModel.model_name || apiData.best_model}</p>
//                         </div>
//                       </div>
//                     </div>
 
//                     {/* DYNAMIC METRICS TABLE */}
//                     {relevantMetrics.length > 0 ? (
//                       <div className="overflow-x-auto">
//                         <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
//                           <thead>
//                             <tr className="bg-muted/30">
//                               <th className="px-4 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider border-b border-border">
//                                 Result Type
//                               </th>
//                               {relevantMetrics.map((metric) => (
//                                 <th key={metric} className="px-4 py-3 text-center text-xs font-bold text-foreground uppercase tracking-wider border-b border-border">
//                                   {METRIC_LABELS[metric] || metric}
//                                 </th>
//                               ))}
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {/* Training Results Row */}
//                             <tr className="border-b border-border/50">
//                               <td className="px-4 py-4 font-semibold text-foreground">Training Results</td>
//                               {relevantMetrics.map((metric) => {
//                                 const value = getMetricValue(bestModel.train_metrics, metric);
//                                 const isAccuracyLike = ['accuracy', 'f1', 'precision', 'recall', 'roc_auc'].includes(metric);
                               
//                                 return (
//                                   <td key={metric} className="px-4 py-4 text-center">
//                                     {isAccuracyLike && value !== '—' ? (
//                                       <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
//                                         {value}
//                                       </span>
//                                     ) : (
//                                       <span className="text-foreground">{value}</span>
//                                     )}
//                                   </td>
//                                 );
//                               })}
//                             </tr>
                           
//                             {/* Testing Results Row */}
//                             <tr>
//                               <td className="px-4 py-4 font-semibold text-foreground">Testing Results</td>
//                               {relevantMetrics.map((metric) => {
//                                 const value = getMetricValue(bestModel.test_metrics, metric);
//                                 const isAccuracyLike = ['accuracy', 'f1', 'precision', 'recall', 'roc_auc'].includes(metric);
                               
//                                 return (
//                                   <td key={metric} className="px-4 py-4 text-center">
//                                     {isAccuracyLike && value !== '—' ? (
//                                       <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
//                                         {value}
//                                       </span>
//                                     ) : (
//                                       <span className="text-foreground">{value}</span>
//                                     )}
//                                   </td>
//                                 );
//                               })}
//                             </tr>
//                           </tbody>
//                         </table>
//                       </div>
//                     ) : (
//                       <div className="text-center py-8">
//                         <p className="text-muted-foreground">No metrics available for this task type</p>
//                       </div>
//                     )}
 
//                   </>
//                 ) : null}
//               </div>
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// };
 
// export default JobViewModal;

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BarChart3, Loader2 } from 'lucide-react';
import { Job } from '../types/jobs';
 
interface JobViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
}
 
interface ModelMetrics {
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1?: number;
  roc_auc?: number;
  rmse?: number;
  mae?: number;
  r2?: number;
  mape?: number;
  silhouette_score?: number;
  davies_bouldin?: number;
  calinski_harabasz?: number;
  anomaly_score?: number;
  avg_rmse?: number;      // ADD THESE 4 LINES
  avg_mae?: number;
  avg_r2?: number;
  avg_mape?: number;
}
 
interface ModelData {
  model_name: string;
  is_best: boolean;
  train_metrics: ModelMetrics;
  test_metrics: ModelMetrics;
}
 
interface ApiResponse {
  run_id: string;
  model_id: string;
  dataset_name: string;
  task_type: string;
  best_model: string;
  target: string;
  created_at: string;
  all_models: ModelData[];
}
 
// Define which metrics to show for each task type
const TASK_METRICS: Record<string, string[]> = {
  'Classification': ['accuracy', 'precision', 'recall', 'f1', 'roc_auc'],
  'Regression': ['rmse', 'mae', 'r2', 'mape'],
  'Forecasting': ['rmse', 'mae', 'r2', 'mape'],
  'Clustering': ['silhouette_score', 'davies_bouldin', 'calinski_harabasz'],
  'Anomaly Detection': ['anomaly_score', 'precision', 'recall', 'f1'],
  'Multistep_Forecasting': ['avg_rmse', 'avg_mae', 'avg_r2', 'avg_mape'],
};
 
// Metric display names
const METRIC_LABELS: Record<string, string> = {
  'accuracy': 'Accuracy',
  'f1': 'F1 Score',
  'precision': 'Precision',
  'recall': 'Recall',
  'roc_auc': 'ROC-AUC',
  'rmse': 'RMSE',
  'mae': 'MAE',
  'r2': 'R²',
  'mape': 'MAPE',
  'silhouette_score': 'Silhouette Score',
  'davies_bouldin': 'Davies-Bouldin',
  'calinski_harabasz': 'Calinski-Harabasz',
  'anomaly_score': 'Anomaly Score',
   'avg_rmse': 'Avg RMSE',      // ADD THESE 4 LINES
  'avg_mae': 'Avg MAE',
  'avg_r2': 'Avg R²',
  'avg_mape': 'Avg MAPE',
};
 
const JobViewModal = ({ isOpen, onClose, job }: JobViewModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiData, setApiData] = useState<ApiResponse | null>(null);
 
useEffect(() => {
  if (isOpen && job && job.status !== "failed") {
    fetchMetrics();
  }
}, [isOpen, job]);
 
  const fetchMetrics = async () => {
    if (!job) return;
 
    setLoading(true);
    setError(null);
 
    try {
      // Get email from localStorage
      const userDataString = localStorage.getItem('aivolve_user');
      if (!userDataString) {
        throw new Error('User not found');
      }
 
      const userData = JSON.parse(userDataString);
      const userEmail = userData.email;
 
      console.log('Fetching metrics for model:', job.id, 'user:', userEmail);
 
      const apiUrl = `https://api.veriton.ai/api/service3/model_detailed_metrics/${job.id}?user_email=${encodeURIComponent(userEmail)}`;
     
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'accept': 'application/json'
        }
      });
 
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
 
      const data: ApiResponse = await response.json();
      console.log('Metrics fetched:', data);
      setApiData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch metrics';
      setError(errorMessage);
      console.error('Error fetching metrics:', err);
    } finally {
      setLoading(false);
    }
  };
 
  // Get the best model from all_models array
  const bestModel = useMemo(() => {
    if (!apiData?.all_models) return null;
    return apiData.all_models.find(model => model.is_best) || null;
  }, [apiData]);
 
  // Get relevant metrics based on task type
  const relevantMetrics = useMemo(() => {
    if (!apiData?.task_type) return [];
    return TASK_METRICS[apiData.task_type] || [];
  }, [apiData?.task_type]);
 
  // Helper function to format metric values
  const formatMetricValue = (value: any): string => {
    if (value === undefined || value === null || value === '') return '—';
    if (typeof value === 'number') {
      return value.toFixed(4);
    }
    return String(value);
  };
 
  // Helper function to get metric value from metrics object
  const getMetricValue = (metrics: ModelMetrics | undefined, metricKey: string): string => {
    if (!metrics) return '—';
    const value = metrics[metricKey as keyof ModelMetrics];
    return formatMetricValue(value);
  };
 
  if (!job) return null;
      if (job.status === "failed") {
  const rawError = (job as any).error_message || "Unknown error";
 
  // 🔥 Clean error message
  const cleanError = rawError
    .replace("AutoML training failed (FUN1_URL error):", "")
    .replace(/FUN1 returned 500:/g, "")
    .replace(/\\\"/g, '"')
    .trim();
 
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[300]"
            onClick={onClose}
          />
 
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-[301] p-4"
          >
            <div className="relative w-[500px] bg-card rounded-2xl border border-border shadow-2xl p-6">
 
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-red-600">
                  Model Training Failed
                </h2>
                <button onClick={onClose}>
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
 
              {/* Dataset Info */}
              <p className="text-sm text-muted-foreground mb-2">
                Dataset: {job.datasetName}
              </p>
 
              {/* Error Box */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 whitespace-pre-wrap">
                {cleanError}
              </div>
 
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
 
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
  className="fixed inset-0 z-[300] flex items-center justify-center"
  onClick={onClose} // ✅ handles outside click
>
  {/* Backdrop */}
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
  />
 
  {/* Modal */}
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: 20 }}
    className="relative z-[301] p-4"
  >
    <div
      className="w-[55vw] max-w-[900px] h-[74vh] overflow-hidden bg-card rounded-2xl border border-border shadow-2xl flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-labelledby="job-view-modal-title"
      onClick={(e) => e.stopPropagation()} // ✅ prevents closing when clicking inside
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      tabIndex={-1}
      ref={(el) => el?.focus()}
    >
              {/* Sticky Header */}
              <div className="flex-shrink-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 id="job-view-modal-title" className="text-lg font-semibold text-foreground">Train vs Test Accuracy</h2>
                    <p className="text-sm text-muted-foreground">Detailed metrics, parameters & analysis</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-transparent transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-muted-foreground" />
                </button>
              </div>
 
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                {loading ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground">Loading metrics...</p>
                    </div>
                  </div>
                ) : error ? (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <p className="text-red-600 mb-2">{error}</p>
                      <button
                        onClick={fetchMetrics}
                        className="text-sm text-primary hover:underline"
                      >
                        Try Again
                      </button>
                    </div>
                  </div>
                ) : apiData && bestModel ? (
                  <>
                    {/* Job Info Summary */}
                    <div className="mb-6 p-4 bg-muted/20 rounded-xl border border-border/50">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-muted-foreground mb-1">Dataset</p>
                          <p className="text-sm font-medium text-foreground">{apiData.dataset_name || job.datasetName || 'Unknown Dataset'}</p>
                        </div>
 
                        <div className="flex-1 text-center">
                          <p className="text-sm text-muted-foreground mb-1">Task Type</p>
                          <p className="text-sm font-medium text-foreground">{apiData.task_type || job.category}</p>
                        </div>
 
                        <div className="flex-1 text-right">
                          <p className="text-sm text-muted-foreground mb-1">Best Model</p>
                          <p className="text-sm font-medium text-primary">{bestModel.model_name || apiData.best_model}</p>
                        </div>
                      </div>
                    </div>
 
                    {/* DYNAMIC METRICS TABLE */}
                    {relevantMetrics.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm border border-border rounded-lg overflow-hidden">
                          <thead>
                            <tr className="bg-muted/30">
                              <th className="px-4 py-3 text-left text-xs font-bold text-foreground uppercase tracking-wider border-b border-border">
                                Result Type
                              </th>
                              {relevantMetrics.map((metric) => (
                                <th key={metric} className="px-4 py-3 text-center text-xs font-bold text-foreground uppercase tracking-wider border-b border-border">
                                  {METRIC_LABELS[metric] || metric}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {/* Training Results Row */}
                            <tr className="border-b border-border/50">
                              <td className="px-4 py-4 font-semibold text-foreground">Training Results</td>
                              {relevantMetrics.map((metric) => {
                                const value = getMetricValue(bestModel.train_metrics, metric);
                                const isAccuracyLike = ['accuracy', 'f1', 'precision', 'recall', 'roc_auc'].includes(metric);
                               
                                return (
                                  <td key={metric} className="px-4 py-4 text-center">
                                    {isAccuracyLike && value !== '—' ? (
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                                        {value}
                                      </span>
                                    ) : (
                                      <span className="text-foreground">{value}</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                           
                            {/* Testing Results Row */}
                            <tr>
                              <td className="px-4 py-4 font-semibold text-foreground">Testing Results</td>
                              {relevantMetrics.map((metric) => {
                                const value = getMetricValue(bestModel.test_metrics, metric);
                                const isAccuracyLike = ['accuracy', 'f1', 'precision', 'recall', 'roc_auc'].includes(metric);
                               
                                return (
                                  <td key={metric} className="px-4 py-4 text-center">
                                    {isAccuracyLike && value !== '—' ? (
                                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                                        {value}
                                      </span>
                                    ) : (
                                      <span className="text-foreground">{value}</span>
                                    )}
                                  </td>
                                );
                              })}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No metrics available for this task type</p>
                      </div>
                    )}
 
                  </>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
 
export default JobViewModal;
 