/**
 * LEGALBOT API Service
 * Connects Next.js frontend to Django REST Framework backend.
 * Falls back to localStorage when backend is unavailable (demo mode).
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// ─── Token management ─────────────────────────────────────────────────────────
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("legalbot_access_token");
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem("legalbot_access_token", access);
  localStorage.setItem("legalbot_refresh_token", refresh);
}

export function clearTokens() {
  localStorage.removeItem("legalbot_access_token");
  localStorage.removeItem("legalbot_refresh_token");
}

// ─── Base fetch with auth + auto-refresh ─────────────────────────────────────
async function apiFetch(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });

  // Auto-refresh on 401
  if (res.status === 401) {
    const refreshToken = localStorage.getItem("legalbot_refresh_token");
    if (refreshToken) {
      const refreshRes = await fetch(`${API_BASE}/token/refresh/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh: refreshToken }),
      });
      if (refreshRes.ok) {
        const data = await refreshRes.json();
        setTokens(data.access, refreshToken);
        headers["Authorization"] = `Bearer ${data.access}`;
        return fetch(`${API_BASE}${endpoint}`, { ...options, headers });
      }
    }
  }
  return res;
}

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  async register(name: string, email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    return res.json();
  },

  async login(email: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  async logout(refreshToken: string) {
    await apiFetch("/auth/logout/", {
      method: "POST",
      body: JSON.stringify({ refresh: refreshToken }),
    });
    clearTokens();
  },

  async getMe() {
    const res = await apiFetch("/auth/me/");
    return res.json();
  },

  async updateProfile(data: { name?: string; preferred_language?: string; theme?: string }) {
    const res = await apiFetch("/auth/me/", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
    return res.json();
  },
};

// ─── Chat History API ─────────────────────────────────────────────────────────
export const chatAPI = {
  async getHistory(search?: string, category?: string) {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (category) params.set("category", category);
    const res = await apiFetch(`/chat-history/?${params}`);
    return res.json();
  },

  async addHistory(item: { query: string; response: string; category: string; risk?: string }) {
    const res = await apiFetch("/chat-history/", {
      method: "POST",
      body: JSON.stringify(item),
    });
    return res.json();
  },

  async deleteItem(id: number) {
    await apiFetch(`/chat-history/${id}/`, { method: "DELETE" });
  },

  async clearAll() {
    await apiFetch("/chat-history/clear/", { method: "DELETE" });
  },
};

// ─── Saved Lawyers API ────────────────────────────────────────────────────────
export const lawyersAPI = {
  async getSaved() {
    const res = await apiFetch("/saved-lawyers/");
    return res.json();
  },

  async save(lawyer: {
    lawyer_id: number; lawyer_name: string; specialization: string;
    city: string; fee_min: number; fee_max: number; rating: number;
  }) {
    const res = await apiFetch("/saved-lawyers/", {
      method: "POST",
      body: JSON.stringify(lawyer),
    });
    return res.json();
  },

  async unsave(lawyerId: number) {
    await apiFetch(`/saved-lawyers/unsave/${lawyerId}/`, { method: "DELETE" });
  },
};

// ─── Notifications API ────────────────────────────────────────────────────────
export const notificationsAPI = {
  async getAll() {
    const res = await apiFetch("/notifications/");
    return res.json();
  },

  async markRead(id: number) {
    const res = await apiFetch(`/notifications/${id}/read/`, { method: "PATCH" });
    return res.json();
  },

  async markAllRead() {
    await apiFetch("/notifications/mark-all-read/", { method: "PATCH" });
  },

  async clearAll() {
    await apiFetch("/notifications/clear/", { method: "DELETE" });
  },
};

// ─── Bookings API ─────────────────────────────────────────────────────────────
export const bookingsAPI = {
  async getAll() {
    const res = await apiFetch("/bookings/");
    return res.json();
  },

  async create(booking: {
    booking_id: string; lawyer_name: string; specialization: string;
    city: string; address: string; date: string; time: string;
    mode: string; meeting_link?: string;
  }) {
    const res = await apiFetch("/bookings/", {
      method: "POST",
      body: JSON.stringify(booking),
    });
    return res.json();
  },

  async delete(id: number) {
    await apiFetch(`/bookings/${id}/`, { method: "DELETE" });
  },
};

// ─── Dashboard API ────────────────────────────────────────────────────────────
export const dashboardAPI = {
  async getSummary() {
    const res = await apiFetch("/dashboard/");
    return res.json();
  },
};

// ─── Backend health check ─────────────────────────────────────────────────────
export async function isBackendAvailable(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      signal: AbortSignal.timeout(2000),
    });
    return res.status !== 0;
  } catch {
    return false;
  }
}
