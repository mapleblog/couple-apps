import { Timestamp, FieldValue } from 'firebase/firestore';

// 用户类型
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  coupleId?: string;
  partnerId?: string;
  createdAt: Timestamp | FieldValue;
  updatedAt: Timestamp | FieldValue;
}

// 情侣档案类型
export interface Couple {
  id: string;
  user1Id: string;
  user2Id: string;
  relationshipStart: Timestamp;
  anniversaryDate: Timestamp;
  status: 'pending' | 'active';
  inviteCode: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 纪念日类型
export interface Anniversary {
  id: string;
  coupleId: string;
  title: string;
  date: Timestamp;
  description?: string;
  type: 'anniversary' | 'birthday' | 'first_date' | 'engagement' | 'wedding' | 'custom';
  isRecurring: boolean;
  reminderDays?: number; // 提前几天提醒
  createdBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 纪念日表单数据类型
export interface AnniversaryFormData {
  title: string;
  date: string; // YYYY-MM-DD 格式
  description?: string;
  type: Anniversary['type'];
  isRecurring: boolean;
  reminderDays?: number;
}

// 纪念日上下文类型
export interface AnniversaryContextType {
  anniversaries: Anniversary[];
  loading: boolean;
  error: string | null;
  addAnniversary: (data: AnniversaryFormData) => Promise<void>;
  updateAnniversary: (id: string, data: Partial<AnniversaryFormData>) => Promise<void>;
  deleteAnniversary: (id: string) => Promise<void>;
  getUpcomingAnniversaries: (days?: number) => Anniversary[];
  refreshAnniversaries: () => Promise<void>;
}

// 照片类型
export interface Photo {
  id: string;
  coupleId: string;
  url: string;
  thumbnailUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  caption?: string;
  uploadedBy: string;
  uploadedAt: Timestamp;
  tags: string[];
  width?: number;
  height?: number;
}

// 照片上传表单数据类型
export interface PhotoUploadData {
  file: File;
  caption?: string;
  tags: string[];
}

// 照片上下文类型
export interface PhotoContextType {
  photos: Photo[];
  loading: boolean;
  uploading: boolean;
  error: string | null;
  uploadPhoto: (data: PhotoUploadData) => Promise<void>;
  deletePhoto: (id: string) => Promise<void>;
  updatePhoto: (id: string, updates: Partial<Pick<Photo, 'caption' | 'tags'>>) => Promise<void>;
  refreshPhotos: () => Promise<void>;
}

// 聊天消息类型
export interface Message {
  id: string;
  coupleId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type: 'text' | 'emoji' | 'image';
  timestamp: Timestamp;
  isRead: boolean;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  readBy: string[];
  replyTo?: string; // 回复的消息ID
  reactions?: MessageReaction[];
  isEdited?: boolean;
  editedAt?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// 消息反应类型
export interface MessageReaction {
  emoji: string;
  userId: string;
  timestamp: Timestamp;
}

// 聊天上下文类型
export interface ChatContextType {
  messages: Message[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  sendMessage: (content: string, type?: Message['type'], replyTo?: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  removeReaction: (messageId: string, emoji: string) => Promise<void>;
  editMessage: (messageId: string, newContent: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  refreshMessages: () => Promise<void>;
}

// 表情符号类型
export interface EmojiData {
  emoji: string;
  name: string;
  category: 'smileys' | 'hearts' | 'gestures' | 'objects' | 'symbols';
}

// 聊天状态类型
export interface ChatStatus {
  isTyping: boolean;
  lastSeen: Timestamp;
  isOnline: boolean;
}

// 愿望清单类型
export interface WishItem {
  id: string;
  coupleId: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed';
  category: 'travel' | 'experience' | 'gift' | 'achievement' | 'date' | 'other';
  targetDate?: Timestamp;
  estimatedCost?: number;
  currency?: string;
  tags: string[];
  isShared: boolean; // 是否与伴侣共享
  createdBy: string;
  assignedTo?: string; // 分配给谁完成
  createdAt: Timestamp;
  updatedAt: Timestamp;
  completedAt?: Timestamp;
  completedBy?: string;
  notes?: string; // 完成时的备注
}

// 愿望清单表单数据类型
export interface WishFormData {
  title: string;
  description?: string;
  priority: WishItem['priority'];
  category: WishItem['category'];
  targetDate?: string; // YYYY-MM-DD 格式
  estimatedCost?: number;
  currency?: string;
  tags: string[];
  isShared: boolean;
  assignedTo?: string;
  notes?: string;
}

// 愿望清单上下文类型
export interface WishlistContextType {
  wishes: WishItem[];
  loading: boolean;
  error: string | null;
  addWish: (data: WishFormData) => Promise<void>;
  updateWish: (id: string, data: Partial<WishFormData>) => Promise<void>;
  deleteWish: (id: string) => Promise<void>;
  toggleWishStatus: (id: string, status: WishItem['status']) => Promise<void>;
  completeWish: (id: string, notes?: string) => Promise<void>;
  getWishesByStatus: (status: WishItem['status']) => WishItem[];
  getWishesByCategory: (category: WishItem['category']) => WishItem[];
  getWishesByPriority: (priority: WishItem['priority']) => WishItem[];
  refreshWishes: () => Promise<void>;
}

// 愿望清单过滤器类型
export interface WishlistFilter {
  status?: WishItem['status'][];
  priority?: WishItem['priority'][];
  category?: WishItem['category'][];
  assignedTo?: string;
  hasTargetDate?: boolean;
  isOverdue?: boolean;
}

// 愿望清单排序类型
export interface WishlistSort {
  field: 'createdAt' | 'updatedAt' | 'targetDate' | 'priority' | 'title';
  direction: 'asc' | 'desc';
}

// 快速导航卡片类型
export interface QuickNavItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  path: string;
  color: string;
}

// 今日纪念类型
export interface TodayAnniversary {
  type: 'relationship' | 'anniversary';
  title: string;
  date: Date;
  description?: string;
  daysFromToday: number;
  isToday: boolean;
  anniversaryType?: Anniversary['type'];
}

// 情侣档案上下文类型
export interface CoupleContextType {
  couple: Couple | null;
  partner: User | null;
  loading: boolean;
  error: string | null;
  daysTogetherCount: number;
  todayAnniversaries: TodayAnniversary[];
  createCouple: (relationshipStart: Date, anniversaryDate: Date) => Promise<void>;
  refreshCoupleData: () => Promise<void>;
}

// 认证上下文类型
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

// 用户设置类型
export interface UserSettings {
  id: string;
  userId: string;
  // 个人资料设置
  profile: {
    displayName: string;
    avatar?: string;
    bio?: string;
    birthday?: Timestamp;
    location?: string;
    phoneNumber?: string;
    socialLinks?: {
      instagram?: string;
      twitter?: string;
      facebook?: string;
    };
  };
  // 偏好设置
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'zh' | 'en';
    autoSave: boolean;
  };
  // 通知设置
  notifications: {
    pushEnabled: boolean;
    emailEnabled: boolean;
    reminderEnabled: boolean;
  };
  // 隐私设置
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    dataCollection: boolean;
  };
  // 安全设置
  security: {
    twoFactorEnabled: boolean;
    loginNotifications: boolean;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// 设置表单数据类型
export interface SettingsFormData {
  profile?: Partial<UserSettings['profile']>;
  preferences?: Partial<UserSettings['preferences']>;
  notifications?: Partial<UserSettings['notifications']>;
  privacy?: Partial<UserSettings['privacy']>;
  security?: Partial<UserSettings['security']>;
}

// 设置上下文类型
export interface SettingsContextType {
  settings: UserSettings | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  updateProfile: (data: Partial<UserSettings['profile']>) => Promise<void>;
  updatePreferences: (data: Partial<UserSettings['preferences']>) => Promise<void>;
  updateNotifications: (data: Partial<UserSettings['notifications']>) => Promise<void>;
  updatePrivacy: (data: Partial<UserSettings['privacy']>) => Promise<void>;
  updateSecurity: (data: Partial<UserSettings['security']>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  deleteAccount: () => Promise<void>;
  exportData: () => Promise<Blob>;
  refreshSettings: () => Promise<void>;
}

// 设置卡片类型
export interface SettingCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'profile' | 'preferences' | 'notifications' | 'privacy' | 'security' | 'account';
  action?: () => void;
  value?: string | boolean | number;
  type: 'toggle' | 'select' | 'input' | 'button' | 'info';
  options?: { label: string; value: string | number | boolean }[];
}

// 头像上传数据类型
export interface AvatarUploadData {
  file: File;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

// 账户统计类型
export interface AccountStats {
  totalMemories: number;
  totalPhotos: number;
  totalMessages: number;
  totalWishes: number;
  joinDate: string;
}

// 数据导出类型
export interface DataExport {
  user: User;
  couple?: Couple;
  photos: Photo[];
  messages: Message[];
  anniversaries: Anniversary[];
  wishes: WishItem[];
  settings: UserSettings;
  exportedAt: Timestamp;
  version: string;
}