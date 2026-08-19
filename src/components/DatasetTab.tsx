// import { useState, useEffect, useRef, useCallback } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Card } from "@/components/ui/card";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Search,
//   Eye,
//   Navigation,
//   X,
//   Loader2,
//   Upload,
//   FileSpreadsheet,
//   ChevronRight,
// } from "lucide-react";
// import { format } from "date-fns";
// import { toast } from "sonner";
// import {
//   Dialog,
//   DialogContent,
// } from "@/components/ui/dialog";
// import Header from "@/components/layout/Header-main";

// interface Dataset {
//   id: string;
//   jobName: string;
//   datasetName: string;
//   lastRun: string;
//   completedAt: string;
//   rows: number;
//   columns: number;
//   filePath: string;
//   isScheduled: boolean;
//   job_id?: string;
// }

// interface PreviewData {
//   dataset: string;
//   user_id: string;
//   job_id: string;
//   total_rows: number;
//   total_columns: number;
//   columns: string[];
//   column_types: Record<string, string>;
//   preview_rows: Record<string, any>[];
//   preview_row_count: number;
// }

// // Sheet selection state — holds the pending upload info when API returns
// // status: "sheet_selection_required"
// interface PendingSheetUpload {
//   job_id: string;
//   file_name: string;
//   sheets: string[];
//   file: File;
// }

// const UPLOAD_URL =
//   "https://veriton-webapp-ezbud7exfzb7g8at.eastus-01.azurewebsites.net/datasets/upload/nojob_id";
// const DATASETS_URL = "https://api.veriton.ai/api/service2/datasets";

// const DatasetTab = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [datasetSearch, setDatasetSearch] = useState("");
//   const [datasetDateFilter, setDatasetDateFilter] = useState<Date | undefined>();
//   const [datasets, setDatasets] = useState<Dataset[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [previewDataset, setPreviewDataset] = useState<Dataset | null>(null);
//   const [previewData, setPreviewData] = useState<PreviewData | null>(null);
//   const [previewLoading, setPreviewLoading] = useState(false);
//   const [previewError, setPreviewError] = useState<string | null>(null);

//   // Upload state
//   const [uploading, setUploading] = useState(false);
//   const fileInputRef = useRef<HTMLInputElement>(null);

//   // Sheet selection state
//   const [pendingSheetUpload, setPendingSheetUpload] = useState<PendingSheetUpload | null>(null);
//   const [selectedSheet, setSelectedSheet] = useState<string>("");
//   const [sheetUploading, setSheetUploading] = useState(false);

//   const storedUser = localStorage.getItem("user");
//   const user = storedUser ? JSON.parse(storedUser) : null;
//   const userId = user?.id || user?.user_id;

//   const mapDatasets = (data: any[]): Dataset[] =>
//     data.map((item: any, index: number) => ({
//       id: String(index + 1),
//       jobName: item.job_name || "Unnamed Job",
//       datasetName: item.dataset_name || "Unnamed Dataset",
//       lastRun: item.completed_at
//         ? new Date(item.completed_at).toLocaleString("en-US", {
//             month: "short",
//             day: "numeric",
//             year: "numeric",
//             hour: "numeric",
//             minute: "2-digit",
//             hour12: true,
//           })
//         : "—",
//       completedAt: item.completed_at,
//       rows: item.rows || 0,
//       columns: item.columns_count || 0,
//       filePath: item.file_path || "",
//       isScheduled: item.is_scheduled || false,
//       job_id: item.job_id,
//     }));

//   // ── Fetch / refresh datasets list, extracted so it can be called both on
//   // mount AND whenever the data platform changes (fixes the "needs a
//   // manual page refresh after switching to Databricks" bug). ──────────
//   const fetchDatasets = useCallback(async () => {
//     if (!userId) {
//       toast.error("User not found. Please login again.");
//       setLoading(false);
//       return;
//     }
//     try {
//       setLoading(true);
//       const res = await fetch(`${DATASETS_URL}?user_id=${userId}`);
//       if (!res.ok) throw new Error(`HTTP ${res.status}`);
//       const data = await res.json();
//       setDatasets(mapDatasets(data));
//     } catch (err) {
//       console.error("Failed to fetch datasets:", err);
//       toast.error("Failed to load datasets");
//     } finally {
//       setLoading(false);
//     }
//   }, [userId]);

//   useEffect(() => {
//     fetchDatasets();
//   }, [fetchDatasets]);

//   // Called by <Header /> the instant the data platform changes.
//   const handlePlatformChange = useCallback(
//     (_platform: string) => {
//       fetchDatasets();
//     },
//     [fetchDatasets],
//   );

