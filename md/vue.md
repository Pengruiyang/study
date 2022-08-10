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
在vue内部,nextTick之所以能让我们看到dom更新后的结果,是因为我们传入了callback被添加到队列刷新函数后面,这样,等待队列内部更新函数都执行完了,所有的dom操作也就结束了,callback自然能获得最新的值了.
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

# v-modal双向绑定
v-modal是一个语法糖,默认情况相当于:value和@input,可以减少大量的事件代码,提升效率
vue3中类似于sync修饰符,最终展开的结果是modalValue和update:modalValue.
v-modal是一个指令,在vue编译器上完成的.包含v-modal的模板,转换为渲染函数后,实际还是value属性以及input事件监听,事件回调函数中会做变量更新操作.编译器根据表单元素不同会展开不同的dom属性和事件对,比如input展开为value和input事件,checkbox展开为checked和change事件.
## v-modal和.sync对比
相同点: 都是语法糖,可以实现父子组件通信
不同点: 格式不同, v-modal只能使用一次, .sync可以使用多次
## vue3中如何在自定义组件中使用v-modal
默认v-modal传递的是modalValue,可以通过v-modal:title和emit('update:title')来监听
# vue中扩展组件方法
1. slot
2. extends、composition api

# vue响应式理解
能够使数据变化可以被检测到并对这种变化做出响应的机制
vue2.0中是对象用Object.defineProperty的方式定义数据拦截.
vue3利用了Es6的proxy代理响应化数据,
# 从零设计vue路由
一个spa路由需要页面跳转内容不刷新,同时路由还需要以插件形式存在,所以
1. 定义一个createRouter函数,返回路由器实例.同时内部处理保存用户传入配置项,监听hashchange或者popstate事件,回调根据path匹配路由
2. 将router定义为一个插件,实现install方法,内部处理页面跳转(router-link)和内容实现(router-view).定义全局变量,组件内部可以访问当前路由和路由器实例.\

# watch 和computed区别以及选择
1. 计算属性可以从组件数据派生出新的数据,常用方式是设置一个函数,返回计算之后的结果,具有缓存性,侦听器侦测某个响应式数据的变化并执行副作用
2. 计算属性常用于简化行内模板中的复杂表达式,侦听器在状态变化后做一些额外的dom操作.

# vuex
1. 专门为vue.js应用开发的状态管理模式+库,采用集中式存储,管理应用的所有组件,并以相应的规则保证状态以可预测方式发生变化
2. action主要处理异步的操作,mutation必须同步执行
   
# vue从template到render处理过程
1. vue中编译器模块,将template编译为js可执行的render函数
2. 这个编译过程存在的原因是高效编写视图模块
3. vue中编译器会对template进行解析(parse),结束后会得到一个ast抽象语法树,然后就是对ast进行深加工的转换(transform)过程,将ast转换为js代码,就是render函数

# vue 挂载阶段发生了什么
1. 初始化和建立更新机制
2. 初始化会创建组件实例、初始化组件状态、创建各种响应式数据
3. 建立更新机制这一步会立即执行一次组件更新函数,这会首次执行组件渲染函数并执行patch将前面的vnode转换为dom;同时首次执行渲染函数会创建它内部响应式数据之间和组件更新函数之间的依赖关系,使以后数据变化执行对应的更新函数.