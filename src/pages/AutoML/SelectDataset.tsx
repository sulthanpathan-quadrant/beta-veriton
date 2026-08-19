// import { useEffect, useState } from "react";
// import { Button } from "@/components/ui/button";
// import { Loader2, FileText, ChevronRight, ArrowLeft } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";
// import Header from "@/components/layout/Header";
// import { prepareDataset } from "@/components/utils/preparedDataset"; // ← NEW: import shared utility
// import { toast } from "sonner";
 
// interface Dataset {
//   filename: string;
//   date_modified: string;
// }
 
// interface DatasetResponse {
//   user_id: string;
//   job_id: string;
//   datasets: Dataset[];
//   count: number;
//   folder: string;
// }
 
// const SelectDataset = () => {
//   const [datasets, setDatasets] = useState<Dataset[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [folderPath, setFolderPath] = useState<string>("");
//   const [downloading, setDownloading] = useState(false);
//   const [previewData, setPreviewData] = useState<any>(null);
//   const [selectedFilename, setSelectedFilename] = useState<string | null>(null);
 
//   const navigate = useNavigate();
//   const location = useLocation();
 
//   const mode: "compare" | "build" =
//     (location.state as any)?.mode === "compare" ? "compare" : "build";
 
//   /* ---------------- Fetch datasets ---------------- */
//   useEffect(() => {
//     const fetchDatasets = async () => {
//       try {
//         const userRaw = localStorage.getItem("user");
//         const jobId = localStorage.getItem("current_job_id");
 
//         if (!userRaw || !jobId) {
//           throw new Error("Missing user or job information");
//         }
 
//         const user = JSON.parse(userRaw);
//         const userId = user.user_id || user.id;
 
//         if (!userId) {
//           throw new Error("User ID not found");
//         }
 
//         const res = await fetch(
//           `https://api.veriton.ai/api/service2/list-datasets?user_id=${userId}&job_id=${jobId}`,
//           { headers: { accept: "application/json" } }
//         );
 
//         if (!res.ok) {
//           throw new Error(`Failed to fetch datasets (${res.status})`);
//         }
 
//         const data: DatasetResponse = await res.json();
//         setDatasets(data.datasets || []);
//         setFolderPath(data.folder || "Files"); // ← fallback to Files
//       } catch (e: any) {
//         console.error("Dataset fetch error:", e);
//         setError(e.message || "Failed to load datasets");
//         toast.error("Could not load dataset list");
//       } finally {
//         setLoading(false);
//       }
//     };
 
//     fetchDatasets();
//   }, []);
 
//   /* ---------------- Select & Prepare Dataset ---------------- */
//   const handleSelectDataset = async (filename: string) => {
//     setDownloading(true);
//     setError(null);
//     setSelectedFilename(filename);
//     setPreviewData(null);
 
//     try {
//       // Get required IDs
//       const userRaw = localStorage.getItem("user");
//       const jobId = localStorage.getItem("current_job_id");
//       const user = userRaw ? JSON.parse(userRaw) : null;
//       const userId = user?.user_id || user?.id;
 
//       if (!userId || !jobId) {
//         throw new Error("Missing user or job ID");
//       }
 
//       // Use shared prepareDataset utility
//       const prepared = await prepareDataset(userId, jobId, filename, folderPath);
 
//       if (!prepared) {
//         throw new Error("Dataset preparation failed");
//       }
 
//       // Success: show preview and enable continue
//       setPreviewData({
//         columns: prepared.columns,
//         rows: prepared.rows,
//         total_rows: prepared.total_rows,
//         preview_rows: prepared.preview_rows,
//         blobPath: prepared.blobPath,
//         validTargets: prepared.validTargets,
//         analysisMetadata: prepared.analysisMetadata,
//       });
 