//   // ── Preview ─────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     if (!previewDataset || !userId || !previewDataset.job_id) return;
//     const fetchPreview = async () => {
//       setPreviewLoading(true);
//       setPreviewError(null);
//       setPreviewData(null);
//       try {
//         const url = `https://api.veriton.ai/api/service2/preview-dataset?user_id=${userId}&job_id=${previewDataset.job_id}&datasetname=${encodeURIComponent(previewDataset.datasetName)}`;
//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`Preview failed: ${res.status}`);
//         setPreviewData(await res.json());
//       } catch (err: any) {
//         setPreviewError(err.message || "Failed to load preview");
//         toast.error("Could not load dataset preview");
//       } finally {
//         setPreviewLoading(false);
//       }
//     };
//     fetchPreview();
//   }, [previewDataset, userId]);

//   // ── File upload ─────────────────────────────────────────────────────────────
//   const handleUploadClick = () => fileInputRef.current?.click();

//   const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     e.target.value = ""; // reset so same file can be re-selected

//     if (!userId) {
//       toast.error("User not found. Please login again.");
//       return;
//     }

//     const allowed = [
//       "text/csv",
//       "application/vnd.ms-excel",
//       "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//       "application/json",
//       "text/plain",
//     ];
//     if (!allowed.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls|json|txt)$/i)) {
//       toast.error("Unsupported file type. Please upload CSV, Excel, JSON, or TXT files.");
//       return;
//     }

//     await uploadFile(file, undefined);
//   };

//   /**
//    * Core upload function.
//    * Pass `sheetName` when re-uploading after sheet selection.
//    */
//   const uploadFile = async (file: File, sheetName: string | undefined) => {
//     try {
//       if (sheetName) {
//         setSheetUploading(true);
//       } else {
//         setUploading(true);
//       }

//       const formData = new FormData();
//       formData.append("user_id", userId);
//       formData.append("dataset", file);
//       if (sheetName) {
//         formData.append("sheet_name", sheetName);
//       }

//       const res = await fetch(UPLOAD_URL, { method: "POST", body: formData });

//       if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

//       const result = await res.json();

//       // ── Multi-sheet Excel detected ──────────────────────────────────────
//       if (result.status === "sheet_selection_required") {
//         setPendingSheetUpload({
//           job_id: result.job_id,
//           file_name: result.file_name,
//           sheets: result.sheets || [],
//           file,
//         });
//         setSelectedSheet(result.sheets?.[0] || "");
//         // Don't close uploading yet — wait for user selection
//         setUploading(false);
//         return;
//       }

//       // ── Success ─────────────────────────────────────────────────────────
//       toast.success(`"${file.name}" uploaded successfully!`);

//       // Close sheet dialog if open
//       if (sheetName) {
//         setPendingSheetUpload(null);
//         setSelectedSheet("");
//       }

//       await fetchDatasets();
//     } catch (err: any) {
//       console.error("Upload error:", err);
//       toast.error(err.message || "Failed to upload dataset");
//     } finally {
//       setUploading(false);
//       setSheetUploading(false);
//     }
//   };

//   // Called when user confirms sheet selection
//   const handleSheetConfirm = async () => {
//     if (!pendingSheetUpload || !selectedSheet) return;
//     await uploadFile(pendingSheetUpload.file, selectedSheet);
//   };

//   // ── Filters ─────────────────────────────────────────────────────────────────
//   const filteredDatasets = datasets.filter((d) => {
//     const matchesSearch = d.datasetName
//       .toLowerCase()
//       .includes(datasetSearch.trim().toLowerCase());
//     let matchesDate = true;
//     if (datasetDateFilter) {
//       const date = new Date(d.completedAt);
//       matchesDate = date.toDateString() === datasetDateFilter.toDateString();
//     }
//     return matchesSearch && matchesDate;
//   });

//   const handleNavigateToPathSelection = (dataset: Dataset) => {
//     if (!dataset.job_id) {
//       toast.error("Missing job ID for this dataset");
//       return;
//     }
//     localStorage.setItem("selected_user_id", userId || "");
//     localStorage.setItem("selected_job_id", dataset.job_id);
//     localStorage.setItem("selected_dataset_name", dataset.datasetName);
//     toast.success(`Navigating with dataset: ${dataset.datasetName}`);
//     navigate("/PathSelection1");
//   };

//   // ────────────────────────────────────────────────────────────────────────────
//   return (
//     <div className="h-screen flex flex-col overflow-hidden bg-background">

//       <Header onDataPlatformChange={handlePlatformChange} />

//       {/* ── Main ── */}
//       <main className="flex-1 overflow-y-auto">
//         <div className="container mx-auto px-6 py-8 max-w-7xl">
//           <div className="space-y-6">

//             {/* Title */}
//             <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
//               <div>
//                 <h2 className="text-2xl font-bold tracking-tight">
//                   All Datasets ({filteredDatasets.length})
//                 </h2>
//                 <p className="text-muted-foreground">View and manage your processed datasets</p>
//               </div>
//             </div>

