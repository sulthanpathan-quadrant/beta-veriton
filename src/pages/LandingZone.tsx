// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { WorkflowLayout } from "@/components/WorkflowLayout";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableHeader,
//   TableRow,
// } from "@/components/ui/table";
// import {
//   Pagination,
//   PaginationContent,
//   PaginationItem,
//   PaginationLink,
//   PaginationNext,
//   PaginationPrevious,
//   PaginationEllipsis,
// } from "@/components/ui/pagination";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { SchemaPreviewDialog } from "@/components/SchemaPreviewDialog";
// import { Search, Plus, Eye, Trash2, Loader2, X } from "lucide-react";
// import { toast } from "sonner";
// import {
//   processJobForModeling,
//   getProcessingStatus,
// } from "@/components/api/api.ts";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// interface Document {
//   source: string;
//   filename: string;
//   file_type: string;
// }
// interface ApiResponse {
//   user_id: string;
//   job_id: string;
//   status: string;
//   documents: Document[];
// }
// interface TableRowData {
//   id: string;
//   fileName: string;
//   source: string;
//   type: string;
// }
// // Progress steps for the modeling pipeline
// const modelingSteps = [
//   { label: "Detecting Tables", threshold: 10 },
//   { label: "Transferring Data", threshold: 35 },
//   { label: "Processing Model", threshold: 60 },
//   { label: "Building Schema", threshold: 85 },
//   { label: "Done", threshold: 100 },
// ];
// export default function LandingZone() {
//   const navigate = useNavigate();
//   const [schemaPreviewOpen, setSchemaPreviewOpen] = useState(false);
//   const [previewFileName, setPreviewFileName] = useState("");
//   const [previewData, setPreviewData] = useState<any>(null);
//   const [previewLoading, setPreviewLoading] = useState(false);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [sourceFilter, setSourceFilter] = useState("all");
//   const [typeFilter, setTypeFilter] = useState("all");
//   const [data, setData] = useState<TableRowData[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [processingToModeling, setProcessingToModeling] = useState(false);
//   // ── NEW: progress bar state ──────────────────────────────────────────────
//   const [modelingProgress, setModelingProgress] = useState(0);
//   const [modelingStatus, setModelingStatus] = useState("");
//   // ────────────────────────────────────────────────────────────────────────
//   const [currentPage, setCurrentPage] = useState(1);
//   const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
//   const [fileToDelete, setFileToDelete] = useState<string | null>(null);
//   const itemsPerPage = 4;
//   const userId = localStorage.getItem("user")
//     ? JSON.parse(localStorage.getItem("user") || "{}").id
//     : null;
//   const jobId = localStorage.getItem("current_job_id");
//   // Reusable close button for all toasts (Sonner style)
//   const closeToastButton = (
//     <button
//       onClick={() => toast.dismiss()}
//       className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
//       aria-label="Close toast"
//     >
//       <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
//     </button>
//   );
//   // Fetch documents list
//   // useEffect(() => {
//   //   if (!userId || !jobId) {
//   //     toast.error("Missing user or job information. Please complete ingestion first.", {
//   //       duration: 4000,
//   //       action: closeToastButton,
//   //     });
//   //     setLoading(false);
//   //     return;
//   //   }
//   //   const fetchDocuments = async () => {
//   //     try {
//   //       setLoading(true);
//   //       const response = await fetch(`https://api.veriton.ai/api/service1/view-documents/${userId}/${jobId}`);
//   //       if (!response.ok) throw new Error("Failed to fetch files");
//   //       const result: ApiResponse = await response.json();
//   //       if (result.documents && result.documents.length > 0) {
//   //         const formattedData: TableRowData[] = result.documents.map((doc, index) => ({
//   //           id: `${index + 1}`,
//   //           fileName: doc.filename,
//   //           source: doc.source.toUpperCase(),
//   //           type: doc.file_type.toUpperCase().replace(".", ""),
//   //         }));
//   //         setData(formattedData);
//   //       } else {
//   //         setData([]);
//   //         toast.info("No documents found for this job.", {
//   //           duration: 3000,
//   //           action: closeToastButton,
//   //         });
//   //       }
//   //     } catch (error) {
//   //       console.error("Error fetching documents:", error);
//   //       toast.error("Please ingest the data", {
//   //         duration: 1000,
//   //         action: closeToastButton,
//   //       });
//   //       setData([]);
//   //     } finally {
//   //       setLoading(false);
//   //     }
//   //   };
//   //   fetchDocuments();
//   // }, [userId, jobId]);

//   // Fetch documents list — extracted so it can be reused after delete
//   const fetchDocuments = async () => {
//     if (!userId || !jobId) return;
//     try {
//       setLoading(true);
//       const response = await fetch(
//         `https://api.veriton.ai/api/service1/view-documents/${userId}/${jobId}`,
//       );
//       if (!response.ok) throw new Error("Failed to fetch files");
//       const result: ApiResponse = await response.json();
//       if (result.documents && result.documents.length > 0) {
//         const localFilesKey = `local_files_${jobId}`;

//         const localFileNames: string[] = JSON.parse(
//           localStorage.getItem(localFilesKey) || "[]",
//         );

//         const formattedData: TableRowData[] = result.documents.map(
//           (doc, index) => ({
//             id: `${index + 1}`,

//             fileName: doc.filename,

//             source: localFileNames.includes(doc.filename)
//               ? "LOCAL"
//               : doc.source.toUpperCase(),

