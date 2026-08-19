// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Badge } from "@/components/ui/badge";
// import { Card } from "@/components/ui/card";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
//   DialogClose,
// } from "@/components/ui/dialog";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   BarChart3,
//   Table as TableIcon,
//   Plus,
//   Search,
//   Calendar,
//   Play,
//   Eye,
//   Edit,
//   Database,
//   LogOut,
//   GitBranch,
//   Loader2,
//   X,
//   Settings,
//   Clock,
//   Sparkles,
// } from "lucide-react";
// import {
//   PieChart,
//   Pie,
//   Cell,
//   ResponsiveContainer,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
// } from "recharts";
// import { toast } from "sonner";
// import { ThemeToggle } from "@/components/ThemeToggle";

// interface ApiJob {
//   job_id: string;
//   job_name: string;
//   created_at: string;
// }

// interface DetailedJobResponse {
//   user_id: string;
//   job_id: string;
//   job_name: string;
//   created_at: string;
//   overall_job_status: string | null;
//   overall_last_job_run: string | null;
//   schedule: {
//     frequency?: string;
//     time_utc?: string;
//     scheduled_at?: string;
//   } | null;
//   datasource_paths: string[];
//   dq_enabled: boolean;
//   ner_enabled: boolean;
//   business_logic_enabled: boolean;
//   business_logic_rules?: Record<string, string>;
// }

// interface Job {
//   id: string;
//   name: string;
//   category: string;
//   createdAt: string;
//   lastRun: string;
//   status: "Completed" | "PENDING" | "Created" | "Running" | "Failed";
//   steps: {
//     dqRules: "skipped" | "executed";
//     ner: "skipped" | "executed";
//     businessLogic: "skipped" | "executed";
//     dataTransformations: "skipped" | "executed";
//   };
// }

// const API_BASE = "https://api.veriton.ai/api/service2";

// // ── NEW: Databricks endpoints ────────────────────────────────────────────
// const DATABRICKS_API_BASE = "https://api.veriton.ai/api/service-databricks";

// const databricksListJobsUrl = (userId: string) =>
//   `${DATABRICKS_API_BASE}/list-jobs?user_id=${userId}`;

// const databricksViewJobUrl = (userId: string, jobId: string) =>
//   `${DATABRICKS_API_BASE}/view-job?user_id=${userId}&job_id=${jobId}`;

// const DATABRICKS_RUN_JOB_URL = `${DATABRICKS_API_BASE}/run-job`;

// /**
//  * Reads the "user" object from localStorage and returns true if the user's
//  * dataplatform is "Databricks". Same check used across the other workflow
//  * pages (Data Quality / NER / Business Logic).
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

// // ── NEW: Databricks "list jobs" response shape — note this only returns
// // jobs that have been scheduled at least once, unlike service1/get-all-jobs.
// interface DatabricksJobItem {
//   job_id: string;
//   job_name: string;
//   created_at: string;
//   last_run: string | null;
//   status: string;
// }

// interface DatabricksListJobsResponse {
//   user_id: string;
//   jobs: DatabricksJobItem[];
// }

// // ── NEW: Databricks "view job" response shape — quite different from the
// // default DetailedJobResponse, so it's mapped onto that shape below so the
// // job-details modal doesn't need any UI changes.
// interface DatabricksDataSource {
//   sourceType?: string;
//   bucket?: string;
//   paths?: string[];
//   connection?: Record<string, any>;
// }

// interface DatabricksViewJobResponse {
//   user_id: string;
//   job_id: string;
//   data_sources: DatabricksDataSource[];
//   dq: boolean;
//   ner: boolean;
//   business_logic: boolean;
//   schedule: {
//     jobName?: string;
//     frequency?: string;
//     time?: string;
//     updatedAt?: string;
//   } | null;
//   job_status: string | null;
//   created_at: string;
//   last_run_time: string | null;
// }

// // ── NEW: Databricks "run job" response shape ─────────────────────────────
// interface DatabricksRunJobResponse {
//   user_id: string;
//   job_id: string;
//   job_status: string;
//   last_run_time: string | null;
// }

// // Maps a Databricks status string (e.g. "NOT STARTED", "COMPLETED") onto
// // the Job["status"] union already used throughout this page.
// const mapDatabricksJobStatus = (
//   status: string | null | undefined,
// ): Job["status"] => {
//   switch ((status || "").toUpperCase()) {
//     case "COMPLETED":
//       return "Completed";
//     case "RUNNING":
//       return "Running";
//     case "FAILED":
//       return "Failed";
//     case "PENDING":
//       return "PENDING";
//     case "NOT STARTED":
//     default:
//       return "Created";
//   }
// };

// // Flattens Databricks data_sources[].paths into the flat string[] shape
// // datasource_paths already uses, prefixed as `s3://bucket/path` so the
// // existing getS3Path() helper (which looks for an "s3://" prefix) keeps
// // working without changes.
// const flattenDatabricksDatasourcePaths = (
//   dataSources: DatabricksDataSource[] = [],
// ): string[] => {
//   const paths: string[] = [];
//   dataSources.forEach((ds) => {
//     const prefix = ds.sourceType ? `${ds.sourceType}://` : "";
//     const bucket = ds.bucket || "";
//     (ds.paths || []).forEach((p) => {
//       paths.push(bucket ? `${prefix}${bucket}/${p}` : `${prefix}${p}`);
//     });
//   });
//   return paths;
// };

// // Maps a Databricks view-job response onto the existing DetailedJobResponse
// // shape so the job-details modal renders unchanged. `fallbackName` covers
// // the case where the response has no schedule (and therefore no jobName).
// const mapDatabricksJobDetails = (
//   data: DatabricksViewJobResponse,
//   fallbackName: string,
// ): DetailedJobResponse => ({
//   user_id: data.user_id,
//   job_id: data.job_id,
//   job_name: data.schedule?.jobName || fallbackName,
//   created_at: data.created_at,
//   overall_job_status: data.job_status,
//   overall_last_job_run: data.last_run_time,
//   schedule: data.schedule
//     ? {
//         frequency: data.schedule.frequency,
//         time_utc: data.schedule.time,
//         scheduled_at: data.schedule.updatedAt,
//       }
//     : null,
//   datasource_paths: flattenDatabricksDatasourcePaths(data.data_sources),
//   dq_enabled: !!data.dq,
//   ner_enabled: !!data.ner,
//   business_logic_enabled: !!data.business_logic,
// });

// const Jobs = () => {
//   const navigate = useNavigate();
//   const [viewMode, setViewMode] = useState<"chart" | "table">("table");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [categoryFilter, setCategoryFilter] = useState("all");
//   const [statusFilter, setStatusFilter] = useState("All");
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");
//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [selectedJob, setSelectedJob] = useState<DetailedJobResponse | null>(
//     null,
//   );
//   const [showJobModal, setShowJobModal] = useState(false);
//   const [modalLoading, setModalLoading] = useState(false);
//   const [autoMLLoading, setAutoMLLoading] = useState(false);

//   const storedUser = localStorage.getItem("user");
//   const user = storedUser ? JSON.parse(storedUser) : null;
//   const userName = user?.name || user?.email?.split("@")[0] || "User";
//   const userId = user?.id || user?.user_id;

//   // Data platform selection (Fabric / Snowflake / Databricks)
//   const [dataPlatform, setDataPlatform] = useState<string>(
//     user?.dataplatform || "",
//   );

//   // Reusable X close button for all toasts (Sonner style)
//   const closeToastButton = (
//     <button
//       onClick={() => toast.dismiss()}
//       className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
//       aria-label="Close toast"
//     >
//       <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
//     </button>
//   );


