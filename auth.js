// 认证管理模块
// 用于处理用户登录、登出和认证状态管理

// 认证状态管理
let currentUser = null;
let authStateListeners = [];

/**
 * 认证管理器类
 * 提供完整的用户认证功能
 */
class AuthManager {
    constructor() {
        this.isInitialized = false;
        this.auth = null;
        this.googleProvider = null;
        this.init();
    }

    /**
     * 初始化认证管理器
     * @returns {Promise<boolean>} 初始化是否成功
     */
    async init() {
        try {
            // 等待Firebase配置加载
            if (typeof FirebaseConfig === 'undefined') {
                console.warn('Firebase配置未加载，认证功能不可用');
                return false;
            }

            // 获取认证实例
            this.auth = FirebaseConfig.getAuth();
            this.googleProvider = FirebaseConfig.getGoogleProvider();

            if (!this.auth || !this.googleProvider) {
                console.error('Firebase认证服务初始化失败');
                return false;
            }

            // 监听认证状态变化
            this.auth.onAuthStateChanged((user) => {
                this.handleAuthStateChange(user);
            });

            this.isInitialized = true;
            console.log('认证管理器初始化成功');
            return true;
        } catch (error) {
            console.error('认证管理器初始化失败:', error);
            return false;
        }
    }

    /**
     * 处理认证状态变化
     * @param {firebase.User|null} user - 用户对象
     */
    handleAuthStateChange(user) {
        currentUser = user;
        
        // 通知所有监听器
        authStateListeners.forEach(listener => {
            try {
                listener(user);
            } catch (error) {
                console.error('认证状态监听器执行失败:', error);
            }
        });

        // 更新用户数据到数据库
        if (user) {
            this.updateUserData(user);
        }
    }

    /**
     * Google登录
     * @returns {Promise<Object>} 登录结果
     */
    async signInWithGoogle() {
        try {
            if (!this.isInitialized) {
                throw new Error('认证管理器未初始化');
            }

            console.log('开始Google登录流程...');
            const result = await this.auth.signInWithPopup(this.googleProvider);
            
            const user = result.user;
            console.log('Google登录成功:', user.displayName);
            
            return {
                success: true,
                user: {
                    uid: user.uid,
                    email: user.email,
                    displayName: user.displayName,
                    photoURL: user.photoURL
                },
                message: '登录成功'
            };
        } catch (error) {
            console.error('Google登录失败:', error);
            
            let errorMessage = '登录失败，请重试';
            
            // 处理特定错误
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage = '登录窗口被关闭';
                    break;
                case 'auth/popup-blocked':
                    errorMessage = '登录弹窗被阻止，请允许弹窗后重试';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = '网络连接失败，请检查网络后重试';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = '请求过于频繁，请稍后重试';
                    break;
            }
            
            return {
                success: false,
                error: error.code,
                message: errorMessage
            };
        }
    }

    /**
     * 用户登出
     * @returns {Promise<Object>} 登出结果
     */
    async signOut() {
        try {
            if (!this.isInitialized) {
                throw new Error('认证管理器未初始化');
            }

            await this.auth.signOut();
            console.log('用户登出成功');
            
            return {
                success: true,
                message: '登出成功'
            };
        } catch (error) {
            console.error('登出失败:', error);
            
            return {
                success: false,
                error: error.code,
                message: '登出失败，请重试'
            };
        }
    }

    /**
     * 获取当前用户
     * @returns {firebase.User|null} 当前用户对象
     */
    getCurrentUser() {
        return currentUser;
    }

    /**
     * 检查用户是否已登录
     * @returns {boolean} 是否已登录
     */
    isAuthenticated() {
        return currentUser !== null;
    }

    /**
     * 添加认证状态监听器
     * @param {Function} listener - 监听器函数
     * @returns {Function} 取消监听的函数
     */
    onAuthStateChanged(listener) {
        if (typeof listener !== 'function') {
            console.warn('认证状态监听器必须是函数');
            return () => {};
        }

        authStateListeners.push(listener);
        
        // 如果已有用户，立即调用监听器
        if (currentUser) {
            listener(currentUser);
        }
        
        // 返回取消监听的函数
        return () => {
            const index = authStateListeners.indexOf(listener);
            if (index > -1) {
                authStateListeners.splice(index, 1);
            }
        };
  }

  /**
   * 更新用户数据到数据库
   * @param {firebase.User} user - 用户对象
   */
  async updateUserData(user) {
    try {
      const databaseRef = FirebaseConfig.getDatabaseRef();
      if (!databaseRef) {
        console.warn('数据库未初始化，跳过用户数据更新');
        return;
      }

      const userRef = databaseRef.child(`users/${user.uid}`);
      const userData = {
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        lastLoginAt: FirebaseConfig.getServerTimestamp()
      };

      // 检查用户是否首次登录
      const snapshot = await userRef.once('value');
      if (!snapshot.exists()) {
        // 首次登录，创建完整用户数据
        userData.createdAt = FirebaseConfig.getServerTimestamp();
        
        // 同时创建用户设置
        const settingsRef = databaseRef.child(`userSettings/${user.uid}`);
        await settingsRef.set({
          preferences: {
            theme: 'dark',
            language: 'zh-CN'
          },
          notifications: true,
          updatedAt: FirebaseConfig.getServerTimestamp()
        });
        
        console.log('新用户数据创建成功');
      }

      await userRef.update(userData);
      console.log('用户数据更新成功');
    } catch (error) {
      console.error('更新用户数据失败:', error);
    }
  }

  /**
   * 等待认证状态稳定
   * @param {number} timeout - 超时时间（毫秒）
   * @returns {Promise<firebase.User|null>} 当前用户
   */
  waitForAuthState(timeout = 5000) {
    return new Promise((resolve) => {
      if (!this.isInitialized) {
        resolve(null);
        return;
      }

      const timer = setTimeout(() => {
        resolve(currentUser);
      }, timeout);

      const unsubscribe = this.auth.onAuthStateChanged((user) => {
        clearTimeout(timer);
        unsubscribe();
        resolve(user);
      });
    });
  }
}

// 创建全局认证管理器实例
const authManager = new AuthManager();

// 导出认证管理器和相关函数
window.AuthManager = {
  // 认证操作
  signInWithGoogle: () => authManager.signInWithGoogle(),
  signOut: () => authManager.signOut(),
  
  // 状态查询
  getCurrentUser: () => authManager.getCurrentUser(),
  isAuthenticated: () => authManager.isAuthenticated(),
  
  // 事件监听
  onAuthStateChanged: (listener) => authManager.onAuthStateChanged(listener),
  
  // 工具函数
  waitForAuthState: (timeout) => authManager.waitForAuthState(timeout),
  
  // 获取管理器实例（用于高级操作）
  get instance() { return authManager; }
};

// 自动初始化（如果Firebase配置已加载）
if (typeof FirebaseConfig !== 'undefined') {
  authManager.init().then(() => {
    console.log('AuthManager自动初始化完成');
  }).catch(error => {
    console.error('AuthManager自动初始化失败:', error);
  });
} else {
  // 如果Firebase配置还未加载，等待加载后再初始化
  const checkFirebaseConfig = () => {
    if (typeof FirebaseConfig !== 'undefined') {
      authManager.init().then(() => {
        console.log('AuthManager延迟初始化完成');
      }).catch(error => {
        console.error('AuthManager延迟初始化失败:', error);
      });
    } else {
      setTimeout(checkFirebaseConfig, 100);
    }
  };
  checkFirebaseConfig();
}