// const API_BASE_URL = "https://api.veriton.ai/api/service1";
// const MODELING_API_BASE = "https://api.veriton.ai/api/service2";
 
// export const API_BASE = API_BASE_URL;
// export const MODELING_API = MODELING_API_BASE;
 
// const safeJsonParse = async (response: Response) => {
//   const text = await response.text();
//   if (!text.trim()) return {};
//   try {
//     return JSON.parse(text);
//   } catch {
//     return {};
//   }
// };
 
// const getAuthHeaders = () => {
//   const token = localStorage.getItem("access_token");
//   return token ? { Authorization: `Bearer ${token}` } : {};
// };
 
// // ---------------- AUTH ----------------
// export interface SignupData { name: string; email: string; password: string; }
// export interface LoginData { email: string; password: string; }
// export interface AuthResponse { message?: string; access_token?: string; token_type?: string; user?: any; }
 
// export const signup = async (data: SignupData): Promise<AuthResponse> => {
//   const res = await fetch(`${API_BASE}/signup`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", accept: "application/json" },
//     body: JSON.stringify(data),
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || result.message || "Signup failed");
//   return result;
// };
 
// export const login = async (data: LoginData): Promise<AuthResponse> => {
//   const res = await fetch(`${API_BASE}/login`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", accept: "application/json" },
//     body: JSON.stringify(data),
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || result.message || "Login failed");
//   if (result.access_token) localStorage.setItem("access_token", result.access_token);
//   return result;
// };
 
// export const logout = () => localStorage.removeItem("access_token");
 
 
// export interface S3Credentials {
//   aws_access_key_id: string;
//   aws_secret_access_key: string;
//   region: string;
//   bucket_name?: string;
//   prefix?: string;
// }
 
// export interface S3ObjectsResponse {
//   folders: string[];
//   files: string[];
// }
 
// export const getS3Buckets = async (credentials: S3Credentials): Promise<string[]> => {
//   const res = await fetch(`${API_BASE}/buckets`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//     body: JSON.stringify({
//       aws_access_key_id: credentials.aws_access_key_id,
//       aws_secret_access_key: credentials.aws_secret_access_key,
//       region: credentials.region,
//     }),
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || result.message || "Failed to fetch buckets");
//   return result;
// };
 
// export const getS3Objects = async (
//   bucketName: string,
//   credentials: S3Credentials & { prefix?: string }
// ): Promise<S3ObjectsResponse> => {
//   const body = {
//     aws_access_key_id: credentials.aws_access_key_id,
//     aws_secret_access_key: credentials.aws_secret_access_key,
//     region: credentials.region,
//     bucket_name: bucketName,
//     prefix: credentials.prefix || "",
//   };
 
//   const res = await fetch(`${API_BASE}/buckets/${encodeURIComponent(bucketName)}/objects`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//     body: JSON.stringify(body),
//   });
 
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || result.message || "Failed to fetch objects");
 
//   return {
//     folders: result.folders || [],
//     files: result.files || [],
//   };
// };
 
// export const getS3FilePath = async (
//   bucketName: string,
//   key: string,
//   credentials: S3Credentials
// ): Promise<string> => {
//   const res = await fetch(
//     `${API_BASE}/buckets/${encodeURIComponent(bucketName)}/file?key=${encodeURIComponent(key)}`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//       body: JSON.stringify({
//         aws_access_key_id: credentials.aws_access_key_id,
//         aws_secret_access_key: credentials.aws_secret_access_key,
//         region: credentials.region,
//       }),
//     }
//   );
 
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || result.message || "Failed to get file path");
 
//   return result.file_path;
// };  

 
 
// export interface AzureCredentials {
//   connection_string: string;
// }
 

// export interface AzureBlobsResponse {
//   folders: string[];   // unique immediate sub-folder names at current prefix level
//   files: string[];     // full blob paths that are direct children of current prefix
// }

// export const getAzureBlobs = async (
//   containerName: string,
//   credentials: AzureCredentials & { prefix?: string }
// ): Promise<AzureBlobsResponse> => {
//   // The virtual directory prefix passed in from the dialog.
//   // At root level this is "" (empty string).
//   // When drilling into "hello/", this is "hello/".
//   const virtualPrefix = credentials.prefix || "";
 
//   const res = await fetch(`${API_BASE}/containers/${encodeURIComponent(containerName)}/blobs`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//     body: JSON.stringify({
//       connection_string: credentials.connection_string,
//       container_name: containerName,
//       prefix: virtualPrefix,
//     }),
//   });
 
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch blobs");
 
//   // The API returns a flat string array of blob paths
//   const allPaths: string[] = Array.isArray(result) ? result : result.files || [];
 
//   // Normalise paths: strip leading "<containerName>/" if present,
//   // so we always work with paths relative to the container root.
//   const normalised = allPaths.map((p) => {
//     const withSlash = `${containerName}/`;
//     return p.startsWith(withSlash) ? p.slice(withSlash.length) : p;
//   }).filter((p) => p.length > 0);
 
//   // Filter to paths that live inside the current virtual directory
//   const inCurrentDir = normalised.filter((p) =>
//     virtualPrefix === "" ? true : p.startsWith(virtualPrefix)
//   );
 
//   // Strip the virtual prefix so we have paths relative to current dir
//   const relativePaths = inCurrentDir
//     .map((p) => (virtualPrefix ? p.slice(virtualPrefix.length) : p))
//     .filter((p) => p.length > 0);
 
//   const foldersSet = new Set<string>();
//   const files: string[] = [];
 
//   for (const rel of relativePaths) {
//     const slashIdx = rel.indexOf("/");
//     if (slashIdx !== -1) {
//       // Has deeper path → belongs to a virtual sub-folder
//       foldersSet.add(rel.slice(0, slashIdx));
//     } else {
//       // No slash → direct file at this level
//       // Store as full normalised path (relative to container root) for later use
//       files.push(virtualPrefix + rel);
//     }
//   }
 
//   return {
//     folders: Array.from(foldersSet),
//     files,
//   };
// };
 
// export const getAzureContainers = async (credentials: AzureCredentials): Promise<string[]> => {
//   const res = await fetch(`${API_BASE}/containers`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//     body: JSON.stringify({ connection_string: credentials.connection_string }),
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch containers");
//   return result;
// };
 
// /**
//  * Fetches the azure:// path for a specific blob.
//  * blob_name should be the full path within the container, e.g. "hello/nov26_all_sources/Book1_1.csv"
//  * (i.e. the full path MINUS the container name prefix)
//  */
// export const getAzureBlobFile = async (
//   containerName: string,
//   blobName: string,
//   credentials: AzureCredentials
// ): Promise<{ file_path: string; size: number }> => {
//   const res = await fetch(
//     `${API_BASE}/containers/${encodeURIComponent(containerName)}/file?blob_name=${encodeURIComponent(blobName)}`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//       body: JSON.stringify({ connection_string: credentials.connection_string }),
//     }
//   );
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch blob file");
//   return result;
// };
 

 
// export interface OneLakeCredentials {
//   tenant_id: string;
//   client_id: string;
//   client_secret: string;
// }
 
