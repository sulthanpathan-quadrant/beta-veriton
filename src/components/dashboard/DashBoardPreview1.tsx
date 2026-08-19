// import { DataFile } from '@/components/types/dashboard';
// import { Button } from '@/components/ui/button';
// import {
//   ArrowLeft,
//   Download,
//   Share2,
//   BarChart3,
//   TrendingUp,
//   FileText,
//   MessageSquare,
//   AlertCircle
// } from 'lucide-react';

// interface DashboardPreviewProps {
//   dashboardData: any;
//   file: DataFile;
//   query: string;
//   onBack: () => void;
// }

// const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// // Change the function name from DashboardPreview to DashboardPreview1
// export function DashBoardPreview1({ dashboardData, file, query, onBack }: DashboardPreviewProps) {
//  const visuals = dashboardData?.visuals || [];
//   const totalRows = dashboardData?.total_rows || 0;
//   const totalVisualsGenerated = dashboardData?.total_visuals_generated || 0;

//   // Extract card/KPI visuals (these go to "Key Results" section)
//   const cardVisuals = visuals.filter((v: any) =>
//     v.chart_type === 'card' || v.chart_type === 'KPI'
//   );

//   // Extract other chart visuals (bar, scatter, table, etc.)
//   const chartVisuals = visuals.filter((v: any) =>
//     !['card', 'KPI'].includes(v.chart_type)
//   );

//   const hasCards = cardVisuals.length > 0;
//   const hasCharts = chartVisuals.length > 0;

//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       {/* Header */}
//       <div className="border-b border-border/50 bg-card/80">
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center gap-3">
//             <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
//               <BarChart3 className="w-5 h-5 text-primary" />
//             </div>
//             <span className="text-lg font-semibold text-foreground">Dashboard Preview</span>
//           </div>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 max-w-7xl mx-auto px-6 py-6 w-full space-y-8">
//         {/* Metadata Section */}
//         <div className="flex flex-col lg:flex-row lg:items-start gap-4 animate-fade-in">
//           <div className="space-y-3 flex-1">
//             <div className="flex items-center gap-2">
//               <FileText className="w-4 h-4 text-primary" />
//               <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Source</span>
//               <span className="text-sm font-semibold text-foreground">{file.name}</span>
//             </div>
//             <div className="flex items-start gap-2">
//               <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
//               <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Query</span>
//               <p className="text-sm text-foreground max-w-xl">{query}</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-2 shrink-0 lg:ml-auto">
//             <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
//               <Share2 className="w-3.5 h-3.5" />
//               Deploy to Power BI
//             </Button>
//             <Button variant="default" size="sm" className="gap-2 h-8 text-xs bg-primary hover:bg-primary/90">
//               <Download className="w-3.5 h-3.5" />
//               Download Dataset
//             </Button>
//           </div>
//         </div>

//         {/* Stats Pills */}
//         <div className="flex flex-wrap items-center gap-3 text-xs animate-fade-in">
//           <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
//             {cardVisuals.length} KPIs
//           </span>
//           <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
//             {totalRows} Records
//           </span>
//           <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">
//             {totalVisualsGenerated} Visuals Defined
//           </span>
//         </div>

//         {/* Key Results Section (Cards/KPIs) */}
//         {hasCards && (
//           <div className="animate-slide-up">
//             <div className="flex items-center gap-2 mb-4">
//               <TrendingUp className="w-5 h-5 text-primary" />
//               <span className="text-lg font-semibold text-foreground">Key Results</span>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
//               {cardVisuals.map((card: any, index: number) => (
//                 <div
//                   key={index}
//                   className="p-4 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow"
//                   style={{ animationDelay: `${index * 50}ms` }}
//                 >
//                   <div className="flex flex-col gap-2">
//                     <p className="text-xs text-muted-foreground truncate">{card.chart_name}</p>
//                     <p className="text-2xl font-bold text-foreground font-mono">
//                       {card.value != null ? card.value : 'N/A'}
//                     </p>
//                     <p className="text-xs text-muted-foreground flex items-center gap-1">
//                       <TrendingUp className="w-3 h-3" />
//                       {card.description || 'Result from query'}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Visualizations Section (All as Cards) */}
//         {hasCharts && (
//           <div className="space-y-8">
//             <div className="flex items-center gap-2">
//               <BarChart3 className="w-5 h-5 text-primary" />
//               <span className="text-lg font-semibold text-foreground">Visualizations</span>
//             </div>

//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//               {chartVisuals.map((visual: any, i: number) => (
//                 <div
//                   key={i}
//                   className="p-5 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow"
//                 >
//                   <div className="flex flex-col gap-3">
//                     {/* Chart Type Badge */}
//                     <div className="flex items-center justify-between">
//                       <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium uppercase">
//                         {visual.chart_type}
//                       </span>
//                       <BarChart3 className="w-4 h-4 text-muted-foreground" />
//                     </div>

//                     {/* Chart Name */}
//                     <h3 className="text-base font-semibold text-foreground">
//                       {visual.chart_name}
//                     </h3>

//                     {/* Description */}
//                     <p className="text-sm text-muted-foreground line-clamp-2">
//                       {visual.description || 'No description available'}
//                     </p>

//                     {/* Value Display */}
//                     <div className="mt-2 pt-3 border-t border-border">
//                       <div className="flex items-baseline gap-2">
//                         <span className="text-3xl font-bold text-foreground font-mono">
//                           {visual.value != null ? visual.value.toLocaleString() : 'N/A'}
//                         </span>
//                         {visual.format && (
//                           <span className="text-xs text-muted-foreground">
//                             ({visual.format})
//                           </span>
//                         )}
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* No Results State */}
//         {!hasCards && !hasCharts && (
//           <div className="text-center py-16">
//             <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
//             <p className="text-xl text-foreground">No results generated</p>
//             <p className="text-muted-foreground mt-2">The query returned no data or visuals</p>
//           </div>
//         )}
//       </div>

