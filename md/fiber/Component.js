class Component {
  constructor(props){
    this.props = props || {}
    this.state = this.state || {}
  }
  setState(partialState){
    scheduleUpdate(this,partialState)
  }
}

/**
 * 创建实例保存自身对 old fiber tree 上 fiber 对象的引用
 * @param {*} fiber 
 */
function createInstance(fiber){
  const instance = new fiber.type(fiber.props)
  instance.__fiber = fiber
  return instance
}

// fiber 标签分类
const HOST_COMPONENT = 'host'  //系统自带的 html 结构
const CLASS_COMPONENT= 'class' //用户自己定义的组件
const HOST_ROOT= 'root'

// 全局变量
const upDateQueue = []  // 更新工作队列
let nextUnitOfWork = null // 下一个更新任务
let pendingCommit = null  //待提交

// 系统自带的 dom 组件更新
function render(elements, containerDom){
  upDateQueue.push({
    // 更新 dom 树时需要知道从哪里更新的
    from: HOST_COMPONENT,
    dom: containerDom,
    newProps: {children: elements}
  })
  // 把更新放到队列中 浏览器空闲时更新延迟调用performWork
  requestIdleCallback(performWork)
}

function scheduleUpdate(instance,partialState){
  updateQueue.push({
    from: CLASS_COMPONENT,
    instance,
    partialState
  })
  requestIdleCallback(performWork);

}

const ENOUGH_TIME = 1
// deadline : performWork()
// performWork()会将接收到的deadline(完成时间)传递给workLoop()方法
// workLoop 结束后 performWork会检查是否还有任务未完成 有 会在浏览器空闲时间调用
function performWork(deadline){
  workLoop(deadline)
  if(nextUnitOfWork || updateQueue.length > 1){
    requestIdleCallback(performWork)
  }
}
// workLoop()会监视着deadline参数，如果deadline太短，
// 方法内部会自动停止循环，并保持nextUnitOfWork不做改变，下次会继续执行这个任务。
function workLoop(deadline){
  // 下个工作单元
  if(!nextUnitOfWork){
    // 产生第一个nextUnitOfWork
    resetNextUnitOfWork()
  }
  while( nextUnitOfWork && deadline.timeRemaining() > ENOUGH_TIME ){
    // performUnitOfWork 执行工作单元
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork)
  }

  if(pendingCommit){
    commitAllWork(pendingCommit)
  }
}