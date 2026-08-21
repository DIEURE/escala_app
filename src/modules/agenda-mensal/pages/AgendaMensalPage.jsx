import { useEffect, useMemo, useState } from "react";
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
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import PageHeader from "../../../components/common/PageHeader";
import { listarDepartamentos } from "../../../services/departamentoService";
import {
  atualizarAgendaMensal,
  criarAgendaMensal,
   
  inativarAgendaMensal,
  listarAgendasMensais,
} from "../../../services/agendaMensalService";

const meses = [
  { valor: 1, nome: "Janeiro" },
  { valor: 2, nome: "Fevereiro" },
  { valor: 3, nome: "Março" },
  { valor: 4, nome: "Abril" },
  { valor: 5, nome: "Maio" },
  { valor: 6, nome: "Junho" },
  { valor: 7, nome: "Julho" },
  { valor: 8, nome: "Agosto" },
  { valor: 9, nome: "Setembro" },
  { valor: 10, nome: "Outubro" },
  { valor: 11, nome: "Novembro" },
  { valor: 12, nome: "Dezembro" },
];

const anoAtual = new Date().getFullYear();

const initialForm = {
  mes: new Date().getMonth() + 1,
  ano: anoAtual,
  descricao: "",
  departamentoId: "",
};

const tiposEscala = [
  { valor: "MANUAL", nome: "Manual" },
  { valor: "QUARTA_FEIRA", nome: "Automatica" },
];

const initialFormGerarEscalas = {
  tipoEscala: "",
  horarioManha: "09:00",
  horarioNoite: "19:00",
  nomeCultoManha: "Culto da Manhã",
  nomeCultoNoite: "Culto da Noite",
  gerarDomingos: true,
  repetirMesmaEquipe: false,
};

function getMensagemErro(error, fallback) {
  const resposta = error.response?.data;

  if (typeof resposta === "string") {
    return resposta;
  }

  return resposta?.message || resposta?.error || fallback;
}

function nomeMes(numeroMes) {
  return meses.find((mes) => mes.valor === Number(numeroMes))?.nome || "";
}

function traduzirStatus(status) {
  const statusLabels = {
    EM_MONTAGEM: "Em montagem",
    FINALIZADA: "Finalizada",
  };

  return statusLabels[status] || status;
}

