import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CoupleProvider } from './contexts/CoupleContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Preview from './pages/Preview';
import PreviewAnniversaries from './pages/PreviewAnniversaries';
import PhotoPreview from './pages/PhotoPreview';
import Anniversary from './pages/Anniversary';
import Photos from './pages/Photos';
import Chat from './pages/Chat';
import Wishlist from './pages/Wishlist';
import Settings from './pages/Settings';
import './index.css';

function App() {
  return (
    <AuthProvider>
      <CoupleProvider>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-pink-100 to-purple-100">
            <Routes>
              {/* 公开路由 */}
              <Route 
                path="/login" 
                element={
                  <ProtectedRoute requireAuth={false}>
                    <Login />
                  </ProtectedRoute>
                } 
              />
              
              {/* 预览路由 - 无需登录 */}
              <Route 
                path="/preview" 
                element={<Preview />} 
              />
              
              {/* 纪念日管理预览路由 - 无需登录 */}
              <Route 
                path="/preview/anniversaries" 
                element={<PreviewAnniversaries />} 
              />
              
              {/* 照片相册预览路由 - 无需登录 */}
              <Route 
                path="/preview/photos" 
                element={<PhotoPreview />} 
              />
              
              {/* 受保护的路由 */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                } 
              />
              
              {/* 纪念日管理页面 */}
              <Route 
                path="/anniversaries" 
                element={
                  <ProtectedRoute>
                    <Anniversary />
                  </ProtectedRoute>
                } 
              />
              
              {/* 照片相册页面 */}
              <Route 
                path="/photos" 
                element={
                  <ProtectedRoute>
                    <Photos />
                  </ProtectedRoute>
                } 
              />
              
              {/* 聊天互动页面 */}
              <Route 
                path="/chat" 
                element={
                  <ProtectedRoute>
                    <Chat />
                  </ProtectedRoute>
                } 
              />
              
              {/* 愿望清单页面 */}
              <Route 
                path="/wishlist" 
                element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                } 
              />
              
              {/* 设置个人资料页面 */}
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              
              {/* 其他路由将在后续模块开发中添加 */}
            </Routes>
          </div>
        </Router>
      </CoupleProvider>
    </AuthProvider>
  );
}

export default App;