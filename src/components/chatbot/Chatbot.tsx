// import { useState, useRef, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { motion, AnimatePresence } from "framer-motion";
// import {
//   MessageSquare,
//   X,
//   Send,
//   Bot,
//   User,
//   Loader2,
//   Brain,
//   Database,
//   Cpu,
//   Workflow,
//   CheckCircle,
//   Sparkles,
//   Upload,
//   Plus,
//   History,
//   ChevronLeft,
//   ExternalLink,
// } from "lucide-react";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { useChatContext } from "../contexts/ChatContext";
// import { Message, BuildData } from "../contexts/ChatContext";
// import ReactMarkdown from "react-markdown";
// import remarkGfm from "remark-gfm";
// import { Trash2 } from "lucide-react";

// interface ChatSession {
//   id: string;
//   title: string;
//   messages: Message[];
//   createdAt: Date;
//   modalBuildId?: string;
//   lastUpdated: Date;
// }

// interface ChatbotProps {
//   onShowAnalysis?: () => void;
// }

// const API_BASE_URL = "https://api.veriton.ai/api/service3";

// const Chatbot = ({ onShowAnalysis }: ChatbotProps) => {
//   const navigate = useNavigate();
//   const {
//     isOpen,
//     setIsOpen,
//     chatSessions,
//     setChatSessions,
//     currentSessionId,
//     setCurrentSessionId,
//     messages,
//     setMessages,
//     currentBuildData,
//     setCurrentBuildData,
//   } = useChatContext();

//   const [showHistory, setShowHistory] = useState(false);
//   const [input, setInput] = useState("");
//   const [isTyping, setIsTyping] = useState(false);
//   const [isBuilding, setIsBuilding] = useState(false);
//   const [showFullScreenBuild, setShowFullScreenBuild] = useState(false);
//   const [buildStage, setBuildStage] = useState(0);
//   const [buildProgress, setBuildProgress] = useState(0);
//   const [uploadedFile, setUploadedFile] = useState<File | null>(null);
//   const [currentFileId, setCurrentFileId] = useState<string | null>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const [isUploadingDataset, setIsUploadingDataset] = useState(false);
//   const inputRef = useRef<HTMLInputElement>(null);
//   const [datasetModalOpen, setDatasetModalOpen] = useState(false);
//   const [datasets, setDatasets] = useState<any[]>([]);
//   const [datasetsLoading, setDatasetsLoading] = useState(false);
//   const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
//   const [isLoadingHistory, setIsLoadingHistory] = useState(false);
//   const [showPreviewForMessage, setShowPreviewForMessage] = useState<
//     string | null
//   >(null);

// useEffect(() => {
//   if (messages.length > 1 && !isLoadingHistory) {
//     const sessionTitle =
//       messages.find((m) => m.role === "user")?.content.slice(0, 30) ||
//       "Chat Session";

//     const buildMessage = messages.find((m) => m.type === "build-complete");

//     const currentSession: ChatSession = {
//       id: currentSessionId,
//       title: sessionTitle + "...",
//       messages: [...messages],
//       createdAt: new Date(), // (this will be handled in your updated logic)
//       lastUpdated: new Date(),
//       modalBuildId: buildMessage?.buildData?.buildId,
      
//     };

// setChatSessions((prev) => {
//   const index = prev.findIndex((s) => s.id === currentSessionId);

//   if (index === -1) return prev;

//   const updated = [...prev];

//   updated[index] = {
//     ...updated[index],
//     messages: [...messages],
//   };

//   return updated;
// });
//   }
// }, [messages, currentSessionId, isLoadingHistory]);

//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [messages, isBuilding, buildStage]);

//   useEffect(() => {
//     if (isOpen && inputRef.current) {
//       setTimeout(() => inputRef.current?.focus(), 100);
//     }
//   }, [isOpen]);

//   useEffect(() => {
//     if (isOpen) {
//       loadUserThreads();
//     }
//   }, [isOpen]);

//   // Add this style tag to properly render HTML tables in messages
//   useEffect(() => {
//     const style = document.createElement("style");
//     style.innerHTML = `
//     .message-content table {
//       border-collapse: collapse;
//       font-size: 12px;
//       width: 100%;
//     }
//     .message-content th,
//     .message-content td {
//       padding: 8px;
//       border: 1px solid rgba(0, 0, 0, 0.1);
//       text-align: left;
//     }
//     .message-content thead tr {
//       background: rgba(0, 0, 0, 0.05);
//     }
//   `;
//     document.head.appendChild(style);
//     return () => {
//       document.head.removeChild(style);
//     };
//   }, []);

//   // Add this useEffect near your other scroll-related effects
//   useEffect(() => {
//     if (isOpen && messagesEndRef.current) {
//       // Small delay to let animations / DOM updates finish
//       const timer = setTimeout(() => {
//         messagesEndRef.current?.scrollIntoView({
//           behavior: "smooth",
//           block: "end", // ensures it scrolls fully to the very bottom
//         });
//       }, 300); // 300ms is usually enough; increase to 500 if animation feels slow

//       return () => clearTimeout(timer); // cleanup
//     }
//   }, [isOpen, messages.length, currentSessionId]); // dependencies: re-run when chat opens or messages/session change

//   // use imported util for session id
//   const getSessionId = () => {
//     try {
//       const userStr = localStorage.getItem("aivolve_user");
//       if (userStr) {
//         const user = JSON.parse(userStr);
//         return user.session_id || "";
//       }
//       return "";
//     } catch {
//       return "";
//     }
//   };

//   console.log("[Chatbot] Current isOpen value:", isOpen);

//   const getUserEmail = () => {
//     try {
//       const userStr = localStorage.getItem("aivolve_user");
//       if (userStr) {
//         const user = JSON.parse(userStr);
//         return user.email || "";
//       }
//       return "";
//     } catch {
//       return "";
//     }
//   };
//   // --- upload file endpoint unchanged logi

//   const loadAvailableDatasets = async () => {
//     setDatasetsLoading(true);

//     try {
//       const userStr = localStorage.getItem("user");
//       if (!userStr) {
//         console.log("No user found in localStorage");
//         return;
//       }

//       const user = JSON.parse(userStr);
//       const userId = user?.user_id || user?.id;

//       console.log("User ID:", userId);

//       const allDatasets: any[] = [];

//       // GLOBAL DATASETS
//       const globalRes = await fetch(
//         `https://api.veriton.ai/api/service2/datasets?user_id=${userId}`,
//       );

//       const globalData = await globalRes.json();
//       console.log("Global datasets:", globalData);

//       if (globalRes.ok && Array.isArray(globalData)) {
//         allDatasets.push(
//           ...globalData.map((item: any, idx: number) => ({
//             id: `global-${idx}`,
//             name: item.dataset_name,
//             job_id: item.job_id,
//             user_id: userId,
//           })),
//         );
//       }

//       // JOB DATASETS
//       const jobId = localStorage.getItem("current_job_id");

//       if (jobId) {
//         const jobRes = await fetch(
//           `https://api.veriton.ai/api/service2/list-datasets?user_id=${userId}&job_id=${jobId}`,
//         );

//         const jobData = await jobRes.json();
//         console.log("Job datasets:", jobData);

//         if (jobRes.ok && jobData.datasets) {
//           allDatasets.push(
//             ...(jobData.datasets || []).map((d: any, idx: number) => ({
//               id: `job-${idx}`,
//               name: d.filename,
//               job_id: jobId,
//               user_id: userId,
//             })),
//           );
//         }
//       }

//       console.log("Final dataset list:", allDatasets);

//       setDatasets(allDatasets);
//     } catch (err) {
//       console.error("Failed loading datasets", err);
//     } finally {
//       setDatasetsLoading(false);
//     }
//   };

//   const uploadDatasetFromPath = async (
//     filePath: string,
//     datasetName: string,
//   ) => {
//     const sessionId = getSessionId();
//     const userEmail = getUserEmail();

//     try {
//       setIsUploadingDataset(true);

//       // show temporary message in chat
//       const uploadingMsg: Message = {
//         id: Date.now().toString(),
//         role: "assistant",
//         content: `Uploading dataset **${datasetName}**...\n\nPlease wait while I analyze it.`,
//         timestamp: new Date(),
//         type: "text",
//       };

//       setMessages((prev) => [...prev, uploadingMsg]);

//       const params = new URLSearchParams();

//       params.append("file_path", filePath);
//       params.append("session_id", sessionId);
//       params.append("user_email", userEmail);
//       params.append("query", "true");

//       const response = await fetch(
//         "https://api.veriton.ai/api/service3/upload_file_V",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/x-www-form-urlencoded",
//             accept: "application/json",
//           },
//           body: params.toString(),
//         },
//       );

//       const data = await response.json();

//       if (!response.ok) throw new Error(data.message);

//       const assistantMessage: Message = {
//         id: Date.now().toString(),
//         role: "assistant",
//         content: `${data.message}\n\n${data.overview_response}`,
//         timestamp: new Date(),
//         type: "text",
//       };

//       setMessages((prev) => [...prev, assistantMessage]);
//       setCurrentFileId(data.fileid);
//     } catch (err) {
//       console.error("Upload failed", err);
//     } finally {
//       setIsUploadingDataset(false);
//     }
//   };

//   const handleSelectDataset = (ds: any) => {
//     const filePath = `Files/Datasets/${ds.user_id}/${ds.job_id}/${ds.name}.csv`;

//     uploadDatasetFromPath(filePath, ds.name);

//     setDatasetModalOpen(false);

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       role: "user",
//       content: `Using dataset: ${ds.name}`,
//       timestamp: new Date(),
//       type: "text",
//     };

//     setMessages((prev) => [...prev, userMessage]);
//   };

//   const startNewChat = async () => {
//     // Save current session if it has messages
//     if (messages.length > 1) {
//       const sessionTitle =
//         messages.find((m) => m.role === "user")?.content.slice(0, 30) ||
//         "New Chat";
//       const buildMessage = messages.find((m) => m.type === "build-complete");
//       const newSession: ChatSession = {
//         id: currentSessionId,
//         title: sessionTitle + "...",
//         messages: [...messages],
//         createdAt: new Date(),
//         lastUpdated: new Date(),
//         modalBuildId: buildMessage?.buildData?.buildId,
//       };
//       setChatSessions((prev) => [
//         newSession,
//         ...prev.filter((s) => s.id !== currentSessionId),
//       ]);
//     }

//     // Call API to create new session
//     const sessionData = await createNewSession();

//     if (sessionData) {
//       // Update localStorage with new session_id
//       try {
//         const userStr = localStorage.getItem("aivolve_user");
//         if (userStr) {
//           const user = JSON.parse(userStr);
//           user.session_id = sessionData.session_id;
//           user.agent_id = sessionData.agent_id; // Store agent_id as well
//           localStorage.setItem("aivolve_user", JSON.stringify(user));
//         }
//       } catch (error) {
//         console.error("Error updating localStorage:", error);
//       }

