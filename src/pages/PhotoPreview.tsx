import React, { useState } from 'react';
import { Upload, Heart, X, Eye, Download, Calendar } from 'lucide-react';

interface MockPhoto {
  id: string;
  url: string;
  title: string;
  uploadedAt: Date;
  description?: string;
}

const PhotoPreview: React.FC = () => {
  const [mockPhotos, setMockPhotos] = useState<MockPhoto[]>([
    {
      id: '1',
      url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=romantic%20couple%20holding%20hands%20sunset%20beach%20warm%20colors%20love%20photography&image_size=square',
      title: '海边日落',
      uploadedAt: new Date('2024-01-15'),
      description: '我们第一次看日落的地方'
    },
    {
      id: '2',
      url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20couple%20selfie%20coffee%20shop%20warm%20lighting%20happy%20smile&image_size=square',
      title: '咖啡店自拍',
      uploadedAt: new Date('2024-01-20'),
      description: '第一次约会的咖啡店'
    },
    {
      id: '3',
      url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=romantic%20dinner%20candles%20restaurant%20couple%20anniversary%20celebration&image_size=square',
      title: '浪漫晚餐',
      uploadedAt: new Date('2024-02-14'),
      description: '情人节的浪漫晚餐'
    },
    {
      id: '4',
      url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=couple%20travel%20mountain%20hiking%20adventure%20nature%20landscape&image_size=square',
      title: '山顶合影',
      uploadedAt: new Date('2024-03-10'),
      description: '一起爬山看风景'
    },
    {
      id: '5',
      url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=couple%20home%20cooking%20kitchen%20happy%20domestic%20life&image_size=square',
      title: '一起做饭',
      uploadedAt: new Date('2024-03-25'),
      description: '第一次一起下厨'
    },
    {
      id: '6',
      url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=couple%20park%20spring%20flowers%20cherry%20blossom%20romantic%20walk&image_size=square',
      title: '樱花季',
      uploadedAt: new Date('2024-04-05'),
      description: '春天的樱花公园'
    }
  ]);

  const [selectedPhoto, setSelectedPhoto] = useState<MockPhoto | null>(null);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [newPhotoTitle, setNewPhotoTitle] = useState('');
  const [newPhotoDescription, setNewPhotoDescription] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = () => {
    if (!newPhotoTitle.trim()) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // 模拟上传进度
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // 添加新照片到列表
          const newPhoto: MockPhoto = {
            id: Date.now().toString(),
            url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=romantic%20couple%20new%20memory%20love%20photography&image_size=square',
            title: newPhotoTitle,
            uploadedAt: new Date(),
            description: newPhotoDescription
          };
          setMockPhotos(prev => [newPhoto, ...prev]);
          setIsUploading(false);
          setShowUploadForm(false);
          setNewPhotoTitle('');
          setNewPhotoDescription('');
          setUploadProgress(0);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDelete = (photoId: string) => {
    setMockPhotos(prev => prev.filter(photo => photo.id !== photoId));
    if (selectedPhoto?.id === photoId) {
      setSelectedPhoto(null);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-pink-100">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            照片相册
            <Heart className="inline-block ml-2 text-pink-500 animate-pulse" size={32} />
          </h1>
          <p className="text-gray-600">记录我们的美好时光</p>
          <div className="mt-4 px-4 py-2 bg-blue-100 text-blue-800 rounded-lg inline-block">
            📸 预览模式 - 展示照片相册功能
          </div>
        </div>

        {/* 上传按钮 */}
        <div className="flex justify-center mb-8">
          <button
            onClick={() => setShowUploadForm(true)}
            className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <Upload size={20} />
            上传照片
          </button>
        </div>

        {/* 照片网格 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockPhotos.map((photo) => (
            <div
              key={photo.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="relative aspect-square">
                <img
                  src={photo.url}
                  alt={photo.title}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex gap-2">
                    <button
                      onClick={() => setSelectedPhoto(photo)}
                      className="bg-white text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(photo.id)}
                      className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-1">{photo.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{photo.description}</p>
                <div className="flex items-center text-xs text-gray-500">
                  <Calendar size={12} className="mr-1" />
                  {formatDate(photo.uploadedAt)}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 空状态 */}
        {mockPhotos.length === 0 && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">📷</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">还没有照片</h3>
            <p className="text-gray-500 mb-6">上传第一张照片，开始记录美好时光</p>
            <button
              onClick={() => setShowUploadForm(true)}
              className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full hover:from-pink-600 hover:to-purple-600 transition-all duration-300"
            >
              上传照片
            </button>
          </div>
        )}
      </div>

      {/* 上传表单模态框 */}
      {showUploadForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">上传新照片</h3>
              <button
                onClick={() => {
                  setShowUploadForm(false);
                  setNewPhotoTitle('');
                  setNewPhotoDescription('');
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  照片标题 *
                </label>
                <input
                  type="text"
                  value={newPhotoTitle}
                  onChange={(e) => setNewPhotoTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="给这张照片起个名字"
                  disabled={isUploading}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  照片描述
                </label>
                <textarea
                  value={newPhotoDescription}
                  onChange={(e) => setNewPhotoDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  placeholder="描述这个美好的时刻"
                  rows={3}
                  disabled={isUploading}
                />
              </div>
              
              {/* 模拟文件选择 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  选择照片
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-gray-500">点击选择或拖拽照片到这里</p>
                  <p className="text-xs text-gray-400 mt-1">支持 JPG, PNG, GIF 格式</p>
                </div>
              </div>
              
              {/* 上传进度 */}
              {isUploading && (
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>上传中...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowUploadForm(false);
                    setNewPhotoTitle('');
                    setNewPhotoDescription('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={isUploading}
                >
                  取消
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!newPhotoTitle.trim() || isUploading}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUploading ? '上传中...' : '上传'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 照片详情模态框 */}
      {selectedPhoto && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-xl font-semibold text-gray-800">{selectedPhoto.title}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => window.open(selectedPhoto.url, '_blank')}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-100"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="p-4">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                className="w-full max-h-[60vh] object-contain rounded-lg"
              />
              <div className="mt-4">
                {selectedPhoto.description && (
                  <p className="text-gray-600 mb-2">{selectedPhoto.description}</p>
                )}
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar size={16} className="mr-2" />
                  {formatDate(selectedPhoto.uploadedAt)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoPreview;