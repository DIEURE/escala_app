import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Tempo limite em milissegundos (Ex: 15 minutos)
const TEMPO_LIMITE = 15 * 60 * 1000; 

export function useInatividade() {
  const navigate = useNavigate();

  const logout = useCallback(() => {
    // Limpa os dados de autenticação
    localStorage.removeItem("token");
    localStorage.removeItem("usuario"); // Ajuste conforme o que você salva
    
    alert("Sessão expirada por inatividade. Faça login novamente.");
    navigate("/login");
  }, [navigate]);

  useEffect(() => {
    let timer;

    const resetarTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(logout, TEMPO_LIMITE);
    };

    // Eventos que indicam que o usuário está ativo
    const eventos = ["mousemove", "keydown", "click", "scroll", "touchstart"];

    eventos.forEach((evento) => 
      window.addEventListener(evento, resetarTimer)
    );

    resetarTimer(); // Inicia o timer

    // Limpeza ao desmontar o componente
    return () => {
      clearTimeout(timer);
      eventos.forEach((evento) => 
        window.removeEventListener(evento, resetarTimer)
      );
    };
  }, [logout]);
}