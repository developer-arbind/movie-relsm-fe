import { memo } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
const StreamItem = memo(
  ({ webrtc, admin, socketBio, kickOut, setStreams }: any) => {
    return (
      // <div key={webrtc.socketId} style={{ marginTop: "2px" }}>
      //   <video width={"200px"} height={"150px"} ref={webrtc.ref}></video>
      //   <p className="name">{webrtc.name}</p>
      //   {admin && webrtc.socketId !== socketBio.id && (
      //     <button onClick={() => kickOut(webrtc.socketId)}>kick out!</button>
      //   )}
      //   <button>{webrtc.mute ? "MUTE KARDIYA" : "UNMUTE HAI"}</button>
      //   <button>
      //     {webrtc.webcam ? "WEBCAM BAND KARDIYA" : "CHALU HAI ABHI"}
      //   </button>
      // </div>
      <div className="frames relative" key={webrtc.socketId} style={{border: webrtc.speaking && webrtc.webcam ? "3px solid blue" : ""}}>
        {admin && (
          <BsThreeDotsVertical
            style={{ cursor: "pointer", zIndex: 3 }}
            onClick={() => {
              setStreams((prev: any) =>
                prev.map((itm: any) => {
                  if (itm.socketId === webrtc.socketId) {
                    return { ...itm, threedOT: !itm.threedOT };
                  }
                  return itm;
                })
              )
              console.log("menu has opened!: ", webrtc);
            }
          }
          />
        )}
        {webrtc.mute ? (
          <i
            className="fa-solid fa-microphone-slash"
            style={{
              color: "white",
              position: "absolute",
              right: "1.5vh",
              bottom: "1.5vh",
            }}
          ></i>
        ) : (
          <></>
        )}
        {webrtc.threedOT && (
          <div
            className="min-h-[5vh] w-[25vh] bg-neutral-800 absolute right-5 rounded-md p-2 gap-2 flex flex-col"
            id="user-options"
            onClick={() => {
              kickOut(webrtc.socketId);
            }}
          >
            <div className="flex items-center cursor-pointer">
              <i className="fa-regular fa-square-minus text-white mr-2"></i>
              <p className="text-white">Kick</p>
            </div>
          </div>
        )}
        {/* Toggle between webcam feed and camera off logo based on isVisible */}
        {!webrtc.webcam ? (
          <video
            ref={webrtc.ref}
            autoPlay
            muted={webrtc.socketId === socketBio.id ? true : false}
            style={{
              width: "100%",
              borderRadius: "1rem",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              background:
                "url(https://img.freepik.com/free-photo/photorealistic-view-tree-nature-with-branches-trunk_23-2151478039.jpg)",
            }}
            id="cameraOffLogo"
          >
            <audio ref={webrtc.ref}  muted={webrtc.socketId === socketBio.id ? true : false}/>
          </div>
        )}
        <p id="userName">{webrtc.name}</p>
      </div>
    );
  }
);

export default StreamItem;
