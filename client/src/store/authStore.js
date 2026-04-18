import { create } from "zustand";

const initialToken = localStorage.getItem("token");
const initialUser = localStorage.getItem("user");

export const useAuthStore = create((set) => ({
  token: initialToken || null,
  user: initialUser ? JSON.parse(initialUser) : null,
  login: ({ token, user }) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    set({ token, user });
  },
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    set({ token: null, user: null });
  },
}));
