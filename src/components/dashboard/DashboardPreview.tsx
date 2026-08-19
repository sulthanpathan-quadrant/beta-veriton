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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  Cell
} from 'recharts';
import { PowerBIFlow } from '@/components/powerbi/PowerBIFlow';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../ThemeToggle';
import { Workflowheader } from '../WorkFlowHeader1';

interface DashboardPreviewProps {
  dashboardData: any;
  file: DataFile;
  query: string;
  onBack: () => void;
}

const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

export function DashboardPreview({ dashboardData, file, query, onBack }: DashboardPreviewProps) {
  const visuals = dashboardData?.visuals || [];
  const totalRows = dashboardData?.total_rows || 0;
  const totalVisualsGenerated = dashboardData?.total_visuals_generated || 0;
  const navigate = useNavigate();
  
  
  

  // Extract card/KPI visuals (these go to "Key Results" section)
  const cardVisuals = visuals.filter((v: any) => 
    v.chart_type === 'card' || v.chart_type === 'KPI'
  );

  // Extract other chart visuals (bar, scatter, table, etc.)
  const chartVisuals = visuals.filter((v: any) => 
    !['card', 'KPI'].includes(v.chart_type)
  );

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
                // navigate('/powerbi-flow');
                navigate('/workflow/powerbi-flow?from=analysis');
               
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
          <div className="space-y-8">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              <span className="text-lg font-semibold text-foreground">Visualizations</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {chartVisuals.map((visual: any, i: number) => {
                const hasData = 
                  (visual.data?.x?.length > 0) ||
                  (visual.data?.y?.length > 0) ||
                  (visual.data?.rows?.length > 0);

                const chartType = visual.chart_type === 'column' || visual.chart_type === 'histogram' 
                  ? 'bar' 
                  : visual.chart_type;

                return (
                  <div key={i} className="bg-card rounded-xl border border-border p-6">
                    <h3 className="text-lg font-medium text-foreground mb-2">{visual.chart_name}</h3>
                    <p className="text-sm text-muted-foreground mb-6">{visual.description || 'No description'}</p>

                    {/* Bar Chart */}
                    {chartType === 'bar' && (
                      <ResponsiveContainer width="100%" height={300}>
                        {hasData ? (
                          <BarChart data={(visual.data?.x || []).map((x: any, idx: number) => ({
                            name: String(x),
                            value: visual.data?.y?.[idx] || 0
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1f2937', 
                                border: '1px solid #374151',
                                borderRadius: '8px'
                              }}
                            />
                            <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                          </BarChart>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                              <p>No data available</p>
                            </div>
                          </div>
                        )}
                      </ResponsiveContainer>
                    )}

                    {/* Scatter Chart */}
                    {chartType === 'scatter' && (
                      <ResponsiveContainer width="100%" height={300}>
                        {hasData ? (
                          <ScatterChart>
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis type="number" dataKey="x" stroke="#9ca3af" />
                            <YAxis type="number" dataKey="y" stroke="#9ca3af" />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1f2937', 
                                border: '1px solid #374151',
                                borderRadius: '8px'
                              }}
                            />
                            <Scatter 
                              data={(visual.data?.x || []).map((xValue: any, idx: number) => ({
                                x: Number(xValue),
                                y: Number(visual.data?.y?.[idx] || 0)
                              }))}
                              fill="#3b82f6"
                            >
                              {(visual.data?.x || []).map((_: any, index: number) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Scatter>
                          </ScatterChart>
                        ) : (
                          <div className="h-full flex items-center justify-center text-muted-foreground">
                            <div className="text-center">
                              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                              <p>No data available</p>
                            </div>
                          </div>
                        )}
                      </ResponsiveContainer>
                    )}

                    {/* Table */}
                    {chartType === 'table' && (
                      <div className="overflow-x-auto">
                        {hasData && visual.data?.rows?.length > 0 ? (
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border">
                                {Object.keys(visual.data.rows[0]).map((header: string) => (
                                  <th key={header} className="px-4 py-2 text-left font-medium text-muted-foreground">
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {visual.data.rows.slice(0, 20).map((row: any, rowIdx: number) => (
                                <tr key={rowIdx} className="border-b border-border/50">
                                  {Object.values(row).map((value: any, cellIdx: number) => (
                                    <td key={cellIdx} className="px-4 py-2 text-foreground">
                                      {value}
                                    </td>
                                  ))}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                            <p>No rows available</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
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

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" />
          Back to Chat
        </Button>
      </div>
    </div>
  );
}