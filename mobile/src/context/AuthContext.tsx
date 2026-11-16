import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { SEED_USERS } from '../database/seed';
import { fetchUsers, getDatabase } from '../database/database';

interface AuthContextType {
  currentUser: User | null;
  role: UserRole;
  isAuthenticated: boolean;
  availableUsers: User[];
  login: (email: string, role?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchUser: (userId: string) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(SEED_USERS[0]); // Por defecto Estudiante Farid
  const [availableUsers, setAvailableUsers] = useState<User[]>(SEED_USERS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      try {
        await getDatabase();
        const users = await fetchUsers();
        if (users && users.length > 0) {
          setAvailableUsers(users);
        }
      } catch (err) {
        console.warn('Error cargando usuarios en auth:', err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  const login = async (email: string, requestedRole?: UserRole): Promise<boolean> => {
    const cleanEmail = email.trim().toLowerCase();
    const found = availableUsers.find((u) => u.email.toLowerCase() === cleanEmail);
    if (found) {
      setCurrentUser(found);
      return true;
    }

    // Si se pasa rol demo rápido
    if (requestedRole) {
      const demoUser = availableUsers.find((u) => u.role === requestedRole);
      if (demoUser) {
        setCurrentUser(demoUser);
        return true;
      }
    }

    return false;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const switchUser = (userId: string) => {
    const target = availableUsers.find((u) => u.id === userId);
    if (target) {
      setCurrentUser(target);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role: currentUser?.role || 'usuario',
        isAuthenticated: !!currentUser,
        availableUsers,
        login,
        logout,
        switchUser,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};

