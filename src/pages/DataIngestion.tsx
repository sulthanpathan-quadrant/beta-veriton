// import { useState, useEffect, useRef } from "react";

// import { useNavigate } from "react-router-dom";

// import { WorkflowLayout } from "@/components/WorkflowLayout";

// import { Button } from "@/components/ui/button";

// import { Card } from "@/components/ui/card";

// import {
//   Database,
//   Cloud,
//   Snowflake,
//   FileText,
//   FolderOpen,
//   X,
//   FileSpreadsheet,
//   Table,
//   Upload,
// } from "lucide-react";

// import { FilePickerDialog } from "@/components/FilePickerDialog";

// import { SchemaPreviewDialog } from "@/components/SchemaPreviewDialog";

// import { DatabaseConnectionDialog } from "@/components/DatabaseConnectionDialog";

// import { SourceCredentialDialog } from "@/components/SourceCredentialDialog";

// import { toast } from "sonner";

// import { Loader2 } from "lucide-react";

// import {
//   S3Credentials,
//   AzureCredentials,
//   OneLakeCredentials,
//   DatabricksCredentials,
//   SnowflakeCredentials,
// } from "@/components/api/api";

// interface SelectedItem {
//   id: string;

//   name: string;

//   source: string;

//   size: string;

//   rows: string;

//   icon: "file" | "table" | "folder";

//   sourceType: string;

//   fullPath: string;
// }

// interface UserDetails {
//   id: string;

//   email: string;

//   name: string;

//   dataplatform?: string;
// }

// const sources = [
//   {
//     id: "s3",
//     name: "S3",
//     description: "Cloud Storage",
//     icon: Database,
//     requiresCredentials: true,
//   },

//   {
//     id: "azure",
//     name: "Azure Blob",
//     description: "Cloud Storage",
//     icon: Cloud,
//     requiresCredentials: true,
//   },

//   {
//     id: "snowflake",
//     name: "Snowflake",
//     description: "Database",
//     icon: Snowflake,
//     requiresCredentials: true,
//   },

//   {
//     id: "sap",
//     name: "SAP",
//     description: "Database",
//     icon: Database,
//     requiresCredentials: true,
//   },

//   {
//     id: "databases",
//     name: "Databases",
//     description: "Generic SQL",
//     icon: Database,
//     requiresCredentials: false,
//   },

//   {
//     id: "onelake",
//     name: "OneLake",
//     description: "Microsoft Fabric",
//     icon: Database,
//     requiresCredentials: true,
//   },

//   {
//     id: "databricks",
//     name: "Databricks",
//     description: "Delta Lake",
//     icon: Table,
//     requiresCredentials: true,
//   },

//   {
//     id: "local",
//     name: "Local files",
//     description: "Upload",
//     icon: Upload,
//     requiresCredentials: false,
//   },
// ];

// // ── NEW: helpers for the Databricks-platform ingest route ──────────────────

// const DATABRICKS_INGEST_URL =
//   "https://api.veriton.ai/api/service-databricks/ingest";

// const databricksStatusUrl = (runId: number | string) =>
//   `${DATABRICKS_INGEST_URL}/${runId}`;

// // TODO(confirm with backend): landing zone path — currently hardcoded to
// // match the sample payload. May need to be per-user or per-job instead.
// const DEFAULT_LANDING_ZONE = "/Volumes/veriton-db/landing/raw_files";

// // Databricks job-run life cycle states that mean "still going" — keep polling.
// const DATABRICKS_IN_PROGRESS_STATES = [
//   "PENDING",
//   "QUEUED",
//   "WAITING_FOR_RETRY",
//   "BLOCKED",
//   "RUNNING",
//   "TERMINATING",
// ];

// // Terminal life cycle states — stop polling once we hit one of these.
// const DATABRICKS_TERMINAL_STATES = ["TERMINATED", "SKIPPED", "INTERNAL_ERROR"];

// /**
//  * Maps a Databricks run's life_cycle_state to a rough progress percentage,
//  * so the same step indicator UI (Submitted / Transferring / Processing /
//  * Finalizing / Done) still makes sense for the Databricks route.
//  */
// function progressForLifeCycleState(state: string, current: number): number {
//   switch (state) {
//     case "PENDING":
//     case "QUEUED":
//     case "WAITING_FOR_RETRY":
//     case "BLOCKED":
//       return Math.max(current, 30);

//     case "RUNNING":
//       return current < 85 ? current + 3 : current;

//     case "TERMINATING":
//       return Math.max(current, 90);

//     default:
//       return current;
//   }
// }

// /**
//  * Reads the "user" object from localStorage and returns true if the user's
//  * dataplatform is "Databricks". This decides which ingest API to call.
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

// /**
//  * Transforms the existing "ingestion_sources" localStorage entries (the
//  * shape used by the ingest-now API) into the payload shape expected by the
//  * Databricks trigger API (/api/service-databricks/ingest).
//  *
//  * NOTE / ASSUMPTIONS that still need confirmation:
//  *  - Snowflake: the Databricks API sample expects key-pair auth via
//  *    `snowflakePrivateKey` + `snowflakePrivateKeyPassphrase`, not the
//  *    password we currently collect in the credentials dialog. Until the
//  *    dialog collects a private key, this field will be empty/incorrect.
//  *  - S3: existing `s3path` entries are stored as full `s3://bucket/key`
//  *    strings, so `bucket` is derived by splitting on the first "/".
//  *  - Blob: same idea — `container` is derived from the first path segment.
//  *  - `region` for S3 isn't currently collected anywhere, defaults to
//  *    "us-east-1".
//  */
// function buildDatabricksPayload(
//   userId: string,
//   jobId: string,
//   ingestionSources: any[],
// ) {
//   const sources = ingestionSources

//     .map((entry: any) => {
//       switch (entry.source_type) {
//         case "s3": {
//           const paths: string[] = entry.s3path || [];

//           const firstNoScheme = (paths[0] || "").replace(/^s3:\/\//, "");

//           const bucket = firstNoScheme.split("/")[0] || "";

//           return {
//             sourceType: "s3",

//             connection: {
//               accessKey: entry.s3AccessKey,
//               secretKey: entry.s3SecretKey,
//               region: entry.s3Region || "us-east-1",
//             },

//             bucket,

//             paths: paths.map((p) => {
//               const noScheme = p.replace(/^s3:\/\//, "");

//               const parts = noScheme.split("/");

//               return parts.slice(1).join("/");
//             }),
//           };
//         }

//         case "blob": {
//           const paths: string[] = entry.blobpath || [];

//           const container = (paths[0] || "").split("/")[0] || "";

//           return {
//             sourceType: "blob",

//             container,

//             connection: {
//               accountName: entry.blobAccountName,
//               accountKey: entry.blobAccountKey,
//             },

//             paths: paths.map((p) => p.split("/").slice(1).join("/")),
//           };
//         }

//         case "onelake":
//           return {
//             sourceType: "onelake",

//             workspaceName: entry.workspace_name,
//             lakehouseName: entry.lakehouse_name,

//             connection: {
//               tenantId: entry.tenant_id,
//               clientId: entry.client_id,
//               clientSecret: entry.client_secret,
//             },

//             paths: entry.file_path || [],
//           };

//         case "databricks":
//           return {
//             sourceType: "databricks",

//             databricks_host: entry.databricks_host,
//             warehouse_id: entry.warehouse_id,
//             access_token: entry.access_token,
//             catalog: entry.catalog,
//             schema: entry.schema,

//             table: Array.isArray(entry.table) ? entry.table[0] : entry.table,
//           };

//         case "snowflake":
//           return {
//             sourceType: "snowflake",

//             snowflake_schema: entry.snowflake_schema,

//             snowflake_table: Array.isArray(entry.snowflake_table)
//               ? entry.snowflake_table[0]
//               : entry.snowflake_table,

//             snowflakeAccount: entry.snowflakeAccount,
//             snowflakeDatabase: entry.snowflakeDatabase,
//             snowflakeWarehouse: entry.snowflakeWarehouse,
//             snowflakeUser: entry.snowflakeUser,

//             // See NOTE above — this API expects key-pair auth, not password.
//             snowflakePrivateKey: entry.snowflakePrivateKey || "",
//             snowflakePrivateKeyPassphrase:
//               entry.snowflakePrivateKeyPassphrase || "",
//           };

//         case "sqlserver":
//           return {
//             sourceType: "sqlserver",

//             server: entry.server,
//             database: entry.database,
//             username: entry.username,
//             password: entry.password,

//             table: Array.isArray(entry.table) ? entry.table[0] : entry.table,
//           };

//         default:
//           console.warn(
//             `Unmapped source_type for Databricks payload: ${entry.source_type}`,
//           );

//           return null;
//       }
//     })

//     .filter(Boolean);

//   return {
//     userId,
//     jobId,
//     landingZone: DEFAULT_LANDING_ZONE,
//     sources,
//   };
// }

// // ─────────────────────────────────────────────────────────────────────────

// export default function DataIngestion() {
//   const navigate = useNavigate();

//   const selectedItemsRef = useRef<HTMLDivElement>(null);

//   const [isIngesting, setIsIngesting] = useState(false);

//   // ── NEW: progress bar state ──────────────────────────────────────────────

//   const [ingestProgress, setIngestProgress] = useState(0);

//   const [ingestStatus, setIngestStatus] = useState("");

//   // ────────────────────────────────────────────────────────────────────────

//   const [userId, setUserId] = useState<string>("");

//   const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

//   const [filePickerOpen, setFilePickerOpen] = useState(false);

//   const [currentSource, setCurrentSource] = useState<string>("");

//   const [schemaPreviewOpen, setSchemaPreviewOpen] = useState(false);

//   const [previewFileName, setPreviewFileName] = useState("");

//   const [databaseDialogOpen, setDatabaseDialogOpen] = useState(false);

//   const [credentialDialogOpen, setCredentialDialogOpen] = useState(false);

//   const [pendingSourceId, setPendingSourceId] = useState<string>("");

//   const [s3Credentials, setS3Credentials] = useState<S3Credentials | null>(
//     null,
//   );

//   const [azureCredentials, setAzureCredentials] =
//     useState<AzureCredentials | null>(null);

//   const [oneLakeCredentials, setOneLakeCredentials] =
//     useState<OneLakeCredentials | null>(null);

//   const [databricksCredentials, setDatabricksCredentials] =
//     useState<DatabricksCredentials | null>(null);

//   const [snowflakeCredentials, setSnowflakeCredentials] =
//     useState<SnowflakeCredentials | null>(null);

//   // Reusable X close button for all toasts

//   const closeToastButton = (
//     <button
//       onClick={() => toast.dismiss()}
//       className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
//       aria-label="Close toast"
//     >
//       <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
//     </button>
//   );

//   // Auto-scroll to selected items section when items are added

//   useEffect(() => {
//     if (selectedItems.length > 0 && selectedItemsRef.current) {
//       setTimeout(() => {
//         const scrollableParent = selectedItemsRef.current?.closest("main");

//         if (scrollableParent && selectedItemsRef.current) {
//           const elementTop = selectedItemsRef.current.offsetTop;

//           const targetScroll = elementTop - 80;

