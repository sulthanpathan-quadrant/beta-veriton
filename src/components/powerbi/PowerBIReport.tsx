// import { useState, useEffect, useRef } from 'react';
// import { ArrowLeft, BarChart3, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { ThemeToggle } from '../ThemeToggle';

// const API_BASE = 'https://api.veriton.ai/api/service4';
// async function apiFetch(path: string, options: RequestInit = {}) {
//   return fetch(`${API_BASE}${path}`, {
//     ...options, credentials: 'include',
//     headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(options.headers as any) },
//   });
// }

// // Load powerbi-client SDK from CDN once globally
// function loadPBIScript(): Promise<void> {
//   return new Promise((resolve) => {
//     if ((window as any).powerbi) { resolve(); return; }
//     const existing = document.getElementById('powerbi-sdk');
//     if (existing) { existing.addEventListener('load', () => resolve()); return; }
//     const script = document.createElement('script');
//     script.id = 'powerbi-sdk';
//     script.src = 'https://cdn.jsdelivr.net/npm/powerbi-client@2.23.1/dist/powerbi.min.js';
//     script.onload = () => resolve();
//     document.head.appendChild(script);
//   });
// }

// interface PowerBIReportProps {
//   workspaceName: string;
//   onBack: () => void;
//   embedUrl?: string;
//   embedToken?: string;
//   editUrl?: string;
//   reportId?: string;
//   workspaceId?: string;
//   datasetId?: string;
// }

// export function PowerBIReport({
//   workspaceName,
//   onBack,
//   embedUrl,
//   embedToken,
//   editUrl,
//   reportId,
//   workspaceId,
//   datasetId,
// }: PowerBIReportProps) {
//   const containerRef                = useRef<HTMLDivElement>(null);
//   const reportInstanceRef           = useRef<any>(null);
//   const [isLoading, setIsLoading]   = useState(true);
//   const [embedError, setEmbedError] = useState<string | null>(null);
//   const [refreshing, setRefreshing] = useState(false);
//   const [currentToken, setCurrentToken] = useState(embedToken ?? '');


//   const storedUser = localStorage.getItem("user");
//   const user = storedUser ? JSON.parse(storedUser) : null;
//   const userName = user?.name || user?.email?.split("@")[0] || "User";


//   // ── Embed using powerbi-client SDK ──────────────────────────────────────
//   const embedReport = async (token: string) => {
//     if (!embedUrl || !reportId || !containerRef.current) return;

//     setIsLoading(true);
//     setEmbedError(null);

//     try {
//       await loadPBIScript();
//       const pbi = (window as any).powerbi;
//       if (!pbi) throw new Error('Power BI SDK failed to load');

//       // Reset any previous embed in this container
//       pbi.reset(containerRef.current);

//       const config = {
//         type: 'report',
//         id: reportId,
//         embedUrl: embedUrl,
//         accessToken: token,
//         tokenType: 1,  // 1 = Embed token (not AAD)
//         viewMode: 1,   // 1 = Edit, 0 = View
//         permissions: 7, // Read | Create | Copy | Write | Delete
//         settings: {
//           panes: {
//             filters: { expanded: false, visible: true },
//             pageNavigation: { visible: true },
//           },
//           bars: {
//             actionBar: { visible: true },
//           },
//         },
//       };

//       const report = pbi.embed(containerRef.current, config);
//       reportInstanceRef.current = report;

//       report.on('loaded', () => {
//         console.log('[PowerBIReport] ✓ Report loaded in edit mode');
//         setIsLoading(false);
//       });

//       report.on('rendered', () => {
//         setIsLoading(false);
//       });

//       report.on('error', (event: any) => {
//         console.error('[PowerBIReport] Embed error:', event?.detail);
//         // If edit mode fails, retry in view mode automatically
//         if (config.viewMode === 1) {
//           console.log('[PowerBIReport] Edit mode failed, retrying in view mode...');
//           pbi.reset(containerRef.current);
//           const viewConfig = { ...config, viewMode: 0, permissions: 1 };
//           const viewReport = pbi.embed(containerRef.current, viewConfig);
//           reportInstanceRef.current = viewReport;
//           viewReport.on('loaded', () => setIsLoading(false));
//           viewReport.on('error', (e: any) => {
//             setEmbedError(e?.detail?.message ?? 'Report failed to load');
//             setIsLoading(false);
//           });
//         } else {
//           setEmbedError(event?.detail?.message ?? 'Report failed to load');
//           setIsLoading(false);
//         }
//       });

