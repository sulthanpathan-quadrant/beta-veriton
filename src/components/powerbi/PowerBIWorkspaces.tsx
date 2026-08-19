// import { useState, useEffect } from 'react';
// import { ArrowLeft, FolderOpen, Search, LayoutGrid, List, Plus, Loader2, AlertCircle } from 'lucide-react';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';

// const API_BASE = 'https://api.veriton.ai/api/service4';
// async function apiFetch(path: string, options: RequestInit = {}) {
//   return fetch(`${API_BASE}${path}`, {
//     ...options, credentials: 'include',
//     headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(options.headers as any) },
//   });
// }

// interface Workspace {
//   id: string;
//   name: string;
//   reports: number;
//   datasets: number;
// }

// interface PowerBIWorkspacesProps {
//   onBack: () => void;
//   onMigrate: (workspace: Workspace) => void;
//   fileName: string;
//   isMigrating?: boolean;
// }

// export function PowerBIWorkspaces({ onBack, onMigrate, fileName, isMigrating }: PowerBIWorkspacesProps) {
//   const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
//   const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
//   const [fetchError, setFetchError] = useState<string | null>(null);

//   const [selectedId, setSelectedId] = useState<string | null>(null);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
//   const [showCreateDialog, setShowCreateDialog] = useState(false);
//   const [newWorkspaceName, setNewWorkspaceName] = useState('');
//   const [isCreating, setIsCreating] = useState(false);
//   const [showMigrateDialog, setShowMigrateDialog] = useState(false);
//   const [reportName, setReportName] = useState('');

//   // ── Fetch real workspaces from backend on mount ──────────────────────────
//   useEffect(() => {
//     const fetchWorkspaces = async () => {
//       setIsLoadingWorkspaces(true);
//       setFetchError(null);
//       try {
//         const res = await apiFetch('/powerbi/workspaces');
//         if (!res.ok) {
//           throw new Error(`Failed to load workspaces (${res.status})`);
//         }
//         const data = await res.json();
//         // Backend returns { workspaces: [...], count: N }
//         // Each workspace: { id, name, type, ... } from Power BI API
//         const mapped: Workspace[] = (data.workspaces ?? []).map((ws: any) => ({
//           id: ws.id,
//           name: ws.name,
//           reports: 0,   // Power BI workspace list doesn't include counts; we show 0
//           datasets: 0,
//         }));
//         setWorkspaces(mapped);
//       } catch (err: any) {
//         setFetchError(err.message ?? 'Could not load workspaces');
//       } finally {
//         setIsLoadingWorkspaces(false);
//       }
//     };
//     fetchWorkspaces();
//   }, []);

//   // ── When user selects a workspace, call add-sp so the SP gets Admin access ──
//   const handleSelectWorkspace = async (wsId: string) => {
//     setSelectedId(wsId);
//     try {
//       // Non-blocking — fire and forget. Backend is resilient to 409 (already exists).
//       await apiFetch(`/powerbi/workspaces/${wsId}/add-sp`, { method: 'POST' });
//     } catch {
//       // Non-fatal — proceed anyway; SP may already have access
//     }
//   };

//   // ── Create a new workspace via the backend ───────────────────────────────
//   const handleCreate = async () => {
//     if (!newWorkspaceName.trim()) return;
//     setIsCreating(true);
//     try {
//       const res = await apiFetch('/powerbi/workspaces', {
//         method: 'POST',
//         body: JSON.stringify({ name: newWorkspaceName.trim() }),
//       });
//       if (!res.ok) throw new Error(`Create failed (${res.status})`);
//       const data = await res.json();
//       const newWs: Workspace = {
//         id: data.workspace_id,
//         name: data.name,
//         reports: 0,
//         datasets: 0,
//       };
//       setWorkspaces(prev => [newWs, ...prev]);
//       setNewWorkspaceName('');
//       setShowCreateDialog(false);
//     } catch (err: any) {
//       alert(`Could not create workspace: ${err.message}`);
//     } finally {
//       setIsCreating(false);
//     }
//   };

//   const filtered = workspaces.filter(w =>
//     w.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   const selectedWorkspace = workspaces.find(w => w.id === selectedId);

