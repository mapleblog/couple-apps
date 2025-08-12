import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';
import { User } from '../types';

/**
 * 创建或更新用户文档
 * @param firebaseUser Firebase用户对象
 * @returns 完整的用户数据
 */
export const createOrUpdateUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  const userDocRef = doc(db, 'users', firebaseUser.uid);
  const userDoc = await getDoc(userDocRef);
  
  if (!userDoc.exists()) {
    // 创建新用户
    const newUser: Omit<User, 'uid'> = {
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(userDocRef, newUser);
    
    return {
      uid: firebaseUser.uid,
      ...newUser
    } as User;
  } else {
    // 更新现有用户的基本信息
    const updateData = {
      email: firebaseUser.email || '',
      displayName: firebaseUser.displayName || '',
      photoURL: firebaseUser.photoURL || '',
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(userDocRef, updateData);
    
    // 返回更新后的用户数据
    const updatedDoc = await getDoc(userDocRef);
    const userData = updatedDoc.data() as Omit<User, 'uid'>;
    
    return {
      uid: firebaseUser.uid,
      ...userData
    };
  }
};

/**
 * 获取用户数据
 * @param uid 用户ID
 * @returns 用户数据或null
 */
export const getUserData = async (uid: string): Promise<User | null> => {
  try {
    const userDocRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userDocRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data() as Omit<User, 'uid'>;
      return {
        uid,
        ...userData
      };
    }
    
    return null;
  } catch (error) {
    console.error('获取用户数据失败:', error);
    return null;
  }
};

/**
 * 更新用户档案信息
 * @param uid 用户ID
 * @param updates 要更新的字段
 */
export const updateUserProfile = async (uid: string, updates: Partial<Omit<User, 'uid' | 'createdAt'>>) => {
  try {
    const userDocRef = doc(db, 'users', uid);
    await updateDoc(userDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error('更新用户档案失败:', error);
    throw error;
  }
};

/**
 * 检查用户是否有情侣档案
 * @param uid 用户ID
 * @returns 是否有情侣档案
 */
export const hasCouple = async (uid: string): Promise<boolean> => {
  try {
    const userData = await getUserData(uid);
    return !!(userData?.coupleId && userData?.partnerId);
  } catch (error) {
    console.error('检查情侣档案失败:', error);
    return false;
  }
};

/**
 * 验证用户邮箱格式
 * @param email 邮箱地址
 * @returns 是否有效
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 生成用户显示名称
 * @param user Firebase用户对象
 * @returns 显示名称
 */
export const generateDisplayName = (user: FirebaseUser): string => {
  if (user.displayName) {
    return user.displayName;
  }
  
  if (user.email) {
    return user.email.split('@')[0];
  }
  
  return '用户';
};