// export interface OneLakeFolderContents {
//   folders: string[];
//   files: Array<{ [key: string]: string }>;
//   current_path: string;
// }
 
// export const getOneLakeWorkspaces = async (credentials: OneLakeCredentials): Promise<string[]> => {
//   const res = await fetch(`${API_BASE}/workspaces`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//     body: JSON.stringify(credentials),
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch workspaces");
//   return result.workspaces ? result.workspaces.map((ws: any) => ws.name) : [];
// };
 
// export const getOneLakeLakehouses = async (
//   workspaceName: string,
//   credentials: OneLakeCredentials
// ): Promise<string[]> => {
//   const res = await fetch(`${API_BASE}/workspaces/lakehouses`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//     body: JSON.stringify({
//       ...credentials,
//       workspace_name: workspaceName,
//       lakehouse_name: "",
//       path: "Files"
//     }),
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch lakehouses");
//   return result.lakehouses ? result.lakehouses.map((lh: any) => lh.name) : [];
// };
 
// export const getOneLakeFolderContents = async (
//   workspaceName: string,
//   lakehouseName: string,
//   credentials: OneLakeCredentials & { path?: string }
// ): Promise<OneLakeFolderContents> => {
//   const res = await fetch(
//     `${API_BASE}/workspaces/${encodeURIComponent(workspaceName)}/lakehouses/${encodeURIComponent(lakehouseName)}/contents`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//       body: JSON.stringify({
//         ...credentials,
//         workspace_name: workspaceName,
//         lakehouse_name: lakehouseName,
//         path: credentials.path || "Files",
//       }),
//     }
//   );
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch folder contents");
//   return result;
// };
 
// export const navigateBack = async (
//   workspaceName: string,
//   lakehouseName: string,
//   currentPath: string,
//   credentials: OneLakeCredentials
// ): Promise<OneLakeFolderContents> => {
//   const res = await fetch(
//     `${API_BASE}/workspaces/${encodeURIComponent(workspaceName)}/lakehouses/${encodeURIComponent(lakehouseName)}/navigate-back?current_path=${encodeURIComponent(currentPath)}`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//       body: JSON.stringify(credentials),
//     }
//   );
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to navigate back");
//   return result;
// };
 
// export const getOneLakeTables = async (
//   workspaceName: string,
//   lakehouseName: string,
//   credentials: OneLakeCredentials
// ): Promise<{
//   success: boolean;
//   message: string;
//   tables: Array<{ [key: string]: string }>;
//   current_path: string;
// }> => {
//   const res = await fetch(
//     `${API_BASE}/workspaces/${encodeURIComponent(workspaceName)}/lakehouses/${encodeURIComponent(lakehouseName)}/tables`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//       body: JSON.stringify(credentials),
//     }
//   );
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch tables");
//   return result;
// };
 
 

// // ---------------- DATABASE ----------------
 
// export interface DatabaseCredentials {
//   server: string;
//   database: string;
//   username: string;
//   password: string;
// }
 
// export interface ListTablesResponse {
//   success?: boolean; 
//   tables?: string[];
//   message?: string;
// }
 
// export const listDatabaseTables = async (
//   credentials: DatabaseCredentials
// ): Promise<ListTablesResponse> => {
//   const res = await fetch(`${API_BASE}/list-tables-sql`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...getAuthHeaders(),
//     },
//     body: JSON.stringify(credentials),
//   });
 
//   const result = await safeJsonParse(res);
//   if (!res.ok) {
//     throw new Error(result.detail || "Failed to list tables");
//   }
 
//   return result;
// };
 
 
 
// // ---------------- DATABRICKS ----------------
// export interface DatabricksCredentials {
//   host: string;
//   warehouse_id: string;
//   access_token: string;
// }
 
// export const getDatabricksCatalogs = async (
//   credentials: DatabricksCredentials
// ): Promise<string[]> => {
//   const res = await fetch(`${API_BASE}/databricks/list-catalogs`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//     body: JSON.stringify(credentials),
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch catalogs");
//   return result.catalogs || [];
// };
 
// export const getDatabricksSchemas = async (
//   catalog: string,
//   credentials: DatabricksCredentials
// ): Promise<string[]> => {
//   const res = await fetch(`${API_BASE}/databricks/list-schemas?catalog=${encodeURIComponent(catalog)}`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//     body: JSON.stringify(credentials),
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch schemas");
//   return result.schemas || [];
// };
 
// export const getDatabricksTables = async (
//   catalog: string,
//   schema: string,
//   credentials: DatabricksCredentials
// ): Promise<string[]> => {
//   const res = await fetch(
//     `${API_BASE}/databricks/list-tables?catalog=${encodeURIComponent(catalog)}&schema=${encodeURIComponent(schema)}`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//       body: JSON.stringify(credentials),
//     }
//   );
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch tables");
//   return result.tables || [];
// };
 
// // ---------------- SNOWFLAKE ----------------
// export interface SnowflakeCredentials {
//   account_identifier: string;
//   username: string;
//   password: string;
//   warehouse: string;
// }
 
// export const getSnowflakeDatabases = async (
//   credentials: SnowflakeCredentials
// ): Promise<string[]> => {
//   const res = await fetch(`${API_BASE}/snowflake/list-databases`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//     body: JSON.stringify(credentials),
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch databases");
//   return result.databases || [];
// };
 
// export const getSnowflakeSchemas = async (
//   database: string,
//   credentials: SnowflakeCredentials
// ): Promise<string[]> => {
//   const res = await fetch(`${API_BASE}/snowflake/list-schemas?database=${encodeURIComponent(database)}`, {
//     method: "POST",
//     headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//     body: JSON.stringify(credentials),
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch schemas");
//   return result.schemas || [];
// };
 
// export const getSnowflakeTables = async (
//   database: string,
//   schema: string,
//   credentials: SnowflakeCredentials
// ): Promise<string[]> => {
//   const res = await fetch(
//     `${API_BASE}/snowflake/list-tables?database=${encodeURIComponent(database)}&schema=${encodeURIComponent(schema)}`,
//     {
//       method: "POST",
//       headers: { "Content-Type": "application/json", ...getAuthHeaders() },
//       body: JSON.stringify(credentials),
//     }
//   );
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch tables");
//   return result.tables || [];
// };
 
 
// // ---------------- DATA MODELING PROCESS (MODELING_API) ----------------
// // export interface ProcessJobRequest {
// //   user_id: string;
// //   job_id: string;
// // }
 
// // export interface ProcessJobResponse {
// //   status: string;
// //   message: string;
// //   stage: string;
// //   data?: any;
// // }
 
// // export const processJobForModeling = async (
// //   payload: ProcessJobRequest
// // ): Promise<ProcessJobResponse> => {
// //   const res = await fetch(`${MODELING_API}/api/process`, {
// //     method: "POST",
// //     headers: {
// //       "Content-Type": "application/json",
// //       ...getAuthHeaders()
// //     },
// //     body: JSON.stringify(payload),
// //   });
// //   const result = await safeJsonParse(res);
// //   if (!res.ok) throw new Error(result.detail || "Failed to process job");
// //   return result;
// // };
 
