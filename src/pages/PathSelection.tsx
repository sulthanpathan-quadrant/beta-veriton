// import { useState } from "react";
// import { WorkflowLayout } from "@/components/WorkflowLayout";
// import { Button } from "@/components/ui/button";
// import { Workflow, PieChart, Brain, ArrowLeft } from "lucide-react";
// import { useNavigate } from "react-router-dom";

// export default function PathSelection() {
//   const navigate = useNavigate();
//   const [selectedPath, setSelectedPath] = useState<string>("Power BI Dashboard");
//   const [loading, setLoading] = useState(false);

// const handleAutoMLClick = async () => {
//   try {
//     setLoading(true);

//     const storedUser = localStorage.getItem("user");
//     if (!storedUser) throw new Error("Base user missing");

//     const baseUser = JSON.parse(storedUser);

//     const formData = new URLSearchParams();
//     formData.append("email", baseUser.email);
//     formData.append("full_name", baseUser.name);

//     const res = await fetch(
//       "https://automl-webnew-chcgfqc8a5cbhtc4.eastus-01.azurewebsites.net/automl_register_login",
//       {
//         method: "POST",
//         headers: {
//           accept: "application/json",
//           "Content-Type": "application/x-www-form-urlencoded",
//         },
//         body: formData.toString(),
//       }
//     );

//     const data = await res.json();

//     // 🔥 ABSOLUTELY CRITICAL
//     const aivolveUser = {
//       ...data.user,
//       agent_id: data.agent_id,
//       agent_name: data.agent_name,
//       session_id: data.session_id,
//       total_chats: data.total_chats,
//     };

//     localStorage.setItem("aivolve_user", JSON.stringify(aivolveUser));
//     // localStorage.setItem("user", JSON.stringify(aivolveUser));

//     // 🔥 FORCE AUTH CONTEXT RE-EVALUATION
//     window.dispatchEvent(new Event("storage"));

//     // 🔥 NAVIGATE AFTER SYNC
//     window.location.href = "/workflow/automl";

//   } catch (e) {
//     console.error(e);
//   } finally {
//     setLoading(false);
//   }
// };

//   const paths = [
//     {
//       id: "etl",
//       title: "ETL Pipeline",
//       description: "Prepare and export the data for use in other systems or data warehouses.",
//       icon: Workflow,
//       route: "/workflow/etl-output",
//     },
//     {
//       id: "powerbi",
//       title: "Power BI Dashboard",
//       description: "Connect the data to Power BI for immediate visualization and reporting.",
//       icon: PieChart,
//       route: "/workflow/powerbi-dashboard",
//     },
//     {
//       id: "aiml",
//       title: "Auto AI/ML Model",
//       description: "Use the data to train or run an automated machine learning model.",
//       icon: Brain,
//       route: "/workflow/automl",
//     },
//   ];

//   return (
//     <WorkflowLayout>
//       <div className="p-8">
//         {/* Header */}
//         <div className="mb-8">
//           <h1 className="text-4xl font-bold text-foreground mb-3">
//             Choose Your Output Path
//           </h1>
//           <p className="text-muted-foreground text-lg">
//             Select how you want to use your processed data.
//           </p>
//         </div>

//         {/* Path Cards */}
//         <div className="grid grid-cols-3 gap-6 mb-12">
//           {paths.map((path) => {
//             const Icon = path.icon;
//             const isSelected = selectedPath === path.title;

//             return (
//               <div
//                 key={path.id}
//                 onClick={() => {
//                   setSelectedPath(path.title);

//                   // 🔥 CUSTOM LOGIC FOR AUTO ML
//                   if (path.id === "aiml") {
//                     handleAutoMLClick();
//                   } else {
//                     navigate(path.route);
//                   }
//                 }}
//                 className={`border rounded-lg p-8 cursor-pointer transition-all ${
//                   isSelected
//                     ? "border-primary bg-primary/5"
//                     : "border-border bg-card hover:bg-muted/30"
//                 } ${loading && path.id === "aiml" ? "opacity-60 pointer-events-none" : ""}`}
//               >
//                 <div className="mb-6">
//                   <div
//                     className={`w-14 h-14 rounded-lg flex items-center justify-center ${
//                       isSelected ? "bg-primary/10" : "bg-muted"
//                     }`}
//                   >
//                     <Icon
//                       className={`h-7 w-7 ${
//                         isSelected ? "text-primary" : "text-muted-foreground"
//                       }`}
//                     />
//                   </div>
//                 </div>
//                 <h3 className="text-xl font-semibold text-foreground mb-3">
//                   {path.title}
//                 </h3>
//                 <p className="text-sm text-muted-foreground leading-relaxed">
//                   {path.description}
//                 </p>
//                 {loading && path.id === "aiml" && (
//                   <p className="mt-3 text-sm text-primary">Opening AutoML…</p>
//                 )}
//               </div>
//             );
//           })}
//         </div>