//     } catch (err: any) {
//       console.error('[PowerBIReport] SDK error:', err);
//       setEmbedError(err.message ?? 'Failed to initialize Power BI embed');
//       setIsLoading(false);
//     }
//   };

//   // Embed on mount
//   useEffect(() => {
//     if (embedUrl && embedToken && reportId) {
//       embedReport(embedToken);
//     } else {
//       setIsLoading(false);
//     }
//     return () => {
//       if (containerRef.current && (window as any).powerbi) {
//         (window as any).powerbi.reset(containerRef.current);
//       }
//     };
//   }, []);

//   // ── Token refresh ────────────────────────────────────────────────────────
//   const refreshToken = async () => {
//     if (!reportId) return;
//     setRefreshing(true);
//     try {
//       const res = await apiFetch('/powerbi/refresh-embed-token', {
//         method: 'POST',
//         body: JSON.stringify({ workspace_id: workspaceId, report_id: reportId, dataset_id: datasetId }),
//       });
//       if (!res.ok) throw new Error('Token refresh failed');
//       const data = await res.json();
//       const newToken = data.embed_token;
//       setCurrentToken(newToken);

//       // Update token in-place without re-embed if possible
//       if (reportInstanceRef.current?.setAccessToken) {
//         await reportInstanceRef.current.setAccessToken(newToken);
//         console.log('[PowerBIReport] ✓ Token refreshed in-place');
//       } else {
//         await embedReport(newToken);
//       }
//     } catch (err) {
//       console.error('[PowerBIReport] Token refresh failed:', err);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   // Auto-refresh token every 50 minutes
//   useEffect(() => {
//     if (!reportId) return;
//     const interval = setInterval(refreshToken, 50 * 60 * 1000);
//     return () => clearInterval(interval);
//   }, [reportId, currentToken]);

//   const hasEmbed = !!(embedUrl && reportId);

//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       {/* Header */}
//       <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between shrink-0">
//         <div className="flex items-center gap-3">
//           {/* <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
//             <BarChart3 className="w-5 h-5 text-primary" />
//           </div>
//           <div>
//             <h1 className="text-lg font-bold text-foreground">Power BI Report</h1>
//             {workspaceName && <p className="text-xs text-muted-foreground">{workspaceName}</p>}
//           </div> */}
//            <div className="flex items-center gap-3 md:gap-4">
//           <a href="/" className="flex-shrink-0">
//             <img
//               src="/logo2.png"
//               alt="Veriton"
//               className="
//                 h-10 sm:h-10 md:h-9 lg:h-10 w-auto object-contain
//                 drop-shadow-[0_4px_16px_rgba(99,102,241,0.7)]
//                 transition-transform duration-200 hover:scale-105
//               "
//             />
//           </a>

//           <div className="flex flex-col">
//             <p className="text-sm md:text-base text-muted-foreground">
//               Welcome, <span className="text-primary font-medium">{userName}</span>
//             </p>
           
//           </div>
//         </div>

//         </div>
//         <div className="flex items-center gap-2">
//           {editUrl && (
//             <Button variant="outline" size="sm" className="gap-2 rounded-full"
//               onClick={() => window.open(editUrl, '_blank')}>
//               <ExternalLink className="w-3.5 h-3.5" />
//               Open in Power BI
//             </Button>
//           )}
//           {reportId && (
//             <Button variant="outline" size="sm" className="gap-2 rounded-full"
//               onClick={refreshToken} disabled={refreshing}>
//               <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
//               Refresh
//             </Button>
//           )}

//            {/* <ThemeToggle /> */}
//           <button onClick={onBack}
//             className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors ml-2">
//             <ArrowLeft className="w-4 h-4" /> Back
//           </button>
//         </div>
//       </div>

//       {/* Embed area */}
//       <div className="flex-1 relative" style={{ height: 'calc(100vh - 65px)' }}>

//         {/* Loading overlay */}
//         {isLoading && (
//           <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background">
//             <Loader2 className="w-10 h-10 animate-spin text-primary" />
//             <p className="text-sm text-muted-foreground">Loading your Power BI report...</p>
//             <p className="text-xs text-muted-foreground opacity-60">Opening in edit mode</p>
//           </div>
//         )}

