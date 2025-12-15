// src/api/auth.ts
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
  withCredentials: false,
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("Đã gắn token vào request:", config.url);
  } else {
    console.warn("Không có token – request không auth:", config.url);
  }
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("401 detected globally – chuyển về login");
      localStorage.clear();
      window.location.href = "/login"; // hoặc dùng navigate nếu có router
    }
    return Promise.reject(error);
  }
);

export default api;
