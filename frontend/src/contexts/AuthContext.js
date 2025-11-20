import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { api } from "../services/api";

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // 🧩 Restore session from localStorage (after refresh or reopen)
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("AdminToken");

    if (storedUser && storedToken) {
      try {
        const decoded = jwtDecode(storedToken);
        // Check expiry time
        if (decoded.exp * 1000 > Date.now()) {
          setUser(JSON.parse(storedUser));
          setToken(storedToken);
          api.defaults.headers["Authorization"] = `Bearer ${storedToken}`;
        } else {
          logout(); // Token expired
        }
      } catch (err) {
        console.warn("Invalid stored token:", err);
        logout();
      }
    }
  }, []);

  // ✅ Login Function
  const login = async (username, password) => {
    try {
      // Backend expects FormData, not JSON
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await api.post("/api/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const { user: userData, access_token } = response.data;

      if (!userData || !access_token) {
        throw new Error("Invalid login response");
      }

      // 🧠 Decode to verify expiration
      const decoded = jwtDecode(access_token);
      if (!decoded || decoded.exp * 1000 < Date.now()) {
        throw new Error("Token expired or invalid");
      }

      // 💾 Save session
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("AdminToken", access_token);

      // 🔐 Attach to Axios for future requests
      api.defaults.headers["Authorization"] = `Bearer ${access_token}`;

      setUser(userData);
      setToken(access_token);

      console.log("✅ Login successful:", userData.username);
      return { success: true };
    } catch (error) {
      console.error("❌ Login failed:", error);
      logout();
      return { success: false, error: "Invalid username or password" };
    }
  };

  // 🚪 Logout Function
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("AdminToken");
    setUser(null);
    setToken(null);
    // Optional redirect:
    window.location.href = "/login";
  };

  // ⏱️ Auto logout when token expires
  useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const expiryTime = decoded.exp * 1000 - Date.now();
      if (expiryTime <= 0) {
        logout();
        return;
      }

      const timer = setTimeout(() => {
        console.warn("🔒 Token expired — logging out");
        logout();
      }, expiryTime);

      return () => clearTimeout(timer);
    } catch {
      logout();
    }
  }, [token]);

  // 🧠 Shared context value
  const value = {
    user,
    token,
    role: user?.role || "viewer",
    isAuthenticated: !!user && !!token,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ✅ Custom Hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