//       // Set new session ID
//       setCurrentSessionId(sessionData.session_id);
//     } else {
//       // Fallback to timestamp-based ID if API fails
//       const fallbackSessionId = Date.now().toString();
//       setCurrentSessionId(fallbackSessionId);
//       console.warn("Using fallback session ID due to API error");
//     }

//     // Reset chat state
//     setMessages([
//       {
//         id: "1",
//         role: "assistant",
//         content:
//           "Hello! I'm your AI assistant. I can help you analyze data, build models, and answer questions about your ML pipeline. How can I assist you today?",
//         timestamp: new Date(),
//         type: "text",
//       },
//     ]);
//     setUploadedFile(null);
//     setCurrentFileId(null);
//     setCurrentBuildData(null);
//     setShowHistory(false);
//   };

//   // build stages declared above so it's available for runtime when used
//   const buildStages = [
//     { id: 1, name: "Loading Data", icon: Database },
//     { id: 2, name: "Feature Engineering", icon: Workflow },
//     { id: 3, name: "Model Training", icon: Cpu },
//     { id: 4, name: "Optimization", icon: Brain },
//   ];

//   // call backend endpoint
//   const runProcessTaskQuery = async (queryText: string) => {
//     const session_id =
//       getSessionId() || currentSessionId || Date.now().toString();
//     const user_email = getUserEmail();

//     try {
//       const body = new URLSearchParams();
//       body.append("session_id", session_id);
//       body.append("query", queryText);
//       body.append("user_email", user_email);

//       const resp = await fetch(`${API_BASE_URL}/process_task_query_v`, {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: body.toString(),
//       });

//       if (!resp.ok) {
//         throw new Error("process_task_query_v failed");
//       }

//       const startData = await resp.json();

//       if (startData.status !== "started") {
//         return startData;
//       }

//       const jobId = startData.job_id;

//       // Poll until result is ready
//       const pollInterval = 15000; // 15 seconds

//       return await new Promise((resolve, reject) => {
//         const poll = async () => {
//           try {
//             const pollResp = await fetch(
//               `${API_BASE_URL}/process-task-query-status/${jobId}?user_email=${user_email}`,
//               { headers: { accept: "application/json" } },
//             );

//             if (!pollResp.ok) {
//               throw new Error("Polling failed");
//             }

//             const result = await pollResp.json();

//             // API finished
//             if (result.status === "success" || result.all_models) {
//               setIsTyping(false); // stop typing when result arrives
//               resolve(result);
//             } else if (result.status === "failed") {
//               reject(result);
//             } else {
//               setTimeout(poll, pollInterval);
//             }
//           } catch (err) {
//             reject(err);
//           }
//         };

//         poll();
//       });
//     } catch (err) {
//       console.error("process_task_query_v error", err);
//       return null;
//     }
//   };

//   const createNewSession = async (): Promise<{
//     session_id: string;
//     agent_id: string;
//   } | null> => {
//     try {
//       const user_email = getUserEmail();

//       const body = new URLSearchParams();
//       body.append("user_email", user_email);

//       const response = await fetch(`${API_BASE_URL}/create_session`, {
//         method: "POST",
//         headers: { "Content-Type": "application/x-www-form-urlencoded" },
//         body: body.toString(),
//       });

//       if (!response.ok) {
//         throw new Error("Failed to create session");
//       }

//       const data = await response.json();
//       return data; // { session_id: "thread_xxx", agent_id: "asst_xxx" }
//     } catch (error) {
//       console.error("Error creating new session:", error);
//       return null;
//     }
//   };

//   const loadUserThreads = async () => {
//     try {
//       const email = getUserEmail();

//       const res = await fetch(
//         `${API_BASE_URL}/user_threads?user_email=${email}`,
//         { headers: { accept: "application/json" } },
//       );

//       const data = await res.json();
//       console.log("THREADS RESPONSE:", data);

//       if (!res.ok) throw new Error("Failed to fetch threads");

//       if (!data.threads) {
//         setChatSessions([]);
//         return;
//       }

//       const formattedSessions: ChatSession[] = Object.keys(data.threads).map(
//   (threadId) => {
//     const thread = data.threads[threadId];

//     return {
//       id: threadId,
//       title: thread.last_message?.content?.slice(0, 30) || "Chat Session",
//       messages: [],
//       createdAt: new Date(thread.created_at),

//       // ✅ ADD THIS
//       lastUpdated: new Date(
//         thread.last_message?.timestamp || thread.created_at
//       ),

//       modalBuildId: undefined,
//     };
//   }
// );

//       setChatSessions(
//   formattedSessions.sort(
//     (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()
//   )
// );
//     } catch (err) {
//       console.error("Error loading threads:", err);
//     }
//   };

// const loadThreadHistory = async (threadId: string) => {
//   try {
//     setIsLoadingHistory(true); // ✅ mark as history load

//     const email = getUserEmail();

//     const res = await fetch(
//       `${API_BASE_URL}/conversation_history/${threadId}?user_email=${email}`,
//       { headers: { accept: "application/json" } }
//     );

//     const data = await res.json();

//     const formattedMessages: Message[] = data.messages.map(
//       (msg: any, index: number) => ({
//         id: `${threadId}-${index}`,
//         role: msg.role,
//         content: msg.content,
//         timestamp: new Date(msg.timestamp),
//         type: "text",
//       })
//     );

//     setMessages(formattedMessages);
//     setCurrentSessionId(threadId);
//     setShowHistory(false);

//   } catch (err) {
//     console.error("Error loading thread history:", err);
//   } finally {
//     setIsLoadingHistory(false); // ✅ reset
//   }
// };

//   const handleDeleteSession = async (sessionId: string) => {
//     try {
//       const email = getUserEmail();

//       const body = new URLSearchParams();
//       body.append("session_id", sessionId);
//       body.append("user_email", email);

//       const res = await fetch(`${API_BASE_URL}/delete_session`, {
//         method: "DELETE",
//         headers: {
//           "Content-Type": "application/x-www-form-urlencoded",
//           accept: "application/json",
//         },
//         body: body.toString(),
//       });

//       if (!res.ok) throw new Error("Failed to delete session");

//       setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));

//       if (sessionId === currentSessionId) {
//         startNewChat();
//       }
//     } catch (err) {
//       console.error("Delete session failed:", err);
//     }
//   };

//   const startBuildFlowWithBackend = async (queryText: string) => {
//     setIsBuilding(true);
//     setShowFullScreenBuild(true);
//     setBuildStage(0);
//     setBuildProgress(2);

//     const buildingMsg: Message = {
//       id: Date.now().toString(),
//       role: "assistant",
//       content: "Starting the model build process...",
//       timestamp: new Date(),
//       type: "text",
//     };
//     setMessages((prev) => [...prev, buildingMsg]);
//     setIsTyping(true);

//     const progressInterval = setInterval(() => {
//       setBuildProgress((prev) => Math.min(98, prev + Math.random() * 6 + 1));
//       setBuildStage((prev) =>
//         Math.min(buildStages.length - 1, prev + (Math.random() < 0.12 ? 1 : 0)),
//       );
//     }, 800);

//     const apiResp = await runProcessTaskQuery(queryText);
//     clearInterval(progressInterval);
//     setIsTyping(false);

//     // Check if API returned an error or no results
//     if (!apiResp || !apiResp.all_models || apiResp.status === "error") {
//       const errorMessage =
//         apiResp?.response ||
//         "Model build failed or returned no results. Please ensure the upload completed and try again.";
//       const suggestions = apiResp?.suggestions || [];

//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now().toString(),
//           role: "assistant",
//           content: `${errorMessage}\n\n${
//             suggestions.length > 0
//               ? `**Suggestions:**\n${suggestions
//                   .map((s: string) => `• ${s}`)
//                   .join("\n")}`
//               : ""
//           }`,
//           timestamp: new Date(),
//           type: "text",
//         },
//       ]);

//       setIsBuilding(false);
//       setShowFullScreenBuild(false);
//       setBuildProgress(0);
//       setBuildStage(0);
//       return;
//     }

//     console.log("API Response:", apiResp);

//     // Display the response message in chatbot
//     const responseMessage: Message = {
//       id: Date.now().toString(),
//       role: "assistant",
//       content: apiResp.response || "Analysis complete.",
//       timestamp: new Date(),
//       type: "text",
//     };
//     setMessages((prev) => [...prev, responseMessage]);

//     // Display suggestions if available
//     if (apiResp.suggestions && apiResp.suggestions.length > 0) {
//       const suggestionsMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         role: "assistant",
//         content: `**Suggestions:**\n${apiResp.suggestions
//           .map((s: string) => `• ${s}`)
//           .join("\n")}`,
//         timestamp: new Date(),
//         type: "text",
//       };
//       setMessages((prev) => [...prev, suggestionsMessage]);
//     }

//     // Get buildId
//     const buildId = apiResp.dataset_id || `build-${Date.now().toString(36)}`;

//     // Get dataset name
//     const dataset =
//       apiResp.blob_file_used || uploadedFile?.name || "dataset.csv";

//     // Create BuildData with results object for ModalBuilding
//     const buildData: BuildData = {
//       buildId,
//       dataset,
//       task_type: apiResp.task_type, // ← ADD THIS LINE
//       target: apiResp.target, // ← ADD THIS LINE (optional but useful)
//       analysis: apiResp.analysis,
//       suggestions: apiResp.suggestions,
//       primary_metric: apiResp.primary_metric,
//       primary_score: apiResp.primary_score,
//       results: {
//         all_models: apiResp.all_models,
//         best_model: apiResp.best_model,
//         train: apiResp.all_models
//           ? Object.keys(apiResp.all_models).reduce((acc, modelName) => {
//               acc[modelName] = apiResp.all_models[modelName].train;
//               return acc;
//             }, {} as any)
//           : {},
//         test: apiResp.all_models
//           ? Object.keys(apiResp.all_models).reduce((acc, modelName) => {
//               acc[modelName] = apiResp.all_models[modelName].test;
//               return acc;
//             }, {} as any)
//           : {},
//       },
//       rows: null,
//       columns: null,
//     };
//     console.log("Parsed BuildData:", buildData);

//     setCurrentBuildData(buildData);

//     const completeMessage: Message = {
//       id: (Date.now() + 2).toString(),
//       role: "assistant",
//       content: "Analysis complete! Opening results...",
//       timestamp: new Date(),
//       type: "build-complete",
//       buildData,
//     };
//     setMessages((prev) => [...prev, completeMessage]);

//     const sessionTitle =
//       messages.find((m) => m.role === "user")?.content.slice(0, 30) ||
//       "Model Build";
//     const newSession: ChatSession = {
//       id: currentSessionId || getSessionId(),
//       title: `🔧 ${sessionTitle}...`,
//       messages: [...messages, completeMessage],
//       createdAt: new Date(),
//       lastUpdated: new Date(),
//       modalBuildId: buildId,
//     };

//     setChatSessions((prev) => [
//       newSession,
//       ...prev.filter((s) => s.id !== (currentSessionId || getSessionId())),
//     ]);

