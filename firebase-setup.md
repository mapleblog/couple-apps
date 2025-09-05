# Firebase Realtime Database 配置指南

## 1. 创建Firebase项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击「创建项目」或「添加项目」
3. 输入项目名称（例如：couple-love-notes）
4. 选择是否启用Google Analytics（可选）
5. 点击「创建项目」

## 2. 启用Realtime Database

1. 在Firebase控制台中，选择您的项目
2. 在左侧菜单中点击「Realtime Database」
3. 点击「创建数据库」
4. 选择数据库位置（建议选择离用户最近的区域）
5. 选择安全规则模式：
   - 测试模式：允许所有读写操作（适合开发测试）
   - 锁定模式：拒绝所有读写操作（需要后续配置规则）

## 3. 获取配置信息

1. 在Firebase控制台中，点击项目设置（齿轮图标）
2. 选择「项目设置」
3. 滚动到「您的应用」部分
4. 如果还没有Web应用，点击「添加应用」并选择Web图标
5. 注册应用名称，点击「注册应用」
6. 复制Firebase配置对象

## 4. 配置项目

将获取到的配置信息替换到 `firebase-config.js` 文件中：

```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project-id.firebaseapp.com",
  databaseURL: "https://your-project-id-default-rtdb.firebaseio.com/",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## 5. 配置数据库规则（可选）

在Realtime Database的「规则」选项卡中，可以设置以下规则：

### 开发测试规则（允许所有操作）：
```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### 生产环境规则（推荐）：
```json
{
  "rules": {
    "loveNotes": {
      ".read": true,
      ".write": true,
      "$noteId": {
        ".validate": "newData.hasChildren(['id', 'title', 'content', 'backgroundColor', 'timestamp'])"
      }
    }
  }
}
```

## 6. 测试连接

1. 确保已完成上述配置
2. 启动本地服务器
3. 打开浏览器开发者工具
4. 查看控制台是否显示「Firebase应用初始化成功」和「Firebase Realtime Database初始化成功」
5. 尝试添加一条留言，检查是否同步到Firebase数据库

## 常见问题

### Q: 控制台显示「Firebase SDK未加载」
A: 检查网络连接，确保能访问Firebase CDN

### Q: 数据无法保存到Firebase
A: 检查数据库规则是否允许写入操作

### Q: 页面加载缓慢
A: Firebase CDN可能在某些地区访问较慢，这是正常现象

## 功能特性

✅ 实时数据同步 - 多设备间数据实时更新  
✅ 离线支持 - 网络断开时使用本地数据  
✅ 数据备份 - 本地和云端双重保存  
✅ 错误处理 - 网络错误、权限错误等  
✅ 性能优化 - 避免重复请求和数据冲突