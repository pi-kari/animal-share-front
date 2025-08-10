/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PREVIEW_AUTH?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
  readonly VITE_CLOUDINARY_UPLOAD_PRESET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
