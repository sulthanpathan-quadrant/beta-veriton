// import { useState, useEffect } from 'react';
// import { DatasetSidebar } from '@/components/dashboard/DatasetSidebar';
// import { AnalysisPanel } from '@/components/dashboard/AnalysisPanel';
// import { ChatbotInterface } from '@/components/dashboard/ChatbotInterface';
// import { DashboardView } from '@/components/dashboard/DashboardView';
// import { DataFile, KPI } from '@/components/types/dashboard';
// import { BarChart3 } from 'lucide-react';
// import { toast } from 'sonner';
// import { Button } from "@/components/ui/button";
// import { useNavigate } from 'react-router-dom';
// import { ArrowLeft, X } from "lucide-react";
// import { DashBoardPreview1 } from '@/components/dashboard/DashBoardPreview1';
// // import { Workflowheader } from '@/components/Workflowheader1';
// import { Workflowheader } from '@/components/WorkFlowHeader1';
 
// type ViewMode = 'analysis' | 'chatbot' | 'dashboard';
 
// const PowerBIDashboard = () => {
//   const [files, setFiles] = useState<DataFile[]>([]);
//   const [selectedFile, setSelectedFile] = useState<DataFile | null>(null);
//   const [dashboardData, setDashboardData] = useState<any>(null);
//   const [currentQuery, setCurrentQuery] = useState('');
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [viewMode, setViewMode] = useState<ViewMode>('analysis');
//   const [loadingFiles, setLoadingFiles] = useState(true);
//   const [filesLoaded, setFilesLoaded] = useState(false);
 
//   const navigate = useNavigate();
 
//   // Reusable X close button for all toasts (Sonner style)
//   const closeToastButton = (
//     <button
//       onClick={() => toast.dismiss()}
//       className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
//       aria-label="Close toast"
//     >
//       <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
//     </button>
//   );
 
//   // Fetch datasets
//   useEffect(() => {
//     const fetchDatasets = async () => {
//       try {
//         const userData = localStorage.getItem("user");
//         const jobId = localStorage.getItem("current_job_id");
 
//         if (!userData || !jobId) {
//           toast.error("User or Job ID not found. Please log in again.", {
//             action: closeToastButton,
//           });
//           setLoadingFiles(false);
//           return;
//         }
 
//         const userId = JSON.parse(userData).id;
 
//         setLoadingFiles(true);
//         const response = await fetch(
//           `https://api.veriton.ai/api/service2/list-datasets?user_id=${userId}&job_id=${jobId}`
//         );
 
//         if (!response.ok) throw new Error(`HTTP ${response.status}`);
 
//         const data = await response.json();
 
//         const fetchedFiles: DataFile[] = data.datasets.map((dataset: any, index: number) => {
//           const isCsv = dataset.filename.toLowerCase().endsWith('.csv');
//           const isExcel = dataset.filename.toLowerCase().endsWith('.xlsx') || dataset.filename.toLowerCase().endsWith('.xls');
 
//           return {
//             id: `file-${index}-${dataset.filename}`,
//             name: dataset.filename,
//             type: isCsv ? 'csv' : isExcel ? 'excel' : 'json',
//             rows: 0,
//             columns: 0,
//             dateModified: dataset.date_modified || new Date().toLocaleString(),
//             csvBlob: `${userId}/${jobId}/${dataset.filename}`,
//           };
//         });
 
//         setFiles(fetchedFiles);
//         setFilesLoaded(true);
 
//         // Restore selected file after files are loaded
//         const savedSelectedFileId = sessionStorage.getItem('powerbi_selected_file_id');
//         if (savedSelectedFileId) {
//           const fileToRestore = fetchedFiles.find(f => f.id === savedSelectedFileId);
//           if (fileToRestore) {
//             setSelectedFile(fileToRestore);
//           }
//         }
//       } catch (err) {
//         console.error("Failed to load datasets:", err);
//         toast.error("Failed to load datasets.", {
//           action: closeToastButton,
//         });
//         setFiles([]);
//         setFilesLoaded(true);
//       } finally {
//         setLoadingFiles(false);
//       }
//     };
 
//     fetchDatasets();
//   }, []);
 
//   // Save selectedFile ID to sessionStorage whenever it changes
//   useEffect(() => {
//     if (!filesLoaded) return; // Don't save until files are loaded
   
//     if (selectedFile) {
//       sessionStorage.setItem('powerbi_selected_file_id', selectedFile.id);
//     } else {
//       sessionStorage.removeItem('powerbi_selected_file_id');
//     }
//   }, [selectedFile, filesLoaded]);
 
//   const handleFileSelect = (file: DataFile) => {
//     // If clicking the same file, deselect it and clear state
//     if (selectedFile?.id === file.id) {
//       setSelectedFile(null);
//       setViewMode('analysis');
     
