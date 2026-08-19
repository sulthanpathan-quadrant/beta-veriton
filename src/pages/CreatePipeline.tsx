// import { useState, useEffect, useRef, useCallback } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { X, Search, Plus, Settings, Edit } from "lucide-react";
// import { toast } from "sonner";
 
// interface Job {
//   id: string;
//   name: string;
//   category: string;
//   stages: number;
//   steps: {
//     dqRules: "skipped" | "executed";
//     ner: "skipped" | "executed";
//     businessLogic: "skipped" | "executed";
//     dataTransformations: "skipped" | "executed";
//   };
// }
 
// interface CanvasJob extends Job {
//   x: number;
//   y: number;
// }
 
// interface Connection {
//   from: string;
//   to: string;
// }
 
// const API_BASE = "https://api.veriton.ai/api/service2";
 
// const CreatePipeline = () => {
//   const navigate = useNavigate();
//   const { id } = useParams<{ id: string }>();
//   const isEditing = !!id;
//   const canvasRef = useRef<HTMLDivElement>(null);
 
//   const [pipelineName, setPipelineName] = useState("");
//   const [searchQuery, setSearchQuery] = useState("");
//   const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
//   const [canvasJobs, setCanvasJobs] = useState<CanvasJob[]>([]);
//   const [connections, setConnections] = useState<Connection[]>([]);
//   const [snapToGrid, setSnapToGrid] = useState(true);
//   const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
//   const [draggingJob, setDraggingJob] = useState<string | null>(null);
//   const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
//   const [loadingJobs, setLoadingJobs] = useState(true);
//   const [loadingPipeline, setLoadingPipeline] = useState(isEditing);
 
//   const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}") : {};
//   const userId = user?.id || user?.user_id || "661ff9b1-6f16-4276-a393-bb13aec8f9a4";
 
//   // Helper to safely convert boolean flags to step status
//   const toStepStatus = (enabled: boolean | undefined): "skipped" | "executed" =>
//     enabled === true ? "executed" : "skipped";
 
//   // Fetch ALL available jobs (sidebar)
//   useEffect(() => {
//     const fetchAvailableJobs = async () => {
//       setLoadingJobs(true);
//       try {
//         const response = await fetch(
//           `https://api.veriton.ai/api/service1/get-all-jobs?user_id=${userId}`,
//           { method: "GET", headers: { "Content-Type": "application/json" } }
//         );
 
//         if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.status}`);
 
//         const data = await response.json();
 
//         const jobs: Job[] = (data.jobs || []).map((j: any) => ({
//           id: j.job_id,
//           name: j.job_name || "Unnamed Job",
//           category: "Unknown",
//           stages: 4,
//           steps: {
//             dqRules: "skipped",
//             ner: "skipped",
//             businessLogic: "skipped",
//             dataTransformations: "skipped",
//           },
//         }));
 
//         setAvailableJobs(jobs);
//       } catch (err: any) {
//         console.error("Failed to fetch available jobs:", err);
//         toast.error("Could not load available jobs");
//       } finally {
//         setLoadingJobs(false);
//       }
//     };
 
//     fetchAvailableJobs();
//   }, [userId]);
 
//   // Add job to canvas with real status
//   const addJobToCanvas = async (job: Job) => {
//     if (canvasJobs.find((j) => j.id === job.id)) {
//       toast.error("Job already added to canvas");
//       return;
//     }
 
//     try {
//       const res = await fetch(`${API_BASE}/view-job?user_id=${userId}&job_id=${job.id}`);
 
//       if (!res.ok) throw new Error("Failed to fetch job details");
 
//       const data = await res.json();
 
//       const realSteps = {
//         dqRules: toStepStatus(data.dq_enabled),
//         ner: toStepStatus(data.ner_enabled),
//         businessLogic: toStepStatus(data.business_logic_enabled),
//         dataTransformations: "skipped" as const, // adjust if your API supports it later
//       };
 
//       const newCanvasJob: CanvasJob = {
//         ...job,
//         steps: realSteps,
//         x: 60 + (canvasJobs.length % 2) * 400,
//         y: 60 + Math.floor(canvasJobs.length / 2) * 300,
//       };
 
//       setCanvasJobs((prev) => [...prev, newCanvasJob]);
//       toast.success(`Added ${job.name}`);
//     } catch (err) {
//       console.error("Failed to fetch job status:", err);
 
//       // Fallback with default skipped status
//       const newCanvasJob: CanvasJob = {
//         ...job,
//         x: 60 + (canvasJobs.length % 2) * 400,
//         y: 60 + Math.floor(canvasJobs.length / 2) * 300,
//       };
 
//       setCanvasJobs((prev) => [...prev, newCanvasJob]);
//       toast.error("Could not fetch real status. Added with default status.");
//     }
//   };
 
//   // Load pipeline when editing
//   useEffect(() => {
//     if (!isEditing) {
//       setLoadingPipeline(false);
//       return;
//     }
 
//     const fetchPipelineDetails = async () => {
//       setLoadingPipeline(true);
//       try {
//         const response = await fetch(
//           `${API_BASE}/view-pipeline?user_id=${userId}&pipeline_id=${id}`,
//           { method: "GET", headers: { "Content-Type": "application/json" } }
//         );
 
//         if (!response.ok) throw new Error(`Failed to fetch pipeline: ${response.status}`);
 
