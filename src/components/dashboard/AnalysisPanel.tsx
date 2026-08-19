// import { useState, useEffect, useRef } from 'react';
// import { DataFile, KPI } from '@/components/types/dashboard';
// import { createThread, attachFileToAgent } from '../api/api';
// import { DashboardPreview } from './DashboardPreview';
// import {
//   BarChart3,
//   TrendingUp,
//   Sparkles,
//   Wand2,
//   MessageSquare,
//   FileText,
//   Table,
//   FileJson,
//   Search,
//   Target,
//   CheckCircle2,
//   XCircle,
//   ChevronRight,
//   Check,
//   Loader2,
//   X,
//   CheckSquare,
//   Square,
// } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { toast } from 'sonner';
// import { useNavigate } from 'react-router-dom';

// interface KPIWithTarget {
//   id: string;
//   name: string;
//   actual: string;
//   target: string;
//   status: 'on-track' | 'at-risk' | 'off-track';
//   percentage: number;
//   metrics: KPI[];
//   measurements: string[];
// }

// interface AnalysisPanelProps {
//   file: DataFile | null;
//   onBuildWithRecommendations: (data: { kpis: KPI[]; visuals: any[]; total_rows: number }) => void;
//   onBuildCustomDashboard: () => void;
//   isLoading: boolean;
// }

// const fileIcons = {
//   csv: FileText,
//   excel: Table,
//   json: FileJson,
// };

// const fileColors = {
//   csv: 'text-emerald-400',
//   excel: 'text-green-400',
//   json: 'text-amber-400',
// };

// type Step = 'select-kpis' | 'select-metrics' | 'confirmation';

// export function AnalysisPanel({
//   file,
//   onBuildWithRecommendations,
//   onBuildCustomDashboard,
//   isLoading,
// }: AnalysisPanelProps) {
//   const [isAnalyzing, setIsAnalyzing] = useState(false);
//   const [kpisWithDetails, setKpisWithDetails] = useState<KPIWithTarget[]>([]);
//   const [selectedKpis, setSelectedKpis] = useState<Set<string>>(new Set());
//   const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set());
//   const [selectedMeasurements, setSelectedMeasurements] = useState<Set<string>>(new Set());
//   const [currentStep, setCurrentStep] = useState<Step>('select-kpis');
//   const [isGeneratingMetrics, setIsGeneratingMetrics] = useState(false);
//   const [isCreatingThread, setIsCreatingThread] = useState(false);
//   const [showDashboard, setShowDashboard] = useState(false);
//   const [dashboardData, setDashboardData] = useState<any>(null);
//   const [queryText, setQueryText] = useState('');
//   const [stateRestored, setStateRestored] = useState(false);
//   const hasInitializedRef = useRef(false);
//   const navigate = useNavigate();

//   const closeToastButton = (
//     <button
//       onClick={() => toast.dismiss()}
//       className="absolute top-2 right-2 rounded-full p-1 hover:bg-muted/50 transition-colors"
//       aria-label="Close toast"
//     >
//       <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
//     </button>
//   );

//   // ── Restore ONLY stage and KPI data from sessionStorage, NOT selections ──
//   useEffect(() => {
//     if (!file || stateRestored) return;
//     const savedState = sessionStorage.getItem(`analysis_panel_state_${file.id}`);
//     if (savedState) {
//       try {
//         const parsedState = JSON.parse(savedState);
//         if (parsedState.kpisWithDetails && parsedState.kpisWithDetails.length > 0) {
//           setKpisWithDetails(parsedState.kpisWithDetails);
//         }
//         if (parsedState.currentStep) {
//           setCurrentStep(parsedState.currentStep);
//         }
//         hasInitializedRef.current = true;
//       } catch (error) {
//         console.error('Error parsing saved analysis state:', error);
//         sessionStorage.removeItem(`analysis_panel_state_${file.id}`);
//       }
//     }
//     setStateRestored(true);
//   }, [file?.id]);

//   // ── Persist stage and KPI data (not selections) ──
//   useEffect(() => {
//     if (!file || !stateRestored) return;
//     sessionStorage.setItem(
//       `analysis_panel_state_${file.id}`,
//       JSON.stringify({ kpisWithDetails, currentStep })
//     );
//   }, [file?.id, kpisWithDetails, currentStep, stateRestored]);

//   const handleBackToChat = () => setShowDashboard(false);

//   // ── Step 1: Discover KPIs ──
//   useEffect(() => {
//     if (!file || !stateRestored) return;
//     if (kpisWithDetails.length > 0 || hasInitializedRef.current) return;

//     const userData = localStorage.getItem('user');
//     const jobId = localStorage.getItem('current_job_id');
//     if (!userData || !jobId) {
//       toast.error('User or Job ID missing', { action: closeToastButton });
//       return;
//     }

//     const userId = JSON.parse(userData).id;
//     const csvBlobPath = `${userId}/${jobId}/${file.name}.csv`;
//     setIsAnalyzing(true);

//     const fetchKPIs = async () => {
//       try {
//         const response = await fetch('https://api.veriton.ai/api/service2/discover_kpis', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ csv_blob: csvBlobPath }),
//         });
//         if (!response.ok) throw new Error('Failed to discover KPIs');

//         const data = await response.json();
//         const apiKpis = data.available_kpis || [];

//         const generatedKPIs: KPIWithTarget[] = apiKpis.map(
//           (item: { kpi_name: string }, index: number) => {
//             const statuses: ('on-track' | 'at-risk' | 'off-track')[] = [
//               'on-track', 'at-risk', 'off-track',
//             ];
//             return {
//               id: `kpi-${index}`,
//               name: item.kpi_name,
//               actual: '—',
//               target: '—',
//               status: statuses[index % 3],
//               percentage: 75 + (index * 8) % 35,
//               metrics: [],
//               measurements: [],
//             };
//           }
//         );

//         setKpisWithDetails(generatedKPIs);
//         setCurrentStep('select-kpis');
//         hasInitializedRef.current = true;
//         toast.success(`${apiKpis.length} KPIs discovered!`, { action: closeToastButton });
//       } catch {
//         toast.error('Failed to load KPIs', { action: closeToastButton });
//         setKpisWithDetails([]);
//       } finally {
//         setIsAnalyzing(false);
//       }
//     };

//     fetchKPIs();
//   }, [file?.id, stateRestored, kpisWithDetails.length]);

//   // ── Reset when file becomes null ──
//   useEffect(() => {
//     if (!file) {
//       setKpisWithDetails([]);
//       setSelectedKpis(new Set());
//       setSelectedMetrics(new Set());
//       setSelectedMeasurements(new Set());
//       setCurrentStep('select-kpis');
//       setIsAnalyzing(false);
//       setShowDashboard(false);
//       setDashboardData(null);
//       setQueryText('');
//       setStateRestored(false);
//       hasInitializedRef.current = false;
//     }
//   }, [file]);

//   // ── Step 2: Compute metrics ──
//   const handleGenerateMetrics = async () => {
//     if (selectedKpis.size === 0) return;
//     setIsGeneratingMetrics(true);

//     const userData = localStorage.getItem('user');
//     const jobId = localStorage.getItem('current_job_id');
//     const userId = userData ? JSON.parse(userData).id : null;

//     if (!userId || !jobId || !file) {
//       toast.error('Missing data', { action: closeToastButton });
//       setIsGeneratingMetrics(false);
//       return;
//     }

//     const csvBlobPath = `${userId}/${jobId}/${file.name}.csv`;
//     const selectedKpiNames = kpisWithDetails
//       .filter(kpi => selectedKpis.has(kpi.id))
//       .map(kpi => kpi.name);

//     try {
//       const response = await fetch('https://api.veriton.ai/api/service2/compute_kpis', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ csv_blob: csvBlobPath, selected_kpi_names: selectedKpiNames }),
//       });
//       if (!response.ok) throw new Error('Failed to compute KPIs');

//       const data = await response.json();
//       const computedKpis = data.selected_kpis || [];

//       const updatedKpis = kpisWithDetails.map(kpi => {
//         if (!selectedKpis.has(kpi.id)) return kpi;
//         const computed = computedKpis.find((c: any) => c.kpi_name === kpi.name);
//         if (!computed) return kpi;
//         return {
//           ...kpi,
//           actual: computed.metrics.toString(),
//           metrics: [
//             {
//               id: `metric-${kpi.id}`,
//               label: `${kpi.name} Value`,
//               value: computed.metrics.toLocaleString(undefined, { maximumFractionDigits: 2 }),
//               change: 0,
//               changeLabel: 'Computed from data',
//             },
//           ],
//           measurements: [computed.measures],
//         };
//       });

//       setKpisWithDetails(updatedKpis);
//       toast.success('Metrics computed!', { action: closeToastButton });
//       setCurrentStep('select-metrics');
//     } catch {
//       toast.error('Failed to compute metrics', { action: closeToastButton });
//     } finally {
//       setIsGeneratingMetrics(false);
//     }
//   };

//   // ── Step 3: Generate full dashboard ──
//   const handleBuildDashboard = async () => {
//     if (!file) return;

//     const userData = localStorage.getItem('user');
//     const jobId = localStorage.getItem('current_job_id');
//     const userId = userData ? JSON.parse(userData).id : null;

