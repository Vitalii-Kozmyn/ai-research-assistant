import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { TokenResponse } from "./authService";

const api = axios.create({baseURL: import.meta.env.VITE_API_URL});

api.interceptors.request.use((config) => {
        const token = localStorage.getItem("accessToken");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    }
);

api.interceptors.response.use((response) => {
        return response;
    },

    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {_retry?: boolean;};

        if (error.response?.status === 401 && !originalRequest?._retry && !originalRequest?.url?.includes("/auth/refresh")) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem("refreshToken");

            if (!refreshToken) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");

                window.location.href = "/login";

                return Promise.reject(error);
            }

            try {
                const response =
                    await axios.post<TokenResponse>(
                        `${import.meta.env.VITE_API_URL}/auth/refresh`,
                        {
                            refresh_token:
                                refreshToken
                        }
                    );

                const newAccessToken = response.data.access_token;

                localStorage.setItem("accessToken", newAccessToken);
                originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                localStorage.removeItem("accessToken");
                localStorage.removeItem("refreshToken");
                localStorage.removeItem("user");

                window.location.href = "/login";

                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;