//       // Clear the session storage for this file
//       sessionStorage.removeItem(`analysis_panel_state_${file.id}`);
//       sessionStorage.removeItem('powerbi_selected_file_id');
     
//       toast.info(`Deselected: ${file.name}`, {
//         action: closeToastButton,
//       });
//     } else {
//       // Selecting a new file
//       setSelectedFile(file);
//       setViewMode('analysis');
     
//       toast.success(`Selected: ${file.name}`, {
//         action: closeToastButton,
//       });
//     }
//   };
 
//   const handleBuildWithRecommendations = (data: any) => {
//     if (!selectedFile) return;
   
//     setDashboardData(data);
//     setCurrentQuery(`Recommended Dashboard: ${data.kpis.map((k: KPI) => k.label).join(', ')}`);
//     setViewMode('dashboard');
   
//     toast.success('Dashboard generated!', {
//       action: closeToastButton,
//     });
//   };
 
//   const handleBuildCustomDashboard = () => {
//     setViewMode('chatbot');
//   };
 
//   const handleBackFromChatbot = () => {
//     setViewMode('analysis');
//   };
 
//   const handleBackFromDashboard = () => {
//     setDashboardData(null);
//     setCurrentQuery('');
//     setViewMode('analysis');
//   };
 
//   // Custom prompt dashboard generation
//   const handleCustomGenerate = (dashboardData: any, query: string) => {
//     if (!selectedFile) {
//       toast.error("No file selected", {
//         action: closeToastButton,
//       });
//       return;
//     }
 
//     // Store the dashboard data and query
//     setDashboardData(dashboardData);
//     setCurrentQuery(query);
   
//     // Navigate to dashboard view
//     setViewMode('dashboard');
   
//     toast.success('Dashboard generated successfully!', {
//       action: closeToastButton,
//     });
//   };
 
//   if (viewMode === 'dashboard' && dashboardData && selectedFile) {
//     const isCustomDashboard = !dashboardData.kpis;
   
//     if (isCustomDashboard) {
//       return (
//         <DashBoardPreview1
//           dashboardData={dashboardData}
//           file={selectedFile}
//           query={currentQuery}
//           onBack={handleBackFromDashboard}
//         />
//       );
//     }
   
//     return (
//       <DashboardView
//         data={dashboardData}
//         file={selectedFile}
//         query={currentQuery}
//         onBack={handleBackFromDashboard}
//       />
//     );
//   }
 
//   return (
    
//     <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
//       <Workflowheader/>
//       {/* <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm shrink-0">
//         <div className="px-6 py-4">
//           <div className="flex justify-between items-center gap-4 animate-fade-in">
//             <div className='flex gap-4'>
//               <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
//                 <BarChart3 className="w-6 h-6 text-primary" />
//               </div>
//               <div>
//                 <h1 className="text-xl font-bold text-foreground tracking-tight">
//                   Power BI Dashboard Generator
//                 </h1>
//                 <p className="text-xs text-muted-foreground">
//                   Select dataset → Analyze → Build with AI recommendations or create your own
//                 </p>
//               </div>
//             </div>
//             <div>
//               <Button variant="outline" onClick={() => navigate("/workflow/path-selection")}>
//                 <ArrowLeft className="h-4 w-4 mr-2" />
//                 Back to path selection
//               </Button>
//             </div>
//           </div>
//         </div>
//       </div> */}
 
//       <div className="flex-1 flex overflow-hidden">
//         <DatasetSidebar
//           files={files}
//           selectedFile={selectedFile}
//           onSelectFile={handleFileSelect}
//           loading={loadingFiles}
//         />
 
//         {viewMode === 'chatbot' && selectedFile ? (
//           <ChatbotInterface
//             file={selectedFile}
//             onGenerateDashboard={handleCustomGenerate}
//             onBack={handleBackFromChatbot}
//             isLoading={isGenerating}
//           />
//         ) : (
//           <AnalysisPanel
//             file={selectedFile}
//             onBuildWithRecommendations={handleBuildWithRecommendations}
//             onBuildCustomDashboard={handleBuildCustomDashboard}
//             isLoading={isGenerating}
//           />
//         )}
//       </div>
 
//       {isGenerating && (
//         <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
//           <div className="flex flex-col items-center justify-center animate-fade-in">
//             <div className="relative">
//               <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
//               <div className="absolute inset-0 flex items-center justify-center">
//                 <BarChart3 className="w-8 h-8 text-primary" />
//               </div>
//             </div>
//             <p className="mt-6 text-lg font-medium text-foreground">Generating your dashboard...</p>
//             <p className="text-sm text-muted-foreground mt-2">Analyzing data and creating visualizations</p>
//           </div>
//         </div>
//       )}
 
//     </div>
//   );
// };
 
// export default PowerBIDashboard;
 

