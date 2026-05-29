import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { isDesktopApp } from '@/lib/platform';

interface ProtectedRouteProps {
  /** Roles allowed to access this route */
  allowedRoles: ('admin' | 'teacher' | 'parent')[];
  /** Force route to only be accessible on a specific platform */
  requiredPlatform?: 'web' | 'app';
  /** Optional: render children instead of an Outlet */
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  allowedRoles, 
  requiredPlatform,
  children 
}) => {
  const { user, isLoading } = useApp();
  const currentPlatform = isDesktopApp ? 'app' : 'web';

  // Show nothing or a spinner while checking auth status
  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  // 1. Check Authentication: Redirect to login if no user
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // 2. Check Platform Access: 
  // Prevents Web users from hitting Desktop routes and vice versa.
  // Admin is exempt from platform-specific restrictions to allow institutional oversight.
  if (requiredPlatform && currentPlatform !== requiredPlatform && user.role !== 'admin') {
    console.warn(`Access Denied: Route requires ${requiredPlatform} platform.`);
    const fallback = user.role === 'parent' ? '/parent' : user.role === 'admin' ? '/admin' : '/teacher';
    return <Navigate to={fallback} replace />;
  }

  // 3. Check Role Authorization
  if (!allowedRoles.includes(user.role)) {
    console.warn(`Access Denied: Role ${user.role} is not authorized for this route.`);
    const fallback = user.role === 'parent' ? '/parent' : user.role === 'admin' ? '/admin' : '/teacher';
    return <Navigate to={fallback} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;