// // export const getProcessingStatus = async (
// //   userId: string,
// //   jobId: string
// // ): Promise<ProcessJobResponse> => {
// //   const res = await fetch(`${MODELING_API}/api/status/${userId}/${jobId}`, {
// //     method: "GET",
// //     headers: {
// //       "Accept": "application/json",
// //       ...getAuthHeaders()
// //     },
// //   });
// //   const result = await safeJsonParse(res);
// //   if (!res.ok) throw new Error(result.detail || "Failed to fetch status");
// //   return result;
// // };
 



// // ---------------- VIEW AND UPDATE SCHEMA (MODELING_API) ----------------
// // export interface ViewSchemaResponse {
// //   schema_file: string;
// //   table_name: string;
// //   table_type: string;
// //   row_count: number;
// //   column_count: number;
// //   columns: Array<{
// //     column_name: string;
// //     data_type: string;
// //     example: string;
// //     key: string;
// //     nullable: boolean;
// //     is_potential_key: boolean;
// //   }>;
// // }
 
// // export interface UpdateSchemaRequest {
// //   columns: Array<{
// //     column_name: string;
// //     data_type: string;
// //   }>;
// // }
 
// // ---------------- DATA MODELING PROCESS (MODELING_API) ----------------
// export interface ProcessJobRequest {
//   user_id: string;
//   job_id: string;
// }
 
// export interface ProcessJobResponse {
//   status: string;
//   message: string;
//   stage: string;
//   data?: any;
// }
 
// const TERMINAL_SUCCESS = "completed";
// const TERMINAL_FAILURE = "failed";
// const POLL_INTERVAL_MS = 5000;
// const MAX_WAIT_MS = 3 * 60 * 1000; // 3 minutes, covers the AI step you saw take ~3 min
 
// export interface PollJobResult {
//   success: boolean;
//   stage: string;
//   message: string;
//   data?: any;
// }
// export async function pollJobStatus(userId: string, jobId: string): Promise<ProcessJobResponse> {
//   const start = Date.now();
 
//   while (Date.now() - start < MAX_WAIT_MS) {
//     const body = await getProcessingStatus(userId, jobId);
 
//     if (body.stage === TERMINAL_SUCCESS || body.stage === TERMINAL_FAILURE) {
//       return body;
//     }
 
//     await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
//   }
 
//   return { status: "failed", message: "Timed out waiting for job to complete", stage: "timeout" };
// }
 
 
 
// export const processJobForModeling = async (
//   payload: ProcessJobRequest
// ): Promise<ProcessJobResponse> => {
//   const res = await fetch(`${MODELING_API}/api/process`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       ...getAuthHeaders()
//     },
//     body: JSON.stringify(payload),
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to process job");
//   return result;
// };
 
// export const getProcessingStatus = async (
//   userId: string,
//   jobId: string
// ): Promise<ProcessJobResponse> => {
//   const res = await fetch(`${MODELING_API}/api/status/${userId}/${jobId}`, {
//     method: "GET",
//     headers: {
//       "Accept": "application/json",
//       ...getAuthHeaders()
//     },
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch status");
//   return result;
// };
 
// // ---------------- VIEW AND UPDATE SCHEMA (MODELING_API) ----------------
// export interface ViewSchemaResponse {
//   schema_file: string;
//   table_name: string;
//   table_type: string;
//   row_count: number;
//   column_count: number;
//   columns: Array<{
//     column_name: string;
//     data_type: string;
//     example: string;
//     key: string;
//     nullable: boolean;
//     is_potential_key: boolean;
//   }>;
// }
 
// export interface UpdateSchemaRequest {
//   columns: Array<{
//     column_name: string;
//     data_type: string;
//   }>;
// }
 

// export const viewTableSchema = async (
//   userId: string,
//   jobId: string,
//   tableName: string
// ): Promise<ViewSchemaResponse> => {
//   const res = await fetch(
//     `${MODELING_API}/api/debug/view-schema/${userId}/${jobId}/${tableName}`,
//     {
//       method: "GET",
//       headers: {
//         "Accept": "application/json",
//         ...getAuthHeaders()
//       },
//     }
//   );
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch schema");
//   return result;
// };
 
// export const updateTableSchema = async (
//   userId: string,
//   jobId: string,
//   tableName: string,
//   payload: UpdateSchemaRequest
// ): Promise<ProcessJobResponse> => {
//   const res = await fetch(
//     `${MODELING_API}/api/schema/${userId}/${jobId}/${tableName}`,
//     {
//       method: "PUT",
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//         ...getAuthHeaders()
//       },
//       body: JSON.stringify(payload),
//     }
//   );
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to update schema");
//   return result;
// };
//  // ---------------- AGENT/THREAD APIs (MODELING_API) ----------------
// export interface CreateThreadResponse {
//   thread_id: string;
// }

// export interface AttachFileRequest {
//   blob_path: string;
// }

// export const createThread = async (): Promise<CreateThreadResponse> => {
//   const res = await fetch(`${MODELING_API}/create_thread`, {
//     method: "POST",
//     headers: {
//       "Accept": "application/json",
//       ...getAuthHeaders()
//     },
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to create thread");
//   return result;
// };

// export const attachFileToAgent = async (
//   blobPath: string
// ): Promise<string> => {
//   const res = await fetch(`${MODELING_API}/attach_file_to_agent`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Accept": "application/json",
//       ...getAuthHeaders()
//     },
//     body: JSON.stringify({ blob_path: blobPath }),
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to attach file to agent");
//   return result;
// };

// // ---------------- SEND MESSAGE (MODELING_API) ----------------
// export interface SendMessageRequest {
//   thread_id: string;
//   question: string;
// }

// export interface SendMessageResponse {
//   responses: Array<{
//     type: string;
//     content: string;
//   }>;
// }

// export const sendMessage = async (
//   payload: SendMessageRequest
// ): Promise<SendMessageResponse> => {
//   const res = await fetch(`${MODELING_API}/send_message`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Accept": "application/json",
//       ...getAuthHeaders()
//     },
//     body: JSON.stringify(payload),
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to send message");
//   return result;
// };
// // ---------------- DOWNLOAD CHAT (MODELING_API) ----------------
// export interface DownloadChatRequest {
//   thread_id: string;
// }

// export const downloadChat = async (threadId: string): Promise<Blob> => {
//   const res = await fetch(`${MODELING_API}/download_chat`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Accept": "application/json",
//       ...getAuthHeaders()
//     },
//     body: JSON.stringify({ thread_id: threadId }),
//   });
  
//   if (!res.ok) {
//     const error = await safeJsonParse(res);
//     throw new Error(error.detail || "Failed to download chat");
//   }
  
//   // Return the blob directly for file download
//   return await res.blob();
// };

// // ---------------- DELETE THREAD (MODELING_API) ----------------
// export interface DeleteThreadRequest {
//   thread_id: string;
// }

// export interface DeleteThreadResponse {
//   status: string;
//   message: string;
//   thread_id: string;
// }

// export const deleteThread = async (threadId: string): Promise<DeleteThreadResponse> => {
//   const res = await fetch(`${MODELING_API}/delete_thread`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "Accept": "application/json",
//       ...getAuthHeaders()
//     },
//     body: JSON.stringify({ thread_id: threadId }),
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to delete thread");
//   return result;
// };

