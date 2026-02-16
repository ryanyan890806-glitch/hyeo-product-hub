# HYEO Product Hub - 全栈版本

完整的产品资料管理系统，支持公开访问、数据持久化、文件存储。

## 技术栈

- **前端**: Next.js 14 + React + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **数据库**: Supabase PostgreSQL
- **文件存储**: Cloudflare R2
- **部署**: Vercel

## 免费额度

| 服务 | 免费额度 | 你的用量 |
|------|----------|----------|
| Vercel | 无限流量 | 充足 |
| Supabase | 500MB 数据库 + 2GB 流量 | 充足 |
| Cloudflare R2 | 10GB 存储 + 无限流量 | 1GB ✓ |

## 快速部署指南

### 第1步：创建账户

1. **GitHub**: https://github.com/signup (用 ryanyan890806@gmail.com 注册)
2. **Vercel**: https://vercel.com (用 GitHub 登录)
3. **Supabase**: https://supabase.com (用 GitHub 登录)
4. **Cloudflare**: https://dash.cloudflare.com (用邮箱注册)

### 第2步：配置 Supabase 数据库

1. 登录 Supabase，点击 "New Project"
2. 项目名: `hyeo-product-hub`
3. 等待数据库创建完成
4. 进入 SQL Editor，执行以下 SQL:

```sql
-- 创建产品表
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建产品资料表
CREATE TABLE product_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('TECHNICAL_MANUAL', 'USER_MANUAL', '3D_MODEL', 'PRODUCT_VIDEO', 'PHOTO')),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建管理员表
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认管理员 (密码: admin123)
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMy.MqrqQwQxUCVw8Hhg3zY8PzQXaYkfRvK');

-- 创建 Row Level Security 策略
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON product_documents FOR ALL USING (true) WITH CHECK (true);
```

5. 获取连接信息:
   - Project Settings → Database → Connection String (Session pooler)
   - 复制 `DATABASE_URL`

### 第3步：配置 Cloudflare R2

1. 登录 Cloudflare Dashboard
2. 点击左侧 R2 (Object Storage)
3. 点击 "Create bucket"
   - Bucket name: `hyeo-product-files`
   - Location: Automatic
4. 创建 API Token:
   - Manage R2 API Tokens → Create API Token
   - Permissions: Object Read & Write
   - 复制 `Access Key ID` 和 `Secret Access Key`
5. 获取 Account ID:
   - 在 R2 页面右侧可见

### 第4步：部署到 Vercel

1. 将代码上传到 GitHub:
   - 创建新仓库: https://github.com/new
   - 仓库名: `hyeo-product-hub`
   - 上传所有代码文件

2. 在 Vercel 部署:
   - https://vercel.com/new
   - 导入 GitHub 仓库
   - 环境变量添加:

```
DATABASE_URL=postgresql://postgres:xxxx@db.xxxx.supabase.co:5432/postgres
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=hyeo-product-files
ADMIN_PASSWORD=admin123
```

3. 点击 Deploy

### 第5步：访问网站

部署完成后，Vercel 会提供域名如 `https://hyeo-product-hub.vercel.app`

- 用户端: 直接访问
- 管理端: 点击右下角 "Admin" 按钮，登录:
  - 用户名: `admin`
  - 密码: `admin123`

## 项目结构

```
hyeo-product-hub/
├── app/                    # Next.js 应用
│   ├── api/               # API 路由
│   │   ├── products/      # 产品 API
│   │   ├── upload/        # 文件上传 API
│   │   └── auth/          # 认证 API
│   ├── page.tsx           # 用户端首页
│   ├── admin/             # 管理端
│   └── layout.tsx         # 根布局
├── components/            # 组件
│   ├── ProductCard.tsx
│   ├── AdminDashboard.tsx
│   ├── PreviewModal.tsx
│   └── ...
├── lib/                   # 工具函数
│   ├── db.ts             # 数据库连接
│   ├── storage.ts        # 文件存储
│   └── auth.ts           # 认证
├── types/                 # TypeScript 类型
├── public/                # 静态文件
└── package.json
```

## 管理员操作

- **添加产品**: 管理端 → Add Product
- **上传文件**: 点击产品卡片的 Upload/Replace 按钮
- **删除产品**: 点击垃圾桶图标
- **排序产品**: 点击上下箭头
- **删除照片**: 照片右上角 X 按钮

## 支持文件类型

- 图片: .jpg, .jpeg, .png, .gif, .webp
- PDF: .pdf
- 视频: .mp4, .mov, .webm
- 3D模型: .glb, .gltf, .obj, .stl

## 修改管理员密码

在 Supabase SQL Editor 执行:
```sql
-- 密码改为新密码 (需要 bcrypt hash)
UPDATE admin_users 
SET password_hash = '$2a$10$new_hash_here'
WHERE username = 'admin';
```

## 故障排除

**上传失败**: 检查 R2 配置，确保 CORS 允许 `*`
**数据库连接失败**: 检查 DATABASE_URL 是否正确
**页面空白**: 检查浏览器控制台错误信息

## 技术支持

如有问题，可以:
1. 查看 Vercel 部署日志
2. 检查 Supabase 数据库表
3. 查看 Cloudflare R2 存储桶
