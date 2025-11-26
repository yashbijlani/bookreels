// AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { loginWithGoogle, logoutUser, onAuthChanged } from "./firebase";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state
  useEffect(() => {
    const unsub = onAuthChanged((firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Force logout before Google login
  const login = async () => {
    await logoutUser();         // 🔥 Ensures REAL account switching
    await loginWithGoogle();
  };

  const logout = () => logoutUser();

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
