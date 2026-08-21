import api from './api';

export async function listarUsuarios() {
  const response = await api.get('/usuarios');
  return response.data;
}

export async function buscarUsuarioPorId(id) {
  const response = await api.get(`/usuarios/${id}`);
  return response.data;
}

export async function criarUsuario(dados) {
  const response = await api.post('/usuarios', dados);
  return response.data;
}

export async function atualizarUsuario(id, dados) {
  const response = await api.put(`/usuarios/${id}`, dados);
  return response.data;
}

export async function atualizarDisponibilidadeUsuario(id, disponibilidade) {
  const response = await api.patch(
    `/usuarios/${id}/disponibilidade`,
    { disponibilidade }
  );

  return response.data;
}

export async function inativarUsuario(id) {
  const response = await api.delete(`/usuarios/${id}`);
  return response.data;
}