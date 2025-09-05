// Firebase配置文件
// 用于初始化Firebase应用和Realtime Database

// Firebase配置对象 - 请替换为您的Firebase项目配置
const firebaseConfig = {
  apiKey: "AIzaSyBGa6tfCp0bx8ANui4cLsyF7KXkwYB__vI",
  authDomain: "couple-apps-8b5cb.firebaseapp.com",
  databaseURL: "https://couple-apps-8b5cb-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "couple-apps-8b5cb",
  storageBucket: "couple-apps-8b5cb.firebasestorage.app",
  messagingSenderId: "437484542048",
  appId: "1:437484542048:web:f71b4c11194dea97c74b05"
};

// Firebase应用实例
let app = null;
let database = null;
let auth = null;
let googleProvider = null;

/**
 * 初始化Firebase应用
 * @returns {Promise<boolean>} 初始化是否成功
 */
async function initializeFirebase() {
  try {
    // 检查Firebase SDK是否已加载
    if (typeof firebase === 'undefined') {
      console.warn('Firebase SDK未加载，将使用本地存储模式');
      return false;
    }

    // 初始化Firebase应用
    if (!app) {
      app = firebase.initializeApp(firebaseConfig);
      console.log('Firebase应用初始化成功');
    }

    // 初始化Realtime Database
    if (!database) {
      database = firebase.database();
      
      // 启用离线持久化
      database.goOffline();
      database.goOnline();
      
      console.log('Firebase Realtime Database初始化成功');
    }

    // 初始化Firebase Authentication
    if (!auth) {
      auth = firebase.auth();
      console.log('Firebase Authentication初始化成功');
    }

    // 初始化Google认证提供商
    if (!googleProvider) {
      googleProvider = new firebase.auth.GoogleAuthProvider();
      // 设置认证范围
      googleProvider.addScope('profile');
      googleProvider.addScope('email');
      console.log('Google认证提供商初始化成功');
    }

    return true;
  } catch (error) {
    console.error('Firebase初始化失败:', error);
    return false;
  }
}

/**
 * 获取数据库引用
 * @param {string} path - 数据库路径
 * @returns {firebase.database.Reference|null} 数据库引用
 */
function getDatabaseRef(path = '') {
  if (!database) {
    console.warn('数据库未初始化');
    return null;
  }
  
  // 处理空路径和根路径
  if (path === '' || path === '/') {
    return database.ref();
  }
  
  // 确保路径格式正确
  const cleanPath = path.replace(/^\/+/, '').replace(/\/+$/, '');
  return database.ref(cleanPath);
}

/**
 * 检查Firebase连接状态
 * @returns {Promise<boolean>} 是否已连接
 */
function checkFirebaseConnection() {
  return new Promise((resolve) => {
    if (!database) {
      resolve(false);
      return;
    }

    const connectedRef = database.ref('.info/connected');
    connectedRef.once('value', (snapshot) => {
      resolve(snapshot.val() === true);
    });
  });
}

/**
 * 获取服务器时间戳
 * @returns {Object} Firebase服务器时间戳
 */
function getServerTimestamp() {
  return firebase.database.ServerValue.TIMESTAMP;
}

/**
 * 获取认证实例
 * @returns {firebase.auth.Auth|null} 认证实例
 */
function getAuth() {
  if (!auth) {
    console.warn('认证服务未初始化');
    return null;
  }
  return auth;
}

/**
 * 获取Google认证提供商
 * @returns {firebase.auth.GoogleAuthProvider|null} Google认证提供商
 */
function getGoogleProvider() {
  if (!googleProvider) {
    console.warn('Google认证提供商未初始化');
    return null;
  }
  return googleProvider;
}

// 导出配置和函数
window.FirebaseConfig = {
  config: firebaseConfig,
  initialize: initializeFirebase,
  getDatabaseRef: getDatabaseRef,
  checkConnection: checkFirebaseConnection,
  getServerTimestamp: getServerTimestamp,
  getAuth: getAuth,
  getGoogleProvider: getGoogleProvider,
  
  // 获取应用和数据库实例
  get app() { return app; },
  get database() { return database; },
  get auth() { return auth; },
  get googleProvider() { return googleProvider; }
};

// 自动初始化（如果Firebase SDK已加载）
if (typeof firebase !== 'undefined') {
  initializeFirebase();
}