/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_CLIENT_ID: string;
  readonly VITE_INSTRUCTOR_EMAIL?: string;
  readonly VITE_INSTRUCTOR_CALENDAR_ID?: string;
}
