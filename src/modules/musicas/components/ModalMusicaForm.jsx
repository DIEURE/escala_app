import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Grid,
  Chip,
  Box,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  salvarMusica,
  atualizarMusica,
  extrairYoutubeVideoId,
} from "../services/musicaService";

const ESTADO_INICIAL = {
  nome: "",
  cantor: "",
  tom: "",
  bpm: "",
  youtubeVideoId: "",
  cifraUrl: "",
  cifraTexto: "",
};

export default function ModalMusicaForm({ open, onClose, onSave, musica }) {
  const [form, setForm] = useState(ESTADO_INICIAL);
  const [linkYoutube, setLinkYoutube] = useState("");
  const [salvando, setSalvando] = useState(false);

  const editando = Boolean(musica?.id);

  useEffect(() => {
    if (open) {
      if (editando) {
        setForm({
          nome: musica.nome || "",
          cantor: musica.cantor || "",
          tom: musica.tom || "",
          bpm: musica.bpm || "",
          youtubeVideoId: musica.youtubeVideoId || "",
          cifraUrl: musica.cifraUrl || "",
          cifraTexto: musica.cifraTexto || "",
        });
        // Reconstrói o link a partir do ID para exibir no campo
        setLinkYoutube(
          musica.youtubeVideoId
            ? `https://www.youtube.com/watch?v=${musica.youtubeVideoId}`
            : ""
        );
      } else {
        setForm(ESTADO_INICIAL);
        setLinkYoutube("");
      }
    }
  }, [open, musica]);

  const handleChange = (campo) => (e) => {
    setForm((prev) => ({ ...prev, [campo]: e.target.value }));
  };

  // Ao digitar/colar o link, extrai o ID automaticamente
  const handleLinkChange = (e) => {
    const valor = e.target.value;
    setLinkYoutube(valor);
    const id = extrairYoutubeVideoId(valor);
    setForm((prev) => ({ ...prev, youtubeVideoId: id }));
  };

  const handleSalvar = async () => {
    if (!form.nome.trim()) {
      alert("O nome da música é obrigatório!");
      return;
    }
    try {
      setSalvando(true);
      const dados = {
        ...form,
        bpm: form.bpm ? Number(form.bpm) : null,
      };

      if (editando) {
        await atualizarMusica(musica.id, dados);
      } else {
        await salvarMusica(dados);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error("Erro ao salvar música:", error);
      alert("Erro ao salvar música.");
    } finally {
      setSalvando(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{ backgroundColor: "primary.main", color: "primary.contrastText" }}
      >
        {editando ? "Editar Música" : "Nova Música"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 2 }}>
          <TextField
            label="Nome da Música *"
            value={form.nome}
            onChange={handleChange("nome")}
            fullWidth
            autoFocus
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Cantor / Artista"
                value={form.cantor}
                onChange={handleChange("cantor")}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="Tom"
                placeholder="Ex: G, Am"
                value={form.tom}
                onChange={handleChange("tom")}
                fullWidth
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <TextField
                label="BPM"
                type="number"
                value={form.bpm}
                onChange={handleChange("bpm")}
                fullWidth
              />
            </Grid>
          </Grid>

          {/* LINK DO YOUTUBE COM EXTRAÇÃO AUTOMÁTICA */}
          <Box>
            <TextField
              label="Link do YouTube"
              placeholder="Cole aqui o link do vídeo"
              value={linkYoutube}
              onChange={handleLinkChange}
              fullWidth
            />
            {form.youtubeVideoId ? (
              <Box sx={{ mt: 1, display: "flex", alignItems: "center", gap: 1 }}>
                <Chip
                  label={`ID detectado: ${form.youtubeVideoId}`}
                  color="success"
                  size="small"
                />
                <Typography variant="caption" color="text.secondary">
                  ✔ Link válido
                </Typography>
              </Box>
            ) : (
              linkYoutube && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: "block" }}>
                  ⚠ Não foi possível detectar o ID do vídeo neste link.
                </Typography>
              )
            )}
          </Box>

          <TextField
            label="Link da Cifra (opcional)"
            placeholder="Ex: link do CifraClub"
            value={form.cifraUrl}
            onChange={handleChange("cifraUrl")}
            fullWidth
          />

          <TextField
            label="Cifra / Letra (opcional)"
            value={form.cifra}
            onChange={handleChange("cifra")}
            fullWidth
            multiline
            rows={4}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={salvando}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSalvar} disabled={salvando}>
          {salvando ? "Salvando..." : "Salvar"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}