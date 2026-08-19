// import { useState, useEffect, useRef, useMemo } from "react";
// import { WorkflowLayout } from "@/components/WorkflowLayout";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ArrowLeft, Database, Table as TableIcon, Loader2, ArrowRight, X } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { toast } from "sonner";
// import {
//   ReactFlow,
//   Background,
//   Controls,
//   Node,
//   Edge,
//   Position,
//   Handle,
//   NodeProps,
//   ReactFlowProvider,
//   getStraightPath,
//   BaseEdge,
//   EdgeProps,
// } from "@xyflow/react";
// import "@xyflow/react/dist/style.css";

// const MODELING_API = "https://api.veriton.ai/api/service2";

// // ── Types ─────────────────────────────────────────────────────
// interface TableSummary {
//   table_name:   string;
//   entity_name:  string;
//   table_type:   "FACT" | "DIM";
//   row_count:    number;
//   column_count: number;
//   columns?:     string[];
// }

// interface TablePreview {
//   table_name:   string;
//   entity_name:  string;
//   table_type:   "FACT" | "DIM";
//   row_count:    number;
//   column_count: number;
//   columns:      string[];
//   data:         Record<string, any>[];
// }

// interface Relationship {
//   relationship_id:   string;
//   from_table:        string;
//   from_column:       string;
//   to_table:          string;
//   to_column:         string;
//   relationship_type: string;
// }

// // ── NEW: helpers for the Databricks-platform datamodel / preview routes ────

// /**
//  * Reads the "user" object from localStorage and returns true if the user's
//  * dataplatform is "Databricks". This decides whether we call the
//  * Databricks-specific schema/preview APIs instead of the default service2
//  * ones.
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

// const databricksGenerateDatamodelUrl = (userId: string, jobId: string) =>
//   `https://api.veriton.ai/api/service-databricks/datamodel/${userId}/${jobId}`;

// const databricksViewFileUrl = (userId: string, jobId: string, filename: string) =>
//   `https://api.veriton.ai/api/service-databricks/files/view-file?user_id=${userId}&job_id=${jobId}&filename=${encodeURIComponent(filename)}`;

// // ── Read-only Fact Node ───────────────────────────────────────
// function FactNode({ data }: NodeProps) {
//   const { label, columns = [], row_count = 0, onClick } = data as {
//     label: string;
//     columns: string[];
//     row_count: number;
//     onClick: () => void;

//   };

//   return (
//     <div onClick = {onClick} className="border-2 border-cyan-500 rounded-lg p-4 bg-cyan-950/30 w-56 shadow-md relative cursor-pointer hover:ring-2 hover:ring-cyan-400 transition">
//       <Handle type="target" position={Position.Left}  className="!bg-transparent !border-0" />
//       <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
//       <div className="flex items-center justify-between mb-2">
//         <span className="text-sm font-semibold text-foreground truncate">{label}</span>
//         <span className="text-[10px] bg-cyan-600 text-white rounded px-1.5 py-0.5 ml-1 shrink-0">FACT</span>
//       </div>
//       <div className="text-xs text-muted-foreground space-y-0.5 max-h-40 overflow-y-auto">
//         {columns.map((col, i) => (
//           <div key={i} className="px-1 py-0.5 truncate">{col}</div>
//         ))}
//         <div className="text-[10px] text-muted-foreground/60 mt-1 pt-1 border-t border-border">
//           {Number(row_count).toLocaleString()} rows
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Read-only Dim Node ────────────────────────────────────────
// function DimNode({ data }: NodeProps) {
//   const { label, columns = [], row_count = 0, onClick } = data as {
//     label: string;
//     columns: string[];
//     row_count: number;
//     onClick: () => void;
//   };

//   return (
// <div
//   onClick={onClick}
//   className="border border-blue-500 rounded-lg p-4 bg-card/90 w-48 shadow-md relative cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
// >      <Handle type="target" position={Position.Left}  className="!bg-transparent !border-0" />
//       <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
//       <div className="flex items-center justify-between mb-2">
//         <span className="text-sm font-semibold text-foreground truncate">{label}</span>
//         <span className="text-[10px] border border-blue-400 text-blue-400 rounded px-1.5 py-0.5 ml-1 shrink-0">DIM</span>
//       </div>
//       <div className="text-xs text-muted-foreground space-y-0.5 max-h-36 overflow-y-auto">
//         {columns.map((col, i) => (
//           <div key={i} className="px-1 py-0.5 truncate">{col}</div>
//         ))}
//         <div className="text-[10px] text-muted-foreground/60 mt-1 pt-1 border-t border-border">
//           {Number(row_count).toLocaleString()} rows
//         </div>
//       </div>
//     </div>
//   );
// }

// // ── Simple labeled edge ───────────────────────────────────────
// function LabeledEdge({ sourceX, sourceY, targetX, targetY, label, id }: EdgeProps) {
//   const [path, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
//   return (
//     <>
//       <BaseEdge id={id} path={path} style={{ stroke: "hsl(var(--primary))", strokeWidth: 2, strokeDasharray: "6 4" }} />
//       <foreignObject x={labelX - 16} y={labelY - 10} width={32} height={20}>
//         <div className="flex items-center justify-center">
//           <span className="text-[9px] font-semibold bg-background border border-border rounded px-1 text-foreground">
//             {String(label || "M:1")}
//           </span>
//         </div>
//       </foreignObject>
//     </>
//   );
// }

// const nodeTypes = { fact: FactNode, dim: DimNode };
// const edgeTypes = { labeled: LabeledEdge };

// // ── Main Component ────────────────────────────────────────────
// export default function DataPreview() {
//   const navigate   = useNavigate();
//   const previewRef = useRef<HTMLDivElement>(null);

