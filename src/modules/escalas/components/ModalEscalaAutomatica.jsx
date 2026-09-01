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
  Grid,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../../services/api";

export default function ModalEscalaAutomatica({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    agendaMensalId: "",
    departamentoId: "",
    nomeCultoManha: "",
    horarioManha: "",
    horarioManhaFim: "",
    nomeCultoNoite: "",
    horarioNoite: "",
    horarioNoiteFim: "",
    gerarDomingos: true,
    repetirMesmaEquipe: false,
  });

  const [opcoes, setOpcoes] = useState({ agendas: [], departamentos: [] });
  const [gerarManha, setGerarManha] = useState(false);

  useEffect(() => {
    if (open) {
      const carregar = async () => {
        try {
          const resAgendas = await api.get("/agenda-mensal");
          const resDept = await api.get("/departamentos");
          setOpcoes({
            agendas: Array.isArray(resAgendas.data) ? resAgendas.data : [],
            departamentos: Array.isArray(resDept.data) ? resDept.data : [],
          });
        } catch (err) {
          console.error("Erro ao carregar dados:", err);
        }
      };
      carregar();
    }
  }, [open]);

  const handleGerar = async () => {
    // Validação básica antes de enviar
    if (!form.agendaMensalId || !form.departamentoId) {
      alert("Selecione a Agenda Mensal e o Departamento!");
      return;
    }
    if (!form.nomeCultoNoite || !form.horarioNoite) {
      alert("Preencha os dados obrigatórios do culto da Noite!");
      return;
    }
    if (gerarManha && (!form.nomeCultoManha || !form.horarioManha)) {
      alert("Você ativou o período Matutino. Preencha o nome e horário da Manhã!");
      return;
    }

    const formatarTempo = (t) => (t ? t + ":00" : null);

    const payload = {
      departamentoId: Number(form.departamentoId),
      tipoEscala: "AUTOMATICA",
      gerarDomingos: form.gerarDomingos,
      repetirMesmaEquipe: gerarManha ? form.repetirMesmaEquipe : false,

      // NOITE (sempre enviado)
      nomeCultoNoite: form.nomeCultoNoite,
      horarioNoite: formatarTempo(form.horarioNoite),
      horarioNoiteFim: formatarTempo(form.horarioNoiteFim),

      // MANHÃ (envia null se não marcou "gerarManha")
      nomeCultoManha: gerarManha ? form.nomeCultoManha : null,
      horarioManha: gerarManha ? formatarTempo(form.horarioManha) : null,
      horarioManhaFim: gerarManha ? formatarTempo(form.horarioManhaFim) : null,
    };

    try {
      await api.post(`/agenda-mensal/${form.agendaMensalId}/gerar-escalas`, payload);
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao enviar:", error.response?.data);
      // Exibe a mensagem de erro específica do backend, se houver
      const msgErro = error.response?.data?.message || "Erro ao gerar escala. Verifique os campos.";
      alert(msgErro);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Gerar Escala Automática</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Agenda Mensal</InputLabel>
            <Select
              value={form.agendaMensalId}
              label="Agenda Mensal"
              onChange={(e) =>
                setForm({ ...form, agendaMensalId: e.target.value })
              }
            >
              {opcoes.agendas.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {a.descricao || a.mes || `Agenda ${a.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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

          <FormControlLabel
            control={
              <Switch
                checked={gerarManha}
                onChange={(e) => {
                  setGerarManha(e.target.checked);
                  if (!e.target.checked) {
                    setForm({
                      ...form,
                      nomeCultoManha: "",
                      horarioManha: "",
                      horarioManhaFim: "",
                      repetirMesmaEquipe: false,
                    });
                  }
                }}
              />
            }
            label="Gerar para período Matutino"
          />

          {gerarManha && (
            <>
              <TextField
                label="Nome Culto Manhã"
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
            </>
          )}

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

          <FormControlLabel
            control={
              <Switch
                checked={form.gerarDomingos}
                onChange={(e) =>
                  setForm({ ...form, gerarDomingos: e.target.checked })
                }
              />
            }
            label="Gerar para Domingos"
          />

          <FormControlLabel
            control={
              <Switch
                checked={form.repetirMesmaEquipe}
                disabled={!gerarManha}
                onChange={(e) =>
                  setForm({ ...form, repetirMesmaEquipe: e.target.checked })
                }
              />
            }
            label="Repetir mesma equipe (apenas matutino)"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleGerar}>
          Gerar Agora
        </Button>
      </DialogActions>
    </Dialog>
  );
}