//   // Load persisted job statuses from localStorage on mount
//   useEffect(() => {
//     const persistedStatuses = localStorage.getItem("jobStatuses");
//     if (persistedStatuses) {
//       try {
//         const parsed = JSON.parse(persistedStatuses);
//         setJobs((prevJobs) =>
//           prevJobs.map((job) => {
//             const persisted = parsed[job.id];
//             if (persisted) {
//               return {
//                 ...job,
//                 status: persisted.status,
//                 lastRun: persisted.lastRun || job.lastRun,
//               };
//             }
//             return job;
//           }),
//         );
//       } catch (e) {
//         console.error("Failed to parse persisted job statuses", e);
//       }
//     }
//   }, []);

//   const handleLogout = () => {
//     localStorage.clear();
//     // localStorage.removeItem("user");
//     // localStorage.removeItem("token");
//     // localStorage.removeItem("jobStatuses");
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

//   useEffect(() => {
//     const fetchJobs = async () => {
//       if (!userId) {
//         toast.error("User ID not found in localStorage", {
//           action: closeToastButton,
//         });
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);

//         // ── Existing default (non-Databricks) jobs fetch — unchanged ────
//         const fetchJobsDefault = async (): Promise<Job[]> => {
//           const response = await fetch(
//             `https://api.veriton.ai/api/service1/get-all-jobs?user_id=${userId}`,
//           );
//           if (!response.ok) {
//             throw new Error(`Failed to fetch jobs: ${response.status}`);
//           }

//           const data = await response.json();

//           return data.jobs.map((item: ApiJob) => ({
//             id: item.job_id,
//             name: item.job_name || "Unnamed Job",
//             category: "Unknown",
//             createdAt: new Date(item.created_at).toLocaleString("en-US", {
//               month: "short",
//               day: "numeric",
//               year: "numeric",
//               hour: "numeric",
//               minute: "2-digit",
//               hour12: true,
//             }),
//             lastRun: "—",
//             status: "Created" as const,
//             steps: {
//               dqRules: "skipped",
//               ner: "skipped",
//               businessLogic: "skipped",
//               dataTransformations: "skipped",
//             },
//           }));
//         };

//         // ── NEW: Databricks jobs fetch via /list-jobs ────────────────────
//         // Note: this endpoint only returns jobs that have been scheduled at
//         // least once (via /schedule-job), unlike service1/get-all-jobs.
//         const fetchJobsDatabricks = async (): Promise<Job[]> => {
//           const response = await fetch(databricksListJobsUrl(userId));
//           if (!response.ok) {
//             throw new Error(`Failed to fetch jobs: ${response.status}`);
//           }

//           const data: DatabricksListJobsResponse = await response.json();

//           return (data.jobs || []).map((item) => ({
//             id: item.job_id,
//             name: item.job_name || "Unnamed Job",
//             category: "Unknown",
//             createdAt: new Date(item.created_at).toLocaleString("en-US", {
//               month: "short",
//               day: "numeric",
//               year: "numeric",
//               hour: "numeric",
//               minute: "2-digit",
//               hour12: true,
//             }),
//             lastRun: item.last_run
//               ? new Date(item.last_run).toLocaleString("en-US", {
//                   month: "short",
//                   day: "numeric",
//                   year: "numeric",
//                   hour: "numeric",
//                   minute: "2-digit",
//                   hour12: true,
//                 })
//               : "—",
//             status: mapDatabricksJobStatus(item.status),
//             steps: {
//               dqRules: "skipped",
//               ner: "skipped",
//               businessLogic: "skipped",
//               dataTransformations: "skipped",
//             },
//           }));
//         };

//         let mappedJobs: Job[] = isDatabricksUser()
//           ? await fetchJobsDatabricks()
//           : await fetchJobsDefault();

//         // Merge persisted statuses
//         const persistedStatusesStr = localStorage.getItem("jobStatuses");
//         if (persistedStatusesStr) {
//           try {
//             const persisted = JSON.parse(persistedStatusesStr);
//             mappedJobs = mappedJobs.map((job) => {
//               const persistedJob = persisted[job.id];
//               if (persistedJob) {
//                 return {
//                   ...job,
//                   status: persistedJob.status,
//                   lastRun: persistedJob.lastRun || job.lastRun,
//                 };
//               }
//               return job;
//             });
//           } catch (e) {
//             console.error("Failed to parse persisted statuses", e);
//           }
//         }

//         setJobs(mappedJobs);
//       } catch (error) {
//         console.error("Error fetching jobs:", error);
//         toast.error("Failed to load jobs", {
//           action: closeToastButton,
//         });
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchJobs();
//   }, [userId]);

//   useEffect(() => {
//     if (jobs.length > 0) {
//       const statusMap: Record<string, { status: string; lastRun: string }> = {};
//       jobs.forEach((job) => {
//         statusMap[job.id] = {
//           status: job.status,
//           lastRun: job.lastRun,
//         };
//       });
//       localStorage.setItem("jobStatuses", JSON.stringify(statusMap));
//     }
//   }, [jobs]);

//   const filteredJobs = jobs.filter((job) => {
//     const matchesSearch = job.name
//       .toLowerCase()
//       .includes(searchQuery.toLowerCase());
//     const matchesCategory =
//       categoryFilter === "all" || job.category === categoryFilter;
//     const matchesStatus = statusFilter === "All" || job.status === statusFilter;
//     const jobDate = new Date(job.createdAt);
//     const afterStart = !startDate || jobDate >= new Date(startDate);
//     const beforeEnd = !endDate || jobDate <= new Date(endDate);
//     return (
//       matchesSearch &&
//       matchesCategory &&
//       matchesStatus &&
//       afterStart &&
//       beforeEnd
//     );
//   });

//   const jobsByCategory = [
//     {
//       name: "Unknown",
//       value: jobs.filter((j) => j.category === "Unknown").length,
//       color: "#3b82f6",
//     },
//     {
//       name: "Glue",
//       value: jobs.filter((j) => j.category === "Glue").length,
//       color: "#10b981",
//     },
//   ];

//   const jobsByStatus = [
//     {
//       name: "PENDING",
//       value: jobs.filter((j) => j.status === "PENDING").length,
//       color: "#f97316",
//     },
//     {
//       name: "Completed",
//       value: jobs.filter((j) => j.status === "Completed").length,
//       color: "#10b981",
//     },
//     {
//       name: "Created",
//       value: jobs.filter((j) => j.status === "Created").length,
//       color: "#6b7280",
//     },
//   ];

//   const hourlyData = Array.from({ length: 8 }, (_, i) => ({
//     time: `${String(i * 3).padStart(2, "0")}:00`,
//     jobs: 0,
//   }));

//   const runJob = async (jobId: string) => {
//     if (isDatabricksUser()) {
//       // ── NEW: Databricks users actually invoke /run-job. (The default
//       // flow below has never called a real "run" endpoint — it's a
//       // client-side simulated status flip — so this branch is the first
//       // real backend integration for the Run button.)
//       if (!userId) {
//         toast.error("User ID not found. Please login again.", {
//           action: closeToastButton,
//         });
//         return;
//       }

//       setJobs((prevJobs) =>
//         prevJobs.map((job) =>
//           job.id === jobId
//             ? {
//                 ...job,
//                 status: "Running" as const,
//                 lastRun: new Date().toLocaleString(),
//               }
//             : job,
//         ),
//       );
//       toast.success("Job started successfully", {
//         action: closeToastButton,
//       });

//       try {
//         const response = await fetch(DATABRICKS_RUN_JOB_URL, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             accept: "application/json",
//           },
//           body: JSON.stringify({ user_id: userId, job_id: jobId }),
//         });