//             type: doc.file_type.toUpperCase().replace(".", ""),
//           }),
//         );

//         setData(formattedData);
//       } else {
//         setData([]);
//         toast.info("No documents found for this job.", {
//           duration: 3000,
//           action: closeToastButton,
//         });
//       }
//     } catch (error) {
//       console.error("Error fetching documents:", error);
//       toast.error("Please ingest the data", {
//         duration: 1000,
//         action: closeToastButton,
//       });
//       setData([]);
//     } finally {
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     if (!userId || !jobId) {
//       toast.error(
//         "Missing user or job information. Please complete ingestion first.",
//         {
//           duration: 4000,
//           action: closeToastButton,
//         },
//       );
//       setLoading(false);
//       return;
//     }
//     fetchDocuments();
//   }, [userId, jobId]);
//   // Preview file
//   const openPreview = async (fileName: string) => {
//     if (!userId || !jobId) {
//       toast.error("Missing user or job information", {
//         duration: 3000,
//         action: closeToastButton,
//       });
//       return;
//     }
//     setPreviewFileName(fileName);
//     setPreviewLoading(true);
//     setPreviewData(null);
//     setSchemaPreviewOpen(true);
//     try {
//       const encodedFileName = encodeURIComponent(fileName);
//       const response = await fetch(
//         `https://api.veriton.ai/api/service1/preview-file/${userId}/${jobId}/${encodedFileName}`,
//       );
//       if (response.ok) {
//         const data = await response.json();
//         setPreviewData(data);
//       } else {
//         const error = await response.json();
//         throw new Error(error.detail || "File not found");
//       }
//     } catch (error: any) {
//       toast.error(error.message || "Failed to preview file", {
//         duration: 4000,
//         action: closeToastButton,
//       });
//       setPreviewData({ error: error.message });
//     } finally {
//       setPreviewLoading(false);
//     }
//   };
//   const handleDelete = (fileName: string) => {
//     setFileToDelete(fileName);
//     setDeleteConfirmOpen(true);
//   };
//   const confirmDelete = async () => {
//     if (!fileToDelete || !userId || !jobId) {
//       toast.error("Missing file or job information", {
//         duration: 3000,
//         action: closeToastButton,
//       });
//       return;
//     }
//     try {
//       const encodedFileName = encodeURIComponent(fileToDelete);
//       const response = await fetch(
//         `https://api.veriton.ai/api/service1/delete-file/${userId}/${jobId}/${encodedFileName}`,
//         { method: "DELETE" },
//       );
//       if (response.ok) {
//         toast.success(`"${fileToDelete}" deleted successfully`, {
//           duration: 3000,
//           action: closeToastButton,
//         });
//         // setData(prev => prev.filter(item => item.fileName !== fileToDelete));
//         await fetchDocuments();
//       } else {
//         const error = await response.json();
//         throw new Error(error.detail || "Failed to delete file");
//       }
//     } catch (error: any) {
//       toast.error(error.message || "Failed to delete file", {
//         duration: 4000,
//         action: closeToastButton,
//       });
//     } finally {
//       setDeleteConfirmOpen(false);
//       setFileToDelete(null);
//     }
//   };
//   const handleProceedToModeling = async () => {
//     if (!userId || !jobId) {
//       toast.error("Missing user or job information", {
//         duration: 3000,
//         action: closeToastButton,
//       });
//       return;
//     }
//     if (data.length === 0) {
//       toast.warning("No files available. Please ingest some data first.", {
//         duration: 3000,
//         action: closeToastButton,
//       });
//       return;
//     }
//     setProcessingToModeling(true);
//     setModelingProgress(10);
//     setModelingStatus("Detecting fact & dimension tables...");
//     try {
//       // Step 1: Detect fact-dimension
//       const detectResponse = await fetch(
//         `https://api.veriton.ai/api/service1/detect-fact-dimension?user_id=${userId}&job_id=${jobId}`,
//         {
//           method: "POST",
//           headers: { Accept: "application/json" },
//         },
//       );
//       if (!detectResponse.ok) {
//         throw new Error(
//           `Fact/Dimension detection failed: ${await detectResponse.text()}`,
//         );
//       }
//       setModelingProgress(35);
//       setModelingStatus("Transferring data to OneLake...");
//       // Step 2: Transfer to OneLake
//       const transferResponse = await fetch(
//         "https://api.veriton.ai/api/service1/transferfromblobtoonelake-relation",
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ user_id: userId, job_id: jobId }),
//         },
//       );
//       if (!transferResponse.ok) {
//         throw new Error(
//           `Transfer to OneLake failed: ${await transferResponse.text()}`,
//         );
//       }
//       setModelingProgress(60);
//       setModelingStatus("Processing data model...");
//       // Step 3: Process job for modeling
//       await processJobForModeling({ user_id: userId, job_id: jobId });
//       setModelingProgress(75);
//       setModelingStatus("Building star schema...");
//       // Step 4: Poll for status until completed
//       let statusResponse;
//       let attempts = 0;
//       const maxAttempts = 30;
//       while (attempts < maxAttempts) {
//         statusResponse = await getProcessingStatus(userId, jobId);
//         if (statusResponse.status === "completed" && statusResponse.data) {
//           break;
//         } else if (statusResponse.status === "failed") {
//           throw new Error(statusResponse.message || "Processing failed");
//         }
//         // Nudge progress forward slightly while polling (capped at 92)
//         setModelingProgress((prev) => (prev < 92 ? prev + 2 : prev));
//         await new Promise((resolve) => setTimeout(resolve, 10000));
//         attempts++;
//       }
//       if (attempts >= maxAttempts) {
//         throw new Error("Processing timeout - please try again");
//       }
//       setModelingProgress(100);
//       setModelingStatus("Completed! Redirecting...");
//       toast.success("Data model generated successfully!", {
//         duration: 3000,
//         action: closeToastButton,
//       });
//       setTimeout(() => navigate("/workflow/data-modeling"), 800);
//     } catch (error: any) {
//       console.error("Modeling preparation error:", error);
//       toast.error(error.message || "Failed to prepare data for modeling", {
//         duration: 4000,
//         action: closeToastButton,
//       });
//       // Reset progress on failure
//       setModelingProgress(0);
//       setModelingStatus("");
//       setProcessingToModeling(false);
//     }
//   };
//   // Filter data
//   const filteredData = data.filter((item) => {
//     const matchesSearch = item.fileName
//       .toLowerCase()
//       .includes(searchQuery.toLowerCase());
//     const matchesSource =
//       sourceFilter === "all" ||
//       item.source.toLowerCase().includes(sourceFilter.toLowerCase());
//     const matchesType =
//       typeFilter === "all" ||
//       item.type.toLowerCase() === typeFilter.toLowerCase();
//     return matchesSearch && matchesSource && matchesType;
//   });
//   // Pagination
//   const totalPages = Math.ceil(filteredData.length / itemsPerPage);
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   const currentData = filteredData.slice(startIndex, endIndex);
//   useEffect(() => {
//     if (currentPage > totalPages && totalPages > 0) {
//       setCurrentPage(totalPages);
//     }
//   }, [totalPages, currentPage]);

