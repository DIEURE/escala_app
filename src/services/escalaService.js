import api from './api';

export async function buscarMinhasEscalas() {
  const response = await api.get('/escala-musicos/minhas-escalas');

  return response.data;
}

export async function confirmarMinhaEscala(escalaId, confirmado) {
  const response = await api.patch(
    `/escala-musicos/minhas-escalas/${escalaId}/confirmacao`,
    {
      confirmado,
    }
  );

  return response.data;
}