//         const data = await response.json();
 
//         setPipelineName(data.pipeline_name || "Unnamed Pipeline");
 
//         const pipelineJobs: CanvasJob[] = (data.jobs || []).map((j: any, index: number) => ({
//           id: j.job_id,
//           name: j.job_name || "Unnamed Job",
//           category: "Unknown",
//           stages: 4,
//           steps: {
//             dqRules: "skipped",
//             ner: "skipped",
//             businessLogic: "skipped",
//             dataTransformations: "skipped",
//           },
//           x: 60 + (index % 2) * 400,
//           y: 60 + Math.floor(index / 2) * 300,
//         }));
 
//         setCanvasJobs(pipelineJobs);
//       } catch (err: any) {
//         console.error("Failed to load pipeline:", err);
//         toast.error("Could not load pipeline details for editing");
//       } finally {
//         setLoadingPipeline(false);
//       }
//     };
 
//     fetchPipelineDetails();
//   }, [isEditing, id, userId]);
 
//   const filteredJobs = availableJobs.filter((job) =>
//     job.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );
 
//   const snapPosition = (value: number) => {
//     if (!snapToGrid) return value;
//     const gridSize = 20;
//     return Math.round(value / gridSize) * gridSize;
//   };
 
//   const removeJobFromCanvas = (jobId: string) => {
//     setCanvasJobs((prev) => prev.filter((j) => j.id !== jobId));
//     setConnections((prev) =>
//       prev.filter((c) => c.from !== jobId && c.to !== jobId)
//     );
//   };
 
//   const clearCanvas = () => {
//     setCanvasJobs([]);
//     setConnections([]);
//   };
 
//   const handleMouseDown = (e: React.MouseEvent, jobId: string) => {
//     const job = canvasJobs.find((j) => j.id === jobId);
//     if (!job) return;
 
//     setDraggingJob(jobId);
//     setDragOffset({
//       x: e.clientX - job.x,
//       y: e.clientY - job.y,
//     });
//   };
 
//   const handleMouseMove = useCallback(
//     (e: MouseEvent) => {
//       if (!draggingJob || !canvasRef.current) return;
 
//       const canvasRect = canvasRef.current.getBoundingClientRect();
//       const newX = snapPosition(
//         e.clientX - canvasRect.left - dragOffset.x + canvasRef.current.scrollLeft
//       );
//       const newY = snapPosition(
//         e.clientY - canvasRect.top - dragOffset.y + canvasRef.current.scrollTop
//       );
 
//       setCanvasJobs((prev) =>
//         prev.map((j) =>
//           j.id === draggingJob
//             ? { ...j, x: Math.max(0, newX), y: Math.max(0, newY) }
//             : j
//         )
//       );
//     },
//     [draggingJob, dragOffset, snapToGrid]
//   );
 
//   const handleMouseUp = useCallback(() => {
//     setDraggingJob(null);
//   }, []);
 
//   useEffect(() => {
//     if (draggingJob) {
//       window.addEventListener("mousemove", handleMouseMove);
//       window.addEventListener("mouseup", handleMouseUp);
//       return () => {
//         window.removeEventListener("mousemove", handleMouseMove);
//         window.removeEventListener("mouseup", handleMouseUp);
//       };
//     }
//   }, [draggingJob, handleMouseMove, handleMouseUp]);
 
//   const handleConnectionStart = (jobId: string) => {
//     if (connectingFrom === null) {
//       setConnectingFrom(jobId);
//     } else if (connectingFrom !== jobId) {
//       const existing = connections.find(
//         (c) => (c.from === connectingFrom && c.to === jobId) || (c.from === jobId && c.to === connectingFrom)
//       );
//       if (!existing) {
//         setConnections((prev) => [...prev, { from: connectingFrom, to: jobId }]);
//       }
//       setConnectingFrom(null);
//     } else {
//       setConnectingFrom(null);
//     }
//   };
 
//   const savePipeline = async () => {
//     if (!pipelineName.trim()) {
//       toast.error("Please enter a pipeline name");
//       return;
//     }
//     if (canvasJobs.length === 0) {
//       toast.error("Please add at least one job to the pipeline");
//       return;
//     }
 
//     const payload = {
//       user_id: userId,
//       pipeline_name: pipelineName.trim(),
//       job_ids: canvasJobs.map((j) => j.id),
//       description: "",
//     };
 
//     const endpoint = isEditing
//       ? `${API_BASE}/edit-pipeline`
//       : `${API_BASE}/create-pipeline`;
 
//     try {
//       const response = await fetch(endpoint, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(isEditing ? { ...payload, pipeline_id: id } : payload),
//       });
 
//       if (!response.ok) {
//         const errorText = await response.text();
//         throw new Error(`Save failed: ${response.status} - ${errorText}`);
//       }
 
//       const result = await response.json();
 
//       if (result.status === "success") {
//         toast.success(result.message || (isEditing ? "Pipeline updated" : "Pipeline created"));
//         navigate("/pipelines");
//       } else {
//         throw new Error(result.message || "Operation failed");
//       }
//     } catch (err: any) {
//       console.error("Pipeline save error:", err);
//       toast.error(err.message || "Could not save pipeline");
//     }
//   };
 
