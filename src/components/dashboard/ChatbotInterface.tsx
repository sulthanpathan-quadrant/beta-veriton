// import { useState, useRef, useEffect } from 'react';
// import { DataFile } from '@/components/types/dashboard';
// import { DashBoardPreview1 } from './DashBoardPreview1';
// import { sendMessage, downloadChat, deleteThread, deleteAllFilesFromAgent, finalizeDashboardJson } from '../api/api';
// import ReactMarkdown from 'react-markdown';
// import remarkGfm from 'remark-gfm';

// import {
//   ArrowLeft,
//   Send,
//   FileText,
//   Table,
//   FileJson,
//   User,
//   Bot,
//   Save,
//   Sparkles
// } from 'lucide-react';

// import { cn } from '@/lib/utils';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { ScrollArea } from '@/components/ui/scroll-area';

// interface ChatbotInterfaceProps {
//   file: DataFile;
//   onGenerateDashboard: (dashboardData: any, query: string) => void;
//   onBack: () => void;
//   isLoading: boolean;
// }

// interface Message {
//   id: string;
//   role: 'user' | 'assistant';
//   content: string;
// }

// const fileIcons = {
//   csv: FileText,
//   excel: Table,
//   json: FileJson,
// };

// const fileColors = {
//   csv: 'text-emerald-400',
//   excel: 'text-green-400',
//   json: 'text-amber-400',
// };

// export function ChatbotInterface({ file, onGenerateDashboard, onBack, isLoading }: ChatbotInterfaceProps) {
//   const [query, setQuery] = useState('');
//   const [messages, setMessages] = useState<Message[]>([]);
//   const scrollRef = useRef<HTMLDivElement>(null);
//   const Icon = fileIcons[file.type];
//   const iconColor = fileColors[file.type];
//   const [isProcessing, setIsProcessing] = useState(false);
  

//   useEffect(() => {
//     if (scrollRef.current) {
//       scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
//     }
//   }, [messages]);

 

//   const handleSubmit = async (e?: React.FormEvent) => {
//     e?.preventDefault();
//     if (!query.trim() || isLoading) return;

//     const userMessage: Message = {
//       id: Date.now().toString(),
//       role: 'user',
//       content: query.trim()
//     };

//     setMessages(prev => [...prev, userMessage]);
//     const currentQuery = query.trim();
//     setQuery('');

//     const threadId = localStorage.getItem('thread_id');

//     if (!threadId) {
//       const errorMessage: Message = {
//         id: (Date.now() + 1).toString(),
//         role: 'assistant',
//         content: 'Error: No thread ID found. Please try refreshing the page.'
//       };
//       setMessages(prev => [...prev, errorMessage]);
//       return;
//     }

//     const typingId = (Date.now() + 1).toString();
//     const typingMessage: Message = {
//       id: typingId,
//       role: 'assistant',
//       content: '...'
//     };
//     setMessages(prev => [...prev, typingMessage]);

//     try {
//       const response = await sendMessage({
//         thread_id: threadId,
//         question: currentQuery
//       });

//       setMessages(prev => {
//         const filtered = prev.filter(m => m.id !== typingId);

//         const content = response.responses && response.responses.length > 0
//           ? response.responses.map(r => r.content).join('\n')
//           : 'No response received.';

//         const assistantMessage: Message = {
//           id: Date.now().toString(),
//           role: 'assistant',
//           content: content
//         };

//         return [...filtered, assistantMessage];
//       });
//     } catch (error) {
//       setMessages(prev => {
//         const filtered = prev.filter(m => m.id !== typingId);

//         const errorMessage: Message = {
//           id: Date.now().toString(),
//           role: 'assistant',
//           content: `Error: ${error instanceof Error ? error.message : 'Failed to send message. Please try again.'}`
//         };

//         return [...filtered, errorMessage];
//       });
//     }
//   };

//   const handleSaveAndGenerate = async () => {
//     if (messages.length === 0) return;

//     const threadId = localStorage.getItem('thread_id');

//     if (!threadId) {
//       alert('No thread ID found.');
//       return;
//     }

//     setIsProcessing(true);

//     const processingMessageId = Date.now().toString();
//     const processingMessage: Message = {
//       id: processingMessageId,
//       role: 'assistant',
//       content: '🔄 Finalizing your dashboard...'
//     };
//     setMessages(prev => [...prev, processingMessage]);

//     try {
//   // Step 1: Finalize dashboard JSON
//   console.log('Finalizing dashboard JSON with thread_id:', threadId);
//   const dashboardJson = await finalizeDashboardJson(threadId);
//   console.log('Dashboard JSON finalized successfully:', dashboardJson);

