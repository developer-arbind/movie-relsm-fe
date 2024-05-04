import { SocketContextId } from "./socketIdContext";
import { useState } from "react";

export const SocketContextIdProvider = ({ children }: any) => {
  const [id, setId] = useState<string | null>(null);
  const setTheId = (id: string) => {
    setId(id);
  };
  return (
    <SocketContextId.Provider value={{ id, setId: setTheId }}>
      {children}
    </SocketContextId.Provider>
  );
};
