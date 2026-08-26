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
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../../services/api";

export default function ModalEscalaAutomatica({ open, onClose, onSave }) {
  const [form, setForm] = useState({
    agendaMensalId: "",
    departamentoId: "",
    nomeCultoManha: "",
    nomeCultoNoite: "",
    horarioManha: "",
    horarioNoite: "",
    repetirMesmaEquipe: false,
  });
  const [opcoes, setOpcoes] = useState({ agendas: [], departamentos: [] });

  useEffect(() => {
    if (open) {
      const carregar = async () => {
        try {
          const resAgendas = await api.get("/agenda-mensal");
          const resDept = await api.get("/departamentos");

          console.log("Agendas recebidas:", resAgendas.data); // Verifique se isso aparece no F12

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
    try {
      // Montagem do payload conforme o DTO Java
      const payload = {
        departamentoId: Number(form.departamentoId),
        tipoEscala: "AUTOMATICA", // Deve ser o valor exato do Enum
        horarioManha: form.horarioManha + ":00", // Converte "09:00" para "09:00:00" para o LocalTime
        horarioNoite: form.horarioNoite + ":00",
        nomeCultoManha: form.nomeCultoManha,
        nomeCultoNoite: form.nomeCultoNoite,
        gerarDomingos: true, // Campo obrigatório que faltava
        repetirMesmaEquipe: form.repetirMesmaEquipe, // Campo obrigatório que faltava
      };

      await api.post(
        `/agenda-mensal/${form.agendaMensalId}/gerar-escalas`,
        payload,
      );

      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao enviar:", error.response?.data);
      alert(
        "Erro na validação: verifique se todos os campos estão preenchidos.",
      );
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
              onChange={(e) =>
                setForm({ ...form, agendaMensalId: e.target.value })
              }
            >
              {opcoes.agendas.map((a) => (
                <MenuItem key={a.id} value={a.id}>
                  {/* Tente colocar a.nome ou a.descricao se mesAno não funcionar */}
                  {a.descricao || a.mes || `Agenda ${a.id}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

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
            label="Nome Culto Manhã"
            fullWidth
            value={form.nomeCultoManha}
            onChange={(e) =>
              setForm({ ...form, nomeCultoManha: e.target.value })
            }
          />
          <TextField
            label="Nome Culto Noite"
            fullWidth
            value={form.nomeCultoNoite}
            onChange={(e) =>
              setForm({ ...form, nomeCultoNoite: e.target.value })
            }
          />
          <TextField
            label="Horário Manhã"
            type="time"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={form.horarioManha}
            onChange={(e) => setForm({ ...form, horarioManha: e.target.value })}
          />
          <TextField
            label="Horário Noite"
            type="time"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={form.horarioNoite}
            onChange={(e) => setForm({ ...form, horarioNoite: e.target.value })}
          />
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
                onChange={(e) =>
                  setForm({ ...form, repetirMesmaEquipe: e.target.checked })
                }
              />
            }
            label="Repetir mesma equipe"
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
