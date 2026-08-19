import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import PageHeader from "../../../components/common/PageHeader";
import {
  atualizarDepartamento,
  criarDepartamento,
  inativarDepartamento,
  listarDepartamentos,
} from "../../../services/departamentoService";

const initialForm = {
  nome: "",
};

export default function DepartamentosPage() {
  const [departamentos, setDepartamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  const [dialogAberto, setDialogAberto] = useState(false);
  const [departamentoEditando, setDepartamentoEditando] = useState(null);
  const [form, setForm] = useState(initialForm);

  async function carregarDepartamentos() {
    try {
      setLoading(true);
      setErro("");

      const dados = await listarDepartamentos();
      setDepartamentos(dados);
    } catch (error) {
      setErro(
        error.response?.data?.message ||
          "Não foi possível carregar os departamentos.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarDepartamentos();
  }, []);

  function abrirCadastro() {
    setErro("");
    setSucesso("");
    setDepartamentoEditando(null);
    setForm(initialForm);
    setDialogAberto(true);
  }

  function abrirEdicao(departamento) {
    setErro("");
    setSucesso("");
    setDepartamentoEditando(departamento);
    setForm({
      nome: departamento.nome || "",
    });
    setDialogAberto(true);
  }

  function fecharDialog() {
    if (!salvando) {
      setDialogAberto(false);
    }
  }

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nome = form.nome.trim();

    if (!nome) {
      setErro("Informe o nome do departamento.");
      return;
    }

    try {
      setSalvando(true);
      setErro("");
      setSucesso("");

      const payload = {
        nome,
      };

      if (departamentoEditando) {
        const atualizado = await atualizarDepartamento(
          departamentoEditando.id,
          payload,
        );

        setDepartamentos((lista) =>
          lista.map((departamento) =>
            departamento.id === atualizado.id ? atualizado : departamento,
          ),
        );

        setSucesso("Departamento atualizado com sucesso.");
      } else {
        const criado = await criarDepartamento(payload);

        setDepartamentos((lista) =>
          [...lista, criado].sort((a, b) =>
            a.nome.localeCompare(b.nome, "pt-BR"),
          ),
        );

        setSucesso("Departamento cadastrado com sucesso.");
      }

      setDialogAberto(false);
    } catch (error) {
      console.error("Erro ao salvar departamento:", error);

      const resposta = error.response?.data;

      const mensagem =
        typeof resposta === "string"
          ? resposta
          : resposta?.message ||
            resposta?.error ||
            "Não foi possível salvar o departamento.";

      setErro(mensagem);
    } finally {
      setSalvando(false);
    }
  }

  async function handleInativar(departamento) {
    const confirmou = window.confirm(
      `Deseja inativar o departamento "${departamento.nome}"?`,
    );

    if (!confirmou) {
      return;
    }

    try {
      setErro("");
      setSucesso("");

      await inativarDepartamento(departamento.id);

      setDepartamentos((lista) =>
        lista.filter((item) => item.id !== departamento.id),
      );

      setSucesso("Departamento inativado com sucesso.");
    } catch (error) {
      setErro(
        error.response?.data?.message ||
          "Não foi possível inativar o departamento.",
      );
    }
  }

  return (
    <Box>
      <PageHeader
        title="Departamentos"
        description="Cadastre e organize os departamentos da igreja."
        action={
          <Button variant="contained" onClick={abrirCadastro}>
            Novo departamento
          </Button>
        }
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
        ) : departamentos.length === 0 ? (
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
                Nenhum departamento cadastrado
              </Typography>

              <Typography color="text.secondary" sx={{ mt: 1 }}>
                Clique em “Novo departamento” para realizar o primeiro cadastro.
              </Typography>
            </Box>
          </Box>
        ) : (
          <Stack
            divider={
              <Box sx={{ borderTop: "1px solid", borderColor: "divider" }} />
            }
          >
            {departamentos.map((departamento) => (
              <Box
                key={departamento.id}
                sx={{
                  px: { xs: 2, sm: 3 },
                  py: 2,
                  display: "flex",
                  alignItems: { xs: "flex-start", sm: "center" },
                  justifyContent: "space-between",
                  gap: 2,
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <Box>
                  <Typography fontWeight={700}>{departamento.nome}</Typography>

                  <Typography variant="body2" color="text.secondary">
                    ID: {departamento.id} ·{" "}
                    {departamento.ativo ? "Ativo" : "Inativo"}
                  </Typography>
                </Box>

                <Stack direction="row" spacing={1}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => abrirEdicao(departamento)}
                  >
                    Editar
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    onClick={() => handleInativar(departamento)}
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
  maxWidth="xs"
>
  <Box component="form" onSubmit={handleSubmit}>
    <DialogTitle>
      {departamentoEditando
        ? 'Editar departamento'
        : 'Novo departamento'}
    </DialogTitle>

    <DialogContent>
      {erro && (
        <Alert severity="error" sx={{ mt: 1, mb: 2 }}>
          {erro}
        </Alert>
      )}

      <TextField
        autoFocus
        fullWidth
        required
        name="nome"
        label="Nome do departamento"
        value={form.nome}
        onChange={handleChange}
        sx={{ mt: 1 }}
        inputProps={{ maxLength: 100 }}
      />
    </DialogContent>

    <DialogActions sx={{ px: 3, pb: 2 }}>
      <Button
        type="button"
        onClick={fecharDialog}
        disabled={salvando}
      >
        Cancelar
      </Button>

      <Button
        type="submit"
        variant="contained"
        disabled={salvando}
      >
        {salvando ? 'Salvando...' : 'Salvar'}
      </Button>
    </DialogActions>
  </Box>
</Dialog>
    </Box>
  );
}
