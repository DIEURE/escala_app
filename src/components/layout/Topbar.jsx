import {
  Avatar,
  Box,
  Button,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import {
  DarkModeOutlined,
  LightModeOutlined,
  LogoutOutlined,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAppTheme } from '../../contexts/ThemeContext';
import { DRAWER_WIDTH } from './Sidebar';
import logomarca from '../../assets/logomarca.png';

export default function Topbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useAppTheme();

  const firstName = user?.nome?.split(' ')[0] || 'Usuário';
  const initial = firstName.charAt(0).toUpperCase();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <Box
      component="header"
      sx={{
        height: 72,
        position: 'fixed',
        top: 0,
        right: 0,
        left: { md: `${DRAWER_WIDTH}px` },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: { xs: 2, sm: 3, md: 4 },
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        zIndex: 1100,
      }}
    >
      {/* LADO ESQUERDO: LOGO + TEXTO DE BOAS-VINDAS */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* LOGOMARCA RESPONSIVA */}
        <Box
          component="img"
          src={logomarca}
          alt="Logomarca"
          sx={{
            height: {
              xs: '32px',   // Menor no celular para não empurrar os elementos
              sm: '40px',   
              md: '45px',   // Tamanho ideal para caber nos 72px de altura da barra
            },
            width: 'auto',
          }}
        />

        {/* TEXTO DE BOAS-VINDAS (Oculto em telas muito pequenas para dar espaço à logo) */}
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.2 }}>
            Bem-vindo de volta,
          </Typography>
          <Typography variant="subtitle1" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {firstName}
          </Typography>
        </Box>
      </Box>

      {/* LADO DIREITO: BOTÕES DE AÇÃO */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Alternar tema">
          <IconButton onClick={toggleTheme}>
            {mode === 'light' ? <DarkModeOutlined /> : <LightModeOutlined />}
          </IconButton>
        </Tooltip>

        <Avatar
          sx={{
            ml: 1,
            width: 36,
            height: 36,
            fontSize: 14,
            fontWeight: 700,
            bgcolor: 'primary.main',
          }}
        >
          {initial}
        </Avatar>

        <Tooltip title="Sair">
          <Button
            onClick={handleLogout}
            color="inherit"
            sx={{
              minWidth: 42,
              px: 1,
              color: 'text.secondary',
            }}
          >
            <LogoutOutlined fontSize="small" />
          </Button>
        </Tooltip>
      </Box>
    </Box>
  );
}