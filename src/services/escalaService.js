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

 
export async function atualizarEscala(id, dados) {
  const response = await api.put(`/escalas/${id}`, dados);
  return response.data;
}

export async function excluirEscala(id) {
  await api.delete(`/escalas/${id}`);
}


export async function listarEscalas() {
  const response = await api.get('/escalas');
  return response.data;
}

export async function buscarDetalhesEscala(id) {
  const response = await api.get(`/escalas/${id}/detalhes`);
  return response.data;
}

export async function criarEscala(dados) {
  const response = await api.post('/escalas', dados);
  return response.data;
}

export async function gerarEscalasMes(id, dados) {
  const response = await api.post(
    `/agenda-mensal/${id}/gerar-escalas`,
    dados
  );

  return response.data;
}
 
export async function gerarEscalasAutomaticas(agendaMensalId, dados) {
  const response = await api.post(
    `/escalas/agenda/${agendaMensalId}/gerar-automaticas`, 
    dados
  );
  return response.data;
}

export const buscarDadosIniciais = async () => {
    // Exemplo: retorna { agendas: [...], departamentos: [...] }
    const [agendas, departamentos] = await Promise.all([
        api.get('/agendas-mensais/ativas'),
        api.get('/departamentos')
    ]);
    return { agendas: agendas.data, departamentos: departamentos.data };
};