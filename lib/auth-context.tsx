"use client";

import React from "react";

import { createContext, useContext, useEffect, useState } from "react";

interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // Only run on client-side
        if (typeof window !== 'undefined') {
          const storedUser = localStorage.getItem("lockedin_user");
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    try {
      // In a real implementation, this would call your API
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Registration failed");
      }

      // For demo purposes, we'll create a mock user
      const mockUser = {
        uid: `user_${username}_${Date.now()}`,
        email: email,
        displayName: username,
      };

      setUser(mockUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem("lockedin_user", JSON.stringify(mockUser));
      }
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // In a real implementation, this would call your API
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Login failed");
      }

      // For demo purposes, we'll create a mock user
      const mockUser = {
        uid: `user_${email}_${Date.now()}`,
        email: email,
        displayName: email.split("@")[0],
      };

      setUser(mockUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem("lockedin_user", JSON.stringify(mockUser));
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // In a real implementation, this would call your API
      if (typeof window !== 'undefined') {
        localStorage.removeItem("lockedin_user");
      }
      setUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, register, login, logout }}>
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
