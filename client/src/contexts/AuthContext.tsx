import { createContext, useContext, useState } from 'react';
import type { User, UserRole } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  setUserRole: (role: UserRole) => void;
  logout: () => void;
  login: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@example.com',
  role: 'super-admin',
  avatar: ''
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Check if user is logged out in localStorage
    const isLoggedOut = localStorage.getItem('isLoggedOut');
    return isLoggedOut === 'true' ? null : mockUser;
  });

  const setUserRole = (role: UserRole) => {
    if (user) {
      setUser(prev => prev ? { ...prev, role } : null);
    }
  };

  const logout = () => {
    console.log('Logout function executed');
    setUser(null);
    localStorage.setItem('isLoggedOut', 'true');
    console.log('User set to null and localStorage updated');
    // Force page reload to ensure clean state
    window.location.reload();
  };

  const login = () => {
    setUser(mockUser);
    localStorage.removeItem('isLoggedOut');
  };

  return (
    <AuthContext.Provider value={{ user, setUserRole, logout, login }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