//   // Step 2: Remove processing message
//   setMessages(prev => prev.filter(m => m.id !== processingMessageId));

//   // Step 3: Navigate to dashboard preview IMMEDIATELY
//   const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
//   onGenerateDashboard(dashboardJson, userMessages.join('; '));

//   // Step 4: Call cleanup APIs AFTER a delay to ensure dashboard rendered
//   setTimeout(() => {
//     Promise.all([
//       deleteThread(threadId).catch(err => console.error('Error deleting thread:', err)),
//       deleteAllFilesFromAgent().catch(err => console.error('Error deleting files:', err))
//     ]).then(() => console.log('Cleanup completed'));
//   }, 2000); // Wait 2 seconds after navigation

//     } catch (error) {
//       console.error('Error finalizing dashboard:', error);

//       setMessages(prev => {
//         const filtered = prev.filter(m => m.id !== processingMessageId);
//         const errorMessage: Message = {
//           id: Date.now().toString(),
//           role: 'assistant',
//           content: `❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
//         };
//         return [...filtered, errorMessage];
//       });

//       setIsProcessing(false);
//     }
//   };

//   const handleDownload = async () => {
//     const threadId = localStorage.getItem('thread_id');

//     if (!threadId) {
//       alert('No thread ID found. Please start a conversation first.');
//       return;
//     }

//     try {
//       const blob = await downloadChat(threadId);
//       const filename = `chat_${threadId}_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
//       const url = window.URL.createObjectURL(blob);
//       const link = document.createElement('a');
//       link.href = url;
//       link.download = filename;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       window.URL.revokeObjectURL(url);
//     } catch (error) {
//       console.error('Download error:', error);
//       alert(`Failed to download chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
//     }
//   };

//   return (
//     <div className="flex-1 flex flex-col h-full">
//       {/* Header */}
//       <div className="p-4 border-b border-border/50 flex items-center justify-between">
//         <Button
//           variant="ghost"
//           size="sm"
//           onClick={onBack}
//           className="gap-2 text-muted-foreground hover:text-foreground"
//         >
//           <ArrowLeft className="w-4 h-4" />
//           Back to Recommendations
//         </Button>

//         <div className='flex gap-3'>
//           <button
//             onClick={handleDownload}
//             className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//             disabled={messages.length === 0}
//           >
//             Download
//           </button>
//           <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm">
//             <Icon className={cn('w-4 h-4', iconColor)} />
//             {file.name}
//           </div>
//         </div>
//       </div>

//       {/* Chat Area */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {messages.length === 0 ? (
//           /* Empty State */
//           <div className="flex-1 flex flex-col items-center justify-center p-8 -mt-20">
//             <div className="w-full max-w-3xl space-y-8 animate-fade-in text-center">
//               <div className="space-y-2">
//                 <h1 className="text-2xl font-bold text-foreground">
//                   Build Your Own Dashboard
//                 </h1>
//                 <p className="text-muted-foreground">
//                   Describe what insights you want to see
//                 </p>
//               </div>

//               <form onSubmit={handleSubmit} className="relative">
//                 <Input
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   placeholder="e.g., Show me sales by region over the past year..."
//                   disabled={isLoading}
//                   className="h-14 pl-5 pr-14 text-base rounded-xl border-2 border-border bg-card/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
//                 />
//                 <Button
//                   type="submit"
//                   disabled={!query.trim() || isLoading}
//                   variant="glow"
//                   size="icon"
//                   className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg"
//                 >
//                   <Send className="w-4 h-4" />
//                 </Button>
//               </form>
//             </div>
//           </div>
//         ) : (
//           /* Messages */
//           <ScrollArea className="flex-1 p-4" ref={scrollRef}>
//             <div className="max-w-3xl mx-auto space-y-4">
//               {messages.map((message) => (
//                 <div
//                   key={message.id}
//                   className={cn(
//                     "flex gap-3 animate-fade-in",
//                     message.role === 'user' ? 'justify-end' : 'justify-start'
//                   )}
//                 >
//                   {message.role === 'assistant' && (
//                     <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
//                       <Bot className="w-4 h-4 text-primary" />
//                     </div>
//                   )}
//                   <div
//                     className={cn(
//                       "max-w-[80%] px-4 py-3 rounded-2xl",
//                       message.role === 'user'
//                         ? 'bg-primary text-primary-foreground rounded-br-md'
//                         : 'text-foreground rounded-bl-md border border-border flex text-justify'
//                     )}
//                   >
//                     {/* <p className="text-sm">
//                       {message.content === '...' ? (
//                         <span className="flex gap-1">
//                           <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
//                           <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
//                           <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
//                         </span>
//                       ) : (
//                         message.content
//                       )}
//                     </p> */}

