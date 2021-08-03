# javascript 引擎是单线程运行的,即 JavaScript 引擎和页面渲染引擎在同一个渲染进程上.GUI 渲染和 JavaScript 执行互斥.

同时只能做一件事情,name 一个任务长期霸占 CPU 就会导致后面的事情无法处理,出于卡死状态
3 个解决方向

> a.优化每个人物,让他能有多快有多快,挤压 CPU 运算量
> b.快速响应用户,让用户感受不到卡顿,不阻塞用户交互
> c.多 worker 进程
> vue 选择的是一个,因为对 vue 而言,使用模板有了很大的优化空间,配合其响应式机制可以让 vue 精准的进行节点更新.而 react 选择的是让用户感受不到卡顿

## react 更新

react 会递归的对比 virtualDom 树,找到变更的节点,然后一口气同步更新他们.Reconciation(协同)
react 为了给用户制造应用很快的感觉,不会让一个程序长期霸占着资源.将浏览器的渲染、布局、绘制、资源加载、事件响应、脚本执行试做操作系统的进程,需要通过某些调度策略合理的分配 CPU 资源,从而提高浏览器的用户响应速率,并兼顾任务执行效率.
也就是说,react 通过 Fiber 架构,让自己的 Reconcilation(协同)过程变得可以中断.并让出 CPU 的执行权.可以让浏览器及时的响应用户交互、分批延时的 dom 操作也可以更好的用户体验、并且在浏览器空闲的时候,会对代码进行编译优化(JIT)及热代码优化.(热度代码由字节码转换为效率更高的机器码)

## 什么是 Fiber

Fiber 即为协程,(ES6 中 Generator 也是协程的意思.交换函数控制权) 协程本身需要配合线程的一种控制流程让出机制.
Fiber 的思想是和协程契合的:React 渲染的过程可以被中断,可以将控制权交回给浏览器,让位给优先级更高的任务,等待浏览器空闲后在恢复渲染.

1.主动让出机制
由于浏览器没有类似进程概念,任务之间的界限很模糊,没有上下文,所以不具备中断恢复的条件.二是没有抢占的机制,无法中断正在执行的程序.
所以只能采用类似协程这样的控制权让出机制. 2.通过 requestIdleCallback API 确认高优先任务
react 中只能通过超时检查机制来让出控制权,

    ```js
      window.requestIdleCallback(
        callback: (dealine:IdleDeadline) =>void,
        option?: {timeout: number}
      )
      // IdleDeadline 接口如下
      interface IdleDealine {
        didTimeout: boolean // 表示任务执行是否超过约定时间
        timeRemaining(): DOMHighResTimeStamp //任务可供执行的剩余时间
      }
    ```

    requestIdleCallback 让浏览器在有空的时候执行我们的回调,这个回调会传入一个期限,表示浏览器有多少的时间给我执行.第二个参数为超时时间.
      每一帧可能会做的事情
      处理用户输入事件
      JavaScript 执行
      requestAnimationFrame 调用
      布局 Layout
      绘制

## Fiber 一个执行单元

react 每次执行完一个执行单元 检查剩余时间,如果没有时间就将控制权让出.
执行过程

```js
// 将待更新的任务先让去队列,通过 requestIdleCallback 请求浏览器调度
updateQueue.push(updateTask)
requestIdleCallback(performWork, { timeout })
//浏览器空闲或者超时了就会调用 performWork 执行任务
// 1. deadline 表示剩余时间
function performWork(deadline) {
  // 2.取出 updateQueue 中的任务
  while (updateQueue.length > 0 && deadline.timeRemaining() > ENOUGH_TIME) {
    // workLoop 从更新队列中弹出任务来执行,每执行完一个执行单元Fiber,就会检查剩余时间是否足够,足够就执行下一个 Fiber 反之停止.等到下一次 requestIdleCallback 再执行
    workLoop(deadline)
  }
  // 3.如果本次执行中,未能将所有任务执行完毕,那就在请求浏览器调度
  if (updataQueue.length > 0) {
    requestIdleCallback(performWork)
  }
}
```