//       // Store the prepared file temporarily if needed (for continue)
//       // You can also pass it directly in state on continue
//       localStorage.setItem("temp_prepared_dataset", JSON.stringify({
//         name: prepared.name,
//         blobPath: prepared.blobPath,
//         validTargets: prepared.validTargets,
//         analysisMetadata: prepared.analysisMetadata,
//         // Note: We don't store the File object – it's too big
//       }));
 
//     } catch (err: any) {
//       console.error("Dataset preparation error:", err);
//       setError(err.message || "Failed to prepare dataset");
//       toast.error("Preparation failed. Please try again.");
//     } finally {
//       setDownloading(false);
//     }
//   };
 
//   /* ---------------- Continue to Build/Compare ---------------- */
//   const handleContinue = () => {
//     if (!selectedFilename || !previewData) return;
 
//     // Retrieve prepared data (you could also store File in state if small)
//     const preparedInfo = {
//       file: null, // File can't be stored easily – re-download if needed in next page
//       name: `${selectedFilename}.csv`,
//       blobPath: previewData.blobPath,
//       validTargets: previewData.validTargets,
//       analysisMetadata: previewData.analysisMetadata,
//       columns: previewData.columns,
//       rows: previewData.rows,
//       total_rows: previewData.total_rows,
//       preview_rows: previewData.preview_rows,
//     };
 
//     navigate(
//       mode === "compare"
//         ? "/workflow/automl/compare"
//         : "/workflow/automl/build-model",
//       {
//         state: {
//           dataset: preparedInfo,
//         },
//       }
//     );
//   };
 
//   return (
//     <div className="min-h-screen bg-background">
//       <Header />
//       <main className="pt-20 px-10 pb-16 max-w-[1400px] mx-auto">
//         <button
//           onClick={() => navigate("/workflow/automl")}
//           className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
//         >
//           <ArrowLeft className="w-4 h-4" />
//           Back to Jobs
//         </button>
 
//         <h1 className="text-3xl font-semibold text-foreground mb-1">
//           Select Dataset
//         </h1>
//         <p className="text-muted-foreground text-base mb-8">
//           Choose a dataset to continue with{" "}
//           <span className="font-medium text-foreground">
//             {mode === "compare" ? "model comparison" : "model building"}
//           </span>
//         </p>
 
//         {loading && (
//           <div className="flex items-center gap-2 text-muted-foreground my-8">
//             <Loader2 className="w-5 h-5 animate-spin" />
//             Loading available datasets…
//           </div>
//         )}
 
//         {error && (
//           <div className="mb-8 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
//             {error}
//           </div>
//         )}
 
//         {!loading && !error && datasets.length === 0 && (
//           <div className="text-center py-12 text-muted-foreground">
//             No datasets found in this job.
//           </div>
//         )}
 
//         <div className="grid gap-3 max-w-2xl">
//           {datasets.map((ds) => {
//             const isSelected = selectedFilename === ds.filename;
//             return (
//               <button
//                 key={ds.filename}
//                 onClick={() => handleSelectDataset(ds.filename)}
//                 disabled={downloading}
//                 className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all text-left
//                   ${isSelected
//                     ? "border-primary bg-primary/5 shadow-sm"
//                     : "border-border hover:border-primary/50 hover:bg-muted/50"}
//                   ${downloading ? "opacity-60 cursor-not-allowed" : ""}`}
//               >
//                 <div className="flex items-center gap-4">
//                   <FileText className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
//                   <div>
//                     <div className="font-medium">{ds.filename}</div>
//                     <div className="text-xs text-muted-foreground mt-0.5">
//                       Modified: {ds.date_modified}
//                     </div>
//                   </div>
//                 </div>
 
//                 <div className="flex items-center gap-3">
//                   {downloading && isSelected && (
//                     <Loader2 className="w-5 h-5 animate-spin text-primary" />
//                   )}
//                   <ChevronRight className="w-5 h-5 text-muted-foreground" />
//                 </div>
//               </button>
//             );
//           })}
//         </div>
 
