import { useState, createContext, useContext } from "react";

interface User {
  id: number;
  username: string;
  name: string;
}

interface AuthContextType {
  user: null | User;
  error: string | null;
  loading: boolean;
  login: (credentials: {
    username: string;
    password: string;
  }) => boolean | void;
  logout: () => void;
  setError: (error: string | null) => void;
}
interface AuthProviderProps {
  children: React.ReactNode;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>({
    id: 0,
    username: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>("");

  const login = (credentials: { username: string; password: string }) => {
    setLoading(true);
    setError(null); // Clear previous errors
    // Simulating backend authentication
    if (credentials.username === "admin" && credentials.password === "123") {
      const userData = { id: 1, username: "admin", name: "Mr. Admin" }; // Simulated user data, imagine this is coming from a backend
      setUser(userData); // Set user state
      return true;
    } else {
      setError("Invalid Credentials"); //can be changed to a toast notification
    }
    setLoading(false);
    return false;
  };

  const logout = () => {
    setLoading(false);
    setUser(null); // Clear user

    localStorage.removeItem("isAuthenticated"); // Clear authentication status from localStorage
  };

  return (
    <AuthContext.Provider
      value={{ user, error, loading, login, logout, setError }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
