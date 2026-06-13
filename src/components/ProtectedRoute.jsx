import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export function ProtectedRoute({ children }) {
  const location = useLocation();
  const { loading, session } = useAuth();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-zinc-50 text-sm font-medium text-zinc-500">
        Loading Fusion OS...
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
