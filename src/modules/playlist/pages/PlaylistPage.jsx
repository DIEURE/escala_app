import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  CircularProgress,
  Link,
  Chip,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { IconButton, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import PageHeader from "../../../components/common/PageHeader";

import ModalSelecaoPlaylist from "../components/ModalSelecaoPlaylist";
import ModalPlaylistManual from "../components/ModalPlaylistManual";
import ModalPlaylistEscala from "../components/ModalPlaylistEscala";
import { listarEscalas } from "../../../services/escalaService";

export default function PlaylistPage() {
  const [modal, setModal] = useState(null); // "SELECAO" | "MANUAL" | "YOUTUBE" | null
  const [escalas, setEscalas] = useState([]);
  const [loading, setLoading] = useState(true);
  // Função para abrir o modal clicando no botão de editar de uma escala específica
  const handleAbrirEdicao = (escalaId) => {
    setEscalaParaEditarId(escalaId);
    setModalOpen(true);
  };

  const handleFecharModal = () => {
    setModalOpen(false);
    setEscalaParaEditarId(null);
    // Aqui você pode chamar sua função de recarregar a listagem de escalas/playlists da página
  };
  // Carrega as escalas que possuem playlist gerada
  const carregarEscalasComPlaylist = async () => {
    try {
      setLoading(true);
      const data = await listarEscalas();
      // Filtra apenas escalas que possuem youtubePlaylistUrl (manual ou automática)
      const comPlaylist = data.filter((e) => e.youtubePlaylistUrl);
      setEscalas(
        comPlaylist.sort(
          (a, b) => new Date(b.dataEscala) - new Date(a.dataEscala),
        ),
      );
    } catch (error) {
      console.error("Erro ao carregar playlists:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarEscalasComPlaylist();
  }, []);

  const formatarData = (dataString) => {
    if (!dataString) return "";
    const [ano, mes, dia] = dataString.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const handleSelectTipo = (tipo) => {
    if (tipo === "MANUAL") setModal("MANUAL");
    if (tipo === "YOUTUBE") setModal("YOUTUBE");
  };

  return (
    <Box>
      <PageHeader
        title="Gerenciador de Playlists"
        description="Visualize e crie playlists para os cultos e eventos."
        action={
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setModal("SELECAO")}
          >
            Nova Playlist
          </Button>
        }
      />

      {/* TABELA DE PLAYLISTS CRIADAS */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer
          component={Paper}
          sx={{ boxShadow: 1, border: "1px solid #e0e0e0" }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
              <TableRow>
                <TableCell>
                  <b>Data</b>
                </TableCell>
                <TableCell>
                  <b>Departamento</b>
                </TableCell>
                <TableCell>
                  <b>Culto x Evento</b>
                </TableCell>
                <TableCell>
                  <b>Link da Playlist</b>
                </TableCell>
                <TableCell align="center">
                  <b>Ações</b>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {escalas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">
                      Nenhuma playlist gerada até o momento. Clique em "Nova
                      Playlist" acima.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                escalas.map((escala) => (
                  <TableRow key={escala.id} hover>
                    <TableCell>{formatarData(escala.dataEscala)}</TableCell>
                    <TableCell>
                      <Chip
                        label={escala.nomeDepartamento || "—"}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {escala.culto || escala.nomeCultoNoite || "Culto"}
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Link
                        href={escala.youtubePlaylistUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ wordBreak: "break-all", fontSize: "0.85rem" }}
                      >
                        {escala.youtubePlaylistUrl}
                      </Link>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        variant="outlined"
                        size="small"
                        color="error"
                        startIcon={<PlayCircleIcon />}
                        href={escala.youtubePlaylistUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Ouvir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* MODAL 1: Escolha o Tipo (Manual ou YouTube) */}
      <ModalSelecaoPlaylist
        open={modal === "SELECAO"}
        onClose={() => setModal(null)}
        onSelectTipo={handleSelectTipo}
      />

 {/* Exemplo de botão na linha da tabela / card */}
      <Tooltip title="Editar Playlist Manual">
        <IconButton 
          color="primary" 
          onClick={() => handleAbrirEdicao(escala.id)} // Passe o ID da escala da linha atual
        >
          <EditIcon />
        </IconButton>
      </Tooltip>

      {/* MODAL 2: Playlist Manual (Escolher músicas e reordenar) */}
      <ModalPlaylistManual
        open={modal === "MANUAL"}
        onClose={() => setModal(null)}
        onSave={() => {
          setModal(null);
          carregarEscalasComPlaylist(); // Atualiza a tabela ao salvar
        }}
      />

      {/* MODAL 3: Playlist Automática via YouTube API */}
      <ModalPlaylistEscala
        open={modal === "YOUTUBE"}
        onClose={() => {
          setModal(null);
          carregarEscalasComPlaylist(); // Atualiza a tabela ao fechar/gerar
        }}
      />
    </Box>
  );
}
