"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import api from "./axios-config";

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
  ) => Promise<User>;
  login: (email: string, password: string) => Promise<User>;
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
        const storedUser = localStorage.getItem("lockedin_user");
        const token = localStorage.getItem("lockedin_token");

        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
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
      const response = await api.post("/register", {
        username,
        email,
        password,
      });

      const userId = response.data.userId;

      // Create user object
      const newUser = {
        uid: userId,
        email: email,
        displayName: username,
      };

      setUser(newUser);
      localStorage.setItem("lockedin_user", JSON.stringify(newUser));

      return newUser;
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.error || "Registration failed";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/login", {
        email,
        password,
      });

      const { token, userId } = response.data;

      // Store token
      localStorage.setItem("lockedin_token", token);

      // Get user info from Firebase
      try {
        // In a real app, you might want to get more user details here
        // For now, we'll create a basic user object
        const newUser = {
          uid: userId,
          email: email,
          displayName: email.split("@")[0], // Simple display name from email
        };

        setUser(newUser);
        localStorage.setItem("lockedin_user", JSON.stringify(newUser));

        return newUser;
      } catch (userError) {
        console.error("Error getting user details:", userError);
        throw userError;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorMessage = error.response?.data?.error || "Login failed";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      // No need to call API for logout as Firebase handles tokens client-side
      localStorage.removeItem("lockedin_token");
      localStorage.removeItem("lockedin_user");
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
