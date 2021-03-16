# javascript 引擎是单线程运行的,即 JavaScript 引擎和页面渲染引擎在同一个渲染进程上.GUI 渲染和 JavaScript执行互斥.
同时只能做一件事情,name 一个任务长期霸占 CPU 就会导致后面的事情无法处理,出于卡死状态
3 个解决方向
  >a.优化每个人物,让他能有多快有多快,挤压 CPU 运算量
  b.快速响应用户,让用户感受不到卡顿,不阻塞用户交互
  >c.多 worker 进程
vue 选择的是一个,因为对 vue 而言,使用模板有了很大的优化空间,配合其响应式机制可以让 vue 精准的进行节点更新.而 react 选择的是让用户感受不到卡顿
##  react 更新
  react 会递归的对比virtualDom 树,找到变更的节点,然后一口气同步更新他们.Reconciation(协同)
  react 为了给用户制造应用很快的感觉,不会让一个程序长期霸占着资源.将浏览器的渲染、布局、绘制、资源加载、事件响应、脚本执行试做操作系统的进程,需要通过某些调度策略合理的分配 CPU 资源,从而提高浏览器的用户响应速率,并兼顾任务执行效率. 
  也就是说,react 通过 Fiber 架构,让自己的 Reconcilation(协同)过程变得可以中断.并让出 CPU 的执行权.可以让浏览器及时的响应用户交互、分批延时的 dom 操作也可以更好的用户体验、并且在浏览器空闲的时候,会对代码进行编译优化(JIT)及热代码优化.(热度代码由字节码转换为效率更高的机器码)
## 什么是 Fiber
  Fiber 即为协程,(ES6 中Generator也是协程的意思.交换函数控制权) 协程本身需要配合线程的一种控制流程让出机制.
  Fiber 的思想是和协程契合的:React 渲染的过程可以被中断,可以将控制权交回给浏览器,让位给优先级更高的任务,等待浏览器空闲后在恢复渲染.
  
  1.主动让出机制
    由于浏览器没有类似进程概念,任务之间的界限很模糊,没有上下文,所以不具备中断恢复的条件.二是没有抢占的机制,无法中断正在执行的程序.
    所以只能采用类似协程这样的控制权让出机制.
  2.通过 requestIdleCallback API 确认高优先任务
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
    requestIdleCallback(performWork,{timeout})
    //浏览器空闲或者超时了就会调用 performWork 执行任务
    // 1. deadline 表示剩余时间
    function performWork(deadline){
      // 2.取出 updateQueue 中的任务 
      while(updateQueue.length > 0 && deadline.timeRemaining() > ENOUGH_TIME){
        // workLoop 从更新队列中弹出任务来执行,每执行完一个执行单元Fiber,就会检查剩余时间是否足够,足够就执行下一个 Fiber 反之停止.等到下一次 requestIdleCallback 再执行
        workLoop(deadline)
      }
      // 3.如果本次执行中,未能将所有任务执行完毕,那就在请求浏览器调度
      if(updataQueue.length > 0){
        requestIdleCallback(performWork)
      }
    }
  ```


  ## react Fiber 的改造
  time slice 时间分片
  react16 之前 Reconcilation 是同步递归的去执行.递归其实很契合树形数据结构.但是这种方式不能随意中断\恢复\异步处理. 
  所以需要改变 react 数据结构 模拟函数调用栈 之前递归处理的问题分解成增量的执行单元.
  目前结构是使用链表
  fiber 使用了双缓冲技术,像 redux nextListener 一样,在当前 currt tree 构建一颗 workInprocess 树,新的 fiber 树上节点有个alternate 属性,创建时会优先查找,没有就新创建一个,这两棵树上的 fiber保持互相引用,把当前 currt tree 指向 workInporcess tree,旧的树作为新的 fiber 树预留空间,达到复用实例的过程.
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
  ```