//     if (!userId || !jobId) {
//       toast.error('User or Job ID missing', { action: closeToastButton });
//       return;
//     }

//     const csvBlobPath = `${userId}/${jobId}/${file.name}.csv`;
//     const selectedComputedKpis = kpisWithDetails
//       .filter(kpi => selectedKpis.has(kpi.id))
//       .map(kpi => ({
//         kpi_name: kpi.name,
//         measures: kpi.measurements[0] || '',
//         metrics: parseFloat(kpi.actual.replace(/,/g, '')) || 0,
//       }));

//     if (selectedComputedKpis.length === 0) {
//       toast.error('No KPIs selected', { action: closeToastButton });
//       return;
//     }

//     const fallbackKpis: KPI[] = selectedComputedKpis.map((k, i) => ({
//       id: `fallback-${i}`,
//       label: k.kpi_name,
//       value: k.metrics.toLocaleString(),
//       change: 0,
//       changeLabel: 'From your selection',
//     }));

//     try {
//       const response = await fetch('https://api.veriton.ai/api/service2/generate_visuals', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ csv_blob: csvBlobPath, computed_kpis: selectedComputedKpis }),
//       });

//       const visualsData = response.ok
//         ? await response.json()
//         : { visuals: [], total_rows: 0 };

//       sessionStorage.setItem(
//         'pbi_generate_visuals',
//         JSON.stringify({ ...visualsData, file_name: file.name })
//       );

//       let finalKpis =
//         visualsData.visuals
//           ?.filter((v: any) => v.chart_type === 'KPI')
//           ?.map((v: any, i: number) => ({
//             id: `api-kpi-${i}`,
//             label: v.chart_name,
//             value: v.value?.toString() || '—',
//             change: Math.random() * 30 - 10,
//             changeLabel: v.description || 'AI Generated',
//           })) || [];

//       if (finalKpis.length === 0) finalKpis = fallbackKpis;

//       sessionStorage.removeItem(`analysis_panel_state_${file.id}`);

//       onBuildWithRecommendations({
//         kpis: finalKpis,
//         visuals: visualsData.visuals || [],
//         total_rows: visualsData.total_rows || selectedComputedKpis.length,
//       });
//     } catch (err) {
//       console.error('Generate visuals failed:', err);
//       toast.info('Showing your selected KPIs', { action: closeToastButton });
//       onBuildWithRecommendations({
//         kpis: fallbackKpis,
//         visuals: [],
//         total_rows: selectedComputedKpis.length,
//       });
//     }
//   };

//   const handleBuildCustomDashboard = async () => {
//     if (!file) {
//       toast.error('No file selected', { action: closeToastButton });
//       return;
//     }

//     const userData = localStorage.getItem('user');
//     const jobId = localStorage.getItem('current_job_id');
//     const userId = userData ? JSON.parse(userData).id : null;

//     if (!userId || !jobId) {
//       toast.error('User or Job ID missing', { action: closeToastButton });
//       return;
//     }

//     setIsCreatingThread(true);
//     try {
//       const threadResponse = await createThread();
//       localStorage.setItem('thread_id', threadResponse.thread_id);
//       await attachFileToAgent(`${userId}/${jobId}/${file.name}.csv`);
//       onBuildCustomDashboard();
//     } catch (error: any) {
//       console.error('Error in custom dashboard flow:', error);
//       toast.error(error.message || 'Failed to initialize custom dashboard', {
//         action: closeToastButton,
//       });
//     } finally {
//       setIsCreatingThread(false);
//     }
//   };

//   // ── Toggle helpers ────────────────────────────────────────────────────────
//   const toggleKpi = (kpiId: string) => {
//     setSelectedKpis(prev => {
//       const next = new Set(prev);
//       next.has(kpiId) ? next.delete(kpiId) : next.add(kpiId);
//       return next;
//     });
//   };

//   const toggleMetric = (metricId: string) => {
//     setSelectedMetrics(prev => {
//       const next = new Set(prev);
//       next.has(metricId) ? next.delete(metricId) : next.add(metricId);
//       return next;
//     });
//   };

//   const toggleMeasurement = (measurement: string, kpiId: string) => {
//     const uniqueKey = `${kpiId}-${measurement}`;
//     setSelectedMeasurements(prev => {
//       const next = new Set(prev);
//       next.has(uniqueKey) ? next.delete(uniqueKey) : next.add(uniqueKey);
//       return next;
//     });
//   };

//   // ── Select All KPIs (Step 1) ──────────────────────────────────────────────
//   const allKpisSelected =
//     kpisWithDetails.length > 0 && selectedKpis.size === kpisWithDetails.length;

//   const handleSelectAllKpis = () => {
//     if (allKpisSelected) {
//       setSelectedKpis(new Set());
//     } else {
//       setSelectedKpis(new Set(kpisWithDetails.map(k => k.id)));
//     }
//   };

//   // ── Step navigation ───────────────────────────────────────────────────────
//   const handleProceedToConfirmation = () => setCurrentStep('confirmation');

//   const handleBackToKpis = () => {
//     setCurrentStep('select-kpis');
//     setSelectedMetrics(new Set());
//     setSelectedMeasurements(new Set());
//   };

//   const handleBackToMetrics = () => setCurrentStep('select-metrics');

//   // ── Derived data — declared before helpers that depend on it ─────────────
//   const selectedKpisData = kpisWithDetails.filter(kpi => selectedKpis.has(kpi.id));
//   const hasMetricSelection = selectedMetrics.size > 0 || selectedMeasurements.size > 0;

//   // ── Per-KPI card: Select All (both metrics + measurements) ────────────────
//   const handleSelectAllForKpi = (kpi: KPIWithTarget) => {
//     const allMetricIds = kpi.metrics.map(m => m.id);
//     const allMeasurementKeys = kpi.measurements.map(m => `${kpi.id}-${m}`);
//     const allSelected =
//       allMetricIds.every(id => selectedMetrics.has(id)) &&
//       allMeasurementKeys.every(k => selectedMeasurements.has(k));

//     setSelectedMetrics(prev => {
//       const next = new Set(prev);
//       allSelected
//         ? allMetricIds.forEach(id => next.delete(id))
//         : allMetricIds.forEach(id => next.add(id));
//       return next;
//     });
//     setSelectedMeasurements(prev => {
//       const next = new Set(prev);
//       allSelected
//         ? allMeasurementKeys.forEach(k => next.delete(k))
//         : allMeasurementKeys.forEach(k => next.add(k));
//       return next;
//     });
//   };

//   // ── Global Select All: every metric + measurement across all KPI cards ────
//   const handleSelectAllMetricsAndMeasurements = () => {
//     const allMetricIds = selectedKpisData.flatMap(kpi => kpi.metrics.map(m => m.id));
//     const allMeasurementKeys = selectedKpisData.flatMap(kpi =>
//       kpi.measurements.map(m => `${kpi.id}-${m}`)
//     );
//     const allSelected =
//       allMetricIds.every(id => selectedMetrics.has(id)) &&
//       allMeasurementKeys.every(k => selectedMeasurements.has(k));

//     setSelectedMetrics(new Set(allSelected ? [] : allMetricIds));
//     setSelectedMeasurements(new Set(allSelected ? [] : allMeasurementKeys));
//   };

//   const allMetricsAndMeasurementsSelected = (() => {
//     const allMetricIds = selectedKpisData.flatMap(kpi => kpi.metrics.map(m => m.id));
//     const allMeasurementKeys = selectedKpisData.flatMap(kpi =>
//       kpi.measurements.map(m => `${kpi.id}-${m}`)
//     );
//     if (allMetricIds.length === 0 && allMeasurementKeys.length === 0) return false;
//     return (
//       allMetricIds.every(id => selectedMetrics.has(id)) &&
//       allMeasurementKeys.every(k => selectedMeasurements.has(k))
//     );
//   })();

//   // ── Status helpers ────────────────────────────────────────────────────────
//   const getStatusColor = (status: KPIWithTarget['status']) => {
//     switch (status) {
//       case 'on-track': return 'text-emerald-400';
//       case 'at-risk':  return 'text-amber-400';
//       case 'off-track': return 'text-red-400';
//       default: return 'text-muted-foreground';
//     }
//   };

//   const getStatusBg = (status: KPIWithTarget['status']) => {
//     switch (status) {
//       case 'on-track': return 'bg-emerald-400/10 border-emerald-400/30';
//       case 'at-risk':  return 'bg-amber-400/10 border-amber-400/30';
//       case 'off-track': return 'bg-red-400/10 border-red-400/30';
//       default: return 'bg-secondary';
//     }
//   };

//   const getStatusIcon = (status: KPIWithTarget['status']) => {
//     switch (status) {
//       case 'on-track': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
//       case 'at-risk':  return <Target className="w-4 h-4 text-amber-400" />;
//       case 'off-track': return <XCircle className="w-4 h-4 text-red-400" />;
//       default: return null;
//     }
//   };

//   // ── Dashboard preview early-return ────────────────────────────────────────
//   if (showDashboard && dashboardData) {
//     return (
//       <DashboardPreview
//         dashboardData={dashboardData}
//         file={file!}
//         query={queryText}
//         onBack={handleBackToChat}
//       />
//     );
//   }

