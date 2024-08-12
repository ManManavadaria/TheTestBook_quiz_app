import React, { createContext, useContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [authUser, setAuthUser] = useState(() => {
    const token = localStorage.getItem("token");
    // Fetch and validate token if needed
    // Simulate user validation (this should be replaced with actual token validation logic)
    return token ? { token } : undefined;
  });

  useEffect(() => {
    // Example function to validate token and update authUser
    const validateToken = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/user`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          if (response.ok) {
            const data = await response.json();
            setAuthUser(data.user);
          } else {
            setAuthUser(undefined);
          }
        } catch (error) {
          console.error("Token validation error:", error);
          setAuthUser(undefined);
        }
      } else {
        setAuthUser(undefined);
      }
    };

    validateToken();
  }, []);

  return (
    <AuthContext.Provider value={[authUser, setAuthUser]}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
