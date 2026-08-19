// import { useState } from 'react';
// import { DataFile } from '@/components/types/dashboard';
// import { FileText, Table, FileJson, Search, Loader2 } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { Input } from '@/components/ui/input';

// interface DatasetSidebarProps {
//   files: DataFile[];
//   selectedFile: DataFile | null;
//   onSelectFile: (file: DataFile) => void;
//   loading?: boolean;
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

// export function DatasetSidebar({ files, selectedFile, onSelectFile, loading = false }: DatasetSidebarProps) {
//   const [searchQuery, setSearchQuery] = useState('');
  
//   const filteredFiles = files.filter(file => 
//     file.name.toLowerCase().includes(searchQuery.toLowerCase())
//   );

//   return (
//     <div className="w-72 h-full border-r border-border bg-card/50 flex flex-col shrink-0">
//       <div className="p-3">
//         <div className="relative">
//           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
//           <Input
//             value={searchQuery}
//             onChange={(e) => setSearchQuery(e.target.value)}
//             placeholder={`Search ${files.length} datasets...`}
//             className="pl-9 h-10 bg-secondary/50 border-border focus:border-primary"
//             disabled={loading}
//           />
//         </div>
//       </div>

//       <ScrollArea className="flex-1">
//         <div className="p-2 space-y-1">
//           {loading ? (
//             <div className="flex items-center justify-center py-10">
//               <Loader2 className="w-8 h-8 animate-spin text-primary" />
//               <span className="ml-3 text-muted-foreground">Loading datasets...</span>
//             </div>
//           ) : filteredFiles.length === 0 ? (
//             <div className="text-center py-10 text-muted-foreground">
//               {files.length === 0 ? "No datasets available" : "No datasets match your search"}
//             </div>
//           ) : (
//             filteredFiles.map((file) => {
//               const Icon = fileIcons[file.type] || FileText;
//               const iconColor = fileColors[file.type] || 'text-muted-foreground';
//               const isSelected = selectedFile?.id === file.id;
              
//               return (
//                 <button
//                   key={file.id}
//                   onClick={() => onSelectFile(file)}
//                   className={cn(
//                     'w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left',
//                     'hover:bg-secondary/50',
//                     isSelected && 'bg-primary/10 border border-primary/30'
//                   )}
//                 >
//                   <div className={cn(
//                     'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200',
//                     isSelected ? 'bg-primary/20' : 'bg-secondary/50'
//                   )}>
//                     <Icon className={cn('w-4 h-4', iconColor)} />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <p className={cn(
//                       'text-sm font-medium truncate',
//                       isSelected ? 'text-foreground' : 'text-muted-foreground'
//                     )}>
//                       {file.name}
//                     </p>
//                     <p className="text-xs text-muted-foreground">
//                       Modified: {file.dateModified || 'Unknown'}
//                     </p>
//                   </div>
//                   {isSelected && (
//                     <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
//                   )}
//                 </button>
//               );
//             })
//           )}
//         </div>
//       </ScrollArea>
//     </div>
//   );
// }

// DatasetSidebar 
 





import { useState } from 'react';
import { DataFile } from '@/components/types/dashboard';
import { FileText, Table, FileJson, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
 
interface DatasetSidebarProps {
  files: DataFile[];
  selectedFile: DataFile | null;
  onSelectFile: (file: DataFile) => void;
  loading?: boolean;
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
 
export function DatasetSidebar({ files, selectedFile, onSelectFile, loading = false }: DatasetSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
 
  const filteredFiles = files.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
 
  return (
    <div className="w-72 h-full border-r border-border  flex flex-col shrink-0">
      <div className="p-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${files.length} datasets...`}
            className="pl-9 h-10 bg-primary/25 border-border "
            disabled={loading}
          />
        </div>
      </div>
 
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Loading datasets...</span>
            </div>
          ) : filteredFiles.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {files.length === 0 ? "No datasets available" : "No datasets match your search"}
            </div>
          ) : (
            filteredFiles.map((file) => {
              const Icon = fileIcons[file.type] || FileText;
              const iconColor = fileColors[file.type] || 'text-muted-foreground';
              const isSelected = selectedFile?.id === file.id;
             
              return (
                <button
                  key={file.id}
                  onClick={() => onSelectFile(file)}
                  className={cn(
                    'w-full border-primary flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left',
                    'hover:bg-primary/25 border-primary'  ,
                    isSelected && 'bg-primary/25 border border-primary'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200',
                    isSelected ? 'bg-primary/25' : 'bg-primary/15 '
                  )}>
                    <Icon className={cn('w-4 h-4', iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm font-medium truncate',
                      isSelected ? 'text-foreground' : 'text-muted-foreground'
                    )}>
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Modified: {file.dateModified || 'Unknown'}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
 