// // ---------------- DELETE ALL FILES FROM AGENT (MODELING_API) ----------------
// export interface DeleteAllFilesResponse {
//   status: string;
//   message: string;
//   agent_id: string;
//   files_deleted: number;
//   remaining_files: number;
// }

// export const deleteAllFilesFromAgent = async (): Promise<DeleteAllFilesResponse> => {
//   const res = await fetch(`${MODELING_API}/delete_all_files_from_agent`, {
//     method: "POST",
//     headers: {
//       "Accept": "application/json",
//       ...getAuthHeaders()
//     },
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to delete files from agent");
//   return result;
// };
// // ---------------- FINALIZE DASHBOARD JSON (MODELING_API) ----------------
// export interface FinalizeDashboardRequest {
//   thread_id: string;
// }

// export interface FinalizeDashboardResponse {
//   // The response structure depends on what JSON the API returns
//   // Adjust this based on the actual successful response
//   [key: string]: any;
// }

// export async function finalizeDashboardJson(threadId: string): Promise<any> {
//   const response = await fetch(`${MODELING_API}/finalize-dashboard-json`, {
//     method: 'POST',
//     headers: {
//       'Accept': 'application/json',
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({ thread_id: threadId })
//   });

//   if (!response.ok) {
//     throw new Error(`Failed to finalize dashboard: ${response.statusText}`);
//   }

//   return response.json();
// }

// // ---------------- MODELING DATA ----------------

// export const getModelingData = async (
//   userId: string,
//   jobId: string
// ): Promise<any> => {
//   const res = await fetch(`${MODELING_API}/api/status/${userId}/${jobId}`, {
//     method: "GET",
//     headers: { "Accept": "application/json", ...getAuthHeaders() }
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch modeling data");
//   // /api/status returns { status, data } — we want the data object
//   return result.data ?? result;
// };

// // ---------------- ENTITIES ----------------

// export const getEntities = async (
//   userId: string,
//   jobId: string
// ): Promise<any> => {
//   const res = await fetch(`${MODELING_API}/api/entities/${userId}/${jobId}`, {
//     method: "GET",
//     headers: { "Accept": "application/json", ...getAuthHeaders() }
//   });
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to fetch entities");
//   return result;
// };

// export interface EntityPatchPayload {
//   primary_keys?: string[];
//   columns?: Array<{
//     name: string;
//     is_primary_key?: boolean;
//     is_foreign_key?: boolean;
//     data_type?: string;
//     references?: string;
//   }>;
// }

// export const patchEntity = async (
//   userId: string,
//   jobId: string,
//   entityName: string,
//   payload: EntityPatchPayload
// ): Promise<any> => {
//   const res = await fetch(
//     `${MODELING_API}/api/entities/${userId}/${jobId}/${encodeURIComponent(entityName)}`,
//     {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//         ...getAuthHeaders()
//       },
//       body: JSON.stringify(payload)
//     }
//   );
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to update entity");
//   return result;
// };

// // ---------------- RELATIONSHIPS ----------------

// export interface RelationshipPayload {
//   from_table: string;
//   from_column: string;
//   to_table: string;
//   to_column: string;
//   relationship_type: string;
//   description?: string;
// }

// export const addRelationship = async (
//   userId: string,
//   jobId: string,
//   payload: RelationshipPayload
// ): Promise<any> => {
//   const res = await fetch(
//     `${MODELING_API}/api/relationships/${userId}/${jobId}`,
//     {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//         ...getAuthHeaders()
//       },
//       body: JSON.stringify(payload)
//     }
//   );
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to add relationship");
//   return result;
// };

// export const deleteRelationship = async (
//   userId: string,
//   jobId: string,
//   relationshipId: string
// ): Promise<any> => {
//   const res = await fetch(
//     `${MODELING_API}/api/relationships/${userId}/${jobId}`,
//     {
//       method: "DELETE",
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//         ...getAuthHeaders()
//       },
//       body: JSON.stringify({ relationship_id: relationshipId })
//     }
//   );
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || "Failed to delete relationship");
//   return result;
// };

// // ---------------- MATERIALIZE ----------------

// export interface MaterializeResponse {
//   message: string;
//   job_instance_id: string;
//   user_id: string;
//   job_id: string;
//   status_url: string;
// }

// export interface MaterializeStatusResponse {
//   job_instance_id: string;
//   fabric_status: string;
//   materialized_tables: string[];
//   failed_tables: string[];
//   table_prefix: string;
//   ready_for_preview: boolean;
//   start_time: string | null;
//   end_time: string | null;
//   error: any | null;
// }

// // export const submitMaterializeJob = async (
// //   userId: string,
// //   jobId: string,
// //   containerName: string = "userdata"
// // ): Promise<MaterializeResponse> => {
// //   const res = await fetch(
// //     `${MODELING_API}/api/materialize?user_id=${encodeURIComponent(userId)}&job_id=${encodeURIComponent(jobId)}&container_name=${encodeURIComponent(containerName)}`,
// //     {
// //       method: "POST",
// //       headers: { "Accept": "application/json", ...getAuthHeaders() }
// //     }
// //   );
// //   const result = await safeJsonParse(res);
// //   if (!res.ok) throw new Error(result.detail || result.message || "Failed to submit materialize job");
// //   return result;
// // };

// export const submitMaterializeJob = async (
//   userId: string,
//   jobId: string,
//   containerName: string = "userdata"
// ): Promise<MaterializeResponse> => {
//   const res = await fetch(
//     `${MODELING_API}/api/materialize?user_id=${encodeURIComponent(userId)}&job_id=${encodeURIComponent(jobId)}&container_name=${encodeURIComponent(containerName)}`,
//     {
//       method: "POST",
//       headers: { "Accept": "application/json", ...getAuthHeaders() }
//     }
//   );
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || result.message || "Failed to submit materialize job");
//   return result;
// };
 

// export const getMaterializeStatus = async (
//   jobInstanceId: string,
//   userId: string,
//   jobId: string
// ): Promise<MaterializeStatusResponse> => {
//   const res = await fetch(
//     `${MODELING_API}/api/materialize/status?job_instance_id=${encodeURIComponent(jobInstanceId)}&user_id=${encodeURIComponent(userId)}&job_id=${encodeURIComponent(jobId)}`,
//     {
//       method: "GET",
//       headers: { "Accept": "application/json", ...getAuthHeaders() }
//     }
//   );
//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || result.message || "Failed to fetch materialize status");
//   return result;
// };



// // ---------------- SAP HANA ----------------
// export interface SapCredentials {
//   host: string;
//   port: number | string;
//   username: string;
//   password: string;
//   schema?: string; // only set once a schema has been picked in the file browser
// }

// export interface SapSchemaItem {
//   schemaName: string;
//   schemaOwner: string;
// }

// export interface SapTableItem {
//   tableName: string;
//   tableType: string;
// }

// // SAP + local-file-ingest live on the Databricks-side service
// const SERVICE_DATABRICKS_BASE = "https://api.veriton.ai/api/service-databricks";

