import { io } from "socket.io-client";
import { API_BASE_URL } from "@/utils/constant";

let socket = null;

export const getSocket = () => {
    if (!socket) {
        socket = io(API_BASE_URL, {
            autoConnect: false,
            withCredentials: true,
        });
    }
    return socket;
};

export const connectSocket = (token) => {
    const s = getSocket();
    if (!s.connected) {
        s.auth = { token };
        s.connect();
    }
    return s;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
