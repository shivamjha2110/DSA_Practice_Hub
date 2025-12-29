import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

// If VITE_API_URL is not set, use same-origin (works on Vercel when API is routed under /api)
// Ensure baseURL includes protocol, otherwise axios/browser treats it as relative path
let validBaseUrl = baseURL;
if (validBaseUrl && !/^https?:\/\//i.test(validBaseUrl)) {
  validBaseUrl = `https://${validBaseUrl}`;
}

export const api = axios.create({
  baseURL: validBaseUrl ? `${validBaseUrl.replace(/\/$/, "")}/api` : "/api"
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}
