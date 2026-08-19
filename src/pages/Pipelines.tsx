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
//   Search,
//   Play,
//   Eye,
//   Edit,
//   Trash2,
//   Database,
//   GitBranch,
//   LogOut,
//   BarChart3,
//   TableIcon,
//   Settings,
//   Clock,
//   Loader2,
//   X,
//   Sparkles,
// } from "lucide-react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
// } from "@/components/ui/select";
// import { toast } from "sonner";
// import { ThemeToggle } from "@/components/ThemeToggle";
 
// interface Pipeline {
//   id: string;
//   name: string;
//   jobs: string[];
//   createdAt: string;
//   status: string;
//   jobDetails?: Array<{ job_id: string; job_name: string; job_status?: string }>;
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
 
// const API_BASE = "https://api.veriton.ai/api/service2";

// // ── NEW: Databricks endpoints ────────────────────────────────────────────
// const DATABRICKS_API_BASE = "https://api.veriton.ai/api/service-databricks";

// const databricksListPipelinesUrl = (userId: string) =>
//   `${DATABRICKS_API_BASE}/list-pipelines?user_id=${userId}`;

// const databricksViewPipelineUrl = (userId: string, pipelineId: string) =>
//   `${DATABRICKS_API_BASE}/view-pipeline?user_id=${userId}&pipeline_id=${pipelineId}`;

// const DATABRICKS_RUN_PIPELINE_URL = `${DATABRICKS_API_BASE}/run-pipeline`;

// const databricksViewJobUrl = (userId: string, jobId: string) =>
//   `${DATABRICKS_API_BASE}/view-job?user_id=${userId}&job_id=${jobId}`;

// /**
//  * Reads the "user" object from localStorage and returns true if the user's
//  * dataplatform is "Databricks". Same check used across the other workflow
//  * pages (Data Quality / NER / Business Logic / Jobs).
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

// // ── NEW: Databricks "list pipelines" response shape ──────────────────────
// interface DatabricksPipelineItem {
//   pipeline_id: string;
//   pipeline_name: string;
//   jobs: number;
//   job_ids: string[];
//   created_at: string;
//   status: string;
// }

// interface DatabricksListPipelinesResponse {
//   user_id: string;
//   pipelines: DatabricksPipelineItem[];
// }

// // ── NEW: Databricks "view pipeline" response shape — each job includes
// // job_status/last_run, unlike the default view-pipeline response.
// interface DatabricksViewPipelineJob {
//   job_id: string;
//   job_name: string;
//   job_status: string;
//   last_run: string | null;
// }

// interface DatabricksViewPipelineResponse {
//   pipeline_id: string;
//   pipeline_name: string;
//   created_at: string;
//   status: string;
//   jobs: DatabricksViewPipelineJob[];
// }

// // ── NEW: Databricks "run pipeline" response shape — this call is
// // synchronous (runs every job sequentially server-side and only returns
// // once all are done), so no client-side polling is needed for it.
// interface DatabricksRunPipelineJobResult {
//   job_id: string;
//   job_status: string;
//   last_run_time: string | null;
// }

// interface DatabricksRunPipelineResponse {
//   user_id: string;
//   pipeline_id: string;
//   status: string;
//   jobs: DatabricksRunPipelineJobResult[];
// }

// // ── NEW: Databricks "view job" response shape — quite different from the
// // default DetailedJobResponse (data_sources[].paths instead of a flat
// // datasource_paths array, dq/ner/business_logic instead of *_enabled, no
// // top-level job_name, etc.), so it's mapped onto DetailedJobResponse below
// // so the Job Details dialog doesn't need any UI changes.
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
// // shape so the Job Details dialog renders unchanged. `fallbackName` covers
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
 
// const Pipelines = () => {
//   const navigate = useNavigate();
//   const [searchQuery, setSearchQuery] = useState("");
//   const [pipelines, setPipelines] = useState<Pipeline[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [runningPipelines, setRunningPipelines] = useState<Set<string>>(new Set());
//   const [showJobsModal, setShowJobsModal] = useState(false);
//   const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
//   const [modalLoading, setModalLoading] = useState(false);
 
//   // Job Details Dialog state
//   const [showJobDetailDialog, setShowJobDetailDialog] = useState(false);
//   const [selectedJobDetail, setSelectedJobDetail] = useState<DetailedJobResponse | null>(null);
//   const [jobDetailLoading, setJobDetailLoading] = useState(false);
 
//   const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}") : {};
//   const userId = user?.id || user?.user_id;

//   // Data platform selection (Fabric / Snowflake / Databricks)
//   const [dataPlatform, setDataPlatform] = useState<string>(user?.dataplatform || "");
 
//   // Load cached pipelines on mount
//   useEffect(() => {
//     const cached = localStorage.getItem("pipelines");
//     if (cached) {
//       try {
//         const parsed = JSON.parse(cached);
//         const cachedPipelines: Pipeline[] = parsed.map((p: { id: string; name: string }) => ({
//           id: p.id,
//           name: p.name,
//           jobs: [],
//           createdAt: "N/A",
//           status: "CREATED",
//         }));
//         setPipelines(cachedPipelines);
//       } catch (e) {
//         console.warn("Failed to parse cached pipelines", e);
//       }
//     }
//   }, []);
 
//   // Fetch fresh pipelines + update cache
//   useEffect(() => {
//     const fetchPipelines = async () => {
//       setLoading(true);
//       setError(null);
 
//       try {
//         // ── Existing default (non-Databricks) pipelines fetch — unchanged ──
//         const fetchPipelinesDefault = async (): Promise<Pipeline[]> => {
//           const response = await fetch(`${API_BASE}/pipelines?user_id=${userId}`, {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//           });

//           if (!response.ok) throw new Error(`Failed to fetch pipelines: ${response.status}`);

//           const data = await response.json();

//           return (data.pipelines || []).map((p: any) => ({
//             id: p.pipeline_id,
//             name: p.name || "Unnamed Pipeline",
//             jobs: p.job_ids || [],
//             createdAt: p.created_at || "N/A",
//             status: p.status || "CREATED",
//           }));
//         };

//         // ── NEW: Databricks pipelines fetch via /list-pipelines ───────────
//         const fetchPipelinesDatabricks = async (): Promise<Pipeline[]> => {
//           const response = await fetch(databricksListPipelinesUrl(userId));

//           if (!response.ok) throw new Error(`Failed to fetch pipelines: ${response.status}`);

//           const data: DatabricksListPipelinesResponse = await response.json();