// export const getSapSchemas = async (
//   credentials: SapCredentials
// ): Promise<string[]> => {
//   const res = await fetch(`${SERVICE_DATABRICKS_BASE}/saphana/list-schemas`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       accept: "application/json",
//       ...getAuthHeaders(),
//     },
//     body: JSON.stringify({
//       sourceType: "saphana",
//       host: credentials.host,
//       port: Number(credentials.port) || 443,
//       username: credentials.username,
//       password: credentials.password,
//       // list-schemas still expects a "schema" key in the body per the API
//       // contract — empty string when the user hasn't picked one yet.
//       schema: credentials.schema || "",
//     }),
//   });

//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || result.message || "Failed to fetch SAP schemas");

//   const schemas: SapSchemaItem[] = result.schemas || [];
//   return schemas.map((s) => s.schemaName);
// };

// export const getSapTables = async (
//   schema: string,
//   credentials: SapCredentials
// ): Promise<string[]> => {
//   const res = await fetch(`${SERVICE_DATABRICKS_BASE}/saphana/list-tables`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       accept: "application/json",
//       ...getAuthHeaders(),
//     },
//     body: JSON.stringify({
//       sourceType: "saphana",
//       host: credentials.host,
//       port: Number(credentials.port) || 443,
//       username: credentials.username,
//       password: credentials.password,
//       schema,
//     }),
//   });

//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || result.message || "Failed to fetch SAP tables");

//   const tables: SapTableItem[] = result.tables || [];
//   return tables.map((t) => t.tableName);
// };

// // ---------------- LOCAL FILE INGEST (Databricks landing volume) ----------------
// export interface IngestLocalFileResponse {
//   status: string;
//   message: string;
//   file: {
//     fileName: string;
//     filePath: string;
//     sizeBytes: number;
//     contentType: string;
//     extension: string;
//   };
// }

// /**
//  * Uploads a single local file straight into the Databricks landing-zone
//  * volume (/Volumes/veriton-db/landing/raw_files/{userId}/{jobId}/...).
//  * Unlike the service1 upload-local flow, this file is already in its final
//  * ingest location once this call succeeds — no further "source" entry is
//  * needed for it when triggering the Databricks ingest job.
//  */
// export const ingestLocalFileToDatabricks = async (
//   file: File,
//   userId: string,
//   jobId: string
// ): Promise<IngestLocalFileResponse> => {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("userId", userId);
//   formData.append("jobId", jobId);

//   const res = await fetch(`${SERVICE_DATABRICKS_BASE}/ingest-local-file`, {
//     method: "POST",
//     headers: { accept: "application/json" },
//     body: formData,
//   });

//   const result = await safeJsonParse(res);
//   if (!res.ok) throw new Error(result.detail || result.message || "Failed to ingest local file");
//   return result;
// };



const API_BASE_URL = "https://api.veriton.ai/api/service1";
const MODELING_API_BASE = "https://api.veriton.ai/api/service2";

// Base URL for the Databricks-specific agent/thread endpoints.
const DATABRICKS_MODELING_API_BASE = "https://api.veriton.ai/api/service-databricks";

export const API_BASE = API_BASE_URL;
export const MODELING_API = MODELING_API_BASE;
export const DATABRICKS_MODELING_API = DATABRICKS_MODELING_API_BASE;

const safeJsonParse = async (response: Response) => {
  const text = await response.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
};

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// ---------------- PLATFORM DETECTION ----------------
// Shared helper: checks localStorage "user" object for dataplatform === "Databricks".
// Exported so components (e.g. AnalysisPanel) can reuse the same check instead of
// duplicating this logic.
export function isDatabricksUser(): boolean {
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

// ---------------- AUTH ----------------
export interface SignupData { name: string; email: string; password: string; }
export interface LoginData { email: string; password: string; }
export interface AuthResponse { message?: string; access_token?: string; token_type?: string; user?: any; }

export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE}/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify(data),
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || result.message || "Signup failed");
  return result;
};

export const login = async (data: LoginData): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify(data),
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || result.message || "Login failed");
  if (result.access_token) localStorage.setItem("access_token", result.access_token);
  return result;
};

export const logout = () => localStorage.removeItem("access_token");


export interface S3Credentials {
  aws_access_key_id: string;
  aws_secret_access_key: string;
  region: string;
  bucket_name?: string;
  prefix?: string;
}

export interface S3ObjectsResponse {
  folders: string[];
  files: string[];
}

export const getS3Buckets = async (credentials: S3Credentials): Promise<string[]> => {
  const res = await fetch(`${API_BASE}/buckets`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({
      aws_access_key_id: credentials.aws_access_key_id,
      aws_secret_access_key: credentials.aws_secret_access_key,
      region: credentials.region,
    }),
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || result.message || "Failed to fetch buckets");
  return result;
};

export const getS3Objects = async (
  bucketName: string,
  credentials: S3Credentials & { prefix?: string }
): Promise<S3ObjectsResponse> => {
  const body = {
    aws_access_key_id: credentials.aws_access_key_id,
    aws_secret_access_key: credentials.aws_secret_access_key,
    region: credentials.region,
    bucket_name: bucketName,
    prefix: credentials.prefix || "",
  };

  const res = await fetch(`${API_BASE}/buckets/${encodeURIComponent(bucketName)}/objects`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(body),
  });

  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || result.message || "Failed to fetch objects");

  return {
    folders: result.folders || [],
    files: result.files || [],
  };
};

export const getS3FilePath = async (
  bucketName: string,
  key: string,
  credentials: S3Credentials
): Promise<string> => {
  const res = await fetch(
    `${API_BASE}/buckets/${encodeURIComponent(bucketName)}/file?key=${encodeURIComponent(key)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({
        aws_access_key_id: credentials.aws_access_key_id,
        aws_secret_access_key: credentials.aws_secret_access_key,
        region: credentials.region,
      }),
    }
  );

  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || result.message || "Failed to get file path");

  return result.file_path;
};



export interface AzureCredentials {
  connection_string: string;
}


export interface AzureBlobsResponse {
  folders: string[];   // unique immediate sub-folder names at current prefix level
  files: string[];     // full blob paths that are direct children of current prefix
}

export const getAzureBlobs = async (
  containerName: string,
  credentials: AzureCredentials & { prefix?: string }
): Promise<AzureBlobsResponse> => {
  // The virtual directory prefix passed in from the dialog.
  // At root level this is "" (empty string).
  // When drilling into "hello/", this is "hello/".
  const virtualPrefix = credentials.prefix || "";

  const res = await fetch(`${API_BASE}/containers/${encodeURIComponent(containerName)}/blobs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({
      connection_string: credentials.connection_string,
      container_name: containerName,
      prefix: virtualPrefix,
    }),
  });

  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch blobs");

  // The API returns a flat string array of blob paths
  const allPaths: string[] = Array.isArray(result) ? result : result.files || [];

  // Normalise paths: strip leading "<containerName>/" if present,
  // so we always work with paths relative to the container root.
  const normalised = allPaths.map((p) => {
    const withSlash = `${containerName}/`;
    return p.startsWith(withSlash) ? p.slice(withSlash.length) : p;
  }).filter((p) => p.length > 0);

  // Filter to paths that live inside the current virtual directory
  const inCurrentDir = normalised.filter((p) =>
    virtualPrefix === "" ? true : p.startsWith(virtualPrefix)
  );

  // Strip the virtual prefix so we have paths relative to current dir
  const relativePaths = inCurrentDir
    .map((p) => (virtualPrefix ? p.slice(virtualPrefix.length) : p))
    .filter((p) => p.length > 0);

  const foldersSet = new Set<string>();
  const files: string[] = [];

  for (const rel of relativePaths) {
    const slashIdx = rel.indexOf("/");
    if (slashIdx !== -1) {
      // Has deeper path → belongs to a virtual sub-folder
      foldersSet.add(rel.slice(0, slashIdx));
    } else {
      // No slash → direct file at this level
      // Store as full normalised path (relative to container root) for later use
      files.push(virtualPrefix + rel);
    }
  }

  return {
    folders: Array.from(foldersSet),
    files,
  };
};

