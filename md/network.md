# 正向代理
  类似 vpn,用户需要线连接 vpn,再通过 vpn 访问服务器
# 反向代理
  用户发起请求被反向服务器接收到,再由服务器决定转发给某个具体的服务.反向服务器决定了客户端最终访问到的目标服务器.
# 浏览器同源策略
  为了保证 html 安全性,小阳台 协议+域名+端口三者相同.ip 无效
  限制了 cookie localStorage读取
  Dom js 对象无法获得
  ajax 请求
# 跨域解决方案
1、 通过jsonp跨域
2、 document.domain + iframe跨域
3、 location.hash + iframe
4、 window.name + iframe跨域
5、 postMessage跨域
6、 跨域资源共享（CORS） Access-Control-Allow-Origin
7、 nginx代理跨域
8、 nodejs中间件代理跨域
9、 WebSocket协议跨域
   