//           return (data.pipelines || []).map((p) => ({
//             id: p.pipeline_id,
//             name: p.pipeline_name || "Unnamed Pipeline",
//             jobs: p.job_ids || [],
//             createdAt: p.created_at || "N/A",
//             status: p.status || "CREATED",
//           }));
//         };

//         const mapped: Pipeline[] = isDatabricksUser()
//           ? await fetchPipelinesDatabricks()
//           : await fetchPipelinesDefault();
 
//         setPipelines(mapped);
 
//         const toCache = mapped.map(p => ({ id: p.id, name: p.name }));
//         localStorage.setItem("pipelines", JSON.stringify(toCache));
//       } catch (err: any) {
//         console.error("Pipelines fetch error:", err);
//         setError(err.message || "Could not load pipelines");
//         toast.error("Failed to load pipelines from server. Showing cached data.");
//       } finally {
//         setLoading(false);
//       }
//     };
 
//     if (userId) fetchPipelines();
//     else {
//       setError("User ID not found. Please log in again.");
//       setLoading(false);
//     }
//   }, [userId]);
 
//   const fetchPipelineDetails = async (pipelineId: string) => {
//     setModalLoading(true);
//     try {
//       let jobs: Array<{ job_id: string; job_name: string; job_status?: string }>;

//       if (isDatabricksUser()) {
//         // ── NEW: Databricks users call /view-pipeline, whose jobs already
//         // include job_status/last_run per job.
//         const res = await fetch(databricksViewPipelineUrl(userId, pipelineId));

//         if (!res.ok) throw new Error(`Failed to fetch pipeline details: ${res.status}`);

//         const data: DatabricksViewPipelineResponse = await res.json();

//         jobs = (data.jobs || []).map((j) => ({
//           job_id: j.job_id,
//           job_name: j.job_name,
//           job_status: j.job_status,
//         }));
//       } else {
//         // ── Existing default (non-Databricks) flow — unchanged ────────────
//         const res = await fetch(
//           `${API_BASE}/view-pipeline?user_id=${userId}&pipeline_id=${pipelineId}`,
//           {
//             method: "GET",
//             headers: { "Content-Type": "application/json" },
//           }
//         );

//         if (!res.ok) throw new Error(`Failed to fetch pipeline details: ${res.status}`);

//         const data = await res.json();
//         jobs = data.jobs || [];
//       }
 
//       setSelectedPipeline(prev => ({
//         ...prev!,
//         jobDetails: jobs,
//       }));
 
//       setPipelines(prev =>
//         prev.map(p =>
//           p.id === pipelineId ? { ...p, jobDetails: jobs } : p
//         )
//       );
//     } catch (err) {
//       console.error("Failed to load pipeline details:", err);
//       toast.error("Could not load job names");
//     } finally {
//       setModalLoading(false);
//     }
//   };
 
//   const viewPipelineJobs = (pipeline: Pipeline) => {
//     setSelectedPipeline(pipeline);
//     setShowJobsModal(true);
 
//     if (!pipeline.jobDetails || pipeline.jobDetails.length === 0) {
//       fetchPipelineDetails(pipeline.id);
//     }
//   };
 
//   // Opens the Job Details dialog by fetching from the view-job endpoint
//   const openJobDetailDialog = async (jobId: string, jobName?: string) => {
//     if (!userId) {
//       toast.error("User ID not found. Please login again.");
//       return;
//     }
 
//     setJobDetailLoading(true);
//     setSelectedJobDetail(null);
//     setShowJobDetailDialog(true);
 
//     try {
//       let data: DetailedJobResponse;

//       if (isDatabricksUser()) {
//         // ── NEW: Databricks users call /view-job, whose response shape is
//         // mapped onto DetailedJobResponse so the dialog below is unchanged.
//         const response = await fetch(databricksViewJobUrl(userId, jobId));

//         if (!response.ok) {
//           throw new Error(`Failed to fetch job details: ${response.status}`);
//         }

//         const raw: DatabricksViewJobResponse = await response.json();
//         data = mapDatabricksJobDetails(raw, jobName || "Unnamed Job");
//       } else {
//         // ── Existing default (non-Databricks) flow — unchanged ──────────
//         const response = await fetch(`${API_BASE}/view-job?user_id=${userId}&job_id=${jobId}`);

//         if (!response.ok) {
//           throw new Error(`Failed to fetch job details: ${response.status}`);
//         }

//         data = await response.json();
//       }

//       setSelectedJobDetail(data);
//     } catch (error) {
//       console.error("Error fetching job details:", error);
//       toast.error("Failed to load job details");
//       setSelectedJobDetail(null);
//     } finally {
//       setJobDetailLoading(false);
//     }
//   };
 
//   const filteredPipelines = pipelines.filter(p =>
//     p.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );
 
//   const deletePipeline = async (pipelineId: string, pipelineName: string) => {
//     if (!confirm(`Are you sure you want to delete pipeline "${pipelineName}"?`)) return;
 
