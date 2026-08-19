// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
// import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination";
// import { Button } from "@/components/ui/button";
// import { Loader2, X } from "lucide-react";
 
// interface SchemaPreviewDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   fileName: string;
//   previewData?: any;     // Real data from API
//   loading?: boolean;    // Loading state
// }
 
// export function SchemaPreviewDialog({
//   open,
//   onOpenChange,
//   fileName,
//   previewData,
//   loading = false
// }: SchemaPreviewDialogProps) {
 
//   // Handle different possible response formats
//   const getTableData = () => {
//     if (loading) {
//       return { columns: [], rows: [] };
//     }
 
//     if (!previewData) {
//       return { columns: [], rows: [] };
//     }
 
//     if (previewData.error) {
//       return { columns: ["Message"], rows: [[previewData.error]] };
//     }
 
//     // Assume previewData is an array of objects (common for CSV/Parquet preview)
//     if (Array.isArray(previewData) && previewData.length > 0) {
//       const firstRow = previewData[0];
//       const columns = Object.keys(firstRow);
//       const rows = previewData.map(row => columns.map(col => row[col]));
//       return { columns, rows };
//     }
 
//     // Fallback: if it's an object with data array
//     if (previewData.data && Array.isArray(previewData.data) && previewData.data.length > 0) {
//       const firstRow = previewData.data[0];
//       const columns = Object.keys(firstRow);
//       const rows = previewData.data.map((row: any) => columns.map(col => row[col]));
//       return { columns, rows };
//     }
 
//     // If no structured data
//     return { columns: ["Info"], rows: [["No preview available"]] };
//   };
 
//   const { columns, rows } = getTableData();
 
//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto bg-card border-2 border-border">
       
//       <div className="flex justify-between">
//       <DialogHeader>
//           <DialogTitle className="text-xl">Schema Preview: {fileName}</DialogTitle>
//         </DialogHeader>
//       <Button variant="link" size="icon" onClick={() => onOpenChange(false)}>
//                 <X className="h-5 w-5" />
//               </Button>
         
//       </div>
         
 
//         <div className="mt-4">
//           {loading ? (
//             <div className="flex flex-col items-center justify-center py-16">
//               <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
//               <p className="text-muted-foreground">Loading preview...</p>
//             </div>
//           ) : rows.length === 0 ? (
//             <div className="text-center py-16 text-muted-foreground">
//               No preview data available
//             </div>
//           ) : (
//             <div className="border border-border rounded-lg overflow-hidden">
//               <div className="overflow-x-auto">
//                 <Table>
//                   <TableHeader>
//                     <TableRow>
//                       {columns.map((col) => (
//                         <TableHead key={col}>{col}</TableHead>
//                       ))}
//                     </TableRow>
//                   </TableHeader>
//                   <TableBody>
//                     {rows.slice(0, 10).map((row, rowIndex) => (  // Show first 10 rows
//                       <TableRow key={rowIndex}>
//                         {row.map((cell: any, cellIndex: number) => (
//                           <TableCell key={cellIndex}>
//                             {cell === null || cell === undefined ? "-" : String(cell)}
//                           </TableCell>
//                         ))}
//                       </TableRow>
//                     ))}
//                   </TableBody>
//                 </Table>
//               </div>
//               {rows.length > 10 && (
//                 <div className="p-4 text-center text-sm text-muted-foreground border-t">
//                   Showing first 10 rows of {rows.length}
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
 
//         {/* Optional Pagination (kept for consistency with original design) */}
//         {/* <div className="mt-6">
//           <Pagination>
//             <PaginationContent>
//               <PaginationItem>
//                 <PaginationPrevious href="#" />
//               </PaginationItem>
//               <PaginationItem>
//                 <PaginationLink href="#" isActive>1</PaginationLink>
//               </PaginationItem>
//               <PaginationItem>
//                 <PaginationLink href="#">2</PaginationLink>
//               </PaginationItem>
//               <PaginationItem>
//                 <PaginationEllipsis />
//               </PaginationItem>
//               <PaginationItem>
//                 <PaginationNext href="#" />
//               </PaginationItem>
//             </PaginationContent>
//           </Pagination>
//         </div> */}
//       </DialogContent>
//     </Dialog>
//   );
// }
 


 
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils"; // Make sure this import exists
 
interface SchemaPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  previewData?: any;     // Real data from API
  loading?: boolean;    // Loading state
}
 
export function SchemaPreviewDialog({
  open,
  onOpenChange,
  fileName,
  previewData,
  loading = false
}: SchemaPreviewDialogProps) {
 
  // Handle different possible response formats
  const getTableData = () => {
    if (loading) {
      return { columns: [], rows: [] };
    }
 
    if (!previewData) {
      return { columns: [], rows: [] };
    }
 
    if (previewData.error) {
      return { columns: ["Message"], rows: [[previewData.error]] };
    }
 
    // Assume previewData is an array of objects (common for CSV/Parquet preview)
    if (Array.isArray(previewData) && previewData.length > 0) {
      const firstRow = previewData[0];
      const columns = Object.keys(firstRow);
      const rows = previewData.map(row => columns.map(col => row[col]));
      return { columns, rows };
    }
 
    // Fallback: if it's an object with data array
    if (previewData.data && Array.isArray(previewData.data) && previewData.data.length > 0) {
      const firstRow = previewData.data[0];
      const columns = Object.keys(firstRow);
      const rows = previewData.data.map((row: any) => columns.map(col => row[col]));
      return { columns, rows };
    }
 
    // If no structured data
    return { columns: ["Info"], rows: [["No preview available"]] };
  };
 
  const { columns, rows } = getTableData();
 
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "max-w-4xl max-h-[85vh] p-0 gap-0 bg-card border-2 border-border",
          "flex flex-col overflow-hidden" // Important: prevent default overflow
        )}
      >
        {/* Fixed Sticky Header - stays visible on scroll */}
        <div
          className={cn(
            "sticky top-0 z-50",                      // z-50 ensures it's above table content
            "bg-card border-b border-border shadow-sm",
            "px-6 py-4 flex items-center justify-between"
          )}
        >
          <DialogHeader className="m-0 p-0">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Schema Preview: {fileName}
            </DialogTitle>
          </DialogHeader>
 
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-muted/80 transition-colors"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
 
        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto overflow-x-auto px-6 pb-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center min-h-[50vh]">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
              <p className="text-muted-foreground">Loading preview...</p>
            </div>
          ) : rows.length === 0 ? (
            <div className="flex items-center justify-center min-h-[50vh] text-muted-foreground">
              No preview data available
            </div>
          ) : (
            <div className="mt-6 border border-border rounded-lg overflow-hidden bg-card">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-muted/40 sticky top-0 z-10">
                    <TableRow>
                      {columns.map((col) => (
                        <TableHead
                          key={col}
                          className="whitespace-nowrap px-4 py-3 font-medium"
                        >
                          {col}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 10).map((row, rowIndex) => (
                      <TableRow key={rowIndex} className="hover:bg-muted/50 transition-colors">
                        {row.map((cell: any, cellIndex: number) => (
                          <TableCell key={cellIndex} className="px-4 py-3">
                            {cell === null || cell === undefined ? "-" : String(cell)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
 
              {rows.length > 10 && (
                <div className="p-4 text-center text-sm text-muted-foreground border-t bg-muted/20">
                  Showing first 10 rows of {rows.length} total rows
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
 