//         if (!response.ok) {
//           const errorText = await response.text();
//           throw new Error(`Run job failed: ${response.status} - ${errorText}`);
//         }

//         const result: DatabricksRunJobResponse = await response.json();

//         setJobs((prevJobs) =>
//           prevJobs.map((job) =>
//             job.id === jobId
//               ? {
//                   ...job,
//                   status: mapDatabricksJobStatus(result.job_status),
//                   lastRun: result.last_run_time
//                     ? new Date(result.last_run_time).toLocaleString()
//                     : new Date().toLocaleString(),
//                 }
//               : job,
//           ),
//         );

//         toast.success("Job completed successfully", {
//           action: closeToastButton,
//         });
//       } catch (error) {
//         console.error("Error running Databricks job:", error);
//         setJobs((prevJobs) =>
//           prevJobs.map((job) =>
//             job.id === jobId ? { ...job, status: "Failed" as const } : job,
//           ),
//         );
//         toast.error("Failed to run job", {
//           action: closeToastButton,
//         });
//       }

//       return;
//     }

//     // ── Existing default (non-Databricks) flow — simulated, unchanged ────
//     setJobs((prevJobs) =>
//       prevJobs.map((job) =>
//         job.id === jobId
//           ? {
//               ...job,
//               status: "Running" as const,
//               lastRun: new Date().toLocaleString(),
//             }
//           : job,
//       ),
//     );
//     toast.success("Job started successfully", {
//       action: closeToastButton,
//     });

//     setTimeout(() => {
//       setJobs((prevJobs) =>
//         prevJobs.map((job) =>
//           job.id === jobId
//             ? {
//                 ...job,
//                 status: "Completed" as const,
//                 lastRun: new Date().toLocaleString(),
//               }
//             : job,
//         ),
//       );
//       toast.success("Job completed successfully", {
//         action: closeToastButton,
//       });
//     }, 3000);
//   };

//   const getStatusBadge = (status: string) => {
//     const styles: Record<string, string> = {
//       Completed: "bg-green-500/20 text-green-600 border-green-500/30",
//       PENDING: "bg-orange-500/20 text-orange-600 border-orange-500/30",
//       Created: "bg-gray-500/20 text-gray-600 border-gray-500/30",
//       Running: "bg-blue-500/20 text-blue-600 border-blue-500/30",
//       Failed: "bg-red-500/20 text-red-600 border-red-500/30",
//     };
//     return <Badge className={styles[status] || styles.Created}>{status}</Badge>;
//   };

//   const getStepBadge = (status: "skipped" | "executed") => {
//     if (status === "executed") {
//       return (
//         <Badge className="bg-primary/20 text-primary border-primary/30">
//           executed
//         </Badge>
//       );
//     }
//     return <Badge variant="secondary">skipped</Badge>;
//   };

//   const openJobDetails = async (job: Job) => {
//     if (!userId) {
//       toast.error("User ID not found. Please login again.", {
//         action: closeToastButton,
//       });
//       return;
//     }

//     setModalLoading(true);
//     setShowJobModal(true);
//     setSelectedJob(null);

//     try {
//       let data: DetailedJobResponse;

//       if (isDatabricksUser()) {
//         // ── NEW: Databricks users call /view-job, whose response shape is
//         // mapped onto DetailedJobResponse so the modal below is unchanged.
//         const response = await fetch(databricksViewJobUrl(userId, job.id));

//         if (!response.ok) {
//           throw new Error(`Failed to fetch job details: ${response.status}`);
//         }

//         const raw: DatabricksViewJobResponse = await response.json();
//         data = mapDatabricksJobDetails(raw, job.name);
//       } else {
//         // ── Existing default (non-Databricks) flow — unchanged ──────────
//         const response = await fetch(
//           `${API_BASE}/view-job?user_id=${userId}&job_id=${job.id}`,
//         );

//         if (!response.ok) {
//           throw new Error(`Failed to fetch job details: ${response.status}`);
//         }

//         data = await response.json();
//       }

