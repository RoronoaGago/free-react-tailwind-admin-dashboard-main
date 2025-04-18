import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router";
import axios from "axios";

type User = {
  id: number;
  username: string;
  email: string;
};

type LoginCredentials = {
  username: string;
  password: string;
};
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  loading: boolean;
  refreshToken: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          await verifyToken();
        } catch {
          logout();
        }
      }
    };
    initializeAuth();
  }, []);

  const verifyToken = useCallback(async () => {
    try {
      const response = await axios.get("/api/user/me/", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setUser(response.data);
      console.log("this is inside the verify token function");
    } catch (error) {
      throw new Error("Session expired");
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/login/",
        credentials
      );

      localStorage.setItem("access_token", response.data.tokens.access);
      localStorage.setItem("refresh_token", response.data.tokens.refresh);

      setUser(response.data.user);
      navigate("/");
    } catch (err) {
      setError(
        axios.isAxiosError(err)
          ? err.response?.data?.error || "Login failed"
          : "An unknown error occurred"
      );
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/logout/", null, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
    } finally {
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
      navigate("/login");
    }
  };

  const refreshToken = useCallback(async () => {
    try {
      const response = await axios.post("/api/token/refresh/", {
        refresh: localStorage.getItem("refresh_token"),
      });

      localStorage.setItem("access_token", response.data.access);
      return response.data.access;
    } catch (error) {
      logout();
      throw error;
    }
  }, [logout]);

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
    error,
    loading,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
