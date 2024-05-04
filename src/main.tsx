import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import CreateRoom from "./pages/CreateRoom.tsx";
import Room from "./pages/Room.tsx";
import { SocketContextProvider } from "./contexts/socketProvider.tsx";
import { SocketContextIdProvider } from "./contexts/socketContextProvider.tsx";
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/create-room",
    element: <CreateRoom />,
  },
  {
    path: "/:id",
    element: <Room />,
  },
]);
ReactDOM.createRoot(document.getElementById("root")!).render(
  <SocketContextProvider>
    <SocketContextIdProvider>
      <RouterProvider router={router} />
    </SocketContextIdProvider>
  </SocketContextProvider>
);