## react Fiber 的改造

time slice 时间分片
react16 之前 Reconcilation 是同步递归的去执行.递归其实很契合树形数据结构.但是这种方式不能随意中断\恢复\异步处理.
所以需要改变 react 数据结构 模拟函数调用栈 之前递归处理的问题分解成增量的执行单元.
目前结构是使用链表
fiber 使用了双缓冲技术,像 redux nextListener 一样,在当前 currt tree 构建一颗 workInProgress 树,新的 fiber 树上节点有个 alternate 属性,创建时会优先查找,没有就新创建一个,这两棵树上的 fiber 保持互相引用,把当前 currt tree 指向 workInProgress tree,旧的树作为新的 fiber 树预留空间,达到复用实例的过程.

currentFiber.alternate === workInProgressFiber
workInProgressFiber.alternate === currentFiber;

```js
type Fiber = {
  // 标记 Fiber 类型 例如函数组件、类组建、宿主组件
  tag:workTag,

  type: any,
 // 链表结构
  // 指向父节点,或者 return 该节点的组件
  return: Fiber || null,
  // 第一个子节点
  child: Fiber || null,
    // 指向下一个兄弟节点
  sibiling: Fiber || null ,
  // 子节点的唯一键
  key: null | string,
}
Fiber 和函数调用栈帧一样,保存了节点的上下文信息.迭代方式处理节点

/**
 *fiber 当前需要处理的节点
 *topwork 本次跟新的节点
 *performUnitWork负责对 Fiber 进行操作,按照深度遍历返回下一个 Fiber
 */
  function performUnitWork(fiber,topwork){
    // 对当前节点进行处理 根据当前 fiber
    beginWork(fiber)
    // 如果存在子节点 那么下一个待处理的就是子节点
    if(fiber.child){
      return fiber.child
    }
    // 如果没有子节点了,则查找兄弟节点
    let temp = fiber
    while(temp){
      // 当前节点为顶部节点 退出
      if(temp === topwork){
         break
      }
      if(temp.sibiling){
        return temp.silibing
      }

      // 没有 继续向上查找
      temp = temp.return
    }
  }

Fiber节点的属性定义,我们可以按三层含义将他们分类
  function FiberNode(
    tag: WorkTag,
    pendingProps: mixed,
    key: null | string,
    mode: TypeMode
  ){
    // 作为静态数据结构的属性
     /** 对应组件类型 Function/Class/Host */
    this.tag = tag

    /** key属性 */
    this.key = key

    /** 大部分情况下同type,某些情况不同 例如FunctionComponent使用React.memo包裹时 */
    this.elementType = null

    /** Fiber对应的真实dom节点 */
    this.type = null

    /**
     * FunctionComponent:指函数本身
     * ClassComponent: class
     * HostComponent: DOM节点tagName
     * */

    this.stateNode = null
    // 作为用于链接其他Fiber节点形成的Fiber树

    /** 指向父级Fiber节点 */
    this.return = null

    /** 指向子Fiber节点 */
    this.child = null

    /** 指向兄弟Fiber节点 */
    this.sibling = null

    this.index = 0
    this.ref = null
    // 作为动态的工作单元属性

    /**为保存本次更新造成改变的相关信息 */
    this.pendingProps = pendingProps
    this.memoizedProps = null
    this.updateQueue = null
    this.memoizedState = null
    this.dependencies = null

    this.mode = mode

    /**保存本次更新会造成的dom操作 */
    this.effectTag = NoEffect
    this.nextEffect = null
    this.firstEffect = null
    this.lastEffect = null

    // 调度优先级相关
    this.lanes = NoLanes
    this.childLanes = NoLanes
    // 指向该fiber在另一次更新时对应的fiber
    this.alternate = null
  }
```

## react16 阶段拆分

