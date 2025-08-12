# Firebase 配置指南

## 概述
本指南将帮助您正确配置 Firebase Firestore 数据库规则、Storage 安全规则和索引，以确保应用的所有功能正常运行。

## 1. 部署 Firebase 安全规则

### 1.1 部署 Firestore 安全规则

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

4. 部署 Firestore 安全规则：
```bash
firebase deploy --only firestore:rules
```

5. 部署 Storage 安全规则：
```bash
firebase deploy --only storage
```

6. 同时部署所有规则：
```bash
firebase deploy --only firestore:rules,storage
```

7. 验证部署：
   - 在 Firebase 控制台查看 Firestore 和 Storage 规则是否更新
   - 确认规则版本号已更新

### 1.2 手动配置 Firestore 规则（Firebase 控制台）

1. 访问 [Firebase 控制台](https://console.firebase.google.com/)
2. 选择您的项目
3. 进入 "Firestore Database" > "规则"
4. 将 `firestore.rules` 文件的内容复制粘贴到规则编辑器中
5. 点击 "发布"

### 1.3 手动配置 Storage 规则（Firebase 控制台）

1. 在 Firebase 控制台中，进入 "Storage" > "规则"
2. 将 `storage.rules` 文件的内容复制粘贴到规则编辑器中
3. 点击 "发布"
4. 确认规则已生效

## 2. 配置 Firebase Storage

### 2.1 Storage 功能说明

Firebase Storage 用于存储用户上传的照片，包括：
- 情侣照片：存储路径 `couples/{coupleId}/photos/{photoId}`
- 用户头像：存储路径 `users/{userId}/avatar`

### 2.2 Storage 安全规则特性

- **权限控制**：只有情侣成员可以访问和上传照片
- **文件类型限制**：仅支持 JPEG、PNG、WebP 格式
- **文件大小限制**：最大 10MB
- **路径隔离**：不同情侣的照片完全隔离

### 2.3 Storage 配置要求

1. **启用 Firebase Storage**：
   - 在 Firebase 控制台启用 Storage 服务
   - 选择存储位置（建议选择离用户最近的区域）

2. **部署安全规则**：
   - 使用 `firebase deploy --only storage` 部署规则
   - 或手动在控制台配置规则

3. **验证配置**：
   - 测试照片上传功能
   - 检查权限控制是否正常

## 3. 创建复合索引

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

## 4. 验证配置

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

## 5. 数据结构要求

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

## 6. 测试配置

### 6.1 Firestore 功能测试

1. 确保用户已登录
2. 确保用户属于一个情侣关系
3. 尝试添加一个纪念日
4. 检查纪念日列表是否正常加载

### 6.2 Storage 功能测试

1. 确保用户已登录且属于情侣关系
2. 尝试上传一张照片
3. 检查照片是否正确显示在照片列表中
4. 测试照片的编辑和删除功能
5. 验证文件大小和格式限制是否生效

## 7. 故障排除

### 7.1 Firestore 相关问题

如果 Firestore 功能仍有问题：

1. 检查浏览器控制台的详细错误信息
2. 验证 Firebase 项目配置
3. 确认用户权限和数据结构
4. 等待索引创建完成（可能需要几分钟）
5. 尝试重新部署规则和索引

### 7.2 Storage 相关问题

#### 照片上传失败
- **问题**: `permission-denied` 或上传失败
- **解决**: 确保已正确部署 Storage 安全规则
- **检查**: 用户是否已登录且属于相应的情侣关系

#### 文件格式或大小错误
- **问题**: 文件被拒绝上传
- **解决**: 检查文件是否符合格式要求（JPEG、PNG、WebP）和大小限制（10MB）
- **验证**: 在上传前进行客户端验证

#### 照片无法显示
- **问题**: 照片上传成功但无法显示
- **解决**: 检查 Storage 读取权限和 URL 生成
- **验证**: 确认照片存储路径正确

#### Storage 规则部署失败
- **问题**: 规则部署时出错
- **解决**: 检查 `storage.rules` 文件语法
- **验证**: 确保 Firebase CLI 已正确配置项目

### 联系支持

如果按照本指南操作后问题仍未解决，请提供：
- 详细的错误信息
- 诊断工具的完整输出
- Firebase 项目配置截图

---

**注意**: 修改 Firestore 规则和索引可能需要几分钟才能生效。请耐心等待并在修改后重新测试。