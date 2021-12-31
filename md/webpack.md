# webpack 本质
webpack 是基于事件流的插件集合,他的工作流程就是将各个插件串联起来.核心是 Tapable.Tapable 是一个类似于 EventEmitter 的库.控制钩子函数的发布和订阅.webpack 最核心的 Compiler 和 Compilation 
# Compiler 和 Compilation

Compiler 对象是一个全局单例,负责把控整个 webpack 打包的生命周期.包含了 webpack 环境所有的配置信息,包括 options,loaders,plugins 这些项,这个对象在 webpack 启动被实例化.
Compilation 对象是每一次构建的上下文对象,它包含了当次构件所需要的所有信息,每次热更新和重新构建,compiler 都会重新生成一个新的 compilation 对象,负责此次更新的构建过程.

# webpack 编译机制

 1. 初始化参数: 从配置文件和 shell 语句中合并得到最终参数 
 2. 开始编译:参数初始化 Compiler 对象,加载所有配置的 Plugin,调用对象的 run 方法开始执行编译 
 3. 确认入口: 根据配置中的 entry 找到所有的入口文件 
 4. 编译模块: 从入口文件出发,调用所有配置的 loader 对模块进行编译,再找出该模块依赖的模块,递归直至所有入口依赖文件.得到每个模块被编译后的最终内容以及他们之间的依赖关系.读取入口文件内容,通过@babel/parse 将入口内容(code)转换成 ast.通过@babel/traverse 遍历 ast 得到模块的各个依赖.通过@babel/core(实际工作由@babel/preset-env 完成)将 ast 转换为 es5code.通过循环尾递归的方式拿到所有模块的所有依赖并都转换成 es5. 
 5. 输出资源:根据入口与模块之间的依赖关系,组装成一个个包含多个模块的 chunk,再把每个 chunk 转换成单独的文件加入到输出列表.确定好输出内容后,根据配置的的输入路径与文件名,把文件内容写进文件系统中.

  初始化
  启动构建=>读取配置参数=>加载 Plugin =>实例化 Compiler
  编译
  从 Entry 出发=> 针对每个 Module 串行调用对应的 Loader 编译文件,找到对应依赖的 Module,递归进行编译
  输出
  将编译后的 Module 组合成为 Chunk 再转换成文件,输出

  1. 分析打包速度 
    开启processbar-webpack-plugin,查看构建时长.
    通过 speed-measure-webpack-plugin 测量 webpack 构建期间各个阶段花费时间 .
    配置 BundleAnalyzer 分析打包文件结构.找出导致体积过大的原因.
  2. 分析影响打包速度环节.
    a. 开始打包,需要获取所有的依赖模块 =>优化搜索时间
    b. 解析所有的依赖模块 => 优化 loader 解析时间
    c. 将所有依赖模块打包到一个文件(webpack 对代码进行优化,js 压缩需要先将代码解析成 AST 语法树,根据规则去分析处理 AST 再还原成 js) =>优化压缩时间
    d. 二次打包(改动文件是需要重新打包,而其中大部分文件都没有变更) => 优化二次打包时间 
  3. 优化解析时间 - 开启多进程打包(项目较小时多进程打包反而会使打包速度变慢)
    thread-loader
    把这个 loader 放在其他 loader 之前,就会给其他 loader 在一个单独的 worker 池中运行,就是新开启一个 nodejs 进程 每个单独进程处理时间上限 600ms.为了防止启动高延迟,可以开启预热. 
  4. 合理运用缓存(增加初始构建时间,降低后续构建时间)
    a. cache-loader 对于性能开销较大的 loader 之前添加 cache-loader 将结果缓存到磁盘中提升二次构件时间
    b. HardSourceWebpackPlugin 
    c. 优化压缩时间 webpack4 中使用 terser-webpack-plugin 压缩代码 强烈建议开启

  a.导入语句查找导入文件
  b.根据要导入文件后缀使用对应的 loader 处理文件 

  1. thread-loader 开启多进程打包
  2. 优化 Loader 配置通过 test、include、exclude 三个配置项命中 Loader 文件 
  3. 优化 resolve.modules 配置优先查找当前目录的 node*modules,没有再往上级查找.指明当前路径第三方模块的绝对路径 
  4. 优化 resolve.alias 配置 
  5. 优化 resolve.extensions 配置 后缀查询 
  6. 优化 resolve.mainFields 配置 (mainFields 会根据配置读取 es6/es5 语法代码) 
  7. 优化 module.noParse 配置 忽略部分没有采用模块化的文件递归解析处理(jq.chartJs)
  8. Tree shaking (webpack-Deep-shaking-Plugin)(purgecss-webpack-plugin) webpack 4.0 默认支持 .babelrc 配置 modules:false*
  9. 提取公共资源
  10. Scope hoisting module:production 默认开启 
  11. 动态 polyfill ,只返回用户需要的. 
  12. 配置 externals,webpack 打包时忽略这些库,并自动在全局变量上挂载相应的全局变量.
  13. splitChunks 根据 common vendor 分开处理
  14. source map:开发环境配置 cheap-eval-source-map
  15. mini-css-extract-plugin 抽离 css 文件,tinypng 压缩图片
  16. 按需加载,只加载首屏需要的 js.