//       {/* Footer */}
//       <div className="px-6 py-4 border-t border-border">
//         <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
//           <ArrowLeft className="w-4 h-4" />
//           Back to Chat
//         </Button>
//       </div>
//     </div>
//   );
// }

import { DataFile } from '@/components/types/dashboard';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft,
  Download,
  Share2,
  BarChart3,
  TrendingUp,
  FileText,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { PowerBIFlow } from '@/components/powerbi/PowerBIFlow';
import { useNavigate } from 'react-router-dom';
import { Workflowheader } from '../WorkFlowHeader1';


interface DashboardPreviewProps {
  dashboardData: any;
  file: DataFile;
  query: string;
  onBack: () => void;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

// Change the function name from DashboardPreview to DashboardPreview1
export function DashBoardPreview1({ dashboardData, file, query, onBack }: DashboardPreviewProps) {
  const visuals = dashboardData?.visuals || [];
  const totalRows = dashboardData?.total_rows || 0;
  const totalVisualsGenerated = dashboardData?.total_visuals_generated || 0;
  const navigate = useNavigate();



  // Display ALL visuals (including non-card types) as cards in Key Results section
  // Separate visuals by type
  const cardVisuals = visuals.filter((v: any) => v.chart_type === 'card');
  const chartVisuals = visuals.filter((v: any) => v.chart_type !== 'card');

  const hasCards = cardVisuals.length > 0;
  const hasCharts = chartVisuals.length > 0;
  return (
    <div className="min-h-screen bg-background flex flex-col">
     
       <Workflowheader />
            

      {/* Main Content */}
      {/* <div className="flex-1 max-w-7xl mx-auto px-6 py-6 w-full space-y-8"> */}
      <div className="flex-1 max-w-7xl mx-auto px-6 pt-8 pb-12 w-full space-y-8">

        {/* Metadata Section */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-4 animate-fade-in">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Source</span>
              <span className="text-sm font-semibold text-foreground">{file.name}</span>
            </div>
            <div className="flex items-start gap-2">
              <MessageSquare className="w-4 h-4 text-primary mt-0.5" />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Query</span>
              <p className="text-sm text-foreground max-w-xl">{query}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 lg:ml-auto">
            {/* <Button variant="outline" size="sm" className="gap-2 h-8 text-xs"> */}
            {/* <Button variant="outline" size="sm" className="gap-2 h-8 text-xs" onClick={() => setShowPowerBIFlow(true)}> */}
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 h-8 text-xs"
              onClick={() => {
                // Navigate to Power BI flow page and pass file name via state
                // navigate('/workflow/powerbi-flow');
                navigate('/workflow/powerbi-flow?from=analysis1');
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
              Deploy to Power BI
            </Button>
            <Button variant="default" size="sm" className="gap-2 h-8 text-xs bg-primary hover:bg-primary/90">
              <Download className="w-3.5 h-3.5" />
              Download Dataset
            </Button>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex flex-wrap items-center gap-3 text-xs animate-fade-in">
          <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
            {cardVisuals.length} KPIs
          </span>
          <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
            {totalRows} Records
          </span>
          <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">
            {totalVisualsGenerated} Visuals Defined
          </span>
        </div>

        {/* Key Results Section (Cards/KPIs) */}
        {hasCards && (
          <div className="animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">Key Results</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {cardVisuals.map((card: any, index: number) => (
                <div
                  key={index}
                  className="p-4 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col gap-2">
                    <p className="text-xs text-muted-foreground truncate">{card.chart_name}</p>
                    <p className="text-2xl font-bold text-foreground font-mono">
                      {card.value != null ? card.value : 'N/A'}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {card.description || 'Result from query'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}



        {/* Visualizations Section (Charts) */}
        {hasCharts && (
          <div className="animate-slide-up">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">Visualizations</span>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {chartVisuals.map((chart: any, index: number) => (
                <div
                  key={index}
                  className="p-5 rounded-xl border border-border bg-card hover:shadow-lg transition-shadow"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-foreground">{chart.chart_name}</h3>
                      <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium capitalize">
                        {chart.chart_type}
                      </span>
                    </div>
                    {chart.description && (
                      <p className="text-xs text-muted-foreground">{chart.description}</p>
                    )}

                    {/* Placeholder for actual chart rendering */}
                    <div className="h-64 rounded-lg bg-muted/30 border border-border/50 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          {chart.chart_type.charAt(0).toUpperCase() + chart.chart_type.slice(1)} Chart
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          Ready for Power BI integration
                        </p>
                      </div>
                    </div>

                    {/* Display chart configuration details if available */}
                    {(chart.x_axis || chart.y_axis || chart.legend) && (
                      <div className="text-xs space-y-1 pt-2 border-t border-border/50">
                        {chart.x_axis && (
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">X-Axis:</span> {chart.x_axis}
                          </p>
                        )}
                        {chart.y_axis && (
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Y-Axis:</span> {chart.y_axis}
                          </p>
                        )}
                        {chart.legend && (
                          <p className="text-muted-foreground">
                            <span className="font-medium text-foreground">Legend:</span> {chart.legend}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results State */}
        {!hasCards && !hasCharts && (
          <div className="text-center py-16">
            <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-foreground">No results generated</p>
            <p className="text-muted-foreground mt-2">The query returned no data or visuals</p>
          </div>
        )}
      </div>

    </div>
  );
}