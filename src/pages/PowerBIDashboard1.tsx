import { useState, useEffect } from 'react';
import { AnalysisPanel } from '@/components/dashboard/AnalysisPanel1';
import { ChatbotInterface as ChatbotInterface1 } from '@/components/dashboard/ChatbotInterface1';
import { DashboardView } from '@/components/dashboard/DashboardView';
import { BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, X } from "lucide-react";
import { DashBoardPreview1 } from '@/components/dashboard/DashBoardPreview1';
import { DataFile } from '@/components/types/dashboard'; // ← import DataFile type
// import { WorkflowHeader } from '@/components/Workflowheader1'; 
// import { Workflowheader } from '@/components/Workflowheader1';
import { Workflowheader } from '@/components/WorkFlowHeader1';

type ViewMode = 'analysis' | 'chatbot' | 'dashboard';
 
const getDashboardContext = () => {
  const userIdRaw = localStorage.getItem("selected_user_id");
  const jobId = localStorage.getItem("selected_job_id");
  const datasetName = localStorage.getItem("selected_dataset_name");
 
  let userId: string | null = null;
  if (userIdRaw) {
    try {
      const parsed = JSON.parse(userIdRaw);
      userId = parsed?.id || userIdRaw;
    } catch {
      userId = userIdRaw;
    }
  }
 
  return {
    userId,
    jobId,
    datasetName,
    isValid: !!(userId && jobId && datasetName),
  };
};
 
const PowerBIDashboard1 = () => {
  const [selectedDatasetName, setSelectedDatasetName] = useState<string>("");
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [currentQuery, setCurrentQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('analysis');
 
  const navigate = useNavigate();
 
  const closeToastButton = (
    <button
      onClick={() => toast.dismiss()}
      className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
      aria-label="Close toast"
    >
      <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
    </button>
  );
 
  // Create a minimal DataFile object from localStorage values
  const createDataFile = (name: string): DataFile => ({
    id: `file-${Date.now()}`, // dummy ID
    name,
    columns: 0,               // placeholder (you can fetch real values if needed)
    rows: 0,
    createdAt: new Date().toISOString(),
    type: 'csv',              // assume csv – change if needed
    previewData: {
      headers: [],
      rows: [],
    },
  });
 
  useEffect(() => {
    const { datasetName, isValid } = getDashboardContext();
 
    if (!datasetName || !isValid) {
      toast.error("No dataset or required context selected. Please select again.", {
        action: closeToastButton,
      });
      navigate("/PathSelection1");
      return;
    }
 
    setSelectedDatasetName(datasetName);
    toast.success(`Dataset loaded: ${datasetName}`, {
      action: closeToastButton,
    });
  }, [navigate]);
 
  const handleBuildWithRecommendations = (data: any) => {
    if (!selectedDatasetName) return;
 
    setDashboardData(data);
    setCurrentQuery(`Recommended Dashboard: ${data.kpis?.map((k: any) => k.label).join(', ') || 'Dashboard'}`);
    setViewMode('dashboard');
 
    toast.success('Dashboard generated!', { action: closeToastButton });
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
 
  const handleCustomGenerate = (dashboardData: any, query: string) => {
    if (!selectedDatasetName) {
      toast.error("No dataset selected", { action: closeToastButton });
      return;
    }
 
    setDashboardData(dashboardData);
    setCurrentQuery(query);
    setViewMode('dashboard');
 
    toast.success('Dashboard generated successfully!', { action: closeToastButton });
  };
 
  // Create DataFile object for components that expect it
  const dataFile = createDataFile(selectedDatasetName);
 
  if (viewMode === 'dashboard' && dashboardData && selectedDatasetName) {
    const isCustomDashboard = !dashboardData.kpis;
 
    if (isCustomDashboard) {
      return (
        <DashBoardPreview1
          dashboardData={dashboardData}
          file={dataFile}               // ← now passes DataFile object
          query={currentQuery}
          onBack={handleBackFromDashboard}
        />
      );
    }
 
    return (
      <DashboardView
        data={dashboardData}
        file={dataFile}                 // ← now passes DataFile object
        query={currentQuery}
        onBack={handleBackFromDashboard}
      />
    );
  }
 
  return (
    <div className="min-h-screen h-screen bg-background flex flex-col overflow-hidden">
      <Workflowheader/>
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'chatbot' && selectedDatasetName ? (
          <ChatbotInterface1
            file={selectedDatasetName}           // ← ChatbotInterface1 accepts string
            onGenerateDashboard={handleCustomGenerate}
            onBack={handleBackFromChatbot}
            isLoading={isGenerating}
          />
        ) : (
          <AnalysisPanel
            file={selectedDatasetName}           // ← AnalysisPanel accepts string
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
 
export default PowerBIDashboard1;
 