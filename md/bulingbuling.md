# 实现部分文件版本对比工具
同步部分依赖包最新版本(组件库,前端微服务应用联调)
1. 找出我定制需要经常更新的包,和 packages 中没有锁定版本比较.用这些去查找最新的包版本号
2. 基于 node的  **child_process.execSync**(child_process 开启子进程在 在 shell 脚本中同步执行 command),执行 npm view version 命令获得最新的版本号
3. 一个计算版本号的方法.每个位置权重 1000,
4. 获取所有需要更新的包和版本号更新.


# babel-plugin customName 功能 开发思路
基于 babel-plugin-import 插件,在编译阶段将引用指向了模块所在的文件夹.并在文件夹中做出配置.
针对 icon 这种有很多子组件,对子组件针对处理

# 写过 tinypng plugin 源码并实现过
创建 plugin 对象,这个对象必要要有 apply 方法去获取 webpack的 compiler 对象.这个对象是 webpack 的全局单例.负责 webpack 的整个生命周期.包含全部配置信息.基于 webpack 配置的 options 和提供给我们的钩子,emit 是输出 asset 到输出文件执行的钩子,tapPromise 的 promise 操作去监听插件名,在本次 构建 compilation 对象中.找出符合规则的图片.按照 tinypng 规定的 api 上传图片.同时基于spinner对 shell 语句进行文件状态的输出.然后等待 tiny-png 处理好了之后再下载文件.最后 chalk 输出文件前后打包大小区别压缩程度.
# 想法可能比较新颖并愿意实践
