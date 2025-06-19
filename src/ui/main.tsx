import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import App from "./App.tsx";
// import WireHarnessHome from './pages/WireHarnessHome.tsx'
import SelectItemPage from "./pages/SelectItemPage.tsx";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AddItemPage from "./pages/AddItemPage.tsx";
import TestItemPage from "./pages/TestItemPage.tsx";
import ResultPage from "./pages/ResultPage.tsx";
import LoginLandingPage from "./pages/LoginPage.tsx";
import { UserProvider } from "./pages/UserContext.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    element: <LoginLandingPage />,
  },
  {
    path: "/select-item",
    element: <SelectItemPage />,
  },
  {
    path: "/add-item/:wireType",
    element: <AddItemPage />,
  },
  {
    path: "/test-item/:wireType/:selectedId",
    element: <TestItemPage />,
  },
  {
    path: "/results",
    element: <ResultPage />
  }
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <UserProvider>
      <RouterProvider router={router} />
    </UserProvider>
  </StrictMode>
);
