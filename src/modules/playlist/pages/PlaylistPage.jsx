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
  IconButton,
  Tooltip,
  Stack,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
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
  
  // 💡 Novo estado para guardar qual escala está sendo editada
  const [escalaParaEditarId, setEscalaParaEditarId] = useState(null);

  // Função para abrir o modal em modo de edição de uma escala específica
  const handleAbrirEdicao = (escalaId) => {
    setEscalaParaEditarId(escalaId);
    setModal("MANUAL"); // Abre o modal manual
  };

  const handleFecharModal = () => {
    setModal(null);
    setEscalaParaEditarId(null);
    carregarEscalasComPlaylist(); // Atualiza a tabela após fechar
  };

  // Carrega as escalas que possuem playlist gerada
  const carregarEscalasComPlaylist = async () => {
    try {
      setLoading(true);
      const data = await listarEscalas();
      // Filtra apenas escalas que possuem link de playlist (manual ou automática)
      const comPlaylist = data.filter((e) => e.youtubePlaylistUrl || e.linkPlaylistManual);
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
    if (tipo === "MANUAL") {
      setEscalaParaEditarId(null); // Limpa para criar nova
      setModal("MANUAL");
    }
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
            onClick={() => {
              setEscalaParaEditarId(null); // Nova playlist limpa
              setModal("SELECAO");
            }}
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
                escalas.map((escala) => {
                  const linkUrl = escala.youtubePlaylistUrl || escala.linkPlaylistManual;
                  return (
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
                        {escala.culto || escala.nomeCultoNoite || escala.nomeCultoManha || "Culto"}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Link
                          href={linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{ wordBreak: "break-all", fontSize: "0.85rem" }}
                        >
                          {linkUrl}
                        </Link>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
                          {/* Botão Ouvir */}
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<PlayCircleIcon />}
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Ouvir
                          </Button>

                          {/* 💡 Botão de Editar Playlist Manual */}
                          <Tooltip title="Editar Playlist Manual">
                            <IconButton
                              color="primary"
                              size="small"
                              onClick={() => handleAbrirEdicao(escala.id)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
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

      {/* MODAL 2: Playlist Manual (Criar ou Editar com ID inicial) */}
      <ModalPlaylistManual
        open={modal === "MANUAL"}
        onClose={handleFecharModal}
        onSave={handleFecharModal}
        escalaInicialId={escalaParaEditarId}
      />

      {/* MODAL 3: Playlist Automática via YouTube API */}
        {/* <ModalPlaylistEscala
        open={modal === "YOUTUBE"}
        onClose={handleFecharModal}
      />   */}
    </Box>
  );
}