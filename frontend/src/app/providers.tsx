'use client';

import { AuthProvider } from '../contexts/AuthContext';
import React from 'react';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {/* You can wrap other global client-side providers here if needed */}
      {children}
    </AuthProvider>
  );
}
