export const AUTH_TOKEN_KEY = "token";
export const AUTH_USER_KEY = "user";

export const getStoredToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
export const getStoredUser = () => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  return raw ? JSON.parse(raw) : null;
};

export const persistAuth = ({ token, user }) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const clearAuth = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};