//   const getStepStatus = (status: "skipped" | "executed") => {
//     return status === "executed" ? (
//       <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/30">
//         executed
//       </Badge>
//     ) : (
//       <Badge variant="outline" className="text-xs">
//         skipped
//       </Badge>
//     );
//   };
 
//   return (
//     <div className="fixed inset-0 bg-background z-50 flex flex-col">
//       {/* Header */}
//       <div className="border-b border-border p-4 flex items-center justify-between bg-background">
//         <div className="flex items-center gap-4">
//           <h2 className="font-bold text-lg">{isEditing ? "Edit Pipeline" : "New Pipeline"}</h2>
//           <Input
//             value={pipelineName}
//             onChange={(e) => setPipelineName(e.target.value)}
//             placeholder="Enter pipeline name"
//             className="w-56 bg-muted/30 border-border"
//             disabled={loadingPipeline}
//           />
//         </div>
//         <div className="flex items-center gap-4">
//           <Button variant="link1" onClick={clearCanvas} disabled={loadingPipeline}>
//             Clear Canvas
//           </Button>
//           <Button variant="ghost" size="icon" onClick={() => navigate("/pipelines")}>
//             <X className="w-5 h-5" />
//           </Button>
//         </div>
//       </div>
 
//       <div className="flex-1 flex overflow-hidden">
//         {/* Sidebar - Available Jobs */}
//         <div className="w-72 border-r border-border p-4 overflow-y-auto bg-background">
//           <h3 className="font-semibold mb-4">
//             Available Jobs {loadingJobs ? "(loading...)" : `(${filteredJobs.length})`}
//           </h3>
//           <div className="relative mb-4">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//             <Input
//               placeholder="Search jobs..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="pl-10"
//               disabled={loadingJobs || loadingPipeline}
//             />
//           </div>
 
//           <div className="space-y-2">
//             {loadingJobs || loadingPipeline ? (
//               <div className="text-center py-10 text-muted-foreground">
//                 {loadingPipeline ? "Loading pipeline..." : "Loading jobs..."}
//               </div>
//             ) : filteredJobs.length === 0 ? (
//               <div className="text-center py-10 text-muted-foreground">No jobs found</div>
//             ) : (
//               filteredJobs.map((job) => {
//                 const isAlreadyAdded = canvasJobs.some((j) => j.id === job.id);
 
//                 return (
//                   <Card
//                     key={job.id}
//                     className={`p-3 hover:bg-muted/50 transition-colors border-l-4 border-l-primary flex items-center justify-between gap-3 group ${
//                       isAlreadyAdded ? "opacity-60" : ""
//                     }`}
//                   >
//                     <div className="flex-1 min-w-0">
//                       <p className="font-medium text-sm truncate">{job.name}</p>
//                       {/* <p className="text-xs text-muted-foreground">{job.category}</p> */}
//                       <Badge variant="secondary" className="mt-1 text-xs inline-block">
//                         {job.stages} stages
//                       </Badge>
//                     </div>
 
//                     <button
//                       type="button"
//                       onClick={() => !isAlreadyAdded && addJobToCanvas(job)}
//                       disabled={isAlreadyAdded}
//                       className={`flex items-center justify-center h-8 w-8 rounded-md ${
//                         isAlreadyAdded
//                           ? "opacity-40 cursor-not-allowed text-muted-foreground"
//                           : "text-primary hover:bg-primary/10 group-hover:text-primary/90 transition-colors"
//                       }`}
//                       title={isAlreadyAdded ? "Already added to canvas" : "Add to pipeline"}
//                     >
//                       <Plus className="h-5 w-5" />
//                     </button>
//                   </Card>
//                 );
//               })
//             )}
//           </div>
//         </div>
 
//         {/* Canvas Area */}
//         <div className="flex-1 relative overflow-hidden bg-[#f8f9fb] dark:bg-[#1a1d21]">
//           <div className="absolute top-4 left-4 text-sm font-medium text-foreground z-10">
//             Pipeline Canvas
//           </div>
//           <div className="absolute top-4 right-4 text-sm text-muted-foreground flex items-center gap-1 z-10">
//            <Plus className="w-4 h-4" /> Click jobs from sidebar to add, click blue dots to connect
//           </div>
 
//           <div
//             ref={canvasRef}
//             className="absolute inset-0 overflow-auto"
//             style={{
//               backgroundImage: `
//                 linear-gradient(to right, hsl(220 13% 91% / 0.8) 1px, transparent 1px),
//                 linear-gradient(to bottom, hsl(220 13% 91% / 0.8) 1px, transparent 1px)
//               `,
//               backgroundSize: "20px 20px",
//             }}
//           ></div>
       
//             <div
//   ref={canvasRef}
//   className={`
//     absolute inset-0 overflow-auto
//     bg-[#f8f9fb] dark:bg-[#0f1117]
//     [background-image:linear-gradient(to_right,hsl(220_13%_91%_/_0.8)_1px,transparent_1px),linear-gradient(to_bottom,hsl(220_13%_91%_/_0.8)_1px,transparent_1px)]
//     dark:[background-image:linear-gradient(to_right,hsl(220_20%_30%_/_0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(220_20%_30%_/_0.5)_1px,transparent_1px)]
//   `}
//   style={{ backgroundSize: "20px 20px" }}
// >
//             <svg className="absolute inset-0 pointer-events-none" style={{ minWidth: "2000px", minHeight: "1200px" }}>
//               <defs>
//                 <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
//                   <polygon points="0 0, 10 3.5, 0 7" fill="hsl(220, 13%, 69%)" />
//                 </marker>
//               </defs>
//               {connections.map((conn, index) => {
//                 const fromJob = canvasJobs.find((j) => j.id === conn.from);
//                 const toJob = canvasJobs.find((j) => j.id === conn.to);
//                 if (!fromJob || !toJob) return null;
 
