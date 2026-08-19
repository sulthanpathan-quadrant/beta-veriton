// import { ArrowLeft, ExternalLink } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { useState, useEffect, useRef } from 'react';

// interface PowerBIMicrosoftLoginProps {
//   onBack: () => void;
//   onSignInWithMicrosoft: () => void;
// }

// export function PowerBIMicrosoftLogin({
//   onBack,
//   onSignInWithMicrosoft,
// }: PowerBIMicrosoftLoginProps) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [isWaiting, setIsWaiting] = useState(false);
//   const [errorMsg, setErrorMsg] = useState<string | null>(null);

//   const popupRef = useRef<Window | null>(null);
//   const watcherRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const stopWatching = () => {
//     if (watcherRef.current) clearInterval(watcherRef.current);
//     if (timeoutRef.current) clearTimeout(timeoutRef.current);
//     watcherRef.current = null;
//     timeoutRef.current = null;
//     setIsWaiting(false);
//     setIsLoading(false);
//   };

//   const openLoginPopup = () => {
//     // Clear any previous success flag
//     localStorage.removeItem('pbi_auth_success');

//     const width = 460;
//     const height = 400;
//     const left = window.screenX + (window.outerWidth - width) / 2;
//     const top = window.screenY + (window.outerHeight - height) / 2 - 40;

//     const popup = window.open(
//       'https://api.veriton.ai/api/service4/auth/login',
//       'MicrosoftLogin',
//       `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`,
//     );

//     if (!popup || popup.closed || typeof popup.closed === 'undefined') {
//       setErrorMsg('Popup was blocked. Please allow popups for this site and try again.');
//       setIsLoading(false);
//       return;
//     }

//     popupRef.current = popup;
//     setIsWaiting(true);
//     setErrorMsg(null);

//     // Hard timeout — 3 minutes
//     timeoutRef.current = setTimeout(() => {
//       stopWatching();
//       setErrorMsg('Sign-in timed out. Please try again.');
//     }, 180_000);

//     // Check every 500ms:
//     // - if localStorage flag is set → auth succeeded → go to workspaces
//     // - if popup closed WITHOUT flag → user closed it manually → show error
//     watcherRef.current = setInterval(() => {
//       const succeeded = localStorage.getItem('pbi_auth_success') === 'true';

//       if (succeeded) {
//         localStorage.removeItem('pbi_auth_success');
//         stopWatching();
//         sessionStorage.setItem('pbi_auth_time', Date.now().toString());
//         onSignInWithMicrosoft(); // ✅ go to workspaces
//         return;
//       }

//       if (popupRef.current?.closed) {
//         // Popup closed but no success flag — user closed manually
//         stopWatching();
//         setErrorMsg('Sign-in window was closed. Please try again.');
//       }
//     }, 500);
//   };

//   const handleSignInClick = () => {
//     setIsLoading(true);
//     setErrorMsg(null);
//     openLoginPopup();
//   };

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => stopWatching();
//   }, []);

//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       <div className="pt-28 flex items-center justify-center">
//         <div className="w-full max-w-md">
//           <div className="bg-card border border-border rounded-2xl p-10 shadow-sm space-y-6 text-center">

//             <div className="space-y-2">
//               <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
//                 Welcome
//               </h2>
//               <p className="text-muted-foreground text-sm">Sign in to continue to ReportFlow</p>
//             </div>

//             {isWaiting ? (
//               <div className="space-y-6 py-4">
//                 <p className="text-base font-medium text-foreground">
//                   Waiting for sign-in...
//                 </p>
//                 <div className="flex justify-center gap-2">
//                   <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
//                   <div className="h-3 w-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
//                   <div className="h-3 w-3 bg-primary rounded-full animate-bounce" />
//                 </div>
//                 <p className="text-xs text-muted-foreground">
//                   Complete sign-in in the opened window
//                 </p>
//                 <Button
//                   variant="outline"
//                   onClick={() => {
//                     stopWatching();
//                     if (popupRef.current && !popupRef.current.closed) {
//                       popupRef.current.close();
//                     }
//                     setErrorMsg(null);
//                   }}
//                   className="gap-2"
//                 >
//                   <ArrowLeft className="h-4 w-4" />
//                   Cancel
//                 </Button>
//               </div>
//             ) : (
//               <Button
//                 onClick={handleSignInClick}
//                 disabled={isLoading}
//                 className="w-full h-12 rounded-lg bg-[#2f5496] hover:bg-[#2b4b88] text-white text-base font-semibold gap-3"
//               >
//                 <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
//                   <rect x="1" y="1" width="9" height="9" fill="#F25022" />
//                   <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
//                   <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
//                   <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
//                 </svg>
//                 {isLoading ? 'Opening...' : 'Sign in with Microsoft'}
//                 {!isLoading && <ExternalLink className="w-4 h-4" />}
//               </Button>
//             )}

//             {errorMsg && (
//               <p className="text-sm text-destructive pt-2">{errorMsg}</p>
//             )}

//             <p className="text-xs text-muted-foreground pt-4">
//               By signing in, you agree to our{' '}
//               <span className="underline cursor-pointer hover:text-foreground">Terms of Service</span>
//               {' '}and{' '}
//               <span className="underline cursor-pointer hover:text-foreground">Privacy Policy</span>.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const API_BASE = 'https://api.veriton.ai/api/service4';

interface PowerBIMicrosoftLoginProps {
  onBack: () => void;
  onSignInWithMicrosoft: () => void;
}

export function PowerBIMicrosoftLogin({
  onBack,
  onSignInWithMicrosoft,
}: PowerBIMicrosoftLoginProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSignInClick = async () => {
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) throw new Error('Failed to get login URL');

      const data = await res.json();
      const loginUrl = data.login_url;

      if (!loginUrl) throw new Error('No login URL received');

      // Full page redirect - Clean & Reliable
      window.location.href = loginUrl;
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to start sign-in');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="pt-28 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-2xl p-10 shadow-sm space-y-6 text-center">

            <div className="space-y-2">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Welcome
              </h2>
              <p className="text-muted-foreground text-sm">
                Sign in with Microsoft to continue to Power BI ReportFlow
              </p>
            </div>

            <Button
              onClick={handleSignInClick}
              disabled={isLoading}
              className="w-full h-12 rounded-lg bg-[#2f5496] hover:bg-[#2b4b88] text-white text-base font-semibold gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 21 21" fill="none">
                <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
              </svg>
              {isLoading ? 'Redirecting to Microsoft...' : 'Sign in with Microsoft'}
              {!isLoading && <ExternalLink className="w-4 h-4" />}
            </Button>

            {errorMsg && (
              <p className="text-sm text-destructive pt-2">{errorMsg}</p>
            )}

            <p className="text-xs text-muted-foreground pt-4">
              By signing in, you agree to our{' '}
              <span className="underline cursor-pointer hover:text-foreground">Terms of Service</span>
              {' '}and{' '}
              <span className="underline cursor-pointer hover:text-foreground">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}