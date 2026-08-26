import { Dialog, DialogTitle, DialogContent, Button, Stack } from '@mui/material';

export default function ModalSeletorTipo({ open, onClose, onSelect }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Como deseja gerar a escala?</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Button variant="outlined" size="large" onClick={() => onSelect('MANUAL')}>
            ESCALA MANUAL
          </Button>
          <Button variant="contained" size="large" onClick={() => onSelect('AUTOMATICA')}>
            ESCALA AUTOMÁTICA
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}