import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL_FILE;
let socket;

export const getSocket = () => {
  if (!socket) {
    console.log("Creating new socket instance");
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Socket connection failed: No token found.");
      return null;
    }

    socket = io(SOCKET_URL, {
      auth: {
        token: token,
      },
    });

    socket.on('connect', () => {
      console.log('Successfully connected to the real-time server!');
    });

    socket.on('connect_error', (err) => {
      console.error('Connection failed:', err.message);
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
    console.log('Socket disconnected.');
  }
};