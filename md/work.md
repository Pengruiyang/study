## message 组件 和 form 表单中校验 rules 中的validator 函数 中参数有message 会导致最后表单校验失败问题

## 通过MutationObserver监听dom高度变化
```js
 const MutationObserver = window.MutationObserver
    const observer = new MutationObserver(function (e) {
    })
    const options = {
      childList: true,
      attributes: true,
      subtree: true
    }
    if (dom) observer.observe(dom, options)
```


## 脚手架搭建
1. commander: node.js 解决方案
2. 声明 program
3. 使用.option()方法定义选项
4. Inquirer.js 命令行用户界面的集合

# 在微服务项目中使用 style-components 
当 style-components插入动态样式时,dynamicHeadAppend拦截不到,导致当前页面样式无法插入进 style-components样式中,导致页面样式失效
在 style-components 生成的 styleSheets里面引用对象还是老的引用,新的样式无法插入.style-components 使用"Speedy mode"往生产模式注入样式.让样式绕过了 DOM 直接注入到styleSheets内部.所以出现在了它的检查器中但是样式完全没有生效.
我们可以设置一个SC_DISABLE_SPEEDY为 true 去禁用"Speedy mode".