import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
  getDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { Anniversary, AnniversaryFormData } from '../types';

const COLLECTION_NAME = 'anniversaries';

export const anniversaryService = {
  // 获取情侣的所有纪念日
  async getAnniversaries(coupleId: string): Promise<Anniversary[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('coupleId', '==', coupleId),
        orderBy('date', 'asc')
      );
      
      const querySnapshot = await getDocs(q);
      const anniversaries: Anniversary[] = [];
      
      querySnapshot.forEach((doc) => {
        anniversaries.push({
          id: doc.id,
          ...doc.data()
        } as Anniversary);
      });
      
      return anniversaries;
    } catch (error) {
      console.error('获取纪念日失败:', error);
      throw new Error('获取纪念日失败');
    }
  },

  // 添加新纪念日
  async addAnniversary(
    coupleId: string,
    userId: string,
    data: AnniversaryFormData
  ): Promise<string> {
    try {
      const anniversaryData: Omit<Anniversary, 'id'> = {
        coupleId,
        title: data.title,
        date: Timestamp.fromDate(new Date(data.date)),
        description: data.description,
        type: data.type,
        isRecurring: data.isRecurring,
        reminderDays: data.reminderDays || 7,
        createdBy: userId,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), anniversaryData);
      return docRef.id;
    } catch (error) {
      console.error('添加纪念日失败:', error);
      throw new Error('添加纪念日失败');
    }
  },

  // 更新纪念日
  async updateAnniversary(
    anniversaryId: string,
    data: Partial<AnniversaryFormData>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, anniversaryId);
      
      const updateData: any = {
        updatedAt: Timestamp.now()
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.date !== undefined) updateData.date = Timestamp.fromDate(new Date(data.date));
      if (data.description !== undefined) updateData.description = data.description;
      if (data.type !== undefined) updateData.type = data.type;
      if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;
      if (data.reminderDays !== undefined) updateData.reminderDays = data.reminderDays;

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('更新纪念日失败:', error);
      throw new Error('更新纪念日失败');
    }
  },

  // 删除纪念日
  async deleteAnniversary(anniversaryId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, anniversaryId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('删除纪念日失败:', error);
      throw new Error('删除纪念日失败');
    }
  },

  // 获取单个纪念日
  async getAnniversary(anniversaryId: string): Promise<Anniversary | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, anniversaryId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Anniversary;
      }
      
      return null;
    } catch (error) {
      console.error('获取纪念日详情失败:', error);
      throw new Error('获取纪念日详情失败');
    }
  },

  // 获取即将到来的纪念日
  getUpcomingAnniversaries(anniversaries: Anniversary[], days: number = 30): Anniversary[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return anniversaries.filter(anniversary => {
      const anniversaryDate = anniversary.date.toDate();
      
      if (anniversary.isRecurring) {
        // 对于重复纪念日，计算今年的日期
        const thisYear = now.getFullYear();
        const thisYearDate = new Date(thisYear, anniversaryDate.getMonth(), anniversaryDate.getDate());
        
        // 如果今年的日期已过，检查明年的日期
        if (thisYearDate < now) {
          const nextYearDate = new Date(thisYear + 1, anniversaryDate.getMonth(), anniversaryDate.getDate());
          return nextYearDate <= futureDate;
        }
        
        return thisYearDate <= futureDate;
      } else {
        // 对于非重复纪念日，直接比较日期
        return anniversaryDate >= now && anniversaryDate <= futureDate;
      }
    }).sort((a, b) => {
      const dateA = this.getNextOccurrence(a);
      const dateB = this.getNextOccurrence(b);
      return dateA.getTime() - dateB.getTime();
    });
  },

  // 获取纪念日的下次发生日期
  getNextOccurrence(anniversary: Anniversary): Date {
    const now = new Date();
    const originalDate = anniversary.date.toDate();
    
    if (!anniversary.isRecurring) {
      return originalDate;
    }
    
    const thisYear = now.getFullYear();
    const thisYearDate = new Date(thisYear, originalDate.getMonth(), originalDate.getDate());
    
    if (thisYearDate >= now) {
      return thisYearDate;
    } else {
      return new Date(thisYear + 1, originalDate.getMonth(), originalDate.getDate());
    }
  },

  // 计算距离纪念日的天数
  getDaysUntilAnniversary(anniversary: Anniversary): number {
    const now = new Date();
    const nextOccurrence = this.getNextOccurrence(anniversary);
    const diffTime = nextOccurrence.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // 格式化纪念日日期显示
  formatAnniversaryDate(anniversary: Anniversary): string {
    const date = anniversary.date.toDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 获取纪念日类型的中文显示
  getAnniversaryTypeLabel(type: Anniversary['type']): string {
    const typeLabels = {
      anniversary: '纪念日',
      birthday: '生日',
      first_date: '初次约会',
      engagement: '订婚',
      wedding: '结婚',
      custom: '自定义'
    };
    return typeLabels[type] || '未知类型';
  }
};

// 导出单独的工具函数供组件使用
export const getAnniversaryTypeDisplay = (type: Anniversary['type']) => {
  const typeConfig = {
    anniversary: { label: '纪念日', color: 'text-pink-600', bgColor: 'bg-pink-100' },
    birthday: { label: '生日', color: 'text-purple-600', bgColor: 'bg-purple-100' },
    first_date: { label: '初次约会', color: 'text-rose-600', bgColor: 'bg-rose-100' },
    engagement: { label: '订婚', color: 'text-violet-600', bgColor: 'bg-violet-100' },
    wedding: { label: '结婚', color: 'text-fuchsia-600', bgColor: 'bg-fuchsia-100' },
    custom: { label: '自定义', color: 'text-indigo-600', bgColor: 'bg-indigo-100' }
  };
  return typeConfig[type] || typeConfig.custom;
};

export const getNextAnniversaryDate = (anniversary: Anniversary): Date => {
  return anniversaryService.getNextOccurrence(anniversary);
};

export const getDaysUntilAnniversary = (anniversary: Anniversary): number => {
  return anniversaryService.getDaysUntilAnniversary(anniversary);
};

export const formatDate = (timestamp: any): string => {
  if (timestamp && typeof timestamp.toDate === 'function') {
    const date = timestamp.toDate();
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  if (timestamp instanceof Date) {
    return timestamp.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }
  return '';
};