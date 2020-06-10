# for 循环和 forEach循环,那种性能会更好一点?  
  for循环会更好,没有额外的函数调用栈和上下文. array.forEach(function(currentValue,index,arr),thisValue)
# 什么是 Symbol?
生成一个全局唯一的值.可以用于:作为属性名解决属性名冲突问题、替代代码中多次使用的字符串、作为对象非私有的但希望用于内部的方法
# 如何转换一个类数组对象,原理是什么?
[...objectLikeArray] array.from(objectLikeArray) 
Array.prototype.slice.call(objectLikeArray)
相当于新建了一个数组,从 0 一直取到了最后一项
# Map 和 weakmap 的区别
  Map 可以被遍历
  weakmap 只接受对象作为键名,不接受其他类型.键名弱引用,键名可以被垃圾回事,此时键名无效.不能被遍历.