//                       <div className="text-sm leading-relaxed prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-a:text-primary prose-a:underline prose-pre:my-3 prose-pre:bg-gray-950 prose-pre:text-gray-100 prose-pre:p-4 prose-pre:rounded-xl prose-code:bg-gray-200 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
//                       <ReactMarkdown remarkPlugins={[remarkGfm]}>
//                         {message.content}
//                       </ReactMarkdown>
//                     </div>
//                   </div>
                  
//                   {message.role === 'user' && (
//                     <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
//                       <User className="w-4 h-4 text-muted-foreground" />
//                     </div>
//                   )}
//                 </div>
//               ))}
//             </div>
            
//           </ScrollArea>
//         )}

//         {/* Input Area */}
//         {messages.length > 0 && (
//           <div className="border-t border-border/50 p-4 bg-background/80 backdrop-blur-sm">
//             <div className="max-w-3xl mx-auto space-y-3">
//               <form onSubmit={handleSubmit} className="relative">
//                 <Input
//                   value={query}
//                   onChange={(e) => setQuery(e.target.value)}
//                   placeholder="e.g., Show me sales by region over the past year..."
//                   disabled={isLoading}
//                   className="h-14 pl-5 pr-14 text-base rounded-xl border-2 border-border bg-card/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
//                 />
//                 <Button
//                   type="submit"
//                   disabled={!query.trim() || isLoading}
//                   variant="glow"
//                   size="icon"
//                   className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg"
//                 >
//                   <Send className="w-4 h-4" />
//                 </Button>
//               </form>

//               {/* Generate Dashboard Button */}
//               {!isProcessing && (
//                 <div className="flex justify-end pt-2">
//                   <Button
//                     onClick={handleSaveAndGenerate}
//                     disabled={isLoading}
//                     className="gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
//                   >
//                     {isLoading ? (
//                       <>
//                         <Sparkles className="w-4 h-4 animate-pulse" />
//                         Generating...
//                       </>
//                     ) : (
//                       <>
//                         <Save className="w-4 h-4" />
//                         Generate Dashboard
//                       </>
//                     )}
//                   </Button>
//                 </div>
//               )}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


import { useState, useRef, useEffect } from 'react';
import { DataFile } from '@/components/types/dashboard';
import { DashBoardPreview1 } from './DashBoardPreview1';
import { sendMessage, downloadChat, deleteThread, deleteAllFilesFromAgent, finalizeDashboardJson } from '../api/api';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  Send,
  FileText,
  Table,
  FileJson,
  User,
  Bot,
  Save,
  Sparkles
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatbotInterfaceProps {
  file: DataFile;
  onGenerateDashboard: (dashboardData: any, query: string) => void;
  onBack: () => void;
  isLoading: boolean;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const fileIcons = {
  csv: FileText,
  excel: Table,
  json: FileJson,
};

const fileColors = {
  csv: 'text-emerald-400',
  excel: 'text-green-400',
  json: 'text-amber-400',
};

export function ChatbotInterface({ file, onGenerateDashboard, onBack, isLoading }: ChatbotInterfaceProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const Icon = fileIcons[file.type];
  const iconColor = fileColors[file.type];
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollElement = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  }, [messages]);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentQuery = query.trim();
    setQuery('');

    const threadId = localStorage.getItem('thread_id');

    if (!threadId) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Error: No thread ID found. Please try refreshing the page.'
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    const typingId = (Date.now() + 1).toString();
    const typingMessage: Message = {
      id: typingId,
      role: 'assistant',
      content: '...'
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await sendMessage({
        thread_id: threadId,
        question: currentQuery
      });

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== typingId);

        const content = response.responses && response.responses.length > 0
          ? response.responses.map(r => r.content).join('\n')
          : 'No response received.';

        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: content
        };

        return [...filtered, assistantMessage];
      });
    } catch (error) {
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== typingId);

        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Failed to send message. Please try again.'}`
        };

        return [...filtered, errorMessage];
      });
    }
  };

  const handleSaveAndGenerate = async () => {
    if (messages.length === 0) return;

    const threadId = localStorage.getItem('thread_id');

    if (!threadId) {
      alert('No thread ID found.');
      return;
    }

    setIsProcessing(true);

    const processingMessageId = Date.now().toString();
    const processingMessage: Message = {
      id: processingMessageId,
      role: 'assistant',
      content: '🔄 Finalizing your dashboard...'
    };
    setMessages(prev => [...prev, processingMessage]);

    try {
      // Step 1: Finalize dashboard JSON
      console.log('Finalizing dashboard JSON with thread_id:', threadId);
      const dashboardJson = await finalizeDashboardJson(threadId);
      console.log('Dashboard JSON finalized successfully:', dashboardJson);

      // Step 2: Remove processing message
      setMessages(prev => prev.filter(m => m.id !== processingMessageId));

      // Step 3: Navigate to dashboard preview IMMEDIATELY
      const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
      onGenerateDashboard(dashboardJson, userMessages.join('; '));

      // Step 4: Call cleanup APIs AFTER a delay to ensure dashboard rendered
      setTimeout(() => {
        Promise.all([
          deleteThread(threadId).catch(err => console.error('Error deleting thread:', err)),
          deleteAllFilesFromAgent().catch(err => console.error('Error deleting files:', err))
        ]).then(() => console.log('Cleanup completed'));
      }, 2000); // Wait 2 seconds after navigation

    } catch (error) {
      console.error('Error finalizing dashboard:', error);

      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== processingMessageId);
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ Failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        };
        return [...filtered, errorMessage];
      });

      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    const threadId = localStorage.getItem('thread_id');

    if (!threadId) {
      alert('No thread ID found. Please start a conversation first.');
      return;
    }

    try {
      const blob = await downloadChat(threadId);
      const filename = `chat_${threadId}_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
      alert(`Failed to download chat: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Recommendations
        </Button>

        <div className='flex gap-3'>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={messages.length === 0}
          >
            Download
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm">
            <Icon className={cn('w-4 h-4', iconColor)} />
            {file.name}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {messages.length === 0 ? (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center p-8 -mt-20">
            <div className="w-full max-w-3xl space-y-8 animate-fade-in text-center">
              <div className="space-y-2">
                <h1 className="text-2xl font-bold text-foreground">
                  Build Your Own Dashboard
                </h1>
                <p className="text-muted-foreground">
                  Describe what insights you want to see
                </p>
              </div>

              <form onSubmit={handleSubmit} className="relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Show me sales by region over the past year..."
                  disabled={isLoading}
                  className="h-14 pl-5 pr-14 text-base rounded-xl border-2 border-border bg-card/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <Button
                  type="submit"
                  disabled={!query.trim() || isLoading}
                  variant="glow"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-9 w-9 rounded-lg"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </div>
        ) : (
          /* Messages */
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="max-w-3xl mx-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3 animate-fade-in",
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] px-4 py-3 rounded-2xl",
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-md'
                        : 'border border-border flex text-justify text-foreground rounded-bl-md'
                    )}
                  >
                    <div className="text-sm prose prose-invert max-w-none">
                      {message.content === '...' ? (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                          {/* <span className="text-muted-foreground text-xs ml-1">...</span> */}
                        </div>
                      ) : (
                        <ReactMarkdown
                          components={{
                            code: ({ node, className, children, ...props }: any) => {
                              const inline = !className;
                              return inline ? (
                                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                  {children}
                                </code>
                              ) : (
                                <pre className="bg-muted p-3 rounded-lg overflow-x-auto my-2">
                                  <code className="text-xs font-mono" {...props}>
                                    {children}
                                  </code>
                                </pre>
                              );
                            },
                            ul: ({ children }) => (
                              <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>
                            ),
                            ol: ({ children }) => (
                              <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>
                            ),
                            li: ({ children }) => (
                              <li className="text-sm leading-relaxed">{children}</li>
                            ),
                            p: ({ children }) => (
                              <p className="mb-2 last:mb-0">{children}</p>
                            ),
                            strong: ({ children }) => (
                              <strong className="font-semibold text-foreground">{children}</strong>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      )}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}

        {messages.length > 0 && (
          <div className="border-t border-border/50 p-4 bg-background/80 backdrop-blur-sm">
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                {/* Input Box */}
                <div className="flex-1 relative">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="e.g., Show me sales by region over the past year..."
                    disabled={isLoading || isProcessing}
                    className="h-12 pl-4 pr-12 text-base rounded-xl border-2 border-border bg-card/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <Button
                    type="submit"
                    disabled={!query.trim() || isLoading || isProcessing}
                    variant="glow"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-lg"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>

                {/* Build Dashboard Button */}
                {!isProcessing && (
                  <Button
                    type="button"
                    onClick={handleSaveAndGenerate}
                    disabled={isLoading || messages.length === 0}
                    className="h-12 px-4 gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 rounded-xl group relative"
                    title="Build Dashboard"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="font-medium">Build</span>

                    {/* Tooltip */}
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-border pointer-events-none">
                      Generate Dashboard
                    </span>
                  </Button>
                )}

                {/* Processing State */}
                {isProcessing && (
                  <Button
                    disabled
                    className="h-12 px-4 gap-2 bg-primary/50 rounded-xl"
                  >
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <span className="font-medium">Building...</span>
                  </Button>
                )}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}