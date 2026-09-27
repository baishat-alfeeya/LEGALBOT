"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "email" | "google";
  createdAt: string;
}

export interface ChatHistoryItem {
  id: string;
  query: string;
  response: string;
  category: string;
  timestamp: string;
  risk?: "low" | "medium" | "high";
}

export interface Notification {
  id: string;
  type: "booking" | "reminder" | "legal" | "system";
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
  link?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<User>) => void;
  // Chat history
  chatHistory: ChatHistoryItem[];
  addChatHistory: (item: Omit<ChatHistoryItem, "id" | "timestamp">) => void;
  clearChatHistory: () => void;
  deleteChatItem: (id: string) => void;
  // Notifications
  notifications: Notification[];
  addNotification: (n: Omit<Notification, "id" | "timestamp" | "read">) => void;
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
  clearNotifications: () => void;
  unreadCount: number;
  // Theme
  theme: "dark" | "light";
  toggleTheme: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  loginWithGoogle: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: () => {},
  forgotPassword: async () => ({ success: false }),
  updateProfile: () => {},
  chatHistory: [],
  addChatHistory: () => {},
  clearChatHistory: () => {},
  deleteChatItem: () => {},
  notifications: [],
  addNotification: () => {},
  markNotificationRead: () => {},
  markAllRead: () => {},
  clearNotifications: () => {},
  unreadCount: 0,
  theme: "dark",
  toggleTheme: () => {},
});

// ─── Demo user store (localStorage-based, no real backend) ───────────────────
const USERS_KEY   = "legalbot_users";
const SESSION_KEY = "legalbot_session";
const HISTORY_KEY = "legalbot_chat_history";
const NOTIF_KEY   = "legalbot_notifications";
const THEME_KEY   = "legalbot_theme";

function getUsers(): Record<string, { name: string; email: string; password: string; createdAt: string }> {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "{}"); } catch { return {}; }
}
function saveUsers(u: ReturnType<typeof getUsers>) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(u)); } catch {}
}

