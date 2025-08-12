import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCouple } from '../contexts/CoupleContext';
import { Photo, PhotoContextType, PhotoUploadData } from '../types';
import {
  getCouplePhotos,
  uploadPhoto,
  deletePhoto as deletePhotoService,
  updatePhoto as updatePhotoService
} from '../services/photoService';
import PhotoUpload from '../components/PhotoUpload';
import PhotoCard from '../components/PhotoCard';
import { ImageIcon, Upload, Heart, Loader2 } from 'lucide-react';

// Empty状态组件
interface EmptyProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

const Empty: React.FC<EmptyProps> = ({ icon: Icon, title, description }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-pink-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm">{description}</p>
    </div>
  );
};

// 照片上下文
const PhotoContext = createContext<PhotoContextType | null>(null);

const usePhotoContext = () => {
  const context = useContext(PhotoContext);
  if (!context) {
    throw new Error('usePhotoContext must be used within a PhotoProvider');
  }
  return context;
};

// 照片提供者组件
const PhotoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { couple } = useCouple();

  // 获取照片列表
  const refreshPhotos = async () => {
    if (!couple?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      const fetchedPhotos = await getCouplePhotos(couple.id);
      setPhotos(fetchedPhotos);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取照片失败');
    } finally {
      setLoading(false);
    }
  };

  // 上传照片
  const handleUploadPhoto = async (data: PhotoUploadData) => {
    if (!couple?.id || !user?.uid) return;
    
    try {
      setUploading(true);
      setError(null);
      const newPhoto = await uploadPhoto(couple.id, user.uid, data);
      setPhotos(prev => [newPhoto, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传照片失败');
      throw err;
    } finally {
      setUploading(false);
    }
  };

  // 删除照片
  const handleDeletePhoto = async (id: string) => {
    const photo = photos.find(p => p.id === id);
    if (!photo) return;
    
    try {
      setError(null);
      await deletePhotoService(id, photo.url);
      setPhotos(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除照片失败');
      throw err;
    }
  };

  // 更新照片
  const handleUpdatePhoto = async (
    id: string,
    updates: Partial<Pick<Photo, 'caption' | 'tags'>>
  ) => {
    try {
      setError(null);
      await updatePhotoService(id, updates);
      setPhotos(prev => prev.map(p => 
        p.id === id ? { ...p, ...updates } : p
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新照片失败');
      throw err;
    }
  };

  useEffect(() => {
    refreshPhotos();
  }, [couple?.id]);

  const value: PhotoContextType = {
    photos,
    loading,
    uploading,
    error,
    uploadPhoto: handleUploadPhoto,
    deletePhoto: handleDeletePhoto,
    updatePhoto: handleUpdatePhoto,
    refreshPhotos
  };

  return (
    <PhotoContext.Provider value={value}>
      {children}
    </PhotoContext.Provider>
  );
};

// 照片网格组件
const PhotoGrid: React.FC = () => {
  const { photos, loading } = usePhotoContext();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-pink-500" />
        <span className="ml-2 text-gray-600">加载照片中...</span>
      </div>
    );
  }

  if (photos.length === 0) {
    return (
      <Empty
        icon={ImageIcon}
        title="还没有照片"
        description="上传你们的第一张照片，开始记录美好时光"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo) => (
        <PhotoCard key={photo.id} photo={photo} />
      ))}
    </div>
  );
};

// 照片页面头部
const PhotosHeader: React.FC<{ onUploadClick: () => void }> = ({ onUploadClick }) => {
  const { photos, uploading } = usePhotoContext();

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-lg">
          <ImageIcon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">照片相册</h1>
          <p className="text-gray-600">
            共 {photos.length} 张照片
            <Heart className="inline w-4 h-4 ml-1 text-pink-500 animate-pulse" />
          </p>
        </div>
      </div>
      
      <button
        onClick={onUploadClick}
        disabled={uploading}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {uploading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Upload className="w-4 h-4" />
        )}
        <span>{uploading ? '上传中...' : '上传照片'}</span>
      </button>
    </div>
  );
};

// 主照片页面组件
const Photos: React.FC = () => {
  const [showUpload, setShowUpload] = useState(false);
  const { error } = usePhotoContext();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <PhotosHeader onUploadClick={() => setShowUpload(true)} />
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}
        
        <PhotoGrid />
        
        {showUpload && (
          <PhotoUpload
            onClose={() => setShowUpload(false)}
            onSuccess={() => setShowUpload(false)}
          />
        )}
      </div>
    </div>
  );
};

// 导出带Provider的组件
const PhotosWithProvider: React.FC = () => {
  return (
    <PhotoProvider>
      <Photos />
    </PhotoProvider>
  );
};

export default PhotosWithProvider;
export { usePhotoContext };