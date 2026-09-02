import { useEffect, useState } from "react";
import { Box, Paper, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, CircularProgress, Link } from "@mui/material";
import PageHeader from "../../../components/common/PageHeader";
import { listarEscalas } from "../../../services/escalaService";
import AdminLayout from "../../../components/layout/AdminLayout";

export default function PlaylistsSalvasPage() {
  const [escalasComPlaylist, setEscalasComPlaylist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        setLoading(true);
        const data = await listarEscalas();
        // Filtra apenas escalas que possuem link de playlist gerado
        const filtradas = data.filter((e) => e.youtubePlaylistUrl);
        setEscalasComPlaylist(filtradas);
      } catch (error) {
        console.error("Erro ao carregar escalas com playlist", error);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, []);

  const formatarData = (dataString) => {
    if (!dataString) return "";
    const [ano, mes, dia] = dataString.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  return (
    <AdminLayout>
      <Box>
        <PageHeader title="Playlists Salvas" description="Lista de escalas que já possuem playlist do YouTube gerada." />

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell><b>Data</b></TableCell>
                  <TableCell><b>Departamento</b></TableCell>
                  <TableCell><b>Culto X Evento</b></TableCell>
                  <TableCell><b>Link da Playlist</b></TableCell>
                  <TableCell align="center"><b>Ações</b></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {escalasComPlaylist.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      Nenhuma escala com playlist gerada no momento.
                    </TableCell>
                  </TableRow>
                ) : (
                  escalasComPlaylist.map((e) => (
                    <TableRow key={e.id} hover>
                      <TableCell>{formatarData(e.dataEscala)}</TableCell>
                      <TableCell>{e.nomeDepartamento || "—"}</TableCell>
                      <TableCell>{e.culto || e.nomeCultoNoite || "Culto"}</TableCell>
                      <TableCell>
                        <Link href={e.youtubePlaylistUrl} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: "break-all" }}>
                          {e.youtubePlaylistUrl}
                        </Link>
                      </TableCell>
                      <TableCell align="center">
                        <Button variant="outlined" size="small" href={e.youtubePlaylistUrl} target="_blank">
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
      </Box>
    </AdminLayout>
  );
}