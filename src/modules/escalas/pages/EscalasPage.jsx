import { Box, Button, Paper, Typography } from '@mui/material';
import AddOutlined from '@mui/icons-material/AddOutlined';
import PageHeader from '../../../components/common/PageHeader';

export default function EscalasPage() {
  return (
    <Box>
      <PageHeader
        title="Escalas"
        description="Crie, organize e acompanhe as escalas da equipe."
        action={
          <Button variant="contained" startIcon={<AddOutlined />}>
            Nova escala
          </Button>
        }
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
            Nenhuma escala carregada
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 1 }}>
            A integração com a API de escalas será adicionada nesta tela.
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}