//       setSelectedJob(data);
//     } catch (error) {
//       console.error("Error fetching job details:", error);
//       toast.error("Failed to load job details", {
//         action: closeToastButton,
//       });
//       setSelectedJob(null);
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   const getS3Path = (paths: any[] = []) => {
//     return (
//       paths.find(
//         (path) => typeof path === "string" && path.startsWith("s3://"),
//       ) || "N/A"
//     );
//   };

//   const formatSchedule = (schedule: DetailedJobResponse["schedule"]) => {
//     if (!schedule) return "N/A";
//     const parts = [];
//     if (schedule.frequency) parts.push(`Frequency: ${schedule.frequency}`);
//     if (schedule.time_utc) parts.push(`Time (UTC): ${schedule.time_utc}`);
//     if (schedule.scheduled_at) {
//       const date = new Date(schedule.scheduled_at);
//       parts.push(
//         `Scheduled: ${date.toLocaleString("en-US", {
//           month: "short",
//           day: "numeric",
//           year: "numeric",
//           hour: "numeric",
//           minute: "2-digit",
//           hour12: true,
//         })}`,
//       );
//     }
//     return parts.join(" • ") || "N/A";
//   };

//   return (
//     <div className=" h-screen flex flex-col overflow-hidden">
//       {/* Header */}
//       <header className="border-b border-border backdrop-blur sticky">
//         <div className="container mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             {/* <div className="flex items-center gap-3">
//               <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//                 <Database className="w-5 h-5 text-primary" />
//               </div>
//               <div>
//                 <h1 className="font-bold text-lg">Veritas</h1>
//                 <p className="text-sm text-muted-foreground">
//                   Welcome, <span className="text-primary">{userName}</span>
//                 </p>
//               </div> */}

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
//                 className="flex items-center gap-2 text-primary font-medium border-b-2 border-primary pb-1"
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
//                 onClick={() => {
//                   // Optional: double-check (but usually not needed)
//                   if (!localStorage.getItem("aivolve_user")) {
//                     toast.info("Preparing Auto AI/ML...", { duration: 2000 });
//                   }
//                   navigate("/workflow/automl/jobs1");
//                   // or window.location.href = "/workflow/automl" if you still prefer hard redirect
//                 }}
//                 className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
//               >
//                 <Sparkles className="w-4 h-4" />
//                 Auto AI/ML
//               </button>
//               <Select
//                 value={dataPlatform}
//                 onValueChange={handleDataPlatformChange}
//               >
//                 <SelectTrigger className="w-auto min-w-[150px] h-8 border-none bg-transparent text-muted-foreground hover:text-foreground focus:ring-0 gap-2 px-2 shadow-none">
//                   <SelectValue placeholder="Data platform" />
//                 </SelectTrigger>
//                 <SelectContent>
//                   {/* <SelectItem value="Fabric">DataPlatform</SelectItem> */}
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

//       <main className="container mx-auto px-6 py-8 flex-1 overflow-y-auto">
//         {viewMode === "chart" ? (
//           <>
//             <div className="flex items-center justify-between mb-8">
//               <div>
//                 <h2 className="text-2xl font-bold">Your Jobs at a Glance</h2>
//                 <p className="text-muted-foreground">
//                   Track jobs by status, category, and time with ease.
//                 </p>
//               </div>
//               <Button variant="outline" onClick={() => setViewMode("table")}>
//                 <TableIcon className="w-4 h-4 mr-2" />
//                 Table View
//               </Button>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
//               <Card className="p-6">
//                 <h3 className="font-semibold mb-4">Jobs by Category</h3>
//                 <div className="h-64">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={jobsByCategory}
//                         cx="50%"
//                         cy="50%"
//                         innerRadius={60}
//                         outerRadius={80}
//                         paddingAngle={5}
//                         dataKey="value"
//                       >
//                         {jobsByCategory.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={entry.color} />
//                         ))}
//                       </Pie>
//                       <Tooltip />
//                       <Legend />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//               </Card>

//               <Card className="p-6">
//                 <h3 className="font-semibold mb-4">Job Status Distribution</h3>
//                 <div className="h-64">
//                   <ResponsiveContainer width="100%" height="100%">
//                     <PieChart>
//                       <Pie
//                         data={jobsByStatus}
//                         cx="50%"
//                         cy="50%"
//                         innerRadius={60}
//                         outerRadius={80}
//                         paddingAngle={5}
//                         dataKey="value"
//                       >
//                         {jobsByStatus.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={entry.color} />
//                         ))}
//                       </Pie>
//                       <Tooltip />
//                       <Legend />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//               </Card>
//             </div>

//             <Card className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="font-semibold">
//                   Glue Jobs Created by Hour (Total Glue Jobs:{" "}
//                   {jobs.filter((j) => j.category === "Glue").length})
//                 </h3>
//                 <Select defaultValue="daily">
//                   <SelectTrigger className="w-40">
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="daily">Daily (by Hour)</SelectItem>
//                     <SelectItem value="weekly">Weekly</SelectItem>
//                     <SelectItem value="monthly">Monthly</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <LineChart data={hourlyData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="time" />
//                     <YAxis />
//                     <Tooltip />
//                     <Legend />
//                     <Line
//                       type="monotone"
//                       dataKey="jobs"
//                       name="Glue Jobs"
//                       stroke="#3b82f6"
//                       strokeWidth={2}
//                     />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             </Card>
//           </>
//         ) : (
//           <>
//             <div className="flex items-center justify-between mb-8">
//               <div>
//                 <h2 className="text-2xl font-bold">
//                   All Jobs ({filteredJobs.length})
//                 </h2>
//                 <p className="text-muted-foreground">
//                   View and manage your jobs
//                 </p>
//               </div>
//               <div className="flex items-center gap-3">
//                 {/* <Button variant="outline" onClick={() => setViewMode("chart")}>
//                   <BarChart3 className="w-4 h-4 mr-2" />
//                   Chart View
//                 </Button> */}
//                 {/* <Button onClick={() => navigate("/workflow/data-ingestion")}>
//                   <Plus className="w-4 h-4 mr-2" />
//                   Create Job
//                 </Button> */}
//                 <Button
//                   onClick={() => {
//                     // Modern browsers support crypto.randomUUID()
//                     const newJobId = crypto.randomUUID().replace(/-/g, "");

//                     localStorage.setItem("current_job_id", newJobId);

//                     navigate("/workflow/data-ingestion");
//                   }}
//                 >
//                   <Plus className="w-4 h-4 mr-2" />
//                   Create Job
//                 </Button>
//               </div>
//             </div>

//             <div className="p-4 mb-6">
//               <div className="flex flex-wrap items-center gap-4">
//                 <div className="relative flex-1 min-w-[200px]">
//                   <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//                   <Input
//                     placeholder="Search jobs..."
//                     value={searchQuery}
//                     onChange={(e) => setSearchQuery(e.target.value)}
//                     className="pl-10"
//                   />
//                 </div>

//                 <div className="flex flex-col sm:flex-row gap-4">
//                   <div className="relative w-40">
//                     <Input
//                       type="date"
//                       value={startDate}
//                       onChange={(e) => setStartDate(e.target.value)}
//                       className="w-full text-center peer"
//                       placeholder=" "
//                     />
//                     <label
//                       className="
//             absolute left-2 -top-2.5 px-1 text-xs font-medium text-muted-foreground
//             bg-background transition-all peer-placeholder-shown:top-1/2
//             peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground/70
//             peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-foreground
//           "
//                     >
//                       Start Date
//                     </label>
//                   </div>

//                   <div className="relative w-40">
//                     <Input
//                       type="date"
//                       value={endDate}
//                       onChange={(e) => setEndDate(e.target.value)}
//                       className="w-full text-center peer"
//                       placeholder=" "
//                     />
//                     <label
//                       className="
//             absolute left-2 -top-2.5 px-1 text-xs font-medium text-muted-foreground
//             bg-background transition-all peer-placeholder-shown:top-1/2
//             peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground/70
//             peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-foreground
//           "
//                     >
//                       End Date
//                     </label>
//                   </div>

//                   {/* Status dropdown with floating label */}
//                   <div className="relative w-40">
//                     <Select
//                       value={statusFilter}
//                       onValueChange={setStatusFilter}
//                     >
//                       <SelectTrigger
//                         className="
//               w-full text-center peer
//               [&>span]:text-muted-foreground/70
//               peer-placeholder-shown:text-muted-foreground/70
//               focus-within:text-foreground
//             "
//                       >
//                         <SelectValue placeholder=" " />
//                       </SelectTrigger>
//                       <label
//                         className="
//               absolute left-2 -top-2.5 px-1 text-xs font-medium text-muted-foreground
//               bg-background transition-all peer-placeholder-shown:top-1/2
//               peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground/70
//               peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-foreground
//             "
//                       >
//                         Status
//                       </label>
//                       <SelectContent>
//                         <SelectItem className="hover:bg-primary/30" value="All">
//                           All Statuses
//                         </SelectItem>
//                         <SelectItem
//                           className="hover:bg-primary/30"
//                           value="Created"
//                         >
//                           Created
//                         </SelectItem>
//                         <SelectItem
//                           className="hover:bg-primary/30"
//                           value="Running"
//                         >
//                           Running
//                         </SelectItem>
//                         <SelectItem
//                           className="hover:bg-primary/30"
//                           value="Completed"
//                         >
//                           Completed
//                         </SelectItem>
//                         <SelectItem
//                           className="hover:bg-primary/30"
//                           value="Failed"
//                         >
//                           Failed
//                         </SelectItem>
//                         <SelectItem
//                           className="hover:bg-primary/30"
//                           value="PENDING"
//                         >
//                           Pending
//                         </SelectItem>
//                       </SelectContent>
//                     </Select>
//                   </div>
//                 </div>

//                 <Button
//                   variant="ghost"
//                   onClick={() => {
//                     setSearchQuery("");
//                     setCategoryFilter("all");
//                     setStatusFilter("All");
//                     setStartDate("");
//                     setEndDate("");
//                   }}
//                   className="border border-border"
//                 >
//                   Clear
//                 </Button>
//               </div>
//             </div>

//             <Card className="min-h-[300px] flex flex-col">
//               {loading ? (
//                 <div className="flex-1 flex items-center justify-center py-12">
//                   <div className="flex flex-col items-center gap-3">
//                     <Loader2 className="h-10 w-10 animate-spin text-primary" />
//                     <p className="text-muted-foreground">
//                       Loading your jobs...
//                     </p>
//                   </div>
//                 </div>
//               ) : filteredJobs.length === 0 ? (
//                 <div className="flex-1 py-12 text-center text-muted-foreground">
//                   No jobs found matching your filters
//                 </div>
//               ) : (
//                 <div className="overflow-x-auto flex-1">
//                   <table className="w-full">
//                     <thead>
//                       <tr className="border-b border-border">
//                         <th className="text-left p-4 font-medium text-muted-foreground">
//                           Job Name
//                         </th>
//                         <th className="text-left p-4 font-medium text-muted-foreground">
//                           Created At
//                         </th>
//                         <th className="text-left p-4 font-medium text-muted-foreground">
//                           Last Run
//                         </th>
//                         <th className="text-left p-4 font-medium text-muted-foreground">
//                           Status
//                         </th>
//                         <th className="text-center p-4 font-medium text-muted-foreground">
//                           Actions
//                         </th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {filteredJobs.map((job) => (
//                         <tr
//                           key={job.id}
//                           className="border-b border-border last:border-0 hover:bg-muted/30"
//                         >
//                           <td className="p-4 font-medium">{job.name}</td>
//                           <td className="p-4 text-muted-foreground">
//                             {job.createdAt}
//                           </td>
//                           <td className="p-4 text-muted-foreground">
//                             {job.lastRun}
//                           </td>
//                           <td className="p-4">{getStatusBadge(job.status)}</td>
//                           <td className="p-4">
//                             <div className="flex items-center justify-center gap-2">
//                               <Button
//                                 size="icon"
//                                 className="bg-primary hover:bg-primary/90 h-8 w-8"
//                                 onClick={() => runJob(job.id)}
//                                 disabled={
//                                   job.status === "Running" ||
//                                   job.status === "Completed"
//                                 }
//                               >
//                                 <Play className="w-4 h-4" />
//                               </Button>
//                               <Button
//                                 size="icon"
//                                 variant="ghost"
//                                 className="h-8 w-8"
//                                 onClick={() => openJobDetails(job)}
//                               >
//                                 <Eye className="w-4 h-4" />
//                               </Button>
//                               <Button
//                                 size="icon"
//                                 variant="ghost"
//                                 className="h-8 w-8"
//                                 onClick={() =>
//                                   navigate(`/edit-job/${job.id}`, {
//                                     state: {
//                                       business_logic_rules:
//                                         selectedJob?.business_logic_rules || {},
//                                     },
//                                   })
//                                 }
//                               >
//                                 <Edit className="w-4 h-4" />
//                               </Button>
//                             </div>
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               )}
//             </Card>
//           </>
//         )}
//       </main>