1.协调阶段 diff 阶段 可以被中断,这个阶段找出所有节点的变更,节点的新增修改删除调用的生命周期有
constructor
componentWillMount 废弃
componentWillReceiveProps 废弃
static getDerivedStateFromProps
shouldComponentUpdate
componentWillUpdate 废弃
render 2.提交阶段. 上一阶段计算出需要处理的一次执行.这个阶段不可打断必须同步执行
getSnapshotBeforeUpdate
componentDidMount
componentDidUpdate
componentWillUnmount
在协调阶段如果时间片用完 就会让出控制权,而这并不会导致任何用户可见变更.
但由于协调阶段可能会被中断恢复重来,所以生命周期钩子可能也会被执行多次.componentWillUpdate 可能就会被调用多次.因此建议生命周期钩子不要有副作用,也就废弃了部分 api

## Fiber 架构

1.react 使用 fiber 数据机构存放组件数的附加信息 2.第一次渲染执行 render,后面先 diff 再渲染
3.fiber 渲染树的深度遍历优先, child > silibing > parent.silibing
4,reconcilerChildren 根据 children 创建 filber 渲染树,并进行 diff,与 vue 不同的是,vue 考一些假设两端向中间.
5.fiber 渲染树,按照优先级顺序,一层一层形成链表结构,rootFiber 在 render 中创建.
6.fiber 都执行完毕后进行 commint 阶段,commit 阶段不可打断,一次性更新完 dom.找到父节点,根据 fiber 对象上的 effectTag 做 对应的 dom 操作 7.优先级: 计算过期时间 8.数据结构

```js
   {
     type: 区分不同 fiber 如 class function host(dom节点) 等,
     props: 属性参数,
     node: 真实 dom 节点,新增时是 null
     base: 存储就 fiber 用于 diff 新增时为 null
     parent: workInProgressFiber 父节点
   }
```

9.简单流程
1.render 初始化子任务
2.window.requestIdleCallback 执行 performUnitWork.
更新当前 fiber,给每个 fiber 打上 effectTag 标记
返回下一个 fiber
3.fiber 渲染树上任务执行完成后 commit ,根据 effectTag 更新 dom

## diff

    首先从 reconcileChild 入口函数开始,判断是否首次渲染 currt 字段是否为空,通过就 mountChildFiber 创建节点,不是就 reconcileChildren diff.
    mountChildFiber 和 reconcileChildren 都是通过 ChildrenReconciler 创建的,  参数就 true or false/
    reconcileChildrenFibers 是 diff 主体

    ```js
      function reconcileChildrenFibers(
        returnFiber: Fiber, 即将 diff 的这层父节点
        currentFirstChild: FIber || null, 当前层第一个 fiber 节点
        newChild: any, 即将更新的 vdom
        expirationTime: RxpirationTime 过期时间  // 已经被lanes取代
      ): Fiber | null
    ```

### 优先判断 newChild type 是不是 object、string、number ,是的话同级只有一个节点,不是的话同级择则有个节点.

是的话 先判断上次更新时 Fiber 节点是否存在对应的 dom => dom 节点是否可以复用
如果可以则将上次更新的 Fiber 节点的副本作为本次新生成的 Fiber 节点返回.
不可以复用则标记 dom,需要被删除,新生成返回一个 Fiber 节点.
react 会先判断 key 是否相同,是的话再判断 type 是否相同,都相同时 dom 节点才可以复用.
_react diff 会优先判断是否为更新,再判断是新增还是删除_
由于 newChildren 为数组形式,即 newChildren[0]和 oldFiber 对比,newChildren[1]和 oldFiber.sibiling 对比
所以会进行两次遍历,
一次处理更新的节点,第二次处理剩下的不属于更新的节点。

    1. diff textNode
      判断 currentFirstChild 是不是 textNode
      是:可以复用节点
      不是:从 currentFirstChild 开始删除剩余的节点(删除不会真的从链表中删除,只是打上一个 delete 的 tag,commit 阶段才会删除)
    2. diff react Element
     key 相同 且节点类型也相同的 节点可以复用.
     不会像 textNode 直接删除,回去子节点中查找可以复用的节点,不能复用的再删除
    3. diff array
     首先判断 newChild 是 textNode 情况,判断新老节点的 key 值, 新节点 string 或 number 都是没有 key 的. 老节点有 key 则不能复用.
     判断是不是 object,是就走 reactElement 和updatePortal 逻辑.