//             {/* Filters + Upload */}
//             <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
//               {/* Search */}
//               <div className="relative w-full sm:w-80 lg:w-96">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
//                 <Input
//                   placeholder="Search dataset name..."
//                   value={datasetSearch}
//                   onChange={(e) => setDatasetSearch(e.target.value)}
//                   className="pl-10 pr-10 bg-background border-input focus:border-primary/60 focus:ring-primary/20 transition-colors h-10"
//                 />
//                 {datasetSearch && (
//                   <button onClick={() => setDatasetSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
//                     <X className="h-4 w-4" />
//                   </button>
//                 )}
//               </div>

//               {/* Date filter */}
//               <div className="relative w-40">
//                 <Input
//                   type="date"
//                   value={datasetDateFilter ? format(datasetDateFilter, "yyyy-MM-dd") : ""}
//                   onChange={(e) => setDatasetDateFilter(e.target.value ? new Date(e.target.value) : undefined)}
//                   className="w-full text-center peer pr-10"
//                 />
//                 <label className="absolute left-2 -top-2.5 px-1 text-xs font-medium text-muted-foreground bg-background transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-foreground">
//                   filter by date
//                 </label>
//                 {datasetDateFilter && (
//                   <button onClick={() => setDatasetDateFilter(undefined)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
//                     <X className="h-4 w-4" />
//                   </button>
//                 )}
//               </div>

//               {(datasetSearch || datasetDateFilter) && (
//                 <Button variant="ghost" size="sm" onClick={() => { setDatasetSearch(""); setDatasetDateFilter(undefined); }} className="h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-accent">
//                   Clear all
//                 </Button>
//               )}

//               <div className="flex-1" />

//               {/* Hidden file input */}
//               <input
//                 ref={fileInputRef}
//                 type="file"
//                 accept=".csv,.xlsx,.xls,.json,.txt"
//                 className="hidden"
//                 onChange={handleFileChange}
//               />

//               {/* Upload button */}
//               <Button onClick={handleUploadClick} disabled={uploading} className="h-10 gap-2 px-4">
//                 {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
//                 {uploading ? "Uploading..." : "Upload Dataset"}
//               </Button>
//             </div>

//             {/* Table */}
//             <Card className="border border-border overflow-hidden">
//               {loading ? (
//                 <div className="py-12 text-center text-muted-foreground">Loading datasets...</div>
//               ) : filteredDatasets.length === 0 ? (
//                 <div className="py-12 text-center text-muted-foreground">No datasets found</div>
//               ) : (
//                 <Table>
//                   <TableHeader>
//                     <TableRow className="bg-muted/40 hover:bg-muted/40">
//                       <TableHead className="font-medium">Job Name</TableHead>
//                       <TableHead className="font-medium">Dataset Name</TableHead>
//                       <TableHead className="font-medium">Last Run</TableHead>
//                       <TableHead className="font-medium w-20 text-center">Preview</TableHead>
//                       <TableHead className="font-medium w-20 text-center">Path</TableHead>
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {filteredDatasets.map((dataset) => (
//                       <TableRow key={dataset.id} className="hover:bg-muted/60 transition-colors">
//                         <TableCell className="font-medium">{dataset.jobName}</TableCell>
//                         <TableCell>{dataset.datasetName}</TableCell>
//                         <TableCell className="text-muted-foreground">{dataset.lastRun}</TableCell>
//                         <TableCell className="text-center">
//                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewDataset(dataset)} disabled={!dataset.job_id}>
//                             <Eye className="h-4 w-4" />
//                           </Button>
//                         </TableCell>
//                         <TableCell className="text-center">
//                           <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleNavigateToPathSelection(dataset)}>
//                             <Navigation className="h-4 w-4" />
//                           </Button>
//                         </TableCell>
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               )}
//             </Card>
//           </div>
//         </div>
//       </main>

//       {/* ── Sheet Selection Dialog ── */}
//       {pendingSheetUpload && (
//         <Dialog open={!!pendingSheetUpload} onOpenChange={() => { setPendingSheetUpload(null); setSelectedSheet(""); }}>
//           <DialogContent className="max-w-md overflow-hidden p-0">

//             {/* Header */}
//             <div className="px-6 pt-6 pb-4 border-b border-border">
//               <div className="flex items-center gap-3 mb-1">
//                 <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, hsl(267 84% 60%), hsl(220 90% 60%))" }}>
//                   <FileSpreadsheet className="w-5 h-5 text-white" />
//                 </div>
//                 <div>
//                   <h2 className="text-base font-bold text-foreground">Select a Sheet</h2>
//                   <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[260px]">
//                     {pendingSheetUpload.file_name}
//                   </p>
//                 </div>
//               </div>
//               <p className="text-sm text-muted-foreground mt-2">
//                 This workbook has <span className="font-semibold text-foreground">{pendingSheetUpload.sheets.length} sheets</span>. Choose which one to upload.
//               </p>
//             </div>

//             {/* Sheet list */}
//             <div className="px-4 py-3 max-h-72 overflow-y-auto">
//               <div className="space-y-1.5">
//                 {pendingSheetUpload.sheets.map((sheet, i) => {
//                   const isSelected = selectedSheet === sheet;
//                   return (
//                     <button
//                       key={sheet}
//                       onClick={() => setSelectedSheet(sheet)}
//                       className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left"
//                       style={{
//                         border: isSelected ? "2px solid hsl(267 84% 60%)" : "1.5px solid hsl(var(--border))",
//                         background: isSelected ? "linear-gradient(135deg, hsl(267 84% 60% / 0.12), hsl(220 90% 60% / 0.07))" : "hsl(var(--card))",
//                         boxShadow: isSelected ? "0 0 0 3px hsl(267 84% 60% / 0.15)" : "none",
//                       }}
//                     >
//                       {/* Radio dot */}
//                       <div style={{
//                         width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
//                         border: isSelected ? "2px solid hsl(267 84% 60%)" : "2px solid hsl(var(--border))",
//                         background: isSelected ? "hsl(267 84% 60%)" : "transparent",
//                         display: "flex", alignItems: "center", justifyContent: "center",
//                         transition: "all 0.15s ease",
//                       }}>
//                         {isSelected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
//                       </div>

//                       {/* Sheet name */}
//                       <span
//                         className="flex-1 font-medium truncate"
//                         style={{ color: isSelected ? "hsl(267 84% 55%)" : "hsl(var(--foreground))" }}
//                       >
//                         {sheet}
//                       </span>

//                       {/* Sheet number badge */}
//                       <span className="text-[10px] text-muted-foreground shrink-0">
//                         Sheet {i + 1}
//                       </span>

//                       {isSelected && (
//                         <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(267 84% 60%)" }} />
//                       )}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Footer buttons */}
//             <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
//               <Button
//                 variant="ghost"
//                 onClick={() => { setPendingSheetUpload(null); setSelectedSheet(""); }}
//                 className="text-muted-foreground"
//                 disabled={sheetUploading}
//               >
//                 Cancel
//               </Button>
//               <Button
//                 onClick={handleSheetConfirm}
//                 disabled={!selectedSheet || sheetUploading}
//                 className="gap-2 px-5"
//                 style={{ background: "linear-gradient(135deg, hsl(267 84% 60%), hsl(220 90% 60%))" }}
//               >
//                 {sheetUploading ? (
//                   <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
//                 ) : (
//                   <><Upload className="h-4 w-4" /> Upload "{selectedSheet}"</>
//                 )}
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}