//       {/* Job Details Modal */}
//       <Dialog open={showJobModal} onOpenChange={setShowJobModal}>
//         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
//           <DialogHeader className="flex flex-row items-center justify-between pb-4 ">
//             <DialogTitle className="text-2xl font-bold">
//               Job Details - {selectedJob?.job_name || "Loading..."}
//             </DialogTitle>
//             <DialogClose asChild>
//               <Button variant="ghost" size="icon">
//                 <X className="h-5 w-5" />
//               </Button>
//             </DialogClose>
//           </DialogHeader>

//           {modalLoading ? (
//             <div className="flex flex-col items-center justify-center py-12">
//               <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
//               <p className="text-muted-foreground">Loading job details...</p>
//             </div>
//           ) : selectedJob ? (
//             <>
//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 <Card className="p-4 flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//                     <Settings className="w-5 h-5 text-primary" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Job Name</p>
//                     <p className="font-medium">
//                       {selectedJob.job_name || "N/A"}
//                     </p>
//                   </div>
//                 </Card>
//                 <Card className="p-4 flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//                     <Database className="w-5 h-5 text-primary" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Data Source</p>
//                     <p className="font-medium">
//                       {getS3Path(selectedJob.datasource_paths)}
//                     </p>
//                   </div>
//                 </Card>
//               </div>

//               <Card className="p-6 mb-6">
//                 <div className="grid grid-cols-2 gap-8">
//                   <div>
//                     <h4 className="font-semibold mb-4">Job Information</h4>
//                     <div className="space-y-3">
//                       <div>
//                         <p className="text-sm text-muted-foreground">
//                           Job Name:
//                         </p>
//                         <p className="font-medium">
//                           {selectedJob.job_name || "N/A"}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-muted-foreground">
//                           Created At:
//                         </p>
//                         <p className="font-medium">
//                           {new Date(selectedJob.created_at).toLocaleString(
//                             "en-US",
//                             {
//                               month: "short",
//                               day: "numeric",
//                               year: "numeric",
//                               hour: "numeric",
//                               minute: "2-digit",
//                               hour12: true,
//                             },
//                           )}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-muted-foreground">
//                           Data Source:
//                         </p>
//                         <p className="font-medium">
//                           {getS3Path(selectedJob.datasource_paths)}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold mb-4">Execution Details</h4>
//                     <div className="space-y-3">
//                       <div>
//                         <p className="text-sm text-muted-foreground">
//                           Overall Status:
//                         </p>
//                         <Badge variant="outline">
//                           {selectedJob.overall_job_status || "N/A"}
//                         </Badge>
//                       </div>
//                       <div>
//                         <p className="text-sm text-muted-foreground">
//                           Last Run:
//                         </p>
//                         <p className="font-medium">
//                           {selectedJob.overall_last_job_run
//                             ? new Date(
//                                 selectedJob.overall_last_job_run,
//                               ).toLocaleString("en-US", {
//                                 month: "short",
//                                 day: "numeric",
//                                 year: "numeric",
//                                 hour: "numeric",
//                                 minute: "2-digit",
//                                 hour12: true,
//                               })
//                             : "N/A"}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-muted-foreground">
//                           Schedule:
//                         </p>
//                         <p className="font-medium">
//                           {formatSchedule(selectedJob.schedule)}
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </Card>

//               <h3 className="text-lg font-semibold mb-4">Job Stages (3)</h3>
//               <div className="grid grid-cols-3 gap-4 mb-6">
//                 <Card className="p-4">
//                   <div className="flex items-center gap-2 mb-2">
//                     <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
//                       <Settings className="w-4 h-4 text-primary" />
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <span className="text-sm font-medium">Stage 1</span>
//                       <Clock className="w-3 h-3 text-muted-foreground" />
//                     </div>
//                   </div>
//                   <p className="font-medium mb-2">DQ Rules</p>
//                   {getStepBadge(
//                     selectedJob.dq_enabled ? "executed" : "skipped",
//                   )}
//                 </Card>

//                 <Card className="p-4">
//                   <div className="flex items-center gap-2 mb-2">
//                     <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
//                       <Settings className="w-4 h-4 text-orange-500" />
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <span className="text-sm font-medium">Stage 2</span>
//                       <Clock className="w-3 h-3 text-muted-foreground" />
//                     </div>
//                   </div>
//                   <p className="font-medium mb-2">NER</p>
//                   {getStepBadge(
//                     selectedJob.ner_enabled ? "executed" : "skipped",
//                   )}
//                 </Card>

//                 <Card className="p-4">
//                   <div className="flex items-center gap-2 mb-2">
//                     <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
//                       <Settings className="w-4 h-4 text-primary" />
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <span className="text-sm font-medium">Stage 3</span>
//                       <Clock className="w-3 h-3 text-muted-foreground" />
//                     </div>
//                   </div>
//                   <p className="font-medium mb-2">Business Logic</p>
//                   {getStepBadge(
//                     selectedJob.business_logic_enabled ? "executed" : "skipped",
//                   )}
//                 </Card>
//               </div>
//             </>
//           ) : (
//             <div className="text-center py-12 text-muted-foreground">
//               No job details available
//             </div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default Jobs;



import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  Table as TableIcon,
  Plus,
  Search,
  Play,
  Eye,
  Edit,
  Database,
  Loader2,
  X,
  Settings,
  Clock,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { toast } from "sonner";
import Header from "@/components/layout/Header-main";

interface ApiJob {
  job_id: string;
  job_name: string;
  created_at: string;
}

interface DetailedJobResponse {
  user_id: string;
  job_id: string;
  job_name: string;
  created_at: string;
  overall_job_status: string | null;
  overall_last_job_run: string | null;
  schedule: {
    frequency?: string;
    time_utc?: string;
    scheduled_at?: string;
  } | null;
  datasource_paths: string[];
  dq_enabled: boolean;
  ner_enabled: boolean;
  business_logic_enabled: boolean;
  business_logic_rules?: Record<string, string>;
}