//     setIsBuilding(false);
//     setBuildProgress(100);
//     setBuildStage(buildStages.length - 1);

//     setTimeout(() => {
//       setShowFullScreenBuild(false);
//       setIsOpen(false);
//       navigate(`/workflow/automl/modal-building/${buildId}`);
//     }, 900);
//   };

//   const handleSend = async () => {
//     if (!input.trim() || isBuilding) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       role: "user",
//       content: input,
//       timestamp: new Date(),
//       type: "text",
//     };

//     setMessages((prev) => [...prev, userMessage]);
//     setChatSessions((prev) =>
//   prev
//     .map((s) =>
//       s.id === currentSessionId
//         ? { ...s, lastUpdated: new Date() }
//         : s
//     )
//     .sort(
//       (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()
//     )
// );

//     const currentInput = input;
//     setInput("");
//     setIsTyping(true);

//     setMessages((prev) => [
//       ...prev,
//       {
//         id: Date.now().toString(),
//         role: "assistant",
//         content:
//           "Processing your request in the background. This may take 1–5 minutes...",
//         timestamp: new Date(),
//         type: "text",
//       },
//     ]);

//     const lowerInput = currentInput.toLowerCase();
//     const isBuildQuery =
//       lowerInput.includes("build") ||
//       lowerInput.includes("train model") ||
//       lowerInput.includes("create model");
//     if (isBuildQuery) {
//       setIsTyping(false);
//       startBuildFlowWithBackend(currentInput);
//       return;
//     }

//     try {
//       // ALWAYS call backend
//       const apiResp = await runProcessTaskQuery(currentInput);

//       setIsTyping(false);

//       if (!apiResp) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: Date.now().toString(),
//             role: "assistant",
//             content: "Something went wrong while processing your request.",
//             timestamp: new Date(),
//             type: "text",
//           },
//         ]);
//         return;
//       }

//       // Otherwise show normal assistant response
//       let formattedResponse = apiResp.response || "";

//       if (apiResp.available_columns?.length) {
//         formattedResponse += `

//       **Available Columns:**
//       ${apiResp.available_columns.map((c: string) => `• ${c}`).join("\n")}`;
//       }

//       if (
//         apiResp.suggestions?.length &&
//         !formattedResponse.toLowerCase().includes("suggestions")
//       ) {
//         formattedResponse += `

//       **Suggestions:**
//       ${apiResp.suggestions.map((s: string) => `• ${s}`).join("\n")}`;
//       }

//       const assistantMessage: Message = {
//         id: Date.now().toString(),
//         role: "assistant",
//         content: formattedResponse,
//         timestamp: new Date(),
//         type: "text",
//       };

//       setMessages((prev) => [...prev, assistantMessage]);
//       setChatSessions((prev) =>
//   prev
//     .map((s) =>
//       s.id === currentSessionId
//         ? { ...s, lastUpdated: new Date() }
//         : s
//     )
//     .sort(
//       (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()
//     )
// );
//       // Show suggestions if present
//       if (apiResp.suggestions?.length) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             id: Date.now().toString(),
//             role: "assistant",
//             content: `Suggestions:\n${apiResp.suggestions
//               .map((s: string) => `• ${s}`)
//               .join("\n")}`,
//             timestamp: new Date(),
//             type: "text",
//           },
//         ]);
//       }
//     } catch (err) {
//       console.error(err);

//       setIsTyping(false);

//       setMessages((prev) => [
//         ...prev,
//         {
//           id: Date.now().toString(),
//           role: "assistant",
//           content: "Error processing your request.",
//           timestamp: new Date(),
//           type: "text",
//         },
//       ]);
//     }
//   };

//   const handleGoToModalBuild = () => {
//     if (currentBuildData) {
//       navigate(`/workflow/automl/modal-building/${currentBuildData.buildId}`);
//     }
//   };

//   // --- Rendering functions (kept your UI) ---
//   const renderFullScreenBuildAnimation = () => (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 z-[500] flex items-center justify-center bg-background/95 backdrop-blur-md"
//     >
//       <div className="w-full max-w-lg p-8">
//         <div className="flex items-center justify-center gap-3 mb-8">
//           <motion.div
//             animate={{ rotate: 360 }}
//             transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
//           >
//             <Sparkles className="w-8 h-8 text-primary" />
//           </motion.div>
//           <span className="text-2xl font-bold text-foreground">
//             Building ML Model
//           </span>
//         </div>

//         <p className="text-center text-3xl font-bold text-primary mb-2">
//           {Math.round(buildProgress)}%
//         </p>
//         <p className="text-center text-sm text-muted-foreground mb-8">
//           Training multiple models... Optimizing hyperparameters...
//         </p>

//         <div className="space-y-3">
//           {buildStages.map((stage, index) => {
//             const Icon = stage.icon;
//             const isComplete = index < buildStage;
//             const isCurrent = index === buildStage;

//             return (
//               <motion.div
//                 key={stage.id}
//                 initial={{ opacity: 0, x: -20 }}
//                 animate={{ opacity: 1, x: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className={`flex items-center gap-4 p-4 rounded-xl text-sm transition-all ${
//                   isCurrent
//                     ? "bg-primary/20 border-2 border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
//                     : isComplete
//                       ? "bg-success/10 border border-success/20"
//                       : "bg-secondary/30 border border-transparent"
//                 }`}
//               >
//                 <motion.div
//                   className={`w-10 h-10 rounded-full flex items-center justify-center ${
//                     isComplete
//                       ? "bg-success"
//                       : isCurrent
//                         ? "bg-primary"
//                         : "bg-secondary"
//                   }`}
//                   animate={
//                     isCurrent
//                       ? {
//                           boxShadow: [
//                             "0 0 0 0 hsl(var(--primary)/0.4)",
//                             "0 0 0 12px hsl(var(--primary)/0)",
//                             "0 0 0 0 hsl(var(--primary)/0.4)",
//                           ],
//                         }
//                       : {}
//                   }
//                   transition={{ duration: 1.5, repeat: Infinity }}
//                 >
//                   {isComplete ? (
//                     <CheckCircle className="w-5 h-5 text-success-foreground" />
//                   ) : (
//                     <Icon
//                       className={`w-5 h-5 ${
//                         isCurrent
//                           ? "text-primary-foreground"
//                           : "text-muted-foreground"
//                       }`}
//                     />
//                   )}
//                 </motion.div>

//                 <span
//                   className={`font-medium flex-1 ${
//                     isCurrent
//                       ? "text-foreground"
//                       : isComplete
//                         ? "text-success"
//                         : "text-muted-foreground"
//                   }`}
//                 >
//                   {stage.name}
//                 </span>

//                 {isCurrent && (
//                   <motion.span
//                     className="text-xs text-primary font-medium"
//                     animate={{ opacity: [0.5, 1, 0.5] }}
//                     transition={{ duration: 1.5, repeat: Infinity }}
//                   >
//                     Processing...
//                   </motion.span>
//                 )}
//                 {isComplete && (
//                   <span className="text-xs text-success">Complete</span>
//                 )}
//               </motion.div>
//             );
//           })}
//         </div>

//         <div className="mt-8 flex justify-center gap-2">
//           {[...Array(7)].map((_, i) => (
//             <motion.div
//               key={i}
//               className="w-3 h-3 rounded-full bg-primary/60"
//               animate={{ y: [0, -12, 0], opacity: [0.3, 1, 0.3] }}
//               transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12 }}
//             />
//           ))}
//         </div>
//       </div>
//     </motion.div>
//   );

//   const formatMessage = (content: string) => {
//     if (!content) return "";

//     return (
//       content
//         // Remove ### or ##
//         .replace(/^#{1,6}\s*/gm, "")

//         // Ensure each bullet starts on new line
//         .replace(/• /g, "\n• ")

//         // Ensure numbered sections start new line
//         .replace(/(\d+\.\s)/g, "\n\n$1")

//         // Bold key-value pairs (Task:, Target:, etc.)
//         .replace(/([A-Za-z\s]+:)/g, "**$1**")

//         // Fix spacing
//         .replace(/\n{3,}/g, "\n\n")
//         .trim()
//     );
//   }; // Enhanced formatting: makes headings bold + improves readability

//   const formatMessageWithBoldHeadings = (content: string): string => {
//     if (!content) return "";

//     return (
//       content
//         // ✅ Normalize headings like "6.\nOverall Verdict"
//         .replace(/(\d+)[\.\)]\s*\n\s*([A-Za-z])/g, "$1. $2")

//         // ✅ Convert markdown headings ##, ### → plain
//         .replace(/^#{1,6}\s*/gm, "")

//         // ✅ Normalize numbered headings
//         .replace(/^(\d+[\.\)]\s*)([A-Za-z].*)$/gm, "\n\n**$1$2**\n")

//         // ✅ Normalize standalone section titles
//         .replace(
//           /^(Task Summary|Performance Metrics.*|Feature Insights.*|Recommendations|Next Steps|Overall Verdict)$/gim,
//           "\n\n**$1**\n",
//         )

//         // ✅ Bold key-value pairs
//         .replace(
//           /(Task|Target|Best model.*|Key finding|Key takeaway|Data leakage risk|Model behavior|Metric interpretation caveat):/gi,
//           "**$1:**",
//         )

//         // ✅ Ensure bullets start new line
//         .replace(/\n?[-•]\s+/g, "\n• ")

//         // ✅ Add spacing after sentences (safe version)
//         .replace(/([a-z])\.\s+(?=[A-Z])/g, "$1.\n")

//         // ✅ Clean extra spacing
//         .replace(/\n{3,}/g, "\n\n")

//         .trim()
//     );
//   };

//   const renderBuildComplete = (buildData: BuildData) => (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.95 }}
//       animate={{ opacity: 1, scale: 1 }}
//       className="w-full bg-gradient-to-br from-success/10 via-secondary/50 to-success/5 rounded-lg p-4 border border-success/30"
//     >
//       <div className="flex items-center gap-2 mb-3">
//         <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
//           <CheckCircle className="w-4 h-4 text-success-foreground" />
//         </div>
//         <span className="font-semibold text-foreground">
//           Model Build Complete!
//         </span>
//       </div>

//       <div className="space-y-2 text-xs">
//         <div className="grid grid-cols-2 gap-2">
//           <div className="bg-card/60 p-2 rounded border border-border/50">
//             <p className="text-muted-foreground">Dataset</p>
//             <p className="font-medium text-foreground truncate">
//               {buildData.dataset}
//             </p>
//           </div>
//           <div className="bg-card/60 p-2 rounded border border-border/50">
//             <p className="text-muted-foreground">Best Model</p>
//             <p className="font-bold text-primary">{buildData.bestModel}</p>
//           </div>
//         </div>
//         <p className="text-muted-foreground text-center">
//           Navigating to results...
//         </p>
//       </div>
//     </motion.div>
//   );

//   const renderBuildBanner = () => {
//     if (!currentBuildData) return null;

//     return <div></div>;
//   };
//   console.log(
//     "[Chatbot] Rendering Chatbot – isOpen:",
//     isOpen,
//     "currentSessionId:",
//     currentSessionId,
//   );

