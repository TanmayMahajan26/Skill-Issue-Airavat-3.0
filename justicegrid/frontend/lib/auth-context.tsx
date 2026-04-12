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
  isFirstLogin: boolean;
  chatOpen: boolean;
  setChatOpen: (v: boolean) => void;
  login: (email: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isFirstLogin: false,
  chatOpen: false,
  setChatOpen: () => {},
  login: async () => false,
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

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
          } else {
             // If data is null and the id is one of our old hardcoded mock IDs, the session is definitely totally stale.
             if (['usr_admin', 'usr_lwy1', 'usr_plv1', 'usr_utrc1', 'usr_sup1'].includes(parsed.id)) {
                 console.log("Purging stale mock session -> Redirecting to login");
                 localStorage.removeItem('jg_user');
                 setUser(null);
             }
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
      const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'}`.replace(':8000', ':8001');
      const res = await fetch(
        `${url}/api/v1/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        }
      );
      if (!res.ok) {
        throw new Error("Fallback to mock");
      }
      const data = await res.json();
      setUser(data);
      localStorage.setItem('jg_user', JSON.stringify(data));
      setIsFirstLogin(true); setChatOpen(true);
      return true;
    } catch {
      const MOCK_USERS: Record<string, UserProfile> = {
        'admin@justicegrid.in': { id: 'usr_admin', email: 'admin@justicegrid.in', name: 'System Admin', role: 'admin', language_preference: 'en' },
        'paralegal@justicegrid.in': { id: 'usr_plv1', email: 'paralegal@justicegrid.in', name: 'Priya Sharma', role: 'paralegal', language_preference: 'hi', assigned_cases: 200, eligible_cases: 14 },
        'lawyer@justicegrid.in': { id: 'usr_lwy1', email: 'lawyer@justicegrid.in', name: 'Adv. Rajan Mehta', role: 'lawyer', language_preference: 'en', assigned_cases: 15, total_assigned: 45 },
        'utrc@justicegrid.in': { id: 'usr_utrc1', email: 'utrc@justicegrid.in', name: 'Rajesh Kumar', role: 'utrc', language_preference: 'en' },
        'supervisor@justicegrid.in': { id: 'usr_sup1', email: 'supervisor@justicegrid.in', name: 'Dr. Anjali Desai', role: 'supervisor', language_preference: 'en' },
        'family@justicegrid.in': { id: 'fam_1', email: 'family@justicegrid.in', name: 'Ramesh (Family)', role: 'family', language_preference: 'hi' }
      };

      if (MOCK_USERS[email]) {
        setUser(MOCK_USERS[email]);
        localStorage.setItem('jg_user', JSON.stringify(MOCK_USERS[email]));
        setIsFirstLogin(true); setChatOpen(true);
        return true;
      }
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsFirstLogin(false); setChatOpen(false);
    localStorage.removeItem('jg_user');
  };

  return (
    <AuthContext.Provider value={{ user, loading, isFirstLogin, chatOpen, setChatOpen, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
