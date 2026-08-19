// src/components/etl/EtlBusinessRules.tsx
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Props {
  onBack: () => void;
}

export default function EtlBusinessRules({ onBack }: Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">Business Rules</h2>

      <div className="border rounded-lg p-6 bg-card">
        <p className="text-muted-foreground">Business rules management coming soon...</p>
      </div>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
    </div>
  );
}