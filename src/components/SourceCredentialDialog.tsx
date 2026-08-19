// import { useState } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Loader2, Eye, EyeOff } from "lucide-react";
// import { toast } from "sonner";
 
// import {
//   S3Credentials,
//   AzureCredentials,
//   OneLakeCredentials,
//   DatabricksCredentials,
//   SnowflakeCredentials,
//   getS3Buckets,
//   getAzureContainers,
//   getOneLakeWorkspaces,
//   getDatabricksCatalogs,
//   getSnowflakeDatabases,
// } from "@/components/api/api";
 
// interface SourceCredentialDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   sourceName: string;
//   sourceId: string;
//   onProceed: (credentials: S3Credentials | AzureCredentials | OneLakeCredentials | DatabricksCredentials | SnowflakeCredentials) => void;
// }
 
// export function SourceCredentialDialog({
//   open,
//   onOpenChange,
//   sourceName,
//   sourceId,
//   onProceed,
// }: SourceCredentialDialogProps) {
//   const [isValidating, setIsValidating] = useState(false);
 
//   // S3
//   const [accessKeyId, setAccessKeyId] = useState("");
//   const [secretAccessKey, setSecretAccessKey] = useState("");
//   const [region, setRegion] = useState("us-east-1");
 
//   // Azure — starts empty (user must provide their own connection string)
//   const [connectionString, setConnectionString] = useState("");
 
//   // OneLake
//   const [tenantId, setTenantId] = useState("");
//   const [clientId, setClientId] = useState("");
//   const [clientSecret, setClientSecret] = useState("");
 
//   // Databricks
//   const [host, setHost] = useState("");
//   const [warehouseId, setWarehouseId] = useState("");
//   const [accessToken, setAccessToken] = useState("");
 
//   // Snowflake
//   const [accountIdentifier, setAccountIdentifier] = useState("");
//   const [username, setUsername] = useState("");
//   const [password, setPassword] = useState("");
//   const [warehouse, setWarehouse] = useState("");
 
//   // Visibility toggles
//   const [showAccessKeyId, setShowAccessKeyId] = useState(false);
//   const [showSecretAccessKey, setShowSecretAccessKey] = useState(false);
//   const [showConnectionString, setShowConnectionString] = useState(false);
//   const [showClientId, setShowClientId] = useState(false);
//   const [showClientSecret, setShowClientSecret] = useState(false);
//   const [showAccessToken, setShowAccessToken] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
 
//   const handleProceed = async () => {
//     setIsValidating(true);
 
//     try {
//       let credentials: any = null;
 
//       if (sourceId === "s3") {
//         credentials = {
//           aws_access_key_id: accessKeyId.trim(),
//           aws_secret_access_key: secretAccessKey.trim(),
//           region: region.trim(),
//         };
//         await getS3Buckets(credentials);
//       } else if (sourceId === "azure") {
//         credentials = { connection_string: connectionString.trim() };
//         await getAzureContainers(credentials);
//       } else if (sourceId === "onelake") {
//         credentials = {
//           tenant_id: tenantId.trim(),
//           client_id: clientId.trim(),
//           client_secret: clientSecret.trim(),
//         };
//         await getOneLakeWorkspaces(credentials);
//       } else if (sourceId === "databricks") {
//         credentials = {
//           host: host.trim(),
//           warehouse_id: warehouseId.trim(),
//           access_token: accessToken.trim(),
//         };
//         await getDatabricksCatalogs(credentials);
//       } else if (sourceId === "snowflake") {
//         credentials = {
//           account_identifier: accountIdentifier.trim(),
//           username: username.trim(),
//           password: password.trim(),
//           warehouse: warehouse.trim(),
//         };
//         await getSnowflakeDatabases(credentials);
//       }
 
//       toast.success(`Connected to ${sourceName} successfully`, {
//         description: "You can now select files or tables.",
//       });
 
//       onProceed(credentials);
//       onOpenChange(false);
//     } catch (error: any) {
//       toast.error("Connection Failed", {
//         description: error.message || "Invalid credentials. Please check your details and try again.",
//       });
//     } finally {
//       setIsValidating(false);
//     }
//   };
 
//   const handleClose = () => {
//     setAccessKeyId("");
//     setSecretAccessKey("");
//     setRegion("us-east-1");
 
//     // Reset to empty — no default/hardcoded value
//     setConnectionString("");
 
