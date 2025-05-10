import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; 

interface DecodedJwtPayload {
  sub: string; 
  id: number;  
  iat?: number;
  exp?: number;
  roles?: string[]; 
}


interface User {
  id: number;      
  username: string; 
  roles?: string[]; 
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean; 
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); 

  useEffect(() => {
    setIsLoading(true);
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decodedPayload = jwtDecode<DecodedJwtPayload>(storedToken);
        const appUser: User = { 
          id: decodedPayload.id, 
          username: decodedPayload.sub, 
          roles: decodedPayload.roles || [] 
        };
        if (decodedPayload.exp && decodedPayload.exp * 1000 < Date.now()) {
          localStorage.removeItem('authToken');
          throw new Error('Token expired');
        }
        setToken(storedToken);
        setUser(appUser);
      } catch (error) {
        console.error('Failed to decode or validate token on load:', error);
        localStorage.removeItem('authToken'); 
        setToken(null); 
        setUser(null);  
      }
    }
    setIsLoading(false); 
  }, []);

  const login = (newToken: string) => {
    try {
      const decodedPayload = jwtDecode<DecodedJwtPayload>(newToken);
      const appUser: User = { 
        id: decodedPayload.id, 
        username: decodedPayload.sub, 
        roles: decodedPayload.roles || [] 
      };
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(appUser);
    } catch (error) {
      console.error('Failed to decode token on login:', error);
      
      
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    
    
  };

  return (
    <AuthContext.Provider value={{ 
      token, 
      user, 
      isAuthenticated: !!token && !!user, 
      isLoading, 
      isAdmin: !!user && !!user.roles && user.roles.includes('ROLE_ADMIN'), 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthState => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
