# 小数精度问题
  js 统一用的是双精度浮点数,小数部分二进制装换成十进制
# ES5继承和ES6继承的区别
  Es5继承实质上是先创建子类实例对象,然后再将父类的方法添加到 this 上(Parent.call(this))
  es6 继承是先创建父类实例对象 this,在用子类构造函数修改 this.因为子类没有自己的 this,需要 super()方法.
# 前端路由原理
  1.通过 Hash 实现前端路由
    路由改变会触发 hashchange 事件
    缺点:seo 不友好 难以追踪用户行为
  2.通过 history 实现前端路由
    pushState
    replaceState
    缺点:兼容性问题,需要后端配置,不然出现 404页面

