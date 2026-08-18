import React, { createContext, useContext, useState, useEffect } from 'react';
import { isValidIranianMobile } from '../utils/authUtils';
import { fetchFridge, fetchShoppingList, fetchMealPlan } from '../db';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone: string;
  birthDate?: string;
  city?: string;
  registeredPhone?: string;
  registeredEmail?: string;
  isAdmin: boolean;
  createdAt?: string;
}

export interface StoredUser {
  id: string;
  name: string;
  email?: string;
  phone: string;
  birthDate?: string;
  city?: string;
  registeredPhone?: string;
  registeredEmail?: string;
  isAdmin: boolean;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  users: StoredUser[];
  login: (identifier: string, password?: string) => Promise<{ success: boolean; message?: string }>;
  register: (name: string, phone: string, password: string, email?: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  updateUserInList: (id: string, updates: Partial<StoredUser>) => Promise<void>;
  deleteUserFromList: (id: string) => Promise<void>;
  addUserToList: (newUser: Omit<StoredUser, 'id' | 'createdAt'>) => Promise<StoredUser>;
  refreshProfile: () => Promise<void>;
  syncUsersFromServer: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_ACTIVE_USER = 'sofreh_auth_user_v4';
const LOCAL_STORAGE_ALL_USERS = 'sofreh_users_list_v4';
const LOCAL_STORAGE_TOKEN = 'sofreh_auth_token_v4';

export function getAuthToken(): string {
  try {
    return localStorage.getItem(LOCAL_STORAGE_TOKEN) || '';
  } catch {
    return '';
  }
}

export const INITIAL_USERS: StoredUser[] = [
  {
    id: 'u_admin',
    name: 'مدیر ارشد سفره',
    email: 'admin@sofreh.ir',
    phone: '09121111111',
    isAdmin: true,
    createdAt: '2026-01-01'
  },
  {
    id: 'u_user1',
    name: 'مریم احمدی',
    email: 'maryam@sofreh.ir',
    phone: '09123456789',
    isAdmin: false,
    createdAt: '2026-01-01'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users, setUsers] = useState<StoredUser[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ALL_USERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map(({ password: _, ...u }: any) => u);
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_USERS;
  });

  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ACTIVE_USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        const { password: _, ...cleanUser } = parsed;
        return cleanUser;
      }
      return null;
    } catch {
      return null;
    }
  });

  // Save active user in localStorage (without password)
  useEffect(() => {
    if (user) {
      const { password: _, ...cleanUser } = user as any;
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_USER, JSON.stringify(cleanUser));
    } else {
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_USER);
    }
  }, [user]);

  // Save users in localStorage (without passwords)
  useEffect(() => {
    const sanitizedUsers = users.map(({ password: _, ...u }: any) => u);
    localStorage.setItem(LOCAL_STORAGE_ALL_USERS, JSON.stringify(sanitizedUsers));
  }, [users]);

  // Sync users list from server on mount
  const syncUsersFromServer = async () => {
    try {
      const res = await fetch('/api/users', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (res.ok) {
        const serverUsers: StoredUser[] = await res.json();
        if (Array.isArray(serverUsers) && serverUsers.length > 0) {
          setUsers(serverUsers);
        }
      }
    } catch {
      // offline fallback
    }
  };

  // Sync current active user profile from server on mount or profile visit
  const refreshProfile = async () => {
    if (!user?.id) return;
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (res.ok) {
        const latestProfile = await res.json();
        if (latestProfile && latestProfile.id) {
          setUser(latestProfile);
        }
      } else if (res.status === 404 || res.status === 403) {
        logout();
      }
    } catch {
      // offline fallback
    }
  };

  useEffect(() => {
    syncUsersFromServer();
    if (user?.id) {
      refreshProfile();
    }
  }, []);

  const login = async (identifier: string, password?: string) => {
    if (!identifier || !identifier.trim()) {
      return { success: false, message: 'لطفاً شماره همراه، ایمیل یا نام کاربری خود را وارد کنید.' };
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error || 'خطا در ورود به سامانه'
        };
      }

      if (data.token) {
        localStorage.setItem(LOCAL_STORAGE_TOKEN, data.token);
      }

      const activeUser: User = data.user;
      setUser(activeUser);

      // Refresh users list from server
      await syncUsersFromServer();

      // Instantly load app data (fridge, shopping list, meal plan) for this user from host server
      Promise.all([
        fetchFridge(),
        fetchShoppingList(),
        fetchMealPlan()
      ]).catch(() => {});

      return { success: true };
    } catch {
      return {
        success: false,
        message: 'خطای ارتباط با سرور. لطفاً اتصال اینترنت خود را بررسی کنید.'
      };
    }
  };

  const register = async (name: string, phone: string, password: string, email?: string) => {
    if (!name || !name.trim()) {
      return { success: false, message: 'لطفاً نام و نام خانوادگی خود را وارد کنید.' };
    }
    if (!phone || !phone.trim()) {
      return { success: false, message: 'وارد کردن شماره همراه الزامی است.' };
    }
    if (!isValidIranianMobile(phone)) {
      return { success: false, message: 'شماره همراه وارد شده معتبر نیست. (مثال: ۰۹۱۲۳۴۵۶۷۸۹)' };
    }
    if (!password || password.trim().length < 6) {
      return { success: false, message: 'رمز عبور باید حداقل ۶ کاراکتر باشد.' };
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, password, email })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        return {
          success: false,
          message: data.error || 'خطا در ثبت‌نام کاربر جدید'
        };
      }

      if (data.token) {
        localStorage.setItem(LOCAL_STORAGE_TOKEN, data.token);
      }

      const newUser: User = {
        id: data.user.id,
        name: data.user.name,
        phone: data.user.phone,
        email: data.user.email,
        isAdmin: data.user.isAdmin
      };

      setUser(newUser);
      await syncUsersFromServer();

      // Initialize empty user structures on server
      const emptyMealPlan = [
        { day: 'شنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
        { day: 'یکشنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
        { day: 'دوشنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
        { day: 'سه‌شنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
        { day: 'چهارشنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
        { day: 'پنج‌شنبه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] },
        { day: 'جمعه', breakfastIds: [], lunchIds: [], dinnerIds: [], snackIds: [] }
      ];

      const token = getAuthToken();

      fetch('/api/fridge/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify([])
      }).catch(() => {});

      fetch('/api/mealplan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(emptyMealPlan)
      }).catch(() => {});

      fetch('/api/shopping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify([])
      }).catch(() => {});

      return { success: true };
    } catch {
      return {
        success: false,
        message: 'خطای غیرمنتظره در ارتباط با سرور. لطفاً دوباره تلاش کنید.'
      };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_ACTIVE_USER);
    localStorage.removeItem(LOCAL_STORAGE_TOKEN);
  };

  const updateUserInList = async (id: string, updates: Partial<StoredUser>) => {
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const updatedUser: StoredUser = await res.json();
        setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedUser } : u));
        if (user && user.id === id) {
          setUser(prev => prev ? {
            ...prev,
            ...updatedUser
          } : null);
        }
      }
    } catch {
      // local fallback
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
      if (user && user.id === id) {
        setUser(prev => prev ? { ...prev, ...updates } : null);
      }
    }
  };

  const deleteUserFromList = async (id: string) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
    } catch {
      // ignore
    }
    setUsers(prev => prev.filter(u => u.id !== id));
    if (user && user.id === id) {
      logout();
    }
  };

  const addUserToList = async (newUser: Omit<StoredUser, 'id' | 'createdAt'>): Promise<StoredUser> => {
    const created: StoredUser = {
      ...newUser,
      id: 'u_' + Date.now(),
      createdAt: new Date().toISOString().split('T')[0]
    };

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify(created)
      });
      if (res.ok) {
        const saved: StoredUser = await res.json();
        setUsers(prev => [saved, ...prev]);
        return saved;
      }
    } catch {
      // ignore
    }

    setUsers(prev => [created, ...prev]);
    return created;
  };

  return (
    <AuthContext.Provider value={{
      user,
      users,
      login,
      register,
      logout,
      updateUserInList,
      deleteUserFromList,
      addUserToList,
      refreshProfile,
      syncUsersFromServer
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
