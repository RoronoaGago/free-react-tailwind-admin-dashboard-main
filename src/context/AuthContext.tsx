import React, {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
} from "react";
import { login as authLogin, logout as authLogout } from "../api/auth";
import { jwtDecode } from "jwt-decode";

interface UserData {
  username: string;
  email: string;
}
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserData | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [user, setUser] = useState<UserData | null>(null); // Store user data
  // Decode token and extract user info
  const decodeToken = (token: string): UserData => {
    try {
      const decoded = jwtDecode<{ username: string; email: string }>(token);
      return {
        username: decoded.username,
        email: decoded.email,
      };
    } catch (error) {
      throw new Error("Invalid token");
    }
  };
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          setUser(decodeToken(token));
          setIsAuthenticated(true);
        } catch {
          // If token is invalid, clear it
          localStorage.removeItem("access_token");
          setIsAuthenticated(false);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  const login = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authLogin(username, password);

      // Make sure to check the actual response structure
      if (!response?.access) {
        throw new Error("Invalid credentials");
      }

      const token = response.access;
      const userData = decodeToken(token);

      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      // Clear any existing token on error
      localStorage.removeItem("access_token");
      setIsAuthenticated(false);
      setUser(null);

      // Re-throw with a user-friendly message
      throw new Error(
        error instanceof Error
          ? error.message
          : "Login failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authLogout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
