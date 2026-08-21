import { Dialog, DialogTitle, DialogContent, MenuItem, Select, Button, FormControl, InputLabel } from '@mui/material';
import { useState, useEffect } from 'react';
import { listarAgendasMensais } from '../../../services/agendaMensalService';
import { gerarEscalasAutomaticas } from '../../../services/escalaService';

export default function ModalEscalaAutomatica({ open, onClose }) {
  const [agendas, setAgendas] = useState([]);
  const [selectedId, setSelectedId] = useState('');

  useEffect(() => { if(open) listarAgendasMensais().then(setAgendas); }, [open]);

  const handleGerar = async () => {
    // Aqui você envia o payload que seu backend espera (GerarEscalasMesRequestDTO)
    await gerarEscalasAutomaticas(selectedId, { /* preencha os dados do DTO aqui */ });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Gerar Escalas Automaticamente</DialogTitle>
      <DialogContent>
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel>Selecione a Agenda</InputLabel>
          <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {agendas.map(a => <MenuItem key={a.id} value={a.id}>{a.descricao}</MenuItem>)}
          </Select>
        </FormControl>
        <Button sx={{ mt: 2 }} fullWidth variant="contained" onClick={handleGerar}>Gerar Agora</Button>
      </DialogContent>
    </Dialog>
  );
}