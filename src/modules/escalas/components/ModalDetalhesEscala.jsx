import { Dialog, DialogTitle, DialogContent, DialogActions, Button, IconButton, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';

import CloseIcon from '@mui/icons-material/Close'; 
import { GiGuitarHead, GiDrumKit, GiPianoKeys, GiGuitar, GiMicrophone, GiGuitarBassHead } from 'react-icons/gi'; 
import { FaUser, FaFilePdf, FaYoutube } from 'react-icons/fa';
import api from '../../../services/api'; // Certifique-se de importar sua instância do axios

export default function ModalDetalhesEscala({ open, onClose, data, onEdit }) { 
  if (!data) return null; 

  const { escala, musicos } = data; 

  const getIconeInstrumento = (nome) => { 
    const n = nome?.toUpperCase(); 
    if (n === 'MINISTRO' || n === 'BACK-VOCAL') return <GiMicrophone size={20} />; 
    if (n === 'BAIXO') return <GiGuitarBassHead size={20} />; 
    if (n === 'VIOLAO') return <GiGuitarHead size={20} />; 
    if (n === 'GUITARRA') return <GiGuitar size={20} />; 
    if (n === 'TECLADO') return <GiPianoKeys size={20} />; 
    if (n === 'BATERIA') return <GiDrumKit size={20} />; 
    return <FaUser size={18} />; 
  }; 

  const handleGerarPdf = () => {
    window.open(`http://localhost:8090/escalas/${escala.id}/pdf`, '_blank');
  };

  const handleGerarPlaylist = async () => {
    try {
        const response = await api.post(`/escalas/${escala.id}/gerar-playlist`);
        alert("Playlist gerada com sucesso!");
        window.open(response.data, '_blank');
    } catch (error) {
        alert("Erro ao gerar playlist.");
    }
  };

  return ( 
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"> 
      <DialogTitle> 
        {escala.culto} - {escala.dataEscala} 
        <IconButton onClick={onClose} sx={{ float: 'right' }}><CloseIcon /></IconButton> 
      </DialogTitle> 
              
      <DialogContent dividers> 
        <TableContainer component={Paper} elevation={0}> 
          <Table size="small"> 
            <TableHead> 
              <TableRow> 
                <TableCell><strong>Função</strong></TableCell> 
                <TableCell align="right"><strong>Músico</strong></TableCell> 
              </TableRow> 
            </TableHead> 
            <TableBody> 
              {musicos && musicos.map((item, index) => ( 
                <TableRow key={index} hover> 
                  <TableCell sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}> 
                    {getIconeInstrumento(item.instrumento)} 
                    {item.instrumento} 
                  </TableCell> 
                  <TableCell align="right">{item.nomeUsuario || "Vago"}</TableCell> 
                </TableRow> 
              ))} 
            </TableBody> 
          </Table> 
        </TableContainer> 
      </DialogContent>

      <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
        <Box>
            <Button startIcon={<FaYoutube />} onClick={handleGerarPlaylist} color="error" size="small">Playlist</Button>
            <Button startIcon={<FaFilePdf />} onClick={handleGerarPdf} color="secondary" size="small">PDF</Button>
        </Box>
        <Button variant="contained" onClick={() => onEdit(escala)}>Editar</Button>
      </DialogActions>
    </Dialog> 
  ); 
}