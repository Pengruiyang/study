# babel 到底做了什么?

把 js 中 2015/2016/2017 新语法转换为 es5,让低端环境运行
babel 本身分为三个阶段:
解析 转换 生成
babel 本身不具备任何转换功能,他把转换的功能都分解到一个个插件中,因此,当我们不配置任何插件时,经过 babel 输出输入的代码是一致的.

## babel的 api
@babel/parser 将代码转换为 ast, 可以使用 typescript、jsx、flow 等插件解析相关语法.
@babel/traverse 遍历 ast,调用 visitor 函数
@babel/generate 打印 ast 成目标代码,生成 sourcemap
@babel/types 创建、修改、删除、查找ast节点.
@babel/generator 将转换好的ast重新生成新的代码.运行在浏览器中
@babel-core 整合基本核心插件.将底层代码封装,并加入领带的其他功能.简化插件
## babel 工作原理
## babel 不如 swc esbuild 原因
语言本身的劣势,使用 js 写的 babel 无法使用多核 CPU 优化编译任务处理,相比 swc、esbuild 编译成二进制在 node 执行,是有劣势.
### 插件和预设的区别

```js
  //.babelrc
  {
    "presets": ["@babel/preset-env"],
    "plugins":[]
  }
```

当我们配置了 presets 中 @babel/preset-env, 那么@babel/core 就会去找 preset-env 预设的插件包.
babel 核心包不会去转换代码,核心包只会提供一些核心的 api ,真正的代码转换工作由插件或者预设完成.
presets 就是预设,预设了几套插件.他是 plugins 的集合,包含了多个 plugin.
eg: @babel/preset-env、@babel/preset-react、@babel/preset-typescript

## 编写插件

demo: `const fn = (a, b) => a + b 和 const fn = function(a, b) { return a + b }`

1. 箭头函数**ArrowFunctionExpression**变为普通函数**FunctionExpression**
2. 需要把二进制表达式**BinaryExpression**放到代码块中**BlockStatement**
3. 改变树的结构,生成新的代码,完成转换

### 访问者模式

在访问到某一个路径的时候进行匹配,然后对这个节点进行修改.

```js
const babel = require('@babel/core');
const t = require('@babel/types');
const code = `const fn = (a,b) => a + b`;
const arrowFnPlugin = {
  // 访问者模式
  visitor: {
    ArrowFunctionExpression(path) {
      // 拿到节点之后替换节点
      const node = path.node;
      const params = node.params;
      const body = node.body;
      // 需要判断是不是正常的函数体
      if (t.isBlockStatement(body)) {
        body = t.blockStatement([body]);
      }
      const functionExpression = t.functionExpression(null, params, body);
      // 替换原来的函数
      path.replaceWith(functionExpression);
    },
  },
};
const r = babel.transform(code, {
  plugins: [arrowFnPlugin],
});
console.log(r.code); // const fn = function (a, b) { return a + b; };
```

## 按需加载实现

```js
function importPlugin(opt) {
  const { libraryDir } = opt;
  return {
    visitor: {
      ImportDeclaration(path) {
        const node = path.node;
        // 得到这个节点的详细说明,然后转换成多个 import 声明
        const specifiers = node.specifiers;
        // 要处理这个我们需要做一些判断,首先判断不是默认导出我们才处理,要考虑import vant, { Button, Icon } from 'vant' 写法
        // 还要考虑 specifiers 的长度，如果长度不是 1 并且不是默认导出我们才需要转换
        if (
          !(
            specifiers.length === 1 && t.isImportDefaultSpecifier(specifiers[0])
          )
        ) {
          const result = specifiers.map((specifier) => {
            let local = specifier.local,
              source;
            // 判断是否存在默认导出的情况
            if (t.isImportDefaultSpecifier) {
              source = t.stringLiteral(node.source.value);
            } else {
              source = t.stringliteral(
                `${node.source.value}/${libraryDir}/${specifier.local.name}`
              );
            }
            return t.importDeclaration(
              [t.importDefaultSpecifier(local)],
              source
            );
          });
          // 因为这次要替换的 AST 不是一个，而是多个的，所以需要 `path.replaceWithMultiple(result)` 来替换，但是一执行发现死循环了
          path.replaceWithMultiple(result);
        }
      },
    },
  };
}
const r = babel.transform(code, {
  plugins: [importPlugin({ libraryDir: 'lib' })],
});
console.log(r.code);
```

## env

env 核心目的是通过配置得知目标环境的特点,然后只做必要的转换.如果不写任何配置项,那么 env 等同于 latest,等价于 es2015 + es2016 + es2017

```json
{
  "presets": [
    [
      "env",
      {
        "targets": {
          "browsers": ["last 2 versions", "safari >= 7"]
        }
      }
    ]
  ]
}
```

## babel-polyfill(内部集成了 core-js 和 regenerator-runtime)

