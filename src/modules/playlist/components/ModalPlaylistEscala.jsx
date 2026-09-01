 import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Link,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { listarEscalas } from "../../../services/escalaService";

export default function ModalPlaylistEscala({ open, onClose }) {
  const [escalas, setEscalas] = useState([]);
  const [escalaSelecionadaId, setEscalaSelecionadaId] = useState("");
  const [playlistUrl, setPlaylistUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingEscalas, setLoadingEscalas] = useState(false);

  // Carrega a lista de escalas quando o modal abre
  useEffect(() => {
    if (open) {
      setEscalaSelecionadaId("");
      setPlaylistUrl("");
      carregarEscalas();
    }
  }, [open]);

  const carregarEscalas = async () => {
    try {
      setLoadingEscalas(true);
      const data = await listarEscalas();
      // Ordena por data mais recente ou mais antiga
      const ordenadas = data.sort(
        (a, b) => new Date(a.dataEscala) - new Date(b.dataEscala)
      );
      setEscalas(ordenadas);
    } catch (error) {
      console.error("Erro ao listar escalas para o select:", error);
    } finally {
      setLoadingEscalas(false);
    }
  };

  // Formata a data de AAAA-MM-DD para DD/MM/AAAA
  const formatarData = (dataString) => {
    if (!dataString) return "";
    const [ano, mes, dia] = dataString.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const handleGerarPlaylist = async () => {
    if (!escalaSelecionadaId) {
      alert("Selecione uma escala!");
      return;
    }

    try {
      setLoading(true);
      setPlaylistUrl("");
      
      const response = await api.post(`/escalas/${escalaSelecionadaId}/gerar-playlist`);
      setPlaylistUrl(response.data);
    } catch (error) {
      console.error("Erro ao gerar playlist:", error);
      alert(
        "Erro ao gerar playlist: " +
          (error.response?.data?.message || "Erro interno ao gerar playlist.")
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(playlistUrl);
    alert("Link copiado para a área de transferência!");
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ backgroundColor: "primary.main", color: "primary.contrastText" }}>
        Gerar Playlist do YouTube
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {loadingEscalas ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <FormControl fullWidth>
              <InputLabel>Selecione a Escala</InputLabel>
              <Select
                value={escalaSelecionadaId}
                label="Selecione a Escala"
                onChange={(e) => setEscalaSelecionadaId(e.target.value)}
              >
                {escalas.map((escala) => {
                  const dataFormatada = formatarData(escala.dataEscala);
                  const cultos = [
                    escala.nomeCultoManha ? `Manhã: ${escala.nomeCultoManha}` : null,
                    escala.nomeCultoNoite ? `Noite: ${escala.nomeCultoNoite}` : null,
                  ]
                    .filter(Boolean)
                    .join(" | ");

                  return (
                    <MenuItem key={escala.id} value={escala.id}>
                      {dataFormatada} {cultos ? `- ${cultos}` : ""}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          )}

          <Button
            variant="contained"
            disabled={loading || !escalaSelecionadaId}
            onClick={handleGerarPlaylist}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Gerar Playlist"}
          </Button>

          {playlistUrl && (
            <Box
              sx={{
                p: 2,
                border: "1px solid #ddd",
                borderRadius: 2,
                backgroundColor: "#f9f9f9",
                textAlign: "center",
              }}
            >
              <Typography variant="subtitle2" gutterBottom>
                Playlist Gerada com Sucesso! 🎉
              </Typography>
              <Link
                href={playlistUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ wordBreak: "break-all", display: "block", mb: 2 }}
              >
                {playlistUrl}
              </Link>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCopiarLink}
                fullWidth
              >
                Copiar Link
              </Button>
            </Box>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
}  


 