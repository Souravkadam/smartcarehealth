import React, { createContext, useContext, useState, useEffect } from "react";
import { userLogin, userRegister, updateUserProfile } from "@/lib/api";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: string;
}

interface UserContextType {
  user: AuthUser | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<string>;
  register: (name: string, email: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { name?: string; phone?: string; image?: string }) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem("sc_token");
    const savedUser = localStorage.getItem("sc_user");
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<string> => {
    const res = await userLogin(email, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem("sc_token", res.token);
    localStorage.setItem("sc_user", JSON.stringify(res.user));
    return res.user.role || "user";
  };

  const register = async (name: string, email: string, phone: string, password: string) => {
    const res = await userRegister(name, email, phone, password);
    setToken(res.token);
    setUser(res.user);
    localStorage.setItem("sc_token", res.token);
    localStorage.setItem("sc_user", JSON.stringify(res.user));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("sc_token");
    localStorage.removeItem("sc_user");
  };

  const updateProfile = async (data: { name?: string; phone?: string; image?: string }) => {
    if (!user) return;
    const updated = await updateUserProfile(user.id, data);
    const newUser = { ...user, ...data };
    setUser(newUser);
    localStorage.setItem("sc_user", JSON.stringify(newUser));
  };

  return (
    <UserContext.Provider value={{ user, token, isLoggedIn: !!user, login, register, logout, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUserContext must be used within UserProvider");
  return ctx;
};