//     setTenantId("");
//     setClientId("");
//     setClientSecret("");
 
//     setHost("");
//     setWarehouseId("");
//     setAccessToken("");
 
//     setAccountIdentifier("");
//     setUsername("");
//     setPassword("");
//     setWarehouse("");
 
//     setShowAccessKeyId(false);
//     setShowSecretAccessKey(false);
//     setShowConnectionString(false);
//     setShowClientId(false);
//     setShowClientSecret(false);
//     setShowAccessToken(false);
//     setShowPassword(false);
 
//     onOpenChange(false);
//   };
 
//   const isFormValid = () => {
//     if (sourceId === "s3") {
//       return accessKeyId.trim() !== "" && secretAccessKey.trim() !== "" && region.trim() !== "";
//     }
//     if (sourceId === "azure") {
//       return connectionString.trim() !== "";
//     }
//     if (sourceId === "onelake") {
//       return tenantId.trim() !== "" && clientId.trim() !== "" && clientSecret.trim() !== "";
//     }
//     if (sourceId === "databricks") {
//       return host.trim() !== "" && warehouseId.trim() !== "" && accessToken.trim() !== "";
//     }
//     if (sourceId === "snowflake") {
//       return (
//         accountIdentifier.trim() !== "" &&
//         username.trim() !== "" &&
//         password.trim() !== "" &&
//         warehouse.trim() !== ""
//       );
//     }
//     return false;
//   };
 
//   return (
//     <Dialog open={open} onOpenChange={handleClose}>
//       <DialogContent className="max-w-md">
//         <DialogHeader>
//           <DialogTitle>Connect to {sourceName}</DialogTitle>
//         </DialogHeader>
 
//         <div className="space-y-4 py-4">
//           {/* S3 Credentials */}
//           {sourceId === "s3" && (
//             <>
//               <div className="space-y-2">
//                 <Label htmlFor="accessKeyId">AWS Access Key ID</Label>
//                 <div className="relative">
//                   <Input
//                     id="accessKeyId"
//                     type={showAccessKeyId ? "text" : "password"}
//                     placeholder="XXXXXXXXX"
//                     value={accessKeyId}
//                     onChange={(e) => setAccessKeyId(e.target.value)}
//                     disabled={isValidating}
//                     className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
//                     autoComplete="off"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowAccessKeyId(!showAccessKeyId)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//                     disabled={isValidating}
//                   >
//                     {showAccessKeyId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </div>
 
//               <div className="space-y-2">
//                 <Label htmlFor="secretAccessKey">AWS Secret Access Key</Label>
//                 <div className="relative">
//                   <Input
//                     id="secretAccessKey"
//                     type={showSecretAccessKey ? "text" : "password"}
//                     placeholder="XXXXXXXXXXX"
//                     value={secretAccessKey}
//                     onChange={(e) => setSecretAccessKey(e.target.value)}
//                     disabled={isValidating}
//                     className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
//                     autoComplete="off"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowSecretAccessKey(!showSecretAccessKey)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//                     disabled={isValidating}
//                   >
//                     {showSecretAccessKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </div>
 
//               <div className="space-y-2">
//                 <Label htmlFor="region">Region</Label>
//                 <Input
//                   id="region"
//                   type="text"
//                   placeholder="us-east-1"
//                   value={region}
//                   onChange={(e) => setRegion(e.target.value)}
//                   disabled={isValidating}
//                 />
//               </div>
//             </>
//           )}
 
//           {/* Azure Credentials */}
//           {sourceId === "azure" && (
//             <div className="space-y-2">
//               <Label htmlFor="connectionString">Connection String</Label>
//               <div className="relative">
//                 <Input
//                   id="connectionString"
//                   type={showConnectionString ? "text" : "password"}
//                   placeholder="DefaultEndpointsProtocol=https;AccountName=..."
//                   value={connectionString}
//                   onChange={(e) => setConnectionString(e.target.value)}
//                   disabled={isValidating}
//                   className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
//                   autoComplete="off"
//                 />
//                 <button
//                   type="button"
//                   onClick={() => setShowConnectionString(!showConnectionString)}
//                   className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//                   disabled={isValidating}
//                 >
//                   {showConnectionString ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                 </button>
//               </div>
//               <p className="text-xs text-muted-foreground">
//                 Format: DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=...
//               </p>
//             </div>
//           )}
 
