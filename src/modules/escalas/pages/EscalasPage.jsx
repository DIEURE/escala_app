import { useEffect, useState } from 'react';
import { Box, Button, Paper, Typography, Stack, CircularProgress } from '@mui/material';
import PageHeader from '../../../components/common/PageHeader';
import ModalEscalaManual from '../components/ModalEscalaManual';
import ModalEscalaAutomatica from '../components/ModalEscalaAutomatica';
import ModalDetalhesEscala from '../components/ModalDetalhesEscala';
import { listarEscalas, buscarDetalhesEscala } from '../../../services/escalaService';

export default function EscalasPage() {
  const [modal, setModal] = useState(null); // 'MANUAL' | 'AUTOMATICA' | 'DETALHES'
  const [escalas, setEscalas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [escalaSelecionada, setEscalaSelecionada] = useState(null);

  async function carregarEscalas() {
    try {
      setLoading(true);
      const data = await listarEscalas();
      // Ordenando da mais recente para a mais antiga
      const ordenadas = data.sort((a, b) => new Date(a.dataEscala) - new Date(b.dataEscala));
      setEscalas(ordenadas);
    } catch (error) {
      console.error("Erro ao listar escalas", error);
    } finally {
      setLoading(false);
    }
  }

  const handleAbrirDetalhes = async (escala) => {
    try {
      const detalhes = await buscarDetalhesEscala(escala.id);
      setEscalaSelecionada(detalhes);
      setModal('DETALHES');
    } catch (error) {
      console.error("Erro ao buscar detalhes da escala", error);
    }
  };

  useEffect(() => {
    carregarEscalas();
  }, []);

  return (
    <Box>
      <PageHeader 
        title="Escalas" 
        action={
          <Button variant="contained" onClick={() => setModal('SELECAO')}>
            Nova Escala
          </Button>
        }
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Stack spacing={2} sx={{ mt: 3 }}>
          {escalas.length > 0 ? escalas.map((escala) => (
            <Paper key={escala.id} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">{escala.culto}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(escala.dataEscala).toLocaleDateString('pt-BR')} às {escala.horario}
                </Typography>
              </Box>
              <Button variant="outlined" size="small" onClick={() => handleAbrirDetalhes(escala)}>
                Ver Detalhes
              </Button>
            </Paper>
          )) : (
            <Typography sx={{ textAlign: 'center', mt: 4 }}>Nenhuma escala encontrada.</Typography>
          )}
        </Stack>
      )}

      {/* Modais de Gerenciamento */}
      <ModalEscalaManual 
        open={modal === 'MANUAL'} 
        onClose={() => setModal(null)} 
        onSave={carregarEscalas} 
      />
      
      <ModalEscalaAutomatica 
        open={modal === 'AUTOMATICA'} 
        onClose={() => setModal(null)} 
        onSave={carregarEscalas} 
      />

      {/* Modal de Detalhes */}
      <ModalDetalhesEscala 
        open={modal === 'DETALHES'} 
        onClose={() => setModal(null)} 
        data={escalaSelecionada} 
      />

      {/* Modal de Escolha Inicial */}
      {/* Você pode criar um componente próprio ou manter este Dialog simples */}
      {modal === 'SELECAO' && (
        <div open={true} onClick={() => setModal(null)}>
           {/* Aqui entraria seu Dialog de escolha manual/automática que já criamos antes */}
        </div>
      )}
    </Box>
  );
}