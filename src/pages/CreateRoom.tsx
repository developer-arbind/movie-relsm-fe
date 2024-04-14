import { v4 as uuidv4 } from 'uuid';
import React, { useRef, useState } from "react"
import { connectSocket } from '../websocket/socket';
interface VideoMeta {
    name: string,
    size: number,
    mime: string
}

interface Meta {
    name: string,
    logo: string,
    password: string,
    roomId: string,
    videoMeta: VideoMeta
}

const CreateRoom = () => {
    const [meta, setMeta] = useState<Meta | null>(null);
    const [displayer, setdisplayer] = useState<string>("");
    const [yourName, setYourName] = useState<string>("");
    const logoref: React.RefObject<HTMLInputElement> = useRef(null);
    const videoref: React.RefObject<HTMLInputElement>=useRef(null);
    const writeData = (input: string, from: string, videometa?: VideoMeta) => {
        if (!meta) {
            setMeta({
                name: "",
                logo: "",
                password: "",
                roomId: uuidv4(),
                videoMeta: {
                    name: "",
                    size: 0,
                    mime: ""
                }
            })
        }

        if(videometa) {
            return setMeta({
                ...(meta as Meta),
                videoMeta: videometa
            });
        }
        setMeta({
            ...(meta as Meta),
            [from]: input
        });
    }

    const uploadLogo = () => {
        let file = logoref.current ? logoref.current.files ? logoref.current.files[0] : null : null;
        if(!file) {
            return alert("error uploading image!"); 
        }
        file = file as File;
        const blob = new Blob([file], {type: "images/*"});
        const wsblob = URL.createObjectURL(blob);
        setdisplayer(wsblob);
        writeData(wsblob, "logo");
    }

    const uploadVideo = () => {
        let file = videoref.current ? videoref.current.files ? videoref.current.files[0] : null : null;
        if(!file) return alert("error uploading video");
        const types = ["mkv", "mp4"];
        const fileNameParts = file.name.split('.');
        const extension = fileNameParts[fileNameParts.length - 1];
        if(!types.includes(extension)) return alert("Upload Video files only!");
        writeData("ws://", "$", {
            name: file.name,
            size: file.size,
            mime: file.type
        } as VideoMeta);
    }

    const createRoom = async () => {
        const response = await fetch("https://solid-fishstick-x5ppj49jq6jf664p-8080.app.github.dev/create-room/"+meta?.name);
        if(!response) return alert("server error!"); 
        const data = await response.json();
        console.log(data);
    }

    const startDuplexCommunication = async () => {
        const socket = connectSocket();
        const response = await fetch("https://solid-fishstick-x5ppj49jq6jf664p-8080.app.github.dev/name/arbind");
        if(!response) alert("error, setting token!");
        const data = await response.json();
        console.log(data, socket);
    }
    return (
        <div>
            <input type="text"  id="your-name" onChange={event => {
                setYourName(event.target.value);
            }} value={yourName}/>
            <button id='name-ok' onClick={startDuplexCommunication}>Ok</button>
            <div className="inputs">
                <label htmlFor="name">
                    Enter the room name
                </label>
                <input type="text" id="name" value={meta?.name} onChange={event => {
                    writeData(event.target.value, "name");
                }} />
                <label htmlFor="password">
                    Enter The room password
                </label>
                <input type="text" id="password" value={meta?.password} onChange={event => {
                    writeData(event.target.value, "password");
                }} />
                <label htmlFor="image">Upload logo</label>
                <input type="file" id='logo' ref={logoref} onChange={uploadLogo} />
                {displayer && <img src={displayer} />}

                <label htmlFor="video-tag">Upload your video</label>
                <input type="file" id='video' ref={videoref} onChange={uploadVideo}/>

                <button id='start-room' onClick={createRoom}>Create Room</button>
            </div>
        </div>
    )
}

export default CreateRoom;
