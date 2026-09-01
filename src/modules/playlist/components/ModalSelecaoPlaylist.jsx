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
        Como gerar a playlist?
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            size="large"
            sx={{ mb: 2, py: 1.5 }}
            onClick={() => onSelectTipo("MANUAL")}
          >
            🎵 PLAYLIST MANUAL
            <br />
            <small>(Escolher músicas cadastradas)</small>
          </Button>
          <Button
            fullWidth
            variant="contained"
            size="large"
            sx={{ py: 1.5 }}
            onClick={() => onSelectTipo("YOUTUBE")}
          >
            ▶️ PLAYLIST YOUTUBE
            <br />
            <small>(Gerar automática)</small>
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
}