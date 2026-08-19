// import { toast } from "sonner";

import { toast } from "sonner";

 
// interface PreparedDataset {
//   file: File;
//   name: string;
//   blobPath: string;
//   validTargets: string[];
//   analysisMetadata: any;
//   columns: string[];
//   rows: any[];           // preview rows
//   total_rows: number;
//   preview_rows: number;
// }
 
// export const prepareDataset = async (
//   userId: string,
//   jobId: string,
//   datasetName: string,
//   folderPath?: string   // optional – from list-datasets response
// ): Promise<PreparedDataset | null> => {
//   const toastId = "dataset-prep-toast";
 
//   try {
//     toast.loading("Starting dataset preparation...", { id: toastId });
 
//     // ── 1. Get user email from aivolve_user
//     const emailRaw = localStorage.getItem("aivolve_user");
//     if (!emailRaw) throw new Error("AutoML user session not found");
//     const parsedEmailUser = JSON.parse(emailRaw);
//     const userEmail = parsedEmailUser.email;
//     if (!userEmail) throw new Error("User email not found in session");
 
//     toast.loading("Preparing file details...", { id: toastId });
 
//     // ── 2. Determine correct filename
//     const filename = datasetName.endsWith(".csv")
//       ? datasetName
//       : `${datasetName}.csv`;
 
//     // ── 3. Build correct OneLake path
//     let fullPath: string;
 
//     if (folderPath && folderPath.trim() && folderPath.startsWith("Files/")) {
//       fullPath = `${folderPath}/${filename}`;
//     } else {
//       const userGuid = localStorage.getItem("selected_user_id") || userId;
//       const jobGuid  = localStorage.getItem("selected_job_id")   || jobId;
//       fullPath = `Files/Datasets/${userGuid}/${jobGuid}/${filename}`;
//     }
 
//     fullPath = fullPath
//       .replace(/\/{2,}/g, "/")
//       .replace(/^\/+/, "");
 
//     console.log("[prepareDataset] Using OneLake path:", fullPath);
 
//     toast.loading("Downloading your dataset from storage (this usually takes a few seconds)...", { id: toastId });
 
//     // ── 4. Download from OneLake
//     const downloadUrl = `https://automl-onelake-webapp-eedahsgvbug3apc6.eastus-01.azurewebsites.net/workspaces/agenticbi/lakehouses/newagenticbi/download-veritas?path=${encodeURIComponent(fullPath)}`;
 
//     const downloadRes = await fetch(downloadUrl);
//     if (!downloadRes.ok) {
//       const errorText = await downloadRes.text();
//       throw new Error(`Download failed: ${downloadRes.status} - ${errorText}`);
//     }
 
//     const blob = await downloadRes.blob();
//     const file = new File([blob], filename, { type: "text/csv" });
 
//     toast.loading("Uploading dataset to our analysis engine for processing (this may take 10–60 seconds depending on file size)...", { id: toastId });
 
//     // ── 5. Upload to AutoML backend → get blob_path + analysis
//     const formData = new FormData();
//     formData.append("file", file);
//     formData.append("upload_file_path", "true");
//     formData.append("task", "classification"); // hardcoded – change later if needed
//     formData.append("target", "string");
//     formData.append("user_email", userEmail);
 
//     const uploadRes = await fetch(
//       "https://automl-webnew-chcgfqc8a5cbhtc4.eastus-01.azurewebsites.net/build_ml_model",
//       { method: "POST", body: formData }
//     );
 
//     if (!uploadRes.ok) {
//       const errorText = await uploadRes.text();
//       throw new Error(`Upload failed: ${uploadRes.status} - ${errorText}`);
//     }
 
//     const uploadJson = await uploadRes.json();
//     if (!uploadJson.blob_path) {
//       throw new Error("No blob_path returned from upload");
//     }
 
//     const blobPath = uploadJson.blob_path;
//     const analysisMetadata = uploadJson.analysis_metadata || null;
 
//     toast.loading("Analyzing dataset structure and detecting possible target columns...", { id: toastId });
 
