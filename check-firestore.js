import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

// Firebase配置
const firebaseConfig = {
  apiKey: "AIzaSyBGa6tfCp0bx8ANui4cLsyF7KXkwYB__vI",
  authDomain: "couple-apps-8b5cb.firebaseapp.com",
  projectId: "couple-apps-8b5cb",
  storageBucket: "couple-apps-8b5cb.firebasestorage.app",
  messagingSenderId: "437484542048",
  appId: "1:437484542048:web:f71b4c11194dea97c74b05"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkFirestorePhotos() {
  try {
    console.log('检查Firestore中的photos集合...');
    const photosRef = collection(db, 'photos');
    const querySnapshot = await getDocs(photosRef);
    
    console.log('photos集合文档数量:', querySnapshot.size);
    
    if (querySnapshot.size > 0) {
      console.log('\nphotos集合中的文档:');
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('\n文档ID:', doc.id);
        console.log('- coupleId:', data.coupleId);
        console.log('- fileName:', data.fileName);
        console.log('- url:', data.url);
        console.log('- uploadedBy:', data.uploadedBy);
        console.log('- uploadedAt:', data.uploadedAt?.toDate?.() || data.uploadedAt);
      });
    } else {
      console.log('photos集合为空');
    }
    
  } catch (error) {
    console.error('检查Firestore失败:', error);
  }
}

checkFirestorePhotos();