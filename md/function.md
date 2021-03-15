# 函数
## 高阶函数
  * 接受一个或多个函数作为输入
  * 输出一个函数
## 函数组合composeFn
```js
  function compose(...funcs){
    return (x) => {
      return funcs.reduce((arg,fn) => fn(arg), x)
    }
  }
```
## 柯里化
我们将一个带有多个参数的函数转换成一系列的嵌套函数,他返回一个新函数,在这个新函数期望传入下一个参数.当接受足够参数后,会自动执行原函数.
```js
  const curry = func => {
    return function curried(...args){
      if(args.length >= func.length){
        return func.apply(this,args)
      }else{
        return (...innerArgs) => {
          return curried.apply(this,args.concat(innerArgs))
        }
      }
    }
  }
```
## 偏函数
偏函数应用指固定一个函数某些参数,然后产生另一个更小元的函数.而所谓的元是指函数参数的个数,比如含有一个参数的函数被称为一元函数.
偏函数和柯里化的区别:
  * 偏函数应用是固定一个函数的一个或多个参数,并返回一个可以接收剩余参数的函数
  * 柯里化是将函数转化为多个嵌套的一元函数.

```js
  function partial(fn){
    let args = [].slice.call(arguments,1)
    return function(){
      const newArgs = args.concat([].slice.call(arguments))
      return fn.apply(this,newArgs)
    }
  }
```

## 惰性函数
指第1次根据条件执行函数后,第二次调用函数时就不再检测条件直接执行含税了.
## 缓存函数