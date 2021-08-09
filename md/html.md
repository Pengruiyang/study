#  dom 变动观察器 Mutation observer
## 语法
  ```js
    let observer = new MutationObserver(callback)
    observer.observe(node, config)
  ```

# HTTP压缩
web 服务器和浏览器之间压缩传输的文本内容的方法.例如 gzip 压缩 HTML、js、css 文件.大大减少网络传输数据量.用增加服务器开销来提高用户网页速度.
## http 内容编码和 http 压缩的区别
http 压缩,在 http 协议中,就是内容编码的一种.
## http 压缩过程
1. 浏览器发送 request 给 web 服务器,request 中有 Accept-Encoding: gzip(告诉服务器,浏览器支持 gzip 压缩)
2. 服务器接收到 request 后,生成原始的 response,有原始的 Content-Type 和 Content-Length.通过 Gzip 压缩对 response 编码.发送压缩后的信息给浏览器
3.浏览器接受 response 后,根据 Content-Encoding 对 response 解码获得原始数据.显示页面.
## gzip 缺点
对 jpeg 文件不友好,压缩需要占用cpu 资源.客户端解析也占据一部分时间,
## gzip 级别
有 1-9 个级别.级别越高消耗 gpu 性能越大.到 6 以上就很难有提升了,一般建议 默认 1 就行了.