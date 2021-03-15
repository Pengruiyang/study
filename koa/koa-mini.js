const http = require('http');
// http server的封装
class Application {
  constructor() {
    this.middleware = [];
  }
  listen(...args) {
    // const server = http.createServer(this.middleware);
    const server = http.createServer(async (req,res)=>{
      // 构建 context 对象 理解 koa 上下文
      const ctx = new Context(req,res)
      // 与 koa 兼容 context 的 app.use 函数
      // this.middleware(ctx)

      //对中间件回调函数串联 形成洋葱模型
      const fn = compose(this.middleware)
      fn(ctx)      
      // ctx.body 为相应内容
      ctx.res.end(ctx.body)
    })
    server.listen(...args);
  }
  // 这里依旧调用的是原生 http.createServer 的回调函数
  use(middleware){
    this.middleware.push(middleware)
  }
}

class Context {
  constructor(req,res){
    this.req = req
    this.res = res
  }
}
function compose(middlewares){
  return ctx => {
    const dispatch = i => {
      const middleware = middlewares[i]
      if(i === middlewares.length){
        return 
      }
      return middleware(ctx, ()=>{dispatch(i + 1)})
    }
    dispatch(0)
  }
}

const app = new Application()
app.use(async (ctx, next) => {
  ctx.body = 'hello, one'
  // await next()
  // console.log(4);
})

// app.use(async (ctx, next) => {
//   ctx.body = 'hello, two'
//   console.log(2);
//   await next()
//   console.log(3);
// })
app.listen(3001,()=>{
  console.log(`启动了`);
})