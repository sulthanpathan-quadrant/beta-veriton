// import { Routes, Route, Navigate } from "react-router-dom";
// import AutoMLJobs from "./Jobs";
// import CreateJob from "./CreateJob";
// import ModalBuilding from "./ModalBuilding";
// import SelectDataset from "./SelectDataset";
// import BuildModelTab from "../../components/create-job/BuildModelTab"; // Import it
// import CompareTab from "@/components/create-job/CompareTab";
// import AutoMLHub from "./AutoMLHub";
// import TestTab from "@/components/create-job/TestTab";
// import AutoMLJobs1 from "./Jobs1";

// const AutoMLRoutes = () => {
//   return (
//     <Routes>
//       {/* 🔥 DEFAULT: /workflow/automl */}
//       <Route index element={<AutoMLJobs />} />
//       {/* Other AutoML pages */}
//       <Route path="jobs" element={<AutoMLJobs />} />
//       <Route path="jobs1" element={<AutoMLJobs1 />} />
//       <Route path="create-job" element={<CreateJob />} />
//       <Route path="modal-building/:id" element={<ModalBuilding />} />
//       <Route path="build-model" element={<BuildModelTab />} />
//       <Route path="select-dataset" element={<SelectDataset />} />
//       <Route path="automlhub" element={<AutoMLHub />} />
//       <Route path="compare" element={<CompareTab />} />
//       <Route path="test" element={<TestTab/>} />
//       {/* Fallback */}
//       <Route path="*" element={<Navigate to="." replace />} />
//     </Routes>
//   );
// };
 
// export default AutoMLRoutes;
 
import { Routes, Route, Navigate } from "react-router-dom";
import AutoMLJobs from "./Jobs";
import CreateJob from "./CreateJob";
import ModalBuilding from "./ModalBuilding";
import SelectDataset from "./SelectDataset";
import BuildModelTab from "../../components/create-job/BuildModelTab"; // Import it
import CompareTab from "@/components/create-job/CompareTab";
import AutoMLHub from "./AutoMLHub";
import TestTab from "@/components/create-job/TestTab";
import AutoMLJobs1 from "./Jobs1";
 
const AutoMLRoutes = () => {
  return (
    <Routes>
      {/* 🔥 DEFAULT: /workflow/automl */}
      <Route index element={<AutoMLJobs />} />
      {/* Other AutoML pages */}
      <Route path="jobs" element={<AutoMLJobs />} />
      <Route path="jobs1" element={<AutoMLJobs1 />} />
      <Route path="create-job" element={<CreateJob />} />
      <Route path="build-model" element={<BuildModelTab />} />
      <Route path="select-dataset" element={<SelectDataset />} />
      <Route path="automlhub" element={<AutoMLHub />} />
      <Route path="compare" element={<CompareTab />} />
      <Route path="test" element={<TestTab/>} />
      <Route path="modal-building/:buildId" element={<ModalBuilding />} />
      {/* Fallback */}
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
};
 
export default AutoMLRoutes;
 
 
 