import { useState, useEffect } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import "dayjs/locale/pt-br";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import CloseIcon from "@mui/icons-material/Close";
import {
  GiGuitarHead,
  GiDrumKit,
  GiPianoKeys,
  GiGuitar,
  GiMicrophone,
  GiGuitarBassHead,
} from "react-icons/gi";

import dayjs from "dayjs";
import api from "../../../services/api";

export default function ModalEditarEscala({ open, onClose, data, onSave }) {
  const [escalaData, setEscalaData] = useState({
    nomeCultoManha: "",
    nomeCultoNoite: "",
    dataEscala: null,
    horarioManha: "",
    horarioManhaFim: "",
    horarioNoite: "",
    horarioNoiteFim: "",
    observacao: "",
  });
  const [musicosEscalados, setMusicosEscalados] = useState([]);
  const [todosUsuarios, setTodosUsuarios] = useState([]);
  const [modalSubst, setModalSubst] = useState({
    open: false,
    index: null,
    instrumento: "",
  });

  const getIconeInstrumento = (nome) => {
    const n = nome?.toUpperCase();
    if (n === "MINISTRO" || n === "BACK-VOCAL")
      return <GiMicrophone size={20} />;
    if (n === "BAIXO") return <GiGuitarBassHead size={20} />;
    if (n === "VIOLAO") return <GiGuitarHead size={20} />;
    if (n === "GUITARRA") return <GiGuitar size={20} />;
    if (n === "TECLADO") return <GiPianoKeys size={20} />;
    if (n === "BATERIA") return <GiDrumKit size={20} />;
    return <FaUser size={18} />;
  };

  useEffect(() => {
    if (open && data) {
      setEscalaData({
        id: data.escala.id,
        nomeCultoManha: data.escala.nomeCultoManha,
        dataEscala: data.escala.dataEscala
          ? dayjs(data.escala.dataEscala)
          : null,
        horarioManha: data.escala.horarioManha?.substring(0, 5),
        horarioNoite: data.escala.horarioNoite?.substring(0, 5),
        observacao: data.escala.observacao,
      });
      setMusicosEscalados(data.musicos || []);

      // Carrega usuários para o filtro de substituição
      api.get("/usuarios").then((res) => setTodosUsuarios(res.data));
    }
  }, [open, data]);

const handleSalvar = async () => {
    const payload = {
        nomeCultoManha: escalaData.nomeCultoManha,
        dataEscala: escalaData.dataEscala ? dayjs(escalaData.dataEscala).format("YYYY-MM-DD") : null,
        horarioManha: escalaData.horarioManha.length === 5 ? escalaData.horarioManha + ":00" : escalaData.horarioManha,
        horarioManhaFim: escalaData.horarioManhaFim.length === 5 ? escalaData.horarioManhaFim + ":00" : escalaData.horarioManhaFim,
        horarioFim: escalaData.horarioNoite?.length === 5 ? escalaData.horarioNoite + ":00" : escalaData.horarioNoiteFim,
        horarioNoiteFim: escalaData.horarioNoiteFim?.length === 5 ? escalaData.horarioNoiteFim + ":00" : escalaData.horarioNoiteFim,
        observacao: escalaData.observacao,
        departamentoId: data.escala.departamentoId,
        agendaMensalId: data.escala.agendaMensalId,
        tipoEscala: data.escala.tipoEscala,
        // Envie apenas a lista de IDs:
        musicosIds: musicosEscalados.map(m => m.idUsuario).filter(id => id != null) 
    };

    try {
        console.log("Enviando Payload:", payload);
        await api.put(`/escalas/${data.escala.id}`, payload);
        onSave();
        onClose();
    } catch (error) {
        console.error("Erro no servidor:", error.response?.data);
    }
};
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
          <DialogTitle sx={{ pr: 6, position: 'relative' }}> 
  {/* Renderiza de forma limpa apenas se os valores existirem */}
  {escalaData.nomeCultoManha || escalaData.nomeCultoNoite ? (
    <>
      {escalaData.nomeCultoManha ? `${escalaData.nomeCultoManha.toUpperCase()} (${escalaData.horarioManha || ''})` : ''}
      {escalaData.nomeCultoManha && escalaData.nomeCultoNoite ? ' / ' : ''}
      {escalaData.nomeCultoNoite ? `${escalaData.nomeCultoNoite.toUpperCase()} (${escalaData.horarioNoite || ''})` : ''}
    </>
  ) : (
    'Sem Culto Cadastrado' /* Texto alternativo se ambos forem nulos */
  )}

  {/* Data formatada com segurança */}
  {escalaData.dataEscala && ` - ${new Date(escalaData.dataEscala).toLocaleDateString('pt-BR', {  
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric',
    timeZone: 'UTC'
  })}`}

  <IconButton 
    onClick={onClose} 
    sx={{ position: 'absolute', right: 8, top: 8 }}
  >
    <CloseIcon />
  </IconButton> 
</DialogTitle>
      <DialogContent dividers>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
          {/* CABEÇALHO */}
          <Grid container spacing={1} sx={{ mb: 1 }}>
            {/* <TextField
              label="Id"
              value={escalaData.id}
              onChange={(e) =>
                setEscalaData({ ...escalaData, is: e.target.value })
              }
            /> */}

            <Grid item xs={4}>
              <DatePicker
                label="Data"
                value={escalaData.dataEscala}
                onChange={(v) =>
                  setEscalaData({ ...escalaData, dataEscala: v })
                }
                slotProps={{ textField: { fullWidth: true } }}
              />
            </Grid>
            <Grid item container spacing={1}>
              <TextField
                label="Evento"
                value={escalaData.nomeCultoManha}
                onChange={(e) =>
                  setEscalaData({ ...escalaData, nomeCultoManha: e.target.value })
                }
              />
              <TextField
                label="Grupo"
                value={escalaData.observacao}
                onChange={(e) =>
                  setEscalaData({ ...escalaData, observacao: e.target.value })
                }
              />
            </Grid>
          </Grid>

          {/* CORPO (GRID ESTILO NOTA FISCAL) */}
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Função</TableCell>
                  <TableCell>Músico Escalado</TableCell>
                  <TableCell align="center">Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {musicosEscalados.map((m, index) => (
                  <TableRow key={index}>
                    <TableCell
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      {getIconeInstrumento(m.instrumento)}
                      {m.instrumento}
                    </TableCell>
                    <TableCell>{m.nomeUsuario || "VAGO"}</TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() =>
                          setModalSubst({
                            open: true,
                            index,
                            instrumento: m.instrumento,
                          })
                        }
                      >
                        Substituir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </LocalizationProvider>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="error">
          Cancelar
        </Button>
        <Button variant="contained" color="warning" onClick={handleSalvar}>
          Atualizar
        </Button>
      </DialogActions>

      {/* MODAL DE SUBSTITUIÇÃO */}
      <Dialog
        open={modalSubst.open}
        onClose={() => setModalSubst({ open: false })}
      >
        <DialogTitle>Substituir {modalSubst.instrumento}</DialogTitle>
        <DialogContent sx={{ minWidth: 300 }}>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Novo Músico</InputLabel>
            <Select
              onChange={(e) => {
                const novo = todosUsuarios.find((u) => u.id === e.target.value);

                // VERIFICAÇÃO: Se o músico já estiver escalado em outra função, bloqueia
                const jaEscalado = musicosEscalados.some(
                  (m) => m.idUsuario === novo.id,
                );
                if (jaEscalado) {
                  alert("Este músico já está escalado nesta escala!");
                  return;
                }

                const lista = [...musicosEscalados];
                lista[modalSubst.index] = {
                  ...lista[modalSubst.index],
                  idUsuario: novo.id,
                  nomeUsuario: novo.nome,
                };
                setMusicosEscalados(lista);
                setModalSubst({ open: false });
              }}
            >
              {todosUsuarios
                .filter(
                  (u) =>
                    u.nomeInstrumento === modalSubst.instrumento &&
                    u.disponibilidade,
                )
                .map((u) => (
                  <MenuItem key={u.id} value={u.id}>
                    {u.nome}
                  </MenuItem>
                ))}
            </Select>
          </FormControl>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
}
