import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem("phh_auth");
    return stored ? JSON.parse(stored) : null;
  });

  const login = (data) => {
    localStorage.setItem("phh_auth", JSON.stringify(data));
    setAuth(data);
  };

  const logout = () => {
    localStorage.removeItem("phh_auth");
    setAuth(null);
  };

  return (
    <AuthContext.Provider value={{ auth, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
