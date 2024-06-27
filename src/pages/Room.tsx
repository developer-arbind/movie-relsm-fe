import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { SocketContext } from "../contexts/socketContext";
import {
  returnToken,
  returnCustomIp,
  returnFriendToken,
} from "../utils/cookie";
import StreamItem from "./StreamItem";
import NamePopUp from "./NamePopup";
import startDuplexCommunication from "../utils/setName";
import { SocketContextId } from "../contexts/socketIdContext";
import Peer from "../webrtc/Peer";
// import { connectSocket } from "../websocket/socket";
import { useCallback } from "react";
import io, { Socket } from "socket.io-client";
let websocket: Socket;
let thingsTodelete = ["ticket", "octoken", "downloaded", "timeline"];
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
  name: string;
}

interface Speaking {
  speaking: boolean;
  socketId: string;
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
  const pausedRef = useRef<boolean>(true);
  const [setted, setSetted] = useState<boolean>(false);
  const { setName$ } = startDuplexCommunication();
  const [admin, setAdmin] = useState<boolean>(false);
  const localStream = useRef<MediaStream | null>(null);
  const videoMediaRef: React.RefObject<HTMLVideoElement> = useRef(null);
  const previousTimeline = useRef<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const videoFile: React.RefObject<HTMLInputElement> = useRef(null);
  const PeerConnections = useRef<Array<{ pc: Peer; socketId: string }>>([]);
  const nameAdded = useRef<boolean>(false);
  const peerIndex = useRef<number>(0);
  const [typing, setTyping] = useState<
    Array<{
      name: string;
      socketId: string;
    }>
  >([]);
  const [chats, setChat] = useState<
    Array<{
      name: string;
      message: string;
      time: string;
    }>
  >([]);
  const [message, setMessage] = useState<string>("");
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

  const container: React.RefObject<HTMLDivElement> = useRef(null);
  const emojies: Array<React.RefObject<HTMLButtonElement>> = [
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
    useRef(null),
  ];

