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
# 浏览器多进程架构
 1.浏览器进程
 2.渲染进程
 3.插件进程
 4.GPU进程
 优点: 
  渲染京城出问题不会影响其他进程
 缺点:
  不同进程间内存不共享
# 常见http 请求码
100
2xx 成功处理了请求的状态码
  200 服务器成功处理了请求
  201 请求成功并且服务器创建了新的资源
  202 服务器接收请求,但尚未处理
  203 服务器成功处理了请求,单返回的信息来自另一来源
  204 （无内容）服务器成功处理了请求，但没有返回任何内容
  205 （重置内容） 服务器成功处理了请求，但没有返回任何内容
  206 （部分内容） 服务器成功处理了部分 GET 请求
3xx 完成请求,需要进一步操作.通常用来重定向
  300   返回一个有多个连接选项的页面,用户自行选择从定向
  301 （永久移动）请求的页面已永久移动到新位置,之后会自动将请求转到新位置
  302 （临时移动）服务器目前从不同位置的网页响应请求，但请求者应继续使用原有位置来进行以后的请求
  303 （查看其他位置） 请求者应当对不同的位置使用单独的 GET 请求来检索响应时，服务器返回此代码
  304 （未修改）自从上次请求后,页面没有修改过.使用缓存
  305 （使用代理）请求者只能用代理访问请求的页面.
4xx 客户端出现错误
  401 没有提供认证信息
  403 没有权限
  404 内容不存在


5xx 服务器出现错误
  500 服务器错误
  502 网关错误
  503 展示不可用
# cookie 与 storage 区别
cookie 可以自动携带在同源的 http请求中,数据大小不能超过 4k,在设置过期时间前一直有效,在所有同源窗口中共享.
# OSI 网络分层
应用层 表示层 会话层 传输层 网络层 数据链路层 物理层
# TCP/IP 网络分层
应用层 传输层 网际层 连接层
# TCP 和 UDP 区别
  tcp: 面向连接、面相字节流、有状态、保证可交付、具备拥塞控制、点对点传播、有序的.
  udp: 无连接、面向数据报、无状态、不保证可靠交付、不具备阻塞控制、广播多播、无序的.
# 什么是 http 协议
HTTP 超文本传输协议,一个在计算机世界中两点间传输文字、图片、音频、视频、等超文本数据的约定和规范.
# 什么是 CDN
 CDN: 内容分发网络.突破现实生活中传输距离等无理限制,部署大量高储存高带宽的节点,构建的专用高速传输网络.
 通过全局负载均衡,判断最适合用户的节点.通过 HTTP 缓存技术进行代练,看是否需要源站获取资源.
 # websocket
  针对"请求-应答"的通行模式,全双工通信,支付服务端主动推送的能力,加强了 tcp 的功能,运行在浏览器之中.
# http 常用首部字段
  ## 通用首部字段
    Cache-control 强缓存控制
    Connection 连接管理
    Transfor-Encoding 报文主题的传输编码格式
    Date 创建报文的事件
    Upgrade 升级为其他协议
  ## 请求首部字段
    Host 请求资源所在服务器
    Appect 客户端或者代理能够处理的媒体类型\
    If-Match 比较实体标记(Etag)
    If-none-Match
    If-Modified-Since 比较资源更新时间
    User-Agent 客户端信息
  ## 响应首部字段
    Location 重定向 URL
    ETag
    Server
  ## 实体首部字段
  Allow 资源可支持 http 请求方法
  Last-modified 资源最后修改时间
  Expires 实体主体过期时间
  Content-Language 实体资源语言
  Content-Encoding 编码格式
  Content-length 大小
  Content-type 媒体类型
  ## http 的报文请求有那几个部分
  请求行,请求体,数据体,状态行,响应头,响应正文
  ## 预检请求 
  请求方法是 PUT 或 DELETE,或者 Content-type:application/json
  会在正式通信前,进行一次预检请求
  查询服务器支持的 hpttp 方法,和自定义的 header 属性有哪些
  # http 协议头Content-Type和Accept的作用
  Content-Type:发送端发送的数据类型
  Accept:发送端（客户端）希望接受的数据类型
  # 如何计算首屏时间和白屏时间
  白屏时间 = domloading - fetchStart
  domready可操作时间 = domContentLoadedEventEnd - fetchStart
  onload总下载时间 = loadEventEnd - fetchStart