interface Job {
  id: string;
  name: string;
  category: string;
  createdAt: string;
  lastRun: string;
  status: "Completed" | "PENDING" | "Created" | "Running" | "Failed";
  steps: {
    dqRules: "skipped" | "executed";
    ner: "skipped" | "executed";
    businessLogic: "skipped" | "executed";
    dataTransformations: "skipped" | "executed";
  };
}

const API_BASE = "https://api.veriton.ai/api/service2";

// ── Databricks endpoints ────────────────────────────────────────────
const DATABRICKS_API_BASE = "https://api.veriton.ai/api/service-databricks";

const databricksListJobsUrl = (userId: string) =>
  `${DATABRICKS_API_BASE}/list-jobs?user_id=${userId}`;

const databricksViewJobUrl = (userId: string, jobId: string) =>
  `${DATABRICKS_API_BASE}/view-job?user_id=${userId}&job_id=${jobId}`;

const DATABRICKS_RUN_JOB_URL = `${DATABRICKS_API_BASE}/run-job`;

/**
 * Reads the "user" object from localStorage and returns true if the user's
 * dataplatform is "Databricks". Same check used across the other workflow
 * pages (Data Quality / NER / Business Logic / Pipelines).
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

// ── Databricks "list jobs" response shape — note this only returns
// jobs that have been scheduled at least once, unlike service1/get-all-jobs.
interface DatabricksJobItem {
  job_id: string;
  job_name: string;
  created_at: string;
  last_run: string | null;
  status: string;
}

interface DatabricksListJobsResponse {
  user_id: string;
  jobs: DatabricksJobItem[];
}

// ── Databricks "view job" response shape — quite different from the
// default DetailedJobResponse, so it's mapped onto that shape below so the
// job-details modal doesn't need any UI changes.
interface DatabricksDataSource {
  sourceType?: string;
  bucket?: string;
  paths?: string[];
  connection?: Record<string, any>;
}

interface DatabricksViewJobResponse {
  user_id: string;
  job_id: string;
  data_sources: DatabricksDataSource[];
  dq: boolean;
  ner: boolean;
  business_logic: boolean;
  schedule: {
    jobName?: string;
    frequency?: string;
    time?: string;
    updatedAt?: string;
  } | null;
  job_status: string | null;
  created_at: string;
  last_run_time: string | null;
}

// ── Databricks "run job" response shape ─────────────────────────────
interface DatabricksRunJobResponse {
  user_id: string;
  job_id: string;
  job_status: string;
  last_run_time: string | null;
}

// Maps a Databricks status string (e.g. "NOT STARTED", "COMPLETED") onto
// the Job["status"] union already used throughout this page.
const mapDatabricksJobStatus = (
  status: string | null | undefined,
): Job["status"] => {
  switch ((status || "").toUpperCase()) {
    case "COMPLETED":
      return "Completed";
    case "RUNNING":
      return "Running";
    case "FAILED":
      return "Failed";
    case "PENDING":
      return "PENDING";
    case "NOT STARTED":
    default:
      return "Created";
  }
};

// Flattens Databricks data_sources[].paths into the flat string[] shape
// datasource_paths already uses, prefixed as `s3://bucket/path` so the
// existing getS3Path() helper (which looks for an "s3://" prefix) keeps
// working without changes.
const flattenDatabricksDatasourcePaths = (
  dataSources: DatabricksDataSource[] = [],
): string[] => {
  const paths: string[] = [];
  dataSources.forEach((ds) => {
    const prefix = ds.sourceType ? `${ds.sourceType}://` : "";
    const bucket = ds.bucket || "";
    (ds.paths || []).forEach((p) => {
      paths.push(bucket ? `${prefix}${bucket}/${p}` : `${prefix}${p}`);
    });
  });
  return paths;
};

// Maps a Databricks view-job response onto the existing DetailedJobResponse
// shape so the job-details modal renders unchanged. `fallbackName` covers
// the case where the response has no schedule (and therefore no jobName).
const mapDatabricksJobDetails = (
  data: DatabricksViewJobResponse,
  fallbackName: string,
): DetailedJobResponse => ({
  user_id: data.user_id,
  job_id: data.job_id,
  job_name: data.schedule?.jobName || fallbackName,
  created_at: data.created_at,
  overall_job_status: data.job_status,
  overall_last_job_run: data.last_run_time,
  schedule: data.schedule
    ? {
        frequency: data.schedule.frequency,
        time_utc: data.schedule.time,
        scheduled_at: data.schedule.updatedAt,
      }
    : null,
  datasource_paths: flattenDatabricksDatasourcePaths(data.data_sources),
  dq_enabled: !!data.dq,
  ner_enabled: !!data.ner,
  business_logic_enabled: !!data.business_logic,
});

const Jobs = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<"chart" | "table">("table");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedJob, setSelectedJob] = useState<DetailedJobResponse | null>(
    null,
  );
  const [showJobModal, setShowJobModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id || user?.user_id;

  // Reusable X close button for all toasts (Sonner style)
  const closeToastButton = (
    <button
      onClick={() => toast.dismiss()}
      className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
      aria-label="Close toast"
    >
      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
    </button>
  );

  // ── Fetch jobs, extracted so it can be called both on mount AND
  // whenever the data platform changes (this is the fix — previously this
  // whole block lived inside useEffect(..., [userId]) with nothing to
  // call it again, so switching to Databricks only "took" after a full
  // page refresh remounted the component). ──────────────────────────────
  const fetchJobs = useCallback(async () => {
    if (!userId) {
      toast.error("User ID not found in localStorage", {
        action: closeToastButton,
      });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      // ── Default (non-Databricks) jobs fetch ────
      const fetchJobsDefault = async (): Promise<Job[]> => {
        const response = await fetch(
          `https://api.veriton.ai/api/service1/get-all-jobs?user_id=${userId}`,
        );
        if (!response.ok) {
          throw new Error(`Failed to fetch jobs: ${response.status}`);
        }

        const data = await response.json();

        return data.jobs.map((item: ApiJob) => ({
          id: item.job_id,
          name: item.job_name || "Unnamed Job",
          category: "Unknown",
          createdAt: new Date(item.created_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          lastRun: "—",
          status: "Created" as const,
          steps: {
            dqRules: "skipped",
            ner: "skipped",
            businessLogic: "skipped",
            dataTransformations: "skipped",
          },
        }));
      };

      // ── Databricks jobs fetch via /list-jobs ────────────────────
      // Note: this endpoint only returns jobs that have been scheduled at
      // least once (via /schedule-job), unlike service1/get-all-jobs.
      const fetchJobsDatabricks = async (): Promise<Job[]> => {
        const response = await fetch(databricksListJobsUrl(userId));
        if (!response.ok) {
          throw new Error(`Failed to fetch jobs: ${response.status}`);
        }

        const data: DatabricksListJobsResponse = await response.json();

        return (data.jobs || []).map((item) => ({
          id: item.job_id,
          name: item.job_name || "Unnamed Job",
          category: "Unknown",
          createdAt: new Date(item.created_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          lastRun: item.last_run
            ? new Date(item.last_run).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              })
            : "—",
          status: mapDatabricksJobStatus(item.status),
          steps: {
            dqRules: "skipped",
            ner: "skipped",
            businessLogic: "skipped",
            dataTransformations: "skipped",
          },
        }));
      };

      let mappedJobs: Job[] = isDatabricksUser()
        ? await fetchJobsDatabricks()
        : await fetchJobsDefault();

      // Merge persisted statuses (only relevant for the simulated /
      // non-Databricks flow, but harmless either way — persisted entries
      // are keyed by job id, so a Databricks job with the same id
      // freshly re-fetched from the server will simply be overwritten
      // again below by whatever the server just reported).
      const persistedStatusesStr = localStorage.getItem("jobStatuses");
      if (persistedStatusesStr) {
        try {
          const persisted = JSON.parse(persistedStatusesStr);
          mappedJobs = mappedJobs.map((job) => {
            const persistedJob = persisted[job.id];
            if (persistedJob) {
              return {
                ...job,
                status: persistedJob.status,
                lastRun: persistedJob.lastRun || job.lastRun,
              };
            }
            return job;
          });
        } catch (e) {
          console.error("Failed to parse persisted statuses", e);
        }
      }

      setJobs(mappedJobs);
    } catch (error) {
      console.error("Error fetching jobs:", error);
      toast.error("Failed to load jobs", {
        action: closeToastButton,
      });
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Called by <Header /> the instant the data platform changes.
  const handlePlatformChange = useCallback(
    (_platform: string) => {
      fetchJobs();
    },
    [fetchJobs],
  );

  useEffect(() => {
    if (jobs.length > 0) {
      const statusMap: Record<string, { status: string; lastRun: string }> = {};
      jobs.forEach((job) => {
        statusMap[job.id] = {
          status: job.status,
          lastRun: job.lastRun,
        };
      });
      localStorage.setItem("jobStatuses", JSON.stringify(statusMap));
    }
  }, [jobs]);

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch = job.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || job.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || job.status === statusFilter;
    const jobDate = new Date(job.createdAt);
    const afterStart = !startDate || jobDate >= new Date(startDate);
    const beforeEnd = !endDate || jobDate <= new Date(endDate);
    return (
      matchesSearch &&
      matchesCategory &&
      matchesStatus &&
      afterStart &&
      beforeEnd
    );
  });

  const jobsByCategory = [
    {
      name: "Unknown",
      value: jobs.filter((j) => j.category === "Unknown").length,
      color: "#3b82f6",
    },
    {
      name: "Glue",
      value: jobs.filter((j) => j.category === "Glue").length,
      color: "#10b981",
    },
  ];

  const jobsByStatus = [
    {
      name: "PENDING",
      value: jobs.filter((j) => j.status === "PENDING").length,
      color: "#f97316",
    },
    {
      name: "Completed",
      value: jobs.filter((j) => j.status === "Completed").length,
      color: "#10b981",
    },
    {
      name: "Created",
      value: jobs.filter((j) => j.status === "Created").length,
      color: "#6b7280",
    },
  ];

  const hourlyData = Array.from({ length: 8 }, (_, i) => ({
    time: `${String(i * 3).padStart(2, "0")}:00`,
    jobs: 0,
  }));

  const runJob = async (jobId: string) => {
    if (isDatabricksUser()) {
      // Databricks users actually invoke /run-job. (The default flow
      // below has never called a real "run" endpoint — it's a
      // client-side simulated status flip — so this branch is the first
      // real backend integration for the Run button.)
      if (!userId) {
        toast.error("User ID not found. Please login again.", {
          action: closeToastButton,
        });
        return;
      }

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: "Running" as const,
                lastRun: new Date().toLocaleString(),
              }
            : job,
        ),
      );
      toast.success("Job started successfully", {
        action: closeToastButton,
      });

      try {
        const response = await fetch(DATABRICKS_RUN_JOB_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accept: "application/json",
          },
          body: JSON.stringify({ user_id: userId, job_id: jobId }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Run job failed: ${response.status} - ${errorText}`);
        }

        const result: DatabricksRunJobResponse = await response.json();

        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === jobId
              ? {
                  ...job,
                  status: mapDatabricksJobStatus(result.job_status),
                  lastRun: result.last_run_time
                    ? new Date(result.last_run_time).toLocaleString()
                    : new Date().toLocaleString(),
                }
              : job,
          ),
        );

        toast.success("Job completed successfully", {
          action: closeToastButton,
        });
      } catch (error) {
        console.error("Error running Databricks job:", error);
        setJobs((prevJobs) =>
          prevJobs.map((job) =>
            job.id === jobId ? { ...job, status: "Failed" as const } : job,
          ),
        );
        toast.error("Failed to run job", {
          action: closeToastButton,
        });
      }

      return;
    }

    // ── Default (non-Databricks) flow — simulated ────
    setJobs((prevJobs) =>
      prevJobs.map((job) =>
        job.id === jobId
          ? {
              ...job,
              status: "Running" as const,
              lastRun: new Date().toLocaleString(),
            }
          : job,
      ),
    );
    toast.success("Job started successfully", {
      action: closeToastButton,
    });

    setTimeout(() => {
      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId
            ? {
                ...job,
                status: "Completed" as const,
                lastRun: new Date().toLocaleString(),
              }
            : job,
        ),
      );
      toast.success("Job completed successfully", {
        action: closeToastButton,
      });
    }, 3000);
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Completed: "bg-green-500/20 text-green-600 border-green-500/30",
      PENDING: "bg-orange-500/20 text-orange-600 border-orange-500/30",
      Created: "bg-gray-500/20 text-gray-600 border-gray-500/30",
      Running: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      Failed: "bg-red-500/20 text-red-600 border-red-500/30",
    };
    return <Badge className={styles[status] || styles.Created}>{status}</Badge>;
  };

  const getStepBadge = (status: "skipped" | "executed") => {
    if (status === "executed") {
      return (
        <Badge className="bg-primary/20 text-primary border-primary/30">
          executed
        </Badge>
      );
    }
    return <Badge variant="secondary">skipped</Badge>;
  };

  const openJobDetails = async (job: Job) => {
    if (!userId) {
      toast.error("User ID not found. Please login again.", {
        action: closeToastButton,
      });
      return;
    }

    setModalLoading(true);
    setShowJobModal(true);
    setSelectedJob(null);

    try {
      let data: DetailedJobResponse;

      if (isDatabricksUser()) {
        // Databricks users call /view-job, whose response shape is
        // mapped onto DetailedJobResponse so the modal below is unchanged.
        const response = await fetch(databricksViewJobUrl(userId, job.id));

        if (!response.ok) {
          throw new Error(`Failed to fetch job details: ${response.status}`);
        }

        const raw: DatabricksViewJobResponse = await response.json();
        data = mapDatabricksJobDetails(raw, job.name);
      } else {
        // Default (non-Databricks) flow
        const response = await fetch(
          `${API_BASE}/view-job?user_id=${userId}&job_id=${job.id}`,
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch job details: ${response.status}`);
        }

        data = await response.json();
      }

      setSelectedJob(data);
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Failed to load job details", {
        action: closeToastButton,
      });
      setSelectedJob(null);
    } finally {
      setModalLoading(false);
    }
  };

  const getS3Path = (paths: any[] = []) => {
    return (
      paths.find(
        (path) => typeof path === "string" && path.startsWith("s3://"),
      ) || "N/A"
    );
  };

  const formatSchedule = (schedule: DetailedJobResponse["schedule"]) => {
    if (!schedule) return "N/A";
    const parts = [];
    if (schedule.frequency) parts.push(`Frequency: ${schedule.frequency}`);
    if (schedule.time_utc) parts.push(`Time (UTC): ${schedule.time_utc}`);
    if (schedule.scheduled_at) {
      const date = new Date(schedule.scheduled_at);
      parts.push(
        `Scheduled: ${date.toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })}`,
      );
    }
    return parts.join(" • ") || "N/A";
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header onDataPlatformChange={handlePlatformChange} />

      <main className="container mx-auto px-6 py-8 flex-1 overflow-y-auto">
        {viewMode === "chart" ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">Your Jobs at a Glance</h2>
                <p className="text-muted-foreground">
                  Track jobs by status, category, and time with ease.
                </p>
              </div>
              <Button variant="outline" onClick={() => setViewMode("table")}>
                <TableIcon className="w-4 h-4 mr-2" />
                Table View
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="p-6">
                <h3 className="font-semibold mb-4">Jobs by Category</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={jobsByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {jobsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold mb-4">Job Status Distribution</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={jobsByStatus}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {jobsByStatus.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">
                  Glue Jobs Created by Hour (Total Glue Jobs:{" "}
                  {jobs.filter((j) => j.category === "Glue").length})
                </h3>
                <Select defaultValue="daily">
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily (by Hour)</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="jobs"
                      name="Glue Jobs"
                      stroke="#3b82f6"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold">
                  All Jobs ({filteredJobs.length})
                </h2>
                <p className="text-muted-foreground">
                  View and manage your jobs
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => {
                    // Modern browsers support crypto.randomUUID()
                    const newJobId = crypto.randomUUID().replace(/-/g, "");

                    localStorage.setItem("current_job_id", newJobId);

                    navigate("/workflow/data-ingestion");
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Job
                </Button>
              </div>
            </div>

            <div className="p-4 mb-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative w-40">
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full text-center peer"
                      placeholder=" "
                    />
                    <label
                      className="
            absolute left-2 -top-2.5 px-1 text-xs font-medium text-muted-foreground
            bg-background transition-all peer-placeholder-shown:top-1/2
            peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground/70
            peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-foreground
          "
                    >
                      Start Date
                    </label>
                  </div>

                  <div className="relative w-40">
                    <Input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full text-center peer"
                      placeholder=" "
                    />
                    <label
                      className="
            absolute left-2 -top-2.5 px-1 text-xs font-medium text-muted-foreground
            bg-background transition-all peer-placeholder-shown:top-1/2
            peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground/70
            peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-foreground
          "
                    >
                      End Date
                    </label>
                  </div>

                  {/* Status dropdown with floating label */}
                  <div className="relative w-40">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger
                        className="
              w-full text-center peer
              [&>span]:text-muted-foreground/70
              peer-placeholder-shown:text-muted-foreground/70
              focus-within:text-foreground
            "
                      >
                        <SelectValue placeholder=" " />
                      </SelectTrigger>
                      <label
                        className="
              absolute left-2 -top-2.5 px-1 text-xs font-medium text-muted-foreground
              bg-background transition-all peer-placeholder-shown:top-1/2
              peer-placeholder-shown:text-sm peer-placeholder-shown:text-muted-foreground/70
              peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-foreground
            "
                      >
                        Status
                      </label>
                      <SelectContent>
                        <SelectItem className="hover:bg-primary/30" value="All">
                          All Statuses
                        </SelectItem>
                        <SelectItem
                          className="hover:bg-primary/30"
                          value="Created"
                        >
                          Created
                        </SelectItem>
                        <SelectItem
                          className="hover:bg-primary/30"
                          value="Running"
                        >
                          Running
                        </SelectItem>
                        <SelectItem
                          className="hover:bg-primary/30"
                          value="Completed"
                        >
                          Completed
                        </SelectItem>
                        <SelectItem
                          className="hover:bg-primary/30"
                          value="Failed"
                        >
                          Failed
                        </SelectItem>
                        <SelectItem
                          className="hover:bg-primary/30"
                          value="PENDING"
                        >
                          Pending
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearchQuery("");
                    setCategoryFilter("all");
                    setStatusFilter("All");
                    setStartDate("");
                    setEndDate("");
                  }}
                  className="border border-border"
                >
                  Clear
                </Button>
              </div>
            </div>

            <Card className="min-h-[300px] flex flex-col">
              {loading ? (
                <div className="flex-1 flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">
                      Loading your jobs...
                    </p>
                  </div>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="flex-1 py-12 text-center text-muted-foreground">
                  No jobs found matching your filters
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-medium text-muted-foreground">
                          Job Name
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground">
                          Created At
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground">
                          Last Run
                        </th>
                        <th className="text-left p-4 font-medium text-muted-foreground">
                          Status
                        </th>
                        <th className="text-center p-4 font-medium text-muted-foreground">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredJobs.map((job) => (
                        <tr
                          key={job.id}
                          className="border-b border-border last:border-0 hover:bg-muted/30"
                        >
                          <td className="p-4 font-medium">{job.name}</td>
                          <td className="p-4 text-muted-foreground">
                            {job.createdAt}
                          </td>
                          <td className="p-4 text-muted-foreground">
                            {job.lastRun}
                          </td>
                          <td className="p-4">{getStatusBadge(job.status)}</td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-2">
                              <Button
                                size="icon"
                                className="bg-primary hover:bg-primary/90 h-8 w-8"
                                onClick={() => runJob(job.id)}
                                disabled={
                                  job.status === "Running" ||
                                  job.status === "Completed"
                                }
                              >
                                <Play className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() => openJobDetails(job)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8"
                                onClick={() =>
                                  navigate(`/edit-job/${job.id}`, {
                                    state: {
                                      business_logic_rules:
                                        selectedJob?.business_logic_rules || {},
                                    },
                                  })
                                }
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </>
        )}
      </main>

      {/* Job Details Modal */}
      <Dialog open={showJobModal} onOpenChange={setShowJobModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="flex flex-row items-center justify-between pb-4 ">
            <DialogTitle className="text-2xl font-bold">
              Job Details - {selectedJob?.job_name || "Loading..."}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </DialogHeader>

          {modalLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading job details...</p>
            </div>
          ) : selectedJob ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Job Name</p>
                    <p className="font-medium">
                      {selectedJob.job_name || "N/A"}
                    </p>
                  </div>
                </Card>
                <Card className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data Source</p>
                    <p className="font-medium">
                      {getS3Path(selectedJob.datasource_paths)}
                    </p>
                  </div>
                </Card>
              </div>

              <Card className="p-6 mb-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-4">Job Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Job Name:
                        </p>
                        <p className="font-medium">
                          {selectedJob.job_name || "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Created At:
                        </p>
                        <p className="font-medium">
                          {new Date(selectedJob.created_at).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            },
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Data Source:
                        </p>
                        <p className="font-medium">
                          {getS3Path(selectedJob.datasource_paths)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Execution Details</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Overall Status:
                        </p>
                        <Badge variant="outline">
                          {selectedJob.overall_job_status || "N/A"}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Last Run:
                        </p>
                        <p className="font-medium">
                          {selectedJob.overall_last_job_run
                            ? new Date(
                                selectedJob.overall_last_job_run,
                              ).toLocaleString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                                hour12: true,
                              })
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Schedule:
                        </p>
                        <p className="font-medium">
                          {formatSchedule(selectedJob.schedule)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <h3 className="text-lg font-semibold mb-4">Job Stages (3)</h3>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Stage 1</span>
                      <Clock className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="font-medium mb-2">DQ Rules</p>
                  {getStepBadge(
                    selectedJob.dq_enabled ? "executed" : "skipped",
                  )}
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-orange-500/10 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-orange-500" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Stage 2</span>
                      <Clock className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="font-medium mb-2">NER</p>
                  {getStepBadge(
                    selectedJob.ner_enabled ? "executed" : "skipped",
                  )}
                </Card>

                <Card className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Settings className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium">Stage 3</span>
                      <Clock className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                  <p className="font-medium mb-2">Business Logic</p>
                  {getStepBadge(
                    selectedJob.business_logic_enabled ? "executed" : "skipped",
                  )}
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              No job details available
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Jobs;