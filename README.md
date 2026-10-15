# 一点意思文档查看器 - 完整说明文档

一个纯前端的在线文档预览工具：在浏览器中直接预览 `.doc` / `.docx` / `.xlsx` 文档及网页版试卷，支持关键词查找定位、移动端访问、本地文件打开，无需安装任何软件，也无需服务器端解析。

- **演示地址**：https://yidianyisi.cn/
- **跨域中转演示**：https://yidianyisi.cn/proxy?url=https://www.3520.net/ks/j.docx

## 一、项目目录结构与文件说明

```
ks/
├── index.html                 # 查看器页面（含全部前端逻辑与 .doc 解析器）
├── edge-functions/
│   └── proxy.js               # Makers 边缘函数：跨域中转，自动映射为 /proxy 路由
├── mammoth.browser.min.js     # docx 解析库（本地加载，零 CDN 依赖）
├── xlsx.full.min.js           # xlsx / xls / doc 解析库（含 CFB 模块，本地优先）
├── robots.txt                 # SEO/GEO：允许搜索引擎与 AI 爬虫抓取
├── sitemap.xml                # SEO/GEO：站点地图（提交站长平台用）
├── llms.txt                   # GEO：供 AI 爬虫快速理解站点用途
├── README.md                  # 本说明文档
├── proxy.php                  # PHP 跨域代理（仅"自己服务器+跨域中转"方式需要）
├── .htaccess                  # Apache 跨域响应头（仅 Apache 服务器方式需要）
└── *.docx / *.xlsx / *.doc    # 示例文档
```

### 各部署方式需要上传的文件对照

| 文件 | 方式 A：Makers 托管 | 方式 B：自己服务器（页面与文档同域） | 方式 C：自己服务器（页面放别处 + proxy.php 中转） |
|---|---|---|---|
| `index.html` | ✅ 必需 | ✅ 必需 | ✅ 必需 |
| `mammoth.browser.min.js` / `xlsx.full.min.js` | ✅ 必需 | ✅ 必需 | ✅ 必需 |
| `edge-functions/proxy.js` | ✅（整个文件夹上传） | 不需要 | 不需要 |
| `proxy.php`（务必用带白名单的新版） | 不需要 | 同域时不需要 | ✅ 必需 |
| `.htaccess` | 不需要 | Apache 服务器建议上传 | 不需要 |
| `robots.txt` / `sitemap.xml` / `llms.txt` | ✅ 建议 | ✅ 建议 | ✅ 建议 |
| 示例文档 | 按需 | 按需 | 按需 |

> 注意：`edge-functions/proxy.js` 只在 Makers 上生效（边缘函数运行时）；放到普通服务器的静态目录里它只是个可下载的文件，不会执行。反之 `proxy.php` 需要 PHP 环境，Makers 上传了也不会运行。

## 二、功能特性

- **多格式预览**：`.docx`（mammoth.js 转 HTML）、`.xlsx` / `.xls`（SheetJS 渲染表格）、HTML 试卷页面直接渲染、`.doc` 尽力提取正文（内置 OLE2 / Word 97-2003 piece table 解析，复杂排版可能丢失，失败时提示转存 .docx）。
- **按内容识别格式**：不信任文件扩展名，按文件头魔数判断真实类型——扩展名错误的文件（如 HTML 存成 .doc）也能正常显示。
- **关键词查找**：高亮全部命中位置，「上一个 / 下一个」逐个定位，当前命中带红色描边并自动滚动到屏幕中央。
- **本地文件**：点「打开本地文件」用浏览器 File API 读取本地磁盘文件，不经过网络、不受跨域限制。
- **移动端适配**：viewport + 媒体查询，查找栏滚动时吸顶，输入框 16px 防 iOS 缩放，窄屏表格横向滑动。
- **零外部依赖**：mammoth.js / SheetJS 解析库与页面同目录本地加载，不依赖任何第三方 CDN；库文件缺失时页面会给出明确的部署提示。
- **友好错误提示**：404（文件不存在）、CORS 拦截、代理不可用、.doc 老格式等场景给出针对性的解决办法。

## 三、快速开始

1. 把 `index.html` 部署到任意静态主机（或本地用 PHP/Python 起一个静态服务器打开）。
2. 粘贴文档 URL 点「加载文档」，或点「打开本地文件」选择本地文件。
3. 想加载远程文档但页面和文档不同域时，按第四节配置跨域。

> 注意：直接双击以 `file://` 方式打开时，「加载文档」加载远程文件会被浏览器跨域拦截，但「打开本地文件」功能始终可用。

## 四、部署方式（按推荐顺序）

### 方式 A：EdgeOne Makers 托管 + Edge Functions（推荐，无需 PHP）

Makers 控制台里没有"边缘函数"菜单，函数功能叫 **Functions → Edge Functions**，用法是把函数文件放进项目的 **`edge-functions/`** 目录，随项目一起部署，文件名自动映射为路由：

1. 把整个项目文件夹（含 `index.html` 和 `edge-functions/proxy.js`）上传到 EdgeOne Makers（支持 Git 连接、CLI、MCP 或直接上传）。
2. `edge-functions/proxy.js` 会自动映射为 `/proxy` 路由，无需任何控制台配置。
3. 验证：浏览器访问 `https://yidianyisi.cn/proxy?url=https://www.3520.net/ks/j.docx` 能下载到文件即成功。

