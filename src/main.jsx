import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "../firebase.config.js";
import "./index.css";
import Home from "./pages/home/Home.jsx";
import Auth from "./pages/auth/Auth.jsx";
import Poker from "./pages/poker/Poker.jsx";
import Table from "./pages/poker/components/Table.jsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
    children: [],
  },
  {
    path: "auth",
    element: <Auth />,
  },
  {
    path: "poker",
    element: <Poker />,
  },
  {
    path: "poker/table",
    element: <Table />,
  },
]);
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Suspense fallback={"Loading"}>
      <RouterProvider router={router} />
    </Suspense>
  </StrictMode>,
);