//   if (!file) {
//     return (
//       <div className="flex-1 flex items-center justify-center">
//         <div className="text-center animate-fade-in">
//           <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary flex items-center justify-center mx-auto mb-6">
//             <BarChart3 className="w-10 h-10 text-primary" />
//           </div>
//           <h2 className="text-xl font-semibold text-foreground mb-2">Select a Dataset</h2>
//           <p className="text-muted-foreground text-sm max-w-sm">
//             Choose a data source from the sidebar to analyze and generate your Power BI dashboard
//           </p>
//         </div>
//       </div>
//     );
//   }

//   // file is DataFile here — use file.type, never file.split()
//   const Icon = fileIcons[file.type as keyof typeof fileIcons] || FileText;
//   const iconColor = fileColors[file.type as keyof typeof fileColors] || 'text-muted-foreground';

//   if (isAnalyzing) {
//     return (
//       <div className="flex-1 flex items-center justify-center">
//         <div className="text-center animate-fade-in">
//           <div className="relative w-20 h-20 mx-auto mb-6">
//             <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
//             <div className="absolute inset-0 flex items-center justify-center">
//               <Search className="w-8 h-8 text-primary" />
//             </div>
//           </div>
//           <h2 className="text-xl font-semibold text-foreground mb-2">Analyzing Dataset</h2>
//           <p className="text-muted-foreground text-sm">
//             Detecting KPIs in{' '}
//             <span className="text-primary font-medium">{file.name}</span>
//           </p>
//         </div>
//       </div>
//     );
//   }

//   if (kpisWithDetails.length === 0 && stateRestored) {
//     return (
//       <div className="flex-1 flex items-center justify-center text-center">
//         <p className="text-muted-foreground">No KPIs discovered for this dataset.</p>
//       </div>
//     );
//   }

//   const StepIndicator = () => (
//     <div className="flex items-center justify-center gap-2 mb-8">
//       {(
//         [
//           { label: 'Select KPIs', step: 'select-kpis' },
//           { label: 'Select Metrics', step: 'select-metrics' },
//           { label: 'Confirm', step: 'confirmation' },
//         ] as { label: string; step: Step }[]
//       ).map((s, i, arr) => (
//         <div key={s.step} className="flex items-center gap-2">
//           <div
//             className={cn(
//               'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
//               currentStep === s.step
//                 ? 'bg-primary text-primary-foreground'
//                 : (currentStep === 'select-metrics' && s.step === 'select-kpis') ||
//                   (currentStep === 'confirmation' && s.step !== 'confirmation')
//                 ? 'bg-primary/20 text-primary'
//                 : 'bg-primary/20 text-muted-foreground'
//             )}
//           >
//             <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center">
//               {i + 1}
//             </span>
//             {s.label}
//           </div>
//           {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
//         </div>
//       ))}
//     </div>
//   );

//   // ── STEP 1: SELECT KPIs ───────────────────────────────────────────────────
//   if (currentStep === 'select-kpis') {
//     return (
//       <div className="flex-1 overflow-auto">
//         <div className="max-w-4xl mx-auto p-6 space-y-6">
//           {/* File header */}
//           <div className="animate-fade-in">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20">
//                 <Icon className={cn('w-5 h-5', iconColor)} />
//               </div>
//               <div>
//                 <h2 className="text-lg font-semibold text-foreground">{file.name}</h2>
//                 <p className="text-xs text-muted-foreground">AI-discovered KPIs</p>
//               </div>
//             </div>
//           </div>

//           <StepIndicator />

//           <div className="space-y-4 animate-slide-up">
//             {/* Section header + global Select All */}
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <Target className="w-5 h-5 text-primary" />
//                 <h3 className="text-lg font-semibold text-foreground">Select KPIs</h3>
//                 <span className="text-xs text-muted-foreground">
//                   ({selectedKpis.size} / {kpisWithDetails.length} selected)
//                 </span>
//               </div>

//               <button
//                 onClick={handleSelectAllKpis}
//                 className={cn(
//                   'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
//                   allKpisSelected
//                     ? 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30'
//                     : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
//                 )}
//               >
//                 {allKpisSelected ? (
//                   <CheckSquare className="w-3.5 h-3.5" />
//                 ) : (
//                   <Square className="w-3.5 h-3.5" />
//                 )}
//                 {allKpisSelected ? 'Deselect All' : 'Select All'}
//               </button>
//             </div>

//             <p className="text-sm text-muted-foreground">
//               Choose the Key Performance Indicators you want to track.
//             </p>

//             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
//               {kpisWithDetails.map((kpi, index) => {
//                 const isSelected = selectedKpis.has(kpi.id);
//                 return (
//                   <div
//                     key={kpi.id}
//                     onClick={() => toggleKpi(kpi.id)}
//                     className={cn(
//                       'p-4 rounded-xl border cursor-pointer transition-all animate-fade-in group',
//                       isSelected
//                         ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-lg shadow-primary/10'
//                         : 'border-border bg-card/50 hover:border-primary/50 hover:bg-card hover:shadow-md'
//                     )}
//                     style={{ animationDelay: `${index * 50}ms` }}
//                   >
//                     <div className="flex items-center justify-between mb-3">
//                       <div
//                         className={cn(
//                           'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
//                           isSelected
//                             ? 'bg-primary border-primary'
//                             : 'border-muted-foreground/40 group-hover:border-primary/60'
//                         )}
//                       >
//                         {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
//                       </div>
//                       {getStatusIcon(kpi.status)}
//                     </div>

//                     <h4 className="text-sm font-semibold text-foreground mb-3">{kpi.name}</h4>

//                     <div className="space-y-2">
//                       <div className="flex justify-between text-xs">
//                         <span className="text-muted-foreground">Actual</span>
//                         <span className="font-mono font-bold text-foreground">{kpi.actual}</span>
//                       </div>
//                       <div className="flex justify-between text-xs">
//                         <span className="text-muted-foreground">Target</span>
//                         <span className="font-mono text-muted-foreground">{kpi.target}</span>
//                       </div>
//                       <div
//                         className={cn(
//                           'flex items-center justify-between px-2 py-1.5 rounded-lg text-xs',
//                           getStatusBg(kpi.status)
//                         )}
//                       >
//                         <span className={getStatusColor(kpi.status)}>
//                           {kpi.status === 'on-track'
//                             ? 'On Track'
//                             : kpi.status === 'at-risk'
//                             ? 'At Risk'
//                             : 'Off Track'}
//                         </span>
//                         <span className={cn('font-mono font-semibold', getStatusColor(kpi.status))}>
//                           {kpi.percentage}%
//                         </span>
//                       </div>
//                     </div>

//                     <div className="mt-3 pt-3 border-t border-border/50">
//                       <p className="text-xs text-muted-foreground">
//                         {kpi.metrics.length} metrics • {kpi.measurements.length} measurements
//                       </p>
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-4 pt-4">
//             <Button
//               onClick={handleGenerateMetrics}
//               disabled={selectedKpis.size === 0 || isGeneratingMetrics}
//               variant="glow"
//               size="lg"
//               className="flex-1 gap-2"
//             >
//               {isGeneratingMetrics ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   Computing Metrics...
//                 </>
//               ) : (
//                 <>
//                   <Sparkles className="w-4 h-4" />
//                   Generate Metrics &amp; Measurements ({selectedKpis.size} KPIs)
//                 </>
//               )}
//             </Button>

//             <Button
//               onClick={handleBuildCustomDashboard}
//               disabled={isLoading || isCreatingThread}
//               variant="outline"
//               size="lg"
//               className="flex-1 gap-2"
//             >
//               {isCreatingThread ? (
//                 <>
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                   Initializing...
//                 </>
//               ) : (
//                 <>
//                   <MessageSquare className="w-4 h-4" />
//                   Build Your Own Dashboard
//                 </>
//               )}
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ── STEP 2: SELECT METRICS ────────────────────────────────────────────────
//   if (currentStep === 'select-metrics') {
//     return (
//       <div className="flex-1 overflow-auto">
//         <div className="max-w-4xl mx-auto p-6 space-y-6">
//           <div className="animate-fade-in">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20">
//                 <Icon className={cn('w-5 h-5', iconColor)} />
//               </div>
//               <div>
//                 <h2 className="text-lg font-semibold text-foreground">{file.name}</h2>
//                 <p className="text-xs text-muted-foreground">
//                   {selectedKpis.size} KPI{selectedKpis.size > 1 ? 's' : ''} selected
//                 </p>
//               </div>
//             </div>
//           </div>

//           <StepIndicator />

//           <div className="space-y-6 animate-slide-up">
//             {/* Section header + global Select All */}
//             <div className="flex items-center justify-between">
//               <div className="flex items-center gap-2">
//                 <BarChart3 className="w-5 h-5 text-primary" />
//                 <h3 className="text-lg font-semibold text-foreground">
//                   Metrics &amp; Measurements
//                 </h3>
//                 <span className="text-xs text-muted-foreground ml-1">
//                   ({selectedMetrics.size + selectedMeasurements.size} selected)
//                 </span>
//               </div>

//               <button
//                 onClick={handleSelectAllMetricsAndMeasurements}
//                 className={cn(
//                   'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
//                   allMetricsAndMeasurementsSelected
//                     ? 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30'
//                     : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
//                 )}
//               >
//                 {allMetricsAndMeasurementsSelected ? (
//                   <CheckSquare className="w-3.5 h-3.5" />
//                 ) : (
//                   <Square className="w-3.5 h-3.5" />
//                 )}
//                 {allMetricsAndMeasurementsSelected ? 'Deselect All' : 'Select All'}
//               </button>
//             </div>

