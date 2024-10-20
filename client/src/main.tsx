import { createRoot } from "react-dom/client";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";

import Home from "@/pages/home";
import NotFound from "@/pages/not-found";

import "./index.scss";

const router = createBrowserRouter([
  {
    children: [
      {
        Component: () => <Home />,
        path: "/"
      },
      {
        Component: () => <NotFound />,
        path: "*"
      }
    ],
    element: (
      <RecoilRoot>
        <Outlet />
      </RecoilRoot>
    ),
    path: "/"
  }
]);

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <RouterProvider router={router} />
  // </StrictMode>
);
