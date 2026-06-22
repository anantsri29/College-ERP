useEffect(() => {
  if (!token || !user) {
    if (socket) socket.disconnect();
    setSocket(null);
    return;
  }

  const socketURL = import.meta.env.VITE_SOCKET_URL;

  if (!socketURL) {
    console.error("VITE_SOCKET_URL is missing");
    return;
  }

  const socketClient = io(socketURL, {
    auth: { token },
    transports: ["websocket"],
  });

  socketClient.on("connect", () => {
    console.log("Socket connected:", socketClient.id);
  });

  socketClient.on("notification:new", (payload) => {
    setNotifications((prev) => [payload, ...prev]);
  });

  setSocket(socketClient);

  return () => {
    socketClient.disconnect();
  };
}, [token, user?.id]);