//           scrollableParent.scrollTo({
//             top: targetScroll,

//             behavior: "smooth",
//           });
//         }
//       }, 150);
//     }
//   }, [selectedItems.length]);

//   // Load user & restore selected items from localStorage

//   useEffect(() => {
//     const userData = localStorage.getItem("user");

//     if (userData) {
//       try {
//         const user: UserDetails = JSON.parse(userData);

//         setUserId(user.id || "unknown-user");
//       } catch (err) {
//         console.error("Failed to parse user data:", err);

//         setUserId("unknown-user");
//       }
//     } else {
//       toast.error("No user logged in.", {
//         duration: 1000,
//         action: closeToastButton,
//       });

//       setUserId("unknown-user");
//     }

//     const saved = localStorage.getItem("ingestion_sources");

//     if (saved) {
//       try {
//         const parsed = JSON.parse(saved);

//         if (Array.isArray(parsed) && parsed.length > 0) {
//           const restoredItems: SelectedItem[] = [];

//           parsed.forEach((entry: any, groupIndex: number) => {
//             const sourceType = entry.source_type || "unknown";

//             const sourceName =
//               sources.find((s) => s.id === sourceType)?.name || sourceType;

//             if (sourceType === "s3" && Array.isArray(entry.s3path)) {
//               entry.s3path.forEach((path: string, idx: number) => {
//                 const name = path.split("/").pop() || path;

//                 restoredItems.push({
//                   id: `restored-s3-${groupIndex}-${idx}-${Date.now()}`,

//                   name,
//                   source: sourceName,
//                   size: "N/A",
//                   rows: "N/A",

//                   icon: "file",
//                   sourceType,
//                   fullPath: path,
//                 });
//               });
//             } else if (sourceType === "blob" && Array.isArray(entry.blobpath)) {
//               entry.blobpath.forEach((path: string, idx: number) => {
//                 const name = path.split("/").pop() || path;

//                 restoredItems.push({
//                   id: `restored-blob-${groupIndex}-${idx}-${Date.now()}`,

//                   name,
//                   source: sourceName,
//                   size: "N/A",
//                   rows: "N/A",

//                   icon: "file",
//                   sourceType,
//                   fullPath: path,
//                 });
//               });
//             } else if (
//               sourceType === "onelake" &&
//               Array.isArray(entry.file_path)
//             ) {
//               entry.file_path.forEach((path: string, idx: number) => {
//                 const name = path.split("/").pop() || path;

//                 restoredItems.push({
//                   id: `restored-onelake-${groupIndex}-${idx}-${Date.now()}`,

//                   name,
//                   source: sourceName,
//                   size: "N/A",
//                   rows: "N/A",

//                   icon: "file",
//                   sourceType,
//                   fullPath: path,
//                 });
//               });
//             } else if (
//               sourceType === "databricks" &&
//               Array.isArray(entry.table)
//             ) {
//               entry.table.forEach((tbl: string, idx: number) => {
//                 const name = tbl.split(".").pop() || tbl;

//                 restoredItems.push({
//                   id: `restored-databricks-${groupIndex}-${idx}-${Date.now()}`,

//                   name,
//                   source: sourceName,
//                   size: "N/A",
//                   rows: "N/A",

//                   icon: "table",
//                   sourceType,
//                   fullPath: tbl,
//                 });
//               });
//             } else if (
//               sourceType === "sqlserver" &&
//               Array.isArray(entry.table)
//             ) {
//               entry.table.forEach((tbl: string, idx: number) => {
//                 const name = tbl.split(".").pop() || tbl;

//                 restoredItems.push({
//                   id: `restored-sql-${groupIndex}-${idx}-${Date.now()}`,

//                   name,
//                   source: sourceName || "SQL Server",
//                   size: "N/A",
//                   rows: "N/A",

//                   icon: "table",
//                   sourceType,
//                   fullPath: tbl,
//                 });
//               });
//             }
//           });

//           setSelectedItems(restoredItems);
//         }
//       } catch (err) {
//         console.error("Failed to restore items:", err);
//       }
//     }
//   }, []);

//   const LOCAL_UPLOADS_CONTAINER = "local-uploads";

//   const removeItem = async (id: string) => {
//     const item = selectedItems.find((i) => i.id === id);

//     if (!item) return;

//     setSelectedItems((prev) => prev.filter((i) => i.id !== id));

//     if (item.sourceType === "local") {
//       try {
//         const res = await fetch(
//           `https://api.veriton.ai/api/service1/ingest-now/delete-local?blob_path=${encodeURIComponent(item.fullPath)}`,

//           { method: "DELETE" },
//         );

//         if (!res.ok) throw new Error("Delete request failed");
//       } catch (err) {
//         console.error("Failed to delete local blob:", err);

//         toast.error(`Failed to remove ${item.name} from storage`, {
//           duration: 2000,
//           action: closeToastButton,
//         });
//       }

//       try {
//         const existing = JSON.parse(
//           localStorage.getItem("ingestion_sources") || "[]",
//         );

//         const updated = existing

//           .map((entry: any) => {
//             if (entry.source_type === "blob" && Array.isArray(entry.blobpath)) {
//               // Only strip paths that belong to the local-uploads container —

//               // identified by path prefix, not blobAccountName

//               const filteredPaths = entry.blobpath.filter((p: string) =>
//                 p.startsWith(`${LOCAL_UPLOADS_CONTAINER}/`)
//                   ? p !== item.fullPath
//                   : true,
//               );

//               return { ...entry, blobpath: filteredPaths };
//             }

//             return entry;
//           })

//           .filter(
//             (entry: any) =>
//               !(entry.source_type === "blob" && entry.blobpath?.length === 0),
//           );

//         localStorage.setItem("ingestion_sources", JSON.stringify(updated));
//       } catch (err) {
//         console.error("Failed to update ingestion_sources:", err);
//       }

//       // Step 3: NEW — remove it from the tracked local-files list too,

//       // so Landing Zone doesn't still think this filename is a local file

//       // if the same name ever reappears from a real Azure source later

//       try {
//         const jobId = localStorage.getItem("current_job_id");

//         const localFilesKey = `local_files_${jobId}`;

//         const existingLocalFiles = JSON.parse(
//           localStorage.getItem(localFilesKey) || "[]",
//         );

//         localStorage.setItem(
//           localFilesKey,

//           JSON.stringify(
//             existingLocalFiles.filter((name: string) => name !== item.name),
//           ),
//         );
//       } catch (err) {
//         console.error("Failed to update local_files tracking:", err);
//       }
//     }
//   };

//   const getItemIcon = (iconType: "file" | "table" | "folder") => {
//     switch (iconType) {
//       case "file":
//         return <FileSpreadsheet className="h-5 w-5 text-green-500" />;

//       case "table":
//         return <Table className="h-5 w-5 text-blue-500" />;

//       case "folder":
//         return <FolderOpen className="h-5 w-5 text-yellow-500" />;

//       default:
//         return <FileText className="h-5 w-5" />;
//     }
//   };

//   const saveSelectionToStorage = (
//     files: Array<{ name: string; fullPath: string }>,

//     credentials: any,

//     sourceType: string,
//     displayLabel?: string
//   ) => {
//     const existing = JSON.parse(
//       localStorage.getItem("ingestion_sources") || "[]",
//     );

//     const paths = files.map((f) => f.fullPath).filter(Boolean);

//     if (paths.length === 0) return;

//     let newEntry: any = { destination_path: userId };

//     switch (sourceType) {
//       case "s3":
//         newEntry = {
//           ...newEntry,

//           source_type: "s3",

//           s3path: paths.map((p) => (p.startsWith("s3://") ? p : `s3://${p}`)),

//           s3AccessKey:
//             credentials?.aws_access_key_id ||
//             credentials?.accessKey ||
//             credentials?.s3AccessKey,

//           s3SecretKey:
//             credentials?.aws_secret_access_key ||
//             credentials?.secretKey ||
//             credentials?.s3SecretKey,

//           s3ServiceUrl: credentials?.s3ServiceUrl || "https://s3.amazonaws.com",
//         };

//         break;

//       case "azure":
//         newEntry = {
//           ...newEntry,

//           source_type: "blob",

//           blobpath: paths,

//           blobAccountName:
//             credentials?.accountName ||
//             credentials?.connection_string?.match(/AccountName=([^;]+)/)?.[1] ||
//             "agenticbistorage",

//           blobAccountKey:
//             credentials?.accountKey ||
//             credentials?.connection_string?.match(/AccountKey=([^;]+)/)?.[1],
//         };

//         break;

//       case "onelake":
//         newEntry = {
//           ...newEntry,

//           source_type: "onelake",

//           workspace_name: credentials?.workspace_name || "agenticBI",

//           lakehouse_name: credentials?.lakehouse_name || "newagenticBI",

//           copy_type: "file",

//           file_path: paths,

//           client_id: credentials?.client_id,

//           client_secret: credentials?.client_secret,

//           tenant_id: credentials?.tenant_id,
//         };

//         break;

//       case "databricks":
//         newEntry = {
//           ...newEntry,

//           source_type: "databricks",

//           databricks_host: credentials?.host || credentials?.databricks_host,

//           warehouse_id: credentials?.warehouse_id,

//           access_token: credentials?.access_token,

//           catalog: credentials?.catalog || "agenticbi_adb",

//           schema: credentials?.schema || "default",

//           table: paths,
//         };

//         break;

//       case "snowflake": {
//         const snowflakeTables = paths.map((p) => {
//           const parts = p.split("/");

//           return parts[parts.length - 1]; // just the table name
//         });

//         const newEntry = {
//           destination_path: userId,

//           source_type: "snowflake",

//           snowflakeAccount: credentials?.account_identifier,

//           snowflakeUser: credentials?.username,

//           snowflakePassword: credentials?.password,

//           snowflakeWarehouse: credentials?.warehouse,

//           snowflakeDatabase: credentials?.database,

//           snowflake_schema: credentials?.schema,

//           snowflake_table: snowflakeTables, // ARRAY now
//         };

//         const isDuplicate = existing.some(
//           (e) =>
//             e.source_type === "snowflake" &&
//             JSON.stringify(e) === JSON.stringify(newEntry),
//         );

//         const updated = isDuplicate ? existing : [...existing, newEntry];

//         localStorage.setItem("ingestion_sources", JSON.stringify(updated));

//         toast.success(`Added ${paths.length} item(s) from snowflake`, {
//           duration: 1000,
//           action: closeToastButton,
//         });

//         return;
//       }

//       case "databases":
//         newEntry = {
//           ...newEntry,

//           source_type: "sqlserver",

//           server: credentials?.server || credentials?.host,

//           database: credentials?.database,

//           username: credentials?.username,

//           password: credentials?.password,

//           table: paths,
//         };

//         break;

//       default:
//         console.warn(`Unsupported source type: ${sourceType}`);

//         return;
//     }

//     const isDuplicate = existing.some(
//       (e: any) =>
//         e.source_type === newEntry.source_type &&
//         JSON.stringify(e) === JSON.stringify(newEntry),
//     );

//     const updated = isDuplicate ? existing : [...existing, newEntry];

//     localStorage.setItem("ingestion_sources", JSON.stringify(updated));

