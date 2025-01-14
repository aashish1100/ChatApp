import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// Replace with your backend URL
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL;

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize the socket connection when the app starts
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],
    });
    setSocket(newSocket);

    // Cleanup when the component is unmounted
    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
