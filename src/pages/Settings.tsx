import React, { useState, useEffect } from 'react';
import {
  User,
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Eye,
  Database,
  Download,
  Trash2,
  Edit3,
  BarChart3,
  X
} from 'lucide-react';
import { UserSettings, SettingCard, AccountStats, AvatarUploadData } from '../types';
import { settingsService } from '../services/settingsService';
import SettingCardComponent from '../components/SettingCard';
import ProfileEdit from '../components/ProfileEdit';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'account'>('profile');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [stats, setStats] = useState<AccountStats | null>(null);

  useEffect(() => {
    loadSettings();
    loadStats();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await settingsService.getUserSettings(user!.uid);
      setSettings(userSettings);
    } catch (error) {
      console.error('Failed to load settings:', error);
      toast.error('加载设置失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const accountStats = await settingsService.getAccountStats(user!.uid);
      setStats(accountStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSettingUpdate = async (key: string, value: any) => {
    if (!settings) return;

    try {
      let updatedSettings: UserSettings;
      
      if (key.startsWith('preferences.')) {
        const prefKey = key.replace('preferences.', '');
        await settingsService.updatePreferences(user!.uid, {
          ...settings.preferences,
          [prefKey]: value
        });
        updatedSettings = {
          ...settings,
          preferences: {
            ...settings.preferences,
            [prefKey]: value
          }
        };
      } else if (key.startsWith('notifications.')) {
        const notifKey = key.replace('notifications.', '');
        await settingsService.updateNotifications(user!.uid, {
          ...settings.notifications,
          [notifKey]: value
        });
        updatedSettings = {
          ...settings,
          notifications: {
            ...settings.notifications,
            [notifKey]: value
          }
        };
      } else if (key.startsWith('privacy.')) {
        const privacyKey = key.replace('privacy.', '');
        await settingsService.updatePrivacy(user!.uid, {
           ...settings.privacy,
           [privacyKey]: value
         });
         updatedSettings = {
           ...settings,
           privacy: {
             ...settings.privacy,
             [privacyKey]: value
           }
         };
      } else {
        return;
      }

      setSettings(updatedSettings);
      toast.success('设置已更新');
    } catch (error) {
      console.error('Failed to update setting:', error);
      toast.error('更新设置失败');
    }
  };

  const handleExportData = async () => {
    try {
      const exportData = await settingsService.exportUserData(user!.uid);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `couple-app-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('数据导出成功');
    } catch (error) {
      console.error('Failed to export data:', error);
      toast.error('数据导出失败');
    }
  };

  const handleUpdateProfile = async (profileData: Partial<UserSettings['profile']>) => {
    try {
      setLoading(true);
      await settingsService.updateProfile(user.uid, profileData);
      
      // 更新本地状态
      setSettings(prev => ({
        ...prev!,
        profile: { ...prev!.profile, ...profileData }
      }));
      
      toast.success('个人资料更新成功');
    } catch (error) {
      console.error('更新个人资料失败:', error);
      toast.error('更新失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadAvatar = async (data: { file: File }) => {
    try {
      setLoading(true);
      const avatarUrl = await settingsService.uploadAvatar(user.uid, data);
      
      setSettings(prev => ({
        ...prev!,
        profile: { ...prev!.profile, avatar: avatarUrl }
      }));
      
      return avatarUrl;
    } catch (error) {
      console.error('上传头像失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvatar = async () => {
    try {
      setLoading(true);
      const currentAvatar = settings?.profile.avatar;
      if (currentAvatar) {
        await settingsService.deleteAvatar(user.uid, currentAvatar);
      }
      
      setSettings(prev => ({
        ...prev!,
        profile: { ...prev!.profile, avatar: undefined }
      }));
    } catch (error) {
      console.error('删除头像失败:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('确定要删除账户吗？此操作不可撤销！')) {
      try {
        await settingsService.deleteAccount(user.uid);
        toast.success('账户已删除');
        // 这里应该重定向到登录页面
      } catch (error) {
        console.error('Failed to delete account:', error);
        toast.error('删除账户失败');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">加载设置失败</p>
          <button
            onClick={loadSettings}
            className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
          >
            重试
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'profile' as const, label: '个人资料', icon: User },
    { id: 'preferences' as const, label: '偏好设置', icon: SettingsIcon },
    { id: 'account' as const, label: '账户管理', icon: Shield }
  ];

  const preferenceSettings: SettingCard[] = [
    {
      id: 'theme',
      title: '主题模式',
      description: '选择应用的外观主题',
      type: 'select' as const,
      value: settings.preferences.theme,
      options: [
        { label: '浅色', value: 'light' },
        { label: '深色', value: 'dark' },
        { label: '跟随系统', value: 'system' }
      ],
      icon: 'palette',
      category: 'preferences' as const
    },
    {
      id: 'language',
      title: '语言设置',
      description: '选择应用显示语言',
      type: 'select' as const,
      value: settings.preferences.language,
      options: [
        { label: '中文', value: 'zh' },
        { label: 'English', value: 'en' }
      ],
      icon: 'globe',
      category: 'preferences' as const
    },
    {
      id: 'autoSave',
      title: '自动保存',
      description: '自动保存编辑内容',
      type: 'toggle' as const,
      value: settings.preferences.autoSave,
      icon: 'save',
      category: 'preferences' as const
    }
  ];

  const notificationSettings: SettingCard[] = [
    {
      id: 'pushEnabled',
      title: '推送通知',
      description: '接收应用推送通知',
      type: 'toggle' as const,
      value: settings.notifications.pushEnabled,
      icon: 'bell',
      category: 'notifications' as const
    },
    {
      id: 'emailEnabled',
      title: '邮件通知',
      description: '接收邮件通知',
      type: 'toggle' as const,
      value: settings.notifications.emailEnabled,
      icon: 'mail',
      category: 'notifications' as const
    },
    {
      id: 'reminderEnabled',
      title: '提醒通知',
      description: '接收重要事件提醒',
      type: 'toggle' as const,
      value: settings.notifications.reminderEnabled,
      icon: 'clock',
      category: 'notifications' as const
    }
  ];

  const privacySettings: SettingCard[] = [
    {
      id: 'profileVisibility',
      title: '资料可见性',
      description: '控制谁可以查看您的资料',
      type: 'select' as const,
      value: settings.privacy.profileVisibility,
      options: [
        { label: '公开', value: 'public' },
        { label: '仅好友', value: 'friends' },
        { label: '私密', value: 'private' }
      ],
      icon: 'eye',
      category: 'privacy' as const
    },
    {
      id: 'dataCollection',
      title: '数据收集',
      description: '允许收集使用数据以改善服务',
      type: 'toggle' as const,
      value: settings.privacy.dataCollection,
      icon: 'database',
      category: 'privacy' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">设置</h1>
          <p className="text-gray-600">管理您的个人资料和应用偏好</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-xl p-1 shadow-lg">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-800">个人资料</h2>
                  <button
                    onClick={() => setIsEditingProfile(!isEditingProfile)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isEditingProfile
                        ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        : 'bg-pink-500 text-white hover:bg-pink-600'
                    }`}
                  >
                    {isEditingProfile ? (
                      <>
                        <X className="w-4 h-4" />
                        <span>取消</span>
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4" />
                        <span>编辑</span>
                      </>
                    )}
                  </button>
                </div>

                {isEditingProfile ? (
                  <ProfileEdit
                    profile={settings.profile}
                    avatar={settings.profile.avatar}
                    onUpdateProfile={handleUpdateProfile}
                    onUploadAvatar={handleUploadAvatar}
                    onDeleteAvatar={handleDeleteAvatar}
                    loading={loading}
                  />
                ) : (
                  <div className="flex items-start space-x-6">
                    <div className="relative">
                      <img
                        src={settings.profile.avatar || 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20couple%20avatar%20placeholder%20pink%20purple%20gradient&image_size=square'}
                        alt="Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-pink-200"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-gray-800 mb-2">
                        {settings.profile.displayName || '未设置昵称'}
                      </h3>
                      <div className="space-y-2 text-gray-600">
                        <p><span className="font-medium">昵称:</span> {settings.profile.displayName || '未设置昵称'}</p>
                        <p><span className="font-medium">简介:</span> {settings.profile.bio || '未设置简介'}</p>
                        <p><span className="font-medium">生日:</span> {settings.profile.birthday ? settings.profile.birthday.toDate().toLocaleDateString() : '未设置'}</p>
                        <p><span className="font-medium">所在地:</span> {settings.profile.location || '未设置'}</p>
                        <p><span className="font-medium">手机:</span> {settings.profile.phoneNumber || '未设置'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'preferences' && (
            <div className="space-y-6">
              {/* Theme & Language */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">外观与语言</h2>
                <div className="space-y-4">
                  {preferenceSettings.map((setting) => (
                    <SettingCardComponent
                      key={setting.id}
                      setting={setting}
                      onUpdate={(value) => handleSettingUpdate(`preferences.${setting.id}`, value)}
                    />
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">通知设置</h2>
                <div className="space-y-4">
                  {notificationSettings.map((setting) => (
                    <SettingCardComponent
                      key={setting.id}
                      setting={setting}
                      onUpdate={(value) => handleSettingUpdate(`notifications.${setting.id}`, value)}
                    />
                  ))}
                </div>
              </div>

              {/* Privacy */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">隐私设置</h2>
                <div className="space-y-4">
                  {privacySettings.map((setting) => (
                    <SettingCardComponent
                      key={setting.id}
                      setting={setting}
                      onUpdate={(value) => handleSettingUpdate(`privacy.${setting.id}`, value)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              {/* Account Stats */}
              {stats && (
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6">账户统计</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-pink-50 rounded-lg">
                      <div className="text-2xl font-bold text-pink-600">{stats.totalMemories}</div>
                      <div className="text-sm text-gray-600">回忆</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{stats.totalPhotos}</div>
                      <div className="text-sm text-gray-600">照片</div>
                    </div>
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalMessages}</div>
                      <div className="text-sm text-gray-600">消息</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{stats.totalWishes}</div>
                      <div className="text-sm text-gray-600">愿望</div>
                    </div>
                  </div>
                  <div className="mt-4 text-center text-sm text-gray-500">
                    账户创建于 {new Date(stats.joinDate).toLocaleDateString()}
                  </div>
                </div>
              )}

              {/* Data Management */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-6">数据管理</h2>
                <div className="space-y-4">
                  <button
                    onClick={handleExportData}
                    className="w-full flex items-center justify-center space-x-2 p-4 border-2 border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    <span>导出我的数据</span>
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-white rounded-xl p-6 shadow-lg border-2 border-red-200">
                <h2 className="text-xl font-semibold text-red-600 mb-6">危险操作</h2>
                <div className="space-y-4">
                  <button
                    onClick={handleDeleteAccount}
                    className="w-full flex items-center justify-center space-x-2 p-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                    <span>删除账户</span>
                  </button>
                  <p className="text-sm text-gray-500 text-center">
                    删除账户将永久删除您的所有数据，此操作不可撤销
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;