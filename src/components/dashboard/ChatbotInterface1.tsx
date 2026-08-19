import { useState, useRef, useEffect } from 'react';
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
  Sparkles
} from 'lucide-react';
 
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
 
interface ChatbotInterfaceProps {
  file?: string;                     // ← Added: accept file prop from parent (optional)
  onGenerateDashboard: (dashboardData: any, query: string) => void;
  onBack: () => void;
  isLoading: boolean;
}
 
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}
 
const fileIcons: Record<string, any> = {
  csv: FileText,
  excel: Table,
  json: FileJson,
  other: FileText,
};
 
const fileColors: Record<string, string> = {
  csv: 'text-emerald-400',
  excel: 'text-green-400',
  json: 'text-amber-400',
  other: 'text-gray-400',
};
 
function inferFileType(name: string): 'csv' | 'excel' | 'json' | 'other' {
  const lower = name.toLowerCase();
  if (lower.endsWith('.csv'))   return 'csv';
  if (lower.endsWith('.xlsx') || lower.endsWith('.xls')) return 'excel';
  if (lower.endsWith('.json'))  return 'json';
  return 'other';
}
 
export function ChatbotInterface({
  file: propFile,                    // ← renamed to propFile so we can merge with localStorage
  onGenerateDashboard,
  onBack,
  isLoading,
}: ChatbotInterfaceProps) {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
 
  // Prefer prop if passed, fallback to localStorage
  const datasetName = propFile || localStorage.getItem("selected_dataset_name") || "Untitled Dataset";
  const fileType = inferFileType(datasetName);
  const Icon = fileIcons[fileType] || FileText;
  const iconColor = fileColors[fileType] || 'text-gray-400';
 
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
    if (!query.trim() || isLoading || isProcessing) return;
 
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
        content: 'Error: No thread ID found. Please try refreshing or selecting a dataset again.'
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
          : 'No response received from the assistant.';
 
        const assistantMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content
        };
 
        return [...filtered, assistantMessage];
      });
    } catch (error) {
      console.error("Send message failed:", error);
 
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
      alert('No thread ID found. Please start a new conversation.');
      return;
    }
 
    setIsProcessing(true);
 
    const processingMessageId = Date.now().toString();
    const processingMessage: Message = {
      id: processingMessageId,
      role: 'assistant',
      content: '🔄 Creating dataset...'
    };
    setMessages(prev => [...prev, processingMessage]);
 
    try {
      // Step 1: Simulate dataset creation (or call real API if you have one)
      await new Promise(resolve => setTimeout(resolve, 1200));
 
      // Step 2: Update UI message
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== processingMessageId);
        const nextMsg: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: '🔄 Finalizing dashboard configuration...'
        };
        return [...filtered, nextMsg];
      });
 
      // Step 3: Finalize dashboard JSON from thread
      const dashboardJson = await finalizeDashboardJson(threadId);
 
      // Clean up processing message
      setMessages(prev => prev.filter(m => m.id !== processingMessageId));
 
      // Step 4: Pass to parent for preview
      const userMessages = messages.filter(m => m.role === 'user').map(m => m.content);
      onGenerateDashboard(dashboardJson, userMessages.join('; '));
 
      // Step 5: Cleanup (delayed so preview has time to load)
      setTimeout(() => {
        Promise.all([
          deleteThread(threadId).catch(err => console.error('Error deleting thread:', err)),
          deleteAllFilesFromAgent().catch(err => console.error('Error deleting files:', err))
        ]).then(() => console.log('Cleanup completed'));
      }, 2000);
 
    } catch (error) {
      console.error('Error finalizing dashboard:', error);
 
      setMessages(prev => {
        const filtered = prev.filter(m => m.id !== processingMessageId);
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `❌ Failed to generate dashboard: ${error instanceof Error ? error.message : 'Unknown error'}`
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
            {datasetName}
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
                  Describe what insights you want to see from <strong>{datasetName}</strong>
                </p>
              </div>
 
              <form onSubmit={handleSubmit} className="relative">
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g., Show me sales by region over the past year..."
                  disabled={isLoading || isProcessing}
                  className="h-14 pl-5 pr-14 text-base rounded-xl border-2 border-border bg-card/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <Button
                  type="submit"
                  disabled={!query.trim() || isLoading || isProcessing}
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
                            ul: ({ children }) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                            li: ({ children }) => <li className="text-sm leading-relaxed">{children}</li>,
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
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
                <div className="flex-1 relative">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about your data..."
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
                    <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg border border-border pointer-events-none">
                      Generate Dashboard
                    </span>
                  </Button>
                )}
 
                {isProcessing && (
                  <Button
                    disabled
                    className="h-12 px-4 gap-2 bg-primary/50 rounded-xl"
                  >
                    <Sparkles className="w-5 h-5 animate-pulse" />
                    <span className="font-medium">Processing...</span>
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
 