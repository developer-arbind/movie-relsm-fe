
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import {
    createBrowserRouter,
    RouterProvider,
  } from "react-router-dom";
import CreateRoom from './pages/CreateRoom.tsx';
  const router = createBrowserRouter([
    {
      path: "/",
      element: <App />,
    },
    {
        path: "/create-room",
        element: <CreateRoom />
    }
  ]);
ReactDOM.createRoot(document.getElementById('root')!).render(
    <RouterProvider router={router} />
)
