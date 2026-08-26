import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormControlLabel,
  Switch,
  Checkbox,
  ListItemText,
  List,
  ListItem,
  ListItemButton,
  Divider,
} from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useEffect, useState } from "react";
import api from "../../../services/api";

export default function ModalEscalaManual({ open, onClose, onSave }) {
  const [etapa, setEtapa] = useState(1); // 1: Dados, 2: Músicos
  const [escalaId, setEscalaId] = useState(null);
  const [form, setForm] = useState({
    agendaMensalId: "",
    dataEscala: null,
    departamentoId: "",
    culto: "",
    horario: "",
    horarioFim: "",
  });

  const [opcoes, setOpcoes] = useState({
    agendas: [],
    departamentos: [],
    musicos: [],
  });
  const [musicosSelecionados, setMusicosSelecionados] = useState([]);

  useEffect(() => {
    if (open) {
      const carregar = async () => {
        const resAgendas = await api.get("/agenda-mensal");
        const resDept = await api.get("/departamentos");
        setOpcoes((prev) => ({
          ...prev,
          agendas: resAgendas.data,
          departamentos: resDept.data,
        }));
      };
      carregar();
    }
  }, [open]);

  // Busca a agenda selecionada para pegar o mês e ano
  const agendaSelecionada = opcoes.agendas.find(
    (a) => a.id === form.agendaMensalId,
  );

  // Define os limites do calendário baseado na agenda
  const minDate = agendaSelecionada
    ? dayjs(`${agendaSelecionada.ano}-${agendaSelecionada.mes}-01`)
    : null;
  const maxDate = minDate ? minDate.endOf("month") : null;

  // Buscar músicos quando departamento muda
  useEffect(() => {
    if (form.departamentoId) {
      // Agora apontamos para o seu novo endpoint no UsuarioController
      api
        .get(`/usuarios/departamento/${form.departamentoId}`)
        .then((res) => setOpcoes((prev) => ({ ...prev, musicos: res.data })));
    }
  }, [form.departamentoId]);

  const handleSalvarDados = async () => {
    try {
      const payload = {
        agendaMensalId: form.agendaMensalId,
        departamentoId: Number(form.departamentoId),
        dataEscala: form.dataEscala
          ? form.dataEscala.format("YYYY-MM-DD")
          : null,
        tipoEscala: "MANUAL",
        horario:
          form.horario.length === 5 ? `${form.horario}:00` : form.horario,
        horarioFim: form.horarioFim
          ? form.horarioFim.length === 5
            ? `${form.horarioFim}:00`
            : form.horarioFim
          : null,
        culto: form.culto,
        observacao: form.observacao,
      };
      const res = await api.post("/escalas", payload);
      setEscalaId(res.data.id);
      setEtapa(2);
    } catch (error) {
      console.error("Erro completo:", error); // Veja o log detalhado no F12
      if (error.response) {
        console.error("Dados do erro:", error.response.data);
        alert("Erro do servidor: " + JSON.stringify(error.response.data));
      } else {
        alert("Erro na rede ou no processamento da resposta");
      }
    }
  };

  const handleFinalizar = async () => {
    try {
      // Certifique-se que escalaId não é nulo
      if (!escalaId) return;

      // musicosSelecionados é um array de IDs (ex: [1, 5, 8])
      await api.post(
        `/escalas/${escalaId}/adicionar-musicos`,
        musicosSelecionados,
      );

      alert("Escala criada e músicos vinculados com sucesso!");
      onSave(); // Recarrega a tela de escalas principal
      onClose(); // Fecha o modal
    } catch (error) {
      console.error("Erro ao vincular músicos:", error);
      alert("Erro ao finalizar escala.");
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
      <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
        <DialogTitle>
          {etapa === 1
            ? "Escala Manual: Dados"
            : "Escala Manual: Selecionar Músicos"}
        </DialogTitle>
        <DialogContent>
          {etapa === 1 ? (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Agenda Mensal</InputLabel>
                <Select
                  value={form.agendaMensalId}
                  onChange={(e) =>
                    setForm({ ...form, agendaMensalId: e.target.value })
                  }
                >
                  {opcoes.agendas.map((a) => (
                    <MenuItem key={a.id} value={a.id}>
                      {a.descricao}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <DatePicker
                label="Data da Escala"
                value={form.dataEscala}
                minDate={minDate}
                maxDate={maxDate}
                disabled={!form.agendaMensalId}
                onChange={(newValue) =>
                  setForm({ ...form, dataEscala: newValue })
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
              <InputLabel>Departamento</InputLabel>
              <FormControl fullWidth>
                <Select
                  value={form.departamentoId}
                  onChange={(e) =>
                    setForm({ ...form, departamentoId: e.target.value })
                  }
                >
                  {opcoes.departamentos.map((d) => (
                    <MenuItem key={d.id} value={d.id}>
                      {d.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="Nome Evento"
                fullWidth
                value={form.culto}
                onChange={(e) => setForm({ ...form, culto: e.target.value })}
              />
              <InputLabel>Inicio</InputLabel>
              <TextField
                //label="Horário de Início"
                type="time"
                value={form.horario}
                onChange={(e) => setForm({ ...form, horario: e.target.value })}
              />
              <InputLabel>Fim</InputLabel>
              <TextField
                //label="Horário de Fim"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={form.horarioFim}
                onChange={(e) =>
                  setForm({ ...form, horarioFim: e.target.value })
                }
              />
            </Stack>
          ) : (
            <List>
              {opcoes.musicos.map((m) => (
                <ListItem
                  key={m.id}
                  style={{ opacity: m.disponibilidade ? 1 : 0.5 }}
                >
                  <ListItemButton
                    disabled={!m.disponibilidade} // Bloqueia a seleção se ele não estiver disponível
                    onClick={() => {
                      /* sua lógica de selecionar */
                    }}
                  >
                    <Checkbox checked={musicosSelecionados.includes(m.id)} />
                    <ListItemText
                      primary={`${m.nome} ${m.disponibilidade ? "" : "(Indisponível)"}`}
                      secondary={`Instumento: ${m.nomeInstrumento}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          {etapa === 1 ? (
            <Button onClick={onClose}>Cancelar</Button>
          ) : (
            <Button onClick={() => setEtapa(1)}>Voltar</Button>
          )}
          <Button
            variant="contained"
            onClick={etapa === 1 ? handleSalvarDados : handleFinalizar}
          >
            {etapa === 1 ? "Próximo" : "Finalizar Escala"}
          </Button>
        </DialogActions>
      </Dialog>
    </LocalizationProvider>
  );
}