常用 loader:
  file-loader
  style-loader
  postcss-loader
  less-loader
  css-loader
  source-map-loader 加载额外的 source Map 文件
  babel-loader
  awesome-typescript-loader

### Loader 原理:
Loader 支持链式调用,所以开发上需要严格遵循"单一职责",每个 loader 只负责自己的事情.

### 常用 plugin

web-webpack-plugin 单页应用输出
mini-css-extract-plugin 分离css 文件
clean-webpack-plugin 目录清理
speed-measure-webpack-plugin loader 和 plugin 执行耗时
webpack-bundle-analyzer 可视化 webpack 输出文件体积
define-plugin 定义环境变量
terser-webpack-plugin 代替 uglifyJs 压缩代码
ModuleConCatenationPlugin: scope hoisting 分析模块依赖关系,打入一个模块.减少创建的作用域.减少代码体积

### plugins 原理:
在 Webpack 运行的生命周期中会广播出许多事件(**run、build-module、program**)，Plugin 可以监听这些事件，在合适的时机通过 Webpack 提供的 API 改变输出结果。
插件必须求是一个函数或者一个包含 apply 方法的对象
apply 方法接收一个 Compiler 对象,包含了这次构建的所有配置信息,通过这个对象注册钩子函数
通过 Compiler.hooks.emit.tap注册钩子函数,钩子函数第一个参数为插件名称.第二个阐述 compilation 为此次打包的上下文
在 plugins 中单独配置，类型为数组，每一项是一个 Plugin 的实例，参数都通过构造函数传入

### plugins 和 loader 的区别

loader:是一个加载器,用来加载和解析转换非 js 文件的能力
plugin: 意思是插件,在 webpack 运行生命周期,会广播很多事件出去,plugin 可以监听这些事件在合适的时间通过 webpack 的 api 输入对应的结果.

### webpack 提效插件

    webpack-dashboard 展示更加友好的打包信息
    webpack-merge 提取公共 webpack 配置 减少重复代码
    speed-measure-webpack-plugin smp
    size-plugin 监控资源体积变化
    HotModuleReplacementPlugin: 热更新

### webpack 模块打包原理
为每个模块创建了一个可以导入导出的环境,不修改代码执行逻辑,代码执行顺序 模块加载顺序也完全一致

### webpack 热更新原理
  1. 启动本地server,让浏览器可以请求本地的静态资源
  2. 页面首次打开后,服务端与客户端通过 websocket 建立通信渠道,把下一次的hash 返回前端.
  3. 客户端获取到 hash,用这个 hash 作为下一次请求服务器 hot-update.js 和 hot-update.json 的 hash
  4. 修改代码后,webpack 监听到文件修改后开始编译,编译完成后,发送 build 信息给客户端
  5. 客户端获取到 hash,对比后构造 hot-update.js json 链接,插入主文档
  6. 插入成功后,执行 hotAPI createRecord 和 reload 方法,重新 render 组件.(如果不能更新则直接刷新页面)


### Babel 原理

1.解析:将代码转换为 AST
a.词法分析 将代码分割为 token 流.(语法单元的数组)
b.语法分析 分析 token 流 并生成 AST 2.转换: 访问 AST 的节点进行转换操作生成新的 AST 3.生成: 以新的 AST 为基础生成代码

### 手写 Loader

Loader 支持链式调用，所以开发上需要严格遵循“单一职责”，每个 Loader 只负责自己需要负责的事情。
Loader 运行在 Node.js 中，我们可以调用任意 Node.js 自带的 API 或者安装第三方模块进行调用
Webpack 传给 Loader 的原内容都是 UTF-8 格式编码的字符串，当某些场景下 Loader 处理二进制文件时，需要通过 exports.raw = true 告诉 Webpack 该 Loader 是否需要二进制数据
尽可能的异步化 Loader，如果计算量很小，同步也可以
Loader 是无状态的，我们不应该在 Loader 中保留状态
使用 loader-utils 和 schema-utils 为我们提供的实用工具加载本地 Loader 方法

