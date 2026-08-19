import { DataFile, KPI } from '@/components/types/dashboard';
import { FileText, Table, FileJson, TrendingUp, TrendingDown, Sparkles, X, Check, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface FilePreviewPanelProps {
  file: DataFile;
  onClose: () => void;
  onGenerateFromKPIs: (kpis: KPI[]) => void;
  onGenerateFromQuery: (query: string) => void;
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

// Generate intelligent KPIs based on file type and data
function generateFileKPIs(file: DataFile): KPI[] {
  const headers = file.previewData.headers;
  const rows = file.previewData.rows;
  const fileName = file.name.toLowerCase();
  
  // Detect file context and generate relevant KPIs
  const kpis: KPI[] = [];
  
  // Sales/Revenue focused file
  if (fileName.includes('sales') || fileName.includes('revenue')) {
    const revenueIdx = headers.findIndex(h => h.toLowerCase().includes('revenue'));
    const profitIdx = headers.findIndex(h => h.toLowerCase().includes('profit'));
    const unitsIdx = headers.findIndex(h => h.toLowerCase().includes('units'));
    
    if (revenueIdx >= 0) {
      const total = rows.reduce((sum, row) => sum + (Number(row[revenueIdx]) || 0), 0);
      kpis.push({
        id: 'total-revenue',
        label: 'Total Revenue',
        value: `$${(total / 1000).toFixed(1)}K`,
        change: 15.3,
        changeLabel: '+15.3% vs last period',
      });
    }
    
    if (profitIdx >= 0) {
      const total = rows.reduce((sum, row) => sum + (Number(row[profitIdx]) || 0), 0);
      kpis.push({
        id: 'total-profit',
        label: 'Total Profit',
        value: `$${(total / 1000).toFixed(1)}K`,
        change: 12.8,
        changeLabel: '+12.8% vs last period',
      });
    }
    
    if (unitsIdx >= 0) {
      const total = rows.reduce((sum, row) => sum + (Number(row[unitsIdx]) || 0), 0);
      kpis.push({
        id: 'units-sold',
        label: 'Units Sold',
        value: total.toLocaleString(),
        change: 8.5,
        changeLabel: '+8.5% vs last period',
      });
    }
    
    kpis.push({
      id: 'avg-order-value',
      label: 'Avg. Order Value',
      value: '$1,245',
      change: 5.2,
      changeLabel: '+5.2% vs last period',
    });
  }
  
  // Customer focused file
  else if (fileName.includes('customer')) {
    const ltvIdx = headers.findIndex(h => h.toLowerCase().includes('ltv'));
    const ordersIdx = headers.findIndex(h => h.toLowerCase().includes('orders'));
    
    kpis.push({
      id: 'total-customers',
      label: 'Total Customers',
      value: file.rows.toLocaleString(),
      change: 18.2,
      changeLabel: '+18.2% vs last period',
    });
    
    if (ltvIdx >= 0) {
      const avg = rows.reduce((sum, row) => sum + (Number(row[ltvIdx]) || 0), 0) / rows.length;
      kpis.push({
        id: 'avg-ltv',
        label: 'Avg. Customer LTV',
        value: `$${avg.toFixed(0)}`,
        change: 9.4,
        changeLabel: '+9.4% vs last period',
      });
    }
    
    kpis.push({
      id: 'retention-rate',
      label: 'Retention Rate',
      value: '87.5%',
      change: 3.1,
      changeLabel: '+3.1% vs last period',
    });
    
    kpis.push({
      id: 'premium-customers',
      label: 'Premium Customers',
      value: '2,450',
      change: 22.5,
      changeLabel: '+22.5% vs last period',
    });
  }
  
  // Inventory focused file
  else if (fileName.includes('inventory') || fileName.includes('product')) {
    const stockIdx = headers.findIndex(h => h.toLowerCase().includes('stock'));
    
    if (stockIdx >= 0) {
      const total = rows.reduce((sum, row) => sum + (Number(row[stockIdx]) || 0), 0);
      kpis.push({
        id: 'total-stock',
        label: 'Total Stock Units',
        value: total.toLocaleString(),
        change: -5.2,
        changeLabel: '-5.2% vs last period',
      });
    }
    
    kpis.push({
      id: 'products-count',
      label: 'Product SKUs',
      value: file.rows.toLocaleString(),
      change: 12.0,
      changeLabel: '+12.0% new products',
    });
    
    kpis.push({
      id: 'low-stock-items',
      label: 'Low Stock Alerts',
      value: '23',
      change: -15.0,
      changeLabel: '-15.0% improved',
    });
    
    kpis.push({
      id: 'stock-value',
      label: 'Total Stock Value',
      value: '$2.4M',
      change: 8.3,
      changeLabel: '+8.3% vs last period',
    });
  }
  
  // Marketing focused file
  else if (fileName.includes('marketing') || fileName.includes('campaign')) {
    const impressionsIdx = headers.findIndex(h => h.toLowerCase().includes('impressions'));
    const conversionsIdx = headers.findIndex(h => h.toLowerCase().includes('conversions'));
    
    if (impressionsIdx >= 0) {
      const total = rows.reduce((sum, row) => sum + (Number(row[impressionsIdx]) || 0), 0);
      kpis.push({
        id: 'total-impressions',
        label: 'Total Impressions',
        value: `${(total / 1000000).toFixed(1)}M`,
        change: 28.5,
        changeLabel: '+28.5% vs last period',
      });
    }
    
    if (conversionsIdx >= 0) {
      const total = rows.reduce((sum, row) => sum + (Number(row[conversionsIdx]) || 0), 0);
      kpis.push({
        id: 'total-conversions',
        label: 'Total Conversions',
        value: total.toLocaleString(),
        change: 15.8,
        changeLabel: '+15.8% vs last period',
      });
    }
    
    kpis.push({
      id: 'conversion-rate',
      label: 'Conversion Rate',
      value: '4.2%',
      change: 0.8,
      changeLabel: '+0.8% vs last period',
    });
    
    kpis.push({
      id: 'roas',
      label: 'ROAS',
      value: '3.8x',
      change: 12.0,
      changeLabel: '+12.0% vs last period',
    });
  }
  
  // Quarterly/Financial file
  else if (fileName.includes('quarterly') || fileName.includes('financial')) {
    const revenueIdx = headers.findIndex(h => h.toLowerCase().includes('revenue'));
    const expensesIdx = headers.findIndex(h => h.toLowerCase().includes('expenses'));
    const profitIdx = headers.findIndex(h => h.toLowerCase().includes('profit'));
    
    if (revenueIdx >= 0) {
      const latest = Number(rows[rows.length - 1]?.[revenueIdx]) || 0;
      kpis.push({
        id: 'quarterly-revenue',
        label: 'Q4 2024 Revenue',
        value: `$${(latest / 1000000).toFixed(2)}M`,
        change: 14.7,
        changeLabel: '+14.7% vs Q3',
      });
    }
    
    if (profitIdx >= 0) {
      const latest = Number(rows[rows.length - 1]?.[profitIdx]) || 0;
      kpis.push({
        id: 'quarterly-profit',
        label: 'Q4 2024 Net Profit',
        value: `$${(latest / 1000).toFixed(0)}K`,
        change: 16.9,
        changeLabel: '+16.9% vs Q3',
      });
    }
    
    kpis.push({
      id: 'yoy-growth',
      label: 'YoY Growth',
      value: '24.5%',
      change: 24.5,
      changeLabel: 'Strong growth',
    });
    
    kpis.push({
      id: 'profit-margin',
      label: 'Profit Margin',
      value: '25.1%',
      change: 2.3,
      changeLabel: '+2.3% vs last year',
    });
  }
  
  // Default KPIs if no specific context
  if (kpis.length === 0) {
    kpis.push(
      { id: 'records', label: 'Total Records', value: file.rows.toLocaleString(), change: 12.5, changeLabel: '+12.5% growth' },
      { id: 'data-fields', label: 'Data Fields', value: file.columns.toString(), change: 0, changeLabel: 'Stable' },
      { id: 'coverage', label: 'Data Coverage', value: '98.2%', change: 2.1, changeLabel: '+2.1% improved' },
      { id: 'quality', label: 'Data Quality', value: 'High', change: 5.0, changeLabel: '+5.0% improved' },
    );
  }
  
  // Ensure at least 4 KPIs
  while (kpis.length < 4) {
    const defaults = [
      { id: 'records', label: 'Total Records', value: file.rows.toLocaleString(), change: 12.5, changeLabel: '+12.5% growth' },
      { id: 'coverage', label: 'Data Coverage', value: '98.2%', change: 2.1, changeLabel: '+2.1% improved' },
      { id: 'quality', label: 'Data Quality Score', value: '94/100', change: 5.0, changeLabel: '+5.0 points' },
      { id: 'completeness', label: 'Completeness', value: '99.1%', change: 1.2, changeLabel: '+1.2% improved' },
    ];
    const nextDefault = defaults.find(d => !kpis.some(k => k.id === d.id));
    if (nextDefault) kpis.push(nextDefault);
    else break;
  }
  
  return kpis.slice(0, 6); // Max 6 KPIs
}

export function FilePreviewPanel({ 
  file, 
  onClose, 
  onGenerateFromKPIs, 
  onGenerateFromQuery,
  isLoading 
}: FilePreviewPanelProps) {
  const [customQuery, setCustomQuery] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [selectedKPIs, setSelectedKPIs] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<'kpi' | 'custom'>('kpi');
  
  const Icon = fileIcons[file.type];
  const iconColor = fileColors[file.type];

  // Reset state when file changes
  useEffect(() => {
    setIsAnalyzed(false);
    setIsAnalyzing(false);
    setKpis([]);
    setSelectedKPIs(new Set());
    setCustomQuery('');
    setMode('kpi');
  }, [file.id]);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    // Simulate analysis time
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const generatedKPIs = generateFileKPIs(file);
    setKpis(generatedKPIs);
    // Don't auto-select - let user select manually
    setSelectedKPIs(new Set());
    setIsAnalyzed(true);
    setIsAnalyzing(false);
  };

  const toggleKPI = (kpiId: string) => {
    const newSelected = new Set(selectedKPIs);
    if (newSelected.has(kpiId)) {
      newSelected.delete(kpiId);
    } else {
      newSelected.add(kpiId);
    }
    setSelectedKPIs(newSelected);
  };

  const handleGenerateDashboard = () => {
    if (mode === 'kpi' && selectedKPIs.size > 0) {
      const selected = kpis.filter(k => selectedKPIs.has(k.id));
      onGenerateFromKPIs(selected);
    } else if (mode === 'custom' && customQuery.trim()) {
      onGenerateFromQuery(customQuery.trim());
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-lg animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/50 bg-secondary/30">
        <div className="flex items-center gap-3">
          <div className={cn(
            'w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 border border-primary/20'
          )}>
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{file.name}</h3>
            <p className="text-xs text-muted-foreground">
              {file.columns} columns • {file.rows.toLocaleString()} rows • {file.type.toUpperCase()}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Analyze Button - Before Analysis */}
        {!isAnalyzed && !isAnalyzing && (
          <div className="flex justify-end">
            <Button 
              onClick={handleAnalyze}
              className="gap-2 px-8"
              variant="glow"
              size="lg"
            >
              <Search className="w-4 h-4" />
              Analyze File
            </Button>
          </div>
        )}

        {/* Analyzing State with Loading - Shows in KPI area */}
        {isAnalyzing && (
          <div className="py-8 flex flex-col items-center justify-center animate-fade-in">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Search className="w-5 h-5 text-primary" />
              </div>
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">Analyzing file...</p>
            <p className="text-xs text-muted-foreground mt-1">Detecting patterns and generating KPIs</p>
          </div>
        )}


        {/* After Analysis - Show KPIs and Options */}
        {isAnalyzed && (
          <>
            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 bg-secondary/50 rounded-lg">
              <button
                onClick={() => setMode('kpi')}
                className={cn(
                  'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all',
                  mode === 'kpi' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <TrendingUp className="w-4 h-4 inline mr-2" />
                Select KPIs
              </button>
              <button
                onClick={() => setMode('custom')}
                className={cn(
                  'flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all',
                  mode === 'custom' 
                    ? 'bg-primary text-primary-foreground shadow-sm' 
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                Custom Query
              </button>
            </div>

            {/* KPI Selection Mode */}
            {mode === 'kpi' && (
              <div className="space-y-3 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Detected Key Metrics
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {selectedKPIs.size} selected
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  {kpis.map((kpi) => {
                    const isSelected = selectedKPIs.has(kpi.id);
                    return (
                      <div
                        key={kpi.id}
                        onClick={() => toggleKPI(kpi.id)}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200',
                          isSelected 
                            ? 'border-primary bg-primary/10 shadow-sm' 
                            : 'border-border bg-secondary/30 hover:border-primary/50 hover:bg-primary/5'
                        )}
                      >
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={() => toggleKPI(kpi.id)}
                          className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-foreground truncate">
                              {kpi.label}
                            </p>
                            <p className="text-base font-bold text-foreground font-mono shrink-0">
                              {kpi.value}
                            </p>
                          </div>
                          <div className={cn(
                            'flex items-center gap-1 text-xs mt-0.5',
                            kpi.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                          )}>
                            {kpi.change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            <span>{kpi.changeLabel}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Query Mode */}
            {mode === 'custom' && (
              <div className="space-y-3 animate-fade-in">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  Enter Your Query
                </h4>
                <Textarea
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="Describe what insights you want... e.g., 'Show me sales trends by region with quarterly comparison'"
                  className="min-h-[100px] text-sm resize-none"
                  disabled={isLoading}
                />
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-muted-foreground">Suggestions:</span>
                  {['Monthly trends', 'Top performers', 'Regional breakdown', 'YoY comparison'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setCustomQuery(prev => prev ? `${prev}, ${suggestion.toLowerCase()}` : suggestion)}
                      className="text-xs px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground hover:bg-primary/20 hover:text-primary transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="flex justify-end">
              <Button
                onClick={handleGenerateDashboard}
                disabled={
                  isLoading || 
                  (mode === 'kpi' && selectedKPIs.size === 0) || 
                  (mode === 'custom' && !customQuery.trim())
                }
                className="gap-2 px-8"
                variant="glow"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Generating Dashboard...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Generate Dashboard
                    {mode === 'kpi' && selectedKPIs.size > 0 && (
                      <span className="text-xs opacity-75">({selectedKPIs.size} KPIs)</span>
                    )}
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
