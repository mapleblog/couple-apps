import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  getDocs,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';
import { Couple, User, Anniversary, TodayAnniversary } from '../types';

// 生成邀请码
function generateInviteCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// 创建情侣档案
export async function createCouple(
  userId: string,
  relationshipStart: Date,
  anniversaryDate: Date
): Promise<Couple> {
  const coupleId = doc(collection(db, 'couples')).id;
  const inviteCode = generateInviteCode();
  
  const coupleData: Omit<Couple, 'id'> = {
    user1Id: userId,
    user2Id: '',
    relationshipStart: Timestamp.fromDate(relationshipStart),
    anniversaryDate: Timestamp.fromDate(anniversaryDate),
    status: 'pending',
    inviteCode,
    createdAt: serverTimestamp() as Timestamp,
    updatedAt: serverTimestamp() as Timestamp
  };

  await setDoc(doc(db, 'couples', coupleId), coupleData);
  
  // 更新用户的coupleId
  await updateDoc(doc(db, 'users', userId), {
    coupleId,
    updatedAt: serverTimestamp()
  });

  return { id: coupleId, ...coupleData } as Couple;
}

// 获取情侣档案
export async function getCouple(coupleId: string): Promise<Couple | null> {
  try {
    const coupleDoc = await getDoc(doc(db, 'couples', coupleId));
    if (coupleDoc.exists()) {
      return { id: coupleDoc.id, ...coupleDoc.data() } as Couple;
    }
    return null;
  } catch (error) {
    console.error('获取情侣档案失败:', error);
    return null;
  }
}

// 根据用户ID获取情侣档案
export async function getCoupleByUserId(userId: string): Promise<Couple | null> {
  try {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists() && userDoc.data().coupleId) {
      return await getCouple(userDoc.data().coupleId);
    }
    return null;
  } catch (error) {
    console.error('根据用户ID获取情侣档案失败:', error);
    return null;
  }
}

// 获取伴侣信息
export async function getPartner(couple: Couple, currentUserId: string): Promise<User | null> {
  try {
    const partnerId = couple.user1Id === currentUserId ? couple.user2Id : couple.user1Id;
    if (!partnerId) return null;
    
    const partnerDoc = await getDoc(doc(db, 'users', partnerId));
    if (partnerDoc.exists()) {
      return { id: partnerDoc.id, ...partnerDoc.data() } as unknown as User;
    }
    return null;
  } catch (error) {
    console.error('获取伴侣信息失败:', error);
    return null;
  }
}

// 计算在一起的天数
export function calculateDaysTogether(relationshipStart: Timestamp): number {
  const startDate = relationshipStart.toDate();
  const today = new Date();
  const diffTime = Math.abs(today.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

// 获取今日纪念日
export async function getTodayAnniversaries(coupleId: string, couple: Couple): Promise<TodayAnniversary[]> {
  const anniversaries: TodayAnniversary[] = [];
  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  // 检查恋爱纪念日
  const relationshipStart = couple.relationshipStart.toDate();
  if (relationshipStart.getMonth() === todayMonth && relationshipStart.getDate() === todayDate) {
    const years = today.getFullYear() - relationshipStart.getFullYear();
    anniversaries.push({
      type: 'relationship',
      title: `恋爱 ${years} 周年纪念日`,
      date: today,
      daysFromToday: 0,
      isToday: true
    });
  }

  // 检查其他纪念日
  try {
    const anniversariesQuery = query(
      collection(db, 'anniversaries'),
      where('coupleId', '==', coupleId),
      where('isRecurring', '==', true)
    );
    
    const anniversariesSnapshot = await getDocs(anniversariesQuery);
    anniversariesSnapshot.forEach((doc) => {
      const anniversary = doc.data() as Anniversary;
      const anniversaryDate = anniversary.date.toDate();
      
      if (anniversaryDate.getMonth() === todayMonth && anniversaryDate.getDate() === todayDate) {
        anniversaries.push({
          type: 'anniversary',
          title: anniversary.title,
          date: today,
          daysFromToday: 0,
          isToday: true
        });
      }
    });
  } catch (error) {
    console.error('获取纪念日失败:', error);
  }

  return anniversaries;
}

// 更新情侣档案状态
export async function updateCoupleStatus(coupleId: string, status: 'pending' | 'active'): Promise<void> {
  try {
    await updateDoc(doc(db, 'couples', coupleId), {
      status,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('更新情侣档案状态失败:', error);
    throw error;
  }
}

// 加入情侣档案（通过邀请码）
export async function joinCouple(userId: string, inviteCode: string): Promise<Couple | null> {
  try {
    const couplesQuery = query(
      collection(db, 'couples'),
      where('inviteCode', '==', inviteCode),
      where('status', '==', 'pending')
    );
    
    const couplesSnapshot = await getDocs(couplesQuery);
    if (couplesSnapshot.empty) {
      throw new Error('无效的邀请码或邀请已过期');
    }

    const coupleDoc = couplesSnapshot.docs[0];
    const coupleData = coupleDoc.data() as Couple;
    
    // 更新情侣档案
    await updateDoc(doc(db, 'couples', coupleDoc.id), {
      user2Id: userId,
      status: 'active',
      updatedAt: serverTimestamp()
    });
    
    // 更新用户的coupleId和partnerId
    await updateDoc(doc(db, 'users', userId), {
      coupleId: coupleDoc.id,
      partnerId: coupleData.user1Id,
      updatedAt: serverTimestamp()
    });
    
    // 更新第一个用户的partnerId
    await updateDoc(doc(db, 'users', coupleData.user1Id), {
      partnerId: userId,
      updatedAt: serverTimestamp()
    });

    return { id: coupleDoc.id, ...coupleData, user2Id: userId, status: 'active' } as Couple;
  } catch (error) {
    console.error('加入情侣档案失败:', error);
    throw error;
  }
}