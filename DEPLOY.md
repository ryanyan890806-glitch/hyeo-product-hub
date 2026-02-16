# HYEO Product Hub - 部署指南

## 快速开始（5步完成）

### 第1步：创建账户（5分钟）

**GitHub** - https://github.com/signup
- 使用邮箱：`ryanyan890806@gmail.com`
- 创建账户 → 验证邮箱

**Vercel** - https://vercel.com
- 点击 "Sign Up" → 选择 "Continue with GitHub"
- 授权 Vercel 访问你的 GitHub

**Supabase** - https://supabase.com
- 点击 "Start your project" → 选择 "Continue with GitHub"

**Cloudflare** - https://dash.cloudflare.com/sign-up
- 用邮箱注册 → 验证邮箱

---

### 第2步：创建 GitHub 仓库（2分钟）

1. 访问 https://github.com/new
2. Repository name: `hyeo-product-hub`
3. 选择 **Public**（免费）
4. 点击 **Create repository**
5. 记录下仓库地址：`https://github.com/你的用户名/hyeo-product-hub`

---

### 第3步：配置 Supabase 数据库（10分钟）

1. 登录 https://supabase.com 后点击 "New Project"
2. 填写：
   - **Name**: `hyeo-product-hub`
   - **Database Password**: 设置一个强密码（记住它）
   - **Region**: 选择 `Northeast Asia (Tokyo)` 或 `Southeast Asia (Singapore)`
3. 点击 **Create new project**，等待 2-3 分钟

4. 数据库创建完成后：
   - 点击左侧菜单 **SQL Editor**
   - 点击 **New query**
   - 粘贴以下 SQL 代码：

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

-- 创建 Row Level Security 策略
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all" ON products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all" ON product_documents FOR ALL USING (true) WITH CHECK (true);
```

5. 点击 **Run**，等待执行完成

6. 获取连接信息：
   - 点击左侧齿轮图标 **Settings**
   - 选择 **API**
   - 复制以下信息：
     - `URL` (例如: `https://xxxxx.supabase.co`)
     - `anon public` API key

---

### 第4步：配置 Cloudflare R2 存储（10分钟）

1. 登录 https://dash.cloudflare.com
2. 左侧菜单找到 **R2** (Object Storage)，点击进入
3. 如果是第一次使用，可能需要先启用（免费）

4. 创建存储桶：
   - 点击 **Create bucket**
   - **Bucket name**: `hyeo-product-files`
   - **Location**: 选择 `Automatic`
   - 点击 **Create bucket**

5. 创建 API Token：
   - 在 R2 页面，点击 **Manage R2 API Tokens**
   - 点击 **Create API Token**
   - **Token name**: `hyeo-upload`
   - **Permissions**: 选择 **Object Read & Write**
   - 点击 **Create API Token**
   - **重要**：立即复制 `Access Key ID` 和 `Secret Access Key`（只显示一次！）

6. 获取 Account ID：
   - 在 R2 页面右侧可以看到 **Account ID**，复制下来

7. 设置公开访问（重要）：
   - 进入你的 bucket `hyeo-product-files`
   - 点击 **Settings** 标签
   - 找到 **Public Access**，启用它
   - 记录公开访问 URL（类似 `https://pub-xxxxx.r2.dev`）

---

### 第5步：部署到 Vercel（10分钟）

1. 访问 https://vercel.com/new

2. 点击 **Import Git Repository**
   - 粘贴你的 GitHub 仓库地址
   - 或者如果你已经上传了代码，直接在列表中选择

3. 配置项目：
   - **Framework Preset**: 选择 `Next.js`
   - **Root Directory**: `./` (默认)

4. 添加环境变量（非常重要！）：
   
   点击 **Environment Variables**，逐个添加：

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://你的项目.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=你的anon-key
   
   R2_ACCOUNT_ID=你的account-id
   R2_ACCESS_KEY_ID=你的access-key-id
   R2_SECRET_ACCESS_KEY=你的secret-access-key
   R2_BUCKET_NAME=hyeo-product-files
   R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
   
   ADMIN_PASSWORD=admin123
   JWT_SECRET=任意随机字符串至少32位
   ```

5. 点击 **Deploy**

6. 等待 2-3 分钟部署完成

7. 部署成功后：
   - 点击 **Visit** 查看网站
   - 你的域名类似：`https://hyeo-product-hub.vercel.app`

---

## 使用说明

### 访问网站
- **用户端**: 直接打开 Vercel 提供的域名
- **管理端**: 点击右下角 "Admin" 按钮
  - 用户名: `admin`
  - 密码: `admin123`（或在环境变量中设置的密码）

### 管理员功能
- **添加产品**: 点击 "Add Product" 按钮
- **上传文件**: 点击每个产品的 Upload/Replace 按钮
- **视频链接**: 点击视频栏的 URL 按钮，输入视频直链
- **删除照片**: 点击照片右上角的 X 按钮
- **删除产品**: 点击垃圾桶图标，确认后删除
- **排序产品**: 点击上下箭头调整顺序

---

## 故障排除

### 部署失败
1. 检查环境变量是否全部添加
2. 检查 GitHub 仓库是否有代码
3. 查看 Vercel 的 Build Logs 错误信息

### 上传文件失败
1. 检查 R2 配置是否正确
2. 检查 R2 bucket 是否启用了公开访问
3. 检查环境变量中的 R2_PUBLIC_URL 是否正确

### 数据库连接失败
1. 检查 Supabase URL 和 API key 是否正确
2. 检查 SQL 是否已正确执行

### 无法登录管理端
1. 检查 ADMIN_PASSWORD 环境变量
2. 清除浏览器 localStorage 后重试

---

## 修改管理员密码

1. 登录 Vercel Dashboard
2. 选择你的项目
3. 点击 **Settings** → **Environment Variables**
4. 修改 `ADMIN_PASSWORD` 的值
5. 点击 **Save**，重新部署

---

## 绑定自定义域名（可选）

1. Vercel 项目页面 → **Settings** → **Domains**
2. 输入你的域名，例如 `products.yourcompany.com`
3. 按提示添加 DNS 记录
4. 等待 DNS 生效（通常几分钟到几小时）

---

## 费用说明

| 服务 | 免费额度 | 预计用量 | 费用 |
|------|----------|----------|------|
| Vercel | 无限带宽 | < 100GB/月 | ¥0 |
| Supabase | 500MB 数据库 + 2GB 流量 | ~100MB | ¥0 |
| Cloudflare R2 | 10GB 存储 + 无限流量 | 1GB | ¥0 |

**总结：完全免费！**

---

## 需要帮助？

1. 查看 Vercel 文档: https://vercel.com/docs
2. 查看 Supabase 文档: https://supabase.com/docs
3. 检查每个服务的 Dashboard 中的错误日志
