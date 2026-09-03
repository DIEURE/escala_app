import api from "./api";

export const youtubeService = {
  // Busca as configurações salvas no backend
  getConfiguracoes: async () => {
    const response = await api.get("/youtube-config");
    return response.data;
  },

  // Salva ou atualiza as credenciais
  salvarConfiguracoes: async (dados) => {
    console.log(dados);
    const response = await api.post("/youtube-config", dados);
    return response.data;
  },

  // Obtém a URL de autenticação do Google OAuth
  getAuthUrl: async () => {
    const response = await api.get("/youtube-config/auth-url");
    return response.data; // Retorna a string com a URL
  },

   // Envia o code do Google para o backend trocar pelo refresh_token
  conectarCallback: async (code) => {
    const response = await api.post("/youtube-config/callback", { code });
    return response.data;
  },
};