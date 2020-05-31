export default function createdStore(reducer,initState) {
  let state = initState
  let listeners = []

  // 订阅模式
  function subscribe(listener){
    listeners.push(listener)
  }

  function dispatch(action){
    // 根绝 action 改变 state
    state = reducer(state,action)
    for(let i = 0;i < listeners.length; i++){
      const listener = listeners[i]
      listener()
    }
  }
  function getState(){
    return state
  }
  function replaceReducer(nextReducer){
    reducer = nextReducer
    dispatch({type: Symbol()})
  }
  dispatch({type: Symbol()})
  return {
    subscribe,
    dispatch,
    getState,
    replaceReducer
  }
}