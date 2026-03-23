import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "@/app/routes/LandingPage";
import PlayPage from "@/app/routes/PlayPage";
import SettingsPage from "@/app/routes/SettingsPage";

export function AppRouter() {
  return (
    <Routes>
      <Route
        path="/"
        element={<LandingPage />}
      />
      <Route
        path="/play"
        element={<PlayPage />}
      />
      <Route
        path="/settings"
        element={<SettingsPage />}
      />
      <Route
        path="*"
        element={
          <Navigate
            replace
            to="/"
          />
        }
      />
    </Routes>
  );
}
