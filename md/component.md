# 组件设计
站在现有的 UI Design之上开发组件库
## 基于 Lerna 多包管理架构
用于管理多个软件包(package)的 js 项目.由 Lerna 管理的仓库我们一般称之为 monorepo(单体仓库)
* 组件级别解耦,独立版本控制,每个组件都有版本记录可以追溯
* 组件单独发布,支持灰度、版本回滚和平滑升降级
* 按需引入
* 关注点分离,降低大型复杂度、组件之间依赖清晰可控
* 单一职责

## 规范化提交
规范化的 git commit 对于提高 git log 可读性、可控的版本控制和 changelog 生成都有着重要作用.(yorkie)
## 代码规范化
配置 eslint(.eslintrc.js) prettier(.prettierrc.js) 

## 组件开始
1. lerna 创建主包,用来统一导出所有的组件
lerna create vant-react-native -y
2. 创建组件包 
lerna create @vant-react-native/icons -y
3. 安装插件
yarn workspace @vant-react-native/icons add -D react-native-svg react-native-iconfont-cli
4. icon组件生成配置文件(可跳过)
npx iconfont-init
5. 生成 rn 标准组件(可跳过)
6. 配置 react-native-vant,将组件包添加到主包的依赖并导出
lerna add @vant-react-native/icons --scope vant-react-native
7. tsconfig 配置 项目根目录创建 tsconfig.base.json.在子包中 extends 继承就行了
8. 配置发布脚本 添加 build、prepublishOnly脚本

## 按需加载
babel-import-import
```js
"plugin": [
  "import",{libraryName:"antd",style: true}
]
```
### 通过编写插件解决按需加载问题
通过 babel-plugin-import 原理可以转换引用路径.
那么我们通过插件吧 import {Button} from 'vant-react-native' 转换成 import {Button} from 'vant-react-native/button'
## 文档
集成 Dumi
# question
## yarn 安装workspace 包需要添加--ignore-workspace-root-check
## onchange这个库可以基于 glob 模式监听文件改动后执行一个命令
# 缺陷
ignoreChange 不能做到文件的完全忽略,存在优先级问题
