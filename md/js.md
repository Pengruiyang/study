# 小数精度问题

js 统一用的是双精度浮点数,小数部分二进制装换成十进制

# ES5 继承和 ES6 继承的区别

Es5 继承实质上是先创建子类实例对象,然后再将父类的方法添加到 this 上(Parent.call(this))
es6 继承是先创建父类实例对象 this,在用子类构造函数修改 this.因为子类没有自己的 this,需要 super()方法.es6不仅继承了类的原型对象,还继承了静态属性和方法.

# 前端路由原理

1.通过 Hash 实现前端路由
路由改变会触发 hashchange 事件
缺点:seo 不友好 难以追踪用户行为 2.通过 history 实现前端路由
pushState
replaceState
缺点:兼容性问题,需要后端配置,不然出现 404 页面

# script 标签中的 async 和 defer

defer: 浏览器异步下载该文件并且不会影响到后续的 DOM 渲染,如果有多个设置 defer 的 script 标签,则会按照顺序执行所有的 script.defer 会在文档渲染完毕后,DOMContentLoaded 事件调用前执行.
async: 会使 script 脚本异步加载并在允许的情况下执行. async 的执行,并不会按着 script 在页面中的顺序来执行,而是看谁先加载完谁执行.

# commonjs 和 es6 模块导出

CommonJs 规范加载模块是同步的,nodeJs 主要用于服务器变成,模块文件一般已存在本地硬盘,加载比较快.输出的一个值的拷贝.运行时加载模块


# 工作中封装组件

vue 后台管理中,表单页面拆分了一个组合组件,因为表单内部构成基本一致,基本有搜索栏、表单栏、分页栏三部分组成,代码重复度特别高.
搜索栏传入 formConfig ,
给了左侧右侧或者自定义按钮的 slot,防止需求需要
根据 type 渲染对应的 element-ui 组件,比如 input => el-input,textButton =>a,button=>el-button.在监听他们 change 事件
input 框需要根据是否内置 icon 给了左边和右边标签.或者左右侧的文字.类似于 X 元
表单配置 columns 数组 中间配置 slot columns 与 name 的地方
封装 toast 组件 容器组件和 notice 消息组件
notice 组件控制 toast 的内容 type
容器组件:
key 值,state 维护消息数组,添加消息和移除消息,设置消息的 key 值
添加消息是我们首先需要判断 key 有没有重复.没有就添加进消息数组中.然后定时器触发一个自动移除的方法,这个方法需要传入 key 值遍历判断,时间为设置的时间.
一个 transitionGroup 中 循环出 toastinfo
然后我需要在 body 创建一个 div,把容器放入 div 中,返回两个方法.根据 ref 找到 addNotice 方法和 div 方法.
首次会创建这个 div 和容器组件,之后直接使用其中添加方法.

# 箭头函数和普通函数的区别

箭头函数都是匿名函数,没有自己的 this,this 在创建是绑定当前的上下文.没有 arguments 对象,不能被 new ,没有自己的原型属性.

# 项目优化

从 dns 轮询
tcp/ip 链接
http 请求抛出
服务端处理请求,http 响应返回
浏览器拿到相应数据,解析响应内容,把解析结果展示给用户
(构建功能性能优化、图片优化、浏览器缓存、服务端渲染、css 性能优化、js 性能优化、重绘回流、节流防抖)

# 为什么 constructor.prototype.constructor 指向 constructor 本身?

为了方便实例化后 constructor 指向原型本身

# 重绘重排合成之间的区别

_重绘不一定导致重排,重排一定导致重绘_ 1.重排: dom 发生了几何元素的修改,整个渲染树需要重新计算.
触发方式: 页面首次渲染、浏览器窗口改变、元素位置尺寸改变、新增删除可见元素、内容发生改变、字体变化、伪类激活、设置 style 属性、查询或调用某些方法*即时性与准确性* getComputedStyle | IE 中的 currentStyle 也会触发重排 2.重绘: dom 元素只发生了可见不见,背景颜色之类的变更,没有发生几何元素上的修改.

```js
div.style.left = '10px';
div.style.top = '10px';
div.style.width = '20px';
div.style.height = '20px';
```

