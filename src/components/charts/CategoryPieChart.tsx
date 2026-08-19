import { ChartData } from '@/components/types/dashboard';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

interface CategoryPieChartProps {
  data: ChartData[];
}

const COLORS = [
  'hsl(199 89% 48%)',
  'hsl(142 76% 36%)',
  'hsl(45 93% 47%)',
  'hsl(24 95% 53%)',
  'hsl(280 65% 60%)',
];

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  return (
    <div className="chart-container animate-slide-up opacity-0 stagger-3">
      <h3 className="text-lg font-semibold text-foreground mb-4">Sales by Product Category</h3>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              labelLine={{ stroke: 'hsl(215 20% 55%)', strokeWidth: 1 }}
            >
              {data.map((_, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]}
                  stroke="hsl(222 47% 6%)"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(222 47% 8%)',
                border: '1px solid hsl(217 33% 17%)',
                borderRadius: '8px',
                color: 'hsl(210 40% 98%)',
              }}
              formatter={(value: number) => [`${value}%`, 'Share']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
