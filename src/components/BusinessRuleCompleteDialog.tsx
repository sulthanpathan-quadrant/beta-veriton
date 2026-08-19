// import { Dialog, DialogContent } from "@/components/ui/dialog";
// import { CheckCircle2, X, Calendar, ArrowRight } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { useNavigate } from "react-router-dom";

// interface BusinessRuleCompleteDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onContinue: () => void;
//   isETLFlow?: boolean;
// }

// export function BusinessRuleCompleteDialog({
//   open,
//   onOpenChange,
//   onContinue,
//   isETLFlow = false,
// }: BusinessRuleCompleteDialogProps) {
//   const navigate = useNavigate();

//   const handleContinue = () => {
//     onOpenChange(false);
//     if (isETLFlow) {
//       navigate("/schedule-job");
//     } else {
//       navigate("/workflow/path-selection");
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="sm:max-w-[600px]">
//         <Button
//           variant="ghost"
//           size="icon"
//           className="absolute right-4 top-4 rounded-full"
//           onClick={() => onOpenChange(false)}
//         >
//           <X className="h-4 w-4" />
//         </Button>

//         <div className="space-y-6 py-6">
//           <div>
//             <h2 className="text-2xl font-bold text-foreground">Business Rules Validation</h2>
//             <p className="text-muted-foreground mt-1">
//               Running validation on all configured business logic rules
//             </p>
//           </div>

//           <div className="flex flex-col items-center gap-6">
//             <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
//               <CheckCircle2 className="h-10 w-10 text-green-500" />
//             </div>

//             <h3 className="text-2xl font-semibold text-green-500">
//               Validation Complete!
//             </h3>

//             <div className="w-full bg-green-500/10 rounded-lg p-6 text-center">
//               <p className="text-lg font-semibold text-green-500">
//                 Business rules applied successfully
//               </p>
//             </div>

//             <div className="flex gap-3 w-full">
//               <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
//                 Edit Business Rules
//               </Button>
//               <Button className="flex-1" onClick={handleContinue}>
//                 {isETLFlow ? (
//                   <>
//                     <Calendar className="h-4 w-4 mr-2" />
//                     Schedule Job
//                   </>
//                 ) : (
//                   <>
//                     <ArrowRight className="h-4 w-4 mr-2" />
//                     Continue to Path Selection
//                   </>
//                 )}
//               </Button>
//             </div>
//           </div>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }




import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle2, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface BusinessRuleCompleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContinue: () => void;
  jobInfo: { correlation_id?: string; databricks_run_id?: string; message?: string } | null;
  isETLFlow?: boolean;
}

export function BusinessRuleCompleteDialog({
  open,
  onOpenChange,
  onContinue,
  jobInfo,
  isETLFlow = false,
}: BusinessRuleCompleteDialogProps) {
  const navigate = useNavigate();

  const handleContinue = () => {
    onOpenChange(false);
    onContinue();
  };

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
            <h2 className="text-2xl font-bold text-foreground">Business Rules Validation</h2>
            <p className="text-muted-foreground mt-1">
            Running validation on all configured business logic rules
            </p>
          </div>

          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>

            <h3 className="text-2xl font-semibold text-green-500">
            Validation Complete!
            </h3>

            {/* Success box + Job Info */}
            <div className="w-full bg-green-500/10 rounded-lg p-6 space-y-4">
              <p className="text-center text-lg font-semibold text-green-600">
              Business rules applied successfully
              </p>

              {/* {jobInfo && (
                <div className="text-sm space-y-2 text-muted-foreground">
                  {jobInfo.message && (
                    <p>
                      <strong>Status:</strong> {jobInfo.message}
                    </p>
                  )}
                  {jobInfo.correlation_id && (
                    <p>
                      <strong>Correlation ID:</strong> {jobInfo.correlation_id}
                    </p>
                  )}
                  {jobInfo.databricks_run_id && (
                    <p>
                      <strong>Databricks Run ID:</strong> {jobInfo.databricks_run_id}
                    </p>
                  )}
                </div>
              )} */}
            </div>

            {/* <div className="flex gap-3 w-full">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>

              <Button className="flex-1" onClick={handleContinue}>
                <ArrowRight className="h-4 w-4 mr-2" />
                Continue to Path Selection
              </Button>
            </div> */}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}