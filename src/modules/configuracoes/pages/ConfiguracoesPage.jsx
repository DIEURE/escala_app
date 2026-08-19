import { Box, Paper, Typography } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';

export default function ConfiguracoesPage() {
  return (
    <Box>
      <PageHeader
        title="Configurações"
        description="Gerencie as configurações gerais do sistema."
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
            Configurações do sistema
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Esta área será implementada conforme as funcionalidades do backend.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}