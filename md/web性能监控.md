# 监控什么
  *RAIL 模型衡量性能*
  1.Response
  2.Animation
  3.Idle
  4.Load
  最好的性能指标: 100ms 内响应用户的输入、动画或者滚动需要在 10ms 内产生下一帧、最大化空闲时间、页面加载时长不超过 5 秒
## 页面访问速度: 白屏、首屏时间、可交互时间
  ### 1.first paint(FP) and first contentful paint(FCP) 首次渲染、首次有内容渲染
  这两个指标浏览器标准化 从 performance 的 The Paint Timing API 可以获取到
  ```js
    window.performance.getEntriesByType("paint")
  ```
  ### 2.First meaningfulpaint and hero element timing 首次有意义渲染、页面关键元素
  假设当一个网页的 dom 结构发生剧烈变化的时候,就是这个网页主要内容出现的时候,那么在这样一个时间点上,就是首次有意义的渲染.
  ### 3.Time to interactive 可交互时间
  ### 4.长任务
  浏览器 渲染进程使单线程的,如果长任务过多,那必然会影响用户的响应时长.好的应用需要最大化空闲时间,以保证能最快响应用户的输入.
## 页面稳定性: 页面出错情况
  ### 1.资源加载错误
  ### 2.JS 执行报错
## 外部服务调用
  1.CGI 耗时
  2.CGI 成功率
  3.CDN资源耗时
# 监控的分类
  web性能监控可以分为两类: 一类是合成监控,另一类是真实的用户监控
  ## 合成监控
  合成监控是采用 web 浏览器模拟器来加载网页,通过模拟终端用户可能的操作来采集对应的性能指标,最后输出一个网站性能报告.
  例如：Lighthouse、PageSpeed、WebPageTest、Pingdom、PhantomJS 等。
  优点:
  无侵入式、简单快捷
  缺点: 不是真实的用户访问情况,只是模拟的.没法考虑到登录的情况,对于需要登录的页面就无法监控到.
  ## 真实用户监控
  真实用户监控是一种被动监控技术,一种应用服务,被监控的 web 应用通过 sdk 等方式接入该服务,将真实的用户访问、交互等性能指标数据上报、通过清洗加工后形成性能分析报表.如 FrontJS、oneapm、Datadog 等.

# performance 分析
 基本属性
 navigation: 页面是加载还是刷新、发生了多少次重定向
 ```js
  PerformanceNavigation {type: 0, redirectCount: 0}
 ```
 timing: 页面加载各阶段时长
 memory: 基本内存使用情况,Chrome 添加的非标准扩展
 timeorigin: 性能测量开始时的时间的高精度时间戳

 提供 API
1. PerformanceObserver API
2. Navigation Timing API
  performance.getEntriesByType("navigation");
    * 重定向次数：performance.navigation.redirectCount
    * 重定向耗时: redirectEnd - redirectStart
    * DNS 解析耗时: domainLookupEnd - domainLookupStart
    * TCP 连接耗时: connectEnd - connectStart
    * SSL 安全连接耗时: connectEnd - secureConnectionStart
    * 网络请求耗时 (TTFB): responseStart - requestStart
    * 数据传输耗时: responseEnd - responseStart
    * DOM 解析耗时: domInteractive - responseEnd
    * 资源加载耗时: loadEventStart - domContentLoadedEventEnd
    * 首包时间: responseStart - domainLookupStart
    * 白屏时间: responseEnd - fetchStart
    * 首次可交互时间: domInteractive - fetchStart
    * DOM Ready 时间: domContentLoadEventEnd - fetchStart
    * 页面完全加载时间: loadEventStart - fetchStart
    * http 头部大小：transferSize - encodedBodySize