//   const [tables, setTables]                 = useState<TableSummary[]>([]);
//   const [relationships, setRelationships]   = useState<Relationship[]>([]);
//   const [selectedTable, setSelectedTable]   = useState<string | null>(null);
//   const [preview, setPreview]               = useState<TablePreview | null>(null);
//   const [loadingTables, setLoadingTables]   = useState(true);
//   const [loadingPreview, setLoadingPreview] = useState(false);

//   // ── NEW: keep a ref of the latest `tables` so the selectedTable preview
//   // effect can read table metadata (table_type / entity_name) without
//   // having to list `tables` as an effect dependency.
//   const tablesRef = useRef<TableSummary[]>([]);
//   useEffect(() => {
//     tablesRef.current = tables;
//   }, [tables]);

//   const userId = localStorage.getItem("user")
//     ? JSON.parse(localStorage.getItem("user") || "{}").id
//     : null;
//   const jobId = localStorage.getItem("current_job_id");

//   const closeToastButton = (
//     <button
//       onClick={() => toast.dismiss()}
//       className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
//       aria-label="Close toast"
//     >
//       <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
//     </button>
//   );

//   // ── Fetch tables + relationships on mount ─────────────────────
//   // ── NEW: branches to the Databricks datamodel-generation API when the
//   // logged-in user's dataplatform is "Databricks", otherwise keeps the
//   // existing service2 preview/relationships calls.
//   useEffect(() => {
//     if (!userId || !jobId) {
//       toast.error("Missing user or job information", { duration: 3000, action: closeToastButton });
//       setLoadingTables(false);
//       return;
//     }

//     const fetchAllDatabricks = async () => {
//       const response = await fetch(databricksGenerateDatamodelUrl(userId, jobId), {
//         method: "POST",
//         headers: { Accept: "application/json" },
//       });

//       if (!response.ok) {
//         const errText = await response.text();
//         throw new Error(errText || "Failed to generate data model");
//       }

//       const result = await response.json();

//       const rawTables: any[] = result?.result?.tables || [];

//       // NOTE: relationship field names are unconfirmed for the Databricks
//       // route — every sample response we've seen so far has an empty
//       // `relationships` array. Passed through as-is; if a populated example
//       // shows different field names than from_table/from_column/to_table/
//       // to_column/relationship_type/relationship_id, this needs a mapper.
//       const rawRelationships: Relationship[] = result?.result?.relationships || [];

//       const enrichedTables: TableSummary[] = rawTables.map((t) => {
//         const columns: string[] = (t.columns || []).map(
//           (c: any) => c.column_name ?? c.name,
//         );

//         return {
//           table_name: t.table_name,
//           entity_name: t.table_name, // Databricks response has no separate entity_name
//           table_type: t.table_type,
//           row_count: t.row_count ?? 0, // not returned by /datamodel — filled in once a table is opened
//           column_count: columns.length,
//           columns,
//         };
//       });

//       setTables(enrichedTables);
//       setRelationships(rawRelationships);

//       const fact = enrichedTables.find((t) => t.table_type === "FACT");
//       const firstTable = fact || enrichedTables[0];

//       if (firstTable) {
//         // Preview data for this table is fetched by the selectedTable effect
//         // below via /files/view-file, since /datamodel doesn't return rows.
//         setSelectedTable(firstTable.table_name);
//       }
//     };

//     const fetchAllDefault = async () => {
//       // 1. Fetch tables + relationships in parallel
//       const [tablesRes, relsRes] = await Promise.all([
//         fetch(`${MODELING_API}/api/preview/tables?user_id=${userId}&job_id=${jobId}`),
//         fetch(`${MODELING_API}/api/relationships/${userId}/${jobId}`)
//       ]);

//       if (!tablesRes.ok) throw new Error("Preview metadata not found. Run materialization first.");
//       const tablesData = await tablesRes.json();
//       const allTables: TableSummary[] = tablesData.tables || [];

//       if (relsRes.ok) {
//         const relsData = await relsRes.json();
//         setRelationships(relsData.relationships || []);
//       }

//       // 2. Fetch all individual previews in parallel to get columns
//       const previewResults = await Promise.allSettled(
//         allTables.map(t =>
//           fetch(`${MODELING_API}/api/preview/table?user_id=${userId}&job_id=${jobId}&table_name=${encodeURIComponent(t.table_name)}`)
//             .then(r => r.ok ? r.json() : null)
//         )
//       );

//       // 3. Enrich tables with columns from preview files
//       const enrichedTables = allTables.map((t, i) => {
//         const result = previewResults[i];
//         const previewData = result.status === 'fulfilled' ? result.value : null;
//         return { ...t, columns: previewData?.columns || [] };
//       });
//       setTables(enrichedTables);

//       // 4. Auto-select fact table first, set preview directly (no double fetch)
//       const fact = enrichedTables.find(t => t.table_type === "FACT");
//       const firstTable = fact || enrichedTables[0];
//       if (firstTable) {
//         setSelectedTable(firstTable.table_name);
//         // Set preview directly from already-fetched data
//         const firstIdx = enrichedTables.indexOf(firstTable);
//         const firstResult = previewResults[firstIdx];
//         if (firstResult.status === 'fulfilled' && firstResult.value) {
//           setPreview(firstResult.value);
//         }
//       }
//     };

//     const fetchAll = async () => {
//       setLoadingTables(true);
//       try {
//         if (isDatabricksUser()) {
//           await fetchAllDatabricks();
//         } else {
//           await fetchAllDefault();
//         }
//       } catch (err: any) {
//         toast.error(err.message || "Failed to load tables", { duration: 4000, action: closeToastButton });
//       } finally {
//         setLoadingTables(false);
//       }
//     };

//     fetchAll();
//   }, [userId, jobId]);

