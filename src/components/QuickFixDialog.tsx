import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, CheckCircle2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
 
interface QuickFixDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // progress: number;
  isComplete: boolean;
  onContinue: () => void;
  fixMessage?: string; // from run_dq_fixing API
}
 
export function QuickFixDialog({
  open,
  onOpenChange,
  // progress,
  isComplete,
  onContinue,
  fixMessage = "Data fixed and saved",
}: QuickFixDialogProps) {
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
            <h2 className="text-2xl font-bold text-foreground">Quick Fix in Progress</h2>
            <p className="text-muted-foreground mt-1">
              Applying automatic fixes to resolve data quality issues
            </p>
          </div>
 
          {!isComplete ? (
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <RefreshCw className="h-10 w-10 text-green-500 animate-spin" />
              </div>
 
              <div className="text-center">
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Applying Quick Fixes...
                </h3>
                <p className="text-muted-foreground">Resolving identified issues</p>
              </div>
 
              {/* <div className="w-full space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">
                  {Math.round(progress)}% Complete
                </p>
              </div> */}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
 
              <h3 className="text-2xl font-semibold text-green-500">
                Resolved Successfully!
              </h3>
 
              <p className="text-center text-muted-foreground">
                All data quality issues have been automatically resolved.
              </p>
 
              <div className="w-full bg-green-500/10 border border-green-500/20 rounded-lg p-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  <p className="text-lg font-semibold text-green-500 text-center">
                    {fixMessage}
                  </p>
                </div>
                <p className="text-center text-muted-foreground">
                  Data quality score: 100%
                </p>
              </div>
 
              <Button className="w-full" size="lg" onClick={onContinue}>
                Continue
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
 