//                 const cardWidth = 260;
//                 const cardHeight = 200;
 
//                 const startX = fromJob.x + cardWidth;
//                 const startY = fromJob.y + cardHeight / 2;
//                 const endX = toJob.x;
//                 const endY = toJob.y + cardHeight / 2;
//                 const midX = startX + (endX - startX) / 2;
 
//                 return (
//                   <path
//                     key={`connection-${index}`}
//                     d={`M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`}
//                     stroke="hsl(220, 13%, 69%)"
//                     strokeWidth="2"
//                     fill="none"
//                     markerEnd="url(#arrowhead)"
//                   />
//                 );
//               })}
//             </svg>
 
//             <div className="relative p-8" style={{ minHeight: "1200px", minWidth: "2000px" }}>
//               {canvasJobs.map((job) => (
//                 <Card
//                   key={job.id}
//                   className={`job-card absolute w-[260px] bg-background shadow-md cursor-move select-none ${
//                     connectingFrom === job.id
//                       ? "border-2 border-blue-400 ring-2 ring-blue-200/50"
//                       : "border border-blue-300/50"
//                   }`}
//                   style={{ left: job.x, top: job.y }}
//                   onMouseDown={(e) => handleMouseDown(e, job.id)}
//                 >
//                   {/* Connection Handles */}
//                   <div
//                     className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 border-2 border-white cursor-pointer hover:scale-125 transition-transform z-50 shadow-md"
//                     onMouseDown={(e) => {
//                       e.stopPropagation();
//                       e.preventDefault();
//                     }}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       e.preventDefault();
//                       handleConnectionStart(job.id);
//                     }}
//                   />
//                   <div
//                     className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 border-2 border-white cursor-pointer hover:scale-125 transition-transform z-50 shadow-md"
//                     onMouseDown={(e) => {
//                       e.stopPropagation();
//                       e.preventDefault();
//                     }}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       e.preventDefault();
//                       handleConnectionStart(job.id);
//                     }}
//                   />
 
//                   <div className="p-3 border-b border-border flex items-center justify-between">
//                     <div>
//                       <span className="font-semibold text-sm">{job.name}</span>
//                       <p className="text-xs text-muted-foreground">{job.category}</p>
//                     </div>
//                     <div className="flex items-center gap-1">
//                       <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
//                         <Settings className="w-4 h-4" />
//                       </Button>
//                       <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
//                         <Edit className="w-4 h-4" />
//                       </Button>
//                       <Button
//                         size="icon"
//                         variant="ghost"
//                         className="h-7 w-7"
//                         onClick={(e) => {
//                           e.stopPropagation();
//                           removeJobFromCanvas(job.id);
//                         }}
//                       >
//                         <X className="w-4 h-4" />
//                       </Button>
//                     </div>
//                   </div>
 
//                   <div className="p-3">
//                     <Badge variant="secondary" className="text-xs mb-3">
//                       {job.stages} stages
//                     </Badge>
//                     <div className="text-xs font-medium text-muted-foreground mb-2">STAGES</div>
//                     <div className="space-y-1.5">
//                       <div className="flex justify-between items-center">
//                         <span className="flex items-center gap-2 text-xs">
//                           <Settings className="w-3 h-3 text-muted-foreground" /> DQ Rules
//                         </span>
//                         {getStepStatus(job.steps.dqRules)}
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="flex items-center gap-2 text-xs">
//                           <Settings className="w-3 h-3 text-muted-foreground" /> NER
//                         </span>
//                         {getStepStatus(job.steps.ner)}
//                       </div>
//                       <div className="flex justify-between items-center">
//                         <span className="flex items-center gap-2 text-xs">
//                           <Settings className="w-3 h-3 text-muted-foreground" /> Business Logic
//                         </span>
//                         {getStepStatus(job.steps.businessLogic)}
//                       </div>
//                     </div>
//                     <div className="flex justify-between text-xs text-muted-foreground mt-3 pt-2 border-t border-border">
//                       <span>
//                         In: <span className="text-foreground">data</span>
//                       </span>
//                       <span>
//                         Out: <span className="text-foreground">data</span>
//                       </span>
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         </div>
//       </div>
 
//       {/* Footer */}
//       <div className="border-t border-border p-4 flex justify-end gap-3 bg-background">
//         <Button variant="outline" onClick={() => navigate("/pipelines")} disabled={loadingPipeline}>
//           Cancel
//         </Button>
//         <Button onClick={savePipeline} disabled={loadingPipeline || loadingJobs}>
//           {isEditing ? "Update Pipeline" : "Save Pipeline"}
//         </Button>
//       </div>
//     </div>
//   );
// };
 
// export default CreatePipeline;
 
 

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X, Search, Plus, Settings, Edit } from "lucide-react";
import { toast } from "sonner";
 
interface Job {
  id: string;
  name: string;
  category: string;
  stages: number;
  steps: {
    dqRules: "skipped" | "executed";
    ner: "skipped" | "executed";
    businessLogic: "skipped" | "executed";
    dataTransformations: "skipped" | "executed";
  };
}
 
