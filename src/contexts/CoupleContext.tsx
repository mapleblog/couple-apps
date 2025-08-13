import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { CoupleContextType, Couple, User, TodayAnniversary } from '../types';
import { useAuth } from './AuthContext';
import {
  getCoupleByUserId,
  getPartner,
  calculateDaysTogether,
  getTodayAnniversaries,
  createCouple as createCoupleService
} from '../services/coupleService';

const CoupleContext = createContext<CoupleContextType | undefined>(undefined);

interface CoupleProviderProps {
  children: ReactNode;
}

export function CoupleProvider({ children }: CoupleProviderProps) {
  const { user } = useAuth();
  const [couple, setCouple] = useState<Couple | null>(null);
  const [partner, setPartner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [daysTogetherCount, setDaysTogetherCount] = useState(0);
  const [todayAnniversaries, setTodayAnniversaries] = useState<TodayAnniversary[]>([]);

  // 加载情侣档案数据
  const loadCoupleData = async () => {
    console.log('🔍 CoupleContext: 开始加载情侣档案数据');
    console.log('👤 当前用户:', user);
    
    if (!user) {
      console.log('❌ CoupleContext: 用户未登录，停止加载');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('📡 CoupleContext: 正在获取情侣档案，userId:', user.uid);

      // 获取情侣档案
      const coupleData = await getCoupleByUserId(user.uid);
      console.log('👫 CoupleContext: 获取到的情侣档案:', coupleData);
      setCouple(coupleData);

      if (coupleData) {
        console.log('✅ CoupleContext: 情侣档案存在，ID:', coupleData.id);
        
        // 获取伴侣信息
        const partnerData = await getPartner(coupleData, user.uid);
        console.log('👥 CoupleContext: 获取到的伴侣信息:', partnerData);
        setPartner(partnerData);

        // 计算在一起天数
        const days = calculateDaysTogether(coupleData.relationshipStart);
        console.log('📅 CoupleContext: 在一起天数:', days);
        setDaysTogetherCount(days);

        // 获取今日纪念日
        const anniversaries = await getTodayAnniversaries(coupleData.id, coupleData);
        console.log('🎉 CoupleContext: 今日纪念日:', anniversaries);
        setTodayAnniversaries(anniversaries);
      } else {
        console.log('❌ CoupleContext: 未找到情侣档案');
        setPartner(null);
        setDaysTogetherCount(0);
        setTodayAnniversaries([]);
      }
    } catch (err) {
      console.error('❌ CoupleContext: 加载情侣档案数据失败:', err);
      console.error('错误详情:', {
        message: err instanceof Error ? err.message : '未知错误',
        stack: err instanceof Error ? err.stack : undefined,
        userId: user?.uid
      });
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
      console.log('🏁 CoupleContext: 数据加载完成');
    }
  };

  // 创建情侣档案
  const createCouple = async (relationshipStart: Date, anniversaryDate: Date) => {
    if (!user) {
      throw new Error('用户未登录');
    }

    try {
      setLoading(true);
      setError(null);

      const newCouple = await createCoupleService(
        user.uid,
        relationshipStart,
        anniversaryDate
      );

      setCouple(newCouple);
      
      // 计算在一起天数
      const days = calculateDaysTogether(newCouple.relationshipStart);
      setDaysTogetherCount(days);

      // 获取今日纪念日
      const anniversaries = await getTodayAnniversaries(newCouple.id, newCouple);
      setTodayAnniversaries(anniversaries);
    } catch (err) {
      console.error('创建情侣档案失败:', err);
      setError(err instanceof Error ? err.message : '创建失败');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 刷新情侣档案数据
  const refreshCoupleData = async () => {
    await loadCoupleData();
  };

  // 当用户状态改变时重新加载数据
  useEffect(() => {
    loadCoupleData();
  }, [user]);

  // 每天刷新一次纪念日数据
  useEffect(() => {
    if (couple) {
      const refreshAnniversaries = async () => {
        try {
          const anniversaries = await getTodayAnniversaries(couple.id, couple);
          setTodayAnniversaries(anniversaries);
          
          // 重新计算在一起天数
          const days = calculateDaysTogether(couple.relationshipStart);
          setDaysTogetherCount(days);
        } catch (err) {
          console.error('刷新纪念日数据失败:', err);
        }
      };

      // 立即执行一次
      refreshAnniversaries();

      // 设置每天午夜刷新
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const msUntilMidnight = tomorrow.getTime() - now.getTime();
      
      const timeoutId = setTimeout(() => {
        refreshAnniversaries();
        
        // 之后每24小时刷新一次
        const intervalId = setInterval(refreshAnniversaries, 24 * 60 * 60 * 1000);
        
        return () => clearInterval(intervalId);
      }, msUntilMidnight);

      return () => clearTimeout(timeoutId);
    }
  }, [couple]);

  const value: CoupleContextType = {
    couple,
    partner,
    loading,
    error,
    daysTogetherCount,
    todayAnniversaries,
    createCouple,
    refreshCoupleData
  };

  return (
    <CoupleContext.Provider value={value}>
      {children}
    </CoupleContext.Provider>
  );
}

export function useCouple() {
  const context = useContext(CoupleContext);
  if (context === undefined) {
    throw new Error('useCouple must be used within a CoupleProvider');
  }
  return context;
}