import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Wrench, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
 
interface AnalysisCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onQuickFix: () => void;
  validationResult: any; // from run_dq_validation
}
 
export function AnalysisCompleteDialog({
  open,
  onOpenChange,
  onQuickFix,
  validationResult,
}: AnalysisCompleteDialogProps) {
  const [editingRule, setEditingRule] = useState<string | null>(null);
  const [editedData, setEditedData] = useState<{ reason: string; solution: string }>({
    reason: "",
    solution: "",
  });
 
  const failedIssues = validationResult?.issues || {};
  const failedCount = Object.keys(failedIssues).length;
 
  const handleEditClick = (column: string, reason: string, solution: string) => {
    setEditingRule(column);
    setEditedData({ reason, solution });
  };
 
  const handleSaveEdit = () => {
    toast.success("Changes saved");
    setEditingRule(null);
  };
 
  if (failedCount === 0) {
    return null; // shouldn't happen
  }
 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[900px] max-h-[80vh] flex flex-col bg-card border-2 border-border">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-full"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>
 
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Analysis Complete</DialogTitle>
        </DialogHeader>
 
        <div className="space-y-4 overflow-y-auto flex-1 pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
          <p className="text-muted-foreground">
            Found {failedCount} issue{failedCount !== 1 ? "s" : ""} that can be automatically resolved
          </p>
 
          <div className="space-y-4">
            {Object.entries(failedIssues).map(([column, data]: [string, any]) => (
              <div
                key={column}
                className="border border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-900 rounded-lg p-4"
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-base font-semibold text-orange-900 dark:text-orange-400">
                    Rule: {data.rule || column}
                  </h3>
                  {editingRule === column ? (
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="h-8" onClick={handleSaveEdit}>
                        Save
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8" onClick={() => setEditingRule(null)}>
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8"
                      onClick={() =>
                        handleEditClick(column, data.reason_for_failure, validationResult.proposed_solutions?.[column] || "")
                      }
                    >
                      Edit
                    </Button>
                  )}
                </div>
 
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-400 mb-0.5">
                      Reason for Failure:
                    </p>
                    {editingRule === column ? (
                      <textarea
                        value={editedData.reason}
                        onChange={(e) => setEditedData({ ...editedData, reason: e.target.value })}
                        className="w-full bg-background border border-border rounded px-2 py-1 text-foreground min-h-[60px]"
                      />
                    ) : (
                      <p className="text-orange-800 dark:text-orange-300">{data.reason_for_failure}</p>
                    )}
                  </div>
 
                  <div>
                    <p className="font-medium text-orange-900 dark:text-orange-400 mb-0.5">
                      Proposed Solution:
                    </p>
                    {editingRule === column ? (
                      <textarea
                        value={editedData.solution}
                        onChange={(e) => setEditedData({ ...editedData, solution: e.target.value })}
                        className="w-full bg-background border border-border rounded px-2 py-1 text-foreground min-h-[60px]"
                      />
                    ) : (
                      <p className="text-orange-800 dark:text-orange-300">
                        {validationResult.proposed_solutions?.[column] || "No solution proposed"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
 
        <div className="flex gap-3 justify-end pt-4 border-t border-border mt-4 bg-card">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onQuickFix} className="bg-primary hover:bg-primary/90">
            <Wrench className="h-4 w-4 mr-2" />
            Quick Fix
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
 