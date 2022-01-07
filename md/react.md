# 生命周期
  ## 挂载阶段
  constructor 
  componentWillMount 废弃
  static getDerivedStateFromProps
  render
  componentDidMount (commit 阶段)
  ## 更新阶段
  componentWillReceiveProps(废弃)
  static getDerivedStateFromProps
  shouldComponentUpdate
  componentWillUpdate(废弃)
  render
  getSnapshotBeforeUpdate
  componentDidUpDate
  ## 卸载阶段
  componentWillUnMount
## 新增生命周期
  ```js
    componentDidCatch 容错狗子
    static getDerivedStateFromProps、getSnapshotBeforeUpdate 代替废弃的
    componentWillMount、componentWillReceiveProps、componentWillUpdate
    新增的和启用不能混用,另外 React17删除了这三个生命周期
     
  ```

可以 setState 的生命周期
初始化的 constructor
可以 setState componentDidUpdate 
根据判断条件 setState componentDidUpdate 没有判断条件的话会循环调用
# react 和 vue 不同点
1.react 思想函数式思想,组件设计成 纯组件纯函数.单项数据流,推崇数据不可变.vue 思想是响应式,数据可变,对于每一个属性 watcher 监听,属性变化更新对应的虚拟 dom.react 优化需要自己做,大型应用 react 不回因为状态多卡顿,更加可控.
2.react 思路是 all in js 通过 js 操作一切.
3.react类式组件写法 vue 是声明式的写法,参数很多,也就对于 ts 支持并没有很好
4.react 做的事情很少,多数交给社区去处理.而 vue则是内置了许多东西.
vue 设计思想就是简单地使用,而 react 是正确的去应用.
# react 事件合成机制
  1.所有的事件挂载到 document 上.
  2.event 不是原生的,使用 SyntheticEvent 中间层合成事件对象.
  
  维护了一个 map 表,跨浏览器包装了所有原生事件,并且提供了和原生事件相同的接口.需要 event.nativeEvent.
  SyntheticEvent是合并而来.维护了一个事件池,代表这这个对象会被复用.所以为了安全考虑不支持异步访问事件.可以通过event.persist()变成异步访问可以获取到

当事件在具体的 DOM 节点上被出发后,最终都会冒泡到 document 上.document 上所绑定的统一事件处理程序会将事件分发到具体的组件实例上.
在事件分发前,React 会对事件进行包装,把原生的 DOM 事件包装成合成事件.
## react 合成事件
  底层做了不同浏览器的兼容,上层统一面相开发者暴露 接口.
## react 事件系统工作流拆解
### 事件的绑定  
在挂载阶段完成的(**completeWork**).compl 会创建 DOM 节点,插入到 DOM 树种,为 DOM 节点设置属性.在设置属性的环节中,遍历 FiberNode 的 props key 时,发现和事件相关的 api,触发事件的注册链路.
ensureListeningTo 进入事件监听的注册流程 => legacyListenToTopLevelEvent 分发事件监听的注册逻辑 => 判断捕获还是冒泡 => addTrappedEventListener 将事件注册到 document 上.
在legacyListenToTopLevelEvent维护了一个 listenerMap 数据结构,缓存当前 document 监听了哪些事件.这样,react 项目中多次调用了对同一个事件的监听,也只会在 document 上注册一次.

### 事件的触发
通过 dispatchEvent 函数分发事件.
目标触发,冒泡至 document => 执行 dispatchEvent => 创建时间对应的合成事件对象 SyntheticEvent => 收集事件在捕获阶段的回调和对应的节点实例 =>收集事件在冒泡阶段的回调和对应的节点实例 => 将前两步收集来的回调按顺序执行,执行时 SyntheticEvent 会作为入参传入回调中.

