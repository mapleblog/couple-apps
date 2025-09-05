// 认证守卫模块
// 用于页面访问权限控制和路由保护

/**
 * 认证守卫类
 * 提供页面访问权限控制功能
 */
class AuthGuard {
    constructor() {
        this.isInitialized = false;
        this.protectedPages = ['index.html', '/'];
        this.publicPages = ['loginpange.html'];
        this.currentPage = this.getCurrentPageName();
        this.init();
    }

    /**
     * 初始化认证守卫
     */
    async init() {
        try {
            // 等待认证管理器加载
            await this.waitForAuthManager();
            
            if (!window.AuthManager || typeof window.AuthManager.onAuthStateChanged !== 'function') {
                throw new Error('认证管理器未正确加载');
            }

            // 监听认证状态变化
            this.unsubscribeAuth = window.AuthManager.onAuthStateChanged(this.handleAuthStateChange.bind(this));

            // 等待认证状态稳定
            const user = await window.AuthManager.waitForAuthState(3000);
            this.checkPageAccess(user);

            this.isInitialized = true;
            console.log('认证守卫初始化成功');
            return true;
        } catch (error) {
            console.error('认证守卫初始化失败:', error);
            return false;
        }
    }

    /**
     * 等待认证管理器加载完成
     */
    async waitForAuthManager(maxAttempts = 10) {
        for (let i = 0; i < maxAttempts; i++) {
            if (window.AuthManager && typeof window.AuthManager.onAuthStateChanged === 'function') {
                console.log('认证管理器加载完成');
                return true;
            }
            
            console.log(`等待认证管理器加载... (${i + 1}/${maxAttempts})`);
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error('认证管理器加载超时');
    }

    /**
     * 获取当前页面名称
     * @returns {string} 页面名称
     */
    getCurrentPageName() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();
        
        // 处理根路径
        if (!filename || filename === '') {
            return 'index.html';
        }
        
        return filename;
    }

    /**
     * 检查页面是否需要认证
     * @param {string} pageName - 页面名称
     * @returns {boolean} 是否需要认证
     */
    isProtectedPage(pageName = this.currentPage) {
        return this.protectedPages.some(page => {
            if (page === '/') {
                return pageName === 'index.html' || pageName === '';
            }
            return pageName === page;
        });
    }

    /**
     * 检查页面是否为公开页面
     * @param {string} pageName - 页面名称
     * @returns {boolean} 是否为公开页面
     */
    isPublicPage(pageName = this.currentPage) {
        return this.publicPages.includes(pageName);
    }

    /**
     * 处理认证状态变化
     * @param {firebase.User|null} user - 用户对象
     */
    handleAuthStateChange(user) {
        console.log('认证状态变化:', user ? '已登录' : '未登录');
        this.checkPageAccess(user);
    }

    /**
     * 检查页面访问权限
     * @param {firebase.User|null} user - 用户对象
     */
    checkPageAccess(user) {
        const isAuthenticated = user !== null;
        const currentPage = this.getCurrentPageName();
        
        console.log(`页面访问检查: ${currentPage}, 认证状态: ${isAuthenticated}`);

        // 如果用户已登录且在登录页面，跳转到主页
        if (isAuthenticated && this.isPublicPage(currentPage)) {
            console.log('用户已登录，跳转到主页');
            this.redirectToMainPage();
            return;
        }

        // 如果用户未登录且访问受保护页面，跳转到登录页
        if (!isAuthenticated && this.isProtectedPage(currentPage)) {
            console.log('用户未登录，跳转到登录页');
            this.redirectToLoginPage();
            return;
        }

        console.log('页面访问权限检查通过');
    }

