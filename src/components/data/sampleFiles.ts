import { DataFile} from '@/components/types/dashboard';

export const sampleFiles: DataFile[] = [
  {
    id: '1',
    name: 'sales_data_2024',
    columns: 8,
    rows: 15420,
    createdAt: '2024-12-01T10:30:00Z',
    type: 'csv',
    previewData: {
      headers: ['Date', 'Product', 'Region', 'Units', 'Revenue', 'Cost', 'Profit', 'Category'],
      rows: [
        ['2024-01-15', 'Laptop Pro', 'North', 45, 67500, 40500, 27000, 'Electronics'],
        ['2024-01-16', 'Wireless Mouse', 'South', 120, 3600, 1800, 1800, 'Accessories'],
        ['2024-01-17', 'USB-C Hub', 'East', 85, 4250, 2125, 2125, 'Accessories'],
        ['2024-01-18', 'Monitor 27"', 'West', 32, 12800, 8000, 4800, 'Electronics'],
      ],
    },
  },
  {
    id: '2',
    name: 'customer_analytics',
    columns: 12,
    rows: 8750,
    createdAt: '2024-11-28T14:55:43Z',
    type: 'excel',
    previewData: {
      headers: ['Customer ID', 'Name', 'Email', 'Segment', 'LTV', 'Orders', 'Last Purchase'],
      rows: [
        ['C001', 'John Smith', 'john@email.com', 'Premium', 4520, 12, '2024-11-25'],
        ['C002', 'Sarah Wilson', 'sarah@email.com', 'Standard', 1890, 5, '2024-11-20'],
        ['C003', 'Mike Johnson', 'mike@email.com', 'Premium', 6780, 18, '2024-11-28'],
        ['C004', 'Emily Davis', 'emily@email.com', 'Basic', 450, 2, '2024-10-15'],
      ],
    },
  },
  {
    id: '3',
    name: 'product_inventory',
    columns: 6,
    rows: 3200,
    createdAt: '2024-11-25T09:15:00Z',
    type: 'csv',
    previewData: {
      headers: ['SKU', 'Product Name', 'Stock', 'Reorder Level', 'Supplier', 'Unit Price'],
      rows: [
        ['SKU-001', 'Laptop Pro 15"', 145, 50, 'TechSupply Co', 1500],
        ['SKU-002', 'Wireless Keyboard', 320, 100, 'Peripherals Inc', 89],
        ['SKU-003', 'Gaming Headset', 78, 30, 'AudioTech Ltd', 199],
        ['SKU-004', 'Webcam HD', 210, 75, 'VisionPro', 129],
      ],
    },
  },
  {
    id: '4',
    name: 'marketing_campaigns',
    columns: 10,
    rows: 890,
    createdAt: '2024-11-20T16:45:00Z',
    type: 'json',
    previewData: {
      headers: ['Campaign', 'Channel', 'Budget', 'Spent', 'Impressions', 'Clicks', 'Conversions'],
      rows: [
        ['Summer Sale', 'Facebook', 15000, 12500, 450000, 8500, 320],
        ['Black Friday', 'Google Ads', 25000, 24800, 680000, 15200, 890],
        ['Holiday Promo', 'Instagram', 10000, 8900, 280000, 5600, 210],
        ['New Year Deal', 'Email', 5000, 4200, 95000, 12000, 580],
      ],
    },
  },
  {
    id: '5',
    name: 'revenue_quarterly',
    columns: 5,
    rows: 48,
    createdAt: '2024-11-15T11:00:00Z',
    type: 'excel',
    previewData: {
      headers: ['Quarter', 'Year', 'Revenue', 'Expenses', 'Net Profit'],
      rows: [
        ['Q1', 2024, 2450000, 1890000, 560000],
        ['Q2', 2024, 2780000, 2100000, 680000],
        ['Q3', 2024, 3120000, 2350000, 770000],
        ['Q4', 2024, 3580000, 2680000, 900000],
      ],
    },
  },
];
