// import { Toaster } from "@/components/ui/toaster";
// import { Toaster as Sonner } from "@/components/ui/sonner";
// import { TooltipProvider } from "@/components/ui/tooltip";
// import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
// import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
// import Index from "./pages/Index";
// import LearnMore from "./pages/LearnMore";
// import Auth from "./pages/Auth";
// import Jobs from "./pages/Jobs";
// import JobDetails from "./pages/JobDetails";
// import EditJob from "./pages/EditJob";
// import Pipelines from "./pages/Pipelines";
// import CreatePipeline from "./pages/CreatePipeline";
// import ScheduleJob from "./pages/ScheduleJob";
// import DataIngestion from "./pages/DataIngestion";
// import LandingZone from "./pages/LandingZone";
// import DataModeling from "./pages/DataModeling";
// import DataPreview from "./pages/DataPreview";
// import DataCreation from "./pages/DataCreation";
// import DataQuality from "./pages/DataQuality";
// import PathSelection1 from './pages/PathSelection1'
// import NER from "./pages/NER";
// import BusinessLogic from "./pages/BusinessLogic";
// import PathSelection from "./pages/PathSelection";
// import ETLOutput from "./pages/ETLOutput";
// import PowerBIDashboard from "./pages/PowerBIDashboard";
// import AutoMLDashboard from "./pages/AutoMLDashboard";
// import NotFound from "./pages/NotFound";
// import { ThemeProvider } from "@/components/ThemeProvider";
// import '@xyflow/react/dist/style.css';
// import DatasetTab from "./components/DatasetTab";
// import ETLOutput1 from "./pages/ETLOutput1"
// import AutoMLRoutes from "./pages/AutoML/AutomlRoutes";
// import { AuthProvider } from "./components/contexts/AuthContext";
// import { JobsProvider } from "./components/contexts/JobsContext";
// import { ChatProvider } from "./components/contexts/ChatContext";
// import PowerBIDashboard1 from "./pages/PowerBIDashboard1"
// import PowerBIPage from "./pages/PowerBIPage";
 
// // Protected Route Wrapper
// const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
//   const user = localStorage.getItem("user");
//   if (!user) {
//     return <Navigate to="/auth" replace />;
//   }
//   return children;
// };
 
// // Force dark mode wrapper for landing pages
// const LandingLayout = ({ children }: { children: React.ReactNode }) => (
//   <div className="forced-dark">
//     {children}
//   </div>
// );
 
// const queryClient = new QueryClient();
 
// const App = () => (
//   <QueryClientProvider client={queryClient}>
//     <AuthProvider>
//       <JobsProvider>
//         <ChatProvider>
//           <ThemeProvider
//             attribute="class"
//             defaultTheme="system"
//             enableSystem
//             disableTransitionOnChange
//           >
//             <BrowserRouter>
//               {/* ✅ MOVE TOASTER HERE - OUTSIDE ALL ROUTES */}
//               <Toaster />
//               <Sonner />
             
//               <Routes>
//                 {/* Public landing pages - always dark, no protection */}
//                 <Route
//                   path="/"
//                   element={
//                     <LandingLayout>
//                       <Index />
//                     </LandingLayout>
//                   }
//                 />
//                 <Route
//                   path="/learn-more"
//                   element={
//                     <LandingLayout>
//                       <LearnMore />
//                     </LandingLayout>
//                   }
//                 />
 
//                 {/* Public auth page - NOW HAS ACCESS TO TOASTER */}
//                 <Route path="/auth" element={<Auth />} />
 
//                 {/* All protected dashboard/workflow routes */}
//                 <Route
//                   path="/*"
//                   element={
//                     <TooltipProvider>
//                       <Routes>
//                         <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
//                         <Route path="/datasets" element={<ProtectedRoute><DatasetTab/></ProtectedRoute>} />
//                         <Route path="/workflow/etl-output1" element={<ProtectedRoute><ETLOutput1 /></ProtectedRoute>}/>

//                         {/* <Route path="/worlflow/powerbi-flow" element={<ProtectedRoute><PowerBIPage/></ProtectedRoute>} /> */}

