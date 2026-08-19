// import { PowerBIFlow } from '@/components/powerbi/PowerBIFlow';
// import { useNavigate } from 'react-router-dom';

// const PowerBIPage = () => {
//   const navigate = useNavigate();

//   return (
//     <PowerBIFlow
//       fileName="Dashboard Report"
//       onBack={() => navigate('/')}
//     />
//   );
// };

// export default PowerBIPage;

// pages/PowerBIPage.tsx
import { PowerBIFlow } from '@/components/powerbi/PowerBIFlow';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PowerBIPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const from = searchParams.get('from') || 'unknown';

  const smartBack = () => {
    // if (from === 'analysis') {
    //   navigate('/workflow/powerbi-dashboard', { replace: true });
    //   // or: navigate(-1);   ← usually works, but replace is safer here
    // } else if (from === 'analysis1') {
    //   navigate('/PowerBIDashboard1', { replace: true });
    // } else {
    //   navigate('/', { replace: true });           // fallback
    // }
    navigate(-1);
  };

  return (
    <PowerBIFlow
      fileName="Dashboard Report"
      onBack={smartBack}           // ← this is the important change
    />
  );
};

export default PowerBIPage;
