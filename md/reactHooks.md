# react 内置方法
  1.useEffect、uselayoutEffect
    useEffect  本次更新结束后 执行 callback
    uselayoutEffect 类似于 componentDidUpdate 执行,dom 更新完成后立即执行,阻塞浏览器绘制.会有闪一下效果.
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

#  react hooks 优缺点
  1.更容易复用代码(通过自定义 hooks)
  2.清爽的代码风格 函数式组件,状态保存在运行环境,
  3.代码更少 取 prop 值更加容易,更改状态更加容易
# 为什么需要 hooks
  组件之间复用逻辑难
  复杂组件变得难以理解
  难用的类组件
# useContext怎么优化?
  react的更新是自上而下的,所以当Context更新时,所有子组件都会跟着更新.而React.memo仅检查props变更.如果函数组件被React.memo包裹,而其实现中拥有useState 和useContext的hook,当context改变是,他仍会重新渲染.useContext可以击穿一切memo
  ## 通过useMemo包裹子函数判断.
  缺点,可能随着业务复杂程度上升子函数判断更新条件也上升.
  ## 拆分Context,使其包裹最近的子组件
  缺点: 拆分太碎反而会导致应用难以维护

# useState 调用流程
首次渲染: useState => 通过 resolveDispatcher 获取 dispatcher => 调用 dispatcher.useState => 调用 mountState initState,通过单项链表形式互相串联.

更新过程: useState => 通过 resolveDispatcher 获取 dispatcher => 调用 dispatcher.useState => 调用 updateState,按照之前构建好链表顺序去取出对应数据信息渲染 => updateReducer


