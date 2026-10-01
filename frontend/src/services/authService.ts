import api from "./api";

interface LoginData {
    email: string;
    password: string;
}

interface RegisterData {
    email: string;
    password: string;
}

interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
}

export async function loginUser(data: LoginData): Promise<TokenResponse> {
    const response = await api.post<TokenResponse>("/auth/login", data);
    return response.data;
}

export async function registerUser(data: RegisterData) {
    const response = await api.post("/auth/register", data);
    return response.data;
}

export async function getCurrentUser() {
    const response = await api.get("/user/me");
    return response.data;
}