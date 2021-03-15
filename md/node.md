# 为什么 node 第一个参数规范是 err?
  当我们使用 try/catch 捕获异常的时候,只适用于同步的 JavaScript.异步的情况下,我们需要把 catch 中 err 当做参数传递给 callback.将错误作为第一个参数可以确保检查的一致性
# 垃圾回收机制
  分为新生代老生代.
  新生代 分为 from/to 一个出于使用中,一个闲置状态.分配对象时在 from 中分配.
  垃圾回收时从 from 空间中查找存活的对象,复制到 to 空间.非存活对象释放.然后将 from 和 to 空间角色互换.一个对象多次复制依然存活,就会晋升到老生代中
  laoshengdai 标记清除,清理过程后,可能会出现内存不连续的状态.对后续内存分配问题.会进行标记整理
# 介绍 pm2
  pm2 是 node 进程管理工具 可以利用它来简化 node 应用管理的繁琐任务,如性能监控 自动重启 负载均衡等
  ## master 挂了 pm2 如何处理
  ```
  // 无缝重启
    process.on('message', function(msg) {  
      if (msg === 'shutdown') {
        close_all_connections();
        delete_cache();
        server.close();
        process.exit(0);
      }
    });
  ```
# nodejs Cluster集群模式
  入口: 
    1 会根据当前的 ID(Master、Worker) 判断环境变量中是子进程还是主进程,然后引用不同的 js 文件.
    2.NODE_UNIQUE_ID 是唯一表示,cluster 多进程模式,采用默认的算法是 round-robin(轮询)/
    集群模式会创建一个 master 模块,复制任意多份程序并启动.这就是工作线程.工作线程通过 IPC 频道进行通信并使用了Round-robin algorithm算法
    Round-robin Scheduling 轮询调度算法
    把每一次任务轮流分配给内部中工作线程. 
  ## 监听同一个端口却不会报错
    所有的 net.Socket 被设置了 SO_REUSEADDR.
    SO_REUSEADDR是什么?
    服务端主动断开链后,需要等待 2 个 MSL 以后才能最终释放这个链接,重启以后需要绑定同一个端口,默认情况下,操作系统的实现都会阻止新的监听套接字绑定到这个端口上.
    TCP 链接只要还有链接在使用这个本地端口,就不能被重用(bind 失败)
    而启用 SO_REUSEADDR 套接字可以解除这个限制,默认值为 0,表示关闭,1 表示允许端口重用.
  ## listen 函数源码
  ```js
    function listen(self,address,port,addressType,backlog,fd,exclusive){
      exclusive = !!exclusive
      if(!cluster) cluster = require(cluster)
      if(cluster.isMaster || exclusive){
        self._listen2(address,port,addressType,backlog,fd)
        return
      }
      cluster._getServer(self,{address,port,addressType,fd,flags:0},cb)
      function cb(err,handle){
        // 传入的 回调函数中handle 把 listen 方法重新定义为返回 0
        // 真正监听端口的只有主进程.
        self._handle = handle
        self._listen2(address,port,addressType,fd)
      }
    }
  ```
  *listen 函数会根据是不是主进程做不同的操作.*
  在 cluster._getServer 函数代码中,向 master 进程注册该 worker,若 master 进程使第一次监听这个端口下的 worker,则内部起一个 tcp 服务器,来负责监听该端口,随后在 master 中记录下 worker.
  Hack(侵入)掉 worker 进程中的 net.Server 实例 listen 里监听端口的部分,使其不再承担该责任.对于监听同一端口这件事,由于是 master 在接受,传递请求给 worker,会按照一定的负载均衡规则.逻辑被封装在 RoundRobinHandle 中,初始化内部 TCP 服务器操作也在这里
  ```js
    function RoundRobinHandle(key,address,port,addressType,backlog,fd){
      // ...
      this.handles = []
      this.handle = null
      this.server = net.createServer(assert.fail)
      if(fd >= 0){
          this.server.listen({fd})
      }else if(port > 0){
        this.server.listen(port,address)
      }else{
        this.server.listen(address)
      }
      // ...
      var self = this
      this.server.once('listen',function(){
        // ...
        self.server.onconnection = self.distribute.bind(self)
      })
    }

    // 分配
    RoundRobinHandle.prototype.distrubute = function(err,handle){
      this.handles.push(handle)
      var worker = this.free.shift()
      if(worker) this.handoff(worker)
    }
    RoundRobinHandle.prototype.handoff = function(worker){
      var message = {act: 'newconn', key: this.key }
      var self = this
      sendHelper(worker.process,message,handle,function(replay){
        // ...
      })
    }
    // 在子进程中 
    function listen(backlog){
      return 0
    }
    function close(){}
    function ref() {}
    function unref() {}
    var handle = {
      close,listen,ref,unref
    }
  ```
    由于 net.Server 实例中 listen 方法,最终会调用自身_handle 属性下 listen 方法完成监听.所以在代码中修改为,此时 listen 方法被修改了,调用只能返回 0,不会再监听端口.
    ![image.png](https://mmbiz.qpic.cn/mmbiz_png/iawKicic66ubH6AvhIdFzuKzzboL0oXzZPNZJ7yBYb3yHjJU5GCeUL6seomawJTx3FqXegGryrVRzK1EG8JajQQicA/640?wx_fmt=png&tp=webp&wxfrom=5&wx_lazy=1&wx_co=1)
  ### cluster模式:
    主进程: 主动监听端口,开启SO_REUSEADDR 设置.允许端口复用.主进程启动统一的内部tcp 服务器.负载均衡,每次取出一个 worker子进程发送客户端消息
    多个子进程: 重新 net 模块的 createServer每次调用listen 方法,通过参数传入 =>子进程根据主进程发送的客户端消息创建 net.Socket实例,执行具体业务逻辑,返回响应给主进程.
  **worker 子进程:创建server 实例,通过 IPC通道向 master 进程发送消息,master 进程也创建 server 实例,并且在该端口监听请求,有请求时,master 进程将进程转发给 worker 进程的 server 实例** 
  ### 如何将请求分发到多个worker
  轮询,当有客户请求到达时,,master会轮询一遍
  ### 负载均衡流程worker 列表,找到第一个空闲的worker,然后将该请求转发给他
  1.所有请求先统一经过内部的 TCP 服务器,真正监听端口的只有主进程.
  2.在内部 TCP 服务器请求逻辑中,由有负载均衡挑选出一个 worker 进程,将其发送一个 newconn 内部信息,随消息发送客户端句柄(句柄:类似于内存指针的东西)
  3.Worker 进程接收到内部信息,根据客户端句柄创建net.Socket实例,执行具体的业务逻辑,返回.

# PM2
pm2:启动你的 node 服务,根据你的电脑去启动相应的进程数,监听错误事件,自动重启子进程,即使更新了代码,需要热更新,也会逐个替换.
功能:
1.内建负载均衡
2.后台运行
3.0 秒停机重载,维护升级时不需要停机
4.停止不稳定进程(避免无限循环)
5.控制台检测
6.提供 HTTP API
7.远程控制和实施的 API接口(nodejs 模块允许和pm2 进程管理器交互)
### 如何检测子进程是否活跃状态?
采用心跳检测,每隔数秒向子进程发送心跳包,如果子进程不回复,就调用 kill杀死这个子进程,
然后再 cluster.fork()一个新进程
### 子进程发出异常报错,如果保证有一定数量的子进程?
子进程可以监听错误事件,发送信息给主进程,请求 kill 自己,然后主进程 cluster.fork()一个index 子进程
# node 链接 mysql 流程
```
  // 调用 MySQL 模块
  var mysql = require('mysql')
  // 创建 connection
  var connection = mysql.createConnection({
    host: 'l92.168.0.200',   //主机
    user: 'root', //MySQL认证用户名
    password: '123', //mysql用户认证密码
    port: '3306'
  })
  // 创建 connect 
  connection.connect(function(err){
    if(err){
      return
    }
    console.log('[connection.connect] success!')
  })
  // 执行 SQL 语句
  connection.query('SELECT 1 + 1 AS solution',function(err,rows,fields){
    if(err){return}
  })
  // 关闭 connection
  connection.end(function(err){
    if(err)return
  })
```
# commonjs 和 es6 模块导出

CommonJs 规范加载模块是同步的,nodeJs 主要用于服务器变成,模块文件一般已存在本地硬盘,加载比较快.输出的一个值的拷贝.运行时加载模块

### commonJS

```js
  Module {
    id: '.', // 如果是 mainModule id 固定为 '.',不是则为模块的绝对路径
    exports: {}, //模块最终 exports
    filename: '/absolute/path/to/entry.js', //当前模块的绝对路径
    loaded: false, // 模块是否加载完毕
    children: [], //被该模块引用的模块
    parent: '', //第一个引用该模块的模块
    path: [ // 模块的搜索路径
      '/absolute/path/to/node_modules',
      '/absolute/path/node_modules',
      '/absolute/node_modules',
      '/node_modules'
    ]
  }
```
#### require 哪里来?(module，__filename, __dirname 这些变量，为什么它们不需要引入就能使用？)
Node 在解析 JS 模块时,会先按文本读取内容,然后将模块内容进行包裹,在外层包裹了一个 function,传入变量.再通过 vm.runInThisContext 将字符串转成 Function 形成作用域,避免全局污染.
```js
  let wrap = function(script){
    return Module.wrapper[0] + script + Module.wrapper[1]
  }
  const wrapper = [
    '(function (exports,require,module,__filename,__dirname){',
    '\n});'
  ]
```
参数中 module 是当前模块 module 实例,exports 是 module.exports 别名,最终被 require 的时候输出 module.exports 的值.require 最终调用的也是 Module._load 方法.__filename,__dirname 则分别是当前模块在系统中的绝对路径和当前文件夹路径.
#### MainModule
# node 加载文件规则
1.判断是不是相对路径 './' '../'开头的
2./开头,表示从系统根目录开始寻找该模块文件.
3.如果不以 */、./、../*开头,则认为是一个核心模块,先从 node提供的核心模块去查找,再从 npm 第三方模块包去查找.在寻找 npm 包时,会从当前目录出发,向上寻找node_modules中文件,若存在同名文件,遵循就近原则.
加载文件顺序为 .js => .json => .node(c++模块)
require 目录机制:
  如果目录下有 package.json 文件,并指定了 main 字段,并用他.
  如果不存在packet.json,依次尝试加载目录下 index.json 和 index.node 文件.

# nodejs 如何监听文件夹
使用 fs.watch进行监听,对于不同平台调用不同原理.macos是 FSEvents,linux 中原理是inotify,window 是ReadDirectoryChangesW.内核对文件监听很敏感,需要防抖+文件 md5校验文件变更,防止多次触发事件.
# Node 如何进行进程间通信
父子进程: process.on('message') process.send 
对于无关的进程 socket/message queue
# Node 中max-old-space-size=4096
编译时node 内存溢出,需要在 packet.json 配置
# Buffer
  如果没有提供编码格式,文件操作以及很多网络操作就会将数据作为 Buffer 类型返回.
# 流
  流是基于事件的 API,用于管理和处理数据.

    * 流是能够读写的
    * 基于事件实现的一个实例,理解流的最好方式就是想象一下没有流的时候怎么处理数据
    * fs.readFileSync 同步读取文件,程序会阻塞,所有数据被读到内存
    * fs.readFile 阻止程序阻塞,但仍会将文件所有数据读取到内存中
    * 希望少内存读取大文件,读取一个数据块到内存处理完再去索引更多的数据

  ## 流的类型
    * 内置:许多核心模块都实现了流接口,如 fs.createReadStream
    * http: 处理网络技术的流
    * 解释器: 第三方模块 XML、JSOn 解释器
    * 浏览器: Node流可以被拓展使用在浏览器
    * RPC(远程调试): 通过网络发送流是进程间通信的有效方式
  ## 流的类型
  ### 静态服务器
  ```js
    // 不使用流
    const http = require('http')
    const fs = require('fs')
    const zlib = require('zlib')
    http.createServer((req,res) => {
      fs.readFile(`${__dirname}/index.html`,(err,code) => {
        if(err){
          res.statusCode = 500
          res.end(Sring(err))
          return
        }
        res.end(data)
      })
    }).listen(8000);

    //使用流
    http.createServer((req,res) => {
      //提供一个缓冲区发送到客户端
      fs.createReadStream(`${__dirname}/index.html`).pipe(res)
    }).listen(8000)

    //使用流 + gzip
    http.createServer((req,res) => {
      res.writeHead(200,{
        'content-encoding': 'gzip'
      })
      fs.createReadStream(`${__dirname}/index.html`)
        .pipe(zlib.createGzip())
        .pipe(res)
    }).listen(8000)
  ```
# nodejs 中间件
  中间件是介于应用系统和系统软件之间的一类软件,他使用系统软件所提供的基础功能,衔接网络上应用系统的各个部分或者不同的应用,能够达到资源共享、功能共享的目的.
  在NodeJS中,




  



