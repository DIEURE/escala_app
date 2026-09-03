 

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  CircularProgress,
  Chip,
  Alert
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { youtubeService } from "../../../../services/youtubeService"; // Importando o service criado

export default function YoutubeConfigPage() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [temRefreshToken, setTemRefreshToken] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  // Declarada como function para evitar erro de referência antes da inicialização
  async function carregarConfiguracoes() {
    try {
      setLoading(true);
      const data = await youtubeService.getConfiguracoes();
      if (data) {
        setClientId(data.clientId || "");
        setClientSecret(data.clientSecret || "");
        setRedirectUri(data.redirectUri || "");
        setTemRefreshToken(!!data.refreshToken);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações do YouTube", error);
      setMensagem({ tipo: "error", texto: "Erro ao carregar as configurações." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarConfiguracoes();

    // Verifica se o Google redirecionou de volta com o ?code=...
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      handleCallbackGoogle(code);
    }
  }, []);

  const handleCallbackGoogle = async (code) => {
    try {
      setLoading(true);
      await youtubeService.conectarCallback(code);
      setMensagem({ tipo: "success", texto: "Conta do YouTube conectada e Token gerado com sucesso! 🎉" });
      
      // Limpa o ?code= da URL
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Recarrega as configs
      await carregarConfiguracoes();
    } catch (error) {
      console.error("Erro no callback do Google", error);
      setMensagem({ tipo: "error", texto: error.response?.data || "Erro ao autenticar com o Google." });
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      setSalvando(true);
      setMensagem(null);
      
      await youtubeService.salvarConfiguracoes({
        clientId,
        clientSecret,
        redirectUri,
      }
    );
    console.log(youtubeService);

      setMensagem({ tipo: "success", texto: "Credenciais salvas com sucesso! Agora você pode conectar a conta. 🎉" });
    } catch (error) {
      console.error("Erro ao salvar", error);
      setMensagem({ tipo: "error", texto: "Erro ao salvar as configurações." });
    } finally {
      setSalvando(false);
    }
  };

  const handleConectarGoogle = async () => {
    try {
      const authUrl = await youtubeService.getAuthUrl();
      window.location.href = authUrl; // Redireciona para o Google
    } catch (error) {
      console.error("Erro ao obter URL de autenticação", error);
      alert(error.response?.data || "Erro ao iniciar conexão com o YouTube.");
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 600, mx: "auto" }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", color: "primary.main" }}>
            ⚙️ Configuração da API do YouTube
          </Typography>
          {temRefreshToken ? (
            <Chip icon={<CheckCircleIcon />} label="Conectado ao YouTube" color="success" variant="outlined" />
          ) : (
            <Chip label="Não Conectado" color="warning" variant="outlined" />
          )}
        </Box>

        {mensagem && (
          <Alert severity={mensagem.tipo} sx={{ mb: 3 }}>
            {mensagem.texto}
          </Alert>
        )}

        <form onSubmit={handleSalvar}>
          <TextField
            fullWidth
            label="Client ID (Google Cloud Console)"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            sx={{ mb: 3 }}
            required
          />

          <TextField
            fullWidth
            type="password"
            label="Client Secret"
            value={clientSecret}
            onChange={(e) => setClientSecret(e.target.value)}
            placeholder={clientSecret ? "••••••••••••••••" : ""}
            sx={{ mb: 3 }}
            required
          />

          <TextField
            fullWidth
            label="Redirect URI"
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
            placeholder="http://localhost:8090/oauth2/callback"
            sx={{ mb: 3 }}
            required
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            fullWidth
            disabled={salvando}
            sx={{ mb: 2 }}
          >
            {salvando ? "Salvando..." : "Salvar Credenciais"}
          </Button>
        </form>

        <Button
          variant="outlined"
          color="error"
          size="large"
          fullWidth
          startIcon={<GoogleIcon />}
          onClick={handleConectarGoogle}
          sx={{ mt: 2 }}
        >
          {temRefreshToken ? "Reconectar Conta do YouTube" : "Conectar Conta do YouTube"}
        </Button>
      </Paper>
    </Box>
  );
}