//   // ── Scroll to preview when table selected ────────────────────
//  useEffect(() => {
//   if (preview && previewRef.current) {
//     previewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
//   }
// }, [preview]);
  

//   // ── Fetch individual table preview ───────────────────────────
//   // ── NEW: branches to the Databricks view-file API when applicable.
//   useEffect(() => {
//     if (!selectedTable || !userId || !jobId) return;

//     const fetchPreviewDatabricks = async () => {
//       const res = await fetch(databricksViewFileUrl(userId, jobId, selectedTable));
//       if (!res.ok) throw new Error("Preview not found for this table.");
//       const data = await res.json();

//       // NOTE: the real response shape of /files/view-file wasn't confirmed
//       // when this was wired up — assumed to mirror /files/preview-data's
//       // `{ rows: [...] }` shape, with a fallback to a `data` key. If the
//       // actual response looks different, adjust this block.
//       const rows: Record<string, any>[] = data.rows || data.data || [];
//       const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
//       const tableMeta = tablesRef.current.find(t => t.table_name === selectedTable);

//       setPreview({
//         table_name: selectedTable,
//         entity_name: tableMeta?.entity_name || selectedTable,
//         table_type: (tableMeta?.table_type as "FACT" | "DIM") || "DIM",
//         row_count: rows.length,
//         column_count: columns.length,
//         columns,
//         data: rows,
//       });
//     };

//     const fetchPreviewDefault = async () => {
//       const res = await fetch(
//         `${MODELING_API}/api/preview/table?user_id=${userId}&job_id=${jobId}&table_name=${encodeURIComponent(selectedTable)}`
//       );
//       if (!res.ok) throw new Error("Preview not found for this table.");
//       const data: TablePreview = await res.json();
//       setPreview(data);
//     };

//     const fetchPreview = async () => {
//       setLoadingPreview(true);
//       setPreview(null);
//       try {
//         if (isDatabricksUser()) {
//           await fetchPreviewDatabricks();
//         } else {
//           await fetchPreviewDefault();
//         }
//       } catch (err: any) {
//         toast.error(err.message || "Failed to load table preview", { duration: 4000, action: closeToastButton });
//       } finally {
//         setLoadingPreview(false);
//       }
//     };

//     fetchPreview();
//   }, [selectedTable, userId, jobId]);

//   // ── Build ReactFlow nodes from materialized tables ────────────
//   const nodes = useMemo<Node[]>(() => {
//     const factTable = tables.find(t => t.table_type === "FACT");
//     const dimTables = tables.filter(t => t.table_type !== "FACT");

//     if (!factTable) {
//         const radius    = Math.max(300, dimTables.length * 80);
//         const angleStep = (2 * Math.PI) / Math.max(1, dimTables.length);
//         return dimTables.map((t, i) => {
//             const angle = i * angleStep - Math.PI / 2;
//             return {
//                 id:   t.entity_name,
//                 type: "dim",
//                 position: {
//                     x: Math.cos(angle) * radius,
//                     y: Math.sin(angle) * radius,
//                 },
//                 data: {
//                     label:     t.entity_name,
//                     columns:   t.columns || [],
//                     row_count: t.row_count,
//                     onClick:   () => setSelectedTable(t.table_name),
//                 },
//             };
//         });
//     }

//     const radius    = Math.max(360, dimTables.length * 50);
//     const angleStep = (2 * Math.PI) / Math.max(1, dimTables.length);

//     const factNode: Node = {
//         id:   factTable.entity_name,
//         type: "fact",
//         position: { x: 0, y: 0 },
//         data: {
//             label:     factTable.entity_name,
//             columns:   factTable.columns || preview?.columns || [],
//             row_count: factTable.row_count,
//             onClick:   () => setSelectedTable(factTable.table_name),
//         },
//     };

//     const dimNodes: Node[] = dimTables.map((t, i) => {
//         const angle = i * angleStep - Math.PI / 2;
//         return {
//             id:   t.entity_name,
//             type: "dim",
//             position: {
//                 x: Math.cos(angle) * radius,
//                 y: Math.sin(angle) * radius,
//             },
//             data: {
//                 label:     t.entity_name,
//                 columns:   t.columns || [],
//                 row_count: t.row_count,
//                 onClick:   () => setSelectedTable(t.table_name),
//             },
//         };
//     });

//     return [factNode, ...dimNodes];
// }, [tables, preview, setSelectedTable]);

//   // ── Build ReactFlow edges from relationships ──────────────────
//   // Only include edges where both from_table and to_table exist
//   // in materialized tables (by entity_name)
//   const materializedEntityNames = useMemo(
//     () => new Set(tables.map(t => t.entity_name)),
//     [tables]
//   );

//   const edges = useMemo<Edge[]>(() => {
//     return relationships
//       .filter(rel =>
//           tables.some(t => t.table_name === rel.from_table || t.entity_name === rel.from_table) &&
//           tables.some(t => t.table_name === rel.to_table   || t.entity_name === rel.to_table)
//       )
//       .map(rel => ({
//         id:     rel.relationship_id,
//         source: rel.from_table,
//         target: rel.to_table,
//         type:   "labeled",
//         label:  rel.relationship_type || "M:1",
//       }));
//   }, [relationships, materializedEntityNames]);

//   const factTable = tables.find(t => t.table_type === "FACT");
//   const dimTables = tables.filter(t => t.table_type !== "FACT");

//   return (
//     <WorkflowLayout>
//       <div className="p-8">

//         {/* Header */}
//         <div className="mb-6">
//           <h1 className="text-3xl font-bold text-foreground mb-2">Data Preview</h1>
//           <p className="text-muted-foreground">Preview materialized table data from your schema</p>
//         </div>

//         {/* ER Diagram — read only */}
//         <div className="border border-border rounded-lg p-6 bg-card mb-6">
//           <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
//             <Database className="h-5 w-5" />
//             Schema Overview
//           </h2>

