# koa 中间件
  1. koa-router
  2. koa-bodyparser
    将 pst 请求和表单提交的查询字符串内容转换成对象.并挂在 ctx.request.body 方便我们在其他中间件或接口处取值.
  a:
    Content-type:application/json 调用 co-body json 处理模块
    raw-body 模块获取完整的二进制流数据
    Inflation 模块 根据 Content-Encoding 进行相应内容解压处理
    iconv-lite 模块 根据 Content-type charse 进行字符编码处理

    JSON.parse 进行字符串解码
  b:
    content-type:application/x-www-form-urlencoded 调用 co-body  form 处理模块

    qs 模块进行 URL 编码解码

  c:
    Content-type:text/plain 调用 co-body text 处理模块


  之后将报文主题挂载在 ctx.request.body上

  3.koa-view 识图模板渲染
  4.koa-static 静态资源请求
  5.koa-jwt Json web tokens 使用 jwt 认证 Http 请求
  6.koa-logger 请求日子
  7.koa-compress Gzip压缩传输内容