//     try {
//       const url = `${API_BASE}/delete-pipeline?user_id=${userId}&pipeline_id=${pipelineId}`;
//       const response = await fetch(url, {
//         method: "DELETE",
//         headers: { "Content-Type": "application/json" },
//       });
 
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Delete failed: ${response.status} - ${errorText}`);
//       }
 
//       const result = await response.json();
 
//       if (result.status === "success") {
//         toast.success(result.message || `Pipeline "${pipelineName}" deleted`);
//         setPipelines(prev => prev.filter(p => p.id !== pipelineId));
 
//         const cached = localStorage.getItem("pipelines");
//         if (cached) {
//           try {
//             const parsed = JSON.parse(cached);
//             const updated = parsed.filter((p: any) => p.id !== pipelineId);
//             localStorage.setItem("pipelines", JSON.stringify(updated));
//           } catch {}
//         }
//       } else {
//         throw new Error(result.message || "Delete failed");
//       }
//     } catch (err: any) {
//       toast.error(err.message || "Failed to delete pipeline");
//     }
//   };
 
//   const runPipeline = async (pipelineId: string) => {
//     if (runningPipelines.has(pipelineId)) {
//       toast.info("Pipeline is already running");
//       return;
//     }
 
//     setRunningPipelines(prev => new Set([...prev, pipelineId]));
//     setPipelines(prev =>
//       prev.map(p => (p.id === pipelineId ? { ...p, status: "Running" } : p))
//     );
 
//     toast.info("Starting pipeline...");

//     if (isDatabricksUser()) {
//       // ── NEW: Databricks run-pipeline is synchronous — it runs every job
//       // in the pipeline sequentially server-side and only returns once
//       // they're all done (roughly 30s * job count), so no client-side
//       // polling loop is needed here, unlike the default flow below.
//       try {
//         const runRes = await fetch(DATABRICKS_RUN_PIPELINE_URL, {
//           method: "POST",
//           headers: {
//             accept: "application/json",
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ user_id: userId, pipeline_id: pipelineId }),
//         });

//         if (!runRes.ok) {
//           const txt = await runRes.text();
//           throw new Error(`Run request failed: ${runRes.status} - ${txt}`);
//         }

//         const result: DatabricksRunPipelineResponse = await runRes.json();
//         const finalStatus = result.status || "UNKNOWN";

//         setPipelines(prev =>
//           prev.map(p => (p.id === pipelineId ? { ...p, status: finalStatus } : p))
//         );

//         if (finalStatus.toUpperCase() === "SUCCESS") {
//           toast.success("Pipeline finished successfully");
//         } else if (finalStatus.toUpperCase().includes("FAIL")) {
//           toast.error("Pipeline failed – check job details");
//         } else {
//           toast.warning(`Pipeline finished with status: ${finalStatus}`, { duration: 8000 });
//         }
//       } catch (err: any) {
//         console.error("Pipeline run error:", err);
//         toast.error(err.message || "Failed to run pipeline");
//         setPipelines(prev =>
//           prev.map(p => (p.id === pipelineId ? { ...p, status: "Failed" } : p))
//         );
//       } finally {
//         setRunningPipelines(prev => {
//           const next = new Set(prev);
//           next.delete(pipelineId);
//           return next;
//         });
//       }

//       return;
//     }
 
//     // ── Existing default (non-Databricks) flow — async + polling, unchanged ──
//     try {
//       const runRes = await fetch(`${API_BASE}/run-pipeline`, {
//         method: "POST",
//         headers: {
//           accept: "application/json",
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({ user_id: userId, pipeline_id: pipelineId }),
//       });
 
//       if (!runRes.ok) {
//         const txt = await runRes.text();
//         throw new Error(`Run request failed: ${runRes.status} - ${txt}`);
//       }
 
//       const runResult = await runRes.json();
 
//       const startedSuccessfully =
//         runResult.message?.toLowerCase().includes("started") ||
//         ["QUEUED", "RUNNING", "PENDING", "SUCCESS"].includes((runResult.status || "").toUpperCase());
 
//       if (!startedSuccessfully) {
//         throw new Error(runResult.message || "Could not start pipeline");
//       }
 
//       const startTime = Date.now();
//       const MAX_POLL_MS = 90000;
//       const POLL_INTERVAL_MS = 3000;
 
//       let finalStatus = "Running";
 
//       while (Date.now() - startTime < MAX_POLL_MS) {
//         await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
 
//         try {
//           const statusRes = await fetch(
//             `${API_BASE}/get-pipeline-status?user_id=${userId}&pipeline_id=${pipelineId}`,
//             { headers: { "Content-Type": "application/json" } }
//           );
 
//           if (!statusRes.ok) continue;
 
//           const data = await statusRes.json();
 
//           const apiStatus = (data.status || "UNKNOWN").trim();
//           const total     = Number(data.jobs_total ?? 0);
//           const succeeded = Number(data.jobs_succeeded ?? 0);
//           const failed    = Number(data.jobs_failed ?? 0);
 
//           if (total > 0 && (succeeded > 0 || failed > 0)) {
//             toast.info(`Progress: ${succeeded}/${total} (${failed} failed)`, {
//               id: `progress-${pipelineId}`,
//               duration: 4000,
//             });
//           }
 
//           if (
//             apiStatus.toUpperCase() === "SUCCESS" ||
//             (total > 0 && succeeded === total && failed === 0)
//           ) {
//             finalStatus = apiStatus;
//             break;
//           }
 
//           if (apiStatus.toUpperCase() === "FAILED" || failed > 0) {
//             finalStatus = apiStatus;
//             break;
//           }
 
//           finalStatus = apiStatus || "Running";
 
//         } catch (err) {
//           console.warn("Status poll failed (will retry):", err);
//         }
//       }
 
//       setPipelines(prev =>
//         prev.map(p =>
//           p.id === pipelineId ? { ...p, status: finalStatus } : p
//         )
//       );
 
//       if (finalStatus.toUpperCase() === "SUCCESS") {
//         toast.success("Pipeline finished successfully");
//       } else if (finalStatus.toUpperCase() === "FAILED" || finalStatus.toUpperCase().includes("FAIL")) {
//         toast.error("Pipeline failed – check job details");
//       } else {
//         toast.warning("Polling timeout – check status manually", { duration: 8000 });
//       }
//     } catch (err: any) {
//       console.error("Pipeline run error:", err);
//       toast.error(err.message || "Failed to run pipeline");
//       setPipelines(prev =>
//         prev.map(p => (p.id === pipelineId ? { ...p, status: "Failed" } : p))
//       );
//     } finally {
//       setRunningPipelines(prev => {
//         const next = new Set(prev);
//         next.delete(pipelineId);
//         return next;
//       });
//     }
//   };
 
//   const getStatusBadge = (status: string) => {
//     const upper = status.toUpperCase();
 
//     const styles: Record<string, string> = {
//       SUCCESS: "bg-green-500/20 text-green-600 border-green-500/30",
//       FAILED:  "bg-red-500/20 text-red-600 border-red-500/30",
//       RUNNING: "bg-blue-500/20 text-blue-600 border-blue-500/30",
//       QUEUED:  "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
//       PENDING: "bg-orange-500/20 text-orange-600 border-orange-500/30",
//       CREATED: "bg-purple-500/20 text-purple-600 border-purple-500/30",
//     };
 
//     const styleClass = styles[upper] || "bg-gray-500/20 text-gray-600 border-gray-500/30";
 
//     return <Badge className={styleClass}>{status}</Badge>;
//   };
 
//   const getStepBadge = (status: "skipped" | "executed") => {
//     if (status === "executed") {
//       return <Badge className="bg-primary/20 text-primary border-primary/30">executed</Badge>;
//     }
//     return <Badge variant="secondary">skipped</Badge>;
//   };
 
//   const getS3Path = (paths: any[] = []) => {
//     return (
//       paths.find((path) => typeof path === "string" && path.startsWith("s3://")) || "N/A"
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
//         })}`
//       );
//     }
//     return parts.join(" • ") || "N/A";
//   };
 
//   const userName = user?.name || user?.email?.split("@")[0] || "User";
 
//   const handleLogout = () => {
//     localStorage.clear();
//     toast.success("Logged out successfully");
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
//       toast.success(`Data platform set to ${value}`);
//     } catch (err) {
//       console.error("Failed to update data platform in localStorage", err);
//       toast.error("Failed to save data platform selection");
//     }
//   };
 
