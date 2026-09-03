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
  IconButton,   
  Grid,   
  Paper 
} from "@mui/material"; 
import SearchIcon from "@mui/icons-material/Search"; 
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward"; 
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward"; 
import DeleteIcon from "@mui/icons-material/Delete"; 
import { useEffect, useState } from "react"; 
import api from "../../../services/api"; 
import { listarEscalas, listarMusicasDaPlaylistManual } from "../../../services/escalaService";  

export default function ModalPlaylistManual({ open, onClose, onSave, escalaInicialId }) {   
  const [escalas, setEscalas] = useState([]);   
  const [escalaSelecionadaId, setEscalaSelecionadaId] = useState("");   
  const [loadingEscalas, setLoadingEscalas] = useState(false);    
  const [musicas, setMusicas] = useState([]);   
  const [selecionadas, setSelecionadas] = useState([]); // Array de IDs na ordem   
  const [busca, setBusca] = useState("");    
  const [salvando, setSalvando] = useState(false);   
  const [playlistUrl, setPlaylistUrl] = useState("");   
  const [avisoDuplicada, setAvisoDuplicada] = useState("");    
  
  // 🎵 NOVO ESTADO: Título personalizado da playlist
  const [tituloPlaylistManual, setTituloPlaylistManual] = useState("");

  useEffect(() => {
    if (open) {
      setBusca("");
      setPlaylistUrl("");
      setAvisoDuplicada("");
      setTituloPlaylistManual("");
      
      const inicializarModal = async () => {
        await Promise.all([carregarEscalas(), carregarMusicas()]);

        if (escalaInicialId) {
          setEscalaSelecionadaId(escalaInicialId);
        } else {
          setEscalaSelecionadaId("");
          setSelecionadas([]);
        }
      };

      inicializarModal();
    }
  }, [open, escalaInicialId]);

  // Atualiza o título padrão da playlist sempre que a escala selecionada mudar
  useEffect(() => {
    if (escalaSelecionadaId) {
      const escalaAtual = escalas.find(e => e.id === Number(escalaSelecionadaId));
      if (escalaAtual) {
        const dataFormatada = formatarData(escalaAtual.dataEscala);
        const culto = escalaAtual.nomeCultoNoite || escalaAtual.nomeCultoManha || "Culto";
        setTituloPlaylistManual(`${culto}-${dataFormatada}`);
      }

      const carregarMusicasSalvasDaEscala = async () => {
        try {
          const data = await listarMusicasDaPlaylistManual(escalaSelecionadaId);
          const idsSalvos = data.map((item) => item.id);
          setSelecionadas(idsSalvos);
        } catch (err) {
          console.error("Erro ao carregar músicas salvas da escala", err);
          setSelecionadas([]);
        }
      };
      carregarMusicasSalvasDaEscala();
    } else {
      if (!escalaInicialId) {
        setSelecionadas([]);
        setTituloPlaylistManual("");
      }
    }
  }, [escalaSelecionadaId, escalas]);

  const carregarEscalas = async () => {     
    try {       
      setLoadingEscalas(true);       
      const data = await listarEscalas();       
      setEscalas(data.sort((a, b) => new Date(a.dataEscala) - new Date(b.dataEscala)));     
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

  const formatarData = (dataString) => {     
    if (!dataString) return "";     
    const [ano, mes, dia] = dataString.split("-");     
    return `${dia}/${mes}/${ano}`;   
  };    

  const toggleMusica = (musica) => {     
    setAvisoDuplicada("");          
    if (selecionadas.includes(musica.id)) {       
      setSelecionadas((prev) => prev.filter((i) => i !== musica.id));       
      return;     
    }      

    if (musica.youtubeVideoId) {       
      const jaTemMesmoVideo = selecionadas.some((idSelecionado) => {         
        const m = musicas.find((item) => item.id === idSelecionado);         
        return m && m.youtubeVideoId === musica.youtubeVideoId;       
      });        

      if (jaTemMesmoVideo) {         
        setAvisoDuplicada(`⚠️ A música "${musica.nome}" (ou o mesmo vídeo do YouTube) já foi adicionada!`);         
        return;       
      }     
    }      

    setSelecionadas((prev) => [...prev, musica.id]);   
  };    

  const moverParaCima = (index) => {     
    if (index === 0) return;     
    const novaLista = [...selecionadas];     
    const temp = novaLista[index];     
    novaLista[index] = novaLista[index - 1];     
    novaLista[index - 1] = temp;     
    setSelecionadas(novaLista);   
  };    

  const moverParaBaixo = (index) => {     
    if (index === selecionadas.length - 1) return;     
    const novaLista = [...selecionadas];     
    const temp = novaLista[index];     
    novaLista[index] = novaLista[index + 1];     
    novaLista[index + 1] = temp;     
    setSelecionadas(novaLista);   
  };    

  const removerSelecionada = (id) => {     
    setSelecionadas((prev) => prev.filter((i) => i !== id));   
  };  

  const handleSalvar = async () => {     
    if (!escalaSelecionadaId) {       
      alert("Selecione uma escala primeiro!");       
      return;     }     
    if (!setTituloPlaylistManual.trim()) {
      alert("Digite um nome para a playlist!");
      return;
    }
    if (selecionadas.length === 0) {       
      alert("Selecione pelo menos uma música!");       
      return;     }     

    try {       
      setSalvando(true);       
      setPlaylistUrl("");              
      
      // Enviando um objeto contendo o título e a lista de músicas (ou ajuste conforme o seu DTO no backend)
      const res = await api.post(         
        `/escalas/${escalaSelecionadaId}/playlist-manual`,         
        {
          titulo: setTituloPlaylistManual,
          musicasIds: selecionadas
        }
      );              

      setPlaylistUrl(res.data);       
      if (onSave) onSave(res.data);     
    } catch (error) {       
      console.error("Erro ao salvar playlist:", error);       
      alert("Erro ao salvar playlist manual.");     
    } finally {       
      setSalvando(false);     
    }   
  };    

  const musicasFiltradas = musicas.filter((m) => {     
    const termo = busca.toLowerCase();     
    return (       
      m.nome?.toLowerCase().includes(termo) ||       
      m.cantor?.toLowerCase().includes(termo)     );   
  });    

  return (     
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">       
      <DialogTitle sx={{ backgroundColor: "primary.main", color: "primary.contrastText" }}>         
        Montar / Editar Playlist Manual       
      </DialogTitle>       
      <DialogContent>         
        {/* SELETOR DE ESCALA */}         
        <Box sx={{ mt: 2, mb: 2 }}>           
          {loadingEscalas ? (             
            <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>               
              <CircularProgress size={24} />             
            </Box>           ) : (             
            <FormControl fullWidth>               
              <InputLabel>Selecione a Escala</InputLabel>               
              <Select                 
                value={escalaSelecionadaId}                 
                label="Selecione a Escala"                 
                onChange={(e) => setEscalaSelecionadaId(e.target.value)}               >                 
                {escalas.map((escala) => {                   
                  const dataFormatada = formatarData(escala.dataEscala);                   
                  const cultos = [                     
                    escala.nomeCultoManha ? `Manhã: ${escala.nomeCultoManha}` : null,                     
                    escala.nomeCultoNoite ? `Noite: ${escala.nomeCultoNoite}` : null,                   ]                     
                    .filter(Boolean)                     
                    .join(" | ");                    

                  return (                     
                    <MenuItem key={escala.id} value={escala.id}>                       
                      {dataFormatada} {cultos ? `- ${cultos}` : ""}                     
                    </MenuItem>                   );                 })}               
              </Select>             
            </FormControl>           )}         
        </Box>          

        {/* 🎵 CAMPO PARA EDITAR O NOME DA PLAYLIST */}
        {escalaSelecionadaId && (
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              label="Nome da Playlist no YouTube"
              value={setTituloPlaylistManual}
              onChange={(e) => setTituloPlaylistManual(e.target.value)}
              helperText="Você pode personalizar o nome que aparecerá no YouTube."
            />
          </Box>
        )}

        <Divider sx={{ mb: 2 }} />          

        {escalaSelecionadaId ? (           
          <Grid container spacing={3}>             
            {/* COLUNA DA ESQUERDA: LISTA DE MÚSICAS CADASTRadas */}             
            <Grid item xs={12} md={6}>               
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>                 
                Catálogo de Músicas               
              </Typography>               
              <TextField                 
                fullWidth                 
                size="small"                 
                placeholder="Buscar música ou cantor..."                 
                value={busca}                 
                onChange={(e) => setBusca(e.target.value)}                 
                sx={{ mb: 1 }}                 
                InputProps={{                   
                  startAdornment: (                     
                    <InputAdornment position="start">                       
                      <SearchIcon />                     
                    </InputAdornment>                   ),                 }}               />               
              {avisoDuplicada && (                 
                <Typography variant="caption" color="error" sx={{ display: "block", mb: 1, fontWeight: "bold" }}>                   
                  {avisoDuplicada}                 
                </Typography>               )}               
              <List sx={{ maxHeight: 300, overflow: "auto", border: "1px solid #e0e0e0", borderRadius: 1 }}>                 
                {musicasFiltradas.map((m) => {                   
                  const estaSelecionada = selecionadas.includes(m.id);                   
                  return (                     
                    <ListItem key={m.id} disablePadding>                       
                      <ListItemButton onClick={() => toggleMusica(m)}>                         
                        <Checkbox checked={estaSelecionada} />                         
                        <ListItemText                           
                          primary={m.nome}                           
                          secondary={`${m.cantor || "—"} • Tom: ${m.tom || "—"}`}                         />                       
                      </ListItemButton>                     </ListItem>                   );                 })}               
              </List>             
            </Grid>              

            {/* COLUNA DA DIREITA: MÚSICAS SELECIONADAS E ORDENADAS */}             
            <Grid item xs={12} md={6}>               
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>                 
                Ordem da Playlist ({selecionadas.length})               </Typography>               
              <Paper variant="outlined" sx={{ maxHeight: 345, overflow: "auto", p: 1, bgcolor: "#fafafa" }}>                 
                {selecionadas.length === 0 ? (                   
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>                     
                    Nenhuma música selecionada ainda. Clique nas músicas ao lado.                   </Typography>                 ) : (                   
                  <List dense>                     
                    {selecionadas.map((id, index) => {                       
                      const m = musicas.find((item) => item.id === id);                       
                      if (!m) return null;                       
                      return (                         
                        <ListItem                           
                          key={id}                           
                          sx={{ bgcolor: "white", mb: 1, border: "1px solid #ddd", borderRadius: 1 }}                           
                          secondaryAction={                             
                            <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>                               
                              <IconButton size="small" onClick={() => moverParaCima(index)} disabled={index === 0}>                                 
                                <ArrowUpwardIcon fontSize="small" />                               
                              </IconButton>                               
                              <IconButton size="small" onClick={() => moverParaBaixo(index)} disabled={index === selecionadas.length - 1}>                                 
                                <ArrowDownwardIcon fontSize="small" />                               
                              </IconButton>                               
                              <IconButton size="small" color="error" onClick={() => removerSelecionada(id)}>                                 
                                <DeleteIcon fontSize="small" />                               
                              </IconButton>                             
                            </Box>                           }                         >                           
                          <Chip label={index + 1} color="primary" size="small" sx={{ mr: 1, fontWeight: 'bold' }} />                           
                          <ListItemText primary={m.nome} secondary={m.cantor} />                         
                        </ListItem>                       );                     })}                   </List>                 )}               </Paper>             </Grid>           </Grid>         ) : (           <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 3 }}>             
            Selecione uma escala acima para montar a playlist.           </Typography>         )}         

        {playlistUrl && (            
          <Box sx={{ mt: 3, p: 2, border: "1px solid #ddd", borderRadius: 2, backgroundColor: "#f9f9f9", textAlign: "center" }}>              
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>                
              🎵 Playlist: {tituloPlaylistManual}              
            </Typography>              
            <Typography variant="subtitle2" gutterBottom>Gerada com Sucesso! 🎉</Typography>              
            <Link href={playlistUrl} target="_blank" rel="noopener noreferrer" sx={{ wordBreak: "break-all", display: "block", mb: 1 }}>                
              {playlistUrl}              
            </Link>            
          </Box>          
        )}       
      </DialogContent>       
      <DialogActions>         
        <Button onClick={onClose} disabled={salvando}>Fechar</Button>         
        <Button variant="contained" onClick={handleSalvar} disabled={!escalaSelecionadaId || selecionadas.length === 0 || salvando}>           
          {salvando ? "Salvando..." : `Salvar Playlist (${selecionadas.length})`}         
        </Button>       
      </DialogActions>     
    </Dialog>   
  ); 
}