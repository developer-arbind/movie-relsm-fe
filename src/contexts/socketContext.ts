import { createContext, Dispatch, SetStateAction } from "react";

interface SocketContextType {
  socket: null | any;
  setSocket: Dispatch<SetStateAction<null | any>>;
}

export const SocketContext = createContext<SocketContextType>({
  socket: null,
  setSocket: () => {},
});