//             <p className="text-sm text-muted-foreground -mt-4">
//               Each KPI card shows its computed metrics and DAX measurements. Use the card's
//               "Select All" to pick everything for that KPI, or use the global button above to
//               select across all cards.
//             </p>

//             {/* KPI cards */}
//             {selectedKpisData.map((kpi, kpiIndex) => {
//               const allMetricIds = kpi.metrics.map(m => m.id);
//               const allMeasurementKeys = kpi.measurements.map(m => `${kpi.id}-${m}`);
//               const kpiAllSelected =
//                 (allMetricIds.length > 0 || allMeasurementKeys.length > 0) &&
//                 allMetricIds.every(id => selectedMetrics.has(id)) &&
//                 allMeasurementKeys.every(k => selectedMeasurements.has(k));

//               return (
//                 <div
//                   key={kpi.id}
//                   className="rounded-2xl border border-border bg-card/60 overflow-hidden animate-fade-in"
//                   style={{ animationDelay: `${kpiIndex * 80}ms` }}
//                 >
//                   {/* Card header: status info + single Select All for this KPI */}
//                   <div
//                     className={cn(
//                       'flex items-center justify-between px-5 py-3 border-b border-border',
//                       getStatusBg(kpi.status)
//                     )}
//                   >
//                     <div className="flex items-center gap-3">
//                       {getStatusIcon(kpi.status)}
//                       <div>
//                         <h4 className="text-sm font-bold text-foreground">{kpi.name}</h4>
//                         <p className="text-xs text-muted-foreground">
//                           Actual:{' '}
//                           <span className="font-mono font-semibold text-foreground">
//                             {kpi.actual}
//                           </span>
//                           &nbsp;·&nbsp;Target:{' '}
//                           <span className="font-mono text-muted-foreground">{kpi.target}</span>
//                         </p>
//                       </div>
//                     </div>

//                     <div className="flex items-center gap-2">
//                       <span
//                         className={cn(
//                           'text-xs font-semibold px-2.5 py-1 rounded-full border',
//                           getStatusBg(kpi.status),
//                           getStatusColor(kpi.status)
//                         )}
//                       >
//                         {kpi.percentage}%&nbsp;·&nbsp;
//                         {kpi.status === 'on-track'
//                           ? 'On Track'
//                           : kpi.status === 'at-risk'
//                           ? 'At Risk'
//                           : 'Off Track'}
//                       </span>

//                       {/* Single "Select All" — selects BOTH metrics & measurements */}
//                       <button
//                         onClick={() => handleSelectAllForKpi(kpi)}
//                         className={cn(
//                           'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-all whitespace-nowrap',
//                           kpiAllSelected
//                             ? 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30'
//                             : 'bg-card/80 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
//                         )}
//                       >
//                         {kpiAllSelected ? (
//                           <CheckSquare className="w-3 h-3" />
//                         ) : (
//                           <Square className="w-3 h-3" />
//                         )}
//                         {kpiAllSelected ? 'Deselect All' : 'Select All'}
//                       </button>
//                     </div>
//                   </div>

//                   <div className="p-5 space-y-5">
//                     {/* Metrics */}
//                     {kpi.metrics.length > 0 && (
//                       <div className="space-y-3">
//                         <div className="flex items-center gap-2">
//                           <TrendingUp className="w-4 h-4 text-primary" />
//                           <span className="text-sm font-semibold text-foreground">Metrics</span>
//                           <span className="text-xs text-muted-foreground">(Computed values)</span>
//                         </div>

//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
//                           {kpi.metrics.map(metric => {
//                             const isSelected = selectedMetrics.has(metric.id);
//                             return (
//                               <div
//                                 key={metric.id}
//                                 onClick={() => toggleMetric(metric.id)}
//                                 className={cn(
//                                   'p-4 rounded-xl border cursor-pointer transition-all',
//                                   isSelected
//                                     ? 'border-primary bg-primary/10 ring-1 ring-primary/40 shadow-sm shadow-primary/10'
//                                     : 'border-border bg-background/40 hover:border-primary/40 hover:bg-card'
//                                 )}
//                               >
//                                 <div className="flex items-center justify-between gap-2">
//                                   <div className="flex items-center gap-2 min-w-0">
//                                     <div
//                                       className={cn(
//                                         'w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all',
//                                         isSelected
//                                           ? 'bg-primary border-primary'
//                                           : 'border-muted-foreground/40'
//                                       )}
//                                     >
//                                       {isSelected && (
//                                         <Check className="w-3 h-3 text-primary-foreground" />
//                                       )}
//                                     </div>
//                                     <span className="text-sm text-muted-foreground truncate max-w-[140px]">
//                                       {metric.label}
//                                     </span>
//                                   </div>
//                                   <span className="text-base sm:text-lg font-bold text-foreground font-mono flex-shrink-0">
//                                     {metric.value}
//                                   </span>
//                                 </div>
//                                 <div className="flex items-center gap-1 text-xs mt-2 ml-7 text-emerald-400">
//                                   <TrendingUp className="w-3 h-3 flex-shrink-0" />
//                                   <span className="truncate">{metric.changeLabel}</span>
//                                 </div>
//                               </div>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     )}

//                     {/* Divider */}
//                     {kpi.metrics.length > 0 && kpi.measurements.length > 0 && (
//                       <div className="border-t border-dashed border-border/60" />
//                     )}

//                     {/* Measurements */}
//                     {kpi.measurements.length > 0 && (
//                       <div className="space-y-3">
//                         <div className="flex items-center gap-2">
//                           <BarChart3 className="w-4 h-4 text-primary" />
//                           <span className="text-sm font-semibold text-foreground">
//                             Measurements
//                           </span>
//                           <span className="text-xs text-muted-foreground">(DAX calculations)</span>
//                         </div>

//                         <div className="flex flex-wrap gap-2">
//                           {kpi.measurements.map(measurement => {
//                             const uniqueKey = `${kpi.id}-${measurement}`;
//                             const isSelected = selectedMeasurements.has(uniqueKey);
//                             return (
//                               <button
//                                 key={uniqueKey}
//                                 onClick={() => toggleMeasurement(measurement, kpi.id)}
//                                 className={cn(
//                                   'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
//                                   isSelected
//                                     ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
//                                     : 'bg-primary/20 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
//                                 )}
//                               >
//                                 {isSelected && <Check className="w-3 h-3" />}
//                                 {measurement}
//                               </button>
//                             );
//                           })}
//                         </div>
//                       </div>
//                     )}

//                     {kpi.metrics.length === 0 && kpi.measurements.length === 0 && (
//                       <p className="text-xs text-muted-foreground italic">
//                         No metrics or measurements computed for this KPI.
//                       </p>
//                     )}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>

//           <div className="flex flex-col sm:flex-row gap-4 pt-4">
//             <Button onClick={handleBackToKpis} variant="outline" size="lg" className="gap-2">
//               Back to KPIs
//             </Button>
//             <Button
//               onClick={handleProceedToConfirmation}
//               disabled={!hasMetricSelection}
//               variant="glow"
//               size="lg"
//               className="flex-1 gap-2"
//             >
//               <ChevronRight className="w-4 h-4" />
//               Review Selection ({selectedMetrics.size + selectedMeasurements.size} items)
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ── STEP 3: CONFIRMATION ──────────────────────────────────────────────────
//   return (
//     <div className="flex-1 overflow-auto">
//       <div className="max-w-4xl mx-auto p-6 space-y-6">
//         <div className="animate-fade-in">
//           <div className="flex items-center gap-3 mb-4">
//             <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20">
//               <Icon className={cn('w-5 h-5', iconColor)} />
//             </div>
//             <div>
//               <h2 className="text-lg font-semibold text-foreground">Confirm Your Selection</h2>
//               <p className="text-xs text-muted-foreground">Review and build your dashboard</p>
//             </div>
//           </div>
//         </div>

//         <StepIndicator />

//         <div className="space-y-6 animate-slide-up">
//           <div className="p-6 rounded-xl border border-primary/30 bg-primary/5">
//             <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
//               <CheckCircle2 className="w-5 h-5 text-primary" />
//               Your Dashboard will include:
//             </h3>

//             <div className="space-y-4">
//               {selectedKpisData.map(kpi => {
//                 const selectedKpiMetrics = kpi.metrics.filter(m =>
//                   selectedMetrics.has(m.id)
//                 );
//                 const selectedKpiMeasurements = kpi.measurements.filter(m =>
//                   selectedMeasurements.has(`${kpi.id}-${m}`)
//                 );

//                 return (
//                   <div key={kpi.id} className="p-4 rounded-lg bg-card/80 border border-border">
//                     <div className="flex items-center gap-2 mb-3">
//                       {getStatusIcon(kpi.status)}
//                       <span className="font-semibold text-foreground">{kpi.name}</span>
//                       <span
//                         className={cn(
//                           'text-xs px-2 py-0.5 rounded-full',
//                           getStatusBg(kpi.status),
//                           getStatusColor(kpi.status)
//                         )}
//                       >
//                         {kpi.percentage}%
//                       </span>
//                     </div>

