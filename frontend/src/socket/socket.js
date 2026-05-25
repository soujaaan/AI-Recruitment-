import { io } from "socket.io-client";

let socket;

export const getSocket = () => {
  if (socket) return socket;



  socket = io(import.meta.env.VITE_SOCKET_URL || undefined, {
    autoConnect: false,
    transports: ["websocket"],

    withCredentials: true,
  });

  return socket;
};

export const connectSocket = () => {
  const s = getSocket();
  if (!s.connected) s.connect();
  return s;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

