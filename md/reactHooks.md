# react 内置方法

1.useEffect、useLayoutEffect
useEffect 本次更新结束后 执行 callback
useLayoutEffect 类似于 componentDidUpdate 执行,dom 更新完成后立即执行,阻塞浏览器绘制.会有闪一下效果.
这两个钩子函数会以 effect 对象形式存入 fiber.updateQueue 链表中,在 fiber reconciler 协调渲染流程的过程中,effect 对象会被取出并执行.useLayoutEffect 在渲染前后调用.useEffect 与协调中优先级调度算法有关.
effectHook 可以在 function 组件中执行副作用(side Effect)

    ```js
      import { useState, useEffect } from 'react';
      function Example() {
        const [count, setCount] = useState(0);
        // Similar to componentDidMount and componentDidUpdate:
        // 类似于 componentDidMount 和 ComponentDidUpdate
        useEffect(() => {
          // Update the document title using the browser API
          document.title = `You clicked ${count} times`;
        });
        return (
          <div>
            <p>You clicked {count} times</p>
            <button onClick={() => setCount(count + 1)}>
              Click me
            </button>
          </div>
        );
      }
    ```
    useEffect 做了什么？
    通过这个 hook 通知 React 组件需要在渲染后执行什么操作(类似 componentDidMount、componentDidUpdate)
    可以使用多个 useEffect 来分离问题,hooks 会按照顺序执行每一个 effect.
    ```
      useEffect(() => {
        document.title = `You clicked ${count} times`;
      }, [count]);// 只有在 count 发生变化的时候才会执行这个 effect
    ```

2.useRef 跨渲染周期保存数据
3.useReducer
4.useCallback、useMemo
5.useState
6.useContext

# react hooks 优缺点

优点:1.更容易复用代码(通过自定义 hooks) 2.清爽的代码风格 函数式组件,状态保存在运行环境, 3.代码更少 取 prop 值更加容易,更改状态更加容易
缺点:1.响应式的 useEffect,某个依赖的 useEffect 变更,带来链式的更新.
2.闭包陷阱状态不同步.每个函数独立运行,拥有自己独立的作用域.异步操作时,异步回调引用的变量是之前的.
## 避免 hooks 常见问题
不要在 useEffect 写太多依赖,划分单一功能
# 为什么需要 hooks

组件之间复用逻辑难
复杂组件变得难以理解
难用的类组件

# useContext 怎么优化?

react 的更新是自上而下的,所以当 Context 更新时,所有子组件都会跟着更新.而 React.memo 仅检查 props 变更.如果函数组件被 React.memo 包裹,而其实现中拥有 useState 和 useContext 的 hook,当 context 改变是,他仍会重新渲染.useContext 可以击穿一切 memo

## 通过 useMemo 包裹子函数判断.

缺点,可能随着业务复杂程度上升子函数判断更新条件也上升.

## 拆分 Context,使其包裹最近的子组件

缺点: 拆分太碎反而会导致应用难以维护

# useState 调用流程

首次渲染: useState => 通过 resolveDispatcher 获取 dispatcher => 调用 dispatcher.useState => 调用 mountState initState,通过单项链表形式互相串联.

更新过程: useState => 通过 resolveDispatcher 获取 dispatcher => 调用 dispatcher.useState => 调用 updateState,按照之前构建好链表顺序去取出对应数据信息渲染 => updateReducer

# hooks 初始化

## 1. mountWorkInProgressHook

组件初始化的时候,每一次 hooks 执行,如 useState(), useRef() 都会调用 mountWorkInProgressHook.

```js
function mountWorkInProgressHook() {
  const hook = {
    memoizedState: null,
    baseState: null, // usestate和useReducer中,一次更新中 ，产生的最新state值
    baseQueue: null,
    queue: null,
    next: null,
  }
  if (workInprogressHook === null) {
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
  } else {
    workInProgress = workInProgressHook.next = hook
  }
  return workInProgressHook
}
```

## 2. 初始化 useState => mountState

得到初始化的 state,将他赋值给 mountWorkInProgressHook 产生的 hook 对象的 memoizedState 和 baseState 属性.
然后创建一个 queue 对象,里面保存了负责更新的信息.
无状态组件中,useState 和 useReducer 触发函数更新的方法都是 dispatchAction.useState 可以看成是一个简化的 useReducer.

```js
function mountState(initialState) {
  const hook = mountWorkInProgressHook()
  if (typeof initialState === 'function') {
    initialState = initialState()
  }
  hook.memoizedState = hook.baseState = initialState
  const queue = (hook.queue = {
    pending: null, // 待更新的
    dispatch: null, // 负责更新的函数
    lastRenderedReducer: basicStateReducer, // 用于得到最新的 state
    lastRenderedState: initialState, // 最后一次得到的 state
  })
  const dispatch = (queue.dispatch = dispatchAction.bind(
    null,
    currentlyRenderingFiber,
    queue
  ))
  return [hook.memoizedState, dispatch]
}
```

### dispatchAction 无状态组件更新机制

不论类组件调用 setState 还是函数组件 dispatchAction,都会产生一个 update 对象.记录此次更新的信息.
然后将次 update 放入待更新的 pending 队列中,dispatch 第二步会判断当前函数组件的 fiber 对象是否处于
渲染阶段,处于的话就不需要我们更新当前函数组件,更新当前 update expirationTime 即可.
处于没有更新阶段,通过 lastRenderedReducer 获取最新的 state 和上一次的 state,进行浅比较,相等就退出.

```js
function dispatchAction(fiber, queue, action) {
  const update = {
    expirationTime,
    suspenseConfig,
    action,
    eagerReducer: null,
    eagerState: null,
    next: null,
  }
  const pending = queue.pending
  if (pending === null) {
    // 第一次更新
    update.next = update
  } else {
    update.next = pending.next
    pending.next = update
  }
  queue.pending = update
}
```

## 3 初始化 useEffect -> mountEffect
每个 hook 初始化都会创建一个 hook 对象,然后将 hook 的 memoizedState 保存当前的 effect hook 信息.
注意 
 workInProgress / current 树上的 memoizedState 保存的是当前函数组件每个 hooks 形成的链表
 每个hook上的 memoizedState 保存的是当前 hook 信息,不同种类的 hook memoizedState 内容不同.
```js
function mountEffect(create, deps) {
  const hook = mountWorkInProgressHook()
  const nextDeps = deps === undefined ? null : deps
  hook.memoizedState = pushEffect(
    HookHasEffect | hookEffectTag,
    create, // useEffect 第一次参数，就是副作用函数
    undefined,
    nextDeps // useEffect 第二次参数，deps
  )

}
```