理论上会带来 4 次重排+重绘 但由于浏览器的渲染机制只会触发一次重排:
_当我修改了元素的几何属性,导致浏览器触发了重排或者重绘,他会把该操作放进渲染队列中,等到队列中操作到了一定的数量或者一定时间间隔时,浏览器会批量进行这些操作_

强制刷新队列：

```js
div.style.left = '10px';
console.log(div.offsetLeft);
div.style.top = '10px';
console.log(div.offsetTop);
div.style.width = '20px';
console.log(div.offsetWidth);
div.style.height = '20px';
console.log(div.offsetHeight);
```

这段代码却会触发 4 次重排,因为 console 中请求的样式信息.浏览器会为了准确性和即时性,立刻执行渲染队列的任务.
减少重排重绘的操作 1.使用分离读写操作,

```js
div.style.left = '10px';
div.style.top = '10px';
div.style.width = '20px';
div.style.height = '20px';
console.log(div.offsetLeft);
console.log(div.offsetTop);
console.log(div.offsetWidth);
console.log(div.offsetHeight);
```

      这次只触发了一次重排,在第一次 console 的时候,浏览器就把之前写操作的渲染队列给清空了,剩下的 console,因为渲染队列已经空了,所以不会触发重排,只做拿值操作.
      2.使用 className 集中处理
      3.使用变量缓存获取到属性值
      4.DocumentFragment 创建一个 dom 碎片,操作完成后整体加入 html 中,只触发一次
      5.复制节点,副本上工作,然后替换它
      6.position:absolute或 fixed 的元素,重排开销比较小.也可以开启 GPU 加速

# 函数作用域是在什么时候形成的?

js 在解释阶段就会确认作用域规则,因此作用域规则在函数定义的时候就已经确认了,而不是在函数调用时确认.但是函数执行上下文是在函数执行前被创建.this 的指向是在执行时确认的.
_执行上下文运行时确认随时可能改变,作用域定义时确认,不会发生改变_

# 什么是闭包?

访问另一个函数的变量的函数
js 中,变量作用域属于函数作用域,函数执行完后作用域被销毁.但由于闭包是建立在上一个函数内部的子函数,可以访问上级作用域,所以上级函数执行完后,作用域也不会随即消失.这个子函数就是闭包.
作用: 函数内部与外部之间的桥梁,拥有上级作用域的访问与操作能力.
应用:定义模块,暴露操作方法,隐藏模块细节. 单例模式.防抖.组件独立属性.

# addEventListener 第三个参数

capture: 捕获阶段触发
once: 触发一次
passive: listener 不会调用 preventDefault() 开启用于滚屏性能,防止出现弹窗背景跟着一起滚动的状况

# 模拟实现一个请求超时

封装一个 promise 函数,正常调用 fetch 请求方法,再给一个定时器 reject(Error)

# class 的静态方法 实例属性

类(class)相当于实例的原型,所有在类中定义的方法,都会被实例继承.加上 static 关键字,就不会被实例继承,而是直接通过类来调用.这就是静态方法.
static 关键字,表明是静态方法,可以直接在 Foo 上调用,不能在实例上调用.可以被子类继承

实例属性

```jsx
class ReactCounter extends React.Component {
constructor(props) {
  super(props);
  this.state = {
    count: 0
  };
}
}

//等价于
class ReactCounter extends React.Component {
state = {
  count: 0
};
```
# js new的原理
1.创建一个新对象,新对象的原型属性指向构造函数的原型对象
2.将属性和方法添加到新对象上
3. 判断构造函数内部有没有返回对象,如果有,就返回那个对象,没有,则返回我们创建的新对象
```js
  function _new(fn,...args){
    let ret = Object.create(fn.prototype)
    let obj = fn.call(ret,...args)
    return obj instance Object ? obj : ret;
  }
```
# 手写 bind
```js
  Function.prototype.myBind = function(fn,...args){
    return (...innerArgs) => this.call(fn,...args,...innerArgs)
  }
```
# Promise.resolve()作用
  返回一个全新的 promise 对象.
# co函数实现原理
  ```js
    function coSimple(gen,...args) {
      let ctx = this;
      gen = gen.apply(ctx, args);
      return new Promise((resolve, reject) => {
        onFulfilled();
        function onFulfilled(res) {
          const ret = gen.next(res);
          next(ret);
        }
        function next(ret) {
          const promise = ret.value;
          promise && promise.then(onFulfilled);
        }
    });
  }
  ```
