// src/components/etl/EtlActionChoice.tsx
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Props {
  onSchedule: () => void;
  onBusinessRules: () => void;
  onBack: () => void;
}

export default function EtlActionChoice({ onSchedule, onBusinessRules, onBack }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Next Steps</h2>

      <div className="grid grid-cols-2 gap-6">
        <div
          className="border rounded-lg p-6 hover:border-primary cursor-pointer transition-colors"
          onClick={onSchedule}
        >
          <h4 className="font-medium text-lg">Schedule Job</h4>
          <p className="text-sm text-muted-foreground mt-2">
            Automate this ETL pipeline on a schedule
          </p>
        </div>

        <div
          className="border rounded-lg p-6 hover:border-primary cursor-pointer transition-colors"
          onClick={onBusinessRules}
        >
          <h4 className="font-medium text-lg">Apply Business Rules</h4>
          <p className="text-sm text-muted-foreground mt-2">
            Add validation and transformation logic
          </p>
        </div>
      </div>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Preview
        </Button>
      </div>
    </div>
  );
}