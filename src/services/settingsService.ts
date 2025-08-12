import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from './firebase';
import {
  UserSettings,
  SettingsFormData,
  AccountStats,
  DataExport,
  AvatarUploadData,
  User,
  Couple,
  Photo,
  Message,
  Anniversary,
  WishItem
} from '../types';

class SettingsService {
  private readonly COLLECTION_NAME = 'settings';
  private readonly STORAGE_PATH = 'avatars';

  // 获取用户设置
  async getUserSettings(userId: string): Promise<UserSettings | null> {
    try {
      const settingsRef = doc(db, this.COLLECTION_NAME, userId);
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        return { id: settingsSnap.id, ...settingsSnap.data() } as UserSettings;
      }
      
      // 如果设置不存在，创建默认设置
      return await this.createDefaultSettings(userId);
    } catch (error) {
      console.error('获取用户设置失败:', error);
      throw new Error('获取用户设置失败');
    }
  }

  // 创建默认设置
  async createDefaultSettings(userId: string): Promise<UserSettings> {
    try {
      const defaultSettings: UserSettings = {
        id: userId,
        userId,
        profile: {
          displayName: '',
          bio: '',
          socialLinks: {}
        },
        preferences: {
        theme: 'light',
        language: 'zh',
        autoSave: true
      },
      notifications: {
        pushEnabled: true,
        emailEnabled: true,
        reminderEnabled: true
      },
      privacy: {
        profileVisibility: 'private',
        dataCollection: false
      },
      security: {
        twoFactorEnabled: false,
        loginNotifications: true
      },
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };

      const settingsRef = doc(db, this.COLLECTION_NAME, userId);
      await setDoc(settingsRef, defaultSettings);
      
      return defaultSettings;
    } catch (error) {
      console.error('创建默认设置失败:', error);
      throw new Error('创建默认设置失败');
    }
  }

  // 更新个人资料
  async updateProfile(userId: string, profileData: Partial<UserSettings['profile']>): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(settingsRef, {
        profile: profileData,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('更新个人资料失败:', error);
      throw new Error('更新个人资料失败');
    }
  }

  // 更新偏好设置
  async updatePreferences(userId: string, preferences: Partial<UserSettings['preferences']>): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(settingsRef, {
        preferences,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('更新偏好设置失败:', error);
      throw new Error('更新偏好设置失败');
    }
  }

  // 更新通知设置
  async updateNotifications(userId: string, notifications: Partial<UserSettings['notifications']>): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(settingsRef, {
        notifications,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('更新通知设置失败:', error);
      throw new Error('更新通知设置失败');
    }
  }

  // 更新隐私设置
  async updatePrivacy(userId: string, privacy: Partial<UserSettings['privacy']>): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(settingsRef, {
        privacy,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('更新隐私设置失败:', error);
      throw new Error('更新隐私设置失败');
    }
  }

  // 更新安全设置
  async updateSecurity(userId: string, security: Partial<UserSettings['security']>): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION_NAME, userId);
      await updateDoc(settingsRef, {
        security,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('更新安全设置失败:', error);
      throw new Error('更新安全设置失败');
    }
  }

  // 上传头像
  async uploadAvatar(userId: string, avatarData: AvatarUploadData): Promise<string> {
    try {
      const { file } = avatarData;
      const fileName = `${userId}_${Date.now()}.${file.name.split('.').pop()}`;
      const avatarRef = ref(storage, `${this.STORAGE_PATH}/${fileName}`);
      
      // 上传文件
      const snapshot = await uploadBytes(avatarRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // 更新用户资料中的头像URL
      await this.updateProfile(userId, { avatar: downloadURL });
      
      return downloadURL;
    } catch (error) {
      console.error('上传头像失败:', error);
      throw new Error('上传头像失败');
    }
  }

  // 删除头像
  async deleteAvatar(userId: string, avatarUrl: string): Promise<void> {
    try {
      // 从存储中删除文件
      const avatarRef = ref(storage, avatarUrl);
      await deleteObject(avatarRef);
      
      // 更新用户资料
      await this.updateProfile(userId, { avatar: undefined });
    } catch (error) {
      console.error('删除头像失败:', error);
      throw new Error('删除头像失败');
    }
  }

  // 获取账户统计信息
  async getAccountStats(userId: string): Promise<AccountStats> {
    try {
      // 这里需要查询各个集合来获取统计数据
      // 为了简化，我们返回模拟数据
      // 在实际应用中，你可能需要使用 Cloud Functions 来计算这些统计数据
      
      const stats: AccountStats = {
        totalMemories: 0,
        totalPhotos: 0,
        totalMessages: 0,
        totalWishes: 0,
        joinDate: ''
      };
      
      // 获取用户创建时间来计算账户年龄
      const userSettings = await this.getUserSettings(userId);
      if (userSettings?.createdAt) {
        stats.joinDate = userSettings.createdAt.toDate().toLocaleDateString();
      }
      
      return stats;
    } catch (error) {
      console.error('获取账户统计失败:', error);
      throw new Error('获取账户统计失败');
    }
  }

  // 导出用户数据
  async exportUserData(userId: string): Promise<Blob> {
    try {
      // 获取用户的所有数据
      const settings = await this.getUserSettings(userId);
      
      // 在实际应用中，你需要从各个集合中获取用户数据
      const exportData: DataExport = {
        user: {} as User, // 需要从用户集合获取
        couple: undefined, // 需要从情侣集合获取
        photos: [], // 需要从照片集合获取
        messages: [], // 需要从消息集合获取
        anniversaries: [], // 需要从纪念日集合获取
        wishes: [], // 需要从愿望集合获取
        settings: settings!,
        exportedAt: Timestamp.now(),
        version: '1.0.0'
      };
      
      const jsonString = JSON.stringify(exportData, null, 2);
      return new Blob([jsonString], { type: 'application/json' });
    } catch (error) {
      console.error('导出用户数据失败:', error);
      throw new Error('导出用户数据失败');
    }
  }

  // 删除用户账户
  async deleteAccount(userId: string): Promise<void> {
    try {
      // 删除用户设置
      const settingsRef = doc(db, this.COLLECTION_NAME, userId);
      await deleteDoc(settingsRef);
      
      // 在实际应用中，你还需要删除用户的所有相关数据
      // 这通常通过 Cloud Functions 来处理，以确保数据一致性
      
      console.log('用户账户删除成功');
    } catch (error) {
      console.error('删除用户账户失败:', error);
      throw new Error('删除用户账户失败');
    }
  }

  // 批量更新设置
  async updateSettings(userId: string, settingsData: SettingsFormData): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION_NAME, userId);
      const updateData: any = {
        updatedAt: serverTimestamp()
      };
      
      if (settingsData.profile) {
        updateData.profile = settingsData.profile;
      }
      if (settingsData.preferences) {
        updateData.preferences = settingsData.preferences;
      }
      if (settingsData.notifications) {
        updateData.notifications = settingsData.notifications;
      }
      if (settingsData.privacy) {
        updateData.privacy = settingsData.privacy;
      }
      if (settingsData.security) {
        updateData.security = settingsData.security;
      }
      
      await updateDoc(settingsRef, updateData);
    } catch (error) {
      console.error('批量更新设置失败:', error);
      throw new Error('批量更新设置失败');
    }
  }

  // 重置设置为默认值
  async resetToDefaults(userId: string): Promise<void> {
    try {
      const settingsRef = doc(db, this.COLLECTION_NAME, userId);
      await deleteDoc(settingsRef);
      await this.createDefaultSettings(userId);
    } catch (error) {
      console.error('重置设置失败:', error);
      throw new Error('重置设置失败');
    }
  }
}

export const settingsService = new SettingsService();
export default settingsService;