import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { SocketContext } from "../contexts/socketContext";
import {
  returnToken,
  returnCustomIp,
  returnFriendToken,
} from "../utils/cookie";
import NamePopUp from "./NamePopup";
import startDuplexCommunication from "../utils/setName";
import { SocketContextId } from "../contexts/socketIdContext";
import Peer from "../webrtc/Peer";
// import { connectSocket } from "../websocket/socket";
// import { useCallback } from "react";
import io, { Socket } from "socket.io-client";
let websocket: Socket;
interface CustomHeaders {
  Authorization: string;
  [key: string]: string;
}
interface Stream {
  socketId: string;
  stream: MediaStream;
  ref: React.LegacyRef<HTMLVideoElement> | null;
  mute: boolean;
  webcam: boolean;
}

interface Abstract {
  [key: string]: string;
}
interface IP {
  ip: string;
  lastCharIndex?: number;
  socketId: string;
  isOc: boolean;
}
const process = {
  env: {
    SERVER_PORT: "http://localhost:8080",
  },
};
const LAST_DATA_OF_FILE = "LDOF7";
const Room = () => {
  const [passcode, setpasscode] = useState<string>("");
  const history = useNavigate();
  const socketState = useContext(SocketContext);
  const [promise, setPromise] = useState<boolean>(false);
  const [mute, setMute] = useState<boolean>(false);
  const [videoMute, setVideoMute] = useState<boolean>(false);
  const socketBio = useContext(SocketContextId);
  const [setted, setSetted] = useState<boolean>(false);
  const { setName$ } = startDuplexCommunication();
  const [admin, setAdmin] = useState<boolean>(false);
  const localStream = useRef<MediaStream | null>(null);
  const videoMediaRef: React.RefObject<HTMLVideoElement> = useRef(null);
  const [playing, setPlaying] = useState<boolean>(false);
  const videoFile: React.RefObject<HTMLInputElement> = useRef(null);
  const PeerConnections = useRef<Array<{ pc: Peer; socketId: string }>>([]);
  const nameAdded = useRef<boolean>(false);
  const peerIndex = useRef<number>(0);
  useEffect(() => {
    if (!localStorage.getItem("pre-peer")) {
      PeerConnections.current.push({ pc: new Peer(), socketId: socketBio.id });
      localStorage.setItem("pre-peer", "true");
    }
  }, []);

  const currentPeeringSocket = useRef<string>("");
  const admiRef = useRef(admin);
  useEffect(() => {
    admiRef.current = admin;
  }, [admin]);
  const [roomUnlocked, setRoomUnlocked] = useState<number>(2);
  const [requests, setRequests] = useState<
    Array<
      | {
          name: string;
          id: string;
        }
      | []
    >
  >([]);

  const { id } = useParams();
  const [afterFileSelected, setFileSelected] = useState<boolean>(false);
  let [media, setMedia] = useState<string>("");
  const room = id;
  const [token, setToken] = useState<string>("");
  const [yourName, setYourName] = useState<string>(
    localStorage.getItem("your-name") as string
  );
  const ddn = useRef<boolean>(false);
  const roomSockets = useRef<string[]>([]);

  const [streams, setStreams] = useState<Stream[]>([]);

  const iamTryingToConnect = useRef<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState({
    progressTransferFile: 0,
  });
  const socketIds = useRef<Array<IP>>();
  const socketIndex = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const blob = useRef<Blob | null>(null);
  const createStream = async (socketId: string) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    if (!stream) {
      return alert("Please allow the jarui permissions");
    }
    const shallowRefference = { ...videoRef };
    setStreams((prev) => [
      ...prev,
      {
        socketId,
        stream,
        ref: shallowRefference,
        mute: false,
        webcam: false,
      },
    ]);
    localStream.current = stream;
  };

  useEffect(() => {
    if (streams.length > 0) {
      const lastStream: any = streams[streams.length - 1];
      if (lastStream.ref && lastStream.ref.current) {
        lastStream.ref.current.srcObject = lastStream.stream;
        lastStream.ref.current.play();
      }
    }
  }, [streams]);

  useEffect(() => {
    if (socketState.socket) {
      ddn.current = true;
      return socketBio.setId(socketBio.id);
    }
    const socketInstance = io(process.env.SERVER_PORT + "");
    socketInstance.connect();
    socketInstance.on("your:socket:id", (id: string) => {
      socketBio.setId(id);
    });
    socketState.setSocket(socketInstance);
  }, []);

  const onDataChannelCallback = (event: RTCDataChannelEvent) => {
    const { channel } = event;

    let receivedBuffer: any = [];
    let totalBytesFileBuffer = 0;
    let totalBytesArrayBuffers = 0;

    channel.onmessage = (event) => {
      const { data } = event;

      try {
        if (data.byteLength) {
          receivedBuffer.push(data);
          totalBytesArrayBuffers += data.byteLength;

          if (totalBytesFileBuffer > 0) {
            setDownloadProgress({
              progressTransferFile:
                (totalBytesArrayBuffers * 100) / totalBytesFileBuffer,
            });
            if ((totalBytesArrayBuffers * 100) / totalBytesFileBuffer === 100) {
              document.cookie = "downloaded=$";
              alert("download complete");
            }
          }
        } else if (data === LAST_DATA_OF_FILE) {
          getCompleteFile(
            receivedBuffer,
            totalBytesArrayBuffers,
            channel.label
          );
          channel.close();

          receivedBuffer = [];
          totalBytesFileBuffer = 0;
          totalBytesArrayBuffers = 0;
        } else {
          const initMessage = JSON.parse(data);
          totalBytesFileBuffer = initMessage.totalByte || 0;
        }
      } catch (err) {
        receivedBuffer = [];
        totalBytesFileBuffer = 0;
        totalBytesArrayBuffers = 0;
      }
    };
  };
  const getCompleteFile = (
    receivedArrayBuffers: any,
    totalBytesArrayBuffers: any,
    fileName: string
  ) => {
    let offset = 0;
    const uintArrayBuffer = new Uint8Array(totalBytesArrayBuffers, 0);

    receivedArrayBuffers.forEach((arrayBuffer: any) => {
      uintArrayBuffer.set(
        new Uint8Array(
          arrayBuffer.buffer || arrayBuffer,
          arrayBuffer.byteOffset
        ),
        offset
      );
      offset += arrayBuffer.byteLength;
    });

    const blobObject = new Blob([uintArrayBuffer]);

    return downloadFile(blobObject, fileName);
  };
  const downloadFile = (blob: Blob, fileName: string) => {
    const anchor = document.createElement("a");
    const fileType = blob.type.split("/")[1];
    console.log("file type: ", blob.type, blob, fileType);
    anchor.download = `${fileName}.mkv`;
    let url = URL.createObjectURL(blob);
    anchor.href = url;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const SessionDescriptionProtocol = async (
    ids: Array<IP>,
    forcefulConnected?: boolean
  ) => {
    console.log("why camming here bro?");
    let bidirectional = false;
    if (
      roomSockets.current.includes(ids[socketIndex.current].socketId) ||
      ids[socketIndex.current].socketId === socketBio.id
    ) {
      bidirectional = true;
      if (socketIndex.current === ids.length - 1) {
        return false;
      }
    }
    console.log("is aDMin Able to connected: ", socketIndex.current);
    if (!bidirectional) {
      const offer = await createLocalOffer(
        ids[socketIndex.current].socketId,
        forcefulConnected,
        ids[socketIndex.current].isOc
      );
      currentPeeringSocket.current = ids[socketIndex.current].socketId;
      websocket.emit("send-offer", {
        socketId: ids[socketIndex.current].socketId,
        offer,
        mySocketId: socketBio.id,
      });
      roomSockets.current.push(ids[socketIndex.current].socketId);
      socketIndex.current = socketIndex.current + 1;
    } else {
      console.log("when user tries to callback the function again!");
      socketIndex.current++;
      SessionDescriptionProtocol(ids);
    }
  };

  useEffect(() => {
    if (socketState.socket && socketBio.id) {
      if (ddn.current) {
        return setPromise(true);
      }
      (async () => {
        if (yourName && !nameAdded.current) {
          await setName$(yourName, socketBio.id);
          setPromise(true);
          nameAdded.current = true;
        }
      })();
    }
  }, [socketBio, socketState, nameAdded.current]);

  const createLocalOffer = async (
    socketId: string,
    forcefulConnected?: boolean,
    isAdmin?: boolean
  ) => {
    if (
      PeerConnections.current[peerIndex.current].pc.peer?.connectionState ===
        "connected" ||
      forcefulConnected
    ) {
      console.log("slow motion: $times");
      PeerConnections.current.push({ pc: new Peer(), socketId });
      peerIndex.current++;
    }
    PeerConnections.current[peerIndex.current].pc.peer?.addEventListener(
      "track",
      getRemoteTracks
    );
    PeerConnections.current[peerIndex.current].pc.peer?.addEventListener(
      "datachannel",
      onDataChannelCallback
    );
    PeerConnections.current[peerIndex.current].pc.peer?.addEventListener(
      "negotiationneeded",
      makeNegotiation
    );
    PeerConnections.current[peerIndex.current].pc.peer?.addEventListener(
      "iceconnectionstatechange",
      async (event) => {
        const pc = PeerConnections.current[peerIndex.current].pc.peer;
        if (pc?.iceConnectionState === "connected" && event) {
          iamTryingToConnect.current
            ? SessionDescriptionProtocol(socketIds.current as IP[], true)
            : null;
          if (isAdmin) {
            console.log("found admin, now requesting to send the data chunks");
            websocket.emit("negotiate:transfer:file", socketId);
          }
        }
      }
    );
    const offer = await PeerConnections.current[
      peerIndex.current
    ].pc.getOffer();
    return offer;
  };
  const setTracks = () => {
    const senders =
      PeerConnections.current[peerIndex.current].pc.peer?.getSenders();
    if (!localStream.current) return console.log("no track found!");
    for (let track of localStream.current?.getTracks()) {
      let sender;
      if (!senders) return console.log("no sender found!");
      try {
        sender = senders.find((s) => s.track && s.track.kind === track.kind);
      } catch (err) {
        console.log("error: sender: ", sender);
      }
      if (sender) {
        sender.replaceTrack(track);
      } else {
        PeerConnections.current[peerIndex.current].pc.peer?.addTrack(
          track,
          localStream.current
        );
      }
    }
  };

  // const getRemoteTracks = async (event: any) => {
  //   const nextUserStreamRefference = event.streams[0];
  //   const track = event.track;
  //   if (track.kind === "audio") return;
  //   const shallowRefference = { ...videoRef };
  //   setStreams((prev) => [
  //     ...prev,
  //     {
  //       socketId: currentPeeringSocket.current,
  //       stream: nextUserStreamRefference,
  //       ref: shallowRefference,
  //     },
  //   ]);
  // };
  const getRemoteTracks = async (event: any) => {
    const nextUserStreamReference = event.streams[0];
    const track = event.track;

    if (track.kind === "audio") return;

    const streamExists = streams.some(
      (stream) => stream.stream.id === nextUserStreamReference.id
    );

    if (
      streamExists &&
      streams.find((stream) => stream.stream.id === nextUserStreamReference.id)
        ?.mute
    )
      return;
    if (
      streams.filter((ax) => ax.socketId === currentPeeringSocket.current)
        .length > 0
    )
      return;

    track.addEventListener("ended", () => {
      console.log("Provided stream ended: ", track);
      setStreams((prev: Stream[]) =>
        prev.filter((stream) => stream.stream.id !== nextUserStreamReference.id)
      );
    });
    const shallowReference = { ...videoRef };
    let isMute = nextUserStreamReference.getAudioTracks()[0].enabled;
    let isVideoMute = nextUserStreamReference.getVideoTracks()[0].enabled;
    // console.log("what we getting let's see: ", isMute, isVideoMute);
    setStreams((prev) => [
      ...prev,
      {
        socketId: currentPeeringSocket.current,
        stream: nextUserStreamReference,
        ref: shallowReference,
        webcam: isMute ? false : true,
        mute: isVideoMute ? false : true,
      },
    ]);
  };

  const makeNegotiation = async () => {
    const offer = await PeerConnections.current[
      peerIndex.current
    ].pc.getOffer();
    websocket.emit("send:negotiation", {
      socketId: currentPeeringSocket.current,
      offer,
      mySocketId: socketBio.id,
    });
  };
  useEffect(() => {
    if (streams.length > 0) return;
    if (promise) {
      websocket = socketState.socket;
      websocket.on("booked:token", async (encrypted: string) => {
        setRoomUnlocked(0);
        const now = new Date();
        const time = now.getTime();
        const expireTime = time + 1000 * 3600 * 24;
        now.setTime(expireTime);
        document.cookie =
          "ticket=" + encrypted + ";expires=" + now.toUTCString() + ";path=/";
        await createStream(socketBio.id);
        websocket.emit("send:ids:to:me", room);
        websocket.emit("set:room:name", room);
      });
      websocket.on("get:ids", async (ids: Array<IP>) => {
        console.log("as admin reconnetion: ", ids);
        socketIds.current = ids;
        iamTryingToConnect.current = true;
        await SessionDescriptionProtocol(ids);
      });
      websocket.on("on:someone:pause", (socketId) => {
        console.log("from user: ", socketId);
        videoMediaRef.current?.pause();
      });

      websocket.on(
        "on:dragged:timeline",
        ({ user, speed }: { user: string; speed: number }) => {
          videoMediaRef.current!.playbackRate = speed;
          console.log("playback speed: ", speed, user);
        }
      );

      websocket.on(
        "on:dragged:timeline",
        ({ user, timeline }: { user: string; timeline: number }) => {
          console.log("user and timeline: ", user, timeline);
          console.log("current video element: ", videoMediaRef.current);
          videoMediaRef.current!.currentTime = timeline;
        }
      );
      websocket.on("on:someone:skip-timeline", ({ from, timeline }) => {
        console.log("the timeline: ", timeline, from);

        videoMediaRef.current!.currentTime = timeline;
      });
      websocket.on("on:someone:resume", (socketId) => {
        console.log("from user$: ", socketId);
        videoMediaRef.current?.play();
      });
      websocket.on("vice:versa", ({ room, socketId }) => {
        websocket.emit("leave:forcefull", room);
        websocket.emit("i:am:done", { room, socketId });
        websocket.emit("kick:out", room);
        localStorage.removeItem("pre-peer");
        history("/");
      });

      websocket.on(
        "get:negotiation",
        async ({
          offer,
          socketId,
        }: {
          offer: RTCSessionDescriptionInit;
          socketId: string;
        }) => {
          const answer = await PeerConnections.current[
            peerIndex.current
          ].pc.connectRemoteOffer(offer);
          websocket.emit("negotiation:complete", {
            socketId,
            answer,
          });
        }
      );

      websocket.on("on:user:disconnects", (socketId: string) => {
        console.log("the user wants to leave, just let him gooo!!!");
        setStreams((prev) =>
          prev.filter((stream) => stream.socketId !== socketId)
        );
      });
      websocket.on("on:user:mute", (socketId) => {
        setStreams((prev) =>
          prev.map((stream) => {
            if (stream.socketId === socketId) {
              return {
                ...stream,
                mute: true,
              };
            }
            return stream;
          })
        );
      });
      websocket.on("on:user:unmute", (socketId) => {
        setStreams((prev) =>
          prev.map((stream) => {
            if (stream.socketId === socketId) {
              return {
                ...stream,
                mute: false,
              };
            }
            return stream;
          })
        );
      });

      websocket.on("on:user:stream:mute", (socketId) => {
        console.log("running times");
        setStreams((prev) =>
          prev.map((stream) => {
            if (stream.socketId === socketId) {
              return {
                ...stream,
                webcam: true,
              };
            }
            return stream;
          })
        );
      });
      websocket.on("on:user:stream:unmute", (socketId) => {
        setStreams((prev) =>
          prev.map((stream) => {
            if (stream.socketId === socketId) {
              return {
                ...stream,
                webcam: false,
              };
            }
            return stream;
          })
        );
      });

      websocket.on(
        "get:negotiation:answer",
        async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
          await PeerConnections.current[
            peerIndex.current
          ].pc.setRemoteDescription(answer);
          websocket.emit(
            "get:receiver:local:track",
            currentPeeringSocket.current
          );
          // iamTryingToConnect.current
          //   ? await SessionDescriptionProtocol(socketIds.current as IP[])
          //   : false;
        }
      );

      websocket.on("track:ready", () => {
        setTracks();
      });
      websocket.on(
        "send:request",
        ({ name, id }: { name: string; id: string }) => {
          if (!admiRef.current) {
            return;
          }
          setRequests((prev) => [
            ...prev,
            {
              name,
              id,
            },
          ]);
        }
      );

      websocket.on(
        "get:remote:offer",
        async ({
          offer,
          whomSocketId,
        }: {
          offer: RTCSessionDescriptionInit;
          whomSocketId: string;
        }) => {
          console.log("remote: offer:", offer, whomSocketId);
          if (
            PeerConnections.current[peerIndex.current].pc.peer
              ?.connectionState === "connected" ||
            PeerConnections.current[peerIndex.current].pc.peer
              ?.connectionState === "failed"
          ) {
            console.log("should something happening here: ");
            PeerConnections.current.push({
              pc: new Peer(),
              socketId: whomSocketId,
            });
            peerIndex.current++;
          }
          PeerConnections.current[peerIndex.current].pc.peer?.addEventListener(
            "track",
            getRemoteTracks
          );
          websocket.on("start:transmission", (socketId) => {
            console.log(
              "user: " +
                socketId +
                " requesting to get the file and btw the blob is: ",
              blob.current
            );
            PeerConnections.current[peerIndex.current].pc.createDataChannel();
            PeerConnections.current[peerIndex.current].pc.transferFile(
              blob.current
            );
          });
          PeerConnections.current[peerIndex.current].pc.peer?.addEventListener(
            "negotiationneeded",
            makeNegotiation
          );
          console.log("excutive m-lines: ", PeerConnections.current);
          const answer = await PeerConnections.current[
            peerIndex.current
          ].pc.connectRemoteOffer(offer);
          currentPeeringSocket.current = whomSocketId;
          websocket.emit("send:remote:offer", {
            socketId: whomSocketId,
            answer,
          });
        }
      );

      websocket.on(
        "get:remote:answer",
        async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
          console.log("remote answer : ", answer);
          await PeerConnections.current[
            peerIndex.current
          ].pc.setRemoteDescription(answer);
          setTracks();
        }
      );

      websocket.on("direct:join:for:you", async (room) => {
        setRoomUnlocked(0);
        // await createStream(socketBio.id);
        await createStream(socketBio.id);
        websocket.emit("send:ids:to:me", room);
      });

      websocket.on("leave:invitation:for:you", ({ room, socketId }) => {
        if (!admiRef.current) {
          websocket.emit("leave:forcefull");
          websocket.emit("i:am:done", { room, socketId });
          websocket.emit("kick:out", room);
          localStorage.removeItem("pre-peer");
          history("/");
        }
      });
      websocket.on("you:got:acccepted", (room) => {
        if (admiRef.current) {
          return;
        }
        websocket.emit("on:acceptance", room); //closure
      });
      window.addEventListener("beforeunload", function (e) {
        e.returnValue = "";
        websocket.emit("i:am:done", { room, socketId: socketBio.id });
        console.log("User is leaving the page");
        localStorage.removeItem("pre-peer");
      });
      websocket.on("you:got:rejected", (room) => {
        if (admiRef.current) {
          return;
        }
        alert("you got rejected from: " + room);
      });
      (async () => {
        let customIp = returnCustomIp();
        const token = returnToken();
        setRoomUnlocked(2);
        const customHeader: {
          withCredentials: boolean;
          headers: CustomHeaders;
        } = {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
            "socket-id": socketBio.id,
          },
        };
        if (customIp) {
          customHeader.headers["x-forwarded-for"] = customIp;
        }
        try {
          const response = await axios.get(
            process.env.SERVER_PORT + "/verify-oc-token/" + room,
            customHeader
          );
          if (response.status === 200) {
            const data = await response.data;
            websocket.emit("direct:join", { room, ip: data.ip });
            setAdmin(true);
            // await createStream(socketBio.id);
            await createStream(socketBio.id);
            websocket.emit("set:room:name", room);
            websocket.emit("send:ids:to:me", room);
            window.addEventListener("beforeunload", function (e) {
              e.returnValue = "";
              websocket.emit("i:am:done", { room, socketId: socketBio.id });
              localStorage.removeItem("pre-peer");
              console.log("User is leaving the page");
            });
            return setRoomUnlocked(0); //it means, just created and done!
          }
        } catch (err: any) {
          console.log(err);
          if (err.response.data.code === 901) {
            return setRoomUnlocked(3);
          } else if (err.response.data.code === 404) {
            return setRoomUnlocked(4);
          } else if (err.response.data.code === 944) {
            return setRoomUnlocked(5);
          } else if (err.response.data.code === 456) {
            setRoomUnlocked(1);
          }
        }

        const header: Abstract = {
          "Content-Type": "application/json",
          "socket-id": socketBio.id,
        };
        if (customIp) {
          header["x-forwarded-for"] = customIp;
        }
        let ticket = returnFriendToken();
        if (ticket) return await cookieMannager(ticket);
        const response$ = await fetch(process.env.SERVER_PORT + "/" + room, {
          method: "POST",
          headers: header,
          body: JSON.stringify({ room }),
        });
        // if (!response$.ok) {
        //   return alert("Error 404, no room found");
        // }
        if (response$.status === 400) {
          setRoomUnlocked(7);
        }
        const ttl = await response$.json();
        console.log("ttl: ", ttl);
        setToken(ttl.token);
        if (!token) {
          return;
        }
        setRoomUnlocked(1);
        setAdmin(false);
      })();
    }
    // websocket.off("booked:token", handleTicketCookie);
  }, [promise, streams]);

  const cookieMannager = async (jsecret?: string) => {
    let customIp = returnCustomIp();
    const header: Abstract = {
      "Content-Type": "application/json",
      "socket-id": socketBio.id,
    };
    if (customIp) {
      header["x-forwarded-for"] = customIp;
    }
    const response = await fetch(
      process.env.SERVER_PORT +
        "/" +
        room +
        "/" +
        "?passcode=" +
        passcode +
        "&token=" +
        token,
      {
        method: "POST",
        headers: header,
        body: !jsecret
          ? JSON.stringify({ room })
          : JSON.stringify({ ejwt: jsecret }),
      }
    );
    if (!response.ok) {
      const payload = await response.json();
      return alert(payload.error);
    }
  };
  const onEnter = async () => {
    if (!passcode) return alert("enter the passcode");
    await cookieMannager();
  };

  const clearRequest = (index: number) => {
    // const index = requests.findIndex((rQ) =>
    //   !Array.isArray(rQ)
    //     ? rQ.id
    //     : "" === (!Array.isArray(payload) ? payload.id : "")
    // );

    // if (index !== -1) {
    let rQ = [...requests];

    rQ.splice(index, 1);
    setRequests(rQ);
  };
  const onMuteorStopStreaming = (audio: boolean, mute: boolean) => {
    setStreams((prevStreams) =>
      prevStreams.map((stream) => {
        if (stream.socketId === socketBio.id) {
          const updatedStream = { ...stream };
          audio
            ? (updatedStream.mute = mute ? false : true)
            : (updatedStream.webcam = mute ? false : true);
          const audioTrackorvIDEOtrACK = audio
            ? updatedStream.stream.getAudioTracks()[0]
            : updatedStream.stream.getVideoTracks()[0];
          if (audioTrackorvIDEOtrACK) {
            audioTrackorvIDEOtrACK.enabled = mute;
          }
          return updatedStream;
        }
        return stream;
      })
    );
    console.log("controllers: ", audio, mute);
    if (audio && !mute) {
      console.log("sending to pause the audio:");
      websocket.emit("set:mute", { room });
      setMute(true);
    } else if (!audio && !mute) {
      console.log("it needs to be here: ");
      websocket.emit("set:video:mute", { room });
      setVideoMute(true);
    } else if (mute && audio) {
      websocket.emit("set:unmute", { room });
      setMute(false);
    } else {
      websocket.emit("set:video:unmute", { room });
      setVideoMute(false);
    }
  };
  const uploadVideo = () => {
    let file = videoFile.current
      ? videoFile.current.files
        ? videoFile.current.files[0]
        : null
      : null;
    if (!file) return alert("error uploading video");
    const types = ["mkv", "mp4"];
    const fileNameParts = file.name.split(".");
    const extension = fileNameParts[fileNameParts.length - 1];
    if (!types.includes(extension)) return alert("Upload Video files only!");
    let BLOB = new Blob([file], { type: "*" });
    blob.current = BLOB;
    setMedia(URL.createObjectURL(BLOB));
    setFileSelected(true);
    if (admin) return;
    let ormm = returnPromise();
    if (ormm) {
      websocket.emit("set:stream:ready", room);
    }
  };

  const syncPause = () => {
    console.log("on:pause");
    websocket.emit("sync:pause", room);
  };
  const syncPlay = () => {
    console.log("comming here!");
    websocket.emit("sync:play", room);
    setPlaying(true);
  };
  const returnPromise = () => {
    let cookies = document.cookie;
    let scookie = cookies.split(";");
    let oreintation = "@";
    for (let i = 0; i < scookie.length; i++) {
      let key = scookie[i].split("=")[0].trim();
      if (key === "downloaded") {
        oreintation = scookie[i].split("=")[1].trim();
      }
    }

    return oreintation === "$" ? true : false;
  };
  useEffect(() => {
    if (playing) {
      videoMediaRef.current?.play();
    } else {
      videoMediaRef.current?.pause();
    }
  }, [playing]);
  const onContinousSeeking = () => {
    const draggedTimeline = videoMediaRef.current?.currentTime;
    console.log("dragging");
    websocket.emit("set:dragging:portion", { room, timeline: draggedTimeline });
  };

  const onSyncRate = () => {
    const rateSpeed = videoMediaRef.current?.currentTime;
    websocket.emit("set:rate:speed", { room, speed: rateSpeed });
  };

  return (
    <div>
      <NamePopUp
        yourName={yourName}
        setted={setted}
        setYourName={setYourName}
        setSetted={setSetted}
        startDuplexCommunication={setName$}
        dontconnectback={true}
      />
      {roomUnlocked === 4 && <div>No room found!</div>}
      {roomUnlocked === 1 && (
        <div className="join-room">
          <div>Hey, join this room by enterning the passcode</div>
          <label htmlFor="your-passcode">your passcode</label>
          <input
            type="text"
            id="your-passcode"
            value={passcode}
            onChange={(event) => {
              setpasscode(event.target.value);
            }}
          />
          <button onClick={onEnter}>enter</button>
        </div>
      )}
      {roomUnlocked === 2 && <div>Loading...</div>}
      {roomUnlocked === 5 && <div>Unauthorized.. try again</div>}
      {roomUnlocked === 3 && (
        <div>You can't join the same room at 2 different places!</div>
      )}
      {roomUnlocked === 7 && (
        <div>you can't join 2 two rooms at a same time.</div>
      )}
      {roomUnlocked === 0 && (
        <div className="room">
          <h1>you are on the room now!</h1>
          <h2>download progress: {downloadProgress.progressTransferFile}</h2>
          {streams.length > 0 && (
            <div>
              Livecams
              {streams.map((webrtc) => {
                return (
                  <div key={webrtc.socketId} style={{ marginTop: "2px" }}>
                    <video
                      width={"20px"}
                      height={"150px"}
                      ref={webrtc.ref}
                    ></video>
                    <button>
                      {webrtc.mute ? "MUTE KARDIYA" : "UNMUTE HAI"}
                    </button>
                    <button>
                      {webrtc.webcam ? "WEBCAM BAND KARDIYA" : "CHALU HAI ABHI"}
                    </button>
                  </div>
                );
              })}
              <div className="controlers">
                <button onClick={() => onMuteorStopStreaming(true, mute)}>
                  {!mute ? "Mute" : "Unmute"}
                </button>
                <button onClick={() => onMuteorStopStreaming(false, videoMute)}>
                  {!videoMute ? "Block Video!" : "Unblock Video"}
                </button>
              </div>
            </div>
          )}
          {admin && (
            <div>
              <h3>you are the admin and have all controls</h3>
            </div>
          )}
          <div className="video-media">
            <input
              type="file"
              id="select-video"
              ref={videoFile}
              onChange={uploadVideo}
            />
            {afterFileSelected && (
              <div>
                <video
                  ref={videoMediaRef}
                  src={media}
                  controls
                  width={"300px"}
                  height={"400px"}
                  onPause={syncPause}
                  onPlay={syncPlay}
                  onSeeking={onContinousSeeking}
                  onRateChange={onSyncRate}
                ></video>
              </div>
            )}
          </div>
          {admin &&
            requests.length > 0 &&
            requests.map((payload, index) => {
              return (
                <div key={index}>
                  <h3>{!Array.isArray(payload) ? payload.name : ""}</h3>
                  <button
                    className="reject"
                    onClick={() => {
                      websocket.emit("reject:socketid", {
                        socketId: !Array.isArray(payload) ? payload.id : "",
                        room,
                      });
                      clearRequest(index);
                    }}
                  >
                    Reject
                  </button>
                  <button
                    className="accept"
                    onClick={() => {
                      websocket.emit("sign:accept", {
                        socketId: !Array.isArray(payload) ? payload.id : "",
                        room,
                      });
                      clearRequest(index);
                    }}
                  >
                    Accept
                  </button>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default Room;
