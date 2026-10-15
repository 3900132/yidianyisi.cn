<?php
// 允许跨域
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/octet-stream");

$url = $_GET['url'] ?? '';
if(empty($url) || !filter_var($url,FILTER_VALIDATE_URL)){
    exit("非法链接");
}
// 只允许中转文档类型，防止被当作任意URL代理
$ext = strtolower(pathinfo(parse_url($url, PHP_URL_PATH) ?? '', PATHINFO_EXTENSION));
$allow = ['doc','docx','xls','xlsx','pdf'];
if(!in_array($ext,$allow)){
    http_response_code(403);
    exit("仅允许文档类型：".implode('/',$allow));
}
// 抓取远程文件
$ch = curl_init($url);
curl_setopt($ch,CURLOPT_RETURNTRANSFER,true);
curl_setopt($ch,CURLOPT_FOLLOWLOCATION,true);
curl_setopt($ch,CURLOPT_ENCODING,"");            // 接受压缩传输，加速大文件
curl_setopt($ch,CURLOPT_USERAGENT,"Mozilla/5.0"); // 部分站点拒绝 curl 默认 UA
curl_setopt($ch,CURLOPT_CONNECTTIMEOUT,10);      // 连接超时
curl_setopt($ch,CURLOPT_TIMEOUT,60);             // 总超时，避免长期挂起
$data = curl_exec($ch);
curl_close($ch);
echo $data;
?>