### 手写 Plugin

webpack 在运行的生命周期中会广播出许多事件，Plugin 可以监听这些事件，在特定的阶段钩入想要添加的自定义功能。Webpack 的 Tapable 事件流机制保证了插件的有序性，使得整个系统扩展性良好。
compiler 暴露了和 Webpack 整个生命周期相关的钩子
compilation 暴露了与模块和依赖有关的粒度更小的事件钩子
* 通过 apply 函数中传入 compiler 对象并插入指定的事件钩子,在钩子回调中取到 compilation 对象. 在compilation 对象中处理 webpack 内部特定实例数据.
* 异步插件需要插件逻辑编写完后调用 webpack 提供的 callback通知 webpack 进入下一个流程,不然会卡主.
* 传给每个插件的 compiler 和 compilation 对象都是同一个引用，若在一个插件中修改了它们身上的属性，会影响后面的插件
* emit 事件发生时，可以读取到最终输出的资源、代码块、模块及其依赖，并进行修改(emit 事件是修改 Webpack 输出资源的最后时机).
  watch-run 当依赖的文件发生变化时会触发

### 动态导入/按需加载
将路由页面/触发性功能单独打包为一个文件，使用时才加载，好处是减轻首屏渲染的负担。因为项目功能越多其打包体积越大，导致首屏渲染速度越慢。
如果运营报错,babel 相关配置加入
```js
{
  'babel': {
    'plugins': [
      '@babel/plugin-syntax-dynamic-import'
    ]
  }
}
```
### splitChunks 选项.

在 CacheGroups,配置对应的 vendors 和 common,
```js
  {
    optimization: {
      splitChunks: {
        cacheGroups: {
          common: {
            reuseExistingChunk: true // 重用已存在代码块
          },
          vendor: {
            chunks: 'initial', // 代码分割类型
            name: 'vendor', // 代码块名称
            priority: 10, // 优先级
            test: /node_modules/ // 校验文件正则表达式 
          }
        }
        chunks: 'all' // 代码分割类型 all 全部模块 async 异步模块 initial 入口模块
      }
    }
  }
```

### css px 转换 rem

px2rem-loader,配合淘宝 lib-flexible 使用, 设置 option

### 动态 polyfill
  通过请求 UA 的不同返回不同polyfill js 文件.
 @babel/preset-env 提供的 useBuiltIns 按需导入 Polyfill.

 使用html-webpack-tags-plugin在打包时自动插入动态垫片。
 ```js
  export default {
    plugins: [
      new HtmlTagsPlugin({
        append: false, // 在生成资源后插入
        publicPath: false, // 使用公共路径
        tags: ['https://polyfill.alicdn.com/polyfill.min.js']
      })
    ]
  }
 ```

### 作用提升
分析模块之间依赖关系,把打包好的模块合并到一个函数中.减少函数声明和内存的开销.
未开启时,构建后的代码存在大量函数闭包.由于模块依赖.webpack 打包后转换为 IIFE,大量闭包函数导致体积增大.在运行代码时创建函数作用域变多,内存开销也会增大.
开启后,构建后的代码会按照引入顺序放入一个函数作用域中,适当重命名某些变量防止命名冲突,减少函数声明和内存开销.
```js
  export default {
    // 默认开启
    mode: 'production'
    // 显式设置
    optimization: {
      concatenateModules: true
    }
  }

  
```
# webpack5 打包后代码

1. \_\_webpack_modules\_\_ 存放了编译后的各个文件模块的 js 内容
2. \_\_webpack_module_cache\_\_ 用来做模块缓存
3. \_\_webpack_require\_\_ 则是 webpack 内部实现依赖的引入函数

# sourceMap

sourceMap 是将编译、打包、压缩后代码映射回源的奇数.

# webpack5 新特新

## 1. 编译缓存

4 及之前本身没有持久化缓存能力,只能借助 loader 实现.cache-loader 缓存编译结果到硬盘,或者插入为模块提供中间缓存.
而 5 可以通过配置 cache

```js
module.exports = {
  cache: {
    // 将缓存类型设置为文件系统
    type: 'filesystem',
    buildDependencies: {
      /* 将你的 config 添加为 buildDependency，
        以便在改变 config 时获得缓存无效*/
      config: [__filename],
      /* 如果有其他的东西被构建依赖，
        你可以在这里添加它们*/
      /* 注意，webpack.config，
        加载器和所有从你的配置中引用的模块都会被自动添加*/
    },
    // 指定缓存的版本
    version: '1.0',
  },
}
```