####事件回调的收集和执行
通过 traverseTwoPhase 函数.以当前触发事件的目标节点为起点,不断向上寻找符合原生 DOM 元素节点的
父节点,存入 path 数组.
traverseTwoPhase 模拟事件的冒泡、冒泡顺序.两次循环时对应的回调和实例
# react中diff算法  
  ## react diff 策略
  1.tree diff: 对比新旧节点 只会在同级对比,不会跨层级比较
  2.component diff: 拥有相同类的组件会生成相似的树结构,拥有不同类的组件会判定为脏组件,直接删除或者创建新组件.
  3.element diff: 对于同一层的子节点,通过唯一 key 去判断.


# 为什么要在componentDidMount阶段请求数据
  这个生命周期会在组件挂载后(插入 dom 树中)立刻调用.这里触发的渲染不会发生在浏览器更新屏幕前,
# react 组件不同类型
  ##  函数/无状态/展示组件
  函数或无状态组件是一个纯函数,就收传入的 props,返回 react 元素.
  ##  类/有状态组件
  具有状态和生命周期,可以通过 setState 改变组件状态.
  ## 受控组件
  react处理输入表单的一种技术.表单元素维护自己的状态,而 react则在组件状态属性中维护状态.将二者结合控制输入表单.在受控组件表单中,数据有 React 组件处理.
  ##  非受控组件
  多余情况下,建议使用受控组件.
  非受控组件通过使用 Ref 来处理表单数据.Ref 直接操作 dom 访问表单值,而不是事件处理程序.
  ##  容器组件
  用来处理获取数据 订阅 redux 存储等的组件.包含展示组件和其他容器组件,
  ## 高阶组件HOC
  将其他组件作为参数生成一个新的组件.例如 memo、connect、withRouter
# redux 工作原理
Redux 是一个状态管理库,简化了单项数据流,实现了多组件通信.
  redux 分为四个模块
    1.view: 组件状态发生改变时,dispatch 一个 action
    2.action: 描述状态变化的对象,传递给 store
    3.store: 接受 store 并传递给 reducer,驱动 reducer 执行改变状态,更新后刷新 dom 节点
    4.reducer: 对 action对象处理,返回全新的 state给 store.
在 React 中,组件连接 redux.
  创建一个 store 存储数据,定义改变 store 的 action,有各种 reducer 的映射
  UI 操作发出 action 指令.action 中包含一个 action 对象(有 type 值).action 将其转发给 reducer
  reducer 接收到 action 时,通过 switch...case 找到对应的 type.返回一个全新的 state
  然后组件接受新的状态作为 props,
  核心createStore 有    subscribe, dispatch,getState,replaceReducer
  每一次 listenerList 变更 都会先拷贝一份当前 listenerList 处理,防止解绑之后其中无法被触发

  中间件怎么拿到 store 和 action ?
    1.createStore 时通过 applyMiddleware 把中间件和 store 关联.中间件将传入的方法参数转成数组,第一次中间件是第一次 dispatch(action,0),后续中间件拿到的是之前中间件处理后的触发dispatch 传入的 action
  ```js
    const middle = store => next => action => {
      console.log('dispatch',dispatch)
      let result = next(action)
      console.log('next state',store.getState())
      return result
    }
    // 当我们调用applyMiddleware方法时
    applyMiddleware(store,[logger])
    // 会依次middlewares数组中的方法，并且每次执行都重新封装store.dispatch
    middlewares.forEach(middleware => dispatch = middleware(store)(dispatch))
  ```
# react router 
分为 HashRouter 和 BrowserRouter 模式.
hash 模式通过读写 hash 值,监听 hashChange 去渲染不同的组件.
history 是通过 window.history 这个对象.监听 popState 去渲染不同组件.通过 pushState 完成 push 方法,改变地址后,执行监听函数.
Router 的实现,通过 React.createContext 借助 history 对象的一个高阶组件.在这个组件中去监听 history 的 listen 方法,再重新触发组件更新,更新 history,location值.Route 通过 context 和 path 去匹配对应的组件.
# react 代码分割路由动态加载
  1. 原理
  先判断installedChunks对象,用来缓存已加载的 chunk,是否已加载?
  如果 chunk 未加载,则构造对应的 Promise 并缓存在installedChunks对象中
  然后构建 script 标签 加载完成的话就把installedChunks中当前 chunk 状态变为已加载
  2.代码 (或者使用 react-loadable)
  ```js
    const OtherComponent = React.lazy(() => import(/* webpackChunkName: "OtherComponent" */'./OtherComponent'));
  ```
