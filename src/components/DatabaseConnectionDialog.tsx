// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Database, Loader2 } from "lucide-react";
// import { useState } from "react";
// import { listDatabaseTables } from "@/components/api/api";
// import { Checkbox } from "@/components/ui/checkbox";
// import { useToast } from "@/hooks/use-toast";
// import { cn } from "@/lib/utils";  // ← THIS LINE WAS MISSING — ADD IT
 
// interface DatabaseConnectionDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   onConnect: (data: {
//     server: string;
//     database: string;
//     username: string;
//     password: string;
//     selectedTables: string[];
//   }) => void;
// }
 
// export function DatabaseConnectionDialog({
//   open,
//   onOpenChange,
//   onConnect,
// }: DatabaseConnectionDialogProps) {
//   const { toast } = useToast();
 
//   const [server, setServer] = useState("");
//   const [database, setDatabase] = useState("");
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
 
//   const [loading, setLoading] = useState(false);
//   const [tables, setTables] = useState<string[]>([]);
//   const [selectedTables, setSelectedTables] = useState<string[]>([]);
//   const [connected, setConnected] = useState(false);
 
//   const resetDialog = () => {
//     setServer("");
//     setDatabase("");
//     setUsername("");
//     setPassword("");
//     setTables([]);
//     setSelectedTables([]);
//     setConnected(false);
//     setLoading(false);
//   };
 
//   const handleConnect = async () => {
//     try {
//       setLoading(true);
//       const res = await listDatabaseTables({
//         server,
//         database,
//         username,
//         password,
//       });
 
//       setTables(res.tables || []);
//       setConnected(true);
//       toast({
//         title: "Database connected successfully",
//         duration: 1000,
//       });
//     } catch (error: any) {
//       toast({
//         variant: "destructive",
//         title: "Connection failed",
//         description: error.message,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };
 
//   const toggleTable = (table: string) => {
//     setSelectedTables((prev) =>
//       prev.includes(table)
//         ? prev.filter((t) => t !== table)
//         : [...prev, table]
//     );
//   };
 
//   const handleConfirm = () => {
//     onConnect({
//       server,
//       database,
//       username,
//       password,
//       selectedTables,
//     });
//     resetDialog();
//     onOpenChange(false);
//   };
 
//   return (
//     <Dialog
//       open={open}
//       onOpenChange={(isOpen) => {
//         if (!isOpen) resetDialog();
//         onOpenChange(isOpen);
//       }}
//     >
//       <DialogContent className="max-w-2xl">
//         <DialogHeader>
//           <DialogTitle className="text-2xl">Database Connection</DialogTitle>
//           <DialogDescription>
//             Connect and select tables
//           </DialogDescription>
//         </DialogHeader>
 
//         <div className="space-y-6 py-4">
//           {!connected && (
//             <>
//               {/* Credentials */}
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Server</Label>
//                   <Input value={server} onChange={(e) => setServer(e.target.value)} />
//                 </div>
 
//                 <div className="space-y-2">
//                   <Label>Database</Label>
//                   <Input value={database} onChange={(e) => setDatabase(e.target.value)} />
//                 </div>
//               </div>
 
//               <div className="grid grid-cols-2 gap-4">
//                 <div className="space-y-2">
//                   <Label>Username</Label>
//                   <Input value={username} onChange={(e) => setUsername(e.target.value)} />
//                 </div>
 
//                 <div className="space-y-2">
//                   <Label>Password</Label>
//                   <Input
//                     type="password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                   />
//                 </div>
//               </div>
 
//               <div className="flex justify-end gap-3 pt-4">
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     resetDialog();
//                     onOpenChange(false);
//                   }}
//                 >
//                   Cancel
//                 </Button>
 
//                 <Button onClick={handleConnect} disabled={loading}>
//                   {loading ? (
//                     <Loader2 className="h-4 w-4 mr-2 animate-spin" />
//                   ) : (
//                     <Database className="h-4 w-4 mr-2" />
//                   )}
//                   Connect
//                 </Button>
//               </div>
//             </>
//           )}
 
//           {connected && (
//             <>
//               {/* Table Selection */}
//               <div className="space-y-3">
//                 <Label>Select Tables</Label>
 
//                 <div className="max-h-60 overflow-auto border rounded-md p-3 space-y-2">
//                   {tables.map((table) => {
//                     const isSelected = selectedTables.includes(table);
 