//           {loadingTables ? (
//             <div className="flex justify-center items-center h-64">
//               <Loader2 className="h-8 w-8 animate-spin" />
//             </div>
//           ) : (
//             <ReactFlowProvider>
//               <div className="h-[500px] w-full rounded-lg border border-border overflow-hidden">
//                 <ReactFlow
//                   nodes={nodes}
//                   edges={edges}
//                   nodeTypes={nodeTypes}
//                   edgeTypes={edgeTypes}
//                   fitView
//                   fitViewOptions={{ padding: 0.25, minZoom: 0.3, maxZoom: 1.1, duration: 800 }}
//                   minZoom={0.2}
//                   maxZoom={1.6}
//                   panOnDrag
//                   zoomOnScroll
//                   nodesDraggable={false}
//                   nodesConnectable={false}
//                   elementsSelectable
//                   proOptions={{ hideAttribution: true }}
//                 >
//                   <Background gap={24} size={1.5} />
//                   <Controls showZoom showFitView showInteractive={false} position="bottom-left" />
//                 </ReactFlow>
//               </div>
//             </ReactFlowProvider>
//           )}
//         </div>

//         {/* Table Grid */}
        

//         {/* Preview Section */}
//         <div ref={previewRef} className="border border-border rounded-lg p-6 bg-card mb-6">
//           {selectedTable ? (
//             <>
//               <div className="flex items-center justify-between mb-4 min-w-0">
//                 <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 min-w-0">
//                   <TableIcon className="h-5 w-5 shrink-0" />
//                   <span className="truncate">
//                     {(tables.find(t => t.table_name === selectedTable)?.entity_name) || selectedTable} — Data Preview
//                   </span>
//                 </h3>
//                 <Badge variant="outline" className="text-xs shrink-0">
//                   {preview?.table_type || "—"}
//                 </Badge>
//               </div>

//               <div className="flex gap-6 mb-4 text-sm">
//                 <div>
//                   <span className="text-muted-foreground">Total Rows:</span>{" "}
//                   <span className="font-semibold text-foreground">
//                     {preview?.row_count?.toLocaleString() ?? "—"}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Columns:</span>{" "}
//                   <span className="font-semibold text-foreground">
//                     {preview?.column_count ?? "—"}
//                   </span>
//                 </div>
//                 <div>
//                   <span className="text-muted-foreground">Showing:</span>{" "}
//                   <span className="font-semibold text-foreground">First 5 rows</span>
//                 </div>
//               </div>