//     toast.success(`Added ${paths.length} item(s) from ${displayLabel || sourceType}`, {
//       duration: 1000,

//       action: closeToastButton,
//     });
//   };

//   const handleFileSelection = (
//     files: Array<{
//       id: string;
//       name: string;
//       size: string;
//       rows: string;
//       fullPath?: string;
//     }>,

//     credentials?: any,

//     extra?: { currentContainer?: string | null },
//   ) => {
//     if (credentials && currentSource && files.length > 0) {
//       saveSelectionToStorage(
//         files.map((f) => {
//           let pathToUse = f.fullPath ?? f.id ?? f.name;

//           if (currentSource === "azure" && extra?.currentContainer) {
//             const containerPrefix = `${extra.currentContainer}/`;

//             if (!pathToUse.startsWith(containerPrefix)) {
//               pathToUse = containerPrefix + pathToUse;
//             }
//           }

//           return { name: f.name, fullPath: pathToUse };
//         }),

//         credentials,

//         currentSource,
//       );
//     }

//     const newItems: SelectedItem[] = files.map((file) => {
//       let icon: "file" | "table" | "folder" = "file";

//       if (["snowflake", "databricks", "databases"].includes(currentSource))
//         icon = "table";

//       return {
//         id: `${currentSource}-${file.id || Date.now()}-${Math.random().toString(36).slice(2, 9)}`,

//         name: file.name,

//         source: sources.find((s) => s.id === currentSource)?.name || "Unknown",

//         size: file.size,

//         rows: file.rows,

//         icon,

//         sourceType: currentSource,

//         fullPath: file.fullPath || file.name,
//       };
//     });

//     setSelectedItems((prev) => [...prev, ...newItems]);
//   };

//   const handleProceed = async () => {
//     if (!userId || userId === "unknown-user") {
//       toast.error("User not authenticated. Please login again.", {
//         duration: 1000,
//         action: closeToastButton,
//       });

//       return;
//     }

//     const currentJobId = localStorage.getItem("current_job_id");

//     if (!currentJobId) {
//       toast.error("No job ID found. Please create a job first.", {
//         duration: 1000,
//         action: closeToastButton,
//       });

//       return;
//     }

//     const payloadStr = localStorage.getItem("ingestion_sources");

//     if (!payloadStr || JSON.parse(payloadStr).length === 0) {
//       toast.error("No files selected for ingestion", {
//         duration: 1000,
//         action: closeToastButton,
//       });

//       return;
//     }

//     setIsIngesting(true);

//     setIngestProgress(10);

//     setIngestStatus("Submitting ingestion job...");

//     let pollingInterval: NodeJS.Timeout | null = null;

//     try {
//       // ── NEW: decide which ingest API to call based on the user's
//       // dataplatform stored in localStorage ──────────────────────────────

//       const useDatabricksRoute = isDatabricksUser();

//       const ingestUrl = useDatabricksRoute
//         ? DATABRICKS_INGEST_URL
//         : `https://api.veriton.ai/api/service1/ingest-now?user_id=${userId}&job_id=${currentJobId}`;

//       const ingestBody = useDatabricksRoute
//         ? JSON.stringify(
//             buildDatabricksPayload(
//               userId,
//               currentJobId,
//               JSON.parse(payloadStr),
//             ),
//           )
//         : payloadStr;

//       // 1. Trigger ingestion

//       const ingestResponse = await fetch(ingestUrl, {
//         method: "POST",

//         headers: { "Content-Type": "application/json" },

//         body: ingestBody,
//       });

//       const ingestData = await ingestResponse.json();

//       if (!ingestResponse.ok) {
//         throw new Error(
//           ingestData.note || ingestData.message || "Ingestion request failed",
//         );
//       }

//       setIngestProgress(25);

//       setIngestStatus("Ingestion job started, transferring data...");

//       if (useDatabricksRoute) {
//         // ── NEW: poll GET /api/service-databricks/ingest/{run_id} ─────────

//         const runId = ingestData?.run_id;

//         if (!runId) {
//           throw new Error(
//             "Databricks trigger response did not include a run_id",
//           );
//         }

//         const statusUrl = databricksStatusUrl(runId);

//         pollingInterval = setInterval(async () => {
//           try {
//             const statusRes = await fetch(statusUrl, {
//               method: "GET",

//               headers: { Accept: "application/json" },
//             });

//             if (!statusRes.ok) {
//               console.warn(`Status check failed: ${statusRes.status}`);

//               return;
//             }

//             const statusData = await statusRes.json();

//             const lifeCycleState: string = statusData?.life_cycle_state || "";

//             const resultState: string | null = statusData?.result_state;

//             const stateMessage: string =
//               statusData?.state_message || "In progress...";

//             if (DATABRICKS_IN_PROGRESS_STATES.includes(lifeCycleState)) {
//               setIngestProgress((prev) =>
//                 progressForLifeCycleState(lifeCycleState, prev),
//               );

//               setIngestStatus(stateMessage);

//               return; // keep polling
//             }

//             if (DATABRICKS_TERMINAL_STATES.includes(lifeCycleState)) {
//               clearInterval(pollingInterval!);

//               pollingInterval = null;

//               if (resultState === "SUCCESS") {
//                 setIngestProgress(100);

//                 setIngestStatus("Completed! Redirecting...");

//                 localStorage.removeItem("ingestion_sources");

//                 setSelectedItems([]);

//                 toast.success("Ingestion completed successfully", {
//                   action: closeToastButton,
//                 });

//                 setTimeout(() => navigate("/workflow/landing-zone"), 800);
//               } else {
//                 setIngestProgress(0);

//                 setIngestStatus("");

//                 setIsIngesting(false);

//                 toast.error(
//                   `Ingestion failed: ${stateMessage || resultState || "Unknown error"}`,
//                   {
//                     duration: 2000,
//                     action: closeToastButton,
//                   },
//                 );
//               }

//               return;
//             }

//             // Unrecognized life_cycle_state — log it but keep polling rather
//             // than silently getting stuck.

//             console.warn(`Unrecognized life_cycle_state: ${lifeCycleState}`);

//             setIngestStatus(stateMessage);
//           } catch (pollErr) {
//             console.error("Databricks polling error:", pollErr);
//           }
//         }, 10000);

//         return;
//       }

//       // 2. Poll status (existing ingest-now flow only)

//       const statusUrl = `https://api.veriton.ai/api/service1/ingest-now/status/${currentJobId}?user_id=${userId}`;

//       pollingInterval = setInterval(async () => {
//         try {
//           // Slowly increment progress while polling (capped at 85)

//           setIngestProgress((prev) => (prev < 85 ? prev + 3 : prev));

//           setIngestStatus("Transferring and processing files...");

//           const statusRes = await fetch(statusUrl, {
//             method: "GET",

//             headers: { Accept: "application/json" },
//           });

//           if (!statusRes.ok) {
//             console.warn(`Status check failed: ${statusRes.status}`);

//             return;
//           }

//           const statusData = await statusRes.json();

//           const jobStatus = statusData?.status?.toLowerCase();

//           if (jobStatus === "completed") {
//             clearInterval(pollingInterval!);

//             pollingInterval = null;

//             setIngestProgress(100);

//             setIngestStatus("Completed! Redirecting...");

//             localStorage.removeItem("ingestion_sources");

//             setSelectedItems([]);

//             toast.success("Ingestion completed successfully", {
//               action: closeToastButton,
//             });

//             setTimeout(() => navigate("/workflow/landing-zone"), 800);
//           } else if (["failed", "error"].includes(jobStatus)) {
//             clearInterval(pollingInterval!);

//             pollingInterval = null;

//             const reason =
//               statusData?.results?.[0]?.response?.message || "Unknown error";

//             throw new Error(`Ingestion failed: ${reason}`);
//           }

//           // else → still in progress → continue polling
//         } catch (pollErr) {
//           console.error("Polling error:", pollErr);
//         }
//       }, 10000);
//     } catch (err: any) {
//       console.error("Ingestion error:", err);

//       if (pollingInterval) clearInterval(pollingInterval);

//       setIngestProgress(0);

//       setIngestStatus("");

//       setIsIngesting(false);

//       toast.error(err.message || "Failed to complete ingestion process", {
//         duration: 2000,
//         action: closeToastButton,
//       });
//     }

//     return () => {
//       if (pollingInterval) clearInterval(pollingInterval);
//     };
//   };

//   const openFilePicker = (sourceId: string) => {
//     if (sourceId === "local") {
//       const input = document.createElement("input");

//       input.type = "file";

//       input.multiple = true;

//       input.accept = ".csv,.xlsx,.json,.parquet";

//       input.onchange = async (e) => {
//         const files = (e.target as HTMLInputElement).files;

//         if (!files || files.length === 0) return;

//         const jobId = localStorage.getItem("current_job_id");

//         if (!jobId) {
//           toast.error("No job ID found. Please create a job first.", {
//             duration: 1500,
//             action: closeToastButton,
//           });

//           return;
//         }

//         const formData = new FormData();

//         formData.append("user_id", userId);

//         formData.append("job_id", jobId);

//         Array.from(files).forEach((f) => formData.append("files", f));

//         toast.loading("Uploading local files...", { id: "local-upload",duration:1000, });

//         try {
//           const uploadRes = await fetch(
//             "https://api.veriton.ai/api/service1/ingest-now/upload-local",
//             {
//               method: "POST",

//               body: formData,
//             },
//           );

//           if (!uploadRes.ok) throw new Error("Upload failed");

//           const { blobpath, blobAccountName, blobAccountKey } =
//             await uploadRes.json();

//           const newItems: SelectedItem[] = Array.from(files).map(
//             (file, idx) => ({
//               id: `local-${Date.now()}-${idx}`,

//               name: file.name,

//               source: "Local File",

//               size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,

//               rows: "N/A",

//               icon: "file",

//               sourceType: "local",

//               fullPath: blobpath[idx],
//             }),
//           );

//           setSelectedItems((prev) => [...prev, ...newItems]);

//           const localFilesKey = `local_files_${jobId}`;

//           const existingLocalFiles = JSON.parse(
//             localStorage.getItem(localFilesKey) || "[]",
//           );

//           const updatedLocalFiles = [
//             ...existingLocalFiles,
//             ...newItems.map((i) => i.name),
//           ];

//           localStorage.setItem(
//             localFilesKey,
//             JSON.stringify(updatedLocalFiles),
//           );

//           saveSelectionToStorage(
//             newItems.map((item) => ({
//               name: item.name,
//               fullPath: item.fullPath,
//             })),

//             { accountName: blobAccountName, accountKey: blobAccountKey },

//             "azure",
//             "local",
//           );

//           toast.success("Local files uploaded", { id: "local-upload" ,duration:1000, });
//         } catch (err) {
//           console.error("Local upload error:", err);

//           toast.error("Failed to upload local files", { id: "local-upload",duration:1000, });
//         }
//       };

//       input.click();
//     } else if (sourceId === "databases") {
//       setDatabaseDialogOpen(true);
//     } else {
//       const source = sources.find((s) => s.id === sourceId);

//       if (source?.requiresCredentials) {
//         setPendingSourceId(sourceId);

