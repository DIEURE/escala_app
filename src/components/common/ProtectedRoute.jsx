import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import LoadingScreen from './LoadingScreen';

export default function ProtectedRoute() {
  const { authenticated, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <LoadingScreen />;
  }

  return authenticated ? <Outlet /> : <Navigate to="/login" replace />;
}