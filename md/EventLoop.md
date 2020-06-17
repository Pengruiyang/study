### requestAnimateFrame 
  raf回调特征:
  1. 在重新渲染前调用
  2. 很可能在宏任务之后不调用
  因为 raF 是官方推荐用去做流畅动画所使用的api,如果在渲染之后更改 dom,就只能等到下一轮渲染机会才能去绘制.相当于浏览器在渲染之前给你最后一个机会改变 dom 属性.

### 宏任务之间不一定伴随着浏览器的绘制 
  ```
    setTimeout(() => {
      document.body.style.background = "red"
      setTimeout(() => {
        document.body.style.background = "blue"
      })
    })
  ```
  如果两个 Tast 之间刚刚好遇到了浏览器的渲染机会,name 会发生重绘,否则不会.如果你把延时调整到 17ms 那么重绘的概率会大很多，毕竟这个是一般情况下 60fps 的一个指标。但是也会出现很多不绘制的情况，所以并不稳定。
### 定时器合并
  ```
    setTimeout(() => {
      console.log("sto")
      requestAnimationFrame(() => console.log("rAF"))
    })
    setTimeout(() => {
      console.log("sto")
      requestAnimationFrame(() => console.log("rAF"))
    })

    queueMicrotask(() => console.log("mic"))
    queueMicrotask(() => console.log("mic"))

  ```
  输出结果
  ```
    mic
    mic
    sto
    sto
    rAF
    rAF

  ```
### requestIdleCallback
浏览器提供给我们的空闲调度算法.让我们把一些计算量大却有没那么紧急的任务放到空闲时间去执行.不影响浏览器中优先级较高的任务.
回调中 deadline 字段 timeRemaining 计算剩余时间,第二个字段{timeout:500}防止任务被饿死,强制执行 rIC函数