//                     {selectedKpiMetrics.length > 0 && (
//                       <div className="mb-2">
//                         <span className="text-xs text-muted-foreground">Metrics: </span>
//                         <span className="text-sm text-foreground">
//                           {selectedKpiMetrics.map(m => m.label).join(', ')}
//                         </span>
//                       </div>
//                     )}

//                     {selectedKpiMeasurements.length > 0 && (
//                       <div>
//                         <span className="text-xs text-muted-foreground">Measurements: </span>
//                         <span className="text-sm text-foreground">
//                           {selectedKpiMeasurements.join(', ')}
//                         </span>
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>

//             <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-primary">{selectedKpis.size}</div>
//                 <div className="text-xs text-muted-foreground">KPIs</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-primary">{selectedMetrics.size}</div>
//                 <div className="text-xs text-muted-foreground">Metrics</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-primary">{selectedMeasurements.size}</div>
//                 <div className="text-xs text-muted-foreground">Measurements</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="flex flex-col sm:flex-row gap-4 pt-4">
//           <Button onClick={handleBackToMetrics} variant="outline" size="lg" className="gap-2">
//             Back to Metrics
//           </Button>
//           <Button
//             onClick={handleBuildDashboard}
//             disabled={isLoading}
//             variant="glow"
//             size="lg"
//             className="flex-1 gap-2"
//           >
//             {isLoading ? (
//               <>
//                 <Loader2 className="w-4 h-4 animate-spin" />
//                 Building Dashboard...
//               </>
//             ) : (
//               <>
//                 <Wand2 className="w-4 h-4" />
//                 Build Dashboard with Recommendations
//               </>
//             )}
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// }


