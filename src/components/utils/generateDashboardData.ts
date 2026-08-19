import { DashboardData, DataFile } from '@/components/types/dashboard';

export function generateDashboardData(file: DataFile, query: string): DashboardData {
  // Parse query to determine what kind of data to generate
  const lowerQuery = query.toLowerCase();
  const isSalesQuery = lowerQuery.includes('sales');
  const isRevenueQuery = lowerQuery.includes('revenue');
  const isCustomerQuery = lowerQuery.includes('customer') || lowerQuery.includes('user');
  
  // Generate KPIs based on query context
  const kpis = [
    {
      id: '1',
      label: isSalesQuery ? 'Total Sales' : isRevenueQuery ? 'Total Revenue' : 'Total Records',
      value: isSalesQuery ? '$1.2M' : isRevenueQuery ? '$2.4M' : '15,230',
      change: 12.5,
      changeLabel: '+12.5%',
    },
    {
      id: '2',
      label: isCustomerQuery ? 'Active Users' : 'Transactions',
      value: isCustomerQuery ? '15,230' : '8,542',
      change: 8.2,
      changeLabel: '+8.2%',
    },
    {
      id: '3',
      label: 'Conversion Rate',
      value: '4.8%',
      change: -1.1,
      changeLabel: '-1.1%',
    },
    {
      id: '4',
      label: 'Avg. Session Duration',
      value: '3m 45s',
      change: 5.0,
      changeLabel: '+5.0%',
    },
  ];

  // Generate monthly trend data
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const lineChartData = months.slice(0, 6).map((month, index) => ({
    name: month,
    value: Math.floor(50000 + Math.random() * 50000 + index * 10000),
    target: Math.floor(55000 + index * 12000),
  }));

  // Generate category distribution
  const categories = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Stationery'];
  const pieChartData = categories.map((cat) => ({
    name: cat,
    value: Math.floor(10 + Math.random() * 35),
  }));

  // Generate regional data
  const regions = ['North America', 'Europe', 'Asia', 'South America', 'Africa'];
  const barChartData = regions.map((region) => ({
    name: region,
    value: Math.floor(1000 + Math.random() * 4000),
  }));

  // Generate table data
  const products = [
    { name: 'Quantum Laptop', category: 'Electronics' },
    { name: 'Nova Smartwatch', category: 'Electronics' },
    { name: 'Aero Jacket', category: 'Clothing' },
    { name: 'Echo Headphones', category: 'Electronics' },
    { name: 'Terra Backpack', category: 'Accessories' },
  ];
  
  const tableData = products.map((product) => ({
    ...product,
    unitsSold: Math.floor(500 + Math.random() * 2000),
    revenue: Math.floor(50000 + Math.random() * 450000),
  }));

  return {
    kpis,
    lineChartData,
    pieChartData,
    barChartData,
    tableData,
  };
}