### 判断新老节点遍历完成情况

新节点遍历完,直接删除老节点链表.(删除操作)
老节点遍历完,直接更新新节点(新增操作)

### 移动情况新老节点复用

从所有老数组元素按照 key 或者 index 建立 map,遍历 map,根据 key 或者 index 找到 老数组是否有可复用的

# CPU 性能的瓶颈

JS 操作 dom,GUI 渲染线程和 JS 线程互斥,所以 JS 脚本执行与浏览器布局、绘制不能同时执行.
在每一帧 1000ms / 60HZ 下.需要完成如下工作
JS 脚本执行 ---- 样式布局 ---- 样式绘制
fiber 在浏览器每一帧的时间中,都会预留时间给 JS 线程.React 利用这部分时间更新组件(预留初始时间是 5ms).当预留时间不够用的时候,react 将线程控制权交还给浏览器使其有时间渲染 UI,React 则等待下一帧的时间到来继续被中断的工作.(**时间切片**).

```js
// 开启Concurrent Mode 开启会启用时间切片
// ReactDOM.render(<App/>, rootEl);
ReactDOM.unstable_create(rootEl).render(<App />)
```

# IO 的瓶颈

网络延迟是我们无法解决的,能解决的事在网络延存在的情况下,减少用户对网络延迟的感知.
将人机交互研究的结果整合到真实的 UI 中.将同步的更新变为可中断的异步更新.

# Fiber 更新复用机制

1. oldProps === newProps (render 返回结果实际上是 React.createElement 执行结果是一个全新的 props 引用,不会复合全等)
2. context value 没有变化 (指的是老版本的 context)
3. workinProgress.type === current.type (更新前后 Fiber.type 没发生改变)
4. !includesSomeLane(renderLanes, updateLanes) (党全面 Fiber 是否存在更新,如果存在那么更新的优先级是否和本次整跟 Fiber 树调度的优先级一致.如果一致代表组件需要更新,走 render 逻辑)

# 工作流程

## mount 阶段时

```jsx
function App() {
  const [num, add] = useState(0)
  return <p onClick={() => add(num + 1)}>{num}</p>
}
ReactDOM.render(<App />, document.getElementById('root'))
```

1. 首次执行 ReactDOM.render 会创建 fiberRootNode 和 rootFiber. 其中 fiberRootNode 是整个应用的根节点,rootFiber 是 <App/> 所在组件树的根节点.区分 fiberRootNode 和 rootFiber,因为在应用中我们可以多次调用 ReactDOM.render 渲染不同的组件树,他们会拥有不同的 rootFiber.但是整个应用根节点只有一个,那就是 fiberRootNode.
   由于是首屏渲染.页面中还没有挂载任何 dom,所以 fiberRootNode.current 指向的 rootFiber 没有任何子 fiber 节点.

```js
fiberRootNode.current = rootFiber
```

2. 进入 render 阶段,根据组件返回的 JSX 在内存中一次创建 Fiber 节点并连接在一起构建 fiber 树,被称为 workInProgress Fiber 树.而构建 workInProgress Fiber 树时会复用 current Fiber 树中已有的 Fiber 节点内的属性,在首屏渲染时只有 rootFiber 存在对应的 current fiber(rootFiber.alternate)
3. 构建完 workInProgress Fiber 树在 commit 阶段渲染到页面.fiberRootNode 的 current 指向 workInProgress Fiber,将其变为 current Fiber 树.

## update 阶段时

1. 新的 render 阶段构建一颗新的 workInProgress Fiber 树.
2. workInProgress 在 render 阶段完成构建后进入 commit 阶段渲染到页面上.渲染完毕后 workInProgress 树变为 current 树.

