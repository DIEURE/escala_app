import { Dialog, DialogTitle, DialogContent, TextField, Stack, Button, DialogActions } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import { useState } from 'react';
import { criarEscala } from '../../../services/escalaService';

export default function ModalEscalaManual({ open, onClose, onSave }) {
  const [form, setForm] = useState({ dataEscala: null, horario: '', culto: '', departamentoId: '' });

  const handleSave = async () => {
    // Formata a data para yyyy-MM-dd
    const dataFormatada = form.dataEscala ? form.dataEscala.toISOString().split('T')[0] : null;
    await criarEscala({ ...form, dataEscala: dataFormatada, tipoEscala: 'MANUAL' });
    onSave();
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Criar Escala Manual</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <DatePicker label="Data da Escala" value={form.dataEscala} onChange={(d) => setForm({...form, dataEscala: d})} />
          <TextField label="Horário (HH:mm)" value={form.horario} onChange={(e) => setForm({...form, horario: e.target.value})} />
          <TextField label="Nome do Culto" value={form.culto} onChange={(e) => setForm({...form, culto: e.target.value})} />
          <TextField label="ID Departamento" type="number" value={form.departamentoId} onChange={(e) => setForm({...form, departamentoId: e.target.value})} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleSave}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
}