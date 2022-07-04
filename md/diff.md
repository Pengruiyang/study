# tree diff
DOM节点中跨层级移动操作比较少,react updateDepth对Virtual DOM进行层级控制.只会对同一父节点下所有子节点进行比较.当发现节点不存在,该节点及其子节点会被完全删除,不会进行进一步比较.这样只需要对树进行对比一次.
跨节点操作时会删除再创建节点
```js
  updateChildren: function(nextNestedChildrenElements,transaction,context){
    updateDepth++
    var errorThrown = true
    try {
      this._updateChildren(nextNestedChildrenElements,transaction,context)
      errorThrown = false
    }finally{
      updateDepth--
      if(!updateDepth){
        if(errorThrown){
          clearQueue()
        }else{
          processQueue();
        }
      }
    }
  }
```
# component diff
* 如果是同一类型组件,按照原策略比较virtual Dom tree
* 如果不是,该组件为dirty component,从而替换整个组件下组节点
* react允许用户通过shouldComponentUpdate判断该组件是否需要diff

# element diff
  当组件出于同一层级时,react diff


# diff 概念
对于update的组件,他会将当前组件与该组件在上次更新时对应的Fiber节点比较,将比较的结果生成新的Fiber节点.
  1. current Fiber.如果该DOM节点已在页面中,current Fiber代表DOM节点对应的Fiber节点.
  2. workInProgress Fiber.如果该DOM节点将在本次更新中渲染到页面中,workInProgress Fiber代表该DOM节点对应的Fiber节点.
  3. DOM节点本身
  4. JSX对象,即ClassComponent/FunctionComponent的render方法返回结果,包含DOM节点全部信息.
  Diff算法本质是对比 1 和 4 生成 2.

# Diff是如何实现的
入口函数 reconcileChildrenFibers 出发,该函数会根据 newChild (JSX 对象)类型处理不同函数.
```js
  function reconcileChildFibers(returnFiber,currentFirstChild,newChild){
    const ifObject = typeof newChild === 'object' && newChild !== null;
  }
```
我们可以从同级的节点数量将 Diff 分为两类:
1. newChild 类型为 object、number、string,代表同级只有一个节点
2. newChild 类型为 Array,同级有多个节点
## 单节点 Diff
  ```js
    if(上次更新时的 Fiber 节点是否存在对应的 DOM 节点){
      if(DOM节点是否可以复用){
        将上次更新的 Fiber 节点的副本作为本次新生成的 Fiber 节点返回
      }else{
        标记 DOM 删除 => 新生成一个 Fiber 节点
      }
    }else{
      新生成一个 Fiber 节点并返回
    }
  ```
  ### DOM 节点是否可以复用怎么判断的?
  React 先判断 key 是否相同,如果 key 相同则判断 type 是否相同,只有都相同时可以复用
  **当 child !== null 且 key 相同,type 不同时将 child 及其兄弟 fiber 全部删除.**
  当 child !== null 且 key 不同仅将 child 标记删除
## 多节点 Diff
  日常开发中,更新组件发生的频率更高.所以 Diff 会优先判断当前节点是否属于更新.
  Diff 逻辑会有两轮遍历,先处理更新的节点,第二轮去处理剩下不属于更新的节点.
  ### 第一轮遍历
  1. let i = 0, 遍历 newChildren,将 newChildren[i] 与 oldFiber比较,判断 DOM 节点是否可以复用.
  2. 如果可以 i++,继续比较 newChildren[i] 和 oldFiber.sibiling,如果可以复用继续遍历.
  3. 如果不可以复用.判断是 key 不同导致的还是 key 相同但 type 不同导致的.如果 key 不同直接跳出整个遍历,第一轮结束.如果 type 导致的会将 oldFiber 标记为 DELETION,并继续遍历.
  4. 如果newChildren 遍历完或者 oldFiber 遍历完,跳出遍历遍历结束.

  ### 第二轮遍历
  第一轮遍历结果如下:
  #### newChildren 和 oldFiber 同时遍历完
  第一轮遍历进行组件更新,diff 结束
  #### newChildren没遍历完,oldFiber 遍历完成
  已有的 DOM 节点都复用了,意味着本次更新有新节点插入,我们只需要遍历剩下的 newChildren 为生成的 workInProgress fiber 一次标记 Placement
  #### newChildren 遍历完,oldFiber 没遍历完成
  意味着本次更新比之前节点少了,节点被删除了,遍历剩下的 oldFiber,依次标记 Deletion
  #### newChildren 和 oldFiber 都没遍历完
  ##### 处理移动的节点
  将剩下未处理的 oldFiber 存入以 key 为 key,oldFiber 为 value 的 map 中
  ```js
    const existingChildren = mapRemainingChildren(returnFiber,oldFiber)
  ```
  接下来遍历剩余的 newChildren,通过 newChildren[i].key 就能在 existingChildren 中找到key 对应的 oldFiber.
  ##### 表及节点是否移动
  节点移动的参照物: 最后一个可复用节点在 oldFiber 中位置索引.(用 lastPlacedIndex 表示)
  由于本次更新中节点按 newChildren 顺序排列,在遍历 newChildren 过程中,每个遍历到可复用节点一定是当前遍历到的所有可复用节点最靠右的那个,即一定在 lastPlacedIndex 对应的可复用节点在本次更新中位置的后面.
  那么我们只需要比较遍历到的可复用节点在上次更新时是否也在 lastPlacedIndex 对应的 oldFiber 后面,我们就知道两次更新中这两个节点相对位置改变没有.
  用 oldIndex 表示遍历到可复用节点在 oldFiber 中位置索引.如果 oldIndex < lastPlacedIndex,代表本次跟新需要向右移动.
  lastPlacedIndex初始为 0,每遍历一个可复用节点,如果 oldIndex >= lastPlacedIndex,则lastPlacedIndex = oldIndex.


```js
// 之前
abcd  
// 之后
dabc
===第一轮遍历开始===
d => a
key 改变,不能复用
===第一轮遍历结束===

===第二轮遍历开始===
newChildren === abcd
oldFiber === dabc
将 oldFiber(abcd)保存为map
遍历 newChildren dabc

// 当前 oldFiber abcd
// 当前 newFiber dabc
key === d 在 oldFiber 存在
oldIndex = d( abcd ).index 中
 oldIndex === 3  // oldFiber abcd 
 lastPlaceIndex === 0;
 oldIndex > lastPlaceIndex //仅在 oldIndex > lastPlaceIndex 才会改变 lPI 的值
 lastPlaceIndex = oldIndex
 d 节点位置不变
 继续剩下的 newChildren

 // 当前oldFiber: abc
 // 当前newFiber: abc
 key === a 在 oldFiber 存在
 oldIndex = a( abcd ).index
 oldIndex === 0
 oldIndex < lastPlaceIndex
 a 需要向右移动
 继续剩下的 newChildren

 ```