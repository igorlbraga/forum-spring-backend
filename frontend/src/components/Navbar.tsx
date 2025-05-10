'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login'); 
    
  };

  if (isLoading) {
    
    return (
        <header className="bg-background border-b">
            <div className="container mx-auto flex items-center justify-between p-4">
                <div className="text-lg font-semibold">
                    <Link href="/" className="hover:text-primary">
                        My Blog
                    </Link>
                </div>
                <div className="h-8 w-24 bg-muted rounded animate-pulse"></div> {/* Placeholder for nav items */}
            </div>
        </header>
    );
  }

  return (
    <header className="bg-background border-b sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="text-lg font-semibold">
          <Link href="/" className="hover:text-primary">
            My Blog App
          </Link>
        </div>
        <nav className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <>
              <span className="text-sm text-muted-foreground">
                Welcome, {user.username}
              </span>
              <Link href="/posts/new" passHref>
                <Button variant="ghost">Create Post</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" passHref>
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/register" passHref>
                <Button variant="default">Register</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