# 同构 ssr
  前后端渲染相同的 Component 输出一致的 Dom结构
  react 的虚拟 dom 用对象树的形式保存在内存中,可以支持任何的 JavaScript 环境中生成.
  虚拟 dom renderToString 转换成 string
  插入到浏览器中直接展示即可
  ## renderToSting 和 renderToStaticMarkup
  renderToSting 会为组件生成checksum data-react-checksum = "-3123"
  react 在客户端判断是否需要重新 render 相同则不需要,省略创建 dom 和挂载 dom 的过程,接着触发 componentDidMount 等事件来处理服务端上的未尽事宜(事件绑定等),从而加快了交互时间.
# 多个组件之间如何拆分各自的state，每块小的组件有自己的状态，它们之间还有一些公共的状态需要维护，如何思考这块
  状态提升，找到容器组件和展示组件，保证唯一数据源和单向数据
  自己的属性自己保管(state),公用的属性放到 redux 中
# antd 如何按需加载
最新的 antd 支持 es6 模块的 treeshaking 
3.x 的版本支持 react-app-rewired,项目根目录下创建一个 config-overrides 用于修改默认配置
babel-plugin-import
# react 渲染流程
react 将整个流程分为 调度器和 渲染器
  调度阶段:
  ```js
    ReactDom.react(APP,document.querySelector('#app'))
    // 初始化操作已经创建了一个根 Fiber 节点
  ```
    1.(beginWork)向下遍历 JSX,为每个子节点生成对应的 Fiber,并赋值.effectTag 字段表示当前 Fiber 需要执行的副作用,最常用的有 插入 删除 更新 DOM 节点三个操作.首屏渲染只会设计插入 dom 节点.
    2.(completeWork)为每个 Fiber 节点生成对应的 DOM节点.
  做完这两件事情之后,我们需要通知渲染器
    1.哪些 Fiber 节点需要执行哪些操作(effectTag)
    2.执行这些操作的 Fiber 他们对应的节点.
  通过 workInProcess 这个全局变量表示当前 render 阶段正在处理的 Fiber,首屏渲染初始化时,workInProcess = 根Fiber,接着我们调用 workLoopSync 方法,它内部会循环调用 performUnitOfWork 方法,这个方法接受当前 workInProcess 传入,返回下一个需要处理的 Fiber.
  ```js
    function workLoopSync(){
      while(workInProcess){
        workInProcess = performUnitOfWork(workInProcess)
      }
    }
    // 当循环结束,意味着所有节点的调度结束了.
    function performUnitOfWork(unitOfWork){
      // current 当前 Fiber 上一次 render 的结果,alternate属性就是对之前旧 Fiber 节点的引用
      //首次渲染为空
      const current = unitOfWork.alternate
      let next = beginWork(current, unitOfWork)
      if(!next){
        next = compeleteUnitOfWork(unitOfWork)
      }
      return next
    }
  ```
  优化渲染阶段:
   effectList
    在调度阶段,会提前标记 effectTag Fiber 节点,让他们形成链表的形式.
   首次渲染优化:
    调度阶段的时候执行 completeWork 创建 Fiber 对应的 DOM 节点时,遍历这个 Fiber 节点所有子节点,将子节点 dom 插入到创建的 dom 节点下.遍历到根节点时,构建好了一课不展示的DOM树,设置根节点 effectTag = 插入就好了.
  ## react 虚拟dom 到真实 Dom 经历了什么
    首先会判断是文本节点还是类组件或者函数组件,然后拿到这个虚拟 Dom的属性,判断是 classname 还是 style 或者其子节点\其他属性添加到节点上
  
