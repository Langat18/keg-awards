import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { TOKEN_KEY, USER_KEY } from '../api/axios';

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null');
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(readStoredUser);

  const setUser = useCallback(next => {
    if (next) localStorage.setItem(USER_KEY, JSON.stringify(next));
    else localStorage.removeItem(USER_KEY);
    setUserState(next);
  }, []);

  const startSession = useCallback(({ token, user: next }) => {
    localStorage.setItem(TOKEN_KEY, token);
    setUser(next);
    return next;
  }, [setUser]);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;

    api.get('/auth/me').then(({ data }) => setUser(data)).catch(() => {});
  }, [setUser]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    return startSession(data);
  }, [startSession]);

  const register = useCallback(async form => {
    const { data } = await api.post('/auth/register', form);
    return startSession(data);
  }, [startSession]);

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => {});
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, [setUser]);

  const value = useMemo(() => {
    const isAdmin = user?.role === 'admin';

    return {
      user,
      setUser,
      login,
      register,
      logout,
      isAdmin,
      canViewResults: isAdmin || Boolean(user?.can_view_results),
      homePath: isAdmin ? '/management' : '/staff',
    };
  }, [user, setUser, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
