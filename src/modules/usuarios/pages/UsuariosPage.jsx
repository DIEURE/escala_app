import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';

import PageHeader from '../../../components/common/PageHeader';
import {
  atualizarDisponibilidadeUsuario,
  atualizarUsuario,
  criarUsuario,
  inativarUsuario,
  listarUsuarios,
} from '../../../services/usuarioService';
import { listarInstrumentos } from '../../../services/instrumentoService';
import { listarDepartamentos } from '../../../services/departamentoService';

const initialForm = {
  nome: '',
  email: '',
  telefone: '',
  senha: '',
  perfil: 'MUSICO',
  instrumentoId: '',
  departamentoIds: [],
  disponibilidade: true,
  observacao: '',
};

const perfis = ['ADMIN', 'LIDER', 'MUSICO'];

function getMensagemErro(error, fallback) {
  const resposta = error.response?.data;

  if (typeof resposta === 'string') {
    return resposta;
  }

  return resposta?.message || resposta?.error || fallback;
}

function traduzirPerfil(perfil) {
  const labels = {
    ADMIN: 'Administrador',
    LIDER: 'Líder',
    MUSICO: 'Músico',
  };

  return labels[perfil] || perfil;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [instrumentos, setInstrumentos] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');

  const [dialogAberto, setDialogAberto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [busca, setBusca] = useState('');

  async function carregarDados() {
    try {
      setLoading(true);
      setErro('');

      const [listaUsuarios, listaInstrumentos, listaDepartamentos] =
        await Promise.all([
          listarUsuarios(),
          listarInstrumentos(),
          listarDepartamentos(),
        ]);

      setUsuarios(
        [...listaUsuarios].sort((a, b) =>
          a.nome.localeCompare(b.nome, 'pt-BR')
        )
      );

      setInstrumentos(
        listaInstrumentos
          .filter((instrumento) => instrumento.ativo)
          .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
      );

      setDepartamentos(
        [...listaDepartamentos].sort((a, b) =>
          a.nome.localeCompare(b.nome, 'pt-BR')
        )
      );
    } catch (error) {
      setErro(
        getMensagemErro(error, 'Não foi possível carregar os usuários.')
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const usuariosFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');

    if (!termo) {
      return usuarios;
    }

    return usuarios.filter((usuario) => {
      const departamentosTexto = usuario.departamentos?.join(' ') || '';

      return (
        usuario.nome?.toLocaleLowerCase('pt-BR').includes(termo) ||
        usuario.email?.toLocaleLowerCase('pt-BR').includes(termo) ||
        usuario.nomeInstrumento?.toLocaleLowerCase('pt-BR').includes(termo) ||
        departamentosTexto.toLocaleLowerCase('pt-BR').includes(termo)
      );
    });
  }, [busca, usuarios]);

  function abrirCadastro() {
    setErro('');
    setSucesso('');
    setUsuarioEditando(null);
    setForm(initialForm);
    setDialogAberto(true);
  }

  function abrirEdicao(usuario) {
    setErro('');
    setSucesso('');
    setUsuarioEditando(usuario);

    /*
      O endpoint de listagem retorna apenas nomes dos departamentos,
      e não os IDs. Por isso, convertemos os nomes recebidos para IDs.
    */
    const departamentoIds = departamentos
      .filter((departamento) =>
        usuario.departamentos?.includes(departamento.nome)
      )
      .map((departamento) => departamento.id);

    setForm({
      nome: usuario.nome || '',
      email: usuario.email || '',
      telefone: usuario.telefone || '',
      senha: '',
      perfil: usuario.perfil || 'MUSICO',
      instrumentoId: usuario.instrumentoId || '',
      departamentoIds,
      disponibilidade: Boolean(usuario.disponibilidade),
      observacao: '',
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

  function handleDisponibilidadeChange(event) {
    setForm((atual) => ({
      ...atual,
      disponibilidade: event.target.checked,
    }));
  }

  function handleDepartamentosChange(event) {
    const valor = event.target.value;

    setForm((atual) => ({
      ...atual,
      departamentoIds:
        typeof valor === 'string' ? valor.split(',') : valor,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nome = form.nome.trim();
    const email = form.email.trim();
    const telefone = form.telefone.trim();
    const senha = form.senha;
    const instrumentoId = Number(form.instrumentoId);
    const departamentoIds = form.departamentoIds.map(Number);

    if (!nome || !email || !telefone) {
      setErro('Preencha nome, e-mail e telefone.');
      return;
    }

    if (!usuarioEditando && !senha.trim()) {
      setErro('Informe uma senha para o novo usuário.');
      return;
    }

    if (!instrumentoId) {
      setErro('Selecione o instrumento principal.');
      return;
    }

    if (departamentoIds.length === 0) {
      setErro('Selecione pelo menos um departamento.');
      return;
    }

    const payload = {
      nome,
      email,
      telefone,
      senha,
      perfil: form.perfil,
      disponibilidade: form.disponibilidade,
      instrumentoId,
      departamentoIds,
      observacao: form.observacao.trim(),
    };

    try {
      setSalvando(true);
      setErro('');
      setSucesso('');

      if (usuarioEditando) {
        const atualizado = await atualizarUsuario(usuarioEditando.id, payload);

        setUsuarios((lista) =>
          lista
            .map((usuario) =>
              usuario.id === atualizado.id ? atualizado : usuario
            )
            .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'))
        );

        setSucesso('Usuário atualizado com sucesso.');
      } else {
        const criado = await criarUsuario(payload);

        setUsuarios((lista) =>
          [...lista, criado].sort((a, b) =>
            a.nome.localeCompare(b.nome, 'pt-BR')
          )
        );

        setSucesso('Usuário cadastrado com sucesso.');
      }

      setDialogAberto(false);
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);

      setErro(
        getMensagemErro(error, 'Não foi possível salvar o usuário.')
      );
    } finally {
      setSalvando(false);
    }
  }

  async function handleAlternarDisponibilidade(usuario) {
    const novaDisponibilidade = !usuario.disponibilidade;

    try {
      setErro('');
      setSucesso('');

      const atualizado = await atualizarDisponibilidadeUsuario(
        usuario.id,
        novaDisponibilidade
      );

      setUsuarios((lista) =>
        lista.map((item) =>
          item.id === atualizado.id ? atualizado : item
        )
      );

      setSucesso(
        novaDisponibilidade
          ? 'Usuário marcado como disponível.'
          : 'Usuário marcado como indisponível.'
      );
    } catch (error) {
      setErro(
        getMensagemErro(
          error,
          'Não foi possível atualizar a disponibilidade.'
        )
      );
    }
  }

  async function handleInativar(usuario) {
    const confirmou = window.confirm(
      `Deseja inativar o usuário "${usuario.nome}"?`
    );

    if (!confirmou) {
      return;
    }

    try {
      setErro('');
      setSucesso('');

      await inativarUsuario(usuario.id);

      setUsuarios((lista) =>
        lista.filter((item) => item.id !== usuario.id)
      );

      setSucesso('Usuário inativado com sucesso.');
    } catch (error) {
      setErro(
        getMensagemErro(error, 'Não foi possível inativar o usuário.')
      );
    }
  }

  return (
    <Box>
      <PageHeader
        title="Usuários"
        description="Cadastre músicos, líderes e administradores."
        action={
          <Button variant="contained" onClick={abrirCadastro}>
            Novo usuário
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

      <TextField
        fullWidth
        label="Buscar usuário"
        placeholder="Nome, e-mail, instrumento ou departamento"
        value={busca}
        onChange={(event) => setBusca(event.target.value)}
        sx={{ mb: 3 }}
      />

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
        ) : usuariosFiltrados.length === 0 ? (
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
                Nenhum usuário encontrado
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Cadastre um novo usuário ou altere os filtros de busca.
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
            {usuariosFiltrados.map((usuario) => (
              <Box
                key={usuario.id}
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
                      {usuario.nome}
                    </Typography>

                    <Chip
                      size="small"
                      label={traduzirPerfil(usuario.perfil)}
                      color={
                        usuario.perfil === 'ADMIN'
                          ? 'primary'
                          : usuario.perfil === 'LIDER'
                            ? 'secondary'
                            : 'default'
                      }
                      variant="outlined"
                    />

                    <Chip
                      size="small"
                      label={
                        usuario.disponibilidade
                          ? 'Disponível'
                          : 'Indisponível'
                      }
                      color={
                        usuario.disponibilidade ? 'success' : 'warning'
                      }
                      variant="outlined"
                    />
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.75 }}
                  >
                    {usuario.email} · {usuario.telefone}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    Instrumento: {usuario.nomeInstrumento || 'Não informado'}
                  </Typography>

                  {usuario.departamentos?.length > 0 && (
                    <Stack
                      direction="row"
                      spacing={0.75}
                      flexWrap="wrap"
                      sx={{ mt: 1 }}
                    >
                      {usuario.departamentos.map((departamento) => (
                        <Chip
                          key={departamento}
                          label={departamento}
                          size="small"
                        />
                      ))}
                    </Stack>
                  )}
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => abrirEdicao(usuario)}
                  >
                    Editar
                  </Button>

                  <Button
                    size="small"
                    color={
                      usuario.disponibilidade ? 'warning' : 'success'
                    }
                    onClick={() => handleAlternarDisponibilidade(usuario)}
                  >
                    {usuario.disponibilidade
                      ? 'Indisponibilizar'
                      : 'Disponibilizar'}
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleInativar(usuario)}
                  >
                    Inativar
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
            {usuarioEditando ? 'Editar usuário' : 'Novo usuário'}
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
                fullWidth
                required
                name="nome"
                label="Nome completo"
                value={form.nome}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                required
                type="email"
                name="email"
                label="E-mail"
                value={form.email}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                required
                name="telefone"
                label="Telefone"
                placeholder="62999999999"
                value={form.telefone}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                required={!usuarioEditando}
                type="password"
                name="senha"
                label={
                  usuarioEditando
                    ? 'Nova senha (opcional)'
                    : 'Senha'
                }
                helperText={
                  usuarioEditando
                    ? 'Deixe em branco para manter a senha atual.'
                    : ''
                }
                value={form.senha}
                onChange={handleChange}
              />

              <FormControl fullWidth required>
                <InputLabel id="perfil-label">Perfil</InputLabel>

                <Select
                  labelId="perfil-label"
                  name="perfil"
                  label="Perfil"
                  value={form.perfil}
                  onChange={handleChange}
                >
                  {perfis.map((perfil) => (
                    <MenuItem key={perfil} value={perfil}>
                      {traduzirPerfil(perfil)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel id="instrumento-label">
                  Instrumento principal
                </InputLabel>

                <Select
                  labelId="instrumento-label"
                  name="instrumentoId"
                  label="Instrumento principal"
                  value={form.instrumentoId}
                  onChange={handleChange}
                >
                  {instrumentos.map((instrumento) => (
                    <MenuItem key={instrumento.id} value={instrumento.id}>
                      {instrumento.nome} — {instrumento.tipo}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel id="departamentos-label">
                  Departamentos
                </InputLabel>

                <Select
                  multiple
                  labelId="departamentos-label"
                  label="Departamentos"
                  value={form.departamentoIds}
                  onChange={handleDepartamentosChange}
                  renderValue={(ids) =>
                    departamentos
                      .filter((departamento) =>
                        ids.includes(departamento.id)
                      )
                      .map((departamento) => departamento.nome)
                      .join(', ')
                  }
                >
                  {departamentos.map((departamento) => (
                    <MenuItem
                      key={departamento.id}
                      value={departamento.id}
                    >
                      {departamento.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                minRows={2}
                name="observacao"
                label="Observações"
                value={form.observacao}
                onChange={handleChange}
              />

              <FormControlLabel
                label="Usuário está disponível para escala"
                control={
                  <Switch
                    checked={form.disponibilidade}
                    onChange={handleDisponibilidadeChange}
                  />
                }
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button
              type="button"
              disabled={salvando}
              onClick={fecharDialog}
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