import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
 
interface ValidationProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // progress: number;
  rulesCount: number;
}
 
export function ValidationProgressDialog({
  open,
  onOpenChange,
  // progress,
  rulesCount,
}: ValidationProgressDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 rounded-full"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>
 
        <div className="space-y-6 py-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">DQ Rules Validation</h2>
            <p className="text-muted-foreground mt-1">
              Running validation on all configured data quality rules
            </p>
          </div>
 
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <RefreshCw className="h-10 w-10 text-primary animate-spin" />
            </div>
 
            <div className="text-center">
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Validating Rules...
              </h3>
              <p className="text-muted-foreground">
                Checking data against {rulesCount} configured rule{rulesCount !== 1 ? "s" : ""}
              </p>
            </div>
 
            {/* <div className="w-full space-y-2">
              <Progress value={progress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </p>
            </div> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
 