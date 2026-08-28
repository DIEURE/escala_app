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

export default function ModalEscalaManual({ open, onClose, onSave, escalaParaEditar }) {
  const [modoEdicao, setModoEdicao] = useState(false);
  const [etapa, setEtapa] = useState(1);
  const [escalaId, setEscalaId] = useState(null);
  const [form, setForm] = useState({
    agendaMensalId: "",
    dataEscala: null,
    departamentoId: "",
    culto: "",
    horario: "",
    horarioFim: "",
    observacao: "",
  });
  const [opcoes, setOpcoes] = useState({
    agendas: [],
    departamentos: [],
    musicos: [],
  });
  const [musicosSelecionados, setMusicosSelecionados] = useState([]);
  const [erroConflito, setErroConflito] = useState(false);

  useEffect(() => {
    if (open) {
      setEtapa(1);
      setEscalaId(null);
      setMusicosSelecionados([]);
      setForm({
        agendaMensalId: "",
        dataEscala: null,
        departamentoId: "",
        culto: "",
        horario: "",
        horarioFim: "",
        observacao: "",
      });

      const carregar = async () => {
        const [resAgendas, resDept] = await Promise.all([
          api.get("/agenda-mensal"),
          api.get("/departamentos"),
        ]);
        setOpcoes({
          agendas: resAgendas.data,
          departamentos: resDept.data,
          musicos: [],
        });
      };
      carregar();
    }
  }, [open]);

  useEffect(() => {
    const checarConflito = async () => {
      // Verifica se os campos existem e se a data é um objeto dayjs válido
      const temData =
        form.dataEscala && typeof form.dataEscala.format === "function";

      if (temData && form.horario && form.departamentoId) {
        try {
          // Formata os dados exatamente como o backend espera
          const params = {
            data: form.dataEscala.format("YYYY-MM-DD"),
            horario:
              form.horario.length === 5 ? `${form.horario}:00` : form.horario,
            departamentoId: form.departamentoId,
          };

          const res = await api.get(`/escalas/verificar-conflito`, { params });

          console.log("Params enviados:", params);
          console.log("Resposta do Backend (res.data):", res.data); // ADICIONE ESTE LOG

          setErroConflito(res.data);
        } catch (err) {
          console.error("Erro na requisição de conflito:", err);
        }
      } else {
        setErroConflito(false);
      }
    };

    checarConflito();
  }, [form.dataEscala, form.horario, form.departamentoId]);

  useEffect(() => {
    if (form.departamentoId) {
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
          ? dayjs(form.dataEscala).format("YYYY-MM-DD")
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
        observacao: form.observacao || "",
      };

      const res = await api.post("/escalas", payload);
      setEscalaId(res.data.id);
      setEtapa(2); // Agora vai avançar!
    } catch (error) {
      if (error.response?.status === 400) {
        alert(
          "Atenção: Já existe uma escala cadastrada para este horário e departamento.",
        );
      } else {
        alert(
          "Erro ao salvar: " +
            (error.response?.data?.message || "Erro desconhecido"),
        );
      }
    }
  };

  const handleFinalizar = async () => {
    try {
      await api.post(
        `/escalas/${escalaId}/adicionar-musicos`,
        musicosSelecionados,
      );
      alert("Escala criada com sucesso!");
      onSave();
      onClose();
    } catch (error) {
      alert("Erro ao vincular músicos");
    }
  };

  const musicosAgrupados = opcoes.musicos.reduce((acc, m) => {
    const tipo = m.nomeInstrumento || "Outros";
    if (!acc[tipo]) acc[tipo] = [];
    acc[tipo].push(m);
    return acc;
  }, {});

  const getCount = (inst) =>
    musicosSelecionados.filter(
      (id) => opcoes.musicos.find((m) => m.id === id)?.nomeInstrumento === inst,
    ).length;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{ backgroundColor: "primary.main", color: "primary.contrastText" }}
      >
        {etapa === 1 ? "Escala Manual: Dados" : "Escala Manual: Músicos"}
      </DialogTitle>
      <DialogContent>
        {etapa === 1 ? (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Agenda</InputLabel>
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
              label="Data"
              value={form.dataEscala}
              onChange={(v) => setForm({ ...form, dataEscala: v })}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <FormControl fullWidth>
              <InputLabel>Departamento</InputLabel>
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
              label="Evento"
              fullWidth
              value={form.culto}
              onChange={(e) => setForm({ ...form, culto: e.target.value })}
            />
            <TextField
              label="Grupo"
              fullWidth
              value={form.observacao}
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
            />
            <Stack direction="row" spacing={2}>
              <TextField
                label="Início"
                type="time"
                fullWidth
                value={form.horario}
                onChange={(e) => setForm({ ...form, horario: e.target.value })}
              />
              <TextField
                label="Fim"
                type="time"
                fullWidth
                value={form.horarioFim}
                onChange={(e) =>
                  setForm({ ...form, horarioFim: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            {erroConflito && (
              <div style={{ color: "red", fontWeight: "bold" }}>
                ⚠️ Escala já existe para este horário!
              </div>
            )}
          </Stack>
        ) : (
          <List>
            {Object.keys(musicosAgrupados).map((inst) => (
              <div key={inst}>
                <Divider sx={{ mt: 2, mb: 1, fontWeight: "bold" }}>
                  {inst.toUpperCase()}
                </Divider>
                {musicosAgrupados[inst].map((m) => {
                  const lim =
                    m.quantidade_Escala ||
                    m.instrumento?.quantidade_Escala ||
                    1;
                  const count = getCount(inst);
                  const blocked =
                    !m.disponibilidade ||
                    (count >= lim && !musicosSelecionados.includes(m.id));
                  return (
                    <ListItem key={m.id} disablePadding>
                      <ListItemButton
                        disabled={blocked}
                        onClick={() =>
                          setMusicosSelecionados((prev) =>
                            prev.includes(m.id)
                              ? prev.filter((i) => i !== m.id)
                              : [...prev, m.id],
                          )
                        }
                      >
                        <Checkbox
                          checked={musicosSelecionados.includes(m.id)}
                        />
                        <ListItemText
                          primary={m.nome}
                          secondary={
                            blocked
                              ? "Limite atingido"
                              : `Quantidade Disponível: ${count}/${lim}`
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </div>
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
          // O botão fica desabilitado se o erroConflito for true
          disabled={erroConflito}
          onClick={etapa === 1 ? handleSalvarDados : handleFinalizar}
        >
          {etapa === 1 ? "Próximo" : "Finalizar Escala"}
        </Button>
        
      </DialogActions>
    </Dialog>
  );
}
