import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Loader2, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAuth?: boolean;
}

/**
 * 路由保护组件
 * @param children 子组件
 * @param requireAuth 是否需要认证，默认为true
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 显示加载状态
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-100 to-purple-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <Heart className="w-12 h-12 text-pink-500 fill-current" />
            <Loader2 className="w-6 h-6 text-purple-500 animate-spin absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="text-center">
            <p className="text-gray-600 font-medium">加载中...</p>
            <p className="text-gray-500 text-sm mt-1">正在验证身份</p>
          </div>
        </div>
      </div>
    );
  }

  // 需要认证但用户未登录
  if (requireAuth && !user) {
    return (
      <Navigate 
        to="/login" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // 不需要认证但用户已登录（如登录页面）
  if (!requireAuth && user) {
    return (
      <Navigate 
        to={location.state?.from?.pathname || '/'} 
        replace 
      />
    );
  }

  // 渲染子组件
  return <>{children}</>;
};

export default ProtectedRoute;