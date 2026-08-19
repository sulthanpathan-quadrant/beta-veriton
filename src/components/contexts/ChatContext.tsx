// import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
 
// // ChatContext.tsx (top / near other types)
// export interface BuildData {
//   buildId: string;
//   dataset?: string | null;
 
//   task_type?: string;
//   target?: string;
 
//   modelsCount?: number;
 
//   // model info
//   bestModel?: string;
//   best_model?: string;
 
//   // metrics
//   primary_metric?: string;
//   primary_score?: number;
 
//   metrics?: {
//     [k: string]: any;
//     accuracy?: number | string;
//     f1?: number | string;
//     precision?: number | string;
//     recall?: number | string;
//     rmse?: number | string;
//     auc?: number | string;
//   } | null;
 
//   // ⭐ ADD THESE TWO
//   analysis?: string;
//   suggestions?: string[];
 
//   rows?: number | null;
//   columns?: number | null;
 
//   results?: any;
// }
 
// export interface Message {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
//   timestamp: Date;
//   type?: 'text' | 'building' | 'build-complete';
//   buildData?: BuildData | null;
//   previewData?: {
//   html: string;
//   rowCount: number;
//   columnCount: number;
// }
// }
 
 
// interface ChatSession {
//   id: string;
//   title: string;
//   messages: Message[];
//   createdAt: Date;
//   modalBuildId?: string; // Link session to a modal build
//   sessionId?: string;    
//   agentId?: string;      
// }
 
// interface ChatContextType {
//   isOpen: boolean;
//   setIsOpen: (open: boolean) => void;
//   chatSessions: ChatSession[];
//   setChatSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
//   currentSessionId: string;
//   setCurrentSessionId: (id: string) => void;
//   messages: Message[];
//   setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
//   currentBuildData: BuildData | null;
//   setCurrentBuildData: (data: BuildData | null) => void;
//   openChatWithSession: (sessionId: string) => void;
//   getSessionByBuildId: (buildId: string) => ChatSession | undefined;
// }
 
// const ChatContext = createContext<ChatContextType | undefined>(undefined);
 
// const STORAGE_KEY = 'ai-volve-chat-sessions';
 
// export function ChatProvider({ children }: { children: ReactNode }) {
//   const [isOpen, setIsOpen] = useState(false);
//   const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
//     try {
//       const stored = localStorage.getItem(STORAGE_KEY);
//       if (stored) {
//         const parsed = JSON.parse(stored);
//         return parsed.map((s: any) => ({
//           ...s,
//           createdAt: new Date(s.createdAt),
//           messages: s.messages.map((m: any) => ({
//             ...m,
//             timestamp: new Date(m.timestamp)
//           }))
//         }));
//       }
//     } catch (e) {
//       console.error('Failed to load chat sessions:', e);
//     }
//     return [];
//   });
//   const [currentSessionId, setCurrentSessionId] = useState<string>('default');
//   const [messages, setMessages] = useState<Message[]>([
//     {
//       id: '1',
//       role: 'assistant',
//       content: 'Hello! I\'m your AI assistant. I can help you analyze data, build models, and answer questions about your ML pipeline. How can I assist you today?',
//       timestamp: new Date(),
//       type: 'text'
//     }
//   ]);
//   const [currentBuildData, setCurrentBuildData] = useState<BuildData | null>(null);
 
//   // Persist chat sessions to localStorage
//   useEffect(() => {
//     localStorage.setItem(STORAGE_KEY, JSON.stringify(chatSessions));
//   }, [chatSessions]);
 
//   const openChatWithSession = (sessionId: string) => {
//     const session = chatSessions.find(s => s.id === sessionId);
//     if (session) {
//       setCurrentSessionId(session.id);
//       setMessages(session.messages);
//       // Check for build data in messages
//       const buildMessage = session.messages.find(m => m.type === 'build-complete');
//       if (buildMessage?.buildData) {
//         setCurrentBuildData(buildMessage.buildData);
//       }
//     }
//     setIsOpen(true);
//   };
 