## render 阶段

```js
// performSyncWorkOnRoot会调用该方法
function workLoopSync() {
  while (workInProgress !== null) {
    preformUnitOfWork(workInProgress)
  }
}
// performConcurrentWorkOnRoot 调用该方法
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress)
  }
}
```

他们之间唯一的区别就是是否调用 shouldYield,如果当前浏览器没有剩余时间,shouldyield 会终止循环,直到浏览器有空闲时间后继续遍历.preformUnitOfWork 会创建下一个 Fiber 节点给 workInProgress.并和已创建的链接构成 Fiber 树.

```js
function beginWork(
  current: Fiber | null,
  workInProgress: Fiber,
  renderLanes: Lanes //优先级
): Fiber | null {
  // ...省略函数体
}
/**
 * 可以通过current === null ? mount阶段 : update阶段
 * /
```

rootFiber 开始向下深度优先遍历,为遍历到每个 Fiber 节点调用 beginWork 方法,该方法会根据传入的 Fiber 节点创建子 Fiber 节点,并将其关联起来.遍历到最下层叶子节点(没有子节点的组件)进入下一个阶段.

接着调用 completeWork 处理 Fiber 节点,当某个 Fiber 节点执行完 completeWork,如果存在兄弟节点,进入兄弟节点继续这个阶段,不存在则进入父级 Fiber 开始这个阶段知道 rootFiber.其中appendAllChildren 方法将已生成的子孙DOM节点插入当前生成的DOM节点下.存在effectTag的Fiber节点会被保存在effectList的单向链表中,在commit阶段只需要遍历effectList就可以执行所有的effect.

## commit阶段



## workInProgress 和 current 树
workInProgress 代表正在 render 的树.current 代表已经存在的树.
组件挂载阶段时,current 树只有一个 rootFiber 节点.
# fiber 常用函数

## legacyCreateRootFromDOMContainer 
创建出对象附加上一个 _internalRoot 属性,用于首次渲染给 fiberRoot
## unbatchedUpdates
传入回调函数,执行 updateContainer 方法
## updateContainer
请求当前 fiber 节点的优先级,根据优先级去创建 fiber 节点的 update 对象,将其入队列.调度当前节点 fiberRootde 更新.
## performSyncWorkOnRoot(最新版使用 ReactDOM.createRoot(rootNode).render 则不会触发这个方法)
执行根节点同步任务.performsSyncWorkOnRoot 是 render 阶段的起点.render 任务就是完成 Fiber 树的构建.在 ReactDOM.render 首次渲染链路中,执行这个方法.同步渲染

## beginWork 负责创建新的 Fiber 节点
根据 fiber 节点 tag 属性的不同,调用不同的节点创建函数.
## completeWork 负责将 Fiber 节点映射为 DOM 节点

## createWorkInProgress 传入现有树结构中的 rootFiber 对象
workInProgress 是 createFiber 方法的返回值,workInProgress 和 current 的 alternate 属性都指向对方

## workLoopSync 
通过 while 循环反复判断 workInProgress 是否为空,并且在不为空的情况下对他执行 performUnitOfWork 函数.
## performUnitOfWork
触发对 beginWork 的调用,如果 beginWork 所创建的 Fiber 节点不为空,则 performUnitOfWork 就会用这个新节点更新 workInProgress 的值.为下一次循环做准备.当 workInProgress 为空时,表明没有新节点可以创建,也就意味着完成对整颗 Fiber 树的构建.
不同 Fiber节点通过 child、return、sibling 建立关系

