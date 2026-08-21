import api from './api';

export async function listarInstrumentos() {
  const response = await api.get('/instrumentos');
  return response.data;
}

export async function criarInstrumento(dados) {
  const response = await api.post('/instrumentos', dados);
  return response.data;
}

export async function atualizarInstrumento(id, dados) {
  const response = await api.put(`/instrumentos/${id}`, dados);
  return response.data;
}

export async function excluirInstrumento(id) {
  await api.delete(`/instrumentos/${id}`);
}