# babel 到底做了什么?

把 js 中 2015/2016/2017 新语法转换为 es5,让低端环境运行
babel 本身分为三个阶段:
解析 转换 生成
babel 本身不具备任何转换功能,他把转换的功能都分解到一个个插件中,因此,当我们不配置任何插件时,经过 babel 输出输入的代码是一致的.

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

## babel-polyfill(内部集成了 core-js 和 regenerator)

babel 默认置转换 js 语法,而不转换新的 API.例如 Iterator、Genterator、Set、Maps、Proxy、Symbol、promise 等全局对象,以及一些定义在全局对象上的方法(Object.assign)

## babel-runtime 和 babel-plugin-transform-runtime

babel-plufin-transform-runtime:

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
1.core-js:转换一些内置类(symbol、promise 等)和静态方法(Array.from 等).绝大部分转换在这里处理,自动引入
2.regenerator: core-js 补漏,主要对 generator/yield 和 async/await 支持,有 generator/async 主动引入
3.helpers,上面的 asyncToGenerator 就是其中之一,还有 jsx、classCallCheck 等.

## babel-loader

webpack 中配置

```js
module: {
  rules: [
    {
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      loader: 'babel-loader',
    },
  ];
}
```