//         setCredentialDialogOpen(true);
//       } else {
//         setCurrentSource(sourceId);

//         setFilePickerOpen(true);
//       }
//     }
//   };

//   const handleCredentialProceed = (credentials: any) => {
//     if (pendingSourceId === "s3")
//       setS3Credentials(credentials as S3Credentials);
//     else if (pendingSourceId === "azure")
//       setAzureCredentials(credentials as AzureCredentials);
//     else if (pendingSourceId === "onelake")
//       setOneLakeCredentials(credentials as OneLakeCredentials);
//     else if (pendingSourceId === "databricks")
//       setDatabricksCredentials(credentials as DatabricksCredentials);
//     else if (pendingSourceId === "snowflake")
//       setSnowflakeCredentials(credentials as SnowflakeCredentials);

//     setCurrentSource(pendingSourceId);

//     setFilePickerOpen(true);
//   };

//   const handleDatabaseConnect = (config: {
//     server: string;

//     database: string;

//     username: string;

//     password: string;

//     selectedTables: string[];
//   }) => {
//     const newItems: SelectedItem[] = config.selectedTables.map((table) => ({
//       id: `db-${config.database}-${table}-${Date.now()}`,

//       name: table.split(".").pop() || table,

//       source: "SQL Server",

//       size: "N/A",

//       rows: "N/A",

//       icon: "table",

//       sourceType: "databases",

//       fullPath: table,
//     }));

//     setSelectedItems((prev) => [...prev, ...newItems]);

//     saveSelectionToStorage(
//       config.selectedTables.map((table) => ({ name: table, fullPath: table })),

//       {
//         server: config.server,

//         database: config.database,

//         username: config.username,

//         password: config.password,
//       },

//       "databases",
//     );
//   };

//   // ── Progress bar step labels ──────────────────────────────────────────────

//   const progressSteps = [
//     { label: "Submitted", threshold: 10 },

//     { label: "Transferring", threshold: 25 },

//     { label: "Processing", threshold: 60 },

//     { label: "Finalizing", threshold: 85 },

//     { label: "Done", threshold: 100 },
//   ];

//   return (
//     <WorkflowLayout>
//       <div className="p-8 max-w-7xl">
//         {/* Header */}
//         <div className="flex items-center justify-between mb-8">
//           <div>
//             <h1 className="text-3xl font-bold text-foreground mb-2">
//               Data Ingestion
//             </h1>
//             <p className="text-muted-foreground">
//               Connect to your sources and select the files or tables you want to
//               process.
//             </p>
//           </div>
//         </div>

//         {/* Select a Source */}
//         <div className="mb-12">
//           <h2 className="text-xl font-semibold text-foreground mb-6">
//             Select a Source
//           </h2>
//           <div className="grid grid-cols-4 gap-4">
//             {sources.map((source) => {
//               const IconComponent = source.icon;

//               return (
//                 <Card
//                   key={source.id}
//                   className="p-6 cursor-pointer transition-colors border border-border hover:bg-accent/30 group"
//                   onClick={() => openFilePicker(source.id)}
//                 >
//                   <div className="flex flex-col items-center text-center space-y-3">
//                     <div className="w-12 h-12 rounded-lg bg-card-hover border border-border flex items-center justify-center group-hover:border-primary transition-colors">
//                       <IconComponent className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
//                     </div>
//                     <div>
//                       <p className="font-medium text-foreground text-sm">
//                         {source.name}
//                       </p>
//                       <p className="text-xs text-muted-foreground">
//                         {source.description}
//                       </p>
//                     </div>
//                   </div>
//                 </Card>
//               );
//             })}
//           </div>
//         </div>

//         {/* Selected Items */}
//         <div
//           className="space-y-3 overflow-y-auto max-h-[400px] pr-2"
//           ref={selectedItemsRef}
//         >
//           <h2 className="text-xl font-semibold text-foreground mb-6 sticky top-0 bg-background z-10 pb-4">
//             Selected Items
//           </h2>
//           <div className="space-y-3">
//             {selectedItems.length === 0 ? (
//               <p className="text-muted-foreground text-center py-8">
//                 No items selected yet
//               </p>
//             ) : (
//               selectedItems.map((item) => (
//                 <Card
//                   key={item.id}
//                   className="p-4 border border-border hover:border-primary/50 transition-colors"
//                 >
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-4 flex-1">
//                       {getItemIcon(item.icon)}
//                       <div className="flex-1">
//                         <p className="font-medium text-foreground">
//                           {item.name}
//                         </p>
//                         <p className="text-sm text-muted-foreground">
//                           {item.source}
//                         </p>
//                       </div>
//                     </div>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       onClick={() => removeItem(item.id)}
//                       className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
//                     >
//                       <X className="h-4 w-4" />
//                     </Button>
//                   </div>
//                 </Card>
//               ))
//             )}
//           </div>
//         </div>

//         {/* ── Action Button + Progress Bar ── */}
//         <div className="flex flex-col gap-4 mt-6">
//           {/* Progress UI — only visible while ingesting */}

//           {isIngesting && (
//             <div className="w-full rounded-xl border border-border bg-card/60 p-5 space-y-4">
//               {/* Step indicators */}
//               <div className="flex items-center justify-between">
//                 {progressSteps.map((step, i) => {
//                   const reached = ingestProgress >= step.threshold;

//                   const active =
//                     ingestProgress >= step.threshold &&
//                     (i === progressSteps.length - 1 ||
//                       ingestProgress < progressSteps[i + 1].threshold);

//                   return (
//                     <div
//                       key={step.label}
//                       className="flex flex-col items-center gap-1 flex-1"
//                     >
//                       <div
//                         className={[
//                           "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-500",

//                           reached
//                             ? "bg-primary border-primary text-primary-foreground"
//                             : "bg-muted border-border text-muted-foreground",

//                           active ? "ring-2 ring-primary/40 ring-offset-2" : "",
//                         ].join(" ")}
//                       >
//                         {reached && !active ? (
//                           <svg
//                             className="w-3.5 h-3.5"
//                             viewBox="0 0 12 12"
//                             fill="none"
//                           >
//                             <path
//                               d="M2 6l3 3 5-5"
//                               stroke="currentColor"
//                               strokeWidth="2"
//                               strokeLinecap="round"
//                               strokeLinejoin="round"
//                             />
//                           </svg>
//                         ) : (
//                           i + 1
//                         )}
//                       </div>
//                       <span
//                         className={[
//                           "text-[10px] font-medium text-center leading-tight",

//                           reached ? "text-primary" : "text-muted-foreground",
//                         ].join(" ")}
//                       >
//                         {step.label}
//                       </span>

//                       {/* Connector line between steps */}

//                       {i < progressSteps.length - 1 && (
//                         <div className="absolute" />
//                       )}
//                     </div>
//                   );
//                 })}
//               </div>

//               {/* Bar */}
//               <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
//                 <div
//                   className="h-full rounded-full transition-all duration-700 ease-in-out"
//                   style={{
//                     width: `${ingestProgress}%`,

//                     background:
//                       ingestProgress === 100
//                         ? "hsl(var(--primary))"
//                         : "linear-gradient(90deg, hsl(var(--primary)/0.7), hsl(var(--primary)))",
//                   }}
//                 />
//               </div>

//               {/* Status text + percentage */}
//               <div className="flex items-center justify-between text-sm">
//                 <div className="flex items-center gap-2 text-muted-foreground">
//                   {ingestProgress < 100 ? (
//                     <Loader2 className="h-3.5 w-3.5 animate-spin flex-shrink-0" />
//                   ) : (
//                     <svg
//                       className="w-3.5 h-3.5 text-primary flex-shrink-0"
//                       viewBox="0 0 12 12"
//                       fill="none"
//                     >
//                       <path
//                         d="M2 6l3 3 5-5"
//                         stroke="currentColor"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                         strokeLinejoin="round"
//                       />
//                     </svg>
//                   )}
//                   <span>{ingestStatus}</span>
//                 </div>
//                 <span className="font-semibold text-primary tabular-nums">
//                   {ingestProgress}%
//                 </span>
//               </div>

//               {ingestProgress < 100 && (
//                 <p className="text-xs text-muted-foreground">
//                   Please wait — this may take a few minutes depending on file
//                   size.
//                 </p>
//               )}
//             </div>
//           )}

//           {/* Button — right-aligned */}
//           <div className="flex justify-end">
//             <Button
//               onClick={handleProceed}
//               size="lg"
//               className="px-10 flex items-center gap-2 min-w-[220px]"
//               disabled={selectedItems.length === 0 || !userId || isIngesting}
//             >
//               {isIngesting ? (
//                 <>
//                   <Loader2 className="h-5 w-5 animate-spin" />
//                   Processing Ingestion...
//                 </>
//               ) : (
//                 "Ingest / Proceed"
//               )}
//             </Button>
//           </div>
//         </div>

//         {/* Dialogs */}
//         <SourceCredentialDialog
//           open={credentialDialogOpen}
//           onOpenChange={setCredentialDialogOpen}
//           sourceName={sources.find((s) => s.id === pendingSourceId)?.name || ""}
//           sourceId={pendingSourceId}
//           onProceed={handleCredentialProceed}
//         />
//         <FilePickerDialog
//           open={filePickerOpen}
//           onOpenChange={setFilePickerOpen}
//           sourceName={sources.find((s) => s.id === currentSource)?.name || ""}
//           files={[]}
//           onSelect={handleFileSelection}
//           s3Credentials={s3Credentials}
//           isS3={currentSource === "s3"}
//           azureCredentials={azureCredentials}
//           isAzure={currentSource === "azure"}
//           oneLakeCredentials={oneLakeCredentials}
//           isOneLake={currentSource === "onelake"}
//           databricksCredentials={databricksCredentials}
//           isDatabricks={currentSource === "databricks"}
//           snowflakeCredentials={snowflakeCredentials}
//           isSnowflake={currentSource === "snowflake"}
//         />
//         <SchemaPreviewDialog
//           open={schemaPreviewOpen}
//           onOpenChange={setSchemaPreviewOpen}
//           fileName={previewFileName}
//         />
//         <DatabaseConnectionDialog
//           open={databaseDialogOpen}
//           onOpenChange={setDatabaseDialogOpen}
//           onConnect={handleDatabaseConnect}
//         />
//       </div>
//     </WorkflowLayout>
//   );
// }

import { useState, useEffect, useRef } from "react";

import { useNavigate } from "react-router-dom";

import { WorkflowLayout } from "@/components/WorkflowLayout";

import { Button } from "@/components/ui/button";

import { Card } from "@/components/ui/card";

import {
  Database,
  Cloud,
  Snowflake,
  FileText,
  FolderOpen,
  X,
  FileSpreadsheet,
  Table,
  Upload,
} from "lucide-react";

import { FilePickerDialog } from "@/components/FilePickerDialog";

import { SchemaPreviewDialog } from "@/components/SchemaPreviewDialog";

import { DatabaseConnectionDialog } from "@/components/DatabaseConnectionDialog";

import { SourceCredentialDialog } from "@/components/SourceCredentialDialog";

import { toast } from "sonner";

import { Loader2 } from "lucide-react";