//           {/* OneLake Credentials */}
//           {sourceId === "onelake" && (
//             <>
//               <div className="space-y-2">
//                 <Label htmlFor="tenantId">Tenant ID</Label>
//                 <Input
//                   id="tenantId"
//                   type="password"
//                   placeholder="xxxxxxxx"
//                   value={tenantId}
//                   onChange={(e) => setTenantId(e.target.value)}
//                   disabled={isValidating}
//                 />
//               </div>
 
//               <div className="space-y-2">
//                 <Label htmlFor="clientId">Client ID</Label>
//                 <div className="relative">
//                   <Input
//                     id="clientId"
//                     type={showClientId ? "text" : "password"}
//                     placeholder="xxxxxxx"
//                     value={clientId}
//                     onChange={(e) => setClientId(e.target.value)}
//                     disabled={isValidating}
//                     className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
//                     autoComplete="off"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowClientId(!showClientId)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//                     disabled={isValidating}
//                   >
//                     {showClientId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </div>
 
//               <div className="space-y-2">
//                 <Label htmlFor="clientSecret">Client Secret</Label>
//                 <div className="relative">
//                   <Input
//                     id="clientSecret"
//                     type={showClientSecret ? "text" : "password"}
//                     placeholder="Enter your client secret"
//                     value={clientSecret}
//                     onChange={(e) => setClientSecret(e.target.value)}
//                     disabled={isValidating}
//                     className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
//                     autoComplete="off"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowClientSecret(!showClientSecret)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//                     disabled={isValidating}
//                   >
//                     {showClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
 
//           {/* Databricks Credentials */}
//           {sourceId === "databricks" && (
//             <>
//               <div className="space-y-2">
//                 <Label htmlFor="host">Host</Label>
//                 <Input
//                   id="host"
//                   type="text"
//                   placeholder="XXXXXXXXX"
//                   value={host}
//                   onChange={(e) => setHost(e.target.value)}
//                   disabled={isValidating}
//                 />
//               </div>
 
//               <div className="space-y-2">
//                 <Label htmlFor="warehouseId">Warehouse ID</Label>
//                 <Input
//                   id="warehouseId"
//                   type="text"
//                   placeholder="XXXXXXXXX"
//                   value={warehouseId}
//                   onChange={(e) => setWarehouseId(e.target.value)}
//                   disabled={isValidating}
//                 />
//               </div>
 
//               <div className="space-y-2">
//                 <Label htmlFor="accessToken">Access Token</Label>
//                 <div className="relative">
//                   <Input
//                     id="accessToken"
//                     type={showAccessToken ? "text" : "password"}
//                     placeholder="********"
//                     value={accessToken}
//                     onChange={(e) => setAccessToken(e.target.value)}
//                     disabled={isValidating}
//                     className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
//                     autoComplete="off"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowAccessToken(!showAccessToken)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//                     disabled={isValidating}
//                   >
//                     {showAccessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </div>
//             </>
//           )}
 
//           {/* Snowflake Credentials */}
//           {sourceId === "snowflake" && (
//             <>
//               <div className="space-y-2">
//                 <Label htmlFor="accountIdentifier">Account Identifier</Label>
//                 <Input
//                   id="accountIdentifier"
//                   type="text"
//                   placeholder="XXXXXXXX"
//                   value={accountIdentifier}
//                   onChange={(e) => setAccountIdentifier(e.target.value)}
//                   disabled={isValidating}
//                 />
//               </div>
 
//               <div className="space-y-2">
//                 <Label htmlFor="username">Username</Label>
//                 <Input
//                   id="username"
//                   type="text"
//                   placeholder="XXXXXXX"
//                   value={username}
//                   onChange={(e) => setUsername(e.target.value)}
//                   disabled={isValidating}
//                 />
//               </div>
 
//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <div className="relative">
//                   <Input
//                     id="password"
//                     type={showPassword ? "text" : "password"}
//                     placeholder="Enter your password"
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     disabled={isValidating}
//                     className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
//                     autoComplete="off"
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
//                     disabled={isValidating}
//                   >
//                     {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
//                   </button>
//                 </div>
//               </div>
 
//               <div className="space-y-2">
//                 <Label htmlFor="warehouse">Warehouse</Label>
//                 <Input
//                   id="warehouse"
//                   type="text"
//                   placeholder="XXXXXXXX"
//                   value={warehouse}
//                   onChange={(e) => setWarehouse(e.target.value)}
//                   disabled={isValidating}
//                 />
//               </div>
//             </>
//           )}
 