//         {previewData && (
//           <div className="mt-12">
//             <div className="flex items-center justify-between mb-6">
//               <div>
//                 <h2 className="text-2xl font-semibold text-foreground">
//                   Preview: {selectedFilename}
//                 </h2>
//                 <p className="text-muted-foreground mt-1">
//                   Showing {previewData.preview_rows} of {previewData.total_rows} rows
//                 </p>
//               </div>
//               <Button
//                 onClick={handleContinue}
//                 size="lg"
//               >
//                 Continue to {mode === "compare" ? "Compare" : "Build"}
//               </Button>
//             </div>
 
//             <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm">
//                   <thead className="bg-muted sticky top-0">
//                     <tr>
//                       {previewData.columns.map((col: string) => (
//                         <th
//                           key={col}
//                           className="px-6 py-4 text-left font-medium text-foreground border-b"
//                         >
//                           {col}
//                         </th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y">
//                     {previewData.rows.map((row: any, idx: number) => (
//                       <tr key={idx} className="hover:bg-muted/50 transition-colors">
//                         {previewData.columns.map((col: string) => (
//                           <td key={col} className="px-6 py-4">
//                             {row[col] ?? "—"}
//                           </td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// };
 
// export default SelectDataset;
 import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, ChevronRight, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "@/components/layout/Header";
import { prepareDataset } from "@/components/utils/preparedDataset"; // ← NEW: import shared utility
import { toast } from "sonner";
 
interface Dataset {
  filename: string;
  date_modified: string;
}
 
interface DatasetResponse {
  user_id: string;
  job_id: string;
  datasets: Dataset[];
  count: number;
  folder: string;
}
 
