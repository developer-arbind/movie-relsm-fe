import { returnCustomIp } from "./cookie";
const process = {
  env: {
    SERVER_PORT: "http://localhost:8080",
  },
};
const startDuplexCommunication = () => {
  const setName$ = async (
    yourName: string,
    socketiD: string
  ): Promise<
    | {
        data: any;
        socket: null;
        error?: undefined;
      }
    | {
        error: unknown;
        data?: undefined;
        socket?: undefined;
      }
  > => {
    try {
      let customIp = returnCustomIp();
      interface CUSTOMIP {
        [key: string]: string;
        credentials: string;

        ["socket-id"]: string;
      }
      const customOpt: { method: string; headers: CUSTOMIP} = {
        method: "GET",
     
        headers: {
          credentials: "include",
          "socket-id": socketiD,
      
        },
      };
      if (customIp) {
        customOpt.headers["x-forwarded-for"] = customIp;
      }
      console.log("the name i am getting wtf: ", yourName, socketiD);
      const response = await fetch(
        process.env.SERVER_PORT + "/name/" + yourName,
        customOpt
      );

      if (!response.ok) {
        throw new Error("you can't create two rooms at a same time");
      }

      const data = await response.json();
      console.log("ok this is the data: ", data);
      return {
        data,
        socket: null,
      };
    } catch (error) {
      console.error(error);
      return { error };
    }
  };

  return { setName$ };
};

export default startDuplexCommunication;
