# Firebase 配置检查清单

## 📋 照片模块配置检查清单

### ✅ 必须完成的配置步骤

#### 1. Firebase Storage 启用
- [ ] 在 Firebase 控制台启用 Storage 服务
- [ ] 选择合适的存储区域（建议选择离用户最近的区域）
- [ ] 确认 Storage 服务状态为"已启用"

#### 2. 安全规则部署
- [ ] 部署 Firestore 安全规则：`firebase deploy --only firestore:rules`
- [ ] 部署 Storage 安全规则：`firebase deploy --only storage`
- [ ] 验证规则部署成功（检查控制台中的规则版本）

#### 3. 复合索引创建
- [ ] 部署 Firestore 索引：`firebase deploy --only firestore:indexes`
- [ ] 等待索引创建完成（可能需要几分钟）
- [ ] 验证索引状态为"已启用"

#### 4. 环境配置验证
- [ ] 检查 `.env` 文件中的 Firebase 配置
- [ ] 确认所有必要的环境变量已设置
- [ ] 验证 Firebase 项目 ID 正确

### 🔧 配置文件检查

#### 必需的配置文件
- [ ] `firestore.rules` - Firestore 安全规则
- [ ] `storage.rules` - Storage 安全规则
- [ ] `firestore.indexes.json` - Firestore 复合索引
- [ ] `.env` - 环境变量配置

#### 权限一致性检查
- [ ] Storage 规则与 Firestore 规则使用相同的权限逻辑
- [ ] 照片路径结构：`couples/{coupleId}/photos/{photoId}`
- [ ] 用户权限基于 `user1Id` 和 `user2Id` 字段

### 🧪 功能测试

#### 照片上传测试
- [ ] 用户登录状态下可以上传照片
- [ ] 文件格式限制生效（JPEG、PNG、WebP）
- [ ] 文件大小限制生效（最大 10MB）
- [ ] 照片正确保存到指定路径

#### 照片访问测试
- [ ] 情侣成员可以查看所有照片
- [ ] 非情侣成员无法访问照片
- [ ] 照片 URL 正确生成和显示

#### 照片管理测试
- [ ] 可以编辑照片描述和标签
- [ ] 可以删除照片（同时删除 Storage 和 Firestore 记录）
- [ ] 权限控制正常工作

### ⚠️ 常见问题检查

#### 权限错误
- [ ] 确认用户已登录
- [ ] 确认用户属于情侣关系
- [ ] 检查安全规则是否正确部署

#### 上传失败
- [ ] 检查文件格式和大小
- [ ] 验证 Storage 规则
- [ ] 确认网络连接正常

#### 照片无法显示
- [ ] 检查 Storage 读取权限
- [ ] 验证照片 URL 生成
- [ ] 确认照片存储路径正确

### 📝 部署命令快速参考

```bash
# 安装 Firebase CLI
npm install -g firebase-tools

# 登录 Firebase
firebase login

# 初始化项目（如果需要）
firebase init firestore storage

# 部署所有规则和索引
firebase deploy --only firestore:rules,firestore:indexes,storage

# 单独部署各项
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
firebase deploy --only storage
```

### 🔍 验证配置

完成所有配置后，请：

1. 重启开发服务器
2. 清除浏览器缓存
3. 测试完整的照片上传流程
4. 检查浏览器控制台是否有错误
5. 使用应用内的诊断工具验证配置

---

**注意**：所有配置修改可能需要几分钟才能生效。如果遇到问题，请等待一段时间后重试，并参考 `FIREBASE_SETUP.md` 中的详细故障排除指南。