babel 默认置转换 js 语法,而不转换新的 API.例如 Iterator、Genterator、Set、Maps、Proxy、Symbol、promise 等全局对象,以及一些定义在全局对象上的方法(Object.assign).这些就需要 polyfill,插入一些帮助函数.
regenerator-runtime 是 generator 和 async/await 的运行时依赖.
单独使用@babel/polyfill会将core-js全量导入,造成项目体积过大,可以通过配合使用**babel/preset-env**解决.
## babel-runtime 和 babel-plugin-transform-runtime

babel-plugin-transform-runtime:

```js
// 从直接定义改为引用，这样就不会重复定义了。
var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');
var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

// 具体使用处是一样的
var _ref = _asyncToGenerator3(function* (arg1, arg2) {
  yield (0, something)(arg1, arg2);
});
```

将定义方法改成了引用,这样就不存在重复定义的问题了,也不存在代码重复
babel-runtime:
babel-plufin-transform-runtime 将 babel-runtime 作为依赖.
内部集成了:
1.core-js:转换一些内置类(symbol、promise 等)和静态方法(Array.from 等).绝大部分转换在这里处理,自动引入.直接使用会污染全局命名空间和对象原型.
2.regenerator: core-js 补漏,主要对 generator/yield 和 async/await 支持,有 generator/async 主动引入
3.helpers,上面的 asyncToGenerator 就是其中之一,还有 jsx、classCallCheck 等.

## babel-loader

webpack 中配置
配置和react中可以编写jsx代码
```js
module: {
  rules: [
    {
      test: /\.jsx?$/,
      exclude: /(node_modules|bower_components)/,
      // loader: 'babel-loader',
      use: {
           loader: 'babel-loader',
           options: {
             // babel 转义配置项
             babelrc: false,
             presets: [
               // 添加preset-react
               require.resolve('@babel/preset-react'),
               [require.resovle('@babel/preset-env'),{modules: false}]
             ],
             cacheDirectory:true
           }
      }
    },
  ];
}
```

# AST

## 什么是 AST

抽象语法树, 是源代码的抽象语法结构的树状表现形式.
`var AST = "is Tree"`

- var 是一个关键字
- AST 是一个定义者
- = 是 Equal 等号的叫法有很多形式
- is tree 是一个字符串
- ;就是 Semicoion

```js
 {
   "type": "Program",
   "body": [{
     "type": "VariableDeclaration",
     "kind": "var",
     "declarations": [{
       "type": "VariableDeclaration",
       "id": {
         "type": "Identifier",
         "name": "AST"
       },
       "init": {
         "type": "Literar",
         "value": "is tree",
         "row": "\"is tree \""
       }
     }]
   }]
 }
```

body 数组中存放的每一项都是一个对象,

```
 type:     描述该语句的类型 ---> 变量声明的语句
 kind:     变量声明的关键字 ---> var
 declaration: 声明内容的数组,里面每一项也是一个对象
           type:   描述该语句的类型
           id:     描述变量名称的对象
                   type: 定义
                   name: 变量的名字
           init:  初始化变量值的对象
                   type: 类型
                   value: 值"is tree"不带引号
                   row:   "\"is tree"\" 带引号
```

## 词法分析和语法分析

词法分析: 也叫*扫描*,将字符流转换为记号流(tokens),他会读取我们的代码然后按照一定的规则合成一个个表示
比如说: var a = 2, 分解成为 var、a、=、2
当词法分析源代码的时候,他会一个一个字符读取代码,称之为扫描 - _scans_.当他遇到空格、操作符、或者特殊符号,他就会认为一个话已经完成了.

```js
[
  { type: 'Keyword', value: 'var' },
  { type: 'Identifier', value: 'a' },
  { type: 'Punctuator', value: '=' },
  { type: 'Numeric', value: '2' },
];
```

---

语法分析: _解析器_,将词法分析出来的数组转换成数的形式,同时验证语法.语法如果有错就抛出错误.
改引擎使用了两个解析器: 预解析器和解析器
## webpack 中转换成 AST
webpack 和 rollup 都是通过 acorn 模块把源代码转换成抽象语法树 AST
 <!-- acorn.parse -->
## AST 解析流程

- esprima: code => ast 代码转 ast
- estraverse: traverse ast 转换树
- escodegen: ast => code

```js
const esprima = require('esprima');
const estraverse = require('estraverse');
const code = 'function getUser(){}';
// 生成 AST
const ast = esprima.parseScript(code);
// 转换 AST,只会遍历 type 属性
// traverse 方法中有进入和离开两个钩子函数
// 转换树
estraverse.traverse(ast, {
  // 在进入离开修改都是可以的
  enter(node) {
    console.log('enter -> node.type', node.type);
    if(node.type === 'Identifier'){
      node.name = 'hell0
    }
  },
  leave(node) {
    console.log('leave -> node.type', node.type);
  },
});
//生成新代码
const result = escodegen.generate(ast)
// function hello(){}
console.log(result)

//输出结果 AST 遍历是深度优先
enter -> node.type Program
enter -> node.type Functiondeclaration
enter -> node.type Identifier
leave -> node.type Identifier
enter -> node.type Blockstatement
leave -> node.type Blockstatement
leave -> node.type Functiondeclaration
leave -> node.type Program
```
