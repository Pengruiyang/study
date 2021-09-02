## Error 的扩展
```js
  const oldError = Error
  Error = function({code,message,fileName,lineNumber}){
    const error = oldError(message,fileName,lineNumber)
    error.code = code
    return error
  }
```

## Error 手动抛出和自动抛出
  一个异常发生时,其会沿着函数调用栈逐层返回,直到第一个catch 语句,catch 语句内部也可以触发异常.如果 catch 语句内部发生了异常,也一样会沿着其函数调用栈继续执行上述逻辑.

## 异常的传播

##  window.onerror 
js运营错误时触发,onerror 可以接受多个参数(message,source,lineno,colno,error)
## window.addEventListener('error',e => {},true)
比 window.error 先触发,不能阻止默认事件处理函数执行.但可以全局捕获资源加载异常的问题

## 如何监控网页崩溃?
service




# 项目实现
## 架构层次
分为搜集上报端、采集聚合端、可视分析端、监控告警端
### 搜集上报端
#### 错误类型
JS 执行错误
1. SyntaxError 解析时发生语法错误
2. TypeError 值不是期待的类型
3. ReferenceError 引用未声明的变量
4. RangeError 当一个值不在其所允许的范围或集合中
网络错误
1. ResourceError 资源加载错误
2. HttpError http 请求错误
#### 搜索错误
try/catch: 可以捕获常规运行时错误,预发错误和异步错误不行
window.error: 可以捕获常规运行时错误、异步错误.不能捕获语法错误和 资源错误
window.addEventListener: 图片、script、css 加载错误可以被捕获,new Image 和 fetch 错误不能被捕获
promise 异常 可以通过 addEventListener 中 unhandledrejection监听捕获.
react 错误边界.通过 componentDidCatch 声明一个 ErrorBoundary,组合 getDerivedStateFromError 显示降级 UI.**但是 ErrorBoundary 不会捕获以下错误: react 事件、异步代码、组件自身抛出的异常**
跨域 JS 出现问题: window.onerror会出现 Script Error.可以通过 try/catch抛出问题.
1. 封装一个方法,修饰源方法,使其可以被 try/catch
2. 改写原生 addEventListener,使其 try/catch 包裹
#### 上报接口
发送图片,1✖️1 的透明 gif(比 png、jpg、bmp 更小).可以跨域,不会携带 cookie、不需要等待服务器返回数据.
非阻塞加载: 先用 window.onerror 错误记录进行缓存,异步的进行 SDK 加载.在 SDK 中处理错误上报.

### 日志服务器
计算单个错误事件: 不同用户发生相同错误类型、错误信息的能力.
通过 message、colno(出错列位置)、和 lineno(出错行位置) 生成 errorKey.

#### 错误过滤
域名过滤、重复上报、
#### 错误接收
1. 接收后打印到磁盘中
2. 削峰机制.根据请求量减少最多接收机制,定时重置.

#### 错误存储
### 可视化平台
1.source-map.hidden-source-map,相比 source-map 少了行尾的注释,但是输出的map 文件并没有少,避免线上 source-map 泄露.约定号目录规则,指定上传的 source-map 地址.
2. 报警设置. 对接钉钉或者企业微信机器人.设置阈值、时间跨度、报警轮询间隔

### 扩展
#### 用户行为收集
行为分类: 点击、滚动、聚焦/失焦、长按
浏览器行为: 请求、前进/后退、跳转、新开页面、关闭
控制台行为: log、warn、error
**搜集方式**