//         {/* Error state */}
//         {embedError && !isLoading && (
//           <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background">
//             <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
//               <BarChart3 className="w-8 h-8 text-destructive" />
//             </div>
//             <p className="text-base font-semibold text-foreground">Could not embed report</p>
//             <p className="text-sm text-muted-foreground max-w-sm text-center">{embedError}</p>
//             <div className="flex gap-3 mt-2">
//               {editUrl && (
//                 <Button onClick={() => window.open(editUrl, '_blank')}
//                   className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
//                   <ExternalLink className="w-4 h-4" />
//                   Open in Power BI
//                 </Button>
//               )}
//               <Button variant="outline" onClick={() => embedReport(currentToken)} className="rounded-full">
//                 Retry
//               </Button>
//             </div>
//           </div>
//         )}

//         {/* Power BI embed container — SDK renders into this div */}
//         {hasEmbed ? (
//           <div
//             ref={containerRef}
//             className="w-full"
//             style={{ height: 'calc(100vh - 65px)' }}
//           />
//         ) : (
//           <div className="flex flex-col items-center justify-center gap-6 p-8 h-full">
//             <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
//               <BarChart3 className="w-10 h-10 text-primary" />
//             </div>
//             <div className="text-center space-y-2">
//               <h2 className="text-xl font-bold text-foreground">Report Ready</h2>
//               <p className="text-sm text-muted-foreground max-w-sm">
//                 Your report <span className="font-semibold text-foreground">"{workspaceName}"</span> has been
//                 successfully migrated to Power BI.
//               </p>
//             </div>
//             {editUrl && (
//               <Button onClick={() => window.open(editUrl, '_blank')}
//                 className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-11">
//                 <ExternalLink className="w-4 h-4" />
//                 Open in Power BI
//               </Button>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, BarChart3, Loader2, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const API_BASE = 'https://api.veriton.ai/api/service4';
async function apiFetch(path: string, options: RequestInit = {}) {
  return fetch(`${API_BASE}${path}`, {
    ...options, credentials: 'include',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', ...(options.headers as any) },
  });
}

// Load powerbi-client SDK from CDN once globally
function loadPBIScript(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).powerbi) { resolve(); return; }
    const existing = document.getElementById('powerbi-sdk');
    if (existing) { existing.addEventListener('load', () => resolve()); return; }
    const script = document.createElement('script');
    script.id = 'powerbi-sdk';
    script.src = 'https://cdn.jsdelivr.net/npm/powerbi-client@2.23.1/dist/powerbi.min.js';
    script.onload = () => resolve();
    document.head.appendChild(script);
  });
}

interface PowerBIReportProps {
  workspaceName: string;
  onBack: () => void;
  embedUrl?: string;
  embedToken?: string;
  editUrl?: string;
  reportId?: string;
  workspaceId?: string;
  datasetId?: string;
}

