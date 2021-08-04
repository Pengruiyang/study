# for 循环和 forEach循环,那种性能会更好一点?  
  for循环会更好,没有额外的函数调用栈和上下文. array.forEach(function(currentValue,index,arr),thisValue)
# 什么是 Symbol?
生成一个全局唯一的值.可以用于:作为属性名解决属性名冲突问题、替代代码中多次使用的字符串、作为对象非私有的但希望用于内部的方法
# 如何转换一个类数组对象,原理是什么?
[...objectLikeArray] array.from(objectLikeArray) 
Array.prototype.slice.call(objectLikeArray)
相当于新建了一个数组,从 0 一直取到了最后一项
# Map 和 weakmap、WeakSet、Set 的区别
  Map 对象保存键值对,能够记住键的原始插入顺序.任何值都可以作为一个键或者一个值.Map 对对象是强引用.
  weakmap 只接受对象作为键名,不接受其他类型.键名弱引用,键名可以被垃圾回收,此时键名无效.不能被遍历.
# 兼容性问题
  1.样式兼容性  
  > a.reset.css 重置默认样式
    b.webpack 中使用 postCss autoprefixer 给属性加上默认前端
    c.部分针对功能单独写 (例如透明属性)

  2.交互兼容性
  > 类似 jq,工厂模式,将所有浏览器支持属性写入,判断是否支持该属性,然后使用这个属性去改变.
    例如事件兼容,阻止冒泡,阻止默认行为,scrollTop

  3.浏览器 hack(根据浏览器去做兼容)
# server Worker
# 扫码登录原理
登录页面时,向服务器发送获取登录二维码的请求.
服务器收到请求后,随机生成一个 uuid,将这个 id 存入服务器,设置一个过期时间,若超过过期时间,则需要重新获取二维码
这个 key 生成二维码图片和 uuid返回给浏览器展示.浏览器会不停的轮询,查看登录状态.
移动端 获取到包含用户信息的 token,将 token 作为参数传给服务器发送登录请求.服务求收到后返回确认信息给移动端.内部调用登录方法生成 token 返回给浏览器服务端,浏览器轮询状态变更,登录成功

# Jenkins自动化部署项目
# 如何反爬虫
1. 通过 ua 判断
2. 通过 cookie 平判断
3. 通过访问频率判断
4. 通过验证码判断
5. 动态性页面加载

# EventBus 的设计模式是什么?
1. 首先getDefault 中使用了单例模式,不同线程中只有一个 EventBus 的实例
2. 观察者模式.事件是被观察者,订阅者类是观察者.当事件出现或发生变更的时候,通过 eventBus通知观察者

# css 对于渲染性能的影响
1. 浏览器需要等待 css 转换 styleSheets 创建布局树,分层树后才会开始渲染页面
2. 布局树由 dom 和 styleSheets 计算得到