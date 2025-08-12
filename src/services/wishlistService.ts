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
import { WishItem, WishFormData, WishlistFilter, WishlistSort } from '../types';

const COLLECTION_NAME = 'wishlist';

export const wishlistService = {
  // 获取情侣的所有愿望
  async getWishes(coupleId: string): Promise<WishItem[]> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME),
        where('coupleId', '==', coupleId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const wishes: WishItem[] = [];
      
      querySnapshot.forEach((doc) => {
        wishes.push({
          id: doc.id,
          ...doc.data()
        } as WishItem);
      });
      
      return wishes;
    } catch (error) {
      console.error('获取愿望清单失败:', error);
      throw new Error('获取愿望清单失败');
    }
  },

  // 添加新愿望
  async addWish(
    coupleId: string,
    userId: string,
    data: WishFormData
  ): Promise<string> {
    try {
      const wishData: Omit<WishItem, 'id'> = {
        coupleId,
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: 'pending',
        category: data.category,
        targetDate: data.targetDate ? Timestamp.fromDate(new Date(data.targetDate)) : undefined,
        estimatedCost: data.estimatedCost,
        currency: data.currency || 'CNY',
        tags: data.tags,
        isShared: data.isShared,
        createdBy: userId,
        assignedTo: data.assignedTo,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      };

      const docRef = await addDoc(collection(db, COLLECTION_NAME), wishData);
      return docRef.id;
    } catch (error) {
      console.error('添加愿望失败:', error);
      throw new Error('添加愿望失败');
    }
  },

  // 更新愿望
  async updateWish(
    wishId: string,
    data: Partial<WishFormData>
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, wishId);
      
      const updateData: any = {
        updatedAt: Timestamp.now()
      };

      if (data.title !== undefined) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.category !== undefined) updateData.category = data.category;
      if (data.targetDate !== undefined) {
        updateData.targetDate = data.targetDate ? Timestamp.fromDate(new Date(data.targetDate)) : null;
      }
      if (data.estimatedCost !== undefined) updateData.estimatedCost = data.estimatedCost;
      if (data.currency !== undefined) updateData.currency = data.currency;
      if (data.tags !== undefined) updateData.tags = data.tags;
      if (data.isShared !== undefined) updateData.isShared = data.isShared;
      if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo;

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('更新愿望失败:', error);
      throw new Error('更新愿望失败');
    }
  },

  // 切换愿望状态
  async toggleWishStatus(
    wishId: string,
    status: WishItem['status'],
    userId?: string,
    notes?: string
  ): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, wishId);
      
      const updateData: any = {
        status,
        updatedAt: Timestamp.now()
      };

      if (status === 'completed') {
        updateData.completedAt = Timestamp.now();
        if (userId) updateData.completedBy = userId;
        if (notes) updateData.notes = notes;
      } else {
        updateData.completedAt = null;
        updateData.completedBy = null;
        updateData.notes = null;
      }

      await updateDoc(docRef, updateData);
    } catch (error) {
      console.error('更新愿望状态失败:', error);
      throw new Error('更新愿望状态失败');
    }
  },

  // 完成愿望
  async completeWish(
    wishId: string,
    userId: string,
    notes?: string
  ): Promise<void> {
    return this.toggleWishStatus(wishId, 'completed', userId, notes);
  },

  // 切换愿望完成状态
  async toggleWishComplete(
    wishId: string,
    userId: string
  ): Promise<void> {
    try {
      // 先获取当前愿望状态
      const wish = await this.getWish(wishId);
      if (!wish) {
        throw new Error('愿望不存在');
      }

      // 切换状态
      const newStatus = wish.status === 'completed' ? 'pending' : 'completed';
      await this.toggleWishStatus(wishId, newStatus, userId);
    } catch (error) {
      console.error('切换愿望状态失败:', error);
      throw new Error('切换愿望状态失败');
    }
  },

  // 删除愿望
  async deleteWish(wishId: string): Promise<void> {
    try {
      const docRef = doc(db, COLLECTION_NAME, wishId);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('删除愿望失败:', error);
      throw new Error('删除愿望失败');
    }
  },

  // 获取单个愿望
  async getWish(wishId: string): Promise<WishItem | null> {
    try {
      const docRef = doc(db, COLLECTION_NAME, wishId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as WishItem;
      }
      
      return null;
    } catch (error) {
      console.error('获取愿望详情失败:', error);
      throw new Error('获取愿望详情失败');
    }
  },

  // 按状态过滤愿望
  getWishesByStatus(wishes: WishItem[], status: WishItem['status']): WishItem[] {
    return wishes.filter(wish => wish.status === status);
  },

  // 按分类过滤愿望
  getWishesByCategory(wishes: WishItem[], category: WishItem['category']): WishItem[] {
    return wishes.filter(wish => wish.category === category);
  },

  // 按优先级过滤愿望
  getWishesByPriority(wishes: WishItem[], priority: WishItem['priority']): WishItem[] {
    return wishes.filter(wish => wish.priority === priority);
  },

  // 获取即将到期的愿望
  getUpcomingWishes(wishes: WishItem[], days: number = 30): WishItem[] {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return wishes.filter(wish => {
      if (!wish.targetDate || wish.status === 'completed') return false;
      const targetDate = wish.targetDate.toDate();
      return targetDate >= now && targetDate <= futureDate;
    }).sort((a, b) => {
      const dateA = a.targetDate!.toDate();
      const dateB = b.targetDate!.toDate();
      return dateA.getTime() - dateB.getTime();
    });
  },

  // 获取过期的愿望
  getOverdueWishes(wishes: WishItem[]): WishItem[] {
    const now = new Date();
    return wishes.filter(wish => {
      if (!wish.targetDate || wish.status === 'completed') return false;
      return wish.targetDate.toDate() < now;
    });
  },

  // 过滤愿望
  filterWishes(wishes: WishItem[], filter: WishlistFilter): WishItem[] {
    let filteredWishes = [...wishes];

    if (filter.status && filter.status.length > 0) {
      filteredWishes = filteredWishes.filter(wish => filter.status!.includes(wish.status));
    }

    if (filter.priority && filter.priority.length > 0) {
      filteredWishes = filteredWishes.filter(wish => filter.priority!.includes(wish.priority));
    }

    if (filter.category && filter.category.length > 0) {
      filteredWishes = filteredWishes.filter(wish => filter.category!.includes(wish.category));
    }

    if (filter.assignedTo) {
      filteredWishes = filteredWishes.filter(wish => wish.assignedTo === filter.assignedTo);
    }

    if (filter.hasTargetDate !== undefined) {
      filteredWishes = filteredWishes.filter(wish => 
        filter.hasTargetDate ? !!wish.targetDate : !wish.targetDate
      );
    }

    if (filter.isOverdue) {
      const now = new Date();
      filteredWishes = filteredWishes.filter(wish => {
        if (!wish.targetDate || wish.status === 'completed') return false;
        return wish.targetDate.toDate() < now;
      });
    }

    return filteredWishes;
  },

  // 排序愿望
  sortWishes(wishes: WishItem[], sort: WishlistSort): WishItem[] {
    return [...wishes].sort((a, b) => {
      let valueA: any;
      let valueB: any;

      switch (sort.field) {
        case 'createdAt':
          valueA = a.createdAt.toDate();
          valueB = b.createdAt.toDate();
          break;
        case 'updatedAt':
          valueA = a.updatedAt.toDate();
          valueB = b.updatedAt.toDate();
          break;
        case 'targetDate':
          valueA = a.targetDate?.toDate() || new Date(0);
          valueB = b.targetDate?.toDate() || new Date(0);
          break;
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
          valueA = priorityOrder[a.priority];
          valueB = priorityOrder[b.priority];
          break;
        case 'title':
          valueA = a.title.toLowerCase();
          valueB = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (valueA < valueB) {
        return sort.direction === 'asc' ? -1 : 1;
      }
      if (valueA > valueB) {
        return sort.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  },

  // 获取愿望统计信息
  getWishlistStats(wishes: WishItem[]) {
    const total = wishes.length;
    const completed = wishes.filter(w => w.status === 'completed').length;
    const inProgress = wishes.filter(w => w.status === 'in-progress').length;
    const pending = wishes.filter(w => w.status === 'pending').length;
    const highPriority = wishes.filter(w => w.priority === 'high').length;
    const overdue = this.getOverdueWishes(wishes).length;
    const upcoming = this.getUpcomingWishes(wishes, 7).length;

    const totalCost = wishes
      .filter(w => w.estimatedCost && w.status !== 'completed')
      .reduce((sum, w) => sum + (w.estimatedCost || 0), 0);

    return {
      total,
      completed,
      inProgress,
      pending,
      highPriority,
      overdue,
      upcoming,
      totalCost,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  },

  // 格式化愿望日期显示
  formatWishDate(wish: WishItem): string | null {
    if (!wish.targetDate) return null;
    const date = wish.targetDate.toDate();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  // 获取愿望分类的中文显示
  getCategoryLabel(category: WishItem['category']): string {
    const labels = {
      'travel': '旅行',
      'experience': '体验',
      'gift': '礼物',
      'achievement': '成就',
      'date': '约会',
      'other': '其他'
    };
    return labels[category] || category;
  },

  // 获取愿望优先级的中文显示
  getPriorityLabel(priority: WishItem['priority']): string {
    const labels = {
      'high': '高',
      'medium': '中',
      'low': '低'
    };
    return labels[priority] || priority;
  },

  // 获取愿望状态的中文显示
  getStatusLabel(status: WishItem['status']): string {
    const labels = {
      'pending': '待开始',
      'in-progress': '进行中',
      'completed': '已完成'
    };
    return labels[status] || status;
  },

  // 格式化日期
  formatDate(date: Date): string {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  },

  // 获取分类显示文本
  getCategoryDisplay(category: WishItem['category']): string {
    const labels = {
      travel: '旅行',
      experience: '体验',
      gift: '礼物',
      achievement: '成就',
      date: '约会',
      other: '其他'
    };
    return labels[category] || category;
  },

  // 获取优先级显示文本
  getPriorityDisplay(priority: WishItem['priority']): string {
    const labels = {
      low: '低优先级',
      medium: '中优先级',
      high: '高优先级'
    };
    return labels[priority] || priority;
  }
};