function coSimple(gen, args) {
  gen = gen.apply(this, args)
  return new Promise((resolve, reject) => {
    onFulfilled()
    function onFulfilled(res) {
      const ret = gen.next(res)
      next(ret)
    }
    function next(ret) {
      const promise = ret.value
      promise && promise.then(onFulfilled)
    }
  })
}
function run(generator) {
  return new Promise((resolve, reject) => {
    // 执行gen方法
    const g = generator()
    // 自动执行函数
    const next = (res) => {
      let ret
      try {
        ret = g.next(res)
      } catch (error) {
        reject(error)
      }
      // 一旦遍历完成.立刻终止遍历
      if (ret.done) return resolve(ret.value)
      ret.value.then(next, (err) => reject(gen.throw(err).value))
    }
    next()
  })
}
/**
 * 98. 验证二叉搜索树
 *  二叉搜索树 左子树小于根节点 右子树大于根节点
 * 使用中序遍历处理问题 中序遍历: 先处理左子树,在处理根节点.左右处理又子树
 * @param {*} root
 */
var isValidBST = function (root) {
  const stack = []
  let smallNum = -Infinity
  while (stack.length || root !== null) {
    // 中序遍历,递归处理 直至左子树节点
    while (root !== null) {
      stack.push(root)
      root = root.left
    }
    // 循环结束,此时root为null 让他取出最后一个左子树节点
    root = stack.pop()
    // 二叉搜索树左节点必须小于根节点
    if (root.val <= smallNum) return false
    smallNum = root.val
    root = root.right
  }
  return true
}

// 手写快排
var quickSort = function (arr, l, r) {
  if (l >= r) return
  let i = l,
    j = r
  while (i < j) {
    // 对比arr[l]
    while (i < j && arr[j] >= arr[l]) j--
    while (i < j && arr[i] <= arr[l]) i++
    swap(arr, i, j)
  }
  //  这论交换完,arr[i]左边都是比他小的,右边都是比他大的
  swap(arr, l, i)
  // 二分然后继续排序
  quickSort(arr, l, i - 1)
  quickSort(arr, i + 1, r)
}
var swap = function (arr, i, j) {
  let temp = arr[i]
  arr[i] = arr[j]
  arr[j] = temp
}