//                         <Route path="/PowerBIDashboard1" element={<ProtectedRoute><PowerBIDashboard1/></ProtectedRoute>}/>
//                         <Route path="/job-details/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
//                         <Route path="/edit-job/:id" element={<ProtectedRoute><EditJob /></ProtectedRoute>} />
//                         <Route path="/pipelines" element={<ProtectedRoute><Pipelines /></ProtectedRoute>} />
//                         <Route path="/create-pipeline" element={<ProtectedRoute><CreatePipeline /></ProtectedRoute>} />
//                         <Route path="/edit-pipeline/:id" element={<ProtectedRoute><CreatePipeline /></ProtectedRoute>} />
//                         <Route path="/schedule-job" element={<ProtectedRoute><ScheduleJob /></ProtectedRoute>} />
//                         <Route path="/workflow/data-ingestion" element={<ProtectedRoute><DataIngestion /></ProtectedRoute>} />
//                         <Route path="/workflow/landing-zone" element={<ProtectedRoute><LandingZone /></ProtectedRoute>} />
//                         <Route path="/workflow/data-modeling" element={<ProtectedRoute><DataModeling /></ProtectedRoute>} />
//                         <Route path="/workflow/data-preview" element={<ProtectedRoute><DataPreview /></ProtectedRoute>} />
//                         <Route path="/workflow/data-creation" element={<ProtectedRoute><DataCreation /></ProtectedRoute>} />
//                         <Route path="/workflow/data-quality" element={<ProtectedRoute><DataQuality /></ProtectedRoute>} />
//                         <Route path="/workflow/ner" element={<ProtectedRoute><NER /></ProtectedRoute>} />
//                         <Route path="/workflow/business-logic" element={<ProtectedRoute><BusinessLogic /></ProtectedRoute>} />
//                         <Route path="/workflow/path-selection" element={<ProtectedRoute><PathSelection /></ProtectedRoute>} />
//                         <Route path="PathSelection1" element={<ProtectedRoute><PathSelection1/></ProtectedRoute>} />
//                         <Route path="/workflow/etl-output" element={<ProtectedRoute><ETLOutput /></ProtectedRoute>} />
//                         <Route path="/workflow/powerbi-dashboard" element={<ProtectedRoute><PowerBIDashboard /></ProtectedRoute>} />
//                         <Route path="/workflow/automl-dashboard" element={<ProtectedRoute><AutoMLDashboard /></ProtectedRoute>} />
 

//                         <Route path="/workflow/powerbi-flow" element={<ProtectedRoute><PowerBIPage /></ProtectedRoute>}/>

//                         <Route path="workflow/automl/*"  element={
//                           <ProtectedRoute>
//                             <AutoMLRoutes />
//                           </ProtectedRoute>
//                         }
//                         />
//                         {/* Catch-all for 404 */}
//                         <Route path="*" element={<NotFound />} />
//                       </Routes>
//                     </TooltipProvider>
//                   }
//                 />
//               </Routes>
//             </BrowserRouter>
//           </ThemeProvider>
//         </ChatProvider>
//       </JobsProvider>
//     </AuthProvider>
//   </QueryClientProvider>
// );

// export default App;
 
 
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import LearnMore from "./pages/LearnMore";
import Auth from "./pages/Auth";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import EditJob from "./pages/EditJob";
import Pipelines from "./pages/Pipelines";
import CreatePipeline from "./pages/CreatePipeline";
import ScheduleJob from "./pages/ScheduleJob";
import DataIngestion from "./pages/DataIngestion";
import LandingZone from "./pages/LandingZone";
import DataModeling from "./pages/DataModeling";
import DataPreview from "./pages/DataPreview";
import DataCreation from "./pages/DataCreation";
import DataQuality from "./pages/DataQuality";
import PathSelection1 from './pages/PathSelection1';
import NER from "./pages/NER";
import BusinessLogic from "./pages/BusinessLogic";
import PathSelection from "./pages/PathSelection";
import ETLOutput from "./pages/ETLOutput";
import PowerBIDashboard from "./pages/PowerBIDashboard";
import AutoMLDashboard from "./pages/AutoMLDashboard";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "@/components/ThemeProvider";
import '@xyflow/react/dist/style.css';
import DatasetTab from "./components/DatasetTab";
import ETLOutput1 from "./pages/ETLOutput1";
import AutoMLRoutes from "./pages/AutoML/AutomlRoutes";
import { AuthProvider } from "./components/contexts/AuthContext";
import { JobsProvider } from "./components/contexts/JobsContext";
import { ChatProvider } from "./components/contexts/ChatContext";
import PowerBIDashboard1 from "./pages/PowerBIDashboard1";
import PowerBIPage from "./pages/PowerBIPage";
import Chatbot from "./components/chatbot/Chatbot";
import VeritonChatBot from "./pages/VeritonChatBot";

// ── Inline AuthSuccess — no separate file needed ──────────────────────────────
// The OAuth popup redirects here → sets flag → closes itself
// PowerBIMicrosoftLogin detects the flag and proceeds to workspaces
// function AuthSuccess() {
//   useEffect(() => {
//     localStorage.setItem('pbi_auth_success', 'true');
//     window.close();
//   }, []);
//   return (
//     <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', fontFamily:'sans-serif' }}>
//       <p style={{ color:'#555', fontSize:'0.9rem' }}>Authentication successful. Closing...</p>
//     </div>
//   );
// }

function AuthSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const userEmail = params.get('user_email');

    if (accessToken) {
      // Save token — apiFetch in PowerBIFlow reads this for every request
      localStorage.setItem('pbi_access_token', accessToken);
      if (userEmail) {
        localStorage.setItem('pbi_user_email', userEmail);
      }
      // Timestamp used by PowerBIFlow to skip login for 1 hour
      sessionStorage.setItem('pbi_auth_time', Date.now().toString());
    }

    // Redirect back into the app — PowerBIFlow's useEffect will detect
    // the token and jump straight to the workspaces step
    window.location.replace('/workflow/powerbi-flow');
  }, []);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      fontFamily: 'sans-serif',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <p style={{ color: '#555', fontSize: '0.9rem' }}>
        Authentication successful. Redirecting...
      </p>
    </div>
  );
}



const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const user = localStorage.getItem("user");
  if (!user) return <Navigate to="/auth" replace />;
  return children;
};

const LandingLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="forced-dark">{children}</div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <JobsProvider>
        <ChatProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <BrowserRouter>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<LandingLayout><Index /></LandingLayout>} />
                <Route path="/learn-more" element={<LandingLayout><LearnMore /></LandingLayout>} />
                <Route path="/auth" element={<Auth />} />

                {/* ✅ OAuth popup lands here — MUST be outside ProtectedRoute */}
                <Route path="/auth/success" element={<AuthSuccess />} />

                <Route path="/*" element={
                  <TooltipProvider>
                    <Routes>
                      <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
                      <Route path="/datasets" element={<ProtectedRoute><DatasetTab /></ProtectedRoute>} />
                      <Route path="/workflow/etl-output1" element={<ProtectedRoute><ETLOutput1 /></ProtectedRoute>} />
                      <Route path="/PowerBIDashboard1" element={<ProtectedRoute><PowerBIDashboard1 /></ProtectedRoute>} />
                      <Route path="/job-details/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
                      <Route path="/edit-job/:id" element={<ProtectedRoute><EditJob /></ProtectedRoute>} />
                      <Route path="/pipelines" element={<ProtectedRoute><Pipelines /></ProtectedRoute>} />
                      <Route path="/create-pipeline" element={<ProtectedRoute><CreatePipeline /></ProtectedRoute>} />
                      <Route path="/edit-pipeline/:id" element={<ProtectedRoute><CreatePipeline /></ProtectedRoute>} />
                      <Route path="/schedule-job" element={<ProtectedRoute><ScheduleJob /></ProtectedRoute>} />
                      <Route path="/workflow/data-ingestion" element={<ProtectedRoute><DataIngestion /></ProtectedRoute>} />
                      <Route path="/workflow/landing-zone" element={<ProtectedRoute><LandingZone /></ProtectedRoute>} />
                      <Route path="/workflow/data-modeling" element={<ProtectedRoute><DataModeling /></ProtectedRoute>} />
                      <Route path="/workflow/data-preview" element={<ProtectedRoute><DataPreview /></ProtectedRoute>} />
                      <Route path="/workflow/data-creation" element={<ProtectedRoute><DataCreation /></ProtectedRoute>} />
                      <Route path="/workflow/data-quality" element={<ProtectedRoute><DataQuality /></ProtectedRoute>} />
                      <Route path="/workflow/ner" element={<ProtectedRoute><NER /></ProtectedRoute>} />
                      <Route path="/workflow/business-logic" element={<ProtectedRoute><BusinessLogic /></ProtectedRoute>} />
                      <Route path="/workflow/path-selection" element={<ProtectedRoute><PathSelection /></ProtectedRoute>} />
                      <Route path="PathSelection1" element={<ProtectedRoute><PathSelection1 /></ProtectedRoute>} />
                      <Route path="/workflow/etl-output" element={<ProtectedRoute><ETLOutput /></ProtectedRoute>} />
                      <Route path="/workflow/powerbi-dashboard" element={<ProtectedRoute><PowerBIDashboard /></ProtectedRoute>} />
                      <Route path="/workflow/automl-dashboard" element={<ProtectedRoute><AutoMLDashboard /></ProtectedRoute>} />
                      <Route path="/workflow/powerbi-flow" element={<ProtectedRoute><PowerBIPage /></ProtectedRoute>} />
                      <Route path="workflow/automl/*" element={<ProtectedRoute><AutoMLRoutes /></ProtectedRoute>} />
                      
                      <Route path="/workflow/chatbot" element={<ProtectedRoute><VeritonChatBot /></ProtectedRoute>} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </TooltipProvider>
                } />
              </Routes>
            </BrowserRouter>
          </ThemeProvider>
        </ChatProvider>
      </JobsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