    /**
     * 跳转到登录页面
     * @param {string} returnUrl - 登录后返回的URL
     */
    redirectToLoginPage(returnUrl = null) {
        try {
            // 保存当前页面用于登录后跳转
            if (returnUrl) {
                sessionStorage.setItem('auth_return_url', returnUrl);
            } else if (this.isProtectedPage()) {
                sessionStorage.setItem('auth_return_url', window.location.href);
            }

            // 显示跳转提示
            this.showRedirectMessage('正在跳转到登录页面...');

            // 延迟跳转，让用户看到提示
            setTimeout(() => {
                window.location.href = 'loginpange.html';
            }, 1000);
        } catch (error) {
            console.error('跳转到登录页面失败:', error);
            // 直接跳转
            window.location.href = 'loginpange.html';
        }
    }

    /**
     * 跳转到主页面
     */
    redirectToMainPage() {
        try {
            // 检查是否有返回URL
            const returnUrl = sessionStorage.getItem('auth_return_url');
            sessionStorage.removeItem('auth_return_url');

            // 显示跳转提示
            this.showRedirectMessage('登录成功，正在跳转...');

            // 延迟跳转
            setTimeout(() => {
                if (returnUrl && returnUrl !== window.location.href) {
                    window.location.href = returnUrl;
                } else {
                    window.location.href = 'index.html';
                }
            }, 1000);
        } catch (error) {
            console.error('跳转到主页面失败:', error);
            // 直接跳转
            window.location.href = 'index.html';
        }
    }

    /**
     * 显示跳转提示消息
     * @param {string} message - 提示消息
     */
    showRedirectMessage(message) {
        try {
            // 创建提示元素
            const messageDiv = document.createElement('div');
            messageDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px 40px;
                border-radius: 10px;
                font-size: 16px;
                z-index: 10000;
                text-align: center;
            `;
            messageDiv.textContent = message;

            // 添加到页面
            document.body.appendChild(messageDiv);

            // 3秒后自动移除
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 3000);
        } catch (error) {
            console.error('显示跳转提示失败:', error);
        }
    }

  /**
   * 手动检查当前页面访问权限
   */
  checkCurrentPageAccess() {
    const user = window.AuthManager ? window.AuthManager.getCurrentUser() : null;
    this.checkPageAccess(user);
  }

  /**
   * 添加受保护页面
   * @param {string|Array} pages - 页面名称或页面数组
   */
  addProtectedPages(pages) {
    const pageArray = Array.isArray(pages) ? pages : [pages];
    this.protectedPages.push(...pageArray);
    console.log('已添加受保护页面:', pageArray);
  }

  /**
   * 添加公开页面
   * @param {string|Array} pages - 页面名称或页面数组
   */
  addPublicPages(pages) {
    const pageArray = Array.isArray(pages) ? pages : [pages];
    this.publicPages.push(...pageArray);
    console.log('已添加公开页面:', pageArray);
  }

  /**
   * 获取守卫状态
   * @returns {Object} 守卫状态信息
   */
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      currentPage: this.currentPage,
      protectedPages: this.protectedPages,
      publicPages: this.publicPages,
      isAuthenticated: window.AuthManager ? window.AuthManager.isAuthenticated() : false
    };
  }
}

// 创建全局认证守卫实例
const authGuard = new AuthGuard();

// 导出认证守卫和相关函数
window.AuthGuard = {
  // 权限检查
  checkCurrentPageAccess: () => authGuard.checkCurrentPageAccess(),
  isProtectedPage: (pageName) => authGuard.isProtectedPage(pageName),
  isPublicPage: (pageName) => authGuard.isPublicPage(pageName),
  
  // 页面跳转
  redirectToLoginPage: (returnUrl) => authGuard.redirectToLoginPage(returnUrl),
  redirectToMainPage: () => authGuard.redirectToMainPage(),
  
  // 配置管理
  addProtectedPages: (pages) => authGuard.addProtectedPages(pages),
  addPublicPages: (pages) => authGuard.addPublicPages(pages),
  
  // 状态查询
  getStatus: () => authGuard.getStatus(),
  
  // 获取守卫实例（用于高级操作）
  get instance() { return authGuard; }
};

// 页面加载完成后自动初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    authGuard.init();
  });
} else {
  // 如果页面已加载完成，立即初始化
  authGuard.init();
}