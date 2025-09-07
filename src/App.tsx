import React, { Suspense } from 'react';
import LoginPage from './components/LoginPage';
import { useAuth } from './hooks/useAuth';
const AuthedApp = React.lazy(() => import('./AuthedApp'));

function App() {
  const { authenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-neutral-100">
        <div className="w-6 h-6 border-2 border-neutral-700 border-t-[#4ECBD9] rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) {
    return <LoginPage />;
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-neutral-900 text-neutral-100">
        <div className="w-6 h-6 border-2 border-neutral-700 border-t-[#4ECBD9] rounded-full animate-spin" />
      </div>
    }>
      <AuthedApp />
    </Suspense>
  );
}

export default App;