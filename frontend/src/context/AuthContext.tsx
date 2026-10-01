import { createContext, useContext, useState, type ReactNode } from "react";

interface User {
    id: number;
    email: string;
}

interface AuthContextType {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;

    login: (
        user: User,
        accessToken: string,
        refreshToken: string
    ) => void;

    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({children}: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem("user");

        return storedUser
            ? JSON.parse(storedUser)
            : null;
    });

    const [refreshToken, setRefreshToken] = useState<string | null>(() => {
        return localStorage.getItem("refreshToken");
    });

    const [accessToken, setAccessToken] = useState<string | null>(() => {
        return localStorage.getItem("accessToken");
    });

    const login = (user: User, accessToken: string, refreshToken: string) => {
        setUser(user);
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);

        localStorage.setItem("user", JSON.stringify(user));

        localStorage.setItem("accessToken", accessToken);

        localStorage.setItem("refreshToken", refreshToken);
    };

    const logout = () => {
        setUser(null);
        setAccessToken(null);
        setRefreshToken(null);

        localStorage.removeItem("user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                refreshToken,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
}