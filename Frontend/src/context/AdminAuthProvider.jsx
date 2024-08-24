import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {jwtDecode} from "jwt-decode";
import { toast } from "react-hot-toast"; // Import toast

export const AdminAuthContext = createContext();

export default function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please register first"); // Show error toast
      navigate("/signup");
    } else {
      try {
        const decodedToken = jwtDecode(token);
        if (decodedToken.accessLevel === "admin" || decodedToken.accessLevel === "super admin") {
          setAdminUser(decodedToken);
        } else {
          toast.error("Only admins can access this page"); // Show error toast
          navigate("/"); // Navigate to home page
        }
      } catch (error) {
        toast.error("Please sign in first");
        console.error("Invalid token:", error);
        navigate("/signup");
      }
    }
  }, [navigate]);

  return (
    <AdminAuthContext.Provider value={[adminUser, setAdminUser]}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
