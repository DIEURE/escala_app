import { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Stack,
  Alert,
  Divider,
} from "@mui/material";
import PageHeader from "../../../../components/common/PageHeader";
import api from "../../../../services/api";

export default function PlaylistConfigPage() {
  const [config, setConfig] = useState({
    clientId: "",
    clientSecret: "",
    conectado: false,
  });
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  // Carrega as configurações salvas do backend (simulado/ajustar endpoint conforme sua API)
  useEffect(() => {
    carregarConfiguracoes();
  }, []);

  const carregarConfiguracoes = async () => {
    try {
      // Exemplo de endpoint no backend para buscar as credenciais
      const response = await api.get("/youtube/config");
      if (response.data) {
        setConfig(response.data);
      }
    } catch (error) {
      console.error("Erro ao carregar configurações do YouTube:", error);
    }
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Endpoint para salvar as chaves no backend
      await api.post("/youtube/config", {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
      });
      setMensagem({ tipo: "success", texto: "Configurações salvas com sucesso!" });
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
      setMensagem({ tipo: "error", texto: "Erro ao salvar as configurações." });
    } finally {
      setLoading(false);
    }
  };

  const handleConectarGoogle = () => {
    // Redireciona para o endpoint OAuth do Spring Security/Google
    window.location.href = "http://localhost:8090/oauth2/authorization/google";
  };

  return (
    <Box>
      <PageHeader title="Configuração da API do YouTube" />

      <Box sx={{ p: 3, maxWidth: 600 }}>
        <Paper component="form" onSubmit={handleSalvar} sx={{ p: 3 }}>
          <Stack spacing={3}>
            <Typography variant="h6" color="primary">
              Credenciais do Google Cloud Console
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Insira o Client ID e o Client Secret gerados no seu projeto do Google Cloud para permitir que o sistema crie playlists automaticamente.
            </Typography>

            {mensagem && (
              <Alert severity={mensagem.tipo}>{mensagem.texto}</Alert>
            )}

            <TextField
              label="Client ID (ID do Cliente)"
              fullWidth
              required
              value={config.clientId}
              onChange={(e) => setConfig({ ...config, clientId: e.target.value })}
            />

            <TextField
              label="Client Secret (Chave Secreta)"
              type="password"
              fullWidth
              required
              value={config.clientSecret}
              onChange={(e) => setConfig({ ...config, clientSecret: e.target.value })}
            />

            <Button type="submit" variant="contained" disabled={loading}>
              {loading ? "Salvando..." : "Salvar Credenciais"}
            </Button>

            <Divider sx={{ my: 2 }} />

            <Typography variant="h6" color="primary">
              Status da Conta do YouTube
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="body1">
                Status:{" "}
                <strong>
                  {config.conectado ? "🟢 Conectado ao YouTube" : "🔴 Desconectado"}
                </strong>
              </Typography>

              <Button
                variant="outlined"
                color={config.conectado ? "error" : "success"}
                onClick={handleConectarGoogle}
              >
                {config.conectado ? "Reconectar Conta" : "Conectar com o Google"}
              </Button>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}