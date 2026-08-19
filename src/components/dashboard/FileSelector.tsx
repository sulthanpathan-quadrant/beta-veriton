
 import { DataFile } from '@/components/types/dashboard';
import { FileText, Table, FileJson } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileSelectorProps {
  files: DataFile[];
  selectedFile: DataFile | null;
  onSelectFile: (file: DataFile) => void;
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

export function FileSelector({ files, selectedFile, onSelectFile }: FileSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {files.map((file) => {
        const Icon = fileIcons[file.type];
        const iconColor = fileColors[file.type];
        const isSelected = selectedFile?.id === file.id;
        
        return (
          <div
            key={file.id}
            onClick={() => onSelectFile(file)}
            className={cn(
              'group relative rounded-xl border p-3 transition-all duration-200 cursor-pointer',
              'border-border hover:border-primary/50 hover:bg-primary/5',
              isSelected && 'border-primary bg-primary/10 ring-1 ring-primary/30'
            )}
          >
            {/* File Icon & Info */}
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200',
                isSelected ? 'bg-primary/20' : 'bg-secondary/50 group-hover:bg-primary/10'
              )}>
                <Icon className={cn('w-4 h-4', iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <span className="font-medium text-foreground block truncate text-sm">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {file.rows.toLocaleString()} rows
                </span>
              </div>
              {isSelected && (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}