//         {/* Bottom Navigation */}
//         <div className="flex items-center justify-between pt-8 border-t border-border">
//           <Button
//             variant="outline"
//             onClick={() => navigate("/workflow/business-logic")}
//             disabled={loading}
//           >
//             <ArrowLeft className="h-4 w-4 mr-2" />
//             Back
//           </Button>
//         </div>
//       </div>
//     </WorkflowLayout>
//   );
// }


import { useState } from "react";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import { Workflow, PieChart, Brain, ArrowLeft, CalendarClock, Clock, Loader2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";

const API_BASE = "https://api.veriton.ai/api/service1";

export default function PathSelection() {
  const navigate = useNavigate();
  const [selectedPath, setSelectedPath] = useState<string>("Power BI Dashboard");
  const [loading, setLoading] = useState(false);

  // Schedule dialog states
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [jobName, setJobName] = useState("");
  const [triggerType, setTriggerType] = useState<"schedule" | "file">("schedule");
  const [frequency, setFrequency] = useState("daily");
  const [time, setTime] = useState("09:00");
  const [scheduling, setScheduling] = useState(false);

  const getUserId = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return user.id || null;
    } catch {
      return null;
    }
  };

  const scheduleJob = async () => {
    if (triggerType === "schedule" && !frequency) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please select a frequency",
      });
      return;
    }

    const userId = getUserId();
    if (!userId) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "User ID not found. Please log in.",
      });
      return;
    }

    const job_id = localStorage.getItem("current_job_id");
    if (!job_id) {
      toast({
        variant: "destructive",
        title: "Job ID Missing",
        description: "No active job ID found. Please complete previous steps.",
      });
      return;
    }

    setScheduling(true);

    const payload = {
      job_id,
      job_name: jobName || `Job_${new Date().toISOString().split("T")[0]}`,
      schedule_details:
        triggerType === "schedule"
          ? {
              frequency,
              time: time || "00:00",
            }
          : null,
    };

    try {
      const url = `${API_BASE}/schedule-job?user_id=${userId}`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server responded with status ${response.status}`);
      }

      const data = await response.json();

      if (data.message?.toLowerCase().includes("success")) {
        toast({
          title: "Success",
          description: data.message || "Job scheduled successfully!",
        });

        // Save to jobs list in localStorage
        const savedJobs = localStorage.getItem("jobs");
        const jobs = savedJobs ? JSON.parse(savedJobs) : [];

        const newJob = {
          id: job_id,
          name: payload.job_name,
          category: "Path Selection",
          createdAt: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          lastRun: "-",
          status: "Created",
          steps: [], // no steps captured in path selection screen
          sourceFilePath: "s3://ingestion-01/data.csv",     // placeholder
          destinationFilePath: "s3://output-bucket/data.csv", // placeholder
          triggerType: triggerType === "schedule" ? "SCHEDULE" : "FILE_TRIGGER",
          scheduleDetails:
            triggerType === "schedule"
              ? `${frequency} at ${time || "00:00"}`
              : "On file upload",
        };

        localStorage.setItem("jobs", JSON.stringify([...jobs, newJob]));

        // Cleanup temporary keys
        localStorage.removeItem("currentJobName");
        // localStorage.removeItem("current_job_id");
        localStorage.removeItem("etlTableName");
        localStorage.removeItem("businessLogicStatus");
        localStorage.removeItem("dqRulesStatus");
        localStorage.removeItem("nerStatus");

        // Reset form
        setJobName("");
        setTriggerType("schedule");
        setFrequency("daily");
        setTime("09:00");

        setShowScheduleDialog(false);
        navigate("/jobs");
      } else {
        throw new Error(data.message || "Scheduling failed");
      }
    } catch (err: any) {
      console.error("Schedule error:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: err.message || "Failed to schedule job",
      });
    } finally {
      setScheduling(false);
    }
  };

  // const handleAutoMLClick = async () => {
  //   try {
  //     setLoading(true);

  //     const storedUser = localStorage.getItem("user");
  //     if (!storedUser) throw new Error("Base user missing");

  //     const baseUser = JSON.parse(storedUser);

  //     const formData = new URLSearchParams();
  //     formData.append("email", baseUser.email);
  //     formData.append("full_name", baseUser.name);

  //     const res = await fetch(
  //       "https://api.veriton.ai/api/service3/automl_register_login",
  //       {
  //         method: "POST",
  //         headers: {
  //           accept: "application/json",
  //           "Content-Type": "application/x-www-form-urlencoded",
  //         },
  //         body: formData.toString(),
  //       }
  //     );

  //     const data = await res.json();

  //     const aivolveUser = {
  //       ...data.user,
  //       agent_id: data.agent_id,
  //       agent_name: data.agent_name,
  //       session_id: data.session_id,
  //       total_chats: data.total_chats,
  //     };

  //     localStorage.setItem("aivolve_user", JSON.stringify(aivolveUser));
  //     window.dispatchEvent(new Event("storage"));

  //     window.location.href = "/workflow/automl";
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const paths = [
    {
      id: "etl",
      title: "ETL Pipeline",
      description: "Prepare and export the data for use in other systems or data warehouses.",
      icon: Workflow,
      route: "/workflow/etl-output",
    },
    {
      id: "powerbi",
      title: "Power BI Dashboard",
      description: "Connect the data to Power BI for immediate visualization and reporting.",
      icon: PieChart,
      route: "/workflow/powerbi-dashboard",
    },
    {
      id: "aiml",
      title: "AutoML Model",
      description: "Use the data to train or run an automated machine learning model.",
      icon: Brain,
      route: "/workflow/automl",
    },
  ];

  return (
    <WorkflowLayout>
      <div className="p-8">
        {/* Header with Schedule button */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-3">
              Choose Your Output Path
            </h1>
            <p className="text-muted-foreground text-lg">
              Select how you want to use your processed data.
            </p>
          </div>

          <Button
            variant="default"
            className="gap-2"
            onClick={() => setShowScheduleDialog(true)}
            disabled={loading || scheduling}
          >
            <CalendarClock className="h-4 w-4" />
            Schedule Job
          </Button>
        </div>

        {/* Path Cards */}
        <div className="grid grid-cols-3 gap-6 mb-12">
          {paths.map((path) => {
            const Icon = path.icon;
            const isSelected = selectedPath === path.title;

            return (
              <div
                key={path.id}
                onClick={() => {
                  setSelectedPath(path.title);
                  // if (path.id === "aiml") {
                  //   handleAutoMLClick();
                  // } else {
                  //   navigate(path.route);
                  // }
                     navigate(path.route);
                }}
                className={`border rounded-lg p-8 cursor-pointer transition-all ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:bg-muted/30"
                } ${loading && path.id === "aiml" ? "opacity-60 pointer-events-none" : ""}`}
              >
                <div className="mb-6">
                  <div
                    className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                      isSelected ? "bg-primary/10" : "bg-muted"
                    }`}
                  >
                    <Icon
                      className={`h-7 w-7 ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {path.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {path.description}
                </p>
                {loading && path.id === "aiml" && (
                  <p className="mt-3 text-sm text-primary">Opening AutoML…</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Navigation */}
        <div className="flex items-center justify-between pt-8 ">
          <Button
            variant="outline"
            onClick={() => navigate("/workflow/business-logic")}
            disabled={loading || scheduling}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      {/* Schedule Job Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-6">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-2xl font-bold">Schedule Job</DialogTitle>
            <p className="text-muted-foreground mt-1">
              Configure how and when your job should run.
            </p>
            
            <button
        onClick={() => setShowScheduleDialog(false)}
        className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none  disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        disabled={scheduling}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>

          </DialogHeader>

          <div className="space-y-6">
            {/* Job Name */}
            <div className="space-y-2">
              <Label>Job Name</Label>
              <Input
                value={jobName}
                onChange={(e) => setJobName(e.target.value)}
                placeholder="Enter job name"
                className="bg-muted/40 rounded-lg"
              />
            </div>

            {/* Trigger Type */}
            <div className="mb-6 space-y-3">
              <Label>Trigger Type</Label>
              <RadioGroup
                value={triggerType}
                onValueChange={(value) => setTriggerType(value as "schedule" | "file")}
                className="grid grid-cols-1 gap-3"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition">
                  <RadioGroupItem value="schedule" id="schedule" />
                  <Label htmlFor="schedule" className="flex items-center gap-2 cursor-pointer">
                    <Clock className="w-4 h-4" /> Time-based Schedule
                  </Label>
                </div>
                {/* File trigger option can be uncommented when implemented */}
                {/* <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition">
                  <RadioGroupItem value="file" id="file" />
                  <Label htmlFor="file" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="w-4 h-4" /> File Arrival Trigger
                  </Label>
                </div> */}
              </RadioGroup>
            </div>

            {/* Schedule Fields - only shown for time-based */}
            {triggerType === "schedule" && (
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <Label>Frequency</Label>
                  <Select value={frequency} onValueChange={setFrequency}>
                    <SelectTrigger className="rounded-lg bg-muted/40">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* <SelectItem value="hourly">Hourly</SelectItem> */}
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Time</Label>
                  <div className="relative">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="rounded-lg bg-muted/40 pr-10"
                    />
                    {/* <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /> */}
                  </div>
                </div>
              </div>
            )}

            {/* Buttons */}
            {/* <div className="relative gap-4 pt-4">
             

              <Button
                className="flex-1 rounded-lg"
                onClick={scheduleJob}
                disabled={scheduling}
              >
                {scheduling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scheduling...
                  </>
                ) : (
                  "Schedule Job"
                )}
              </Button>
            </div> */}
            <div className="relative flex justify-end gap-4 pt-4">
            <Button
              className="rounded-lg"
              onClick={scheduleJob}
              disabled={scheduling}
            >
              {scheduling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Job"
              )}
            </Button>
          </div>
          </div>
        </DialogContent>
      </Dialog>
    </WorkflowLayout>
   );
}