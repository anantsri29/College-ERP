import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useAuthContext } from "./AuthContext";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { token, user } = useAuthContext();
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!token || !user) {
      if (socket) socket.disconnect();
      setSocket(null);
      return;
    }

    const socketClient = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ["websocket"],
    });

    socketClient.on("notification:new", (payload) => {
      setNotifications((prev) => [payload, ...prev]);
    });

    setSocket(socketClient);

    return () => socketClient.disconnect();
  }, [token, user?.id]);

  const value = useMemo(
    () => ({
      socket,
      notifications,
      clearNotifications: () => setNotifications([]),
    }),
    [socket, notifications],
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const ctx = useContext(SocketContext);
  if (!ctx)
    throw new Error("useSocketContext must be used inside SocketProvider");
  return ctx;
};
