import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Send, Loader2, Paperclip, FileText,
  X, Sparkles, Bot, User, Pencil, Check, XCircle,
  Share2, BarChart3, TrendingUp, AlertCircle,
  CheckCircle, Cpu, Calendar, GitBranch, Clock,
  Database, Search, Eye, ChevronRight,
  Table2, PlayCircle, ShieldCheck, Tag, Zap,
  AlertTriangle, Wrench, History, Plus, MessageSquare,
  ChevronLeft,
} from "lucide-react";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import ReactFlow, {
  Controls,
  Background,
  Handle,
  Position,
  EdgeProps,
  getStraightPath,
} from "reactflow";
import "reactflow/dist/style.css";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, Cell, LineChart, Line, AreaChart, Area,
  PieChart, Pie, Legend,
} from "recharts";
import { awaitPendingThread } from "@/components/threadManager";

function getAivolveUser() {
  try {
    const raw = localStorage.getItem("aivolve_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}

// ─────────────────────────────────────────────────────────────
// EditableField
// ─────────────────────────────────────────────────────────────
function EditableField({ value, onSave, label, isSaved }: {
  value: string; onSave: (v: string) => Promise<void>; label: string; isSaved?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { if (editing) inputRef.current?.focus(); }, [editing]);
  const handleSave = async () => {
    if (!draft.trim() || draft === value) { setEditing(false); setDraft(value); return; }
    setBusy(true);
    try { await onSave(draft.trim()); } finally { setBusy(false); setEditing(false); }
  };
  const handleCancel = () => { setDraft(value); setEditing(false); };
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-xs text-muted-foreground font-semibold">{label}:</span>
      {editing ? (
        <>
          <input ref={inputRef} value={draft} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") handleCancel(); }}
            disabled={busy}
            className="text-sm font-semibold text-foreground bg-background border border-primary rounded px-2 py-0.5 outline-none min-w-40"
          />
          {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : (
            <>
              <button onClick={handleSave} className="bg-green-600 border-none rounded px-1.5 py-0.5 cursor-pointer flex items-center"><Check className="w-3 h-3 text-white" /></button>
              <button onClick={handleCancel} className="bg-red-500 border-none rounded px-1.5 py-0.5 cursor-pointer flex items-center"><XCircle className="w-3 h-3 text-white" /></button>
            </>
          )}
        </>
      ) : (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-foreground">{value}</span>
          {isSaved ? (
            <button onClick={() => { setDraft(value); setEditing(true); }} className="bg-muted border border-border rounded px-1.5 py-0.5 cursor-pointer flex items-center gap-1">
              <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-semibold">Edit</span>
            </button>
          ) : (
            <span title="Save the job first to enable renaming" className="flex items-center gap-1 px-1.5 py-0.5 rounded border cursor-not-allowed opacity-50" style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--muted))" }}>
              <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground font-semibold">Edit</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DataModelSummary
// ─────────────────────────────────────────────────────────────
function DataModelSummary({ dataModel, relationships, schemas }: { dataModel: any; relationships: any[]; schemas: any }) {
  if (!dataModel?.fact_table) return null;
  const fact = dataModel.fact_table;
  const dims: string[] = dataModel.dimension_tables || [];
  return (
    <div style={{ background: "linear-gradient(135deg, hsl(267 84% 65% / 0.08), hsl(197 100% 55% / 0.05))", border: "1px solid hsl(267 84% 65% / 0.3)", borderRadius: 12, padding: "14px 16px", fontSize: 12, color: "hsl(var(--foreground))", lineHeight: 1.8, marginTop: 10 }}>
      <div className="flex items-center gap-2 mb-3">
        <div style={{ background: "linear-gradient(135deg, hsl(267 84% 60%), hsl(220 90% 60%))", borderRadius: 6, padding: "3px 10px", display: "flex", alignItems: "center", gap: 5 }}>
          <span className="text-xs">💡</span>
          <span className="text-[11px] font-bold text-white">What this diagram shows</span>
        </div>
      </div>
      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "hsl(267 84% 65%)", display: "inline-block", flexShrink: 0 }} />
        <span><span style={{ background: "hsl(267 84% 65%)", color: "#fff", borderRadius: 5, padding: "1px 8px", fontSize: 11, fontWeight: 700, marginRight: 5 }}>{fact}</span>is the <strong>main table</strong></span>
        {schemas?.[fact] && <span style={{ background: "hsl(267 84% 65% / 0.15)", color: "hsl(267 84% 60%)", border: "1px solid hsl(267 84% 65% / 0.3)", borderRadius: 20, padding: "1px 8px", fontSize: 10, fontWeight: 600 }}>{schemas[fact].length} cols</span>}
      </div>
      <div className="flex items-center gap-1.5 mb-3 flex-wrap">
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: "hsl(197 100% 50%)", display: "inline-block", flexShrink: 0 }} />
        <span>Connected to <strong>{dims.length} supporting table{dims.length !== 1 ? "s" : ""}</strong>:</span>
        {dims.map((d) => <span key={d} style={{ background: "hsl(197 100% 50% / 0.12)", color: "hsl(197 100% 38%)", border: "1px solid hsl(197 100% 50% / 0.3)", borderRadius: 5, padding: "1px 7px", fontSize: 11, fontWeight: 600 }}>{d}</span>)}
      </div>
      {relationships.length > 0 && (
        <>
          <div style={{ borderTop: "1px solid hsl(267 84% 65% / 0.2)", marginBottom: 10 }} />
          <div className="mb-2.5">
            <div className="flex items-center gap-1.5 mb-2"><span className="text-sm">🔗</span><span className="font-bold text-xs">How they connect</span></div>
            <div className="flex flex-col gap-1.5">
              {relationships.map((rel, i) => (
                <div key={i} className="flex items-center gap-1.5 flex-wrap rounded-lg px-2.5 py-1" style={{ background: "hsl(var(--background) / 0.5)", border: "1px solid hsl(267 84% 65% / 0.15)" }}>
                  <span style={{ background: "hsl(267 84% 60%)", color: "#fff", borderRadius: 4, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{rel.from}</span>
                  <span className="text-muted-foreground text-base">→</span>
                  <span style={{ background: "hsl(267 84% 65% / 0.15)", color: "hsl(267 84% 60%)", border: "1px solid hsl(267 84% 65% / 0.35)", borderRadius: 4, padding: "1px 8px", fontSize: 11, fontWeight: 700 }}>{rel.to}</span>
                  <span className="text-muted-foreground text-xs">via</span>
                  <code style={{ background: "hsl(267 84% 65% / 0.1)", color: "hsl(267 84% 62%)", border: "1px solid hsl(267 84% 65% / 0.25)", borderRadius: 4, padding: "1px 7px", fontSize: 10, fontWeight: 600 }}>{rel.join}</code>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SchemaNode / SchemaEdge
// ─────────────────────────────────────────────────────────────
function SchemaNode({ data }: { data: any }) {
  const isFact = data.type === "FACT";
  return (
    <div className="bg-card rounded-xl min-w-[180px] shadow-lg" style={{ border: `2px solid ${isFact ? "hsl(var(--primary))" : "hsl(var(--border))"}` }}>
      <Handle type="target" position={Position.Left} style={{ background: "transparent", border: 0 }} />
      <Handle type="source" position={Position.Right} style={{ background: "transparent", border: 0 }} />
      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-t-xl" style={{ background: isFact ? "hsl(var(--primary))" : "hsl(var(--muted))" }}>
        <span className="font-bold text-xs" style={{ color: isFact ? "#fff" : "hsl(var(--foreground))" }}>{data.label}</span>
        <span className="text-[9px] font-semibold rounded px-1 py-0.5" style={{ color: isFact ? "rgba(255,255,255,0.85)" : "hsl(var(--primary))", background: isFact ? "rgba(255,255,255,0.15)" : "hsl(var(--accent) / 0.2)" }}>{data.type}</span>
      </div>
      <div className="py-1.5 max-h-40 overflow-y-auto">
        {(data.columns || []).map((col: string, i: number) => {
          const isJoinCol = (data.relationships || []).some((rel: any) => { const [l, r] = rel.join.split("=").map((s: string) => s.trim()); return l === col || r === col; });
          return (
            <div key={i} className="flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] text-foreground" style={{ background: isJoinCol ? "hsl(var(--primary) / 0.12)" : "transparent" }}>
              {isJoinCol && <span className="text-primary text-[9px] font-bold">⬡</span>}
              <span>{col}</span>
              {isJoinCol && <span className="ml-auto text-[9px] text-primary font-semibold">FK</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SchemaEdge({ sourceX, sourceY, targetX, targetY, data, selected }: EdgeProps & { data?: { join: string } }) {
  const [hovered, setHovered] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [edgePath] = getStraightPath({ sourceX, sourceY, targetX, targetY });
  return (
    <>
      <path d={edgePath} fill="none" stroke="transparent" strokeWidth={20}
        onMouseEnter={(e) => { setHovered(true); setTooltipPos({ x: e.clientX, y: e.clientY }); }}
        onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
        onMouseLeave={() => setHovered(false)} style={{ cursor: "pointer" }}
      />
      <path d={edgePath} fill="none" stroke={hovered || selected ? "#f59e0b" : "#6366f1"} strokeWidth={hovered || selected ? 3 : 2} strokeDasharray="5 4" style={{ transition: "all 0.15s ease", pointerEvents: "none" }} />
      {hovered && data?.join && createPortal(
        <div className="fixed z-[99999] bg-card text-foreground border border-border rounded-lg px-3 py-1 text-xs font-semibold pointer-events-none shadow-lg whitespace-nowrap flex items-center gap-1.5" style={{ left: tooltipPos.x + 12, top: tooltipPos.y - 36 }}>
          <span style={{ color: "#818cf8" }}>🔗</span><span>{data.join}</span>
        </div>, document.body
      )}
    </>
  );
}

const schemaNodeTypes = { schemaNode: SchemaNode };
const schemaEdgeTypes = { schemaEdge: SchemaEdge };

function buildStarSchema(dataModel: any, relationships: any[], schemas: any) {
  if (!dataModel?.fact_table) return { nodes: [], edges: [] };
  const fact = dataModel.fact_table;
  const dims: string[] = dataModel.dimension_tables || [];
  const radius = 260;
  const angleStep = (2 * Math.PI) / Math.max(1, dims.length);
  const nodes: any[] = [{ id: fact, type: "schemaNode", data: { label: fact, type: "FACT", columns: schemas?.[fact] || [], relationships }, position: { x: 400, y: 300 } }];
  dims.forEach((dim, index) => {
    const angle = index * angleStep - Math.PI / 2;
    nodes.push({ id: dim, type: "schemaNode", data: { label: dim, type: "DIM", columns: schemas?.[dim] || [], relationships }, position: { x: 400 + radius * Math.cos(angle), y: 300 + radius * Math.sin(angle) } });
  });
  const edges: any[] = relationships.map((rel: any) => ({ id: `${rel.from}-${rel.to}`, source: rel.from, target: rel.to, type: "schemaEdge", data: { join: rel.join }, animated: false }));
  return { nodes, edges };
}

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface MessageResult {
  pipeline_name: string; suggested_job_name: string; job_name?: string; job_id: string;
  data_model: any; relationships: any[]; schemas: any;
  final_dataset: { rows: number; columns: string[]; preview: any[]; dataset_name: string; dataset_path: string; onelake_path?: string };
  download_url: string;
  next_actions?: { action: string; label: string }[];
}
interface DashboardKPI { kpi_name: string; measures: string; metrics: number; }
interface DashboardVisual { chart_name: string; chart_type: string; description: string; value?: number; format?: string; x_axis_column?: string; y_axis_columns?: string[]; data?: any; }
interface DashboardResult { status: string; user_prompt: string; total_kpis_discovered: number; selected_kpi_names: string[]; computed_kpis: DashboardKPI[]; visuals: DashboardVisual[]; total_visuals: number; }
interface AutoMLResult { status: string; message: string; session_id: string; model_id: string; task_type: string; target: string; best_model: string; primary_metric: string; primary_score: number; all_models: Record<string, any>; analysis: string; blob_file_used: string; results_filename: string; dataset_id: string; suggestions: string[]; }

type PipelineStep = "idle" | "awaiting_job_selection" | "awaiting_pipeline_name" | "awaiting_schedule_decision" | "awaiting_schedule_details";

interface PipelineJob { job_id: string; job_name: string; }

interface PipelineCreatedResult {
  pipeline_id: string;
  name: string;
  created_at?: string;
  selected_jobs?: { job_id: string; job_name: string }[];
  job_ids?: { job_id: string; job_name: string }[];
  status?: string;
  schedule?: {
    frequency?: string;
    time_utc?: string;
    start_date?: string;
    active?: boolean;
    type?: string;
    hour?: number;
    minute?: number;
    day?: string;
  };
  user_id?: string;
  jobs?: string[];
  job_names?: Record<string, string>;
  next_actions?: { action: string; label: string }[];
}

interface UploadResult {
  sheet_name?: string;
  job_name: string;
  dataset_name: string;
  dataset_path: string;
  onelake_path?: string;
  rows: number;
  columns: number;
  next_actions?: { id?: string; action?: string; label: string }[];
}

interface DQIssue { column: string; rule: string; issue: string; }
interface DQFix { column: string; fix: string; }
interface DQResult {
  status: string; rules_applied: number;
  rules: { rule: string; description: string; severity: string }[];
  issues_before: DQIssue[]; issues_after: DQIssue[];
  proposed_solutions: DQFix[]; columns_checked: number;
  dataset_path: string; next_actions?: { action: string; label: string }[];
}

// interface NERResult {
//   status: string; blob_path: string; rows_processed: number; columns_processed: number;
//   entity_columns_created: string[]; entities_detected: Record<string, number>;
//   next_actions?: { action: string; label: string }[];
// }

interface NERResolution { column: string; original: string; resolved: string; confidence: number; }
interface NERResult {
  status: string; blob_path: string; rows_processed: number; columns_processed: number;
  entities_detected: Record<string, number>;
  summary?: string[];
  resolutions_found: number;
  resolutions: NERResolution[];
  dataset_updated?: boolean;
  next_actions?: { action: string; label: string }[];
}



interface BLResult {
  status: string; blob_path: string; rules_received: number; rules_applied: number;
  rules_skipped: any[]; applied_rules: string[]; generated_rules: { rule: string }[];
  generated_columns: string[]; rows: number; columns: number;
  next_actions?: { action: string; label: string }[];
}

interface Message {
  id: string; role: "user" | "assistant"; content: string;
  result?: MessageResult; dashboardResult?: DashboardResult; automlResult?: AutoMLResult;
  pipelineCreated?: PipelineCreatedResult; uploadResult?: UploadResult;
  dqResult?: DQResult; nerResult?: NERResult; blResult?: BLResult;
  attachment?: string; error?: boolean; timestamp: Date;
  pipelineJobs?: PipelineJob[]; _alreadySaved?: boolean;
}

interface ThreadItem {
  thread_id: string;
  title: string;
  updated_at: string;
  created_at: string;
}

interface DatasetItem { jobName: string; datasetName: string; lastRun: string; completedAt: string; job_id: string; dataset_path?: string; onelake_path?: string; }
interface DatasetPreviewData { columns: string[]; column_types: Record<string, string>; preview_rows: Record<string, any>[]; total_rows: number; total_columns: number; }
interface ActiveDataset { datasetName: string; jobName: string; job_id: string; dataset_path: string; onelake_path?: string; }

interface SheetSelectionState {
  open: boolean; jobId: string; fileName: string; sheets: string[]; file: File | null;
}

const BASE_URL = "https://veriton-webapp-ezbud7exfzb7g8at.eastus-01.azurewebsites.net";
const DASHBOARD_COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b", "#ef4444"];

function withCsvExtension(name: string): string {
  if (!name) return name;
  return name.endsWith(".csv") ? name : `${name}.csv`;
}

// ─────────────────────────────────────────────────────────────
// AutoML helpers
// ─────────────────────────────────────────────────────────────
const metricsByTask: Record<string, { key: string; label: string }[]> = {
  Classification: [{ key: "accuracy", label: "Accuracy" }, { key: "f1", label: "F1 Score" }, { key: "precision", label: "Precision" }, { key: "recall", label: "Recall" }, { key: "roc_auc", label: "ROC-AUC" }],
  Regression: [{ key: "rmse", label: "RMSE" }, { key: "mae", label: "MAE" }, { key: "r2", label: "R²" }, { key: "mape", label: "MAPE" }, { key: "mean_residual", label: "Mean Residual" }, { key: "std_residual", label: "Std Residual" }],
  Forecasting: [{ key: "rmse", label: "RMSE" }, { key: "mae", label: "MAE" }, { key: "r2", label: "R²" }, { key: "mape", label: "MAPE" }],
};
function fmt(v: any) { if (v === null || v === undefined) return "—"; if (typeof v === "number") { if (Math.abs(v) < 0.0001 && v !== 0) return v.toExponential(3); return (Math.round(v * 1000) / 1000).toString(); } return String(v); }

function PerformanceMetricsTable({ allModels, bestModel, taskType }: { allModels: Record<string, any>; bestModel: string; taskType: string }) {
  const metricSpecs = metricsByTask[taskType] || metricsByTask["Regression"];
  const modelNames = Object.keys(allModels);
  if (modelNames.length === 0) return null;
  return (
    <div className="overflow-x-auto mt-1">
      <table className="w-full border-collapse text-[11px]">
        <thead>
          <tr className="bg-muted">
            <th className="px-3 py-2 text-left font-bold text-foreground border-b border-border whitespace-nowrap">Model</th>
            {metricSpecs.map((m) => (<>
              <th key={`${m.key}-train`} className="px-2.5 py-2 text-center font-semibold text-muted-foreground border-b border-border whitespace-nowrap">{m.label} (train)</th>
              <th key={`${m.key}-test`} className="px-2.5 py-2 text-center font-semibold text-muted-foreground border-b border-border whitespace-nowrap">{m.label} (test)</th>
            </>))}
          </tr>
        </thead>
        <tbody>
          {modelNames.map((modelName, idx) => {
            const modelData = allModels[modelName];
            const isBest = modelName === bestModel;
            return (
              <tr key={modelName} className="border-b border-border/50" style={{ background: isBest ? "hsl(142 72% 42% / 0.08)" : idx % 2 === 0 ? "transparent" : "hsl(var(--muted) / 0.3)" }}>
                <td className="px-3 py-2 font-semibold whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="text-foreground">{modelName.replace(/_/g, " ")}</span>
                    {isBest && <span className="text-[9px] font-bold text-white bg-green-600 rounded px-1 py-0.5 leading-tight">BEST</span>}
                  </div>
                </td>
                {metricSpecs.map((m) => (<>
                  <td key={`${m.key}-train`} className="px-2.5 py-2 text-center text-muted-foreground tabular-nums">{fmt(modelData?.train?.[m.key])}</td>
                  <td key={`${m.key}-test`} className="px-2.5 py-2 text-center tabular-nums" style={{ color: "hsl(var(--foreground))", fontWeight: isBest ? 600 : 400 }}>{fmt(modelData?.test?.[m.key])}</td>
                </>))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function FormattedAnalysisText({ text }: { text: string }) {
  if (!text) return null;
  const lines = text.split("\n");
  return (
    <div className="text-xs leading-relaxed text-foreground">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-1.5" />;
        if (trimmed.startsWith("|")) return null;
        if (/^#{1,3}\s/.test(trimmed)) return <div key={i} className="font-bold text-sm mt-3.5 mb-1">{trimmed.replace(/^#{1,3}\s/, "")}</div>;
        if (/^[-*•]\s/.test(trimmed)) return <div key={i} className="flex items-start gap-2 mb-1"><span className="text-primary font-bold text-sm leading-relaxed shrink-0">•</span><span>{trimmed.replace(/^[-*•]\s/, "")}</span></div>;
        return <p key={i} className="mb-1">{trimmed}</p>;
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NextActionChips
// ─────────────────────────────────────────────────────────────
function NextActionChips({ actions, onActionClick }: { actions: { action?: string; id?: string; label: string }[]; onActionClick: (label: string) => void }) {
  if (!actions || actions.length === 0) return null;
  return (
    <div className="mt-3 pt-3 border-t border-border/60">
      <p className="text-[11px] text-muted-foreground font-semibold mb-2">What would you like to do next?</p>
      <div className="flex flex-wrap gap-2">
        {actions.map((action, i) => (
          <button key={action.action || action.id || i} onClick={() => onActionClick(action.label)}
            className="flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-all"
            style={{ border: "1.5px solid hsl(267 84% 60% / 0.35)", background: "hsl(267 84% 60% / 0.07)", color: "hsl(267 84% 55%)" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "hsl(267 84% 60% / 0.15)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(267 84% 60% / 0.6)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "hsl(267 84% 60% / 0.07)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(267 84% 60% / 0.35)"; }}
          >{action.label}</button>
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// UploadResultCard
// ─────────────────────────────────────────────────────────────
function UploadResultCard({ uploadResult, onActionClick }: { uploadResult: UploadResult; onActionClick: (label: string) => void }) {
  const DEFAULT_NEXT_ACTIONS = [
    { id: "dq", label: "Apply Data Quality Rules" },
    { id: "business_logic", label: "Apply Business Logic" },
    { id: "ner", label: "Apply Name Entity Resolution" },
    { id: "dashboard", label: "Generate Power BI Dashboard" },
    { id: "automl", label: "Build AutoML Model" },
  ];
  const nextActions = uploadResult.next_actions && uploadResult.next_actions.length > 0 ? uploadResult.next_actions : DEFAULT_NEXT_ACTIONS;
  const displayName = uploadResult.sheet_name || uploadResult.job_name || uploadResult.dataset_name;
  return (
    <div className="mt-3 w-full max-w-lg bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-green-600/10 border border-green-600/20 flex items-center justify-center shrink-0">
          <CheckCircle className="w-4.5 h-4.5 text-green-600" style={{ width: 18, height: 18 }} />
        </div>
        <div><div className="font-bold text-sm text-foreground">Dataset Uploaded Successfully</div><div className="text-[11px] text-muted-foreground">Ready to use</div></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20"><Table2 className="w-3 h-3" />{displayName}</span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">{uploadResult.rows} rows</span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">{uploadResult.columns} columns</span>
      </div>
      <div className="pt-2 border-t border-border/60">
        <p className="text-[11px] text-muted-foreground font-semibold mb-2">What would you like to do next?</p>
        <div className="flex flex-wrap gap-2">
          {nextActions.map((action, i) => (
            <button key={action.id || (action as any).action || i} onClick={() => onActionClick(action.label)}
              className="flex items-center gap-1.5 text-xs font-medium rounded-full px-3 py-1.5 cursor-pointer transition-all"
              style={{ border: "1.5px solid hsl(267 84% 60% / 0.35)", background: "hsl(267 84% 60% / 0.07)", color: "hsl(267 84% 55%)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "hsl(267 84% 60% / 0.15)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(267 84% 60% / 0.6)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "hsl(267 84% 60% / 0.07)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(267 84% 60% / 0.35)"; }}
            >{action.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DQResultCard
// ─────────────────────────────────────────────────────────────
function DQResultCard({ dqResult, onActionClick }: { dqResult: DQResult; onActionClick: (label: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const severityColor = (s: string) =>
    s === "high" ? "text-red-500 bg-red-500/10 border-red-500/20" :
    s === "medium" ? "text-amber-500 bg-amber-500/10 border-amber-500/20" :
    "text-blue-500 bg-blue-500/10 border-blue-500/20";
  const visibleRules = expanded ? dqResult.rules : dqResult.rules.slice(0, 5);
  const issuesBefore = dqResult.issues_before || [];
  const issuesAfter = dqResult.issues_after || [];
  const fixes = dqResult.proposed_solutions || [];
  const resolvedIssues = issuesBefore.filter((ib) => !issuesAfter.some((ia) => ia.column === ib.column && ia.rule === ib.rule));
  const remainingIssues = issuesAfter;
  return (
    <div className="mt-3 w-full max-w-lg bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0"><ShieldCheck className="w-4.5 h-4.5 text-blue-500" style={{ width: 18, height: 18 }} /></div>
        <div><div className="font-bold text-sm text-foreground">Data Quality Rules Applied</div><div className="text-[11px] text-muted-foreground">Validation complete</div></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-500/10 text-green-600 border border-green-500/20"><Check className="w-3 h-3" />{dqResult.rules_applied} rules applied</span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">{dqResult.columns_checked} columns checked</span>
        {issuesBefore.length > 0 && <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20"><AlertTriangle className="w-3 h-3" />{issuesBefore.length} issue{issuesBefore.length !== 1 ? "s" : ""} found</span>}
        {resolvedIssues.length > 0 && <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-500/10 text-green-600 border border-green-500/20"><Wrench className="w-3 h-3" />{resolvedIssues.length} fixed</span>}
        {issuesBefore.length === 0 && <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-500/10 text-green-600 border border-green-500/20"><CheckCircle className="w-3 h-3" />No issues found</span>}
      </div>
      {issuesBefore.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={{ border: "1px solid hsl(38 92% 50% / 0.3)", background: "hsl(38 92% 50% / 0.04)" }}>
          <div className="flex items-center gap-2 px-3 py-2 border-b" style={{ borderColor: "hsl(38 92% 50% / 0.2)", background: "hsl(38 92% 50% / 0.08)" }}>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /><span className="text-[11px] font-bold text-amber-600">Issues Detected & Resolved</span>
          </div>
          <div className="p-3 space-y-2">
            {issuesBefore.map((issue, i) => {
              const isFixed = !issuesAfter.some((ia) => ia.column === issue.column && ia.rule === issue.rule);
              const fix = fixes.find((f) => f.column === issue.column);
              return (
                <div key={i} className="rounded-lg overflow-hidden" style={{ border: `1px solid ${isFixed ? "hsl(142 72% 42% / 0.3)" : "hsl(0 72% 51% / 0.3)"}`, background: isFixed ? "hsl(142 72% 42% / 0.05)" : "hsl(0 72% 51% / 0.05)" }}>
                  <div className="px-3 py-2">
                    <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 border border-amber-500/25 font-mono">{issue.column}</span>
                      <span className="text-[10px] text-muted-foreground">{issue.rule}</span>
                    </div>
                    <div className="flex items-start gap-1.5 mb-1.5">
                      <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" />
                      <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">{issue.issue}</span>
                    </div>
                    {isFixed && fix && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: "hsl(142 72% 42% / 0.1)", border: "1px solid hsl(142 72% 42% / 0.25)" }}>
                        <Wrench className="w-3 h-3 text-green-500 shrink-0" />
                        <span className="text-[10px] text-green-600 font-semibold">Fixed: </span>
                        <code className="text-[10px] text-green-600 font-mono">{fix.fix.replace(/_/g, " ")}</code>
                      </div>
                    )}
                    {isFixed && !fix && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: "hsl(142 72% 42% / 0.1)", border: "1px solid hsl(142 72% 42% / 0.25)" }}>
                        <CheckCircle className="w-3 h-3 text-green-500 shrink-0" />
                        <span className="text-[10px] text-green-600 font-semibold">Issue resolved automatically</span>
                      </div>
                    )}
                    {!isFixed && (
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: "hsl(0 72% 51% / 0.08)", border: "1px solid hsl(0 72% 51% / 0.25)" }}>
                        <AlertCircle className="w-3 h-3 text-red-500 shrink-0" />
                        <span className="text-[10px] text-red-500 font-semibold">Still unresolved</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {remainingIssues.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "hsl(0 72% 51% / 0.07)", border: "1px solid hsl(0 72% 51% / 0.25)", color: "hsl(0 60% 45%)" }}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /><span>{remainingIssues.length} issue{remainingIssues.length !== 1 ? "s" : ""} still remain after fixes</span>
        </div>
      )}
      {dqResult.rules && dqResult.rules.length > 0 && (
        <div>
          <div className="text-[10px] text-muted-foreground font-semibold mb-1.5">RULES APPLIED</div>
          <div className="space-y-1">
            {visibleRules.map((r, i) => (
              <div key={i} className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border/50">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 mt-0.5 ${severityColor(r.severity)}`}>{r.severity.toUpperCase()}</span>
                <div className="min-w-0"><div className="text-[11px] font-semibold text-foreground truncate">{r.rule}</div>{r.description && <div className="text-[10px] text-muted-foreground">{r.description}</div>}</div>
              </div>
            ))}
          </div>
          {dqResult.rules.length > 5 && <button onClick={() => setExpanded(!expanded)} className="mt-2 text-[11px] text-primary font-semibold bg-transparent border-none cursor-pointer">{expanded ? "Show less ↑" : `Show ${dqResult.rules.length - 5} more rules ↓`}</button>}
        </div>
      )}
      {dqResult.next_actions && dqResult.next_actions.length > 0 && <NextActionChips actions={dqResult.next_actions} onActionClick={onActionClick} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// NERResultCard
// ─────────────────────────────────────────────────────────────
// function NERResultCard({ nerResult, onActionClick }: { nerResult: NERResult; onActionClick: (label: string) => void }) {
//   const entityEntries = Object.entries(nerResult.entities_detected || {});
//   return (
//     <div className="mt-3 w-full max-w-lg bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
//       <div className="flex items-center gap-2.5">
//         <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0"><Tag className="w-4.5 h-4.5 text-violet-500" style={{ width: 18, height: 18 }} /></div>
//         <div><div className="font-bold text-sm text-foreground">Name Entity Resolution Complete</div><div className="text-[11px] text-muted-foreground">Entities extracted from dataset</div></div>
//       </div>
//       <div className="flex flex-wrap gap-2">
//         <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-600 border border-violet-500/20">{nerResult.rows_processed} rows processed</span>
//         <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">{nerResult.columns_processed} columns processed</span>
//         <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">{nerResult.entity_columns_created?.length || 0} entity columns created</span>
//       </div>
//       {entityEntries.length > 0 && (
//         <div>
//           <div className="text-[10px] text-muted-foreground font-semibold mb-1.5">ENTITIES DETECTED</div>
//           <div className="flex flex-wrap gap-2">
//             {entityEntries.map(([type, count]) => (
//               <span key={type} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-muted border border-border">
//                 <span className="text-violet-500 font-bold">{type}</span><span className="text-muted-foreground">×{count}</span>
//               </span>
//             ))}
//           </div>
//         </div>
//       )}
//       {nerResult.entity_columns_created && nerResult.entity_columns_created.length > 0 && (
//         <div>
//           <div className="text-[10px] text-muted-foreground font-semibold mb-1.5">ENTITY COLUMNS CREATED</div>
//           <div className="flex flex-wrap gap-1">
//             {nerResult.entity_columns_created.slice(0, 8).map((col) => <span key={col} className="text-[10px] bg-violet-500/8 border border-violet-500/20 text-violet-600 rounded px-1.5 py-0.5 font-mono">{col}</span>)}
//             {nerResult.entity_columns_created.length > 8 && <span className="text-[10px] bg-muted border border-border rounded px-1.5 py-0.5 text-muted-foreground">+{nerResult.entity_columns_created.length - 8} more</span>}
//           </div>
//         </div>
//       )}
//       {nerResult.next_actions && nerResult.next_actions.length > 0 && <NextActionChips actions={nerResult.next_actions} onActionClick={onActionClick} />}
//     </div>
//   );
// }

function NERResultCard({ nerResult, onActionClick }: { nerResult: NERResult; onActionClick: (label: string) => void }) {
  const entityEntries = Object.entries(nerResult.entities_detected || {});
  const resolutions = nerResult.resolutions || [];
  return (
    <div className="mt-3 w-full max-w-lg bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0"><Tag className="w-4.5 h-4.5 text-violet-500" style={{ width: 18, height: 18 }} /></div>
        <div><div className="font-bold text-sm text-foreground">Name Entity Resolution Complete</div><div className="text-[11px] text-muted-foreground">Entities extracted from dataset</div></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-500/10 text-violet-600 border border-violet-500/20">{nerResult.rows_processed} rows processed</span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">{nerResult.columns_processed} columns processed</span>
        {resolutions.length > 0 ? (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
            <Wrench className="w-3 h-3" />{nerResult.resolutions_found} resolution{nerResult.resolutions_found !== 1 ? "s" : ""} applied
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-500/10 text-green-600 border border-green-500/20">
            <CheckCircle className="w-3 h-3" />No resolutions needed
          </span>
        )}
      </div>

      {entityEntries.length > 0 && (
        <div>
          <div className="text-[10px] text-muted-foreground font-semibold mb-1.5">ENTITIES DETECTED</div>
          <div className="flex flex-wrap gap-2">
            {entityEntries.map(([type, count]) => (
              <span key={type} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-muted border border-border">
                <span className="text-violet-500 font-bold">{type}</span><span className="text-muted-foreground">×{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {resolutions.length > 0 && (
        <div>
          <div className="text-[10px] text-muted-foreground font-semibold mb-1.5">RESOLUTIONS APPLIED</div>
          <div className="space-y-1.5">
            {resolutions.map((r, i) => (
              <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border/50 flex-wrap">
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-violet-500/15 text-violet-600 border border-violet-500/25 font-mono">{r.column}</span>
                <span className="text-[11px] text-muted-foreground line-through">{r.original}</span>
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <span className="text-[11px] font-semibold text-foreground">{r.resolved}</span>
                <span className="ml-auto text-[10px] font-semibold text-green-600 bg-green-600/10 border border-green-600/20 rounded px-1.5 py-0.5">{r.confidence}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {nerResult.next_actions && nerResult.next_actions.length > 0 && <NextActionChips actions={nerResult.next_actions} onActionClick={onActionClick} />}
    </div>
  );
}

 

// ─────────────────────────────────────────────────────────────
// BusinessLogicResultCard
// ─────────────────────────────────────────────────────────────
function BusinessLogicResultCard({ blResult, onActionClick }: { blResult: BLResult; onActionClick: (label: string) => void }) {
  return (
    <div className="mt-3 w-full max-w-lg bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0"><Zap className="w-4.5 h-4.5 text-amber-500" style={{ width: 18, height: 18 }} /></div>
        <div><div className="font-bold text-sm text-foreground">Business Logic Applied</div><div className="text-[11px] text-muted-foreground">Rules processed successfully</div></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-green-500/10 text-green-600 border border-green-500/20"><Check className="w-3 h-3" />{blResult.rules_applied}/{blResult.rules_received} rules applied</span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">{blResult.rows} rows</span>
        <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-600 border border-blue-500/20">{blResult.columns} columns</span>
      </div>
      {blResult.applied_rules && blResult.applied_rules.length > 0 && (
        <div>
          <div className="text-[10px] text-muted-foreground font-semibold mb-1.5">RULES APPLIED</div>
          <div className="space-y-1">
            {blResult.applied_rules.map((rule, i) => (
              <div key={i} className="flex items-start gap-2 px-2.5 py-1.5 rounded-lg bg-muted/40 border border-border/50">
                <span className="text-[9px] font-bold text-green-600 bg-green-600/10 border border-green-600/20 px-1.5 py-0.5 rounded shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-[11px] text-foreground">{rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {blResult.generated_columns && blResult.generated_columns.length > 0 && (
        <div>
          <div className="text-[10px] text-muted-foreground font-semibold mb-1.5">NEW COLUMNS GENERATED</div>
          <div className="flex flex-wrap gap-1">{blResult.generated_columns.map((col) => <span key={col} className="text-[10px] bg-amber-500/8 border border-amber-500/20 text-amber-600 rounded px-1.5 py-0.5 font-mono">{col}</span>)}</div>
        </div>
      )}
      {blResult.rules_skipped && blResult.rules_skipped.length > 0 && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs" style={{ background: "hsl(38 92% 50% / 0.08)", border: "1px solid hsl(38 92% 50% / 0.3)", color: "hsl(38 60% 40%)" }}>
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /><span>{blResult.rules_skipped.length} rule(s) skipped</span>
        </div>
      )}
      {blResult.next_actions && blResult.next_actions.length > 0 && <NextActionChips actions={blResult.next_actions} onActionClick={onActionClick} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AutoMLResultCard
// ─────────────────────────────────────────────────────────────
function AutoMLResultCard({ automlResult }: { automlResult: AutoMLResult }) {
  return (
    <div className="mt-3 w-full max-w-2xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><div className="p-2 rounded-lg bg-primary/10 border border-primary/20"><Cpu className="w-5 h-5 text-primary" /></div><span className="text-base font-semibold text-foreground">AutoML Results</span></div>
        <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-500" /><span className="text-sm font-medium text-green-500">Build Complete</span></div>
      </div>
      <div className="flex flex-wrap gap-2 text-xs">
        <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">Task: {automlResult.task_type}</span>
        <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">Target: {automlResult.target}</span>
        <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">Best: {automlResult.best_model}</span>
        <span className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-400 font-medium">{automlResult.primary_metric?.toUpperCase()}: {fmt(automlResult.primary_score)}</span>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b bg-muted/40 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-primary" /><h3 className="text-sm font-semibold text-foreground">Performance Metrics — Train vs Test</h3></div>
        <PerformanceMetricsTable allModels={automlResult.all_models || {}} bestModel={automlResult.best_model} taskType={automlResult.task_type || "Regression"} />
      </div>
      {automlResult.analysis && <div className="bg-card border border-border rounded-xl p-5"><h2 className="text-sm font-semibold mb-3 text-primary flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Analysis Summary</h2><FormattedAnalysisText text={automlResult.analysis} /></div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// PipelineCreatedCard
// ─────────────────────────────────────────────────────────────
function PipelineCreatedCard({ pipeline, allJobs }: { pipeline: PipelineCreatedResult; allJobs: PipelineJob[] }) {
  const resolvedJobs: { job_id: string; job_name: string }[] = (() => {
    if (pipeline.job_ids && pipeline.job_ids.length > 0) return pipeline.job_ids;
    if (pipeline.selected_jobs && pipeline.selected_jobs.length > 0) return pipeline.selected_jobs;
    if (pipeline.jobs && pipeline.jobs.length > 0) {
      return pipeline.jobs.map((jobId) => {
        const name =
          pipeline.job_names?.[jobId] ||
          allJobs.find((j) => j.job_id === jobId)?.job_name ||
          jobId.slice(0, 8) + "…";
        return { job_id: jobId, job_name: name };
      });
    }
    return [];
  })();

  const sched = pipeline.schedule;
  const scheduleLabel = (): string | null => {
    if (!sched) return null;
    if (sched.frequency && sched.time_utc) {
      const freq = sched.frequency.charAt(0).toUpperCase() + sched.frequency.slice(1);
      const parts: string[] = [`${freq} at ${sched.time_utc} UTC`];
      if (sched.start_date) parts.push(`starting ${sched.start_date}`);
      return parts.join(", ");
    }
    if (sched.type) {
      const t = `${String(sched.hour ?? 0).padStart(2, "0")}:${String(sched.minute ?? 0).padStart(2, "0")}`;
      if (sched.type === "daily") return `Every day at ${t}`;
      if (sched.type === "weekly") return `Every week at ${t}`;
      if (sched.type === "monthly") return `Every month on day ${sched.day} at ${t}`;
      return `${sched.type} at ${t}`;
    }
    return null;
  };
  const schedStr = scheduleLabel();

  const createdLabel = pipeline.created_at
    ? new Date(pipeline.created_at).toLocaleString("en-US", {
        month: "short", day: "numeric", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  return (
    <div
      className="mt-2.5 max-w-[480px] rounded-xl border p-4 space-y-3"
      style={{
        background: "linear-gradient(135deg, hsl(142 72% 42% / 0.07), hsl(197 100% 55% / 0.05))",
        border: "1.5px solid hsl(142 72% 42% / 0.35)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-10 h-10 rounded-xl bg-green-600 flex items-center justify-center shrink-0 shadow-sm shadow-green-600/25">
          <CheckCircle className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-bold text-sm text-foreground">Pipeline Created Successfully</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {schedStr ? "Scheduled & ready to run" : "Ready to run on demand"}
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, hsl(267 84% 60%), hsl(220 90% 60%))" }}
        >
          <GitBranch className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[10px] text-muted-foreground font-semibold mb-0.5 uppercase tracking-wide">Pipeline Name</div>
          <div className="text-sm font-bold text-foreground truncate">{pipeline.name}</div>
        </div>
        {createdLabel && (
          <div className="text-right shrink-0">
            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Created</div>
            <div className="text-[11px] text-foreground font-medium">{createdLabel}</div>
          </div>
        )}
      </div>

      {resolvedJobs.length > 0 && (
        <div>
          <div className="text-[10px] text-muted-foreground font-semibold mb-1.5 uppercase tracking-wide">
            Jobs Included ({resolvedJobs.length})
          </div>
          <div className="space-y-1">
            {resolvedJobs.map((job, idx) => (
              <div
                key={job.job_id}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2"
                style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
              >
                <span
                  className="text-[9px] font-bold text-white rounded px-1.5 py-0.5 shrink-0"
                  style={{ background: "linear-gradient(135deg, hsl(267 84% 60%), hsl(220 90% 60%))" }}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-foreground truncate">{job.job_name}</div>
                  <div className="text-[10px] text-muted-foreground font-mono">{job.job_id.slice(0, 8)}…</div>
                </div>
                <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {schedStr && (
        <div
          className="flex items-center gap-2.5 rounded-lg px-3 py-2.5"
          style={{
            background: "hsl(197 100% 50% / 0.07)",
            border: "1px solid hsl(197 100% 50% / 0.25)",
          }}
        >
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: "hsl(197 100% 50% / 0.15)" }}
          >
            <Calendar className="w-3.5 h-3.5" style={{ color: "hsl(197 100% 35%)" }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Schedule</div>
            <div className="text-xs font-semibold" style={{ color: "hsl(197 100% 32%)" }}>{schedStr}</div>
          </div>
          <span
            className="text-[10px] font-bold text-white rounded-full px-2 py-0.5 shrink-0"
            style={{ background: sched?.active === false ? "hsl(0 72% 51%)" : "hsl(142 72% 38%)" }}
          >
            {sched?.active === false ? "Inactive" : "Active"}
          </span>
        </div>
      )}

      <div className="text-[10px] text-muted-foreground font-mono pt-1 border-t border-border/40">
        ID: {pipeline.pipeline_id}
      </div>

      {pipeline.next_actions && pipeline.next_actions.length > 0 && (
        <NextActionChips actions={pipeline.next_actions} onActionClick={() => {}} />
      )}
    </div>
  );
}

function NoData() {
  return <div className="h-full flex items-center justify-center text-muted-foreground gap-2"><AlertCircle className="w-6 h-6" /><span className="text-sm">No data available</span></div>;
}

// ─────────────────────────────────────────────────────────────
// ChartRenderer
// ─────────────────────────────────────────────────────────────
function ChartRenderer({ visual }: { visual: DashboardVisual }) {
  const h = 260;
  if (visual.chart_type === "bar" && visual.data?.x) {
    const barData = visual.data.x.map((label: string, i: number) => ({ label, ...(visual.data.series ? Object.fromEntries(Object.entries(visual.data.series).map(([k, vals]: [string, any]) => [k, vals[i]])) : { value: visual.data.y?.[i] ?? 0 }) }));
    const keys = visual.data.series ? Object.keys(visual.data.series) : ["value"];
    return (<ResponsiveContainer width="100%" height={h}><BarChart data={barData} margin={{ top: 4, right: 8, bottom: 20, left: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />{keys.map((k, i) => <Bar key={k} dataKey={k} fill={DASHBOARD_COLORS[i % DASHBOARD_COLORS.length]} radius={[4, 4, 0, 0]} />)}</BarChart></ResponsiveContainer>);
  }
  if ((visual.chart_type === "donut" || visual.chart_type === "pie") && visual.data?.labels) {
    const pieData = visual.data.labels.map((name: string, i: number) => ({ name, value: visual.data.values?.[i] ?? 0 }));
    return (<ResponsiveContainer width="100%" height={h}><PieChart><Pie data={pieData} dataKey="value" nameKey="name" innerRadius={visual.chart_type === "donut" ? 60 : 0} outerRadius={90} paddingAngle={3}>{pieData.map((_: any, i: number) => <Cell key={i} fill={DASHBOARD_COLORS[i % DASHBOARD_COLORS.length]} />)}</Pie><Tooltip formatter={(val: number) => `${val}%`} /><Legend wrapperStyle={{ fontSize: 12 }} /></PieChart></ResponsiveContainer>);
  }
  if (visual.chart_type === "scatter" && visual.data?.x) {
    const scatterData = visual.data.x.map((x: number, i: number) => ({ x, y: visual.data.y?.[i] ?? 0 }));
    return (<ResponsiveContainer width="100%" height={h}><ScatterChart margin={{ top: 4, right: 8, bottom: 20, left: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="x" tick={{ fontSize: 11 }} /><YAxis dataKey="y" tick={{ fontSize: 11 }} /><Tooltip cursor={{ strokeDasharray: "3 3" }} /><Scatter data={scatterData} fill={DASHBOARD_COLORS[0]} /></ScatterChart></ResponsiveContainer>);
  }
  if (visual.chart_type === "table" && visual.data?.rows?.length) {
    const cols = Object.keys(visual.data.rows[0]);
    return (<div className="overflow-auto max-h-72"><table className="text-xs w-full"><thead className="bg-muted sticky top-0"><tr>{cols.map((c) => <th key={c} className="border-b border-border px-2 py-1.5 text-left font-semibold text-muted-foreground whitespace-nowrap">{c}</th>)}</tr></thead><tbody>{visual.data.rows.map((row: any, i: number) => (<tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50" style={{ background: i % 2 === 0 ? "transparent" : "hsl(var(--muted) / 0.3)" }}>{cols.map((c) => <td key={c} className="px-2 py-1.5 text-foreground whitespace-nowrap">{String(row[c] ?? "—")}</td>)}</tr>))}</tbody></table></div>);
  }
  if (visual.chart_type === "line" && visual.data?.x) {
    const lineData = visual.data.x.map((label: string, i: number) => ({ label, ...(visual.data.series ? Object.fromEntries(Object.entries(visual.data.series).map(([k, vals]: [string, any]) => [k, vals[i]])) : { value: visual.data.y?.[i] ?? 0 }) }));
    const keys = visual.data.series ? Object.keys(visual.data.series) : ["value"];
    return (<ResponsiveContainer width="100%" height={h}><LineChart data={lineData} margin={{ top: 4, right: 8, bottom: 20, left: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />{keys.map((k, i) => <Line key={k} type="monotone" dataKey={k} stroke={DASHBOARD_COLORS[i % DASHBOARD_COLORS.length]} strokeWidth={2} dot={false} />)}</LineChart></ResponsiveContainer>);
  }
  if (visual.chart_type === "area" && visual.data?.x) {
    const areaData = visual.data.x.map((label: string, i: number) => ({ label, ...(visual.data.series ? Object.fromEntries(Object.entries(visual.data.series).map(([k, vals]: [string, any]) => [k, vals[i]])) : { value: visual.data.y?.[i] ?? 0 }) }));
    const keys = visual.data.series ? Object.keys(visual.data.series) : ["value"];
    return (<ResponsiveContainer width="100%" height={h}><AreaChart data={areaData} margin={{ top: 4, right: 8, bottom: 20, left: 8 }}><CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" /><XAxis dataKey="label" tick={{ fontSize: 11 }} /><YAxis tick={{ fontSize: 11 }} /><Tooltip />{keys.map((k, i) => <Area key={k} type="monotone" dataKey={k} stroke={DASHBOARD_COLORS[i % DASHBOARD_COLORS.length]} fill={`${DASHBOARD_COLORS[i % DASHBOARD_COLORS.length]}33`} strokeWidth={2} />)}</AreaChart></ResponsiveContainer>);
  }
  return <NoData />;
}

// ─────────────────────────────────────────────────────────────
// PowerBIDashboardCard
// ─────────────────────────────────────────────────────────────
function PowerBIDashboardCard({ dashboard }: { dashboard: DashboardResult }) {
  const navigate = useNavigate();
  const visuals = dashboard.visuals || [];
  const kpiVisuals = visuals.filter((v: any) => v.chart_type === "KPI" || v.chart_type === "card");
  const chartVisuals = visuals.filter((v: any) => !["KPI", "card"].includes(v.chart_type));
  return (
    <div className="mt-3 w-full max-w-2xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2"><div className="p-2 rounded-lg bg-primary/10 border border-primary/20"><BarChart3 className="w-5 h-5 text-primary" /></div><span className="text-base font-semibold text-foreground">Power BI Dashboard</span></div>
        <button onClick={() => navigate("/workflow/powerbi-flow")} className="flex items-center gap-1.5 text-xs font-semibold text-white rounded-lg px-3.5 py-1.5 cursor-pointer" style={{ background: "linear-gradient(135deg, #2563eb, #1d4ed8)", border: "1px solid rgba(255,255,255,0.15)" }}><Share2 className="w-3 h-3" />Deploy to Power BI</button>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">{kpiVisuals.length} KPIs</span>
        <span className="px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-400 font-medium">{dashboard.total_visuals} Visuals</span>
        <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">{dashboard.total_kpis_discovered} KPIs Discovered</span>
      </div>
      {kpiVisuals.length > 0 && (<div><div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-primary" /><span className="text-sm font-semibold text-foreground">Key Results</span></div><div className="grid grid-cols-2 sm:grid-cols-3 gap-3">{kpiVisuals.map((kpi: any, i: number) => { const val = kpi.value; const formatted = val == null ? "No data" : val >= 1_000_000 ? `${(val / 1_000_000).toFixed(2)}M` : val >= 1_000 ? `${(val / 1_000).toFixed(2)}K` : val.toLocaleString(undefined, { maximumFractionDigits: 2 }); return (<div key={i} className="bg-card border border-border rounded-xl p-4"><p className="text-xs text-muted-foreground font-medium mb-1">{kpi.chart_name}</p><p className="text-xl font-bold text-primary mb-1">{formatted}</p><p className="text-[10px] text-muted-foreground">{kpi.description || "Result from query"}</p></div>); })}</div></div>)}
      {chartVisuals.length > 0 && (<div><div className="flex items-center gap-2 mb-3"><BarChart3 className="w-4 h-4 text-primary" /><span className="text-sm font-semibold text-foreground">Charts</span></div><div className="space-y-4">{chartVisuals.map((v: any, i: number) => (<div key={i} className="bg-card border border-border rounded-xl p-4"><div className="flex items-center justify-between mb-3"><p className="text-xs font-semibold text-foreground">{v.chart_name}</p><span className="text-[10px] text-muted-foreground bg-muted rounded px-2 py-0.5 capitalize">{v.chart_type}</span></div>{v.description && <p className="text-[11px] text-muted-foreground mb-3">{v.description}</p>}<ChartRenderer visual={v} /></div>))}</div></div>)}
      {!kpiVisuals.length && !chartVisuals.length && (<div className="text-center py-10"><AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" /><p className="text-sm text-foreground">No results generated</p></div>)}
    </div>
  );
}

function PipelineJobSelector({ jobs, onConfirm }: { jobs: PipelineJob[]; onConfirm: (selectedIds: string[]) => void }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setSelected((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  return (
    <div className="mt-2.5 max-w-[420px]">
      <p className="text-xs font-semibold text-muted-foreground mb-2">Select jobs to include in the pipeline:</p>
      <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
        {jobs.map((job) => (
          <label key={job.job_id} className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all" style={{ border: selected.has(job.job_id) ? "1.5px solid hsl(var(--primary))" : "1.5px solid hsl(var(--border))", background: selected.has(job.job_id) ? "hsl(var(--primary) / 0.08)" : "hsl(var(--card))" }}>
            <input type="checkbox" checked={selected.has(job.job_id)} onChange={() => toggle(job.job_id)} className="w-3.5 h-3.5 accent-primary" />
            <div><span className="text-xs font-semibold">{job.job_name}</span><span className="text-[10px] text-muted-foreground ml-1.5">{job.job_id.slice(0, 8)}…</span></div>
          </label>
        ))}
      </div>
      <button disabled={selected.size === 0} onClick={() => onConfirm(Array.from(selected))} className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-white rounded-lg px-4 py-1.5 transition-all" style={{ background: selected.size === 0 ? "hsl(var(--muted))" : "linear-gradient(135deg, hsl(267 84% 60%), hsl(220 90% 60%))", border: "none", cursor: selected.size === 0 ? "not-allowed" : "pointer", opacity: selected.size === 0 ? 0.5 : 1 }}>
        <Check className="w-3 h-3" />Confirm Selection ({selected.size})
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// ResultCard
// ─────────────────────────────────────────────────────────────
function ResultCard({ result, userId, threadId, onDownload, onActionClick, alreadySaved }: {
  result: MessageResult; userId: string | null; threadId: string | null;
  onDownload: (url: string) => void; onActionClick: (label: string) => void; alreadySaved?: boolean;
}) {
  const [jobName, setJobName] = useState(result.job_name || result.suggested_job_name || result.pipeline_name || "");
  const [datasetName, setDatasetName] = useState(result.final_dataset?.dataset_name || "");
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(alreadySaved ? "success" : "idle");
  const currentThreadId = threadId || localStorage.getItem("current_thread_id");
  const isSaved = saveStatus === "success";

  const handleSaveJobName = async (newName: string) => {
    const res = await fetch(`${BASE_URL}/rename-job`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId, job_id: result.job_id, new_name: newName, thread_id: currentThreadId }) });
    const data = await res.json();
    if (data.status === "success") setJobName(data.new_job_name || newName);
    else throw new Error("Failed");
  };

  const handleRenameDataset = async (newName: string) => {
    const res = await fetch(`${BASE_URL}/rename-dataset`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId, job_id: result.job_id, new_name: newName, thread_id: currentThreadId }) });
    const data = await res.json();
    if (data.status === "success") {
      const newDatasetName = data.new_dataset_name || newName;
      setDatasetName(newDatasetName);
      const csvName = withCsvExtension(newDatasetName);
      if (data.blob_path) localStorage.setItem("current_dataset_path", data.blob_path);
      if (data.onelake_path) localStorage.setItem("current_onelake_path", data.onelake_path);
      localStorage.setItem("current_dataset_name", csvName);
    } else throw new Error("Failed");
  };

  const handleSaveJob = async () => {
    if (saving || saveStatus === "success") return;
    setSaving(true);
    const aivolveUser = getAivolveUser();
    try {
      const res = await fetch(`${BASE_URL}/save-job`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId, job_id: result.job_id, thread_id: currentThreadId, session_id: aivolveUser?.session_id || "", user_email: aivolveUser?.email || "", frequency: "none", time_utc: "none" }) });
      const data = await res.json();
      if (data.success === true && data.saved === true) setSaveStatus("success");
      else { setSaveStatus("error"); setTimeout(() => setSaveStatus("idle"), 3000); }
    } catch { setSaveStatus("error"); setTimeout(() => setSaveStatus("idle"), 3000); }
    finally { setSaving(false); }
  };

  return (
    <div className="mt-3 w-full max-w-2xl bg-card border border-border rounded-xl p-4 shadow-sm space-y-3">
      {!isSaved && (
        <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl" style={{ background: "linear-gradient(135deg, hsl(38 92% 50% / 0.1), hsl(38 92% 50% / 0.05))", border: "1.5px solid hsl(38 92% 50% / 0.4)" }}>
          <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-[12px] font-bold text-amber-600 mb-0.5">Save your dataset to continue</div>
            <div className="text-[11px] text-amber-700/80 dark:text-amber-400/80">Please click <strong>Save Job</strong> below before running DQ, NER, Business Logic, Dashboard, or AutoML.</div>
          </div>
        </div>
      )}
      <EditableField label="Job Name" value={jobName} onSave={handleSaveJobName} isSaved={isSaved} />
      {result.data_model && result.relationships && (
        <div>
          <p className="text-xs font-semibold text-foreground mb-2">Data Model</p>
          <div className="h-[400px] w-full border border-border rounded-lg overflow-hidden">
            <ReactFlow nodes={buildStarSchema(result.data_model, result.relationships, result.schemas).nodes} edges={buildStarSchema(result.data_model, result.relationships, result.schemas).edges} nodeTypes={schemaNodeTypes} edgeTypes={schemaEdgeTypes} fitView fitViewOptions={{ padding: 0.3 }} proOptions={{ hideAttribution: true }}>
              <Background gap={20} size={1} /><Controls showInteractive={false} />
            </ReactFlow>
          </div>
          <DataModelSummary dataModel={result.data_model} relationships={result.relationships} schemas={result.schemas} />
        </div>
      )}
      {result.final_dataset && <EditableField label="Dataset" value={datasetName} onSave={handleRenameDataset} isSaved={isSaved} />}
      {result.final_dataset?.preview && result.final_dataset.preview.length > 0 && (
        <div className="overflow-auto border border-border rounded-lg">
          <table className="text-xs w-full">
            <thead className="bg-muted"><tr>{Object.keys(result.final_dataset.preview[0]).map((key) => (<th key={key} className="border-b border-border px-2 py-1.5 text-left text-muted-foreground font-semibold whitespace-nowrap">{key}</th>))}</tr></thead>
            <tbody>{result.final_dataset.preview.slice(0, 5).map((row, i) => (<tr key={i} className="border-b border-border last:border-0 hover:bg-muted/50">{Object.values(row).map((val: any, j) => (<td key={j} className="px-2 py-1.5 text-foreground whitespace-nowrap">{String(val)}</td>))}</tr>))}</tbody>
          </table>
        </div>
      )}
      <div className="flex gap-2 flex-wrap mt-2">
        <button onClick={handleSaveJob} disabled={saving || saveStatus === "success"}
          className="flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3.5 py-1.5 border transition-all"
          style={{ color: saveStatus === "success" ? "#fff" : saveStatus === "error" ? "#fff" : "hsl(var(--foreground))", background: saveStatus === "success" ? "hsl(142 72% 38%)" : saveStatus === "error" ? "hsl(0 72% 51%)" : "hsl(var(--muted))", borderColor: saveStatus === "success" ? "hsl(142 72% 38%)" : saveStatus === "error" ? "hsl(0 72% 51%)" : "hsl(var(--border))", cursor: saveStatus === "success" ? "default" : saving ? "not-allowed" : "pointer" }}>
          {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saveStatus === "success" ? <Check className="w-3 h-3" /> : <span>💾</span>}
          {saving ? "Saving…" : saveStatus === "success" ? "Saved!" : "Save Job"}
        </button>
        {result.download_url && (
          <button onClick={() => onDownload(result.download_url)} className="flex items-center gap-1.5 text-xs font-semibold text-white rounded-lg px-3.5 py-1.5 cursor-pointer border-none" style={{ background: "linear-gradient(135deg, hsl(267 84% 60%), hsl(220 90% 60%))" }}>
            <span>⬇️</span> Download CSV
          </button>
        )}
      </div>
      {result.next_actions && result.next_actions.length > 0 && <NextActionChips actions={result.next_actions} onActionClick={onActionClick} />}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SheetSelectionModal
// ─────────────────────────────────────────────────────────────
function SheetSelectionModal({ state, onSelect, onClose }: { state: SheetSelectionState; onSelect: (sheetName: string) => void; onClose: () => void }) {
  if (!state.open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
      <div onClick={onClose} className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
      <div className="relative bg-background border border-border rounded-2xl shadow-2xl overflow-hidden" style={{ width: 420, maxWidth: "95vw" }}>
        <div className="px-5 py-4 border-b border-border bg-card flex items-center justify-between">
          <div><div className="font-bold text-sm mb-0.5">Select a Sheet</div><div className="text-xs text-muted-foreground">{state.fileName} contains multiple sheets</div></div>
          <button onClick={onClose} className="bg-muted border border-border rounded-lg p-1.5 cursor-pointer flex items-center"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
        </div>
        <div className="p-4">
          <p className="text-xs text-muted-foreground mb-3">Choose which sheet to upload as your dataset:</p>
          <div className="flex flex-col gap-2 max-h-64 overflow-y-auto">
            {state.sheets.map((sheet) => (
              <button key={sheet} onClick={() => onSelect(sheet)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all cursor-pointer" style={{ border: "1.5px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(267 84% 60% / 0.5)"; (e.currentTarget as HTMLButtonElement).style.background = "hsl(267 84% 60% / 0.07)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(var(--border))"; (e.currentTarget as HTMLButtonElement).style.background = "hsl(var(--card))"; }}
              >
                <div className="w-7 h-7 rounded-lg bg-green-600/10 flex items-center justify-center shrink-0"><Table2 className="w-3.5 h-3.5 text-green-600" /></div>
                <span className="text-sm font-semibold text-foreground">{sheet}</span>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─────────────────────────────────────────────────────────────
// HistoryPanel
// ─────────────────────────────────────────────────────────────
function HistoryPanel({
  userId,
  jobId,
  currentThreadId,
  onSelectThread,
  onClose,
}: {
  userId: string | null;
  jobId: string | null;
  currentThreadId: string | null;
  onSelectThread: (threadId: string) => void;
  onClose: () => void;
}) {
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingThreadId, setLoadingThreadId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !jobId) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    fetch(`${BASE_URL}/threads/${userId}/${jobId}`)
      .then((r) => { if (!r.ok) throw new Error(`${r.status}`); return r.json(); })
      .then((data: ThreadItem[]) => {
        const sorted = [...data].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        setThreads(sorted);
      })
      .catch((e) => setError(e.message || "Failed to load history"))
      .finally(() => setLoading(false));
  }, [userId, jobId]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const handleThreadClick = async (thread: ThreadItem) => {
    if (thread.thread_id === currentThreadId) { onClose(); return; }
    setLoadingThreadId(thread.thread_id);
    onSelectThread(thread.thread_id);
  };

  return (
    <div className="flex flex-col bg-background" style={{ width: 300, minWidth: 300, borderLeft: "1px solid hsl(var(--border))", overflow: "hidden", flexShrink: 0 }}>
      <div className="shrink-0 px-4 pt-3.5 pb-3 border-b border-border bg-card">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, hsl(267 84% 60%), hsl(220 90% 60%))" }}>
              <History className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="font-bold text-[14px] text-foreground">Chat History</div>
              <div className="text-[11px] text-muted-foreground">{loading ? "Loading…" : `${threads.length} conversation${threads.length !== 1 ? "s" : ""}`}</div>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center cursor-pointer text-muted-foreground hover:bg-accent transition-all"><X className="w-3 h-3" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-xs">Loading history…</span></div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-40 gap-2 text-center px-4"><AlertCircle className="w-6 h-6 text-red-400" /><span className="text-xs text-red-400 font-medium">Failed to load history</span><span className="text-[11px] text-muted-foreground">{error}</span></div>
        ) : threads.length === 0 ? (
          <div className="text-center py-10 px-4"><MessageSquare className="w-7 h-7 text-muted-foreground mx-auto mb-2" /><div className="text-sm font-semibold text-foreground mb-1">No conversations yet</div><div className="text-[11px] text-muted-foreground">Start a new chat to see it here</div></div>
        ) : (
          <div className="space-y-1.5">
            {threads.map((thread) => {
              const isActive = thread.thread_id === currentThreadId;
              const isLoading = loadingThreadId === thread.thread_id;
              return (
                <button key={thread.thread_id} onClick={() => handleThreadClick(thread)} disabled={isLoading}
                  className="w-full text-left rounded-xl px-3 py-2.5 transition-all cursor-pointer group"
                  style={{ border: isActive ? "1.5px solid hsl(267 84% 60% / 0.6)" : "1.5px solid hsl(var(--border))", background: isActive ? "linear-gradient(135deg, hsl(267 84% 60% / 0.12), hsl(220 90% 60% / 0.07))" : "hsl(var(--card))", boxShadow: isActive ? "0 0 0 3px hsl(267 84% 60% / 0.12)" : "none" }}
                  onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(267 84% 60% / 0.4)"; (e.currentTarget as HTMLButtonElement).style.background = "hsl(var(--muted) / 0.6)"; } }}
                  onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(var(--border))"; (e.currentTarget as HTMLButtonElement).style.background = "hsl(var(--card))"; } }}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center mt-0.5" style={{ background: isActive ? "linear-gradient(135deg, hsl(267 84% 60%), hsl(220 90% 60%))" : "hsl(var(--muted))" }}>
                      {isLoading ? <Loader2 className="w-3 h-3 animate-spin" style={{ color: isActive ? "#fff" : "hsl(var(--muted-foreground))" }} /> : <MessageSquare className="w-3 h-3" style={{ color: isActive ? "#fff" : "hsl(var(--muted-foreground))" }} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="text-[12px] font-semibold truncate" style={{ color: isActive ? "hsl(267 84% 55%)" : "hsl(var(--foreground))" }}>{thread.title || "New Chat"}</span>
                        {isActive && <span className="shrink-0 text-[9px] font-bold text-white bg-purple-600 rounded-full px-1.5 py-0.5 leading-tight">Active</span>}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><Clock className="w-2.5 h-2.5 shrink-0" /><span>{formatDate(thread.updated_at)}</span></div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="shrink-0 px-4 py-2.5 border-t border-border/50"><p className="text-[10px] text-muted-foreground text-center">Click a conversation to load its history</p></div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DatasetPanel
// ─────────────────────────────────────────────────────────────
function DatasetPanel({ userId, activeDataset, onSelect, onDeselect, onClose }: { userId: string | null; activeDataset: ActiveDataset | null; onSelect: (ds: ActiveDataset) => void; onDeselect: () => void; onClose: () => void; }) {
  const [datasets, setDatasets] = useState<DatasetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [previewTarget, setPreviewTarget] = useState<DatasetItem | null>(null);
  const [previewData, setPreviewData] = useState<DatasetPreviewData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`https://api.veriton.ai/api/service2/datasets?user_id=${userId}`)
      .then((r) => r.json())
      .then((data: any[]) => {
        setDatasets(data.map((item) => ({ jobName: item.job_name || "Unnamed Job", datasetName: item.dataset_name || "Unnamed Dataset", lastRun: item.completed_at ? new Date(item.completed_at).toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—", completedAt: item.completed_at || "", job_id: item.job_id || "", dataset_path: item.dataset_path || item.blob_path || "", onelake_path: item.onelake_path || "" })));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const openPreview = async (e: React.MouseEvent, ds: DatasetItem) => {
    e.stopPropagation();
    setPreviewTarget(ds); setPreviewData(null); setPreviewError(null); setPreviewLoading(true);
    try {
      const res = await fetch(`https://api.veriton.ai/api/service2/preview-dataset?user_id=${userId}&job_id=${ds.job_id}&datasetname=${encodeURIComponent(ds.datasetName)}`);
      if (!res.ok) throw new Error(`${res.status}`);
      setPreviewData(await res.json());
    } catch (e: any) { setPreviewError(e.message || "Failed to load preview"); } finally { setPreviewLoading(false); }
  };

  const filtered = datasets.filter((d) => d.datasetName.toLowerCase().includes(search.toLowerCase()) || d.jobName.toLowerCase().includes(search.toLowerCase()));

  const handleCardClick = (ds: DatasetItem) => {
    const isActive = activeDataset?.datasetName === withCsvExtension(ds.datasetName) && activeDataset?.job_id === ds.job_id;
    if (isActive) { onDeselect(); return; }
    const datasetNameWithExt = withCsvExtension(ds.datasetName);
    const datasetPath = `${userId}/${ds.job_id}/${datasetNameWithExt}`;
    const onelakePath = `Files/Datasets/${userId}/${ds.job_id}/${datasetNameWithExt}`;
    onSelect({ datasetName: datasetNameWithExt, jobName: ds.jobName, job_id: ds.job_id, dataset_path: datasetPath, onelake_path: onelakePath });
  };

  return (
    <>
      <div className="flex flex-col bg-background" style={{ width: 340, minWidth: 340, borderLeft: "1px solid hsl(var(--border))", overflow: "hidden", flexShrink: 0 }}>
        <div className="shrink-0 px-4 pt-3.5 pb-3 border-b border-border bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: "linear-gradient(135deg, hsl(267 84% 60%), hsl(220 90% 60%))" }}><Database className="w-3.5 h-3.5 text-white" /></div>
              <div><div className="font-bold text-[14px] text-foreground">Your Datasets</div><div className="text-[11px] text-muted-foreground">{loading ? "Loading…" : `${datasets.length} dataset${datasets.length !== 1 ? "s" : ""}`}</div></div>
            </div>
            <button onClick={onClose} className="w-7 h-7 rounded-lg bg-muted border border-border flex items-center justify-center cursor-pointer text-muted-foreground hover:bg-accent transition-all"><X className="w-3 h-3" /></button>
          </div>
        </div>
        <div className="shrink-0 px-3 py-2.5 border-b border-border/50">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground pointer-events-none" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search datasets…" className="w-full pl-8 pr-7 py-1.5 text-xs bg-muted/50 border border-border rounded-lg text-foreground outline-none focus:border-primary/50 transition-colors" />
            {search && <button onClick={() => setSearch("")} className="absolute right-2 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0.5 flex items-center text-muted-foreground"><X className="w-2.5 h-2.5" /></button>}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-xs">Loading datasets…</span></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8 px-4"><Database className="w-7 h-7 text-muted-foreground mx-auto mb-2" /><div className="text-sm font-semibold text-foreground mb-1">{search ? "No matches found" : "No datasets yet"}</div><div className="text-[11px] text-muted-foreground">{search ? "Try a different term" : "Run a pipeline to generate datasets"}</div></div>
          ) : (
            filtered.map((ds, i) => {
              const isActive = activeDataset?.datasetName === withCsvExtension(ds.datasetName) && activeDataset?.job_id === ds.job_id;
              return (
                <div key={i} onClick={() => handleCardClick(ds)} className="rounded-xl mb-2 overflow-hidden cursor-pointer select-none"
                  style={{ border: isActive ? "2px solid hsl(267 84% 60%)" : "1.5px solid hsl(var(--border))", background: isActive ? "linear-gradient(135deg, hsl(267 84% 60% / 0.14), hsl(220 90% 60% / 0.08))" : "hsl(var(--card))", boxShadow: isActive ? "0 0 0 3px hsl(267 84% 60% / 0.18)" : "none", transition: "all 0.15s ease" }}
                  onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(267 84% 60% / 0.5)"; (e.currentTarget as HTMLDivElement).style.background = "hsl(var(--muted) / 0.5)"; } }}
                  onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(var(--border))"; (e.currentTarget as HTMLDivElement).style.background = "hsl(var(--card))"; } }}
                >
                  <div className="px-3 py-2.5">
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center" style={{ background: isActive ? "linear-gradient(135deg, hsl(267 84% 60%), hsl(220 90% 60%))" : "hsl(var(--muted))", transition: "background 0.15s ease" }}><Table2 className="w-3.5 h-3.5" style={{ color: isActive ? "#fff" : "hsl(var(--muted-foreground))" }} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5"><span className="font-bold text-[12px] overflow-hidden text-ellipsis whitespace-nowrap max-w-[170px]" style={{ color: isActive ? "hsl(267 84% 55%)" : "hsl(var(--foreground))" }}>{ds.datasetName}</span></div>
                        <div className="text-[11px] text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">{ds.jobName}</div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1"><Clock className="w-2 h-2" />{ds.lastRun}</div>
                      </div>
                      <div className="shrink-0 flex items-center pt-0.5">
                        <div style={{ width: 18, height: 18, borderRadius: "50%", border: isActive ? "2px solid hsl(267 84% 60%)" : "2px solid hsl(var(--border))", background: isActive ? "hsl(267 84% 60%)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s ease", flexShrink: 0 }}>
                          {isActive && <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#fff" }} />}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ borderTop: isActive ? "1px solid hsl(267 84% 60% / 0.25)" : "1px solid hsl(var(--border) / 0.6)", background: isActive ? "hsl(267 84% 60% / 0.06)" : "hsl(var(--muted) / 0.3)" }}>
                    <button onClick={(e) => openPreview(e, ds)} className="w-full flex items-center justify-center gap-1.5 py-1.5 text-[11px] font-semibold bg-transparent border-none cursor-pointer transition-all" style={{ color: isActive ? "hsl(267 84% 55%)" : "hsl(var(--muted-foreground))" }}><Eye className="w-3 h-3" /> Preview</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {previewTarget && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6">
          <div onClick={() => { setPreviewTarget(null); setPreviewData(null); setPreviewError(null); }} className="absolute inset-0 bg-black/65 backdrop-blur-sm" />
          <div className="relative bg-background border border-border rounded-2xl flex flex-col shadow-2xl overflow-hidden" style={{ width: "90vw", maxWidth: 920, maxHeight: "82vh" }}>
            <div className="shrink-0 px-5 py-4 border-b border-border flex items-center justify-between bg-card">
              <div>
                <div className="font-bold text-base mb-0.5">Dataset Preview</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <span className="text-primary font-semibold bg-primary/10 border border-primary/20 rounded px-2 py-0.5 text-[11px]">{previewTarget.datasetName}</span>
                  {previewData && <span>{previewData.total_columns} columns × {previewData.total_rows} rows</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeDataset?.datasetName !== previewTarget.datasetName && (<button onClick={() => { handleCardClick(previewTarget); setPreviewTarget(null); setPreviewData(null); setPreviewError(null); }} className="flex items-center gap-1.5 text-xs font-semibold text-white rounded-lg px-3.5 py-1.5 cursor-pointer border-none" style={{ background: "linear-gradient(135deg, hsl(267 84% 60%), hsl(220 90% 60%))" }}><PlayCircle className="w-3 h-3" />Use this Dataset</button>)}
                <button onClick={() => { setPreviewTarget(null); setPreviewData(null); setPreviewError(null); }} className="bg-muted border border-border rounded-lg p-1.5 cursor-pointer flex items-center"><X className="w-3.5 h-3.5 text-muted-foreground" /></button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {previewLoading ? (<div className="flex items-center justify-center h-60 gap-3 text-muted-foreground text-sm"><Loader2 className="w-6 h-6 animate-spin" />Loading preview…</div>)
                : previewError ? (<div className="flex flex-col items-center justify-center h-60 gap-2.5"><AlertCircle className="w-7 h-7 text-red-500" /><div className="text-sm font-semibold text-red-500">Failed to load preview</div><div className="text-xs text-muted-foreground">{previewError}</div></div>)
                : previewData ? (
                  <table className="w-full border-collapse text-xs">
                    <thead className="sticky top-0 z-10"><tr className="bg-primary">{previewData.columns.map((col) => (<th key={col} className="px-3.5 py-2.5 text-left font-semibold text-white whitespace-nowrap border-r border-white/10"><div className="text-xs">{col}</div><div className="text-[10px] opacity-75 font-normal mt-0.5">{previewData.column_types[col] || "?"}</div></th>))}</tr></thead>
                    <tbody>{previewData.preview_rows.length === 0 ? (<tr><td colSpan={previewData.columns.length} className="px-4 py-10 text-center text-muted-foreground text-sm">No preview rows available</td></tr>) : (previewData.preview_rows.map((row, ri) => (<tr key={ri} className="border-b border-border/50 hover:bg-primary/4 transition-colors" style={{ background: ri % 2 === 0 ? "transparent" : "hsl(var(--muted) / 0.3)" }}>{previewData.columns.map((col) => (<td key={col} className="px-3.5 py-2 text-foreground whitespace-nowrap border-r border-border/30">{row[col] != null ? String(row[col]) : <span className="text-muted-foreground">—</span>}</td>))}</tr>)))}</tbody>
                  </table>
                ) : null}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────
// safeDate
// ─────────────────────────────────────────────────────────────
function safeDate(val: any): Date {
  if (!val) return new Date();
  const d = val instanceof Date ? val : new Date(val);
  return isNaN(d.getTime()) ? new Date() : d;
}


function buildMessagesFromThreads(threadsData: any): Message[] {
  if (!threadsData) return [];

  const savedJobIds = new Set<string>(
    (threadsData?.actions || [])
      .filter((a: any) => a.action_type === "save_job" && a.status === "completed")
      .map((a: any) => a.request?.job_id || threadsData.job_id)
  );

  const rawMessages: any[] = threadsData?.messages || [];

  if (rawMessages.length === 0) {
    return buildMessagesFromActions(threadsData, savedJobIds, false);
  }

  const actionMessages = buildMessagesFromActions(threadsData, savedJobIds, true);

  // ── Pull real user messages (text + dataset types) ────────
  const userMessagesFromThread: Message[] = [];
  rawMessages.forEach((msg: any) => {
    if (msg.role !== "user") return;
    const msgType = msg.message_type || "text";
    if (msgType !== "text" && msgType !== "dataset") return;
    const content = (msg.content || "").trim();
    if (!content) return;
    const ts = safeDate(msg.timestamp);

    // For dataset uploads, find the action to get the filename/sheet attachment
    let attachment: string | undefined;
    if (msgType === "dataset") {
      const matchingUpload = (threadsData?.actions || []).find((a: any) =>
        a.action_type === "dataset_upload" &&
        a.status === "completed" &&
        Math.abs(safeDate(a.timestamp).getTime() - ts.getTime()) < 10000
      );
      if (matchingUpload?.request) {
        const { filename, sheet_name } = matchingUpload.request;
        if (filename && sheet_name) attachment = `${filename} → ${sheet_name}`;
        else if (filename) attachment = filename;
      }
    }

    userMessagesFromThread.push({
      id: msg.message_id || `msg-user-${ts.getTime()}`,
      role: "user",
      content,
      attachment,
      timestamp: ts,
    });
  });

  // ── Synthesize user bubbles for actions not in messages[] ─
  // (e.g. dashboard triggered via button click)
  const actionsNeedingUserBubble = ["dashboard", "powerbi", "dq", "ner", "business_logic", "automl", "etl"];
  const syntheticUserMessages: Message[] = [];

  (threadsData?.actions || []).forEach((action: any) => {
    if (!actionsNeedingUserBubble.includes(action.action_type)) return;
    if (action.status !== "completed") return;

    const actionTs = safeDate(action.timestamp);
    const actionTsSec = Math.round(actionTs.getTime() / 1000);

    const promptText: string =
      action.request?.prompt ||
      action.request?.user_prompt ||
      action.request?.query ||
      "";
    if (!promptText) return;

    // Skip if a real user message exists within 30s before this action
    const alreadyCovered = userMessagesFromThread.some((m) => {
      const mSec = Math.round(safeDate(m.timestamp).getTime() / 1000);
      return mSec <= actionTsSec && actionTsSec - mSec < 30;
    });
    if (alreadyCovered) return;

    syntheticUserMessages.push({
      id: `synth-user-${action.action_id || actionTsSec}`,
      role: "user",
      content: promptText,
      timestamp: new Date(actionTs.getTime() - 2000),
    });
  });

  // ── Pull assistant plain-text messages not covered by actions ─
  const assistantTextMessages: Message[] = [];
  rawMessages.forEach((msg: any) => {
    if (msg.role !== "assistant") return;
    const msgType = msg.message_type || "text";
    if (msgType === "completion" || msgType === "status") return;
    const content = (msg.content || "").trim();
    if (!content) return;
    if (content === "Hello! How can I help you today?") return;

    const ts = safeDate(msg.timestamp);
    const tsSec = Math.round(ts.getTime() / 1000);

    const alreadyCovered = actionMessages.some(
      (am) => Math.abs(Math.round(safeDate(am.timestamp).getTime() / 1000) - tsSec) < 3
    );
    if (alreadyCovered) return;

    assistantTextMessages.push({
      id: msg.message_id || `msg-asst-${ts.getTime()}`,
      role: "assistant",
      content,
      timestamp: ts,
    });
  });

  // ── Merge, sort, deduplicate ──────────────────────────────
  const all = [
    ...userMessagesFromThread,
    ...syntheticUserMessages,
    ...assistantTextMessages,
    ...actionMessages,
  ].sort((a, b) => safeDate(a.timestamp).getTime() - safeDate(b.timestamp).getTime());

  const seen = new Set<string>();
  const result: Message[] = [];
  for (const m of all) {
    if (seen.has(m.id)) continue;
    seen.add(m.id);
    result.push(m);
  }

  return result.length > 0 ? result : buildMessagesFromActions(threadsData, savedJobIds, false);
}


// // ─────────────────────────────────────────────────────────────
// // buildMessagesFromActions — fallback for action-only threads
// // ─────────────────────────────────────────────────────────────

// function buildMessagesFromActions(threadsData: any, savedJobIds: Set<string>): Message[] {
//   const msgs: Message[] = [];
//   const actions: any[] = threadsData?.actions || [];

//   const actionTypeToUserLabel: Record<string, (req: any) => string> = {
//     dataset_upload: (req) => req?.sheet_name ? `Upload file: ${req.filename} (sheet: ${req.sheet_name})` : `Upload file: ${req?.filename || "dataset"}`,
//     dq: () => "Apply Data Quality Rules",
//     ner: () => "Apply Name Entity Resolution",
//     business_logic: () => "Apply Business Logic",
//     dashboard: (req) => req?.user_prompt || "Generate Power BI Dashboard",
//     powerbi: (req) => req?.user_prompt || "Generate Power BI Dashboard",
//     automl: (req) => req?.query || "Build AutoML Model",
//     pipeline: (req) => req?.prompt || "Create Pipeline",
//     pipeline_wizard: (req) => req?.prompt || req?.message || "Create Pipeline",
//     etl: (req) => req?.prompt || "Run ETL",
//   };

//   const wizardUserTypes = new Set(["pipeline_job_selection", "pipeline_name", "pipeline_schedule_decision", "pipeline_schedule_details"]);

//   let pipelineUserMessageAdded = false;

//   for (const action of actions) {
//     const { action_type, request, response, status } = action;
//     if (action_type === "save_job") continue;

//     const timestamp = safeDate(action.timestamp || action.created_at || action.updated_at);

//     if (wizardUserTypes.has(action_type)) {
//       if (!pipelineUserMessageAdded) {
//         msgs.push({ id: `pipeline-user-${timestamp.getTime()}`, role: "user", content: "Create Pipeline", timestamp });
//         pipelineUserMessageAdded = true;
//       }
//       continue;
//     }

//     if (action_type === "pipeline_wizard") {
//       const resp = response || {};
//       const ts2 = safeDate(action.timestamp);

//   if (resp.status === "pipeline_job_selection_required" && resp.jobs) {
//         if (!pipelineUserMessageAdded) {
//           msgs.push({ id: `pipeline-user-${ts2.getTime()}`, role: "user", content: "Create Pipeline", timestamp: ts2 });
//           pipelineUserMessageAdded = true;
//         }
//         const jobs: PipelineJob[] = (resp.jobs || []).map((j: any) => ({ job_id: j.job_id, job_name: j.job_name }));
//         msgs.push({
//           id: `pipeline_wizard-jsel-${ts2.getTime()}`,
//           role: "assistant",
//           content: "Select the jobs to include in your pipeline:",
//           timestamp: ts2,
//           pipelineJobs: jobs,
//         });
//         continue;
//       }

//       if (resp.status === "pipeline_name_required") {
//         msgs.push({ id: `pipeline_wizard-name-${ts2.getTime()}`, role: "assistant", content: resp.message || "Enter pipeline name.", timestamp: ts2 });
//         continue;
//       }

//       if (resp.status === "pipeline_schedule_decision_required") {
//         msgs.push({ id: `pipeline_wizard-sched-dec-${ts2.getTime()}`, role: "assistant", content: resp.message || "Do you want to schedule this pipeline? (yes/no)", timestamp: ts2 });
//         continue;
//       }

//       if (resp.status === "pipeline_schedule_details_required") {
//         msgs.push({ id: `pipeline_wizard-sched-det-${ts2.getTime()}`, role: "assistant", content: resp.message || "Enter frequency, start date and time.\n\nExample:\ndaily, 2026-06-15, 09:00", timestamp: ts2 });
//         continue;
//       }

//       if (resp.status === "success" && (resp.pipeline || resp.pipeline_id)) {
//         const raw = resp.pipeline || resp;
//         const jobIdsArr = raw.job_ids || raw.selected_jobs || resp.selected_jobs || [];
//         msgs.push({
//           id: `pipeline_wizard-done-${ts2.getTime()}`,
//           role: "assistant",
//           content: resp.message || "Pipeline created successfully.",
//           timestamp: ts2,
//           pipelineCreated: {
//             pipeline_id: raw.pipeline_id || "",
//             name: raw.name || "",
//             created_at: raw.created_at,
//             job_ids: jobIdsArr,
//             selected_jobs: resp.selected_jobs || jobIdsArr,
//             schedule: raw.schedule,
//             next_actions: raw.next_actions || resp.next_actions,
//           },
//         });
//       }
//       continue;
//     }

//     if (status !== "completed") continue;

//     const userPrompt =
//       request?.prompt ||
//       request?.user_prompt ||
//       request?.query ||
//       (actionTypeToUserLabel[action_type]?.(request) ?? action_type);

//     msgs.push({
//       id: `${action_type}-user-${timestamp.getTime()}`,
//       role: "user",
//       content: userPrompt,
//       attachment:
//         action_type === "dataset_upload"
//           ? request?.sheet_name ? `${request.filename} → ${request.sheet_name}` : request?.filename
//           : undefined,
//       timestamp,
//     });

//     if (!response) continue;

//     // if (action_type === "dataset_upload") {
//     //   if (response?.status === "sheet_selection_required") continue;
//     //   const ds = response?.dataset || {};
//     //   msgs.push({
//     //     id: `${action_type}-assistant-${timestamp.getTime()}`, role: "assistant",
//     //     content: "Dataset uploaded successfully.", timestamp,
//     //     uploadResult: {
//     //       sheet_name: ds.sheet_name || request?.sheet_name || "",
//     //       job_name: response?.job?.job_name || request?.job_name || "",
//     //       dataset_name: ds.dataset_name || "",
//     //       dataset_path: ds.blob_path || ds.dataset_path || "",
//     //       onelake_path: ds.onelake_path || "",
//     //       rows: ds.rows ?? 0, columns: ds.columns ?? 0,
//     //       next_actions: (response?.next_actions || []).map((a: any) =>
//     //         typeof a === "string" ? { label: a } : { id: a.id || a.action, label: a.label }),
//     //     },
//     //   });
//     // }

//      // ── dataset_upload ─────────────────────────────────────────
    
//      if (action_type === "dataset_upload") {
//       if (response?.status === "sheet_selection_required") continue;

//       const ds = response?.dataset || {};
//       const sheetDisplayName = ds.sheet_name || request?.sheet_name || "";
//       const jobName =
//         response?.job?.job_name || response?.job_name || request?.job_name || "";
//       const datasetName = ds.dataset_name || response?.dataset_name || "";
//       const dsPath =
//         ds.blob_path || ds.dataset_path || response?.dataset_path || response?.blob_path || "";
//       const onelakePath = ds.onelake_path || response?.onelake_path || "";
//       const rows = ds.rows ?? response?.rows ?? 0;
//       const columns = ds.columns ?? response?.columns ?? 0;
//       const rawNextActions: any[] = response?.next_actions || [];
//       const nextActions = rawNextActions.map((a: any) =>
//         typeof a === "string" ? { label: a } : { id: a.id || a.action, label: a.label }
//       );

//       msgs.push({
//         id: `${action_type}-assistant-${timestamp.getTime()}`,
//         role: "assistant",
//         content: response?.message || "Dataset uploaded successfully.",
//         timestamp,
//         uploadResult: {
//           sheet_name: sheetDisplayName,
//           job_name: jobName,
//           dataset_name: datasetName,
//           dataset_path: dsPath,
//           onelake_path: onelakePath,
//           rows,
//           columns,
//           next_actions: nextActions,
//         },
//       });
//     }

//     else if (action_type === "etl") {
//       if (response?.status !== "success") continue;
//       const datasetNameWithExt = withCsvExtension(response.final_dataset?.dataset_name || "");
//       msgs.push({
//         id: `${action_type}-assistant-${timestamp.getTime()}`, role: "assistant",
//         content: response.message || "ETL completed.", timestamp,
//         result: {
//           pipeline_name: response.pipeline_name || request?.job_name || "",
//           suggested_job_name: response.suggested_job_name || response.pipeline_name || request?.job_name || "",
//           job_name: response.job_name || request?.job_name || "",
//           job_id: threadsData.job_id || request?.job_id || "",
//           data_model: response.data_model, relationships: response.relationships, schemas: response.schemas,
//           final_dataset: response.final_dataset
//             ? { ...response.final_dataset, dataset_name: datasetNameWithExt }
//             : { rows: 0, columns: [], preview: [], dataset_name: datasetNameWithExt, dataset_path: "", onelake_path: "" },
//           download_url: response.download_url || action.download_url || "",
//           next_actions: response.next_actions || [],
//         },
//         _alreadySaved: savedJobIds.has(request?.job_id) || savedJobIds.has(threadsData.job_id),
//       } as any);
//     } else if (action_type === "dq") {
//       if (response?.status !== "success") continue;
//       msgs.push({ id: `${action_type}-assistant-${timestamp.getTime()}`, role: "assistant", content: "Data quality rules applied.", timestamp, dqResult: response as DQResult });
//     } else if (action_type === "ner") {
//       if (response?.status !== "success") continue;
//       msgs.push({ id: `${action_type}-assistant-${timestamp.getTime()}`, role: "assistant", content: "Name entity resolution completed.", timestamp, nerResult: response as NERResult });
//     } else if (action_type === "business_logic") {
//       if (response?.status !== "success") continue;
//       msgs.push({ id: `${action_type}-assistant-${timestamp.getTime()}`, role: "assistant", content: "Business logic applied.", timestamp, blResult: response as BLResult });
//     } else if (action_type === "dashboard" || action_type === "powerbi") {
//       if (response?.status !== "success") continue;
//       msgs.push({ id: `${action_type}-assistant-${timestamp.getTime()}`, role: "assistant", content: "Power BI dashboard generated.", timestamp, dashboardResult: response as DashboardResult });
//     } else if (action_type === "automl") {
//       if (response?.status !== "success") continue;
//       msgs.push({ id: `${action_type}-assistant-${timestamp.getTime()}`, role: "assistant", content: "AutoML completed.", timestamp, automlResult: response as AutoMLResult });
//     } else if (action_type === "pipeline") {
//       const pipelineResp = response;
//       const raw = pipelineResp.pipeline || pipelineResp;
//       const jobIdsArr: { job_id: string; job_name: string }[] =
//         raw.job_ids || raw.selected_jobs || pipelineResp.selected_jobs || [];
//       const pipelineCreated: PipelineCreatedResult = {
//         pipeline_id: raw.pipeline_id || pipelineResp.pipeline_id || "",
//         name: raw.name || "",
//         created_at: raw.created_at,
//         job_ids: jobIdsArr,
//         selected_jobs: pipelineResp.selected_jobs || jobIdsArr,
//         schedule: raw.schedule,
//         next_actions: raw.next_actions || pipelineResp.next_actions,
//       };
//       if (pipelineCreated.pipeline_id || pipelineCreated.name) {
//         msgs.push({
//           id: `${action_type}-assistant-${timestamp.getTime()}`,
//           role: "assistant",
//           content: pipelineResp.message || "Pipeline created successfully.",
//           timestamp,
//           pipelineCreated,
//         });
//       }
//     } else {
//       const text = response?.message || response?.response || response?.content || "";
//       if (text) msgs.push({ id: `${action_type}-assistant-${timestamp.getTime()}`, role: "assistant", content: text, timestamp });
//     }
//   }
//   return msgs;
// }

function buildMessagesFromActions(threadsData: any, savedJobIds: Set<string>, skipSyntheticUserMessages = false): Message[] {
  const msgs: Message[] = [];
  const actions: any[] = threadsData?.actions || [];

  const actionTypeToUserLabel: Record<string, (req: any) => string> = {
    dataset_upload: (req) => req?.sheet_name ? `Upload file: ${req.filename} (sheet: ${req.sheet_name})` : `Upload file: ${req?.filename || "dataset"}`,
    dq: () => "Apply Data Quality Rules",
    ner: () => "Apply Name Entity Resolution",
    business_logic: () => "Apply Business Logic",
    dashboard: (req) => req?.user_prompt || "Generate Power BI Dashboard",
    powerbi: (req) => req?.user_prompt || "Generate Power BI Dashboard",
    automl: (req) => req?.query || "Build AutoML Model",
    pipeline: (req) => req?.prompt || "Create Pipeline",
    pipeline_wizard: (req) => req?.prompt || req?.message || "Create Pipeline",
    etl: (req) => req?.prompt || "Run ETL",
  };

  const wizardUserTypes = new Set(["pipeline_job_selection", "pipeline_name", "pipeline_schedule_decision", "pipeline_schedule_details"]);

  let pipelineUserMessageAdded = false;

  for (const action of actions) {
    const { action_type, request, response, status } = action;
    if (action_type === "save_job") continue;

    const timestamp = safeDate(action.timestamp || action.created_at || action.updated_at);

    if (wizardUserTypes.has(action_type)) {
      // Only synthesize the "Create Pipeline" user bubble when there are no real messages to pull from
      if (!skipSyntheticUserMessages && !pipelineUserMessageAdded) {
        msgs.push({ id: `pipeline-user-${timestamp.getTime()}`, role: "user", content: "Create Pipeline", timestamp });
        pipelineUserMessageAdded = true;
      }
      continue;
    }

    if (action_type === "pipeline_wizard") {
      const resp = response || {};
      const ts2 = safeDate(action.timestamp);

      if (resp.status === "pipeline_job_selection_required" && resp.jobs) {
        if (!skipSyntheticUserMessages && !pipelineUserMessageAdded) {
          msgs.push({ id: `pipeline-user-${ts2.getTime()}`, role: "user", content: "Create Pipeline", timestamp: ts2 });
          pipelineUserMessageAdded = true;
        }
        const jobs: PipelineJob[] = (resp.jobs || []).map((j: any) => ({ job_id: j.job_id, job_name: j.job_name }));
        msgs.push({
          id: `pipeline_wizard-jsel-${ts2.getTime()}`,
          role: "assistant",
          content: "Select the jobs to include in your pipeline:",
          timestamp: ts2,
          pipelineJobs: jobs,
        });
        continue;
      }

      if (resp.status === "pipeline_name_required") {
        msgs.push({ id: `pipeline_wizard-name-${ts2.getTime()}`, role: "assistant", content: resp.message || "Enter pipeline name.", timestamp: ts2 });
        continue;
      }

      if (resp.status === "pipeline_schedule_decision_required") {
        msgs.push({ id: `pipeline_wizard-sched-dec-${ts2.getTime()}`, role: "assistant", content: resp.message || "Do you want to schedule this pipeline? (yes/no)", timestamp: ts2 });
        continue;
      }

      if (resp.status === "pipeline_schedule_details_required") {
        msgs.push({ id: `pipeline_wizard-sched-det-${ts2.getTime()}`, role: "assistant", content: resp.message || "Enter frequency, start date and time.\n\nExample:\ndaily, 2026-06-15, 09:00", timestamp: ts2 });
        continue;
      }

      if (resp.status === "success" && (resp.pipeline || resp.pipeline_id)) {
        const raw = resp.pipeline || resp;
        const jobIdsArr = raw.job_ids || raw.selected_jobs || resp.selected_jobs || [];
        msgs.push({
          id: `pipeline_wizard-done-${ts2.getTime()}`,
          role: "assistant",
          content: resp.message || "Pipeline created successfully.",
          timestamp: ts2,
          pipelineCreated: {
            pipeline_id: raw.pipeline_id || "",
            name: raw.name || "",
            created_at: raw.created_at,
            job_ids: jobIdsArr,
            selected_jobs: resp.selected_jobs || jobIdsArr,
            schedule: raw.schedule,
            next_actions: raw.next_actions || resp.next_actions,
          },
        });
      }
      continue;
    }

    if (status !== "completed") continue;

    // Skip synthetic user messages when real ones come from messages[]
    if (!skipSyntheticUserMessages) {
      const userPrompt =
        request?.prompt ||
        request?.user_prompt ||
        request?.query ||
        (actionTypeToUserLabel[action_type]?.(request) ?? action_type);

      msgs.push({
        id: `${action_type}-user-${timestamp.getTime()}`,
        role: "user",
        content: userPrompt,
        attachment:
          action_type === "dataset_upload"
            ? request?.sheet_name ? `${request.filename} → ${request.sheet_name}` : request?.filename
            : undefined,
        timestamp,
      });
    }

    if (!response) continue;

    if (action_type === "dataset_upload") {
      if (response?.status === "sheet_selection_required") continue;
      const ds = response?.dataset || {};
      const sheetDisplayName = ds.sheet_name || request?.sheet_name || "";
      const jobName = response?.job?.job_name || response?.job_name || request?.job_name || "";
      const datasetName = ds.dataset_name || response?.dataset_name || "";
      const dsPath = ds.blob_path || ds.dataset_path || response?.dataset_path || response?.blob_path || "";
      const onelakePath = ds.onelake_path || response?.onelake_path || "";
      const rows = ds.rows ?? response?.rows ?? 0;
      const columns = ds.columns ?? response?.columns ?? 0;
      const rawNextActions: any[] = response?.next_actions || [];
      const nextActions = rawNextActions.map((a: any) =>
        typeof a === "string" ? { label: a } : { id: a.id || a.action, label: a.label }
      );
      msgs.push({
        id: `${action_type}-assistant-${timestamp.getTime()}`,
        role: "assistant",
        content: response?.message || "Dataset uploaded successfully.",
        timestamp,
        uploadResult: { sheet_name: sheetDisplayName, job_name: jobName, dataset_name: datasetName, dataset_path: dsPath, onelake_path: onelakePath, rows, columns, next_actions: nextActions },
      });
    } else if (action_type === "etl") {
      if (response?.status !== "success") continue;
      const datasetNameWithExt = withCsvExtension(response.final_dataset?.dataset_name || "");
      msgs.push({
        id: `${action_type}-assistant-${timestamp.getTime()}`, role: "assistant",
        content: response.message || "ETL completed.", timestamp,
        result: {
          pipeline_name: response.pipeline_name || request?.job_name || "",
          suggested_job_name: response.suggested_job_name || response.pipeline_name || request?.job_name || "",
          job_name: response.job_name || request?.job_name || "",
          job_id: threadsData.job_id || request?.job_id || "",
          data_model: response.data_model, relationships: response.relationships, schemas: response.schemas,
          final_dataset: response.final_dataset
            ? { ...response.final_dataset, dataset_name: datasetNameWithExt }
            : { rows: 0, columns: [], preview: [], dataset_name: datasetNameWithExt, dataset_path: "", onelake_path: "" },
          download_url: response.download_url || action.download_url || "",
          next_actions: response.next_actions || [],
        },
        _alreadySaved: savedJobIds.has(request?.job_id) || savedJobIds.has(threadsData.job_id),
      } as any);
    } else if (action_type === "dq") {
      if (response?.status !== "success") continue;
      msgs.push({ id: `${action_type}-assistant-${timestamp.getTime()}`, role: "assistant", content: "Data quality rules applied.", timestamp, dqResult: response as DQResult });
    } else if (action_type === "ner") {
      if (response?.status !== "success") continue;
      msgs.push({ id: `${action_type}-assistant-${timestamp.getTime()}`, role: "assistant", content: "Name entity resolution completed.", timestamp, nerResult: response as NERResult });
    } else if (action_type === "business_logic") {
      if (response?.status !== "success") continue;
      msgs.push({ id: `${action_type}-assistant-${timestamp.getTime()}`, role: "assistant", content: "Business logic applied.", timestamp, blResult: response as BLResult });
    } else if (action_type === "dashboard" || action_type === "powerbi") {
      if (response?.status !== "success") continue;
      msgs.push({ id: `${action_type}-assistant-${timestamp.getTime()}`, role: "assistant", content: "Power BI dashboard generated.", timestamp, dashboardResult: response as DashboardResult });
    } else if (action_type === "automl") {
      if (response?.status !== "success") continue;
      msgs.push({ id: `${action_type}-assistant-${timestamp.getTime()}`, role: "assistant", content: "AutoML completed.", timestamp, automlResult: response as AutoMLResult });
    } else if (action_type === "pipeline") {
      const pipelineResp = response;
      const raw = pipelineResp.pipeline || pipelineResp;
      const jobIdsArr: { job_id: string; job_name: string }[] = raw.job_ids || raw.selected_jobs || pipelineResp.selected_jobs || [];
      const pipelineCreated: PipelineCreatedResult = {
        pipeline_id: raw.pipeline_id || pipelineResp.pipeline_id || "",
        name: raw.name || "",
        created_at: raw.created_at,
        job_ids: jobIdsArr,
        selected_jobs: pipelineResp.selected_jobs || jobIdsArr,
        schedule: raw.schedule,
        next_actions: raw.next_actions || pipelineResp.next_actions,
      };
      if (pipelineCreated.pipeline_id || pipelineCreated.name) {
        msgs.push({
          id: `${action_type}-assistant-${timestamp.getTime()}`,
          role: "assistant",
          content: pipelineResp.message || "Pipeline created successfully.",
          timestamp,
          pipelineCreated,
        });
      }
    } else {
      const text = response?.message || response?.response || response?.content || "";
      if (text) msgs.push({ id: `${action_type}-assistant-${timestamp.getTime()}`, role: "assistant", content: text, timestamp });
    }
  }
  return msgs;
}


// ─────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────
export default function VeritonChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [threadLoading, setThreadLoading] = useState(true);
  const [activeDataset, setActiveDataset] = useState<ActiveDataset | null>(null);
  const [datasetPanelOpen, setDatasetPanelOpen] = useState(false);
  const [historyPanelOpen, setHistoryPanelOpen] = useState(false);
  const [pipelineStep, setPipelineStep] = useState<PipelineStep>("idle");
  const [pipelineSelectedJobs, setPipelineSelectedJobs] = useState<string[]>([]);
  const [allKnownJobs, setAllKnownJobs] = useState<PipelineJob[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [creatingThread, setCreatingThread] = useState(false);
  const [sheetSelection, setSheetSelection] = useState<SheetSelectionState>({ open: false, jobId: "", fileName: "", sheets: [], file: null });

  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userFromStorage = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}") : null;
  const userId = userFromStorage?.id || null;
  const jobId = localStorage.getItem("current_job_id");

  const scrollToBottom = () => { if (chatContainerRef.current) chatContainerRef.current.scrollTo({ top: chatContainerRef.current.scrollHeight, behavior: "smooth" }); };
  useEffect(() => { scrollToBottom(); }, [messages, loading]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) { textarea.style.height = "auto"; textarea.style.height = `${Math.min(textarea.scrollHeight, 128)}px`; }
  }, [input]);

  const openHistory = () => { setHistoryPanelOpen(true); setDatasetPanelOpen(false); };
  const openDatasets = () => { setDatasetPanelOpen(true); setHistoryPanelOpen(false); };

  // ─── Load thread ───────────────────────────────────────────
  const loadThread = useCallback(async (tId: string) => {
    setThreadLoading(true);
    setHistoryPanelOpen(false);
    try {
      const res = await fetch(`${BASE_URL}/thread/${tId}`);
      const data = await res.json();
      if (data?.thread_id) {
        setThreadId(data.thread_id);
        localStorage.setItem("current_thread_id", data.thread_id);
      } else {
        setThreadId(tId);
        localStorage.setItem("current_thread_id", tId);
      }
      const restored = buildMessagesFromThreads(data);
      setMessages(restored.length > 0 ? restored : []);
    } catch {
      setMessages([]);
    } finally {
      setThreadLoading(false);
    }
  }, []);

  useEffect(() => {
    setThreadLoading(true);
    const pending = awaitPendingThread();
    const handleThreadData = (data: any) => {
      if (!data) { setThreadLoading(false); return; }
      if (data.thread_id) { setThreadId(data.thread_id); localStorage.setItem("current_thread_id", data.thread_id); }
      const restored = buildMessagesFromThreads(data);
      if (restored.length > 0) setMessages(restored);
      setThreadLoading(false);
    };
    if (pending) {
      pending.then((data: any) => {
        if (data?.thread_id) { setThreadId(data.thread_id); localStorage.setItem("current_thread_id", data.thread_id); }
        handleThreadData(data);
      }).catch(() => setThreadLoading(false));
    } else {
      const existingThreadId = localStorage.getItem("current_thread_id");
      if (existingThreadId && userId) {
        fetch(`${BASE_URL}/thread/${existingThreadId}`)
          .then((r) => r.json())
          .then(handleThreadData)
          .catch(() => setThreadLoading(false));
      } else {
        setThreadLoading(false);
      }
    }
  }, [userId]);

  // ─── New Chat ──────────────────────────────────────────────
  const handleNewChat = async () => {
    if (creatingThread) return;
    setCreatingThread(true);
    try {
      const res = await fetch(`${BASE_URL}/create-thread`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          job_id: jobId || localStorage.getItem("current_job_id") || "",
          title: "New Chat",
        }),
      });
      const data = await res.json();
      const newThreadId = data.thread_id || data.id || `thread_${Date.now()}`;
      setThreadId(newThreadId);
      localStorage.setItem("current_thread_id", newThreadId);
      setMessages([]);
      setActiveDataset(null);
      setPipelineStep("idle");
      setPipelineSelectedJobs([]);
      setHistoryPanelOpen(false);
    } catch {
      setMessages([]);
      setActiveDataset(null);
      setPipelineStep("idle");
    } finally {
      setCreatingThread(false);
    }
  };

  const handleDatasetSelect = (ds: ActiveDataset) => {
    const datasetNameWithExt = withCsvExtension(ds.datasetName);
    const datasetPath = ds.dataset_path.replace(/\/([^/]+)$/, `/${datasetNameWithExt}`);
    const onelakePath = ds.onelake_path ? ds.onelake_path.replace(/\/([^/]+)$/, `/${datasetNameWithExt}`) : `Files/Datasets/${datasetPath}`;
    const updatedDs = { ...ds, datasetName: datasetNameWithExt, dataset_path: datasetPath, onelake_path: onelakePath };
    setActiveDataset(updatedDs);
    localStorage.setItem("current_dataset_name", datasetNameWithExt);
    localStorage.setItem("current_dataset_path", datasetPath);
    localStorage.setItem("current_onelake_path", onelakePath);
    setDatasetPanelOpen(false);
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: `✅ **${datasetNameWithExt}** is now your active dataset. What would you like to do with it?`, timestamp: new Date() }]);
  };

  const handleClearActiveDataset = () => {
    setActiveDataset(null);
    localStorage.removeItem("current_dataset_path");
    localStorage.removeItem("current_dataset_name");
    localStorage.removeItem("current_onelake_path");
  };

  // ─── File upload ───────────────────────────────────────────
  const uploadFile = async (file: File, sheetName?: string) => {
    setUploadLoading(true);
    const aivolveUser = getAivolveUser();
    const currentThreadId = threadId || localStorage.getItem("current_thread_id") || "";
    const formData = new FormData();
    formData.append("user_id", userId || "");
    formData.append("job_id", jobId || "");
    formData.append("session_id", aivolveUser?.session_id || "");
    formData.append("user_email", aivolveUser?.email || "");
    formData.append("thread_id", currentThreadId);
    formData.append("file", file);
    if (sheetName) formData.append("sheet_name", sheetName);
    try {
      const res = await fetch(`${BASE_URL}/datasets/upload`, { method: "POST", body: formData });
      const data = await res.json();
      if (data.status === "sheet_selection_required") {
        setSheetSelection({ open: true, jobId: data.job_id || "", fileName: data.file_name || file.name, sheets: data.sheets || [], file });
        setUploadLoading(false);
        return;
      }
      const ds = data.dataset || data;
      const sheetDisplayName = ds.sheet_name || data.sheet_name || sheetName || "";
      const jobName = data.job?.job_name || data.job_name || file.name.replace(/\.[^.]+$/, "");
      const datasetName = ds.dataset_name || data.dataset_name || file.name.replace(/\.[^.]+$/, "");
      const dsPath = ds.blob_path || ds.dataset_path || data.dataset_path || data.blob_path || "";
      const onelakePath = ds.onelake_path || data.onelake_path || "";
      const rows = ds.rows ?? data.rows ?? 0;
      const columns = ds.columns ?? data.columns ?? 0;
      const rawNextActions: any[] = data.next_actions || [];
      const nextActions = rawNextActions.map((a: any) => typeof a === "string" ? { label: a } : { id: a.id || a.action, label: a.label });
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: data.response || data.message || "Dataset uploaded successfully.", timestamp: new Date(), uploadResult: { sheet_name: sheetDisplayName, job_name: jobName, dataset_name: datasetName, dataset_path: dsPath, onelake_path: onelakePath, rows, columns, next_actions: nextActions } }]);
      if (dsPath) {
        const dsNameWithExt = withCsvExtension(datasetName);
        setActiveDataset({ datasetName: dsNameWithExt, jobName, job_id: data.job?.job_id || data.job_id || jobId || "", dataset_path: dsPath, onelake_path: onelakePath });
        localStorage.setItem("current_dataset_name", dsNameWithExt);
        localStorage.setItem("current_dataset_path", dsPath);
        if (onelakePath) localStorage.setItem("current_onelake_path", onelakePath);
      }
    } catch {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: "Failed to upload the file. Please try again.", error: true, timestamp: new Date() }]);
    } finally { setUploadLoading(false); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: `Uploading file: ${file.name}`, attachment: file.name, timestamp: new Date() }]);
    await uploadFile(file);
  };

  const handleSheetSelect = async (sheetName: string) => {
    const { file, fileName } = sheetSelection;
    setSheetSelection((s) => ({ ...s, open: false }));
    if (!file) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: `Selected sheet: "${sheetName}" from ${fileName}`, attachment: `${fileName} → ${sheetName}`, timestamp: new Date() }]);
    await uploadFile(file, sheetName);
  };

  // ─── Intent helpers ────────────────────────────────────────
  const isGreeting = (t: string) => ["hi", "hello", "hey", "good morning", "good afternoon", "good evening"].some((g) => t.toLowerCase().trim() === g || t.toLowerCase().startsWith(g + " ") || t.toLowerCase().startsWith(g + "!") || t.toLowerCase().startsWith(g + ","));
  const isPowerBiIntent = (t: string) => { const l = t.toLowerCase(); return l.includes("powerbi") || l.includes("power bi") || l.includes("dashboard") || l.includes("report") || l.includes("visualize"); };
  const isAutoMLIntent = (t: string) => { const l = t.toLowerCase(); return l.includes("build model") || l.includes("train model") || l.includes("ml model") || l.includes("machine learning") || l.includes("automl") || l.includes("regression") || l.includes("classification") || l.includes("predict") || l.includes("build automl"); };
  const isCreatePipelineIntent = (t: string) => t.toLowerCase().includes("create pipeline");
  const isDatasetIntent = (t: string) => { const l = t.toLowerCase(); return l.includes("select dataset") || l.includes("choose dataset") || l.includes("switch dataset") || l.includes("my datasets") || l.includes("show datasets") || l.includes("use dataset"); };
  const isDQIntent = (t: string) => { const l = t.toLowerCase(); return l.includes("apply dq") || l.includes("run dq") || l.includes("apply data quality") || l.includes("data quality rules") || l.includes("dq rules") || l === "dq"; };
  const isNERIntent = (t: string) => { const l = t.toLowerCase(); return l.includes("run ner") || l.includes("apply ner") || l.includes("name entity") || l.includes("apply name entity") || l.includes("entity resolution") || l === "ner"; };
  const isBLIntent = (t: string) => { const l = t.toLowerCase(); return l.includes("apply business logic") || l.includes("apply bl") || l.includes("business logic"); };

  const callChat = async (message: string, extra?: Record<string, any>) => {
    const aivolveUser = getAivolveUser();
    const currentThreadId = threadId || localStorage.getItem("current_thread_id") || "";
    const res = await fetch(`${BASE_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        job_id: jobId || localStorage.getItem("current_job_id"),
        thread_id: currentThreadId,
        session_id: aivolveUser?.session_id || "",
        user_email: aivolveUser?.email || "",
        message,
        ...extra,
      }),
    });
    return res.json();
  };

  // ─── Pipeline wizard ───────────────────────────────────────
  const handleCreatePipeline = async (content: string) => {
    setLoading(true);
    try {
      const data = await callChat(content);
      const jobs: PipelineJob[] = data.jobs || [];
      if (jobs.length > 0) setAllKnownJobs(jobs);
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: data.response || data.message || "Select jobs for pipeline:", pipelineJobs: jobs, timestamp: new Date() }]);
      setPipelineStep("awaiting_job_selection");
    } catch {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: "Failed to start pipeline creation.", error: true, timestamp: new Date() }]);
      setPipelineStep("idle");
    } finally { setLoading(false); }
  };

  const handleJobSelectionConfirm = async (selectedIds: string[]) => {
    setPipelineSelectedJobs(selectedIds);
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content: `Selected ${selectedIds.length} job(s) for pipeline.`, timestamp: new Date() }]);
    setLoading(true);
    try {
      const data = await callChat("selected", { selected_jobs: selectedIds });
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: data.response || data.message || "Please enter a pipeline name.", timestamp: new Date() }]);
      setPipelineStep("awaiting_pipeline_name");
    } catch {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: "Failed to confirm job selection.", error: true, timestamp: new Date() }]);
      setPipelineStep("idle");
    } finally { setLoading(false); }
  };

  const handlePipelineWizardStep = async (content: string) => {
    setLoading(true);
    try {
      const data = await callChat(content, { selected_jobs: pipelineSelectedJobs });
      const status = data.status;

      if (status === "pipeline_schedule_decision_required") {
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: data.message || "Do you want to schedule this pipeline? (yes/no)", timestamp: new Date() }]);
        setPipelineStep("awaiting_schedule_decision");

      } else if (status === "pipeline_schedule_details_required") {
        setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: data.message || "Enter frequency, start date and time.\n\nExample:\ndaily, 2026-06-15, 09:00", timestamp: new Date() }]);
        setPipelineStep("awaiting_schedule_details");

      } else if (status === "success" && (data.pipeline || data.pipeline_id)) {
        const raw = data.pipeline || data;
        const jobNamesMap: Record<string, string> = {};
        allKnownJobs.forEach((j) => { jobNamesMap[j.job_id] = j.job_name; });

        const rawJobsList = raw.job_ids || raw.selected_jobs || data.selected_jobs || [];
        const pipelineCreated: PipelineCreatedResult = {
          pipeline_id: raw.pipeline_id || data.pipeline_id || "",
          name: raw.name || "",
          created_at: raw.created_at,
          job_ids: rawJobsList,
          selected_jobs: (raw.selected_jobs || []).map((j: any) =>
            typeof j === "string"
              ? { job_id: j, job_name: jobNamesMap[j] || j.slice(0, 8) + "…" }
              : j
          ),
          schedule: raw.schedule,
          next_actions: raw.next_actions || data.next_actions,
        };

        const includedJobNames = (pipelineCreated.selected_jobs || [])
          .map((j) => j.job_name)
          .filter(Boolean);
        const baseMessage = data.message || "Pipeline created successfully.";
        const successContent = includedJobNames.length > 0
          ? `${baseMessage} Jobs included: ${includedJobNames.join(", ")}.`
          : baseMessage;

        setMessages((prev) => [...prev, {
          id: Date.now().toString(),
          role: "assistant",
          content: successContent,
          pipelineCreated,
          timestamp: new Date(),
        }]);
        setPipelineStep("idle");
        setPipelineSelectedJobs([]);

      } else {
        const text = data.response || data.message || "";
        if (text) setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: text, timestamp: new Date() }]);
      }
    } catch {
      setMessages((prev) => [...prev, { id: Date.now().toString(), role: "assistant", content: "Something went wrong. Please try again.", error: true, timestamp: new Date() }]);
      setPipelineStep("idle");
    } finally { setLoading(false); }
  };

  // ─── sendMessage ───────────────────────────────────────────
  const sendMessage = async (text?: string) => {
    const content = (text || input).trim();
    if (!content || loading) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), role: "user", content, timestamp: new Date() }]);
    setInput("");
    setLoading(true);

    if (pipelineStep === "awaiting_pipeline_name" ||
        pipelineStep === "awaiting_schedule_decision" ||
        pipelineStep === "awaiting_schedule_details") {
      setLoading(false);
      await handlePipelineWizardStep(content);
      return;
    }

    if (isGreeting(content)) {
      setLoading(false);
      setTimeout(() => setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Hello! 👋 How can I help you with your data today?", timestamp: new Date() }]), 600);
      return;
    }
    if (isDatasetIntent(content)) { setLoading(false); openDatasets(); return; }
    if (isCreatePipelineIntent(content)) { setLoading(false); await handleCreatePipeline(content); return; }

    if (isDQIntent(content)) {
      try {
        const data = await callChat("run dq");
        if (data.status === "success") setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Data quality rules applied successfully.", timestamp: new Date(), dqResult: data }]);
        else setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: data.message || data.response || "DQ run completed.", timestamp: new Date() }]);
      } catch { setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Failed to run data quality rules.", error: true, timestamp: new Date() }]); }
      finally { setLoading(false); } return;
    }

    if (isNERIntent(content)) {
      try {
        const data = await callChat("run ner");
        if (data.status === "success") setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Name entity resolution completed.", timestamp: new Date(), nerResult: data }]);
        else setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: data.message || data.response || "NER completed.", timestamp: new Date() }]);
      } catch { setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Failed to run NER.", error: true, timestamp: new Date() }]); }
      finally { setLoading(false); } return;
    }

    if (isBLIntent(content)) {
      try {
        const data = await callChat("apply business logic");
        if (data.status === "success") setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Business logic applied successfully.", timestamp: new Date(), blResult: data }]);
        else setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: data.message || data.response || "Business logic applied.", timestamp: new Date() }]);
      } catch { setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Failed to apply business logic.", error: true, timestamp: new Date() }]); }
      finally { setLoading(false); } return;
    }

    if (isAutoMLIntent(content)) {
      try {
        const aivolveUser = getAivolveUser();
        const res = await fetch(`${BASE_URL}/automl/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId, job_id: jobId, thread_id: threadId, session_id: aivolveUser?.session_id || "", user_email: aivolveUser?.email || "", query: content }) });
        const data = await res.json();
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: data.message || "AutoML completed!", automlResult: data, timestamp: new Date() }]);
      } catch { setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Failed to run AutoML.", error: true, timestamp: new Date() }]); }
      finally { setLoading(false); } return;
    }

    if (isPowerBiIntent(content)) {
      try {
        const csvBlob = localStorage.getItem("current_dataset_path");
        if (!csvBlob) { setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "No dataset selected. Please select a dataset first using the **Datasets** button.", error: true, timestamp: new Date() }]); setLoading(false); return; }
        const res = await fetch(`${BASE_URL}/generate_powerbi_dashboard`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ csv_blob: csvBlob, user_prompt: content, user_id: userId, job_id: jobId, thread_id: threadId }) });
        const data = await res.json();
        sessionStorage.setItem("pbi_generate_visuals", JSON.stringify({ ...data, file_name: (localStorage.getItem("current_dataset_path") || "").split("/").pop() || "" }));
        setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Power BI dashboard generated!", dashboardResult: data, timestamp: new Date() }]);
      } catch { setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "Failed to generate the dashboard.", error: true, timestamp: new Date() }]); }
      finally { setLoading(false); } return;
    }

    try {
      const res = await fetch(`${BASE_URL}/run`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ user_id: userId, job_id: jobId, thread_id: threadId, prompt: content }) });
      const data = await res.json();
      const rawDatasetName = data.final_dataset?.dataset_name || "";
      const datasetNameWithExt = withCsvExtension(rawDatasetName);
      const datasetPath = (data.final_dataset?.dataset_path || "").replace(/\/([^/]+)$/, `/${datasetNameWithExt}`);
      const onelakePath = (data.final_dataset?.onelake_path || "").replace(/\/([^/]+)$/, `/${datasetNameWithExt}`);
      if (datasetPath) localStorage.setItem("current_dataset_path", datasetPath);
      if (onelakePath) localStorage.setItem("current_onelake_path", onelakePath);
      if (rawDatasetName) localStorage.setItem("current_dataset_name", datasetNameWithExt);
      if (datasetPath) setActiveDataset({ datasetName: datasetNameWithExt, jobName: data.suggested_job_name || data.pipeline_name || "", job_id: data.job_id || "", dataset_path: datasetPath, onelake_path: onelakePath });
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: data.message || "Job completed.", timestamp: new Date(), result: { pipeline_name: data.pipeline_name, suggested_job_name: data.suggested_job_name || data.pipeline_name, job_name: data.job_name || "", job_id: data.job_id, data_model: data.data_model, relationships: data.relationships, schemas: data.schemas, final_dataset: { ...data.final_dataset, dataset_name: datasetNameWithExt }, download_url: data.download_url, next_actions: data.next_actions || [] } }]);
    } catch {
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: "I couldn't reach the server. Please try again.", error: true, timestamp: new Date() }]);
    } finally { setLoading(false); }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } };

  // const formatTime = (date: any): string => {
  //   const d = safeDate(date);
  //   return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  // };

  const formatTime = (date: any): string => {
  const d = safeDate(date);
  return d.toLocaleTimeString([], { 
    hour: "2-digit", 
    minute: "2-digit",
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, 
  });
};

  const handleDownload = async (url: string) => {
    try {
      const fullUrl = url.startsWith("http") ? url : `${BASE_URL}${url}`;
      const blob = await (await fetch(fullUrl)).blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = url.split("/").pop() || "dataset.csv";
      document.body.appendChild(link); link.click(); link.remove();
    } catch (err) { console.error("Download failed", err); }
  };

  const isEmpty = messages.length === 0 && !threadLoading;

  const getInputPlaceholder = () => {
    if (pipelineStep === "awaiting_pipeline_name") return "Enter a name for your pipeline…";
    if (pipelineStep === "awaiting_schedule_decision") return "Type yes or no…";
    if (pipelineStep === "awaiting_schedule_details") return "e.g. daily, 2026-06-15, 09:00";
    if (activeDataset) return `Ask about ${activeDataset.datasetName}…`;
    return "Ask for any data…";
  };

  return (
    <WorkflowLayout>
      <div style={{ position: "sticky", top: 0, height: "calc(100dvh - 57px)", display: "flex", flexDirection: "column", overflow: "hidden", background: "hsl(var(--background))", zIndex: 1 }}>

        {/* ── Header ── */}
        <header className="shrink-0 z-20 flex items-center justify-between px-4 py-2.5 bg-background/90 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md shadow-purple-500/20">
              <Sparkles className="w-[18px] h-[18px] text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-foreground leading-tight">Veriton AI</h1>
              <p className="text-xs text-muted-foreground">Your data, on demand</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleNewChat} disabled={creatingThread} title="Start a new chat"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ border: "1.5px solid hsl(var(--border))", background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}
              onMouseEnter={(e) => { if (!creatingThread) { (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(267 84% 60% / 0.5)"; (e.currentTarget as HTMLButtonElement).style.background = "hsl(267 84% 60% / 0.08)"; (e.currentTarget as HTMLButtonElement).style.color = "hsl(267 84% 55%)"; } }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "hsl(var(--border))"; (e.currentTarget as HTMLButtonElement).style.background = "hsl(var(--muted))"; (e.currentTarget as HTMLButtonElement).style.color = "hsl(var(--muted-foreground))"; }}
            >
              {creatingThread ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
              <span className="hidden sm:inline">New Chat</span>
            </button>

            <button onClick={() => historyPanelOpen ? setHistoryPanelOpen(false) : openHistory()} title="Chat history"
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all"
              style={{ border: `1.5px solid ${historyPanelOpen ? "hsl(267 84% 60% / 0.5)" : "hsl(var(--border))"}`, background: historyPanelOpen ? "hsl(267 84% 60% / 0.1)" : "hsl(var(--muted))", color: historyPanelOpen ? "hsl(267 84% 55%)" : "hsl(var(--muted-foreground))" }}
            >
              <History className="w-3 h-3" />
              <span className="hidden sm:inline">History</span>
            </button>

            <button onClick={() => datasetPanelOpen ? setDatasetPanelOpen(false) : openDatasets()}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border cursor-pointer transition-all"
              style={{ border: `1.5px solid ${datasetPanelOpen || activeDataset ? "hsl(var(--primary) / 0.5)" : "hsl(var(--border))"}`, background: datasetPanelOpen ? "hsl(var(--primary) / 0.1)" : activeDataset ? "hsl(267 84% 60% / 0.08)" : "hsl(var(--muted))", color: datasetPanelOpen || activeDataset ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
            >
              <Database className="w-3 h-3" />
              {activeDataset ? <span className="max-w-[100px] overflow-hidden text-ellipsis whitespace-nowrap">{activeDataset.datasetName}</span> : <span className="hidden sm:inline">Datasets</span>}
              {activeDataset && <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />}
              <ChevronRight className="w-2.5 h-2.5 transition-transform" style={{ transform: datasetPanelOpen ? "rotate(180deg)" : "none" }} />
            </button>
          </div>
        </header>

        {/* ── Chat + Side panels ── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <main ref={chatContainerRef} className="flex-1 min-h-0 overflow-y-auto scroll-smooth">
            <div className="max-w-3xl mx-auto px-4 py-6">
              {threadLoading ? (
                <div className="flex flex-col items-center justify-center h-full pt-24 gap-3 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm">Loading conversation…</span>
                </div>
              ) : isEmpty ? (
                <div className="flex flex-col items-center justify-center text-center pt-16 pb-8">
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-500/30 mb-5">
                    <Bot className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-foreground mb-2">What data do you need?</h2>
                  <p className="text-sm text-muted-foreground max-w-md mb-8">Describe your request in plain English</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      { icon: "🗂️", label: "Select a dataset", action: () => openDatasets() },
                      { icon: "📊", label: "Build a dashboard", action: () => setInput("Generate a dashboard") },
                      { icon: "🤖", label: "Train an ML model", action: () => setInput("Build a machine learning model") },
                      { icon: "🔄", label: "Create a pipeline", action: () => setInput("Create pipeline") },
                    ].map((chip) => (
                      <button key={chip.label} onClick={chip.action}
                        className="flex items-center gap-1.5 text-xs font-medium text-foreground bg-card border border-border rounded-full px-3.5 py-1.5 cursor-pointer hover:border-primary/50 hover:bg-primary/6 transition-all">
                        <span>{chip.icon}</span>{chip.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 shadow-sm ${msg.role === "assistant" ? "bg-gradient-to-br from-purple-500 to-indigo-600" : "bg-gradient-to-br from-slate-600 to-slate-800"}`}>
                        {msg.role === "assistant" ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-white" />}
                      </div>
                      <div className={`flex flex-col max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"}`}>
                        <div className={`px-4 py-2.5 rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap break-words shadow-sm ${msg.role === "user" ? "bg-gradient-to-br from-purple-600 to-indigo-600 text-white rounded-tr-sm" : msg.error ? "bg-red-500/10 text-red-400 border border-red-500/20 rounded-tl-sm" : "bg-card text-card-foreground border border-border rounded-tl-sm"}`}>
                          {msg.attachment && msg.role === "user" && (
                            <div className="flex items-center gap-2 mb-1.5 pb-1.5 border-b border-white/20 text-xs opacity-90"><FileText className="w-3.5 h-3.5" />{msg.attachment}</div>
                          )}
                          {msg.content}
                        </div>

                        {msg.pipelineJobs && msg.pipelineJobs.length > 0 && (
                          <div className="mt-2 w-full max-w-md">
                            {pipelineStep === "awaiting_job_selection"
                              ? <PipelineJobSelector jobs={msg.pipelineJobs} onConfirm={handleJobSelectionConfirm} />
                              : (
                                <div className="mt-2 space-y-1 max-w-[420px]">
                                  <p className="text-xs font-semibold text-muted-foreground mb-1.5">Jobs available for pipeline:</p>
                                  {msg.pipelineJobs.slice(0, 5).map((job) => (
                                    <div key={job.job_id} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-muted/50 border border-border">
                                      <span className="text-xs font-semibold text-foreground">{job.job_name}</span>
                                      <span className="text-[10px] text-muted-foreground font-mono ml-auto">{job.job_id.slice(0, 8)}…</span>
                                    </div>
                                  ))}
                                  {msg.pipelineJobs.length > 5 && (
                                    <p className="text-[10px] text-muted-foreground px-1">+{msg.pipelineJobs.length - 5} more jobs</p>
                                  )}
                                </div>
                              )
                            }
                          </div>
                        )}
                        {msg.uploadResult && !msg.error && <UploadResultCard uploadResult={msg.uploadResult} onActionClick={(label) => sendMessage(label)} />}
                        {msg.dqResult && !msg.error && <DQResultCard dqResult={msg.dqResult} onActionClick={(label) => sendMessage(label)} />}
                        {msg.nerResult && !msg.error && <NERResultCard nerResult={msg.nerResult} onActionClick={(label) => sendMessage(label)} />}
                        {msg.blResult && !msg.error && <BusinessLogicResultCard blResult={msg.blResult} onActionClick={(label) => sendMessage(label)} />}
                        {msg.result && !msg.error && <ResultCard result={msg.result} userId={userId} threadId={threadId} onDownload={handleDownload} onActionClick={(label) => sendMessage(label)} alreadySaved={msg._alreadySaved === true} />}
                        {msg.pipelineCreated && !msg.error && <PipelineCreatedCard pipeline={msg.pipelineCreated} allJobs={allKnownJobs} />}
                        {msg.dashboardResult && !msg.error && <PowerBIDashboardCard dashboard={msg.dashboardResult} />}
                        {msg.automlResult && !msg.error && <AutoMLResultCard automlResult={msg.automlResult} />}

                        <span className="text-[11px] text-muted-foreground mt-1 px-1">{formatTime(msg.timestamp)}</span>
                      </div>
                    </div>
                  ))}

                  {(loading || uploadLoading) && (
                    <div className="flex gap-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 shadow-sm shrink-0"><Bot className="w-4 h-4 text-white" /></div>
                      <div className="px-4 py-3 bg-card border border-border rounded-2xl rounded-tl-sm shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                          </div>
                          {uploadLoading && <span className="text-xs text-muted-foreground ml-1">Uploading file…</span>}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>

          {historyPanelOpen && (
            <HistoryPanel userId={userId} jobId={jobId} currentThreadId={threadId} onSelectThread={loadThread} onClose={() => setHistoryPanelOpen(false)} />
          )}

          {datasetPanelOpen && (
            <DatasetPanel userId={userId} activeDataset={activeDataset} onSelect={handleDatasetSelect} onDeselect={handleClearActiveDataset} onClose={() => setDatasetPanelOpen(false)} />
          )}
        </div>

        {/* ── Footer ── */}
        <footer className="shrink-0 z-20 bg-background/90 backdrop-blur-md border-t border-border">
          <div className="max-w-3xl mx-auto px-4 py-3">
            <div className="flex items-end gap-2 bg-card border border-border rounded-2xl shadow-sm focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/20 transition-all px-2 py-1.5">
              <button onClick={() => fileInputRef.current?.click()} disabled={uploadLoading} title="Upload a dataset file"
                className="text-muted-foreground hover:text-primary p-2 rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Attach file">
                {uploadLoading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Paperclip className="w-5 h-5" />}
              </button>
              <button onClick={() => datasetPanelOpen ? setDatasetPanelOpen(false) : openDatasets()} title="Select dataset"
                className="flex items-center gap-1 text-[11px] font-semibold shrink-0 px-2 py-1 rounded-lg border cursor-pointer transition-all"
                style={{ border: "1px solid", borderColor: activeDataset ? "hsl(var(--primary) / 0.4)" : "hsl(var(--border))", background: activeDataset ? "hsl(267 84% 60% / 0.1)" : "hsl(var(--muted))", color: activeDataset ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}>
                <Database className="w-3 h-3" />
                {activeDataset ? <span className="max-w-[80px] overflow-hidden text-ellipsis whitespace-nowrap">{activeDataset.datasetName}</span> : "Datasets"}
              </button>
              <textarea ref={textareaRef} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder={getInputPlaceholder()}
                rows={1} className="flex-1 bg-transparent outline-none px-1 py-2 text-[15px] text-foreground placeholder:text-muted-foreground resize-none max-h-32 overflow-y-auto"
              />
              <Button onClick={() => sendMessage()} disabled={!input.trim() || loading} size="icon"
                className="h-9 w-9 bg-gradient-to-br from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 rounded-xl text-white shadow-sm disabled:opacity-50 transition-all">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-2">
              Press Enter to send · Shift + Enter for new line · 📎 to upload CSV, JSON, XLSX, Parquet
            </p>
            <input ref={fileInputRef} type="file" accept=".csv,.json,.xlsx,.xls,.parquet" onChange={handleFileChange} className="hidden" />
          </div>
        </footer>
      </div>

      <SheetSelectionModal state={sheetSelection} onSelect={handleSheetSelect} onClose={() => setSheetSelection((s) => ({ ...s, open: false }))} />
    </WorkflowLayout>
  );
}