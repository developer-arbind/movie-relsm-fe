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

  const createRoom = async () => {
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
        const socketInstance = io(process.env.SERVER_PORT + "");
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
          const data = await setName$(yourName, socketBio.id);
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
      )}
    </div>
  );
};

export default CreateRoom;
