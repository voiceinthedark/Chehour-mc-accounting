import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import Main from "./pages/main/Main.jsx";
import Settings from "./pages/settings/Settings.jsx";
import Reports from "./pages/reports/Reports.jsx";
import Billing from "./pages/billing/Billing.jsx";
import DoctorSettings from "./pages/settings/DoctorSettings.jsx";
import ServiceSettings from "./pages/settings/ServiceSettings.jsx";
import "./App.css";

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
    path: "/billing",
    element: (
      <MainLayout>
        <Billing />
      </MainLayout>
    ),
  },
  {
    path: "/reports",
    element: (
      <MainLayout>
        <Reports />
      </MainLayout>
    ),
  },
  {
    path: "settings",
    element: (
      <MainLayout>
        <Settings />
      </MainLayout>
    ),
    children: [
      {
        path: "services",
        element: <ServiceSettings />,
      },
      {
        path: "doctors",
        element: <DoctorSettings />,
      },
    ],
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
