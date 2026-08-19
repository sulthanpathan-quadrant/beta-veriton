// import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
// // import { Job } from '@/types/job';
// // import { useAuth } from '@/contexts/AuthContext';
// import { Job } from '../types/jobs';
// import { useAuth } from './AuthContext';
 
// interface JobsContextType {
//   jobs: Job[];
//   loading: boolean;
//   error: string | null;
//   totalCount: number;
//   currentPage: number;
//   fetchJobs: (page?: number, limit?: number) => Promise<void>;
//   addJob: (job: Job) => void;
//   updateJob: (id: string, updates: Partial<Job>) => void;
//   deleteJob: (id: string) => void;
//   runJob: (id: string) => Promise<void>;
//   setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
// }
 
// const JobsContext = createContext<JobsContextType | undefined>(undefined);
 
// // ✅ Map API model names to UI display names
// const apiModelToUI: Record<string, string> = {
//   'logistic_regression': 'Logistic Regression',
//   'random_forest': 'Random Forest',
//   'gradient_boosting': 'Gradient Boosting',
//   'xgboost': 'XGBoost',
//   'ridge': 'Ridge',
//   'arima': 'ARIMA',
//   'prophet': 'Prophet',
//   'lightgbm': 'LightGBM',
//   'catboost': 'CatBoost',
//   'kmeans': 'KMeans',
//   'kmeans++': 'KMeans++',
//   'dbscan': 'DBSCAN',
//   'gmm': 'GMM',
//   'isolation_forest': 'Isolation Forest',
//   'one_class_svm': 'One-Class SVM',
//   'lof': 'Local Outlier Factor (LOF)',
//   'elliptic_envelope': 'Elliptic Envelope'
// };
 
// export const JobsProvider = ({ children }: { children: ReactNode }) => {
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [totalCount, setTotalCount] = useState(0);
//   const [currentPage, setCurrentPage] = useState(1);
//   const { user } = useAuth();
 
//   // ✅ Wrap fetchJobs with useCallback to prevent infinite re-renders
// const fetchJobs = useCallback(async (page: number = 1, limit: number = 10) => {
//   setLoading(true);
//   setError(null);
 
//   try {
//     const userDataString = localStorage.getItem('aivolve_user');
//     if (!userDataString) {
//       throw new Error('User not found in localStorage');
//     }
 
//     const userData = JSON.parse(userDataString);
//     const userEmail = userData.email;
 
//     if (!userEmail) {
//       throw new Error('Email not found in user data');
//     }
 
//     console.log('Fetching jobs for email:', userEmail, 'Page:', page);
 
//     const start = (page - 1) * limit;
 
//     const apiUrl = `https://api.veriton.ai/api/service3/user_models_summary?user_email=${encodeURIComponent(userEmail)}&start=${start}&limit=${limit}`;
 
//     const response = await fetch(apiUrl, {
//       method: 'GET',
//       headers: { accept: 'application/json' },
//     });
 
//     if (!response.ok) {
//       throw new Error(`API request failed with status ${response.status}`);
//     }
 
//     const data = await response.json();
//     console.log('API Response:', data);
 
//     // ✅ NEW API STRUCTURE
//     const successModels = data.success_models || [];
//     const failedModels = data.failed_models || [];
 
//     // ✅ total count
//     setTotalCount(data.total_count || 0);
 
//     // =========================
//     // ✅ SUCCESS MODELS
//     // =========================
//     const successJobs: Job[] = successModels.map((model: any) => {
//       const apiModelName = model.best_model?.toLowerCase() || '';
//       const uiModelName =
//         apiModelToUI[apiModelName] || model.best_model || '';
 
//       return {
//         id: model.model_id,
//         name: model.run_id || 'Untitled Job',
//         category: model.task_type,
//         createdAt: new Date(),
//         lastRun: new Date(),
//         status: 'completed', // ✅ SUCCESS
//         feature: model.task_type,
//         model: uiModelName,
//         features: [],
//         target: model.target || '',
//         datasetName: model.dataset_name || 'Unknown Dataset',
//         trainAccuracy: model.train_accuracy
//           ? `${(model.train_accuracy * 100).toFixed(1)}%`
//           : undefined,
//         testAccuracy: model.test_accuracy
//           ? `${(model.test_accuracy * 100).toFixed(1)}%`
//           : undefined,
//         task_type: model.task_type,
//         veriton_file_path: model.veriton_file_path,
//       };
//     });
 
//     // =========================
//     // ❌ FAILED MODELS
//     // =========================
//     const failedJobs: Job[] = failedModels.map((model: any, index: number) => {
//       return {
//         id: model.model_id || `failed-${index}`, // fallback id
//         name: model.run_id || 'Failed Job',
//         category: model.task_type,
//         createdAt: new Date(),
//         lastRun: new Date(),
//         status: 'failed', // ❌ FAILED
//         feature: model.task_type,
//         model: '—',
//         features: [],
//         target: model.target || '',
//         datasetName: model.dataset_name || 'Unknown Dataset',
//         task_type: model.task_type,
//         veriton_file_path: model.veriton_file_path,
//         error_message: model.error_message,
//       };
//     });
 