export function PowerBIReport({
  workspaceName,
  onBack,
  embedUrl,
  embedToken,
  editUrl,
  reportId,
  workspaceId,
  datasetId,
}: PowerBIReportProps) {
  const containerRef                = useRef<HTMLDivElement>(null);
  const reportInstanceRef           = useRef<any>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [embedError, setEmbedError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentToken, setCurrentToken] = useState(embedToken ?? '');

  // ── Embed using powerbi-client SDK ──────────────────────────────────────
  const embedReport = async (token: string) => {
    if (!embedUrl || !reportId || !containerRef.current) return;

    setIsLoading(true);
    setEmbedError(null);

    try {
      await loadPBIScript();
      const pbi = (window as any).powerbi;
      if (!pbi) throw new Error('Power BI SDK failed to load');

      // Reset any previous embed in this container
      pbi.reset(containerRef.current);

      const config = {
        type: 'report',
        id: reportId,
        embedUrl: embedUrl,
        accessToken: token,
        tokenType: 1,  // 1 = Embed token (not AAD)
        viewMode: 1,   // 1 = Edit, 0 = View
        permissions: 7, // Read | Create | Copy | Write | Delete
        settings: {
          panes: {
            filters: { expanded: false, visible: true },
            pageNavigation: { visible: true },
          },
          bars: {
            actionBar: { visible: true },
          },
        },
      };

      const report = pbi.embed(containerRef.current, config);
      reportInstanceRef.current = report;

      report.on('loaded', () => {
        console.log('[PowerBIReport] ✓ Report loaded in edit mode');
        setIsLoading(false);
      });

      report.on('rendered', () => {
        setIsLoading(false);
      });

      report.on('error', (event: any) => {
        console.error('[PowerBIReport] Embed error:', event?.detail);
        // If edit mode fails, retry in view mode automatically
        if (config.viewMode === 1) {
          console.log('[PowerBIReport] Edit mode failed, retrying in view mode...');
          pbi.reset(containerRef.current);
          const viewConfig = { ...config, viewMode: 0, permissions: 1 };
          const viewReport = pbi.embed(containerRef.current, viewConfig);
          reportInstanceRef.current = viewReport;
          viewReport.on('loaded', () => setIsLoading(false));
          viewReport.on('error', (e: any) => {
            setEmbedError(e?.detail?.message ?? 'Report failed to load');
            setIsLoading(false);
          });
        } else {
          setEmbedError(event?.detail?.message ?? 'Report failed to load');
          setIsLoading(false);
        }
      });

    } catch (err: any) {
      console.error('[PowerBIReport] SDK error:', err);
      setEmbedError(err.message ?? 'Failed to initialize Power BI embed');
      setIsLoading(false);
    }
  };

  // Embed on mount
  useEffect(() => {
    if (embedUrl && embedToken && reportId) {
      embedReport(embedToken);
    } else {
      setIsLoading(false);
    }
    return () => {
      if (containerRef.current && (window as any).powerbi) {
        (window as any).powerbi.reset(containerRef.current);
      }
    };
  }, []);

  // ── Token refresh ────────────────────────────────────────────────────────
  const refreshToken = async () => {
    if (!reportId) return;
    setRefreshing(true);
    try {
      const res = await apiFetch('/powerbi/refresh-embed-token', {
        method: 'POST',
        body: JSON.stringify({ workspace_id: workspaceId, report_id: reportId, dataset_id: datasetId }),
      });
      if (!res.ok) throw new Error('Token refresh failed');
      const data = await res.json();
      const newToken = data.embed_token;
      setCurrentToken(newToken);

      // Update token in-place without re-embed if possible
      if (reportInstanceRef.current?.setAccessToken) {
        await reportInstanceRef.current.setAccessToken(newToken);
        console.log('[PowerBIReport] ✓ Token refreshed in-place');
      } else {
        await embedReport(newToken);
      }
    } catch (err) {
      console.error('[PowerBIReport] Token refresh failed:', err);
    } finally {
      setRefreshing(false);
    }
  };

  // Auto-refresh token every 50 minutes
  useEffect(() => {
    if (!reportId) return;
    const interval = setInterval(refreshToken, 50 * 60 * 1000);
    return () => clearInterval(interval);
  }, [reportId, currentToken]);

  const hasEmbed = !!(embedUrl && reportId);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Power BI Report</h1>
            {workspaceName && <p className="text-xs text-muted-foreground">{workspaceName}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editUrl && (
            <Button variant="outline" size="sm" className="gap-2 rounded-full"
              onClick={() => window.open(editUrl, '_blank')}>
              <ExternalLink className="w-3.5 h-3.5" />
              Open in Power BI
            </Button>
          )}
          {reportId && (
            <Button variant="outline" size="sm" className="gap-2 rounded-full"
              onClick={refreshToken} disabled={refreshing}>
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          )}
          <button onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors ml-2">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      {/* Embed area */}
      <div className="flex-1 relative" style={{ height: 'calc(100vh - 65px)' }}>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading your Power BI report...</p>
            <p className="text-xs text-muted-foreground opacity-60">Opening in edit mode</p>
          </div>
        )}

        {/* Error state */}
        {embedError && !isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-background">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <BarChart3 className="w-8 h-8 text-destructive" />
            </div>
            <p className="text-base font-semibold text-foreground">Could not embed report</p>
            <p className="text-sm text-muted-foreground max-w-sm text-center">{embedError}</p>
            <div className="flex gap-3 mt-2">
              {editUrl && (
                <Button onClick={() => window.open(editUrl, '_blank')}
                  className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
                  <ExternalLink className="w-4 h-4" />
                  Open in Power BI
                </Button>
              )}
              <Button variant="outline" onClick={() => embedReport(currentToken)} className="rounded-full">
                Retry
              </Button>
            </div>
          </div>
        )}

        {/* Power BI embed container — SDK renders into this div */}
        {hasEmbed ? (
          <div
            ref={containerRef}
            className="w-full"
            style={{ height: 'calc(100vh - 65px)' }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-6 p-8 h-full">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-10 h-10 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-bold text-foreground">Report Ready</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Your report <span className="font-semibold text-foreground">"{workspaceName}"</span> has been
                successfully migrated to Power BI.
              </p>
            </div>
            {editUrl && (
              <Button onClick={() => window.open(editUrl, '_blank')}
                className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 h-11">
                <ExternalLink className="w-4 h-4" />
                Open in Power BI
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}