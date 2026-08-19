export interface DataFile {
  id: string;
  name: string;
  columns: number;
  rows: number;
  createdAt: string;
  type: 'csv' | 'excel' | 'json';
  dateModified?: string;
  csvBlob?: string;
  previewData: {
    headers: string[];
    rows: (string | number)[][];
  };
}

export interface KPI {
  id: string;
  label: string;
  value: string;
  change: number;
  changeLabel: string;
}

export interface ChartData {
  name: string;
  value: number;
  [key: string]: string | number;
}

export interface DashboardData {
  kpis: KPI[];
  lineChartData: ChartData[];
  pieChartData: ChartData[];
  barChartData: ChartData[];
  tableData: {
    name: string;
    category: string;
    unitsSold: number;
    revenue: number;
  }[];
}

export interface InsightQuery {
  query: string;
  file: DataFile | null;
}