export const getAzureContainers = async (credentials: AzureCredentials): Promise<string[]> => {
  const res = await fetch(`${API_BASE}/containers`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({ connection_string: credentials.connection_string }),
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch containers");
  return result;
};

/**
 * Fetches the azure:// path for a specific blob.
 * blob_name should be the full path within the container, e.g. "hello/nov26_all_sources/Book1_1.csv"
 * (i.e. the full path MINUS the container name prefix)
 */
export const getAzureBlobFile = async (
  containerName: string,
  blobName: string,
  credentials: AzureCredentials
): Promise<{ file_path: string; size: number }> => {
  const res = await fetch(
    `${API_BASE}/containers/${encodeURIComponent(containerName)}/file?blob_name=${encodeURIComponent(blobName)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({ connection_string: credentials.connection_string }),
    }
  );
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch blob file");
  return result;
};



export interface OneLakeCredentials {
  tenant_id: string;
  client_id: string;
  client_secret: string;
}

export interface OneLakeFolderContents {
  folders: string[];
  files: Array<{ [key: string]: string }>;
  current_path: string;
}

export const getOneLakeWorkspaces = async (credentials: OneLakeCredentials): Promise<string[]> => {
  const res = await fetch(`${API_BASE}/workspaces`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(credentials),
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch workspaces");
  return result.workspaces ? result.workspaces.map((ws: any) => ws.name) : [];
};

export const getOneLakeLakehouses = async (
  workspaceName: string,
  credentials: OneLakeCredentials
): Promise<string[]> => {
  const res = await fetch(`${API_BASE}/workspaces/lakehouses`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify({
      ...credentials,
      workspace_name: workspaceName,
      lakehouse_name: "",
      path: "Files"
    }),
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch lakehouses");
  return result.lakehouses ? result.lakehouses.map((lh: any) => lh.name) : [];
};

export const getOneLakeFolderContents = async (
  workspaceName: string,
  lakehouseName: string,
  credentials: OneLakeCredentials & { path?: string }
): Promise<OneLakeFolderContents> => {
  const res = await fetch(
    `${API_BASE}/workspaces/${encodeURIComponent(workspaceName)}/lakehouses/${encodeURIComponent(lakehouseName)}/contents`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify({
        ...credentials,
        workspace_name: workspaceName,
        lakehouse_name: lakehouseName,
        path: credentials.path || "Files",
      }),
    }
  );
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch folder contents");
  return result;
};

export const navigateBack = async (
  workspaceName: string,
  lakehouseName: string,
  currentPath: string,
  credentials: OneLakeCredentials
): Promise<OneLakeFolderContents> => {
  const res = await fetch(
    `${API_BASE}/workspaces/${encodeURIComponent(workspaceName)}/lakehouses/${encodeURIComponent(lakehouseName)}/navigate-back?current_path=${encodeURIComponent(currentPath)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(credentials),
    }
  );
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to navigate back");
  return result;
};

export const getOneLakeTables = async (
  workspaceName: string,
  lakehouseName: string,
  credentials: OneLakeCredentials
): Promise<{
  success: boolean;
  message: string;
  tables: Array<{ [key: string]: string }>;
  current_path: string;
}> => {
  const res = await fetch(
    `${API_BASE}/workspaces/${encodeURIComponent(workspaceName)}/lakehouses/${encodeURIComponent(lakehouseName)}/tables`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(credentials),
    }
  );
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch tables");
  return result;
};



// ---------------- DATABASE ----------------

export interface DatabaseCredentials {
  server: string;
  database: string;
  username: string;
  password: string;
}

export interface ListTablesResponse {
  success?: boolean;
  tables?: string[];
  message?: string;
}