//   return (
//     <>
//       {isMigrating && (
//         <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
//           <Loader2 className="w-12 h-12 animate-spin text-primary" />
//           <p className="text-lg font-semibold text-foreground">Migrating to Power BI...</p>
//           <p className="text-sm text-muted-foreground">Please wait while your report is being migrated</p>
//         </div>
//       )}

//       <div className="min-h-screen bg-background flex flex-col pt-6">
//         {/* Toolbar */}
//         <div className="px-6 pb-3 flex items-center justify-between">
//           <h1 className="text-xl font-bold text-foreground">Power BI Workspaces</h1>
//         </div>

//         <div className="flex-1 px-6 py-2">
//           <div className="bg-card border border-border rounded-xl p-6 space-y-4">

//             {/* Search + controls */}
//             <div className="flex items-center gap-3 flex-wrap justify-between">
//               <div className="relative flex-1 min-w-[240px]">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//                 <Input
//                   placeholder="Search workspaces..."
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className="pl-10 h-11 bg-background border-input text-foreground placeholder:text-muted-foreground rounded-full"
//                 />
//               </div>
//               <div className="flex items-center gap-2">
//                 <Button
//                   variant="outline"
//                   size="icon"
//                   onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
//                   className="h-11 w-11"
//                 >
//                   {viewMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
//                 </Button>
//                 <Button
//                   onClick={() => setShowCreateDialog(true)}
//                   className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full"
//                 >
//                   <Plus className="w-4 h-4" />
//                   Create Workspace
//                 </Button>
//               </div>
//             </div>

//             {/* Content area */}
//             {isLoadingWorkspaces ? (
//               <div className="h-[400px] flex flex-col items-center justify-center gap-3 text-muted-foreground">
//                 <Loader2 className="w-8 h-8 animate-spin text-primary" />
//                 <p className="text-sm">Loading your workspaces...</p>
//               </div>
//             ) : fetchError ? (
//               <div className="h-[400px] flex flex-col items-center justify-center gap-3">
//                 <AlertCircle className="w-8 h-8 text-destructive" />
//                 <p className="text-sm text-destructive font-medium">{fetchError}</p>
//                 <Button variant="outline" onClick={() => window.location.reload()} className="text-sm">
//                   Retry
//                 </Button>
//               </div>
//             ) : (
//               <ScrollArea className="h-[400px] pr-2">
//                 <div className={
//                   viewMode === 'grid'
//                     ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
//                     : 'space-y-2'
//                 }>
//                   {filtered.length === 0 ? (
//                     <div className="col-span-full flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
//                       <FolderOpen className="w-10 h-10 opacity-30" />
//                       <p className="text-sm">No workspaces found</p>
//                     </div>
//                   ) : filtered.map(ws => (
//                     <button
//                       key={ws.id}
//                       onClick={() => handleSelectWorkspace(ws.id)}
//                       className={`w-full text-left p-5 rounded-xl border-2 transition-all duration-200 ${
//                         selectedId === ws.id
//                           ? 'border-primary bg-primary/5 shadow-sm'
//                           : 'border-border hover:border-primary/40 bg-card hover:shadow-sm'
//                       }`}
//                     >
//                       <FolderOpen className="w-6 h-6 text-primary mb-3" />
//                       <p className="font-semibold text-foreground text-sm truncate">{ws.name}</p>
//                       {/* <p className="text-xs text-muted-foreground mt-1 font-mono truncate opacity-60">{ws.id}</p> */}
//                     </button>
//                   ))}
//                 </div>
//               </ScrollArea>
//             )}
//           </div>
//         </div>

//         {/* Bottom bar */}
//         <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-end sticky bottom-0 z-10">
//           {/* <Button variant="outline" className="gap-2 rounded-full" onClick={onBack}>
//             <ArrowLeft className="w-4 h-4" />
//             Back
//           </Button> */}
//           <Button
//             onClick={() => {
//               if (selectedWorkspace) {
//                 setReportName(fileName.replace(/\.[^/.]+$/, ''));
//                 setShowMigrateDialog(true);
//               }
//             }}
//             disabled={!selectedWorkspace || isMigrating || isLoadingWorkspaces}
//             className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-8 rounded-full min-w-[180px]"
//           >
//             {isMigrating ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 Migrating...
//               </>
//             ) : (
//               'Migrate to Power BI'
//             )}
//           </Button>
//         </div>