//           {!["s3", "azure", "onelake", "databricks", "snowflake"].includes(sourceId) && (
//             <div className="text-center py-4 text-muted-foreground">
//               Credentials configuration for {sourceName} coming soon.
//             </div>
//           )}
//         </div>
 
//         <div className="flex justify-end gap-3">
//           <Button variant="outline" onClick={handleClose} disabled={isValidating}>
//             Cancel
//           </Button>
 
//           <Button onClick={handleProceed} disabled={!isFormValid() || isValidating}>
//             {isValidating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
//             {isValidating ? "Connecting..." : "Connect"}
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
 




import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
 
import {
  S3Credentials,
  AzureCredentials,
  OneLakeCredentials,
  DatabricksCredentials,
  SnowflakeCredentials,
  SapCredentials,
  getS3Buckets,
  getAzureContainers,
  getOneLakeWorkspaces,
  getDatabricksCatalogs,
  getSnowflakeDatabases,
  getSapSchemas,
} from "@/components/api/api";
 
interface SourceCredentialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceName: string;
  sourceId: string;
  onProceed: (
    credentials:
      | S3Credentials
      | AzureCredentials
      | OneLakeCredentials
      | DatabricksCredentials
      | SnowflakeCredentials
      | SapCredentials
  ) => void;
}
 
