import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface AddBusinessRuleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddRule: (rule: { name: string; description: string; logic: string }) => void;
  initialRule?: { name: string; description: string; logic: string };
}

export function AddBusinessRuleDialog({
  open,
  onOpenChange,
  onAddRule,
  initialRule,
}: AddBusinessRuleDialogProps) {
  const [ruleName, setRuleName] = useState("");
  const [description, setDescription] = useState("");
  const [logic, setLogic] = useState("");

  useEffect(() => {
    if (initialRule) {
      setRuleName(initialRule.name || "");
      setDescription(initialRule.description || "");
      setLogic(initialRule.logic || "");
    } else {
      setRuleName("");
      setDescription("");
      setLogic("");
    }
  }, [initialRule, open]);

  const handleSubmit = () => {
    if (!ruleName.trim()) {
      toast({
        title: "Rule name required",
        description: "Please enter a name for the business rule",
        variant: "destructive",
      });
      return;
    }

    if (!logic.trim()) {
      toast({
        title: "Business logic required",
        description: "Please enter the business logic",
        variant: "destructive",
      });
      return;
    }

    onAddRule({
      name: ruleName,
      description: description,
      logic: logic,
    });

    toast({
      title: initialRule ? "Business rule updated" : "Business rule added",
      description: `Rule "${ruleName}" has been ${initialRule ? 'updated' : 'created'} successfully.`,
      duration: 1000,
    });

    setRuleName("");
    setDescription("");
    setLogic("");
  };

  const handleCancel = () => {
    setRuleName("");
    setDescription("");
    setLogic("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/* <DialogContent className="sm:max-w-[700px]  bg-background"> */}
       {/* <DialogContent className="max-w-3xl h-[75vh] bg-background flex flex-col overflow-hidden">
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
            <h2 className="text-2xl font-bold text-foreground">{initialRule ? 'Edit' : 'Add New'} Business Rule</h2>
            <p className="text-muted-foreground mt-1">
              Create a new business logic rule for data processing
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Rule Name
              </label>
              <Input
                placeholder="Enter rule name"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                className="h-12"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Description
              </label>
              <Textarea
                placeholder="Describe what this rule does"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[80px] resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Business Logic
              </label>
              <Textarea
                placeholder="Enter the business logic (e.g., IF condition THEN action)"
                value={logic}
                onChange={(e) => setLogic(e.target.value)}
                className="min-h-[120px] resize-none font-mono text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleCancel}>
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleSubmit}>
              {initialRule ? 'Update' : 'Add'} Rule
            </Button>
          </div>
        </div>
      </DialogContent> */}
      <DialogContent className="max-w-3xl h-[75vh] bg-background flex flex-col">
  
  <Button
    variant="ghost"
    size="icon"
    className="absolute right-10 top-3 rounded-full"
    onClick={() => onOpenChange(false)}
  >
    <X className="h-4 w-4" />
  </Button>

  {/* Scrollable Content */}
  <div className="flex-1 overflow-y-auto px-1">
    <div className="space-y-6 py-6">
      
      <div>
        <h2 className="text-2xl font-bold text-foreground">
          {initialRule ? 'Edit' : 'Add New'} Business Rule
        </h2>
        <p className="text-muted-foreground mt-1">
          Create a new business logic rule for data processing
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Rule Name
          </label>
          <Input
            placeholder="Enter rule name"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            className="h-12"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Description
          </label>
          <Textarea
            placeholder="Describe what this rule does"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px] resize-none"
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-foreground mb-2 block">
            Business Logic
          </label>
          <Textarea
            placeholder="Enter the business logic (e.g., IF condition THEN action)"
            value={logic}
            onChange={(e) => setLogic(e.target.value)}
            className="min-h-[120px] resize-none font-mono text-sm"
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1" onClick={handleCancel}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleSubmit}>
          {initialRule ? 'Update' : 'Add'} Rule
        </Button>
      </div>

    </div>
  </div>
</DialogContent>
    </Dialog>
  );
}
