import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import PageHeader from '../../../components/common/PageHeader';
import {
  atualizarInstrumento,
  criarInstrumento,
  excluirInstrumento,
  listarInstrumentos,
} from '../../../services/instrumentoService';

const initialForm = {
  nome: '',
  tipo: '',
  descricao: '',
  quantidade_escala: 1,
  ativo: true,
};

function getMensagemErro(error, fallback) {
  const resposta = error.response?.data;

  if (typeof resposta === 'string') {
    return resposta;
  }

  return resposta?.message || resposta?.error || fallback;
}

export default function InstrumentosPage() {
  const [instrumentos, setInstrumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [dialogAberto, setDialogAberto] = useState(false);
  const [instrumentoEditando, setInstrumentoEditando] = useState(null);
  const [form, setForm] = useState(initialForm);

  async function carregarInstrumentos() {
    try {
      setLoading(true);
      setErro('');

      const dados = await listarInstrumentos();

      setInstrumentos(
        [...dados].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      );
    } catch (error) {
      setErro(
        getMensagemErro(
          error,
          'Não foi possível carregar os instrumentos.'
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarInstrumentos();
  }, []);

  function abrirCadastro() {
    setErro('');
    setSucesso('');
    setInstrumentoEditando(null);
    setForm(initialForm);
    setDialogAberto(true);
  }

  function abrirEdicao(instrumento) {
    setErro('');
    setSucesso('');
    setInstrumentoEditando(instrumento);

    setForm({
      nome: instrumento.nome || '',
      tipo: instrumento.tipo || '',
      descricao: instrumento.descricao || '',
      quantidade_escala: instrumento.quantidade_escala || 1,
      ativo: Boolean(instrumento.ativo),
    });

    setDialogAberto(true);
  }

  function fecharDialog() {
    if (!salvando) {
      setDialogAberto(false);
      setErro('');
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((atual) => ({
      ...atual,
      [name]: value,
    }));
  }

  function handleAtivoChange(event) {
    setForm((atual) => ({
      ...atual,
      ativo: event.target.checked,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nome = form.nome.trim();
    const tipo = form.tipo.trim();
    const descricao = form.descricao.trim();
    const quantidade = Number(form.quantidade_escala);

    if (!nome || !tipo) {
      setErro('Informe o nome e o tipo do instrumento.');
      return;
    }

    if (!Number.isInteger(quantidade) || quantidade < 1) {
      setErro('A quantidade por escala deve ser um número maior que zero.');
      return;
    }

    const payload = {
      nome,
      tipo,
      descricao,
      quantidade_escala: quantidade,
      ativo: form.ativo,
    };

    try {
      setSalvando(true);
      setErro('');
      setSucesso('');

      if (instrumentoEditando) {
        const atualizado = await atualizarInstrumento(
          instrumentoEditando.id,
          payload
        );

        setInstrumentos((lista) =>
          lista
            .map((instrumento) =>
              instrumento.id === atualizado.id ? atualizado : instrumento
            )
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
        );

        setSucesso('Instrumento atualizado com sucesso.');
      } else {
        const criado = await criarInstrumento(payload);

        setInstrumentos((lista) =>
          [...lista, criado].sort((a, b) =>
            a.nome.localeCompare(b.nome, 'pt-BR')
          )
        );

        setSucesso('Instrumento cadastrado com sucesso.');
      }

      setDialogAberto(false);
    } catch (error) {
      console.error('Erro ao salvar instrumento:', error);

      setErro(
        getMensagemErro(
          error,
          'Não foi possível salvar o instrumento.'
        )
      );
    } finally {
      setSalvando(false);
    }
  }

  async function handleExcluir(instrumento) {
    const confirmou = window.confirm(
      `Deseja excluir o instrumento "${instrumento.nome}"?`
    );

    if (!confirmou) {
      return;
    }

    try {
      setErro('');
      setSucesso('');

      await excluirInstrumento(instrumento.id);

      setInstrumentos((lista) =>
        lista.filter((item) => item.id !== instrumento.id)
      );

      setSucesso('Instrumento excluído com sucesso.');
    } catch (error) {
      setErro(
        getMensagemErro(
          error,
          'Não foi possível excluir o instrumento.'
        )
      );
    }
  }

  return (
    <Box>
      <PageHeader
        title="Instrumentos"
        description="Cadastre os instrumentos e funções usados nas escalas."
        action={
          <Button variant="contained" onClick={abrirCadastro}>
            Novo instrumento
          </Button>
        }
      />

      {erro && !dialogAberto && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {erro}
        </Alert>
      )}

      {sucesso && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {sucesso}
        </Alert>
      )}

      <Paper
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {loading ? (
          <Box
            sx={{
              minHeight: 240,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            <CircularProgress />
          </Box>
        ) : instrumentos.length === 0 ? (
          <Box
            sx={{
              minHeight: 240,
              display: 'grid',
              placeItems: 'center',
              textAlign: 'center',
              p: 3,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Nenhum instrumento cadastrado
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Clique em “Novo instrumento” para realizar o primeiro
                cadastro.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Stack
            divider={
              <Box
                sx={{
                  borderTop: '1px solid',
                  borderColor: 'divider',
                }}
              />
            }
          >
            {instrumentos.map((instrumento) => (
              <Box
                key={instrumento.id}
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2,
                }}
              >
                <Box>
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <Typography fontWeight={700}>
                      {instrumento.nome}
                    </Typography>

                    <Chip
                      size="small"
                      label={instrumento.ativo ? 'Ativo' : 'Inativo'}
                      color={instrumento.ativo ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.75 }}
                  >
                    Tipo: {instrumento.tipo} · Quantidade por escala:{' '}
                    {instrumento.quantidade_escala}
                  </Typography>

                  {instrumento.descricao && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5 }}
                    >
                      {instrumento.descricao}
                    </Typography>
                  )}
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => abrirEdicao(instrumento)}
                  >
                    Editar
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleExcluir(instrumento)}
                  >
                    Excluir
                  </Button>
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <Dialog
        open={dialogAberto}
        onClose={fecharDialog}
        fullWidth
        maxWidth="sm"
      >
        <Box component="form" onSubmit={handleSubmit}>
          <DialogTitle>
            {instrumentoEditando
              ? 'Editar instrumento'
              : 'Novo instrumento'}
          </DialogTitle>

          <DialogContent>
            {erro && (
              <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
                {erro}
              </Alert>
            )}

            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                autoFocus
                required
                fullWidth
                name="nome"
                label="Nome"
                value={form.nome}
                onChange={handleChange}
                inputProps={{ maxLength: 100 }}
              />

              <TextField
                required
                fullWidth
                name="tipo"
                label="Tipo"
                placeholder="Ex.: VOZ, CORDAS, TECLA, ACUSTICO"
                value={form.tipo}
                onChange={handleChange}
                inputProps={{ maxLength: 100 }}
              />

              <TextField
                fullWidth
                multiline
                minRows={2}
                name="descricao"
                label="Descrição"
                value={form.descricao}
                onChange={handleChange}
                inputProps={{ maxLength: 255 }}
              />

              <TextField
                required
                fullWidth
                type="number"
                name="quantidade_escala"
                label="Quantidade por escala"
                value={form.quantidade_escala}
                onChange={handleChange}
                inputProps={{ min: 1, step: 1 }}
              />

              <Stack direction="row" alignItems="center" spacing={1}>
                <Switch
                  checked={form.ativo}
                  onChange={handleAtivoChange}
                />

                <Typography>
                  Instrumento {form.ativo ? 'ativo' : 'inativo'}
                </Typography>
              </Stack>
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              type="button"
              onClick={fecharDialog}
              disabled={salvando}
            >
              Cancelar
            </Button>

            <Button type="submit" variant="contained" disabled={salvando}>
              {salvando ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}