const SelectDataset = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<string>("");
  const [downloading, setDownloading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [selectedFilename, setSelectedFilename] = useState<string | null>(null);
 
  const navigate = useNavigate();
  const location = useLocation();
 
  const mode: "compare" | "build" =
    (location.state as any)?.mode === "compare" ? "compare" : "build";
 
  /* ---------------- Fetch datasets ---------------- */
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const userRaw = localStorage.getItem("user");
        const jobId = localStorage.getItem("current_job_id");
 
        if (!userRaw || !jobId) {
          throw new Error("Missing user or job information");
        }
 
        const user = JSON.parse(userRaw);
        const userId = user.user_id || user.id;
 
        if (!userId) {
          throw new Error("User ID not found");
        }
 
        const res = await fetch(
          `https://api.veriton.ai/api/service2/list-datasets?user_id=${userId}&job_id=${jobId}`,
          { headers: { accept: "application/json" } }
        );
 
        if (!res.ok) {
          throw new Error(`Failed to fetch datasets (${res.status})`);
        }
 
        const data: DatasetResponse = await res.json();
        setDatasets(data.datasets || []);
        setFolderPath(data.folder || "Files"); // ← fallback to Files
      } catch (e: any) {
        console.error("Dataset fetch error:", e);
        setError(e.message || "Failed to load datasets");
        toast.error("Could not load dataset list");
      } finally {
        setLoading(false);
      }
    };
 
    fetchDatasets();
  }, []);
 
  /* ---------------- Select & Prepare Dataset ---------------- */
  const handleSelectDataset = async (filename: string) => {
    setDownloading(true);
    setError(null);
    setSelectedFilename(filename);
    setPreviewData(null);
 
    try {
      // Get required IDs
      const userRaw = localStorage.getItem("user");
      const jobId = localStorage.getItem("current_job_id");
      const user = userRaw ? JSON.parse(userRaw) : null;
      const userId = user?.user_id || user?.id;
 
      if (!userId || !jobId) {
        throw new Error("Missing user or job ID");
      }
 
      // Use shared prepareDataset utility
      const prepared = await prepareDataset(userId, jobId, filename, folderPath);
 
      if (!prepared) {
        throw new Error("Dataset preparation failed");
      }
 
      // Success: show preview and enable continue
      setPreviewData({
        columns: prepared.columns,
        rows: prepared.rows,
        total_rows: prepared.total_rows,
        preview_rows: prepared.preview_rows,
        blobPath: prepared.blobPath,
        // validTargets: prepared.validTargets,
        analysisMetadata: prepared.analysisMetadata,
      });
 
      // Store the prepared file temporarily if needed (for continue)
      // You can also pass it directly in state on continue
      localStorage.setItem("temp_prepared_dataset", JSON.stringify({
        name: prepared.name,
        blobPath: prepared.blobPath,
        // validTargets: prepared.validTargets,
        analysisMetadata: prepared.analysisMetadata,
        // Note: We don't store the File object – it's too big
      }));
 
    } catch (err: any) {
      console.error("Dataset preparation error:", err);
      setError(err.message || "Failed to prepare dataset");
      toast.error("Preparation failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };
 
  /* ---------------- Continue to Build/Compare ---------------- */
  const handleContinue = () => {
    if (!selectedFilename || !previewData) return;
 
    // Retrieve prepared data (you could also store File in state if small)
    const preparedInfo = {
      file: null, // File can't be stored easily – re-download if needed in next page
      name: `${selectedFilename}.csv`,
      blobPath: previewData.blobPath,
      validTargets: previewData.validTargets,
      analysisMetadata: previewData.analysisMetadata,
      columns: previewData.columns,
      rows: previewData.rows,
      total_rows: previewData.total_rows,
      preview_rows: previewData.preview_rows,
    };
 
    navigate(
      mode === "compare"
        ? "/workflow/automl/compare"
        : "/workflow/automl/build-model",
      {
        state: {
          dataset: preparedInfo,
        },
      }
    );
  };
 
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 px-10 pb-16 max-w-[1400px] mx-auto">
        <button
          onClick={() => navigate("/workflow/automl")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </button>
 
        <h1 className="text-3xl font-semibold text-foreground mb-1">
          Select Dataset
        </h1>
        <p className="text-muted-foreground text-base mb-8">
          Choose a dataset to continue with{" "}
          <span className="font-medium text-foreground">
            {mode === "compare" ? "model comparison" : "model building"}
          </span>
        </p>
 
        {loading && (
          <div className="flex items-center gap-2 text-muted-foreground my-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading available datasets…
          </div>
        )}
 
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive">
            {error}
          </div>
        )}
 
        {!loading && !error && datasets.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No datasets found in this job.
          </div>
        )}
 
        <div className="grid gap-3 max-w-2xl">
          {datasets.map((ds) => {
            const isSelected = selectedFilename === ds.filename;
            return (
              <button
                key={ds.filename}
                onClick={() => handleSelectDataset(ds.filename)}
                disabled={downloading}
                className={`flex items-center justify-between px-5 py-4 rounded-xl border transition-all text-left
                  ${isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"}
                  ${downloading ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <div className="flex items-center gap-4">
                  <FileText className={`w-5 h-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                  <div>
                    <div className="font-medium">{ds.filename}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Modified: {ds.date_modified}
                    </div>
                  </div>
                </div>
 
                <div className="flex items-center gap-3">
                  {downloading && isSelected && (
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                  )}
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            );
          })}
        </div>
 
        {previewData && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  Preview: {selectedFilename}
                </h2>
                <p className="text-muted-foreground mt-1">
                  Showing {previewData.preview_rows} of {previewData.total_rows} rows
                </p>
              </div>
              <Button
                onClick={handleContinue}
                size="lg"
              >
                Continue to {mode === "compare" ? "Compare" : "Build"}
              </Button>
            </div>
 
            <div className="border border-border rounded-xl overflow-hidden bg-card shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      {previewData.columns.map((col: string) => (
                        <th
                          key={col}
                          className="px-6 py-4 text-left font-medium text-foreground border-b"
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {previewData.rows.map((row: any, idx: number) => (
                      <tr key={idx} className="hover:bg-muted/50 transition-colors">
                        {previewData.columns.map((col: string) => (
                          <td key={col} className="px-6 py-4">
                            {row[col] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
 
export default SelectDataset;
 