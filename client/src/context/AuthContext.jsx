import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { authApi } from "../api/authApi";
import { clearAuth, getStoredToken, getStoredUser, persistAuth } from "../utils/authStorage";
import { decodeJwt } from "../utils/decodeJwt";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken());
  const [user, setUser] = useState(getStoredUser());
  const [claims, setClaims] = useState(() => decodeJwt(getStoredToken()));

  const login = useCallback(({ token: nextToken, user: nextUser }) => {
    const nextClaims = decodeJwt(nextToken);
    const mergedUser = nextUser && nextClaims?.role && !nextUser.role ? { ...nextUser, role: nextClaims.role } : nextUser;
    persistAuth({ token: nextToken, user: mergedUser });
    setToken(nextToken);
    setUser(mergedUser);
    setClaims(nextClaims);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (token) await authApi.logout();
    } catch {
      // ignore logout API failures to ensure local session clears
    } finally {
      clearAuth();
      setToken(null);
      setUser(null);
      setClaims(null);
    }
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      user,
      claims,
      isAuthenticated: Boolean(token && user),
      login,
      logout,
    }),
    [token, user, claims, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider");
  return ctx;
};
