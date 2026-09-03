 import {
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  Box,
} from "@mui/material";

export default function ModalSelecaoPlaylist({ open, onClose, onSelectTipo }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle
        sx={{ backgroundColor: "primary.main", color: "primary.contrastText" }}
      >
        Montando a PlayList YouTube?
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            sx={{ mb: 2, py: 1.5 }}
            onClick={() => {
              if (onSelectTipo) onSelectTipo("MANUAL");
            }}
          >
            🎵 MONTAR PLAYLIST
             
          </Button>
         {/*  <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{ py: 1.5 }}
            onClick={() => {
              if (onSelectTipo) onSelectTipo("YOUTUBE");
            }}
          >
            ▶️ PLAYLIST YOUTUBE
            <br />
            <small>(Gerar automática)</small>
          </Button> */}
        </Box>
      </DialogContent>
    </Dialog>
  );
}  