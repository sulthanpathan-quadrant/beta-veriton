// import { useState, useEffect, useRef } from "react";
// import { WorkflowLayout } from "@/components/WorkflowLayout";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { ArrowLeft, ArrowRight, Plus, Trash2, Save, Table as TableIcon, ChevronDown, ChevronUp, History, LayoutGrid, Loader2, X } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "@/hooks/use-toast";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";

// interface Column {
//   name: string;
//   type: string;
// }

// interface TableData {
//   table_name: string;
//   table_type: "FACT" | "DIM";
//   columns: Column[];
// }

// interface CustomTable {
//   name: string;
//   columns: { name: string; table: string; type: string }[];
//   createdAt: string;
// }

// interface BackendDataset {
//   filename: string;
//   date_modified: string;
// }

// // ── NEW: Databricks-platform "available tables" source ─────────────────
// // Response shape from /list-modelling-files: table_type comes back as
// // "FACT" | "DIMENSION" | "INDEPENDENT" | "UNKNOWN", which we normalize
// // down to the FACT/DIM badge the UI already knows how to render.
// interface DatabricksModellingColumn {
//   name: string;
//   type: string;
// }

// interface DatabricksModellingTable {
//   table_name: string;
//   table_type: "FACT" | "DIMENSION" | "INDEPENDENT" | "UNKNOWN" | string;
//   columns: DatabricksModellingColumn[];
// }

// interface DatabricksListModellingFilesResponse {
//   user_id: string;
//   job_id: string;
//   tables: DatabricksModellingTable[];
// }

// /**
//  * Reads the "user" object from localStorage and returns true if the user's
//  * dataplatform is "Databricks". Mirrors the same check used on the
//  * Data Preview page.
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

// const databricksListModellingFilesUrl = (userId: string, jobId: string) =>
//   `https://api.veriton.ai/api/service-databricks/list-modelling-files?user_id=${userId}&job_id=${jobId}`;

// // ── NEW: Databricks create-dataset endpoint ─────────────────────────────
// const DATABRICKS_CREATE_DATASET_URL =
//   "https://api.veriton.ai/api/service-databricks/create-dataset";

// interface DatabricksCreateDatasetResponse {
//   status: string;
//   rows: number;
//   columns: string[];
//   file_path: string;
// }

// // "DIMENSION" -> "DIM", "FACT" stays "FACT", anything else (INDEPENDENT /
// // UNKNOWN / unexpected values) falls back to "DIM" so the existing badge
// // styling still has a value to render.
// function normalizeDatabricksTableType(tableType: string): "FACT" | "DIM" {
//   return tableType === "FACT" ? "FACT" : "DIM";
// }

// export default function DataCreation() {
//   const navigate = useNavigate();

//   const [availableTables, setAvailableTables] = useState<TableData[]>([]);
//   const [customTableName, setCustomTableName] = useState("");
//   const [customColumns, setCustomColumns] = useState<{ name: string; table: string; type: string }[]>([]);
//   const [draggedColumn, setDraggedColumn] = useState<{ name: string; table: string; type: string } | null>(null);
//   const [collapsedTables, setCollapsedTables] = useState<Record<string, boolean>>({});
//   const [localSavedTables, setLocalSavedTables] = useState<CustomTable[]>([]);
//   const [backendDatasets, setBackendDatasets] = useState<BackendDataset[]>([]);
//   const [loadingTables, setLoadingTables] = useState(true);
//   const [loadingHistory, setLoadingHistory] = useState(false);
//   const [showHistory, setShowHistory] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isTransferring, setIsTransferring] = useState(false);
//   const totalKnownDatasets = backendDatasets.length || localSavedTables.length;
//   // add this line near other useState calls (around line ~30-40)

//   const historySectionRef = useRef<HTMLDivElement>(null);

//   const userId = localStorage.getItem("user")
//     ? JSON.parse(localStorage.getItem("user") || "{}").id
//     : null;
//   const jobId = localStorage.getItem("current_job_id");

//   // Reusable close button for all toasts
//   const closeToastButton = (
//     <Button
//       variant="ghost"
//       size="icon"
//       className="h-6 w-6 rounded-full absolute top-2 right-2"
//       onClick={() => { } /* toast auto-dismisses on action click */}
//     >
//       <X className="h-4 w-4" />
//       <span className="sr-only">Close</span>
//     </Button>
//   );



//   useEffect(() => {
//     if (!userId || !jobId) {
//       toast({
//         title: "Missing credentials",
//         description: "User ID or Job ID not found",
//         variant: "destructive",
//         action: closeToastButton,
//       });
//       setLoadingTables(false);
//       return;
//     }

//     // ── Existing default (non-Databricks) tables fetch — unchanged ──────
//     const fetchTablesDefault = async () => {
//       const res = await fetch(
//         `https://api.veriton.ai/api/service2/onelake/get-all-job-tables?user_id=${userId}&job_id=${jobId}`
//       );
//       // add tost message here

//       if (!res.ok) throw new Error(`please do: ${res.status}`);
//       const data = await res.json();
//       setAvailableTables(data.tables || []);
//     };

//     // ── NEW: Databricks tables fetch via /list-modelling-files ──────────
//     const fetchTablesDatabricks = async () => {
//       const res = await fetch(databricksListModellingFilesUrl(userId, jobId));

//       if (!res.ok) throw new Error(`Failed to load tables: ${res.status}`);
//       const data: DatabricksListModellingFilesResponse = await res.json();

