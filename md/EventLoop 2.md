## 浏览器和node环境中事件循环
    task： setTimeOut、setInterval、script、I/O操作 UI渲染 网络请求 文件读写 setImmedi（）的回调
    jobs： promise.then() MutationObserver(异步 + 微任务的实现 )  process.nextTick
### 浏览器中事件循环
 1.全局上下文推入执行栈中，同步代码进入主线程依次执行。执行过程中，会判断是同步任务还是异步任务，产生新的 task 和jobs。
 2.同步任务执行完出栈，任务队列执行完之后栈空。去微任务队列中看是否有任务。有就执行，执行完微任务队列中所有任务前检查是否有产生新的微任务，有的话会继续执行。没有的话则会进入下一个宏任务事件中。
 循环执行这两部
 每个宏任务都关联一个微任务队列



 ### node中事件循环
 nodejs 采用v8作为js的解析引擎，i/o处理使用libuv作为事件驱动抽象层，事件循环也得以在其中实现。
 nodejs运行机制如下
    v8引擎解析js脚本
    解析后的代码，负责调用node API
    libuv库负责node API的执行。他将不同的任务分配给不同的线程，形成一个Event Loop ，以异步的形式将任务的执行结果返回给v8引擎。
    v8引擎再将结果返回出来


    1. timer阶段 执行timer（setTimeout、setInterval）的回调
    2. i/o callback 执行上一轮循环中少数未执行的i/o回调
    3. idle, prepare 阶段：仅node内部使用
    4. poll阶段 轮训获取新的i/o事件 node适当情况下会阻塞在这里
    5. check阶段 执行 setImmediate（）的回调
    6. close callbacks 阶段：执行 一些 close 事件回调


    timer 阶段也是有poll控制的 和浏览器中一样 时间并不精准 只是尽快执行
    poll 如果有timer 回到timer阶段并执行回调 执行I/O回调
    如果进入该阶段没有timer 
        1.如果poll队列不为空，便利回调队列并同步执行，知道队列为空或者系统上限
        2.如果poll队列为空，2件事发生 
            a.  如果有setImmediate（）的回调需要执行 poll阶段会停止并进入check阶段执行
            b. 如果没有，等待回调直到队列中有事件并立即执行，会有个最大等待时间防止一直等待下去
    当然设定了 timer 的话且 poll 队列为空，则会判断是否有 timer 超时，如果有的话会回到 timer 阶段执行回调。


    ```
    setTimeout(function timeout () {
    console.log('timeout');
    },0);
    setImmediate(function immediate () {
    console.log('immediate');
    });
    ```
    执行先后顺序不确定  看setTimerOut准备成本是否超过1ms 是的话立即执行超时的setTimerOut

    ``` 
        const fs = require('fs')
        fs.readFile(__filename, () => {
            setTimeout(() => {
                console.log('timeout');
            }, 0)
            setImmediate(() => {
                console.log('immediate')
            })
        })
// immediate
// timeout

    ```
    在I/O回调中 永远先执行setImmediate 因为 poll阶段执行I/O回调 执行完成后队列为空 立即执行setImmediate 阶段 所以直接跳转check阶段执行了


 process.nextTick 
 独立于event loop 之外，有一个自己的队列，当每个阶段完成后，如果存在nextTick 就会清空队列中所有回调函数 优于其他微任务执行、

 ### 差异
    浏览器微任务执行在于每个宏任务执行完，而在nodejs中 微任务执行在每个阶段执行完执行 
    node 10 以前的版本 
    定时器会看是否已经完成 如果完成的宏任务定时器 会立即执行

    ```
        setTimeout(()=>{
            console.log('timer1')
            Promise.resolve().then(function() {
                console.log('promise1')
            })
        }, 0)
        setTimeout(()=>{
            console.log('timer2')
            Promise.resolve().then(function() {
                console.log('promise2')
            })
        }, 0)

    ```

    全局main（）函数 执行 依次将两个timer 加入timer队列  main执行完毕弹出 调用栈空闲 任务队列开始执行
    timer 阶段 执行timer1 执行timer1的回调函数，打印timer1， 将promise1放入微任务中 同样步骤执行timer2
    timer阶段结束 执行所有微任务


