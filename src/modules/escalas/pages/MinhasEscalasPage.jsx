import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import EventNoteOutlined from '@mui/icons-material/EventNoteOutlined';
import PageHeader from '../../../components/common/PageHeader';
import {
  buscarMinhasEscalas,
  confirmarMinhaEscala,
} from '../../../services/escalaService';

function getStatus(escala) {
  if (escala.substituido) {
    return {
      label: 'Substituída',
      color: 'error',
    };
  }

  if (escala.confirmado) {
    return {
      label: 'Confirmada',
      color: 'success',
    };
  }

  return {
    label: 'Aguardando confirmação',
    color: 'warning',
  };
}

export default function MinhasEscalasPage() {
  const [escalas, setEscalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [confirmandoId, setConfirmandoId] = useState(null);

  async function carregarEscalas() {
    try {
      setLoading(true);
      setErro('');

      const dados = await buscarMinhasEscalas();
      setEscalas(dados);
    } catch (error) {
      console.error(error);

      setErro(
        error.response?.data?.message ||
          'Não foi possível carregar suas escalas.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarEscalas();
  }, []);

  async function handleConfirmar(escalaId) {
    try {
      setConfirmandoId(escalaId);
      setErro('');
      setSucesso('');

      const escalaAtualizada = await confirmarMinhaEscala(escalaId, true);

      setEscalas((listaAtual) =>
        listaAtual.map((escala) =>
          escala.id === escalaId ? escalaAtualizada : escala
        )
      );

      setSucesso('Sua participação foi confirmada com sucesso.');
    } catch (error) {
      console.error(error);

      setErro(
        error.response?.data?.message ||
          'Não foi possível confirmar esta escala.'
      );
    } finally {
      setConfirmandoId(null);
    }
  }

  return (
    <Box>
      <PageHeader
        title="Minhas escalas"
        description="Acompanhe e confirme sua participação nas escalas."
      />

      {erro && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erro}
        </Alert>
      )}

      {sucesso && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {sucesso}
        </Alert>
      )}

      {loading ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: 250,
            display: 'grid',
            placeItems: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          <CircularProgress />
        </Paper>
      ) : escalas.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            minHeight: 300,
            p: 4,
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          <Box>
            <EventNoteOutlined
              sx={{
                mb: 2,
                fontSize: 44,
                color: 'text.secondary',
              }}
            />

            <Typography variant="h6" fontWeight={700}>
              Nenhuma escala encontrada
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1 }}>
              Você ainda não possui escalas atribuídas.
            </Typography>
          </Box>
        </Paper>
      ) : (
        <Stack spacing={2}>
          {escalas.map((escala) => {
            const status = getStatus(escala);
            const carregandoConfirmacao = confirmandoId === escala.id;

            return (
              <Paper
                key={escala.id}
                elevation={0}
                sx={{
                  p: { xs: 2, sm: 3 },
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      {escala.culto || 'Escala'}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      Instrumento: {escala.instrumento || 'Não informado'}
                    </Typography>

                    {escala.observacao && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Observação: {escala.observacao}
                      </Typography>
                    )}

                    {escala.substituido && escala.nomeSubstituto && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 0.5 }}
                      >
                        Substituto: {escala.nomeSubstituto}
                      </Typography>
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 1,
                    }}
                  >
                    <Chip
                      label={status.label}
                      color={status.color}
                      size="small"
                      variant="outlined"
                    />

                    {!escala.confirmado && !escala.substituido && (
                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<CheckCircle />}
                        disabled={carregandoConfirmacao}
                        onClick={() => handleConfirmar(escala.id)}
                      >
                        {carregandoConfirmacao
                          ? 'Confirmando...'
                          : 'Confirmar'}
                      </Button>
                    )}
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Box>
  );
}