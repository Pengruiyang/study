## Error 的扩展
```js
  const oldError = Error
  Error = function({code,message,fileName,lineNumber}){
    const error = oldError(message,fileName,lineNumber)
    error.code = code
    return error
  }
```

## Error 手动抛出和自动抛出
  一个异常发生时,其会沿着函数调用栈逐层返回,直到第一个catch 语句,catch 语句内部也可以触发异常.如果 catch 语句内部发生了异常,也一样会沿着其函数调用栈继续执行上述逻辑.

## 异常的传播

