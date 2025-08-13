import { initializeApp } from 'firebase/app';
import { getStorage, ref, listAll } from 'firebase/storage';

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
const storage = getStorage(app);

async function listStorageFiles() {
  try {
    console.log('检查Storage根目录...');
    const rootRef = ref(storage);
    const rootList = await listAll(rootRef);
    
    console.log('根目录文件数量:', rootList.items.length);
    console.log('根目录子文件夹数量:', rootList.prefixes.length);
    
    if (rootList.prefixes.length > 0) {
      console.log('\n子文件夹:');
      rootList.prefixes.forEach(prefix => {
        console.log('- ', prefix.fullPath);
      });
    }
    
    if (rootList.items.length > 0) {
      console.log('\n根目录文件:');
      rootList.items.forEach(item => {
        console.log('- ', item.fullPath);
      });
    }
    
    // 检查photos文件夹
    console.log('\n检查photos文件夹...');
    const photosRef = ref(storage, 'photos');
    try {
      const photosList = await listAll(photosRef);
      console.log('photos文件夹文件数量:', photosList.items.length);
      
      if (photosList.items.length > 0) {
        console.log('\nphotos文件夹中的文件:');
        photosList.items.forEach(item => {
          console.log('- ', item.fullPath);
        });
      }
    } catch (error) {
      console.log('photos文件夹不存在或无法访问:', error.message);
    }
    
    // 检查couples文件夹
    console.log('\n检查couples文件夹...');
    const couplesRef = ref(storage, 'couples');
    try {
      const couplesList = await listAll(couplesRef);
      console.log('couples文件夹子文件夹数量:', couplesList.prefixes.length);
      console.log('couples文件夹文件数量:', couplesList.items.length);
      
      if (couplesList.prefixes.length > 0) {
        console.log('\ncouples文件夹中的子文件夹:');
        for (const prefix of couplesList.prefixes) {
          console.log('- ', prefix.fullPath);
          
          // 检查每个coupleId文件夹下的photos
          try {
            const couplePhotosRef = ref(storage, `${prefix.fullPath}/photos`);
            const couplePhotosList = await listAll(couplePhotosRef);
            console.log(`  ${prefix.fullPath}/photos 文件数量:`, couplePhotosList.items.length);
            
            if (couplePhotosList.items.length > 0) {
              console.log(`  ${prefix.fullPath}/photos 中的文件:`);
              couplePhotosList.items.forEach(item => {
                console.log('    - ', item.fullPath);
              });
            }
          } catch (error) {
            console.log(`  ${prefix.fullPath}/photos 不存在或无法访问:`, error.message);
          }
        }
      }
    } catch (error) {
      console.log('couples文件夹不存在或无法访问:', error.message);
    }
    
  } catch (error) {
    console.error('检查Storage失败:', error);
  }
}

listStorageFiles();