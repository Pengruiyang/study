export default function applyMiddleware(...middlewares){
  return (oldCreateStore) => {
    // 生成新的 createStore
    return function newCreateStore(reducer, initState){
      // 1 生成 store
      const store = oldCreateStore(reducer,initState)
      // 每一个中间件调用 store
      const chain = middlewares.map(middleware => middleware(store))
      let dispatch = store.dispatch
      // 实现 exception(time((logger(dispatch))))
      chain.reverse().map(middleware => dispatch = middleware(dispatch))
      // 重写 dispatch 
      store.dispatch = dispatch
      return store
    }
  }
}