原理：页面先直连目标文件，被浏览器跨域拦截时自动改走同域名的 `/proxy` 边缘函数，由边缘节点代取文件。页面与中转同源，不存在跨域。边缘函数自带文档类型白名单，防止被当作任意 URL 代理滥用。

> 规范说明：Makers Edge Functions 位于 `edge-functions/` 目录，导出 `onRequest(context)`（或 `onRequestGet` 等），签名 `context` 含 `request` / `params` / `env`；路由与静态资源冲突时静态资源优先；限制：单函数 5MB、CPU 200ms。详见官方文档 cloud.tencent.com/document/product/1552/127416。

### 方式 B：与文档同域部署（最简单）

把 `index.html` 上传到与文档相同的目录（如 `www.3520.net/ks/`）。同源请求不涉及跨域，什么代理都不需要。

### 方式 C：PHP 主机 + proxy.php

把 `index.html` 和 `proxy.php` 一起放到支持 PHP 的主机。页面直连失败时自动走 `proxy.php?url=...` 中转。注意 Windows PHP 需在 php.ini 配置 `curl.cainfo` 指向 CA 证书包，否则 HTTPS 抓取会静默失败。

### 方式 D：Apache + .htaccess

在文档目录放 `.htaccess`（已备好），加 `Header set Access-Control-Allow-Origin "*"`。之后任何页面的直连都能成功，不需要任何代理。要求宿主机启用 mod_headers。

### 关于 `.doc` 老格式

页面内置了 `.doc`（OLE2 / Word 97-2003）的尽力解析：用 SheetJS 内置的 CFB 模块拆开 OLE2 容器，解析 FIB + piece table 提取正文文字（支持 UTF-16LE 与 8-bit 两种存储方式）。大多数文件的正文可以完整读出，但复杂排版、图片、表格样式会丢失；提取失败时页面会提示用 Word 另存为 `.docx`。

## 五、使用说明

- **加载远程文档**：粘贴 URL（支持带查询参数）→「加载文档」。
- **打开本地文件**：「打开本地文件」→ 选择 `.docx` / `.xlsx` / `.xls` / `.doc` / HTML 文件。每次选择后自动重置，可重复选同一个文件。
- **关键词查找**：输入关键词 →「查找」→ 全部命中高亮；「上一个 / 下一个」循环定位，当前命中自动滚到屏幕中央。
- **手机访问**：直接用手机浏览器打开即可，查找栏固定在屏幕顶部。

## 六、SEO / GEO 优化说明

页面已内置：

- **SEO**：语义化标题（title 含关键词）、`meta description` / `keywords` / `robots`、Open Graph 与 Twitter Card 标签、`rel=canonical`、`<h1>` 页面主标题、`<main>` 语义标签、`role="search"` 与 `aria-label` 无障碍标注、JSON-LD 结构化数据（WebApplication + FAQPage）。
- **GEO（生成式引擎优化）**：JSON-LD FAQPage 结构化数据（AI 引擎优先引用带结构化答案的内容）、`llms.txt`（供 AI 爬虫快速理解站点用途与用法）、`robots.txt` 显式允许 GPTBot / OAI-SearchBot / ClaudeBot / PerplexityBot / Google-Extended 等主流 AI 爬虫。

**部署后必须完成的事**：

域名已配置为 `yidianyisi.cn`（站点名「一点意思文档查看器」），canonical / sitemap / robots.txt / llms.txt 均已指向该域名。部署后只需：

1. 在 EdgeOne 上绑定域名 `yidianyisi.cn` 并确保 HTTPS 可访问。
2. 在百度站长平台 / Google Search Console 提交 `sitemap.xml`。

## 七、常见问题排查

| 现象 | 原因 | 解决 |
|---|---|---|
| 提示 `HTTP 错误：404` | 文件未上传或 URL 路径错误 | 确认文件已上传、路径正确 |
| 提示 `Failed to fetch` / 代理均不可用 | 浏览器跨域(CORS)拦截，且无可用代理 | 按第四节配置同域部署 / .htaccess / Edge Functions；或用「打开本地文件」 |
| 提示检测到 .doc 老格式 | OLE2 二进制提取正文失败（罕见的老格式变体） | 用 Word 另存为 .docx |
| docx 显示为空或乱码 | 文件实际不是 docx（扩展名冒充） | 页面按魔数识别，若魔数也不是则提示无法识别 |
| proxy.php 返回空内容 | PHP 未配置 CA 证书（Windows 常见） | php.ini 配置 `curl.cainfo` / `openssl.cafile` |
| 双击打开页面加载远程失败 | file:// 无法跨域也无法走代理 | 用本地静态服务器打开，或用「打开本地文件」 |

## 八、实现原理简述

1. **抓取**：`fetch` 直连目标文件（带 `Accept` 头），失败且非 HTTP 错误时依次尝试 `proxy.php`、`proxy`（EdgeOne 边缘函数）。
2. **识别**：读取文件头魔数——`PK` 为 zip 容器（按扩展名区分 docx/xlsx）、`<!DOCTYPE html`/`<html` 为 HTML、`D0 CF 11 E0` 为 OLE2（老 doc/xls）。
3. **解析**：HTML 直接渲染；docx 交给 mammoth.js；xlsx/xls 交给 SheetJS 渲染成 HTML 表格；doc 用内置解析器提取正文（CFB 拆 OLE2 容器 + piece table 文本提取）；解析库均为本地文件，无任何 CDN 依赖。
4. **查找**：遍历 viewer 文本节点，正则命中处拆分节点并插入高亮 span，导航时切换 `current-highlight` 并滚动定位。
