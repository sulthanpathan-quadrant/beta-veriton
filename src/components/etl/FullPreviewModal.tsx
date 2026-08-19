
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useEffect } from "react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetName: string;
}

interface ColumnInfo {
  name: string;
  type: string;
}

interface PreviewData {
  dataset: string;
  columns: ColumnInfo[];
  rows: Record<string, any>[];
}

export default function FullPreviewModal({ open, onOpenChange, datasetName }: Props) {
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(false);

  const userId = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user") || "{}").id
    : null;
  const jobId = localStorage.getItem("current_job_id");

  useEffect(() => {
    if (!open || !datasetName || !userId || !jobId) return;

    const fetchPreview = async () => {
      setLoading(true);
      setPreviewData(null);

      try {
        const url = `http://20.81.213.147:8000/preview-dataset?user_id=${userId}&job_id=${jobId}&datasetname=${encodeURIComponent(datasetName)}`;

        const res = await fetch(url);

        if (!res.ok) throw new Error(`Preview failed: ${res.statusText}`);

        const data = await res.json();

        setPreviewData({
          dataset: data.dataset,
          columns: data.columns || [],
          rows: data.rows || [],
        });
      } catch (err: any) {
        toast.error(err.message || "Failed to load preview");
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [open, datasetName, userId, jobId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh] flex flex-col">
        <div className="mb-4">
          <h2 className="text-2xl font-bold">Full Dataset Preview</h2>
          <p className="text-muted-foreground mt-1">
            Dataset: <span className="text-primary">{datasetName}</span>
          </p>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
        ) : previewData ? (
          <div className="flex-1 overflow-auto border rounded-lg">
            <ScrollArea className="h-full">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
                  <TableRow>
                    {previewData.columns.map((col) => (
                      <TableHead key={col.name} className="whitespace-nowrap">
                        {col.name}
                        <span className="text-xs text-muted-foreground block">({col.type})</span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewData.rows.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={previewData.columns.length} className="text-center py-12 text-muted-foreground">
                        No preview data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    previewData.rows.map((row, idx) => (
                      <TableRow key={idx}>
                        {previewData.columns.map((col) => (
                          <TableCell key={col.name}>
                            {row[col.name] ?? "—"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            No data loaded
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}