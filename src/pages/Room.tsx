import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { SocketContext } from "../contexts/socketContext";
import { v4 as uuidv4 } from 'uuid';
import {
  returnToken,
  returnCustomIp,
  returnFriendToken,
} from "../utils/cookie";
import StreamItem from "./StreamItem";
import "./worker.css";

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
  ref: string;
  threedOT: boolean;
  mute: boolean;
  webcam: boolean;
  name: string;
  speaking: boolean;
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
  const [isMute, setIsMute] = useState(false);
  const [isVisible, setIsVisible] = useState(false); // Single state for visibility
  const [isChatOpen, setIsChatOpen] = useState(false);
  const idsRef = useRef<any>();
  const showOptions = true;
  const mainStream = useRef<any>(); // Ref to store the media stream
  const canvasRef = useRef(null);
  const pushToEnd  = useRef<HTMLDivElement | null>(null);
  const [isArrowUped, setIsArrowUped] = useState(false);
  const [isEmojiOpened, setIsEmojiOpened] = useState(false);
  const [minimizedBar, setMiniMizedBar] = useState<boolean>(false);

  function getDeviceType() {
    const userAgent = navigator.userAgent || navigator.vendor || !(window as any).opera;
    const isMobileDevice =
      /android/i.test(userAgent as string) || /iPad|iPhone|iPod/.test(userAgent as string);

    if (isMobileDevice) {
      return "mobile";
    }

    if (window.matchMedia("(max-width: 767px)").matches) {
      return "mobile";
    }

    return "desktop";
  }

  const [phoneOrPc, setPhoneOrPc] = useState("");
  const [removePopUp, setRemovePop] = useState(true);

  useEffect(() => {
    const deviceType = getDeviceType();
    setPhoneOrPc(deviceType);
    setRemovePop(deviceType !== "mobile");
  }, []);
  const [enableFfModal, setEnableFfModal] = useState(false);
  const handleMic = () => {
     
    setIsMute((prev) => !prev);
  };


  const handleChat = () => {
    setIsChatOpen((prev) => !prev);
    pushToEnd.current!.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    window.addEventListener("orientationchange", function () {
      console.log("Orientation changed to: " + window.orientation);

      if (window.orientation === 0) {
        // Portrait orientation
        setRemovePop(false);
      } else if (window.orientation === 90 || window.orientation === -90) {
        // Landscape orientation
        setRemovePop(true);
        !document.fullscreenElement
          ? setEnableFfModal(true)
          : setEnableFfModal(false);
        // Attach fullscreen trigger to a user interaction
        document.addEventListener(
          "click",
          () => {
            fullScreen(document.documentElement);
            setEnableFfModal(false);
          },
          { once: true }
        );
      }
    });
  }, []);

  function fullScreen(element: any) {
    if (element.requestFullscreen) {
      element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen();
    } else if (element.mozRequestFullscreen) {
      element.mozRequestFullscreen();
    }
  }

  const [passcode, setpasscode] = useState<string>("");
  const connecting = useRef<boolean>(false);
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
  const adminRef = useRef<boolean>(admin);

  useEffect (() => {
    adminRef.current = admin;
  }, [admin]);
  const idx = useRef<number>(0);
  const localStream = useRef<MediaStream | null>(null);
  const videoMediaRef: React.RefObject<HTMLVideoElement> = useRef(null);
  const previousTimeline = useRef<number>(0);
  const [playing, setPlaying] = useState<boolean>(false);
  const videoFile: React.RefObject<HTMLInputElement> = useRef(null);
  const Pcs = useRef<Array<{
  id: string,
  pc: Peer
  }>>([]);
  const nameAdded = useRef<boolean>(false);
  const [typing, setTyping] = useState<
    Array<{
      name: string;
      socketId: string;
    }>
  >([]);
  const notification = useRef<Notification | null>(null);
  const [chats, setChat] = useState<
    Array<{
      name: string;
      socketId: string;
      parentMessage: string;
      parentTime: string;
      uuid: string;
      inheritedChat: Array< { 
        message: string;
        time: string;
      } >
    }>
  >([]);
  const apneChatsRef = useRef<any>(null);
  useEffect ( () => {
    apneChatsRef.current = chats;
  }, [chats] )
  const [message, setMessage] = useState<string>("");
  const admiRef = useRef(admin);
  useEffect(() => {
    admiRef.current = admin;
  }, [admin]);
  const [roomUnlocked, setRoomUnlocked] = useState<number>(2);
  // const [notificationEnabled, setNotificationEnabled] =
  //   useState<boolean>(false);
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

  useEffect(() => {
    console.log("nothing");
  }, [afterFileSelected])
  let [media, setMedia] = useState<string>("");
  const room = id;
  const [token, setToken] = useState<string>("");
  const streamSenderId = useRef<string>("");
  const nextPersonSenderId = useRef<string>("");
  const nextPersonId = useRef<string>("");
  const [yourName, setYourName] = useState<string>(
    localStorage.getItem("your-name") as string
  );
  const ddn = useRef<boolean>(false);
  const container: React.RefObject<HTMLDivElement> = useRef(null);
  const chatNotOpenedOrTabUnvisible = useRef<boolean>(false);


  let blockViceVersa = useRef<boolean>(true);
  const [streams, setStreams] = useState<Stream[]>([]);
  const [speakers, setSpeakers] = useState<Speaking[]>([]);

  useEffect(() => {
    
  }, [speakers])
  const [totalFileSize, setTotalSize] = useState({
    sizeUnit: "",
    size: 0
  });
  const [downloadProgress, setDownloadProgress] = useState({
    progressTransferFile: 0,
    downloadSpeed: "",
    speedUnit: "",
    mbLeft: "",
    sizeUnit: "",
    timeLeft: ""
  });

  // const videoRef = useRef<HTMLVideoElement>(null);
  const negotiationCounter = useRef<number>(1);
  const blob = useRef<Blob | null>(null);
  const streamRefs = useRef<Stream[]>([]);
  const createStream = async (socketId: string) => {
    const audioCtx = new AudioContext();
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    mainStream.current = stream;
    console.log("streamm passing!");
    if (!stream) {
      return alert("Please allow the jarui permissions");
    }

    const micSource = audioCtx.createMediaStreamSource(stream);
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
        
        const streamToUpdate = streamRefs.current.find((strm) => strm.socketId === socketBio.id);
          console.log(streamToUpdate);
          if(!streamToUpdate?.webcam) return;
        setStreams((prev) => prev.map((strm) => {
          if(strm.socketId === socketBio.id) {
            
            return {
              ...strm,
              speaking: true
            }
          }
          return strm;
        }));
        // Fire your "speech started" event here
      } else if (isSpeaking && !speechActive) {
        console.log("Speech stopped");
        isSpeaking = false;
       
          const streamToUpdate = streamRefs.current.find((strm) => strm.socketId === socketBio.id);
          console.log(streamToUpdate);
          if(!streamToUpdate?.webcam) return;
        setStreams((prev) => prev.map((strm) => {
          if(strm.socketId === socketBio.id) {
            return {
              ...strm,
              speaking: false
            }
          }
          return strm;
        }))
        // Fire your "speech stopped" event here
      }
    };
 

    setVideoMute(true);
     const myTracks = stream.getTracks();
    const myVideo = myTracks.filter(track => track.kind === "video")[0];
    myVideo.enabled = false;
    websocket.emit("set:my:track:option", {room, socketId: socketBio.id, video: true, block: true});
    setStreams((prev) => [
      ...prev,
      {
        socketId,
        stream,
        ref: socketBio.id,
        mute: false,
        webcam: true,
        name: yourName,
        threedOT: false,
        speaking: false
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
      streams.forEach((stream) => {
        let videoElement: HTMLVideoElement = document.getElementById(stream.ref as string) as HTMLVideoElement;
        
        if (videoElement && videoElement.srcObject !== stream.stream) {
          videoElement.srcObject = stream.stream;
        }
        
        // Check if the video is paused and play if not already playing
        if (videoElement && videoElement.paused) {
          videoElement.play();
        }
      });
  
      // Save current stream references
      streamRefs.current = streams;
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
    if (hasFile) return;
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
                    const speedBps = (totalBytesArrayBuffers * 8) / elapsedTime; // Speed in bits per second
                    const speedMbps = speedBps / (1024 * 1024); // Convert bits to Megabits
                    const speedKBps = totalBytesArrayBuffers / 1024 / elapsedTime; // Speed in KB per second

                    let speedValue, speedUnit;
                    if (speedMbps >= 1) {
                        speedValue = speedMbps.toFixed(2);
                        speedUnit = "Mbps";
                    } else {
                        speedValue = speedKBps.toFixed(2);
                        speedUnit = "KB/s";
                    }

                    // Calculate MB left
                    const bytesRemaining = totalBytesFileBuffer - totalBytesArrayBuffers;
                    let mbLeft: any = (bytesRemaining / (1024 * 1024)).toFixed(2); // Convert to MB
                      let sizeUnit: string;

                    if (totalBytesFileBuffer >= 1073741824) { // 1 GB in bytes
                        mbLeft = parseFloat((bytesRemaining / (1024 * 1024 * 1024)).toFixed(2)); // Convert to GB
                        sizeUnit = "GB";
                    } else {
                        mbLeft = parseFloat((bytesRemaining / (1024 * 1024)).toFixed(2)); // Convert to MB
                        sizeUnit = "MB";
                    }
                    // Calculate time left
                    const timeLeft = (bytesRemaining / speedBps).toFixed(2); // Time left in seconds

                    setDownloadProgress({
                        progressTransferFile: Math.floor((totalBytesArrayBuffers * 100) / totalBytesFileBuffer),
                        downloadSpeed: speedValue,
                        speedUnit: speedUnit,
                        mbLeft: mbLeft, // Remaining MB
                        sizeUnit,
                        timeLeft: timeLeft, // Time left in seconds
                    });

                    lastUpdateTime = elapsedTime;
                }
            } else if (data === LAST_DATA_OF_FILE) {
                getCompleteFile(receivedBuffer, totalBytesArrayBuffers, channel.label);
                channel.close();

                receivedBuffer = [];
                totalBytesFileBuffer = 0;
                totalBytesArrayBuffers = 0;
            } else {
                const initMessage = JSON.parse(data); // Parse the metadata message
                totalBytesFileBuffer = initMessage.totalByte || 0; // Store the total file size in bytes

                // Check if the file size is in GB or MB
                let fileSize: number;
                let sizeUnit: string;

                if (totalBytesFileBuffer >= 1073741824) { // 1 GB in bytes (1073741824 bytes)
                    fileSize = parseFloat((totalBytesFileBuffer / (1024 * 1024 * 1024)).toFixed(2)); // Convert to GB
                    sizeUnit = "GB";
                } else {
                    fileSize = parseFloat((totalBytesFileBuffer / (1024 * 1024)).toFixed(2)); // Convert to MB
                    sizeUnit = "MB";
                }

                // Now you have the file size and the unit (GB or MB) to display:
                console.log(`File size: ${fileSize} ${sizeUnit}`);
                setTotalSize({
                  size: fileSize,
                  sizeUnit: sizeUnit
                })
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
    let code = uuidv4();
     const date = new Date();
let hours = date.getHours();
let minutes: string | number = date.getMinutes();
minutes = minutes < 10 ? '0' + minutes : minutes;
hours = hours % 12 || 12;  
const currentTime = `${hours}:${minutes}`
    let messagesStack = chats[chats.length - 1];
    if(chats.length > 0 && messagesStack.socketId === socketBio.id) {
      setChat((prev) => prev.map(elements => {
        if(elements.uuid === messagesStack.uuid) {
          let pushedArray = elements.inheritedChat;
          pushedArray.push({
            message,
            time: currentTime
          })
          return {
            ...elements,
            inheritedChat: pushedArray
          }
        }
        return elements;
      }));
    }else {
    setChat((prev) => [
      ...prev,
      {
        name: yourName,
        socketId: socketBio.id,
        parentMessage: message,
        parentTime: currentTime,
        inheritedChat: [],
        uuid: code
      },
    ]);
  } 
    pushToEnd.current!.scrollIntoView({ behavior: "smooth" });
    websocket.emit("send:message", { room, message, uuid: code});
    setMessage("");
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
    setdownloadCompleted(false);
    setAfterDownloadPopUp(true);
    localStorage.setItem("has-file", "$"); 
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


  useEffect(() => {
    if (socketState.socket && socketBio.id) {
      if (ddn.current) {
        return setPromise(true);
      }
      (async () => {
        if (yourName && !nameAdded.current) {
          await setName$(yourName, socketBio.id, room ? room : "");
          setPromise(true);
          nameAdded.current = true;
        }
      })();
    }
  }, [socketBio, socketState, nameAdded.current]);

   const radius = 40; // Radius of the circle
  const circumference = 2 * Math.PI * radius; // Circumference of the circle

  // Calculate stroke-dashoffset based on the percentage
  const offset = circumference - (downloadProgress.progressTransferFile / 100) * circumference;
 const setTracks = useCallback(() => {
  console.log("sending-tracks: ");
    const senders =
      Pcs.current[Pcs.current.length - 1].pc.peer?.getSenders();
    for (let track of mainStream.current!.getTracks()) {
      let sender;
      try {
        sender = senders!.find((s: any) => s.track.kind === track.kind);
      } catch (err) {}
      if (sender) {
        console.log("replacing tracks; ",Pcs.current[Pcs.current.length - 1]); 
        sender.replaceTrack(track);
      } else {
        console.log("++" + Math.random()*1)
        console.log("adding tracks: ", Pcs.current[Pcs.current.length - 1]);
        Pcs.current[Pcs.current.length - 1].pc.peer?.addTrack(
          track,
          mainStream.current
        );
      }
    }
}, [mainStream.current]);
  const removeTracks = useCallback((socketId: any) => {
  const peerIndex = Pcs.current.findIndex((pcObj: any) => pcObj.id === socketId);
  if (peerIndex !== -1) {
    const senders = Pcs.current[peerIndex].pc.peer?.getSenders();
    senders!.forEach((sender: any) => {
      Pcs.current[peerIndex].pc.peer?.removeTrack(sender);
    });
    Pcs.current = Pcs.current.filter((pcObj: any) => pcObj.id !== socketId);
  }
}, []);

const makePeerConnections = async  (ids: Array<IP>): any => {
  nextPersonSenderId.current = "";
  negotiationCounter.current = 1; 
  if(!ids[idx.current]) return;

  if(ids[idx.current].socketId === socketBio.id) {
    idx.current++;
    return makePeerConnections(ids); 
  }
   Pcs.current.push({id: ids[idx.current].socketId, pc: new Peer()});
  nextPersonId.current = ids[idx.current].socketId;
    await createLocalOffer(ids[idx.current].socketId);
}
const createLocalOffer = async (id: string) => {
  const offer = await Pcs.current[Pcs.current.length - 1].pc.getOffer();
  websocket.emit("send-offer", {
    offer, socketId: id, mySocketId: socketBio.id
  });
};
const hasFile = localStorage.getItem("has-file") === "$" ? true : false;
  const [needAFile, setNeedAFile] = useState<boolean>(hasFile);
  const getRemoteTracks = async (event: any) => {
    const nextUserStreamReference = event.streams[0];
    const track = event.track;
    const heap = streamSenderId.current;

    console.log("LET'S SEE THE STREAM SENDER ID: ", heap);
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
          
         const streamToUpdate = streamRefs.current.find((strm) => strm.socketId === heap);
          console.log(streamToUpdate);
          if(!streamToUpdate?.webcam) return;
          setStreams((prev) => prev.map((strm) => {
          if(strm.socketId === heap) {
            return {
              ...strm,
              speaking: true
            }
          }
          return strm;
        }))
          // Fire your "speech started" event here
        } else if (isSpeaking && !speechActive) {
          console.log("Speech stopped");
          isSpeaking = false;
        
           const streamToUpdate = streamRefs.current.find((strm) => strm.socketId === heap);
          console.log(streamToUpdate);
          if(!streamToUpdate?.webcam) return;
          setStreams((prev) => prev.map((strm) => {
          if(strm.socketId === heap) {
            return {
              ...strm,
              speaking: false
            }
          }
          return strm;
        }))
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
      streams.filter((ax) => ax.socketId === heap)
        .length > 0
    )
      return;

    track.addEventListener("ended", () => {
      console.log("Provided stream ended: ", track);
      setStreams((prev: Stream[]) =>
        prev.filter((stream) => stream.stream.id !== nextUserStreamReference.id)
      );
    });
  
    websocket.emit("get:remotes:track:options", {room, socketId: heap});
      setStreams((prev) => [
              ...prev,
              {
                socketId: heap,
                stream: nextUserStreamReference,
                ref: heap,
                webcam: true,
                mute: false,
                name: "loading...",
                threedOT: false,
                speaking: false
              },
            ]);
     websocket.on("get:specific:user:track", (trace) => {
        console.log("checking: ", heap, trace, streamRefs.current);
        setStreams((prev) => prev.map((strm) => {
          if(strm.socketId === trace.socketId) {
            return {
              ...strm,
             webcam: trace.webcam,
                mute: trace.mute,
                name: trace.name,
            }
          }
          return strm;
        }));
      
    });
  };

  const makeNegotiation = useCallback(async () => {
    console.log("negotiation needed: ", !nextPersonSenderId.current ? nextPersonId.current : nextPersonSenderId.current);
    const offer = await Pcs.current[Pcs.current.length - 1].pc.getOffer();
    websocket.emit("send:negotiation", {
      socketId: !nextPersonSenderId.current ? nextPersonId.current : nextPersonSenderId.current,
      offer,
    mySocketId: socketBio.id
    });
  }, []);
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
        
        idsRef.current = ids;
          if(ids.length > 1 ) {
        console.log ("nepali songs")
        connecting.current = true;
        makePeerConnections(ids);
      } 
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

      
        setStreams((prev) => prev.map((strm) => {
          if(strm.socketId === socketId) {
            return {
              ...strm,
              speaking: true
            }
          }
          return strm;
        }))
      });
      websocket.on("on:someone:stopped:speaking", (socketId) => {
        console.log("on user stops typing");
        
        setStreams((prev) => prev.map((strm) => {
          if(strm.socketId === socketId) {
            return {
              ...strm,
              speaking: false
            }
          }
          return strm;
        }))
      });
      websocket.on("on:someone:resume:controller", (socketId) => {
        console.log("from user$: ", socketId);
        videoMediaRef.current?.play();
        // setController(true);
      });
      websocket.on("someone:sends:emoji", ({ socketId, id }) => {
        
        let inIndex = Number(id);
        console.log("from socket user(emoji explicit): ", socketId, inIndex);
        blockViceVersa.current = false;
        // emojies[inIndex].current!.click();
        let emojieButton = document.getElementById(String(inIndex));
        emojieButton?.click();
      });

      websocket.on("you:are:kicked:out", () => {
        onLeave();
      });
      websocket.on("room:deleted:by:admin", () => {
        onLeave(true);
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
          socketId,
          uuid
        }: {
          name: string;
          socketId: string;
          message: string;
          uuid: string;
          
        }) => {
             const date = new Date();
let hours = date.getHours();
let minutes: string | number = date.getMinutes();
minutes = minutes < 10 ? '0' + minutes : minutes;
hours = hours % 12 || 12;  

const currentTime = `${hours}:${minutes}`
           let messagesStack = apneChatsRef.current[apneChatsRef.current.length - 1];
     
    if(apneChatsRef.current.length > 0 && messagesStack.socketId === socketId) {
          //  alert(JSON.stringify(messagesStack));
      setChat((prev) => prev.map(elements => {
        if(elements.uuid === messagesStack.uuid) {
          let pushedArray = elements.inheritedChat;
          pushedArray.push({
            message,
            time: currentTime
          })
          return {
            ...elements,
            inheritedChat: pushedArray
          }
        }
        return elements;
      }));
    }else {
    setChat((prev) => [
      ...prev,
      {
        name: name,
        socketId,
        parentMessage: message,
        parentTime:currentTime,
        inheritedChat: [],
        uuid
      },
    ]);
  } 
  setIsChatOpen(true);
  pushToEnd.current!.scrollIntoView({ behavior: "smooth" });
          if (chatNotOpenedOrTabUnvisible.current) {
            const img = "/to-do-notifications/img/icon-128.png";
            const text = `${name}: ${message}`;
            notification.current = new Notification("message-queue", {
              body: text,
              icon: img,
            });
            console.log("notification: ", notification.current);
          }
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
        localStorage.removeItem("pre-peer");
        websocket.emit("leave:forcefull", {
      room, socketId: socketBio.id
    });
        websocket.emit("i:am:done", { room, socketId });
        websocket.emit("kick:out", room);
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
         
          console.log("recived negotiation offer: ", offer, socketId);
          const anwser = await Pcs.current[Pcs.current.length - 1].pc.connectRemoteOffer(offer);
            websocket.emit("negotiation:complete", {answer: anwser, socketId});
        }
      );

      websocket.on("on:user:disconnects", (socketId: string) => {
        console.log("the user wants to leave, just let him gooo!!!");
        removeTracks(socketId);
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
                webcam: false
              };
            }
            return stream;
          })
        );
      });

      websocket.on(
        "get:negotiation:answer",
        async ({ answer, socketId }: { answer: RTCSessionDescriptionInit, socketId: string }) => {
        
                  console.log("recived nego anwser:  ", socketId, answer);
       await  Pcs.current[Pcs.current.length - 1].pc.setRemoteDescription(answer);
      websocket.emit("send-track-vice-versa", socketId);
      setTracks();
        }
      );
      websocket.on("send-track", (socketId: string) => {
        let isAdmin = false;
    for(let i = 0; i < idsRef.current.length; i++) {
      if(idsRef.current[i].socketId === socketId && idsRef.current[i].isOc) {
        isAdmin = true;
      }
    }
    console.log("I may need to send tracks??🙄: ", socketId);
    nextPersonSenderId.current = socketId;
    console.log("socketidddddddd: ", socketBio.id);
    setTracks();
    if (idx.current + 1 !== idsRef.current.length || connecting.current) {
      if(isAdmin && negotiationCounter.current === 1) { 
        return negotiationCounter.current++;
      }
      console.log("FINALLY ERRORRRRROROROROROROROR S0LVED::::!!!!")
      idx.current++;
      if(idsRef.current[idx.current].socketId === socketBio.id) idx.current++;
      console.log("i got you bro: ", idsRef.current[idx.current], socketBio.id);
      makePeerConnections(idsRef.current); 
    }else {
      connecting.current = false;
    }
  })

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
           Pcs.current.push({id: whomSocketId, pc: new Peer()});
      streamSenderId.current = whomSocketId;
      const anwser = await Pcs.current[Pcs.current.length - 1].pc.connectRemoteOffer(offer);
      console.log("recived remote offer: ", offer)
      websocket.emit("send-anwser", {anwser, whomSocketId});
      Pcs.current[Pcs.current.length - 1].pc.peer?.addEventListener("track", getRemoteTracks);
       Pcs.current[Pcs.current.length - 1].pc.peer?.addEventListener("negotiationneeded", makeNegotiation);
      websocket.on("start:transmission", (socketId) => {
            console.log(
              "user: " +
                socketId +
                " requesting to get the file and btw the blob is: ",
              blob.current
            );
             Pcs.current[Pcs.current.length - 1].pc.createDataChannel();
            Pcs.current[Pcs.current.length - 1].pc.transferFile(
              blob.current
            );
          });
          websocket.emit("send:remote:offer", {
            socketId: whomSocketId,
            answer: anwser,
          });
        }
      );

      websocket.on(
        "get:remote:answer",
        async ({ answer, socketId }: { answer: RTCSessionDescriptionInit, socketId: string }) => {
              let isAdmin = false;
      for(let i = 0; i < idsRef.current.length; i++) {
        if(idsRef.current[i].socketId === socketId && idsRef.current[i].isOc) {
          isAdmin = true;
        }
      }
            console.log("recived answer:  ", socketId, answer);
        streamSenderId.current = socketId;
       await  Pcs.current[Pcs.current.length - 1].pc.setRemoteDescription(answer);
      Pcs.current[Pcs.current.length - 1].pc.peer?.addEventListener("track", getRemoteTracks);
        Pcs.current[Pcs.current.length - 1].pc.peer?.addEventListener("negotiationneeded", makeNegotiation);
          Pcs.current[Pcs.current.length - 1].pc.peer?.addEventListener(
      "datachannel",
      onDataChannelCallback
    );
     Pcs.current[Pcs.current.length - 1].pc.peer?.addEventListener("iceconnectionstatechange", 
        async (event) => {
        const pc = Pcs.current[Pcs.current.length - 1].pc.peer;
        if (pc?.iceConnectionState === "connected" && event) {
          if (isAdmin) {
            console.log("found admin, now requesting to send the data chunks");
            websocket.emit("negotiate:transfer:file",socketId);
          }
        }
      })
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
          localStorage.removeItem("pre-peer");
          websocket.emit("leave:forcefull", {
      room, socketId: socketBio.id
    });
          websocket.emit("i:am:done", { room, socketId });
          websocket.emit("kick:out", room);
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

      websocket.on("you:got:rejected", (room) => {
        if (admiRef.current) {
          return;
        }
        setJoining(false);
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
  const [joining, setJoining] = useState<boolean>(false);
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
      setJoining(false);
      return alert(payload.error);
    }
  };
  const onEnter = async (event: any) => {
    event.preventDefault();
    console.log("requesting for the room");
    setJoining(true);
    if (!passcode) 
      {
        setJoining(false);
        return alert("enter the passcode");
      }
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
    // alert("hmsafar: " + mute);
    setStreams((prevStreams) =>
      prevStreams.map((stream) => {
        if (stream.socketId === socketBio.id) {
          const updatedStream = { ...stream };
          audio
            ? (updatedStream.mute = !mute)
            : (updatedStream.webcam = !mute);
            const myTracks = updatedStream.stream.getTracks();
            const myAudio = myTracks.filter(track => track.kind === "audio")[0];
            const myVideo = myTracks.filter(track => track.kind === "video")[0];
            function toggleTrackMute(track: MediaStreamTrack) {
              track.enabled = !track.enabled;
              console.log(`${track.enabled ? 'unmuted' : 'muted'} track.kind`);
            }
            if(audio) {
              toggleTrackMute(myAudio);
              websocket.emit("set:my:track:option", {room, socketId: socketBio.id, video: false, block: myAudio.enabled ? false : true});
            }else {
              toggleTrackMute(myVideo);

              websocket.emit("set:my:track:option", {room, socketId: socketBio.id, video: true, block: !myVideo.enabled});
            }
          // audio
          //   ? updatedStream.stream.getAudioTracks()[0].enabled = !mute
          //   : updatedStream.stream.getVideoTracks()[0].enabled = mute;
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

  function formatTimeLeft(seconds: number): string {
  if (seconds < 60) {
    // If less than 60 seconds, show in seconds
    return `${Math.floor(seconds)} seconds`;
  } else {
    // If 60 seconds or more, convert to minutes and seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    // Format like: 1:01 for minutes:seconds
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")} minutes`;
  }
}

  const [file, setFile] = useState<{ name: string }>({ name: "" });
  const realFileGodDammit = useRef<File>();
  const [downloadCompleted, setdownloadCompleted] = useState<boolean>(true);
  const [FileSelected, setFileSelectedAlready] = useState<boolean>(false);
  const [openUploadModal, setUploadModal] = useState<boolean>(true);;
  const [afterDownloadPopUp, setAfterDownloadPopUp] = useState<boolean>(false); 
  const uploadVideo = () => {
    let file = videoFile.current
      ? videoFile.current.files
        ? videoFile.current.files[0]
        : null
      : null;
    if (!file) return alert("error uploading video");
    setFile({ name: file.name });
    realFileGodDammit.current = file;
  };
  const onUpload = () => {
    const file = realFileGodDammit.current!;
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

    if (admin) {
      setFileSelectedAlready(true);
      setUploadModal(false);
      return;
    }
    setAfterDownloadPopUp(false);
    setNeedAFile(false);
    let ormm = returnPromise();
    if (ormm) {
      websocket.emit("set:stream:ready", room);
    } else {
      websocket.emit("get:admin:timeline", room);
    }
  };
  const [leaveModal, setLeaveModal] = useState<boolean>(false);
  const syncPause = () => {
    console.log("on:pause");
    pausedRef.current = true;
    websocket.emit("sync:pause", room);
  };
  const syncPlay = () => {
    if(!pausedRef.current) return;
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

  const onLeave = (optional?: boolean) => {
    !optional ?  alert("you have kicked out!")  : alert("room deleted by admin!");
    thingsTodelete.forEach((key) => deleteCookie(key));
    localStorage.removeItem("pre-peer");
    localStorage.removeItem("has-file");
    websocket.emit("leave:forcefull", {
      room, socketId: socketBio.id
    });
    websocket.emit("i:am:done", { room, socketId: socketBio.id });
    websocket.emit("kick:out", room);

    if (adminRef.current) {
      websocket.emit("delete:room", room);
    }

    
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

  // useEffect(() => {
  //   if (!("Notification" in window)) {
  //     console.log("This browser does not support notifications.");
  //     return;
  //   }
  //   Notification.requestPermission().then((permission) => {
  //     const outcome: string = permission === "granted" ? "none" : "block";
  //     if (outcome == "granted") {
  //       setNotificationEnabled(true);
  //     }
  //   });
  // }, []);

  useEffect(() => {
    function isMobileOrTablet() {
      const userAgent = navigator.userAgent || navigator.vendor || !(window as any).opera;
      return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile/i.test(
        userAgent as string
      );
    }

    function checkFullScreen() {
      if (
    !document.fullscreenElement &&
    !(document as any).mozFullScreenElement &&
    !(document as any).webkitFullscreenElement &&
    !(document as any).msFullscreenElement
  ) {
        // Show the prompt if not in full-screen mode and if the pop-up should be shown
        if (removePopUp) {
          setEnableFfModal(true);
        }
      } else {
        // Hide the prompt if in full-screen mode
        setEnableFfModal(false);
      }
    }

    if (isMobileOrTablet()) {
      const intervalId = setInterval(checkFullScreen, 500);

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    }
  }, [removePopUp]);
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
                  Room Not Found! possibly deleted or something missing in the URL.
                </p>

                <a
                  href="https://google.com"
                  className="px-5 inline py-3 text-sm font-medium leading-5 shadow-2xl text-white transition-all duration-400 border border-transparent rounded-lg focus:outline-none bg-green-600 active:bg-red-600 hover:bg-red-700"
                >
                  try back soon.
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
        <>
         {joining && <div className="demo-container">
            <div className="progress-bar">
              <div className="progress-bar-value"></div>
            </div>
          </div> }
        <section className="min-h-screen flex items-stretch text-white ">
         
          <div
            className="lg:flex w-1/2 hidden bg-gray-500 bg-no-repeat bg-cover relative items-center"
            style={{
              backgroundImage:
                "url(https://i.imgur.com/X3TOadT.png)",
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
                  "url(https://i.imgur.com/X3TOadT.png)",
              }}
            >
              <div className="absolute bg-black opacity-60 inset-0 z-0"></div>
            </div>
            <div className="w-full py-6 z-20">
              <div className="py-6 space-x-2">
                <span className="w-10 h-10 items-center justify-center inline-flex rounded-full font-bold text-lg border-2 border-white">
                  ⚔️
                </span>
                <span className="w-10 h-10 items-center justify-center inline-flex rounded-full font-bold text-lg border-2 border-white">
                  ⚔️
                </span>
                <span className="w-10 h-10 items-center justify-center inline-flex rounded-full font-bold text-lg border-2 border-white">
                  ⚔️
                </span>
              </div>
              <p className="text-gray-100">Enter the passcode to continue.</p>
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
                    disabled={joining}
                  >
                    {!joining ? "Join Room!" : "Requesting..." }
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
                        You can't join the same room at 2 different places! or can't rejoin the same room after leaving the room!.
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
      {roomUnlocked === 0 && ( // 0 means room unlocked!!
        <>
        
          {isArrowUped ? (
            <div
              onClick={() => {
                setIsArrowUped(false);
              }}
              style={{ cursor: "pointer" }}
              className="fixed bottom-4 right-4 z-10 bg-[#373737] p-3 rounded-full flex items-center justify-center w-12 h-12 shadow-lg"
            >
              <i className="fa-solid fa-angle-up text-white"></i>
            </div>
          ) : null}
          {/* <div className="fixed bottom-4 right-6 z-50">
        <div className="bg-white border-l-4 border-blue-500 text-gray-800 rounded-md shadow-lg p-3 w-80 flex items-center">
          <div className="flex-grow">
            <h4 className="text-sm font-medium">John Doe</h4>
            <p className="text-xs text-gray-600 truncate">
              This is a custom notification message that might be too long to
              show entirely...
            </p>
          </div>
          <button
            className="ml-3 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1 px-2 rounded focus:outline-none"
            style={{ width: "20%" }}
          >
            x
          </button>
        </div>
      </div> */}


        {/* //   !admin ? (
        //     <>
        //       <h2>
        //         download progress: {downloadProgress.progressTransferFile}
        //       </h2>
        //       <h3>
        //         speed: {downloadProgress.downloadSpeed}{" "}
        //         {downloadProgress.speedUnit}
        //       </h3>
        //     </>
        //   ) : null} */}

         {!admin && !hasFile && downloadCompleted && !minimizedBar && <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black bg-opacity-60"></div>

        <div className="relative bg-gray-900 text-white rounded-lg shadow-xl p-6 w-96">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-white">
              Download in Progress
            </h2>
            <button className="text-gray-400 hover:text-gray-200" onClick={() => {
              setMiniMizedBar(true);
            }}>
              <span className="sr-only">Close</span><i className="fa-solid fa-down-left-and-up-right-to-center" style={{color: "#ffffff"}}></i>
            </button>
          </div>

          <div className="flex justify-center items-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-t-4 border-blue-500 animate-spin"></div>
              <div className="absolute inset-0 flex justify-center items-center text-xl font-semibold">
                {downloadProgress.progressTransferFile}%
              </div>
            </div>
          </div>

          <div className="text-gray-400 mb-4">
            <p>
              File: <span className="text-gray-200">ADMIN.FILE</span>
            </p>
            <p>
              Left to Download: <span className="text-gray-200">{downloadProgress.mbLeft}{" "}{downloadProgress.sizeUnit} of {totalFileSize.size}{" "}{totalFileSize.sizeUnit}</span>
            </p>
            <p>
              Time Left: <span className="text-gray-200">{formatTimeLeft(Number(downloadProgress.timeLeft))}</span>
            </p>
            <p>
              Speed: <span className="text-gray-200"> {downloadProgress.downloadSpeed}{" "}{downloadProgress.speedUnit}</span>
            </p>
          </div>

          <div className="flex justify-between">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md"
              style={{ width: "100%" }}
            >
              Connected, waiting for the file
            </button>
          </div>
        </div>
      </div> }
      {minimizedBar && downloadCompleted && <div className="fixed inset-0 z-50" style={{ pointerEvents: 'none' }}>
      <div className="absolute bottom-4 right-4 bg-gray-900 text-white rounded-lg shadow-xl p-6 w-80" style={{ pointerEvents: 'auto' }}>
        <h2 className="text-xl font-bold text-white mb-4">
          Download In Progress
        </h2>
        <p className="text-gray-400 mb-6" style={{cursor: "pointer"}} onClick={() => {
          setMiniMizedBar(false);
        }}>
          click here to maximize 🗖
        </p>
        <div className="flex justify-center mb-2">
          {/* Circular Progress Bar */}
          <svg className="w-20 h-20 mt-10 mr-3" viewBox="0 0 100 100">
            <circle
              className="text-gray-700"
              strokeWidth="8"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
            />
            <circle
              className="text-green-500"
              strokeWidth="8"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="50"
              cy="50"
              style={{
                transition: 'stroke-dashoffset 0.35s',
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
              }}
            />
             <text
              x="50"
              y="50"
              dominantBaseline="middle"
              textAnchor="middle"
              style={{
                fill: 'white',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              {`${downloadProgress.progressTransferFile}%`}
            </text>
          </svg>
        </div>
      </div>
    </div>}
          {admin && FileSelected && (
            <div className="fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black bg-opacity-60"></div>
              <div className="absolute bottom-4 left-4 bg-gray-900 text-white rounded-lg shadow-xl p-6 w-80">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-bold text-white">
                    Your Room is ready
                  </h2>
                  <button
                    onClick={() => {
                      setFileSelectedAlready(false);
                    }}
                    className="text-gray-400 hover:text-gray-200"
                  >
                    <span className="sr-only">Close</span>
                    &#x2715;
                  </button>
                </div>
                <p className="text-gray-400 mb-4">
                  Or share this room link with others you want in the room
                </p>
                <div className="bg-gray-800 p-2 rounded-lg flex items-center justify-between mb-4">
                  <span className="text-gray-300 text-sm" style={{ width: "90%" }} id="clip-board"> 
                    http://localhost:5317/{room}
                  </span>
                                    <button className="text-blue-400 hover:text-blue-500"   onClick={() => {
                                    let copyText: HTMLSpanElement = document.getElementById("clip-board")!;
                                    
                                    // Create a range and select the text
                                    let range = document.createRange();
                                    range.selectNode(copyText);
                                    let selection = window.getSelection();
                                    
                                    // Clear any existing selection and add the new range
                                    selection?.removeAllRanges();
                                    selection?.addRange(range);

                                    // Copy the selected text to the clipboard
                                    navigator.clipboard.writeText(copyText.textContent || '');

                                    // Apply a temporary highlight effect to indicate the text was copied
                                    copyText.style.backgroundColor = 'yellow'; // Highlight the text
                                    copyText.style.color = 'black'; // Change text color for visibility

                                    // Set a timeout to remove the highlight after a short delay
                                    setTimeout(() => {
                                      copyText.style.backgroundColor = ''; // Reset the background color
                                      copyText.style.color = ''; // Reset the text color
                                    }, 1000); // 1-second delay

                                    // Clear the selection after copying
                                    selection?.removeAllRanges();
                                  }}>
                    &#128203;
                  </button>
                </div>
                <p className="text-gray-400 text-sm mb-4">
                  <span className="inline-block align-middle mr-1">
                    &#9432;
                  </span>{" "}
                  People who use this room link must get your permission
                  before they can join.
                </p>
                <button onClick={async () => {
                    if (navigator.share) {
                      try {
                          await navigator.share({
                              title: 'WachWithMe',
                              text: localStorage.getItem("your-name") 
                              + "'s Room",
                              url: `http://localhost:5317/${room}` ,
                          });
                          console.log('Content shared successfully');
                      } catch (error) {
                          console.error('Error sharing:', error);
                      }
                  } else {
                      console.log('Web Share API is not supported in this browser.');
                  }                  
                }} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md mb-4">
                  Share
                </button>
                <p className="text-gray-400 text-sm">
                  Joined as {localStorage.getItem("your-name")}
                </p>
              </div>
            </div>
          )}
          {(hasFile && needAFile) || (admin && openUploadModal) || (afterDownloadPopUp && !downloadCompleted) ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="absolute inset-0 bg-black bg-opacity-60"></div>
              <div className="relative bg-gray-900 text-white rounded-lg shadow-xl p-6 w-80">
                <h2 className="text-xl font-bold text-white mb-4 text-center">
                  Upload a File
                </h2>
                <div className="mb-4">
                  <input
                    type="file"
                    id="select-video"
                    ref={videoFile}
                    onChange={uploadVideo}
                    className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700"
                  />
                  {file && (
                    <p className="mt-2 text-sm text-gray-400">
                      Selected file: {file.name}
                    </p>
                  )}
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={onUpload}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md"
                  >
                    Upload File
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          {admin &&
            requests.length > 0 && 
              <div style={{zIndex: "45"}}  className="fixed inset-0  flex items-end justify-end p-4">
            <div className="absolute inset-0 bg-black opacity-50"></div>

            <div className="relative z-10 flex flex-col space-y-4">
             
            { requests.map((payload, index) => {
              return (
           <div className="bg-gray-900 text-white rounded-lg shadow-xl p-6 w-80" key={index}>
                <h2 className="text-xl font-bold text-white mb-4">
                  {!Array.isArray(payload) ? payload.name : ""}, wants to join
                </h2>
                <p className="text-gray-400 mb-6">
                  Are you sure you want to Accept this user to join your room?
                </p>
                <div className="flex justify-end space-x-4">
                  <button className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-md shadow-md" onClick={() => {
                    if(admin && openUploadModal) return alert("Select A Video File First before adding other peoples to this room!");
                      websocket.emit("reject:socketid", {
                        socketId: !Array.isArray(payload) ? payload.id : "",
                        room,
                      });
                      clearRequest(index);
                    }}>
                    Reject
                  </button>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-md" onClick={() => {
                    if(admin && openUploadModal) return alert("Select A Video File First before adding other peoples to this room!");
                      websocket.emit("sign:accept", {
                        socketId: !Array.isArray(payload) ? payload.id : "",
                        room,
                      });
                      clearRequest(index);
                    }}>
                    Accept
                  </button>
                </div>
              </div> )
            })}
            </div>
          </div> }

          {leaveModal && <div
        id="modelConfirm"
        className="fixed z-50 inset-0 bg-gray-900 bg-opacity-60 overflow-y-auto h-full w-full px-4 "
      >
        <div className="relative top-40 mx-auto shadow-xl rounded-md bg-white max-w-md">
          <div className="flex justify-end p-2">
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
            >
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </button>
          </div>

          <div className="p-6 pt-0 text-center">
            <h3 className="text-xl font-normal text-gray-500 mt-5 mb-6">
              Are you sure you want to Exit this room? can't rejoin after then!
            </h3>
            <a
              href="#"
              onClick={() => onLeave()}
              className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-base inline-flex items-center px-3 py-2.5 text-center mr-2"
            >
              Yes, I'm sure
            </a>
            <a
              href="#"
              onClick={() => {
                setLeaveModal(false);
              }}
              className="text-gray-900 bg-white hover:bg-gray-100 focus:ring-4 focus:ring-cyan-200 border border-gray-200 font-medium inline-flex items-center rounded-lg text-base px-3 py-2.5 text-center"
              data-modal-toggle="delete-user-modal"
            >
              No, cancel
            </a>
          </div>
        </div>
      </div>}
          {enableFfModal ? (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
              <div className="bg-gray-800 text-white rounded-lg shadow-2xl p-8 max-w-lg w-full">
                <h2 className="text-4xl font-extrabold text-center text-white-400 mb-6">
                  Enter Full Screen
                </h2>
                <p className="text-center text-gray-300 text-lg mb-8">
                  For a more immersive experience, click the button below to go
                  full screen.
                </p>
                <div className="flex justify-center">
                  <button className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-3 px-6 rounded-lg shadow-lg">
                    Go Full Screen
                  </button>
                </div>
              </div>
            </div>
          ) : null}{" "}
          {!removePopUp ? (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50">
              <div className="bg-gray-800 text-white rounded-lg shadow-2xl p-8 max-w-lg w-full">
                <h2 className="text-4xl font-extrabold text-center text-white mb-6">
                  Rotate Your Device
                </h2>
                <div className="flex justify-center mb-4">
                  <img
                    src="data:image/png;base64,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
" // Replace with actual image URL
                    alt="Rotate to Landscape"
                    className="w-1/3 border-4 border-yellow-400 rounded"
                  />
                  <img
                    src="data:image/png;base64,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
" // Replace with actual image URL
                    alt="Turn on Landscape"
                    className="w-1/3 border-4 border-yellow-400 rounded ml-4"
                  />
                </div>
                <p className="text-center text-gray-300 text-lg mb-8">
                  For the best movie streaming experience, please switch to
                  landscape mode.
                </p>
                <div className="flex justify-center">
                  <button className="bg-blue-700 hover:bg-blue-800 text-white font-extrabold py-3 px-6 rounded-lg tracking-wider text-xl shadow-lg">
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          <div
            style={{
              display: "flex",
              backgroundColor: "#292929",
              position: "relative",
            }}
            className="emoji-getter"
            ref={container}
          >
            <div id="left">
              <div
                id="videoFrame"
                style={{
                  height: showOptions
                    ? isArrowUped
                      ? "96vh"
                      : "80vh"
                    : "100vh",
                }}
              >
                <video
                  controls
                  crossOrigin="anonymous"
                  id="select-video"
                  ref={videoMediaRef}
                  src={media}
                  onPause={syncPause}
                  onPlay={syncPlay}
                  onSeeking={onContinousSeeking}
                  onRateChange={onSyncRate}
                  loop={false}
                  onTimeUpdate={onTimeUpdate}
                  //         ></video>
                ></video>
              </div>
              <canvas
                ref={canvasRef}
                width={150}
                height={150}
                style={{ display: "none" }}
              />
              
                <div
                  className="emoji-list"
                  style={{
                    display: isEmojiOpened ? "block" : "none",
                    marginTop: "-3rem",
                    zIndex: "999",
                    backgroundColor: "#2c2c2c",
                    borderRadius: "50px",
                    paddingTop: ".5rem",
                    paddingBottom: ".5rem",
                    animation: isEmojiOpened
                      ? "fadeIn 0.2s ease-in-out"
                      : "fadeOut 0.5s ease-in-out",
                    boxShadow: "0 8px 16px rgba(0, 0, 0, 0.25)", // Added box shadow
                  }}
                >
                   <ul>
              <li>
                <button
                  id="0"
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
                  aria-label="dead"
                  onClick={(event) => {
                    handleEmojiClick(event);
                  }}
                >
                  💀
                </button>
              </li>
              <li>
                <button
                  id="3"
                 
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
              
              <div
                style={{
                  width: "80%",
                  borderRadius: "1rem",
                  height: "15vh",
                  position: "relative",
                  backgroundColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: isArrowUped ? "-55rem" : "1rem",
                  overflow: "hidden",
                }}
              >
                <div
                  className="options"
                  style={{ marginTop: showOptions ? "0" : "10rem" }}
                >
                  {" "}
                  <div
                    onClick={handleChat}
                    className="option"
                    style={{
                      backgroundColor: !isChatOpen ? "#373737" : "#F84242",
                    }}
                  >
                    <i className="fa-solid fa-comments"></i>
                  </div>
                  <div
                    onClick={() => {
                      setIsEmojiOpened(!isEmojiOpened);
                    }}
                    className="option"
                    style={{
                      backgroundColor: isEmojiOpened ? "#F84242" : "#373737",
                    }}
                  >
                    <i
                      className="fa-solid fa-face-laugh-beam"
                      style={{ color: "#ffffff" }}
                    ></i>
                  </div>
                  <div
                    onClick={() => {
                      setIsArrowUped(true);
                    }}
                    className="option"
                    style={{ backgroundColor: "#373737" }}
                  >
                    <i
                      className="fa-solid fa-angle-down"
                      style={{ color: "#ffffff" }}
                    ></i>
                  </div>
                  <div
                    onClick={() => {
                      setIsMute(!isMute);
                      onMuteorStopStreaming(true, mute); 
                    }}
                    className="option"
                    style={{ backgroundColor: isMute ? "#F84242" : "#373737" }}
                  >
                    <i
                      className={`fa-solid fa-${
                        isMute ? "microphone-slash" : "microphone"
                      }`}
                    ></i>
                  </div>
                  <div
                    onClick={() => {
                      setIsVisible(!isVisible);
                      onMuteorStopStreaming(false,videoMute);
                    }}
                    className="option"
                    style={{
                      backgroundColor: isVisible ? "#373737" : "#F84242",
                    }}
                  >
                    <i
                      className={`fa-solid fa-${
                        isVisible ? "video" : "video-slash"
                      }`}
                    ></i>
                  </div>
                  <div
                    onClick={handleMic}
                    className="option"
                    style={{ backgroundColor: "#373737" }}
                  >
                    {" "}
                    <i
                      className="fa-solid fa-gear"
                      style={{ color: "#ffffff" }}
                    ></i>{" "}
                  </div>
                  <div className="option" onClick={() => {
                    setLeaveModal(true);
                  }}>
                    <i
                      style={{ transform: "rotate(135deg)" }}
                      className="fa-solid fa-phone"
                    ></i>
                  </div>
                </div>
              </div>
            </div>
            <div id="right">
              <div className="frame">
                {streams.map((webrtc) => (
                  <StreamItem
                    key={webrtc.socketId}
                    webrtc={webrtc}
                    admin={admin}
                    socketBio={socketBio}
                    kickOut={kickOut}
                    setStreams={setStreams}
                  />
                ))}
              </div>
            </div>

            <div
              id="chat"
              style={{
                width: isChatOpen
                  ? phoneOrPc !== "mobile"
                    ? "40vw"
                    : "60vw"
                  : "25vw",
              }}
              className={isChatOpen ? "show relative" : "hide"}
            >
              <i
                onClick={handleChat}
                style={{ color: "grey" }}
                className="fa-solid fa-xmark absolute top-5 right-5 z-10 text-xl"
              ></i>
              <div className="flex flex-col h-full">
                <div
                  className="flex-grow overflow-y-auto p-4"
                  style={{
                    scrollbarWidth: "none", // For Firefox
                  }}
                >
                  <style>
                    {`
          /* Hide scrollbar for Chrome, Safari, and Opera */
          #chat .flex-grow::-webkit-scrollbar {
            display: none;
          }
          /* Hide scrollbar for IE, Edge, and Firefox */
          #chat .flex-grow {
            -ms-overflow-style: none;  /* IE and Edge */
            scrollbar-width: none;  /* Firefox */
          }
        `}
                  </style>
                  {/* Chat messages here */}
                  <div className="w-full">
                    {chats.length > 0 ? chats.map((content, index) => {
                      return content.socketId === socketBio.id ? <div className="flex gap-2.5 justify-end pb-1" key={index}>
                         <div>
                           <div className="grid mb-2">
                          <h5 className="text-right text-gray-900 text-sm font-semibold leading-snug pb-1">
                            You
                          </h5>
                          <div className="px-3 py-2 bg-indigo-600 rounded">
                            <h2 className="text-white text-sm font-normal leading-snug">
                              {content.parentMessage}
                            </h2>
                          </div>
                          <div className="justify-start items-center inline-flex">
                            <h3 className="text-gray-500 text-xs font-normal leading-4 py-1">
                              {content.parentTime}
                            </h3>
                          </div>
                        </div>
                        {content.inheritedChat.map((yourMessages) => {
                        return <div className="justify-center">
                          <div className="grid w-fit ml-auto">
                            <div className="px-3 py-2 bg-indigo-600 rounded">
                              <h2 className="text-white text-sm font-normal leading-snug">
                                {yourMessages.message}
                              </h2>
                            </div>
                            <div className="justify-start items-center inline-flex">
                              <h3 className="text-gray-500 text-xs font-normal leading-4 py-1">
                                You
                              </h3>
                            </div>
                          </div>
                        </div>
                      })}</div></div> : <div className="grid pb-1" key={index}> 
                      <div className="flex gap-2.5 mb-4">
                        <div className="grid">
                          <h5 className="text-gray-900 text-sm font-semibold leading-snug pb-1">
                            {content.name}
                          </h5><div className="w-max grid" style={{ width: "98%" }}>
                            <div className="px-3.5 py-2 bg-gray-100 rounded justify-start items-center gap-3 inline-flex">
                              <h5 className="text-gray-900 text-sm font-normal leading-snug">
                               {content.parentMessage}
                              </h5>
                            </div>
                            <div className="justify-end items-center inline-flex mb-1">
                              <h6 className="text-gray-500 text-xs font-normal leading-4 py-1">
                                {content.parentTime}
                              </h6>
                            </div>
                          </div>{content.inheritedChat.map((hisHerMessages) => {
                            return  <div className="w-max grid">
                            <div className="px-3.5 py-2 bg-gray-100 rounded justify-start items-center gap-3 inline-flex">
                              <h5 className="text-gray-900 text-sm font-normal leading-snug">
                                {hisHerMessages.message}
                              </h5>
                            </div>
                            <div className="justify-end items-center inline-flex mb-1">
                              <h6 className="text-gray-500 text-xs font-normal leading-4 py-1">
                                {hisHerMessages.time}
                              </h6>
                            </div>
                          </div>
                       })}</div>
                      </div>
                    </div>
                    }) : null}
                    <div ref={pushToEnd} style={{display: "block", backgroundColor: "white", paddingTop: "3rem", color: "white"}}></div>
                  </div>
                </div>
                <div className="p-2 text-sm text-gray-500">
                  {typing.map((per, index) => {
              return <span key={index}>{per.name}{index === typing.length - 1 ? "" : ","}</span>;
            })}
              {typing.length > 1 ? "are" : "is"} typing...
    </div>
                <i onClick={sendMessage} className="fa-regular fa-paper-plane absolute bottom-10 right-6 z-10 text-xl"></i>
                <textarea
                  placeholder="Write something..."
                  className="w-[90%] bottom-5 rounded-lg p-2 bg-gray-200 mt-4"
                  style={{ minHeight: "5rem", maxHeight: "20vh" }}
                   id="input-text"
              value={message}
              onChange={(event) => setMessageWithDebounce(event.target.value)}
                ></textarea>
              </div>
            </div>
          </div>
        </>
        // <div className="room">
        //   {!admin ? (
        //     <>
        //       <h2>
        //         download progress: {downloadProgress.progressTransferFile}
        //       </h2>
        //       <h3>
        //         speed: {downloadProgress.downloadSpeed}{" "}
        //         {downloadProgress.speedUnit}
        //       </h3>
        //     </>
        //   ) : null}
        //   {streams.length > 0 && (
        //     <div>
        //       Livecams
        //       {streams.map((webrtc) => (
        //         <StreamItem
        //           key={webrtc.socketId}
        //           webrtc={webrtc}
        //           admin={admin}
        //           socketBio={socketBio}
        //           kickOut={kickOut}
        //         />
        //       ))}
        //       {speakers.map((wbcc, index) => {
        //         return (
        //           <div key={index}>
        //             for user: {wbcc.socketId} and{" "}
        //             {wbcc.speaking ? "😂😂" : "💀💀💀"}
        //           </div>
        //         );
        //       })}
        //       <div className="controlers">
        //         <button onClick={() => onMuteorStopStreaming(true, mute)}>
        //           {!mute ? "Mute" : "Unmute"}
        //         </button>
        //         <button onClick={() => onMuteorStopStreaming(false, videoMute)}>
        //           {!videoMute ? "Block Video!" : "Unblock Video"}
        //         </button>
        //       </div>
        //     </div>
        //   )}
        //   <button onClick={onLeave}>leave</button>
        //   <div className="chat-box">
            // {typing.map((per, index) => {
            //   return <div key={index}>{per.name}: Typing.....</div>;
            // })}
        //     {chats?.length > 0 ? (
        //       chats.map((evr, index) => {
        //         return (
        //           <div key={index}>
        //             <h3>{evr.name}</h3>
        //             <h2>{evr.message}</h2>
        //             <h4>{evr.time}</h4>
        //           </div>
        //         );
        //       })
        //     ) : (
        //       <div>No chats yet!</div>
        //     )}
        //     <input
        //       type="text"
              // id="input-text"
              // value={message}
              // onChange={(event) => setMessageWithDebounce(event.target.value)}
        //     />
        //     <button onClick={sendMessage}>Send Message</button>
        //   </div>
        //   {admin && (
        //     <div>
        //       <h3>you are the admin and have all controls</h3>
        //     </div>
        //   )}
        //   <div className="video-media">
        //     <input
        //       type="file"
        //       id="select-video"
        //       ref={videoFile}
        //       onChange={uploadVideo}
        //     />
        //     {afterFileSelected && (
        //       <div>
        //         <video
        //           ref={videoMediaRef}
        //           src={media}
        //           width={"300px"}
        //           height={"400px"}
        //           onPause={syncPause}
        //           onPlay={syncPlay}
        //           onSeeking={onContinousSeeking}
        //           onRateChange={onSyncRate}
        //           loop={false}
        //           onTimeUpdate={onTimeUpdate}
        //         ></video>
        //       </div>
        //     )}
        //   </div>

        //   <div className="emoji-container" ref={container}></div>

          // <div className="emoji-list">
          //   <ul>
          //     <li>
          //       <button
          //         id="0"
          //         ref={emojies[0]}
          //         onClick={(event) => {
          //           handleEmojiClick(event);
          //         }}
          //         aria-label="Heart emoji"
          //       >
          //         💖
          //       </button>
          //     </li>
          //     <li>
          //       <button
          //         id="1"
          //         ref={emojies[1]}
          //         onClick={(event) => {
          //           handleEmojiClick(event);
          //         }}
          //         aria-label="Thumbs up emoji"
          //       >
          //         👍
          //       </button>
          //     </li>
          //     <li>
          //       <button
          //         id="2"
          //         ref={emojies[2]}
          //         aria-label="Party popper emoji"
          //         onClick={(event) => {
          //           handleEmojiClick(event);
          //         }}
          //       >
          //         🎉
          //       </button>
          //     </li>
          //     <li>
          //       <button
          //         id="3"
          //         ref={emojies[3]}
          //         aria-label="Clapping hands emoji"
          //         onClick={(event) => {
          //           handleEmojiClick(event);
          //         }}
          //       >
          //         👏
          //       </button>
          //     </li>
          //     <li>
          //       <button
          //         id="4"
          //         ref={emojies[4]}
          //         aria-label="Laughing emoji"
          //         onClick={(event) => {
          //           handleEmojiClick(event);
          //         }}
          //       >
          //         😂
          //       </button>
          //     </li>
          //     <li>
          //       <button
          //         id="5"
          //         ref={emojies[5]}
          //         aria-label="Surprised face emoji"
          //         onClick={(event) => {
          //           handleEmojiClick(event);
          //         }}
          //       >
          //         😯
          //       </button>
          //     </li>
          //     <li>
          //       <button
          //         id="6"
          //         ref={emojies[6]}
          //         aria-label="Crying face emoji"
          //         onClick={(event) => {
          //           handleEmojiClick(event);
          //         }}
          //       >
          //         😢
          //       </button>
          //     </li>
          //     <li>
          //       <button
          //         id="7"
          //         ref={emojies[7]}
          //         aria-label="Thinking face emoji"
          //         onClick={(event) => {
          //           handleEmojiClick(event);
          //         }}
          //       >
          //         🤔
          //       </button>
          //     </li>
          //     <li>
          //       <button
          //         id="8"
          //         ref={emojies[8]}
          //         aria-label="Thumbs down emoji"
          //         onClick={(event) => {
          //           handleEmojiClick(event);
          //         }}
          //       >
          //         👎
          //       </button>
          //     </li>
          //   </ul>
          // </div>
        //   {admin &&
        //     requests.length > 0 &&
        //     requests.map((payload, index) => {
        //       return (
        //         <div key={index}>
        //           <h3>{!Array.isArray(payload) ? payload.name : ""}</h3>
        //           <button
        //             className="reject"
        //             onClick={() => {
        //               websocket.emit("reject:socketid", {
        //                 socketId: !Array.isArray(payload) ? payload.id : "",
        //                 room,
        //               });
        //               clearRequest(index);
        //             }}
        //           >
        //             Reject
        //           </button>
        //           <button
        //             className="accept"
        //             onClick={() => {
        //               websocket.emit("sign:accept", {
        //                 socketId: !Array.isArray(payload) ? payload.id : "",
        //                 room,
        //               });
        //               clearRequest(index);
        //             }}
        //           >
        //             Accept
        //           </button>
        //         </div>
        //       );
        //     })}
        // </div>
      )}
    </div>
  );
};

export default Room;