//   return (
//     <>
//       <AnimatePresence>
//         {showFullScreenBuild && renderFullScreenBuildAnimation()}
//       </AnimatePresence>

//       <motion.button
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//         onClick={() => setIsOpen(true)}
//         className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-glow flex items-center justify-center z-[150] ${
//           isOpen ? "hidden" : ""
//         }`}
//       >
//         <MessageSquare className="w-6 h-6" />
//       </motion.button>

//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             initial={{ opacity: 0, x: 400, scale: 0.95 }}
//             animate={{ opacity: 1, x: 0, scale: 1 }}
//             exit={{ opacity: 0, x: 400, scale: 0.95 }}
//             transition={{ type: "spring", damping: 25, stiffness: 300 }}
//             className="fixed right-4 bottom-4 w-[420px] min-w-[380px] max-w-[450px] z-[150] flex rounded-2xl overflow-hidden border border-border bg-card shadow-xl "
//             style={{
//               height: "calc(100vh - 32px)",
//               maxHeight: "700px",
//               top: "auto",
//             }}
//           >
//             <AnimatePresence>
//               {showHistory && (
//                 <motion.div
//                   initial={{ width: 0, opacity: 0 }}
//                   animate={{ width: 180, opacity: 1 }}
//                   exit={{ width: 0, opacity: 0 }}
//                   className="border-r border-border bg-muted/40 overflow-hidden flex-shrink-0"
//                 >
//                   <div className="p-3 border-b border-border">
//                     <p className="text-xs font-semibold text-muted-foreground uppercase">
//                       Chat History
//                     </p>
//                   </div>
//                   <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100%-50px)] scrollbar-thin">
//                     {chatSessions.length === 0 ? (
//                       <p className="text-xs text-muted-foreground text-center py-4">
//                         No previous chats
//                       </p>
//                     ) : (
//                       chatSessions.map((session) => (
//                         <div
//                           key={session.id}
//                           className={`group relative w-full text-left p-2 rounded-lg text-xs transition-colors ${
//                             session.id === currentSessionId
//                               ? "bg-primary/10 text-primary"
//                               : "text-foreground hover:bg-muted"
//                           }`}
//                         >
//                           {/* Clickable area */}
//                           <button
//                             onClick={() => loadThreadHistory(session.id)}
//                             className="w-full text-left"
//                           >
//                             <p className="truncate font-medium pr-6">
//                               {session.title}
//                             </p>
//                             <p className="text-[10px] text-muted-foreground">
//                               {session.createdAt.toLocaleDateString()}
//                             </p>

//                             {session.modalBuildId && (
//                               <span className="text-[9px] bg-primary/20 text-primary px-1 rounded mt-1 inline-block">
//                                 Build
//                               </span>
//                             )}
//                           </button>

//                           {/* 🗑 Delete Icon (only on hover) */}
//                           <button
//                             onClick={(e) => {
//                               e.stopPropagation(); // prevent opening chat
//                               setDeleteSessionId(session.id);
//                             }}
//                             className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
//                           >
//                             <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
//                           </button>
//                         </div>
//                       ))
//                     )}
//                   </div>
//                 </motion.div>
//               )}
//             </AnimatePresence>

//             <div className="flex-1 flex flex-col min-w-0">
//               <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0 bg-card">
//                 <div className="flex items-center gap-2">
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     className="h-8 w-8"
//                     onClick={() => setShowHistory(!showHistory)}
//                     aria-label="Toggle chat history"
//                   >
//                     {showHistory ? (
//                       <ChevronLeft className="w-4 h-4" />
//                     ) : (
//                       <History className="w-4 h-4" />
//                     )}
//                   </Button>
//                   <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
//                     <Bot className="w-4 h-4 text-primary" />
//                   </div>
//                   <div>
//                     <h3 className="text-sm font-semibold text-foreground">
//                       AI Assistant
//                     </h3>
//                     <p className="text-xs text-success">Online</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <Button
//                     variant="ghost"
//                     size="sm"
//                     onClick={startNewChat}
//                     className="h-8 text-xs"
//                   >
//                     <Plus className="w-3 h-3 mr-1" />
//                     New
//                   </Button>
//                   <button
//                     onClick={() => setIsOpen(false)}
//                     className="p-2 rounded-lg hover:bg-muted transition-colors"
//                     aria-label="Close chat"
//                   >
//                     <X className="w-4 h-4 text-primary" />
//                   </button>
//                 </div>
//               </div>

//               {renderBuildBanner()}

//               <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
//                 {messages.map((message) => (
//                   <motion.div
//                     key={message.id}
//                     initial={{ opacity: 0, y: 10 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     className={`flex gap-2 ${
//                       message.role === "user" ? "flex-row-reverse" : ""
//                     }`}
//                   >
//                     {/* Avatar */}
//                     <div
//                       className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
//                         message.role === "user" ? "bg-primary" : "bg-muted"
//                       }`}
//                     >
//                       {message.role === "user" ? (
//                         <User className="w-4 h-4 text-primary-foreground" />
//                       ) : (
//                         <Bot className="w-4 h-4 text-primary" />
//                       )}
//                     </div>

//                     <div
//                       className={
//                         message.type === "build-complete"
//                           ? "w-full max-w-[calc(100%-36px)]"
//                           : "max-w-[85%]"
//                       }
//                     >
//                       {/* Build Complete */}
//                       {message.type === "build-complete" &&
//                       message.buildData ? (
//                         renderBuildComplete(message.buildData)
//                       ) : message.previewData ? (
//                         /* Dataset Preview */
//                         <div
//                           className={`p-3 rounded-xl text-sm ${
//                             message.role === "user"
//                               ? "bg-primary text-primary-foreground rounded-br-none"
//                               : "bg-muted text-foreground rounded-bl-none"
//                           }`}
//                         >
//                           <p className="font-medium mb-2">
//                             ✅ Dataset imported successfully!
//                           </p>
//                           <p className="text-xs mb-3">
//                             {message.previewData.rowCount} rows ×{" "}
//                             {message.previewData.columnCount} columns
//                           </p>

//                           <Button
//                             variant="outline"
//                             size="sm"
//                             onClick={() =>
//                               setShowPreviewForMessage(
//                                 showPreviewForMessage === message.id
//                                   ? null
//                                   : message.id,
//                               )
//                             }
//                             className="w-full mb-2"
//                           >
//                             {showPreviewForMessage === message.id
//                               ? "Hide Preview"
//                               : "Show Preview"}
//                           </Button>

//                           {showPreviewForMessage === message.id && (
//                             <div
//                               className="message-content mt-2"
//                               dangerouslySetInnerHTML={{
//                                 __html: message.previewData.html,
//                               }}
//                             />
//                           )}

//                           <p className="text-[10px] mt-2 text-muted-foreground">
//                             {message.timestamp.toLocaleTimeString([], {
//                               hour: "2-digit",
//                               minute: "2-digit",
//                             })}
//                           </p>
//                         </div>
//                       ) : (
//                         /* ✅ NORMAL MESSAGE */
//                         <div
//                           className={`p-4 rounded-xl text-sm ${
//                             message.role === "user"
//                               ? "bg-primary text-primary-foreground rounded-br-none"
//                               : "bg-card border border-border text-foreground rounded-bl-none"
//                           }`}
//                         >
//                           {(() => {
//                             const fullContent = message.content || "";

//                             // Detect table
//                             const tableIndex = fullContent.indexOf("| Model |");
//                             const hasTable = tableIndex !== -1;

//                             if (!hasTable) {
//                               return (
//                                 <ReactMarkdown
//                                   remarkPlugins={[remarkGfm]}
//                                   components={{
//                                     p: ({ children }) => (
//                                       <p className="mb-3 leading-relaxed text-sm">
//                                         {children}
//                                       </p>
//                                     ),
//                                     strong: ({ children }) => (
//                                       <strong className="font-semibold text-foreground">
//                                         {children}
//                                       </strong>
//                                     ),
//                                   }}
//                                 >
//                                   {formatMessageWithBoldHeadings(fullContent)}
//                                 </ReactMarkdown>
//                               );
//                             }

//                             // Split content: Before Table + Table + After Table
//                             const beforeTable = fullContent
//                               .substring(0, tableIndex)
//                               .trim();
//                             const remainingContent =
//                               fullContent.substring(tableIndex);

//                             // Find where table ends and "after" content starts
//                             const lines = remainingContent.split("\n");

//                             // Detect table lines (start with | or separator row)
//                             let tableLines: string[] = [];
//                             let afterLines: string[] = [];

//                             let isTable = true;

//                             for (let line of lines) {
//                               if (
//                                 isTable &&
//                                 (line.includes("|") ||
//                                   line.trim().startsWith("|"))
//                               ) {
//                                 tableLines.push(line);
//                               } else {
//                                 isTable = false;
//                                 afterLines.push(line);
//                               }
//                             }

//                             const tablePart = tableLines.join("\n").trim();
//                             const afterTable = afterLines.join("\n").trim();

//                             return (
//                               <>
//                                 {/* BEFORE TABLE */}
//                                 {beforeTable && (
//                                   <div className="mb-5">
//                                     <ReactMarkdown
//                                       remarkPlugins={[remarkGfm]}
//                                       components={{
//                                         p: ({ children }) => (
//                                           <p className="mb-3 leading-relaxed text-sm text-foreground">
//                                             {children}
//                                           </p>
//                                         ),
//                                         strong: ({ children }) => (
//                                           <strong className="font-semibold text-foreground">
//                                             {children}
//                                           </strong>
//                                         ),
//                                       }}
//                                     >
//                                       {formatMessageWithBoldHeadings(
//                                         beforeTable,
//                                       )}
//                                     </ReactMarkdown>
//                                   </div>
//                                 )}

//                                 {/* SCROLLABLE TABLE - Only Table Scrolls */}
//                                 {tablePart && (
//                                   <div className="my-6 overflow-x-auto rounded-xl border border-border bg-card p-2">
//                                     <ReactMarkdown
//                                       remarkPlugins={[remarkGfm]}
//                                       components={{
//                                         table: ({ children }) => (
//                                           <table className="min-w-full text-xs border-collapse divide-y divide-border">
//                                             {children}
//                                           </table>
//                                         ),
//                                         thead: ({ children }) => (
//                                           <thead className="bg-muted sticky top-0 z-10">
//                                             {children}
//                                           </thead>
//                                         ),
//                                         th: ({ children }) => (
//                                           <th className="px-5 py-3 font-semibold text-left whitespace-nowrap bg-muted border-b">
//                                             {children}
//                                           </th>
//                                         ),
//                                         td: ({ children }) => (
//                                           <td className="px-5 py-3 border-b text-center whitespace-nowrap">
//                                             {children}
//                                           </td>
//                                         ),
//                                       }}
//                                     >
//                                       {tablePart}
//                                     </ReactMarkdown>
//                                   </div>
//                                 )}

