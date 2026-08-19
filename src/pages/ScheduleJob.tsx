
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Clock, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
 
const API_BASE = "https://api.veriton.ai/api/service1";
 
interface WorkflowSteps {
  dqRules: "skipped" | "executed";
  ner: "skipped" | "executed";
  businessLogic: "skipped" | "executed";
  dataTransformations: "skipped" | "executed";
}
 
const ScheduleJob = () => {
  const navigate = useNavigate();
  const [triggerType, setTriggerType] = useState<"schedule" | "file">("schedule");
  const [frequency, setFrequency] = useState("");
  const [time, setTime] = useState("");
  const [jobName, setJobName] = useState("");
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowSteps>({
    dqRules: "skipped",
    ner: "skipped",
    businessLogic: "skipped",
    dataTransformations: "skipped",
  });
  const [loading, setLoading] = useState(false);
 
  useEffect(() => {
    const etlJobName = localStorage.getItem("currentJobName");
    const etlTableName = localStorage.getItem("etlTableName");
 
    if (etlJobName) setJobName(etlJobName);
    else if (etlTableName) setJobName(`Job_${etlTableName}`);
 
    setWorkflowSteps({
      dqRules: localStorage.getItem("dqRulesStatus") === "executed" ? "executed" : "skipped",
      ner: localStorage.getItem("nerStatus") === "executed" ? "executed" : "skipped",
      businessLogic: localStorage.getItem("businessLogicStatus") === "executed" ? "executed" : "skipped",
      dataTransformations: "executed",
    });
  }, []);
 
  const getUserId = () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      const user = JSON.parse(userStr);
      return user?.id || user?.user_id;
    } catch {
      return null;
    }
  };
 
  const scheduleJob = async () => {
    if (triggerType === "schedule" && !frequency) {
      return toast.error("Please select a frequency");
    }
 
   const user = localStorage.getItem("user");
  const userId = user ? JSON.parse(user).id : null;
  const jobId = localStorage.getItem("current_job_id");
 
 
    setLoading(true);
 
    // Generate unique job_id (you can replace with real one from previous step if available)
    // const jobId = `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
 
    const payload = {
      job_id: jobId,
      job_name: jobName || `Job_${new Date().toISOString().split("T")[0]}`,
      schedule_details: triggerType === "schedule" ? {
        frequency: frequency,
        time: time || "00:00"
      } : null // file trigger can be handled differently if needed
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
        throw new Error(errorText || `Server error: ${response.status}`);
      }
 
      const data = await response.json();
 
      if (data.message?.toLowerCase().includes("success")) {
        toast.success(data.message || "Job scheduled successfully!");
 
        // Your original localStorage save logic
        const savedJobs = localStorage.getItem("jobs");
        const jobs = savedJobs ? JSON.parse(savedJobs) : [];
 
        const newJob = {
          id: jobId,
          name: payload.job_name,
          category: "Unknown",
          createdAt: new Date().toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          }),
          lastRun: "-",
          status: "Created" as const,
          steps: workflowSteps,
          sourceFilePath: "s3://ingestion-01/data.csv",
          destinationFilePath: "s3://output-bucket/data.csv",
          triggerType: triggerType === "schedule" ? "SCHEDULE" : "FILE_TRIGGER",
          scheduleDetails:
            triggerType === "schedule"
              ? `${frequency} at ${time || "00:00"}`
              : "On file upload",
        };
 
        localStorage.setItem("jobs", JSON.stringify([...jobs, newJob]));
 
        // Cleanup
        localStorage.removeItem("currentJobName");
        localStorage.removeItem("etlTableName");
        localStorage.removeItem("businessLogicStatus");
        localStorage.removeItem("dqRulesStatus");
        localStorage.removeItem("nerStatus");
 
        navigate("/jobs");
      } else {
        throw new Error(data.message || "Scheduling failed");
      }
    } catch (err: any) {
      console.error("Schedule error:", err);
      toast.error(err.message || "Failed to schedule job");
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-6 py-10 max-w-2xl">
 
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight">Schedule Job</h1>
          <p className="text-muted-foreground mt-1">
            Configure how and when your job should run.
          </p>
        </div>
 
        {/* MAIN CARD */}
        <Card className="p-8 rounded-2xl shadow-sm border bg-card">
 
          {/* JOB NAME */}
          <div className="space-y-2 mb-6">
            <Label>Job Name</Label>
            <Input
              value={jobName}
              onChange={(e) => setJobName(e.target.value)}
              placeholder="Enter job name"
              className="bg-muted/40 rounded-lg"
            />
          </div>
 
          {/* TRIGGER TYPE */}
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
 
              <div className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/30 transition">
                <RadioGroupItem value="file" id="file" />
                <Label htmlFor="file" className="flex items-center gap-2 cursor-pointer">
                  <Upload className="w-4 h-4" /> File Upload Trigger
                </Label>
              </div>
            </RadioGroup>
          </div>
 
          {/* SCHEDULE FIELDS */}
          {triggerType === "schedule" && (
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label>Frequency</Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="rounded-lg bg-muted/40">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="hourly">Hourly</SelectItem>
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
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          )}
 
          {/* FILE TRIGGER INFO */}
          {triggerType === "file" && (
            <div className="mb-6 p-4 rounded-lg bg-muted/40 border text-sm">
              This job will automatically trigger when a new file is uploaded.
            </div>
          )}
 
          {/* BUTTONS */}
          <div className="flex gap-4 pt-4">
            <Button
              variant="outline"
              className="flex-1 rounded-lg"
              onClick={() => navigate("/workflow/path-selection")}
              disabled={loading}
            >
              Cancel
            </Button>
 
            <Button
              className="flex-1 rounded-lg"
              onClick={scheduleJob}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Job"
              )}
            </Button>
          </div>
        </Card>
 
        {/* BACK BUTTON */}
        <Button
          variant="ghost"
          className="mt-6"
          onClick={() => navigate("/workflow/path-selection")}
          disabled={loading}
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>
    </div>
  );
};
 
export default ScheduleJob;
 