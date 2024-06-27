import { memo } from "react";

const StreamItem = memo(({ webrtc, admin, socketBio, kickOut }: any) => {
  return (
    <div key={webrtc.socketId} style={{ marginTop: "2px" }}>
      <video width={"200px"} height={"150px"} ref={webrtc.ref}></video>
      <p className="name">{webrtc.name}</p>
      {admin && webrtc.socketId !== socketBio.id && (
        <button onClick={() => kickOut(webrtc.socketId)}>kick out!</button>
      )}
      <button>{webrtc.mute ? "MUTE KARDIYA" : "UNMUTE HAI"}</button>
      <button>
        {webrtc.webcam ? "WEBCAM BAND KARDIYA" : "CHALU HAI ABHI"}
      </button>
    </div>
  );
});

export default StreamItem;
