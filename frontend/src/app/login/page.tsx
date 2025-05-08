'use client'; // Forms and auth interactions require client components

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/apiService'; // Import the actual API service
import { LoginRequest } from '@/types/auth'; // Import the LoginRequest type
// Shadcn/UI imports will go here later

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState(''); // Changed from username to usernameOrEmail
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const credentials: LoginRequest = { username: usernameOrEmail, password };
      const data = await loginUser(credentials);
      
      if (data.accessToken) {
        login(data.accessToken); 
        router.push('/'); // Redirect to homepage after login
      } else {
        throw new Error('Login failed: No access token received.');
      }

    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during login.');
    }
    setIsLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white shadow-md rounded-lg w-full max-w-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="usernameOrEmail" className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
            <input 
              type="text" 
              id="usernameOrEmail" 
              value={usernameOrEmail} 
              onChange={(e) => setUsernameOrEmail(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required 
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              id="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required 
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        {/* Link to registration page can be added here */}
        {/* <p className="mt-4 text-center text-sm">
          Don't have an account? <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Register here</a>
        </p> */}
      </div>
    </div>
  );
}
