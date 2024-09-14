import { v4 as uuidv4 } from "uuid";
import { useEffect, useRef, useState, useContext } from "react";
import { SocketContext } from "../contexts/socketContext";
import startDuplexCommunication from "../utils/setName";
import { SocketContextId } from "../contexts/socketIdContext";
import { returnToken, returnCustomIp } from "../utils/cookie";
import io, { Socket } from "socket.io-client";
import NamePopUp from "./NamePopup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
const process = {
  env: {
    SERVER_PORT: "http://localhost:8080",
  },
};

interface VideoMeta {
  name: string;
  size: number;
  mime: string;
}

interface Meta {
  name: string;
  logo: string;
  password: string;
  roomId: string;
  videoMeta: VideoMeta;
}

const CreateRoom = () => {
  const history = useNavigate();
  const socketState = useContext(SocketContext);
  const [meta, setMeta] = useState<Meta | null>({
    name: "",
    logo: "",
    password: "",
    roomId: uuidv4(),
    videoMeta: {
      name: "",
      size: 0,
      mime: "",
    },
  });
  const [yourName, setYourName] = useState<string>(
    localStorage.getItem("your-name")
      ? (localStorage.getItem("your-name") as string)
      : ""
  );
  const [setted, setSetted] = useState<boolean>(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const { setName$ } = startDuplexCommunication();
  const socketBio = useContext(SocketContextId);
  const [blocked, setBlocked] = useState<boolean>(false);
  const namespace = useRef<string>("");
  const writeData = (input: string, from: string, videometa?: VideoMeta) => {
    if (videometa) {
      return setMeta({
        ...(meta as Meta),
        videoMeta: videometa,
      });
    }
    setMeta({
      ...(meta as Meta),
      [from]: input,
    });
  };

  const createRoom = async (event: any) => {
    event.preventDefault();
    console.log("creating room$: ");
    let customIp = returnCustomIp();
    interface CUSTOMIP {
      [key: string]: string;
      ["socket-id"]: string;
    }
    const customOpt: { withCredentials: boolean; headers: CUSTOMIP } = {
      withCredentials: true,
      headers: {
        "socket-id": socketBio.id,
      },
    };
    if (customIp) {
      customOpt.headers["x-forwarded-for"] = customIp;
    }
    const response = await axios.get(
      process.env.SERVER_PORT +
        "/create-room/" +
        meta?.name +
        "/" +
        meta?.password,
      customOpt
    );
    if (response.status === 400) {
      setBlocked(true);
      return console.log("you can't join two rooms at a same time");
    }
    const data = response.data.endpoint;
    namespace.current = data;
    const secondRsponse = await axios.get(
      process.env.SERVER_PORT + "/oc-token",
      customOpt
    );
    const data2 = await secondRsponse.data;
    console.log(data2);
    await verifyToken();
  };

  const verifyToken = async () => {
    let token = returnToken();
    if (!token) {
      return new Error("action blocked, due to unauthorize access");
    }
    interface CustomHeaders {
      Authorization: string;
      ["socket-id"]: string;
      [key: string]: string;
    }

    let customIp = returnCustomIp();

    const customHeader: { withCredentials: boolean; headers: CustomHeaders } = {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${token}`,
        "socket-id": socketBio.id,
      },
    };
    if (customIp) {
      customHeader.headers["x-forwarded-for"] = customIp;
    }

    const room = namespace.current.split("/")[3];
    console.log("before sending the room: ", room);
    const response = await axios.get(
      process.env.SERVER_PORT + "/verify-oc-token/" + room,
      customHeader
    );
    const data = await response.data;
    console.log(data);
    if (data.code === 200) {
      history("/" + room);
    }
  };

  useEffect(() => {
    (async () => {
      if (yourName) {
        console.log(yourName);
        const socketInstance = io(process.env.SERVER_PORT + "", {
          withCredentials: true
        });
        socketInstance.connect();
        socketInstance.on("your:socket:id", (id: string) => {
          console.log("problem seems here: ", id);
          socketBio.setId(id);
        });
        socketState.setSocket(socketInstance);
        setSocket(socketInstance);
      }
    })();
  }, []);

  useEffect(() => {
    if (socketState.socket && socketBio.id) {
      console.log("socket-state1: ", socketState, socketBio.id);
      (async () => {
        try {
          const data = await setName$(yourName, socketBio.id, "");
          if (data.error) {
            return setBlocked(true);
          }
        } catch (err) {
          setBlocked(true);
        }
      })();
    }
  }, [socketBio, socketState]);

  return (
    <div>
      <NamePopUp
        yourName={yourName}
        setted={setted}
        setYourName={setYourName}
        setSetted={setSetted}
        startDuplexCommunication={setName$}
        dontconnectback={false}
      />
      {!blocked ? (
        <>
          <div className="demo-container">
            <div className="progress-bar">
              <div className="progress-bar-value"></div>
            </div>
          </div>
          <section className="min-h-screen flex items-stretch text-white ">
            <div
              className="lg:flex w-1/2 hidden bg-gray-500 bg-no-repeat bg-cover relative items-center"
              style={{
                backgroundImage:
                  "url(https://images.unsplash.com/photo-1577495508048-b635879837f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80)",
              }}
            >
              <div className="absolute bg-black opacity-60 inset-0 z-0"></div>
              <div className="w-full px-24 z-10">
                <h1 className="text-5xl font-bold text-left tracking-wide">
                  Keep it special
                </h1>
                <p className="text-3xl my-4">
                  Capture your personal memory in unique way, anywhere.
                </p>
              </div>
              <div className="bottom-0 absolute p-4 text-center right-0 left-0 flex justify-center space-x-4">
                <span>
                  <svg
                    fill="#fff"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </span>
                <span>
                  <svg
                    fill="#fff"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                  </svg>
                </span>
                <span>
                  <svg
                    fill="#fff"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </span>
              </div>
            </div>
            <div
              className="lg:w-1/2 w-full flex items-center justify-center text-center md:px-16 px-0 z-0"
              style={{ backgroundColor: "#161616" }}
            >
              <div
                className="absolute lg:hidden z-10 inset-0 bg-gray-500 bg-no-repeat bg-cover items-center"
                style={{
                  backgroundImage:
                    "url(https://images.unsplash.com/photo-1577495508048-b635879837f1?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=675&q=80)",
                }}
              >
                <div className="absolute bg-black opacity-60 inset-0 z-0"></div>
              </div>
              <div className="w-full py-6 z-20">
                <div className="py-6 space-x-2">
                  <span className="w-10 h-10 items-center justify-center inline-flex rounded-full font-bold text-lg border-2 border-white">
                    f
                  </span>
                  <span className="w-10 h-10 items-center justify-center inline-flex rounded-full font-bold text-lg border-2 border-white">
                    G+
                  </span>
                  <span className="w-10 h-10 items-center justify-center inline-flex rounded-full font-bold text-lg border-2 border-white">
                    in
                  </span>{" "}
                </div>
                <p className="text-gray-100">remember the passcode!</p>
                <form
                  action=""
                  className="sm:w-2/3 w-full px-4 lg:px-0 mx-auto"
                >
                  <div className="pb-2 pt-4">
                    <input
                      type="text"
                      name="email"
                      id="email"
                      value={meta?.name}
                      onChange={(event) => {
                        writeData(event.target.value, "name");
                      }}
                      placeholder="Room Name"
                      className="block w-full p-4 text-lg rounded-sm bg-black"
                    />
                  </div>
                  <div className="pb-2 pt-4">
                    <input
                      className="block w-full p-4 text-lg rounded-sm bg-black"
                      type="password"
                      name="password"
                      id="password"
                      value={meta?.password}
                      onChange={(event) => {
                        writeData(event.target.value, "password");
                      }}
                      placeholder="Passcode"
                    />
                  </div>

                  <div className="px-4 pb-2 pt-4">
                    <button
                      onClick={createRoom}
                      className="uppercase block w-full p-4 text-lg rounded-full bg-indigo-500 hover:bg-indigo-600 focus:outline-none"
                    >
                      Create Room!
                    </button>
                  </div>

                  <div className="p-4 text-center right-0 left-0 flex justify-center space-x-4 mt-16 lg:hidden ">
                    <a href="#">
                      <svg
                        fill="#fff"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                      </svg>
                    </a>
                    <a href="#">
                      <svg
                        fill="#fff"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                      </svg>
                    </a>
                    <a href="#">
                      <svg
                        fill="#fff"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  </div>
                </form>
              </div>
            </div>
          </section>
        </>
      ) : (
        <div>
          <div className="fixed z-10 inset-0 overflow-y-auto" id="my-modal">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div
                className="fixed inset-0 transition-opacity"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <span
                className="hidden sm:inline-block sm:align-middle sm:h-screen"
                aria-hidden="true"
              >
                &#8203;
              </span>
              <div
                className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-headline"
              >
                <div>
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg
                      className="h-6 w-6 text-red-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <h3
                      className="text-lg leading-6 font-medium text-gray-900"
                      id="modal-headline"
                    >
                      Error
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        You can't create two rooms, delete the first one
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6">
                  <button
                    onClick={(event) => {
                      event.preventDefault();
                      history("/");
                    }}
                    className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:text-sm"
                  >
                    OK
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* <NamePopUp
        yourName={yourName}
        setted={setted}
        setYourName={setYourName}
        setSetted={setSetted}
        startDuplexCommunication={setName$}
        dontconnectback={false}
      />
      {!blocked ? (
        <div className="inputs">
          <label htmlFor="name">Enter the room name</label>
          <input
            type="text"
            id="name"
            value={meta?.name}
            onChange={(event) => {
              writeData(event.target.value, "name");
            }}
          />
          <label htmlFor="password">Enter The room password</label>
          <input
            type="text"
            id="password"
            value={meta?.password}
            onChange={(event) => {
              writeData(event.target.value, "password");
            }}
          />
          <button id="start-room" onClick={createRoom}>
            Create Room
          </button>
        </div>
      ) : (
        <div>You can not create two 2 rooms at a same time!</div>
      )} */}
    </div>
  );
};

export default CreateRoom;