//   return (
//     <div className="min-h-screen bg-background">
//       <header className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
//         <div className="container mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//              <div className="flex items-center gap-3 md:gap-4">
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
//                 className="flex items-center gap-2 text-primary font-medium border-b-2 border-primary pb-1"
//               >
//                 <GitBranch className="w-4 h-4" />
//                 Pipelines
//               </button>
//               <button
//                 onClick={() => navigate("/datasets")}
//                 className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
//               >
//                 <TableIcon className="w-4 h-4" />
//                 Datasets
//               </button>
               
//                <button
//                 onClick={() => navigate("/workflow/automl/jobs1")}  // or any route you prefer
//                 className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
//               >
//                 <Sparkles className="w-4 h-4" />   {/* Perfect icon for datasets */}
//                 AutoML
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
 
//       <main className="container mx-auto px-6 py-8">
//         <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
//           <div>
//             <h2 className="text-2xl font-bold">
//               All Pipelines {loading ? "" : `(${filteredPipelines.length})`}
//             </h2>
//             <p className="text-muted-foreground">View and manage your pipelines</p>
//           </div>
 
//           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
//             <div className="relative flex-1 min-w-[220px] sm:min-w-[280px] md:min-w-[340px]">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//               <Input
//                 placeholder="Search pipelines..."
//                 value={searchQuery}
//                 onChange={e => setSearchQuery(e.target.value)}
//                 className="pl-10 w-full"
//               />
//             </div>
//             <Button onClick={() => navigate("/create-pipeline")} className="whitespace-nowrap">
//               Create Pipeline
//             </Button>
//           </div>
//         </div>
 
//         {loading && (
//           <Card className="p-8 text-center">
//             <p className="text-muted-foreground">Loading pipelines...</p>
//           </Card>
//         )}
 
//         {error && !loading && (
//           <Card className="p-6 border-destructive">
//             <p className="text-destructive">{error}</p>
//             <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
//               Retry
//             </Button>
//           </Card>
//         )}
 
//         {!loading && !error && (
//           <Card>
//             <div className="overflow-x-auto">
//               <table className="w-full">
//                 <thead>
//                   <tr className="border-b border-border">
//                     <th className="text-left p-4 font-medium text-muted-foreground">Pipeline Name</th>
//                     <th className="text-left p-4 font-medium text-muted-foreground">Jobs</th>
//                     <th className="text-left p-4 font-medium text-muted-foreground">Created At</th>
//                     <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
//                     <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredPipelines.length === 0 ? (
//                     <tr>
//                       <td colSpan={5} className="p-8 text-center text-muted-foreground">
//                         No pipelines found
//                       </td>
//                     </tr>
//                   ) : (
//                     filteredPipelines.map(pipeline => (
//                       <tr
//                         key={pipeline.id}
//                         className="border-b border-border last:border-0 hover:bg-muted/30"
//                       >
//                         <td className="p-4 font-medium">{pipeline.name}</td>
//                         <td className="p-4">
//                           <Badge variant="secondary" className="rounded-full">
//                             {pipeline.jobs.length}
//                           </Badge>
//                         </td>
//                         <td className="p-4 text-muted-foreground">
//                           {new Date(pipeline.createdAt).toLocaleString()}
//                         </td>
//                         <td className="p-4">{getStatusBadge(pipeline.status)}</td>
//                         <td className="p-4">
//                           <div className="flex items-center justify-center gap-2">
//                             <Button
//                               size="icon"
//                               className={`h-8 w-8 ${runningPipelines.has(pipeline.id) ? "bg-yellow-600 hover:bg-yellow-700" : "bg-primary hover:bg-primary/90"}`}
//                               onClick={() => runPipeline(pipeline.id)}
//                               disabled={runningPipelines.has(pipeline.id)}
//                             >
//                               <Play className="w-4 h-4" />
//                             </Button>
//                             <Button
//                               size="icon"
//                               variant="ghost"
//                               className="h-8 w-8"
//                               onClick={() => viewPipelineJobs(pipeline)}
//                             >
//                               <Eye className="w-4 h-4" />
//                             </Button>
//                             <Button
//                               size="icon"
//                               variant="ghost"
//                               className="h-8 w-8"
//                               onClick={() => navigate(`/edit-pipeline/${pipeline.id}`)}
//                             >
//                               <Edit className="w-4 h-4" />
//                             </Button>
//                             <Button
//                               size="icon"
//                               variant="ghost"
//                               className="h-8 w-8 text-destructive hover:text-destructive"
//                               onClick={() => deletePipeline(pipeline.id, pipeline.name)}
//                             >
//                               <Trash2 className="w-4 h-4" />
//                             </Button>
//                           </div>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </Card>
//         )}
//       </main>
 
//       {/* Pipeline Jobs Modal */}
//       {showJobsModal && selectedPipeline && (
//         <div
//           className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
//           onClick={() => setShowJobsModal(false)}
//         >
//           <Card
//             className="w-full max-w-md bg-background border border-border"
//             onClick={e => e.stopPropagation()}
//           >
//             <div className="p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <div>
//                   <h3 className="font-semibold">{selectedPipeline.name} – Jobs</h3>
//                   <p className="text-sm text-muted-foreground">View all jobs in this pipeline</p>
//                 </div>
//                 <Button variant="ghost" size="icon" onClick={() => setShowJobsModal(false)}>
//                   <span className="text-xl">×</span>
//                 </Button>
//               </div>
 
//               {modalLoading ? (
//                 <p className="text-center text-muted-foreground py-8">Loading job details...</p>
//               ) : (
//                 <div className="space-y-3 max-h-[60vh] overflow-y-auto">
//                   {!selectedPipeline.jobDetails || selectedPipeline.jobDetails.length === 0 ? (
//                     <p className="text-center text-muted-foreground py-6">
//                       No jobs found in this pipeline
//                     </p>
//                   ) : (
//                     selectedPipeline.jobDetails.map((job, index) => (
//                       <Card
//                         key={job.job_id}
//                         className="p-4 flex items-center justify-between border-l-4 border-l-primary"
//                       >
//                         <div className="flex items-center gap-3">
//                           <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
//                             {index + 1}
//                           </div>
//                           <div>
//                             <p className="font-medium">{job.job_name || "Unnamed Job"}</p>
//                             <p className="text-xs text-muted-foreground truncate max-w-[180px]">
//                               ID: {job.job_id}
//                             </p>
//                             <p className="text-sm text-muted-foreground">
//                               Status: {job.job_status || "Created"}
//                             </p>
//                           </div>
//                         </div>
//                         {/* ── Eye button now opens the Job Details dialog ── */}
//                         <Button
//                           size="icon"
//                           variant="ghost"
//                           onClick={() => {
//                             setShowJobsModal(false);
//                             openJobDetailDialog(job.job_id, job.job_name);
//                           }}
//                         >
//                           <Eye className="w-4 h-4" />
//                         </Button>
//                       </Card>
//                     ))
//                   )}
//                 </div>
//               )}
//             </div>
//           </Card>
//         </div>
//       )}
 
