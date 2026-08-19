// src/components/etl/EtlPreview.tsx
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Eye } from "lucide-react";

interface Props {
  builtDataset: { name: string; columns: any[] };
  onBack: () => void;
  onContinue: () => void;
  onViewFullPreview: () => void;
}

export default function EtlPreview({ builtDataset, onBack, onContinue, onViewFullPreview }: Props) {
  return (
    <div className="space-y-6">
      <div className="bg-primary/10 border border-primary/20 rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-foreground">
              <span className="font-semibold">Dataset: </span>
              <span className="text-primary text-lg">{builtDataset.name}</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {builtDataset.columns.length} columns
            </p>
          </div>
          <Button onClick={onViewFullPreview}>
            <Eye className="h-4 w-4 mr-2" />
            View Full Preview
          </Button>
        </div>
      </div>

      {/* Quick preview placeholder */}
      <div className="text-center py-12 text-muted-foreground">
        Full preview available in modal
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Button onClick={onContinue}>
          Continue
          <Play className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}