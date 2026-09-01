import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import {
  GiGuitarHead,
  GiDrumKit,
  GiPianoKeys,
  GiGuitar,
  GiMicrophone,
  GiGuitarBassHead,
} from "react-icons/gi";
import { FaUser, FaFilePdf, FaYoutube } from "react-icons/fa";
import api from "../../../services/api"; // Certifique-se de importar sua instância do axios

export default function ModalDetalhesEscala({ open, onClose, data, onEdit }) {
  if (!data) return null;

  const { escala, musicos } = data;

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

  const handleGerarPdf = () => {
    window.open(`http://localhost:8090/escalas/${escala.id}/pdf`, "_blank");
  };

 

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
     <DialogTitle sx={{ pr: 6, position: 'relative' }}> 
  {/* Renderiza de forma limpa apenas se os valores existirem */}
  {escala.nomeCultoManha || escala.nomeCultoNoite ? (
    <>
      {escala.nomeCultoManha ? `${escala.nomeCultoManha.toUpperCase()} (${escala.horarioManha || ''})` : ''}
      {escala.nomeCultoManha && escala.nomeCultoNoite ? ' / ' : ''}
      {escala.nomeCultoNoite ? `${escala.nomeCultoNoite.toUpperCase()} (${escala.horarioNoite || ''})` : ''}
    </>
  ) : (
    'Sem Culto Cadastrado' /* Texto alternativo se ambos forem nulos */
  )}

  {/* Data formatada com segurança */}
  {escala.dataEscala && ` - ${new Date(escala.dataEscala).toLocaleDateString('pt-BR', {  
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
        <TableContainer component={Paper} elevation={0}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>
                  <strong>Função</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Músico</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {musicos &&
                musicos.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell
                      sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                    >
                      {getIconeInstrumento(item.instrumento)}
                      {item.instrumento}
                    </TableCell>
                    <TableCell align="right">
                      {item.nomeUsuario || "Vago"}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Box>
 
          <Button
            startIcon={<FaFilePdf />}
            onClick={handleGerarPdf}
            color="secondary"
            size="small"
          >
            PDF
          </Button>
        </Box>
        <Button variant="contained" onClick={() => onEdit(escala)}>
          Editar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