//                     return (
//                       <div
//                         key={table}
//                         onClick={() => toggleTable(table)}
//                         className={cn(
//                           "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
//                           isSelected
//                             ? "bg-primary/10 border border-primary/30"
//                             : "hover:bg-accent/50"
//                         )}
//                       >
//                         <Checkbox
//                           checked={isSelected}
//                           onCheckedChange={() => toggleTable(table)}
//                           onClick={(e) => e.stopPropagation()} // Prevent double toggle when clicking checkbox
//                         />
//                         <span className="text-sm flex-1">{table}</span>
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
 
//               {/* Footer */}
//               <div className="flex justify-end gap-3 pt-4">
//                 <Button variant="outline" onClick={() => setConnected(false)}>
//                   Back
//                 </Button>
 
//                 <Button
//                   onClick={handleConfirm}
//                   disabled={selectedTables.length === 0}
//                 >
//                   Add Files ({selectedTables.length})
//                 </Button>
//               </div>
//             </>
//           )}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
 
  
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database, Loader2, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { listDatabaseTables } from "@/components/api/api";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
 
interface DatabaseConnectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConnect: (data: {
    server: string;
    database: string;
    username: string;
    password: string;
    selectedTables: string[];
  }) => void;
}
 
export function DatabaseConnectionDialog({
  open,
  onOpenChange,
  onConnect,
}: DatabaseConnectionDialogProps) {
  const { toast } = useToast();
 
  const [server, setServer] = useState("");
  const [database, setDatabase] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
 
  const [loading, setLoading] = useState(false);
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  const [connected, setConnected] = useState(false);
 
  // Password visibility toggle
  const [showPassword, setShowPassword] = useState(false);
 
  const resetDialog = () => {
    setServer("");
    setDatabase("");
    setUsername("");
    setPassword("");
    setTables([]);
    setSelectedTables([]);
    setConnected(false);
    setLoading(false);
    setShowPassword(false); // Reset password visibility
  };
 
  const handleConnect = async () => {
    try {
      setLoading(true);
      const res = await listDatabaseTables({
        server,
        database,
        username,
        password,
      });
 
      setTables(res.tables || []);
      setConnected(true);
      toast({
        title: "Database connected successfully",
        duration: 1000,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Connection failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };
 
  const toggleTable = (table: string) => {
    setSelectedTables((prev) =>
      prev.includes(table)
        ? prev.filter((t) => t !== table)
        : [...prev, table]
    );
  };
 
  const handleConfirm = () => {
    onConnect({
      server,
      database,
      username,
      password,
      selectedTables,
    });
    resetDialog();
    onOpenChange(false);
  };
 
  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetDialog();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Database Connection</DialogTitle>
          <DialogDescription>
            Connect and select tables
          </DialogDescription>
        </DialogHeader>
 
        <div className="space-y-6 py-4">
          {!connected && (
            <>
              {/* Credentials */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Server</Label>
                  <Input
                    value={server}
                    placeholder="XXXXX"
                    onChange={(e) => setServer(e.target.value)}
                  />
                </div>
 
                <div className="space-y-2">
                  <Label>Database</Label>
                  <Input
                    value={database}
                    placeholder="XXXXX"
                    onChange={(e) => setDatabase(e.target.value)}
                  />
                </div>
              </div>
 
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input
                    value={username}
                    placeholder="XXXXX"
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
 
                <div className="space-y-2">
                  <Label>Password</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      placeholder="XXXXX"
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                      autoComplete="off"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
 
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    resetDialog();
                    onOpenChange(false);
                  }}
                >
                  Cancel
                </Button>
 
                <Button onClick={handleConnect} disabled={loading}>
                  {loading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Database className="h-4 w-4 mr-2" />
                  )}
                  Connect
                </Button>
              </div>
            </>
          )}
 
          {connected && (
            <>
              {/* Table Selection */}
              <div className="space-y-3">
                <Label>Select Tables</Label>
 
                <div className="max-h-60 overflow-auto border rounded-md p-3 space-y-2">
                  {tables.map((table) => {
                    const isSelected = selectedTables.includes(table);
 
                    return (
                      <div
                        key={table}
                        onClick={() => toggleTable(table)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors",
                          isSelected
                            ? "bg-primary/10 border border-primary/30"
                            : "hover:bg-accent/50"
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleTable(table)}
                          onClick={(e) => e.stopPropagation()} // Prevent double toggle when clicking checkbox
                        />
                        <span className="text-sm flex-1">{table}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
 
              {/* Footer */}
              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setConnected(false)}>
                  Back
                </Button>
 
                <Button
                  onClick={handleConfirm}
                  disabled={selectedTables.length === 0}
                >
                  Add Files ({selectedTables.length})
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
 