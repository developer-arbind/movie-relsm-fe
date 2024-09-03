import io, { Socket } from "socket.io-client";
import { useContext } from "react";
import { SocketContextId } from "../contexts/socketIdContext";

const connectSocket = () => {
  const context = useContext(SocketContextId);

  const socketTCP = (): Socket => {
    console.log("is working here too");

    // Choose the correct URL based on your tunneling setup
    const socketURL = process.env.NODE_ENV === 'production'
      ? "https://s5ljfdrz-8080.inc1.devtunnels.ms/"
      : "http://localhost:8080";

    const socketInstance = io(socketURL);
    socketInstance.connect();

    socketInstance.on("your:socket:id", (id: string) => {
      console.log("problem seems here: ", id);
      context.setId(id);
    });

    return socketInstance;
  };

  return { socketTCP };
};

export { connectSocket };