## react16 阶段拆分
  1.协调阶段 diff 阶段  可以被中断,这个阶段找出所有节点的变更,节点的新增修改删除调用的生命周期有
    constructor
    componentWillMount 废弃
    componentWillReceiveProps 废弃
    static getDerivedStateFromProps
    shouldComponentUpdate 
    componentWillUpdate 废弃
    render
  2.提交阶段. 上一阶段计算出需要处理的一次执行.这个阶段不可打断必须同步执行
    getSnapshotBeforeUpdate
    componentDidMount
    componentDidUpdate
    componentWillUnmount
  在协调阶段如果时间片用完 就会让出控制权,而这并不会导致任何用户可见变更.
  但由于协调阶段可能会被中断恢复重来,所以生命周期钩子可能也会被执行多次.componentWillUpdate 可能就会被调用多次.因此建议生命周期钩子不要有副作用,也就废弃了部分 api


## Fiber架构
  1.react 使用 fiber 数据机构存放组件数的附加信息
  2.第一次渲染执行 render,后面先 diff 再渲染
  3.fiber渲染树的深度遍历优先, child > silibing > parent.silibing
  4,reconcilerChildren 根据 children 创建 filber 渲染树,并进行 diff,与 vue 不同的是,vue 考一些假设两端向中间.
  5.fiber 渲染树,按照优先级顺序,一层一层形成链表结构,rootFiber 在 render 中创建.
  6.fiber 都执行完毕后进行 commint 阶段,commit 阶段不可打断,一次性更新完 dom.找到父节点,根据 fiber 对象上的effectTag做 对应的 dom 操作
  7.优先级: 计算过期时间
  8.数据结构
   {
     type, 区分不同 fiber 如 class function host(dom节点) 等
     props, 属性参数
     node, 真实 dom 节点,新增时是 null
     base: 存储就 fiber 用于 diff 新增时为 null
     parent: workInProgressFiber 父节点
   }
  9.简单流程
    1.render 初始化子任务
    2.window.requestIdleCallback 执行 performUnitWork.
      更新当前 fiber,给每个 fiber 打上 effectTag标记
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
        expirationTime: RxpirationTime 过期时间
      ): Fiber | null
    ```
  ###  优先判断 newChild type 是不是 object、string、number ,是的话同级只有一个节点,不是的话同级择则有个节点.
  是的话 先判断上次更新时 Fiber 节点是否存在对应的 dom => dom 节点是否可以复用 
  如果可以则将上次更新的 Fiber 节点的副本作为本次新生成的Fiber 节点返回.
  不可以复用则标记 dom,需要被删除,新生成返回一个 Fiber 节点.
  react 会先判断 key 是否相同,是的话再判断 type 是否相同,都相同时 dom 节点才可以复用.
  *react diff 会优先判断是否为更新,再判断是新增还是删除*
  由于 newChildren 为数组形式,即 newChildren[0]和 oldFiber 对比,newChildren[1]和 oldFiber.sibiling对比
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
  从所有老数组元素按照 key 或者 index 建立 map,遍历 map,根据 key或者 index 找到 老数组是否有可复用的
  ## CPU性能的瓶颈
  JS操作dom,GUI渲染线程和JS线程互斥,所以JS脚本执行与浏览器布局、绘制不能同时执行.
  在每一帧 1000ms / 60HZ 下.需要完成如下工作
  JS脚本执行 ---- 样式布局 ---- 样式绘制
  fiber 在浏览器每一帧的时间中,都会预留时间给JS线程.React利用这部分时间更新组件(预留初始时间是5ms).当预留时间不够用的时候,react将线程控制权交还给浏览器使其有时间渲染UI,React则等待下一帧的时间到来继续被中断的工作.(**时间切片**).
  ```js
    // 开启Concurrent Mode 开启会启用时间切片
    // ReactDOM.render(<App/>, rootEl);  
    ReactDOM.unstable_create(rootEl).render(<App/>)
  ```
  ## IO的瓶颈
  网络延迟是我们无法解决的,能解决的事在网络延存在的情况下,减少用户对网络延迟的感知.
  将人机交互研究的结果整合到真实的UI中.将同步的更新变为可中断的异步更新.




  