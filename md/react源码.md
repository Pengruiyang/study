
# render 阶段入口

render 阶段开始于 performSyncWorkOnRoot 或 performConcurrentWorkOnRoot 方法的调用.

```ts
function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}
function workLoopConcurrent() {
  while (workInProgress !== null && !shouldYield()) {
    performUnitOfWork(workInProgress)
  }
}
```

shouldYield 用来判断当前浏览器帧有没有空闲时间.对于 concurrent 模式来说,如果没有空闲时间就会退出当前循环.Fiber 通过深度遍历策略完成对整棵 workInProgress Fiber Tree 的创建.
performUnitOfWork 方法会创建下一个 Fiber 节点并赋值给 workInProgress,
并将 workInProgress 与已创建的 Fiber 节点链接起来构成 Fiber 树

```ts
function performUnitOfWork(unitOfWork: Fiber): void {
  const current = unitOfWork.alternate // current树上对应的 Fiber 节点
  // 用来存放 beginWork()返回的结果
  let next
  if (enableProfilerTimer && unitOfWork.mode & (ProfileMode !== NodeMode)) {
    next = beginWork(current, unitOfWork, subtreeRenderLanes)
  } else {
    next = beginWork(current, unitOfWork, subtreeRenderLanes)
  }
  // 省略
  unitOfWork.memoizedProps = unitOfWork.pendingProps
  // beginWork 返回 null,表示无当前节点的子 Fiber 节点
  if (next === null) {
    completeUnitOfWork(unitOfWork)
  } else {
    // 下次的 workLoopSync/workLoopConcurrent 的 while 循环主题为子 Fiber 节点
    workInProgress = next
  }
}
```

只要 workInProgress 这个 fiber 节点的指针为 null,则整个递归遍历结束.

## render 递 阶段 -- beginWork

调用 beginWork 生成子 Fiber 节点.workInProgress 会指向这个新的 Fiber 节点,作为下次循环的主题(unitOfWork).当 beginWork 为 null 时,终止递归

## render 归 阶段 -- completeUnitOfWork

当 beginWork 返回 null,进入本次循环的归阶段.
调用 completeWork 收拢所有后代 Fiber 节点上的数据到本次循环主题上.
然后判断是否兄弟节点,有就指向他,作为下次循环的主体.否则就找到父节点.直到父节点未 null.

## 递归完成

当 completeUnitOfWork 中 workInProgress 为 null,表示已经完成遍历创建整颗 workInProgress 树了.至此,render 阶段工作全部完成.在 performSyncWorkOnRoot 函数中 fiberRootNode 被传递给 commitRoot 方法,开启 commit 阶段工作流程.
# commit 阶段(render 的工作流程)
1. before mutation 阶段(执行DOM 操作前) 变量赋值,状态重做的功能.赋值 firstEffect,根节点没有 effectTag
2. mutation 阶段(执行 dom 操作)
3. layout 阶段(执行 dom 操作后)




# setState 实现

```js
  export let updateQueue = {
    updaters: [],
    isPending: false,
    add(updater){
      _.addItem(this.updaters,updater)
    }
    batchUpdate(){
      if(this.isPending)return
      this.isPending = true
      let {updaters} = this
      let updater
      while( updater = updaters.pop()){
        updater.updateComponent()
      }
      this.isPending = false
    }
  }
  function Updater(instance){
    this.instance = instance
    this.pendingStates = []
    this.pengdingCallbacks = []
    this.isPending = false
    this.nextProps = this.nextContext = null
    this.clearCallbacks = this.clearCallbacks.bind(this)
  }
  Updater.prototype = {
    emitUpdate(nextProps,nextContext){
      this.nextProps = nextProps
      this.nextContext = nextContext
      nextProps || !updateQueue.isPending ?
      this.updateComponent()
      : updateQueue.add(this)
    }
    updateComponent(){
      let {instance,pendingStates,nextProps,nextContext} = this
      if(!nextProps || pendingStates.length > 0){
        nextProps = nextProps || instance.props
        this.nextProps = this.nextContext = null
        shouldUpdate(instance,nextProps,this.getState(),nextContext,this.clearCallbacks)
      }
    },
    addState(nextState){
      if(nextState){
        _.addItem(this.pendingStates,nextState)
        if(!this.isPending){
          this.emitUpdate()
        }
      }
    }
    replaceState(nextState){
      let {pendingStates} = this
      pendingStates.pop()
      _.addItem(pendingStates,[nextState])
    }
    getState(){
      let {instance,pendingStates} = this
      let {state,props} = instance
      if(pendingStates.length){
        state = _.extend({},state)
        pendingStates.forEach(nextState => {
          let isReplace = _.isArr(nextState)
          if(isReplace){
            nextState = nextState[0]
            }
          if(_.isFn(nextState)){
            nextState = nextState.call(instance,state,props)
          }
          if(isReplace){
            state = _.extend({},nextState)
          }else{
            _.extend(state,nextState)
          }
        })
        pendingStates.length = 0
      }
      return state
    }
    clearCallbacks(){
      let {pendingCallbacks, instance} = this
      if(pendingCallbacks.length > 0){
        this.pendingCallbacks = []
        pendingCallbacks.forEach(callback => callback.call(instance))
      }
    }
    addCallback(callback){
      if(_.isFn(callback)){
        _.addItem(this.pendingCallbacks,callback)
      }
    }
  }
```