//   return (
//     <WorkflowLayout>
//       <div className="p-8 max-w-7xl">
//         {/* Header */}
//         <div className="flex justify-between items-start mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground mb-2">
//               Landing Zone
//             </h1>
//             <p className="text-muted-foreground">
//               Manage all raw ingested data files.
//             </p>
//           </div>
//           <Button
//             onClick={() => navigate("/workflow/data-ingestion")}
//             className="gap-2"
//           >
//             <Plus className="h-4 w-4" />
//             New Ingestion
//           </Button>
//         </div>
//         {/* Search and Filters */}
//         <div className="flex flex-col sm:flex-row gap-4 mb-6">
//           <div className="relative flex-1">
//             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
//             <Input
//               placeholder="Search by file name..."
//               className="pl-9"
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//             />
//           </div>
//           <Select value={sourceFilter} onValueChange={setSourceFilter}>
//             <SelectTrigger className="w-full sm:w-40">
//               <SelectValue placeholder="Source: All" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">Source: All</SelectItem>
//               <SelectItem value="s3">S3</SelectItem>
//               <SelectItem value="blob">Blob</SelectItem>
//               <SelectItem value="snowflake">Snowflake</SelectItem>
//               <SelectItem value="onelake">OneLake</SelectItem>
//               <SelectItem value="databricks">Databricks</SelectItem>
//               <SelectItem value="databases">SQL Server</SelectItem>
//             </SelectContent>
//           </Select>
//           <Select value={typeFilter} onValueChange={setTypeFilter}>
//             <SelectTrigger className="w-full sm:w-40">
//               <SelectValue placeholder="File Type: All" />
//             </SelectTrigger>
//             <SelectContent>
//               <SelectItem value="all">File Type: All</SelectItem>
//               <SelectItem value="csv">CSV</SelectItem>
//               <SelectItem value="json">JSON</SelectItem>
//               <SelectItem value="parquet">Parquet</SelectItem>
//             </SelectContent>
//           </Select>
//         </div>
//         {/* Loading State */}
//         {loading ? (
//           <div className="flex flex-col items-center justify-center py-20">
//             <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
//             <p className="text-muted-foreground">Loading ingested files...</p>
//           </div>
//         ) : (
//           <>
//             {/* Data Table */}
//             <div className="border border-border rounded-lg overflow-hidden mb-6">
//               <Table>
//                 <TableHeader>
//                   <TableRow>
//                     <TableHead>File Name</TableHead>
//                     <TableHead>Source</TableHead>
//                     <TableHead>Type</TableHead>
//                     <TableHead>Actions</TableHead>
//                   </TableRow>
//                 </TableHeader>
//                 <TableBody>
//                   {currentData.length === 0 ? (
//                     <TableRow>
//                       <TableCell
//                         colSpan={4}
//                         className="text-center py-10 text-muted-foreground"
//                       >
//                         No files found matching your filters.
//                       </TableCell>
//                     </TableRow>
//                   ) : (
//                     currentData.map((row) => (
//                       <TableRow key={row.id}>
//                         <TableCell className="font-medium">
//                           {row.fileName}
//                         </TableCell>
//                         <TableCell className="text-muted-foreground">
//                           {row.source}
//                         </TableCell>
//                         <TableCell className="text-muted-foreground">
//                           {row.type}
//                         </TableCell>
//                         <TableCell>
//                           <div className="flex items-center gap-2">
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-8 w-8 hover:bg-accent"
//                               onClick={() => openPreview(row.fileName)}
//                             >
//                               <Eye className="h-4 w-4" />
//                             </Button>
//                             <Button
//                               variant="ghost"
//                               size="icon"
//                               className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
//                               onClick={() => handleDelete(row.fileName)}
//                             >
//                               <Trash2 className="h-4 w-4" />
//                             </Button>
//                           </div>
//                         </TableCell>
//                       </TableRow>
//                     ))
//                   )}
//                 </TableBody>
//               </Table>
//             </div>
//             {/* Pagination */}
//             {filteredData.length > itemsPerPage && (
//               <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
//                 <p className="text-sm text-muted-foreground">
//                   Showing {startIndex + 1} to{" "}
//                   {Math.min(endIndex, filteredData.length)} of{" "}
//                   {filteredData.length} files
//                 </p>
//                 <Pagination>
//                   <PaginationContent>
//                     <PaginationItem>
//                       <PaginationPrevious
//                         onClick={() =>
//                           setCurrentPage(Math.max(1, currentPage - 1))
//                         }
//                         className={
//                           currentPage === 1
//                             ? "pointer-events-none opacity-50"
//                             : "cursor-pointer"
//                         }
//                       />
//                     </PaginationItem>
//                     {Array.from(
//                       { length: Math.min(totalPages, 5) },
//                       (_, i) => i + 1,
//                     ).map((page) => (
//                       <PaginationItem key={page}>
//                         <PaginationLink
//                           onClick={() => setCurrentPage(page)}
//                           isActive={currentPage === page}
//                           className="cursor-pointer"
//                         >
//                           {page}
//                         </PaginationLink>
//                       </PaginationItem>
//                     ))}
//                     {totalPages > 5 && (
//                       <>
//                         <PaginationItem>
//                           <PaginationEllipsis />
//                         </PaginationItem>
//                         <PaginationItem>
//                           <PaginationLink
//                             onClick={() => setCurrentPage(totalPages)}
//                             className="cursor-pointer"
//                           >
//                             {totalPages}
//                           </PaginationLink>
//                         </PaginationItem>
//                       </>
//                     )}
//                     <PaginationItem>
//                       <PaginationNext
//                         onClick={() =>
//                           setCurrentPage(Math.min(totalPages, currentPage + 1))
//                         }
//                         className={
//                           currentPage === totalPages
//                             ? "pointer-events-none opacity-50"
//                             : "cursor-pointer"
//                         }
//                       />
//                     </PaginationItem>
//                   </PaginationContent>
//                 </Pagination>
//               </div>
//             )}
//             {/* ── Action Buttons + Progress Bar ── */}
//             <div className="flex flex-col gap-4">
//               {/* Progress UI — only visible while processing to modeling */}
//               {processingToModeling && (
//                 <div className="w-full rounded-xl border border-border bg-card/60 p-5 space-y-4">
//                   {/* Step indicators */}
//                   <div className="flex items-center justify-between">
//                     {modelingSteps.map((step, i) => {
//                       const reached = modelingProgress >= step.threshold;
//                       const active =
//                         modelingProgress >= step.threshold &&
//                         (i === modelingSteps.length - 1 ||
//                           modelingProgress < modelingSteps[i + 1].threshold);
//                       return (
//                         <div
//                           key={step.label}
//                           className="flex flex-col items-center gap-1 flex-1"
//                         >
//                           <div
//                             className={[
//                               "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500",
//                               reached
//                                 ? "bg-primary border-primary text-primary-foreground"
//                                 : "bg-muted border-border text-muted-foreground",
//                               active
//                                 ? "ring-2 ring-primary/40 ring-offset-2"
//                                 : "",
//                             ].join(" ")}
//                           >
//                             {reached && !active ? (
//                               <svg
//                                 className="w-3.5 h-3.5"
//                                 viewBox="0 0 12 12"
//                                 fill="none"
//                               >
//                                 <path
//                                   d="M2 6l3 3 5-5"
//                                   stroke="currentColor"
//                                   strokeWidth="2"
//                                   strokeLinecap="round"
//                                   strokeLinejoin="round"
//                                 />
//                               </svg>
//                             ) : (
//                               i + 1
//                             )}
//                           </div>
//                           <span
//                             className={[
//                               "text-[10px] font-medium text-center leading-tight",
//                               reached
//                                 ? "text-primary"
//                                 : "text-muted-foreground",
//                             ].join(" ")}
//                           >
//                             {step.label}
//                           </span>
//                         </div>
//                       );
//                     })}
//                   </div>
//                   {/* Bar */}
//                   <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
//                     <div
//                       className="h-full rounded-full transition-all duration-700 ease-in-out"
//                       style={{
//                         width: `${modelingProgress}%`,
//                         background:
//                           modelingProgress === 100
//                             ? "hsl(var(--primary))"
//                             : "linear-gradient(90deg, hsl(var(--primary)/0.7), hsl(var(--primary)))",
//                       }}
//                     />
//                   </div>
//                   {/* Status text + percentage */}
//                   <div className="flex items-center justify-between text-sm">
//                     <div className="flex items-center gap-2 text-muted-foreground">
//                       {modelingProgress < 100 ? (
//                         <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
//                       ) : (
//                         <svg
//                           className="w-3.5 h-3.5 text-primary flex-shrink-0"
//                           viewBox="0 0 12 12"
//                           fill="none"
//                         >
//                           <path
//                             d="M2 6l3 3 5-5"
//                             stroke="currentColor"
//                             strokeWidth="2"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                           />
//                         </svg>
//                       )}
//                       <span>{modelingStatus}</span>
//                     </div>
//                     <span className="font-semibold text-primary tabular-nums">
//                       {modelingProgress}%
//                     </span>
//                   </div>
//                   {modelingProgress < 100 && (
//                     <p className="text-xs text-muted-foreground">
//                       Please wait — building your data model may take a few
//                       minutes.
//                     </p>
//                   )}
//                 </div>
//               )}
//               {/* Back + Proceed row */}
//               <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
//                 <Button
//                   variant="outline"
//                   onClick={() => navigate("/workflow/data-ingestion")}
//                 >
//                   Back
//                 </Button>
//                 <Button
//                   onClick={handleProceedToModeling}
//                   size="lg"
//                   className="px-8 gap-2 w-full sm:w-auto"
//                   disabled={
//                     data.length === 0 || loading || processingToModeling
//                   }
//                 >
//                   {processingToModeling ? (
//                     <>
//                       <Loader2 className="h-4 w-4 animate-spin" />
//                       Processing...
//                     </>
//                   ) : (
//                     "Proceed to Data Modeling"
//                   )}
//                 </Button>
//               </div>
//             </div>
//           </>
//         )}
//         {/* Delete Confirmation Dialog */}
//         <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
//           <DialogContent className="sm:max-w-md">
//             <DialogHeader>
//               <DialogTitle className="text-2xl font-bold text-center">
//                 Confirm delete
//               </DialogTitle>
//             </DialogHeader>
//             <div className="py-6 text-center">
//               <p className="text-lg text-foreground">
//                 Are you sure you want to delete
//                 <span className="font-semibold"> "{fileToDelete}"</span>?
//               </p>
//             </div>
//             <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-center mt-8">
//               <Button
//                 variant="ghost"
//                 size="lg"
//                 className="text-muted-foreground hover:text-foreground"
//                 onClick={() => {
//                   setDeleteConfirmOpen(false);
//                   setFileToDelete(null);
//                 }}
//               >
//                 No, keep it
//               </Button>
//               <Button
//                 variant="destructive"
//                 size="lg"
//                 className="min-w-48"
//                 onClick={confirmDelete}
//               >
//                 Yes, delete it
//               </Button>
//             </div>
//           </DialogContent>
//         </Dialog>
//         {/* Schema Preview Dialog */}
//         <SchemaPreviewDialog
//           open={schemaPreviewOpen}
//           onOpenChange={setSchemaPreviewOpen}
//           fileName={previewFileName}
//           previewData={previewData}
//           loading={previewLoading}
//         />
//       </div>
//     </WorkflowLayout>
//   );
// }



