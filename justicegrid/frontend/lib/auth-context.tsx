'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { fetchAPI } from './api-client';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  language_preference: string;
  assigned_cases?: number;
  total_assigned?: number;
  eligible_cases?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('jg_user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUser(parsed);
        // Refresh live stats in background
        fetchAPI(`/api/v1/auth/me?user_id=${parsed.id}`).then((data) => {
          if (data) {
            const updated = { ...parsed, ...data };
            setUser(updated);
            localStorage.setItem('jg_user', JSON.stringify(updated));
          }
        });
      } catch {
        localStorage.removeItem('jg_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/api/v1/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      if (!res.ok) return false;
      const data = await res.json();
      setUser(data);
      localStorage.setItem('jg_user', JSON.stringify(data));
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('jg_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