# React挂载的时候有3个组件，textComponent、composeComponent、domComponent，区别和关系，
他们都接受node 参数,根据node 参数的不同生成对应不同的 reactComponent
node 为 null 生成 reactDOMEmptyComponent
node 为数字或者字符串, 生成reactDOMTextComponent
node 为一个对象,则是 reactElement 对象,则生成 reactDOMComponent,ReactCompositeComponent.
这三个对象最后都会通过 mountComponent 转换为html 标记挂载到 dom 上.
# vue 和 react diff 不同
diff 并没有不同,只有更新策略的不同.react 是自上而下的,vue是局部订阅模式.
# React 中的 setState 为什么需要异步操作？
在合成事件和钩子函数中,没有办法立即拿到更新后的值.
setState 的异步整合,批量更新也是建立在钩子函数与合成事件中的.在原生事件和定时器中不会触发批量更新.在这种react 认为"异步"的情况下对同一个值多次 setState,setState的批量更新策略会对其进行覆盖,取最后一次执行的值.
# 什么时候使用非受控组件
文件上传,或者简单的表单,一次上传
# react bind this?
  react 中使用合成事件.事件会冒泡到 document 上,所以触发 SyntheticEvent 回调中 this 方法时并不是当前组件的 this,
# react中函数组件和类组件区别
  函数组件没有自己的生命周期,this 不会被实例化,渲染性能会有提升.
  调用方式: 函数组件直接调用返回一个新的 reactElement,类组件调用时创建实例,通过实例中的方法返回 reactElement
  根本区别: 函数式组件捕获了渲染所用的值.
# render prop是什么?
  通过定义 render 函数,父组件描叙一个想渲染出来的元素,在子组件中调用.
# 了解 React 中的 ErrorBoundary 吗，它有那些使用场景?
  为了避免错误渲染白屏做的异常中间件处理的嵌套组件.通过 v16 版本新增了 2 个生命周期,componentDidCatch 和static getDerivedStateFormError,在 workLoop 外面包裹一层 try/catch,报错时遍历父组件找到这两个生命周期并把堆栈信息塞给这两个生命周期进行判断
# 虚拟 dom,优缺点?
  抽象了原本的渲染过程,拥有了跨平台的能力,不仅仅局限于浏览器 dom,跨平台开发,组件高度抽象化.
  一系列的数据结构和数据对象浏览器的真实 dom在内存中映射.
# hooks 和 class的理解?
  这两者是互补关系,class在某些情况下更便捷,符合直觉.类似于函数式和oop的关系,class是oop,好处是封装状态,hooks是函数式,封装逻辑.
# react 理念
  js上构建快速响应的大型web应用程序.而快速响应制约因素主要有2类:
   * **CPU的瓶颈**: 大计算量的操作或者设备性能不足导致的页面掉帧的卡顿
   * **IO的瓶颈**: 发送网络请求
# Suspense 及 useDeferredValue hook
  Suspense 让组件等待某个异步操作,知道异步操作结束即可渲染.而我们不必等到数据全部返回才开始渲染,实际上,我们是已发送网络请求就马上开始渲染.在渲染中发现读取的数据还没被获取完毕,该组件会出于一个挂起的状态.React会跳过这个组件,继续渲染dom树种其他组件.
  ## componentDidCatch 到 Suspense
  通过在渲染阶段 status = pending 抛出异常给 Susponse,渲染终止.
  Susponse 会在内部 componentDidCatch 处理这个异步状态.当 status 已经是 resolve 状态,数据就正常返回了
  接下来 Susponse 再次渲染组件.

