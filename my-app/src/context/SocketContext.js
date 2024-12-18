import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// Dynamically select protocol based on the page's protocol (HTTP or HTTPS)
const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

// Use the hostname of the current page for WebSocket connection
const SOCKET_URL = `${protocol}://${window.location.hostname}/ws`;

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Initialize the socket connection when the app starts
    const newSocket = io(SOCKET_URL, {
      transports: ["websocket"],  // Use websocket transport only
    });
    setSocket(newSocket);

    // Cleanup when the component is unmounted
    return () => newSocket.close();
  }, []); // Empty dependency array means this effect runs only once on mount

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
adf