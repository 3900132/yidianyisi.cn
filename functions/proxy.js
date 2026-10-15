// Cloudflare Pages Functions：文档跨域中转代理
//
// 用法：本文件放在 Cloudflare Pages 项目的 functions/ 目录下，
// CF 自动将 functions/proxy.js 映射为 /proxy 路由（约定与 EdgeOne Makers 一致，仅目录名不同）。
// 导出签名 onRequest(context) 与 EdgeOne Makers 的 edge-functions 写法完全兼容。
//
// 注意：Cloudflare Pages 的「拖拽上传」不支持 Functions，需要用 Git 连接部署，
// 或用 Wrangler 命令行上传：npx wrangler pages deploy <目录名>
//
// 验证：浏览器访问 https://你的项目.pages.dev/proxy?url=https://www.yidianyisi.cn/j.docx
// 能下载到文件即部署成功。
//
// 页面（index.html）会先直连目标文件，被浏览器跨域(CORS)拦截时自动改走本函数。

// 只允许中转的文档类型，防止被当作任意 URL 代理滥用
const ALLOW_EXT = new Set(["doc", "docx", "xls", "xlsx", "pdf", "html", "htm"]);

const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "*",
};

export async function onRequest(context) {
    const request = context.request;

    if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: CORS });
    }
    if (request.method !== "GET") {
        return new Response("仅支持 GET", { status: 405, headers: CORS });
    }

    let target = "";
    try {
        target = new URL(request.url).searchParams.get("url") || "";
    } catch (e) { target = ""; }
    if (!/^https?:\/\//i.test(target)) {
        return new Response("非法链接", { status: 400, headers: CORS });
    }

    let path = "";
    try { path = new URL(target).pathname; } catch (e) {}
    const ext = (path.split(".").pop() || "").toLowerCase();
    if (!ALLOW_EXT.has(ext)) {
        return new Response("仅允许文档类型：" + Array.from(ALLOW_EXT).join("/"), {
            status: 403,
            headers: CORS,
        });
    }

    const resp = await fetch(target, {
        redirect: "follow",
        headers: {
            // 带浏览器 UA 和 Accept，减少被目标站点反爬拦截的概率
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
            "Accept": "*/*",
        },
    });
    const headers = Object.assign({}, CORS, {
        "Content-Type": resp.headers.get("Content-Type") || "application/octet-stream",
    });
    return new Response(resp.body, { status: resp.status, headers });
}