//     // ── 6. Fetch valid targets
//     let validTargets: string[] = [];
//     try {
//       const targetsUrl = `https://automl-webnew-chcgfqc8a5cbhtc4.eastus-01.azurewebsites.net/task_features?blob_path=${encodeURIComponent(blobPath)}&task=classification&user_email=${encodeURIComponent(userEmail)}`;
//       const targetsRes = await fetch(targetsUrl);
//       if (targetsRes.ok) {
//         const targetsJson = await targetsRes.json();
//         validTargets = targetsJson.features || [];
//       } else {
//         console.warn("Could not fetch valid targets – continuing without");
//       }
//     } catch (err) {
//       console.warn("Targets fetch failed:", err);
//     }
 
//     toast.loading("Loading a quick preview of your dataset rows...", { id: toastId });
 
//     // ── 7. Fetch preview from Veriton
//     const previewUrl = `https://api.veriton.ai/api/service2/preview-dataset?user_id=${userId}&job_id=${jobId}&datasetname=${datasetName.replace(/\.csv$/i, '')}`;
//     let previewData = { columns: [], preview_rows: [], total_rows: 0, preview_row_count: 0 };
 
//     try {
//       const previewRes = await fetch(previewUrl);
//       if (previewRes.ok) {
//         const previewJson = await previewRes.json();
//         previewData = {
//           columns: previewJson.columns || [],
//           preview_rows: previewJson.preview_rows || [],
//           total_rows: previewJson.total_rows || 0,
//           preview_row_count: previewJson.preview_row_count || 0,
//         };
//       } else {
//         console.warn("Preview fetch failed – continuing without preview");
//       }
//     } catch (err) {
//       console.warn("Preview fetch failed:", err);
//     }
 
//     toast.success("Dataset is fully prepared! Redirecting to model configuration...", { id: toastId });
 
//     return {
//       file,
//       name: filename,
//       blobPath,
//       validTargets,
//       analysisMetadata,
//       columns: previewData.columns,
//       rows: previewData.preview_rows,
//       total_rows: previewData.total_rows,
//       preview_rows: previewData.preview_row_count,
//     };
 
//   } catch (err: any) {
//     console.error("[prepareDataset] Failed:", err);
//     toast.error(`Preparation failed: ${err.message || "Unknown error"}`, { id: toastId });
//     return null;
//   }
// };
 
export interface PreparedDataset {
  file: File;
  name: string;
  blobPath: string;
  analysisMetadata: any;
  columns: string[];
  rows: any[];           // preview rows
  total_rows: number;
  preview_rows: number;
  validTargets: string[]; // ← NEW: pre-fetched valid target columns for default task
}
 
/**
 * Prepares a dataset with clear progress feedback:
 * 1. Downloads from OneLake
 * 2. Uploads to AutoML backend for analysis
 * 3. Fetches valid target columns (for default task)
 * 4. Fetches dataset preview from Veriton
 */
