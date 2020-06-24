# interface 和 type 不同

interface: 接口
type: 类型别名,不会产生类型 1.描述语法不同,

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
3. 类定义会创建类的实例类型和构造函数,所以能使用接口的地方也可以使用类

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
  type ReturnType<T> = T extends (...arg:any) => infer R ? R : any
```