//       const mappedTables: TableData[] = (data.tables || []).map((t) => ({
//         table_name: t.table_name,
//         table_type: normalizeDatabricksTableType(t.table_type),
//         columns: (t.columns || []).map((c) => ({ name: c.name, type: c.type })),
//       }));

//       setAvailableTables(mappedTables);
//     };

//     const fetchTables = async () => {
//       setLoadingTables(true);
//       try {
//         if (isDatabricksUser()) {
//           await fetchTablesDatabricks();
//         } else {
//           await fetchTablesDefault();
//         }
//       } catch (err: any) {
//         console.error("Tables fetch error:", err);
//         toast({
//           title: "Error loading tables",
//           description: err.message || "Please try again",
//           variant: "destructive",
//           action: closeToastButton,
//         });
//       } finally {
//         setLoadingTables(false);
//       }
//     };

//     fetchTables();
//   }, [userId, jobId]);

//   const fetchBackendDatasets = async () => {
//     if (!userId || !jobId) return;

//     setLoadingHistory(true);
//     try {
//       const res = await fetch(
//         `https://api.veriton.ai/api/service2/list-datasets?user_id=${userId}&job_id=${jobId}`
//       );

//       if (!res.ok) {
//         throw new Error(`Failed to fetch datasets: ${res.status}`);
//       }

//       const data = await res.json();
//       setBackendDatasets(data.datasets || []);
//     } catch (err: any) {
//       console.error("History fetch error:", err);
//       toast({
//         title: "Failed to load saved datasets",
//         description: err.message || "Server error",
//         variant: "destructive",
//         action: closeToastButton,
//       });
//     } finally {
//       setLoadingHistory(false);
//     }
//   };

//   const toggleHistory = () => {
//     const willShow = !showHistory;
//     setShowHistory(willShow);

//     if (willShow) {
//       fetchBackendDatasets();

//       setTimeout(() => {
//         if (historySectionRef.current) {
//           historySectionRef.current.scrollIntoView({
//             behavior: "smooth",
//             block: "start",
//           });
//         }
//       }, 100);
//     }
//   };

//   const handleDragStart = (column: Column, tableName: string) => {
//     setDraggedColumn({ name: column.name, type: column.type, table: tableName });
//   };

//   const handleDragOver = (e: React.DragEvent) => {
//     e.preventDefault();
//   };

//   const handleDrop = (e: React.DragEvent) => {
//     e.preventDefault();
//     if (draggedColumn) {
//       const exists = customColumns.some(
//         (col) => col.name === draggedColumn.name && col.table === draggedColumn.table
//       );
//       if (!exists) {
//         setCustomColumns([...customColumns, draggedColumn]);
//         toast({
//           title: "Column Added",
//           description: `${draggedColumn.name} from ${draggedColumn.table}`,
//           duration: 1000,
//           action: closeToastButton,
//         });
//       }
//     }
//     setDraggedColumn(null);
//   };

//   const handleRemoveColumn = (index: number) => {
//     setCustomColumns(customColumns.filter((_, i) => i !== index));
//   };

//   const handleAddColumn = (column: Column, tableName: string) => {
//     const newCol = { name: column.name, type: column.type, table: tableName };
//     const exists = customColumns.some((col) => col.name === newCol.name && col.table === newCol.table);
//     if (!exists) {
//       setCustomColumns([...customColumns, newCol]);
//       toast({
//         title: "Column Added",
//         description: `${newCol.name} from ${newCol.table}`,
//         duration: 1000,
//         action: closeToastButton,
//       });
//     }
//   };

//   const toggleTableCollapse = (tableName: string) => {
//     setCollapsedTables((prev) => ({
//       ...prev,
//       [tableName]: !prev[tableName],
//     }));
//   };
  
//   const handleSaveCustomTable = async () => {
//     // NEW VALIDATION: Prevent save if dataset name is empty
//     if (!customTableName.trim()) {
//       toast({
//         title: "Dataset Name Required",
//         description: "Please enter a name for your custom dataset",
//         variant: "destructive",
//         action: closeToastButton,
//       });
//       return;
//     }

//     if (customColumns.length === 0) {
//       toast({
//         title: "No Columns Selected",
//         description: "Please add at least one column to your custom dataset",
//         variant: "destructive",
//         action: closeToastButton,
//       });
//       return;
//     }

//     if (!userId || !jobId) {
//       toast({
//         title: "Missing user or job information",
//         description: "Please ensure you're logged in with a valid job",
//         variant: "destructive",
//         action: closeToastButton,
//       });
//       return;
//     }

//     setIsSaving(true);

//     // ────────────────────────────────────────────────
//     //   Group columns by their original table
//     // ────────────────────────────────────────────────
//     const columnsByTable = customColumns.reduce((acc: Record<string, string[]>, col) => {
//       if (!acc[col.table]) {
//         acc[col.table] = [];
//       }
//       acc[col.table].push(col.name);
//       return acc;
//     }, {});

//     // Build the new column_mappings format
//     // ── NEW: Databricks source tables are addressed by their plain
//     // table_name (as returned by /list-modelling-files), unlike the
//     // default platform which prefixes with `${userId}_${jobId}_`.
//     const usingDatabricks = isDatabricksUser();

//     const column_mappings = Object.entries(columnsByTable).map(([originalTableName, columns]) => {
//       const source_name = usingDatabricks
//         ? originalTableName
//         : `${userId}_${jobId}_${originalTableName}`; // IMPORTANT: match exactly how backend expects table names

