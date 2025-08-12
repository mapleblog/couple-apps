# Firebase 配置指南

## 概述
本指南将帮助您正确配置 Firebase Firestore 数据库规则和索引，以解决纪念日功能的访问问题。

## 1. 部署 Firestore 安全规则

**⚠️ 重要提醒：权限错误的主要原因是安全规则未正确部署！**

### 使用 Firebase CLI（推荐）

1. 安装 Firebase CLI：
```bash
npm install -g firebase-tools
```

2. 登录 Firebase：
```bash
firebase login
```

3. 初始化 Firebase 项目（如果还没有）：
```bash
firebase init firestore
```
   - 选择现有项目
   - 选择 `firestore.rules` 作为规则文件
   - 选择 `firestore.indexes.json` 作为索引文件

4. 部署安全规则：
```bash
firebase deploy --only firestore:rules
```

5. 验证部署：
   - 在 Firebase 控制台查看规则是否更新
   - 确认规则版本号已更新

### 手动配置（Firebase 控制台）

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 选择您的项目
3. 进入 "Firestore Database" > "规则"
4. 将 `firestore.rules` 文件的内容复制粘贴到规则编辑器中
5. 点击 "发布"

## 2. 创建复合索引

### 使用 Firebase CLI（推荐）

部署索引配置：
```bash
firebase deploy --only firestore:indexes
```

### 手动创建索引

1. 在 Firebase 控制台中，进入 "Firestore Database" > "索引"
2. 点击 "创建索引"
3. 为 `anniversaries` 集合创建以下复合索引：

#### 索引 1：按日期排序
- 集合 ID: `anniversaries`
- 字段:
  - `coupleId` (升序)
  - `date` (升序)

#### 索引 2：按创建时间排序
- 集合 ID: `anniversaries`
- 字段:
  - `coupleId` (升序)
  - `createdAt` (降序)

## 3. 验证配置

### 使用诊断工具

1. 在应用中遇到错误时，点击 "诊断问题" 按钮
2. 运行完整的诊断测试
3. 根据诊断结果修复发现的问题

### 常见问题解决

#### 权限被拒绝错误
- **问题**: `permission-denied`
- **解决**: 确保已正确部署 Firestore 安全规则
- **检查**: 用户是否已登录且属于相应的情侣关系

#### 索引缺失错误
- **问题**: `failed-precondition` 或索引相关错误
- **解决**: 创建必要的复合索引
- **等待**: 索引创建可能需要几分钟时间

#### 网络连接问题
- **问题**: `unavailable`
- **解决**: 检查网络连接和 Firebase 配置
- **验证**: 确保 `.env` 文件中的 Firebase 配置正确

## 4. 数据结构要求

### Couples 集合
每个情侣文档必须包含：
```javascript
{
  memberIds: ["userId1", "userId2"], // 两个用户的 UID
  // 其他字段...
}
```

### Anniversaries 集合
每个纪念日文档必须包含：
```javascript
{
  coupleId: "coupleId",     // 对应的情侣 ID
  createdBy: "userId",      // 创建者的 UID
  // 其他字段...
}
```

## 5. 测试配置

1. 确保用户已登录
2. 确保用户属于一个情侣关系
3. 尝试添加一个纪念日
4. 检查纪念日列表是否正常加载

## 6. 故障排除

### 如果问题仍然存在：

1. 检查浏览器控制台的详细错误信息
2. 验证 Firebase 项目配置
3. 确认用户权限和数据结构
4. 等待索引创建完成（可能需要几分钟）
5. 尝试重新部署规则和索引

### 联系支持

如果按照本指南操作后问题仍未解决，请提供：
- 详细的错误信息
- 诊断工具的完整输出
- Firebase 项目配置截图

---

**注意**: 修改 Firestore 规则和索引可能需要几分钟才能生效。请耐心等待并在修改后重新测试。