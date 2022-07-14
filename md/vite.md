# 和webpack的区别
webpack启动会经历一条很长的编译打包链条,从入口开始需要足部经历语法解析、依赖收集、代码转译、打包合并、代码优化、最终将高版本离散的源码编译打包成低版本高兼容性产物代码.
vite只需要启动用于承载资源服务的service,使用esbuild预构建npm依赖包,等待浏览器以http的形式发来ESM规范的模块请求.Vite才开始按需编译被请求模块.
# 解决vite打包后浏览器兼容问题
1. vite.config.js中配置 vite自带的api去解决兼容性.配置build.target和build.cssTarget
2. 先配置tsconfig转换语法,再让vite兼容
3. 引入babel-polyfill环境垫片
4. 在build.polyfillDynamicImport配置项中使用@vitejs/plugin-legacy插件,vite官方文档中vite的自带插件.(版本较低的浏览器插件添加的脚本会自动加载legacy版本的文件)

# 优点
1. 预编译: npm包模块,使用Esbuild在预构建阶段先打包整理好,减少http请求数
2. 按需编译: 用户代码这类频繁变更的模块,直到使用才会执行编译操作
3. 客户端强缓存:被请求过得模块设置http头强缓存
4. 产物优化: 针对高版本浏览器
5. 内置分包
6. 静态资源处理