import { ChartData } from '@/components/types/dashboard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RegionBarChartProps {
  data: ChartData[];
}

export function RegionBarChart({ data }: RegionBarChartProps) {
  return (
    <div className="chart-container animate-slide-up opacity-0 stagger-4">
      <h3 className="text-lg font-semibold text-foreground mb-4">User Demographics by Region</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(217 33% 17%)" vertical={false} />
            <XAxis 
              dataKey="name" 
              stroke="hsl(215 20% 55%)" 
              fontSize={11}
              tickLine={false}
              angle={-45}
              textAnchor="end"
              interval={0}
            />
            <YAxis 
              stroke="hsl(215 20% 55%)" 
              fontSize={12}
              tickLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222 47% 8%)',
                border: '1px solid hsl(217 33% 17%)',
                borderRadius: '8px',
                color: 'hsl(210 40% 98%)',
              }}
              formatter={(value: number) => [value.toLocaleString(), 'Users']}
              cursor={{ fill: 'hsl(199 89% 48% / 0.1)' }}
            />
            <Bar 
              dataKey="value" 
              fill="hsl(199 89% 48%)" 
              radius={[4, 4, 0, 0]}
              maxBarSize={60}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
