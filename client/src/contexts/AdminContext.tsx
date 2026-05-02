import React, { createContext, useContext, useState } from "react";
import { adminLogin, AdminUser } from "@/lib/api";

interface AdminContextType {
  isAuthenticated: boolean;
  adminUser: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);

  const login = async (email: string, password: string) => {
    const user = await adminLogin(email, password);
    setIsAuthenticated(true);
    setAdminUser(user);
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAdminUser(null);
  };

  return (
    <AdminContext.Provider value={{ isAuthenticated, adminUser, login, logout }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminContext = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdminContext must be used within AdminProvider");
  }
  return context;
};