#
# React16的架构
  * Scheduler[ˈskedʒuːlər] (调度器) ---- 调度任务的优先级,高优任务优先进入reconciler
  * Reconciler [ˈrekənsaɪlər] (协调器) ---- 负责找出变化的组件 
  * Renderer (渲染器) ---- 负责将变化的组件渲染到页面上

  相比React15,新增了Scheduler.
  ## Scheduler 
  大部分浏览器实现了requestIdleCallback这个API,但是由于2个问题,React放弃了使用:
  1. 浏览器兼容性
  2. 触发概率不稳定,受很多因素影响,比如我们的浏览器切换tab后,之前tab注册的requestIdleCallback触发的频率会变得很低.

  React实现了功能更加完善的requestIdleCallback polyfill.
  ### 基于MessageChannel
  ## Reconciler 
  在React15中Reconciler是递归处理虚拟dom的.而在16中,更新工作从递归变成了可以中断的循环过程,每次循环都会调用 shouldYield 判断当前是否有剩余时间
  ```js
    function workloopConcurrent() {
      while (workInProcess !== null && !shouldYield()){
        workInProcess = performUnitOfWork(workInProcess)
      }  
    }
  ```
  在React16中,Reconciler与Renderer不再是交替工作.当Scheduler将任务交给Reconciler后,Reconciler会为变化的虚拟Dom打上代表增删更新的标记.
  整个Scheduler与Reconciler的工作都在内存中进行.只有当所有组件都完成Reconciler的工作,才会统一交给Renderer
  ## Renderer 
  Renderer根据Reconciler为标记虚拟dom打上标记,同步执行对应dom操作.
  ## Concurrent Mode
  是 react 新功能,帮助应用保持响应,根据用户的设备性能和网速进行适当的调整.
  让应用保持响应,就是在运行中保证 CPU、IO.
  ## isInputPending 
  浏览器新 api,来平衡 js 的执行、页面渲染已经用户输入之间的优先级.
  ## 更新流程
  1. Scheduler: 接收到更新,查询是否存在其他高优先级更新需要执行.如果没有,更新当前操作,交给Reconciler
  2. Reconciler: 接收到更新,查询更新会造成哪些虚拟dom的变化.如果没有,将打了标记的虚拟dom交给Renderer
  3. Renderer: 接收到通知,查询打上标记的虚拟dom.执行更新操作

  1.2两个操作步骤随时可能被以下原因中断:
    * 其他优先级更高任务需要先更新
    * 当前帧没有剩余时间
  但由于1,2任务都在内存中工作,不会更新展示到页面上,即使被反复打断,用户也无感知.

## setState 异步
同步执行,异步更新.但是react优化机制合并多个state.在原生事件和 setTimeout 中会同步更新,会把isBatchingUpdates 状态改为true进行同步更新
# 事件触发
1. 通过统一的事件处理函数.dispatchEvent 进行批量更新 batchUpdate.
2. 执行事件对应的处理插件中 extractEvents,合成事件源对象,每次 react 会从事件源开始,从上遍历类型为 hostComponent 即 fiber 是 dom 类型的,判断 props中是否有当前事件如 onClick,最终形成一个事件执行队列,react 就用这个队列模拟 捕获 => 源 => 冒泡这一阶段.
3. 最后通过 runEventsInBatch 执行事件队列,发现阻止冒泡,立刻 break 跳出循环,最后重置事件源,放回事件池中,完成整个流程.
# react17 的变化
  1. 重构 JSX 转换逻辑 不需要引入import React from 'react',编译器会自动帮我们引入.
  2. 事件系统重构. 放弃使用 document 做事件的中心化管控.会挂载到 root 节点上. 取消事件池复用,为每一个合成事件创建新的对象.
  3. Lane模型(通过二进制数表示优先级)代替 expirationTime 模型(**通过时间长度描述优先级**).
  4. 优化useEffect,17 之前 useEffect 清理函数会在 commit 阶段执行.组件卸载时,react 会先执行清理函数,然后才更新屏幕,然后才更新屏幕,类似于 componentWillUnmount.
  而 17 之后,useEffect 清理函数会延迟到 commit 阶段完成才会执行,变成了异步执行,组件卸载时,会在屏幕更新后执行.
