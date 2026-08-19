// import { KPI } from '@/components/types/dashboard';
// import { cn } from '@/lib/utils';
// import { TrendingUp, TrendingDown } from 'lucide-react';
 
// interface KPICardProps {
//   kpi: KPI;
//   delay?: number;
// }
 
// export function KPICard({ kpi, delay = 0 }: KPICardProps) {
//   const isPositive = kpi.change >= 0;
 
//   return (
//     <div
//       className="relative overflow-hidden rounded-lg border border-primary/30 bg-card p-4 transition-all duration-300 hover:border-primary hover:shadow-[0_0_20px_hsl(199_89%_48%/0.1)] animate-slide-up opacity-0"
//       style={{ animationDelay: `${delay}ms` }}
//     >
//       <div className="flex items-center justify-between gap-3">
//         <div className="min-w-0 flex-1">
//           <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
//           <p className="text-lg font-bold text-foreground font-mono mt-0.5">{kpi.value}</p>
//         </div>
//         <div className={cn(
//           'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0',
//           isPositive ? 'text-chart-green bg-chart-green/10' : 'text-destructive bg-destructive/10'
//         )}>
//           {isPositive ? (
//             <TrendingUp className="w-3 h-3" />
//           ) : (
//             <TrendingDown className="w-3 h-3" />
//           )}
//           <span>{kpi.changeLabel}</span>
//         </div>
//       </div>
//     </div>
//   );
// }
 
 
import { KPI } from '@/components/types/dashboard';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';
 
interface KPICardProps {
  kpi: KPI;
  delay?: number;
}
 
export function KPICard({ kpi, delay = 0 }: KPICardProps) {
  const isPositive = kpi.change >= 0;
 
  return (
    <div
      className="relative  overflow-hidden rounded-lg border border-primary/30 bg-card p-4 transition-all duration-300 hover:border-primary hover:shadow-[0_0_20px_hsl(199_89%_48%/0.1)] animate-slide-up opacity-0"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="items-center justify-between gap-4">
        <div className=" w-50 flex justify-between">
          <p className="text-xs font-bold text-muted-foreground truncate">{kpi.label}</p>
          <p className="text-m font-bold text-foreground font-mono mt-0.5">{kpi.value}</p>
        </div>
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full shrink-0',
          isPositive ? 'text-emerald-500 bg-emerald-500/10' : 'text-destructive bg-destructive/10'
        )}>
          {isPositive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{kpi.changeLabel}</span>
        </div>
      </div>
    </div>
  );
}
 
 