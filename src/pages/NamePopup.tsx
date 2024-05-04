import React, { useContext, useEffect, useState } from "react";
import { SocketContextId } from "../contexts/socketIdContext";
import io from "socket.io-client";
import { useParams } from "react-router-dom";
const process = {
  env: {
    SERVER_PORT: "http://localhost:8080",
  },
};
interface NamePopUpProps {
  yourName: string;
  setted: boolean;
  setYourName: (name: string) => void;
  setSetted: (value: boolean) => void;
  dontconnectback: boolean;
  startDuplexCommunication: (
    yourName: string,
    socketiD: string
  ) => Promise<
    | {
        data: any;
        socket: null;
        error?: undefined;
      }
    | {
        error: unknown;
        data?: undefined;
        socket?: undefined;
      }
  >;
}

const NamePopUp: React.FC<NamePopUpProps> = ({
  yourName,
  setted,
  setYourName,
  setSetted,
  startDuplexCommunication,
  dontconnectback,
}) => {
  const socketIdProviderWrapper = useContext(SocketContextId);
  const { id } = useParams();
  const room = id;
  const [buttonClicked, setButtonClicked] = useState<boolean>(false);
  useEffect(() => {
    if (
      (socketIdProviderWrapper.id &&
        yourName &&
        dontconnectback &&
        !buttonClicked) ||
      (buttonClicked && socketIdProviderWrapper.id && yourName)
    ) {
      (async () => {
        await startDuplexCommunication(yourName, socketIdProviderWrapper.id);
        if (buttonClicked && socketIdProviderWrapper.id && yourName) {
          room ? window.open(`/${room}`, "_self") : null;
        }
      })();
    }
  }, [socketIdProviderWrapper, buttonClicked]);
  return (
    <div
      className="enter-name"
      style={{ display: !yourName || setted ? "flex" : "none" }}
    >
      <input
        type="text"
        id="your-name"
        onChange={(event) => {
          setYourName(event.target.value);
          localStorage.setItem("your-name", event.target.value);
          setSetted(true);
        }}
        value={yourName ? yourName : ""}
      />
      <button
        id="name-ok"
        onClick={async () => {
          if (dontconnectback) {
            await startDuplexCommunication(
              yourName,
              socketIdProviderWrapper.id
            );
            return room ? window.open(`/${room}`, "_self") : null;
          }
          setButtonClicked(true);
          const socketInstance = io(process.env.SERVER_PORT + "");
          socketInstance.connect();
          socketInstance.on("your:socket:id", (id: string) => {
            console.log("problem seems here: ", id);
            socketIdProviderWrapper.setId(id);
          });
        }}
      >
        Ok
      </button>
    </div>
  );
};

export default NamePopUp;
