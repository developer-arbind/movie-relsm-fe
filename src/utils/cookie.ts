const returnToken = () => {
  let token = "";
  let cookies = document.cookie;
  let splitedCookie = cookies.split(";");
  for (let i = 0; i < splitedCookie.length; i++) {
    const key = splitedCookie[i].split("=")[0].trim();
    if (key === "octoken") {
      token = splitedCookie[i].split("=")[1].trim();
      break;
    }
  }
  return token;
};

const returnCustomIp = () => {
  let customIp = "";
  const pookie = document.cookie;
  const splitedCookie = pookie.split(";");
  for (let i = 0; i < splitedCookie.length; i++) {
    const key = splitedCookie[i].split("=")[0].trim();
    if (key === "custom-ip") {
      customIp = splitedCookie[i].split("=")[1].trim();
      break;
    }
  }
  return customIp;
};
const returnFriendToken = () => {
  let ticket = "";
  const pookie = document.cookie;
  const splitedCookie = pookie.split(";");
  for (let i = 0; i < splitedCookie.length; i++) {
    const key = splitedCookie[i].split("=")[0].trim();
    if (key === "ticket") {
      ticket = splitedCookie[i].split("=")[1].trim();
      break;
    }
  }
  return ticket;
};

export { returnCustomIp, returnToken, returnFriendToken };