## beginWork
通过获取 workInProgress 的 lanes(优先级)判断是否为空去判断这个节点是否需要更新.
通过 current 是否存在判断是否首次挂载还是后续更新.
能复用 Fiber 节点就是拦截.
返回当前节点的子节点,以这个子节点作为下一个工作单元继续 beginWork,不断往下生成 fiber 节点,构建 workInProgress 树.返回 null 代表 fiber 子树遍历完成.从当前子节点往回进行 completeWork.
## completeUnitOfWork
用于发起 completeWork 的中间人,在 performUnitOfWork 中被调用,performUnitOfWork 会尝试调用 beginWork 来创建当前子节点.如果创建子节点为空(当前节点不存在子 Fiber 节点),说明当前节点是一个叶子节点.遍历到叶子节点时,"递"阶段结束.调用 completeUnitOfWork,执行当前节点对应的 completeWork 工作.
将当前节点的副作用链.插入其父节点对应的副作用链中.
### 副作用链 
  commit 只实现更新,而不负责寻找更新.这个时候就需要副作用链(EffectList)
  每个 fiber 节点都维护者属于自己的 EffectList,链表内每一个元素都是 Fiber节点.这些 Fiber 节点需要满足 **都是当前 Fiber节点的后代节点和都有待处理的副作用**
## completeWork
根据 workInProgress 节点的 tag 属性不同,进入不同的 DOM节点创建、处理逻辑.
创建 DOM 节点,插入到 DOM 树中,为 DOM 节点设置属性.
创建好的 DOM 节点会被赋值给 workInProgress 节点的 stateNode 属性.子节点创建好了父节点未创建的情况,会等到父节点进入 appendAllChildren 逻辑后,逐个向下查找并添加自己的后代节点.
## reconcileChildren 生成当前节点子节点.
根据 current 是否为 null ? moutChildFibers : reconcileChildFiber
reconcileChildFibers = ChildReconciler(true)
moutChildFibers = ChildReconciler(false)
可见这两个方法实际上都是去调用 ChildReconciler 方法
## ChildReconciler
1. 通过入参shouldTrackSideEffects 处理副作用打上 tags (effectTag).渲染器执行时,也就是真实 DOM 渲染时告诉渲染器,**数据获取、订阅或者修改 DOM等操作**
2. 对 Fiber 节点的创建、增加、删除、修改等操作.直接或间接的被 reconcileChildrenFibers 调用.
3. ChildReconciler 返回一个 reconcileChildrenFibers 函数,根据入参不同,执行不同的 Fiber 节点操作,最终返回不同的目标 Fiber 节点.

## reconcileChildFibers
将子节点逻辑分发给 reconcileSingleElement,得到 App FiberNode.
## reconcileSingleElement 
reconcileSingleElement 将基于 rootFiber 子节点的 ReactElement 对象信息，创建其对应的 FiberNode。
## 调用placeSingleChild 给 App FiberNode 增加 tag 标识.
App FiberNode 作为 rootFiber 的 child 属性,与现有 workInProgress Fiber 树建立关系.


# effect 对象(updateQueue 链表)
effect 对象包含 tag 类型,deps 依赖对象,create 首渲或依赖对象变更时执行函数,destroy 卸载时执行函数.通过 useEffect useLayoutEffect 制作的钩子函数都可以转换成为 effect 对象,两者有不同 tag 值.因为都可以转换成 effect 对象.两个共用一套逻辑:
* 通过 pushEffect 函数将 effect 对象添加到 fiber.updateQueue 链表中
* 通过 commitHookEffectListMount 执行 fiber.updateQueue 链表中指定 tag 属性的 effect.create,获得 effect.destroy
* 通过 commitUnmount 或 commitHookEffectListUnmount 执行 effect.updateQueue链表中指定 tag 属性的 effect.destroy.
## render阶段
mountEffect、updateEffect、mountLayoutEffect、updateLayoutEffect
通过 fiber.flags、fiber.subtreeFlags 能快速判断组件或者子树是否包含钩子及某类钩子.不必遍历 updateQueue 链表.useEffect 创建的 effect 对象,flag 值会包含 HookPassive.useLayoutEffect flag 包含 HookLayout类钩子.当 flags 包含 HookHasEffect 时,才意味着有钩子需要执行.这样处理是为了对应 deps 依赖对象未变更的场景.

## commit 阶段
HookLayout 类钩子,


