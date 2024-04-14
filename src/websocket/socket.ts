import io from 'socket.io-client';

const connectSocket = () => {
    const socketInstance = io('https://solid-fishstick-x5ppj49jq6jf664p-8080.app.github.dev', {
        withCredentials: true,
        extraHeaders: {
            "Access-Control-Allow-Origin": "https://fantastic-guacamole-5grrw94wppg3wr6-5173.app.github.dev"
        }
    });
    socketInstance.connect();
    return socketInstance;
}
export {
    connectSocket
}