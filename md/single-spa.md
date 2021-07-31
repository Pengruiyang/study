# single-spa 到底是干嘛的

single-spa 仅仅是一个子应用生命周期的调度者.为应用定义了 bootstrap、load、mount、unmount 四个生命周期回调.
Register -> Load -> Bootstrap -> Mount -> Unmount -> Unload

- Register 不是生命周期,是指调用 registerApplication 函数这一步.
- load 是加在子应用,具体加在方式由开发者自己实现
- Unload 钩子只能通过调用 unloadApplication 函数才会被调用

single-spa 可以控制的只有上面四个生命周期,当 window.location.href 匹配到 url 时,然后执行对应子 App 生命周期流程.

## 注册子应用

```js
  singleSpa.registerApplication({
    name: 'testApp', // 子应用名
    app: () => System.import('testApp'), // 如何加载你的子应用
    activeWhen: '/appName', // url 匹配规则,表示啥时候开始走这个子应用的生命周期
    customProps: {
      // 自定义 props
      authToken: 'xxxx
    }
  })
  singleSpa.start()
```

## SystemJS

SystemJS 好处仅有一点,在浏览器里使用 Es6 的 import/export.符合 single-spa 所提倡的 in-browser 思路.

## Root Config

资源声明 + 主子应用加载的组件.single-spa 成为 RootConfig.他就两个东西,主应用的 index.html,和执行 registerApplication 函数的 js 文件

## single-spa-layout

用来处理子应用放置的位置.
constructRoutes、constructApplication、constructLayoutEngine 本质就是识别 single-spa-layout 定义的元素标签,获取其中的属性.
```js
  import { registerApplication, start } from 'single-spa';
  import { constructApplications, constructRoutes, constructLayoutEngine} from 'single-spa-layout'
  // 获取 routes
  const routes = constructRoutes(document.querySelector('#single-spa-layout'));
  // 获取所有的子应用
  const applications = constructApplications({
    routes,
    loadApp({name}{
      return System.import(name)
    })
  })
  // 生成 layoutEngine
  const layoutEngine = constructLayoutEngine({routes,applications})
  // 批量注册子应用
  applications.forEach(registerApplication)
  start()
```

## 改造子应用
子应用最关键的异步就是导出 bootstrap、mount、unmount 三个生命周期钩子.
```js
  import SubApp from './index.tsx'
  export const bootstrap = () => {}
  export const mount = () => {
    // 使用 React 渲染子应用的根组件
    ReactDOM.render(<SubApp />,document.getElementById('root'));
}
export const unmount = () => {}
```
## 导入子应用 css

