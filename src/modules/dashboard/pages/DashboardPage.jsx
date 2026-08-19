import { Alert, Box } from '@mui/material';
import { useAuth } from '../../../contexts/AuthContext';
import AdminDashboard from '../components/AdminDashboard';

export default function DashboardPage() {
  const { user } = useAuth();

  if (user?.perfil === 'ADMIN') {
    return <AdminDashboard user={user} />;
  }

  return (
    <Box>
      <Alert severity="info">
        O dashboard para o perfil <strong>{user?.perfil}</strong> será
        disponibilizado em breve.
      </Alert>
    </Box>
  );
}