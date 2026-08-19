import { useState } from "react";
import { WorkflowLayout } from "@/components/WorkflowLayout";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { MessageSquare, TrendingUp, Send, X, ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

export default function AutoMLDashboard() {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([
    { role: "assistant", content: "Hello! I'm your AutoML assistant. How can I help you today?" }
  ]);
  const [inputMessage, setInputMessage] = useState("");

  const sendMessage = () => {
    if (!inputMessage.trim()) return;
    
    setMessages([...messages, { role: "user", content: inputMessage }]);
    setInputMessage("");
    
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I can help you understand your model performance, suggest improvements, or answer questions about the AutoML pipeline." 
      }]);
    }, 1000);
  };

  return (
    <WorkflowLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-foreground mb-8">
          Auto AI/ML Dashboard
        </h1>

        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Best Agent</p>
            <p className="text-3xl font-bold text-foreground">AgentX</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Best Model</p>
            <p className="text-3xl font-bold text-foreground">XGBoost</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Total Chats</p>
            <p className="text-3xl font-bold text-foreground">142</p>
          </div>
          <div className="bg-card border border-border rounded-lg p-6">
            <p className="text-sm text-muted-foreground mb-2">Recent Activity</p>
            <p className="text-3xl font-bold text-foreground">5m ago</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-xl font-semibold text-foreground mb-6">Task Types</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Regression</h4>
                  <p className="text-sm text-muted-foreground">Avg Accuracy: 94.2%</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                  8 Models
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Forecasting</h4>
                  <p className="text-sm text-muted-foreground">Avg Accuracy: 88.7%</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                  5 Models
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">Clustering</h4>
                  <p className="text-sm text-muted-foreground">Silhouette Score: 0.82</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                  3 Models
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-xl font-semibold text-foreground mb-4">Recent Chats</h3>
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <p className="font-medium text-foreground">sales_data_q3.csv</p>
                  <p className="text-sm text-muted-foreground">2 messages, 15m ago</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <p className="font-medium text-foreground">customer_churn_analysis</p>
                  <p className="text-sm text-muted-foreground">8 messages, 2h ago</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors cursor-pointer">
                  <p className="font-medium text-foreground">marketing_campaign.csv</p>
                  <p className="text-sm text-muted-foreground">5 messages, 1d ago</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 flex flex-col items-center justify-center">
            <h3 className="text-2xl font-semibold text-foreground mb-2">Main Model Accuracy</h3>
            <p className="text-8xl font-bold text-foreground mb-4">91.5%</p>
            <p className="text-sm text-muted-foreground mb-8">Last trained on 2023-10-27 10:30 AM</p>
            <div className="flex gap-3">
              <Button size="lg">View Details</Button>
              <Button size="lg" variant="secondary">Explain</Button>
            </div>
          </div>
        </div>

        <div className="flex justify-start mt-8">
          <Button
            variant="outline"
            onClick={() => navigate("/workflow/path-selection")}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Path Selection
          </Button>
        </div>

        {/* Floating Chatbot Button */}
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        >
          <MessageSquare className="h-6 w-6" />
        </button>

        {/* Chatbot Sheet */}
        <Sheet open={chatOpen} onOpenChange={setChatOpen}>
          <SheetContent side="right" className="w-[400px] sm:w-[540px] flex flex-col p-0">
            <SheetHeader className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-xl">AutoML Assistant</SheetTitle>
                <Button variant="ghost" size="icon" onClick={() => setChatOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-4 ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex gap-2">
                <Input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                  placeholder="Ask about your model..."
                  className="flex-1"
                />
                <Button onClick={sendMessage} size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </WorkflowLayout>
  );
}
