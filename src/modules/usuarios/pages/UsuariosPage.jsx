import { Box, Paper, Typography } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';

export default function UsuariosPage() {
  return (
    <Box>
      <PageHeader
        title="Usuários"
        description="Gerencie músicos, líderes e administradores."
      />

      <Paper
        elevation={0}
        sx={{
          p: 4,
          minHeight: 300,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          display: 'grid',
          placeItems: 'center',
          textAlign: 'center',
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            Gestão de usuários
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            A listagem de usuários será integrada ao backend nesta página.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}