注意事项:

1. cache 属性 type 会在开发模式下默认设置为 memory,且在生产模式中被禁用,如果想在生产打包时使用缓存需要显性设置
2. 每次修改构建配置文件都会导致重新开始缓存

## 2. 长效缓存

5 之前改变其中一个文件,结果构建出来所有的 js 文件 hash 都变了.解决方案是通过 hashedModulesPlugin 固定 moduleId,他会使用模块路径生成 hash 作为 moduled;使用 NamedChunksPlugin 固定 chunkId.

```js
optimization.moduleIds = 'hashed'
optimization.chunkIds = 'named'
```

webpack5 增加了确定的 moudleId,chunkId 的支持

```js
optimization.moduleIds = 'deterministic'
optimization.chunkIds = 'deterministic'
```

这个配置生产模式默认开启 ,作用是确定 module 和 chunk 分配 3-5 位数字 id,相比之前 hashed,导致更小的文件 bundles.由于 module 和 chunk 能确定,构建文件的 hash 也能确定.开发模式下,可以最直接使用 named

```js
optimization.moduleIds = 'named'
optimization.chunkIds = 'named'
```

## 3. Node Polyfill 脚本被移除

webpack4 版本中附带了大多数 Node.js 核心模块的 polyfill，一旦前端使用了任何核心模块，这些模块就会自动应用，但是其实有些是不必要的。

webpack5 将不会自动为 Node.js 模块添加 polyfill，而是更专注的投入到前端模块的兼容中。因此需要开发者手动添加合适的 polyfill。
如果确认不需要 polyfill，可根据提示设置 fallback，如下：

```js
resolve: {
  fallback: { "crypto": false }
}
```

## 4. 更优的 tree-shaking
tree-shaking 只针对 ESM 模范生效,对其他模块规范失效.
5 会分析模块 export 和 import 依赖关系,去除未被使用模块.

## 5. Module Federation 模块联邦

可以是 js 应用从另一个 js 应用中动态的加载代码,同时共享依赖.相当于 webpack 提供线上 runtime 环境,多个应用利用 cdn 共享组件,不需要本地 npm 包再构建了.
const { ModuleFederationPlugin } = require("webpack").container;

## 6、其他新特性

1、在 webpack4 中标记过期的功能都已经在 webpack5 移除了。
2、开发环境下默认使用可读的名称为 module 命名，不需要使用如下语法：
import(/_ webpackChunkName: "name" _/ "module")
3、原生 worker 支持

## 升级采坑

1. 升级 webpack 及相关包的版本
2. 配置 webpack5 编译缓存不生效
   webpack-dist.config.js 文件需要在 webpack-cli 写入,配置持久化缓存时,使用命令行自动给 cache 加上 config 后面参数,但是由于找不到这个相对路径,从而执行缓存逻辑报错,缓存失败.
   解决方法:

```js
const path = require('path')
const exec = require('child_process').exec

const config = path.resolve(__dirname, 'webpack-dist.config.js')
// 获取webpack-dist.config.js的绝对路径 传给命令行
const cmdStr = `webpack --config ${config}`

exec(cmdStr, function (err, stdout, stderr) {
  if (err) {
    console.log('get weather api error:' + stderr)
  } else {
    console.log(stdout)
  }
})
```

3. loader 书写规则

```js
  {
    test: /\.css$/,
    loaders: ['css-loader'],
  }
  <!-- loaders改为use  -->
  {
    test: /\.css$/,
    use: ['css-loader'],
  }
```

# chunkhash 和 contenthash 区别

chunkhash: 根据不同的入口文件进行依赖文件解析、构建对应的 chunk、生成对应的 hash 值.
但是这样又有一个问题，因为我们是将样式作为模块import到JavaScript文件中的，所以它们的chunkhash是一致的，如index.js和index.css.只要对应css或则js改变，与其关联的文件hash值也会改变，但其内容并没有改变呢，所以没有达到缓存意义。固contenthash的用途随之而来。

contenthash: 文件内容.在项目中，通常做法是把项目中css都抽离出对应的css文件来加以引用。

## hash 缓存的问题
1. hash 计算方式位每次compilation编译的内容计算得到,没有改变的文件也会随着其他文件改变二改变
2. chunkhash js中引入css,只要修改了css,js也会更着发生改变
3. contenthash 发生a.css发生改变的时候,以来他的其他文件并没有重新生成新的hash之.需要使用webpackMd5Hash通过模块路径排序chunk的所有以来模块,将排序后的模块源代码拼接chunkhash/