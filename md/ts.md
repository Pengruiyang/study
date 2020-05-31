# interface 和 type 不同

interface: 接口
type: 类型别名 1.描述语法不同

```
  interface Point {
    x:number
  }
  type Point = {
    x: number
  }
```

2. ### 类型别名可以用于其他类型,如基本类型,联合类型,数组
   3.都可以扩展
   interface 通过 extends
   type 通过 & 4.类可以用相同的方式实现接口和类型别名.但是类和接口被认为是静态的,所以不能实现联合类型的系统别名
3. 类定义会创建类的实例类型和构造函数,所以能使用接口的地方也可以使用类

```
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

```
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