export const prepareDataset = async (
  userId: string,
  jobId: string,
  datasetName: string,
  folderPath?: string   // optional – from list-datasets response
): Promise<PreparedDataset | null> => {
  const toastId = "dataset-prep-toast";
 
  try {
    toast.loading("Starting dataset preparation...", { id: toastId });
 
    // ── 1. Get user email from aivolve_user
    const emailRaw = localStorage.getItem("aivolve_user");
    if (!emailRaw) throw new Error("AutoML user session not found");
    const parsedEmailUser = JSON.parse(emailRaw);
    const userEmail = parsedEmailUser.email;
    if (!userEmail) throw new Error("User email not found in session");
 
    toast.loading("Preparing file details...", { id: toastId });
 
    // ── 2. Determine correct filename
    const filename = datasetName.endsWith(".csv")
      ? datasetName
      : `${datasetName}.csv`;
 
    // ── 3. Build correct OneLake path
    let fullPath: string;
 
    if (folderPath && folderPath.trim() && folderPath.startsWith("Files/")) {
      fullPath = `${folderPath}/${filename}`;
    } else {
      const userGuid = localStorage.getItem("selected_user_id") || userId;
      const jobGuid  = localStorage.getItem("selected_job_id")   || jobId;
      fullPath = `Files/Datasets/${userGuid}/${jobGuid}/${filename}`;
    }
 
    fullPath = fullPath
      .replace(/\/{2,}/g, "/")
      .replace(/^\/+/, "");
 
    console.log("[prepareDataset] Using OneLake path:", fullPath);
 
    toast.loading("Downloading your dataset from storage (this usually takes a few seconds)...", { id: toastId });
 
    // ── 4. Download from OneLake
    const downloadUrl = `https://api.veriton.ai/api/service3/workspaces/agenticbi/lakehouses/newagenticbi/download-veritas?path=${encodeURIComponent(fullPath)}`;
 
    const downloadRes = await fetch(downloadUrl);
    if (!downloadRes.ok) {
      const errorText = await downloadRes.text();
      throw new Error(`Download failed: ${downloadRes.status} - ${errorText}`);
    }
 
    const blob = await downloadRes.blob();
    const file = new File([blob], filename, { type: "text/csv" });
 
    toast.loading("Uploading dataset to our analysis engine for processing (this may take 10–60 seconds depending on file size)...", { id: toastId });
 
    // ── 5. Upload to AutoML backend → get blob_path + analysis
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_file_path", "true");
    formData.append("task", "classification"); // hardcoded – change later if needed
    formData.append("target", "string");
    formData.append("user_email", userEmail);
 
    const uploadRes = await fetch(
      "https://api.veriton.ai/api/service3//build_ml_model",
      { method: "POST", body: formData }
    );
 
    if (!uploadRes.ok) {
      const errorText = await uploadRes.text();
      throw new Error(`Upload failed: ${uploadRes.status} - ${errorText}`);
    }
 
    const uploadJson = await uploadRes.json();
    if (!uploadJson.blob_path) {
      throw new Error("No blob_path returned from upload");
    }
 
    const blobPath = uploadJson.blob_path;
    const analysisMetadata = uploadJson.analysis_metadata || null;
 
    // ── 6. NEW: Pre-fetch valid targets for default task (classification)
    let validTargets: string[] = [];
 
    try {
      const defaultTask = "classification"; // ← You can change this default
      const taskParam = defaultTask.toLowerCase().replace(/ /g, "_");
     
      const featuresUrl = `https://api.veriton.ai/api/service3/task_features?blob_path=${encodeURIComponent(blobPath)}&task=${taskParam}&user_email=${encodeURIComponent(userEmail)}`;
     
      console.log("[prepareDataset] Pre-fetching valid targets for:", defaultTask);
     
      const featuresRes = await fetch(featuresUrl);
      if (featuresRes.ok) {
        const featuresJson = await featuresRes.json();
        validTargets = featuresJson.features || [];
        console.log("[prepareDataset] Pre-fetched valid targets:", validTargets.length, "columns");
      } else {
        console.warn("[prepareDataset] task_features fetch failed:", featuresRes.status);
      }
    } catch (featuresErr) {
      console.warn("[prepareDataset] Failed to pre-fetch task features:", featuresErr);
      // Continue anyway – not critical
    }
 
    // ── 7. Fetch preview from Veriton
    const previewUrl = `https://api.veriton.ai/api/service2/preview-dataset?user_id=${userId}&job_id=${jobId}&datasetname=${datasetName.replace(/\.csv$/i, '')}`;
    let previewData = { columns: [], preview_rows: [], total_rows: 0, preview_row_count: 0 };
 
    try {
      const previewRes = await fetch(previewUrl);
      if (previewRes.ok) {
        const previewJson = await previewRes.json();
        previewData = {
          columns: previewJson.columns || [],
          preview_rows: previewJson.preview_rows || [],
          total_rows: previewJson.total_rows || 0,
          preview_row_count: previewJson.preview_row_count || 0,
        };
      } else {
        console.warn("Preview fetch failed – continuing without preview");
      }
    } catch (err) {
      console.warn("Preview fetch failed:", err);
    }
 
    toast.success("Dataset is fully prepared! Redirecting to model configuration...", { id: toastId });
 
    return {
      file,
      name: filename,
      blobPath,
      analysisMetadata,
      columns: previewData.columns,
      rows: previewData.preview_rows,
      total_rows: previewData.total_rows,
      preview_rows: previewData.preview_row_count,
      validTargets,  // ← NEW field
    };
 
  } catch (err: any) {
    console.error("[prepareDataset] Failed:", err);
    toast.error(`Preparation failed: ${err.message || "Unknown error"}`, { id: toastId });
    return null;
  }
};
 