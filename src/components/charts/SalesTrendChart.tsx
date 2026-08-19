import { ChartData } from '@/components/types/dashboard';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface SalesTrendChartProps {
  data: ChartData[];
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  return (
    <div className="chart-container animate-slide-up opacity-0 stagger-2">
      <h3 className="text-lg font-semibold text-foreground mb-4">Monthly Sales Trend</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" />
            <XAxis 
              dataKey="name" 
              stroke="hsl(215 20% 55%)" 
              fontSize={12}
              tickLine={false}
            />
            <YAxis 
              stroke="hsl(215 20% 55%)" 
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222 47% 8%)',
                border: '1px solid hsl(217 33% 17%)',
                borderRadius: '8px',
                color: 'hsl(210 40% 98%)',
              }}
              formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              name="Sales"
              stroke="hsl(199 89% 48%)"
              strokeWidth={2}
              dot={{ fill: 'hsl(199 89% 48%)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(199 89% 65%)' }}
            />
            <Line
              type="monotone"
              dataKey="target"
              name="Target"
              stroke="hsl(215 20% 55%)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
