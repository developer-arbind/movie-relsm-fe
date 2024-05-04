import { createContext, Dispatch, SetStateAction } from "react";

interface SocketContextType {
  id: null | any;
  setId: Dispatch<SetStateAction<null | any>>;
}

export const SocketContextId = createContext<SocketContextType>({
  id: null,
  setId: () => {},
});