//                                 {/* AFTER TABLE - Clean & Bold Headings */}
//                                 {afterTable && (
//                                   <div className="mt-6 space-y-3">
//                                     <ReactMarkdown
//                                       remarkPlugins={[remarkGfm]}
//                                       components={{
//                                         p: ({ children }) => (
//                                           <p className="mb-4 leading-relaxed text-sm text-foreground">
//                                             {children}
//                                           </p>
//                                         ),
//                                         strong: ({ children }) => (
//                                           <strong className="font-semibold text-foreground">
//                                             {children}
//                                           </strong>
//                                         ),
//                                       }}
//                                     >
//                                       {formatMessageWithBoldHeadings(
//                                         afterTable,
//                                       )}
//                                     </ReactMarkdown>
//                                   </div>
//                                 )}
//                               </>
//                             );
//                           })()}

//                           {/* Timestamp */}
//                           <p
//                             className={`text-[10px] mt-1 ${
//                               message.role === "user"
//                                 ? "text-primary-foreground/60"
//                                 : "text-muted-foreground"
//                             }`}
//                           >
//                             {message.timestamp.toLocaleTimeString([], {
//                               hour: "2-digit",
//                               minute: "2-digit",
//                             })}
//                           </p>
//                         </div>
//                       )}
//                     </div>
//                   </motion.div>
//                 ))}

//                 {isTyping && (
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="flex gap-2"
//                   >
//                     <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
//                       <Bot className="w-4 h-4 text-foreground" />
//                     </div>
//                     <div className="bg-card border border-border p-3 rounded-xl rounded-bl-none">
//                       <div className="flex gap-1">
//                         <span
//                           className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
//                           style={{ animationDelay: "0ms" }}
//                         />
//                         <span
//                           className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
//                           style={{ animationDelay: "150ms" }}
//                         />
//                         <span
//                           className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
//                           style={{ animationDelay: "300ms" }}
//                         />
//                       </div>
//                     </div>
//                   </motion.div>
//                 )}
//                 {isUploadingDataset && (
//                   <motion.div
//                     initial={{ opacity: 0 }}
//                     animate={{ opacity: 1 }}
//                     className="flex gap-2"
//                   >
//                     <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
//                       <Bot className="w-4 h-4 text-primary" />
//                     </div>

//                     <div className="bg-card border border-border p-3 rounded-xl rounded-bl-none flex items-center gap-2">
//                       <Loader2 className="w-4 h-4 animate-spin text-primary" />
//                       <span className="text-sm text-muted-foreground">
//                         Uploading dataset...
//                       </span>
//                     </div>
//                   </motion.div>
//                 )}

//                 <div ref={messagesEndRef} />
//               </div>
//               {datasetModalOpen && (
//                 <div className="absolute bottom-20 left-4 right-4 bg-card border border-border rounded-xl shadow-xl z-50 max-h-[300px] overflow-auto">
//                   <div className="p-3 border-b border-border flex justify-between items-center">
//                     <p className="text-sm font-semibold">Select Dataset</p>
//                     <button
//                       onClick={() => setDatasetModalOpen(false)}
//                       className="text-muted-foreground hover:text-foreground"
//                     >
//                       <X className="w-4 h-4" />
//                     </button>
//                   </div>

//                   <div className="p-2 space-y-2">
//                     {datasetsLoading && (
//                       <p className="text-center text-muted-foreground text-sm">
//                         Loading datasets...
//                       </p>
//                     )}

//                     {!datasetsLoading && datasets.length === 0 && (
//                       <p className="text-center text-muted-foreground text-sm">
//                         No datasets available
//                       </p>
//                     )}

//                     {datasets.map((ds) => (
//                       <button
//                         key={ds.id}
//                         onClick={() => handleSelectDataset(ds)}
//                         className="w-full text-left p-3 border border-border rounded-lg hover:bg-muted transition"
//                       >
//                         {ds.name}
//                       </button>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               <div className="p-4 border-t border-border flex-shrink-0 bg-card">
//                 <div className="flex items-center gap-2">
//                   <Button
//                     variant="outline"
//                     size="icon"
//                     onClick={() => {
//                       loadAvailableDatasets();
//                       setDatasetModalOpen(true);
//                     }}
//                     disabled={isBuilding}
//                   >
//                     <Upload className="w-4 h-4" />
//                   </Button>
//                   <Input
//                     ref={inputRef}
//                     value={input}
//                     onChange={(e) => setInput(e.target.value)}
//                     onKeyDown={(e) =>
//                       e.key === "Enter" &&
//                       !isBuilding &&
//                       !isUploadingDataset &&
//                       handleSend()
//                     }
//                     placeholder={
//                       isUploadingDataset
//                         ? "Uploading dataset..."
//                         : isBuilding
//                           ? "Building in progress..."
//                           : "Ask me anything..."
//                     }
//                     disabled={isBuilding || isUploadingDataset}
//                   />
//                   <Button
//                     variant="glow"
//                     size="icon"
//                     onClick={handleSend}
//                     disabled={!input.trim() || isTyping || isBuilding}
//                   >
//                     {isTyping || isBuilding ? (
//                       <Loader2 className="w-4 h-4 animate-spin" />
//                     ) : (
//                       <Send className="w-4 h-4" />
//                     )}
//                   </Button>
//                 </div>
//                 {uploadedFile && (
//                   <p className="text-xs text-muted-foreground mt-2">
//                     File attached: {uploadedFile.name}
//                   </p>
//                 )}
//               </div>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//       {deleteSessionId && (
//         <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
//           <div className="bg-card border border-border rounded-xl p-5 w-[320px] shadow-xl">
//             <h3 className="text-sm font-semibold mb-2 text-foreground">
//               Delete Chat
//             </h3>

//             <p className="text-xs text-muted-foreground mb-4">
//               Are you sure you want to delete this chat session? This action
//               cannot be undone.
//             </p>

//             <div className="flex justify-end gap-2">
//               <Button
//                 variant="outline"
//                 size="sm"
//                 onClick={() => setDeleteSessionId(null)}
//               >
//                 Cancel
//               </Button>

//               <Button
//                 variant="destructive"
//                 size="sm"
//                 onClick={() => {
//                   if (deleteSessionId) {
//                     handleDeleteSession(deleteSessionId);
//                   }
//                   setDeleteSessionId(null);
//                 }}
//               >
//                 Delete
//               </Button>
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default Chatbot;

// src/components/chatbot/Chatbot.tsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Brain,
  Database,
  Cpu,
  Workflow,
  CheckCircle,
  Sparkles,
  Upload,
  Plus,
  History,
  ChevronLeft,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useChatContext } from "../contexts/ChatContext";
import { Message, BuildData } from "../contexts/ChatContext";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Trash2 } from "lucide-react";

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  modalBuildId?: string;
  lastUpdated: Date;
}

interface ChatbotProps {
  onShowAnalysis?: () => void;
}

const API_BASE_URL = "https://api.veriton.ai/api/service3";