import {
  S3Credentials,
  AzureCredentials,
  OneLakeCredentials,
  DatabricksCredentials,
  SnowflakeCredentials,
  SapCredentials,
  ingestLocalFileToDatabricks,
} from "@/components/api/api";

interface SelectedItem {
  id: string;

  name: string;

  source: string;

  size: string;

  rows: string;

  icon: "file" | "table" | "folder";

  sourceType: string;

  fullPath: string;
}

interface UserDetails {
  id: string;

  email: string;

  name: string;

  dataplatform?: string;
}

const sources = [
  {
    id: "s3",
    name: "S3",
    description: "Cloud Storage",
    icon: Database,
    requiresCredentials: true,
  },

  {
    id: "azure",
    name: "Azure Blob",
    description: "Cloud Storage",
    icon: Cloud,
    requiresCredentials: true,
  },

  {
    id: "snowflake",
    name: "Snowflake",
    description: "Database",
    icon: Snowflake,
    requiresCredentials: true,
  },

  {
    id: "sap",
    name: "SAP",
    description: "Database",
    icon: Database,
    requiresCredentials: true,
  },

  {
    id: "databases",
    name: "Databases",
    description: "Generic SQL",
    icon: Database,
    requiresCredentials: false,
  },

  {
    id: "onelake",
    name: "OneLake",
    description: "Microsoft Fabric",
    icon: Database,
    requiresCredentials: true,
  },

  {
    id: "databricks",
    name: "Databricks",
    description: "Delta Lake",
    icon: Table,
    requiresCredentials: true,
  },

  {
    id: "local",
    name: "Local files",
    description: "Upload",
    icon: Upload,
    requiresCredentials: false,
  },
];

// ── NEW: helpers for the Databricks-platform ingest route ──────────────────

const DATABRICKS_INGEST_URL =
  "https://api.veriton.ai/api/service-databricks/ingest";

const databricksStatusUrl = (runId: number | string) =>
  `${DATABRICKS_INGEST_URL}/${runId}`;

// Base landing-zone volume. Local files are uploaded per-user/per-job under
// this path (see ingestLocalFileToDatabricks / SERVICE_DATABRICKS_BASE in
// api.ts: /Volumes/veriton-db/landing/raw_files/{userId}/{jobId}/...).
//
// IMPORTANT: send this constant AS-IS in the /ingest trigger payload — do
// NOT append {userId}/{jobId} to it yourself. The Databricks notebook
// (ingest.py) already appends {userId}/{jobId} internally when writing
// output. Manually scoping it here as well was tried and confirmed (via
// the actual Databricks volume browser) to produce a doubled path:
// .../raw_files/{userId}/{jobId}/{userId}/{jobId}/file.parquet
// instead of the correct:
// .../raw_files/{userId}/{jobId}/file.csv
const DEFAULT_LANDING_ZONE = "/Volumes/veriton-db/landing/raw_files";

// Databricks job-run life cycle states that mean "still going" — keep polling.
const DATABRICKS_IN_PROGRESS_STATES = [
  "PENDING",
  "QUEUED",
  "WAITING_FOR_RETRY",
  "BLOCKED",
  "RUNNING",
  "TERMINATING",
];

// Terminal life cycle states — stop polling once we hit one of these.
const DATABRICKS_TERMINAL_STATES = ["TERMINATED", "SKIPPED", "INTERNAL_ERROR"];

/**
 * Maps a Databricks run's life_cycle_state to a rough progress percentage,
 * so the same step indicator UI (Submitted / Transferring / Processing /
 * Finalizing / Done) still makes sense for the Databricks route.
 */
function progressForLifeCycleState(state: string, current: number): number {
  switch (state) {
    case "PENDING":
    case "QUEUED":
    case "WAITING_FOR_RETRY":
    case "BLOCKED":
      return Math.max(current, 30);

    case "RUNNING":
      return current < 85 ? current + 3 : current;

    case "TERMINATING":
      return Math.max(current, 90);

    default:
      return current;
  }
}

/**
 * Reads the "user" object from localStorage and returns true if the user's
 * dataplatform is "Databricks". This decides which ingest API to call.
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

/**
 * A local file's fullPath tells us whether it was uploaded directly into the
 * Databricks landing-zone volume (new /ingest-local-file route) or staged as
 * an Azure blob via the legacy /upload-local route.
 */
function isDatabricksLandingPath(path: string): boolean {
  return path.startsWith("/Volumes/");
}

/**
 * Transforms the existing "ingestion_sources" localStorage entries (the
 * shape used by the ingest-now API) into the payload shape expected by the
 * Databricks trigger API (/api/service-databricks/ingest).
 *
 * NOTE / ASSUMPTIONS that still need confirmation:
 *  - Snowflake: the Databricks API sample expects key-pair auth via
 *    `snowflakePrivateKey` + `snowflakePrivateKeyPassphrase`, not the
 *    password we currently collect in the credentials dialog. Until the
 *    dialog collects a private key, this field will be empty/incorrect.
 *  - S3: existing `s3path` entries are stored as full `s3://bucket/key`
 *    strings, so `bucket` is derived by splitting on the first "/".
 *  - Blob: same idea — `container` is derived from the first path segment.
 *  - `region` for S3 isn't currently collected anywhere, defaults to
 *    "us-east-1".
 *  - SAP / Databricks / Snowflake / SQL Server entries only carry a single
 *    `table` per source_type + credentials combination today (same
 *    limitation that already existed for Databricks/Snowflake/SQL Server
 *    before this change) — only the first selected table is sent here.
 *  - Local files uploaded via the Databricks landing-zone route
 *    (isDatabricksUser() === true) are NOT included in this payload, and
 *    this function is no longer even called for a local-files-only
 *    selection. /ingest-local-file already places them in their final
 *    landing-zone location the moment they're uploaded, so there's
 *    nothing left for the /ingest trigger call to do for them — see the
 *    early-return branch in handleProceed() that skips straight to
 *    Landing Zone when only local files are selected.
 *  - SAP (FIXED): the /ingest Swagger schema expects host/port/schema/
 *    table/username/password as FLAT fields directly on the source object
 *    — NOT nested inside a "connection" object. The previous version wrapped
 *    credentials in `connection: {...}`, so the Databricks job never
 *    received them, silently failed to connect, and the run terminated
 *    with a generic "Workload failed" message. This is now flattened to
 *    match Swagger exactly.
 */