//         {/* Create Workspace Dialog */}
//         <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
//           <DialogContent className="sm:max-w-md">
//             <DialogHeader>
//               <DialogTitle>Create Power BI Workspace</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4 pt-2">
//               <Input
//                 placeholder="Enter workspace name"
//                 value={newWorkspaceName}
//                 onChange={(e) => setNewWorkspaceName(e.target.value)}
//                 className="h-11"
//                 autoFocus
//                 onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
//               />
//               <div className="flex justify-end gap-2">
//                 <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={isCreating}>
//                   Cancel
//                 </Button>
//                 <Button onClick={handleCreate} disabled={!newWorkspaceName.trim() || isCreating}>
//                   {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
//                   Create
//                 </Button>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>

//         {/* Migrate Dialog */}
//         <Dialog open={showMigrateDialog} onOpenChange={setShowMigrateDialog}>
//           <DialogContent className="sm:max-w-md">
//             <DialogHeader>
//               <DialogTitle>Migrate to Power BI</DialogTitle>
//             </DialogHeader>
//             <div className="space-y-4 pt-2">
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-foreground/90">Report Name</label>
//                 <Input
//                   placeholder="Enter report name"
//                   value={reportName}
//                   onChange={(e) => setReportName(e.target.value)}
//                   className="h-11"
//                   autoFocus
//                 />
//               </div>
//               <div className="space-y-2">
//                 <label className="text-sm font-medium text-foreground/90">Destination Workspace</label>
//                 <Input
//                   value={selectedWorkspace?.name || ''}
//                   disabled
//                   className="h-11 bg-muted/50"
//                 />
//               </div>
//               <div className="flex justify-end gap-2 pt-2">
//                 <Button variant="outline" onClick={() => setShowMigrateDialog(false)}>
//                   Cancel
//                 </Button>
//                 <Button
//                   onClick={() => {
//                     setShowMigrateDialog(false);
//                     if (selectedWorkspace) onMigrate({ ...selectedWorkspace, name: reportName || selectedWorkspace.name });
//                   }}
//                   disabled={!reportName.trim()}
//                 >
//                   Start Migration
//                 </Button>
//               </div>
//             </div>
//           </DialogContent>
//         </Dialog>
//       </div>
//     </>
//   );
// }


import { useState, useEffect } from 'react';
import { ArrowLeft, FolderOpen, Search, LayoutGrid, List, Plus, Loader2, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const API_BASE = 'https://api.veriton.ai/api/service4';

function getToken(): string | null {
  return localStorage.getItem('pbi_access_token');
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw Object.assign(
      new Error(errData?.detail || `Request failed: ${res.status}`),
      { status: res.status }
    );
  }
  return res.json();
}

interface Workspace {
  id: string;
  name: string;
  reports: number;
  datasets: number;
}

interface PowerBIWorkspacesProps {
  onBack: () => void;
  // workspace = the selected destination; reportName = what user typed in the dialog
  onMigrate: (workspace: Workspace, reportName: string) => void;
  fileName: string;
  isMigrating?: boolean;
}

