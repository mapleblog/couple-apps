import React, { useState, useRef } from 'react';
import {
  Camera,
  Upload,
  X,
  Save,
  User,
  Calendar,
  MapPin,
  Phone,
  Instagram,
  Twitter,
  Facebook,
  Edit3,
  Trash2
} from 'lucide-react';
import { UserSettings, AvatarUploadData } from '../types';
import { toast } from 'sonner';

interface ProfileEditProps {
  profile: UserSettings['profile'];
  avatar?: string;
  onUpdateProfile: (data: Partial<UserSettings['profile']>) => Promise<void>;
  onUploadAvatar: (data: AvatarUploadData) => Promise<string>;
  onDeleteAvatar?: () => Promise<void>;
  loading?: boolean;
}

const ProfileEdit: React.FC<ProfileEditProps> = ({
  profile,
  avatar,
  onUpdateProfile,
  onUploadAvatar,
  onDeleteAvatar,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    displayName: profile.displayName || '',
    bio: profile.bio || '',
    birthday: profile.birthday ? new Date(profile.birthday.toDate()).toISOString().split('T')[0] : '',
    location: profile.location || '',
    phoneNumber: profile.phoneNumber || '',
    socialLinks: {
      instagram: profile.socialLinks?.instagram || '',
      twitter: profile.socialLinks?.twitter || '',
      facebook: profile.socialLinks?.facebook || ''
    }
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('socialLinks.')) {
      const socialField = field.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      const updateData: Partial<UserSettings['profile']> = {
        displayName: formData.displayName,
        bio: formData.bio,
        location: formData.location,
        phoneNumber: formData.phoneNumber,
        socialLinks: formData.socialLinks
      };

      if (formData.birthday) {
        updateData.birthday = new Date(formData.birthday) as any;
      }

      await onUpdateProfile(updateData);
      setIsEditing(false);
      toast.success('个人资料更新成功');
    } catch (error) {
      toast.error('更新失败，请重试');
    }
  };

  const handleCancel = () => {
    setFormData({
      displayName: profile.displayName || '',
      bio: profile.bio || '',
      birthday: profile.birthday ? new Date(profile.birthday.toDate()).toISOString().split('T')[0] : '',
      location: profile.location || '',
      phoneNumber: profile.phoneNumber || '',
      socialLinks: {
        instagram: profile.socialLinks?.instagram || '',
        twitter: profile.socialLinks?.twitter || '',
        facebook: profile.socialLinks?.facebook || ''
      }
    });
    setIsEditing(false);
  };

  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件');
      return;
    }

    // 验证文件大小 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB');
      return;
    }

    try {
      setUploading(true);
      
      // 创建预览
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewAvatar(e.target?.result as string);
      };
      reader.readAsDataURL(file);

      // 上传头像
      const avatarData: AvatarUploadData = { file };
      await onUploadAvatar(avatarData);
      
      toast.success('头像上传成功');
      setPreviewAvatar(null);
    } catch (error) {
      toast.error('头像上传失败，请重试');
      setPreviewAvatar(null);
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleAvatarUpload(file);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!onDeleteAvatar) return;
    
    try {
      await onDeleteAvatar();
      toast.success('头像删除成功');
    } catch (error) {
      toast.error('删除失败，请重试');
    }
  };

  const currentAvatar = previewAvatar || avatar;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* 头部 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">个人资料</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-pink-600 hover:text-pink-700 disabled:opacity-50"
          >
            <Edit3 className="w-4 h-4" />
            <span>编辑</span>
          </button>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCancel}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-700 disabled:opacity-50"
            >
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg hover:from-pink-600 hover:to-purple-700 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>保存</span>
            </button>
          </div>
        )}
      </div>

      {/* 头像区域 */}
      <div className="flex items-center space-x-6 mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-pink-100 to-purple-100 flex items-center justify-center">
            {currentAvatar ? (
              <img
                src={currentAvatar}
                alt="头像"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-12 h-12 text-gray-400" />
            )}
          </div>
          
          {uploading && (
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        <div className="flex-1">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {formData.displayName || '未设置昵称'}
          </h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || loading}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-pink-600 border border-pink-200 rounded-lg hover:bg-pink-50 disabled:opacity-50"
            >
              <Camera className="w-4 h-4" />
              <span>更换头像</span>
            </button>
            
            {currentAvatar && onDeleteAvatar && (
              <button
                onClick={handleDeleteAvatar}
                disabled={uploading || loading}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                <span>删除</span>
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {/* 表单区域 */}
      <div className="space-y-6">
        {/* 基本信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              昵称
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                disabled={!isEditing || loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="请输入昵称"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              生日
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={formData.birthday}
                onChange={(e) => handleInputChange('birthday', e.target.value)}
                disabled={!isEditing || loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              所在地
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                disabled={!isEditing || loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="请输入所在地"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              手机号
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                disabled={!isEditing || loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="请输入手机号"
              />
            </div>
          </div>
        </div>

        {/* 个人简介 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            个人简介
          </label>
          <textarea
            value={formData.bio}
            onChange={(e) => handleInputChange('bio', e.target.value)}
            disabled={!isEditing || loading}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500 resize-none"
            placeholder="介绍一下自己吧..."
          />
        </div>

        {/* 社交链接 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            社交链接
          </label>
          <div className="space-y-4">
            <div className="relative">
              <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={formData.socialLinks.instagram}
                onChange={(e) => handleInputChange('socialLinks.instagram', e.target.value)}
                disabled={!isEditing || loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Instagram 链接"
              />
            </div>
            
            <div className="relative">
              <Twitter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={formData.socialLinks.twitter}
                onChange={(e) => handleInputChange('socialLinks.twitter', e.target.value)}
                disabled={!isEditing || loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Twitter 链接"
              />
            </div>
            
            <div className="relative">
              <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="url"
                value={formData.socialLinks.facebook}
                onChange={(e) => handleInputChange('socialLinks.facebook', e.target.value)}
                disabled={!isEditing || loading}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                placeholder="Facebook 链接"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileEdit;