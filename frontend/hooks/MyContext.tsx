"use client";
import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User } from "@/lib/types";
import Cookies from 'universal-cookie';

const cookies = new Cookies();

interface AuthContextType {
  token: string | null;
  user: User | null;
  login: (data: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedToken = cookies.get("authToken");
    const storedUser = cookies.get("userData");
    if (storedToken) {
      setToken(storedToken);
    }
    if (storedUser) {
        setUser(storedUser);
    }
  }, []);

  const login = (data: any) => {
    const token = data.token;
    const roles = data.role; // API returns 'role' as array of strings
    
    setToken(token);
    // Map API user to internal User type
    setUser({
        ...data.user,
        roles: roles
    });
    
    cookies.set("authToken", token, { path: "/" });
    cookies.set("userRoles", roles, { path: "/" });
    cookies.set("userData", JSON.stringify({ ...data.user, roles: roles }), { path: "/" });
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    cookies.remove("authToken", { path: "/" });
    cookies.remove("userRoles", { path: "/" });
    cookies.remove("userData", { path: "/" });
  };

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}