# 理解 React 中的 Transaction（事务） 机制
Transaction 是创建一个黑盒,这个黑盒可以封装任何方法.将目标函数用 wrapper(一组 initalize 和 close 方法称为 wrapper)封装起来.同时需要用 Transaction 类暴露的 perform 方法执行他.如上注释所示,在 anyMethod 执行之前,perform 会先执行所有 wrapper 的 initialize 方法,执行完后,再执行 wrapper 中 close 方法.

# react 手动批量更新方法
   unstable_batchedUpdates(()=>{

   }) 

# react 更新链路要素拆解
  挂载和ReactDOM.render、setState 一样会触发更新.通过 update 对象进入同一套更新工作流.
  ## update 创建
  触发 dispatchAction 

# 时间切片的实现
通过 performance.now 获取当前时间,对比到期时间 deadline.
react 根据浏览器帧率性能,计算时间切片长度的大小,结合当前时间计算出一个切片到期时间.每次执行函数workLoopConcurrent 时,查询切片时间是否过期,到期 就结束循环,让出主线程控制权.
# 手写react
## React.createElement
  提取type、config、children 数组生成一个 ReactElement.
  ```js
    function createElement(type,props,...children){
      props.children = children
      return {type, props}
    }
    export default {createElement}
  ```
## ReactDOM.render
虚拟 DOM转换成为真实 DOM.
```js
  function render(vnode,container){
    const node = initVNode(vnode)
    container.appendChild(node)
  }
```
### createReactUnit
创建 vdom,js.将 createElement 返回的结果转换成为 vdom.
根据不同类型生成不同的单元.
分为文本、原生标签、react 组件
原生组件需要考虑到事件的绑定.
转换 vdom 为真实 dom
react 组件挂载当前生命周期,其中插入 render 方法,转成原生组件
```js
  export function InitVNode(vNode){
    let {vType} = vNode
    if(!vType){
      // 没有 vType,是一个文本节点
      return document.createTextNode(vNode)
    }
    if(vType === 1){
      // 原生元素 
      return createElement(vNode)
    }else if(vType === 2){
      // 类组件
      return  createClassComp(vNode)
    }else if(vType === 3){
      return createFuncComp(vNode)
    }
    
  }
  function createElement(vNode){
    const{type,props} = vNode
    const node = document.createElement(type)
    // 过滤 key children 等特殊的 props
    const {key, children, ...rest} = props
    Object.keys(rest).forEach( k => {
      // 需要特殊处理的属性名 class 和 for
      if(k === 'className'){
        node.setAttribute('class',rest[k])
      }else if( k === 'htmlFor'){

      }else{

      }
    })
    // 递归初始化子元素
    children.forEach(c => {
      if(Array.isArray(c)){
        c.forEach(n => {
          node.appendChild(initVNode(n))
        })
      }else{
        node.appendChild(initVNode(c))
      }
      
    })
    return node
  }
  // 创建函数组件
  function createFuncComp(vNode){
    const {type,props} = vNode
    const newNode = type(props)
    return initVNode(newNode)
  }
  // 创建类组件
  function createClassComp(vNode){
    const {type} = vNode
    const component = new type(vNode.props)
    const newNode = component.render()
    return initVNode(newNode)
  }
```


# react常用工具函数
## cloneElement react-router 中 Switch 组价
# useRef 和 createRef 的区别 
useRef 每次都会返回相同的引用
createRef 每次都会返回一个新的引用,所以不能用在 hooks 中.

# Profiler
用于开发阶段新能检测,检测一侧 react 组件渲染用时,性能开销.
需要两个参数,一个是 id,用于标识唯一的 profile .onRender回调函数,用于渲染完成,接受渲染参数.


