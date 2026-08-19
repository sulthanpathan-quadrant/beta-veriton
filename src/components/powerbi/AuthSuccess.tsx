// import { useEffect } from 'react';

// export function AuthSuccess() {
//   useEffect(() => {
//     // Signal to the parent window that auth succeeded
//     localStorage.setItem('pbi_auth_success', 'true');
//     window.close();
//   }, []);

//   return (
//     <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
//       <p style={{ color: '#555', fontSize: '0.9rem' }}>Authentication successful. Closing...</p>
//     </div>
//   );
// }


import { useEffect } from 'react';

export function AuthSuccess() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const userEmail = params.get('user_email');

    if (accessToken) {
      localStorage.setItem('pbi_access_token', accessToken);
      if (userEmail) {
        localStorage.setItem('pbi_user_email', userEmail);
      }
      sessionStorage.setItem('pbi_auth_time', Date.now().toString());
    }

    // Clean URL
    window.history.replaceState({}, document.title, '/workflow/powerbi-flow');
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