//     // =========================
//     // ✅ MERGE BOTH
//     // =========================
//     const mappedJobs = [...successJobs, ...failedJobs];
 
//     console.log('Mapped Jobs:', mappedJobs);
 
//     setJobs(mappedJobs);
 
//   } catch (err) {
//     const errorMessage =
//       err instanceof Error ? err.message : 'Failed to fetch jobs';
 
//     setError(errorMessage);
//     console.error('Error fetching jobs:', err);
//     setJobs([]);
//     setTotalCount(0);
//   } finally {
//     setLoading(false);
//   }
// }, []); // ✅ Empty dependency array since it doesn't depend on any external values
 
//   // ✅ Fetch jobs when user changes (reset to page 1)
//   useEffect(() => {
//     if (user?.email) {
//       console.log('User changed, fetching jobs for:', user.email);
//       setCurrentPage(1); // Reset to page 1 when user changes
//       fetchJobs(1, 10);
//     } else {
//       setJobs([]);
//       setTotalCount(0);
//     }
//   }, [user?.email, fetchJobs]); // ✅ Now safe to include fetchJobs since it's memoized
 
//   // ✅ Fetch jobs when page changes
//   useEffect(() => {
//     if (user?.email && currentPage > 1) {
//       console.log('Page changed to:', currentPage);
//       fetchJobs(currentPage, 10);
//     }
//   }, [currentPage, user?.email, fetchJobs]); // ✅ Re-fetch when page changes
 
//   const addJob = (job: Job) => {
//     setJobs(prev => [job, ...prev]);
//     setTotalCount(prev => prev + 1);
//   };
 
//   const updateJob = (id: string, updates: Partial<Job>) => {
//     setJobs(prev => prev.map(job =>
//       job.id === id ? { ...job, ...updates } : job
//     ));
//   };
 
//   const deleteJob = (id: string) => {
//     setJobs(prev => prev.filter(job => job.id !== id));
//     setTotalCount(prev => Math.max(0, prev - 1));
//   };
 
//   const runJob = async (id: string) => {
//     updateJob(id, { status: 'running' });
   
//     await new Promise(resolve => setTimeout(resolve, 2000));
   
//     updateJob(id, {
//       status: 'completed',
//       lastRun: new Date(),
//       trainAccuracy: (92 + Math.random() * 6).toFixed(1) + '%',
//       testAccuracy: (88 + Math.random() * 8).toFixed(1) + '%'
//     });
//   };
 
//   return (
//     <JobsContext.Provider value={{
//       jobs,
//       loading,
//       error,
//       totalCount,
//       currentPage,
//       fetchJobs,
//       addJob,
//       updateJob,
//       deleteJob,
//       runJob,
//       setCurrentPage
//     }}>
//       {children}
//     </JobsContext.Provider>
//   );
// };
 
// export const useJobs = () => {
//   const context = useContext(JobsContext);
//   if (!context) {
//     throw new Error('useJobs must be used within a JobsProvider');
//   }
//   return context;
// };
 
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
// import { Job } from '@/types/job';
// import { useAuth } from '@/contexts/AuthContext';
import { Job } from "../types/jobs";
import { useAuth } from "./AuthContext";
 
