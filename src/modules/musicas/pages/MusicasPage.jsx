import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Tooltip,
  CircularProgress,
  Link,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PageHeader from "../../../components/common/PageHeader";
import ModalMusicaForm from "../components/ModalMusicaForm";
import { listarMusicas, desativarMusica } from "../services/musicaService";

export default function MusicasPage() {
  const [musicas, setMusicas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [musicaEditando, setMusicaEditando] = useState(null);

  const carregarMusicas = async () => {
    try {
      setLoading(true);
      const data = await listarMusicas();
      setMusicas(data);
    } catch (error) {
      console.error("Erro ao carregar músicas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarMusicas();
  }, []);

  const abrirNova = () => {
    setMusicaEditando(null);
    setModalAberto(true);
  };

  const abrirEdicao = (musica) => {
    setMusicaEditando(musica);
    setModalAberto(true);
  };

  const handleExcluir = async (id) => {
    if (!window.confirm("Deseja realmente excluir esta música?")) return;
    try {
      await desativarMusica(id);
      carregarMusicas();
    } catch (error) {
      console.error("Erro ao excluir música:", error);
      alert("Erro ao excluir música.");
    }
  };

  const musicasFiltradas = musicas.filter((m) => {
    const termo = busca.toLowerCase();
    return (
      m.nome?.toLowerCase().includes(termo) ||
      m.cantor?.toLowerCase().includes(termo)
    );
  });
   return (
    <Box>
      <PageHeader
        title="Gerenciador de Músicas"
        action={
          <Button variant="contained" onClick={abrirNova}>
            Nova Música
          </Button>
        }
      />

      {/* CAMPO DE BUSCA */}
      <TextField
        fullWidth
        size="small"
        placeholder="Buscar por nome ou cantor..."
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* TABELA */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "primary.main" }}>
                <TableCell sx={{ color: "#fff" }}>Música</TableCell>
                <TableCell sx={{ color: "#fff" }}>Cantor</TableCell>
                <TableCell sx={{ color: "#fff" }}>Tom</TableCell>
                <TableCell sx={{ color: "#fff" }}>BPM</TableCell>
                <TableCell sx={{ color: "#fff" }}>Cifra</TableCell>
                <TableCell sx={{ color: "#fff" }} align="center">
                  YouTube
                </TableCell>
                <TableCell sx={{ color: "#fff" }} align="center">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {musicasFiltradas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    Nenhuma música cadastrada.
                  </TableCell>
                </TableRow>
              ) : (
                musicasFiltradas.map((m) => (
                  <TableRow key={m.id} hover>
                    <TableCell>{m.nome}</TableCell>
                    <TableCell>{m.cantor || "—"}</TableCell>
                    <TableCell>{m.tom || "—"}</TableCell>
                    <TableCell>{m.bpm || "—"}</TableCell>
                    <TableCell>{m.cifraurl || "—"}</TableCell>
                    <TableCell align="center">
                      {m.youtubeVideoId ? (
                        <Tooltip title="Abrir no YouTube">
                          <Link
                            href={`https://www.youtube.com/watch?v=${m.youtubeVideoId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <PlayCircleIcon color="error" />
                          </Link>
                        </Tooltip>
                      ) : (
                        <Chip label="Sem vídeo" size="small" color="warning" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton
                          color="primary"
                          onClick={() => abrirEdicao(m)}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton
                          color="error"
                          onClick={() => handleExcluir(m.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* MODAL DE CADASTRO/EDIÇÃO */}
      <ModalMusicaForm
        open={modalAberto}
        onClose={() => setModalAberto(false)}
        onSave={carregarMusicas}
        musica={musicaEditando}
      />
    </Box>
  );
}