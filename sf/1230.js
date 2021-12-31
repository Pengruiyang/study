// 原生实现async awit
function run(generator) {
  return new Promise((resolve, reject) => {
    let g = generator()
    const next = (res) => {
      let result
      try {
        result = g.next()
      } catch (error) {
        reject(error)
      }
      if (result.done) return result.value
      result.value.then(next, (error) => reject(gen.throw(err).value))
    }
    next()
  })
}
// 手写快排
var quickSort = function (arr, l, r) {
  if (l >= r) return
  let i = l,
    j = r
  while (i < j) {
    while (i < j && arr[j] >= arr[l]) j--
    while (i < j && arr[i] <= arr[l]) i++
    swap(arr, i, j)
  }
  // 最后一步交换初始位置 和index位置 这样左边全部比他小,右边比他大
  swap(arr, l, i)
  // 二分然后排序
  quickSort(arr, l, i - 1)
  quickSort(arr, i + 1, r)
}
var swap = function (arr, i, j) {
  // let temp = arr[i]
  // arr[i] = arr[j]
  // arr[j] = temp
  ;[arr[j], arr[i]] = [arr[i], arr[j]]
}

// new 运算符
function _new(fn, ...args) {
  // 创建一个新对象,新对象原型属性指向构造函数原型对象
  const protoType = Object.create(fn.protoType)
  // 将属性和方法添加到新对象上,这个新对象会绑定到构造函数的this
  const result = fn.call(protoType, ...args)
  // 判断构造函数内部有没有对象返回,有就返回那个对象.没有则返回我们新创建的对象
  return result instanceof Object ? result : protoType
}
// 继承
function initPrototype(father, child) {
  // 复制父节点原型对象
  child.protoType = Object.create(father.protoType)
  // 指向新建子类
  child.protoType.constructor = child
}
function Father(name) {
  this.name = name
}
function B(name, age) {
  Father.call(this, name)
  this.age = age
}
initPrototype(Father, B)

Promise.all = (promises) => {
  return new Promise((resolve, reject) => {
    if (!promises || promises.length === 0) return resolve([])
    let res = [],
      len = promises.length - 1
    promises.forEach((promise, i) => {
      Promise.resolve(promise).then((val) => {
        if (i === len) {
          resolve(res)
        } else {
          res[i] = val
        }
      }, reject)
    })
  })
}
Promise.race = (promises) => {
  return new Promise((resolve, reject) => {
    promises.forEach((promise) => promise.then(resolve, reject))
  })
}
// right 是否在left的原型链上
function MyInstanceOf(left, right) {
  let proto = left.__proto__
  while (true) {
    if (proto === null) return false
    if (proto === right.protoType) return true
    proto = proto.__proto__
  }
}
function curry(fn) {
  const inner = (...args) => {
    if (fn.length === args.length) {
      return fn.call(this, ...args)
    }
    return (...innerArgs) => inner.call(fn, ...args, ...innerArgs)
  }
  return inner
}
const pipe =
  (...args) =>
  (x) =>
    args.reduce((prev, current) => current(prev), x)

class EventEmitter {
  constructor() {
    this.events = {}
  }
  on(eventName, callback) {
    if (!this.events[eventName]) {
      this.events[eventName] = [callback]
    } else {
      this.events[eventName].push(callback)
    }
  }
  emit(eventName) {
    if (!this.events[eventName]) {
      return false
    }
    this.events[eventName].forEach((cb) => cb())
  }
  remove(eventName, callback) {
    if (this.events[eventName]) {
      this.events[eventName].filter((cb) => cb !== callback)
    }
  }
}
function sleep(delay) {
  return new Promise((resolve) => {
    let timer = setTimeout(() => {
      resolve()
      clearTimeout(timer)
    }, delay)
  })
}
// 洋葱模型核心compose
function compose(middlewares) {
  return (ctx) => {
    const dispatch = (i) => {
      const middleware = middleware[i]
      if (i === middlewares.length) {
        return
      }
      return middleware(ctx, () => dispatch(i + 1))
    }
    dispatch(0)
  }
}

function throttle(fn,time){
  let flag = true, timer = null
  return (...args) => {
    if(!flag)return
    flag = false
    timer = setTimeout(()=>{
      fn(...args)
      clearTimeout(timer)
    }, time)
  }
}
function debounce(fn,time){
  let timer = null
  return (...args) => {
    if(timer) clearTimeout(timer)
    setTimeout(()=>{
      fn(...args)
    },time)
  } 
}