interface CanvasJob extends Job {
  x: number;
  y: number;
}
 
interface Connection {
  from: string;
  to: string;
}
 
const API_BASE = "https://api.veriton.ai/api/service2";

// ── NEW: Databricks endpoints ────────────────────────────────────────────
const DATABRICKS_API_BASE = "https://api.veriton.ai/api/service-databricks";

const databricksListJobsUrl = (userId: string) =>
  `${DATABRICKS_API_BASE}/list-jobs?user_id=${userId}`;

const databricksViewJobUrl = (userId: string, jobId: string) =>
  `${DATABRICKS_API_BASE}/view-job?user_id=${userId}&job_id=${jobId}`;

const databricksViewPipelineUrl = (userId: string, pipelineId: string) =>
  `${DATABRICKS_API_BASE}/view-pipeline?user_id=${userId}&pipeline_id=${pipelineId}`;

const DATABRICKS_CREATE_PIPELINE_URL = `${DATABRICKS_API_BASE}/create-pipeline`;
const DATABRICKS_EDIT_PIPELINE_URL = `${DATABRICKS_API_BASE}/edit-pipeline`;

/**
 * Reads the "user" object from localStorage and returns true if the user's
 * dataplatform is "Databricks". Same check used across the other workflow
 * pages (Data Quality / NER / Business Logic / Jobs / Pipelines).
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
 
const CreatePipeline = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const canvasRef = useRef<HTMLDivElement>(null);
 
  const [pipelineName, setPipelineName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [canvasJobs, setCanvasJobs] = useState<CanvasJob[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [draggingJob, setDraggingJob] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingPipeline, setLoadingPipeline] = useState(isEditing);
 
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}") : {};
  const userId = user?.id || user?.user_id || "661ff9b1-6f16-4276-a393-bb13aec8f9a4";
 
  // Helper to safely convert boolean flags to step status
  const toStepStatus = (enabled: boolean | undefined): "skipped" | "executed" =>
    enabled === true ? "executed" : "skipped";
 
  // Fetch ALL available jobs (sidebar)
  useEffect(() => {
    const fetchAvailableJobs = async () => {
      setLoadingJobs(true);
      try {
        // ── Existing default (non-Databricks) jobs fetch — unchanged ──────
        const fetchAvailableJobsDefault = async (): Promise<Job[]> => {
          const response = await fetch(
            `https://api.veriton.ai/api/service1/get-all-jobs?user_id=${userId}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
          );

          if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.status}`);

          const data = await response.json();

          return (data.jobs || []).map((j: any) => ({
            id: j.job_id,
            name: j.job_name || "Unnamed Job",
            category: "Unknown",
            stages: 4,
            steps: {
              dqRules: "skipped",
              ner: "skipped",
              businessLogic: "skipped",
              dataTransformations: "skipped",
            },
          }));
        };

        // ── NEW: Databricks jobs fetch via /list-jobs — note this only
        // returns jobs that have been scheduled at least once, unlike
        // service1/get-all-jobs.
        const fetchAvailableJobsDatabricks = async (): Promise<Job[]> => {
          const response = await fetch(databricksListJobsUrl(userId));

          if (!response.ok) throw new Error(`Failed to fetch jobs: ${response.status}`);

          const data = await response.json();

          return (data.jobs || []).map((j: any) => ({
            id: j.job_id,
            name: j.job_name || "Unnamed Job",
            category: "Unknown",
            stages: 4,
            steps: {
              dqRules: "skipped",
              ner: "skipped",
              businessLogic: "skipped",
              dataTransformations: "skipped",
            },
          }));
        };

        const jobs: Job[] = isDatabricksUser()
          ? await fetchAvailableJobsDatabricks()
          : await fetchAvailableJobsDefault();
 
        setAvailableJobs(jobs);
      } catch (err: any) {
        console.error("Failed to fetch available jobs:", err);
        toast.error("Could not load available jobs");
      } finally {
        setLoadingJobs(false);
      }
    };
 
    fetchAvailableJobs();
  }, [userId]);
 
  // Add job to canvas with real status
  const addJobToCanvas = async (job: Job) => {
    if (canvasJobs.find((j) => j.id === job.id)) {
      toast.error("Job already added to canvas");
      return;
    }
 
    try {
      let dqEnabled: boolean | undefined;
      let nerEnabled: boolean | undefined;
      let businessLogicEnabled: boolean | undefined;

      if (isDatabricksUser()) {
        // ── NEW: Databricks /view-job uses dq / ner / business_logic
        // (no "_enabled" suffix), unlike the default flow's response.
        const res = await fetch(databricksViewJobUrl(userId, job.id));

        if (!res.ok) throw new Error("Failed to fetch job details");

        const data = await res.json();

        dqEnabled = data.dq;
        nerEnabled = data.ner;
        businessLogicEnabled = data.business_logic;
      } else {
        // ── Existing default (non-Databricks) flow — unchanged ───────────
        const res = await fetch(`${API_BASE}/view-job?user_id=${userId}&job_id=${job.id}`);

        if (!res.ok) throw new Error("Failed to fetch job details");

        const data = await res.json();

        dqEnabled = data.dq_enabled;
        nerEnabled = data.ner_enabled;
        businessLogicEnabled = data.business_logic_enabled;
      }
 
      const realSteps = {
        dqRules: toStepStatus(dqEnabled),
        ner: toStepStatus(nerEnabled),
        businessLogic: toStepStatus(businessLogicEnabled),
        dataTransformations: "skipped" as const, // adjust if your API supports it later
      };
 
      const newCanvasJob: CanvasJob = {
        ...job,
        steps: realSteps,
        x: 60 + (canvasJobs.length % 2) * 400,
        y: 60 + Math.floor(canvasJobs.length / 2) * 300,
      };
 
      setCanvasJobs((prev) => [...prev, newCanvasJob]);
      toast.success(`Added ${job.name}`);
    } catch (err) {
      console.error("Failed to fetch job status:", err);
 
      // Fallback with default skipped status
      const newCanvasJob: CanvasJob = {
        ...job,
        x: 60 + (canvasJobs.length % 2) * 400,
        y: 60 + Math.floor(canvasJobs.length / 2) * 300,
      };
 
      setCanvasJobs((prev) => [...prev, newCanvasJob]);
      toast.error("Could not fetch real status. Added with default status.");
    }
  };
 
  // Load pipeline when editing
  useEffect(() => {
    if (!isEditing) {
      setLoadingPipeline(false);
      return;
    }
 
    const fetchPipelineDetails = async () => {
      setLoadingPipeline(true);
      try {
        let pipelineNameResult: string;
        let jobsRaw: Array<{ job_id: string; job_name: string }>;

        if (isDatabricksUser()) {
          // ── NEW: Databricks users load the pipeline via /view-pipeline ──
          const response = await fetch(databricksViewPipelineUrl(userId, id!));

          if (!response.ok) throw new Error(`Failed to fetch pipeline: ${response.status}`);

          const data = await response.json();

          pipelineNameResult = data.pipeline_name || "Unnamed Pipeline";
          jobsRaw = data.jobs || [];
        } else {
          // ── Existing default (non-Databricks) flow — unchanged ─────────
          const response = await fetch(
            `${API_BASE}/view-pipeline?user_id=${userId}&pipeline_id=${id}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
          );

          if (!response.ok) throw new Error(`Failed to fetch pipeline: ${response.status}`);

          const data = await response.json();

          pipelineNameResult = data.pipeline_name || "Unnamed Pipeline";
          jobsRaw = data.jobs || [];
        }
 
        setPipelineName(pipelineNameResult);
 
        const pipelineJobs: CanvasJob[] = jobsRaw.map((j: any, index: number) => ({
          id: j.job_id,
          name: j.job_name || "Unnamed Job",
          category: "Unknown",
          stages: 4,
          steps: {
            dqRules: "skipped",
            ner: "skipped",
            businessLogic: "skipped",
            dataTransformations: "skipped",
          },
          x: 60 + (index % 2) * 400,
          y: 60 + Math.floor(index / 2) * 300,
        }));
 
        setCanvasJobs(pipelineJobs);
      } catch (err: any) {
        console.error("Failed to load pipeline:", err);
        toast.error("Could not load pipeline details for editing");
      } finally {
        setLoadingPipeline(false);
      }
    };
 
    fetchPipelineDetails();
  }, [isEditing, id, userId]);
 
  const filteredJobs = availableJobs.filter((job) =>
    job.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
 
  const snapPosition = (value: number) => {
    if (!snapToGrid) return value;
    const gridSize = 20;
    return Math.round(value / gridSize) * gridSize;
  };
 
  const removeJobFromCanvas = (jobId: string) => {
    setCanvasJobs((prev) => prev.filter((j) => j.id !== jobId));
    setConnections((prev) =>
      prev.filter((c) => c.from !== jobId && c.to !== jobId)
    );
  };
 
  const clearCanvas = () => {
    setCanvasJobs([]);
    setConnections([]);
  };
 
  const handleMouseDown = (e: React.MouseEvent, jobId: string) => {
    const job = canvasJobs.find((j) => j.id === jobId);
    if (!job) return;
 
    setDraggingJob(jobId);
    setDragOffset({
      x: e.clientX - job.x,
      y: e.clientY - job.y,
    });
  };
 
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!draggingJob || !canvasRef.current) return;
 
      const canvasRect = canvasRef.current.getBoundingClientRect();
      const newX = snapPosition(
        e.clientX - canvasRect.left - dragOffset.x + canvasRef.current.scrollLeft
      );
      const newY = snapPosition(
        e.clientY - canvasRect.top - dragOffset.y + canvasRef.current.scrollTop
      );
 
      setCanvasJobs((prev) =>
        prev.map((j) =>
          j.id === draggingJob
            ? { ...j, x: Math.max(0, newX), y: Math.max(0, newY) }
            : j
        )
      );
    },
    [draggingJob, dragOffset, snapToGrid]
  );
 
  const handleMouseUp = useCallback(() => {
    setDraggingJob(null);
  }, []);
 
  useEffect(() => {
    if (draggingJob) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggingJob, handleMouseMove, handleMouseUp]);
 
  const handleConnectionStart = (jobId: string) => {
    if (connectingFrom === null) {
      setConnectingFrom(jobId);
    } else if (connectingFrom !== jobId) {
      const existing = connections.find(
        (c) => (c.from === connectingFrom && c.to === jobId) || (c.from === jobId && c.to === connectingFrom)
      );
      if (!existing) {
        setConnections((prev) => [...prev, { from: connectingFrom, to: jobId }]);
      }
      setConnectingFrom(null);
    } else {
      setConnectingFrom(null);
    }
  };
 
  const savePipeline = async () => {
    if (!pipelineName.trim()) {
      toast.error("Please enter a pipeline name");
      return;
    }
    if (canvasJobs.length === 0) {
      toast.error("Please add at least one job to the pipeline");
      return;
    }

    if (isDatabricksUser()) {
      // ── NEW: Databricks create-pipeline / edit-pipeline. The request
      // body has no `description` field, and the response is the pipeline
      // object itself (status: "CREATED" on create, "SUCCESS" on edit) —
      // not the default flow's {status: "success", message} shape — so
      // success is determined by the presence of pipeline_id instead.
      const payload: Record<string, any> = {
        user_id: userId,
        pipeline_name: pipelineName.trim(),
        job_ids: canvasJobs.map((j) => j.id),
      };

      if (isEditing) {
        payload.pipeline_id = id;
      }

      const endpoint = isEditing ? DATABRICKS_EDIT_PIPELINE_URL : DATABRICKS_CREATE_PIPELINE_URL;

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Save failed: ${response.status} - ${errorText}`);
        }

        const result = await response.json();

        if (result.pipeline_id) {
          toast.success(
            isEditing
              ? `Pipeline "${result.pipeline_name}" updated`
              : `Pipeline "${result.pipeline_name}" created`,
          );
          navigate("/pipelines");
        } else {
          throw new Error("Unexpected response from server");
        }
      } catch (err: any) {
        console.error("Pipeline save error:", err);
        toast.error(err.message || "Could not save pipeline");
      }

      return;
    }
 
    // ── Existing default (non-Databricks) flow — unchanged ─────────────────
    const payload = {
      user_id: userId,
      pipeline_name: pipelineName.trim(),
      job_ids: canvasJobs.map((j) => j.id),
      description: "",
    };
 
    const endpoint = isEditing
      ? `${API_BASE}/edit-pipeline`
      : `${API_BASE}/create-pipeline`;
 
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isEditing ? { ...payload, pipeline_id: id } : payload),
      });
 
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Save failed: ${response.status} - ${errorText}`);
      }
 
      const result = await response.json();
 
      if (result.status === "success") {
        toast.success(result.message || (isEditing ? "Pipeline updated" : "Pipeline created"));
        navigate("/pipelines");
      } else {
        throw new Error(result.message || "Operation failed");
      }
    } catch (err: any) {
      console.error("Pipeline save error:", err);
      toast.error(err.message || "Could not save pipeline");
    }
  };
 
  const getStepStatus = (status: "skipped" | "executed") => {
    return status === "executed" ? (
      <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-500 border-blue-500/30">
        executed
      </Badge>
    ) : (
      <Badge variant="outline" className="text-xs">
        skipped
      </Badge>
    );
  };
 
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center justify-between bg-background">
        <div className="flex items-center gap-4">
          <h2 className="font-bold text-lg">{isEditing ? "Edit Pipeline" : "New Pipeline"}</h2>
          <Input
            value={pipelineName}
            onChange={(e) => setPipelineName(e.target.value)}
            placeholder="Enter pipeline name"
            className="w-56 bg-muted/30 border-border"
            disabled={loadingPipeline}
          />
        </div>
        <div className="flex items-center gap-4">
          <Button variant="link1" onClick={clearCanvas} disabled={loadingPipeline}>
            Clear Canvas
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate("/pipelines")}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>
 
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Available Jobs */}
        <div className="w-72 border-r border-border p-4 overflow-y-auto bg-background">
          <h3 className="font-semibold mb-4">
            Available Jobs {loadingJobs ? "(loading...)" : `(${filteredJobs.length})`}
          </h3>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              disabled={loadingJobs || loadingPipeline}
            />
          </div>
 
          <div className="space-y-2">
            {loadingJobs || loadingPipeline ? (
              <div className="text-center py-10 text-muted-foreground">
                {loadingPipeline ? "Loading pipeline..." : "Loading jobs..."}
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">No jobs found</div>
            ) : (
              filteredJobs.map((job) => {
                const isAlreadyAdded = canvasJobs.some((j) => j.id === job.id);
 
                return (
                  <Card
                    key={job.id}
                    className={`p-3 hover:bg-muted/50 transition-colors border-l-4 border-l-primary flex items-center justify-between gap-3 group ${
                      isAlreadyAdded ? "opacity-60" : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{job.name}</p>
                      {/* <p className="text-xs text-muted-foreground">{job.category}</p> */}
                      <Badge variant="secondary" className="mt-1 text-xs inline-block">
                        {job.stages} stages
                      </Badge>
                    </div>
 
                    <button
                      type="button"
                      onClick={() => !isAlreadyAdded && addJobToCanvas(job)}
                      disabled={isAlreadyAdded}
                      className={`flex items-center justify-center h-8 w-8 rounded-md ${
                        isAlreadyAdded
                          ? "opacity-40 cursor-not-allowed text-muted-foreground"
                          : "text-primary hover:bg-primary/10 group-hover:text-primary/90 transition-colors"
                      }`}
                      title={isAlreadyAdded ? "Already added to canvas" : "Add to pipeline"}
                    >
                      <Plus className="h-5 w-5" />
                    </button>
                  </Card>
                );
              })
            )}
          </div>
        </div>
 
        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden bg-[#f8f9fb] dark:bg-[#1a1d21]">
          <div className="absolute top-4 left-4 text-sm font-medium text-foreground z-10">
            Pipeline Canvas
          </div>
          <div className="absolute top-4 right-4 text-sm text-muted-foreground flex items-center gap-1 z-10">
           <Plus className="w-4 h-4" /> Click jobs from sidebar to add, click blue dots to connect
          </div>
 
          <div
            ref={canvasRef}
            className="absolute inset-0 overflow-auto"
            style={{
              backgroundImage: `
                linear-gradient(to right, hsl(220 13% 91% / 0.8) 1px, transparent 1px),
                linear-gradient(to bottom, hsl(220 13% 91% / 0.8) 1px, transparent 1px)
              `,
              backgroundSize: "20px 20px",
            }}
          ></div>
       
            <div
  ref={canvasRef}
  className={`
    absolute inset-0 overflow-auto
    bg-[#f8f9fb] dark:bg-[#0f1117]
    [background-image:linear-gradient(to_right,hsl(220_13%_91%_/_0.8)_1px,transparent_1px),linear-gradient(to_bottom,hsl(220_13%_91%_/_0.8)_1px,transparent_1px)]
    dark:[background-image:linear-gradient(to_right,hsl(220_20%_30%_/_0.5)_1px,transparent_1px),linear-gradient(to_bottom,hsl(220_20%_30%_/_0.5)_1px,transparent_1px)]
  `}
  style={{ backgroundSize: "20px 20px" }}
>
            <svg className="absolute inset-0 pointer-events-none" style={{ minWidth: "2000px", minHeight: "1200px" }}>
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="hsl(220, 13%, 69%)" />
                </marker>
              </defs>
              {connections.map((conn, index) => {
                const fromJob = canvasJobs.find((j) => j.id === conn.from);
                const toJob = canvasJobs.find((j) => j.id === conn.to);
                if (!fromJob || !toJob) return null;
 
                const cardWidth = 260;
                const cardHeight = 200;
 
                const startX = fromJob.x + cardWidth;
                const startY = fromJob.y + cardHeight / 2;
                const endX = toJob.x;
                const endY = toJob.y + cardHeight / 2;
                const midX = startX + (endX - startX) / 2;
 
                return (
                  <path
                    key={`connection-${index}`}
                    d={`M ${startX} ${startY} L ${midX} ${startY} L ${midX} ${endY} L ${endX} ${endY}`}
                    stroke="hsl(220, 13%, 69%)"
                    strokeWidth="2"
                    fill="none"
                    markerEnd="url(#arrowhead)"
                  />
                );
              })}
            </svg>
 
            <div className="relative p-8" style={{ minHeight: "1200px", minWidth: "2000px" }}>
              {canvasJobs.map((job) => (
                <Card
                  key={job.id}
                  className={`job-card absolute w-[260px] bg-background shadow-md cursor-move select-none ${
                    connectingFrom === job.id
                      ? "border-2 border-blue-400 ring-2 ring-blue-200/50"
                      : "border border-blue-300/50"
                  }`}
                  style={{ left: job.x, top: job.y }}
                  onMouseDown={(e) => handleMouseDown(e, job.id)}
                >
                  {/* Connection Handles */}
                  <div
                    className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 border-2 border-white cursor-pointer hover:scale-125 transition-transform z-50 shadow-md"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleConnectionStart(job.id);
                    }}
                  />
                  <div
                    className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-blue-500 border-2 border-white cursor-pointer hover:scale-125 transition-transform z-50 shadow-md"
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleConnectionStart(job.id);
                    }}
                  />
 
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-sm">{job.name}</span>
                      <p className="text-xs text-muted-foreground">{job.category}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => e.stopPropagation()}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeJobFromCanvas(job.id);
                        }}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
 
                  <div className="p-3">
                    <Badge variant="secondary" className="text-xs mb-3">
                      {job.stages} stages
                    </Badge>
                    <div className="text-xs font-medium text-muted-foreground mb-2">STAGES</div>
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-xs">
                          <Settings className="w-3 h-3 text-muted-foreground" /> DQ Rules
                        </span>
                        {getStepStatus(job.steps.dqRules)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-xs">
                          <Settings className="w-3 h-3 text-muted-foreground" /> NER
                        </span>
                        {getStepStatus(job.steps.ner)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="flex items-center gap-2 text-xs">
                          <Settings className="w-3 h-3 text-muted-foreground" /> Business Logic
                        </span>
                        {getStepStatus(job.steps.businessLogic)}
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground mt-3 pt-2 border-t border-border">
                      <span>
                        In: <span className="text-foreground">data</span>
                      </span>
                      <span>
                        Out: <span className="text-foreground">data</span>
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
 
      {/* Footer */}
      <div className="border-t border-border p-4 flex justify-end gap-3 bg-background">
        <Button variant="outline" onClick={() => navigate("/pipelines")} disabled={loadingPipeline}>
          Cancel
        </Button>
        <Button onClick={savePipeline} disabled={loadingPipeline || loadingJobs}>
          {isEditing ? "Update Pipeline" : "Save Pipeline"}
        </Button>
      </div>
    </div>
  );
};
 
export default CreatePipeline;