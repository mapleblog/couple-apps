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
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 获取情侣档案
      const coupleData = await getCoupleByUserId(user.uid);
      setCouple(coupleData);

      if (coupleData) {
        // 获取伴侣信息
        const partnerData = await getPartner(coupleData, user.uid);
        setPartner(partnerData);

        // 计算在一起天数
        const days = calculateDaysTogether(coupleData.relationshipStart);
        setDaysTogetherCount(days);

        // 获取今日纪念日
        const anniversaries = await getTodayAnniversaries(coupleData.id, coupleData);
        setTodayAnniversaries(anniversaries);
      } else {
        setPartner(null);
        setDaysTogetherCount(0);
        setTodayAnniversaries([]);
      }
    } catch (err) {
      console.error('加载情侣档案数据失败:', err);
      setError(err instanceof Error ? err.message : '加载数据失败');
    } finally {
      setLoading(false);
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