# Cloudflare Pages 部署说明（单独文档）

本文档说明如何把「一点意思文档查看器」部署到 Cloudflare Pages。主说明见 `README.md`（EdgeOne Makers / 自己服务器）。

## 一、兼容性结论

Cloudflare Pages Functions 的约定和 EdgeOne Makers 几乎一模一样，**代码不用改**，只换目录名：

| 对比项 | EdgeOne Makers | Cloudflare Pages |
|---|---|---|
| 函数目录 | `edge-functions/` | `functions/` |
| 导出签名 | `onRequest(context)` | `onRequest(context)`（完全相同） |
| 代码内容 | fetch + Response（标准 Web API） | 完全相同 |
| 路由映射 | `edge-functions/proxy.js` → `/proxy` | `functions/proxy.js` → `/proxy` |

## 二、需要准备的文件

把 `edge-functions/proxy.js` 的内容复制一份放到 **`functions/proxy.js`**（项目里已备好此文件），其余文件原样：

```
部署目录/
├── index.html                 # 页面（不动）
├── functions/
│   └── proxy.js               # 跨域中转代理（内容与 edge-functions/proxy.js 相同）
├── sample.docx                # 内置演示文档（不动）
├── mammoth.browser.min.js     # 解析库（不动）
├── xlsx.full.min.js           # 解析库（不动）
├── robots.txt / sitemap.xml / llms.txt   # SEO/GEO（不动）
└── （README.md / proxy.php / .htaccess / edge-functions/ 传不传都行）
```

## 三、部署步骤

### 方式 1：Git 连接（推荐）

1. 把上面目录推到 GitHub / GitLab 仓库（注意：必须包含 `functions/` 目录）；
2. Cloudflare 控制台 →「Workers & Pages」→「Create」→ 连接该仓库；
3. 构建设置：框架预设选 **None**，构建命令留空，输出目录留空（或 `/`）；
4. 部署完成后得到 `https://你的项目.pages.dev` 域名。

### 方式 2：命令行上传

```bash
npx wrangler pages deploy 部署目录名
```

> **重要**：Cloudflare Pages 的「拖拽上传」不支持 Functions——拖拽部署的话 `/proxy` 不会生效（页面本身可用，但跨域加载远程文档会失败）。必须用 Git 连接或 Wrangler 命令行。

## 四、验证

1. 打开 `https://你的项目.pages.dev/`，页面正常显示，默认加载内置的 `sample.docx`（同源请求，无跨域问题）；
2. 浏览器访问 `https://你的项目.pages.dev/proxy?url=https://www.yidianyisi.cn/j.docx`，能下载到文件说明函数生效；
3. 页面里粘贴其他文档 URL 点「加载文档」，直连被 CORS 拦截时会自动走 `/proxy` 中转。

## 五、绑定自定义域名

Cloudflare 控制台 → Pages 项目 →「Custom domains」→ 添加域名：

- 域名 DNS 托管在 Cloudflare：自动加 CNAME，几分钟生效；
- DNS 在其他服务商：去对应服务商把 CNAME 指向 `你的项目.pages.dev`；
- HTTPS 证书由 Cloudflare 自动签发。

绑定后记得把 `index.html` 里 `<link rel="canonical">` 和 `sitemap.xml` 的地址同步更新（当前为 `https://yidianyisi.cn/`）。

## 六、与 EdgeOne Makers 的差异备忘

| 项目 | EdgeOne Makers | Cloudflare Pages |
|---|---|---|
| 函数目录 | `edge-functions/` | `functions/` |
| 直接上传 | 控制台/CLI 支持（含函数） | **拖拽上传不含函数**，需 Git 或 Wrangler |
| 默认域名 | `xxx.edgeone.dev`（预览版有访问鉴权） | `xxx.pages.dev`（公开可访问） |
| 自定义域名绑定 | 控制台绑定 + CNAME | 控制台绑定 + CNAME |

两个平台可以同时部署（一个用 `edge-functions/`，一个用 `functions/`，两个目录在对方平台上只是无害的静态文件）。
