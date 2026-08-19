import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Wand2 } from 'lucide-react';

interface InsightInputProps {
  onSubmit: (query: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

export function InsightInput({ onSubmit, isLoading, disabled }: InsightInputProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !disabled) {
      onSubmit(query.trim());
    }
  };

  const exampleQueries = [
    'Show me sales data for the past year',
    'Analyze customer demographics by region',
    'Compare revenue trends across categories',
  ];

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            <label className="text-sm font-medium text-foreground">What insights do you want?</label>
          </div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., I want to see sales data for the past 1 year with monthly trends..."
            className="w-full min-h-[100px] resize-none rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
            disabled={disabled}
          />
        </div>
        
        <Button
          type="submit"
          variant="glow"
          className="gap-2 h-10 px-6"
          disabled={!query.trim() || disabled || isLoading}
        >
          <Wand2 className="w-4 h-4" />
          Generate Dashboard
        </Button>
      </form>

      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">Quick suggestions:</p>
        <div className="flex flex-wrap gap-2">
          {exampleQueries.map((example, index) => (
            <button
              key={index}
              onClick={() => setQuery(example)}
              disabled={disabled}
              className="text-xs px-3 py-1.5 rounded-full border border-border bg-secondary/50 text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}