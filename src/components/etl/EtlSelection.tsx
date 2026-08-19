// // src/components/etl/EtlSelection.tsx
// import { useState, useEffect } from "react";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { FileText, Play, Loader2 } from "lucide-react";
// import { toast } from "sonner";

// interface CustomTable {
//   name: string;
//   createdAt: string;
// }

// interface Props {
//   selectedTables: string[];
//   setSelectedTables: (tables: string[]) => void;
//   onCreateJob: () => void;
// }

// export default function EtlSelection({ selectedTables, setSelectedTables, onCreateJob }: Props) {
//   const [customTables, setCustomTables] = useState<CustomTable[]>([]);
//   const [loading, setLoading] = useState(true);

//   const userId = localStorage.getItem("user")
//     ? JSON.parse(localStorage.getItem("user") || "{}").id
//     : null;
//   const jobId = localStorage.getItem("current_job_id");

//   useEffect(() => {
//     if (!userId || !jobId) {
//       toast.error("Missing user or job information");
//       setLoading(false);
//       return;
//     }

//     const fetchCustomTables = async () => {
//       setLoading(true);
//       try {
//         const res = await fetch(
//           `http://20.81.213.147:8000/list-datasets?user_id=${userId}&job_id=${jobId}`
//         );

//         if (!res.ok) throw new Error("Failed to fetch datasets");

//         const data = await res.json();
//         const tables = (data.datasets || []).map((ds: any) => ({
//           name: ds.filename,
//           createdAt: ds.date_modified || new Date().toLocaleDateString(),
//         }));

//         setCustomTables(tables);
//       } catch (err: any) {
//         toast.error(err.message || "Failed to load datasets");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchCustomTables();
//   }, [userId, jobId]);

//   const toggleTableSelection = (tableName: string) => {
//     setSelectedTables(prevState =>{
//       if (prevState.includes(tableName)) {
//         return prevState.filter(t => t !== tableName);
//       }
//       return [...prevState, tableName];
//     });
//   };

//   return (
//     <div className="space-y-8">
//       <div className="flex items-center justify-between">
//         <h2 className="text-lg font-semibold text-foreground">Select Data Sources</h2>
//         <span className="text-sm text-muted-foreground">
//           {customTables.length} datasets available
//         </span>
//       </div>

//       {loading ? (
//         <div className="flex justify-center py-12">
//           <Loader2 className="h-8 w-8 animate-spin text-primary" />
//         </div>
//       ) : customTables.length === 0 ? (
//         <div className="text-center py-12 text-muted-foreground">
//           No custom datasets found. Create some first!
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//           {customTables.map((table) => {
//             const isSelected = selectedTables.includes(table.name);
//             return (
//               <div
//                 key={table.name}
//                 onClick={() => toggleTableSelection(table.name)}
//                 className={`
//                   relative rounded-xl border p-6 cursor-pointer transition-all
//                   ${isSelected ? "border-cyan-500 bg-cyan-500/5 shadow-lg" : "border-border bg-card hover:border-cyan-500/50"}
//                 `}
//               >
//                 <div className="absolute top-5 right-5">
//                   <div
//                     className={`
//                       w-5 h-5 rounded-full border-2 flex items-center justify-center
//                       ${isSelected ? "border-cyan-500 bg-cyan-500" : "border-muted-foreground"}
//                     `}
//                   >
//                     {isSelected && <div className="w-2 h-2 rounded-full bg-background" />}
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-4 mb-4">
//                   <div className="p-3 rounded-lg bg-cyan-500/10">
//                     <FileText className="h-6 w-6 text-cyan-500" />
//                   </div>
//                   <div>
//                     <h3 className="font-medium text-foreground">{table.name}</h3>
//                     <p className="text-sm text-muted-foreground mt-1">{table.createdAt}</p>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {selectedTables.length > 0 && (
//         <div className="flex justify-end pt-6">
//           <Button onClick={onCreateJob} size="lg">
//             <Play className="h-4 w-4 mr-2" />
//             Create ETL Job ({selectedTables.length})
//           </Button>
//         </div>
//       )}
//     </div>
//   );
// }