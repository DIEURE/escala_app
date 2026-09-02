import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import LoadingScreen from '../components/common/LoadingScreen';
import ProtectedRoute from '../components/common/ProtectedRoute';
import AdminLayout from '../components/layout/AdminLayout';

import LoginPage from '../modules/auth/pages/LoginPage';
import DashboardPage from '../modules/dashboard/pages/DashboardPage';

/*CADASTROS*/
import DepartamentosPage from '../modules/departamentos/pages/DepartamentosPage';
import UsuariosPage from '../modules/usuarios/pages/UsuariosPage';
import InstrumentosPage from '../modules/instrumentos/pages/InstrumentosPage';

import AgendaMensalPage from '../modules/agenda-mensal/pages/AgendaMensalPage';
import EscalasPage from '../modules/escalas/pages/EscalasPage';
import PlaylistPage from '../modules/playlist/pages/PlaylistPage';
import MusicasPage from '../modules/musicas/pages/MusicasPage';
import MinhasEscalasPage from '../modules/escalas/pages/MinhasEscalasPage';
import PlaylistConfigPage from '../modules/configuracoes/playlist/pages/PlaylistConfigPage';
import PlaylistsSalvasPage from '../modules/playlist/pages/PlaylistsSalvasPage';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ptBR from 'date-fns/locale/pt-BR';

function HomeRedirect() {
  const { authenticated, loadingAuth } = useAuth();

  if (loadingAuth) {
    return <LoadingScreen />;
  }

  return (
    <Navigate
      to={authenticated ? '/dashboard' : '/login'}
      replace
    />
  );
}

export default function App() {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ptBR}>
      <Routes>
        <Route path="/" element={<HomeRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/departamentos" element={<DepartamentosPage />} />
            <Route path="/instrumentos" element={<InstrumentosPage />} />
            <Route path="/usuarios" element={<UsuariosPage />} />
            <Route path="/agenda-mensal" element={<AgendaMensalPage />} />
            <Route path="/escalas" element={<EscalasPage />} />
            <Route path="/musicas" element={<MusicasPage />} />
            <Route path="/playlist" element={<PlaylistPage />} />
            <Route path="/playlists-salvas" element={<PlaylistsSalvasPage />} />
            <Route path="/minhas-escalas" element={<MinhasEscalasPage />} />
            <Route path="/configuracoes" element={<PlaylistConfigPage />} />
          </Route>
        </Route>

        <Route path="*" element={<HomeRedirect />} />
      </Routes>
    </LocalizationProvider>
  );
}