import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./components/Layout/MainLayout";
import Main from "./pages/main/Main.jsx";
import Settings from "./pages/settings/Settings.jsx";
import Reports from "./pages/reports/Reports.jsx";
import Billing from "./pages/billing/Billing.jsx";
import DoctorSettings from "./pages/settings/DoctorSettings.jsx";
import ServiceSettings from "./pages/settings/ServiceSettings.jsx";
import { API_RECEPTION_URL } from "./apiconfig.js";
import "./App.css";

import { Toaster } from "react-hot-toast";

const doctorLoader = async () => {
  const response = await fetch(`${API_RECEPTION_URL}/doctors`);

  if (!response.ok) {
    throw new Error("Failed to fetch doctors");
  }

  const data = await response.json();
  return data;
};

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
        loader: doctorLoader,
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