import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SchemaPreviewDialog } from "@/components/SchemaPreviewDialog";
import { Search, Plus, Eye, Trash2, Loader2, X } from "lucide-react";
import { toast } from "sonner";
import {
  processJobForModeling,
  getProcessingStatus,
} from "@/components/api/api.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
interface Document {
  source: string;
  filename: string;
  file_type: string;
}
interface ApiResponse {
  user_id: string;
  job_id: string;
  status: string;
  documents: Document[];
}

// ── NEW: shapes returned by the Databricks-platform file APIs ──────────────

interface DatabricksFile {
  filename: string;
  source_type: string;
  type: string;
}

interface DatabricksListFilesResponse {
  user_id: string;
  job_id: string;
  files: DatabricksFile[];
}

interface TableRowData {
  id: string;
  fileName: string;
  source: string;
  type: string;
}

// ── NEW: helpers for the Databricks-platform file routes ───────────────────

/**
 * Reads the "user" object from localStorage and returns true if the user's
 * dataplatform is "Databricks". This decides which set of file APIs to call
 * (list-files / preview-data / delete-file vs. the default service1 routes).
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

const databricksListFilesUrl = (userId: string, jobId: string) =>
  `https://api.veriton.ai/api/service-databricks/files/list-files?user_id=${userId}&job_id=${jobId}`;

const databricksPreviewUrl = (
  userId: string,
  jobId: string,
  fileName: string,
) =>
  `https://api.veriton.ai/api/service-databricks/files/preview-data?user_id=${userId}&job_id=${jobId}&file_name=${fileName}`;

const databricksDeleteUrl = (
  userId: string,
  jobId: string,
  fileName: string,
) =>
  `https://api.veriton.ai/api/service-databricks/files/delete-file?user_id=${userId}&job_id=${jobId}&file_name=${fileName}`;

const databricksGenerateDatamodelUrl = (userId: string, jobId: string) =>
  `https://api.veriton.ai/api/service-databricks/datamodel/${userId}/${jobId}`;

/**
 * The Databricks preview-data API returns `{ user_id, job_id, file_name,
 * rows: [...] }`. SchemaPreviewDialog's getTableData() doesn't recognize a
 * bare `rows` array — it only checks `Array.isArray(previewData)` or
 * `previewData.data` (an array of row objects) as its two structured-data
 * paths, otherwise it falls back to "No preview available".
 *
 * This adds a `data: rows` alias (plus `columns`, `row_count`,
 * `column_count` for good measure) so the dialog's existing
 * `previewData.data` branch picks it up and renders the table — without
 * touching the dialog itself or the non-Databricks preview path below.
 */
