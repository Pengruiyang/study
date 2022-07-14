# vue 计算属性和侦听属性的区别
 计算属性:依赖的值改变才会改变输出的值.返回一个值或结果.
 侦听属性: 监听 data 或computer从而自行函数而做的某些操作
# vue中响应式数据
借助了defineProperty 将所有的getter和setter进行操作
# vue如何进行依赖手机的
vue初始化的时候,挂载之后进行编译.生成renderFunction,取值的时候,搜集watcher,放到dep中.用户改变值的时候,通知watcher更新
# vue中的模板编译愿意
将template转换为render函数.
1. 将template模块转换为ast语法树-parserHTML
2. 对静态语法做标记
3. 重新生成代码
  
# nextTick原理
微任务.回调是在下次dom更新循环结束后执行的延迟回调,可以用于获取更新后的dom.保证用户定义的逻辑更新后执行.
# vue的diff原理
深度递归 + 双指针
先比较子节点,考虑老节点和新节点儿子的情况..
优先比较:头头、尾尾、头尾、尾头
# 异步组件原理
先渲染异步占位符节点 =>组件加载完成后调用forceUpdate更新
# $attrs作用
解决批量传递数据.
# vue中普通slot和作用域slot区别
普通插槽渲染后替换工作.
作用域曹操拿到子组件属性,在子组件传入属性后渲染
# 自定义指令
1. 生成ast语法树时,遇到指令会给当前元素添加directives属性
2. 通过genDirectives生成指令代码
3. 在patch前,将指令钩子提取到cbs事件处理器数组中,在patch过程中调用对应的钩子
4. 执行cbs对应的钩子时,调用对应的方法

