import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
// import WireHarnessHome from './pages/WireHarnessHome.tsx'
import SelectItemPage from "./pages/SelectItemPage.tsx";
import { createHashRouter, RouterProvider } from "react-router-dom";
import AddItemPage from "./pages/AddItemPage.tsx";
import TestItemPage from "./pages/TestItemPage.tsx";
import ResultPage from "./pages/ResultPage.tsx";
import LoginLandingPage from "./pages/LoginPage.tsx";
import { UsernameProvider, WireTypeProvider } from "./pages/AppContexts.tsx";

const router = createHashRouter([
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
      <UsernameProvider>
        <WireTypeProvider>
          <RouterProvider router={router} />
        </WireTypeProvider>
      </UsernameProvider>
  </StrictMode>
);
