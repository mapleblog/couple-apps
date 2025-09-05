// Firebase数据库操作模块
// 提供留言数据的增删改查和实时监听功能

class FirebaseDB {
  constructor() {
    this.dbRef = null;
    this.notesRef = null;
    this.isConnected = false;
    this.listeners = new Map();
    this.retryCount = 0;
    this.maxRetries = 3;
    
    // 初始化数据库连接
    this.initialize();
  }

  /**
   * 初始化Firebase数据库连接
   */
  async initialize() {
    try {
      // 等待Firebase配置初始化
      if (typeof FirebaseConfig === 'undefined') {
        console.warn('Firebase配置未加载，延迟初始化');
        setTimeout(() => this.initialize(), 1000);
        return;
      }

      const initialized = await FirebaseConfig.initialize();
      if (!initialized) {
        console.warn('Firebase初始化失败，使用离线模式');
        return;
      }

      this.dbRef = FirebaseConfig.getDatabaseRef();
      this.notesRef = FirebaseConfig.getDatabaseRef('loveNotes');
      
      // 检查连接状态
      this.isConnected = await FirebaseConfig.checkConnection();
      console.log('Firebase数据库连接状态:', this.isConnected ? '已连接' : '离线');
      
      // 监听连接状态变化
      this.setupConnectionListener();
      
    } catch (error) {
      console.error('Firebase数据库初始化失败:', error);
    }
  }

  /**
   * 设置连接状态监听器
   */
  setupConnectionListener() {
    if (!this.dbRef) return;
    
    const connectedRef = FirebaseConfig.getDatabaseRef('.info/connected');
    connectedRef.on('value', (snapshot) => {
      this.isConnected = snapshot.val() === true;
      console.log('Firebase连接状态变化:', this.isConnected ? '已连接' : '离线');
      
      // 触发连接状态变化事件
      this.notifyConnectionChange(this.isConnected);
    });
  }

  /**
   * 通知连接状态变化
   * @param {boolean} connected - 连接状态
   */
  notifyConnectionChange(connected) {
    const event = new CustomEvent('firebaseConnectionChange', {
      detail: { connected }
    });
    window.dispatchEvent(event);
  }

  /**
   * 添加新留言
   * @param {Object} noteData - 留言数据
   * @returns {Promise<string|null>} 留言ID或null
   */
  async addNote(noteData) {
    try {
      if (!this.notesRef) {
        throw new Error('数据库未初始化');
      }
      
      if (!this.isConnected) {
        console.warn('数据库离线，尝试重新连接...');
        await this.reconnect();
        if (!this.isConnected) {
          throw new Error('数据库未连接');
        }
      }

      // 生成新的留言ID
      const newNoteRef = this.notesRef.push();
      const noteId = newNoteRef.key;
      
      // 添加时间戳和ID
      const noteWithMetadata = {
        ...noteData,
        id: noteId,
        createdAt: FirebaseConfig.getServerTimestamp(),
        updatedAt: FirebaseConfig.getServerTimestamp()
      };

      await newNoteRef.set(noteWithMetadata);
      console.log('留言添加成功:', noteId);
      return noteId;
      
    } catch (error) {
      console.error('添加留言失败:', error);
      throw error;
    }
  }

  /**
   * 更新留言
   * @param {string} noteId - 留言ID
   * @param {Object} updateData - 更新数据
   * @returns {Promise<boolean>} 是否成功
   */
  async updateNote(noteId, updateData) {
    try {
      if (!this.notesRef) {
        throw new Error('数据库未初始化');
      }
      
      if (!this.isConnected) {
        console.warn('数据库离线，尝试重新连接...');
        await this.reconnect();
        if (!this.isConnected) {
          throw new Error('数据库未连接');
        }
      }

      const noteRef = this.notesRef.child(noteId);
      
      // 添加更新时间戳
      const updateWithTimestamp = {
        ...updateData,
        updatedAt: FirebaseConfig.getServerTimestamp()
      };

      await noteRef.update(updateWithTimestamp);
      console.log('留言更新成功:', noteId);
      return true;
      
    } catch (error) {
      console.error('更新留言失败:', error);
      throw error;
    }
  }

  /**
   * 删除留言
   * @param {string} noteId - 留言ID
   * @returns {Promise<boolean>} 是否成功
   */
  async deleteNote(noteId) {
    try {
      if (!this.notesRef) {
        throw new Error('数据库未初始化');
      }
      
      if (!this.isConnected) {
        console.warn('数据库离线，尝试重新连接...');
        await this.reconnect();
        if (!this.isConnected) {
          throw new Error('数据库未连接');
        }
      }

      const noteRef = this.notesRef.child(noteId);
      await noteRef.remove();
      console.log('留言删除成功:', noteId);
      return true;
      
    } catch (error) {
      console.error('删除留言失败:', error);
      throw error;
    }
  }

