import { useId, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Database,
  HardDrive,
  Cloud,
  FolderOpen,
  Upload,
  Eye,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UnifiedImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete: (dataset: ImportedDataset) => void;
}

export interface ImportedDataset {
  id: string;
  name: string;
  source: "adls" | "delta" | "onelake" | "local";
  rows?: number | null;
  columns?: number | null;
  preview?: Record<string, any>[];
  file?: File;
  // ADD THIS:
  onelakeConfig?: {
    workspaceName: string;
    lakehouseName: string;
    filePath: string;
    mode: string;
  };
}

type ImportSource = "none" | "adls" | "delta" | "onelake" | "local";
type AuthType = "access-key" | "sas-token" | "service-principal";
type DeltaSourceType = "unity-catalog" | "azure-storage" | "lakehouse";
type OneLakeMode = "" | "files" | "tables";

interface OneLakeFile {
  name: string;
  size_bytes?: number;
  last_modified?: string;
  relative_path: string;
  full_path: string;
}

interface OneLakeTable {
  name: string;
  relative_path?: string;
  full_path?: string;
}

const ONELAKE_BASE_URL =
  "https://automl-onelake-webapp-eedahsgvbug3apc6.eastus-01.azurewebsites.net";

const MAX_CLIENT_PREVIEW_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_ALLOWED_FILE_SIZE = 100 * 1024 * 1024; // 100 MB
const PREVIEW_ROWS = 8;