function normalizeDatabricksPreview(raw: any, fileName: string) {
  const rows: Record<string, any>[] = raw?.rows || [];
  const columns: string[] = rows.length > 0 ? Object.keys(rows[0]) : [];

  return {
    ...raw,

    file_name: raw?.file_name || fileName,

    columns,
    rows,
    data: rows,

    row_count: rows.length,
    column_count: columns.length,
  };
}

// Progress steps for the modeling pipeline
const modelingSteps = [
  { label: "Detecting Tables", threshold: 10 },
  { label: "Transferring Data", threshold: 35 },
  { label: "Processing Model", threshold: 60 },
  { label: "Building Schema", threshold: 85 },
  { label: "Done", threshold: 100 },
];
export default function LandingZone() {
  const navigate = useNavigate();
  const [schemaPreviewOpen, setSchemaPreviewOpen] = useState(false);
  const [previewFileName, setPreviewFileName] = useState("");
  const [previewData, setPreviewData] = useState<any>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [data, setData] = useState<TableRowData[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingToModeling, setProcessingToModeling] = useState(false);
  // ── NEW: progress bar state ──────────────────────────────────────────────
  const [modelingProgress, setModelingProgress] = useState(0);
  const [modelingStatus, setModelingStatus] = useState("");
  // ────────────────────────────────────────────────────────────────────────
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<string | null>(null);
  const itemsPerPage = 4;
  const userId = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}").id
    : null;
  const jobId = localStorage.getItem("current_job_id");
  // Reusable close button for all toasts (Sonner style)
  const closeToastButton = (
    <button
      onClick={() => toast.dismiss()}
      className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
      aria-label="Close toast"
    >
      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
    </button>
  );

  // Fetch documents list — extracted so it can be reused after delete.
  // ── NEW: branches to the Databricks list-files API when the logged-in
  // user's dataplatform is "Databricks", otherwise keeps the existing
  // service1 view-documents call.
  const fetchDocuments = async () => {
    if (!userId || !jobId) return;
    try {
      setLoading(true);

      const useDatabricksRoute = isDatabricksUser();

      const localFilesKey = `local_files_${jobId}`;

      const localFileNames: string[] = JSON.parse(
        localStorage.getItem(localFilesKey) || "[]",
      );

      if (useDatabricksRoute) {
        const response = await fetch(databricksListFilesUrl(userId, jobId));

        if (!response.ok) throw new Error("Failed to fetch files");

        const result: DatabricksListFilesResponse = await response.json();

        if (result.files && result.files.length > 0) {
          const formattedData: TableRowData[] = result.files.map(
            (file, index) => ({
              id: `${index + 1}`,

              fileName: file.filename,

              source: localFileNames.includes(file.filename)
                ? "LOCAL"
                : (file.source_type || "UNKNOWN").toUpperCase(),

              type: (file.type || "").toUpperCase(),
            }),
          );

          setData(formattedData);
        } else {
          setData([]);
          toast.info("No documents found for this job.", {
            duration: 3000,
            action: closeToastButton,
          });
        }
      } else {
        const response = await fetch(
          `https://api.veriton.ai/api/service1/view-documents/${userId}/${jobId}`,
        );
        if (!response.ok) throw new Error("Failed to fetch files");
        const result: ApiResponse = await response.json();
        if (result.documents && result.documents.length > 0) {
          const formattedData: TableRowData[] = result.documents.map(
            (doc, index) => ({
              id: `${index + 1}`,

              fileName: doc.filename,

              source: localFileNames.includes(doc.filename)
                ? "LOCAL"
                : doc.source.toUpperCase(),

              type: doc.file_type.toUpperCase().replace(".", ""),
            }),
          );

          setData(formattedData);
        } else {
          setData([]);
          toast.info("No documents found for this job.", {
            duration: 3000,
            action: closeToastButton,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Please ingest the data", {
        duration: 1000,
        action: closeToastButton,
      });
      setData([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (!userId || !jobId) {
      toast.error(
        "Missing user or job information. Please complete ingestion first.",
        {
          duration: 4000,
          action: closeToastButton,
        },
      );
      setLoading(false);
      return;
    }
    fetchDocuments();
  }, [userId, jobId]);
  // Preview file
  // ── NEW: branches to the Databricks preview-data API when applicable.
  const openPreview = async (fileName: string) => {
    if (!userId || !jobId) {
      toast.error("Missing user or job information", {
        duration: 3000,
        action: closeToastButton,
      });
      return;
    }
    setPreviewFileName(fileName);
    setPreviewLoading(true);
    setPreviewData(null);
    setSchemaPreviewOpen(true);
    try {
      const encodedFileName = encodeURIComponent(fileName);

      const useDatabricksRoute = isDatabricksUser();

      const url = useDatabricksRoute
        ? databricksPreviewUrl(userId, jobId, encodedFileName)
        : `https://api.veriton.ai/api/service1/preview-file/${userId}/${jobId}/${encodedFileName}`;

      const response = await fetch(url);
      if (response.ok) {
        const raw = await response.json();

        const data = useDatabricksRoute
          ? normalizeDatabricksPreview(raw, fileName)
          : raw;

        setPreviewData(data);
      } else {
        const error = await response.json();
        throw new Error(error.detail || "File not found");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to preview file", {
        duration: 4000,
        action: closeToastButton,
      });
      setPreviewData({ error: error.message });
    } finally {
      setPreviewLoading(false);
    }
  };
  const handleDelete = (fileName: string) => {
    setFileToDelete(fileName);
    setDeleteConfirmOpen(true);
  };
  // ── NEW: branches to the Databricks delete-file API when applicable.
  const confirmDelete = async () => {
    if (!fileToDelete || !userId || !jobId) {
      toast.error("Missing file or job information", {
        duration: 3000,
        action: closeToastButton,
      });
      return;
    }
    try {
      const encodedFileName = encodeURIComponent(fileToDelete);

      const useDatabricksRoute = isDatabricksUser();

      const url = useDatabricksRoute
        ? databricksDeleteUrl(userId, jobId, encodedFileName)
        : `https://api.veriton.ai/api/service1/delete-file/${userId}/${jobId}/${encodedFileName}`;

      const response = await fetch(url, { method: "DELETE" });
      if (response.ok) {
        toast.success(`"${fileToDelete}" deleted successfully`, {
          duration: 3000,
          action: closeToastButton,
        });
        // setData(prev => prev.filter(item => item.fileName !== fileToDelete));
        await fetchDocuments();
      } else {
        const error = await response.json();
        throw new Error(error.detail || "Failed to delete file");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete file", {
        duration: 4000,
        action: closeToastButton,
      });
    } finally {
      setDeleteConfirmOpen(false);
      setFileToDelete(null);
    }
  };
  const handleProceedToModeling = async () => {
    if (!userId || !jobId) {
      toast.error("Missing user or job information", {
        duration: 3000,
        action: closeToastButton,
      });
      return;
    }
    if (data.length === 0) {
      toast.warning("No files available. Please ingest some data first.", {
        duration: 3000,
        action: closeToastButton,
      });
      return;
    }
    setProcessingToModeling(true);
    setModelingProgress(10);
    setModelingStatus("Detecting fact & dimension tables...");
    try {
      const useDatabricksRoute = isDatabricksUser();

      if (useDatabricksRoute) {
        // ── NEW: Databricks users get a single call that runs the whole
        // pipeline (metadata extraction → LLM modeling → save) instead of
        // the detect-fact-dimension / OneLake-transfer / process / poll
        // sequence below, which is wired for the default (service1/Fabric)
        // flow and doesn't apply to Databricks.

        setModelingStatus("Generating data model on Databricks...");
        setModelingProgress(30);

        const response = await fetch(
          databricksGenerateDatamodelUrl(userId, jobId),
          {
            method: "POST",
            headers: { Accept: "application/json" },
          },
        );

        if (!response.ok) {
          throw new Error(
            `Data model generation failed: ${await response.text()}`,
          );
        }

        // Body isn't needed here — DataModeling.tsx re-fetches/regenerates
        // the model itself when it loads.
        await response.json();

        setModelingProgress(100);
        setModelingStatus("Completed! Redirecting...");

        toast.success("Data model generated successfully!", {
          duration: 3000,
          action: closeToastButton,
        });

        setTimeout(() => navigate("/workflow/data-modeling"), 800);

        return;
      }

      // Step 1: Detect fact-dimension
      const detectResponse = await fetch(
        `https://api.veriton.ai/api/service1/detect-fact-dimension?user_id=${userId}&job_id=${jobId}`,
        {
          method: "POST",
          headers: { Accept: "application/json" },
        },
      );
      if (!detectResponse.ok) {
        throw new Error(
          `Fact/Dimension detection failed: ${await detectResponse.text()}`,
        );
      }
      setModelingProgress(35);
      setModelingStatus("Transferring data to OneLake...");
      // Step 2: Transfer to OneLake
      const transferResponse = await fetch(
        "https://api.veriton.ai/api/service1/transferfromblobtoonelake-relation",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, job_id: jobId }),
        },
      );
      if (!transferResponse.ok) {
        throw new Error(
          `Transfer to OneLake failed: ${await transferResponse.text()}`,
        );
      }
      setModelingProgress(60);
      setModelingStatus("Processing data model...");
      // Step 3: Process job for modeling
      await processJobForModeling({ user_id: userId, job_id: jobId });
      setModelingProgress(75);
      setModelingStatus("Building star schema...");
      // Step 4: Poll for status until completed
      let statusResponse;
      let attempts = 0;
      const maxAttempts = 30;
      while (attempts < maxAttempts) {
        statusResponse = await getProcessingStatus(userId, jobId);
        if (statusResponse.status === "completed" && statusResponse.data) {
          break;
        } else if (statusResponse.status === "failed") {
          throw new Error(statusResponse.message || "Processing failed");
        }
        // Nudge progress forward slightly while polling (capped at 92)
        setModelingProgress((prev) => (prev < 92 ? prev + 2 : prev));
        await new Promise((resolve) => setTimeout(resolve, 10000));
        attempts++;
      }
      if (attempts >= maxAttempts) {
        throw new Error("Processing timeout - please try again");
      }
      setModelingProgress(100);
      setModelingStatus("Completed! Redirecting...");
      toast.success("Data model generated successfully!", {
        duration: 3000,
        action: closeToastButton,
      });
      setTimeout(() => navigate("/workflow/data-modeling"), 800);
    } catch (error: any) {
      console.error("Modeling preparation error:", error);
      toast.error(error.message || "Failed to prepare data for modeling", {
        duration: 4000,
        action: closeToastButton,
      });
      // Reset progress on failure
      setModelingProgress(0);
      setModelingStatus("");
      setProcessingToModeling(false);
    }
  };
  // Filter data
  const filteredData = data.filter((item) => {
    const matchesSearch = item.fileName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSource =
      sourceFilter === "all" ||
      item.source.toLowerCase().includes(sourceFilter.toLowerCase());
    const matchesType =
      typeFilter === "all" ||
      item.type.toLowerCase() === typeFilter.toLowerCase();
    return matchesSearch && matchesSource && matchesType;
  });
  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  return (
    <WorkflowLayout>
      <div className="p-8 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Landing Zone
            </h1>
            <p className="text-muted-foreground">
              Manage all raw ingested data files.
            </p>
          </div>
          <Button
            onClick={() => navigate("/workflow/data-ingestion")}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Ingestion
          </Button>
        </div>
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by file name..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Source: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Source: All</SelectItem>
              <SelectItem value="s3">S3</SelectItem>
              <SelectItem value="blob">Blob</SelectItem>
              <SelectItem value="snowflake">Snowflake</SelectItem>
              <SelectItem value="onelake">OneLake</SelectItem>
              <SelectItem value="databricks">Databricks</SelectItem>
              <SelectItem value="databases">SQL Server</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="File Type: All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">File Type: All</SelectItem>
              <SelectItem value="csv">CSV</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
              <SelectItem value="parquet">Parquet</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading ingested files...</p>
          </div>
        ) : (
          <>
            {/* Data Table */}
            <div className="border border-border rounded-lg overflow-hidden mb-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>File Name</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentData.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No files found matching your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentData.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">
                          {row.fileName}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.source}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {row.type}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-accent"
                              onClick={() => openPreview(row.fileName)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleDelete(row.fileName)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {/* Pagination */}
            {filteredData.length > itemsPerPage && (
              <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                <p className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to{" "}
                  {Math.min(endIndex, filteredData.length)} of{" "}
                  {filteredData.length} files
                </p>
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                    {Array.from(
                      { length: Math.min(totalPages, 5) },
                      (_, i) => i + 1,
                    ).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => setCurrentPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    {totalPages > 5 && (
                      <>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem>
                          <PaginationLink
                            onClick={() => setCurrentPage(totalPages)}
                            className="cursor-pointer"
                          >
                            {totalPages}
                          </PaginationLink>
                        </PaginationItem>
                      </>
                    )}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
            {/* ── Action Buttons + Progress Bar ── */}
            <div className="flex flex-col gap-4">
              {/* Progress UI — only visible while processing to modeling */}
              {processingToModeling && (
                <div className="w-full rounded-xl border border-border bg-card/60 p-5 space-y-4">
                  {/* Step indicators */}
                  <div className="flex items-center justify-between">
                    {modelingSteps.map((step, i) => {
                      const reached = modelingProgress >= step.threshold;
                      const active =
                        modelingProgress >= step.threshold &&
                        (i === modelingSteps.length - 1 ||
                          modelingProgress < modelingSteps[i + 1].threshold);
                      return (
                        <div
                          key={step.label}
                          className="flex flex-col items-center gap-1 flex-1"
                        >
                          <div
                            className={[
                              "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500",
                              reached
                                ? "bg-primary border-primary text-primary-foreground"
                                : "bg-muted border-border text-muted-foreground",
                              active
                                ? "ring-2 ring-primary/40 ring-offset-2"
                                : "",
                            ].join(" ")}
                          >
                            {reached && !active ? (
                              <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 12 12"
                                fill="none"
                              >
                                <path
                                  d="M2 6l3 3 5-5"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            ) : (
                              i + 1
                            )}
                          </div>
                          <span
                            className={[
                              "text-[10px] font-medium text-center leading-tight",
                              reached
                                ? "text-primary"
                                : "text-muted-foreground",
                            ].join(" ")}
                          >
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Bar */}
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-in-out"
                      style={{
                        width: `${modelingProgress}%`,
                        background:
                          modelingProgress === 100
                            ? "hsl(var(--primary))"
                            : "linear-gradient(90deg, hsl(var(--primary)/0.7), hsl(var(--primary)))",
                      }}
                    />
                  </div>
                  {/* Status text + percentage */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      {modelingProgress < 100 ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
                      ) : (
                        <svg
                          className="w-3.5 h-3.5 text-primary flex-shrink-0"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M2 6l3 3 5-5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                      <span>{modelingStatus}</span>
                    </div>
                    <span className="font-semibold text-primary tabular-nums">
                      {modelingProgress}%
                    </span>
                  </div>
                  {modelingProgress < 100 && (
                    <p className="text-xs text-muted-foreground">
                      Please wait — building your data model may take a few
                      minutes.
                    </p>
                  )}
                </div>
              )}
              {/* Back + Proceed row */}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <Button
                  variant="outline"
                  onClick={() => navigate("/workflow/data-ingestion")}
                >
                  Back
                </Button>
                <Button
                  onClick={handleProceedToModeling}
                  size="lg"
                  className="px-8 gap-2 w-full sm:w-auto"
                  disabled={
                    data.length === 0 || loading || processingToModeling
                  }
                >
                  {processingToModeling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Proceed to Data Modeling"
                  )}
                </Button>
              </div>
            </div>
          </>
        )}
        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-center">
                Confirm delete
              </DialogTitle>
            </DialogHeader>
            <div className="py-6 text-center">
              <p className="text-lg text-foreground">
                Are you sure you want to delete
                <span className="font-semibold"> "{fileToDelete}"</span>?
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-center mt-8">
              <Button
                variant="ghost"
                size="lg"
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  setFileToDelete(null);
                }}
              >
                No, keep it
              </Button>
              <Button
                variant="destructive"
                size="lg"
                className="min-w-48"
                onClick={confirmDelete}
              >
                Yes, delete it
              </Button>
            </div>
          </DialogContent>
        </Dialog>
        {/* Schema Preview Dialog */}
        <SchemaPreviewDialog
          open={schemaPreviewOpen}
          onOpenChange={setSchemaPreviewOpen}
          fileName={previewFileName}
          previewData={previewData}
          loading={previewLoading}
        />
      </div>
    </WorkflowLayout>
  );
}