//       return {
//         source_name: source_name,
//         source_type: "table",           // ← fixed value (change if backend supports files/views later)
//         columns: columns,
//       };
//     });

//     const payload = {
//       user_id: userId,
//       job_id: jobId,
//       custom_table_name: customTableName.trim(),
//       column_mappings: column_mappings,
//       join_type: "INNER",               // ← new required field
//     };

//     try {
//       const createResponse = await fetch(
//         usingDatabricks ? DATABRICKS_CREATE_DATASET_URL : "https://api.veriton.ai/api/service2/create-dataset",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             "Accept": "application/json",
//           },
//           body: JSON.stringify(payload),
//         }
//       );

//       if (!createResponse.ok) {
//   let backendMessage = "Failed to create dataset";
//   let backendCode: number | null = null;

//   try {
//     const errorData = await createResponse.json();

//     backendMessage =
//       errorData?.detail?.message ||
//       errorData?.detail ||
//       errorData?.message ||
//       backendMessage;

//     backendCode =
//       errorData?.detail?.error_code ||
//       errorData?.error_code ||
//       null;

//   } catch {
//     backendMessage = `Failed (${createResponse.status})`;
//   }

//   const error: any = new Error(backendMessage);
//   error.code = backendCode;

//   throw error;
// }

//       if (usingDatabricks) {
//         const createResult: DatabricksCreateDatasetResponse = await createResponse.json();

//         toast({
//           title: "Dataset Created",
//           description: `"${customTableName}" created successfully (${createResult.rows} rows)`,
//           duration: 2200,
//           action: closeToastButton,
//         });

//         // NOTE: Databricks' /create-dataset response already includes the
//         // final `file_path` in the volume, so there's no separate onelake
//         // → blob transfer step to run here (unlike the default platform
//         // below).
//       } else {
//         const createResult = await createResponse.json();

//         toast({
//           title: "Dataset Created",
//           description: `"${customTableName}" created successfully`,
//           duration: 2200,
//           action: closeToastButton,
//         });

//         // ─── Optional / background transfer call (unchanged, default platform only) ───
//         try {
//           const transferResponse = await fetch(
//             `https://api.veriton.ai/api/service2/transferfromonelaketoblob?user_id=${userId}&job_id=${jobId}`,
//             {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/json",
//               },
//             }
//           );

//           // You can decide whether to toast or not — currently silent
//           if (!transferResponse.ok) {
//             console.warn("Transfer API responded with non-2xx status");
//           }
//         } catch (transferErr) {
//           console.error("Transfer API call failed (non-blocking):", transferErr);
//         }
//       }

//       // Refresh history + local state
//       setShowHistory(true);
//       fetchBackendDatasets();

//       const newTable: CustomTable = {
//         name: customTableName,
//         columns: customColumns,
//         createdAt: new Date().toLocaleString(),
//       };

//       const updatedTables = [...localSavedTables, newTable];
//       setLocalSavedTables(updatedTables);

//       // Reset form
//       setCustomTableName("");
//       setCustomColumns([]);
//     } catch (error: any) {
//       console.error("Create dataset error:", error);

