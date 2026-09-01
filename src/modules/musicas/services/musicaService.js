import api from "../../../services/api";

// Lista todas as músicas ativas
export const listarMusicas = async () => {
  const response = await api.get("/musicas");
  return response.data;
};

// Busca uma música por ID
export const buscarMusicaPorId = async (id) => {
  const response = await api.get(`/musicas/${id}`);
  return response.data;
};

// Cadastra uma nova música
export const salvarMusica = async (dados) => {
  const response = await api.post("/musicas", dados);
  return response.data;
};

// Atualiza uma música existente
export const atualizarMusica = async (id, dados) => {
  const response = await api.put(`/musicas/${id}`, dados);
  return response.data;
};

// Desativa/remove uma música
export const desativarMusica = async (id) => {
  const response = await api.delete(`/musicas/${id}`);
  return response.data;
};

// 🔑 Extrai o ID do vídeo de qualquer formato de link do YouTube
export const extrairYoutubeVideoId = (url) => {
  if (!url) return "";

  // Se já for só o ID (11 caracteres, sem barra), retorna direto
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;

  // Regex que cobre os formatos comuns do YouTube:
  // youtube.com/watch?v=ID | youtu.be/ID | youtube.com/embed/ID | shorts/ID
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(regex);
  return match ? match[1] : "";
};