const Chatbot = ({ onShowAnalysis }: ChatbotProps) => {
  const navigate = useNavigate();
  const {
    isOpen,
    setIsOpen,
    chatSessions,
    setChatSessions,
    currentSessionId,
    setCurrentSessionId,
    messages,
    setMessages,
    currentBuildData,
    setCurrentBuildData,
  } = useChatContext();

  const [showHistory, setShowHistory] = useState(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);
  const [showFullScreenBuild, setShowFullScreenBuild] = useState(false);
  const [buildStage, setBuildStage] = useState(0);
  const [buildProgress, setBuildProgress] = useState(0);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [currentFileId, setCurrentFileId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isUploadingDataset, setIsUploadingDataset] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [datasetModalOpen, setDatasetModalOpen] = useState(false);
  const [datasets, setDatasets] = useState<any[]>([]);
  const [datasetsLoading, setDatasetsLoading] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showPreviewForMessage, setShowPreviewForMessage] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (messages.length > 1 && !isLoadingHistory) {
      const sessionTitle =
        messages.find((m) => m.role === "user")?.content.slice(0, 30) ||
        "Chat Session";

      const buildMessage = messages.find((m) => m.type === "build-complete");

      const currentSession: ChatSession = {
        id: currentSessionId,
        title: sessionTitle + "...",
        messages: [...messages],
        createdAt: new Date(), // (this will be handled in your updated logic)
        lastUpdated: new Date(),
        modalBuildId: buildMessage?.buildData?.buildId,
      };

      setChatSessions((prev) => {
        const index = prev.findIndex((s) => s.id === currentSessionId);

        if (index === -1) return prev;

        const updated = [...prev];

        updated[index] = {
          ...updated[index],
          messages: [...messages],
        };

        return updated;
      });
    }
  }, [messages, currentSessionId, isLoadingHistory]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isBuilding, buildStage]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      loadUserThreads();
    }
  }, [isOpen]);

  // Add this style tag to properly render HTML tables in messages
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
    .message-content table {
      border-collapse: collapse;
      font-size: 12px;
      width: 100%;
    }
    .message-content th,
    .message-content td {
      padding: 8px;
      border: 1px solid rgba(0, 0, 0, 0.1);
      text-align: left;
    }
    .message-content thead tr {
      background: rgba(0, 0, 0, 0.05);
    }
  `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Add this useEffect near your other scroll-related effects
  useEffect(() => {
    if (isOpen && messagesEndRef.current) {
      // Small delay to let animations / DOM updates finish
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "end", // ensures it scrolls fully to the very bottom
        });
      }, 300); // 300ms is usually enough; increase to 500 if animation feels slow

      return () => clearTimeout(timer); // cleanup
    }
  }, [isOpen, messages.length, currentSessionId]); // dependencies: re-run when chat opens or messages/session change

  // use imported util for session id
  const getSessionId = () => {
    try {
      const userStr = localStorage.getItem("aivolve_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.session_id || "";
      }
      return "";
    } catch {
      return "";
    }
  };

  console.log("[Chatbot] Current isOpen value:", isOpen);

  const getUserEmail = () => {
    try {
      const userStr = localStorage.getItem("aivolve_user");
      if (userStr) {
        const user = JSON.parse(userStr);
        return user.email || "";
      }
      return "";
    } catch {
      return "";
    }
  };
  // --- upload file endpoint unchanged logi

  const loadAvailableDatasets = async () => {
    setDatasetsLoading(true);

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        console.log("No user found in localStorage");
        return;
      }

      const user = JSON.parse(userStr);
      const userId = user?.user_id || user?.id;

      console.log("User ID:", userId);

      const allDatasets: any[] = [];

      // GLOBAL DATASETS
      const globalRes = await fetch(
        `https://api.veriton.ai/api/service2/datasets?user_id=${userId}`,
      );

      const globalData = await globalRes.json();
      console.log("Global datasets:", globalData);

      if (globalRes.ok && Array.isArray(globalData)) {
        allDatasets.push(
          ...globalData.map((item: any, idx: number) => ({
            id: `global-${idx}`,
            name: item.dataset_name,
            job_id: item.job_id,
            user_id: userId,
          })),
        );
      }

      // JOB DATASETS
      const jobId = localStorage.getItem("current_job_id");

      if (jobId) {
        const jobRes = await fetch(
          `https://api.veriton.ai/api/service2/list-datasets?user_id=${userId}&job_id=${jobId}`,
        );

        const jobData = await jobRes.json();
        console.log("Job datasets:", jobData);

        if (jobRes.ok && jobData.datasets) {
          allDatasets.push(
            ...(jobData.datasets || []).map((d: any, idx: number) => ({
              id: `job-${idx}`,
              name: d.filename,
              job_id: jobId,
              user_id: userId,
            })),
          );
        }
      }

      console.log("Final dataset list:", allDatasets);

      setDatasets(allDatasets);
    } catch (err) {
      console.error("Failed loading datasets", err);
    } finally {
      setDatasetsLoading(false);
    }
  };

  const uploadDatasetFromPath = async (
    filePath: string,
    datasetName: string,
  ) => {
    const sessionId = getSessionId();
    const userEmail = getUserEmail();

    try {
      setIsUploadingDataset(true);

      // show temporary message in chat
      const uploadingMsg: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `Uploading dataset **${datasetName}**...\n\nPlease wait while I analyze it.`,
        timestamp: new Date(),
        type: "text",
      };

      setMessages((prev) => [...prev, uploadingMsg]);

      const params = new URLSearchParams();

      params.append("file_path", filePath);
      params.append("session_id", sessionId);
      params.append("user_email", userEmail);
      params.append("query", "true");

      const response = await fetch(
        "https://api.veriton.ai/api/service3/upload_file_V",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            accept: "application/json",
          },
          body: params.toString(),
        },
      );

      const data = await response.json();

      if (!response.ok) throw new Error(data.message);

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: `${data.message}\n\n${data.overview_response}`,
        timestamp: new Date(),
        type: "text",
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setCurrentFileId(data.fileid);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploadingDataset(false);
    }
  };

  const handleSelectDataset = (ds: any) => {
    const filePath = `Files/Datasets/${ds.user_id}/${ds.job_id}/${ds.name}.csv`;

    uploadDatasetFromPath(filePath, ds.name);

    setDatasetModalOpen(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: `Using dataset: ${ds.name}`,
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
  };

  const startNewChat = async () => {
    // Save current session if it has messages
    if (messages.length > 1) {
      const sessionTitle =
        messages.find((m) => m.role === "user")?.content.slice(0, 30) ||
        "New Chat";
      const buildMessage = messages.find((m) => m.type === "build-complete");
      const newSession: ChatSession = {
        id: currentSessionId,
        title: sessionTitle + "...",
        messages: [...messages],
        createdAt: new Date(),
        lastUpdated: new Date(),
        modalBuildId: buildMessage?.buildData?.buildId,
      };
      setChatSessions((prev) => [
        newSession,
        ...prev.filter((s) => s.id !== currentSessionId),
      ]);
    }

    // Call API to create new session
    const sessionData = await createNewSession();

    if (sessionData) {
      // Update localStorage with new session_id
      try {
        const userStr = localStorage.getItem("aivolve_user");
        if (userStr) {
          const user = JSON.parse(userStr);
          user.session_id = sessionData.session_id;
          user.agent_id = sessionData.agent_id; // Store agent_id as well
          localStorage.setItem("aivolve_user", JSON.stringify(user));
        }
      } catch (error) {
        console.error("Error updating localStorage:", error);
      }

      // Set new session ID
      setCurrentSessionId(sessionData.session_id);
    } else {
      // Fallback to timestamp-based ID if API fails
      const fallbackSessionId = Date.now().toString();
      setCurrentSessionId(fallbackSessionId);
      console.warn("Using fallback session ID due to API error");
    }

    // Reset chat state
    setMessages([
      {
        id: "1",
        role: "assistant",
        content:
          "Hello! I'm your AI assistant. I can help you analyze data, build models, and answer questions about your ML pipeline. How can I assist you today?",
        timestamp: new Date(),
        type: "text",
      },
    ]);
    setUploadedFile(null);
    setCurrentFileId(null);
    setCurrentBuildData(null);
    setShowHistory(false);
  };

  // build stages declared above so it's available for runtime when used
  const buildStages = [
    { id: 1, name: "Loading Data", icon: Database },
    { id: 2, name: "Feature Engineering", icon: Workflow },
    { id: 3, name: "Model Training", icon: Cpu },
    { id: 4, name: "Optimization", icon: Brain },
  ];

  // call backend endpoint
  const runProcessTaskQuery = async (queryText: string) => {
    const session_id =
      getSessionId() || currentSessionId || Date.now().toString();
    const user_email = getUserEmail();

    try {
      const body = new URLSearchParams();
      body.append("session_id", session_id);
      body.append("query", queryText);
      body.append("user_email", user_email);

      const resp = await fetch(`${API_BASE_URL}/process_task_query_v`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!resp.ok) {
        throw new Error("process_task_query_v failed");
      }

      const startData = await resp.json();

      if (startData.status !== "started") {
        return startData;
      }

      const jobId = startData.job_id;

      // Poll until result is ready
      const pollInterval = 15000; // 15 seconds

      return await new Promise((resolve, reject) => {
        const poll = async () => {
          try {
            const pollResp = await fetch(
              `${API_BASE_URL}/process-task-query-status/${jobId}?user_email=${user_email}`,
              { headers: { accept: "application/json" } },
            );

            if (!pollResp.ok) {
              throw new Error("Polling failed");
            }

            const result = await pollResp.json();

            // API finished
            if (result.status === "success" || result.all_models) {
              setIsTyping(false); // stop typing when result arrives
              resolve(result);
            } else if (result.status === "failed") {
              reject(result);
            } else {
              setTimeout(poll, pollInterval);
            }
          } catch (err) {
            reject(err);
          }
        };

        poll();
      });
    } catch (err) {
      console.error("process_task_query_v error", err);
      return null;
    }
  };

  const createNewSession = async (): Promise<{
    session_id: string;
    agent_id: string;
  } | null> => {
    try {
      const user_email = getUserEmail();

      const body = new URLSearchParams();
      body.append("user_email", user_email);

      const response = await fetch(`${API_BASE_URL}/create_session`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!response.ok) {
        throw new Error("Failed to create session");
      }

      const data = await response.json();
      return data; // { session_id: "thread_xxx", agent_id: "asst_xxx" }
    } catch (error) {
      console.error("Error creating new session:", error);
      return null;
    }
  };

  const loadUserThreads = async () => {
    try {
      const email = getUserEmail();

      const res = await fetch(
        `${API_BASE_URL}/user_threads?user_email=${email}`,
        { headers: { accept: "application/json" } },
      );

      const data = await res.json();
      console.log("THREADS RESPONSE:", data);

      if (!res.ok) throw new Error("Failed to fetch threads");

      if (!data.threads) {
        setChatSessions([]);
        return;
      }

      const formattedSessions: ChatSession[] = Object.keys(data.threads).map(
        (threadId) => {
          const thread = data.threads[threadId];

          return {
            id: threadId,
            title: thread.last_message?.content?.slice(0, 30) || "Chat Session",
            messages: [],
            createdAt: new Date(thread.created_at),

            // ✅ ADD THIS
            lastUpdated: new Date(
              thread.last_message?.timestamp || thread.created_at,
            ),

            modalBuildId: undefined,
          };
        },
      );

      setChatSessions(
        formattedSessions.sort(
          (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime(),
        ),
      );
    } catch (err) {
      console.error("Error loading threads:", err);
    }
  };

  const loadThreadHistory = async (threadId: string) => {
    try {
      setIsLoadingHistory(true); // ✅ mark as history load

      const email = getUserEmail();

      const res = await fetch(
        `${API_BASE_URL}/conversation_history/${threadId}?user_email=${email}`,
        { headers: { accept: "application/json" } },
      );

      const data = await res.json();

      const formattedMessages: Message[] = data.messages.map(
        (msg: any, index: number) => ({
          id: `${threadId}-${index}`,
          role: msg.role,
          content: msg.content,
          timestamp: new Date(msg.timestamp),
          type: "text",
        }),
      );

      setMessages(formattedMessages);
      setCurrentSessionId(threadId);
      setShowHistory(false);
    } catch (err) {
      console.error("Error loading thread history:", err);
    } finally {
      setIsLoadingHistory(false); // ✅ reset
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const email = getUserEmail();

      const body = new URLSearchParams();
      body.append("session_id", sessionId);
      body.append("user_email", email);

      const res = await fetch(`${API_BASE_URL}/delete_session`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          accept: "application/json",
        },
        body: body.toString(),
      });

      if (!res.ok) throw new Error("Failed to delete session");

      setChatSessions((prev) => prev.filter((s) => s.id !== sessionId));

      if (sessionId === currentSessionId) {
        startNewChat();
      }
    } catch (err) {
      console.error("Delete session failed:", err);
    }
  };

  const startBuildFlowWithBackend = async (queryText: string) => {
    setIsBuilding(true);
    setShowFullScreenBuild(true);
    setBuildStage(0);
    setBuildProgress(2);

    const buildingMsg: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: "Starting the model build process...",
      timestamp: new Date(),
      type: "text",
    };
    setMessages((prev) => [...prev, buildingMsg]);
    setIsTyping(true);

    const progressInterval = setInterval(() => {
      setBuildProgress((prev) => Math.min(98, prev + Math.random() * 6 + 1));
      setBuildStage((prev) =>
        Math.min(buildStages.length - 1, prev + (Math.random() < 0.12 ? 1 : 0)),
      );
    }, 800);

    const apiResp = await runProcessTaskQuery(queryText);
    clearInterval(progressInterval);
    setIsTyping(false);

    // Check if API returned an error or no results
    if (!apiResp || !apiResp.all_models || apiResp.status === "error") {
      const errorMessage =
        apiResp?.response ||
        "Model build failed or returned no results. Please ensure the upload completed and try again.";
      const suggestions = apiResp?.suggestions || [];

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: `${errorMessage}\n\n${
            suggestions.length > 0
              ? `**Suggestions:**\n${suggestions
                  .map((s: string) => `• ${s}`)
                  .join("\n")}`
              : ""
          }`,
          timestamp: new Date(),
          type: "text",
        },
      ]);

      setIsBuilding(false);
      setShowFullScreenBuild(false);
      setBuildProgress(0);
      setBuildStage(0);
      return;
    }

    console.log("API Response:", apiResp);

    // Display the response message in chatbot
    const responseMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: apiResp.response || "Analysis complete.",
      timestamp: new Date(),
      type: "text",
    };
    setMessages((prev) => [...prev, responseMessage]);

    // Display suggestions if available
    if (apiResp.suggestions && apiResp.suggestions.length > 0) {
      const suggestionsMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `**Suggestions:**\n${apiResp.suggestions
          .map((s: string) => `• ${s}`)
          .join("\n")}`,
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, suggestionsMessage]);
    }

    // Get buildId
    const buildId = apiResp.dataset_id || `build-${Date.now().toString(36)}`;

    // Get dataset name
    const dataset =
      apiResp.blob_file_used || uploadedFile?.name || "dataset.csv";

    // Create BuildData with results object for ModalBuilding
    const buildData: BuildData = {
      buildId,
      dataset,
      task_type: apiResp.task_type, // ← ADD THIS LINE
      target: apiResp.target, // ← ADD THIS LINE (optional but useful)
      analysis: apiResp.analysis,
      suggestions: apiResp.suggestions,
      primary_metric: apiResp.primary_metric,
      primary_score: apiResp.primary_score,
      results: {
        all_models: apiResp.all_models,
        best_model: apiResp.best_model,
        train: apiResp.all_models
          ? Object.keys(apiResp.all_models).reduce((acc, modelName) => {
              acc[modelName] = apiResp.all_models[modelName].train;
              return acc;
            }, {} as any)
          : {},
        test: apiResp.all_models
          ? Object.keys(apiResp.all_models).reduce((acc, modelName) => {
              acc[modelName] = apiResp.all_models[modelName].test;
              return acc;
            }, {} as any)
          : {},
      },
      rows: null,
      columns: null,
    };
    console.log("Parsed BuildData:", buildData);

    setCurrentBuildData(buildData);

    const completeMessage: Message = {
      id: (Date.now() + 2).toString(),
      role: "assistant",
      content: "Analysis complete! Opening results...",
      timestamp: new Date(),
      type: "build-complete",
      buildData,
    };
    setMessages((prev) => [...prev, completeMessage]);

    const sessionTitle =
      messages.find((m) => m.role === "user")?.content.slice(0, 30) ||
      "Model Build";
    const newSession: ChatSession = {
      id: currentSessionId || getSessionId(),
      title: `🔧 ${sessionTitle}...`,
      messages: [...messages, completeMessage],
      createdAt: new Date(),
      lastUpdated: new Date(),
      modalBuildId: buildId,
    };

    setChatSessions((prev) => [
      newSession,
      ...prev.filter((s) => s.id !== (currentSessionId || getSessionId())),
    ]);

    setIsBuilding(false);
    setBuildProgress(100);
    setBuildStage(buildStages.length - 1);

    setTimeout(() => {
      setShowFullScreenBuild(false);
      setIsOpen(false);
      navigate(`/workflow/automl/modal-building/${buildId}`);
    }, 900);
  };

  const handleSend = async () => {
    if (!input.trim() || isBuilding) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setChatSessions((prev) =>
      prev
        .map((s) =>
          s.id === currentSessionId ? { ...s, lastUpdated: new Date() } : s,
        )
        .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()),
    );

    const currentInput = input;
    setInput("");
    setIsTyping(true);

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "assistant",
        content:
          "Processing your request in the background. This may take 1–5 minutes...",
        timestamp: new Date(),
        type: "text",
      },
    ]);

    const lowerInput = currentInput.toLowerCase();
    const isBuildQuery =
      lowerInput.includes("build") ||
      lowerInput.includes("train model") ||
      lowerInput.includes("create model");
    if (isBuildQuery) {
      setIsTyping(false);
      startBuildFlowWithBackend(currentInput);
      return;
    }

    try {
      // ALWAYS call backend
      const apiResp = await runProcessTaskQuery(currentInput);

      setIsTyping(false);

      if (!apiResp) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: "Something went wrong while processing your request.",
            timestamp: new Date(),
            type: "text",
          },
        ]);
        return;
      }

      // Otherwise show normal assistant response
      let formattedResponse = apiResp.response || "";

      if (apiResp.available_columns?.length) {
        formattedResponse += `

      **Available Columns:**
      ${apiResp.available_columns.map((c: string) => `• ${c}`).join("\n")}`;
      }

      if (
        apiResp.suggestions?.length &&
        !formattedResponse.toLowerCase().includes("suggestions")
      ) {
        formattedResponse += `

      **Suggestions:**
      ${apiResp.suggestions.map((s: string) => `• ${s}`).join("\n")}`;
      }

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: formattedResponse,
        timestamp: new Date(),
        type: "text",
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setChatSessions((prev) =>
        prev
          .map((s) =>
            s.id === currentSessionId ? { ...s, lastUpdated: new Date() } : s,
          )
          .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()),
      );
      // Show suggestions if present
      if (apiResp.suggestions?.length) {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Suggestions:\n${apiResp.suggestions
              .map((s: string) => `• ${s}`)
              .join("\n")}`,
            timestamp: new Date(),
            type: "text",
          },
        ]);
      }
    } catch (err) {
      console.error(err);

      setIsTyping(false);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: "Error processing your request.",
          timestamp: new Date(),
          type: "text",
        },
      ]);
    }
  };

  const handleGoToModalBuild = () => {
    if (currentBuildData) {
      navigate(`/workflow/automl/modal-building/${currentBuildData.buildId}`);
    }
  };

  // --- Rendering functions (kept your UI) ---
  const renderFullScreenBuildAnimation = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[500] flex items-center justify-center bg-background/95 backdrop-blur-md"
    >
      <div className="w-full max-w-lg p-8">
        <div className="flex items-center justify-center gap-3 mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Sparkles className="w-8 h-8 text-primary" />
          </motion.div>
          <span className="text-2xl font-bold text-foreground">
            Building ML Model
          </span>
        </div>

        <p className="text-center text-3xl font-bold text-primary mb-2">
          {Math.round(buildProgress)}%
        </p>
        <p className="text-center text-sm text-muted-foreground mb-8">
          Training multiple models... Optimizing hyperparameters...
        </p>

        <div className="space-y-3">
          {buildStages.map((stage, index) => {
            const Icon = stage.icon;
            const isComplete = index < buildStage;
            const isCurrent = index === buildStage;

            return (
              <motion.div
                key={stage.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center gap-4 p-4 rounded-xl text-sm transition-all ${
                  isCurrent
                    ? "bg-primary/20 border-2 border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.3)]"
                    : isComplete
                      ? "bg-success/10 border border-success/20"
                      : "bg-secondary/30 border border-transparent"
                }`}
              >
                <motion.div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isComplete
                      ? "bg-success"
                      : isCurrent
                        ? "bg-primary"
                        : "bg-secondary"
                  }`}
                  animate={
                    isCurrent
                      ? {
                          boxShadow: [
                            "0 0 0 0 hsl(var(--primary)/0.4)",
                            "0 0 0 12px hsl(var(--primary)/0)",
                            "0 0 0 0 hsl(var(--primary)/0.4)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  {isComplete ? (
                    <CheckCircle className="w-5 h-5 text-success-foreground" />
                  ) : (
                    <Icon
                      className={`w-5 h-5 ${
                        isCurrent
                          ? "text-primary-foreground"
                          : "text-muted-foreground"
                      }`}
                    />
                  )}
                </motion.div>

                <span
                  className={`font-medium flex-1 ${
                    isCurrent
                      ? "text-foreground"
                      : isComplete
                        ? "text-success"
                        : "text-muted-foreground"
                  }`}
                >
                  {stage.name}
                </span>

                {isCurrent && (
                  <motion.span
                    className="text-xs text-primary font-medium"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    Processing...
                  </motion.span>
                )}
                {isComplete && (
                  <span className="text-xs text-success">Complete</span>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {[...Array(7)].map((_, i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-primary/60"
              animate={{ y: [0, -12, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.12 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );

  const formatMessage = (content: string) => {
    if (!content) return "";

    return (
      content
        // Remove ### or ##
        .replace(/^#{1,6}\s*/gm, "")

        // Ensure each bullet starts on new line
        .replace(/• /g, "\n• ")

        // Ensure numbered sections start new line
        .replace(/(\d+\.\s)/g, "\n\n$1")

        // Bold key-value pairs (Task:, Target:, etc.)
        .replace(/([A-Za-z\s]+:)/g, "**$1**")

        // Fix spacing
        .replace(/\n{3,}/g, "\n\n")
        .trim()
    );
  }; // Enhanced formatting: makes headings bold + improves readability

  const formatMessageWithBoldHeadings = (content: string): string => {
    if (!content) return "";

    return (
      content
        // ✅ Normalize headings like "6.\nOverall Verdict"
        .replace(/(\d+)[\.\)]\s*\n\s*([A-Za-z])/g, "$1. $2")

        // ✅ Convert markdown headings ##, ### → plain
        .replace(/^#{1,6}\s*/gm, "")

        // ✅ Normalize numbered headings
        .replace(/^(\d+[\.\)]\s*)([A-Za-z].*)$/gm, "\n\n**$1$2**\n")

        // ✅ Normalize standalone section titles
        .replace(
          /^(Task Summary|Performance Metrics.*|Feature Insights.*|Recommendations|Next Steps|Overall Verdict)$/gim,
          "\n\n**$1**\n",
        )

        // ✅ Bold key-value pairs
        .replace(
          /(Task|Target|Best model.*|Key finding|Key takeaway|Data leakage risk|Model behavior|Metric interpretation caveat):/gi,
          "**$1:**",
        )

        // ✅ Ensure bullets start new line
        .replace(/\n?[-•]\s+/g, "\n• ")

        // ✅ Add spacing after sentences (safe version)
        .replace(/([a-z])\.\s+(?=[A-Z])/g, "$1.\n")

        // ✅ Clean extra spacing
        .replace(/\n{3,}/g, "\n\n")

        .trim()
    );
  };

  const renderBuildComplete = (buildData: BuildData) => (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-gradient-to-br from-success/10 via-secondary/50 to-success/5 rounded-lg p-4 border border-success/30"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-success flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-success-foreground" />
        </div>
        <span className="font-semibold text-foreground">
          Model Build Complete!
        </span>
      </div>

      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-card/60 p-2 rounded border border-border/50">
            <p className="text-muted-foreground">Dataset</p>
            <p className="font-medium text-foreground truncate">
              {buildData.dataset}
            </p>
          </div>
          <div className="bg-card/60 p-2 rounded border border-border/50">
            <p className="text-muted-foreground">Best Model</p>
            <p className="font-bold text-primary">{buildData.bestModel}</p>
          </div>
        </div>
        <p className="text-muted-foreground text-center">
          Navigating to results...
        </p>
      </div>
    </motion.div>
  );

  const renderBuildBanner = () => {
    if (!currentBuildData) return null;

    return <div></div>;
  };
  console.log(
    "[Chatbot] Rendering Chatbot – isOpen:",
    isOpen,
    "currentSessionId:",
    currentSessionId,
  );

  return (
    <>
      <AnimatePresence>
        {showFullScreenBuild && renderFullScreenBuildAnimation()}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-glow flex items-center justify-center z-[150] ${
          isOpen ? "hidden" : ""
        }`}
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 400, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 400, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-4 bottom-4 w-[420px] min-w-[380px] max-w-[450px] z-[150] flex rounded-2xl overflow-hidden border border-border bg-card shadow-xl "
            style={{
              height: "calc(100vh - 32px)",
              maxHeight: "700px",
              top: "auto",
            }}
          >
            <AnimatePresence>
              {showHistory && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 180, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="border-r border-border bg-muted/40 overflow-hidden flex-shrink-0"
                >
                  <div className="p-3 border-b border-border">
                    <p className="text-xs font-semibold text-muted-foreground uppercase">
                      Chat History
                    </p>
                  </div>
                  <div className="p-2 space-y-1 overflow-y-auto max-h-[calc(100%-50px)] scrollbar-thin">
                    {chatSessions.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-4">
                        No previous chats
                      </p>
                    ) : (
                      chatSessions.map((session) => (
                        <div
                          key={session.id}
                          className={`group relative w-full text-left p-2 rounded-lg text-xs transition-colors ${
                            session.id === currentSessionId
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted"
                          }`}
                        >
                          {/* Clickable area */}
                          <button
                            onClick={() => loadThreadHistory(session.id)}
                            className="w-full text-left"
                          >
                            <p className="truncate font-medium pr-6">
                              {session.title}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {session.createdAt.toLocaleDateString()}
                            </p>

                            {session.modalBuildId && (
                              <span className="text-[9px] bg-primary/20 text-primary px-1 rounded mt-1 inline-block">
                                Build
                              </span>
                            )}
                          </button>

                          {/* 🗑 Delete Icon (only on hover) */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // prevent opening chat
                              setDeleteSessionId(session.id);
                            }}
                            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/10"
                          >
                            <Trash2 className="w-3 h-3 text-muted-foreground hover:text-destructive" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border flex-shrink-0 bg-card">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setShowHistory(!showHistory)}
                    aria-label="Toggle chat history"
                  >
                    {showHistory ? (
                      <ChevronLeft className="w-4 h-4" />
                    ) : (
                      <History className="w-4 h-4" />
                    )}
                  </Button>
                  <div className="w-8 h-8 rounded-lg bg-primary/15 border border-primary/30 flex items-center justify-center">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">
                      AI Assistant
                    </h3>
                    <p className="text-xs text-success">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={startNewChat}
                    className="h-8 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    New
                  </Button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-muted transition-colors"
                    aria-label="Close chat"
                  >
                    <X className="w-4 h-4 text-primary" />
                  </button>
                </div>
              </div>

              {renderBuildBanner()}

              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin">
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${
                      message.role === "user" ? "flex-row-reverse" : ""
                    }`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user" ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      {message.role === "user" ? (
                        <User className="w-4 h-4 text-primary-foreground" />
                      ) : (
                        <Bot className="w-4 h-4 text-primary" />
                      )}
                    </div>

                    <div
                      className={
                        message.type === "build-complete"
                          ? "w-full max-w-[calc(100%-36px)]"
                          : "max-w-[85%]"
                      }
                    >
                      {/* Build Complete */}
                      {message.type === "build-complete" &&
                      message.buildData ? (
                        renderBuildComplete(message.buildData)
                      ) : message.previewData ? (
                        /* Dataset Preview */
                        <div
                          className={`p-3 rounded-xl text-sm ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-muted text-foreground rounded-bl-none"
                          }`}
                        >
                          <p className="font-medium mb-2">
                            ✅ Dataset imported successfully!
                          </p>
                          <p className="text-xs mb-3">
                            {message.previewData.rowCount} rows ×{" "}
                            {message.previewData.columnCount} columns
                          </p>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setShowPreviewForMessage(
                                showPreviewForMessage === message.id
                                  ? null
                                  : message.id,
                              )
                            }
                            className="w-full mb-2"
                          >
                            {showPreviewForMessage === message.id
                              ? "Hide Preview"
                              : "Show Preview"}
                          </Button>

                          {showPreviewForMessage === message.id && (
                            <div
                              className="message-content mt-2"
                              dangerouslySetInnerHTML={{
                                __html: message.previewData.html,
                              }}
                            />
                          )}

                          <p className="text-[10px] mt-2 text-muted-foreground">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      ) : (
                        /* ✅ NORMAL MESSAGE */
                        <div
                          className={`p-4 rounded-xl text-sm ${
                            message.role === "user"
                              ? "bg-primary text-primary-foreground rounded-br-none"
                              : "bg-card border border-border text-foreground rounded-bl-none"
                          }`}
                        >
                          {(() => {
                            const fullContent = message.content || "";

                            // Detect table
                            const tableIndex = fullContent.indexOf("|");
                            const hasTable =
                              fullContent.includes("|") &&
                              fullContent.includes("---");
                            if (!hasTable) {
                              return (
                                <ReactMarkdown
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    p: ({ children }) => (
                                      <p className="mb-3 leading-relaxed text-sm">
                                        {children}
                                      </p>
                                    ),
                                    strong: ({ children }) => (
                                      <strong className="font-semibold text-foreground">
                                        {children}
                                      </strong>
                                    ),
                                  }}
                                >
                                  {formatMessageWithBoldHeadings(fullContent)}
                                </ReactMarkdown>
                              );
                            }

                            // Split content: Before Table + Table + After Table
                            const beforeTable = fullContent
                              .substring(0, tableIndex)
                              .trim();
                            const remainingContent =
                              fullContent.substring(tableIndex);

                            // Find where table ends and "after" content starts
                            const lines = remainingContent.split("\n");

                            let tableLines: string[] = [];
                            let afterLines: string[] = [];
                            let isTable = false;

                            for (let line of lines) {
                              const trimmed = line.trim();

                              // Detect start of table
                              if (trimmed.startsWith("|")) {
                                isTable = true;
                              }

                              if (isTable && trimmed.startsWith("|")) {
                                tableLines.push(line);
                              } else {
                                if (isTable) {
                                  // table ended
                                  isTable = false;
                                }
                                afterLines.push(line);
                              }
                            }

                            const tablePart = tableLines.join("\n").trim();
                            const afterTable = afterLines.join("\n").trim();

                            return (
                              <>
                                {/* BEFORE TABLE */}
                                {beforeTable && (
                                  <div className="mb-5">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        p: ({ children }) => (
                                          <p className="mb-3 leading-relaxed text-sm text-foreground">
                                            {children}
                                          </p>
                                        ),
                                        strong: ({ children }) => (
                                          <strong className="font-semibold text-foreground">
                                            {children}
                                          </strong>
                                        ),
                                      }}
                                    >
                                      {formatMessageWithBoldHeadings(
                                        beforeTable,
                                      )}
                                    </ReactMarkdown>
                                  </div>
                                )}

                                {/* SCROLLABLE TABLE - Only Table Scrolls */}
                                {tablePart && (
                                  <div className="my-6 overflow-x-auto rounded-xl border border-border bg-card p-2">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        table: ({ children }) => (
                                          <table className="min-w-max text-xs border-collapse">
                                            {children}
                                          </table>
                                        ),
                                        thead: ({ children }) => (
                                          <thead className="bg-muted sticky top-0 z-10">
                                            {children}
                                          </thead>
                                        ),
                                        th: ({ children }) => (
                                          <th className="px-4 py-2 font-semibold text-left whitespace-nowrap border-b">
                                            {children}
                                          </th>
                                        ),
                                        td: ({ children }) => (
                                          <td className="px-4 py-2 border-b text-center whitespace-nowrap">
                                            {children}
                                          </td>
                                        ),
                                      }}
                                    >
                                      {tablePart}
                                    </ReactMarkdown>
                                  </div>
                                )}

                                {/* AFTER TABLE - Clean & Bold Headings */}
                                {afterTable && (
                                  <div className="mt-6 space-y-3">
                                    <ReactMarkdown
                                      remarkPlugins={[remarkGfm]}
                                      components={{
                                        p: ({ children }) => (
                                          <p className="mb-4 leading-relaxed text-sm text-foreground">
                                            {children}
                                          </p>
                                        ),
                                        strong: ({ children }) => (
                                          <strong className="font-semibold text-foreground">
                                            {children}
                                          </strong>
                                        ),
                                      }}
                                    >
                                      {formatMessageWithBoldHeadings(
                                        afterTable,
                                      )}
                                    </ReactMarkdown>
                                  </div>
                                )}
                              </>
                            );
                          })()}

                          {/* Timestamp */}
                          <p
                            className={`text-[10px] mt-1 ${
                              message.role === "user"
                                ? "text-primary-foreground/60"
                                : "text-muted-foreground"
                            }`}
                          >
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="w-4 h-4 text-foreground" />
                    </div>
                    <div className="bg-card border border-border p-3 rounded-xl rounded-bl-none">
                      <div className="flex gap-1">
                        <span
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        />
                        <span
                          className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
                {isUploadingDataset && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2"
                  >
                    <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>

                    <div className="bg-card border border-border p-3 rounded-xl rounded-bl-none flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      <span className="text-sm text-muted-foreground">
                        Uploading dataset...
                      </span>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
              {datasetModalOpen && (
                <div className="absolute bottom-20 left-4 right-4 bg-card border border-border rounded-xl shadow-xl z-50 max-h-[300px] overflow-auto">
                  <div className="p-3 border-b border-border flex justify-between items-center">
                    <p className="text-sm font-semibold">Select Dataset</p>
                    <button
                      onClick={() => setDatasetModalOpen(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-2 space-y-2">
                    {datasetsLoading && (
                      <p className="text-center text-muted-foreground text-sm">
                        Loading datasets...
                      </p>
                    )}

                    {!datasetsLoading && datasets.length === 0 && (
                      <p className="text-center text-muted-foreground text-sm">
                        No datasets available
                      </p>
                    )}

                    {datasets.map((ds) => (
                      <button
                        key={ds.id}
                        onClick={() => handleSelectDataset(ds)}
                        className="w-full text-left p-3 border border-border rounded-lg hover:bg-muted transition"
                      >
                        {ds.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 border-t border-border flex-shrink-0 bg-card">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      loadAvailableDatasets();
                      setDatasetModalOpen(true);
                    }}
                    disabled={isBuilding}
                  >
                    <Upload className="w-4 h-4" />
                  </Button>
                  <Input
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      !isBuilding &&
                      !isUploadingDataset &&
                      handleSend()
                    }
                    placeholder={
                      isUploadingDataset
                        ? "Uploading dataset..."
                        : isBuilding
                          ? "Building in progress..."
                          : "Ask me anything..."
                    }
                    disabled={isBuilding || isUploadingDataset}
                  />
                  <Button
                    variant="glow"
                    size="icon"
                    onClick={handleSend}
                    disabled={!input.trim() || isTyping || isBuilding}
                  >
                    {isTyping || isBuilding ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                {uploadedFile && (
                  <p className="text-xs text-muted-foreground mt-2">
                    File attached: {uploadedFile.name}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {deleteSessionId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-xl p-5 w-[320px] shadow-xl">
            <h3 className="text-sm font-semibold mb-2 text-foreground">
              Delete Chat
            </h3>

            <p className="text-xs text-muted-foreground mb-4">
              Are you sure you want to delete this chat session? This action
              cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteSessionId(null)}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (deleteSessionId) {
                    handleDeleteSession(deleteSessionId);
                  }
                  setDeleteSessionId(null);
                }}
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