//       {/* ── Dataset Preview Modal ── */}
//       {previewDataset && (
//         <Dialog open={!!previewDataset} onOpenChange={() => { setPreviewDataset(null); setPreviewData(null); setPreviewError(null); }}>
//           <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
//             <div className="mb-4 flex justify-between items-center px-6 pt-6">
//               <div>
//                 <h2 className="text-2xl font-bold text-foreground">Full Data Preview</h2>
//                 <p className="text-muted-foreground mt-1">
//                   Table: <span className="text-primary">{previewDataset.datasetName}</span> •{" "}
//                   {previewData
//                     ? `${previewData.total_columns} columns × ${previewData.total_rows} rows`
//                     : previewLoading ? "loading..." : "—"}
//                 </p>
//               </div>
//               <Button variant="ghost" size="icon" onClick={() => { setPreviewDataset(null); setPreviewData(null); setPreviewError(null); }}>
//                 <X className="h-5 w-5" />
//               </Button>
//             </div>

//             <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
//               {previewLoading ? (
//                 <div className="flex-1 flex items-center justify-center">
//                   <Loader2 className="h-10 w-10 animate-spin text-primary" />
//                 </div>
//               ) : previewError ? (
//                 <div className="flex-1 flex items-center justify-center text-destructive text-center">
//                   <div className="max-w-md">
//                     <p className="font-medium text-lg mb-3">Failed to load preview</p>
//                     <p className="text-sm">{previewError}</p>
//                   </div>
//                 </div>
//               ) : previewData ? (
//                 <div className="flex-1 overflow-auto border border-border rounded-lg">
//                   <table className="w-full min-w-max">
//                     <thead className="sticky top-0 bg-primary text-white">
//                       <tr>
//                         {previewData.columns.map((col) => (
//                           <th key={col} className="text-left p-4 text-sm font-medium whitespace-nowrap border-b border-primary/30">
//                             <div>{col}</div>
//                             <div className="text-xs opacity-80 mt-0.5">{previewData.column_types[col] || "?"}</div>
//                           </th>
//                         ))}
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {previewData.preview_rows.map((row, rowIdx) => (
//                         <tr key={rowIdx} className="border-b border-border hover:bg-muted/50 transition-colors last:border-b-0">
//                           {previewData.columns.map((col) => (
//                             <td key={col} className="p-4 text-sm text-foreground whitespace-nowrap">
//                               {row[col] != null ? String(row[col]) : "-"}
//                             </td>
//                           ))}
//                         </tr>
//                       ))}
//                       {previewData.preview_rows.length === 0 && (
//                         <tr>
//                           <td colSpan={previewData.columns.length || 1} className="p-10 text-center text-muted-foreground">
//                             No preview data available
//                           </td>
//                         </tr>
//                       )}
//                     </tbody>
//                   </table>
//                 </div>
//               ) : (
//                 <div className="flex-1 flex items-center justify-center text-muted-foreground">
//                   Waiting for data...
//                 </div>
//               )}
//             </div>
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// };

// export default DatasetTab;



import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Eye,
  Navigation,
  X,
  Loader2,
  Upload,
  FileSpreadsheet,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import Header from "@/components/layout/Header-main";

interface Dataset {
  id: string;
  jobName: string;
  datasetName: string;
  lastRun: string;
  completedAt: string;
  rows: number;
  columns: number;
  filePath: string;
  isScheduled: boolean;
  job_id?: string;
}

interface PreviewData {
  dataset: string;
  user_id: string;
  job_id: string;
  total_rows: number;
  total_columns: number;
  columns: string[];
  column_types: Record<string, string>;
  preview_rows: Record<string, any>[];
  preview_row_count: number;
}

// Sheet selection state — holds the pending upload info when API returns
// status: "sheet_selection_required"
interface PendingSheetUpload {
  job_id: string;
  file_name: string;
  sheets: string[];
  file: File;
}

const UPLOAD_URL =
  "https://veriton-webapp-ezbud7exfzb7g8at.eastus-01.azurewebsites.net/datasets/upload/nojob_id";
const DATASETS_URL = "https://api.veriton.ai/api/service2/datasets";

/**
 * Reads the "user" object from localStorage and returns true if the user's
 * dataplatform is "Databricks". Same check used across the other workflow
 * pages (Data Quality / NER / Business Logic / Data Preview / Create
 * Dataset / ETL Output).
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

interface DatabricksScheduledDataset {
  job_id: string;
  job_name: string;
  dataset_name: string;
  last_run: string | null;
}

interface DatabricksListScheduledDatasetsResponse {
  user_id: string;
  datasets: DatabricksScheduledDataset[];
}

interface DatabricksPreviewDatasetResponse {
  user_id: string;
  job_id: string;
  filename: string;
  rows: Record<string, any>[];
}

const databricksListScheduledDatasetsUrl = (userId: string) =>
  `https://api.veriton.ai/api/service-databricks/list-scheduled-datasets?user_id=${userId}`;

const databricksPreviewDatasetUrl = (userId: string, jobId: string, filename: string) =>
  `https://api.veriton.ai/api/service-databricks/preview-dataset?user_id=${userId}&job_id=${jobId}&filename=${encodeURIComponent(
    filename,
  )}`;

const DatasetTab = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [datasetSearch, setDatasetSearch] = useState("");
  const [datasetDateFilter, setDatasetDateFilter] = useState<Date | undefined>();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);

  const [previewDataset, setPreviewDataset] = useState<Dataset | null>(null);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  // Upload state
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sheet selection state
  const [pendingSheetUpload, setPendingSheetUpload] = useState<PendingSheetUpload | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>("");
  const [sheetUploading, setSheetUploading] = useState(false);

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const userId = user?.id || user?.user_id;

  const mapDatasets = (data: any[]): Dataset[] =>
    data.map((item: any, index: number) => ({
      id: String(index + 1),
      jobName: item.job_name || "Unnamed Job",
      datasetName: item.dataset_name || "Unnamed Dataset",
      lastRun: item.completed_at
        ? new Date(item.completed_at).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })
        : "—",
      completedAt: item.completed_at,
      rows: item.rows || 0,
      columns: item.columns_count || 0,
      filePath: item.file_path || "",
      isScheduled: item.is_scheduled || false,
      job_id: item.job_id,
    }));

  // ── NEW: Databricks-platform mapper for /list-scheduled-datasets ────────
  // That endpoint only returns job_id / job_name / dataset_name / last_run
  // (no row/column counts or file path), and every row it returns comes
  // from a scheduled job by definition, so isScheduled is always true here.
  const mapDatabricksScheduledDatasets = (
    data: DatabricksScheduledDataset[],
  ): Dataset[] =>
    data.map((item, index) => ({
      id: String(index + 1),
      jobName: item.job_name || "Unnamed Job",
      datasetName: item.dataset_name || "Unnamed Dataset",
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
      completedAt: item.last_run || "",
      rows: 0,
      columns: 0,
      filePath: "",
      isScheduled: true,
      job_id: item.job_id,
    }));

  // ── Fetch / refresh datasets list, extracted so it can be called both on
  // mount AND whenever the data platform changes (fixes the "needs a
  // manual page refresh after switching to Databricks" bug). ──────────
  const fetchDatasets = useCallback(async () => {
    if (!userId) {
      toast.error("User not found. Please login again.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);

      if (isDatabricksUser()) {
        // ── NEW: Databricks datasets fetch via /list-scheduled-datasets ──
        const res = await fetch(databricksListScheduledDatasetsUrl(userId));
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: DatabricksListScheduledDatasetsResponse = await res.json();
        setDatasets(mapDatabricksScheduledDatasets(data.datasets || []));
      } else {
        // ── Existing default (non-Databricks) datasets fetch — unchanged ─
        const res = await fetch(`${DATASETS_URL}?user_id=${userId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setDatasets(mapDatasets(data));
      }
    } catch (err) {
      console.error("Failed to fetch datasets:", err);
      toast.error("Failed to load datasets");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchDatasets();
  }, [fetchDatasets]);

  // Called by <Header /> the instant the data platform changes.
  const handlePlatformChange = useCallback(
    (_platform: string) => {
      fetchDatasets();
    },
    [fetchDatasets],
  );

  // ── Preview ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!previewDataset || !userId || !previewDataset.job_id) return;
    const fetchPreview = async () => {
      setPreviewLoading(true);
      setPreviewError(null);
      setPreviewData(null);
      try {
        if (isDatabricksUser()) {
          // ── NEW: Databricks preview fetch via /preview-dataset ────────────
          const url = databricksPreviewDatasetUrl(
            userId,
            previewDataset.job_id!,
            previewDataset.datasetName,
          );
          const res = await fetch(url, { headers: { accept: "application/json" } });
          if (!res.ok) throw new Error(`Preview failed: ${res.status}`);
          const json: DatabricksPreviewDatasetResponse = await res.json();
          const rows = Array.isArray(json?.rows) ? json.rows : [];

          // The Databricks endpoint only returns raw rows — no column list,
          // types, or total-row count — so derive display-friendly versions
          // of those from the first row. total_rows here is best-effort:
          // it reflects only the rows actually returned (a preview sample),
          // not the dataset's true full row count.
          const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
          const column_types: Record<string, string> = {};
          columns.forEach((col) => {
            const sampleValue = rows[0]?.[col];
            column_types[col] =
              typeof sampleValue === "number"
                ? "number"
                : typeof sampleValue === "boolean"
                  ? "boolean"
                  : "string";
          });

          setPreviewData({
            dataset: previewDataset.datasetName,
            user_id: json.user_id,
            job_id: json.job_id,
            total_rows: rows.length,
            total_columns: columns.length,
            columns,
            column_types,
            preview_rows: rows,
            preview_row_count: rows.length,
          });
        } else {
          // ── Existing default (non-Databricks) preview fetch — unchanged ──
          const url = `https://api.veriton.ai/api/service2/preview-dataset?user_id=${userId}&job_id=${previewDataset.job_id}&datasetname=${encodeURIComponent(previewDataset.datasetName)}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Preview failed: ${res.status}`);
          setPreviewData(await res.json());
        }
      } catch (err: any) {
        setPreviewError(err.message || "Failed to load preview");
        toast.error("Could not load dataset preview");
      } finally {
        setPreviewLoading(false);
      }
    };
    fetchPreview();
  }, [previewDataset, userId]);

  // ── File upload ─────────────────────────────────────────────────────────────
  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset so same file can be re-selected

    if (!userId) {
      toast.error("User not found. Please login again.");
      return;
    }

    const allowed = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/json",
      "text/plain",
    ];
    if (!allowed.includes(file.type) && !file.name.match(/\.(csv|xlsx|xls|json|txt)$/i)) {
      toast.error("Unsupported file type. Please upload CSV, Excel, JSON, or TXT files.");
      return;
    }

    await uploadFile(file, undefined);
  };

  /**
   * Core upload function.
   * Pass `sheetName` when re-uploading after sheet selection.
   */
  const uploadFile = async (file: File, sheetName: string | undefined) => {
    try {
      if (sheetName) {
        setSheetUploading(true);
      } else {
        setUploading(true);
      }

      const formData = new FormData();
      formData.append("user_id", userId);
      formData.append("dataset", file);
      if (sheetName) {
        formData.append("sheet_name", sheetName);
      }

      const res = await fetch(UPLOAD_URL, { method: "POST", body: formData });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

      const result = await res.json();

      // ── Multi-sheet Excel detected ──────────────────────────────────────
      if (result.status === "sheet_selection_required") {
        setPendingSheetUpload({
          job_id: result.job_id,
          file_name: result.file_name,
          sheets: result.sheets || [],
          file,
        });
        setSelectedSheet(result.sheets?.[0] || "");
        // Don't close uploading yet — wait for user selection
        setUploading(false);
        return;
      }

      // ── Success ─────────────────────────────────────────────────────────
      toast.success(`"${file.name}" uploaded successfully!`);

      // Close sheet dialog if open
      if (sheetName) {
        setPendingSheetUpload(null);
        setSelectedSheet("");
      }

      await fetchDatasets();
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(err.message || "Failed to upload dataset");
    } finally {
      setUploading(false);
      setSheetUploading(false);
    }
  };

  // Called when user confirms sheet selection
  const handleSheetConfirm = async () => {
    if (!pendingSheetUpload || !selectedSheet) return;
    await uploadFile(pendingSheetUpload.file, selectedSheet);
  };

  // ── Filters ─────────────────────────────────────────────────────────────────
  const filteredDatasets = datasets.filter((d) => {
    const matchesSearch = d.datasetName
      .toLowerCase()
      .includes(datasetSearch.trim().toLowerCase());
    let matchesDate = true;
    if (datasetDateFilter) {
      const date = new Date(d.completedAt);
      matchesDate = date.toDateString() === datasetDateFilter.toDateString();
    }
    return matchesSearch && matchesDate;
  });

  const handleNavigateToPathSelection = (dataset: Dataset) => {
    if (!dataset.job_id) {
      toast.error("Missing job ID for this dataset");
      return;
    }
    localStorage.setItem("selected_user_id", userId || "");
    localStorage.setItem("selected_job_id", dataset.job_id);
    localStorage.setItem("selected_dataset_name", dataset.datasetName);
    toast.success(`Navigating with dataset: ${dataset.datasetName}`);
    navigate("/PathSelection1");
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">

      <Header onDataPlatformChange={handlePlatformChange} />

      {/* ── Main ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-6 py-8 max-w-7xl">
          <div className="space-y-6">

            {/* Title */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  All Datasets ({filteredDatasets.length})
                </h2>
                <p className="text-muted-foreground">View and manage your processed datasets</p>
              </div>
            </div>

            {/* Filters + Upload */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-wrap">
              {/* Search */}
              <div className="relative w-full sm:w-80 lg:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  placeholder="Search dataset name..."
                  value={datasetSearch}
                  onChange={(e) => setDatasetSearch(e.target.value)}
                  className="pl-10 pr-10 bg-background border-input focus:border-primary/60 focus:ring-primary/20 transition-colors h-10"
                />
                {datasetSearch && (
                  <button onClick={() => setDatasetSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Date filter */}
              <div className="relative w-40">
                <Input
                  type="date"
                  value={datasetDateFilter ? format(datasetDateFilter, "yyyy-MM-dd") : ""}
                  onChange={(e) => setDatasetDateFilter(e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full text-center peer pr-10"
                />
                <label className="absolute left-2 -top-2.5 px-1 text-xs font-medium text-muted-foreground bg-background transition-all peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-sm peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-foreground">
                  filter by date
                </label>
                {datasetDateFilter && (
                  <button onClick={() => setDatasetDateFilter(undefined)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {(datasetSearch || datasetDateFilter) && (
                <Button variant="ghost" size="sm" onClick={() => { setDatasetSearch(""); setDatasetDateFilter(undefined); }} className="h-10 px-3 text-muted-foreground hover:text-foreground hover:bg-accent">
                  Clear all
                </Button>
              )}

              <div className="flex-1" />

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json,.txt"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Upload button */}
              <Button onClick={handleUploadClick} disabled={uploading} className="h-10 gap-2 px-4">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Uploading..." : "Upload Dataset"}
              </Button>
            </div>

            {/* Table */}
            <Card className="border border-border overflow-hidden">
              {loading ? (
                <div className="py-12 text-center text-muted-foreground">Loading datasets...</div>
              ) : filteredDatasets.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground">No datasets found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/40 hover:bg-muted/40">
                      <TableHead className="font-medium">Job Name</TableHead>
                      <TableHead className="font-medium">Dataset Name</TableHead>
                      <TableHead className="font-medium">Last Run</TableHead>
                      <TableHead className="font-medium w-20 text-center">Preview</TableHead>
                      <TableHead className="font-medium w-20 text-center">Path</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDatasets.map((dataset) => (
                      <TableRow key={dataset.id} className="hover:bg-muted/60 transition-colors">
                        <TableCell className="font-medium">{dataset.jobName}</TableCell>
                        <TableCell>{dataset.datasetName}</TableCell>
                        <TableCell className="text-muted-foreground">{dataset.lastRun}</TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setPreviewDataset(dataset)} disabled={!dataset.job_id}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleNavigateToPathSelection(dataset)}>
                            <Navigation className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Card>
          </div>
        </div>
      </main>

      {/* ── Sheet Selection Dialog ── */}
      {pendingSheetUpload && (
        <Dialog open={!!pendingSheetUpload} onOpenChange={() => { setPendingSheetUpload(null); setSelectedSheet(""); }}>
          <DialogContent className="max-w-md overflow-hidden p-0">

            {/* Header */}
            <div className="px-6 pt-6 pb-4 border-b border-border">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, hsl(267 84% 60%), hsl(220 90% 60%))" }}>
                  <FileSpreadsheet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Select a Sheet</h2>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate max-w-[260px]">
                    {pendingSheetUpload.file_name}
                  </p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                This workbook has <span className="font-semibold text-foreground">{pendingSheetUpload.sheets.length} sheets</span>. Choose which one to upload.
              </p>
            </div>

            {/* Sheet list */}
            <div className="px-4 py-3 max-h-72 overflow-y-auto">
              <div className="space-y-1.5">
                {pendingSheetUpload.sheets.map((sheet, i) => {
                  const isSelected = selectedSheet === sheet;
                  return (
                    <button
                      key={sheet}
                      onClick={() => setSelectedSheet(sheet)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all text-left"
                      style={{
                        border: isSelected ? "2px solid hsl(267 84% 60%)" : "1.5px solid hsl(var(--border))",
                        background: isSelected ? "linear-gradient(135deg, hsl(267 84% 60% / 0.12), hsl(220 90% 60% / 0.07))" : "hsl(var(--card))",
                        boxShadow: isSelected ? "0 0 0 3px hsl(267 84% 60% / 0.15)" : "none",
                      }}
                    >
                      {/* Radio dot */}
                      <div style={{
                        width: 16, height: 16, borderRadius: "50%", flexShrink: 0,
                        border: isSelected ? "2px solid hsl(267 84% 60%)" : "2px solid hsl(var(--border))",
                        background: isSelected ? "hsl(267 84% 60%)" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}>
                        {isSelected && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                      </div>

                      {/* Sheet name */}
                      <span
                        className="flex-1 font-medium truncate"
                        style={{ color: isSelected ? "hsl(267 84% 55%)" : "hsl(var(--foreground))" }}
                      >
                        {sheet}
                      </span>

                      {/* Sheet number badge */}
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        Sheet {i + 1}
                      </span>

                      {isSelected && (
                        <ChevronRight className="w-3.5 h-3.5 shrink-0" style={{ color: "hsl(267 84% 60%)" }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Footer buttons */}
            <div className="px-6 py-4 border-t border-border flex items-center justify-between gap-3">
              <Button
                variant="ghost"
                onClick={() => { setPendingSheetUpload(null); setSelectedSheet(""); }}
                className="text-muted-foreground"
                disabled={sheetUploading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSheetConfirm}
                disabled={!selectedSheet || sheetUploading}
                className="gap-2 px-5"
                style={{ background: "linear-gradient(135deg, hsl(267 84% 60%), hsl(220 90% 60%))" }}
              >
                {sheetUploading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Uploading…</>
                ) : (
                  <><Upload className="h-4 w-4" /> Upload "{selectedSheet}"</>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* ── Dataset Preview Modal ── */}
      {previewDataset && (
        <Dialog open={!!previewDataset} onOpenChange={() => { setPreviewDataset(null); setPreviewData(null); setPreviewError(null); }}>
          <DialogContent className="max-w-5xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="mb-4 flex justify-between items-center px-6 pt-6">
              <div>
                <h2 className="text-2xl font-bold text-foreground">Full Data Preview</h2>
                <p className="text-muted-foreground mt-1">
                  Table: <span className="text-primary">{previewDataset.datasetName}</span> •{" "}
                  {previewData
                    ? `${previewData.total_columns} columns × ${previewData.total_rows} rows`
                    : previewLoading ? "loading..." : "—"}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => { setPreviewDataset(null); setPreviewData(null); setPreviewError(null); }}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="flex-1 px-6 pb-6 overflow-hidden flex flex-col">
              {previewLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-10 w-10 animate-spin text-primary" />
                </div>
              ) : previewError ? (
                <div className="flex-1 flex items-center justify-center text-destructive text-center">
                  <div className="max-w-md">
                    <p className="font-medium text-lg mb-3">Failed to load preview</p>
                    <p className="text-sm">{previewError}</p>
                  </div>
                </div>
              ) : previewData ? (
                <div className="flex-1 overflow-auto border border-border rounded-lg">
                  <table className="w-full min-w-max">
                    <thead className="sticky top-0 bg-primary text-white">
                      <tr>
                        {previewData.columns.map((col) => (
                          <th key={col} className="text-left p-4 text-sm font-medium whitespace-nowrap border-b border-primary/30">
                            <div>{col}</div>
                            <div className="text-xs opacity-80 mt-0.5">{previewData.column_types[col] || "?"}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.preview_rows.map((row, rowIdx) => (
                        <tr key={rowIdx} className="border-b border-border hover:bg-muted/50 transition-colors last:border-b-0">
                          {previewData.columns.map((col) => (
                            <td key={col} className="p-4 text-sm text-foreground whitespace-nowrap">
                              {row[col] != null ? String(row[col]) : "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                      {previewData.preview_rows.length === 0 && (
                        <tr>
                          <td colSpan={previewData.columns.length || 1} className="p-10 text-center text-muted-foreground">
                            No preview data available
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-muted-foreground">
                  Waiting for data...
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DatasetTab;