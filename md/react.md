# 生命周期
  ## 挂载阶段
  constructor 
  componentWillMount 废弃
  static getDevicedStateFromProps
  render
  componentDidMount 
  ## 更新阶段
  static getDevicedStateFromProps
  shouldComponentUpdate
  render
  getSnapshotBeforeUpdate
  componentDidUpDate
  ## 卸载阶段
  componentWillUnMount


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
  SyntheticEvent是合并而来.维护了一个事件池,代表这这个对象会被复用.所以为了安全考虑不支持异步访问事件.
# react 为什么要用 key
  react diff 策略
  1.对比新旧节点 只会在同级对比,不会跨层级比较
  2.拥有相同类的组件会生成相似的树结构,拥有不同类的组件会生成不同的树结构
  3.对于同一层的子节点,通过唯一 key 去判断.
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
  将其他组件作为参数生成一个新的组件.Redux connect 就是高阶组件示例
# redux 工作原理
Redux 是一个状态管理库,简化了单项数据流.
在 React 中,组件连接 redux.
  UI 操作发出 action 指令.action 中包含一个 action 对象(有 type 值).action 将其转发给 reducer
  reducer 接收到 action 时,通过 switch...case 找到对应的 type.返回一个全新的 state
  然后组件接受新的状态作为 props,
  核心createStore 有    subscribe, dispatch,getState,replaceReducer
  每一次 listenerList 变更 都会先拷贝一份当前 listenerList 处理,防止解绑之后其中无法被触发
# react router 
  分为 react-router react-router-dom
  ## react-router
   提供 router 核心api,包括 Router Route Switch 没有 dom 操作的进行跳转的 api
  ## react-router-dom
  提供 BrowserRouter Link HashRoute
# react 代码分割路由动态加载
  1. 原理
  先判断installedChunks对象,用来缓存已加载的 chunk,是否已加载?
  如果 chunk 未加载,则构造对应的 Promise 并缓存在installedChunks对象中
  然后构建 script 标签 加载完成的话就把installedChunks中当前 chunk 状态变为已加载
  2.代码 (或者使用 react-loadable)
  ```
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
