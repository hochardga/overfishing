/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ANALYTICS_ENDPOINT?: string;
  readonly VITE_ANALYTICS_PREVIEW?: string;
  readonly VITE_ANALYTICS_WRITE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
