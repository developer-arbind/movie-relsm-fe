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
  const [hideOnClick, setHideOnclick] = useState<boolean>(false);
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
        setHideOnclick(true);
        if (buttonClicked && socketIdProviderWrapper.id && yourName) {
          room ? window.open(`/${room}`, "_self") : null;
        }
      })();
    }
  }, [socketIdProviderWrapper, buttonClicked]);
  return (
    <div
      className="enter-name"
      style={{
        display: (!yourName || setted) && !hideOnClick ? "flex" : "none",
      }}
    >
      <div
        id="login-popup"
        tabIndex={-1}
        className="bg-black/50 overflow-y-auto overflow-x-hidden fixed top-0 right-0 left-0 z-50 h-full items-center justify-center flex"
      >
        <div className="relative p-4 w-full max-w-md h-full md:h-auto">
          <div className="relative bg-white rounded-lg shadow">
            <div className="p-5">
              <h3 className="text-2xl mb-0.5 font-medium"></h3>
              <p className="mb-4 text-sm font-normal text-gray-800"></p>

              <div className="text-center">
                <p className="mb-3 text-2xl font-semibold leading-5 text-slate-900">
                  Enter Your Name
                </p>
              </div>

              <form className="w-full">
                <label htmlFor="email" className="sr-only">
                  Arbind Kumar
                </label>
                <input
                  name="email"
                  type="text"
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-black focus:ring-offset-1 mb-4"
                  placeholder="Arbind Kumar"
                  onChange={(event) => {
                    setYourName(event.target.value);
                    localStorage.setItem("your-name", event.target.value);
                    setSetted(true);
                  }}
                  value={yourName ? yourName : ""}
                />

                <button
                  type="submit"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-black p-2 py-3 text-sm font-medium text-white outline-none focus:ring-2 focus:ring-black focus:ring-offset-1 disabled:bg-gray-400"
                  onClick={async (event) => {
                    event.preventDefault();
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
                  Continue
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NamePopUp;
