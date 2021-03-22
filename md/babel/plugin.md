const { func } = require("prop-types");

```js
/** 
 * 把所有的boolean类型的值转换为!0 或!1. 这就是代码压缩使用的一个技巧
 * 一个plugin就是一个function 入参是babel对象   这里利用babel中types对象,操作path进行节点替换操作
 */
module.exports = function ({types: t}){
  const TRUE = t.unaryExpression("!",t.numericLiteral(0),true)
  const FALSE = t.unaryExpression("!",t.numericLiteral(1),true)
  return {
    visitor: {
      BooleanLiteral(path){
        path.replaceWith(path.node.value ? TRUE : FALSE)
      }
    }
  }
}
```
## path 
  通过path访问当前节点,父节点.去调用添加、更新、移动和删除节点
  
```js
  // 访问当前节点的属性，用path.node.property访问node的属性
  path.node.node
  path.node.left
  // 直接改变当前节点的属性
  path.node.name = "x";
  // 当前节点父节点
  path.parent
  // 当前节点的父节点的path
  path.parentPath
  // 访问节点内部属性
  path.get('left')
  // 删除一个节点
  path.remove();
  // 替换一个节点
  path.replaceWith();
  // 替换成多个节点
  path.replaceWithMultiple();
  // 插入兄弟节点
  path.insertBefore();
  path.insertAfter();
  // 跳过子节点的遍历
  path.skip();
  // 完全跳过遍历
  path.stop();
```

## @babel/types
  一个工具库, 类似于Loadash,里面封装了非常多方法


## scope
作用域,每一个函数,每一个变量都有自己的作用域.在编写babel plugin的时候要特别小心,改变或者添加代码的时候注意不要破坏原有的代码结构
```js
  path.scope 中一些方法可以操作作用域
// 检查变量n是否被绑定（是否在上下文已经有引用）
path.scope.hasBinding("n")
// 检查自己内部是否有引用n
path.scope.hasOwnBinding("n")
// 创建一个上下文中新的引用 生成类似于{ type: 'Identifier', name: '_n2' }
path.scope.generateUidIdentifier("n"); 
// 重命名当前的引用
path.scope.rename("n", "x");
```

