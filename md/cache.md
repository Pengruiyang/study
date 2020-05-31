# DNS 预解析
  <link rel="dns-prefetch" href="" />
  Chrome 和 Firefox 3.5+ 能自动进行预解析

# 强缓存和协商缓存
 浏览器发起HTTP请求 – 服务器响应该请求。那么浏览器第一次向服务器发起该请求后拿到请求结果，会根据响应报文中HTTP头的缓存标识，决定是否缓存结果，是则将请求结果和缓存标识存入浏览器缓存中
 浏览器每次发起请求,会现在浏览器缓存中查找该请求的结果已经缓存标识
 浏览器每次拿到返回的请求结果就会将改结果和缓存标识存入浏览器缓存中
 强缓存 
  不需要发送请求到服务端,直接读取浏览器本地缓存.分为 Disk Cache 和 Memory Cache.存放位置由浏览器控制.强缓存由 Pragma、Cache-control、Expires 3 个header 老婆么高中
  Pragma 
   只有一个值 no-cache 不使用强缓存 优先级最高
  Cache-control 
    http1.1 中新增属性 
    max-age:秒 距离发起请求秒数,超过间隔缓存失效
    no-cache 不使用强缓存
    no-store 不使用缓存(包括协商缓存)
    private cdn 中间代理不得缓存
    public 可以被中间代理 cdn缓存
  Expires 
    本地系统时间 超过重新请求
协商缓存
 当强缓存失效了或者设置不走强缓存,并且请求头中设置了 If-Modified-Since 或者 If-no-match 时,
 回去服务端验证是否命中协商缓存.命中了返回 304 加载浏览器缓存.设置 last-modified 或 Etag 属性.
  ETag/if-none-match
  哈希值
  Last-Modified/if-Modified-since
  文件最后修改时间 判断不了一秒之内的修改
协商缓存不像强缓存一样有优先级,一般是配合使用,etag 计算复杂度比 last-Modified 更高,而 last-Modified 不如 etag 精准
