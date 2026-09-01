import { useEffect, useState } from "react";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import TableCell from "@mui/material/TableCell";
import PageHeader from "../../../components/common/PageHeader";
import ModalEscalaManual from "../components/ModalEscalaManual";
import ModalEscalaAutomatica from "../components/ModalEscalaAutomatica";
import ModalDetalhesEscala from "../components/ModalDetalhesEscala";
import ModalEditarEscala from "../components/ModalEditarEscala";

import api from "../../../services/api";  

import {
  listarEscalas,
  buscarDetalhesEscala,
} from "../../../services/escalaService";

export default function EscalasPage() {
  const [modal, setModal] = useState(null);
  const [escalas, setEscalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [escalaSelecionada, setEscalaSelecionada] = useState(null);
  const [filtroMes, setFiltroMes] = useState("TODOS");

  const escalasFiltradas = escalas.filter((e) => {
    if (filtroMes === "TODOS") return true;
    const mesEscala = e.dataEscala?.split("-")[1];
    return mesEscala === filtroMes;
  });

  const handleMudarStatus = async (id, novoStatus) => {
    try {
      await api.patch(`/escalas/${id}/status`, novoStatus, {
        headers: { "Content-Type": "application/json" },
      });
      alert("Status atualizado com sucesso!");
      carregarEscalas(); // Recarrega a lista após mudar status
    } catch (error) {
      console.error("Erro ao mudar status:", error);
    }
  };

  async function carregarEscalas() {
    try {
      setLoading(true);
      const data = await listarEscalas();
      const ordenadas = data.sort(
        (a, b) => new Date(a.dataEscala) - new Date(b.dataEscala)
      );
      setEscalas(ordenadas);
    } catch (error) {
      console.error("Erro ao listar escalas", error);
    } finally {
      setLoading(false);
    }
  }

  const formatarData = (dataString) => {
    if (!dataString) return "";
    const [ano, mes, dia] = dataString.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  // Formata a hora para exibir só HH:mm (remove os segundos)
  const formatarHora = (hora) => {
    if (!hora) return "—"; // Traço quando não tem (manhã opcional)
    return hora.substring(0, 5); // "09:00:00" vira "09:00"
  };

  const handleAbrirDetalhes = async (escala) => {
    const detalhes = await buscarDetalhesEscala(escala.id);
    setEscalaSelecionada(detalhes);
    setModal("DETALHES");
  };

  useEffect(() => {
    carregarEscalas();
  }, []);

  return (
    <Box>
      <PageHeader
        title="Escalas"
        action={
          <Button variant="contained" onClick={() => setModal("SELECAO")}>
            Nova Escala
          </Button>
        }
      />

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 24 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Box sx={{ display: "flex", gap: 2, mb: 2, p: 2, alignItems: "center" }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Filtrar por Mês</InputLabel>
              <Select
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
                label="Filtrar por Mês"
              >
                <MenuItem value="TODOS">Todos os Meses</MenuItem>
                {[
                  "01", "02", "03", "04", "05", "06",
                  "07", "08", "09", "10", "11", "12",
                ].map((m) => (
                  <MenuItem key={m} value={m}>
                    Mês {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Table sx={{ minWidth: 700 }} aria-label="customized table">
            <TableHead sx={{ backgroundColor: "#C9C9C9" }}>
              <TableRow>
                <TableCell><b>Data</b></TableCell>
                <TableCell><b>Culto Manhã</b></TableCell>
                <TableCell><b>Horário Manhã</b></TableCell>
                <TableCell><b>Culto Noite</b></TableCell>
                <TableCell><b>Horário Noite</b></TableCell>
                <TableCell align="center"><b>Ações</b></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {escalasFiltradas.map((escala) => (
                <TableRow key={escala.id} hover>
                  <TableCell>{formatarData(escala.dataEscala)}</TableCell>

                  {/* COLUNA CULTO MANHÃ */}
                  <TableCell>
                    {escala.nomeCultoManha ? (
                      escala.nomeCultoManha
                    ) : (
                      <Typography variant="caption" color="text.disabled">
                        — Sem culto matutino —
                      </Typography>
                    )}
                  </TableCell>

                  {/* COLUNA HORÁRIO MANHÃ */}
                  <TableCell>
                    {escala.nomeCultoManha ? (
                      `${formatarHora(escala.horarioManha)} às ${formatarHora(escala.horarioManhaFim)}`
                    ) : (
                      "—"
                    )}
                  </TableCell>

                  {/* COLUNA CULTO NOITE */}
                  <TableCell>{escala.nomeCultoNoite}</TableCell>

                  {/* COLUNA HORÁRIO NOITE */}
                  <TableCell>
                    {`${formatarHora(escala.horarioNoite)} às ${formatarHora(escala.horarioNoiteFim)}`}
                  </TableCell>

                  {/* AÇÕES */}
                  <TableCell align="center">
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => handleAbrirDetalhes(escala)}
                    >
                      Ver Detalhes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* MODAL DE SELEÇÃO */}
      <Dialog
        open={modal === "SELECAO"}
        onClose={() => setModal(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Como gerar a escala?</DialogTitle>
        <DialogContent>
          <Button
            fullWidth
            variant="outlined"
            sx={{ mb: 2 }}
            onClick={() => setModal("MANUAL")}
          >
            ESCALA MANUAL
          </Button>
          <Button
            fullWidth
            variant="contained"
            onClick={() => setModal("AUTOMATICA")}
          >
            ESCALA AUTOMÁTICA
          </Button>
        </DialogContent>
      </Dialog>

      <ModalDetalhesEscala
        open={modal === "DETALHES"}
        onClose={() => setModal(null)}
        data={escalaSelecionada}
        onEdit={() => setModal("EDITAR_FISCAL")}
      />

      <ModalEditarEscala
        open={modal === "EDITAR_FISCAL"}
        onClose={() => setModal(null)}
        data={escalaSelecionada}
        onSave={() => {
          carregarEscalas();
          setModal(null);
        }}
      />

      <ModalEscalaAutomatica
        open={modal === "AUTOMATICA"}
        onClose={() => setModal(null)}
        onSave={() => {
          carregarEscalas();
          setModal(null);
        }}
      />

      <ModalEscalaManual
        open={modal === "MANUAL"}
        onClose={() => setModal(null)}
        onSave={() => {
          carregarEscalas();
          setModal(null);
        }}
      />
    </Box>
  );
}