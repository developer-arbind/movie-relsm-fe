import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";
const App = () => {
  useEffect(() => {
    function deleteCookie(name: string) {
  document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
}
  let cookies = ["octoken", "ticket", "timeline"];
  cookies.forEach((c) => deleteCookie(c));
  document.cookie = "custom-ip="+Math.floor(Math.random()*10000);
  })
  const history = useNavigate();
  return <div className=""></div>;
};

export default App;
