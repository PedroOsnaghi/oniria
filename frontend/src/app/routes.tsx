import { createBrowserRouter } from "react-router";
import Home from "@pages/Home";
import Login from "@pages/Login";
import NotFound from "@pages/NotFound";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
