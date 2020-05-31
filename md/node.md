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
  ## nodejs 集群模式
  集群模式会创建一个 master 模块,复制任意多份程序并启动.这就是工作线程.工作线程通过 IPC 频道进行通信并使用了Round-robin algorithm算法
   Round-robin Scheduling 轮询调度算法
   把每一次任务轮流分配给内部中工作线程. 
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