# 基础模块 jsx
## jsx 语法最后变成了什么
React jsx => ReactElement => React Fiber
## createElement 和 cloneElement 区别是啥
cloneElement 第一个参数必须是 React 元素,不能是标签名或者组件.新添加属性并入原有属性中,传入新元素中.旧的子元素会被替换,保留原始元素的键和引用.使用cloneElement 会更快
## 没有用到React为什么还要import引入React 
本质上,jsx 是语法糖.代码会被 babel 转换为 React.createElement,所以需要引入 react

## 函数组件和类组件中setState的区别
函数组件中,没有状态保存信息,只是一个函数,每一次函数上下文执行,所有变量,常数都重新声明,执行完毕,再垃圾回收.
类组件 this 是可变的,而且是一直可变的.react 自身会随着时间推移对 this 进行修改,方便在 render 函数或生命周期中读取新的版本
```js
 const [ num ,setNumber ] = useState(0)
    const handleClick1 = ()=> {
        for(let i=0; i<5;i++ ){
           setTimeout(() => {
                setNumber(num+1)
                console.log(num)
           }, 1000)
        }
    }
    // 输出 0 0 0 0 0    num = 1
```
## 打印顺序
```js
// 3 4 1
// flushSync 被设置了一个高优先级更新,2 和 3 被批量更新 3.然后 4,最后更新 1
handleClick=()=>{
    setTimeout(()=>{
        this.setState({ number: 1  })
    })
    this.setState({ number: 2  })
    ReactDOM.flushSync(()=>{
        this.setState({ number: 3  })
    })
    this.setState({ number: 4  })
}

```


## Ref 作用
1.获取组件实例,dom 元素
2.组件通信
3.保存状态
## Ref 原理?
 createElement 将 ref 挂载给 window 对象. 到 commitAttachRef 判断两次的 ref 是否全等.
 从 createElement 添加 ref 到 react 整个渲染过程的末尾(commit 阶段)被赋值前,这个ref 都是同一份引用(ref 挂载在 commit 阶段处理).

## 跨层级传递 ref?
通过 forwardRef ,improveHandle 转发 ref 的 current 实例.

## 老版本 React 为什么要引入 React?
本质上 jsx 是语法糖,需要被转换为 React.createElement

# 调用 setState 之后发生了什么
1. setState 的时候,react 会为当前节点创建一个 updateQueue 的更新队列
2. 接着触发 reconciliation(协调器:对比)过程,过程中,使用 Fiber 的调度算法,开始生成新的 Fiber 树.Fiber 算法最大的特点是可以做到异步可中断执行.
3. 然后 react Scheduler(调度器)根据优先级高低,先执行优先级高的节点,执行 doWork 方法.
4. 在 doWork 方法中,React 会先执行一遍 updateQueue 中的方法,获取新的节点,对比新老节点,为老节点打上更新、插入、替换等 tags.
5. 当前节点 doWork 完成后,会执行 performUnitOfWork 方法获取新的(优先级)节点.重复之前过程.
6.当前所有节点 doWork 完成后,触发 commitRoot 方法,React 进入 commit 阶段.
7.commit 阶段中,React 会根据之前为各个节点tag 一次性更新 dom.


# react 优化
props 传递回调函数,可能会引发子组件的重复渲染.useCallback 包裹传递给子组件的回调函数.
减少 render 次数,合理使用 Context
组件懒加载, 配合使用 react.Suspense提升用户体验
使用 useMemo 降低渲染计算量
避免页面初始化时间过长,考虑优化
减少 setState 的可能
避免组件嵌套
# react18
## 新 hook useId()
# 为什么使用链表数据结构不使用数组呢?
数组元素个数固定,元素顺序是在数组中的下标位置.数组执行插入操作,需要将全部元素后羿一个位置.