//   const getSessionByBuildId = (buildId: string) => {
//     return chatSessions.find(s => s.modalBuildId === buildId);
//   };
 
//   return (
//     <ChatContext.Provider value={{
//       isOpen,
//       setIsOpen,
//       chatSessions,
//       setChatSessions,
//       currentSessionId,
//       setCurrentSessionId,
//       messages,
//       setMessages,
//       currentBuildData,
//       setCurrentBuildData,
//       openChatWithSession,
//       getSessionByBuildId
//     }}>
//       {children}
//     </ChatContext.Provider>
//   );
// }
 
// export function useChatContext() {
//   const context = useContext(ChatContext);
//   if (context === undefined) {
//     throw new Error('useChatContext must be used within a ChatProvider');
//   }
//   return context;
// }
 
 import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
 
// ChatContext.tsx (top / near other types)
export interface BuildData {
  buildId: string;
  dataset?: string | null;
 
  task_type?: string;
  target?: string;
 
  modelsCount?: number;
 
  // model info
  bestModel?: string;
  best_model?: string;
 
  // metrics
  primary_metric?: string;
  primary_score?: number;
 
  metrics?: {
    [k: string]: any;
    accuracy?: number | string;
    f1?: number | string;
    precision?: number | string;
    recall?: number | string;
    rmse?: number | string;
    auc?: number | string;
  } | null;
 
  // ⭐ ADD THESE TWO
  analysis?: string;
  suggestions?: string[];
 
  rows?: number | null;
  columns?: number | null;
 
  results?: any;
}
 
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'building' | 'build-complete';
  buildData?: BuildData | null;
  previewData?: {
  html: string;
  rowCount: number;
  columnCount: number;
}
}
 
 
interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  modalBuildId?: string; // Link session to a modal build
  sessionId?: string;    
  agentId?: string;
  lastUpdated: Date;      
}
 
interface ChatContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  chatSessions: ChatSession[];
  setChatSessions: React.Dispatch<React.SetStateAction<ChatSession[]>>;
  currentSessionId: string;
  setCurrentSessionId: (id: string) => void;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  currentBuildData: BuildData | null;
  setCurrentBuildData: (data: BuildData | null) => void;
  openChatWithSession: (sessionId: string) => void;
  getSessionByBuildId: (buildId: string) => ChatSession | undefined;
}
 
const ChatContext = createContext<ChatContextType | undefined>(undefined);
 
const STORAGE_KEY = 'ai-volve-chat-sessions';
 
export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return parsed.map((s: any) => ({
          ...s,
          createdAt: new Date(s.createdAt),
          messages: s.messages.map((m: any) => ({
            ...m,
            timestamp: new Date(m.timestamp)
          }))
        }));
      }
    } catch (e) {
      console.error('Failed to load chat sessions:', e);
    }
    return [];
  });
  const [currentSessionId, setCurrentSessionId] = useState<string>('default');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you analyze data, build models, and answer questions about your ML pipeline. How can I assist you today?',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [currentBuildData, setCurrentBuildData] = useState<BuildData | null>(null);
 
  // Persist chat sessions to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(chatSessions));
  }, [chatSessions]);
 
  const openChatWithSession = (sessionId: string) => {
    const session = chatSessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSessionId(session.id);
      setMessages(session.messages);
      // Check for build data in messages
      const buildMessage = session.messages.find(m => m.type === 'build-complete');
      if (buildMessage?.buildData) {
        setCurrentBuildData(buildMessage.buildData);
      }
    }
    setIsOpen(true);
  };
 
  const getSessionByBuildId = (buildId: string) => {
    return chatSessions.find(s => s.modalBuildId === buildId);
  };
 
  return (
    <ChatContext.Provider value={{
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
      openChatWithSession,
      getSessionByBuildId
    }}>
      {children}
    </ChatContext.Provider>
  );
}
 
export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
}
 
 