export const listDatabaseTables = async (
  credentials: DatabaseCredentials
): Promise<ListTablesResponse> => {
  const res = await fetch(`${API_BASE}/list-tables-sql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(credentials),
  });

  const result = await safeJsonParse(res);
  if (!res.ok) {
    throw new Error(result.detail || "Failed to list tables");
  }

  return result;
};



// ---------------- DATABRICKS ----------------
export interface DatabricksCredentials {
  host: string;
  warehouse_id: string;
  access_token: string;
}

export const getDatabricksCatalogs = async (
  credentials: DatabricksCredentials
): Promise<string[]> => {
  const res = await fetch(`${API_BASE}/databricks/list-catalogs`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(credentials),
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch catalogs");
  return result.catalogs || [];
};

export const getDatabricksSchemas = async (
  catalog: string,
  credentials: DatabricksCredentials
): Promise<string[]> => {
  const res = await fetch(`${API_BASE}/databricks/list-schemas?catalog=${encodeURIComponent(catalog)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(credentials),
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch schemas");
  return result.schemas || [];
};

export const getDatabricksTables = async (
  catalog: string,
  schema: string,
  credentials: DatabricksCredentials
): Promise<string[]> => {
  const res = await fetch(
    `${API_BASE}/databricks/list-tables?catalog=${encodeURIComponent(catalog)}&schema=${encodeURIComponent(schema)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(credentials),
    }
  );
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch tables");
  return result.tables || [];
};

// ---------------- SNOWFLAKE ----------------
export interface SnowflakeCredentials {
  account_identifier: string;
  username: string;
  password: string;
  warehouse: string;
}

export const getSnowflakeDatabases = async (
  credentials: SnowflakeCredentials
): Promise<string[]> => {
  const res = await fetch(`${API_BASE}/snowflake/list-databases`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(credentials),
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch databases");
  return result.databases || [];
};

export const getSnowflakeSchemas = async (
  database: string,
  credentials: SnowflakeCredentials
): Promise<string[]> => {
  const res = await fetch(`${API_BASE}/snowflake/list-schemas?database=${encodeURIComponent(database)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...getAuthHeaders() },
    body: JSON.stringify(credentials),
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch schemas");
  return result.schemas || [];
};

export const getSnowflakeTables = async (
  database: string,
  schema: string,
  credentials: SnowflakeCredentials
): Promise<string[]> => {
  const res = await fetch(
    `${API_BASE}/snowflake/list-tables?database=${encodeURIComponent(database)}&schema=${encodeURIComponent(schema)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      body: JSON.stringify(credentials),
    }
  );
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch tables");
  return result.tables || [];
};


// ---------------- DATA MODELING PROCESS (MODELING_API) ----------------
export interface ProcessJobRequest {
  user_id: string;
  job_id: string;
}

export interface ProcessJobResponse {
  status: string;
  message: string;
  stage: string;
  data?: any;
}

const TERMINAL_SUCCESS = "completed";
const TERMINAL_FAILURE = "failed";
const POLL_INTERVAL_MS = 5000;
const MAX_WAIT_MS = 3 * 60 * 1000; // 3 minutes, covers the AI step you saw take ~3 min

export interface PollJobResult {
  success: boolean;
  stage: string;
  message: string;
  data?: any;
}
export async function pollJobStatus(userId: string, jobId: string): Promise<ProcessJobResponse> {
  const start = Date.now();

  while (Date.now() - start < MAX_WAIT_MS) {
    const body = await getProcessingStatus(userId, jobId);

    if (body.stage === TERMINAL_SUCCESS || body.stage === TERMINAL_FAILURE) {
      return body;
    }

    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }

  return { status: "failed", message: "Timed out waiting for job to complete", stage: "timeout" };
}



export const processJobForModeling = async (
  payload: ProcessJobRequest
): Promise<ProcessJobResponse> => {
  const res = await fetch(`${MODELING_API}/api/process`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload),
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to process job");
  return result;
};

export const getProcessingStatus = async (
  userId: string,
  jobId: string
): Promise<ProcessJobResponse> => {
  const res = await fetch(`${MODELING_API}/api/status/${userId}/${jobId}`, {
    method: "GET",
    headers: {
      "Accept": "application/json",
      ...getAuthHeaders()
    },
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch status");
  return result;
};

// ---------------- VIEW AND UPDATE SCHEMA (MODELING_API) ----------------
export interface ViewSchemaResponse {
  schema_file: string;
  table_name: string;
  table_type: string;
  row_count: number;
  column_count: number;
  columns: Array<{
    column_name: string;
    data_type: string;
    example: string;
    key: string;
    nullable: boolean;
    is_potential_key: boolean;
  }>;
}

export interface UpdateSchemaRequest {
  columns: Array<{
    column_name: string;
    data_type: string;
  }>;
}


export const viewTableSchema = async (
  userId: string,
  jobId: string,
  tableName: string
): Promise<ViewSchemaResponse> => {
  const res = await fetch(
    `${MODELING_API}/api/debug/view-schema/${userId}/${jobId}/${tableName}`,
    {
      method: "GET",
      headers: {
        "Accept": "application/json",
        ...getAuthHeaders()
      },
    }
  );
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch schema");
  return result;
};

export const updateTableSchema = async (
  userId: string,
  jobId: string,
  tableName: string,
  payload: UpdateSchemaRequest
): Promise<ProcessJobResponse> => {
  const res = await fetch(
    `${MODELING_API}/api/schema/${userId}/${jobId}/${tableName}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload),
    }
  );
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to update schema");
  return result;
};

// ---------------- AGENT/THREAD APIs (MODELING_API / DATABRICKS_MODELING_API) ----------------
// NOTE: All six functions below (create/attach/send/download/finalize/delete)
// check isDatabricksUser() and route to the Databricks-specific base URL
// (service-databricks) when true, otherwise they keep hitting the original
// MODELING_API (service2) base URL — unchanged behavior for non-Databricks
// users.

export interface CreateThreadResponse {
  thread_id: string;
}

export interface AttachFileRequest {
  blob_path: string;
}

export const createThread = async (): Promise<CreateThreadResponse> => {
  const useDatabricks = isDatabricksUser();
  const url = useDatabricks
    ? `${DATABRICKS_MODELING_API}/create_thread`
    : `${MODELING_API}/create_thread`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      ...getAuthHeaders()
    },
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to create thread");
  return result;
};

export const attachFileToAgent = async (
  blobPath: string
): Promise<string> => {
  const useDatabricks = isDatabricksUser();
  const url = useDatabricks
    ? `${DATABRICKS_MODELING_API}/attach_file_to_agent`
    : `${MODELING_API}/attach_file_to_agent`;

  // The Databricks endpoint expects a "dataset_path" key (per its Swagger
  // spec), while the default (service2) flow expects "blob_path". Both
  // receive the same underlying path string from the caller.
  const body = useDatabricks
    ? { dataset_path: blobPath }
    : { blob_path: blobPath };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(body),
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to attach file to agent");
  return result;
};

// ---------------- SEND MESSAGE (MODELING_API / DATABRICKS_MODELING_API) ----------------
export interface SendMessageRequest {
  thread_id: string;
  question: string;
}

export interface SendMessageResponse {
  responses: Array<{
    type: string;
    content: string;
  }>;
}

export const sendMessage = async (
  payload: SendMessageRequest
): Promise<SendMessageResponse> => {
  const useDatabricks = isDatabricksUser();
  const url = useDatabricks
    ? `${DATABRICKS_MODELING_API}/send_message`
    : `${MODELING_API}/send_message`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify(payload),
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to send message");
  return result;
};
// ---------------- DOWNLOAD CHAT (MODELING_API / DATABRICKS_MODELING_API) ----------------
export interface DownloadChatRequest {
  thread_id: string;
}

export const downloadChat = async (threadId: string): Promise<Blob> => {
  const useDatabricks = isDatabricksUser();
  const url = useDatabricks
    ? `${DATABRICKS_MODELING_API}/download_chat`
    : `${MODELING_API}/download_chat`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({ thread_id: threadId }),
  });

  if (!res.ok) {
    const error = await safeJsonParse(res);
    throw new Error(error.detail || "Failed to download chat");
  }

  // Return the blob directly for file download
  return await res.blob();
};

// ---------------- DELETE THREAD (MODELING_API / DATABRICKS_MODELING_API) ----------------
export interface DeleteThreadRequest {
  thread_id: string;
}

export interface DeleteThreadResponse {
  status: string;
  message: string;
  thread_id: string;
}

export const deleteThread = async (threadId: string): Promise<DeleteThreadResponse> => {
  const useDatabricks = isDatabricksUser();
  const url = useDatabricks
    ? `${DATABRICKS_MODELING_API}/delete_thread`
    : `${MODELING_API}/delete_thread`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      ...getAuthHeaders()
    },
    body: JSON.stringify({ thread_id: threadId }),
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to delete thread");
  return result;
};

// ---------------- DELETE ALL FILES FROM AGENT (MODELING_API / DATABRICKS_MODELING_API) ----------------
export interface DeleteAllFilesResponse {
  status: string;
  message: string;
  agent_id: string;
  files_deleted: number;
  remaining_files: number;
}

export const deleteAllFilesFromAgent = async (): Promise<DeleteAllFilesResponse> => {
  const useDatabricks = isDatabricksUser();
  const url = useDatabricks
    ? `${DATABRICKS_MODELING_API}/delete_all_files_from_agent`
    : `${MODELING_API}/delete_all_files_from_agent`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      ...getAuthHeaders()
    },
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to delete files from agent");
  return result;
};
// ---------------- FINALIZE DASHBOARD JSON (MODELING_API / DATABRICKS_MODELING_API) ----------------
export interface FinalizeDashboardRequest {
  thread_id: string;
}

