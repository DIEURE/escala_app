import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import {
  DarkModeOutlined,
  LightModeOutlined,
  LockOutlined,
  Visibility,
  VisibilityOff,
} from '@mui/icons-material';
import { useAppTheme } from '../../../contexts/ThemeContext';
import { useAuth } from '../../../contexts/AuthContext';
import { loginRequest } from '../../../services/authService';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const { mode, toggleTheme } = useAppTheme();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');
    setLoading(true);

    try {
      const session = await loginRequest(email, senha);

      login(session);

      navigate('/dashboard', { replace: true });
      
    } catch (error) {
      const mensagem =
        error.response?.data?.message ||
        'Não foi possível realizar o login. Verifique seus dados.';

      setErro(mensagem);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        p: 3,
        bgcolor: 'background.default',
      }}
    >
      <IconButton
        onClick={toggleTheme}
        aria-label="Alternar tema"
        sx={{ position: 'fixed', top: 20, right: 20 }}
      >
        {mode === 'light' ? <DarkModeOutlined /> : <LightModeOutlined />}
      </IconButton>

      <Paper
        component="form"
        onSubmit={handleSubmit}
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 440,
          p: { xs: 3, sm: 4 },
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            display: 'grid',
            placeItems: 'center',
            mb: 3,
            borderRadius: 2,
            color: 'primary.main',
            bgcolor: 'primary.main',
          }}
        >
          <LockOutlined sx={{ color: '#FFFFFF' }} />
        </Box>

        <Typography variant="h4" sx={{ mb: 1 }}>
          Bem-vindo!
        </Typography>

        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Entre com sua conta para acessar a EscalaPro.
        </Typography>

        {erro && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {erro}
          </Alert>
        )}

        <TextField
          label="E-mail"
          type="email"
          fullWidth
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          label="Senha"
          type={mostrarSenha ? 'text' : 'password'}
          fullWidth
          required
          autoComplete="current-password"
          value={senha}
          onChange={(event) => setSenha(event.target.value)}
          sx={{ mb: 3 }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  edge="end"
                  onClick={() => setMostrarSenha((current) => !current)}
                  aria-label={mostrarSenha ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {mostrarSenha ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <Button
          type="submit"
          fullWidth
          variant="contained"
          disabled={loading}
          sx={{ minHeight: 46 }}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : 'Entrar'}
        </Button>
      </Paper>
    </Box>
  );
}