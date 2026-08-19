import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Database, Cpu, GitCompare, TestTube2 } from 'lucide-react';
// import { useAuth } from '@/contexts/AuthContext';
// import { useJobs } from '@/contexts/JobsContext';
import { useAuth } from '@/components/contexts/AuthContext';
import { useJobs } from '@/components/contexts/JobsContext';
// import Header from '@/components/layout/Header';
import Header from '@/components/layout/Header';
// import Chatbot from '@/components/chatbot/Chatbot';
import Chatbot from '@/components/chatbot/Chatbot';
// import DataSourceTab from '@/components/create-job/DataSourceTab';
import DataSourceTab from '@/components/create-job/DataSourceTab';
// import BuildModelTab from '@/components/create-job/BuildModelTab';
import BuildModelTab from '@/components/create-job/BuildModelTab';
// import CompareTab from '@/components/create-job/CompareTab';
import CompareTab from '@/components/create-job/CompareTab';
// import TestTab from '@/components/create-job/TestTab';
import TestTab from '@/components/create-job/TestTab';
// import { ImportedDataset } from '@/components/modals/UnifiedImportModal';
import { ImportedDataset } from '@/components/modals/UnifiedImportModal';

type PipelineStep = 'data-source' | 'build-model' | 'compare' | 'test';

const pipelineSteps: { id: PipelineStep; label: string; icon: React.ElementType }[] = [
  { id: 'data-source', label: 'Data Source', icon: Database },
  { id: 'build-model', label: 'Build a Model', icon: Cpu },
  { id: 'compare', label: 'Compare', icon: GitCompare },
  { id: 'test', label: 'Test', icon: TestTube2 }
];

const CreateJob = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const { addJob } = useJobs();
  
  const initialTab = (location.state as any)?.initialTab || 'data-source';
  const passedJobName = (location.state as any)?.jobName || '';
  const targetTab = (location.state as any)?.targetTab || null;
  
  const [activeStep, setActiveStep] = useState<PipelineStep>(initialTab);
  const [selectedDataset, setSelectedDataset] = useState<ImportedDataset | null>(null);
  const [jobName, setJobName] = useState(passedJobName);
  const [pendingTargetTab, setPendingTargetTab] = useState<PipelineStep | null>(targetTab);

  useEffect(() => {
    if (initialTab) {
      setActiveStep(initialTab);
    }
    if (passedJobName) {
      setJobName(passedJobName);
    }
    if (targetTab) {
      setPendingTargetTab(targetTab);
    }
  }, [initialTab, passedJobName, targetTab]);

  if (!isAuthenticated) {
    navigate('/auth');
    return null;
  }

  const handleDatasetImported = (dataset: ImportedDataset) => {
    setSelectedDataset(dataset);
    if (!jobName) {
      setJobName(dataset.name.replace(/\.[^/.]+$/, ''));
    }
  };

const handleNext = () => {
  if (activeStep === 'data-source' && selectedDataset) {
    if (pendingTargetTab) {
      setActiveStep(pendingTargetTab);
      setPendingTargetTab(null);
    } else {
      // Navigate to build-model and pass the dataset
      navigate('/workflow/automl/build-model', {
        state: { 
          dataset: selectedDataset,
          jobName: jobName
        }
      });
    }
  }
};

  const handleBuildComplete = (jobData: { feature: string; model: string; features: string[] }) => {
    // Create the job
    addJob({
      id: Date.now().toString(),
      name: jobName || selectedDataset?.name || 'Untitled Job',
      category: jobData.feature,
      createdAt: new Date(),
      lastRun: new Date(),
      status: 'completed',
      feature: jobData.feature,
      model: jobData.model,
      features: jobData.features,
      datasetName: selectedDataset?.name || '',
      trainAccuracy: (92 + Math.random() * 6).toFixed(1) + '%',
      testAccuracy: (88 + Math.random() * 8).toFixed(1) + '%'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Main Content - No Sidebar */}
      <main className="pt-14 min-h-[calc(100vh-56px)]">
        <motion.div
          key={activeStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          {activeStep === 'data-source' && (
            <DataSourceTab 
              onDatasetImported={handleDatasetImported}
              selectedDataset={selectedDataset}
              onNext={handleNext}
             onBackToJobs={() => navigate('/workflow/automl')}
              targetTab={pendingTargetTab}
            />
          )}
          
         {activeStep === 'build-model' && (
  <BuildModelTab />
)}
          
          {activeStep === 'compare' && (
            <CompareTab 
              dataset={selectedDataset} 
            />
          )}
          
          {activeStep === 'test' && (
            <TestTab onBackToJobs={() => navigate('/jobs')} />
          )}
        </motion.div>
      </main>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
};

export default CreateJob;