export interface FinalizeDashboardResponse {
  // The response structure depends on what JSON the API returns
  // Adjust this based on the actual successful response
  [key: string]: any;
}

export async function finalizeDashboardJson(threadId: string): Promise<any> {
  const useDatabricks = isDatabricksUser();
  const url = useDatabricks
    ? `${DATABRICKS_MODELING_API}/finalize-dashboard-json`
    : `${MODELING_API}/finalize-dashboard-json`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ thread_id: threadId })
  });

  if (!response.ok) {
    throw new Error(`Failed to finalize dashboard: ${response.statusText}`);
  }

  return response.json();
}

// ---------------- MODELING DATA ----------------

export const getModelingData = async (
  userId: string,
  jobId: string
): Promise<any> => {
  const res = await fetch(`${MODELING_API}/api/status/${userId}/${jobId}`, {
    method: "GET",
    headers: { "Accept": "application/json", ...getAuthHeaders() }
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch modeling data");
  // /api/status returns { status, data } — we want the data object
  return result.data ?? result;
};

// ---------------- ENTITIES ----------------

export const getEntities = async (
  userId: string,
  jobId: string
): Promise<any> => {
  const res = await fetch(`${MODELING_API}/api/entities/${userId}/${jobId}`, {
    method: "GET",
    headers: { "Accept": "application/json", ...getAuthHeaders() }
  });
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to fetch entities");
  return result;
};

export interface EntityPatchPayload {
  primary_keys?: string[];
  columns?: Array<{
    name: string;
    is_primary_key?: boolean;
    is_foreign_key?: boolean;
    data_type?: string;
    references?: string;
  }>;
}

export const patchEntity = async (
  userId: string,
  jobId: string,
  entityName: string,
  payload: EntityPatchPayload
): Promise<any> => {
  const res = await fetch(
    `${MODELING_API}/api/entities/${userId}/${jobId}/${encodeURIComponent(entityName)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    }
  );
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to update entity");
  return result;
};

// ---------------- RELATIONSHIPS ----------------

export interface RelationshipPayload {
  from_table: string;
  from_column: string;
  to_table: string;
  to_column: string;
  relationship_type: string;
  description?: string;
}

export const addRelationship = async (
  userId: string,
  jobId: string,
  payload: RelationshipPayload
): Promise<any> => {
  const res = await fetch(
    `${MODELING_API}/api/relationships/${userId}/${jobId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    }
  );
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to add relationship");
  return result;
};

export const deleteRelationship = async (
  userId: string,
  jobId: string,
  relationshipId: string
): Promise<any> => {
  const res = await fetch(
    `${MODELING_API}/api/relationships/${userId}/${jobId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify({ relationship_id: relationshipId })
    }
  );
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || "Failed to delete relationship");
  return result;
};

// ---------------- MATERIALIZE ----------------

export interface MaterializeResponse {
  message: string;
  job_instance_id: string;
  user_id: string;
  job_id: string;
  status_url: string;
}

export interface MaterializeStatusResponse {
  job_instance_id: string;
  fabric_status: string;
  materialized_tables: string[];
  failed_tables: string[];
  table_prefix: string;
  ready_for_preview: boolean;
  start_time: string | null;
  end_time: string | null;
  error: any | null;
}

export const submitMaterializeJob = async (
  userId: string,
  jobId: string,
  containerName: string = "userdata"
): Promise<MaterializeResponse> => {
  const res = await fetch(
    `${MODELING_API}/api/materialize?user_id=${encodeURIComponent(userId)}&job_id=${encodeURIComponent(jobId)}&container_name=${encodeURIComponent(containerName)}`,
    {
      method: "POST",
      headers: { "Accept": "application/json", ...getAuthHeaders() }
    }
  );
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || result.message || "Failed to submit materialize job");
  return result;
};


export const getMaterializeStatus = async (
  jobInstanceId: string,
  userId: string,
  jobId: string
): Promise<MaterializeStatusResponse> => {
  const res = await fetch(
    `${MODELING_API}/api/materialize/status?job_instance_id=${encodeURIComponent(jobInstanceId)}&user_id=${encodeURIComponent(userId)}&job_id=${encodeURIComponent(jobId)}`,
    {
      method: "GET",
      headers: { "Accept": "application/json", ...getAuthHeaders() }
    }
  );
  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || result.message || "Failed to fetch materialize status");
  return result;
};



// ---------------- SAP HANA ----------------
export interface SapCredentials {
  host: string;
  port: number | string;
  username: string;
  password: string;
  schema?: string; // only set once a schema has been picked in the file browser
}

export interface SapSchemaItem {
  schemaName: string;
  schemaOwner: string;
}

export interface SapTableItem {
  tableName: string;
  tableType: string;
}

// SAP + local-file-ingest live on the Databricks-side service
const SERVICE_DATABRICKS_BASE = "https://api.veriton.ai/api/service-databricks";

export const getSapSchemas = async (
  credentials: SapCredentials
): Promise<string[]> => {
  const res = await fetch(`${SERVICE_DATABRICKS_BASE}/saphana/list-schemas`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      sourceType: "saphana",
      host: credentials.host,
      port: Number(credentials.port) || 443,
      username: credentials.username,
      password: credentials.password,
      // list-schemas still expects a "schema" key in the body per the API
      // contract — empty string when the user hasn't picked one yet.
      schema: credentials.schema || "",
    }),
  });

  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || result.message || "Failed to fetch SAP schemas");

  const schemas: SapSchemaItem[] = result.schemas || [];
  return schemas.map((s) => s.schemaName);
};

export const getSapTables = async (
  schema: string,
  credentials: SapCredentials
): Promise<string[]> => {
  const res = await fetch(`${SERVICE_DATABRICKS_BASE}/saphana/list-tables`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      accept: "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({
      sourceType: "saphana",
      host: credentials.host,
      port: Number(credentials.port) || 443,
      username: credentials.username,
      password: credentials.password,
      schema,
    }),
  });

  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || result.message || "Failed to fetch SAP tables");

  const tables: SapTableItem[] = result.tables || [];
  return tables.map((t) => t.tableName);
};

// ---------------- LOCAL FILE INGEST (Databricks landing volume) ----------------
export interface IngestLocalFileResponse {
  status: string;
  message: string;
  file: {
    fileName: string;
    filePath: string;
    sizeBytes: number;
    contentType: string;
    extension: string;
  };
}

/**
 * Uploads a single local file straight into the Databricks landing-zone
 * volume (/Volumes/veriton-db/landing/raw_files/{userId}/{jobId}/...).
 * Unlike the service1 upload-local flow, this file is already in its final
 * ingest location once this call succeeds — no further "source" entry is
 * needed for it when triggering the Databricks ingest job.
 */
export const ingestLocalFileToDatabricks = async (
  file: File,
  userId: string,
  jobId: string
): Promise<IngestLocalFileResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("userId", userId);
  formData.append("jobId", jobId);

  const res = await fetch(`${SERVICE_DATABRICKS_BASE}/ingest-local-file`, {
    method: "POST",
    headers: { accept: "application/json" },
    body: formData,
  });

  const result = await safeJsonParse(res);
  if (!res.ok) throw new Error(result.detail || result.message || "Failed to ingest local file");
  return result;
};