import { useState, useEffect } from 'react';
import { DatasetSidebar } from '@/components/dashboard/DatasetSidebar';
import { AnalysisPanel } from '@/components/dashboard/AnalysisPanel';
import { ChatbotInterface } from '@/components/dashboard/ChatbotInterface';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { DataFile, KPI } from '@/components/types/dashboard';
import { BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from "lucide-react";
import { DashBoardPreview1 } from '@/components/dashboard/DashBoardPreview1';
// import { Workflowheader } from '@/components/Workflowheader1';
import { Workflowheader } from '@/components/WorkFlowHeader1';
 
type ViewMode = 'analysis' | 'chatbot' | 'dashboard';

// ── NEW: Databricks-platform "list datasets" response shape ─────────────
interface DatabricksDataset {
  file_name: string;
  file_size: number;
  last_modified: string; // ISO timestamp
  rows?: number;
  num_columns?: number;
}

interface DatabricksListDatasetsResponse {
  user_id: string;
  job_id: string;
  datasets: DatabricksDataset[];
}

/**
 * Reads the "user" object from localStorage and returns true if the user's
 * dataplatform is "Databricks". Same check used across the other workflow
 * pages (Data Quality / NER / Business Logic / ETL Output).
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

const databricksListDatasetsUrl = (userId: string, jobId: string) =>
  `https://api.veriton.ai/api/service-databricks/list-datasets?user_id=${userId}&job_id=${jobId}`;
 
const PowerBIDashboard = () => {
  const [files, setFiles] = useState<DataFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<DataFile | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('analysis');
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [filesLoaded, setFilesLoaded] = useState(false);
 
  const navigate = useNavigate();
 
  // Reusable X close button for all toasts (Sonner style)
  const closeToastButton = (
    <button
      onClick={() => toast.dismiss()}
      className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
      aria-label="Close toast"
    >
      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
    </button>
  );
 
  // Fetch datasets
  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const userData = localStorage.getItem("user");
        const jobId = localStorage.getItem("current_job_id");
 
        if (!userData || !jobId) {
          toast.error("User or Job ID not found. Please log in again.", {
            action: closeToastButton,
          });
          setLoadingFiles(false);
          return;
        }
 
        const userId = JSON.parse(userData).id;
 
        setLoadingFiles(true);

        let fetchedFiles: DataFile[] = [];

        if (isDatabricksUser()) {
          // ── NEW: Databricks datasets fetch via /list-datasets ─────────
          const response = await fetch(databricksListDatasetsUrl(userId, jobId));

          if (!response.ok) throw new Error(`HTTP ${response.status}`);

          const data: DatabricksListDatasetsResponse = await response.json();

          fetchedFiles = (data.datasets || []).map((dataset, index) => {
            const isCsv = dataset.file_name.toLowerCase().endsWith('.csv');
            const isExcel =
              dataset.file_name.toLowerCase().endsWith('.xlsx') ||
              dataset.file_name.toLowerCase().endsWith('.xls');

            return {
              id: `file-${index}-${dataset.file_name}`,
              name: dataset.file_name,
              type: isCsv ? 'csv' : isExcel ? 'excel' : 'json',
              rows: dataset.rows ?? 0,
              columns: dataset.num_columns ?? 0,
              dateModified: dataset.last_modified || new Date().toLocaleString(),
              csvBlob: `${userId}/${jobId}/${dataset.file_name}`,
            };
          });
        } else {
          // ── Existing default (non-Databricks) datasets fetch — unchanged ──
          const response = await fetch(
            `https://api.veriton.ai/api/service2/list-datasets?user_id=${userId}&job_id=${jobId}`
          );
 
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
 
          const data = await response.json();
 
          fetchedFiles = data.datasets.map((dataset: any, index: number) => {
            const isCsv = dataset.filename.toLowerCase().endsWith('.csv');
            const isExcel = dataset.filename.toLowerCase().endsWith('.xlsx') || dataset.filename.toLowerCase().endsWith('.xls');
 
            return {
              id: `file-${index}-${dataset.filename}`,
              name: dataset.filename,
              type: isCsv ? 'csv' : isExcel ? 'excel' : 'json',
              rows: 0,
              columns: 0,
              dateModified: dataset.date_modified || new Date().toLocaleString(),
              csvBlob: `${userId}/${jobId}/${dataset.filename}`,
            };
          });
        }
 
        setFiles(fetchedFiles);
        setFilesLoaded(true);
 
        // Restore selected file after files are loaded
        const savedSelectedFileId = sessionStorage.getItem('powerbi_selected_file_id');
        if (savedSelectedFileId) {
          const fileToRestore = fetchedFiles.find(f => f.id === savedSelectedFileId);
          if (fileToRestore) {
            setSelectedFile(fileToRestore);
          }
        }
      } catch (err) {
        console.error("Failed to load datasets:", err);
        toast.error("Failed to load datasets.", {
          action: closeToastButton,
        });
        setFiles([]);
        setFilesLoaded(true);
      } finally {
        setLoadingFiles(false);
      }
    };
 
    fetchDatasets();
  }, []);
 
  // Save selectedFile ID to sessionStorage whenever it changes
  useEffect(() => {
    if (!filesLoaded) return; // Don't save until files are loaded
   
    if (selectedFile) {
      sessionStorage.setItem('powerbi_selected_file_id', selectedFile.id);
    } else {
      sessionStorage.removeItem('powerbi_selected_file_id');
    }
  }, [selectedFile, filesLoaded]);
 
  const handleFileSelect = (file: DataFile) => {
    // If clicking the same file, deselect it and clear state
    if (selectedFile?.id === file.id) {
      setSelectedFile(null);
      setViewMode('analysis');
     
      // Clear the session storage for this file
      sessionStorage.removeItem(`analysis_panel_state_${file.id}`);
      sessionStorage.removeItem('powerbi_selected_file_id');
     
      toast.info(`Deselected: ${file.name}`, {
        action: closeToastButton,
      });
    } else {
      // Selecting a new file
      setSelectedFile(file);
      setViewMode('analysis');
     
      toast.success(`Selected: ${file.name}`, {
        action: closeToastButton,
      });
    }
  };
 
  const handleBuildWithRecommendations = (data: any) => {
    if (!selectedFile) return;
   
    setDashboardData(data);
    setCurrentQuery(`Recommended Dashboard: ${data.kpis.map((k: KPI) => k.label).join(', ')}`);
    setViewMode('dashboard');
   
    toast.success('Dashboard generated!', {
      action: closeToastButton,
    });
  };
 
  const handleBuildCustomDashboard = () => {
    setViewMode('chatbot');
  };
 
  const handleBackFromChatbot = () => {
    setViewMode('analysis');
  };
 
  const handleBackFromDashboard = () => {
    setDashboardData(null);
    setCurrentQuery('');
    setViewMode('analysis');
  };
 
  // Custom prompt dashboard generation
  const handleCustomGenerate = (dashboardData: any, query: string) => {
    if (!selectedFile) {
      toast.error("No file selected", {
        action: closeToastButton,
      });
      return;
    }
 
    // Store the dashboard data and query
    setDashboardData(dashboardData);
    setCurrentQuery(query);
   
    // Navigate to dashboard view
    setViewMode('dashboard');
   
    toast.success('Dashboard generated successfully!', {
      action: closeToastButton,
    });
  };
 
  if (viewMode === 'dashboard' && dashboardData && selectedFile) {
    const isCustomDashboard = !dashboardData.kpis;
   
    if (isCustomDashboard) {
      return (
        <DashBoardPreview1
          dashboardData={dashboardData}
          file={selectedFile}
          query={currentQuery}
          onBack={handleBackFromDashboard}
        />
      );
    }
   
    return (
      <DashboardView
        data={dashboardData}
        file={selectedFile}
        query={currentQuery}
        onBack={handleBackFromDashboard}
      />
    );
  }
 
  return (
    
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
      <Workflowheader/>
      {/* <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm shrink-0">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center gap-4 animate-fade-in">
            <div className='flex gap-4'>
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                <BarChart3 className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground tracking-tight">
                  Power BI Dashboard Generator
                </h1>
                <p className="text-xs text-muted-foreground">
                  Select dataset → Analyze → Build with AI recommendations or create your own
                </p>
              </div>
            </div>
            <div>
              <Button variant="outline" onClick={() => navigate("/workflow/path-selection")}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to path selection
              </Button>
            </div>
          </div>
        </div>
      </div> */}
 
      <div className="flex-1 flex overflow-hidden">
        <DatasetSidebar
          files={files}
          selectedFile={selectedFile}
          onSelectFile={handleFileSelect}
          loading={loadingFiles}
        />
 
        {viewMode === 'chatbot' && selectedFile ? (
          <ChatbotInterface
            file={selectedFile}
            onGenerateDashboard={handleCustomGenerate}
            onBack={handleBackFromChatbot}
            isLoading={isGenerating}
          />
        ) : (
          <AnalysisPanel
            file={selectedFile}
            onBuildWithRecommendations={handleBuildWithRecommendations}
            onBuildCustomDashboard={handleBuildCustomDashboard}
            isLoading={isGenerating}
          />
        )}
      </div>
 
      {isGenerating && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="flex flex-col items-center justify-center animate-fade-in">
            <div className="relative">
              <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </div>
            <p className="mt-6 text-lg font-medium text-foreground">Generating your dashboard...</p>
            <p className="text-sm text-muted-foreground mt-2">Analyzing data and creating visualizations</p>
          </div>
        </div>
      )}
 
    </div>
  );
};
 
export default PowerBIDashboard;