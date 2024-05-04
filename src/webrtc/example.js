import React, { useCallback, useEffect, useRef, useState } from "react";
import { socketInstance } from "../socket/socket";
import { useNavigate } from "react-router";
import ReactPlayer from "react-player";
import Peer from "../peer/Peer";
import { useDispatch, useSelector } from "react-redux";
function Text() {
  const [isConnected, setIsConnected] = useState(false);
  const isWaiting = useRef(false);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const isStreamingOn = useSelector((state) => state.updateIsStreaming);
  const bothVideoAndText = useRef(isStreamingOn.yes);
  const interests = useSelector((state) => state.updateInterest);
  const [loader, setLoader] = useState(0);
  const PeerConnection = useRef([new Peer()]);
  const peerNumber = useRef(0);
  const [myStream, setMyStream] = useState();
  const streamRef = useRef();
  const [user2Stream, setUser2Stream] = useState();
  const [onlinePeoples, setOnlinePeoples] = useState(0);
  const [texts, setTexts] = useState([
    {
      random: "",
    },
  ]);

  const userSockerId = useRef(null);
  const history = useNavigate();
  const { isAgreedTerms, isAgreedAgeVerification } = useSelector(
    (state) => state.updateInitial
  );
  useEffect(() => {
    if (isAgreedAgeVerification && isAgreedTerms)
      socketInstance.emit("join:room");
    else history("/");
  }, []);
  const startNewServer = async () => {
    isWaiting.current = true;
    socketInstance.emit(
      "wait:on:queue",
      interests.context ? interests.context : null
    );
    setTexts([]);
    setLoader(true);
  };
  const getRemoteTracks = useCallback((event) => {
    const user2StreamConnection = event.streams;
    setUser2Stream(user2StreamConnection[0]);
  }, []);
  const setTracks = useCallback(() => {
    const senders =
      PeerConnection.current[peerNumber.current].peer.getSenders();
    for (let track of streamRef.current.getTracks()) {
      let sender;
      try {
        sender = senders.find((s) => s.track.kind === track.kind);
      } catch (err) {}
      if (sender) {
        sender.replaceTrack(track);
      } else {
        PeerConnection.current[peerNumber.current].peer.addTrack(
          track,
          streamRef.current
        );
      }
    }
  }, []);
  const removeTracks = useCallback(() => {
    const senders =
      PeerConnection.current[peerNumber.current].peer.getSenders();
    senders.forEach((sender) => {
      PeerConnection.current[peerNumber.current].peer.removeTrack(sender);
    });
    streamRef.current.getTracks().forEach((track) => track.stop());
    setMyStream(null);
    makeStream();
  }, []);
  async function makeStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      streamRef.current = stream;
      setMyStream(stream);
    } catch (err) {
      alert("install camera first, before attemping to use it XD fr");
    }
  }
  const getOffer = useCallback(async () => {
    const offer = await PeerConnection.current[peerNumber.current].getOffer();
    socketInstance.emit("send:offer", { user2: userSockerId.current, offer });
  }, []);
  const makeNegotiation = useCallback(async () => {
    const offer = await PeerConnection.current[peerNumber.current].getOffer();
    socketInstance.emit("send:negotiation", {
      user2: userSockerId.current,
      offer,
    });
  }, []);
  useEffect(() => {
    PeerConnection.current[peerNumber.current].peer.addEventListener(
      "track",
      getRemoteTracks
    );
    PeerConnection.current[peerNumber.current].peer.addEventListener(
      "negotiationneeded",
      makeNegotiation
    );
    return () => {
      PeerConnection.current[peerNumber.current].peer.removeEventListener(
        "track",
        getRemoteTracks
      );
      PeerConnection.current[peerNumber.current].peer.removeEventListener(
        "negotiationneeded",
        makeNegotiation
      );
    };
  }, [
    PeerConnection.current[peerNumber.current].peer,
    makeNegotiation,
    getRemoteTracks,
  ]);

  const checkingUserHandler = useCallback((user2, interest) => {
    if (isWaiting.current) {
      if (!Array.isArray(interest)) {
        if (interest && interest === interests.context) {
          socketInstance.emit("is:already:talked", user2);
        } else {
          if (!interest && !interests.context) {
            socketInstance.emit("is:already:talked", user2);
          }
        }
      } else {
        const interests = interest.map((words) => words.trim().toLowerCase());
        for (let x = 0; x < interest.length; x++) {
          if (interests.includes(interest[x])) {
            socketInstance.emit("is:already:talked", user2);
            break;
          }
        }
        //continue
      }
    }
  }, []);
  const getNegotiationHandler = useCallback(async (offer) => {
    const ans = await PeerConnection.current[
      peerNumber.current
    ].connectRemoteOffer(offer);
    socketInstance.emit("negotiation:done", {
      user2: userSockerId.current,
      ans,
    });
  }, []);
  const getRemoteOfferHandler = useCallback(async (offer) => {
    const answer = await PeerConnection.current[
      peerNumber.current
    ].connectRemoteOffer(offer);

    socketInstance.emit("send:answer", {
      ans: answer,
      user2: userSockerId.current,
    });
  }, []);

  const sendTracksToUser2Handler = useCallback(() => {
    setTracks();
  }, []);
  const getNegotiationAnwser = useCallback(async (ans) => {
    await PeerConnection.current[peerNumber.current].setRemoteDescription(ans);
    socketInstance.emit("track:ready", userSockerId.current);
  }, []);
  const userDisconnectFromRoom = useCallback((size) => {
    setOnlinePeoples(size);
  }, []);
  const currentOnlinePeoplesHandler = useCallback((size) => {
    setOnlinePeoples(size);
  }, []);
  const getRemoteAnwser = useCallback(async (remoteAnwser) => {
    await PeerConnection.current[peerNumber.current].setRemoteDescription(
      remoteAnwser
    );

    socketInstance.emit("send:active:stream", {
      user2: userSockerId.current,
    });

    setTracks();
  }, []);
  const userJoined = useCallback(async (user2) => {
    userSockerId.current = user2;
    isWaiting.current = false;
    setIsConnected(true);
    setLoader(3);
  }, []);
  const youJoinedHandler = useCallback(async (user2) => {
    userSockerId.current = user2;
    isWaiting.current = false;

    if (bothVideoAndText.current) {
      getOffer();
    }
    setIsConnected(true);
    setLoader(3);
  }, []);
  const userTypingHandler = useCallback(() => {
    setIsTyping(true);
  }, []);
  const getText = useCallback((text) => {
    setTexts((prev) => [...prev, { random: text }]);
  }, []);
  const userDisconnectHandler = useCallback(() => {
    setDefault(true);
    alert("stranger disconnected");
  }, []);
  const userTypedTypingHandler = useCallback(() => {
    setIsTyping(false);
  }, []);
  useEffect(() => {
    socketInstance.on("who:is:on:queue", checkingUserHandler);
    socketInstance.on("get:negotiation", getNegotiationHandler);
    socketInstance.on("get:remote:offer", getRemoteOfferHandler);
    socketInstance.on("send:track:to:user2", sendTracksToUser2Handler);
    socketInstance.on("get:negotiation:ans", getNegotiationAnwser);
    socketInstance.on("user:disconnect:from:server", userDisconnectFromRoom);
    socketInstance.on("online:peoples", currentOnlinePeoplesHandler);
    socketInstance.on("get:remote:ans", getRemoteAnwser);
    socketInstance.on("user:joined", userJoined);
    socketInstance.on("you:joined", youJoinedHandler);
    socketInstance.on("user:tpying", userTypingHandler);
    socketInstance.on("get:text", getText);
    socketInstance.on("user:disconnect", userDisconnectHandler);
    socketInstance.on("stoped:typing", userTypedTypingHandler);

    return () => {
      socketInstance.off("who:is:on:queue", checkingUserHandler);
      socketInstance.off("get:negotiation", getNegotiationHandler);
      socketInstance.off("get:remote:offer", getRemoteOfferHandler);
      socketInstance.off("send:track:to:user2", sendTracksToUser2Handler);
      socketInstance.off("get:negotiation:ans", getNegotiationAnwser);
      socketInstance.off("user:disconnect:from:server", userDisconnectFromRoom);
      socketInstance.off("online:peoples", currentOnlinePeoplesHandler);
      socketInstance.off("get:remote:ans", getRemoteAnwser);
      socketInstance.off("user:joined", userJoined);
      socketInstance.off("you:joined", youJoinedHandler);
      socketInstance.off("user:tpying", userTypingHandler);
      socketInstance.off("get:text", getText);
      socketInstance.off("user:disconnect", userDisconnectHandler);
      socketInstance.off("stoped:typing", userTypedTypingHandler);
    };
  }, []);
  const disconnectUser = (user2) => {
    socketInstance.emit("user:disconnect", user2);
    setDefault(false);
  };
  function setDefault() {
    if (bothVideoAndText.current) {
      removeTracks();
      PeerConnection.current[peerNumber.current].peer.close();
      peerNumber.current++;
      PeerConnection.current.push(new Peer());
    }
    userSockerId.current = null;
    setUser2Stream(null);
    setIsConnected(false);
    setLoader(0);
  }
  const sendTxt = (text) => {
    socketInstance.emit("send:text", { text, roomId: userSockerId.current });
    setTexts((prev) => [...prev, { random: text }]);
    setInput("");
  };

  function setInputWithDebounce(e) {
    setInput(e.target.value);
    socketInstance.emit("typing", userSockerId.current);
    debounce();
  }

  function debounce() {
    let interval;
    let prevInput = "";

    interval = setInterval(() => {
      if (input !== prevInput) {
        prevInput = input;
      } else {
        clearInterval(interval);
        socketInstance.emit("user:stopped:typing", userSockerId.current);
      }
    }, 800);
  }
  useEffect(() => {
    bothVideoAndText.current ? makeStream() : console.log("text version");
    socketInstance.emit("updateNumber");
  }, []);
  return (
    <div>
      <h1>number of peoples online: {onlinePeoples}</h1>
      <h3 id="loder: ">
        {loader == 1
          ? "Finding Stranger...."
          : loader === 0
          ? "click the start connect button"
          : "you are now talking to stranger, say Hi."}
      </h3>
      <div className="messages">
        {texts.map((e, i) => {
          return (
            <div key={i}>
              <div className="txt">{e.random}</div>
            </div>
          );
        })}
      </div>
      <p id="typing">{isTyping ? "stranger typing..." : ""}</p>
      <div className="text">
        <button onClick={startNewServer}>Connect to random user.</button>
        <button onClick={() => disconnectUser(userSockerId.current)}>
          {isConnected ? "Disconnect" : "Not connected yet."}
        </button>
      </div>

      <div className="send-txt">
        <input
          type="text"
          value={input}
          onChange={(e) => setInputWithDebounce(e)}
        />
        <button id="send" onClick={() => sendTxt(input)}>
          send
        </button>
      </div>
      <button onClick={setTracks}>Send !</button>
      {bothVideoAndText.current && (
        <div>
          <ReactPlayer url={myStream} playing />
          {user2Stream ? (
            <ReactPlayer url={user2Stream} playing />
          ) : (
            <p>no one here!</p>
          )}
        </div>
      )}
    </div>
  );
}
export default Text;
