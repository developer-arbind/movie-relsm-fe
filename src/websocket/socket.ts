import io, { Socket } from "socket.io-client";
import { useContext } from "react";
import { SocketContextId } from "../contexts/socketIdContext";
const connectSocket = () => {
  const context = useContext(SocketContextId);
  const socketTCP = (): Socket => {
    console.log("is working here too");
    const socketInstance = io("https://wachwithme-bfdpczhhb8cjehhb.eastus-01.azurewebsites.net", {
      withCredentials: true
    });
    https: socketInstance.connect();
    socketInstance.on("your:socket:id", (id: string) => {
      console.log("problem seems here: ", id);
      context.setId(id);
    });
    return socketInstance;
  };

  return { socketTCP };
};
export { connectSocket };