  /**
   * 获取所有留言
   * @returns {Promise<Array>} 留言数组
   */
  async getAllNotes() {
    try {
      if (!this.notesRef) {
        throw new Error('数据库未初始化');
      }

      const snapshot = await this.notesRef.once('value');
      const notesData = snapshot.val();
      
      if (!notesData) {
        return [];
      }

      // 转换为数组格式并按创建时间排序
      const notesArray = Object.keys(notesData).map(key => ({
        id: key,
        ...notesData[key]
      }));

      // 按创建时间降序排序（最新的在前）
      notesArray.sort((a, b) => {
        const timeA = a.createdAt || 0;
        const timeB = b.createdAt || 0;
        return timeB - timeA;
      });

      console.log('获取留言成功，共', notesArray.length, '条');
      return notesArray;
      
    } catch (error) {
      console.error('获取留言失败:', error);
      throw error;
    }
  }

  /**
   * 监听留言变化
   * @param {Function} callback - 回调函数
   * @returns {string} 监听器ID
   */
  onNotesChange(callback) {
    if (!this.notesRef) {
      console.warn('数据库未初始化，无法设置监听器');
      return null;
    }

    const listenerId = 'listener_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const listener = this.notesRef.on('value', (snapshot) => {
      try {
        const notesData = snapshot.val();
        let notesArray = [];
        
        if (notesData) {
          notesArray = Object.keys(notesData).map(key => ({
            id: key,
            ...notesData[key]
          }));
          
          // 按创建时间降序排序
          notesArray.sort((a, b) => {
            const timeA = a.createdAt || 0;
            const timeB = b.createdAt || 0;
            return timeB - timeA;
          });
        }
        
        console.log('留言数据变化，当前共', notesArray.length, '条');
        callback(notesArray);
        
      } catch (error) {
        console.error('处理留言变化失败:', error);
        callback([]);
      }
    });

    this.listeners.set(listenerId, listener);
    console.log('留言监听器已设置:', listenerId);
    return listenerId;
  }

  /**
   * 移除留言监听器
   * @param {string} listenerId - 监听器ID
   */
  offNotesChange(listenerId) {
    if (!listenerId || !this.listeners.has(listenerId)) {
      return;
    }

    try {
      this.notesRef.off('value', this.listeners.get(listenerId));
      this.listeners.delete(listenerId);
      console.log('留言监听器已移除:', listenerId);
    } catch (error) {
      console.error('移除监听器失败:', error);
    }
  }

  /**
   * 批量同步本地数据到Firebase
   * @param {Array} localNotes - 本地留言数据
   * @returns {Promise<boolean>} 是否成功
   */
  async syncLocalNotes(localNotes) {
    try {
      if (!this.notesRef || !this.isConnected || !Array.isArray(localNotes)) {
        return false;
      }

      console.log('开始同步本地数据到Firebase，共', localNotes.length, '条');
      
      // 获取远程数据
      const remoteNotes = await this.getAllNotes();
      const remoteNotesMap = new Map(remoteNotes.map(note => [note.id, note]));
      
      // 同步本地数据到远程
      for (const localNote of localNotes) {
        const remoteNote = remoteNotesMap.get(localNote.id);
        
        if (!remoteNote) {
          // 远程不存在，添加到远程
          await this.addNote(localNote);
        } else if (localNote.updatedAt > remoteNote.updatedAt) {
          // 本地更新时间较新，更新远程
          await this.updateNote(localNote.id, localNote);
        }
      }
      
      console.log('本地数据同步完成');
      return true;
      
    } catch (error) {
      console.error('同步本地数据失败:', error);
      return false;
    }
  }

  /**
   * 初始化方法别名（向后兼容）
   */
  async init() {
    return await this.initialize();
  }

  /**
   * 检查数据库连接状态
   * @returns {boolean} 是否已连接
   */
  isOnline() {
    return this.isConnected;
  }

  /**
   * 重新连接数据库
   */
  async reconnect() {
    if (this.retryCount >= this.maxRetries) {
      console.error('重连次数超过限制');
      return false;
    }
    
    this.retryCount++;
    console.log(`尝试重连Firebase (${this.retryCount}/${this.maxRetries})`);
    
    try {
      await this.initialize();
      if (this.isConnected) {
        this.retryCount = 0;
        return true;
      }
    } catch (error) {
      console.error('重连失败:', error);
    }
    
    return false;
  }

  /**
   * 清理资源
   */
  destroy() {
    // 移除所有监听器
    this.listeners.forEach((listener, listenerId) => {
      this.offNotesChange(listenerId);
    });
    
    this.listeners.clear();
    this.dbRef = null;
    this.notesRef = null;
    this.isConnected = false;
    
    console.log('Firebase数据库连接已清理');
  }
}

// 导出Firebase数据库操作类
window.FirebaseDB = FirebaseDB;