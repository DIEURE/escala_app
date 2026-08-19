import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const usuarioSalvo = localStorage.getItem('usuario');

    if (token && usuarioSalvo) {
      try {
        setUser(JSON.parse(usuarioSalvo));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
      }
    }

    setLoadingAuth(false);
  }, []);

  function login(session) {
    const userData = {
      nome: session.nome,
      perfil: session.perfil,
    };

    localStorage.setItem('token', session.token);
    localStorage.setItem('usuario', JSON.stringify(userData));

    setUser(userData);
  }

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loadingAuth,
        authenticated: Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth deve ser utilizado dentro de AuthProvider.'
    );
  }

  return context;
}