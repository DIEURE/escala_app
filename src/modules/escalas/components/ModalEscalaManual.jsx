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
  Grid,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import { useEffect, useState } from "react";
import api from "../../../services/api";

export default function ModalEscalaManual({ open, onClose, onSave }) {
  const [etapa, setEtapa] = useState(1);
  const [escalaId, setEscalaId] = useState(null);
  
  const [form, setForm] = useState({
    agendaMensalId: "",
    dataEscala: null,
    departamentoId: "",
    turno: "NOITE", // "MANHA", "NOITE", "AMBOS"
    
    nomeCultoManha: "",
    horarioManha: "",
    horarioManhaFim: "",
    
    nomeCultoNoite: "",
    horarioNoite: "",
    horarioNoiteFim: "",
    
    observacao: "",
  });

  const [opcoes, setOpcoes] = useState({
    agendas: [],
    departamentos: [],
    musicos: [],
  });
  
  const [musicosSelecionados, setMusicosSelecionados] = useState([]);

  useEffect(() => {
    if (open) {
      setEtapa(1);
      setEscalaId(null);
      setMusicosSelecionados([]);
      setForm({
        agendaMensalId: "",
        dataEscala: null,
        departamentoId: "",
        turno: "NOITE",
        nomeCultoManha: "",
        horarioManha: "",
        horarioManhaFim: "",
        nomeCultoNoite: "",
        horarioNoite: "",
        horarioNoiteFim: "",
        observacao: "",
      });

      const carregar = async () => {
        try {
          const [resAgendas, resDept] = await Promise.all([
            api.get("/agenda-mensal"),
            api.get("/departamentos"),
          ]);
          setOpcoes({
            agendas: Array.isArray(resAgendas.data) ? resAgendas.data : [],
            departamentos: Array.isArray(resDept.data) ? resDept.data : [],
            musicos: [],
          });
        } catch (err) {
          console.error("Erro ao carregar dados:", err);
        }
      };
      carregar();
    }
  }, [open]);

  useEffect(() => {
    if (form.departamentoId) {
      api
        .get(`/usuarios/departamento/${form.departamentoId}`)
        .then((res) => {
          setOpcoes((prev) => ({
            ...prev,
            musicos: Array.isArray(res.data) ? res.data : [],
          }));
        })
        .catch((err) => console.error("Erro ao carregar músicos", err));
    }
  }, [form.departamentoId]);

const handleSalvarDados = async () => {
    // 1. Validações gerais básicas
    if (!form.agendaMensalId) {
      alert("Selecione a Agenda Mensal!");
      return;
    }
    if (!form.dataEscala) {
      alert("Selecione a Data da Escala!");
      return;
    }
    if (!form.departamentoId) {
      alert("Selecione o Departamento!");
      return;
    }

    // 2. Validações específicas por Turno Escolhido
    if (form.turno === "MANHA" || form.turno === "AMBOS") {
      if (!form.nomeCultoManha || form.nomeCultoManha.trim() === "") {
        alert("Preencha o Nome do Culto da Manhã!");
        return;
      }
      if (!form.horarioManha) {
        alert("Preencha o Horário de Início da Manhã!");
        return;
      }
    }

    if (form.turno === "NOITE" || form.turno === "AMBOS") {
      if (!form.nomeCultoNoite || form.nomeCultoNoite.trim() === "") {
        alert("Preencha o Nome do Culto da Noite!");
        return;
      }
      if (!form.horarioNoite) {
        alert("Preencha o Horário de Início da Noite!");
        return;
      }
    }

    const formatarTempo = (t) => (t ? (t.length === 5 ? `${t}:00` : t) : null);

    try {
      const payload = {
        agendaMensalId: Number(form.agendaMensalId),
        departamentoId: Number(form.departamentoId),
        dataEscala: dayjs(form.dataEscala).format("YYYY-MM-DD"),
        tipoEscala: "MANUAL",
        observacao: form.observacao || "",

        // Noite (Envia se for NOITE ou AMBOS, senão null)
        nomeCultoNoite: form.turno === "NOITE" || form.turno === "AMBOS" ? form.nomeCultoNoite : null,
        horarioNoite: form.turno === "NOITE" || form.turno === "AMBOS" ? formatarTempo(form.horarioNoite) : null,
        horarioNoiteFim: form.turno === "NOITE" || form.turno === "AMBOS" ? formatarTempo(form.horarioNoiteFim) : null,

        // Manhã (Envia se for MANHA ou AMBOS, senão null)
        nomeCultoManha: form.turno === "MANHA" || form.turno === "AMBOS" ? form.nomeCultoManha : null,
        horarioManha: form.turno === "MANHA" || form.turno === "AMBOS" ? formatarTempo(form.horarioManha) : null,
        horarioManhaFim: form.turno === "MANHA" || form.turno === "AMBOS" ? formatarTempo(form.horarioManhaFim) : null,
      };

      const res = await api.post("/escalas", payload);
      setEscalaId(res.data.id);
      setEtapa(2); // Avança para a escolha de músicos
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert(
        "Erro ao salvar: " +
          (error.response?.data?.message || "Erro desconhecido")
      );
    }
  };

  const handleFinalizar = async () => {
    try {
      await api.post(
        `/escalas/${escalaId}/adicionar-musicos`,
        musicosSelecionados
      );
      alert("Escala criada com sucesso!");
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao vincular músicos:", error);
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
      (id) => opcoes.musicos.find((m) => m.id === id)?.nomeInstrumento === inst
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
                label="Agenda"
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
              onChange={(v) => setForm({ ...form, dataEscala: v })}
              slotProps={{ textField: { fullWidth: true } }}
            />

            <FormControl fullWidth>
              <InputLabel>Departamento</InputLabel>
              <Select
                value={form.departamentoId}
                label="Departamento"
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

            <FormControl fullWidth>
              <InputLabel>Turno da Escala</InputLabel>
              <Select
                value={form.turno}
                label="Turno da Escala"
                onChange={(e) => setForm({ ...form, turno: e.target.value })}
              >
                <MenuItem value="NOITE">Apenas Noite</MenuItem>
                <MenuItem value="MANHA">Apenas Manhã</MenuItem>
                <MenuItem value="AMBOS">Ambos (Manhã e Noite)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Observação Geral"
              fullWidth
              value={form.observacao}
              onChange={(e) => setForm({ ...form, observacao: e.target.value })}
            />

            <Divider />

            {(form.turno === "MANHA" || form.turno === "AMBOS") && (
              <>
                <Typography variant="subtitle2" color="primary">
                  Descrição do Evento (*Ensaio/Culto/Outros)
                </Typography>
                <TextField
                  label="Digite aqui a descrição do evento"
                  fullWidth
                  value={form.nomeCultoManha}
                  onChange={(e) =>
                    setForm({ ...form, nomeCultoManha: e.target.value })
                  }
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Início Manhã"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      value={form.horarioManha}
                      onChange={(e) =>
                        setForm({ ...form, horarioManha: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Fim Manhã"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      value={form.horarioManhaFim}
                      onChange={(e) =>
                        setForm({ ...form, horarioManhaFim: e.target.value })
                      }
                    />
                  </Grid>
                </Grid>
                <Divider />
              </>
            )}

            {(form.turno === "NOITE" || form.turno === "AMBOS") && (
              <>
                <Typography variant="subtitle2" color="primary">
                  Dados do Culto Noturno
                </Typography>
                <TextField
                  label="Nome Culto Noite"
                  fullWidth
                  value={form.nomeCultoNoite}
                  onChange={(e) =>
                    setForm({ ...form, nomeCultoNoite: e.target.value })
                  }
                />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <TextField
                      label="Início Noite"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      value={form.horarioNoite}
                      onChange={(e) =>
                        setForm({ ...form, horarioNoite: e.target.value })
                      }
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Fim Noite"
                      type="time"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      value={form.horarioNoiteFim}
                      onChange={(e) =>
                        setForm({ ...form, horarioNoiteFim: e.target.value })
                      }
                    />
                  </Grid>
                </Grid>
              </>
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
                              : [...prev, m.id]
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
          onClick={etapa === 1 ? handleSalvarDados : handleFinalizar}
        >
          {etapa === 1 ? "Próximo" : "Finalizar Escala"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}