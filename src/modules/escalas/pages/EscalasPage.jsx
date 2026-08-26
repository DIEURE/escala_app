import { useEffect, useState } from "react";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import { styled } from '@mui/material/styles';
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
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import PageHeader from "../../../components/common/PageHeader";
import ModalEscalaManual from "../components/ModalEscalaManual";
import ModalEscalaAutomatica from "../components/ModalEscalaAutomatica";
import ModalDetalhesEscala from "../components/ModalDetalhesEscala";
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
    const mesEscala = e.dataEscala.split("-")[1]; // Pega o mês (ex: '08')
    return mesEscala === filtroMes;
  });

  const handleMudarStatus = async (id, novoStatus) => {
    try {
        await api.patch(`/escalas/${id}/status`, novoStatus, {
            headers: { 'Content-Type': 'application/json' }
        });
        alert("Status atualizado com sucesso!");
        // Chame sua função de recarregar a lista aqui
    } catch (error) {
        console.error("Erro ao mudar status:", error);
    }
};

  async function carregarEscalas() {
    try {
      setLoading(true);
      const data = await listarEscalas();
      // Ordenação simples garantida
      const ordenadas = data.sort(
        (a, b) => new Date(a.dataEscala) - new Date(b.dataEscala),
      );
      setEscalas(ordenadas);
    } catch (error) {
      console.error("Erro ao listar escalas", error);
    } finally {
      setLoading(false);
    }
  }

  // Função para formatar data sem erro de fuso (-1 dia)
  const formatarData = (dataString) => {
    if (!dataString) return "";
    const [ano, mes, dia] = dataString.split("-");
    return `${dia}/${mes}/${ano}`;
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
        <TableContainer component={Paper} >
          <Box sx={{ display: "flex", gap: 2, mb: 2, alignItems: "center" }}>
            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>Filtrar por Mês</InputLabel>
              <Select
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
                label="Filtrar por Mês"
              >
                <MenuItem value="TODOS">Todos os Meses</MenuItem>
                {[
                  "01",
                  "02",
                  "03",
                  "04",
                  "05",
                  "06",
                  "07",
                  "08",
                  "09",
                  "10",
                  "11",
                  "12",
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
                <TableCell>
                  <b>Data</b>
                </TableCell>
                <TableCell>
                  <b>Hr.Início</b>
                </TableCell>
                <TableCell>
                  <b>Hr.Fim</b>
                </TableCell>
                <TableCell>
                  <b>Culto</b>
                </TableCell>
                <TableCell align="center">
                  <b>Ações</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {escalasFiltradas.map((escala) => (
                <TableRow
                  key={escala.id}
                  hover
                  sx={{
                    // Se a escala não estiver ativa, deixa um fundo levemente amarelado ou vermelho
                    backgroundColor: escala.ativa ? "inherit" : "#ffffff",
                  }}
                >
                  <TableCell>{formatarData(escala.dataEscala)}</TableCell>
                  <TableCell>{escala.horario}</TableCell>
                  <TableCell>{escala.horarioFim}</TableCell>
                  <TableCell>
                    {escala.culto}
                    {!escala.ativa && (
                      <Typography
                        variant="caption"
                        color="error"
                        sx={{ ml: 1 }}
                      >
                        (Pendente)
                      </Typography>
                    )}
                  </TableCell>
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

      {/* Modais mantidos conforme sua estrutura anterior */}
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

      <ModalEscalaManual
        open={modal === "MANUAL"}
        onClose={() => setModal(null)}
        onSave={carregarEscalas}
      />
      <ModalEscalaAutomatica
        open={modal === "AUTOMATICA"}
        onClose={() => setModal(null)}
        onSave={carregarEscalas}
      />
      <ModalDetalhesEscala
        open={modal === "DETALHES"}
        onClose={() => setModal(null)}
        data={escalaSelecionada}
      />
    </Box>
  );
}
