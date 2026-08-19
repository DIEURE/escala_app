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
      <Box>
        <Typography variant="body2" color="text.secondary">
          Bem-vindo de volta,
        </Typography>

        <Typography variant="subtitle1" fontWeight={700}>
          {firstName}
        </Typography>
      </Box>

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