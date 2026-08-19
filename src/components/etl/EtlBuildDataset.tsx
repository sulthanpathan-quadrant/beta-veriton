// src/components/etl/EtlBuildDataset.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TableIcon, ChevronDown, ChevronUp, Plus, Trash2, Save, ArrowLeft } from "lucide-react";
import { toast } from "sonner"; // ← Make sure you're importing from sonner

interface Column {
  name: string;
  table: string;
  type: string;
}

interface Props {
  selectedTables: string[];
  customDatasetName: string;
  setCustomDatasetName: (name: string) => void;
  selectedColumns: Column[];
  setSelectedColumns: (cols: Column[]) => void;
  onBuildComplete: (dataset: { name: string; columns: Column[] }) => void;
  onBack: () => void;
}

export default function EtlBuildDataset({
  selectedTables,
  customDatasetName,
  setCustomDatasetName,
  selectedColumns,
  setSelectedColumns,
  onBuildComplete,
  onBack,
}: Props) {
  const [collapsedTables, setCollapsedTables] = useState<Record<string, boolean>>({});
  const userId = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}").id
    : null;
  const jobId = localStorage.getItem("current_job_id");

  const toggleTableCollapse = (tableName: string) => {
    setCollapsedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }));
  };

  // Placeholder for drag & drop logic (add your full implementation)
  const handleDragStart = (column: Column) => {
    // Your drag logic here
  };

  const handleSaveDataset = async () => {
    if (selectedColumns.length === 0) {
      toast.error("No Columns Selected", {
        description: "Please select at least one column",
      });
      return;
    }

    if (!userId || !jobId) {
      toast.error("Missing credentials", {
        description: "User/Job ID not found",
      });
      return;
    }

    // Group columns by original table (dataset_name)
    const selectionsByTable = selectedColumns.reduce((acc: Record<string, string[]>, col) => {
      if (!acc[col.table]) acc[col.table] = [];
      acc[col.table].push(col.name);
      return acc;
    }, {});

    const selections = Object.entries(selectionsByTable).map(([dataset_name, columns]) => ({
      dataset_name,
      columns,
    }));

    const payload = {
      user_id: userId,
      job_id: jobId,
      microdataset_name: customDatasetName.trim(),
      selections,
    };

    try {
      const res = await fetch("http://20.81.213.147:8000/createmicrodataset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || `Failed (${res.status})`);
      }

      toast.success(`Micro dataset "${customDatasetName}" created successfully!`);

      onBuildComplete({ name: customDatasetName, columns: selectedColumns });

    } catch (err: any) {
      toast.error("Failed to create micro dataset", {
        description: err.message || "Server error occurred",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-[350px,1fr] gap-6">
        {/* Left: Available Columns */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TableIcon className="h-5 w-5" />
            Available Columns
          </h2>

          <ScrollArea className="h-[600px] pr-2 bg-card/50 rounded-lg">
            {/* Render your tables + columns here (same as original) */}
            {/* ... your drag source UI ... */}
          </ScrollArea>
        </div>

        {/* Right: Custom Dataset */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Your Custom Dataset
          </h2>

          <div className="space-y-2">
            <label className="text-sm font-medium">Dataset Name</label>
            <Input
              value={customDatasetName}
              onChange={(e) => setCustomDatasetName(e.target.value)}
              placeholder="Enter dataset name"
            />
          </div>

          {/* Drop zone */}
          <div className="border-2 border-dashed border-border rounded-lg bg-card/50 min-h-[400px]">
            {/* Your drop zone + selected columns list */}
          </div>

          <Button
            className="w-full"
            onClick={handleSaveDataset}
            disabled={selectedColumns.length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Build Dataset
          </Button>
        </div>
      </div>

      <div className="flex justify-start">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Selection
        </Button>
      </div>
    </div>
  );
}