//  export interface Job {
//   target?: string;
//   id: string;
//   name: string;
//   category: string;
//   createdAt: Date;
//   lastRun: Date | null;
//   status: 'completed' | 'pending' | 'running' | 'failed';
//   feature: string;
//   model: string;
//   features: string[];
//   datasetName: string;
//   trainAccuracy?: string;
//   testAccuracy?: string;
//   model_id?: string;          
//   task_type?: string;  
//   best_model?: string;      
//   primary_metric?: string;    
//   primary_score?: number;      
//   results?: any[];  
//    veriton_file_path?: string;
// }
 
// export interface TrainTestMetrics {
//   accuracy: string;
//   f1Score: string;
//   precision: string;
//   recall: string;
//   rmse: string;
//   auc: string;
// }
 
 export interface Job {
  target?: string;
  id: string;
  name: string;
  category: string;
  createdAt: Date;
  lastRun: Date | null;
  status: 'completed' | 'pending' | 'running' | 'failed';
  feature: string;
  model: string;
  features: string[];
  datasetName: string;
  trainAccuracy?: string;
  testAccuracy?: string;
  model_id?: string;          
  task_type?: string;  
  best_model?: string;      
  primary_metric?: string;    
  primary_score?: number;      
  results?: any[];  
   veriton_file_path?: string;
   error_message?: string;
}
 
export interface TrainTestMetrics {
  accuracy: string;
  f1Score: string;
  precision: string;
  recall: string;
  rmse: string;
  auc: string;
}
 
 
 
 