interface JobsContextType {
  jobs: Job[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  fetchJobs: (page?: number, limit?: number) => Promise<void>;
  addJob: (job: Job) => void;
  updateJob: (id: string, updates: Partial<Job>) => void;
  deleteJob: (id: string) => void;
  runJob: (id: string) => Promise<void>;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
}
 
const JobsContext = createContext<JobsContextType | undefined>(undefined);
 
// ✅ Map API model names to UI display names
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
 
export const JobsProvider = ({ children }: { children: ReactNode }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { user } = useAuth();
 
  // ✅ Wrap fetchJobs with useCallback to prevent infinite re-renders
  const fetchJobs = useCallback(
    async (page: number = 1, limit: number = 10) => {
      setLoading(true);
      setError(null);
 
      try {
        const userDataString = localStorage.getItem("aivolve_user");
        if (!userDataString) {
          throw new Error("User not found in localStorage");
        }
 
        const userData = JSON.parse(userDataString);
        const userEmail = userData.email;
 
        if (!userEmail) {
          throw new Error("Email not found in user data");
        }
 
        console.log("Fetching jobs for email:", userEmail, "Page:", page);
 
        const start = (page - 1) * limit;
 
        const apiUrl = `https://api.veriton.ai/api/service3/user_models_summary?user_email=${encodeURIComponent(userEmail)}&start=${start}&limit=${limit}`;
 
        const response = await fetch(apiUrl, {
          method: "GET",
          headers: { accept: "application/json" },
        });
 
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
 
        const data = await response.json();
        console.log("API Response:", data);
 
        // ✅ NEW API STRUCTURE
        const successModels = data.success_models || [];
        const failedModels = data.failed_models || [];
 
        // ✅ total count
        setTotalCount(data.total_count || 0);
 
        // =========================
        // ✅ SUCCESS MODELS
        // =========================
        const successJobs: Job[] = successModels.map((model: any) => {
          const apiModelName = model.best_model?.toLowerCase() || "";
          const uiModelName =
            apiModelToUI[apiModelName] || model.best_model || "";
 
          return {
            id: model.model_id,
            name: model.run_id || "Untitled Job",
            category: model.task_type,
            createdAt: model.created_at ? new Date(model.created_at) : null,
            lastRun: model.last_run ? new Date(model.last_run) : null,
            status: "completed", // ✅ SUCCESS
            feature: model.task_type,
            model: uiModelName,
            features: [],
            target: model.target || "",
            datasetName: model.dataset_name || "Unknown Dataset",
            trainAccuracy: model.train_accuracy
              ? `${(model.train_accuracy * 100).toFixed(1)}%`
              : undefined,
            testAccuracy: model.test_accuracy
              ? `${(model.test_accuracy * 100).toFixed(1)}%`
              : undefined,
            task_type: model.task_type,
            veriton_file_path: model.veriton_file_path,
          };
        });
 
        // =========================
        // ❌ FAILED MODELS
        // =========================
        const failedJobs: Job[] = failedModels.map(
          (model: any, index: number) => {
            return {
              id: model.model_id || `failed-${index}`, // fallback id
              name: model.run_id || "Failed Job",
              category: model.task_type,
              createdAt: model.created_at ? new Date(model.created_at) : null,
              lastRun: model.last_run ? new Date(model.last_run) : null,
              status: "failed", // ❌ FAILED
              feature: model.task_type,
              model: "—",
              features: [],
              target: model.target || "",
              datasetName: model.dataset_name || "Unknown Dataset",
              task_type: model.task_type,
              veriton_file_path: model.veriton_file_path,
              error_message: model.error_message,
            };
          },
        );
 
        // =========================
        // ✅ MERGE BOTH
        // =========================
        const mappedJobs = [...successJobs, ...failedJobs];
 
        console.log("Mapped Jobs:", mappedJobs);
 
        setJobs(mappedJobs);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch jobs";
 
        setError(errorMessage);
        console.error("Error fetching jobs:", err);
        setJobs([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    },
    [],
  ); // ✅ Empty dependency array since it doesn't depend on any external values
 
  // ✅ Fetch jobs when user changes (reset to page 1)
  useEffect(() => {
    if (user?.email) {
      console.log("User changed, fetching jobs for:", user.email);
      setCurrentPage(1); // Reset to page 1 when user changes
      fetchJobs(1, 10);
    } else {
      setJobs([]);
      setTotalCount(0);
    }
  }, [user?.email, fetchJobs]); // ✅ Now safe to include fetchJobs since it's memoized
 
  // ✅ Fetch jobs when page changes
  useEffect(() => {
    if (user?.email && currentPage > 1) {
      console.log("Page changed to:", currentPage);
      fetchJobs(currentPage, 10);
    }
  }, [currentPage, user?.email, fetchJobs]); // ✅ Re-fetch when page changes
 
  const addJob = (job: Job) => {
    setJobs((prev) => [job, ...prev]);
    setTotalCount((prev) => prev + 1);
  };
 
  const updateJob = (id: string, updates: Partial<Job>) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === id ? { ...job, ...updates } : job)),
    );
  };
 
  const deleteJob = (id: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== id));
    setTotalCount((prev) => Math.max(0, prev - 1));
  };
 
  const runJob = async (id: string) => {
    updateJob(id, { status: "running" });
 
    await new Promise((resolve) => setTimeout(resolve, 2000));
 
    updateJob(id, {
      status: "completed",
      lastRun: new Date(),
      trainAccuracy: (92 + Math.random() * 6).toFixed(1) + "%",
      testAccuracy: (88 + Math.random() * 8).toFixed(1) + "%",
    });
  };
 
  return (
    <JobsContext.Provider
      value={{
        jobs,
        loading,
        error,
        totalCount,
        currentPage,
        fetchJobs,
        addJob,
        updateJob,
        deleteJob,
        runJob,
        setCurrentPage,
      }}
    >
      {children}
    </JobsContext.Provider>
  );
};
 
export const useJobs = () => {
  const context = useContext(JobsContext);
  if (!context) {
    throw new Error("useJobs must be used within a JobsProvider");
  }
  return context;
};
 
 