export default function AgendaMensalPage() {
  const [agendas, setAgendas] = useState([]);
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [dialogAberto, setDialogAberto] = useState(false);
  const [agendaEditando, setAgendaEditando] = useState(null);
  const [form, setForm] = useState(initialForm);

  const [filtroAno, setFiltroAno] = useState("");
  const [filtroMes, setFiltroMes] = useState("");
  const [filtroDepartamento, setFiltroDepartamento] = useState("");

  const [dialogGerarAberto, setDialogGerarAberto] = useState(false);
  const [agendaParaGerar, setAgendaParaGerar] = useState(null);
  const [gerandoEscalas, setGerandoEscalas] = useState(false);

  const [formGerarEscalas, setFormGerarEscalas] = useState(
    initialFormGerarEscalas,
  );

  async function carregarDados() {
    try {
      setLoading(true);
      setErro("");

      const [listaAgendas, listaDepartamentos] = await Promise.all([
        listarAgendasMensais(),
        listarDepartamentos(),
      ]);

      setAgendas(
        [...listaAgendas].sort((a, b) => {
          if (b.ano !== a.ano) return b.ano - a.ano;
          if (b.mes !== a.mes) return b.mes - a.mes;

          return a.departamentoNome.localeCompare(b.departamentoNome, "pt-BR");
        }),
      );

      setDepartamentos(
        [...listaDepartamentos].sort((a, b) =>
          a.nome.localeCompare(b.nome, "pt-BR"),
        ),
      );
    } catch (error) {
      setErro(
        getMensagemErro(error, "Não foi possível carregar as agendas mensais."),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  const agendasFiltradas = useMemo(() => {
    return agendas.filter((agenda) => {
      const correspondeAno =
        !filtroAno || Number(agenda.ano) === Number(filtroAno);

      const correspondeMes =
        !filtroMes || Number(agenda.mes) === Number(filtroMes);

      const correspondeDepartamento =
        !filtroDepartamento ||
        Number(agenda.departamentoId) === Number(filtroDepartamento);

      return correspondeAno && correspondeMes && correspondeDepartamento;
    });
  }, [agendas, filtroAno, filtroMes, filtroDepartamento]);

  function abrirCadastro() {
    setErro("");
    setSucesso("");
    setAgendaEditando(null);
    setForm(initialForm);
    setDialogAberto(true);
  }

  function abrirEdicao(agenda) {
    setErro("");
    setSucesso("");
    setAgendaEditando(agenda);

    setForm({
      mes: agenda.mes,
      ano: agenda.ano,
      descricao: agenda.descricao || "",
      departamentoId: agenda.departamentoId,
    });

    setDialogAberto(true);
  }

  function fecharDialog() {
    if (!salvando) {
      setDialogAberto(false);
      setErro("");
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((atual) => ({
      ...atual,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const mes = Number(form.mes);
    const ano = Number(form.ano);
    const departamentoId = Number(form.departamentoId);
    const descricao = form.descricao.trim();

    if (!mes || mes < 1 || mes > 12) {
      setErro("Selecione um mês válido.");
      return;
    }

    if (!ano || ano < 2020 || ano > 2100) {
      setErro("Informe um ano válido.");
      return;
    }

    if (!departamentoId) {
      setErro("Selecione um departamento.");
      return;
    }

    if (!descricao) {
      setErro("Informe uma descrição para a agenda.");
      return;
    }

    const payload = {
      mes,
      ano,
      descricao,
      departamentoId,
    };

    try {
      setSalvando(true);
      setErro("");
      setSucesso("");

      if (agendaEditando) {
        const atualizada = await atualizarAgendaMensal(
          agendaEditando.id,
          payload,
        );

        setAgendas((lista) =>
          lista
            .map((agenda) =>
              agenda.id === atualizada.id ? atualizada : agenda,
            )
            .sort((a, b) => {
              if (b.ano !== a.ano) return b.ano - a.ano;
              return b.mes - a.mes;
            }),
        );

        setSucesso("Agenda mensal atualizada com sucesso.");
      } else {
        const criada = await criarAgendaMensal(payload);

        setAgendas((lista) =>
          [criada, ...lista].sort((a, b) => {
            if (b.ano !== a.ano) return b.ano - a.ano;
            return b.mes - a.mes;
          }),
        );

        setSucesso("Agenda mensal criada com sucesso.");
      }

      setDialogAberto(false);
    } catch (error) {
      setErro(
        getMensagemErro(error, "Não foi possível salvar a agenda mensal."),
      );
    } finally {
      setSalvando(false);
    }
  }

  async function handleInativar(agenda) {
    const confirmou = window.confirm(
      `Deseja inativar a agenda "${agenda.descricao}"?`,
    );

    if (!confirmou) return;

    try {
      setErro("");
      setSucesso("");

      await inativarAgendaMensal(agenda.id);

      setAgendas((lista) => lista.filter((item) => item.id !== agenda.id));

      setSucesso("Agenda mensal inativada com sucesso.");
    } catch (error) {
      setErro(
        getMensagemErro(error, "Não foi possível inativar a agenda mensal."),
      );
    }
  }

  return (
    <Box>
      <PageHeader
        title="Agenda mensal"
        description="Organize as agendas por mês e departamento."
        action={
          <Button variant="contained" onClick={abrirCadastro}>
            Nova agenda
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
          p: 2,
          mb: 3,
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <FormControl fullWidth>
            <InputLabel id="filtro-mes-label">Mês</InputLabel>

            <Select
              labelId="filtro-mes-label"
              label="Mês"
              value={filtroMes}
              onChange={(event) => setFiltroMes(event.target.value)}
            >
              <MenuItem value="">Todos os meses</MenuItem>

              {meses.map((mes) => (
                <MenuItem key={mes.valor} value={mes.valor}>
                  {mes.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            type="number"
            label="Ano"
            value={filtroAno}
            onChange={(event) => setFiltroAno(event.target.value)}
            inputProps={{ min: 2020, max: 2100 }}
          />

          <FormControl fullWidth>
            <InputLabel id="filtro-departamento-label">Departamento</InputLabel>

            <Select
              labelId="filtro-departamento-label"
              label="Departamento"
              value={filtroDepartamento}
              onChange={(event) => setFiltroDepartamento(event.target.value)}
            >
              <MenuItem value="">Todos os departamentos</MenuItem>

              {departamentos.map((departamento) => (
                <MenuItem key={departamento.id} value={departamento.id}>
                  {departamento.nome}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </Paper>

      <Paper
        elevation={0}
        sx={{
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        {loading ? (
          <Box
            sx={{
              minHeight: 240,
              display: "grid",
              placeItems: "center",
            }}
          >
            <CircularProgress />
          </Box>
        ) : agendasFiltradas.length === 0 ? (
          <Box
            sx={{
              minHeight: 240,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              p: 3,
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Nenhuma agenda encontrada
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Cadastre uma agenda mensal para começar.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Stack
            divider={
              <Box
                sx={{
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              />
            }
          >
            {agendasFiltradas.map((agenda) => (
              <Box
                key={agenda.id}
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: { xs: "flex-start", sm: "center" },
                  flexDirection: { xs: "column", sm: "row" },
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
                      {nomeMes(agenda.mes)} de {agenda.ano}
                    </Typography>

                    <Chip
                      size="small"
                      label={traduzirStatus(agenda.status)}
                      color={
                        agenda.status === "FINALIZADA" ? "success" : "warning"
                      }
                      variant="outlined"
                    />
                  </Stack>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.75 }}
                  >
                    Departamento: {agenda.departamentoNome}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {agenda.descricao}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => abrirEdicao(agenda)}
                  >
                    Editar
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleInativar(agenda)}
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
            {agendaEditando ? "Editar agenda mensal" : "Nova agenda mensal"}
          </DialogTitle>

          <DialogContent>
            {erro && (
              <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
                {erro}
              </Alert>
            )}

            <Stack spacing={2} sx={{ mt: 1 }}>
              <FormControl fullWidth required>
                <InputLabel id="mes-label">Mês</InputLabel>

                <Select
                  labelId="mes-label"
                  name="mes"
                  label="Mês"
                  value={form.mes}
                  onChange={handleChange}
                >
                  {meses.map((mes) => (
                    <MenuItem key={mes.valor} value={mes.valor}>
                      {mes.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                required
                fullWidth
                type="number"
                name="ano"
                label="Ano"
                value={form.ano}
                onChange={handleChange}
                inputProps={{ min: 2020, max: 2100 }}
              />

              <FormControl fullWidth required>
                <InputLabel id="departamento-label">Departamento</InputLabel>

                <Select
                  labelId="departamento-label"
                  name="departamentoId"
                  label="Departamento"
                  value={form.departamentoId}
                  onChange={handleChange}
                >
                  {departamentos.map((departamento) => (
                    <MenuItem key={departamento.id} value={departamento.id}>
                      {departamento.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                required
                fullWidth
                multiline
                minRows={3}
                name="descricao"
                label="Descrição"
                placeholder="Ex.: Escala de agosto de 2026"
                value={form.descricao}
                onChange={handleChange}
                inputProps={{ maxLength: 255 }}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button type="button" onClick={fecharDialog} disabled={salvando}>
              Cancelar
            </Button>

            <Button type="submit" variant="contained" disabled={salvando}>
              {salvando ? "Salvando..." : "Salvar"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
