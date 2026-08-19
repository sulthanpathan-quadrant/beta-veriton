import React from 'react';
import { AlertCircle } from 'lucide-react';

interface OneLakeConnectorProps {
  workspace: string;
  setWorkspace: (v: string) => void;
  lakehouse: string;
  setLakehouse: (v: string) => void;
  mode: 'files' | 'tables' | '';
  setMode: (m: 'files' | 'tables') => void;
  folders: string[];
  files: any[];
  tables: string[];
  selectedFolder: string;
  selectedFile: string;
  selectedTable: string;
  currentPath: string;
  loading: boolean;
  error: string;
  onFolderDrill: (folder: string) => Promise<void>;
  onFileSelect: (fileName: string) => void;
  onTableSelect: (tableName: string) => Promise<void>;
  onRootFetch: (root: 'Files' | 'Tables') => Promise<void>;
}

export const OneLakeConnector: React.FC<OneLakeConnectorProps> = ({
  workspace,
  setWorkspace,
  lakehouse,
  setLakehouse,
  mode,
  setMode,
  folders,
  files,
  tables,
  selectedFolder,
  selectedFile,
  selectedTable,
  currentPath,
  loading,
  error,
  onFolderDrill,
  onFileSelect,
  onTableSelect,
  onRootFetch,
}) => {
  return (
    <div className="space-y-4">

      {/* Workspace */}
      <div>
        <label className="text-sm block mb-1">Workspace Name *</label>
        <input
          className="input-colored w-full"
          value={workspace}
          onChange={(e) => setWorkspace(e.target.value)}
          placeholder="MyWorkspace"
        />
      </div>

      {/* Lakehouse */}
      <div>
        <label className="text-sm block mb-1">Lakehouse Name *</label>
        <input
          className="input-colored w-full"
          value={lakehouse}
          onChange={(e) => setLakehouse(e.target.value)}
          placeholder="MyLakehouse"
        />
      </div>

      {/* Type Switcher */}
      <div>
        <label className="text-sm block mb-1">Type *</label>
        <div className="flex gap-2">
          <button
            onClick={() => {
              setMode('files');
              onRootFetch('Files');
            }}
            className={`px-3 py-1 rounded ${mode === 'files'
              ? 'bg-primary/10 border border-primary'
              : 'bg-card border border-border'
            }`}
          >
            Files
          </button>

          <button
            onClick={() => {
              setMode('tables');
              onRootFetch('Tables');
            }}
            className={`px-3 py-1 rounded ${mode === 'tables'
              ? 'bg-primary/10 border border-primary'
              : 'bg-card border border-border'
            }`}
          >
            Tables
          </button>
        </div>
      </div>

      {/* FILES MODE — Still works unchanged */}
      {mode === 'files' && (
        <>
          <div>
            <label className="text-sm block mb-1">Folders (optional)</label>
            <select
              className="input-colored w-full"
              value={selectedFolder}
              onChange={(e) => {
                const v = e.target.value;
                if (v) onFolderDrill(v);
                else onRootFetch('Files');
              }}
            >
              <option value="">-- Select folder --</option>
              {folders.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm block mb-1">Files</label>
            <select
              className="input-colored w-full"
              value={selectedFile}
              onChange={(e) => onFileSelect(e.target.value)}
            >
              <option value="">-- Select file --</option>
              {files.map((f: any) => (
                <option key={f.full_path || f.name} value={f.name}>
                  {f.name} {f.last_modified ? `• ${new Date(f.last_modified).toLocaleString()}` : ''}
                </option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* TABLES MODE — Simplified (NO parquet dropdown) */}
      {mode === 'tables' && (
        <div>
          <label className="text-sm block mb-1">Select Table *</label>
          <select
            className="input-colored w-full"
            value={selectedTable || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value) onTableSelect(value); // Will auto-pick latest parquet file
            }}
          >
            <option value="">-- Choose a table --</option>
            {tables.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          {/* No file dropdown shown here — autopick handled in parent */}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="loader h-4 w-4" /> Loading...
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <AlertCircle className="w-4 h-4 mt-[1px]" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
