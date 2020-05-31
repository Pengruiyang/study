export default function combineReducers(reducers){
  const reducerKeys = Object.keys(reducers)

  // 返回合并后新的 reducer 函数
  return function combination(state={},action){
    let newState = {}
    for(let i = 0; i< reducerKeys.length; i++){
      const key = reducerKeys[i]
      const reducer = reducers[key]

      // 之前 key 的 state 值
      const prevStateForKey = state[key]

      const nextStateForKey = reducer(prevStateForKey,action)
      newState[key] = nextStateForKey
    }
    return newState
  }
}