interface ProductTableProps {
  data: {
    name: string;
    category: string;
    unitsSold: number;
    revenue: number;
  }[];
}

export function ProductTable({ data }: ProductTableProps) {
  return (
    <div className="chart-container animate-slide-up opacity-0 stagger-3">
      <h3 className="text-lg font-semibold text-foreground mb-4">Top Performing Products</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Product Name</th>
              <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Category</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Units Sold</th>
              <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Revenue</th>
            </tr>
          </thead>
          <tbody>
            {data.map((product, index) => (
              <tr 
                key={index} 
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <td className="py-3 px-2 text-sm font-medium text-foreground">{product.name}</td>
                <td className="py-3 px-2 text-sm text-primary">{product.category}</td>
                <td className="py-3 px-2 text-sm text-foreground text-right font-mono">
                  {product.unitsSold.toLocaleString()}
                </td>
                <td className="py-3 px-2 text-sm text-foreground text-right font-mono">
                  ${product.revenue.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
