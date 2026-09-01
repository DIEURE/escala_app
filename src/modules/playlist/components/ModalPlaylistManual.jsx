import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Chip,
  Box,
  Typography,
  Divider,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Link,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useState } from "react";
import api from "../../../services/api";
import { listarEscalas } from "../../../services/escalaService";

export default function ModalPlaylistManual({ open, onClose, onSave }) {
  // Escalas
  const [escalas, setEscalas] = useState([]);
  const [escalaSelecionadaId, setEscalaSelecionadaId] = useState("");
  const [loadingEscalas, setLoadingEscalas] = useState(false);

  // Músicas
  const [musicas, setMusicas] = useState([]);
  const [selecionadas, setSelecionadas] = useState([]); // IDs na ordem de clique
  const [busca, setBusca] = useState("");

  // Controle
  const [salvando, setSalvando] = useState(false);
  const [playlistUrl, setPlaylistUrl] = useState("");

  // Carrega escalas e músicas quando o modal abre
  useEffect(() => {
    if (open) {
      setEscalaSelecionadaId("");
      setSelecionadas([]);
      setBusca("");
      setPlaylistUrl("");
      carregarEscalas();
      carregarMusicas();
    }
  }, [open]);

  const carregarEscalas = async () => {
    try {
      setLoadingEscalas(true);
      const data = await listarEscalas();
      const ordenadas = data.sort(
        (a, b) => new Date(a.dataEscala) - new Date(b.dataEscala)
      );
      setEscalas(ordenadas);
    } catch (error) {
      console.error("Erro ao listar escalas:", error);
    } finally {
      setLoadingEscalas(false);
    }
  };

  const carregarMusicas = async () => {
    try {
      const res = await api.get("/musicas");
      setMusicas(res.data);
    } catch (err) {
      console.error("Erro ao carregar músicas", err);
    }
  };

  // Formata data AAAA-MM-DD -> DD/MM/AAAA
  const formatarData = (dataString) => {
    if (!dataString) return "";
    const [ano, mes, dia] = dataString.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const toggleMusica = (id) => {
    setSelecionadas((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSalvar = async () => {
    if (!escalaSelecionadaId) {
      alert("Selecione uma escala primeiro!");
      return;
    }
    if (selecionadas.length === 0) {
      alert("Selecione pelo menos uma música!");
      return;
    }
    try {
      setSalvando(true);
      setPlaylistUrl("");
      const res = await api.post(
        `/escalas/${escalaSelecionadaId}/playlist-manual`,
        selecionadas
      );
      setPlaylistUrl(res.data); // a URL gerada
      if (onSave) onSave(res.data);
    } catch (error) {
      console.error("Erro ao salvar playlist:", error);
      alert("Erro ao salvar playlist manual.");
    } finally {
      setSalvando(false);
    }
  };

  const handleCopiarLink = () => {
    navigator.clipboard.writeText(playlistUrl);
    alert("Link copiado para a área de transferência!");
  };

  // Filtra músicas pela busca (nome ou cantor)
  const musicasFiltradas = musicas.filter((m) => {
    const termo = busca.toLowerCase();
    return (
      m.nome?.toLowerCase().includes(termo) ||
      m.cantor?.toLowerCase().includes(termo)
    );
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle
        sx={{ backgroundColor: "primary.main", color: "primary.contrastText" }}
      >
        Montar Playlist Manual
      </DialogTitle>
      <DialogContent>
        {/* SELETOR DE ESCALA */}
        <Box sx={{ mt: 2, mb: 2 }}>
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
                    escala.nomeCultoManha
                      ? `Manhã: ${escala.nomeCultoManha}`
                      : null,
                    escala.nomeCultoNoite
                      ? `Noite: ${escala.nomeCultoNoite}`
                      : null,
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
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* SÓ MOSTRA AS MÚSICAS APÓS ESCOLHER A ESCALA */}
        {escalaSelecionadaId ? (
          <>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Clique nas músicas na ordem que deseja tocá-las. O número indica a
              posição na playlist.
            </Typography>

            <TextField
              fullWidth
              size="small"
              placeholder="Buscar por nome ou cantor..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              sx={{ mb: 1 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <List sx={{ maxHeight: 320, overflow: "auto" }}>
              {musicasFiltradas.length === 0 ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", py: 2 }}
                >
                  Nenhuma música encontrada.
                </Typography>
              ) : (
                musicasFiltradas.map((m) => {
                  const posicao = selecionadas.indexOf(m.id);
                  const estaSelecionada = posicao !== -1;
                  return (
                    <ListItem key={m.id} disablePadding>
                      <ListItemButton onClick={() => toggleMusica(m.id)}>
                        <Checkbox checked={estaSelecionada} />
                        {estaSelecionada && (
                          <Chip
                            label={posicao + 1}
                            color="primary"
                            size="small"
                            sx={{ mr: 1, minWidth: 32 }}
                          />
                        )}
                        <ListItemText
                          primary={m.nome}
                          secondary={
                            <Box component="span">
                              {m.cantor || "—"} • Tom: {m.tom || "—"}
                              {!m.youtubeVideoId && (
                                <Chip
                                  label="Sem vídeo YouTube"
                                  color="warning"
                                  size="small"
                                  sx={{ ml: 1, height: 18, fontSize: 10 }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })
              )}
            </List>
          </>
        ) : (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 3 }}
          >
            Selecione uma escala acima para escolher as músicas.
          </Typography>
        )}

        {/* RESULTADO: LINK GERADO */}
        {playlistUrl && (
          <Box
            sx={{
              mt: 2,
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={salvando}>
          Fechar
        </Button>
        <Button
          variant="contained"
          onClick={handleSalvar}
          disabled={!escalaSelecionadaId || selecionadas.length === 0 || salvando}
        >
          {salvando
            ? "Gerando..."
            : `Gerar Playlist (${selecionadas.length})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}