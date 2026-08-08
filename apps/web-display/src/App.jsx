import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import Main from "./pages/main/Main.jsx";

import { Toaster } from "react-hot-toast";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <MainLayout>
        <Main />
      </MainLayout>
    ),
  },
  {
    path: "/dashboard",
    element: <div>Dashboard</div>,
  },
  {
    path: "settings",
    element: <div>Settings</div>,
  },
]);

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />;
      <RouterProvider router={router} />;
    </>
  );
}

export default App;
