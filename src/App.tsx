import { useEffect } from "react";

import { BrowserRouter } from "react-router-dom";

import { AppProviders } from "@/app/providers";
import { AppRouter } from "@/app/AppRouter";
import { useSettingsStore } from "@/features/settings/settingsStore";

export default function App() {
  const initializeSettings = useSettingsStore((state) => state.initialize);

  useEffect(() => {
    initializeSettings();
  }, [initializeSettings]);

  return (
    <BrowserRouter>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </BrowserRouter>
  );
}