function buildDatabricksPayload(
  userId: string,
  jobId: string,
  ingestionSources: any[],
) {
  const sources = ingestionSources

    .map((entry: any) => {
      switch (entry.source_type) {
        case "s3": {
          const paths: string[] = entry.s3path || [];

          const firstNoScheme = (paths[0] || "").replace(/^s3:\/\//, "");

          const bucket = firstNoScheme.split("/")[0] || "";

          return {
            sourceType: "s3",

            connection: {
              accessKey: entry.s3AccessKey,
              secretKey: entry.s3SecretKey,
              region: entry.s3Region || "us-east-1",
            },

            bucket,

            paths: paths.map((p) => {
              const noScheme = p.replace(/^s3:\/\//, "");

              const parts = noScheme.split("/");

              return parts.slice(1).join("/");
            }),
          };
        }

        case "blob": {
          const paths: string[] = entry.blobpath || [];

          const container = (paths[0] || "").split("/")[0] || "";

          return {
            sourceType: "blob",

            container,

            connection: {
              accountName: entry.blobAccountName,
              accountKey: entry.blobAccountKey,
            },

            paths: paths.map((p) => p.split("/").slice(1).join("/")),
          };
        }

        case "onelake":
          return {
            sourceType: "onelake",

            workspaceName: entry.workspace_name,
            lakehouseName: entry.lakehouse_name,

            connection: {
              tenantId: entry.tenant_id,
              clientId: entry.client_id,
              clientSecret: entry.client_secret,
            },

            paths: entry.file_path || [],
          };

        case "databricks":
          return {
            sourceType: "databricks",

            databricks_host: entry.databricks_host,
            warehouse_id: entry.warehouse_id,
            access_token: entry.access_token,
            catalog: entry.catalog,
            schema: entry.schema,

            table: Array.isArray(entry.table) ? entry.table[0] : entry.table,
          };

        case "snowflake":
          return {
            sourceType: "snowflake",

            snowflake_schema: entry.snowflake_schema,

            snowflake_table: Array.isArray(entry.snowflake_table)
              ? entry.snowflake_table[0]
              : entry.snowflake_table,

            snowflakeAccount: entry.snowflakeAccount,
            snowflakeDatabase: entry.snowflakeDatabase,
            snowflakeWarehouse: entry.snowflakeWarehouse,
            snowflakeUser: entry.snowflakeUser,

            // See NOTE above — this API expects key-pair auth, not password.
            snowflakePrivateKey: entry.snowflakePrivateKey || "",
            snowflakePrivateKeyPassphrase:
              entry.snowflakePrivateKeyPassphrase || "",
          };

        // ── FIXED: flattened to match the /ingest Swagger schema exactly.
        // Previously this returned a nested `connection: {...}` object,
        // which the Databricks "saphana" ingest path never reads — it
        // expects host/port/username/password directly on the source
        // object, same level as sourceType/schema/table. That mismatch is
        // what caused every SAP run to TERMINATE with result_state FAILED
        // in the app while the same credentials worked fine in Swagger
        // (where the flat shape was used directly).
        case "sap":
          return {
            sourceType: "saphana",

            host: entry.sapHost,
            port: Number(entry.sapPort) || 443,
            schema: entry.sapSchema,
            table: Array.isArray(entry.table) ? entry.table[0] : entry.table,
            username: entry.sapUsername,
            password: entry.sapPassword,
          };

        case "sqlserver":
          return {
            sourceType: "sqlserver",

            server: entry.server,
            database: entry.database,
            username: entry.username,
            password: entry.password,

            table: Array.isArray(entry.table) ? entry.table[0] : entry.table,
          };

        default:
          console.warn(
            `Unmapped source_type for Databricks payload: ${entry.source_type}`,
          );

          return null;
      }
    })

    .filter(Boolean);

  return {
    userId,
    jobId,
    // REVERTED: landingZone must stay as the plain root volume path.
    // The Databricks notebook (ingest.py) already appends {userId}/{jobId}
    // internally when it writes files — confirmed by comparing the actual
    // output folder structure for a run. Manually appending userId/jobId
    // here as well caused a DOUBLED path
    // (.../raw_files/{userId}/{jobId}/{userId}/{jobId}/file.parquet)
    // instead of the correct single-level path
    // (.../raw_files/{userId}/{jobId}/file.csv). Do not re-add the
    // userId/jobId suffix here.
    landingZone: DEFAULT_LANDING_ZONE,
    sources,
  };
}

// ─────────────────────────────────────────────────────────────────────────

export default function DataIngestion() {
  const navigate = useNavigate();

  const selectedItemsRef = useRef<HTMLDivElement>(null);

  const [isIngesting, setIsIngesting] = useState(false);

  // ── NEW: progress bar state ──────────────────────────────────────────────

  const [ingestProgress, setIngestProgress] = useState(0);

  const [ingestStatus, setIngestStatus] = useState("");

  // ────────────────────────────────────────────────────────────────────────

  const [userId, setUserId] = useState<string>("");

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  const [filePickerOpen, setFilePickerOpen] = useState(false);

  const [currentSource, setCurrentSource] = useState<string>("");

  const [schemaPreviewOpen, setSchemaPreviewOpen] = useState(false);

  const [previewFileName, setPreviewFileName] = useState("");

  const [databaseDialogOpen, setDatabaseDialogOpen] = useState(false);

  const [credentialDialogOpen, setCredentialDialogOpen] = useState(false);

  const [pendingSourceId, setPendingSourceId] = useState<string>("");

  const [s3Credentials, setS3Credentials] = useState<S3Credentials | null>(
    null,
  );

  const [azureCredentials, setAzureCredentials] =
    useState<AzureCredentials | null>(null);

  const [oneLakeCredentials, setOneLakeCredentials] =
    useState<OneLakeCredentials | null>(null);

  const [databricksCredentials, setDatabricksCredentials] =
    useState<DatabricksCredentials | null>(null);

  const [snowflakeCredentials, setSnowflakeCredentials] =
    useState<SnowflakeCredentials | null>(null);

  const [sapCredentials, setSapCredentials] =
    useState<SapCredentials | null>(null);

  // Reusable X close button for all toasts

  const closeToastButton = (
    <button
      onClick={() => toast.dismiss()}
      className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
      aria-label="Close toast"
    >
      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
    </button>
  );

  // Auto-scroll to selected items section when items are added

  useEffect(() => {
    if (selectedItems.length > 0 && selectedItemsRef.current) {
      setTimeout(() => {
        const scrollableParent = selectedItemsRef.current?.closest("main");

        if (scrollableParent && selectedItemsRef.current) {
          const elementTop = selectedItemsRef.current.offsetTop;

          const targetScroll = elementTop - 80;

          scrollableParent.scrollTo({
            top: targetScroll,

            behavior: "smooth",
          });
        }
      }, 150);
    }
  }, [selectedItems.length]);

  // Load user & restore selected items from localStorage

  useEffect(() => {
    const userData = localStorage.getItem("user");

    if (userData) {
      try {
        const user: UserDetails = JSON.parse(userData);

        setUserId(user.id || "unknown-user");
      } catch (err) {
        console.error("Failed to parse user data:", err);

        setUserId("unknown-user");
      }
    } else {
      toast.error("No user logged in.", {
        duration: 1000,
        action: closeToastButton,
      });

      setUserId("unknown-user");
    }

    const saved = localStorage.getItem("ingestion_sources");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed) && parsed.length > 0) {
          const restoredItems: SelectedItem[] = [];

          parsed.forEach((entry: any, groupIndex: number) => {
            const sourceType = entry.source_type || "unknown";

            const sourceName =
              sources.find((s) => s.id === sourceType)?.name || sourceType;

            if (sourceType === "s3" && Array.isArray(entry.s3path)) {
              entry.s3path.forEach((path: string, idx: number) => {
                const name = path.split("/").pop() || path;

                restoredItems.push({
                  id: `restored-s3-${groupIndex}-${idx}-${Date.now()}`,

                  name,
                  source: sourceName,
                  size: "N/A",
                  rows: "N/A",

                  icon: "file",
                  sourceType,
                  fullPath: path,
                });
              });
            } else if (sourceType === "blob" && Array.isArray(entry.blobpath)) {
              entry.blobpath.forEach((path: string, idx: number) => {
                const name = path.split("/").pop() || path;

                restoredItems.push({
                  id: `restored-blob-${groupIndex}-${idx}-${Date.now()}`,

                  name,
                  source: sourceName,
                  size: "N/A",
                  rows: "N/A",

                  icon: "file",
                  sourceType,
                  fullPath: path,
                });
              });
            } else if (
              sourceType === "onelake" &&
              Array.isArray(entry.file_path)
            ) {
              entry.file_path.forEach((path: string, idx: number) => {
                const name = path.split("/").pop() || path;

                restoredItems.push({
                  id: `restored-onelake-${groupIndex}-${idx}-${Date.now()}`,

                  name,
                  source: sourceName,
                  size: "N/A",
                  rows: "N/A",

                  icon: "file",
                  sourceType,
                  fullPath: path,
                });
              });
            } else if (
              sourceType === "databricks" &&
              Array.isArray(entry.table)
            ) {
              entry.table.forEach((tbl: string, idx: number) => {
                const name = tbl.split(".").pop() || tbl;

                restoredItems.push({
                  id: `restored-databricks-${groupIndex}-${idx}-${Date.now()}`,

                  name,
                  source: sourceName,
                  size: "N/A",
                  rows: "N/A",

                  icon: "table",
                  sourceType,
                  fullPath: tbl,
                });
              });
            } else if (
              sourceType === "sap" &&
              Array.isArray(entry.table)
            ) {
              entry.table.forEach((tbl: string, idx: number) => {
                restoredItems.push({
                  id: `restored-sap-${groupIndex}-${idx}-${Date.now()}`,

                  name: tbl,
                  source: sourceName,
                  size: "N/A",
                  rows: "N/A",

                  icon: "table",
                  sourceType,
                  fullPath: tbl,
                });
              });
            } else if (
              sourceType === "sqlserver" &&
              Array.isArray(entry.table)
            ) {
              entry.table.forEach((tbl: string, idx: number) => {
                const name = tbl.split(".").pop() || tbl;

                restoredItems.push({
                  id: `restored-sql-${groupIndex}-${idx}-${Date.now()}`,

                  name,
                  source: sourceName || "SQL Server",
                  size: "N/A",
                  rows: "N/A",

                  icon: "table",
                  sourceType,
                  fullPath: tbl,
                });
              });
            }
          });

          setSelectedItems(restoredItems);
        }
      } catch (err) {
        console.error("Failed to restore items:", err);
      }
    }
  }, []);

  const LOCAL_UPLOADS_CONTAINER = "local-uploads";

  const removeItem = async (id: string) => {
    const item = selectedItems.find((i) => i.id === id);

    if (!item) return;

    setSelectedItems((prev) => prev.filter((i) => i.id !== id));

    if (item.sourceType === "local") {
      // Files ingested via the Databricks landing-zone route
      // (/api/service-databricks/ingest-local-file) live under /Volumes/...
      // and don't have a delete endpoint yet — just drop local tracking
      // for them instead of calling the legacy blob-delete API.
      const isDatabricksFile = isDatabricksLandingPath(item.fullPath);

      if (!isDatabricksFile) {
        try {
          const res = await fetch(
            `https://api.veriton.ai/api/service1/ingest-now/delete-local?blob_path=${encodeURIComponent(item.fullPath)}`,

            { method: "DELETE" },
          );

          if (!res.ok) throw new Error("Delete request failed");
        } catch (err) {
          console.error("Failed to delete local blob:", err);

          toast.error(`Failed to remove ${item.name} from storage`, {
            duration: 2000,
            action: closeToastButton,
          });
        }

        try {
          const existing = JSON.parse(
            localStorage.getItem("ingestion_sources") || "[]",
          );

          const updated = existing

            .map((entry: any) => {
              if (entry.source_type === "blob" && Array.isArray(entry.blobpath)) {
                // Only strip paths that belong to the local-uploads container —

                // identified by path prefix, not blobAccountName

                const filteredPaths = entry.blobpath.filter((p: string) =>
                  p.startsWith(`${LOCAL_UPLOADS_CONTAINER}/`)
                    ? p !== item.fullPath
                    : true,
                );

                return { ...entry, blobpath: filteredPaths };
              }

              return entry;
            })

            .filter(
              (entry: any) =>
                !(entry.source_type === "blob" && entry.blobpath?.length === 0),
            );

          localStorage.setItem("ingestion_sources", JSON.stringify(updated));
        } catch (err) {
          console.error("Failed to update ingestion_sources:", err);
        }
      } else {
        console.info(
          `No delete endpoint yet for Databricks landing-volume file: ${item.fullPath}`,
        );
      }

      // Step 3: NEW — remove it from the tracked local-files list too,

      // so Landing Zone doesn't still think this filename is a local file

      // if the same name ever reappears from a real Azure source later

      try {
        const jobId = localStorage.getItem("current_job_id");

        const localFilesKey = `local_files_${jobId}`;

        const existingLocalFiles = JSON.parse(
          localStorage.getItem(localFilesKey) || "[]",
        );

        localStorage.setItem(
          localFilesKey,

          JSON.stringify(
            existingLocalFiles.filter((name: string) => name !== item.name),
          ),
        );
      } catch (err) {
        console.error("Failed to update local_files tracking:", err);
      }
    }
  };

  const getItemIcon = (iconType: "file" | "table" | "folder") => {
    switch (iconType) {
      case "file":
        return <FileSpreadsheet className="h-5 w-5 text-green-500" />;

      case "table":
        return <Table className="h-5 w-5 text-blue-500" />;

      case "folder":
        return <FolderOpen className="h-5 w-5 text-yellow-500" />;

      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const saveSelectionToStorage = (
    files: Array<{ name: string; fullPath: string }>,

    credentials: any,

    sourceType: string,
    displayLabel?: string
  ) => {
    const existing = JSON.parse(
      localStorage.getItem("ingestion_sources") || "[]",
    );

    const paths = files.map((f) => f.fullPath).filter(Boolean);

    if (paths.length === 0) return;

    let newEntry: any = { destination_path: userId };

    switch (sourceType) {
      case "s3":
        newEntry = {
          ...newEntry,

          source_type: "s3",

          s3path: paths.map((p) => (p.startsWith("s3://") ? p : `s3://${p}`)),

          s3AccessKey:
            credentials?.aws_access_key_id ||
            credentials?.accessKey ||
            credentials?.s3AccessKey,

          s3SecretKey:
            credentials?.aws_secret_access_key ||
            credentials?.secretKey ||
            credentials?.s3SecretKey,

          s3ServiceUrl: credentials?.s3ServiceUrl || "https://s3.amazonaws.com",
        };

        break;

      case "azure":
        newEntry = {
          ...newEntry,

          source_type: "blob",

          blobpath: paths,

          blobAccountName:
            credentials?.accountName ||
            credentials?.connection_string?.match(/AccountName=([^;]+)/)?.[1] ||
            "agenticbistorage",

          blobAccountKey:
            credentials?.accountKey ||
            credentials?.connection_string?.match(/AccountKey=([^;]+)/)?.[1],
        };

        break;

      case "onelake":
        newEntry = {
          ...newEntry,

          source_type: "onelake",

          workspace_name: credentials?.workspace_name || "agenticBI",

          lakehouse_name: credentials?.lakehouse_name || "newagenticBI",

          copy_type: "file",

          file_path: paths,

          client_id: credentials?.client_id,

          client_secret: credentials?.client_secret,

          tenant_id: credentials?.tenant_id,
        };

        break;

      case "databricks":
        newEntry = {
          ...newEntry,

          source_type: "databricks",

          databricks_host: credentials?.host || credentials?.databricks_host,

          warehouse_id: credentials?.warehouse_id,

          access_token: credentials?.access_token,

          catalog: credentials?.catalog || "agenticbi_adb",

          schema: credentials?.schema || "default",

          table: paths,
        };

        break;

      case "sap": {
        const sapTables = paths.map((p) => p.split("/").pop() || p);

        const sapEntry = {
          destination_path: userId,

          source_type: "sap",

          sapHost: credentials?.host,
          sapPort: credentials?.port,
          sapUsername: credentials?.username,
          sapPassword: credentials?.password,
          sapSchema: credentials?.schema,

          table: sapTables,
        };

        const isDuplicate = existing.some(
          (e: any) =>
            e.source_type === "sap" &&
            JSON.stringify(e) === JSON.stringify(sapEntry),
        );

        const updated = isDuplicate ? existing : [...existing, sapEntry];

        localStorage.setItem("ingestion_sources", JSON.stringify(updated));

        toast.success(`Added ${paths.length} item(s) from ${displayLabel || sourceType}`, {
          duration: 1000,
          action: closeToastButton,
        });

        return;
      }

      case "snowflake": {
        const snowflakeTables = paths.map((p) => {
          const parts = p.split("/");

          return parts[parts.length - 1]; // just the table name
        });

        const newEntry = {
          destination_path: userId,

          source_type: "snowflake",

          snowflakeAccount: credentials?.account_identifier,

          snowflakeUser: credentials?.username,

          snowflakePassword: credentials?.password,

          snowflakeWarehouse: credentials?.warehouse,

          snowflakeDatabase: credentials?.database,

          snowflake_schema: credentials?.schema,

          snowflake_table: snowflakeTables, // ARRAY now
        };

        const isDuplicate = existing.some(
          (e) =>
            e.source_type === "snowflake" &&
            JSON.stringify(e) === JSON.stringify(newEntry),
        );

        const updated = isDuplicate ? existing : [...existing, newEntry];

        localStorage.setItem("ingestion_sources", JSON.stringify(updated));

        toast.success(`Added ${paths.length} item(s) from snowflake`, {
          duration: 1000,
          action: closeToastButton,
        });

        return;
      }

      case "databases":
        newEntry = {
          ...newEntry,

          source_type: "sqlserver",

          server: credentials?.server || credentials?.host,

          database: credentials?.database,

          username: credentials?.username,

          password: credentials?.password,

          table: paths,
        };

        break;

      default:
        console.warn(`Unsupported source type: ${sourceType}`);

        return;
    }

    const isDuplicate = existing.some(
      (e: any) =>
        e.source_type === newEntry.source_type &&
        JSON.stringify(e) === JSON.stringify(newEntry),
    );

    const updated = isDuplicate ? existing : [...existing, newEntry];

    localStorage.setItem("ingestion_sources", JSON.stringify(updated));

    toast.success(`Added ${paths.length} item(s) from ${displayLabel || sourceType}`, {
      duration: 1000,

      action: closeToastButton,
    });
  };

  const handleFileSelection = (
    files: Array<{
      id: string;
      name: string;
      size: string;
      rows: string;
      fullPath?: string;
    }>,

    credentials?: any,

    extra?: { currentContainer?: string | null },
  ) => {
    if (credentials && currentSource && files.length > 0) {
      saveSelectionToStorage(
        files.map((f) => {
          let pathToUse = f.fullPath ?? f.id ?? f.name;

          if (currentSource === "azure" && extra?.currentContainer) {
            const containerPrefix = `${extra.currentContainer}/`;

            if (!pathToUse.startsWith(containerPrefix)) {
              pathToUse = containerPrefix + pathToUse;
            }
          }

          return { name: f.name, fullPath: pathToUse };
        }),

        credentials,

        currentSource,
      );
    }

    const newItems: SelectedItem[] = files.map((file) => {
      let icon: "file" | "table" | "folder" = "file";

      if (["snowflake", "databricks", "databases", "sap"].includes(currentSource))
        icon = "table";

      return {
        id: `${currentSource}-${file.id || Date.now()}-${Math.random().toString(36).slice(2, 9)}`,

        name: file.name,

        source: sources.find((s) => s.id === currentSource)?.name || "Unknown",

        size: file.size,

        rows: file.rows,

        icon,

        sourceType: currentSource,

        fullPath: file.fullPath || file.name,
      };
    });

    setSelectedItems((prev) => [...prev, ...newItems]);
  };

  const handleProceed = async () => {
    if (!userId || userId === "unknown-user") {
      toast.error("User not authenticated. Please login again.", {
        duration: 1000,
        action: closeToastButton,
      });

      return;
    }

    const currentJobId = localStorage.getItem("current_job_id");

    if (!currentJobId) {
      toast.error("No job ID found. Please create a job first.", {
        duration: 1000,
        action: closeToastButton,
      });

      return;
    }

    const payloadStr = localStorage.getItem("ingestion_sources");

    const externalSources = payloadStr ? JSON.parse(payloadStr) : [];

    // Local files uploaded directly into the Databricks landing volume
    // don't get an ingestion_sources entry (there's nothing left to fetch),
    // so we can't rely on ingestion_sources alone to decide "nothing to do".
    const hasLocalDatabricksItems = selectedItems.some(
      (i) => i.sourceType === "local" && isDatabricksLandingPath(i.fullPath),
    );

    if (externalSources.length === 0 && !hasLocalDatabricksItems) {
      toast.error("No files selected for ingestion", {
        duration: 1000,
        action: closeToastButton,
      });

      return;
    }

    // ── NEW: local-files-only selection for a Databricks user needs no
    // /ingest trigger call at all. ingestLocalFileToDatabricks() (called at
    // upload time via /ingest-local-file) already wrote these files into
    // their final landing-zone location — that's the whole job done. Calling
    // /ingest again here was redundant and was the source of the earlier
    // local-file failures/wrong-path issues. Skip straight to Landing Zone.
    if (
      isDatabricksUser() &&
      externalSources.length === 0 &&
      hasLocalDatabricksItems
    ) {
      localStorage.removeItem("ingestion_sources");

      setSelectedItems([]);

      toast.success("Files are ready in the landing zone", {
        duration: 1000,
        action: closeToastButton,
      });

      navigate("/workflow/landing-zone");

      return;
    }

    setIsIngesting(true);

    setIngestProgress(10);

    setIngestStatus("Submitting ingestion job...");

    let pollingInterval: NodeJS.Timeout | null = null;

    try {
      // ── NEW: decide which ingest API to call based on the user's
      // dataplatform stored in localStorage ──────────────────────────────

      const useDatabricksRoute = isDatabricksUser();

      const ingestUrl = useDatabricksRoute
        ? DATABRICKS_INGEST_URL
        : `https://api.veriton.ai/api/service1/ingest-now?user_id=${userId}&job_id=${currentJobId}`;

      const ingestBody = useDatabricksRoute
        ? JSON.stringify(
            buildDatabricksPayload(
              userId,
              currentJobId,
              externalSources,
            ),
          )
        : payloadStr;

      // 1. Trigger ingestion

      const ingestResponse = await fetch(ingestUrl, {
        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: ingestBody,
      });

      const ingestData = await ingestResponse.json();

      if (!ingestResponse.ok) {
        throw new Error(
          ingestData.note || ingestData.message || "Ingestion request failed",
        );
      }

      setIngestProgress(25);

      setIngestStatus("Ingestion job started, transferring data...");

      if (useDatabricksRoute) {
        // ── NEW: poll GET /api/service-databricks/ingest/{run_id} ─────────

        const runId = ingestData?.run_id;

        if (!runId) {
          throw new Error(
            "Databricks trigger response did not include a run_id",
          );
        }

        const statusUrl = databricksStatusUrl(runId);

        pollingInterval = setInterval(async () => {
          try {
            const statusRes = await fetch(statusUrl, {
              method: "GET",

              headers: { Accept: "application/json" },
            });

            if (!statusRes.ok) {
              console.warn(`Status check failed: ${statusRes.status}`);

              return;
            }

            const statusData = await statusRes.json();

            const lifeCycleState: string = statusData?.life_cycle_state || "";

            const resultState: string | null = statusData?.result_state;

            const stateMessage: string =
              statusData?.state_message || "In progress...";

            if (DATABRICKS_IN_PROGRESS_STATES.includes(lifeCycleState)) {
              setIngestProgress((prev) =>
                progressForLifeCycleState(lifeCycleState, prev),
              );

              setIngestStatus(stateMessage);

              return; // keep polling
            }

            if (DATABRICKS_TERMINAL_STATES.includes(lifeCycleState)) {
              clearInterval(pollingInterval!);

              pollingInterval = null;

              if (resultState === "SUCCESS") {
                setIngestProgress(100);

                setIngestStatus("Completed! Redirecting...");

                localStorage.removeItem("ingestion_sources");

                setSelectedItems([]);

                toast.success("Ingestion completed successfully", {
                  action: closeToastButton,
                });

                setTimeout(() => navigate("/workflow/landing-zone"), 800);
              } else {
                setIngestProgress(0);

                setIngestStatus("");

                setIsIngesting(false);

                toast.error(
                  `Ingestion failed: ${stateMessage || resultState || "Unknown error"}`,
                  {
                    duration: 2000,
                    action: closeToastButton,
                  },
                );
              }

              return;
            }

            // Unrecognized life_cycle_state — log it but keep polling rather
            // than silently getting stuck.

            console.warn(`Unrecognized life_cycle_state: ${lifeCycleState}`);

            setIngestStatus(stateMessage);
          } catch (pollErr) {
            console.error("Databricks polling error:", pollErr);
          }
        }, 10000);

        return;
      }

      // 2. Poll status (existing ingest-now flow only)

      const statusUrl = `https://api.veriton.ai/api/service1/ingest-now/status/${currentJobId}?user_id=${userId}`;

      pollingInterval = setInterval(async () => {
        try {
          // Slowly increment progress while polling (capped at 85)

          setIngestProgress((prev) => (prev < 85 ? prev + 3 : prev));

          setIngestStatus("Transferring and processing files...");

          const statusRes = await fetch(statusUrl, {
            method: "GET",

            headers: { Accept: "application/json" },
          });

          if (!statusRes.ok) {
            console.warn(`Status check failed: ${statusRes.status}`);

            return;
          }

          const statusData = await statusRes.json();

          const jobStatus = statusData?.status?.toLowerCase();

          if (jobStatus === "completed") {
            clearInterval(pollingInterval!);

            pollingInterval = null;

            setIngestProgress(100);

            setIngestStatus("Completed! Redirecting...");

            localStorage.removeItem("ingestion_sources");

            setSelectedItems([]);

            toast.success("Ingestion completed successfully", {
              action: closeToastButton,
            });

            setTimeout(() => navigate("/workflow/landing-zone"), 800);
          } else if (["failed", "error"].includes(jobStatus)) {
            clearInterval(pollingInterval!);

            pollingInterval = null;

            const reason =
              statusData?.results?.[0]?.response?.message || "Unknown error";

            throw new Error(`Ingestion failed: ${reason}`);
          }

          // else → still in progress → continue polling
        } catch (pollErr) {
          console.error("Polling error:", pollErr);
        }
      }, 10000);
    } catch (err: any) {
      console.error("Ingestion error:", err);

      if (pollingInterval) clearInterval(pollingInterval);

      setIngestProgress(0);

      setIngestStatus("");

      setIsIngesting(false);

      toast.error(err.message || "Failed to complete ingestion process", {
        duration: 2000,
        action: closeToastButton,
      });
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
    };
  };

  const openFilePicker = (sourceId: string) => {
    if (sourceId === "local") {
      const input = document.createElement("input");

      input.type = "file";

      input.multiple = true;

      input.accept = ".csv,.xlsx,.json,.parquet";

      input.onchange = async (e) => {
        const files = (e.target as HTMLInputElement).files;

        if (!files || files.length === 0) return;

        const jobId = localStorage.getItem("current_job_id");

        if (!jobId) {
          toast.error("No job ID found. Please create a job first.", {
            duration: 1500,
            action: closeToastButton,
          });

          return;
        }

        // ── NEW: Databricks users upload straight into the landing volume ──
        if (isDatabricksUser()) {
          toast.loading("Uploading local files...", {
            id: "local-upload",
            duration: 1000,
          });

          try {
            const newItems: SelectedItem[] = [];

            for (const file of Array.from(files)) {
              const result = await ingestLocalFileToDatabricks(
                file,
                userId,
                jobId,
              );

              newItems.push({
                id: `local-db-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,

                name: result.file?.fileName || file.name,

                source: "Local File",

                size: `${((result.file?.sizeBytes ?? file.size) / (1024 * 1024)).toFixed(2)} MB`,

                rows: "N/A",

                icon: "file",

                sourceType: "local",

                fullPath: result.file?.filePath || file.name,
              });
            }

            setSelectedItems((prev) => [...prev, ...newItems]);

            const localFilesKey = `local_files_${jobId}`;

            const existingLocalFiles = JSON.parse(
              localStorage.getItem(localFilesKey) || "[]",
            );

            localStorage.setItem(
              localFilesKey,
              JSON.stringify([
                ...existingLocalFiles,
                ...newItems.map((i) => i.name),
              ]),
            );

            toast.success("Local files uploaded", {
              id: "local-upload",
              duration: 1000,
            });
          } catch (err: any) {
            console.error("Local upload error (Databricks route):", err);

            toast.error(err.message || "Failed to upload local files", {
              id: "local-upload",
              duration: 1000,
            });
          }

          return;
        }
        // ── existing (non-Databricks) flow below ────────────────────────

        const formData = new FormData();

        formData.append("user_id", userId);

        formData.append("job_id", jobId);

        Array.from(files).forEach((f) => formData.append("files", f));

        toast.loading("Uploading local files...", { id: "local-upload",duration:1000, });

        try {
          const uploadRes = await fetch(
            "https://api.veriton.ai/api/service1/ingest-now/upload-local",
            {
              method: "POST",

              body: formData,
            },
          );

          if (!uploadRes.ok) throw new Error("Upload failed");

          const { blobpath, blobAccountName, blobAccountKey } =
            await uploadRes.json();

          const newItems: SelectedItem[] = Array.from(files).map(
            (file, idx) => ({
              id: `local-${Date.now()}-${idx}`,

              name: file.name,

              source: "Local File",

              size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,

              rows: "N/A",

              icon: "file",

              sourceType: "local",

              fullPath: blobpath[idx],
            }),
          );

          setSelectedItems((prev) => [...prev, ...newItems]);

          const localFilesKey = `local_files_${jobId}`;

          const existingLocalFiles = JSON.parse(
            localStorage.getItem(localFilesKey) || "[]",
          );

          const updatedLocalFiles = [
            ...existingLocalFiles,
            ...newItems.map((i) => i.name),
          ];

          localStorage.setItem(
            localFilesKey,
            JSON.stringify(updatedLocalFiles),
          );

          saveSelectionToStorage(
            newItems.map((item) => ({
              name: item.name,
              fullPath: item.fullPath,
            })),

            { accountName: blobAccountName, accountKey: blobAccountKey },

            "azure",
            "local",
          );

          toast.success("Local files uploaded", { id: "local-upload" ,duration:1000, });
        } catch (err) {
          console.error("Local upload error:", err);

          toast.error("Failed to upload local files", { id: "local-upload",duration:1000, });
        }
      };

      input.click();
    } else if (sourceId === "databases") {
      setDatabaseDialogOpen(true);
    } else {
      const source = sources.find((s) => s.id === sourceId);

      if (source?.requiresCredentials) {
        setPendingSourceId(sourceId);

        setCredentialDialogOpen(true);
      } else {
        setCurrentSource(sourceId);

        setFilePickerOpen(true);
      }
    }
  };

  const handleCredentialProceed = (credentials: any) => {
    if (pendingSourceId === "s3")
      setS3Credentials(credentials as S3Credentials);
    else if (pendingSourceId === "azure")
      setAzureCredentials(credentials as AzureCredentials);
    else if (pendingSourceId === "onelake")
      setOneLakeCredentials(credentials as OneLakeCredentials);
    else if (pendingSourceId === "databricks")
      setDatabricksCredentials(credentials as DatabricksCredentials);
    else if (pendingSourceId === "snowflake")
      setSnowflakeCredentials(credentials as SnowflakeCredentials);
    else if (pendingSourceId === "sap")
      setSapCredentials(credentials as SapCredentials);

    setCurrentSource(pendingSourceId);

    setFilePickerOpen(true);
  };

  const handleDatabaseConnect = (config: {
    server: string;

    database: string;

    username: string;

    password: string;

    selectedTables: string[];
  }) => {
    const newItems: SelectedItem[] = config.selectedTables.map((table) => ({
      id: `db-${config.database}-${table}-${Date.now()}`,

      name: table.split(".").pop() || table,

      source: "SQL Server",

      size: "N/A",

      rows: "N/A",

      icon: "table",

      sourceType: "databases",

      fullPath: table,
    }));

    setSelectedItems((prev) => [...prev, ...newItems]);

    saveSelectionToStorage(
      config.selectedTables.map((table) => ({ name: table, fullPath: table })),

      {
        server: config.server,

        database: config.database,

        username: config.username,

        password: config.password,
      },

      "databases",
    );
  };

  // ── Progress bar step labels ──────────────────────────────────────────────

  const progressSteps = [
    { label: "Submitted", threshold: 10 },

    { label: "Transferring", threshold: 25 },

    { label: "Processing", threshold: 60 },

    { label: "Finalizing", threshold: 85 },

    { label: "Done", threshold: 100 },
  ];

  return (
    <WorkflowLayout>
      <div className="p-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Data Ingestion
            </h1>
            <p className="text-muted-foreground">
              Connect to your sources and select the files or tables you want to
              process.
            </p>
          </div>
        </div>

        {/* Select a Source */}
        <div className="mb-12">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Select a Source
          </h2>
          <div className="grid grid-cols-4 gap-4">
            {sources.map((source) => {
              const IconComponent = source.icon;

              return (
                <Card
                  key={source.id}
                  className="p-6 cursor-pointer transition-colors border border-border hover:bg-accent/30 group"
                  onClick={() => openFilePicker(source.id)}
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-12 h-12 rounded-lg bg-card-hover border border-border flex items-center justify-center group-hover:border-primary transition-colors">
                      <IconComponent className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {source.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {source.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Selected Items */}
        <div
          className="space-y-3 overflow-y-auto max-h-[400px] pr-2"
          ref={selectedItemsRef}
        >
          <h2 className="text-xl font-semibold text-foreground mb-6 sticky top-0 bg-background z-10 pb-4">
            Selected Items
          </h2>
          <div className="space-y-3">
            {selectedItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No items selected yet
              </p>
            ) : (
              selectedItems.map((item) => (
                <Card
                  key={item.id}
                  className="p-4 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {getItemIcon(item.icon)}
                      <div className="flex-1">
                        <p className="font-medium text-foreground">
                          {item.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {item.source}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* ── Action Button + Progress Bar ── */}
        <div className="flex flex-col gap-4 mt-6">
          {/* Progress UI — only visible while ingesting */}

          {isIngesting && (
            <div className="w-full rounded-xl border border-border bg-card/60 p-5 space-y-4">
              {/* Step indicators */}
              <div className="flex items-center justify-between">
                {progressSteps.map((step, i) => {
                  const reached = ingestProgress >= step.threshold;

                  const active =
                    ingestProgress >= step.threshold &&
                    (i === progressSteps.length - 1 ||
                      ingestProgress < progressSteps[i + 1].threshold);

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

                          active ? "ring-2 ring-primary/40 ring-offset-2" : "",
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

                          reached ? "text-primary" : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {step.label}
                      </span>

                      {/* Connector line between steps */}

                      {i < progressSteps.length - 1 && (
                        <div className="absolute" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bar */}
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700 ease-in-out"
                  style={{
                    width: `${ingestProgress}%`,

                    background:
                      ingestProgress === 100
                        ? "hsl(var(--primary))"
                        : "linear-gradient(90deg, hsl(var(--primary)/0.7), hsl(var(--primary)))",
                  }}
                />
              </div>

              {/* Status text + percentage */}
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  {ingestProgress < 100 ? (
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
                  <span>{ingestStatus}</span>
                </div>
                <span className="font-semibold text-primary tabular-nums">
                  {ingestProgress}%
                </span>
              </div>

              {ingestProgress < 100 && (
                <p className="text-xs text-muted-foreground">
                  Please wait — this may take a few minutes depending on file
                  size.
                </p>
              )}
            </div>
          )}

          {/* Button — right-aligned */}
          <div className="flex justify-end">
            <Button
              onClick={handleProceed}
              size="lg"
              className="px-10 flex items-center gap-2 min-w-[220px]"
              disabled={selectedItems.length === 0 || !userId || isIngesting}
            >
              {isIngesting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing Ingestion...
                </>
              ) : (
                "Ingest / Proceed"
              )}
            </Button>
          </div>
        </div>

        {/* Dialogs */}
        <SourceCredentialDialog
          open={credentialDialogOpen}
          onOpenChange={setCredentialDialogOpen}
          sourceName={sources.find((s) => s.id === pendingSourceId)?.name || ""}
          sourceId={pendingSourceId}
          onProceed={handleCredentialProceed}
        />
        <FilePickerDialog
          open={filePickerOpen}
          onOpenChange={setFilePickerOpen}
          sourceName={sources.find((s) => s.id === currentSource)?.name || ""}
          files={[]}
          onSelect={handleFileSelection}
          s3Credentials={s3Credentials}
          isS3={currentSource === "s3"}
          azureCredentials={azureCredentials}
          isAzure={currentSource === "azure"}
          oneLakeCredentials={oneLakeCredentials}
          isOneLake={currentSource === "onelake"}
          databricksCredentials={databricksCredentials}
          isDatabricks={currentSource === "databricks"}
          snowflakeCredentials={snowflakeCredentials}
          isSnowflake={currentSource === "snowflake"}
          sapCredentials={sapCredentials}
          isSap={currentSource === "sap"}
        />
        <SchemaPreviewDialog
          open={schemaPreviewOpen}
          onOpenChange={setSchemaPreviewOpen}
          fileName={previewFileName}
        />
        <DatabaseConnectionDialog
          open={databaseDialogOpen}
          onOpenChange={setDatabaseDialogOpen}
          onConnect={handleDatabaseConnect}
        />
      </div>
    </WorkflowLayout>
  );
}