export function PowerBIWorkspaces({
  onBack,
  onMigrate,
  fileName,
  isMigrating,
}: PowerBIWorkspacesProps) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [showMigrateDialog, setShowMigrateDialog] = useState(false);
  // Pre-fill with the uploaded file name (minus extension) — user can edit freely
  const [reportName, setReportName] = useState(fileName.replace(/\.[^/.]+$/, ''));

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    setIsLoadingWorkspaces(true);
    setFetchError(null);
    try {
      const data = await apiFetch('/powerbi/workspaces');
      const list = Array.isArray(data?.workspaces) ? data.workspaces : [];

      const mapped: Workspace[] = list.map((ws: any) => ({
        id: ws.id,
        name: ws.name || ws.displayName || 'Unnamed',
        reports: 0,
        datasets: 0,
      }));

      setWorkspaces(mapped);
    } catch (err: any) {
      console.error(err);
      setFetchError(err.message || 'Failed to load workspaces');
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  const handleSelectWorkspace = (wsId: string) => {
    setSelectedId(wsId);
  };

  const handleCreate = async () => {
    if (!newWorkspaceName.trim()) return;
    setIsCreating(true);
    try {
      const data = await apiFetch('/powerbi/workspaces', {
        method: 'POST',
        body: JSON.stringify({ name: newWorkspaceName.trim() }),
      });

      const newWs: Workspace = {
        id: data.workspace_id || data.id,
        name: data.name,
        reports: 0,
        datasets: 0,
      };

      setWorkspaces(prev => [newWs, ...prev]);
      setNewWorkspaceName('');
      setShowCreateDialog(false);
    } catch (err: any) {
      alert(`Create failed: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const filtered = workspaces.filter(w =>
    w.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedWorkspace = workspaces.find(w => w.id === selectedId);

  return (
    <>
      {isMigrating && (
        <div className="fixed inset-0 z-[100] bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-lg font-semibold text-foreground">Migrating to Power BI...</p>
        </div>
      )}

      <div className="min-h-screen bg-background flex flex-col pt-6">
        <div className="px-6 pb-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-foreground">Power BI Workspaces</h1>
        </div>

        <div className="flex-1 px-6 py-2">
          <div className="bg-card border border-border rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3 flex-wrap justify-between">
              <div className="relative flex-1 min-w-[240px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search workspaces..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                >
                  {viewMode === 'grid' ? <List className="w-4 h-4" /> : <LayoutGrid className="w-4 h-4" />}
                </Button>
                <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                  <Plus className="w-4 h-4" />
                  Create Workspace
                </Button>
              </div>
            </div>

            {isLoadingWorkspaces ? (
              <div className="h-[400px] flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Loading workspaces...</p>
              </div>
            ) : fetchError ? (
              <div className="h-[400px] flex flex-col items-center justify-center gap-3">
                <AlertCircle className="w-8 h-8 text-destructive" />
                <p className="text-destructive text-center">{fetchError}</p>
                <Button variant="outline" onClick={fetchWorkspaces}>Retry</Button>
              </div>
            ) : (
              <ScrollArea className="h-[400px] pr-2">
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'space-y-2'}>
                  {filtered.length === 0 ? (
                    <div className="col-span-full py-16 text-center text-muted-foreground">
                      <FolderOpen className="w-12 h-12 mx-auto opacity-40 mb-3" />
                      <p>No workspaces found</p>
                    </div>
                  ) : (
                    filtered.map(ws => (
                      <button
                        key={ws.id}
                        onClick={() => handleSelectWorkspace(ws.id)}
                        className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                          selectedId === ws.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <FolderOpen className="w-6 h-6 text-primary mb-3" />
                        <p className="font-semibold truncate">{ws.name}</p>
                        <p className="text-xs text-muted-foreground font-mono truncate mt-1">{ws.id}</p>
                      </button>
                    ))
                  )}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between sticky bottom-0 z-10">
          {/* <Button variant="outline" className="gap-2" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button> */}
          <Button
            onClick={() => selectedWorkspace && setShowMigrateDialog(true)}
            disabled={!selectedWorkspace || isMigrating}
            className="gap-2 px-8"
          >
            {isMigrating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Migrating...</>
            ) : (
              'Migrate to Power BI'
            )}
          </Button>
        </div>

        {/* Create Workspace Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <Input
                placeholder="Workspace name"
                value={newWorkspaceName}
                onChange={(e) => setNewWorkspaceName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!newWorkspaceName.trim() || isCreating}>
                  {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Migrate Confirmation Dialog */}
        <Dialog open={showMigrateDialog} onOpenChange={setShowMigrateDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Migrate to Power BI</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium">Report Name</label>
                <Input
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                  placeholder="Enter report name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Destination Workspace</label>
                <Input value={selectedWorkspace?.name || ''} disabled />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setShowMigrateDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setShowMigrateDialog(false);
                    if (selectedWorkspace) {
                      // Pass workspace and reportName separately — never mix them up
                      onMigrate(selectedWorkspace, reportName.trim());
                    }
                  }}
                  disabled={!reportName.trim()}
                >
                  Start Migration
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}