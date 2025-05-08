import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode'; // Using jwt-decode to get user info from token

interface DecodedJwtPayload {
  sub: string; // Username from JWT's 'subject' claim
  id: number;  // User ID from a custom 'id' claim in the JWT
  iat?: number;
  exp?: number;
  // Add other claims like roles if they exist in your JWT
  // roles?: string[];
}

// This is the User object shape we will use throughout the app via useAuth()
interface User {
  id: number;      // Numeric user ID
  username: string; // Username
  // Include other properties if needed, e.g., roles
  // roles?: string[];
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading true

  useEffect(() => {
    setIsLoading(true);
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      try {
        const decodedPayload = jwtDecode<DecodedJwtPayload>(storedToken);
        const appUser: User = { id: decodedPayload.id, username: decodedPayload.sub };
        // Optional: Check if token is expired before setting (requires 'exp' in User interface)
        // if (decodedUser.exp && decodedUser.exp * 1000 < Date.now()) {
        //   localStorage.removeItem('authToken');
        //   throw new Error('Token expired');
        // }
        setToken(storedToken);
        setUser(appUser);
      } catch (error) {
        console.error('Failed to decode or validate token on load:', error);
        localStorage.removeItem('authToken'); // Clear invalid or expired token
        setToken(null); // Explicitly set token to null
        setUser(null);  // Explicitly set user to null
      }
    }
    setIsLoading(false); // Finished loading initial auth state
  }, []);

  const login = (newToken: string) => {
    try {
      const decodedPayload = jwtDecode<DecodedJwtPayload>(newToken);
      const appUser: User = { id: decodedPayload.id, username: decodedPayload.sub };
      localStorage.setItem('authToken', newToken);
      setToken(newToken);
      setUser(appUser);
    } catch (error) {
      console.error('Failed to decode token on login:', error);
      // Potentially handle this error more gracefully, e.g. show a message to the user
      // For now, we'll clear any potentially bad state
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
    // Optionally, redirect to home page or login page after logout
    // window.location.href = '/'; 
  };

  return (
    <AuthContext.Provider value={{ token, user, isAuthenticated: !!token && !!user, isLoading, login, logout }}>
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