  let blockViceVersa = useRef<boolean>(true);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [speakers, setSpeakers] = useState<Speaking[]>([]);
  const iamTryingToConnect = useRef<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState({
    progressTransferFile: 0,
    downloadSpeed: "",
    speedUnit: "",
  });
  const socketIds = useRef<Array<IP>>();
  const socketIndex = useRef<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const blob = useRef<Blob | null>(null);
  const createStream = async (socketId: string) => {
    const audioCtx = new AudioContext();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });

    console.log("streamm passing!");
    if (!stream) {
      return alert("Please allow the jarui permissions");
    }

    const micSource = audioCtx.createMediaStreamSource(stream);
    const scriptNode = audioCtx.createScriptProcessor(2048, 1, 1); // adjust bufferSize and channel count as needed

    scriptNode.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer;
      // Analyze audio data here (e.g., calculate root mean square - RMS)
    };

    micSource.connect(scriptNode);
    scriptNode.connect(audioCtx.destination);

    function isSpeech(buffer: any) {
      const channels = buffer.numberOfChannels;
      let rms = 0;
      for (let c = 0; c < channels; c++) {
        for (let i = 0; i < buffer.length; i++) {
          const sample = buffer.getChannelData(c)[i];
          rms += sample * sample;
        }
      }
      rms = Math.sqrt(rms / (buffer.length * channels));
      // Set a threshold for speech detection and adjust based on your environment
      return rms > 0.01;
    }

    let isSpeaking = false;

    scriptNode.onaudioprocess = (event) => {
      const inputBuffer = event.inputBuffer;
      const speechActive = isSpeech(inputBuffer);

      if (!isSpeaking && speechActive) {
        console.log("Speech started");
        isSpeaking = true;
        setSpeakers((prev) =>
          prev.map((strm) => {
            if (strm.socketId === socketBio.id) {
              return {
                ...strm,
                speaking: true,
              };
            }
            return strm;
          })
        );
        // Fire your "speech started" event here
      } else if (isSpeaking && !speechActive) {
        console.log("Speech stopped");
        isSpeaking = false;
        setSpeakers((prev) =>
          prev.map((strm) => {
            if (strm.socketId === socketBio.id) {
              return {
                ...strm,
                speaking: false,
              };
            }
            return strm;
          })
        );
        // Fire your "speech stopped" event here
      }
    };
    const shallowRefference = { ...videoRef };
    // const audioContext = new (window.AudioContext ||
    //   window.webkitAudioContext)();
    // const source = audioContext.createMediaStreamSource(stream);
    // const analyser = audioContext.createAnalyser();
    // analyser.fftSize = 256;
    // const bufferLength = analyser.frequencyBinCount;
    // const dataArray = new Uint8Array(bufferLength);

    // source.connect(analyser);

    // let speaking = false;
    // const silenceThreshold = 30;
    // const silenceTimeout = 500;

    // let silenceTimer: ReturnType<typeof setTimeout>;

    // const checkAudio = () => {
    //   analyser.getByteFrequencyData(dataArray);

    //   const sum = dataArray.reduce(
    //     (acceleration, velocity) => acceleration + velocity,
    //     0
    //   );
    //   const average = sum / bufferLength;

    //   if (average > silenceThreshold) {
    //     if (!speaking) {
    //       speaking = true;
    //       console.log("User started speaking");
    //       setSpeakers((prev) =>
    //         prev.map((strm) => {
    //           if (strm.socketId === socketBio.id) {
    //             return {
    //               ...strm,
    //               speaking: true,
    //             };
    //           }
    //           return strm;
    //         })
    //       );
    //     }
    //     clearTimeout(silenceTimer);
    //   } else {
    //     if (speaking) {
    //       clearTimeout(silenceTimer);
    //       silenceTimer = setTimeout(() => {
    //         speaking = false;
    //         console.log("User stopped speaking");
    //         setSpeakers((prev) =>
    //           prev.map((strm) => {
    //             if (strm.socketId === socketBio.id) {
    //               return {
    //                 ...strm,
    //                 speaking: false,
    //               };
    //             }
    //             return strm;
    //           })
    //         );
    //       }, silenceTimeout);
    //     }
    //   }

    //   requestAnimationFrame(checkAudio);
    // };

    // checkAudio();
    setStreams((prev) => [
      ...prev,
      {
        socketId,
        stream,
        ref: shallowRefference,
        mute: false,
        webcam: false,
        name: yourName,
      },
    ]);
    setSpeakers((prev) => [
      ...prev,
      {
        speaking: false,
        socketId,
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
    let startTime = 0;
    let lastUpdateTime = 0;

    channel.onmessage = (event) => {
      const { data } = event;

      try {
        if (data.byteLength) {
          receivedBuffer.push(data);
          totalBytesArrayBuffers += data.byteLength;

          const currentTime = new Date().getTime();
          const elapsedTime = (currentTime - startTime) / 1000; // Elapsed time in seconds

          if (elapsedTime - lastUpdateTime >= 1) {
            // Update UI every second
            const speedMbps =
              (totalBytesArrayBuffers * 8) / (1024 * 1024) / elapsedTime; // Convert bytes to bits and divide by 1,000,000 to get Mbps
            const speedKBps = totalBytesArrayBuffers / 1024 / elapsedTime; // Calculate speed in KB/s

            let speedValue, speedUnit;
            if (speedMbps >= 1) {
              speedValue = speedMbps.toFixed(2);
              speedUnit = "Mbps";
            } else {
              speedValue = speedKBps.toFixed(2);
              speedUnit = "KB/s";
            }

            setDownloadProgress({
              progressTransferFile:
                (totalBytesArrayBuffers * 100) / totalBytesFileBuffer,
              downloadSpeed: speedValue,
              speedUnit: speedUnit,
            });
            lastUpdateTime = elapsedTime;
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
          startTime = new Date().getTime();
          lastUpdateTime = 0;
        }
      } catch (err) {
        receivedBuffer = [];
        totalBytesFileBuffer = 0;
        totalBytesArrayBuffers = 0;
      }
    };
  };

  const sendMessage = () => {
    setChat((prev) => [
      ...prev,
      {
        name: yourName,
        message,
        time: new Date().toDateString(),
      },
    ]);
    websocket.emit("send:message", { room, message });
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
    const heap = currentPeeringSocket.current;
    if (track.kind === "audio") {
      const audioCtx = new AudioContext();
      const micSource = audioCtx.createMediaStreamSource(
        nextUserStreamReference
      );
      const scriptNode = audioCtx.createScriptProcessor(2048, 1, 1); // adjust bufferSize and channel count as needed
      micSource.connect(scriptNode);
      scriptNode.connect(audioCtx.destination);

      function isSpeech(buffer: any) {
        const channels = buffer.numberOfChannels;
        let rms = 0;
        for (let c = 0; c < channels; c++) {
          for (let i = 0; i < buffer.length; i++) {
            const sample = buffer.getChannelData(c)[i];
            rms += sample * sample;
          }
        }
        rms = Math.sqrt(rms / (buffer.length * channels));
        // Set a threshold for speech detection and adjust based on your environment
        return rms > 0.01;
      }

      let isSpeaking = false;

      scriptNode.onaudioprocess = (event) => {
        const inputBuffer = event.inputBuffer;
        const speechActive = isSpeech(inputBuffer);

        if (!isSpeaking && speechActive) {
          console.log("Speech started");
          isSpeaking = true;
          setSpeakers((prev) =>
            prev.map((strm) => {
              if (strm.socketId === heap) {
                return {
                  ...strm,
                  speaking: true,
                };
              }
              return strm;
            })
          );
          // Fire your "speech started" event here
        } else if (isSpeaking && !speechActive) {
          console.log("Speech stopped");
          isSpeaking = false;
          setSpeakers((prev) =>
            prev.map((strm) => {
              if (strm.socketId === heap) {
                return {
                  ...strm,
                  speaking: false,
                };
              }
              return strm;
            })
          );
          // Fire your "speech stopped" event here
        }
      };
      return;
    }

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
        name: "loading...",
      },
    ]);
    setSpeakers((prev) => [
      ...prev,
      {
        speaking: false,
        socketId: currentPeeringSocket.current,
      },
    ]);
    websocket.emit("get:name", {
      room,
      socketId: currentPeeringSocket.current,
    });

    websocket.on("set:name", (name) => {
      console.log("name I am getting!: ", name);
      setStreams((prev) =>
        prev.map((itm) => {
          if (itm.socketId === currentPeeringSocket.current) {
            return { ...itm, name };
          }
          return itm;
        })
      );
    });
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
        // onContinuesMicChecking();
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
        pausedRef.current = true;
        videoMediaRef.current?.pause();
      });

      websocket.on("on:someone:pause:controller", (socketId) => {
        console.log("from user: ", socketId);
        videoMediaRef.current?.pause();
        console.log("one thing to considerd is this$: ", [...streams]);
        // setController(false);
      });

      websocket.on("on:someone:speaking", (socketId) => {
        console.log("the user speaking: ", socketId);

        setSpeakers((prev) =>
          prev.map((strm) => {
            if (strm.socketId === socketId) {
              return {
                ...strm,
                speaking: true,
              };
            }
            return strm;
          })
        );
      });
      websocket.on("on:someone:stopped:speaking", (socketId) => {
        console.log("on user stops typing");
        setSpeakers((prev) =>
          prev.map((strm) => {
            if (strm.socketId === socketId) {
              return {
                ...strm,
                speaking: false,
              };
            }
            return strm;
          })
        );
      });
      websocket.on("on:someone:resume:controller", (socketId) => {
        console.log("from user$: ", socketId);
        videoMediaRef.current?.play();
        // setController(true);
      });
      websocket.on("someone:sends:emoji", ({ socketId, id }) => {
        console.log("from socket user: ", socketId);
        let inIndex = Number(id);
        blockViceVersa.current = false;
        emojies[inIndex].current!.click();
      });

      websocket.on("you:are:kicked:out", () => {
        onLeave();
      });
      websocket.on("room:deleted:by:admin", () => {
        onLeave();
      });

      websocket.on("get:someone:typing", ({ name, socketId, pre }) => {
        console.log("what is happening mfs: ", name, socketId, pre);
        !pre
          ? setTyping((prev) => [
              ...prev,
              {
                name,
                socketId,
              },
            ])
          : null;
      });

      websocket.on("get:someone:stops:typing", (socketId) => {
        setTyping((prev) => prev.filter((pr) => pr.socketId !== socketId));
      });
      websocket.on(
        "get:someone:message",
        ({
          name,
          message,
        }: {
          name: string;
          socketId: string;
          message: string;
        }) => {
          setChat((prev) => [
            ...prev,
            {
              name,
              time: new Date().toDateString(),
              message,
            },
          ]);
        }
      );
      websocket.on("pass:the:timeline", (socketId) => {
        const timeline = getTimeline();

        if (timeline) {
          websocket.emit("send:back:timeline", { user: socketId, timeline });
        }
      });

      websocket.on("get:back:the:timeline", (timeline) => {
        console.log("getted to set this as expected timeline!: ", timeline);
        videoMediaRef.current!.currentTime = parseFloat(timeline);
      });
      websocket.on(
        "on:playback:speed",
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
        pausedRef.current = false;
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
        // thingsTodelete.forEach((key) => deleteCookie(key));
        localStorage.removeItem("pre-peer");
      });

      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          console.log("Browser tab is hidden");
          try {
            videoMediaRef.current!.pause();
          } catch (err: any) {
            null;
          }
          websocket.emit("pause:due:out:of:visiblity", room);
        } else {
          !pausedRef.current ? videoMediaRef.current!.play() : null;
          websocket.emit("play:due:of:visiblity", room);
          console.log("Browser tab is visible");
        }
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
            // onContinuesMicChecking();
            websocket.emit("set:room:name", room);
            websocket.emit("send:ids:to:me", room);
            window.addEventListener("beforeunload", function (e) {
              e.returnValue = "";
              websocket.emit("i:am:done", { room, socketId: socketBio.id });
              localStorage.removeItem("pre-peer");
              // thingsTodelete.forEach((key) => deleteCookie(key));
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
  const onEnter = async (event: any) => {
    event.preventDefault();
    console.log("requesting for the room");
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

  const getTimeline = () => {
    let cookie = document.cookie;
    let timeline: string | null = null;
    let splittedCookie = cookie.split(";");
    for (let i = 0; i < splittedCookie.length; i++) {
      let key = splittedCookie[i].split("=")[0].trim();
      if (key === "timeline") {
        timeline = splittedCookie[i].split("=")[1].trim();
        break;
      }
    }

    return timeline;
  };

  const onContinuesMicChecking = () => {
    const recognition =
      new webkitSpeechRecognition() || new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = function (event) {
      if (websocket) {
        websocket.emit("i:am:speaking", room);
        setSpeakers((prev) =>
          prev.map((strm) => {
            if (strm.socketId === socketBio.id) {
              return {
                ...strm,
                speaking: true,
              };
            }
            return strm;
          })
        );
      }
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          console.log(event.results[i][0].transcript);
        }
      }
    };

    recognition.onend = function () {
      recognition.start();
    };
    recognition.onspeechend = function () {
      console.log("User stopped speaking.");
      if (websocket) {
        websocket.emit("i:am:stopped:speaking", room);
        setSpeakers((prev) =>
          prev.map((strm) => {
            if (strm.socketId === socketBio.id) {
              return {
                ...strm,
                speaking: false,
              };
            }
            return strm;
          })
        );
      }
    };
    recognition.onerror = function (event) {
      console.error("Speech recognition error", event);
    };

    recognition.start();
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
    const timeline = getTimeline();
    if (timeline) {
      videoMediaRef.current!.onloadedmetadata = (event) => {
        console.log(
          "timeline found!: ",
          parseFloat(timeline),
          videoMediaRef.current,
          event
        );
        videoMediaRef.current!.currentTime = parseFloat(timeline);
      };
    }
    if (admin) return;
    let ormm = returnPromise();
    if (ormm) {
      websocket.emit("set:stream:ready", room);
    } else {
      websocket.emit("get:admin:timeline", room);
    }
  };

  const syncPause = () => {
    console.log("on:pause");
    pausedRef.current = true;
    websocket.emit("sync:pause", room);
  };
  const syncPlay = () => {
    console.log("comming here!");
    pausedRef.current = false;
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
        break;
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
    console.log("dragging asf");
    if (draggedTimeline == previousTimeline.current) return;
    websocket.emit("set:dragging:portion", { room, timeline: draggedTimeline });
    previousTimeline.current = draggedTimeline as number;
  };

  const onSyncRate = () => {
    const rateSpeed = videoMediaRef.current?.currentTime;
    websocket.emit("set:rate:speed", { room, speed: rateSpeed });
  };

  function deleteCookie(name: string) {
    document.cookie =
      name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  }

  const onLeave = () => {
    alert("you have kicked out!");
    thingsTodelete.forEach((key) => deleteCookie(key));
    websocket.emit("leave:forcefull", room);
    websocket.emit("i:am:done", { room, socketId: socketBio.id });
    websocket.emit("kick:out", room);

    if (admin) {
      websocket.emit("delete:room", room);
    }

    localStorage.removeItem("pre-peer");
    history("/");
  };

  const onTimeUpdate = () => {
    console.log("this mtf!");
    const currentTimeLine = videoMediaRef.current?.currentTime;
    if (currentTimeLine === 0) {
      return;
    }
    document.cookie = "timeline=" + currentTimeLine;
  };

  function debounce<T extends (...args: any[]) => void>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;

    return function (this: any, ...args: Parameters<T>): void {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  const onUserStopTyping = useCallback(() => {
    console.log("The user stopped typing.");
    websocket ? websocket.emit("user:stopped:typing", room) : null;
  }, [websocket, room]);

  const debouncedOnUserStopTyping = useCallback(
    debounce(onUserStopTyping, 500),
    [onUserStopTyping]
  );

  const setMessageWithDebounce = (message: string) => {
    setMessage(message);
    websocket.emit("set:you:are:typing", room);
    debouncedOnUserStopTyping();
  };
  const kickOut = (socketId: string) => {
    websocket.emit("kick:out:user", socketId);
  };

  function handleEmojiClick(e: any) {
    const emojiEl = document.createElement("div");
    emojiEl.classList.add("emoji-animate");

    const { innerHTML } = e.target;
    emojiEl.innerHTML = innerHTML;

    container.current!.appendChild(emojiEl);

    const { height, left } = e.target.getBoundingClientRect();
    const { bottom, top, width } = container.current!.getBoundingClientRect();

    const animation = emojiEl.animate(
      [
        {
          opacity: 1,
          transform: `translate(${left}px, ${bottom}px)`,
        },
        {
          opacity: 0,
          transform: `translate(${width / 2}px, ${top - height}px)`,
        },
      ],
      {
        duration: 2000,
        easing: "cubic-bezier(.47,.48,.44,.86)",
      }
    );

    animation.onfinish = () => emojiEl.remove();
    if (!blockViceVersa.current) return (blockViceVersa.current = true);
    console.log("current socket passing: ", websocket);
    websocket
      ? websocket.emit("send:emoji:reaction", { room, id: e.target.id })
      : null;
  }
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
      {roomUnlocked === 4 && (
        <div>
          {" "}
          <div className="h-screen w-screen bg-gray-50 flex items-center">
            <div className="container flex flex-col md:flex-row items-center justify-between px-5 text-gray-700">
              <div className="w-full lg:w-1/2 mx-8">
                <div className="text-7xl text-green-500 font-dark font-extrabold mb-8">
                  {" "}
                  404
                </div>
                <p className="text-2xl md:text-3xl font-light leading-normal mb-8">
                  We are working on some major improvements and errors and
                  currently shutting down for maintenance, but don't worry—you
                  will soon be able to use this service.
                </p>

                <a
                  href="https://google.com"
                  className="px-5 inline py-3 text-sm font-medium leading-5 shadow-2xl text-white transition-all duration-400 border border-transparent rounded-lg focus:outline-none bg-green-600 active:bg-red-600 hover:bg-red-700"
                >
                  get back soon.
                </a>
              </div>
              <div className="w-full lg:flex lg:justify-end lg:w-1/2 mx-5 my-12">
                <img
                  src="https://user-images.githubusercontent.com/43953425/166269493-acd08ccb-4df3-4474-95c7-ad1034d3c070.svg"
                  className=""
                  alt="Page not found"
                />
              </div>
            </div>
          </div>
        </div>
      )}
      {roomUnlocked === 1 && (
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
                </span>
              </div>
              <p className="text-gray-100">or use email your account</p>
              <form action="" className="sm:w-2/3 w-full px-4 lg:px-0 mx-auto">
                <div className="pb-2 pt-4">
                  <input
                    className="block w-full p-4 text-lg rounded-sm bg-black"
                    type="password"
                    name="password"
                    id="password"
                    placeholder="Passcode"
                    value={passcode}
                    onChange={(event) => {
                      setpasscode(event.target.value);
                    }}
                  />
                </div>

                <div className="px-4 pb-2 pt-4">
                  <button
                    onClick={onEnter}
                    className="uppercase block w-full p-4 text-lg rounded-full bg-indigo-500 hover:bg-indigo-600 focus:outline-none"
                  >
                    Join Room!
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
        // <div className="join-room">
        //   <div>Hey, join this room by enterning the passcode</div>
        //   <label htmlFor="your-passcode">your passcode</label>
        //   <input
        //     type="text"
        //     id="your-passcode"
        //     value={passcode}
        //     onChange={(event) => {
        //       setpasscode(event.target.value);
        //     }}
        //   />
        //   <button onClick={onEnter}>enter</button>
        // </div>
      )}
      {roomUnlocked === 2 && (
        <div>
          <div className="flex items-center justify-center min-h-screen p-5 bg-gray-100 min-w-screen">
            <div className="flex space-x-2 animate-pulse">
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
              <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            </div>
          </div>
        </div>
      )}
      {roomUnlocked === 5 && (
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
                      <p className="text-sm text-gray-500">Access Denied</p>
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
      {roomUnlocked === 3 && (
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
                        You can't join the same room at 2 different places!
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
      {roomUnlocked === 7 && (
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
                        you can't join 2 two rooms at a same time
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
      {roomUnlocked === 0 && (
        <div className="room">
          {!admin ? (
            <>
              <h2>
                download progress: {downloadProgress.progressTransferFile}
              </h2>
              <h3>
                speed: {downloadProgress.downloadSpeed}{" "}
                {downloadProgress.speedUnit}
              </h3>
            </>
          ) : null}
          {streams.length > 0 && (
            <div>
              Livecams
              {streams.map((webrtc) => (
                <StreamItem
                  key={webrtc.socketId}
                  webrtc={webrtc}
                  admin={admin}
                  socketBio={socketBio}
                  kickOut={kickOut}
                />
              ))}
              {speakers.map((wbcc, index) => {
                return (
                  <div key={index}>
                    for user: {wbcc.socketId} and{" "}
                    {wbcc.speaking ? "😂😂" : "💀💀💀"}
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
          <button onClick={onLeave}>leave</button>
          <div className="chat-box">
            {typing.map((per, index) => {
              return <div key={index}>{per.name}: Typing.....</div>;
            })}
            {chats?.length > 0 ? (
              chats.map((evr, index) => {
                return (
                  <div key={index}>
                    <h3>{evr.name}</h3>
                    <h2>{evr.message}</h2>
                    <h4>{evr.time}</h4>
                  </div>
                );
              })
            ) : (
              <div>No chats yet!</div>
            )}
            <input
              type="text"
              id="input-text"
              value={message}
              onChange={(event) => setMessageWithDebounce(event.target.value)}
            />
            <button onClick={sendMessage}>Send Message</button>
          </div>
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
                  width={"300px"}
                  height={"400px"}
                  onPause={syncPause}
                  onPlay={syncPlay}
                  onSeeking={onContinousSeeking}
                  onRateChange={onSyncRate}
                  loop={false}
                  onTimeUpdate={onTimeUpdate}
                ></video>
              </div>
            )}
          </div>

          <div className="emoji-container" ref={container}></div>

          <div className="emoji-list">
            <ul>
              <li>
                <button
                  id="0"
                  ref={emojies[0]}
                  onClick={(event) => {
                    handleEmojiClick(event);
                  }}
                  aria-label="Heart emoji"
                >
                  💖
                </button>
              </li>
              <li>
                <button
                  id="1"
                  ref={emojies[1]}
                  onClick={(event) => {
                    handleEmojiClick(event);
                  }}
                  aria-label="Thumbs up emoji"
                >
                  👍
                </button>
              </li>
              <li>
                <button
                  id="2"
                  ref={emojies[2]}
                  aria-label="Party popper emoji"
                  onClick={(event) => {
                    handleEmojiClick(event);
                  }}
                >
                  🎉
                </button>
              </li>
              <li>
                <button
                  id="3"
                  ref={emojies[3]}
                  aria-label="Clapping hands emoji"
                  onClick={(event) => {
                    handleEmojiClick(event);
                  }}
                >
                  👏
                </button>
              </li>
              <li>
                <button
                  id="4"
                  ref={emojies[4]}
                  aria-label="Laughing emoji"
                  onClick={(event) => {
                    handleEmojiClick(event);
                  }}
                >
                  😂
                </button>
              </li>
              <li>
                <button
                  id="5"
                  ref={emojies[5]}
                  aria-label="Surprised face emoji"
                  onClick={(event) => {
                    handleEmojiClick(event);
                  }}
                >
                  😯
                </button>
              </li>
              <li>
                <button
                  id="6"
                  ref={emojies[6]}
                  aria-label="Crying face emoji"
                  onClick={(event) => {
                    handleEmojiClick(event);
                  }}
                >
                  😢
                </button>
              </li>
              <li>
                <button
                  id="7"
                  ref={emojies[7]}
                  aria-label="Thinking face emoji"
                  onClick={(event) => {
                    handleEmojiClick(event);
                  }}
                >
                  🤔
                </button>
              </li>
              <li>
                <button
                  id="8"
                  ref={emojies[8]}
                  aria-label="Thumbs down emoji"
                  onClick={(event) => {
                    handleEmojiClick(event);
                  }}
                >
                  👎
                </button>
              </li>
            </ul>
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
