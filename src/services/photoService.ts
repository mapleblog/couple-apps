import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from './firebase';
import { Photo, PhotoUploadData } from '../types';

const PHOTOS_COLLECTION = 'photos';
const STORAGE_PATH = 'photos';

// 生成缩略图URL（这里使用简单的URL参数，实际项目中可能需要更复杂的缩略图生成）
const generateThumbnailUrl = (originalUrl: string): string => {
  // 简单的缩略图实现，实际项目中可能需要使用图片处理服务
  return originalUrl + '?w=300&h=300&fit=crop';
};

// 压缩图片
const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    
    img.onload = () => {
      // 计算新的尺寸
      let { width, height } = img;
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      canvas.width = width;
      canvas.height = height;
      
      // 绘制压缩后的图片
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now()
            });
            resolve(compressedFile);
          } else {
            resolve(file);
          }
        },
        file.type,
        quality
      );
    };
    
    img.src = URL.createObjectURL(file);
  });
};

// 上传照片
export const uploadPhoto = async (
  coupleId: string,
  userId: string,
  data: PhotoUploadData
): Promise<Photo> => {
  try {
    // 压缩图片
    const compressedFile = await compressImage(data.file);
    
    // 生成唯一文件名
    const timestamp = Date.now();
    const fileName = `${timestamp}_${data.file.name}`;
    const filePath = `${STORAGE_PATH}/${coupleId}/${fileName}`;
    
    // 上传到 Firebase Storage
    const storageRef = ref(storage, filePath);
    const uploadResult = await uploadBytes(storageRef, compressedFile);
    
    // 获取下载URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    const thumbnailUrl = generateThumbnailUrl(downloadURL);
    
    // 创建照片文档数据
    const photoData = {
      coupleId,
      url: downloadURL,
      thumbnailUrl,
      fileName: data.file.name,
      fileSize: compressedFile.size,
      mimeType: data.file.type,
      caption: data.caption || '',
      uploadedBy: userId,
      uploadedAt: Timestamp.now(),
      tags: data.tags || []
    };
    
    // 保存到 Firestore
    const docRef = await addDoc(collection(db, PHOTOS_COLLECTION), photoData);
    
    return {
      id: docRef.id,
      ...photoData
    } as Photo;
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw new Error('照片上传失败，请重试');
  }
};

// 获取情侣的所有照片
export const getCouplePhotos = async (coupleId: string): Promise<Photo[]> => {
  try {
    const q = query(
      collection(db, PHOTOS_COLLECTION),
      where('coupleId', '==', coupleId),
      orderBy('uploadedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const photos: Photo[] = [];
    
    querySnapshot.forEach((doc) => {
      photos.push({
        id: doc.id,
        ...doc.data()
      } as Photo);
    });
    
    return photos;
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw new Error('获取照片失败，请重试');
  }
};

// 删除照片
export const deletePhoto = async (photoId: string, photoUrl: string): Promise<void> => {
  try {
    // 从 Storage 删除文件
    const storageRef = ref(storage, photoUrl);
    await deleteObject(storageRef);
    
    // 从 Firestore 删除文档
    await deleteDoc(doc(db, PHOTOS_COLLECTION, photoId));
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw new Error('删除照片失败，请重试');
  }
};

// 更新照片信息
export const updatePhoto = async (
  photoId: string,
  updates: Partial<Pick<Photo, 'caption' | 'tags'>>
): Promise<void> => {
  try {
    const photoRef = doc(db, PHOTOS_COLLECTION, photoId);
    await updateDoc(photoRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating photo:', error);
    throw new Error('更新照片信息失败，请重试');
  }
};

// 验证文件类型
export const validateImageFile = (file: File): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('只支持 JPEG、PNG 和 WebP 格式的图片');
  }
  
  if (file.size > maxSize) {
    throw new Error('图片大小不能超过 10MB');
  }
  
  return true;
};