// EdgeOne Makers 边缘函数（Edge Functions）：文档跨域中转代理
//
// 用法：本文件放在 Makers 项目的 edge-functions/ 目录下，
// Makers 自动将 edge-functions/proxy.js 映射为 /proxy 路由，随项目一起部署，
// 无需在控制台单独创建函数或粘贴代码。
//
// 验证：浏览器访问 https://yidianyisi.cn/proxy?url=https://www.3520.net/ks/j.docx
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

    const resp = await fetch(target, { redirect: "follow" });
    const headers = Object.assign({}, CORS, {
        "Content-Type": resp.headers.get("Content-Type") || "application/octet-stream",
    });
    return new Response(resp.body, { status: resp.status, headers });
}
