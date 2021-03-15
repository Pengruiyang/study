# 浏览器相关
## 浏览器常见内核
浏览器/Runtime|内核(渲染引擎)|JavaScript 引擎
---|:--:|---:
Chrome|webkit -> blink |V8
FireFox|Gecko|SpiderMonkey
Safari|webkit|JavaScriptCore
Edge|EdgeHTML|Chakra(for JavaScript)
IE|Trident|JScript(IE3.0 ~ IE8.0)
 
## 浏览器的主要组成部分是什么

  1.**『用户界面』** - 包括地址栏、前进/后退按钮、书签菜单等等
  2.**『浏览器引擎』** - 在用户界面与呈现引擎之间的传送指令
  3.**『呈现引擎』** - 负责显示请求内容.例如请求的内容是HTML,就负责解析HTML和CSS并将解析后的内容展示出来
  4. **『网络』**- 网络请求
  5. **『用户界面后端』** - 用于绘制基本的窗口小部件,比如组合框和窗口
  6. **『JavaScript解释器』** - 用于解析和执行JavaScript代码
  7. **『数据存储』** - 持久层,浏览器需要在硬盘上保存各种数据,例如Cookie.x

