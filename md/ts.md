# 从输入输出看 typescript 
如果我们把 Typescript 编译器看成一个黑盒.
**输入就是使用 Typescript 语法书写的文本,或文本集合**
输出是编译之后的 JS 文件和 d.ts 的声明文件. d.ts 的声明文件就是 ts 文件中的类型声明,这个类型声明就是你在 ts 文件中声明的类型和 Typescript 类型推导系统推导的类型.
# Typescript 编译器工作机制
* Typescript 文本首先会被解析为 token 流
* token 流转换为 AST
* binder 根据 AST 信息生成 Symbol(Typescript 中一个数据结构).
* 当我们需要检查的时候,checker 会根据前面生成的 AST 和 Symbols 生成类型检查结果.
* 当我们需要生成JS 文件的时候,emitter 同样会根据前面声称的 AST 和 symbols 生成 js 文件.

# interface 和 type 不同

interface: 接口
type: 类型别名,不会产生类型 
1.描述语法不同

```js
interface Point {
  x: number;
}
type Point = {
  x: number,
};
```

2. ### 类型别名可以用于其他类型,如基本类型,联合类型,数组
   
3.都可以扩展
   interface 通过 extends
   type 通过 & 4.类可以用相同的方式实现接口和类型别名.但是类和接口被认为是静态的,所以不能实现联合类型的系统别名
4. 类定义会创建类的实例类型和构造函数,所以能使用接口的地方也可以使用类

```js
class Point {
  x: number;
  y: number;
}

interface Point3d extends Point {
  z: number;
}
```

6.  ### 接口同名会合并 type 不行
7.  type 支持计算数学

```js
  type Keys = "firstname" | "surname"

  type DudeType = {
    [key in Keys]: string
  }

  const test: DudeType = {
    firstname: "Pawel",
    surname: "Grzybek"
  }

  // 报错
  //interface DudeType2 {
  //  [key in keys]: string
  //}
```

react 推荐 api 使用接口定义,prop 和 state 用 type

# keyof 和 typeof

keyof 与 Object.keys 类似,只取 interface 的键,取到键后保存为联合类型
typeof 获取的事类的类型,可以获取类上面的静态属性/方法

```ts
class Greeter {
  static message = 'hello';
  greet() {
    return Greeter.message;
  }
}
// 获取的是实例的类型，该类型可以获取实例对象上的属性/方法
let greeter1: Greeter = new Greeter();
console.log(greeter1.greet()); // 'hello'
// 获取的是类的类型，该类型可以获取类上面的静态属性/方法
let greeterTwo: typeof Greeter = Greeter;
greeterTwo.message = 'hey';
let greeter2: Greeter = new greeterTwo();
console.log(greeter2.greet()); // 'hey'
```

# 访问修饰符的区别

public: 默认值,定义的类中、类的实例、子类、子类实例都可以访问
private: 只能在定义的类中访问,类的实例、子类、子类的实例都不能访问
protected: 只允许定义的类和子类中访问,不允许通过实例访问
# infer
infer 关键字常在条件类型中和 extends 关键词一起出现,表示将要推断的类型,作为类型变量可以在三元表达式的 True 部分引用.
```ts
  type ReturnType<T extends (...args:any[])> = T extends (...arg:any[]) => infer R ? R : any
  type Parameters<T> = T extends (...args:infer P) => any ? P : never
```
# types 和 typesRoots 有啥区别?
  1. typeRoots: 用来指定默认的类型声明文件查找路径,默认为 node_modules/@types
  2. types: typescript 编译器会默认引入 typeRoot 下所有的声明文件.但有时候我们并不希望**全局引入所有定义**,仅引入部分模块.
  ```js
    {
      "compilerOptions": {
        "typeRoots": ["./typings"],
        "types": ["jquery"]
      }
    }
  ```

# 接口继承

```javascript
    interface Shape {
        color: string
    }
    interface PenStroke {
        penWidth: number
    }
    interface Square extends Shape, PenStroke {
        sideLength: number
    }
```
# interface & type
1. interface: 接口  type: 类型别名,不会产生类型
2. **类型别名可以用于其他类型,如基本类型、联合类型、数组**
3. 都可以扩展. interface通过extends, type通过 & 
4. **接口同名会合并,但是类型别名不会**
5. type 支持计算数学,可以类型推到


```typescript
    /** interface extends interface */
    interface PartialPointX { x: number; }
    interface Point extends PartialPointX { y: number; }
    /**  type extends type */
    type PartialPointX = { x: number; }
    type Point = PartialPointX & {y: number}
    /**  interface extends type */
    type PartialPointX = { x: number; }
    interface Point extends PartialPointX {y:number}
    /**  type extends interface */
    interface PartialPointX { x: number; }
    type Point = PartialPointX & {y: number}
```
![-w540](media/16141488943910/16141509956943.jpg)

# typeof 和 keyof
keyof与Object.keys类似, 将type/interface的最外层key保存为联合类型.
typeo 根据一个已有变量或者对象,获取类上面的静态属性和方法
```ts
    function get<T extends object, K extends keyof T>(o: T, name: K): T[k] {
        return o[name] 
    }
```

# 查找类型 + 泛型 + keyof
泛型是指在定义函数、接口或类的时候,不预先指定具体的类型,而在使用的时候再指定类型的一种特性.
```ts
    interface API {
        '/user': { name: string},
        '/menu': { foods: string[]},
    }
    const get = <URL extends keyof API>(url: URL): Promise<API[URL]> =>         {
    return fetch(url).then( res => res.json())
    }
```
# 显示泛型
```ts
    const $ = <T extends HTMLElement>(id: string):T => {
      return (document.getElementById(id)) as T
    }
    /** 显示泛型, 声明时确定类型 */
    const ipt = $<HTMLInputElement>("ipt")
    console.log('ipt.val',ipt.value);
```
# 两次泛型的连续使用
提取可变的数据类型data,让Ts推断出这个接口的返回数据是什么格式的.减少不必要的重复代码,即每次接口调取都会返回的数据格式类型.

# 颗粒度定义类型后的问题
Test2 接口比 Test1 接口多一个 b 属性,Test1接口可以说是Test2接口的子类.这就是多态性.

```ts
  interface Test1 {
    a: number
  }
  interface Test2 {
    a: number
    b: number
  }
  var test1: Test1 = {
    a: 1
  };
  var test2: Test2 = {
    a: 1,
    b: 2,
  };
  test1 = test2
  test2 = test1   // 类型 "Test1" 中缺少属性 "b"，但类型 "Test2" 中需要该属性。ts(2741)

```

# TS优势
1. 静态输入: 编写代码阶段检测问题
2. 自动完成和动态输入提升开发效率
3. 具有类型的系统,是 js 的超集
4. 在组件及业务类型校验上支持很强
5. 命令空间+接口申明更方便类型校验.防止代码不规范.(通过这个反推代码规范化)
6. 

# XOR的实现
```ts
  type Without<T,U> = {[P in Exclude<keyof T, keyof U>]?: never}
  type Xor<T,U> = Without<T,U> & U | Without<T,U> & T
```