//       {/* Job Details Dialog (same as Jobs.tsx) */}
//       <Dialog open={showJobDetailDialog} onOpenChange={setShowJobDetailDialog}>
//         <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
//           <DialogHeader className="flex flex-row items-center justify-between pb-4">
//             <DialogTitle className="text-2xl font-bold">
//               Job Details - {selectedJobDetail?.job_name || "Loading..."}
//             </DialogTitle>
//             <DialogClose asChild>
//               <Button variant="ghost" size="icon">
//                 <X className="h-5 w-5" />
//               </Button>
//             </DialogClose>
//           </DialogHeader>
 
//           {jobDetailLoading ? (
//             <div className="flex flex-col items-center justify-center py-12">
//               <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
//               <p className="text-muted-foreground">Loading job details...</p>
//             </div>
//           ) : selectedJobDetail ? (
//             <>
//               <div className="grid grid-cols-2 gap-4 mb-6">
//                 <Card className="p-4 flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//                     <Settings className="w-5 h-5 text-primary" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Job Name</p>
//                     <p className="font-medium">{selectedJobDetail.job_name || "N/A"}</p>
//                   </div>
//                 </Card>
//                 <Card className="p-4 flex items-center gap-3">
//                   <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
//                     <Database className="w-5 h-5 text-primary" />
//                   </div>
//                   <div>
//                     <p className="text-sm text-muted-foreground">Data Source</p>
//                     <p className="font-medium">{getS3Path(selectedJobDetail.datasource_paths)}</p>
//                   </div>
//                 </Card>
//               </div>
 
//               <Card className="p-6 mb-6">
//                 <div className="grid grid-cols-2 gap-8">
//                   <div>
//                     <h4 className="font-semibold mb-4">Job Information</h4>
//                     <div className="space-y-3">
//                       <div>
//                         <p className="text-sm text-muted-foreground">Job Name:</p>
//                         <p className="font-medium">{selectedJobDetail.job_name || "N/A"}</p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-muted-foreground">Created At:</p>
//                         <p className="font-medium">
//                           {new Date(selectedJobDetail.created_at).toLocaleString("en-US", {
//                             month: "short",
//                             day: "numeric",
//                             year: "numeric",
//                             hour: "numeric",
//                             minute: "2-digit",
//                             hour12: true,
//                           })}
//                         </p>
//                       </div>
//                       <div>
//                         <p className="text-sm text-muted-foreground">Data Source:</p>
//                         <p className="font-medium">{getS3Path(selectedJobDetail.datasource_paths)}</p>
//                       </div>
//                     </div>
//                   </div>
//                   <div>
//                     <h4 className="font-semibold mb-4">Execution Details</h4>
//                     <div className="space-y-3">
//                       <div>
//                         <p className="text-sm text-muted-foreground">Overall Status:</p>
//                         <Badge variant="outline">{selectedJobDetail.overall_job_status || "N/A"}</Badge>
//                       </div>
//                       <div>
//                         <p className="text-sm text-muted-foreground">Last Run:</p>
//                         <p className="font-medium">
//                           {selectedJobDetail.overall_last_job_run
//                             ? new Date(selectedJobDetail.overall_last_job_run).toLocaleString("en-US", {
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
//                         <p className="text-sm text-muted-foreground">Schedule:</p>
//                         <p className="font-medium">{formatSchedule(selectedJobDetail.schedule)}</p>
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
//                   {getStepBadge(selectedJobDetail.dq_enabled ? "executed" : "skipped")}
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
//                   {getStepBadge(selectedJobDetail.ner_enabled ? "executed" : "skipped")}
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
//                   {getStepBadge(selectedJobDetail.business_logic_enabled ? "executed" : "skipped")}
//                 </Card>
//               </div>
//             </>
//           ) : (
//             <div className="text-center py-12 text-muted-foreground">No job details available</div>
//           )}
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };
 
// export default Pipelines;



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
  Search,
  Play,
  Eye,
  Edit,
  Trash2,
  Database,
  Settings,
  Clock,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/layout/Header-main";