const UnifiedImportModal = ({
  isOpen,
  onClose,
  onImportComplete,
}: UnifiedImportModalProps) => {
  const inputId = useId();

  const [selectedSource, setSelectedSource] = useState<ImportSource>("none");
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // ADLS fields
  const [storageAccount, setStorageAccount] = useState("");
  const [fileSystem, setFileSystem] = useState("");
  const [filePath, setFilePath] = useState("");
  const [authType, setAuthType] = useState<AuthType>("access-key");
  const [accessKey, setAccessKey] = useState("");
  const [sasToken, setSasToken] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");

  // Delta fields
  const [deltaSourceType, setDeltaSourceType] =
    useState<DeltaSourceType>("unity-catalog");
  const [workspaceUrl, setWorkspaceUrl] = useState("");
  const [catalogName, setCatalogName] = useState("");
  const [schemaName, setSchemaName] = useState("");
  const [tableName, setTableName] = useState("");
  const [token, setToken] = useState("");

  // OneLake fields & navigation/drill state
  const [workspaceName, setWorkspaceName] = useState("");
  const [lakehouseName, setLakehouseName] = useState("");
  const [onelakeFilePath, setOnelakeFilePath] = useState("");
  const [oneLakeMode, setOneLakeMode] = useState<OneLakeMode>(""); // 'files' | 'tables'
  const [oneLakeFiles, setOneLakeFiles] = useState<OneLakeFile[]>([]);
  const [oneLakeTables, setOneLakeTables] = useState<OneLakeTable[]>([]);
  const [oneLakeFolders, setOneLakeFolders] = useState<string[]>([]);
  const [selectedOneLakeFile, setSelectedOneLakeFile] = useState("");
  const [selectedOneLakeTable, setSelectedOneLakeTable] = useState("");
  const [resolvedTableFilePath, setResolvedTableFilePath] = useState("");
  const [isOneLakeLoadingOptions, setIsOneLakeLoadingOptions] = useState(false);
  const [oneLakeOptionsError, setOneLakeOptionsError] = useState("");
  const [oneLakeCurrentPath, setOneLakeCurrentPath] = useState(""); // current path e.g. Files, Tables/customer_churn
  const [oneLakeHistory, setOneLakeHistory] = useState<string[]>([]); // navigation stack for back

  // Local file
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Preview
  const [previewData, setPreviewData] = useState<Record<string, any>[]>([]);
  const [detectedColumns, setDetectedColumns] = useState<number | null>(null);
  const [detectedRows, setDetectedRows] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const resetForm = () => {
    setSelectedSource("none");
    setIsPreviewMode(false);
    setError("");
    setStorageAccount("");
    setFileSystem("");
    setFilePath("");
    setAccessKey("");
    setSasToken("");
    setTenantId("");
    setClientId("");
    setClientSecret("");
    setWorkspaceUrl("");
    setCatalogName("");
    setSchemaName("");
    setTableName("");
    setToken("");
    setWorkspaceName("");
    setLakehouseName("");
    setOnelakeFilePath("");
    setOneLakeMode("");
    setOneLakeFiles([]);
    setOneLakeTables([]);
    setOneLakeFolders([]);
    setSelectedOneLakeFile("");
    setSelectedOneLakeTable("");
    setResolvedTableFilePath("");
    setIsOneLakeLoadingOptions(false);
    setOneLakeOptionsError("");
    setOneLakeCurrentPath("");
    setOneLakeHistory([]);
    setSelectedFile(null);
    setPreviewData([]);
    setDetectedColumns(null);
    setDetectedRows(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Lightweight CSV preview parse (header + first N rows).
  const parseCSVPreview = async (
    file: File,
    maxBytes = MAX_CLIENT_PREVIEW_BYTES,
    previewRows = PREVIEW_ROWS
  ) => {
    const toRead = Math.min(file.size, maxBytes);
    return await new Promise<{
      headers: string[];
      rows: any[];
      rowCountEstimate?: number | null;
    }>((resolve, reject) => {
      const reader = new FileReader();
      const blob = file.slice(0, toRead);
      reader.onerror = () => {
        reader.abort();
        reject(new Error("Error reading file for preview"));
      };
      reader.onload = () => {
        const text = String(reader.result || "");
        const lines = text
          .replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")
          .split("\n")
          .filter(Boolean);
        if (lines.length === 0) {
          resolve({ headers: [], rows: [], rowCountEstimate: 0 });
          return;
        }
        const headers = lines[0].split(",").map((h) => h.trim());
        const rows: any[] = [];
        for (let i = 1; i < Math.min(lines.length, previewRows + 1); i++) {
          const values = lines[i].split(",").map((v) => v.trim());
          const obj: Record<string, any> = {};
          for (let c = 0; c < headers.length; c++) {
            obj[headers[c] || `col_${c}`] = values[c] ?? "";
          }
          rows.push(obj);
        }

        let rowCountEstimate: number | null = null;
        if (toRead === file.size) {
          rowCountEstimate = Math.max(0, lines.length - 1);
        } else {
          const bytesPerRow = Math.max(
            1,
            Math.floor(text.length / Math.max(1, lines.length))
          );
          rowCountEstimate = Math.max(
            0,
            Math.round(file.size / Math.max(1, bytesPerRow)) - 1
          );
        }

        resolve({ headers, rows, rowCountEstimate });
      };
      reader.readAsText(blob);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setError("");
    setPreviewData([]);
    setDetectedColumns(null);
    setDetectedRows(null);
    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setError("Only CSV files are allowed");
      setSelectedFile(null);
      return;
    }

    if (file.size > MAX_ALLOWED_FILE_SIZE) {
      setError(
        `File too large. Max allowed size is ${Math.round(
          MAX_ALLOWED_FILE_SIZE / (1024 * 1024)
        )} MB`
      );
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
    setIsLoading(true);

    try {
      const readBytes =
        file.size <= MAX_CLIENT_PREVIEW_BYTES
          ? file.size
          : MAX_CLIENT_PREVIEW_BYTES;
      const { headers, rows, rowCountEstimate } = await parseCSVPreview(
        file,
        readBytes,
        PREVIEW_ROWS
      );
      setPreviewData(rows);
      setDetectedColumns(headers.length || null);
      setDetectedRows(rowCountEstimate ?? null);
      setIsLoading(false);
    } catch (err) {
      console.error("Preview parse error", err);
      setIsLoading(false);
      setError(
        "Could not generate preview for this file. It might be too large or malformed."
      );
    }
  };

  const handleConnectPreview = async () => {
    setIsLoading(true);
    setError("");

    // Cloud sources must be fetched from backend - we will instruct user
    if (selectedSource === "adls") {
      if (!storageAccount || !fileSystem || !filePath) {
        setError("Please provide storage account, file system and file path.");
        setIsLoading(false);
        return;
      }
      setError(
        "Cloud preview requires backend connection. Please connect via the backend or upload the CSV locally for a client-side preview."
      );
      setIsLoading(false);
      return;
    }

    if (selectedSource === "delta") {
      if (
        !tableName ||
        !workspaceUrl ||
        !catalogName ||
        !schemaName ||
        !token
      ) {
        setError("Please provide the delta table connection details.");
        setIsLoading(false);
        return;
      }
      setError(
        "Delta table preview requires backend connection. Please fetch preview via backend."
      );
      setIsLoading(false);
      return;
    }

    if (selectedSource === "onelake") {
      if (!workspaceName || !lakehouseName) {
        setError("Please enter workspace and lakehouse names.");
        setIsLoading(false);
        return;
      }
      if (!oneLakeMode) {
        setError("Please choose Files or Tables.");
        setIsLoading(false);
        return;
      }
      if (!onelakeFilePath) {
        setError("Please select a file or table from the list.");
        setIsLoading(false);
        return;
      }
      setError(
        "OneLake preview requires backend connection. Please fetch preview via backend."
      );
      setIsLoading(false);
      return;
    }

    if (selectedSource === "local") {
      if (!selectedFile) {
        setError("Please choose a CSV file to upload.");
        setIsLoading(false);
        return;
      }
      if (previewData.length === 0) {
        setError("No preview available. Please ensure the CSV is parseable.");
        setIsLoading(false);
        return;
      }
      setIsPreviewMode(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
  };

  const handleConfirmImport = () => {
    const name =
      selectedSource === "local"
        ? selectedFile?.name || "Untitled.csv"
        : selectedSource === "adls"
        ? filePath.split("/").pop() || "ADLS Dataset"
        : selectedSource === "delta"
        ? tableName || "Delta Table"
        : onelakeFilePath.split("/").pop() || "OneLake Dataset";

    if (selectedSource === "local" && !selectedFile) {
      setError("Please choose a CSV file to upload.");
      return;
    }

    const dataset: ImportedDataset = {
      id: Date.now().toString(),
      name,
      source:
        selectedSource === "none"
          ? "local"
          : (selectedSource as ImportedDataset["source"]),
      rows: detectedRows ?? null,
      columns: detectedColumns ?? null,
      preview: previewData,
      file: selectedSource === "local" ? selectedFile || undefined : undefined,
      // Pass OneLake config for chatbot to handle
      ...(selectedSource === "onelake" && {
        onelakeConfig: {
          workspaceName,
          lakehouseName,
          filePath:
            oneLakeMode === "tables" && resolvedTableFilePath
              ? resolvedTableFilePath
              : onelakeFilePath,
          mode: oneLakeMode,
        },
      }),
    };

    onImportComplete(dataset);
    handleClose();
  };

  const fetchOneLakeContents = async (path: string = "") => {
    if (!workspaceName.trim() || !lakehouseName.trim()) return;

    setIsOneLakeLoadingOptions(true);
    setOneLakeOptionsError("");
    setOneLakeFiles([]);
    setOneLakeTables([]);
    setOneLakeFolders([]);

    try {
      const url = `${ONELAKE_BASE_URL}/workspaces/${encodeURIComponent(
        workspaceName
      )}/lakehouses/${encodeURIComponent(
        lakehouseName
      )}/contents?path=${encodeURIComponent(path)}`;

      console.log("Fetching OneLake contents from:", url);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`Failed to fetch contents: ${response.status}`);
      }

      const data = await response.json();
      console.log("OneLake API Response:", data);

      setOneLakeCurrentPath(data.current_path || path);

      // Use path parameter instead of state
      if (path.startsWith("Files")) {
        const files = data.files || [];
        setOneLakeFiles(files);
        setOneLakeFolders(
          (data.folders || []).map((f: { name: string }) => f.name)
        );
        console.log("Files loaded:", files.length);
      } else if (path.startsWith("Tables")) {
        // For Tables, the API returns table names in the "folders" array
        const tables = (data.folders || []).map((f: { name: string }) => ({
          name: f.name,
        }));
        setOneLakeTables(tables);
        setOneLakeFolders([]); // No subfolders for tables
        console.log("Tables loaded:", tables.length);
      }
    } catch (err: any) {
      console.error("Error fetching OneLake contents:", err);
      setOneLakeOptionsError(
        err.message ||
          "Failed to load contents. Please check workspace/lakehouse name."
      );
    } finally {
      setIsOneLakeLoadingOptions(false);
    }
  };

  const handleOneLakeModeSelect = (mode: OneLakeMode) => {
    console.log("handleOneLakeModeSelect called with:", mode);

    if (!mode) return; // Don't process empty values

    setOneLakeMode(mode);
    setSelectedOneLakeFile("");
    setSelectedOneLakeTable("");
    setOnelakeFilePath("");
    setOneLakeHistory([]);

    const initialPath = mode === "files" ? "Files" : "Tables";
    setOneLakeCurrentPath(initialPath);

    console.log("About to fetch with path:", initialPath, "and mode:", mode);
    fetchOneLakeContents(initialPath);
  };

  const handleOneLakeFolderClick = (folder: string) => {
    const newPath = `${oneLakeCurrentPath}/${folder}`;
    setOneLakeHistory((prev) => [...prev, oneLakeCurrentPath]);
    fetchOneLakeContents(newPath);
  };

  const handleOneLakeBack = () => {
    if (oneLakeHistory.length > 0) {
      const prevPath = oneLakeHistory[oneLakeHistory.length - 1];
      setOneLakeHistory((prev) => prev.slice(0, -1));
      fetchOneLakeContents(prevPath);
    } else if (oneLakeMode) {
      // Back to mode root if no history
      const rootPath = oneLakeMode === "files" ? "Files" : "Tables";
      fetchOneLakeContents(rootPath);
    }
  };

  const renderSourceSelection = () => (
    <div className="grid grid-cols-2 gap-3">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedSource("adls")}
        className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center"
      >
        <Cloud className="w-8 h-8 mx-auto mb-2 text-primary" />
        <p className="font-medium text-foreground text-sm">ADLS Gen2</p>
        <p className="text-xs text-muted-foreground mt-1">Azure Data Lake</p>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedSource("delta")}
        className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center"
      >
        <Database className="w-8 h-8 mx-auto mb-2 text-primary" />
        <p className="font-medium text-foreground text-sm">Delta Tables</p>
        <p className="text-xs text-muted-foreground mt-1">Unity Catalog</p>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedSource("onelake")}
        className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center"
      >
        <FolderOpen className="w-8 h-8 mx-auto mb-2 text-primary" />
        <p className="font-medium text-foreground text-sm">OneLake</p>
        <p className="text-xs text-muted-foreground mt-1">Microsoft Fabric</p>
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setSelectedSource("local")}
        className="p-4 border-2 border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors text-center"
      >
        <HardDrive className="w-8 h-8 mx-auto mb-2 text-primary" />
        <p className="font-medium text-foreground text-sm">Local Storage</p>
        <p className="text-xs text-muted-foreground mt-1">Upload CSV file</p>
      </motion.button>
    </div>
  );

  const renderADLSForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="storage-account">Storage Account Name *</Label>
        <Input
          id="storage-account"
          value={storageAccount}
          onChange={(e) => setStorageAccount(e.target.value)}
          placeholder="mystorageaccount"
        />
      </div>
      <div>
        <Label htmlFor="file-system">File System (Container Name) *</Label>
        <Input
          id="file-system"
          value={fileSystem}
          onChange={(e) => setFileSystem(e.target.value)}
          placeholder="mycontainer"
        />
      </div>
      <div>
        <Label htmlFor="file-path">File Path *</Label>
        <Input
          id="file-path"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          placeholder="data/customers.csv"
        />
      </div>

      <div>
        <Label htmlFor="auth-type">Authentication Type *</Label>
        <Select
          value={authType}
          onValueChange={(v: AuthType) => setAuthType(v)}
        >
          <SelectTrigger id="auth-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="access-key">Access Key</SelectItem>
            <SelectItem value="sas-token">SAS Token</SelectItem>
            <SelectItem value="service-principal">Service Principal</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {authType === "access-key" && (
        <div>
          <Label htmlFor="access-key">Access Key *</Label>
          <Input
            id="access-key"
            type="password"
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            placeholder="Enter access key"
          />
        </div>
      )}

      {authType === "sas-token" && (
        <div>
          <Label htmlFor="sas-token">SAS Token *</Label>
          <Input
            id="sas-token"
            type="password"
            value={sasToken}
            onChange={(e) => setSasToken(e.target.value)}
            placeholder="Enter SAS token"
          />
        </div>
      )}

      {authType === "service-principal" && (
        <>
          <div>
            <Label htmlFor="tenant-id">Tenant ID *</Label>
            <Input
              id="tenant-id"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              placeholder="Enter tenant ID"
            />
          </div>
          <div>
            <Label htmlFor="client-id">Client ID *</Label>
            <Input
              id="client-id"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="Enter client ID"
            />
          </div>
          <div>
            <Label htmlFor="client-secret">Client Secret *</Label>
            <Input
              id="client-secret"
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="Enter client secret"
            />
          </div>
        </>
      )}

      <Button
        onClick={handleConnectPreview}
        disabled={isLoading}
        className="w-full"
      >
        <Eye className="w-4 h-4 mr-2" />
        {isLoading ? "Connecting..." : "Connect & Preview"}
      </Button>
    </div>
  );

  const renderDeltaForm = () => (
    <div className="space-y-4">
      <div>
        <Label htmlFor="delta-source">Delta Source Type *</Label>
        <Select
          value={deltaSourceType}
          onValueChange={(v: DeltaSourceType) => setDeltaSourceType(v)}
        >
          <SelectTrigger id="delta-source">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="unity-catalog">Unity Catalog</SelectItem>
            <SelectItem value="azure-storage">Azure Storage Path</SelectItem>
            <SelectItem value="lakehouse">Lakehouse Path</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {deltaSourceType === "unity-catalog" && (
        <>
          <div>
            <Label htmlFor="workspace-url">Workspace URL *</Label>
            <Input
              id="workspace-url"
              value={workspaceUrl}
              onChange={(e) => setWorkspaceUrl(e.target.value)}
              placeholder="https://adb-xxx.azuredatabricks.net"
            />
          </div>
          <div>
            <Label htmlFor="catalog-name">Catalog Name *</Label>
            <Input
              id="catalog-name"
              value={catalogName}
              onChange={(e) => setCatalogName(e.target.value)}
              placeholder="main_catalog"
            />
          </div>
          <div>
            <Label htmlFor="schema-name">Schema Name *</Label>
            <Input
              id="schema-name"
              value={schemaName}
              onChange={(e) => setSchemaName(e.target.value)}
              placeholder="default"
            />
          </div>
          <div>
            <Label htmlFor="table-name">Table Name *</Label>
            <Input
              id="table-name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="customer_data"
            />
          </div>
          <div>
            <Label htmlFor="token">Token / PAT *</Label>
            <Input
              id="token"
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Enter personal access token"
            />
          </div>
        </>
      )}

      <Button
        onClick={handleConnectPreview}
        disabled={isLoading}
        className="w-full"
      >
        <Database className="w-4 h-4 mr-2" />
        {isLoading ? "Loading..." : "Load Delta Table"}
      </Button>
    </div>
  );

  const renderOneLakeForm = () => (
    <div className="space-y-6">
      {/* Workspace & Lakehouse */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="workspace-name">Workspace Name *</Label>
          <Input
            id="workspace-name"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
            placeholder="MyWorkspace"
          />
        </div>
        <div>
          <Label htmlFor="lakehouse-name">Lakehouse Name *</Label>
          <Input
            id="lakehouse-name"
            value={lakehouseName}
            onChange={(e) => setLakehouseName(e.target.value)}
            placeholder="MyLakehouse"
          />
        </div>
      </div>

      {/* Type & File dropdowns */}
      {/* Type - Button Group */}
      <div>
        <Label>Type *</Label>
        <div className="flex gap-2 mt-1">
          <Button
            type="button"
            variant={oneLakeMode === "files" ? "default" : "outline"}
            onClick={() => handleOneLakeModeSelect("files")}
            className="px-8"
          >
            Files
          </Button>
          <Button
            type="button"
            variant={oneLakeMode === "tables" ? "default" : "outline"}
            onClick={() => handleOneLakeModeSelect("tables")}
            className="px-8"
          >
            Tables
          </Button>
        </div>
      </div>

      {/* File/Table Dropdown - Only show after Type is selected */}
      {oneLakeMode && (
        <div>
          <Label htmlFor="file">
            {oneLakeMode === "files" ? "Select File" : "Select Table"} *
          </Label>
          <Select
            value={selectedOneLakeFile || selectedOneLakeTable}
            onValueChange={async (value) => {
              const items =
                oneLakeMode === "files" ? oneLakeFiles : oneLakeTables;
              const selected = items.find((item: any) => item.name === value);
              if (selected) {
                if (oneLakeMode === "files") {
                  setSelectedOneLakeFile(value);
                  const relativePath =
                    selected.relative_path || `${oneLakeCurrentPath}/${value}`;
                  setOnelakeFilePath(relativePath);
                  setResolvedTableFilePath(relativePath);
                } else {
                  // For tables, fetch the actual parquet file path
                  setSelectedOneLakeTable(value);
                  setOnelakeFilePath(""); // Clear temporarily
                  setResolvedTableFilePath(""); // Clear resolved path
                  setIsOneLakeLoadingOptions(true);
                  setOneLakeOptionsError("");

                  try {
                    const tablePath = `Tables/${value}`;
                    const url = `${ONELAKE_BASE_URL}/workspaces/${encodeURIComponent(
                      workspaceName
                    )}/lakehouses/${encodeURIComponent(
                      lakehouseName
                    )}/contents?path=${encodeURIComponent(tablePath)}`;

                    const response = await fetch(url, {
                      method: "GET",
                      headers: { accept: "application/json" },
                    });

                    if (!response.ok) {
                      throw new Error(
                        `Failed to fetch table details: ${response.status}`
                      );
                    }

                    const data = await response.json();

                    // Find the parquet file in the response
                    const parquetFile = (data.files || []).find((f: any) =>
                      f.name.endsWith(".parquet")
                    );

                    if (parquetFile && parquetFile.full_path) {
                      const relativePath =
                        parquetFile.relative_path ||
                        `${tablePath}/${parquetFile.name}`;
                      setResolvedTableFilePath(relativePath);
                      setOnelakeFilePath(tablePath);
                      console.log(
                        "Resolved table relative path:",
                        relativePath
                      );
                      console.log("Parquet file name:", parquetFile.name);
                    } else {
                      throw new Error("No parquet file found for this table");
                    }
                  } catch (err: any) {
                    console.error("Error fetching table details:", err);
                    setOneLakeOptionsError(
                      err.message || "Failed to load table details"
                    );
                  } finally {
                    setIsOneLakeLoadingOptions(false);
                  }
                }
              }
            }}
            disabled={isOneLakeLoadingOptions}
          >
            <SelectTrigger id="file" className="bg-background">
              <SelectValue
                placeholder={
                  isOneLakeLoadingOptions
                    ? "Loading..."
                    : oneLakeOptionsError
                    ? "Error loading items"
                    : (oneLakeMode === "files" ? oneLakeFiles : oneLakeTables)
                        .length === 0
                    ? "No items"
                    : oneLakeMode === "files"
                    ? "-- Choose a file --"
                    : "-- Choose a table --"
                }
              />
            </SelectTrigger>
            <SelectContent
              className="bg-popover border border-border z-[400]"
              side={oneLakeMode === "files" ? "bottom" : "top"}
              align="start"
            >
              {(oneLakeMode === "files" ? oneLakeFiles : oneLakeTables).map(
                (item: any) => (
                  <SelectItem
                    key={item.name}
                    value={item.name}
                    className="hover:bg-teal-500 hover:text-white cursor-pointer data-[state=checked]:bg-teal-500 data-[state=checked]:text-white"
                  >
                    {item.name}
                    {item.size_bytes
                      ? ` • ${(item.size_bytes / (1024 * 1024)).toFixed(2)} MB`
                      : ""}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Loading / Error */}

      {oneLakeOptionsError && (
        <p className="text-sm text-destructive flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {oneLakeOptionsError}
        </p>
      )}

      {/* Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirmImport}
          disabled={
            isLoading ||
            !workspaceName ||
            !lakehouseName ||
            !oneLakeMode ||
            !onelakeFilePath
          }
        >
          {isLoading ? "Connecting..." : "Connect & Import"}
        </Button>
      </div>
    </div>
  );

  const renderLocalForm = () => (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
        <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <input
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
          id={`${inputId}-file-upload`}
        />
        <label htmlFor={`${inputId}-file-upload`} className="cursor-pointer">
          <Button variant="outline" size="sm" asChild>
            <span>Choose CSV File</span>
          </Button>
        </label>
        {selectedFile && (
          <p className="mt-3 text-sm text-foreground font-medium">
            {selectedFile.name}
          </p>
        )}
        {error && (
          <p className="mt-2 text-sm text-destructive flex items-center justify-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
        {selectedFile && selectedFile.size && (
          <p className="mt-1 text-xs text-muted-foreground">
            Size: {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        )}
      </div>

      {selectedFile && (
        <Button onClick={handleConfirmImport} className="w-full">
          <CheckCircle className="w-4 h-4 mr-2" />
          Upload & Analyze
        </Button>
      )}
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-success/10 border border-success/20 rounded-lg">
        <CheckCircle className="w-5 h-5 text-success" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Dataset Preview Loaded
          </p>
          <p className="text-xs text-muted-foreground">
            {detectedRows
              ? `${detectedRows.toLocaleString()} rows × ${
                  detectedColumns ?? "-"
                } columns`
              : `${detectedColumns ?? "-"} columns`}
          </p>
        </div>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/30">
              {previewData.length > 0 ? (
                Object.keys(previewData[0])
                  .slice(0, 8)
                  .map((h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-left text-xs font-medium text-muted-foreground"
                    >
                      {h}
                    </th>
                  ))
              ) : (
                <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                  No preview
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, idx) => (
              <tr key={idx} className="border-t border-border">
                {Object.keys(row)
                  .slice(0, 8)
                  .map((k) => (
                    <td key={k} className="px-4 py-2 text-foreground">
                      {String(row[k])}
                    </td>
                  ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        Showing {previewData.length} preview rows{" "}
        {detectedRows ? `of ${detectedRows.toLocaleString()} rows` : ""}
      </p>

      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => {
            setIsPreviewMode(false);
            setPreviewData([]);
          }}
          className="flex-1"
        >
          Back
        </Button>
        <Button onClick={handleConfirmImport} className="flex-1">
          <CheckCircle className="w-4 h-4 mr-2" />
          Confirm Import
        </Button>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[350] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-card border border-border rounded-xl shadow-modal w-full max-w-2xl max-h-[90vh] flex flex-col"
        >
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div>
              <h2 className="text-xl font-semibold text-foreground">
                {isPreviewMode
                  ? "Preview Dataset"
                  : selectedSource === "none"
                  ? "Import dataset from"
                  : selectedSource === "adls"
                  ? "ADLS Gen2"
                  : selectedSource === "delta"
                  ? "Delta Tables"
                  : selectedSource === "onelake"
                  ? "OneLake connection"
                  : "Local Storage"}
              </h2>
              {selectedSource !== "none" && !isPreviewMode && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedSource === "local"
                    ? "Select a CSV file to upload"
                    : "Configure connection details"}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {isPreviewMode
              ? renderPreview()
              : selectedSource === "none"
              ? renderSourceSelection()
              : selectedSource === "adls"
              ? renderADLSForm()
              : selectedSource === "delta"
              ? renderDeltaForm()
              : selectedSource === "onelake"
              ? renderOneLakeForm()
              : renderLocalForm()}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UnifiedImportModal;
