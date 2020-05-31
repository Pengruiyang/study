# javascript 引擎是单线程运行的,即 JavaScript 引擎和页面渲染引擎在同一个渲染进程上.GUI 渲染和 JavaScript执行互斥.
同时只能做一件事情,name 一个任务长期霸占 CPU 就会导致后面的事情无法处理,出于卡死状态
3 个解决方向
  a.优化每个人物,让他能有多快有多快,挤压 CPU 运算量
  b.快速响应用户,让用户感受不到卡顿,不阻塞用户交互
  c.多 worker 进程
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
    react 中只能通过超市检查机制来让出控制权,
    ```
      window.requestIdleCallback(
        callback: (dealine:IdleDeadline) =>void,
        option?: {timeout: number}
      )
    IdleDeadline 接口如下
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
  ```
    // 将待更新的任务先让去队列,通过 requestIDCallback 请求浏览器调度
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
  ```
  /**
   *fiber 当前需要处理的节点
   *topwork 本次跟新的节点
   *performUnitWork负责对 Fiber 进行操作,按照深度遍历返回下一个 Fiber
  /
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