import { useState, useEffect, useRef } from 'react';
import { DataFile, KPI } from '@/components/types/dashboard';
import { createThread, attachFileToAgent } from '../api/api';
import { DashboardPreview } from './DashboardPreview';
import {
  BarChart3,
  TrendingUp,
  Sparkles,
  Wand2,
  MessageSquare,
  FileText,
  Table,
  FileJson,
  Search,
  Target,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Check,
  Loader2,
  X,
  CheckSquare,
  Square,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface KPIWithTarget {
  id: string;
  name: string;
  actual: string;
  target: string;
  status: 'on-track' | 'at-risk' | 'off-track';
  percentage: number;
  metrics: KPI[];
  measurements: string[];
}

interface AnalysisPanelProps {
  file: DataFile | null;
  onBuildWithRecommendations: (data: { kpis: KPI[]; visuals: any[]; total_rows: number }) => void;
  onBuildCustomDashboard: () => void;
  isLoading: boolean;
}

const fileIcons = {
  csv: FileText,
  excel: Table,
  json: FileJson,
};

const fileColors = {
  csv: 'text-emerald-400',
  excel: 'text-green-400',
  json: 'text-amber-400',
};

type Step = 'select-kpis' | 'select-metrics' | 'confirmation';

/**
 * Reads the "user" object from localStorage and returns true if the user's
 * dataplatform is "Databricks". Same check used across the other workflow
 * pages (Data Quality / NER / Business Logic / ETL Output / PowerBI
 * Dashboard sidebar).
 */
function isDatabricksUser(): boolean {
  try {
    const userData = localStorage.getItem('user');

    if (!userData) return false;

    const user = JSON.parse(userData);

    return user?.dataplatform === 'Databricks';
  } catch (err) {
    console.error('Failed to read dataplatform from localStorage user:', err);

    return false;
  }
}

// ── NEW: builds the "db_source" path used by the Databricks KPI
// endpoints. Guards against double ".csv" — file.name coming from the
// Databricks /list-datasets response already includes the extension,
// whereas the default (non-Databricks) flow's file.name does not (hence
// the default flow below still blindly appends ".csv", unchanged).
const buildDbSourcePath = (userId: string, jobId: string, filename: string) => {
  const name = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
  return `${userId}/${jobId}/${name}`;
};

export function AnalysisPanel({
  file,
  onBuildWithRecommendations,
  onBuildCustomDashboard,
  isLoading,
}: AnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [kpisWithDetails, setKpisWithDetails] = useState<KPIWithTarget[]>([]);
  const [selectedKpis, setSelectedKpis] = useState<Set<string>>(new Set());
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set());
  const [selectedMeasurements, setSelectedMeasurements] = useState<Set<string>>(new Set());
  const [currentStep, setCurrentStep] = useState<Step>('select-kpis');
  const [isGeneratingMetrics, setIsGeneratingMetrics] = useState(false);
  const [isCreatingThread, setIsCreatingThread] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [queryText, setQueryText] = useState('');
  const [stateRestored, setStateRestored] = useState(false);
  const hasInitializedRef = useRef(false);
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

  // ── Restore ONLY stage and KPI data from sessionStorage, NOT selections ──
  useEffect(() => {
    if (!file || stateRestored) return;
    const savedState = sessionStorage.getItem(`analysis_panel_state_${file.id}`);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.kpisWithDetails && parsedState.kpisWithDetails.length > 0) {
          setKpisWithDetails(parsedState.kpisWithDetails);
        }
        if (parsedState.currentStep) {
          setCurrentStep(parsedState.currentStep);
        }
        hasInitializedRef.current = true;
      } catch (error) {
        console.error('Error parsing saved analysis state:', error);
        sessionStorage.removeItem(`analysis_panel_state_${file.id}`);
      }
    }
    setStateRestored(true);
  }, [file?.id]);

  // ── Persist stage and KPI data (not selections) ──
  useEffect(() => {
    if (!file || !stateRestored) return;
    sessionStorage.setItem(
      `analysis_panel_state_${file.id}`,
      JSON.stringify({ kpisWithDetails, currentStep })
    );
  }, [file?.id, kpisWithDetails, currentStep, stateRestored]);

  const handleBackToChat = () => setShowDashboard(false);

  // ── Step 1: Discover KPIs ──
  useEffect(() => {
    if (!file || !stateRestored) return;
    if (kpisWithDetails.length > 0 || hasInitializedRef.current) return;

    const userData = localStorage.getItem('user');
    const jobId = localStorage.getItem('current_job_id');
    if (!userData || !jobId) {
      toast.error('User or Job ID missing', { action: closeToastButton });
      return;
    }

    const userId = JSON.parse(userData).id;
    const useDatabricksRoute = isDatabricksUser();
    setIsAnalyzing(true);

    const fetchKPIs = async () => {
      try {
        let apiKpis: { kpi_name: string }[] = [];

        if (useDatabricksRoute) {
          // ── NEW: Databricks discover_kpis — uses "db_source" instead of
          // "csv_blob" as the payload key.
          const dbSource = buildDbSourcePath(userId, jobId, file.name);

          const response = await fetch(
            'https://api.veriton.ai/api/service-databricks/discover_kpis',
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', accept: 'application/json' },
              body: JSON.stringify({ db_source: dbSource }),
            }
          );
          if (!response.ok) throw new Error('Failed to discover KPIs');

          const data = await response.json();
          apiKpis = data.available_kpis || [];
        } else {
          // ── Existing default (non-Databricks) flow — unchanged ────────
          const csvBlobPath = `${userId}/${jobId}/${file.name}.csv`;

          const response = await fetch('https://api.veriton.ai/api/service2/discover_kpis', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ csv_blob: csvBlobPath }),
          });
          if (!response.ok) throw new Error('Failed to discover KPIs');

          const data = await response.json();
          apiKpis = data.available_kpis || [];
        }

        const generatedKPIs: KPIWithTarget[] = apiKpis.map(
          (item: { kpi_name: string }, index: number) => {
            const statuses: ('on-track' | 'at-risk' | 'off-track')[] = [
              'on-track', 'at-risk', 'off-track',
            ];
            return {
              id: `kpi-${index}`,
              name: item.kpi_name,
              actual: '—',
              target: '—',
              status: statuses[index % 3],
              percentage: 75 + (index * 8) % 35,
              metrics: [],
              measurements: [],
            };
          }
        );

        setKpisWithDetails(generatedKPIs);
        setCurrentStep('select-kpis');
        hasInitializedRef.current = true;
        toast.success(`${apiKpis.length} KPIs discovered!`, { action: closeToastButton });
      } catch {
        toast.error('Failed to load KPIs', { action: closeToastButton });
        setKpisWithDetails([]);
      } finally {
        setIsAnalyzing(false);
      }
    };

    fetchKPIs();
  }, [file?.id, stateRestored, kpisWithDetails.length]);

  // ── Reset when file becomes null ──
  useEffect(() => {
    if (!file) {
      setKpisWithDetails([]);
      setSelectedKpis(new Set());
      setSelectedMetrics(new Set());
      setSelectedMeasurements(new Set());
      setCurrentStep('select-kpis');
      setIsAnalyzing(false);
      setShowDashboard(false);
      setDashboardData(null);
      setQueryText('');
      setStateRestored(false);
      hasInitializedRef.current = false;
    }
  }, [file]);

  // ── Step 2: Compute metrics ──
  const handleGenerateMetrics = async () => {
    if (selectedKpis.size === 0) return;
    setIsGeneratingMetrics(true);

    const userData = localStorage.getItem('user');
    const jobId = localStorage.getItem('current_job_id');
    const userId = userData ? JSON.parse(userData).id : null;

    if (!userId || !jobId || !file) {
      toast.error('Missing data', { action: closeToastButton });
      setIsGeneratingMetrics(false);
      return;
    }

    const useDatabricksRoute = isDatabricksUser();
    const selectedKpiNames = kpisWithDetails
      .filter(kpi => selectedKpis.has(kpi.id))
      .map(kpi => kpi.name);

    try {
      let computedKpis: any[] = [];

      if (useDatabricksRoute) {
        // ── NEW: Databricks compute_kpis — uses "db_source" instead of
        // "csv_blob". NOTE: the sample response for this endpoint returns
        // a single object ({ kpi_name, measures, metrics }) rather than
        // the default flow's { selected_kpis: [...] } array, so the
        // response is normalized to an array here to support both shapes
        // — confirm with the API team whether multi-KPI requests return
        // an array of these objects or something else.
        const dbSource = buildDbSourcePath(userId, jobId, file.name);

        const response = await fetch(
          'https://api.veriton.ai/api/service-databricks/compute_kpis',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', accept: 'application/json' },
            body: JSON.stringify({ db_source: dbSource, selected_kpi_names: selectedKpiNames }),
          }
        );
        if (!response.ok) throw new Error('Failed to compute KPIs');

        const data = await response.json();
        computedKpis = Array.isArray(data)
          ? data
          : Array.isArray(data.selected_kpis)
          ? data.selected_kpis
          : data.kpi_name !== undefined
          ? [data]
          : [];
      } else {
        // ── Existing default (non-Databricks) flow — unchanged ──────────
        const csvBlobPath = `${userId}/${jobId}/${file.name}.csv`;

        const response = await fetch('https://api.veriton.ai/api/service2/compute_kpis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csv_blob: csvBlobPath, selected_kpi_names: selectedKpiNames }),
        });
        if (!response.ok) throw new Error('Failed to compute KPIs');

        const data = await response.json();
        computedKpis = data.selected_kpis || [];
      }

      const updatedKpis = kpisWithDetails.map(kpi => {
        if (!selectedKpis.has(kpi.id)) return kpi;
        const computed = computedKpis.find((c: any) => c.kpi_name === kpi.name);
        if (!computed) return kpi;
        return {
          ...kpi,
          actual: computed.metrics.toString(),
          metrics: [
            {
              id: `metric-${kpi.id}`,
              label: `${kpi.name} Value`,
              value: computed.metrics.toLocaleString(undefined, { maximumFractionDigits: 2 }),
              change: 0,
              changeLabel: 'Computed from data',
            },
          ],
          measurements: [computed.measures],
        };
      });

      setKpisWithDetails(updatedKpis);
      toast.success('Metrics computed!', { action: closeToastButton });
      setCurrentStep('select-metrics');
    } catch {
      toast.error('Failed to compute metrics', { action: closeToastButton });
    } finally {
      setIsGeneratingMetrics(false);
    }
  };

  // ── Step 3: Generate full dashboard ──
  const handleBuildDashboard = async () => {
    if (!file) return;

    const userData = localStorage.getItem('user');
    const jobId = localStorage.getItem('current_job_id');
    const userId = userData ? JSON.parse(userData).id : null;

    if (!userId || !jobId) {
      toast.error('User or Job ID missing', { action: closeToastButton });
      return;
    }

    const useDatabricksRoute = isDatabricksUser();
    const selectedComputedKpis = kpisWithDetails
      .filter(kpi => selectedKpis.has(kpi.id))
      .map(kpi => ({
        kpi_name: kpi.name,
        measures: kpi.measurements[0] || '',
        metrics: parseFloat(kpi.actual.replace(/,/g, '')) || 0,
      }));

    if (selectedComputedKpis.length === 0) {
      toast.error('No KPIs selected', { action: closeToastButton });
      return;
    }

    const fallbackKpis: KPI[] = selectedComputedKpis.map((k, i) => ({
      id: `fallback-${i}`,
      label: k.kpi_name,
      value: k.metrics.toLocaleString(),
      change: 0,
      changeLabel: 'From your selection',
    }));

    try {
      let visualsData: any = { visuals: [], total_rows: 0 };

      if (useDatabricksRoute) {
        // ── NEW: Databricks generate_visuals — uses "db_source" instead
        // of "csv_blob"; "computed_kpis" key is unchanged. The Databricks
        // response includes richer fields (file_name, total_visuals_generated,
        // detected_structure) alongside the same visuals[]/total_rows shape
        // the mapping logic below already expects, so no further changes
        // were needed there.
        const dbSource = buildDbSourcePath(userId, jobId, file.name);

        const response = await fetch(
          'https://api.veriton.ai/api/service-databricks/generate_visuals',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', accept: 'application/json' },
            body: JSON.stringify({ db_source: dbSource, computed_kpis: selectedComputedKpis }),
          }
        );

        visualsData = response.ok ? await response.json() : { visuals: [], total_rows: 0 };
      } else {
        // ── Existing default (non-Databricks) flow — unchanged ──────────
        const csvBlobPath = `${userId}/${jobId}/${file.name}.csv`;

        const response = await fetch('https://api.veriton.ai/api/service2/generate_visuals', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ csv_blob: csvBlobPath, computed_kpis: selectedComputedKpis }),
        });

        visualsData = response.ok ? await response.json() : { visuals: [], total_rows: 0 };
      }

      sessionStorage.setItem(
        'pbi_generate_visuals',
        JSON.stringify({ ...visualsData, file_name: file.name })
      );

      let finalKpis =
        visualsData.visuals
          ?.filter((v: any) => v.chart_type === 'KPI')
          ?.map((v: any, i: number) => ({
            id: `api-kpi-${i}`,
            label: v.chart_name,
            value: v.value?.toString() || '—',
            change: Math.random() * 30 - 10,
            changeLabel: v.description || 'AI Generated',
          })) || [];

      if (finalKpis.length === 0) finalKpis = fallbackKpis;

      sessionStorage.removeItem(`analysis_panel_state_${file.id}`);

      onBuildWithRecommendations({
        kpis: finalKpis,
        visuals: visualsData.visuals || [],
        total_rows: visualsData.total_rows || selectedComputedKpis.length,
      });
    } catch (err) {
      console.error('Generate visuals failed:', err);
      toast.info('Showing your selected KPIs', { action: closeToastButton });
      onBuildWithRecommendations({
        kpis: fallbackKpis,
        visuals: [],
        total_rows: selectedComputedKpis.length,
      });
    }
  };

  // ── Build Your Own Dashboard: create agent thread + attach the file ──────
  const handleBuildCustomDashboard = async () => {
    if (!file) {
      toast.error('No file selected', { action: closeToastButton });
      return;
    }

    const userData = localStorage.getItem('user');
    const jobId = localStorage.getItem('current_job_id');
    const userId = userData ? JSON.parse(userData).id : null;

    if (!userId || !jobId) {
      toast.error('User or Job ID missing', { action: closeToastButton });
      return;
    }

    setIsCreatingThread(true);
    try {
      const threadResponse = await createThread();
      localStorage.setItem('thread_id', threadResponse.thread_id);

      // ── Build the file path attachFileToAgent expects. For Databricks,
      // file.name from /list-datasets already includes the extension, so
      // blindly appending ".csv" (like the default flow does) can produce
      // "file.csv.csv". buildDbSourcePath guards against that; for the
      // default (non-Databricks) flow this keeps the original
      // "<userId>/<jobId>/<file.name>.csv" behavior unchanged.
      const filePath = isDatabricksUser()
        ? buildDbSourcePath(userId, jobId, file.name)
        : `${userId}/${jobId}/${file.name}.csv`;

      await attachFileToAgent(filePath);
      onBuildCustomDashboard();
    } catch (error: any) {
      console.error('Error in custom dashboard flow:', error);
      toast.error(error.message || 'Failed to initialize custom dashboard', {
        action: closeToastButton,
      });
    } finally {
      setIsCreatingThread(false);
    }
  };

  // ── Toggle helpers ────────────────────────────────────────────────────────
  const toggleKpi = (kpiId: string) => {
    setSelectedKpis(prev => {
      const next = new Set(prev);
      next.has(kpiId) ? next.delete(kpiId) : next.add(kpiId);
      return next;
    });
  };

  const toggleMetric = (metricId: string) => {
    setSelectedMetrics(prev => {
      const next = new Set(prev);
      next.has(metricId) ? next.delete(metricId) : next.add(metricId);
      return next;
    });
  };

  const toggleMeasurement = (measurement: string, kpiId: string) => {
    const uniqueKey = `${kpiId}-${measurement}`;
    setSelectedMeasurements(prev => {
      const next = new Set(prev);
      next.has(uniqueKey) ? next.delete(uniqueKey) : next.add(uniqueKey);
      return next;
    });
  };

  // ── Select All KPIs (Step 1) ──────────────────────────────────────────────
  const allKpisSelected =
    kpisWithDetails.length > 0 && selectedKpis.size === kpisWithDetails.length;

  const handleSelectAllKpis = () => {
    if (allKpisSelected) {
      setSelectedKpis(new Set());
    } else {
      setSelectedKpis(new Set(kpisWithDetails.map(k => k.id)));
    }
  };

  // ── Step navigation ───────────────────────────────────────────────────────
  const handleProceedToConfirmation = () => setCurrentStep('confirmation');

  const handleBackToKpis = () => {
    setCurrentStep('select-kpis');
    setSelectedMetrics(new Set());
    setSelectedMeasurements(new Set());
  };

  const handleBackToMetrics = () => setCurrentStep('select-metrics');

  // ── Derived data — declared before helpers that depend on it ─────────────
  const selectedKpisData = kpisWithDetails.filter(kpi => selectedKpis.has(kpi.id));
  const hasMetricSelection = selectedMetrics.size > 0 || selectedMeasurements.size > 0;

  // ── Per-KPI card: Select All (both metrics + measurements) ────────────────
  const handleSelectAllForKpi = (kpi: KPIWithTarget) => {
    const allMetricIds = kpi.metrics.map(m => m.id);
    const allMeasurementKeys = kpi.measurements.map(m => `${kpi.id}-${m}`);
    const allSelected =
      allMetricIds.every(id => selectedMetrics.has(id)) &&
      allMeasurementKeys.every(k => selectedMeasurements.has(k));

    setSelectedMetrics(prev => {
      const next = new Set(prev);
      allSelected
        ? allMetricIds.forEach(id => next.delete(id))
        : allMetricIds.forEach(id => next.add(id));
      return next;
    });
    setSelectedMeasurements(prev => {
      const next = new Set(prev);
      allSelected
        ? allMeasurementKeys.forEach(k => next.delete(k))
        : allMeasurementKeys.forEach(k => next.add(k));
      return next;
    });
  };

  // ── Global Select All: every metric + measurement across all KPI cards ────
  const handleSelectAllMetricsAndMeasurements = () => {
    const allMetricIds = selectedKpisData.flatMap(kpi => kpi.metrics.map(m => m.id));
    const allMeasurementKeys = selectedKpisData.flatMap(kpi =>
      kpi.measurements.map(m => `${kpi.id}-${m}`)
    );
    const allSelected =
      allMetricIds.every(id => selectedMetrics.has(id)) &&
      allMeasurementKeys.every(k => selectedMeasurements.has(k));

    setSelectedMetrics(new Set(allSelected ? [] : allMetricIds));
    setSelectedMeasurements(new Set(allSelected ? [] : allMeasurementKeys));
  };

  const allMetricsAndMeasurementsSelected = (() => {
    const allMetricIds = selectedKpisData.flatMap(kpi => kpi.metrics.map(m => m.id));
    const allMeasurementKeys = selectedKpisData.flatMap(kpi =>
      kpi.measurements.map(m => `${kpi.id}-${m}`)
    );
    if (allMetricIds.length === 0 && allMeasurementKeys.length === 0) return false;
    return (
      allMetricIds.every(id => selectedMetrics.has(id)) &&
      allMeasurementKeys.every(k => selectedMeasurements.has(k))
    );
  })();

  // ── Status helpers ────────────────────────────────────────────────────────
  const getStatusColor = (status: KPIWithTarget['status']) => {
    switch (status) {
      case 'on-track': return 'text-emerald-400';
      case 'at-risk':  return 'text-amber-400';
      case 'off-track': return 'text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusBg = (status: KPIWithTarget['status']) => {
    switch (status) {
      case 'on-track': return 'bg-emerald-400/10 border-emerald-400/30';
      case 'at-risk':  return 'bg-amber-400/10 border-amber-400/30';
      case 'off-track': return 'bg-red-400/10 border-red-400/30';
      default: return 'bg-secondary';
    }
  };

  const getStatusIcon = (status: KPIWithTarget['status']) => {
    switch (status) {
      case 'on-track': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'at-risk':  return <Target className="w-4 h-4 text-amber-400" />;
      case 'off-track': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return null;
    }
  };

  // ── Dashboard preview early-return ────────────────────────────────────────
  if (showDashboard && dashboardData) {
    return (
      <DashboardPreview
        dashboardData={dashboardData}
        file={file!}
        query={queryText}
        onBack={handleBackToChat}
      />
    );
  }

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-primary/20 border border-primary flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Select a Dataset</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Choose a data source from the sidebar to analyze and generate your Power BI dashboard
          </p>
        </div>
      </div>
    );
  }

  // file is DataFile here — use file.type, never file.split()
  const Icon = fileIcons[file.type as keyof typeof fileIcons] || FileText;
  const iconColor = fileColors[file.type as keyof typeof fileColors] || 'text-muted-foreground';

  if (isAnalyzing) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="w-20 h-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Analyzing Dataset</h2>
          <p className="text-muted-foreground text-sm">
            Detecting KPIs in{' '}
            <span className="text-primary font-medium">{file.name}</span>
          </p>
        </div>
      </div>
    );
  }

  if (kpisWithDetails.length === 0 && stateRestored) {
    return (
      <div className="flex-1 flex items-center justify-center text-center">
        <p className="text-muted-foreground">No KPIs discovered for this dataset.</p>
      </div>
    );
  }

  const StepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {(
        [
          { label: 'Select KPIs', step: 'select-kpis' },
          { label: 'Select Metrics', step: 'select-metrics' },
          { label: 'Confirm', step: 'confirmation' },
        ] as { label: string; step: Step }[]
      ).map((s, i, arr) => (
        <div key={s.step} className="flex items-center gap-2">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              currentStep === s.step
                ? 'bg-primary text-primary-foreground'
                : (currentStep === 'select-metrics' && s.step === 'select-kpis') ||
                  (currentStep === 'confirmation' && s.step !== 'confirmation')
                ? 'bg-primary/20 text-primary'
                : 'bg-primary/20 text-muted-foreground'
            )}
          >
            <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center">
              {i + 1}
            </span>
            {s.label}
          </div>
          {i < arr.length - 1 && <ChevronRight className="w-4 h-4 text-muted-foreground" />}
        </div>
      ))}
    </div>
  );

  // ── STEP 1: SELECT KPIs ───────────────────────────────────────────────────
  if (currentStep === 'select-kpis') {
    return (
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* File header */}
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20">
                <Icon className={cn('w-5 h-5', iconColor)} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{file.name}</h2>
                <p className="text-xs text-muted-foreground">AI-discovered KPIs</p>
              </div>
            </div>
          </div>

          <StepIndicator />

          <div className="space-y-4 animate-slide-up">
            {/* Section header + global Select All */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">Select KPIs</h3>
                <span className="text-xs text-muted-foreground">
                  ({selectedKpis.size} / {kpisWithDetails.length} selected)
                </span>
              </div>

              <button
                onClick={handleSelectAllKpis}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  allKpisSelected
                    ? 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                {allKpisSelected ? (
                  <CheckSquare className="w-3.5 h-3.5" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                {allKpisSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <p className="text-sm text-muted-foreground">
              Choose the Key Performance Indicators you want to track.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {kpisWithDetails.map((kpi, index) => {
                const isSelected = selectedKpis.has(kpi.id);
                return (
                  <div
                    key={kpi.id}
                    onClick={() => toggleKpi(kpi.id)}
                    className={cn(
                      'p-4 rounded-xl border cursor-pointer transition-all animate-fade-in group',
                      isSelected
                        ? 'border-primary bg-primary/10 ring-2 ring-primary/30 shadow-lg shadow-primary/10'
                        : 'border-border bg-card/50 hover:border-primary/50 hover:bg-card hover:shadow-md'
                    )}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                          isSelected
                            ? 'bg-primary border-primary'
                            : 'border-muted-foreground/40 group-hover:border-primary/60'
                        )}
                      >
                        {isSelected && <Check className="w-4 h-4 text-primary-foreground" />}
                      </div>
                      {getStatusIcon(kpi.status)}
                    </div>

                    <h4 className="text-sm font-semibold text-foreground mb-3">{kpi.name}</h4>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Actual</span>
                        <span className="font-mono font-bold text-foreground">{kpi.actual}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Target</span>
                        <span className="font-mono text-muted-foreground">{kpi.target}</span>
                      </div>
                      <div
                        className={cn(
                          'flex items-center justify-between px-2 py-1.5 rounded-lg text-xs',
                          getStatusBg(kpi.status)
                        )}
                      >
                        <span className={getStatusColor(kpi.status)}>
                          {kpi.status === 'on-track'
                            ? 'On Track'
                            : kpi.status === 'at-risk'
                            ? 'At Risk'
                            : 'Off Track'}
                        </span>
                        <span className={cn('font-mono font-semibold', getStatusColor(kpi.status))}>
                          {kpi.percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-border/50">
                      <p className="text-xs text-muted-foreground">
                        {kpi.metrics.length} metrics • {kpi.measurements.length} measurements
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button
              onClick={handleGenerateMetrics}
              disabled={selectedKpis.size === 0 || isGeneratingMetrics}
              variant="glow"
              size="lg"
              className="flex-1 gap-2"
            >
              {isGeneratingMetrics ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Computing Metrics...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Metrics &amp; Measurements ({selectedKpis.size} KPIs)
                </>
              )}
            </Button>

            <Button
              onClick={handleBuildCustomDashboard}
              disabled={isLoading || isCreatingThread}
              variant="outline"
              size="lg"
              className="flex-1 gap-2"
            >
              {isCreatingThread ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Initializing...
                </>
              ) : (
                <>
                  <MessageSquare className="w-4 h-4" />
                  Build Your Own Dashboard
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 2: SELECT METRICS ────────────────────────────────────────────────
  if (currentStep === 'select-metrics') {
    return (
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20">
                <Icon className={cn('w-5 h-5', iconColor)} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">{file.name}</h2>
                <p className="text-xs text-muted-foreground">
                  {selectedKpis.size} KPI{selectedKpis.size > 1 ? 's' : ''} selected
                </p>
              </div>
            </div>
          </div>

          <StepIndicator />

          <div className="space-y-6 animate-slide-up">
            {/* Section header + global Select All */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-foreground">
                  Metrics &amp; Measurements
                </h3>
                <span className="text-xs text-muted-foreground ml-1">
                  ({selectedMetrics.size + selectedMeasurements.size} selected)
                </span>
              </div>

              <button
                onClick={handleSelectAllMetricsAndMeasurements}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                  allMetricsAndMeasurementsSelected
                    ? 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30'
                    : 'bg-card border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                )}
              >
                {allMetricsAndMeasurementsSelected ? (
                  <CheckSquare className="w-3.5 h-3.5" />
                ) : (
                  <Square className="w-3.5 h-3.5" />
                )}
                {allMetricsAndMeasurementsSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <p className="text-sm text-muted-foreground -mt-4">
              Each KPI card shows its computed metrics and DAX measurements. Use the card's
              "Select All" to pick everything for that KPI, or use the global button above to
              select across all cards.
            </p>

            {/* KPI cards */}
            {selectedKpisData.map((kpi, kpiIndex) => {
              const allMetricIds = kpi.metrics.map(m => m.id);
              const allMeasurementKeys = kpi.measurements.map(m => `${kpi.id}-${m}`);
              const kpiAllSelected =
                (allMetricIds.length > 0 || allMeasurementKeys.length > 0) &&
                allMetricIds.every(id => selectedMetrics.has(id)) &&
                allMeasurementKeys.every(k => selectedMeasurements.has(k));

              return (
                <div
                  key={kpi.id}
                  className="rounded-2xl border border-border bg-card/60 overflow-hidden animate-fade-in"
                  style={{ animationDelay: `${kpiIndex * 80}ms` }}
                >
                  {/* Card header: status info + single Select All for this KPI */}
                  <div
                    className={cn(
                      'flex items-center justify-between px-5 py-3 border-b border-border',
                      getStatusBg(kpi.status)
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(kpi.status)}
                      <div>
                        <h4 className="text-sm font-bold text-foreground">{kpi.name}</h4>
                        <p className="text-xs text-muted-foreground">
                          Actual:{' '}
                          <span className="font-mono font-semibold text-foreground">
                            {kpi.actual}
                          </span>
                          &nbsp;·&nbsp;Target:{' '}
                          <span className="font-mono text-muted-foreground">{kpi.target}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-xs font-semibold px-2.5 py-1 rounded-full border',
                          getStatusBg(kpi.status),
                          getStatusColor(kpi.status)
                        )}
                      >
                        {kpi.percentage}%&nbsp;·&nbsp;
                        {kpi.status === 'on-track'
                          ? 'On Track'
                          : kpi.status === 'at-risk'
                          ? 'At Risk'
                          : 'Off Track'}
                      </span>

                      {/* Single "Select All" — selects BOTH metrics & measurements */}
                      <button
                        onClick={() => handleSelectAllForKpi(kpi)}
                        className={cn(
                          'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-all whitespace-nowrap',
                          kpiAllSelected
                            ? 'bg-primary/20 border-primary/40 text-primary hover:bg-primary/30'
                            : 'bg-card/80 border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        )}
                      >
                        {kpiAllSelected ? (
                          <CheckSquare className="w-3 h-3" />
                        ) : (
                          <Square className="w-3 h-3" />
                        )}
                        {kpiAllSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>
                  </div>

                  <div className="p-5 space-y-5">
                    {/* Metrics */}
                    {kpi.metrics.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">Metrics</span>
                          <span className="text-xs text-muted-foreground">(Computed values)</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {kpi.metrics.map(metric => {
                            const isSelected = selectedMetrics.has(metric.id);
                            return (
                              <div
                                key={metric.id}
                                onClick={() => toggleMetric(metric.id)}
                                className={cn(
                                  'p-4 rounded-xl border cursor-pointer transition-all',
                                  isSelected
                                    ? 'border-primary bg-primary/10 ring-1 ring-primary/40 shadow-sm shadow-primary/10'
                                    : 'border-border bg-background/40 hover:border-primary/40 hover:bg-card'
                                )}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <div
                                      className={cn(
                                        'w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all',
                                        isSelected
                                          ? 'bg-primary border-primary'
                                          : 'border-muted-foreground/40'
                                      )}
                                    >
                                      {isSelected && (
                                        <Check className="w-3 h-3 text-primary-foreground" />
                                      )}
                                    </div>
                                    <span className="text-sm text-muted-foreground truncate max-w-[140px]">
                                      {metric.label}
                                    </span>
                                  </div>
                                  <span className="text-base sm:text-lg font-bold text-foreground font-mono flex-shrink-0">
                                    {metric.value}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1 text-xs mt-2 ml-7 text-emerald-400">
                                  <TrendingUp className="w-3 h-3 flex-shrink-0" />
                                  <span className="truncate">{metric.changeLabel}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Divider */}
                    {kpi.metrics.length > 0 && kpi.measurements.length > 0 && (
                      <div className="border-t border-dashed border-border/60" />
                    )}

                    {/* Measurements */}
                    {kpi.measurements.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-primary" />
                          <span className="text-sm font-semibold text-foreground">
                            Measurements
                          </span>
                          <span className="text-xs text-muted-foreground">(DAX calculations)</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {kpi.measurements.map(measurement => {
                            const uniqueKey = `${kpi.id}-${measurement}`;
                            const isSelected = selectedMeasurements.has(uniqueKey);
                            return (
                              <button
                                key={uniqueKey}
                                onClick={() => toggleMeasurement(measurement, kpi.id)}
                                className={cn(
                                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-all',
                                  isSelected
                                    ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                                    : 'bg-primary/20 text-muted-foreground border-border hover:border-primary/50 hover:text-foreground'
                                )}
                              >
                                {isSelected && <Check className="w-3 h-3" />}
                                {measurement}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {kpi.metrics.length === 0 && kpi.measurements.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">
                        No metrics or measurements computed for this KPI.
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button onClick={handleBackToKpis} variant="outline" size="lg" className="gap-2">
              Back to KPIs
            </Button>
            <Button
              onClick={handleProceedToConfirmation}
              disabled={!hasMetricSelection}
              variant="glow"
              size="lg"
              className="flex-1 gap-2"
            >
              <ChevronRight className="w-4 h-4" />
              Review Selection ({selectedMetrics.size + selectedMeasurements.size} items)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── STEP 3: CONFIRMATION ──────────────────────────────────────────────────
  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20">
              <Icon className={cn('w-5 h-5', iconColor)} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Confirm Your Selection</h2>
              <p className="text-xs text-muted-foreground">Review and build your dashboard</p>
            </div>
          </div>
        </div>

        <StepIndicator />

        <div className="space-y-6 animate-slide-up">
          <div className="p-6 rounded-xl border border-primary/30 bg-primary/5">
            <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Your Dashboard will include:
            </h3>

            <div className="space-y-4">
              {selectedKpisData.map(kpi => {
                const selectedKpiMetrics = kpi.metrics.filter(m =>
                  selectedMetrics.has(m.id)
                );
                const selectedKpiMeasurements = kpi.measurements.filter(m =>
                  selectedMeasurements.has(`${kpi.id}-${m}`)
                );

                return (
                  <div key={kpi.id} className="p-4 rounded-lg bg-card/80 border border-border">
                    <div className="flex items-center gap-2 mb-3">
                      {getStatusIcon(kpi.status)}
                      <span className="font-semibold text-foreground">{kpi.name}</span>
                      <span
                        className={cn(
                          'text-xs px-2 py-0.5 rounded-full',
                          getStatusBg(kpi.status),
                          getStatusColor(kpi.status)
                        )}
                      >
                        {kpi.percentage}%
                      </span>
                    </div>

                    {selectedKpiMetrics.length > 0 && (
                      <div className="mb-2">
                        <span className="text-xs text-muted-foreground">Metrics: </span>
                        <span className="text-sm text-foreground">
                          {selectedKpiMetrics.map(m => m.label).join(', ')}
                        </span>
                      </div>
                    )}

                    {selectedKpiMeasurements.length > 0 && (
                      <div>
                        <span className="text-xs text-muted-foreground">Measurements: </span>
                        <span className="text-sm text-foreground">
                          {selectedKpiMeasurements.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center gap-6 mt-4 pt-4 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{selectedKpis.size}</div>
                <div className="text-xs text-muted-foreground">KPIs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{selectedMetrics.size}</div>
                <div className="text-xs text-muted-foreground">Metrics</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{selectedMeasurements.size}</div>
                <div className="text-xs text-muted-foreground">Measurements</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Button onClick={handleBackToMetrics} variant="outline" size="lg" className="gap-2">
            Back to Metrics
          </Button>
          <Button
            onClick={handleBuildDashboard}
            disabled={isLoading}
            variant="glow"
            size="lg"
            className="flex-1 gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Building Dashboard...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Build Dashboard with Recommendations
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}