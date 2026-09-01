import { useState } from "react";
import { Box, Button } from "@mui/material";
import PageHeader from "../../../components/common/PageHeader";
import ModalSelecaoPlaylist from "../components/ModalSelecaoPlaylist";
import ModalPlaylistManual from "../components/ModalPlaylistManual";
import ModalPlaylistEscala from "../components/ModalPlaylistEscala"; // O do YouTube via API que fizemos antes

export default function PlaylistPage() {
  const [modal, setModal] = useState("SELECAO"); // Inicia abrindo a seleção ou pode ser null para abrir por botão

  return (
    <Box>
      <PageHeader 
        title="Gerenciador de Playlists" 
        action={
          <Button variant="contained" onClick={() => setModal("SELECAO")}>
            Nova Playlist
          </Button>
        }
      />


      {/* Modal 1: Escolha o Tipo */}
      <ModalSelecaoPlaylist
        open={modal === "SELECAO"}
        onClose={() => setModal(null)}
        onSelectTipo={(tipo) => {
          if (tipo === "MANUAL") setModal("MANUAL");
          if (tipo === "YOUTUBE") setModal("YOUTUBE");
        }}
      />

      {/* Modal 2: Playlist Manual */}
      <ModalPlaylistManual
        open={modal === "MANUAL"}
        onClose={() => setModal(null)}
        onSave={() => setModal(null)}
      />

      {/* Modal 3: Playlist Automática via YouTube API */}
      <ModalPlaylistEscala
        open={modal === "YOUTUBE"}
        onClose={() => setModal(null)}
      />
    </Box>
  );
}