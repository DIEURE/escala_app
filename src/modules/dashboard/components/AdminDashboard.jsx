import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import AddOutlined from '@mui/icons-material/AddOutlined';
import CheckCircleOutline from '@mui/icons-material/CheckCircle';
import EventNoteOutlined from '@mui/icons-material/EventNoteOutlined';
import GroupOutlined from '@mui/icons-material/GroupOutlined';
import HourglassEmptyOutlined from '@mui/icons-material/HourglassEmptyOutlined';
import TrendingUpOutlined from '@mui/icons-material/TrendingUpOutlined';

import { useNavigate } from 'react-router-dom';
import StatCard from '../../../components/common/StatCard';

const proximasEscalas = [
  {
    id: 1,
    titulo: 'Culto de Celebração',
    data: 'Domingo, 20:00',
    status: 'Pendente',
    color: 'warning',
  },
];

const atividades = [
  {
    id: 1,
    texto: 'Nova escala criada para o Culto de Celebração.',
    horario: 'Há 15 minutos',
  },
  {
    id: 2,
    texto: 'João Silva confirmou participação na escala.',
    horario: 'Há 1 hora',
  },
  {
    id: 3,
    texto: 'Maria Souza foi adicionada como vocalista.',
    horario: 'Há 3 horas',
  },
];

export default function AdminDashboard({ user }) {
  const navigate = useNavigate();
  const firstName = user?.nome?.split(' ')[0] || 'Administrador';

  return (
    <Box>
      <Box
        sx={{
          mb: 4,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' },
        }}
      >
        <Box>
          <Typography variant="h4" sx={{ mb: 1 }}>
            Olá, {firstName}! 👋
          </Typography>

          <Typography color="text.secondary">
            Visão geral das escalas e da equipe.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddOutlined />}
          onClick={() => navigate('/escalas')}
        >
          Nova escala
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Escalas no mês"
            value="12"
            subtitle="3 escalas nos próximos 7 dias"
            color="primary.main"
            icon={<EventNoteOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Músicos ativos"
            value="48"
            subtitle="4 novos músicos este mês"
            color="secondary.main"
            icon={<GroupOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Confirmações pendentes"
            value="9"
            subtitle="Aguardando resposta dos músicos"
            color="warning.main"
            icon={<HourglassEmptyOutlined />}
          />
        </Grid>

        <Grid item xs={12} sm={6} lg={3}>
          <StatCard
            title="Taxa de confirmação"
            value="85%"
            subtitle="8% maior que no mês passado"
            color="success.main"
            icon={<CheckCircleOutline />}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={7}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              minHeight: 350,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                mb: 3,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Agenda de escalas
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Próximos compromissos da equipe.
                </Typography>
              </Box>

              <Button size="small" onClick={() => navigate('/escalas')}>
                Ver todas
              </Button>
            </Box>

            <Stack spacing={2}>
              {proximasEscalas.map((escala) => (
                <Box
                  key={escala.id}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                  }}
                >
                  <Box>
                    <Typography fontWeight={600}>{escala.titulo}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {escala.data}
                    </Typography>
                  </Box>

                  <Chip
                    label={escala.status}
                    color={escala.color}
                    size="small"
                    variant="outlined"
                  />
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              height: '100%',
              minHeight: 350,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 3,
            }}
          >
            <Box
              sx={{
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <TrendingUpOutlined color="primary" />

              <Typography variant="h6" fontWeight={700}>
                Atividades recentes
              </Typography>
            </Box>

            <Stack spacing={3}>
              {atividades.map((atividade) => (
                <Box
                  key={atividade.id}
                  sx={{
                    position: 'relative',
                    pl: 2,
                    borderLeft: '2px solid',
                    borderColor: 'primary.main',
                  }}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {atividade.texto}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, display: 'block' }}
                  >
                    {atividade.horario}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}