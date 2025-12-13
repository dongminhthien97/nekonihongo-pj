// src/api/auth.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  withCredentials: false,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function loginRequest(email: string, password: string) {
  try {
    const res = await api.post(
      "/auth/login",
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );

    return res.data; // { token, refreshToken, user }
  } catch (error: any) {
    throw new Error(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Login failed"
    );
  }
}

export default api;