export function SourceCredentialDialog({
  open,
  onOpenChange,
  sourceName,
  sourceId,
  onProceed,
}: SourceCredentialDialogProps) {
  const [isValidating, setIsValidating] = useState(false);
 
  // S3
  const [accessKeyId, setAccessKeyId] = useState("");
  const [secretAccessKey, setSecretAccessKey] = useState("");
  const [region, setRegion] = useState("us-east-1");
 
  // Azure — starts empty (user must provide their own connection string)
  const [connectionString, setConnectionString] = useState("");
 
  // OneLake
  const [tenantId, setTenantId] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
 
  // Databricks
  const [host, setHost] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [accessToken, setAccessToken] = useState("");
 
  // Snowflake
  const [accountIdentifier, setAccountIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [warehouse, setWarehouse] = useState("");

  // SAP
  const [sapHost, setSapHost] = useState("");
  const [sapPort, setSapPort] = useState("443");
  const [sapUsername, setSapUsername] = useState("");
  const [sapPassword, setSapPassword] = useState("");
 
  // Visibility toggles
  const [showAccessKeyId, setShowAccessKeyId] = useState(false);
  const [showSecretAccessKey, setShowSecretAccessKey] = useState(false);
  const [showConnectionString, setShowConnectionString] = useState(false);
  const [showClientId, setShowClientId] = useState(false);
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showAccessToken, setShowAccessToken] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSapPassword, setShowSapPassword] = useState(false);
 
  const handleProceed = async () => {
    setIsValidating(true);
 
    try {
      let credentials: any = null;
 
      if (sourceId === "s3") {
        credentials = {
          aws_access_key_id: accessKeyId.trim(),
          aws_secret_access_key: secretAccessKey.trim(),
          region: region.trim(),
        };
        await getS3Buckets(credentials);
      } else if (sourceId === "azure") {
        credentials = { connection_string: connectionString.trim() };
        await getAzureContainers(credentials);
      } else if (sourceId === "onelake") {
        credentials = {
          tenant_id: tenantId.trim(),
          client_id: clientId.trim(),
          client_secret: clientSecret.trim(),
        };
        await getOneLakeWorkspaces(credentials);
      } else if (sourceId === "databricks") {
        credentials = {
          host: host.trim(),
          warehouse_id: warehouseId.trim(),
          access_token: accessToken.trim(),
        };
        await getDatabricksCatalogs(credentials);
      } else if (sourceId === "snowflake") {
        credentials = {
          account_identifier: accountIdentifier.trim(),
          username: username.trim(),
          password: password.trim(),
          warehouse: warehouse.trim(),
        };
        await getSnowflakeDatabases(credentials);
      } else if (sourceId === "sap") {
        credentials = {
          host: sapHost.trim(),
          port: Number(sapPort.trim()) || 443,
          username: sapUsername.trim(),
          password: sapPassword.trim(),
        };
        // Validate the connection. Schema isn't picked yet at this step —
        // it's chosen in the file browser (Select Schema - SAP screen).
        await getSapSchemas({ ...credentials, schema: "" });
      }
 
      toast.success(`Connected to ${sourceName} successfully`, {
        description: "You can now select files or tables.",
      });
 
      onProceed(credentials);
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Connection Failed", {
        description: error.message || "Invalid credentials. Please check your details and try again.",
      });
    } finally {
      setIsValidating(false);
    }
  };
 
  const handleClose = () => {
    setAccessKeyId("");
    setSecretAccessKey("");
    setRegion("us-east-1");
 
    // Reset to empty — no default/hardcoded value
    setConnectionString("");
 
    setTenantId("");
    setClientId("");
    setClientSecret("");
 
    setHost("");
    setWarehouseId("");
    setAccessToken("");
 
    setAccountIdentifier("");
    setUsername("");
    setPassword("");
    setWarehouse("");

    setSapHost("");
    setSapPort("443");
    setSapUsername("");
    setSapPassword("");
 
    setShowAccessKeyId(false);
    setShowSecretAccessKey(false);
    setShowConnectionString(false);
    setShowClientId(false);
    setShowClientSecret(false);
    setShowAccessToken(false);
    setShowPassword(false);
    setShowSapPassword(false);
 
    onOpenChange(false);
  };
 
  const isFormValid = () => {
    if (sourceId === "s3") {
      return accessKeyId.trim() !== "" && secretAccessKey.trim() !== "" && region.trim() !== "";
    }
    if (sourceId === "azure") {
      return connectionString.trim() !== "";
    }
    if (sourceId === "onelake") {
      return tenantId.trim() !== "" && clientId.trim() !== "" && clientSecret.trim() !== "";
    }
    if (sourceId === "databricks") {
      return host.trim() !== "" && warehouseId.trim() !== "" && accessToken.trim() !== "";
    }
    if (sourceId === "snowflake") {
      return (
        accountIdentifier.trim() !== "" &&
        username.trim() !== "" &&
        password.trim() !== "" &&
        warehouse.trim() !== ""
      );
    }
    if (sourceId === "sap") {
      return (
        sapHost.trim() !== "" &&
        sapPort.trim() !== "" &&
        sapUsername.trim() !== "" &&
        sapPassword.trim() !== ""
      );
    }
    return false;
  };
 
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to {sourceName}</DialogTitle>
        </DialogHeader>
 
        <div className="space-y-4 py-4">
          {/* S3 Credentials */}
          {sourceId === "s3" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="accessKeyId">AWS Access Key ID</Label>
                <div className="relative">
                  <Input
                    id="accessKeyId"
                    type={showAccessKeyId ? "text" : "password"}
                    placeholder="XXXXXXXXX"
                    value={accessKeyId}
                    onChange={(e) => setAccessKeyId(e.target.value)}
                    disabled={isValidating}
                    className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccessKeyId(!showAccessKeyId)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isValidating}
                  >
                    {showAccessKeyId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="secretAccessKey">AWS Secret Access Key</Label>
                <div className="relative">
                  <Input
                    id="secretAccessKey"
                    type={showSecretAccessKey ? "text" : "password"}
                    placeholder="XXXXXXXXXXX"
                    value={secretAccessKey}
                    onChange={(e) => setSecretAccessKey(e.target.value)}
                    disabled={isValidating}
                    className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretAccessKey(!showSecretAccessKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isValidating}
                  >
                    {showSecretAccessKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Input
                  id="region"
                  type="text"
                  placeholder="us-east-1"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  disabled={isValidating}
                />
              </div>
            </>
          )}
 
          {/* Azure Credentials */}
          {sourceId === "azure" && (
            <div className="space-y-2">
              <Label htmlFor="connectionString">Connection String</Label>
              <div className="relative">
                <Input
                  id="connectionString"
                  type={showConnectionString ? "text" : "password"}
                  placeholder="DefaultEndpointsProtocol=https;AccountName=..."
                  value={connectionString}
                  onChange={(e) => setConnectionString(e.target.value)}
                  disabled={isValidating}
                  className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                  autoComplete="off"
                />
                <button
                  type="button"
                  onClick={() => setShowConnectionString(!showConnectionString)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={isValidating}
                >
                  {showConnectionString ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                Format: DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=...
              </p>
            </div>
          )}
 
          {/* OneLake Credentials */}
          {sourceId === "onelake" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="tenantId">Tenant ID</Label>
                <Input
                  id="tenantId"
                  type="password"
                  placeholder="xxxxxxxx"
                  value={tenantId}
                  onChange={(e) => setTenantId(e.target.value)}
                  disabled={isValidating}
                />
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="clientId">Client ID</Label>
                <div className="relative">
                  <Input
                    id="clientId"
                    type={showClientId ? "text" : "password"}
                    placeholder="xxxxxxx"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    disabled={isValidating}
                    className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClientId(!showClientId)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isValidating}
                  >
                    {showClientId ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="clientSecret">Client Secret</Label>
                <div className="relative">
                  <Input
                    id="clientSecret"
                    type={showClientSecret ? "text" : "password"}
                    placeholder="Enter your client secret"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    disabled={isValidating}
                    className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClientSecret(!showClientSecret)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isValidating}
                  >
                    {showClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}
 
          {/* Databricks Credentials */}
          {sourceId === "databricks" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="host">Host</Label>
                <Input
                  id="host"
                  type="text"
                  placeholder="XXXXXXXXX"
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  disabled={isValidating}
                />
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="warehouseId">Warehouse ID</Label>
                <Input
                  id="warehouseId"
                  type="text"
                  placeholder="XXXXXXXXX"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  disabled={isValidating}
                />
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="accessToken">Access Token</Label>
                <div className="relative">
                  <Input
                    id="accessToken"
                    type={showAccessToken ? "text" : "password"}
                    placeholder="********"
                    value={accessToken}
                    onChange={(e) => setAccessToken(e.target.value)}
                    disabled={isValidating}
                    className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAccessToken(!showAccessToken)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isValidating}
                  >
                    {showAccessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}
 
          {/* Snowflake Credentials */}
          {sourceId === "snowflake" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="accountIdentifier">Account Identifier</Label>
                <Input
                  id="accountIdentifier"
                  type="text"
                  placeholder="XXXXXXXX"
                  value={accountIdentifier}
                  onChange={(e) => setAccountIdentifier(e.target.value)}
                  disabled={isValidating}
                />
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="XXXXXXX"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isValidating}
                />
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isValidating}
                    className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isValidating}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
 
              <div className="space-y-2">
                <Label htmlFor="warehouse">Warehouse</Label>
                <Input
                  id="warehouse"
                  type="text"
                  placeholder="XXXXXXXX"
                  value={warehouse}
                  onChange={(e) => setWarehouse(e.target.value)}
                  disabled={isValidating}
                />
              </div>
            </>
          )}

          {/* SAP Credentials */}
          {sourceId === "sap" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="sapHost">SAP Host</Label>
                <Input
                  id="sapHost"
                  type="text"
                  placeholder="xxxxx.prod-ap21.hanacloud.ondemand.com"
                  value={sapHost}
                  onChange={(e) => setSapHost(e.target.value)}
                  disabled={isValidating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sapPort">Port</Label>
                <Input
                  id="sapPort"
                  type="text"
                  placeholder="443"
                  value={sapPort}
                  onChange={(e) => setSapPort(e.target.value)}
                  disabled={isValidating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sapUsername">Username</Label>
                <Input
                  id="sapUsername"
                  type="text"
                  placeholder="XXXXXXX"
                  value={sapUsername}
                  onChange={(e) => setSapUsername(e.target.value)}
                  disabled={isValidating}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="sapPassword">Password</Label>
                <div className="relative">
                  <Input
                    id="sapPassword"
                    type={showSapPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={sapPassword}
                    onChange={(e) => setSapPassword(e.target.value)}
                    disabled={isValidating}
                    className="pr-10 [&::-ms-reveal]:hidden [&::-ms-clear]:hidden"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSapPassword(!showSapPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isValidating}
                  >
                    {showSapPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}
 
          {!["s3", "azure", "onelake", "databricks", "snowflake", "sap"].includes(sourceId) && (
            <div className="text-center py-4 text-muted-foreground">
              Credentials configuration for {sourceName} coming soon.
            </div>
          )}
        </div>
 
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isValidating}>
            Cancel
          </Button>
 
          <Button onClick={handleProceed} disabled={!isFormValid() || isValidating}>
            {isValidating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isValidating ? "Connecting..." : "Connect"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