//               <div className="border border-border rounded-lg overflow-hidden">
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="bg-muted/50">
//                       {preview?.columns.map(col => (
//                         <TableHead key={col} className="font-medium">{col}</TableHead>
//                       ))}
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {loadingPreview ? (
//                       <TableRow>
//                         <TableCell colSpan={preview?.columns.length || 5} className="text-center py-8">
//                           <Loader2 className="h-6 w-6 animate-spin mx-auto" />
//                         </TableCell>
//                       </TableRow>
//                     ) : preview && preview.data.length > 0 ? (
//                       preview.data.map((row, idx) => (
//                         <TableRow key={idx}>
//                           {preview.columns.map(col => (
//                             <TableCell key={col}>
//                               {row[col] !== null && row[col] !== undefined ? String(row[col]) : "—"}
//                             </TableCell>
//                           ))}
//                         </TableRow>
//                       ))
//                     ) : (
//                       <TableRow>
//                         <TableCell
//                           colSpan={preview?.columns.length || 5}
//                           className="text-center py-8 text-muted-foreground"
//                         >
//                           No data available
//                         </TableCell>
//                       </TableRow>
//                     )}
//                   </TableBody>
//                 </Table>
//               </div>
//             </>
//           ) : (
//             <div className="text-center py-12 text-muted-foreground">
//               Select a table to view preview
//             </div>
//           )}
//         </div>

//         {/* Navigation */}
//         <div className="flex justify-between items-center">
//           <Button variant="outline" onClick={() => navigate("/workflow/data-modeling")}>
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back
//           </Button>
//           <Button onClick={() => navigate("/workflow/data-creation")}>
//             Next: Data Creation
//             <ArrowRight className="ml-2 h-4 w-4" />
//           </Button>
//         </div>

//       </div>
//     </WorkflowLayout>
//   );
// }

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Database, Table as TableIcon, Loader2, ArrowRight, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import {
  ReactFlow,
  Background,
  Controls,
  Node,
  Edge,
  Position,
  Handle,
  NodeProps,
  ReactFlowProvider,
  getStraightPath,
  BaseEdge,
  EdgeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

const MODELING_API = "https://api.veriton.ai/api/service2";

// ── Types ─────────────────────────────────────────────────────
interface TableSummary {
  table_name:   string;
  entity_name:  string;
  table_type:   "FACT" | "DIM";
  row_count:    number;
  column_count: number;
  columns?:     string[];
}

interface TablePreview {
  table_name:   string;
  entity_name:  string;
  table_type:   "FACT" | "DIM";
  row_count:    number;
  column_count: number;
  columns:      string[];
  data:         Record<string, any>[];
}

interface Relationship {
  relationship_id:   string;
  from_table:        string;
  from_column:        string;
  to_table:        string;
  to_column:        string;
  relationship_type: string;
}

// ── Databricks run-status polling types ─────────────────────────
interface InvokeDataPreviewResponse {
  status:  string;
  run_id:  number;
  user_id: string;
  job_id:  string;
}

interface DataPreviewRunStatus {
  run_id:          number;
  life_cycle_state: string; // e.g. "PENDING" | "RUNNING" | "TERMINATED" | "TERMINATING" | "SKIPPED" | "INTERNAL_ERROR"
  result_state?:    string; // e.g. "SUCCESS" | "FAILED" | "TIMEDOUT" | "CANCELED"
  state_message?:   string;
  run_page_url?:    string;
}

// ── NEW: helpers for the Databricks-platform datamodel / preview routes ────

/**
 * Reads the "user" object from localStorage and returns true if the user's
 * dataplatform is "Databricks". This decides whether we call the
 * Databricks-specific schema/preview APIs instead of the default service2
 * ones.
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

const databricksGenerateDatamodelUrl = (userId: string, jobId: string) =>
  `https://api.veriton.ai/api/service-databricks/datamodel/${userId}/${jobId}`;

const databricksViewFileUrl = (userId: string, jobId: string, filename: string) =>
  `https://api.veriton.ai/api/service-databricks/files/view-file?user_id=${userId}&job_id=${jobId}&filename=${encodeURIComponent(filename)}`;

// ── NEW: Data Preview invoke + status-polling routes (Databricks only) ─────
const databricksInvokeDataPreviewUrl = (userId: string, jobId: string) =>
  `https://api.veriton.ai/api/service-databricks/invoke-data-preview/${userId}/${jobId}`;

const databricksDataPreviewStatusUrl = (runId: number | string) =>
  `https://api.veriton.ai/api/service-databricks/invoke-data-preview/status/${runId}`;

/**
 * Maps a single Databricks relationship object into the shape this
 * component's edge-building code reads (`from_table`/`from_column`/
 * `to_table`/`to_column`/`relationship_type`/`relationship_id`). Databricks
 * returns `parent_table`/`parent_column`/`child_table`/`child_column`/
 * `relationship` instead — this is exactly why connection lines weren't
 * rendering even though the relationships array had data in it.
 */
function mapDatabricksRelationship(rel: any): Relationship {
  const fromTable = rel.parent_table ?? rel.from_table;
  const fromColumn = rel.parent_column ?? rel.from_column;
  const toTable = rel.child_table ?? rel.to_table;
  const toColumn = rel.child_column ?? rel.to_column;
  const relationshipType = rel.relationship ?? rel.relationship_type ?? "1:M";

  return {
    relationship_id:
      rel.relationship_id || `${fromTable}.${fromColumn}-->${toTable}.${toColumn}`,
    from_table: fromTable,
    from_column: fromColumn,
    to_table: toTable,
    to_column: toColumn,
    relationship_type: relationshipType,
  };
}

// How long to keep polling before giving up (ms). Adjust as needed.
const DATA_PREVIEW_POLL_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const DATA_PREVIEW_POLL_INTERVAL_MS = 3000; // 3 seconds

// ── Read-only Fact Node ───────────────────────────────────────
function FactNode({ data }: NodeProps) {
  const { label, columns = [], row_count = 0, onClick } = data as {
    label: string;
    columns: string[];
    row_count: number;
    onClick: () => void;

  };

  return (
    <div onClick = {onClick} className="border-2 border-cyan-500 rounded-lg p-4 bg-cyan-950/30 w-56 shadow-md relative cursor-pointer hover:ring-2 hover:ring-cyan-400 transition">
      <Handle type="target" position={Position.Left}  className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-foreground truncate">{label}</span>
        <span className="text-[10px] bg-cyan-600 text-white rounded px-1.5 py-0.5 ml-1 shrink-0">FACT</span>
      </div>
      <div className="text-xs text-muted-foreground space-y-0.5 max-h-40 overflow-y-auto">
        {columns.map((col, i) => (
          <div key={i} className="px-1 py-0.5 truncate">{col}</div>
        ))}
        <div className="text-[10px] text-muted-foreground/60 mt-1 pt-1 border-t border-border">
          {Number(row_count).toLocaleString()} rows
        </div>
      </div>
    </div>
  );
}

// ── Read-only Dim Node ────────────────────────────────────────
function DimNode({ data }: NodeProps) {
  const { label, columns = [], row_count = 0, onClick } = data as {
    label: string;
    columns: string[];
    row_count: number;
    onClick: () => void;
  };

  return (
<div
  onClick={onClick}
  className="border border-blue-500 rounded-lg p-4 bg-card/90 w-48 shadow-md relative cursor-pointer hover:ring-2 hover:ring-blue-400 transition"
>      <Handle type="target" position={Position.Left}  className="!bg-transparent !border-0" />
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-foreground truncate">{label}</span>
        <span className="text-[10px] border border-blue-400 text-blue-400 rounded px-1.5 py-0.5 ml-1 shrink-0">DIM</span>
      </div>
      <div className="text-xs text-muted-foreground space-y-0.5 max-h-36 overflow-y-auto">
        {columns.map((col, i) => (
          <div key={i} className="px-1 py-0.5 truncate">{col}</div>
        ))}
        <div className="text-[10px] text-muted-foreground/60 mt-1 pt-1 border-t border-border">
          {Number(row_count).toLocaleString()} rows
        </div>
      </div>
    </div>
  );
}

// ── Simple labeled edge ───────────────────────────────────────
function LabeledEdge({ sourceX, sourceY, targetX, targetY, label, id }: EdgeProps) {
  const [path, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  return (
    <>
      <BaseEdge id={id} path={path} style={{ stroke: "hsl(var(--primary))", strokeWidth: 2, strokeDasharray: "6 4" }} />
      <foreignObject x={labelX - 16} y={labelY - 10} width={32} height={20}>
        <div className="flex items-center justify-center">
          <span className="text-[9px] font-semibold bg-background border border-border rounded px-1 text-foreground">
            {String(label || "M:1")}
          </span>
        </div>
      </foreignObject>
    </>
  );
}

const nodeTypes = { fact: FactNode, dim: DimNode };
const edgeTypes = { labeled: LabeledEdge };

// ── Main Component ────────────────────────────────────────────
export default function DataPreview() {
  const navigate   = useNavigate();
  const previewRef = useRef<HTMLDivElement>(null);

  const [tables, setTables]                 = useState<TableSummary[]>([]);
  const [relationships, setRelationships]   = useState<Relationship[]>([]);
  const [selectedTable, setSelectedTable]   = useState<string | null>(null);
  const [preview, setPreview]               = useState<TablePreview | null>(null);
  const [loadingTables, setLoadingTables]   = useState(true);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // ── NEW: tracks the invoke+poll cycle triggered by "Next: Data Creation"
  // for Databricks users.
  const [isPreparingNext, setIsPreparingNext] = useState(false);

  // Guards against setState after unmount / superseded polling loops.
  const pollingActiveRef = useRef(false);

  // ── NEW: keep a ref of the latest `tables` so the selectedTable preview
  // effect can read table metadata (table_type / entity_name) without
  // having to list `tables` as an effect dependency.
  const tablesRef = useRef<TableSummary[]>([]);
  useEffect(() => {
    tablesRef.current = tables;
  }, [tables]);

  useEffect(() => {
    return () => {
      // Stop any in-flight polling loop when the component unmounts.
      pollingActiveRef.current = false;
    };
  }, []);

  const userId = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}").id
    : null;
  const jobId = localStorage.getItem("current_job_id");

  const closeToastButton = (
    <button
      onClick={() => toast.dismiss()}
      className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
      aria-label="Close toast"
    >
      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
    </button>
  );

  // ── Fetch tables + relationships on mount ─────────────────────
  // ── NEW: branches to the Databricks datamodel-generation API when the
  // logged-in user's dataplatform is "Databricks", otherwise keeps the
  // existing service2 preview/relationships calls.
  useEffect(() => {
    if (!userId || !jobId) {
      toast.error("Missing user or job information", { duration: 3000, action: closeToastButton });
      setLoadingTables(false);
      return;
    }

    const fetchAllDatabricks = async () => {
      const response = await fetch(databricksGenerateDatamodelUrl(userId, jobId), {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(errText || "Failed to generate data model");
      }

      const result = await response.json();

      const rawTables: any[] = result?.result?.tables || [];

      // Databricks returns parent_table/parent_column/child_table/
      // child_column/relationship — mapped to from_table/from_column/
      // to_table/to_column/relationship_type via mapDatabricksRelationship
      // so the edge-building code below can actually match on them.
      const rawRelationships: any[] = result?.result?.relationships || [];
      const mappedRelationships: Relationship[] = rawRelationships.map(mapDatabricksRelationship);

      const enrichedTables: TableSummary[] = rawTables.map((t) => {
        const columns: string[] = (t.columns || []).map(
          (c: any) => c.column_name ?? c.name,
        );

        return {
          table_name: t.table_name,
          entity_name: t.table_name, // Databricks response has no separate entity_name
          table_type: t.table_type,
          row_count: t.row_count ?? 0, // not returned by /datamodel — filled in once a table is opened
          column_count: columns.length,
          columns,
        };
      });

      setTables(enrichedTables);
      setRelationships(mappedRelationships);

      const fact = enrichedTables.find((t) => t.table_type === "FACT");
      const firstTable = fact || enrichedTables[0];

      if (firstTable) {
        // Preview data for this table is fetched by the selectedTable effect
        // below via /files/view-file, since /datamodel doesn't return rows.
        setSelectedTable(firstTable.table_name);
      }
    };

    const fetchAllDefault = async () => {
      // 1. Fetch tables + relationships in parallel
      const [tablesRes, relsRes] = await Promise.all([
        fetch(`${MODELING_API}/api/preview/tables?user_id=${userId}&job_id=${jobId}`),
        fetch(`${MODELING_API}/api/relationships/${userId}/${jobId}`)
      ]);

      if (!tablesRes.ok) throw new Error("Preview metadata not found. Run materialization first.");
      const tablesData = await tablesRes.json();
      const allTables: TableSummary[] = tablesData.tables || [];

      if (relsRes.ok) {
        const relsData = await relsRes.json();
        setRelationships(relsData.relationships || []);
      }

      // 2. Fetch all individual previews in parallel to get columns
      const previewResults = await Promise.allSettled(
        allTables.map(t =>
          fetch(`${MODELING_API}/api/preview/table?user_id=${userId}&job_id=${jobId}&table_name=${encodeURIComponent(t.table_name)}`)
            .then(r => r.ok ? r.json() : null)
        )
      );

      // 3. Enrich tables with columns from preview files
      const enrichedTables = allTables.map((t, i) => {
        const result = previewResults[i];
        const previewData = result.status === 'fulfilled' ? result.value : null;
        return { ...t, columns: previewData?.columns || [] };
      });
      setTables(enrichedTables);

      // 4. Auto-select fact table first, set preview directly (no double fetch)
      const fact = enrichedTables.find(t => t.table_type === "FACT");
      const firstTable = fact || enrichedTables[0];
      if (firstTable) {
        setSelectedTable(firstTable.table_name);
        // Set preview directly from already-fetched data
        const firstIdx = enrichedTables.indexOf(firstTable);
        const firstResult = previewResults[firstIdx];
        if (firstResult.status === 'fulfilled' && firstResult.value) {
          setPreview(firstResult.value);
        }
      }
    };

    const fetchAll = async () => {
      setLoadingTables(true);
      try {
        if (isDatabricksUser()) {
          await fetchAllDatabricks();
        } else {
          await fetchAllDefault();
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load tables", { duration: 4000, action: closeToastButton });
      } finally {
        setLoadingTables(false);
      }
    };

    fetchAll();
  }, [userId, jobId]);

  // ── Scroll to preview when table selected ────────────────────
 useEffect(() => {
  if (preview && previewRef.current) {
    previewRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}, [preview]);
  

  // ── Fetch individual table preview ───────────────────────────
  // ── NEW: branches to the Databricks view-file API when applicable.
  useEffect(() => {
    if (!selectedTable || !userId || !jobId) return;

    const fetchPreviewDatabricks = async () => {
      const res = await fetch(databricksViewFileUrl(userId, jobId, selectedTable));
      if (!res.ok) throw new Error("Preview not found for this table.");
      const data = await res.json();

      // NOTE: the real response shape of /files/view-file wasn't confirmed
      // when this was wired up — assumed to mirror /files/preview-data's
      // `{ rows: [...] }` shape, with a fallback to a `data` key. If the
      // actual response looks different, adjust this block.
      const rows: Record<string, any>[] = data.rows || data.data || [];
      const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
      const tableMeta = tablesRef.current.find(t => t.table_name === selectedTable);

      setPreview({
        table_name: selectedTable,
        entity_name: tableMeta?.entity_name || selectedTable,
        table_type: (tableMeta?.table_type as "FACT" | "DIM") || "DIM",
        row_count: rows.length,
        column_count: columns.length,
        columns,
        data: rows,
      });
    };

    const fetchPreviewDefault = async () => {
      const res = await fetch(
        `${MODELING_API}/api/preview/table?user_id=${userId}&job_id=${jobId}&table_name=${encodeURIComponent(selectedTable)}`
      );
      if (!res.ok) throw new Error("Preview not found for this table.");
      const data: TablePreview = await res.json();
      setPreview(data);
    };

    const fetchPreview = async () => {
      setLoadingPreview(true);
      setPreview(null);
      try {
        if (isDatabricksUser()) {
          await fetchPreviewDatabricks();
        } else {
          await fetchPreviewDefault();
        }
      } catch (err: any) {
        toast.error(err.message || "Failed to load table preview", { duration: 4000, action: closeToastButton });
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchPreview();
  }, [selectedTable, userId, jobId]);

  // ── Build ReactFlow nodes from materialized tables ────────────
  const nodes = useMemo<Node[]>(() => {
    const factTable = tables.find(t => t.table_type === "FACT");
    const dimTables = tables.filter(t => t.table_type !== "FACT");

    if (!factTable) {
        const radius    = Math.max(300, dimTables.length * 80);
        const angleStep = (2 * Math.PI) / Math.max(1, dimTables.length);
        return dimTables.map((t, i) => {
            const angle = i * angleStep - Math.PI / 2;
            return {
                id:   t.entity_name,
                type: "dim",
                position: {
                    x: Math.cos(angle) * radius,
                    y: Math.sin(angle) * radius,
                },
                data: {
                    label:     t.entity_name,
                    columns:   t.columns || [],
                    row_count: t.row_count,
                    onClick:   () => setSelectedTable(t.table_name),
                },
            };
        });
    }

    const radius    = Math.max(360, dimTables.length * 50);
    const angleStep = (2 * Math.PI) / Math.max(1, dimTables.length);

    const factNode: Node = {
        id:   factTable.entity_name,
        type: "fact",
        position: { x: 0, y: 0 },
        data: {
            label:     factTable.entity_name,
            columns:   factTable.columns || preview?.columns || [],
            row_count: factTable.row_count,
            onClick:   () => setSelectedTable(factTable.table_name),
        },
    };

    const dimNodes: Node[] = dimTables.map((t, i) => {
        const angle = i * angleStep - Math.PI / 2;
        return {
            id:   t.entity_name,
            type: "dim",
            position: {
                x: Math.cos(angle) * radius,
                y: Math.sin(angle) * radius,
            },
            data: {
                label:     t.entity_name,
                columns:   t.columns || [],
                row_count: t.row_count,
                onClick:   () => setSelectedTable(t.table_name),
            },
        };
    });

    return [factNode, ...dimNodes];
}, [tables, preview, setSelectedTable]);

  // ── Build ReactFlow edges from relationships ──────────────────
  // Only include edges where both from_table and to_table exist
  // in materialized tables (by entity_name)
  const materializedEntityNames = useMemo(
    () => new Set(tables.map(t => t.entity_name)),
    [tables]
  );

  const edges = useMemo<Edge[]>(() => {
    return relationships
      .filter(rel =>
          tables.some(t => t.table_name === rel.from_table || t.entity_name === rel.from_table) &&
          tables.some(t => t.table_name === rel.to_table   || t.entity_name === rel.to_table)
      )
      .map(rel => ({
        id:     rel.relationship_id,
        source: rel.from_table,
        target: rel.to_table,
        type:   "labeled",
        label:  rel.relationship_type || "M:1",
      }));
  }, [relationships, materializedEntityNames]);

  const factTable = tables.find(t => t.table_type === "FACT");
  const dimTables = tables.filter(t => t.table_type !== "FACT");

  // ── NEW: sleep helper for polling ──────────────────────────────
  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // ── NEW: trigger the Databricks data-preview run, then poll its status
  // until it terminates. Resolves true on SUCCESS, false otherwise (and
  // shows an error toast on failure/timeout).
  const runDatabricksDataPreviewAndWait = useCallback(async (uid: string, jid: string): Promise<boolean> => {
    // 1. Trigger the run
    const invokeRes = await fetch(databricksInvokeDataPreviewUrl(uid, jid), {
      method: "POST",
      headers: { Accept: "application/json" },
    });

    if (!invokeRes.ok) {
      const errText = await invokeRes.text();
      throw new Error(errText || "Failed to trigger data preview generation");
    }

    const invokeData: InvokeDataPreviewResponse = await invokeRes.json();
    const runId = invokeData.run_id;

    if (!runId) {
      throw new Error("No run_id returned from invoke-data-preview");
    }

    // 2. Poll status until terminated or timeout
    pollingActiveRef.current = true;
    const startedAt = Date.now();

    while (pollingActiveRef.current) {
      if (Date.now() - startedAt > DATA_PREVIEW_POLL_TIMEOUT_MS) {
        throw new Error("Timed out waiting for data preview to complete");
      }

      const statusRes = await fetch(databricksDataPreviewStatusUrl(runId), {
        headers: { Accept: "application/json" },
      });

      if (!statusRes.ok) {
        const errText = await statusRes.text();
        throw new Error(errText || "Failed to check data preview status");
      }

      const statusData: DataPreviewRunStatus = await statusRes.json();

      if (statusData.life_cycle_state === "TERMINATED") {
        if (statusData.result_state === "SUCCESS") {
          return true;
        }
        throw new Error(
          statusData.state_message ||
          `Data preview run ended with status: ${statusData.result_state || "UNKNOWN"}`
        );
      }

      // Also bail out early on states that mean it's not going to finish normally
      if (statusData.life_cycle_state === "INTERNAL_ERROR" || statusData.life_cycle_state === "SKIPPED") {
        throw new Error(
          statusData.state_message ||
          `Data preview run failed with lifecycle state: ${statusData.life_cycle_state}`
        );
      }

      await sleep(DATA_PREVIEW_POLL_INTERVAL_MS);
    }

    // Polling was cancelled (e.g. component unmounted)
    return false;
  }, []);

  // ── NEW: handles "Next: Data Creation" click. For Databricks users this
  // triggers + polls the data-preview run before navigating; for everyone
  // else it navigates immediately, same as before.
  const handleNextClick = useCallback(async () => {
    if (!isDatabricksUser()) {
      navigate("/workflow/data-creation");
      return;
    }

    if (!userId || !jobId) {
      toast.error("Missing user or job information", { duration: 3000, action: closeToastButton });
      return;
    }

    setIsPreparingNext(true);
    try {
      const success = await runDatabricksDataPreviewAndWait(userId, jobId);
      if (success) {
        navigate("/workflow/data-creation");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to prepare data for Data Creation", {
        duration: 5000,
        action: closeToastButton,
      });
    } finally {
      pollingActiveRef.current = false;
      setIsPreparingNext(false);
    }
  }, [userId, jobId, navigate, runDatabricksDataPreviewAndWait]);

  return (
    <WorkflowLayout>
      <div className="p-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground mb-2">Data Preview</h1>
          <p className="text-muted-foreground">Preview materialized table data from your schema</p>
        </div>

        {/* ER Diagram — read only */}
        <div className="border border-border rounded-lg p-6 bg-card mb-6">
          <h2 className="text-xl font-semibold text-foreground flex items-center gap-2 mb-4">
            <Database className="h-5 w-5" />
            Schema Overview
          </h2>

          {loadingTables ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <ReactFlowProvider>
              <div className="h-[500px] w-full rounded-lg border border-border overflow-hidden">
                <ReactFlow
                  nodes={nodes}
                  edges={edges}
                  nodeTypes={nodeTypes}
                  edgeTypes={edgeTypes}
                  fitView
                  fitViewOptions={{ padding: 0.25, minZoom: 0.3, maxZoom: 1.1, duration: 800 }}
                  minZoom={0.2}
                  maxZoom={1.6}
                  panOnDrag
                  zoomOnScroll
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable
                  proOptions={{ hideAttribution: true }}
                >
                  <Background gap={24} size={1.5} />
                  <Controls showZoom showFitView showInteractive={false} position="bottom-left" />
                </ReactFlow>
              </div>
            </ReactFlowProvider>
          )}
        </div>

        {/* Table Grid */}
        

        {/* Preview Section */}
        <div ref={previewRef} className="border border-border rounded-lg p-6 bg-card mb-6">
          {selectedTable ? (
            <>
              <div className="flex items-center justify-between mb-4 min-w-0">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2 min-w-0">
                  <TableIcon className="h-5 w-5 shrink-0" />
                  <span className="truncate">
                    {(tables.find(t => t.table_name === selectedTable)?.entity_name) || selectedTable} — Data Preview
                  </span>
                </h3>
                <Badge variant="outline" className="text-xs shrink-0">
                  {preview?.table_type || "—"}
                </Badge>
              </div>

              <div className="flex gap-6 mb-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Total Rows:</span>{" "}
                  <span className="font-semibold text-foreground">
                    {preview?.row_count?.toLocaleString() ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Columns:</span>{" "}
                  <span className="font-semibold text-foreground">
                    {preview?.column_count ?? "—"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Showing:</span>{" "}
                  <span className="font-semibold text-foreground">First 5 rows</span>
                </div>
              </div>

              <div className="border border-border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      {preview?.columns.map(col => (
                        <TableHead key={col} className="font-medium">{col}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingPreview ? (
                      <TableRow>
                        <TableCell colSpan={preview?.columns.length || 5} className="text-center py-8">
                          <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                        </TableCell>
                      </TableRow>
                    ) : preview && preview.data.length > 0 ? (
                      preview.data.map((row, idx) => (
                        <TableRow key={idx}>
                          {preview.columns.map(col => (
                            <TableCell key={col}>
                              {row[col] !== null && row[col] !== undefined ? String(row[col]) : "—"}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={preview?.columns.length || 5}
                          className="text-center py-8 text-muted-foreground"
                        >
                          No data available
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Select a table to view preview
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate("/workflow/data-modeling")} disabled={isPreparingNext}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button onClick={handleNextClick} disabled={isPreparingNext}>
            {isPreparingNext ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Preparing Data...
              </>
            ) : (
              <>
                Next: Data Creation
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>

      </div>
    </WorkflowLayout>
  );
}