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