//       // If backend sends join error (error_code: 1024)
//       if (
//         error?.message?.includes("Neither join column") ||
//         error?.message?.includes("join column")
//       ) {
//         toast({
//           title: "Invalid Column Relationship",
//           description:
//             "There is no valid relationship between the selected columns. Please check your selection and try again.",
//           variant: "destructive",
//           duration: 4000,
//           action: closeToastButton,
//         });
//       } else {
//         toast({
//           title: "Failed to create dataset",
//           description:
//             error.message || "Server error occurred. Please try again.",
//           variant: "destructive",
//           duration: 4000,
//           action: closeToastButton,
//         });
//       }
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const handleDeleteLocalTable = (index: number) => {
//     const updated = localSavedTables.filter((_, i) => i !== index);
//     setLocalSavedTables(updated);
//     toast({
//       title: "Local Dataset Deleted",
//       description: "Removed from local history",
//       action: closeToastButton,
//     });
//   };

//   return (
//     <WorkflowLayout>
//       <div className="pt-6 sm:p-6 lg:p-8 flex flex-col">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
//           <div className="w-full sm:w-auto">
//             <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Create Dataset</h1>
//             <p className="text-sm sm:text-base text-muted-foreground">
//               Build your custom dataset by selecting columns from available tables
//             </p>
//           </div>
//           <Button
//             variant="outline"
//             onClick={toggleHistory}
//             className="flex items-center gap-2 w-full sm:w-auto shrink-0"
//           >
//             <History className="h-4 w-4" />
//             History
//             {/* {totalKnownDatasets > 0 && (
//               <Badge
//                 variant="secondary"
//                 className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs"
//               >
//                 {totalKnownDatasets}
//               </Badge>
//             )} */}
//           </Button>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-4 sm:gap-6 flex-1 min-h-0 ">
//           {/* Left - Available Tables */}
//           <div className="space-y-4 flex flex-col overflow-y-auto max-h-[calc(100vh-160px)] ">
//             <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2 shrink-0">
//               <TableIcon className="h-4 w-4 sm:h-5 sm:w-5" />
//               Available Tables
//             </h2>

//             <div className="overflow-y-auto pr-2 flex-1">
//               {loadingTables ? (
//                 <div className="flex justify-center py-10">
//                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
//                 </div>
//               ) : availableTables.length === 0 ? (
//                 <div className="text-center py-10 text-muted-foreground text-sm">
//                   Please do data ingetion.
//                 </div>
//               ) : (
//                 availableTables.map((table) => (
//                   <div key={table.table_name} className="border border-border rounded-lg bg-card/50 overflow-hidden mb-4">
//                     <div
//                       className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors border-b border-border"
//                       onClick={() => toggleTableCollapse(table.table_name)}
//                     >
//                       <div className="flex items-center gap-2 min-w-0 flex-1">
//                         <TableIcon className="h-4 w-4 text-muted-foreground shrink-0" />
//                         <span className="font-medium text-foreground text-sm sm:text-base truncate">{table.table_name}</span>
//                         {collapsedTables[table.table_name] ? (
//                           <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
//                         ) : (
//                           <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
//                         )}
//                       </div>
//                       <Badge
//                         className={`text-xs font-semibold shrink-0 ml-2 ${table.table_type === "FACT"
//                             ? "bg-orange-500 text-white border-orange-500"
//                             : "bg-purple-500 text-white border-purple-500"
//                           }`}
//                       >
//                         {table.table_type}
//                       </Badge>
//                     </div>

//                     {!collapsedTables[table.table_name] && (
//                       <div>
//                         {table.columns.map((col) => (
//                           <div
//                             key={col.name}
//                             draggable
//                             onDragStart={() => handleDragStart(col, table.table_name)}
//                             className="flex items-center justify-between px-3 sm:px-4 py-2 cursor-move hover:bg-muted/50 transition-colors group border-b border-border/30 last:border-b-0"
//                           >
//                             <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
//                               <span className="text-sm font-medium text-foreground truncate">{col.name}</span>
//                               <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded shrink-0">
//                                 {col.type}
//                               </span>
//                             </div>
//                             <Button
//                               variant="ghost"
//                               size="sm"
//                               onClick={(e) => {
//                                 e.stopPropagation();
//                                 handleAddColumn(col, table.table_name);
//                               }}
//                               className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
//                             >
//                               <Plus className="h-3 w-3" />
//                             </Button>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   </div>
//                 ))
//               )}
//             </div>
//           </div>

//           {/* Right - Custom Dataset Builder */}
//           <div className="space-y-4 w-full flex flex-col min-h-0">
//             <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
//               <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
//               Your Custom Dataset
//             </h2>

//             <div className="space-y-2">
//               <label className="text-sm font-medium text-foreground">Dataset Name</label>
//               <Input
//                 value={customTableName}
//                 onChange={(e) => setCustomTableName(e.target.value)}
//                 placeholder="Enter dataset name"
//                 className="bg-card border-border w-full"
//               />
//             </div>

//             <div
//               onDragOver={handleDragOver}
//               onDrop={handleDrop}
//               className="border border-dashed border-border  overflow-y-auto max-h-[calc(100vh-300px)]  rounded-lg bg-card/50 flex flex-col w-full flex-1 min-h-0"
//             >
//               {customColumns.length === 0 ? (
//                 <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 ">
//                   <LayoutGrid className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" />
//                   <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
//                     Drop columns here
//                   </h3>
//                   <p className="text-xs sm:text-sm text-muted-foreground">
//                     Drag from left or click plus icon
//                   </p>
//                 </div>
//               ) : (
//                 <ScrollArea className="flex-1 p-3 sm:p-4">
//                   <div className="space-y-2">
//                     {customColumns.map((col, index) => (
//                       <div
//                         key={`${col.table}-${col.name}-${index}`}
//                         className="flex items-center justify-between p-2 sm:p-3 bg-background rounded-lg border border-border"
//                       >
//                         <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
//                           <span className="text-sm font-medium text-foreground truncate">{col.name}</span>
//                           <Badge variant="secondary" className="text-xs shrink-0">
//                             {col.type}
//                           </Badge>
//                           <span className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[180px]">
//                             from {col.table}
//                           </span>
//                         </div>
//                         <Button
//                           variant="ghost"
//                           size="sm"
//                           onClick={() => handleRemoveColumn(index)}
//                           className="h-8 w-8 p-0 shrink-0 ml-2"
//                         >
//                           <Trash2 className="h-4 w-4 text-destructive" />
//                         </Button>
//                       </div>
//                     ))}
//                   </div>
//                 </ScrollArea>
//               )}
//             </div>

//             <Button
//               className="w-full bg-primary hover:bg-primary/90 shrink-0"
//               onClick={handleSaveCustomTable}
//               disabled={customColumns.length === 0 || !userId || !jobId || isSaving}
//             >
//               {isSaving ? (
//                 <>
//                   <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                   Creating...
//                 </>
//               ) : (
//                 <>
//                   <Save className="h-4 w-4 mr-2" />
//                   Save Custom Dataset
//                 </>
//               )}
//             </Button>
//           </div>
//         </div>

//         {/* History Section */}
//         {showHistory && (
//           <div className="mt-20 sm:mt-8 pt-4 sm:pt-6 border-t border-border w-full shrink-0">
//             <div ref={historySectionRef} className="flex items-center gap-2 sm:gap-3 mb-4 scroll-mt-20">
//               <History className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
//               <h3 className="text-lg sm:text-xl font-semibold text-foreground">Saved Datasets History</h3>
//             </div>

//             {loadingHistory ? (
//               <div className="flex justify-center py-12">
//                 <Loader2 className="h-8 w-8 animate-spin text-primary" />
//               </div>
//             ) : localSavedTables.length === 0 && backendDatasets.length === 0 ? (
//               <p className="text-center text-muted-foreground py-8 text-sm">
//                 No saved datasets found
//               </p>
//             ) : (
//               <div className="space-y-4 sm:space-y-6 w-full">
//                 {backendDatasets.length > 0 && (
//                   <div className="w-full">
//                     <div className="space-y-3 w-full">
//                       {backendDatasets.map((ds, idx) => (
//                         <div
//                           key={`backend-${idx}`}
//                           className="flex items-center justify-between p-3 sm:p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors w-full"
//                         >
//                           <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
//                             <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
//                               <TableIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
//                             </div>
//                             <div className="min-w-0 flex-1">
//                               <p className="font-medium text-primary text-sm sm:text-base truncate">{ds.filename}</p>
//                               <p className="text-xs sm:text-sm text-muted-foreground truncate">
//                                 Last modified: {ds.date_modified}
//                               </p>
//                             </div>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Bottom Navigation */}
//         <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border w-full shrink-0">
//           <Button
//             variant="outline"
//             onClick={() => navigate("/workflow/data-preview")}
//             className="w-full sm:w-auto order-2 sm:order-1"
//           >
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back to Data Preview
//           </Button>

//           <Button
//             onClick={() => navigate("/workflow/data-quality")}
//             className="bg-primary hover:bg-primary/90 w-full sm:w-auto order-1 sm:order-2"
//           >
//             {isTransferring ? (
//               <>
//                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                 Transferring...
//               </>
//             ) : (
//               <>
//                 Next: Data Quality
//                 <ArrowRight className="ml-2 h-4 w-4" />
//               </>
//             )}
//           </Button>
//         </div>
//       </div>
//     </WorkflowLayout>
//   );
// }




import { useState, useEffect, useRef } from "react";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Plus, Trash2, Save, Table as TableIcon, ChevronDown, ChevronUp, History, LayoutGrid, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Column {
  name: string;
  type: string;
}

interface TableData {
  table_name: string;
  table_type: "FACT" | "DIM";
  columns: Column[];
}

interface CustomTable {
  name: string;
  columns: { name: string; table: string; type: string }[];
  createdAt: string;
}

interface BackendDataset {
  filename: string;
  date_modified: string;
  file_size?: number; // NEW: only populated for Databricks-sourced datasets
}

// ── NEW: Databricks-platform "saved datasets" (History) source ─────────
interface DatabricksDataset {
  file_name: string;
  file_size: number;
  last_modified: string; // ISO timestamp
}

interface DatabricksListDatasetsResponse {
  user_id: string;
  job_id: string;
  datasets: DatabricksDataset[];
}

const databricksListDatasetsUrl = (userId: string, jobId: string) =>
  `https://api.veriton.ai/api/service-databricks/list-datasets?user_id=${userId}&job_id=${jobId}`;

// ── NEW: Databricks-platform "available tables" source ─────────────────
// Response shape from /list-modelling-files: table_type comes back as
// "FACT" | "DIMENSION" | "INDEPENDENT" | "UNKNOWN", which we normalize
// down to the FACT/DIM badge the UI already knows how to render.
interface DatabricksModellingColumn {
  name: string;
  type: string;
}

interface DatabricksModellingTable {
  table_name: string;
  table_type: "FACT" | "DIMENSION" | "INDEPENDENT" | "UNKNOWN" | string;
  columns: DatabricksModellingColumn[];
}

interface DatabricksListModellingFilesResponse {
  user_id: string;
  job_id: string;
  tables: DatabricksModellingTable[];
}

/**
 * Reads the "user" object from localStorage and returns true if the user's
 * dataplatform is "Databricks". Mirrors the same check used on the
 * Data Preview page.
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

const databricksListModellingFilesUrl = (userId: string, jobId: string) =>
  `https://api.veriton.ai/api/service-databricks/list-modelling-files?user_id=${userId}&job_id=${jobId}`;

// ── NEW: Databricks create-dataset endpoint ─────────────────────────────
const DATABRICKS_CREATE_DATASET_URL =
  "https://api.veriton.ai/api/service-databricks/create-dataset";

interface DatabricksCreateDatasetResponse {
  status: string;
  rows: number;
  columns: string[];
  file_path: string;
}

// "DIMENSION" -> "DIM", "FACT" stays "FACT", anything else (INDEPENDENT /
// UNKNOWN / unexpected values) falls back to "DIM" so the existing badge
// styling still has a value to render.
function normalizeDatabricksTableType(tableType: string): "FACT" | "DIM" {
  return tableType === "FACT" ? "FACT" : "DIM";
}

export default function DataCreation() {
  const navigate = useNavigate();

  const [availableTables, setAvailableTables] = useState<TableData[]>([]);
  const [customTableName, setCustomTableName] = useState("");
  const [customColumns, setCustomColumns] = useState<{ name: string; table: string; type: string }[]>([]);
  const [draggedColumn, setDraggedColumn] = useState<{ name: string; table: string; type: string } | null>(null);
  const [collapsedTables, setCollapsedTables] = useState<Record<string, boolean>>({});
  const [localSavedTables, setLocalSavedTables] = useState<CustomTable[]>([]);
  const [backendDatasets, setBackendDatasets] = useState<BackendDataset[]>([]);
  const [loadingTables, setLoadingTables] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const totalKnownDatasets = backendDatasets.length || localSavedTables.length;
  // add this line near other useState calls (around line ~30-40)

  const historySectionRef = useRef<HTMLDivElement>(null);

  const userId = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}").id
    : null;
  const jobId = localStorage.getItem("current_job_id");

  // Reusable close button for all toasts
  const closeToastButton = (
    <Button
      variant="ghost"
      size="icon"
      className="h-6 w-6 rounded-full absolute top-2 right-2"
      onClick={() => { } /* toast auto-dismisses on action click */}
    >
      <X className="h-4 w-4" />
      <span className="sr-only">Close</span>
    </Button>
  );



  useEffect(() => {
    if (!userId || !jobId) {
      toast({
        title: "Missing credentials",
        description: "User ID or Job ID not found",
        variant: "destructive",
        action: closeToastButton,
      });
      setLoadingTables(false);
      return;
    }

    // ── Existing default (non-Databricks) tables fetch — unchanged ──────
    const fetchTablesDefault = async () => {
      const res = await fetch(
        `https://api.veriton.ai/api/service2/onelake/get-all-job-tables?user_id=${userId}&job_id=${jobId}`
      );
      // add tost message here

      if (!res.ok) throw new Error(`please do: ${res.status}`);
      const data = await res.json();
      setAvailableTables(data.tables || []);
    };

    // ── NEW: Databricks tables fetch via /list-modelling-files ──────────
    const fetchTablesDatabricks = async () => {
      const res = await fetch(databricksListModellingFilesUrl(userId, jobId));

      if (!res.ok) throw new Error(`Failed to load tables: ${res.status}`);
      const data: DatabricksListModellingFilesResponse = await res.json();

      const mappedTables: TableData[] = (data.tables || []).map((t) => ({
        table_name: t.table_name,
        table_type: normalizeDatabricksTableType(t.table_type),
        columns: (t.columns || []).map((c) => ({ name: c.name, type: c.type })),
      }));

      setAvailableTables(mappedTables);
    };

    const fetchTables = async () => {
      setLoadingTables(true);
      try {
        if (isDatabricksUser()) {
          await fetchTablesDatabricks();
        } else {
          await fetchTablesDefault();
        }
      } catch (err: any) {
        console.error("Tables fetch error:", err);
        toast({
          title: "Error loading tables",
          description: err.message || "Please try again",
          variant: "destructive",
          action: closeToastButton,
        });
      } finally {
        setLoadingTables(false);
      }
    };

    fetchTables();
  }, [userId, jobId]);

  // ── Existing default (non-Databricks) history fetch — unchanged ───────
  const fetchBackendDatasetsDefault = async () => {
    const res = await fetch(
      `https://api.veriton.ai/api/service2/list-datasets?user_id=${userId}&job_id=${jobId}`
    );

    if (!res.ok) {
      throw new Error(`Failed to fetch datasets: ${res.status}`);
    }

    const data = await res.json();
    setBackendDatasets(data.datasets || []);
  };

  // ── NEW: Databricks history fetch via /list-datasets ───────────────────
  const fetchBackendDatasetsDatabricks = async () => {
    const res = await fetch(databricksListDatasetsUrl(userId!, jobId!));

    if (!res.ok) {
      throw new Error(`Failed to fetch datasets: ${res.status}`);
    }

    const data: DatabricksListDatasetsResponse = await res.json();

    const mappedDatasets: BackendDataset[] = (data.datasets || []).map((ds) => ({
      filename: ds.file_name,
      date_modified: new Date(ds.last_modified).toLocaleString(),
      file_size: ds.file_size,
    }));

    setBackendDatasets(mappedDatasets);
  };

  const fetchBackendDatasets = async () => {
    if (!userId || !jobId) return;

    setLoadingHistory(true);
    try {
      if (isDatabricksUser()) {
        await fetchBackendDatasetsDatabricks();
      } else {
        await fetchBackendDatasetsDefault();
      }
    } catch (err: any) {
      console.error("History fetch error:", err);
      toast({
        title: "Failed to load saved datasets",
        description: err.message || "Server error",
        variant: "destructive",
        action: closeToastButton,
      });
    } finally {
      setLoadingHistory(false);
    }
  };

  const toggleHistory = () => {
    const willShow = !showHistory;
    setShowHistory(willShow);

    if (willShow) {
      fetchBackendDatasets();

      setTimeout(() => {
        if (historySectionRef.current) {
          historySectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    }
  };

  const handleDragStart = (column: Column, tableName: string) => {
    setDraggedColumn({ name: column.name, type: column.type, table: tableName });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedColumn) {
      const exists = customColumns.some(
        (col) => col.name === draggedColumn.name && col.table === draggedColumn.table
      );
      if (!exists) {
        setCustomColumns([...customColumns, draggedColumn]);
        toast({
          title: "Column Added",
          description: `${draggedColumn.name} from ${draggedColumn.table}`,
          duration: 1000,
          action: closeToastButton,
        });
      }
    }
    setDraggedColumn(null);
  };

  const handleRemoveColumn = (index: number) => {
    setCustomColumns(customColumns.filter((_, i) => i !== index));
  };

  const handleAddColumn = (column: Column, tableName: string) => {
    const newCol = { name: column.name, type: column.type, table: tableName };
    const exists = customColumns.some((col) => col.name === newCol.name && col.table === newCol.table);
    if (!exists) {
      setCustomColumns([...customColumns, newCol]);
      toast({
        title: "Column Added",
        description: `${newCol.name} from ${newCol.table}`,
        duration: 1000,
        action: closeToastButton,
      });
    }
  };

  const toggleTableCollapse = (tableName: string) => {
    setCollapsedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };
  
  const handleSaveCustomTable = async () => {
    // NEW VALIDATION: Prevent save if dataset name is empty
    if (!customTableName.trim()) {
      toast({
        title: "Dataset Name Required",
        description: "Please enter a name for your custom dataset",
        variant: "destructive",
        action: closeToastButton,
      });
      return;
    }

    if (customColumns.length === 0) {
      toast({
        title: "No Columns Selected",
        description: "Please add at least one column to your custom dataset",
        variant: "destructive",
        action: closeToastButton,
      });
      return;
    }

    if (!userId || !jobId) {
      toast({
        title: "Missing user or job information",
        description: "Please ensure you're logged in with a valid job",
        variant: "destructive",
        action: closeToastButton,
      });
      return;
    }

    setIsSaving(true);

    // ────────────────────────────────────────────────
    //   Group columns by their original table
    // ────────────────────────────────────────────────
    const columnsByTable = customColumns.reduce((acc: Record<string, string[]>, col) => {
      if (!acc[col.table]) {
        acc[col.table] = [];
      }
      acc[col.table].push(col.name);
      return acc;
    }, {});

    // Build the new column_mappings format
    // ── NEW: Databricks source tables are addressed by their plain
    // table_name (as returned by /list-modelling-files), unlike the
    // default platform which prefixes with `${userId}_${jobId}_`.
    const usingDatabricks = isDatabricksUser();

    const column_mappings = Object.entries(columnsByTable).map(([originalTableName, columns]) => {
      const source_name = usingDatabricks
        ? originalTableName
        : `${userId}_${jobId}_${originalTableName}`; // IMPORTANT: match exactly how backend expects table names

      return {
        source_name: source_name,
        source_type: "table",           // ← fixed value (change if backend supports files/views later)
        columns: columns,
      };
    });

    const payload = {
      user_id: userId,
      job_id: jobId,
      custom_table_name: customTableName.trim(),
      column_mappings: column_mappings,
      join_type: "INNER",               // ← new required field
    };

    try {
      const createResponse = await fetch(
        usingDatabricks ? DATABRICKS_CREATE_DATASET_URL : "https://api.veriton.ai/api/service2/create-dataset",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!createResponse.ok) {
  let backendMessage = "Failed to create dataset";
  let backendCode: number | null = null;

  try {
    const errorData = await createResponse.json();

    backendMessage =
      errorData?.detail?.message ||
      errorData?.detail ||
      errorData?.message ||
      backendMessage;

    backendCode =
      errorData?.detail?.error_code ||
      errorData?.error_code ||
      null;

  } catch {
    backendMessage = `Failed (${createResponse.status})`;
  }

  const error: any = new Error(backendMessage);
  error.code = backendCode;

  throw error;
}

      if (usingDatabricks) {
        const createResult: DatabricksCreateDatasetResponse = await createResponse.json();

        toast({
          title: "Dataset Created",
          description: `"${customTableName}" created successfully (${createResult.rows} rows)`,
          duration: 2200,
          action: closeToastButton,
        });

        // NOTE: Databricks' /create-dataset response already includes the
        // final `file_path` in the volume, so there's no separate onelake
        // → blob transfer step to run here (unlike the default platform
        // below).
      } else {
        const createResult = await createResponse.json();

        toast({
          title: "Dataset Created",
          description: `"${customTableName}" created successfully`,
          duration: 2200,
          action: closeToastButton,
        });

        // ─── Optional / background transfer call (unchanged, default platform only) ───
        try {
          const transferResponse = await fetch(
            `https://api.veriton.ai/api/service2/transferfromonelaketoblob?user_id=${userId}&job_id=${jobId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          // You can decide whether to toast or not — currently silent
          if (!transferResponse.ok) {
            console.warn("Transfer API responded with non-2xx status");
          }
        } catch (transferErr) {
          console.error("Transfer API call failed (non-blocking):", transferErr);
        }
      }

      // Refresh history + local state
      setShowHistory(true);
      fetchBackendDatasets();

      const newTable: CustomTable = {
        name: customTableName,
        columns: customColumns,
        createdAt: new Date().toLocaleString(),
      };

      const updatedTables = [...localSavedTables, newTable];
      setLocalSavedTables(updatedTables);

      // Reset form
      setCustomTableName("");
      setCustomColumns([]);
    } catch (error: any) {
      console.error("Create dataset error:", error);

      // If backend sends join error (error_code: 1024)
      if (
        error?.message?.includes("Neither join column") ||
        error?.message?.includes("join column")
      ) {
        toast({
          title: "Invalid Column Relationship",
          description:
            "There is no valid relationship between the selected columns. Please check your selection and try again.",
          variant: "destructive",
          duration: 4000,
          action: closeToastButton,
        });
      } else {
        toast({
          title: "Failed to create dataset",
          description:
            error.message || "Server error occurred. Please try again.",
          variant: "destructive",
          duration: 4000,
          action: closeToastButton,
        });
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteLocalTable = (index: number) => {
    const updated = localSavedTables.filter((_, i) => i !== index);
    setLocalSavedTables(updated);
    toast({
      title: "Local Dataset Deleted",
      description: "Removed from local history",
      action: closeToastButton,
    });
  };

  return (
    <WorkflowLayout>
      <div className="pt-6 sm:p-6 lg:p-8 flex flex-col">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 shrink-0">
          <div className="w-full sm:w-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">Create Dataset</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Build your custom dataset by selecting columns from available tables
            </p>
          </div>
          <Button
            variant="outline"
            onClick={toggleHistory}
            className="flex items-center gap-2 w-full sm:w-auto shrink-0"
          >
            <History className="h-4 w-4" />
            History
            {/* {totalKnownDatasets > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 bg-primary text-primary-foreground rounded-full h-5 w-5 p-0 flex items-center justify-center text-xs"
              >
                {totalKnownDatasets}
              </Badge>
            )} */}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[350px,1fr] gap-4 sm:gap-6 flex-1 min-h-0 ">
          {/* Left - Available Tables */}
          <div className="space-y-4 flex flex-col overflow-y-auto max-h-[calc(100vh-160px)] ">
            <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2 shrink-0">
              <TableIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              Available Tables
            </h2>

            <div className="overflow-y-auto pr-2 flex-1">
              {loadingTables ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : availableTables.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground text-sm">
                  Please do data ingetion.
                </div>
              ) : (
                availableTables.map((table) => (
                  <div key={table.table_name} className="border border-border rounded-lg bg-card/50 overflow-hidden mb-4">
                    <div
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors border-b border-border"
                      onClick={() => toggleTableCollapse(table.table_name)}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <TableIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="font-medium text-foreground text-sm sm:text-base truncate">{table.table_name}</span>
                        {collapsedTables[table.table_name] ? (
                          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                        )}
                      </div>
                      <Badge
                        className={`text-xs font-semibold shrink-0 ml-2 ${table.table_type === "FACT"
                            ? "bg-orange-500 text-white border-orange-500"
                            : "bg-purple-500 text-white border-purple-500"
                          }`}
                      >
                        {table.table_type}
                      </Badge>
                    </div>

                    {!collapsedTables[table.table_name] && (
                      <div>
                        {table.columns.map((col) => (
                          <div
                            key={col.name}
                            draggable
                            onDragStart={() => handleDragStart(col, table.table_name)}
                            className="flex items-center justify-between px-3 sm:px-4 py-2 cursor-move hover:bg-muted/50 transition-colors group border-b border-border/30 last:border-b-0"
                          >
                            <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                              <span className="text-sm font-medium text-foreground truncate">{col.name}</span>
                              <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded shrink-0">
                                {col.type}
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAddColumn(col, table.table_name);
                              }}
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right - Custom Dataset Builder */}
          <div className="space-y-4 w-full flex flex-col min-h-0">
            <h2 className="text-base sm:text-lg font-semibold text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
              Your Custom Dataset
            </h2>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Dataset Name</label>
              <Input
                value={customTableName}
                onChange={(e) => setCustomTableName(e.target.value)}
                placeholder="Enter dataset name"
                className="bg-card border-border w-full"
              />
            </div>

            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border border-dashed border-border  overflow-y-auto max-h-[calc(100vh-300px)]  rounded-lg bg-card/50 flex flex-col w-full flex-1 min-h-0"
            >
              {customColumns.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 sm:p-8 ">
                  <LayoutGrid className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground/50 mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
                    Drop columns here
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">
                    Drag from left or click plus icon
                  </p>
                </div>
              ) : (
                <ScrollArea className="flex-1 p-3 sm:p-4">
                  <div className="space-y-2">
                    {customColumns.map((col, index) => (
                      <div
                        key={`${col.table}-${col.name}-${index}`}
                        className="flex items-center justify-between p-2 sm:p-3 bg-background rounded-lg border border-border"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground truncate">{col.name}</span>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {col.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground truncate max-w-[120px] sm:max-w-[180px]">
                            from {col.table}
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveColumn(index)}
                          className="h-8 w-8 p-0 shrink-0 ml-2"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 shrink-0"
              onClick={handleSaveCustomTable}
              disabled={customColumns.length === 0 || !userId || !jobId || isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Custom Dataset
                </>
              )}
            </Button>
          </div>
        </div>

        {/* History Section */}
        {showHistory && (
          <div className="mt-20 sm:mt-8 pt-4 sm:pt-6 border-t border-border w-full shrink-0">
            <div ref={historySectionRef} className="flex items-center gap-2 sm:gap-3 mb-4 scroll-mt-20">
              <History className="h-4 w-4 sm:h-5 sm:w-5 text-primary shrink-0" />
              <h3 className="text-lg sm:text-xl font-semibold text-foreground">Saved Datasets History</h3>
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : localSavedTables.length === 0 && backendDatasets.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                No saved datasets found
              </p>
            ) : (
              <div className="space-y-4 sm:space-y-6 w-full">
                {backendDatasets.length > 0 && (
                  <div className="w-full">
                    <div className="space-y-3 w-full">
                      {backendDatasets.map((ds, idx) => (
                        <div
                          key={`backend-${idx}`}
                          className="flex items-center justify-between p-3 sm:p-4 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors w-full"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <TableIcon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-primary text-sm sm:text-base truncate">{ds.filename}</p>
                              <p className="text-xs sm:text-sm text-muted-foreground truncate">
                                Last modified: {ds.date_modified}
                                {ds.file_size !== undefined && (
                                  <> &middot; {(ds.file_size / 1024).toFixed(1)} KB</>
                                )}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 sm:gap-4 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border w-full shrink-0">
          <Button
            variant="outline"
            onClick={() => navigate("/workflow/data-preview")}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Data Preview
          </Button>

          <Button
            onClick={() => navigate("/workflow/data-quality")}
            className="bg-primary hover:bg-primary/90 w-full sm:w-auto order-1 sm:order-2"
          >
            {isTransferring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                Next: Data Quality
                <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </WorkflowLayout>
  );
}