// ─── Cookie helpers (for middleware to read) ─────────────────────────────────
function setSessionCookie(value: string) {
  try {
    document.cookie = `legalbot_session=${encodeURIComponent(value)}; path=/; max-age=2592000; SameSite=Lax`;
  } catch {}
}
function clearSessionCookie() {
  try {
    document.cookie = "legalbot_session=; path=/; max-age=0; SameSite=Lax";
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]               = useState<User | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [theme, setTheme]             = useState<"dark" | "light">("dark");

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      if (session) {
        const u: User = JSON.parse(session);
        setUser(u);
        setSessionCookie(u.id); // ensure cookie is set for middleware
        // Load user-specific history & notifications
        const hist = localStorage.getItem(`${HISTORY_KEY}_${u.id}`);
        if (hist) setChatHistory(JSON.parse(hist));
        const notifs = localStorage.getItem(`${NOTIF_KEY}_${u.id}`);
        if (notifs) setNotifications(JSON.parse(notifs));
      }
      const savedTheme = localStorage.getItem(THEME_KEY) as "dark" | "light" | null;
      if (savedTheme) setTheme(savedTheme);
    } catch {}
    setIsLoading(false);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle("light-mode", theme === "light");
  }, [theme]);

  // Persist chat history
  useEffect(() => {
    if (user) {
      try { localStorage.setItem(`${HISTORY_KEY}_${user.id}`, JSON.stringify(chatHistory)); } catch {}
    }
  }, [chatHistory, user]);

  // Persist notifications
  useEffect(() => {
    if (user) {
      try { localStorage.setItem(`${NOTIF_KEY}_${user.id}`, JSON.stringify(notifications)); } catch {}
    }
  }, [notifications, user]);

  // ── Auth methods ────────────────────────────────────────────────────────────
  const login = useCallback(async (email: string, password: string) => {
    await new Promise(r => setTimeout(r, 800)); // simulate network
    const users = getUsers();
    const found = Object.entries(users).find(([, u]) => u.email === email && u.password === btoa(password));
    if (!found) return { success: false, error: "Invalid email or password." };
    const [id, data] = found;
    const u: User = { id, name: data.name, email: data.email, provider: "email", createdAt: data.createdAt };
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setSessionCookie(u.id);
    // Load history
    const hist = localStorage.getItem(`${HISTORY_KEY}_${id}`);
    if (hist) setChatHistory(JSON.parse(hist));
    const notifs = localStorage.getItem(`${NOTIF_KEY}_${id}`);
    if (notifs) setNotifications(JSON.parse(notifs));
    return { success: true };
  }, []);

  const loginWithGoogle = useCallback(async () => {
    await new Promise(r => setTimeout(r, 1000));
    // Demo Google login — creates/finds a demo Google user
    const id = "google_demo_user";
    const u: User = {
      id, name: "Demo User", email: "demo@gmail.com",
      provider: "google", createdAt: new Date().toISOString(),
      avatar: "https://ui-avatars.com/api/?name=Demo+User&background=3b82f6&color=fff",
    };
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setSessionCookie(u.id);
    const hist = localStorage.getItem(`${HISTORY_KEY}_${id}`);
    if (hist) setChatHistory(JSON.parse(hist));
    return { success: true };
  }, []);

  const signup = useCallback(async (name: string, email: string, password: string) => {
    await new Promise(r => setTimeout(r, 900));
    const users = getUsers();
    const exists = Object.values(users).some(u => u.email === email);
    if (exists) return { success: false, error: "An account with this email already exists." };
    const id = "user_" + Date.now().toString(36);
    users[id] = { name, email, password: btoa(password), createdAt: new Date().toISOString() };
    saveUsers(users);
    const u: User = { id, name, email, provider: "email", createdAt: new Date().toISOString() };
    setUser(u);
    localStorage.setItem(SESSION_KEY, JSON.stringify(u));
    setSessionCookie(u.id);
    // Welcome notification
    const welcomeNotif: Notification = {
      id: "welcome_" + Date.now(),
      type: "system",
      title: "Welcome to LEGALBOT!",
      message: `Hi ${name}! Your account is ready. Start by asking a legal question or finding a lawyer.`,
      read: false,
      timestamp: new Date().toISOString(),
      link: "/chat",
    };
    setNotifications([welcomeNotif]);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setChatHistory([]);
    setNotifications([]);
    localStorage.removeItem(SESSION_KEY);
    clearSessionCookie();
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await new Promise(r => setTimeout(r, 800));
    const users = getUsers();
    const exists = Object.values(users).some(u => u.email === email);
    if (!exists) return { success: false, error: "No account found with this email." };
    // Demo: just simulate sending reset email
    console.log(`[LEGALBOT DEMO] Password reset email sent to: ${email}`);
    return { success: true };
  }, []);

  const updateProfile = useCallback((data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
  }, [user]);

  // ── Chat history ────────────────────────────────────────────────────────────
  const addChatHistory = useCallback((item: Omit<ChatHistoryItem, "id" | "timestamp">) => {
    const newItem: ChatHistoryItem = {
      ...item,
      id: "ch_" + Date.now().toString(36),
      timestamp: new Date().toISOString(),
    };
    setChatHistory(prev => [newItem, ...prev].slice(0, 100)); // keep last 100
  }, []);

  const clearChatHistory = useCallback(() => setChatHistory([]), []);
  const deleteChatItem = useCallback((id: string) => setChatHistory(prev => prev.filter(i => i.id !== id)), []);

  // ── Notifications ───────────────────────────────────────────────────────────
  const addNotification = useCallback((n: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newN: Notification = {
      ...n,
      id: "notif_" + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newN, ...prev].slice(0, 50));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // ── Theme ───────────────────────────────────────────────────────────────────
  const toggleTheme = useCallback(() => {
    setTheme(prev => {
      const next = prev === "dark" ? "light" : "dark";
      try { localStorage.setItem(THEME_KEY, next); } catch {}
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isLoading, login, loginWithGoogle, signup, logout, forgotPassword, updateProfile,
      chatHistory, addChatHistory, clearChatHistory, deleteChatItem,
      notifications, addNotification, markNotificationRead, markAllRead, clearNotifications, unreadCount,
      theme, toggleTheme,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
