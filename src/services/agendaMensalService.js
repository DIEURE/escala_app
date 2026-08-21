import api from './api';

export async function listarAgendasMensais() {
  const response = await api.get('/agenda-mensal');
  return response.data;
}

export async function criarAgendaMensal(dados) {
  const response = await api.post('/agenda-mensal', dados);
  return response.data;
}

export async function atualizarAgendaMensal(id, dados) {
  const response = await api.put(`/agenda-mensal/${id}`, dados);
  return response.data;
}

export async function inativarAgendaMensal(id) {
  const response = await api.delete(`/agenda-mensal/${id}`);
  return response.data;
}