interface Pipeline {
  id: string;
  name: string;
  jobs: string[];
  createdAt: string;
  status: string;
  jobDetails?: Array<{ job_id: string; job_name: string; job_status?: string }>;
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

const API_BASE = "https://api.veriton.ai/api/service2";

// ── Databricks endpoints ────────────────────────────────────────────
const DATABRICKS_API_BASE = "https://api.veriton.ai/api/service-databricks";

const databricksListPipelinesUrl = (userId: string) =>
  `${DATABRICKS_API_BASE}/list-pipelines?user_id=${userId}`;

const databricksViewPipelineUrl = (userId: string, pipelineId: string) =>
  `${DATABRICKS_API_BASE}/view-pipeline?user_id=${userId}&pipeline_id=${pipelineId}`;

const DATABRICKS_RUN_PIPELINE_URL = `${DATABRICKS_API_BASE}/run-pipeline`;

const databricksViewJobUrl = (userId: string, jobId: string) =>
  `${DATABRICKS_API_BASE}/view-job?user_id=${userId}&job_id=${jobId}`;

/**
 * Reads the "user" object from localStorage and returns true if the user's
 * dataplatform is "Databricks". Same check used across the other workflow
 * pages (Data Quality / NER / Business Logic / Jobs).
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

// ── Databricks "list pipelines" response shape ──────────────────────
interface DatabricksPipelineItem {
  pipeline_id: string;
  pipeline_name: string;
  jobs: number;
  job_ids: string[];
  created_at: string;
  status: string;
}

interface DatabricksListPipelinesResponse {
  user_id: string;
  pipelines: DatabricksPipelineItem[];
}

// ── Databricks "view pipeline" response shape — each job includes
// job_status/last_run, unlike the default view-pipeline response.
interface DatabricksViewPipelineJob {
  job_id: string;
  job_name: string;
  job_status: string;
  last_run: string | null;
}

interface DatabricksViewPipelineResponse {
  pipeline_id: string;
  pipeline_name: string;
  created_at: string;
  status: string;
  jobs: DatabricksViewPipelineJob[];
}

// ── Databricks "run pipeline" response shape — this call is
// synchronous (runs every job sequentially server-side and only returns
// once all are done), so no client-side polling is needed for it.
interface DatabricksRunPipelineJobResult {
  job_id: string;
  job_status: string;
  last_run_time: string | null;
}

interface DatabricksRunPipelineResponse {
  user_id: string;
  pipeline_id: string;
  status: string;
  jobs: DatabricksRunPipelineJobResult[];
}

// ── Databricks "view job" response shape — quite different from the
// default DetailedJobResponse (data_sources[].paths instead of a flat
// datasource_paths array, dq/ner/business_logic instead of *_enabled, no
// top-level job_name, etc.), so it's mapped onto DetailedJobResponse below
// so the Job Details dialog doesn't need any UI changes.
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
// shape so the Job Details dialog renders unchanged. `fallbackName` covers
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

const Pipelines = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [runningPipelines, setRunningPipelines] = useState<Set<string>>(new Set());
  const [showJobsModal, setShowJobsModal] = useState(false);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  // Job Details Dialog state
  const [showJobDetailDialog, setShowJobDetailDialog] = useState(false);
  const [selectedJobDetail, setSelectedJobDetail] = useState<DetailedJobResponse | null>(null);
  const [jobDetailLoading, setJobDetailLoading] = useState(false);

  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const userId = user?.id || user?.user_id;

  // ── Fetch pipelines, extracted so it can be called both on mount AND
  // whenever the data platform changes (fixes the "needs a manual page
  // refresh after switching to Databricks" bug). ──────────────────────
  const fetchPipelines = useCallback(async () => {
    if (!userId) {
      setError("User ID not found. Please log in again.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // ── Default (non-Databricks) pipelines fetch ──
      const fetchPipelinesDefault = async (): Promise<Pipeline[]> => {
        const response = await fetch(`${API_BASE}/pipelines?user_id=${userId}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) throw new Error(`Failed to fetch pipelines: ${response.status}`);

        const data = await response.json();

        return (data.pipelines || []).map((p: any) => ({
          id: p.pipeline_id,
          name: p.name || "Unnamed Pipeline",
          jobs: p.job_ids || [],
          createdAt: p.created_at || "N/A",
          status: p.status || "CREATED",
        }));
      };

      // ── Databricks pipelines fetch via /list-pipelines ───────────
      const fetchPipelinesDatabricks = async (): Promise<Pipeline[]> => {
        const response = await fetch(databricksListPipelinesUrl(userId));

        if (!response.ok) throw new Error(`Failed to fetch pipelines: ${response.status}`);

        const data: DatabricksListPipelinesResponse = await response.json();

        return (data.pipelines || []).map((p) => ({
          id: p.pipeline_id,
          name: p.pipeline_name || "Unnamed Pipeline",
          jobs: p.job_ids || [],
          createdAt: p.created_at || "N/A",
          status: p.status || "CREATED",
        }));
      };

      const mapped: Pipeline[] = isDatabricksUser()
        ? await fetchPipelinesDatabricks()
        : await fetchPipelinesDefault();

      setPipelines(mapped);

      const toCache = mapped.map((p) => ({ id: p.id, name: p.name }));
      localStorage.setItem("pipelines", JSON.stringify(toCache));
    } catch (err: any) {
      console.error("Pipelines fetch error:", err);
      setError(err.message || "Could not load pipelines");
      toast.error("Failed to load pipelines from server. Showing cached data.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Load cached pipelines on mount (instant paint while the network call
  // above is still in flight)
  useEffect(() => {
    const cached = localStorage.getItem("pipelines");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        const cachedPipelines: Pipeline[] = parsed.map((p: { id: string; name: string }) => ({
          id: p.id,
          name: p.name,
          jobs: [],
          createdAt: "N/A",
          status: "CREATED",
        }));
        setPipelines(cachedPipelines);
      } catch (e) {
        console.warn("Failed to parse cached pipelines", e);
      }
    }
  }, []);

  // Fetch fresh pipelines + update cache
  useEffect(() => {
    fetchPipelines();
  }, [fetchPipelines]);

  // Called by <Header /> the instant the data platform changes.
  const handlePlatformChange = useCallback(
    (_platform: string) => {
      fetchPipelines();
    },
    [fetchPipelines],
  );

  const fetchPipelineDetails = async (pipelineId: string) => {
    setModalLoading(true);
    try {
      let jobs: Array<{ job_id: string; job_name: string; job_status?: string }>;

      if (isDatabricksUser()) {
        // Databricks users call /view-pipeline, whose jobs already
        // include job_status/last_run per job.
        const res = await fetch(databricksViewPipelineUrl(userId, pipelineId));

        if (!res.ok) throw new Error(`Failed to fetch pipeline details: ${res.status}`);

        const data: DatabricksViewPipelineResponse = await res.json();

        jobs = (data.jobs || []).map((j) => ({
          job_id: j.job_id,
          job_name: j.job_name,
          job_status: j.job_status,
        }));
      } else {
        // Default (non-Databricks) flow
        const res = await fetch(
          `${API_BASE}/view-pipeline?user_id=${userId}&pipeline_id=${pipelineId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!res.ok) throw new Error(`Failed to fetch pipeline details: ${res.status}`);

        const data = await res.json();
        jobs = data.jobs || [];
      }

      setSelectedPipeline(prev => ({
        ...prev!,
        jobDetails: jobs,
      }));

      setPipelines(prev =>
        prev.map(p =>
          p.id === pipelineId ? { ...p, jobDetails: jobs } : p
        )
      );
    } catch (err) {
      console.error("Failed to load pipeline details:", err);
      toast.error("Could not load job names");
    } finally {
      setModalLoading(false);
    }
  };

  const viewPipelineJobs = (pipeline: Pipeline) => {
    setSelectedPipeline(pipeline);
    setShowJobsModal(true);

    if (!pipeline.jobDetails || pipeline.jobDetails.length === 0) {
      fetchPipelineDetails(pipeline.id);
    }
  };

  // Opens the Job Details dialog by fetching from the view-job endpoint
  const openJobDetailDialog = async (jobId: string, jobName?: string) => {
    if (!userId) {
      toast.error("User ID not found. Please login again.");
      return;
    }

    setJobDetailLoading(true);
    setSelectedJobDetail(null);
    setShowJobDetailDialog(true);

    try {
      let data: DetailedJobResponse;

      if (isDatabricksUser()) {
        // Databricks users call /view-job, whose response shape is
        // mapped onto DetailedJobResponse so the dialog below is unchanged.
        const response = await fetch(databricksViewJobUrl(userId, jobId));

        if (!response.ok) {
          throw new Error(`Failed to fetch job details: ${response.status}`);
        }

        const raw: DatabricksViewJobResponse = await response.json();
        data = mapDatabricksJobDetails(raw, jobName || "Unnamed Job");
      } else {
        // Default (non-Databricks) flow
        const response = await fetch(`${API_BASE}/view-job?user_id=${userId}&job_id=${jobId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch job details: ${response.status}`);
        }

        data = await response.json();
      }

      setSelectedJobDetail(data);
    } catch (error) {
      console.error("Error fetching job details:", error);
      toast.error("Failed to load job details");
      setSelectedJobDetail(null);
    } finally {
      setJobDetailLoading(false);
    }
  };

  const filteredPipelines = pipelines.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const deletePipeline = async (pipelineId: string, pipelineName: string) => {
    if (!confirm(`Are you sure you want to delete pipeline "${pipelineName}"?`)) return;

    try {
      const url = `${API_BASE}/delete-pipeline?user_id=${userId}&pipeline_id=${pipelineId}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Delete failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();

      if (result.status === "success") {
        toast.success(result.message || `Pipeline "${pipelineName}" deleted`);
        setPipelines(prev => prev.filter(p => p.id !== pipelineId));

        const cached = localStorage.getItem("pipelines");
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            const updated = parsed.filter((p: any) => p.id !== pipelineId);
            localStorage.setItem("pipelines", JSON.stringify(updated));
          } catch {}
        }
      } else {
        throw new Error(result.message || "Delete failed");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete pipeline");
    }
  };

  const runPipeline = async (pipelineId: string) => {
    if (runningPipelines.has(pipelineId)) {
      toast.info("Pipeline is already running");
      return;
    }

    setRunningPipelines(prev => new Set([...prev, pipelineId]));
    setPipelines(prev =>
      prev.map(p => (p.id === pipelineId ? { ...p, status: "Running" } : p))
    );

    toast.info("Starting pipeline...");

    if (isDatabricksUser()) {
      // Databricks run-pipeline is synchronous — it runs every job
      // in the pipeline sequentially server-side and only returns once
      // they're all done (roughly 30s * job count), so no client-side
      // polling loop is needed here, unlike the default flow below.
      try {
        const runRes = await fetch(DATABRICKS_RUN_PIPELINE_URL, {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ user_id: userId, pipeline_id: pipelineId }),
        });

        if (!runRes.ok) {
          const txt = await runRes.text();
          throw new Error(`Run request failed: ${runRes.status} - ${txt}`);
        }

        const result: DatabricksRunPipelineResponse = await runRes.json();
        const finalStatus = result.status || "UNKNOWN";

        setPipelines(prev =>
          prev.map(p => (p.id === pipelineId ? { ...p, status: finalStatus } : p))
        );

        if (finalStatus.toUpperCase() === "SUCCESS") {
          toast.success("Pipeline finished successfully");
        } else if (finalStatus.toUpperCase().includes("FAIL")) {
          toast.error("Pipeline failed – check job details");
        } else {
          toast.warning(`Pipeline finished with status: ${finalStatus}`, { duration: 8000 });
        }
      } catch (err: any) {
        console.error("Pipeline run error:", err);
        toast.error(err.message || "Failed to run pipeline");
        setPipelines(prev =>
          prev.map(p => (p.id === pipelineId ? { ...p, status: "Failed" } : p))
        );
      } finally {
        setRunningPipelines(prev => {
          const next = new Set(prev);
          next.delete(pipelineId);
          return next;
        });
      }

      return;
    }

    // Default (non-Databricks) flow — async + polling
    try {
      const runRes = await fetch(`${API_BASE}/run-pipeline`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id: userId, pipeline_id: pipelineId }),
      });

      if (!runRes.ok) {
        const txt = await runRes.text();
        throw new Error(`Run request failed: ${runRes.status} - ${txt}`);
      }

      const runResult = await runRes.json();

      const startedSuccessfully =
        runResult.message?.toLowerCase().includes("started") ||
        ["QUEUED", "RUNNING", "PENDING", "SUCCESS"].includes((runResult.status || "").toUpperCase());

      if (!startedSuccessfully) {
        throw new Error(runResult.message || "Could not start pipeline");
      }

      const startTime = Date.now();
      const MAX_POLL_MS = 90000;
      const POLL_INTERVAL_MS = 3000;

      let finalStatus = "Running";

      while (Date.now() - startTime < MAX_POLL_MS) {
        await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));

        try {
          const statusRes = await fetch(
            `${API_BASE}/get-pipeline-status?user_id=${userId}&pipeline_id=${pipelineId}`,
            { headers: { "Content-Type": "application/json" } }
          );

          if (!statusRes.ok) continue;

          const data = await statusRes.json();

          const apiStatus = (data.status || "UNKNOWN").trim();
          const total     = Number(data.jobs_total ?? 0);
          const succeeded = Number(data.jobs_succeeded ?? 0);
          const failed    = Number(data.jobs_failed ?? 0);

          if (total > 0 && (succeeded > 0 || failed > 0)) {
            toast.info(`Progress: ${succeeded}/${total} (${failed} failed)`, {
              id: `progress-${pipelineId}`,
              duration: 4000,
            });
          }

          if (
            apiStatus.toUpperCase() === "SUCCESS" ||
            (total > 0 && succeeded === total && failed === 0)
          ) {
            finalStatus = apiStatus;
            break;
          }

          if (apiStatus.toUpperCase() === "FAILED" || failed > 0) {
            finalStatus = apiStatus;
            break;
          }

          finalStatus = apiStatus || "Running";

        } catch (err) {
          console.warn("Status poll failed (will retry):", err);
        }
      }

      setPipelines(prev =>
        prev.map(p =>
          p.id === pipelineId ? { ...p, status: finalStatus } : p
        )
      );

      if (finalStatus.toUpperCase() === "SUCCESS") {
        toast.success("Pipeline finished successfully");
      } else if (finalStatus.toUpperCase() === "FAILED" || finalStatus.toUpperCase().includes("FAIL")) {
        toast.error("Pipeline failed – check job details");
      } else {
        toast.warning("Polling timeout – check status manually", { duration: 8000 });
      }
    } catch (err: any) {
      console.error("Pipeline run error:", err);
      toast.error(err.message || "Failed to run pipeline");
      setPipelines(prev =>
        prev.map(p => (p.id === pipelineId ? { ...p, status: "Failed" } : p))
      );
    } finally {
      setRunningPipelines(prev => {
        const next = new Set(prev);
        next.delete(pipelineId);
        return next;
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const upper = status.toUpperCase();

    const styles: Record<string, string> = {
      SUCCESS: "bg-green-500/20 text-green-600 border-green-500/30",
      FAILED:  "bg-red-500/20 text-red-600 border-red-500/30",
      RUNNING: "bg-blue-500/20 text-blue-600 border-blue-500/30",
      QUEUED:  "bg-yellow-500/20 text-yellow-600 border-yellow-500/30",
      PENDING: "bg-orange-500/20 text-orange-600 border-orange-500/30",
      CREATED: "bg-purple-500/20 text-purple-600 border-purple-500/30",
    };

    const styleClass = styles[upper] || "bg-gray-500/20 text-gray-600 border-gray-500/30";

    return <Badge className={styleClass}>{status}</Badge>;
  };

  const getStepBadge = (status: "skipped" | "executed") => {
    if (status === "executed") {
      return <Badge className="bg-primary/20 text-primary border-primary/30">executed</Badge>;
    }
    return <Badge variant="secondary">skipped</Badge>;
  };

  const getS3Path = (paths: any[] = []) => {
    return (
      paths.find((path) => typeof path === "string" && path.startsWith("s3://")) || "N/A"
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
        })}`
      );
    }
    return parts.join(" • ") || "N/A";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onDataPlatformChange={handlePlatformChange} />

      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold">
              All Pipelines {loading ? "" : `(${filteredPipelines.length})`}
            </h2>
            <p className="text-muted-foreground">View and manage your pipelines</p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 min-w-[220px] sm:min-w-[280px] md:min-w-[340px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search pipelines..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button onClick={() => navigate("/create-pipeline")} className="whitespace-nowrap">
              Create Pipeline
            </Button>
          </div>
        </div>

        {loading && (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Loading pipelines...</p>
          </Card>
        )}

        {error && !loading && (
          <Card className="p-6 border-destructive">
            <p className="text-destructive">{error}</p>
            <Button variant="outline" className="mt-4" onClick={() => fetchPipelines()}>
              Retry
            </Button>
          </Card>
        )}

        {!loading && !error && (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 font-medium text-muted-foreground">Pipeline Name</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Jobs</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Created At</th>
                    <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-center p-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPipelines.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No pipelines found
                      </td>
                    </tr>
                  ) : (
                    filteredPipelines.map(pipeline => (
                      <tr
                        key={pipeline.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30"
                      >
                        <td className="p-4 font-medium">{pipeline.name}</td>
                        <td className="p-4">
                          <Badge variant="secondary" className="rounded-full">
                            {pipeline.jobs.length}
                          </Badge>
                        </td>
                        <td className="p-4 text-muted-foreground">
                          {new Date(pipeline.createdAt).toLocaleString()}
                        </td>
                        <td className="p-4">{getStatusBadge(pipeline.status)}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="icon"
                              className={`h-8 w-8 ${runningPipelines.has(pipeline.id) ? "bg-yellow-600 hover:bg-yellow-700" : "bg-primary hover:bg-primary/90"}`}
                              onClick={() => runPipeline(pipeline.id)}
                              disabled={runningPipelines.has(pipeline.id)}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => viewPipelineJobs(pipeline)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => navigate(`/edit-pipeline/${pipeline.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => deletePipeline(pipeline.id, pipeline.name)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </main>

      {/* Pipeline Jobs Modal */}
      {showJobsModal && selectedPipeline && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowJobsModal(false)}
        >
          <Card
            className="w-full max-w-md bg-background border border-border"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{selectedPipeline.name} – Jobs</h3>
                  <p className="text-sm text-muted-foreground">View all jobs in this pipeline</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setShowJobsModal(false)}>
                  <span className="text-xl">×</span>
                </Button>
              </div>

              {modalLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading job details...</p>
              ) : (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto">
                  {!selectedPipeline.jobDetails || selectedPipeline.jobDetails.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6">
                      No jobs found in this pipeline
                    </p>
                  ) : (
                    selectedPipeline.jobDetails.map((job, index) => (
                      <Card
                        key={job.job_id}
                        className="p-4 flex items-center justify-between border-l-4 border-l-primary"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{job.job_name || "Unnamed Job"}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                              ID: {job.job_id}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Status: {job.job_status || "Created"}
                            </p>
                          </div>
                        </div>
                        {/* Eye button opens the Job Details dialog */}
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => {
                            setShowJobsModal(false);
                            openJobDetailDialog(job.job_id, job.job_name);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Card>
                    ))
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* Job Details Dialog */}
      <Dialog open={showJobDetailDialog} onOpenChange={setShowJobDetailDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="flex flex-row items-center justify-between pb-4">
            <DialogTitle className="text-2xl font-bold">
              Job Details - {selectedJobDetail?.job_name || "Loading..."}
            </DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </DialogClose>
          </DialogHeader>

          {jobDetailLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading job details...</p>
            </div>
          ) : selectedJobDetail ? (
            <>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Settings className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Job Name</p>
                    <p className="font-medium">{selectedJobDetail.job_name || "N/A"}</p>
                  </div>
                </Card>
                <Card className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Database className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data Source</p>
                    <p className="font-medium">{getS3Path(selectedJobDetail.datasource_paths)}</p>
                  </div>
                </Card>
              </div>

              <Card className="p-6 mb-6">
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-4">Job Information</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Job Name:</p>
                        <p className="font-medium">{selectedJobDetail.job_name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Created At:</p>
                        <p className="font-medium">
                          {new Date(selectedJobDetail.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Data Source:</p>
                        <p className="font-medium">{getS3Path(selectedJobDetail.datasource_paths)}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Execution Details</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Overall Status:</p>
                        <Badge variant="outline">{selectedJobDetail.overall_job_status || "N/A"}</Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Run:</p>
                        <p className="font-medium">
                          {selectedJobDetail.overall_last_job_run
                            ? new Date(selectedJobDetail.overall_last_job_run).toLocaleString("en-US", {
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
                        <p className="text-sm text-muted-foreground">Schedule:</p>
                        <p className="font-medium">{formatSchedule(selectedJobDetail.schedule)}</p>
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
                  {getStepBadge(selectedJobDetail.dq_enabled ? "executed" : "skipped")}
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
                  {getStepBadge(selectedJobDetail.ner_enabled ? "executed" : "skipped")}
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
                  {getStepBadge(selectedJobDetail.business_logic_enabled ? "executed" : "skipped")}
                </Card>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">No job details available</div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Pipelines;