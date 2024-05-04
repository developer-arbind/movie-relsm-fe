import { Socket } from "socket.io-client";
import { SocketContext } from "./socketContext";
import { useState } from "react";

export const SocketContextProvider = ({ children }: any) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  const setSocketValue = (newSocket: Socket) => {
    setSocket(newSocket);
  };

  return (
    <SocketContext.Provider value={{ socket, setSocket: setSocketValue }}>
      {children}
    </SocketContext.Provider>
  );
};
