/**
 * 剑指 Offer II 001. 整数除法
 * https://leetcode.cn/problems/xoh6Oh/
 */
var divide = function (a, b) {
  const INT_MIN = -Math.pow(2, 31)
  const INT_MAX = Math.pow(2, 31) - 1

  if (a === INT_MIN && b === -1) return INT_MAX
  let res = 0
  // 处理边界情况
  // 除数绝对值最大时的情况
  if (b === INT_MIN) {
    return a === b ? 1 : 0
  }
  // 被除数先减去一个除数
  if (a === INT_MIN) {
    a -= -Math.abs(b)
    res += 1
  }
  // true ^ true = false;false ^ false = false; false ^ true = true
  // 使用亦或 代码更加精简
  // 等价于(a > 0 && b < 0) || (a<0 && b >0)
  const sign = (a > 0) ^ (b > 0) ? -1 : 1
  a = Math.abs(a)
  b = Math.abs(b)

  for (let i = 31; i >= 0; i--) {
    //
    // 为什么不 b <<< x，可能会超过最大值。除法必定在区间之内
    if ((a >>> i) - b >= 0) {
      // 被除数 - 除数的 b * 2^x
      a = a - (b << i)
      if (res > INT_MAX - (1 << i)) {
        return INT_MIN
      }
      res = res + (1 << i)
    }
  }
  if (res == -2147483648) return -2147483648
  return sign === 1 ? res : -res
}
/**
 * 剑指 Offer II 002. 二进制加法
 * https://leetcode.cn/problems/JFETK5/
 */
var addBinary = function (a, b) {
  let res = ''
  let lenA = a.length - 1
  let lenB = b.length - 1
  let carry = 0
  while (lenA >= 0 || lenB >= 0) {
    let x = lenA >= 0 ? a[lenA] / 1 : 0
    let y = lenB >= 0 ? b[lenB] / 1 : 0
    const sum = x + y + carry
    res += sum % 2
    carry = Math.floor(sum / 2)
    lenA--
    lenB--
  }
  if (carry) res += carry
  return res.split('').reverse().join('')
}

/**
 * 剑指 Offer II 003. 前 n 个数字二进制中 1 的个数
 * https://leetcode.cn/problems/w3tCBm/
 */
var countBits = function (n) {
  const bits = Array(n + 1).fill(0)
  let highBits = 0
  for (let i = 1; i <= n; i++) {
    if ((i & (i - 1)) === 0) {
      // 1 & 0 、2 & 1、4 & 3、8&7
      // 10 100 1000 时触发
      highBits = i
    }
    bits[i] = bits[i - highBits] + 1
  }
  return bits
}
/**
 * 剑指 Offer II 004. 只出现一次的数字
 * https://leetcode.cn/problems/WGki4K/
 */
var singleNumber = function (nums) {
  for (let i of nums) {
    if (nums.indexOf(i) === nums.lastIndexOf(i)) {
      return i
    }
  }
}

/**
 * 剑指 Offer II 005. 单词长度的最大乘积
 * https://leetcode.cn/problems/aseY1I/
 */
var maxProduct = function (words) {
  const bitMaskMap = new Map()
  for (let i = 0; i < words.length; i++) {
    let bitMask = 0
    for (const c of words[i]) {
      // bitMask = bitMask | (1 << (c.charCodeAt() - 'a'.charCodeAt()))
      bitMask |= 1 << (c.charCodeAt() - 'a'.charCodeAt())
    }
    if (bitMaskMap.has(bitMask)) {
      bitMaskMap.set(
        bitMask,
        Math.max(words[i].length, bitMaskMap.get(bitMask))
      )
    } else {
      bitMaskMap.set(bitMask, words[i].length)
    }
  }

  let ans = 0
  for (let x of bitMaskMap.keys()) {
    for (let y of bitMaskMap.keys()) {
      if ((x & y) === 0) {
        ans = Math.max(ans, bitMaskMap.get(x) * bitMaskMap.get(y))
      }
    }
  }
  return ans
}

/**
 * 剑指 Offer II 006. 排序数组中两个数字之和
 * https://leetcode.cn/problems/kLl5u1/solution/
 */
var twoSum = function (numbers, target) {
  let left = 0,
    right = numbers.length - 1
  while (left < right) {
    const sum = numbers[left] + numbers[right]
    if (sum === target) {
      return [left, right]
    } else if (sum < target) {
      left++
    } else {
      right--
    }
  }
  return []
}

/**
 * 剑指 Offer II 007. 数组中和为 0 的三个数
 * https://leetcode.cn/problems/1fGaJU/
 */
var threeSum = function (nums) {
  if (!nums || nums.length < 3) return []
  nums.sort((a, b) => a - b)
  res = []
  for (let i = 0; i < nums.length - 2; i++) {
    // 去重
    if (i > 0 && nums[i] === nums[i - 1]) continue
    const target = -nums[i]
    let left = i + 1,
      right = nums.length - 1
    while (left < right) {
      const sum = nums[left] + nums[right]
      if (sum == target) {
        res.push([nums[i], nums[left], nums[right]])
        while (left < right) {
          left++
          if (nums[left] !== nums[left - 1]) break
        }
        while (left < right) {
          right--
          if (nums[right] !== nums[right + 1]) break
        }
      } else if (sum > target) {
        right--
      } else {
        left++
      }
    }
  }
  return res
}

/**
 *
 * 剑指 Offer II 008. 和大于等于 target 的最短子数组
 * https://leetcode.cn/problems/2VG8Kg/
 */
var minSubArrayLen = function (target, nums) {
  let left = 0,
    sum = 0
  let minLength = Number.MAX_VALUE
  for (let right = 0; right < nums.length; right++) {
    // 数组中都是正数
    sum += nums[right]
    while (sum >= target && left <= right) {
      // 窗口长度
      minLength = Math.min(minLength, right - left + 1)
      // 向左滑动窗口
      sum -= nums[left++]
    }
  }
  return minLength == Number.MAX_VALUE ? 0 : minLength
}
/**
 *
 * 剑指 Offer II 009. 乘积小于 K 的子数组
 * https://leetcode.cn/problems/ZVAVXX/
 */
var numSubarrayProductLessThanK = function (nums, k) {
  let left = 0,
    product = 1
  let minLength = 0
  for (let right = 0; right < nums.length; right++) {
    product *= nums[right]
    // 乘积大于product滑动窗口
    while (left <= right && product >= k) {
      product /= nums[left++]
    }
    if (left <= right) {
      minLength += right - left + 1
    }
  }
  return minLength
}
/**
 * 剑指 Offer II 010. 和为 k 的子数组
 * https://leetcode.cn/problems/QTMn0o/
 */
var subarraySum = function (nums, k) {
  const mp = new Map()
  // key： 当前 sum value：出现次数 所以默认为为 0：1
  mp.set(0, 1)
  let count = 0,
    pre = 0
  for (let x of nums) {
    pre += x
    if (mp.has(pre - k)) {
      count += mp.get(pre - k)
    }
    if (mp.has(pre)) {
      mp.set(pre, mp.get(pre) + 1)
    } else {
      mp.set(pre, 1)
    }
  }
  return count
}

/**
 * 剑指 Offer II 011. 0 和 1 个数相同的子数组
 * https://leetcode.cn/problems/A1NYOS/
 */

var findMaxLength = function (nums) {
  //0 1 个数相同，如果把 0 看做 -1 ，就是求最长为 0 的子数组
  const mp = new Map()
  // 初始化 需要记录索引。 0 - （-1） = 1 所以为 0：1
  mp.set(0, -1)
  let res = 0,
    pre = 0
  for (let i = 0; i < nums.length; i++) {
    pre += nums[i] === 0 ? -1 : nums[i]
    if (mp.has(pre)) {
      res = Math.max(res, i - mp.get(pre))
    } else {
      mp.set(pre, i)
    }
  }
  return res
}

/**
 * 剑指 Offer II 012. 左右两边子数组的和相等
 * https://leetcode.cn/problems/tvdfij/
 */
var pivotIndex = function (nums) {
  const total = nums.reduce((pre, cur) => pre + cur)
  let sum = 0
  for (let i = 0; i < nums.length; i++) {
    if (2 * sum + nums[i] === total) {
      return i
    }
    sum += nums[i]
  }
  return -1
}
/**
 * 剑指 Offer II 013. 二维子矩阵的和
 * https://leetcode.cn/problems/O4NDxx/
 */
var NumMatrix = function (matrix) {
  // 非空处理
  if (!matrix || !matrix.length || !matrix[0]?.length) return
  // 初始化前缀和计算
  this.sumArr = new Array(matrix.length + 1)
    .fill(0)
    .map(() => new Array(matrix[0].length + 1).fill(0))
  for (let i = 0; i < matrix.length; i++) {
    let rowSum = 0
    for (let j = 0; j < matrix[0].length; j++) {
      rowSum += matrix[i][j]
      this.sumArr[i + 1][j + 1] = this.sumArr[i][j + 1] + rowSum
    }
  }
}
NumMatrix.prototype.sumRegion = function (row1, col1, row2, col2) {
  // for(let i = row1; i<= row2;i++){
  //   sum += this.sumArr[i][col2 + 1] -  this.sumArr[i][col1]
  // }
  // 矩阵公式
  // 公式sum[r2][c2] + sum[r1 - 1][c2] - sum[r2][c1 - 1] + sum[r1 - 1][c1 - 1];
  return (
    this.sumArr[row2 + 1][col2 + 1] -
    this.sumArr[row2 + 1][col1] -
    this.sumArr[row1][col2 + 1] +
    this.sumArr[row1][col1]
  )
}
/**
 * 剑指 Offer II 014. 字符串中的变位词
 * https://leetcode.cn/problems/MPnaiL/
 */
var checkInclusion = function (s1, s2) {
  // 需要的
  let need = {}
  // 窗口总共的
  let windowObj = {}
  for (let key of s1) {
    // 遍历统计的字符
    need[key] = (need[key] || 0) + 1
  }
  let left = 0,
    right = 0,
    valid = 0
  while (right < s2.length) {
    // 即将移入窗口的字符
    let c = s2[right]
    // 右移窗口
    right++
    if (need[c]) {
      // 如果当前字符存在需要的中
      windowObj[c] = (windowObj[c] || 0) + 1
      if (windowObj[c] === need[c]) {
        // 当前窗口和需要的字符匹配时，验证数量增加1
        valid++
      }
    }
    while (right - left >= s1.length) {
      if (valid === Object.keys(need).length) {
        return true
      }
      let d = s2[left]
      left++
      if (need[d]) {
        // 说明中间夹杂了其他字符，不连续
        if (windowObj[d] === need[d]) {
          valid--
        }
        windowObj[d]--
      }
    }
  }
  // 未找到符合条件的子串
  return false
}
/**
 * 剑指 Offer II 015. 字符串中的所有变位词
 * https://leetcode.cn/problems/VabMRr/
 */
var findAnagrams = function (s, p) {
  let need = {}
  let windowObj = {}
  for (let key of p) {
    need[key] = (need[key] || 0) + 1
  }
  let left = 0,
    right = 0,
    valid = 0,
    result = []
  while (right < s.length) {
    let c = s[right]
    right++
    windowObj[c] = (windowObj[c] || 0) + 1
    if (windowObj[c] === need[c]) {
      valid++
    }
    while (right - left >= p.length) {
      if (valid === Object.keys(need).length) {
        result.push(left)
      }
      let d = s[left]
      left++
      if (need[d]) {
        if (windowObj[d] === need[d]) {
          valid--
        }
        windowObj[d]--
      }
    }
  }
  return result
}

/**
 * 剑指 Offer II 016. 不含重复字符的最长子字符串
 * https://leetcode.cn/problems/wtcaE1/
 */
var lengthOfLongestSubstring = function (s) {
  const len = s.length
  if (len <= 1) return len
  let left = 0,
    right = 0
  // 题目要求：s 由英文字母、数字、符号和空格组成。所以共 128 的字符
  const allObj = new Array(128).fill(0)
  let maxLength = 0
  while (right < len) {
    // 去获取当前字母上次出现的位置
    const rightCharIndex = allObj[s[right].charCodeAt()]
    // 如果当前 rightCharIndex 有值，说明出现过，更新 left 位置到上次重复数字后面开始计算
    left = Math.max(left, rightCharIndex)
    maxLength = Math.max(maxLength, right - left + 1)
    // 记录的是当前出现的index
    allObj[s[right].charCodeAt()] = right + 1
    right++
  }
  return maxLength
}

/**
 * 剑指 Offer II 017. 含有所有字符的最短字符串
 * https://leetcode.cn/problems/M1oyTv/
 */

var minWindow = function (s, t) {
  let need = {}
  let windowObj = {}
  for (let key of t) {
    need[key] = (need[key] || 0) + 1
  }
  let left = 0,
    right = 0,
    valid = 0
  let start = 0,
    MAX_LEN = Number.MAX_VALUE
  while (right < s.length) {
    let c = s[right]
    right++
    if (need[c]) {
      windowObj[c] = (windowObj[c] || 0) + 1
      if (windowObj[c] === need[c]) {
        valid++
      }
    }
    // 当验证通过数量和需要的字符一样时，尝试缩小窗口区间
    while (valid === Object.keys(need).length) {
      // 更新最小覆盖的子串
      if (right - left < MAX_LEN) {
        start = left
        MAX_LEN = right - left
      }
      let d = s[left]
      left++
      if (need[d]) {
        if (windowObj[d] === need[d]) {
          valid--
        }
        windowObj[d]--
      }
    }
  }
  return MAX_LEN === Number.MAX_VALUE ? '' : s.substr(start, MAX_LEN)
}

/**
 * 剑指 Offer II 018. 有效的回文
 * https://leetcode.cn/problems/XltzEq/
 */
var isPalindrome = function (s) {
  const str = s.replace(/[^A-Za-z0-9]/g, '').toLowerCase()
  let _str = str.split('').reverse().join('')
  return _str === str
}

/**
 * 剑指 Offer II 019. 最多删除一个字符得到回文
 * https://leetcode.cn/problems/RQku0D/
 */
var validPalindrome = function (s) {
  let len = s.length,
    left = 0,
    right = len - 1
  const isPalindrome = (s, start, end) => {
    while (start < end) {
      if (s[start] != s[end]) {
        return false
      }
      start++
      end--
    }
  }
  while (left < right) {
    if (s[left] != s[right]) {
      return isPalindrome(s, left + 1, right) | isPalindrome(s, left, right - 1)
    }
    left++
    right--
  }
  return true
}

/**
 * 剑指 Offer II 020. 回文子字符串的个数
 * https://leetcode.cn/problems/a7VOhD/
 */
var countSubstrings = function (s) {
  // 中心扩展
  let count = 0
  for (let i = 0; i < s.length; i++) {
    for (let l = i, r = i; l >= 0 && s[l] === s[r]; l--, r++) count++
    // 奇数情况 需要跳过一个数
    for (let l = i, r = i + 1; l >= 0 && s[l] === s[r]; l--, r++) count++
  }
  return count
}

/**
 * 剑指 Offer II 021. 删除链表的倒数第 n 个结点
 * https://leetcode.cn/problems/SLwz0R/
 */

var removeNthFromEnd = function (head, n) {
  // 链表创造一个虚拟节点，指向 head（简化代码中的非空判断）
  let dummyNode = new ListNode(-1)
  dummyNode.next = head
  // let slow = dummyNode,fast = dummyNode
  let fast = dummyNode,
    slow = dummyNode
  // 想让快指针多走 n 步
  while (n > 0 && fast && fast.next) {
    fast = fast.next
    n--
  }
  // 快慢指针同步走，这样 slow 就是倒数的第 n 个节点
  while (fast && fast.next) {
    fast = fast.next
    slow = slow.next
  }
  // 直接跳过需要删除的节点 = 链表删除节点
  slow.next = slow.next.next
  return dummyNode.next
}
/**
 * 剑指 Offer II 022. 链表中环的入口节点
 * https://leetcode.cn/problems/c32eOV/
 * 外圈距离 a、b 为 slow 走过的距离、c 为环剩下的距离
 *  fast走过的距离为 a + n(b+c) + b
 * slow 走过的距离 a+b ,fast 速度为 slow 2 倍
 * 2(a+b) = a+(n+1)b + nc
 * a = c + (n - 1)(b+c)
 * 相遇点 + (n - 1)环的长度 刚好等于链表到入环点的距离
 * 因此 a =n(b+c) - b, 此时慢指针走过了距离 b，这时一个指针从头开始走向环入口
 * 慢指针刚好继续走了一个 y 距离所以 n(b+c) - b+b = n(b+c)
 * 即新的指针走到换入口时，慢指针刚好也在环入口
 */
var detectCycle = function (head) {
  if (!head) return null
  let fast = head,
    slow = head
  while (fast != null) {
    slow = slow.next
    if (fast.next != null) {
      fast = fast.next.next
    } else {
      return null
    }
    // 说明有环
    if (fast === slow) {
      let ptr = head
      while (ptr !== slow) {
        ptr = ptr.next
        slow = slow.next
      }
      return ptr
    }
  }
  return null
}

/**
 * 剑指 Offer II 023. 两个链表的第一个重合节点
 * https://leetcode.cn/problems/3u1WK4/
 * a+b 和 b+a 链接进行比较，看是否存在重合节点
 */
var getIntersectionNode = function (headA, headB) {
  let a = headA,
    b = headB
  while (a != b) {
    a = a !== null ? a.next : headB
    b = b !== null ? b.next : headA
  }
  return a
}
/**
 * 剑指 Offer II 024. 反转链表
 * https://leetcode.cn/problems/UHnkqh/
 */
var reverseList = function (head) {
  let prev = null,
    curr = head
  while (curr) {
    const next = curr.next
    curr.next = prev
    prev = curr
    curr = next
  }
  return prev
}
/**
 * 递归反转链表
 */
var reverseList = function (head) {
  while (head == null || head.next == null) return head
  const p = reverseList(head.next)
  head.next.next = head
  head.next = null
  return p
}
/**
 * 剑指 Offer II 025. 链表中的两数相加
 * https://leetcode.cn/problems/lMSNwu/
 */
var addTwoNumbers = function (l1, l2) {
  let stack1 = [],
    stack2 = []
  // 分别把两个链表执行入栈操作
  while (l1) {
    stack1.push(l1.val)
    l1 = l1.next
  }
  while (l2) {
    stack2.push(l2.val)
    l2 = l2.next
  }
  let carry = 0,
    p = null
  while (stack1.length || stack2.length || carry) {
    let sum = (stack1.pop() || 0) + (stack2.pop() || 0) + carry
    let newNode = new ListNode(sum % 10)
    // 新节点的 next指向前一个节点
    newNode.next = p
    // 往后走一步
    p = newNode
    carry = sum >= 10 ? 1 : 0
  }
  return p
}

/**
 * 剑指 Offer II 026. 重排链表
 * https://leetcode.cn/problems/LGjMqU/
 * 把链接分成两半：寻找中间节点
 */
var reverseList = function (head) {
  let prev = null,
    curr = head
  while (curr) {
    let next = curr.next
    curr.next = prev
    prev = curr
    curr = next
  }
  return prev
}
var reorderList = function (head) {
  let dummy = new ListNode(0)
  dummy.next = head
  let fast = dummy,
    slow = dummy
  while (fast && fast.next) {
    fast = fast.next
    slow = slow.next
    if (fast.next) {
      fast = fast.next
    }
  }
  // slow指向的节点就是后半段的头节点
  let temp = slow.next
  //将最后一个指针置空，否则会出现环
  slow.next = null
  // const link = (node1,node2,head) => {
  //   let prev = head
  //   while(node1 && node2){
  //     let temp = node1.next
  //     prev.next = node1
  //     node1.next = node2
  //     prev = node2
  //     // node1 和 node2 往下走
  //     node1 = temp
  //     node2 = node2.next
  //   }
  //   if(node1){
  //     prev.next = node1
  //   }
  // }
  const link = (node1, node2, head) => {
    let node1Temp, node2Temp
    while (node1 && node2) {
      node1Temp = node1.next
      node2Temp = node2.next

      node1.next = node2
      node2.next = node1

      node1 = node1Temp

      node2 = node2Temp
      // node1 和 node2 往下走
    }
  }
  // 反转链表的后半段
  link(head, reverseList(temp), dummy)
}

/**
 * 剑指 Offer II 027. 回文链表
 * https://leetcode.cn/problems/aMhZSa/
 */
var reverseList = function (head) {
  if (head == null && head.next == null) {
    return head
  }
  let curr = reverseList(head)
  head.next.next = head
  head.next = null
  return curr
}
// 通过快慢指针找到链表的中间节点，然后反转后半部分链表与前半部分链表进行比较判断是否回文
var isPalindrome = function (head) {
  // 非空的链表就是会问链表
  if (!head || !head.next) return true
  // 通过
  let fast = head,
    slow = head
  while (fast && fast.next) {
    fast = fast.next.next
    slow = slow.next
  }
  // 如果链表的是奇数，需要让 slow 指向后半段的起点
  if (fast !== null) {
    slow = slow.next
  }
  let left = head,
    right = reverseList(slow)
  while (right) {
    if (left.val !== right.val) return false
    left = left.next
    right = right.next
  }
  return true
}

/**
 * 剑指 Offer II 028. 展平多级双向链表
 * https://leetcode.cn/problems/Qv1Da2/
 * 展平的意思是将一个节点的子链展平后插入该节点和下一个节点之间
 */
var flatten = function (head) {
  //展平以 head 为头结点的链表之后返回链表的尾节点
  const dfs = (head) => {
    let node = head,
      tail = null
    while (node) {
      let next = node.next
      // 深度遍历子链
      if (node.child) {
        let child = node.child
        // 递归调用铺平子链
        let childLast = dfs(child)
        // 子链展平后头结点是 child，尾节点是childLast
        node.child = null
        // 展平的子链插入该节点node和他下一节点next 之间
        // 就是子链头节点 child 插入节点 node 之后，尾节点childLast插入节点 next 之前
        node.next = child
        child.prev = node
        childLast.next = next
        if (next) {
          next.prev = childLast
        }
        tail = childLast
      } else {
        tail = node
      }
      node = next
    }
    return tail
  }
  dfs(head)
  return head
}

/**
 * 剑指 Offer II 029. 排序的循环链表
 * https://leetcode.cn/problems/4ueAj6/
 * 1. 空链表 创建返回一个新链表
 * 2. head 不为空，试图在链表中两个相邻节点。（node.val <= insertVal <= node.next.val）
 * 3. head 不为空， 带插入值大于链表中已有的最大值或小于已有最小值，那么insertVal放入最大值和最小值之间
 */
var insert = function (head, insertVal) {
  let node = new Node(insertVal)
  //  case 1：空链表的情况
  if (head === null) {
    head = node
    head.next = head
  } else if (head.next === head) {
    // 当整个链表只有一个节点的时候
    head.next = node
    node.next = head
  } else {
    let cur = head
    let next = head.next
    let bigger = head
    // 试图找到链表中两个相邻节点cur和 next，node.val <= insertVal <= node.next.val
    while (!(cur.val <= node.val && next.val >= node.val) && next != head) {
      cur = next
      next = next.next
      if (cur.val >= bigger.val) {
        bigger = cur
      }
    }
    // 找到了符合的情况，插入新增insertVal
    if (cur.val <= node.val && next.val >= node.val) {
      cur.next = node
      node.next = next
    } else {
      // case3:没有找到符合的情况
      node.next = bigger.next
      bigger.next = node
    }
  }
  return head
}

/**
 * 剑指 Offer II 030. 插入、删除和随机访问都是 O(1) 的容器
 * https://leetcode.cn/problems/FortPu/
 */
var RandomizedSet = function () {
  this.numToLocation = new Map()
  this.nums = []
}
RandomizedSet.prototype.insert = function (val) {
  if (this.numToLocation.has(val)) {
    return false
  }
  this.numToLocation.set(val, this.nums.length)
  this.nums.push(val)
  return true
}
RandomizedSet.prototype.remove = function (val) {
  if (!this.numToLocation.has(val)) {
    return false
  }
  let location = this.numToLocation.get(val)
  // 交换当前需要删除的元素和最后一个元素，这样数组只需要 pop 最后一项就行了
  this.numToLocation.set(this.nums[this.nums.length - 1], location)
  this.numToLocation.delete(val)
  // 把数组当前位置同步拷贝一分原最后一位的值再删除就行了
  this.nums[location] = this.nums[this.nums.length - 1]
  this.nums.pop()
  return true
}
RandomizedSet.prototype.getRandom = function () {
  const randomIndex = Math.floor(Math.random() * this.nums.length)
  return this.nums[randomIndex]
}

/**
 * 剑指 Offer II 031. 最近最少使用缓存
 * https://leetcode.cn/problems/OrIXps/
 */
var LRUCache = function (capacity) {
  this.cache = new Map()
  this.cacheLength = capacity
}
LRUCache.prototype.get = function (key) {
  if (!this.cache.has(key)) {
    return -1
  }
  const val = this.cache.get(key)
  this.cache.delete(key)
  this.cache.set(key, val)
  return val
}
LRUCache.prototype.put = function (key, value) {
  if (this.cache.has(key)) {
    this.cache.delete(key)
  }
  if (this.cache.size == this.cacheLength) {
    const it = [...this.cache.keys()]
    this.cache.delete(it[0], value)
  }
  this.cache.set(key, value)
}

/**
 * 剑指 Offer II 032. 有效的变位词
 * https://leetcode.cn/problems/dKk3P7/
 */
var isAnagram = function (s, t) {
  if (s === t || s.length !== t.length) return false
  let counts = new Map()
  for (let i of s) {
    counts.set(i, (counts.get(i) || 0) + 1)
  }
  for (let k of t) {
    let value = counts.get(k)
    if (!value || value === 0) {
      return false
    }
    counts.set(k, (value || 0) - 1)
  }
  return true
}

/**
 * 剑指 Offer II 033. 变位词组
 * https://leetcode.cn/problems/sfvd7V/
 */

var groupAnagrams = function (strs) {
  const map = {}
  for (let i of strs) {
    count = Array(26).fill(0)
    for (let c of i) {
      count[c.charCodeAt() - 'a'.charCodeAt()]++
    }
    map[count] ? map[count].push(i) : (map[count] = [i])
  }
  return Object.values(map)
}
/**
 * 剑指 Offer II 034. 外星语言是否排序
 * https://leetcode.cn/problems/lwyVBB/
 * 比较相邻两个单词的第一个不同字符的顺序，升序即可
 */
var isAlienSorted = function (words, order) {
  let index = new Array(26).fill(0)
  for (let i = 0; i < order.length; ++i) {
    index[order[i].charCodeAt() - 'a'.charCodeAt()] = i
  }
  for (let i = 1; i < words.length; i++) {
    let valid = false
    for (let j = 0; j < words[i - 1].length && j < words[i].length; j++) {
      let prev = index[words[i - 1][j].charCodeAt() - 'a'.charCodeAt()]
      let curr = index[words[i][j].charCodeAt() - 'a'.charCodeAt()]
      if (prev < curr) {
        valid = true
        break
      } else if (prev > curr) {
        return false
      }
    }
    if (!valid) {
      if (words[i - 1].length > words[i].length) {
        return false
      }
    }
  }
  return true
}

/**
 * 剑指 Offer II 035. 最小时间差
 * https://leetcode.cn/problems/569nqc/
 * 小时转分钟，先排序 再比较大小
 */
var findMinDifference = function (timePoints) {
  //  将小时转换分钟数,在排序
  const secArr = timePoints
    .map((point) => {
      const num = point.split(':')
      return num[0] * 60 + num[1] * 1
    })
    .sort((a, b) => a - b)
  // 取值为 T+1 与最大值之间的差值
  let result = secArr[0] + 1440 - secArr[secArr.length - 1]
  for (let i = 1; i < secArr.length; i++) {
    let res = secArr[i] - secArr[i - 1]
    result = Math.min(res, result)
  }
  return result
}
/**
 * 剑指 Offer II 036. 后缀表达式
 * https://leetcode.cn/problems/8Zf90G/
 */
var evalRPN = function (tokens) {
  const calculate = (num1, num2, operator) => {
    switch (operator) {
      case '+':
        return num1 + num2
      case '-':
        return num1 - num2
      case '*':
        return num1 * num2
      case '/':
        return parseInt(num1 / num2, 10)
      default:
        return 0
    }
  }
  let stack = []
  for (let i = 0; i < tokens.length; i++) {
    let token = tokens[i]
    switch (token) {
      case '+':
      case '-':
      case '*':
      case '/':
        const num1 = stack.pop()
        const num2 = stack.pop()
        stack.push(calculate(num2, num1, token))
        break
      default:
        stack.push(Number(token))
    }
  }
  return stack.pop()
}

/**
 * 剑指 Offer II 037. 小行星碰撞
 * https://leetcode.cn/problems/XagZNi/
 * 当前行星压入栈的情况
 * 1.当前栈空 2.当前行星与栈顶同向 3，当前行星向右栈顶向左
 * 只有一种情况会发生碰撞，栈顶向右当前向左
 * 最后栈中结果所有负数都在正数左边
 */

var asteroidCollision = function (asteroids) {
  let stack = []
  for (let asteroid of asteroids) {
    while (
      stack.length &&
      stack[stack.length - 1] > 0 &&
      stack[stack.length - 1] < -asteroid
    ) {
      stack.pop()
    }
    if (stack.length && asteroid < 0 && stack[stack.length - 1] === -asteroid) {
      stack.pop()
    } else if (!stack.length || stack[stack.length - 1] < 0 || asteroid > 0) {
      stack.push(asteroid)
    }
    // if(stack.length && stack[stack.length - 1] >)
  }
  return stack
}

/**
 * @param {number[]} temperatures
 * https://leetcode.cn/problems/iIQa4I/
 * 时间复杂度 O(n) 正向遍历温度一遍，对于温度列表每个下标，最多一次入栈出栈操作
 */
var dailyTemperatures = function (temperatures) {
  let result = Array(temperatures.length).fill(0)
  let stack = []
  for (let i = 0; i < temperatures.length; i++) {
    // 和之前没计算过的下标进行计算，得出需要的最小田鼠
    while (
      stack.length &&
      temperatures[i] > temperatures[stack[stack.length - 1]]
    ) {
      let prev = stack.pop()
      result[prev] = i - prev
    }
    stack.push(i)
  }
  return result
}

/**
 * 剑指 Offer II 039. 直方图最大矩形面积
 * https://leetcode.cn/problems/0ynMMM/
 * 计算直方图的最大面试，就是寻找比当前柱子矮的左右两个柱子，(A - C).下标 *  B的高度
 * 从左到右扫描每一根柱子，如果当前柱子高度大于栈顶高度，该柱子入栈
 * 否则将位于栈顶的柱子下标出栈，开始计算
 * 维持一个单调递增的栈，存储heights[i]高度的下标，方便计算宽度。
 * 在heights的末尾添加一个0的高度，方便最后stack栈排空。
 */
var largestRectangleArea = function (heights) {
  // 末尾添加 0 的高度，方便计算
  heights.push(0)
  // 栈单调递增，所以初始为-1
  let stack = [-1],
    maxArea = 0
  for (let i = 0; i < heights.length; i++) {
    // 当前柱子的高度小于位于栈顶的柱子的高度
    while (stack.length && heights[stack[stack.length - 1]] >= heights[i]) {
      let last = stack.pop()
      // 以栈顶的柱子为高度计算面积
      let height = heights[last]
      let width = i - stack[stack.length - 1] - 1
      maxArea = Math.max(maxArea, width * height)
    }
    stack.push(i)
  }
  return maxArea
}
/**
 * 剑指 Offer II 040. 矩阵中最大的矩形
 * https://leetcode.cn/problems/PLYXKQ/
 */
var largestRectangleArea = function (heights) {
  heights.push(0)
  let stack = [-1],
    maxArea = 0
  for (let i = 0; i < heights.length; i++) {
    const height = heights[i]
    while (stack.length && heights[stack[stack.length - 1]] >= height) {
      let last = stack.pop()
      let _h = heights[last]
      let _w = i - stack[stack.length - 1] - 1
      maxArea = Math.max(maxArea, _w * _h)
    }
    stack.push(i)
  }
  return maxArea
}
var maximalRectangle = function (matrix) {
  if (matrix.length === 0 || matrix[0].length === 0) return 0
  let heights = Array(matrix[0].length).fill(0)
  let maxArea = 0
  for (let row of matrix) {
    for (let i = 0; i < row.length; i++) {
      if (row[i] === '0') {
        heights[i] = 0
      } else {
        heights[i]++
      }
    }
    maxArea = Math.max(maxArea, largestRectangleArea(heights))
  }
  return maxArea
}

/**
 * 剑指 Offer II 041. 滑动窗口的平均值
 * https://leetcode.cn/problems/qIsx9U/
 */
var MovingAverage = function (size) {
  this.size = size
  this.list = []
  this.sum = 0
}
MovingAverage.prototype.next = function (val) {
  this.list.push(val)
  this.sum += val
  while (this.list.length > this.size) {
    this.sum -= this.list.shift()
  }

  return this.sum / this.list.length
}

/**
 * 剑指 Offer II 042. 最近请求次数
 * https://leetcode.cn/problems/H8086Q/
 */
var RecentCounter = function () {
  this.timer = []
}
RecentCounter.prototype.ping = function (t) {
  this.timer.push(t)
  while (this.timer[0] < t - 3000) {
    this.timer.shift()
  }
  return this.timer.length
}

/**
 * 剑指 Offer II 043. 往完全二叉树添加节点
 * https://leetcode.cn/problems/NaqhDT/
 * 每次在完全二叉树中按照广度优先搜索，找到第一个需要插入节点的元素。如果没有左节点就做左节点。没有右节点就做右节点
 * 初始化把根节点插入队列中，把队列中元素准备好。根据根节点，依次插入根节点左右节点，然后判断是否在此节点下进行插入新节点
 * 凡是有左右子节点的节点删除，避免下次插入重复判断
 */

var CBTInserter = function (root) {
  this.queue = []
  this.root = root
  // 初始化的时候把根节点加入
  this.queue.push(root)
  // 通过根节点循环将所有的子孙节点加入队列
  while (this.queue[0] && this.queue[0].left && this.queue[0].right) {
    // 如果当前节点同时有左右节点，那么当前插入的节点不会是当前节点的子节点
    // 将他左右节点加入队列后此节点没有存在意义
    let node = this.queue.shift()
    this.queue.push(node.left)
    this.queue.push(node.right)
  }
  // 操作后，当前节点加入的节点一定是需要插入的子节点
}
CBTInserter.prototype.insert = function (v) {
  // 初始化保证队首元素是需要插入的元素
  let parent = this.queue[0]
  let node = new TreeNode(v)
  if (parent.left === null) {
    parent.left = node
  } else {
    parent.right = node
    // 左右子树都有了的情况下，移除当前父节点
    this.queue.shift()
    this.queue.push(parent.left)
    this.queue.push(parent.right)
  }
  return parent.val
}
CBTInserter.prototype.get_root = function () {
  return this.root
}
/**
 * 剑指 Offer II 044. 二叉树每层的最大值
 * https://leetcode.cn/problems/hPov7L/
 */
var largestValues = function (root) {
  let res = []
  const dfs = (node, level) => {
    if (!node) return
    if (res[level] === undefined || node.val > res[level]) {
      res[level] = node.val
    }
    dfs(node.left, level + 1)
    dfs(node.right, level + 1)
  }
  dfs(root, 0)
  return res
}
// bfs 解决方案
var largestValues = function (root) {
  // 用两个队列实现广度优先,queue1 存放当前行层的节点，queue2 存放下一行的节点
  let queue1 = [],
    queue2 = []
  if (root) {
    queue1.push(root)
  }
  let result = []
  let max = -Infinity
  while (queue1.length) {
    let node = queue1.shift()
    max = Math.max(max, node.val)
    node.left && queue2.push(node.left)
    node.right && queue2.push(node.right)
    if (!queue1.length) {
      result.push(max)
      max = -Infinity
      // 开始下一层遍历赋值
      queue1 = queue2
      queue2 = []
    }
  }
  return result
}
/**
 * 剑指 Offer II 045. 二叉树最底层最左边的值
 * https://leetcode.cn/problems/LwUNpT/
 */
var findBottomLeftValue = function (root) {
  let res = 0,
    maxLevel = 0
  const dfs = (node, level) => {
    if (!node) return
    if (level > maxLevel) {
      maxLevel = level
      res = node.val
    }
    dfs(node.left, level + 1)
    dfs(node.right, level + 1)
  }
  dfs(root, 0 + 1)
  return res
}
// bfs
var findBottomLeftValue = function (root) {
  let queue1 = [],
    queue2 = []
  if (root) queue1.push(root)
  let res = root.val
  while (queue1.length) {
    let node = queue1.shift()
    node.left && queue2.push(node.left)
    node.right && queue2.push(node.right)
    if (!queue1.length) {
      queue1 = queue2
      queue2 = []
      if (queue1.length) {
        res = queue1[0].val
      }
    }
  }
  return res
}

/**
 * 剑指 Offer II 046. 二叉树的右侧视图
 * https://leetcode.cn/problems/WNC0Lk/
 */
var rightSideView = function (root) {
  // dfs遍历树，当前节点层级作为下标，val 当成值更新 res[level],最后最右边的值会不断覆盖左边的
  let res = []
  const dfs = (node, level) => {
    if (!node) return
    res[level] = node.val
    dfs(node.left, level + 1)
    dfs(node.right, level + 1)
  }
  dfs(root, 0)
  return res
}
// bfs
var rightSideView = function (root) {
  let queue1 = [],
    queue2 = [],
    res = []
  if (!root) return res
  queue1.push(root)
  while (queue1.length) {
    let node = queue1.shift()
    node.left && queue2.push(node.left)
    node.right && queue2.push(node.right)
    if (!queue1.length) {
      // 当前元素就是最右侧元素
      res.push(node.val)
      queue1 = queue2
      queue2 = []
    }
  }
  return res
}
/**
 * 剑指 Offer II 047. 二叉树剪枝
 * https://leetcode.cn/problems/pOCWxh/
 */
var pruneTree = function (root) {
  if (root === null) return root
  root.left = pruneTree(root.left)
  root.right = pruneTree(root.right)
  if (root.val === 0 && !root.left && !root.right) {
    return null
  }
  return root
}
/**
 * 剑指 Offer II 048. 序列化与反序列化二叉树
 * https://leetcode.cn/problems/h54YBf/
 */
var serialize = function (root) {
  const queue = [root]
  let res = []
  while (queue.length) {
    let node = queue.shift()
    // 真实存在的节点
    if (node) {
      res.push(node.val)
      // 不论节点是否存在都需要进入队列
      queue.push(node.left)
      queue.push(node.right)
    } else {
      // 是 null节点，没有子节点
      res.push('#')
    }
  }
  return res.join(',')
}
var deserialize = function (data) {
  if (data === '#') return null
  // 序列化字符串split 成为 res 数组
  const list = data.split(',')
  // 获取首项 构建树
  const root = new TreeNode(list[0])
  // 根节点推入队列
  const queue = [root]
  // 初始项初始指向第一项
  let cursor = 1
  // 超出了序列化字符串
  while (cursor < list.length) {
    const node = queue.shift()
    const leftVal = list[cursor]
    const rightVal = list[cursor + 1]
    if (leftVal !== '#') {
      // 是真实存在的节点，非 null
      const leftNode = new TreeNode(leftVal)
      node.left = leftNode
      // 进入队列
      queue.push(leftNode)
    }
    if (rightVal !== '#') {
      const rightNode = new TreeNode(rightVal)
      node.right = rightNode
      queue.push(rightNode)
    }
    cursor += 2
  }
  return root
}
// 递归遍历
var serialize = (root) => {
  if (root === null) {
    return '#'
  }
  const left = serialize(root.left)
  const right = serialize(root.right)
  return `${root.val},${left},${right}`
}
var deserialize = (data) => {
  const list = data.split(',')
  const buildTree = (list) => {
    const rootVal = list.shift()
    if (rootVal === '#') {
      return null
    }
    const root = new TreeNode(rootVal)
    root.left = buildTree(list)
    root.right = buildTree(list)
    return root
  }
  return buildTree(list)
}

/**
 * 剑指 Offer II 049. 从根节点到叶节点的路径数字之和
 * https://leetcode.cn/problems/3Etpl5/
 */
var sumNumbers = function (root) {
  const dfs = (root, path) => {
    if (root === null) return 0
    path = path * 10 + root.val
    // 只有是叶子节点才返回值
    if (!root.left && !root.right) return path
    // 不然继续递归
    return dfs(root.left, path) + dfs(root.right, path)
  }
  return dfs(root, 0)
}
/**
 * 剑指 Offer II 050. 向下的路径节点之和
 * https://leetcode.cn/problems/6eUYwP/
 */
var pathSum = function (root, targetSum) {
  const prefix = new Map()
  prefix.set(0, 1)
  const dfs = (root, prefix, curr, targetSum) => {
    if (!root) return 0
    let ret = 0
    curr += root.val
    // 如果 root 到第 p 个节点存在 curr - targetSum,那么必定存在第 i 个节点到第 p 个节点和为 targetSum
    ret = prefix.get(curr - targetSum) || 0
    prefix.set(curr, (prefix.get(curr) || 0) + 1)
    ret += dfs(root.left, prefix, curr, targetSum)
    ret += dfs(root.right, prefix, curr, targetSum)
    prefix.set(curr, (prefix.get(curr) || 0) - 1)
    return ret
  }
  return dfs(root, prefix, 0, targetSum)
}
/**
 * 剑指 Offer II 051. 节点之和最大的路径
 * https://leetcode.cn/problems/jC7MId/
 *子树内部最大值 = 左子树提供最大路径 + 根节点值 + 右子树提供的最大路径和
 */

var maxPathSum = function (root) {
  let maxSum = Number.MIN_SAFE_INTEGER
  const dfs = (root) => {
    if (root === null) return 0
    // 左子树提供的最大路径和
    const left = dfs(root.left)
    // 右子树提供的最大路径和
    const right = dfs(root.right)
    // 当前子树内部最大值
    const innerSum = left + right + root.val
    maxSum = Math.max(innerSum, maxSum)
    // 当前子树对外提供最大值
    const outputSum = root.val + Math.max(0, right, left)
    return outputSum > 0 ? outputSum : 0
  }
  dfs(root)
  return maxSum
}
/**
 * 剑指 Offer II 052. 展平二叉搜索树
 * https://leetcode.cn/problems/NYBBNL/
 */

var increasingBST = function (root) {
  const res = []
  const inOrder = (node, res) => {
    if (!node) return
    inOrder(node.left, res)
    res.push(node.val)
    inOrder(node.right, res)
  }
  // 中序遍历,构建 res
  inOrder(root, res)
  const dummyNode = new TreeNode(-1)
  let currNode = dummyNode
  for (const value of res) {
    currNode.right = new TreeNode(value)
    currNode = currNode.right
  }
  return currNode.right
}
// 不用额外空间处理
var increasingBST = function (root) {
  const dummyNode = new TreeNode(-1)
  let resNode = dummyNode
  const inOrder = (node) => {
    if (node === null) return
    inOrder(node.left)
    // 第一次进入时,node 是最左边最小的值
    resNode.right = node
    //  resNode 右节点指向当前节点,避免链串
    node.left = null
    // 相当于向前走一步,只剩下右节点,右走一步,方便下次指向
    resNode = node
    inOrder(node.right)
  }
  inOrder(root)
  return dummyNode.right
}
/**
 * 剑指 Offer II 053. 二叉搜索树中的中序后继
 * https://leetcode.cn/problems/P5rCT8/
 * 从根节点开始,每到达一个节点比较根节点与 p 节点的值
 * 当前节点 <=p 节点,那么当前节点p 的下一个节点在他右子树
 * 当前节点 > p 的值,当前节点可能是 p 的下一个节点.这时查找当前节点左子树,看是否有更小的值
 */
var inorderSuccessor = function (root, p) {
  let cur = root,
    target = null
  while (cur) {
    if (cur.val > p.val) {
      target = cur
      cur = cur.left
    } else {
      cur = cur.right
    }
  }
  return target
}

/**
 * 剑指 Offer II 054. 所有大于等于节点的值之和
 * https://leetcode.cn/problems/w6cpku/
 * 按照中序相反的顺序(右根左,遍历顺序就是从大到小的降序)
 * 累加计算右子树的和
 */
var convertBST = function (root) {
  let sum = 0
  let traverse = (root) => {
    // 遍历到 null节点返回
    if (root === null) return
    // 进入右子树
    traverse(root.right)
    sum += root.val
    root.val = sum
    traverse(root.left)
  }
  traverse(root)
  return root
}
/**
 * 剑指 Offer II 055. 二叉搜索树迭代器
 * https://leetcode.cn/problems/kTOapQ/
 */
var BSTIterator = function (root) {
  this.cur = root
  this.stack = []
}
BSTIterator.prototype.next = function () {
  // 基于二叉树的中序遍历
  while (this.cur) {
    this.stack.push(this.cur)
    this.cur = this.cur.left
  }
  this.cur = this.stack.pop()
  let val = this.cur.val
  this.cur = this.cur.right
  return val
}
BSTIterator.prototype.hasNext = function () {
  return this.cur !== null || this.stack.length
}
/**
 * 剑指 Offer II 056. 二叉搜索树中两个节点之和
 * https://leetcode.cn/problems/opLdQZ/
 */
var findTarget = function (root, k) {
  const set = new Set()
  function dfs(node) {
    if (!node) {
      return false
    }
    if (set.has(k - node.val)) {
      return true
    }
    set.add(node.val)
    return dfs(node.left) || dfs(node.right)
  }
  return dfs(root)
}

/**
 * 剑指 Offer II 057. 值和下标之差都在给定的范围内
 * https://leetcode.cn/problems/7WqeDu/
 * 桶排序.差的绝对值小于 t.可以将数字放入若干大小为t+1 的桶中
 * 0 - t 放入 编号为 0 的桶中,t+1 - 2t+1 数字放入编号为 1 桶中
 * 如果两个数字放入同个桶中,那么他们的差的绝对值小于等于 t

 */
var containsNearbyAlmostDuplicate = function (nums, k, t) {
  let buckets = new Map()
  let bucketSize = t + 1
  const getBucketId = (num, bucketSize) => {
    return num >= 0
      ? Math.floor(num / bucketSize)
      : Math.floor((num + 1) / bucketSize) - 1
  }
  for (let i = 0; i < nums.length; i++) {
    let num = nums[i]
    let id = getBucketId(num, bucketSize)
    if (buckets.has(id)) return true
    if (buckets.has(id - 1) && Math.abs(num - buckets.get(id - 1)) <= t) {
      return true
    }
    if (buckets.has(id + 1) && Math.abs(num - buckets.has(id + 1)) <= t) {
      return true
    }
    buckets.set(id, num)
    if (i >= k) {
      buckets.delete(getBucketId(nums[i - k], bucketSize))
    }
  }
  return false
}
// 简单暴力法
var containsNearbyAlmostDuplicate = function (nums, k, t) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = 0; j <= i + k; j++) {
      if (Math.abs(num[j] - num[i]) <= t) return true
    }
  }
}
/**
 * 剑指 Offer II 058. 日程表
 * https://leetcode.cn/problems/fi9suh/
 */
var MyCalendar = function () {
  this.events = []
}
MyCalendar.prototype.findInertIndex = function (start) {
  var left = 0,
    right = this.events.length - 1
  while (left <= right) {
    let mid = left + Math.floor((right - left) / 2)
    // 如果插入的区间起始点刚好和当前区间起始点相同
    if (start == this.events[mid][0]) {
      return mid
    } else if (this.events[mid][0] < start) {
      left = mid + 1
    } else {
      right = mid - 1
    }
    return left
  }
}
MyCalendar.prototype.book = function (start, end) {
  let index = this.findInertIndex(start)
  if (
    (this.events[index - 1] && start < this.events[index - 1][1]) ||
    (this.events[index] && end > this.events[index][0])
  ) {
    // 和前后区间有重叠
    return false
  }
  // 把符合规则的添加进去
  this.events.splice(index, 0, [start, end])
  return true
}

/**
 * 剑指 Offer II 059. 数据流的第 K 大数值
 * https://leetcode.cn/problems/jBjn9C/
 * 最小堆解题
 */
// 最小堆
class MaxHeap {
  constructor(data = []) {
    this.data = data
    this.comparator = (a, b) => a - b
    this.heapify()
  }
  // 建堆
  heapify() {
    if (this.size() < 2) return
    for (let i = 1; i < this.size(); i++) {
      this.bubbleUp(i)
    }
  }
  // 获取堆顶元素
  peek() {
    if (this.size() === 0) return null
    return this.data[0]
  }
  // 往小堆顶插入元素
  offer(value) {
    this.data.push(value)
    // 在最后的位置插入且向上冒泡
    this.bubbleUp(this.size() - 1)
  }
  // 移除堆顶元素
  poll() {
    if (this.size() === 0) return null
    const result = this.data[0]
    const last = this.data.pop()
    if (this.size() !== 0) {
      // 最末尾元素放到堆顶
      this.data[0] = last
      // 向下调整至合适位置
      this.bubbleDown(0)
    }
    return result
  }
  bubbleUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2)
      // 调整的节点比父节点要小,就需要一直往上
      if (this.comparator(this.data[index], this.data[parentIndex]) < 0) {
        this.swap(index, parentIndex)
        index = parentIndex
      } else {
        break
      }
    }
  }
  bubbleDown(index) {
    let lastIndex = this.size() - 1
    while (true) {
      // 需要调整的节点的做左子节点和右子节点的索引
      const leftIndex = index * 2 + 1
      const rightIndex = index * 2 + 2
      let findIndex = index
      // 如果左右子节点的值小于当前要调整的值
      if (
        leftIndex <= lastIndex &&
        this.comparator(this.data[leftIndex], this.data[findIndex]) < 0
      ) {
        findIndex = leftIndex
      }
      if (
        rightIndex <= lastIndex &&
        this.comparator(this.data[rightIndex], this.data[findIndex]) < 0
      ) {
        findIndex = rightIndex
      }
      if (index != findIndex) {
        this.swap(index, findIndex)
        index = findIndex
      } else {
        break
      }
    }
  }
  // 交换元素
  swap(index1, index2) {
    ;[this.data[index1], this.data[index2]] = [
      this.data[index2],
      this.data[index1],
    ]
  }
  size() {
    return this.data.length
  }
}
var KthLargest = function (k, nums) {
  this.size = k
  this.minHeap = new MaxHeap()
  // 添加数据
  for (let num of nums) {
    this.add(num)
  }
}
KthLargest.prototype.add = function (val) {
  if (this.minHeap.size() < this.size) {
    this.minHeap.offer(val)
  } else if (val > this.minHeap.peek()) {
    this.minHeap.poll()
    this.minHeap.offer(val)
  }
  return this.minHeap.peek()
}

/**
 * https://leetcode.cn/problems/g5c51o/
 * 剑指 Offer II 060. 出现频率最高的 k 个数字
 */
var topKFrequent = function (nums, k) {
  const map = new Map()
  for (let num of nums) {
    map.set(num, (map.get(num) || 0) + 1)
  }
  let arr = []
  for (let kv of map) {
    arr.push(kv)
  }
  return arr
    .sort((a, b) => b[1] - a[1])
    .slice(0, k)
    .map((a) => a[0])
}
// 桶排序
var topKFrequent = function (nums, k) {
  const map = new Map()
  for (let num of nums) {
    map.set(num, (map.get(num) || 0) + 1)
  }
  const buckets = new Array(nums.length + 1)
  // key value
  for (const [n, v] of map) {
    !buckets[v] ? (buckets[v] = [n]) : buckets[v].push(n)
  }
  const res = []
  for (let i = buckets.length - 1; i > -1; i--) {
    if (res.length >= k) break
    if (buckets[i]) {
      res.push(...buckets[i])
    }
  }
  return res.length > k ? res.splice(0, k) : res
}
/**
 * 剑指 Offer II 061. 和最小的 k 个数对
 * https://leetcode.cn/problems/qn8gGX/
 */
class MinHeap {
  constructor(compare) {
    this.data = []
    this.size = 0
    this.compare = compare
  }
  _swap(a, b) {
    ;[this.data[a], this.data[b]] = [this.data[b], this.data[a]]
  }
  _parent(index) {
    return Math.floor((index - 1) / 2)
  }
  _child(index) {
    return index * 2 + 1
  }
  offer(val) {
    this.data.push(val)
    this._shiftUp(this.size++)
  }
  poll() {
    if (this.size === 0) {
      return null
    }
    this._swap(0, --this.size)
    this._shiftDown(0)
    return this.data.pop()
  }
  _shiftUp(index) {
    while (
      this._parent(index) >= 0 &&
      this.compare(this.data[index], this.data[this._parent(index)])
    ) {
      this._swap(index, this._parent(index))
      index = this._parent(index)
    }
  }
  _shiftDown(index) {
    while (this._child(index) < this.size) {
      let child = this._child(index)
      if (
        child + 1 < this.size &&
        this.compare(this.data[child + 1], this.data[child])
      ) {
        child = child + 1
      }
      if (this.compare(this.data[child], this.data[index])) {
        this._swap(index, child)
        index = child
      } else {
        break
      }
    }
  }
  peek() {
    return this.size === 0 ? null : this.data[0]
  }
}
var kSmallestPairs = function (nums1, nums2, k) {
  const maxHeap = new MinHeap((a, b) => a[0] + a[1] >= b[0] + b[1])
  for (let i = 0; i < nums1.length; i++) {
    for (let j = 0; j < nums2.length; j++) {
      maxHeap.offer([nums1[i], nums2[j]])
      if (maxHeap.size > k) {
        maxHeap.poll()
      }
    }
  }
  return maxHeap.data.sort((a, b) => a[0] + a[1] - b[0] - b[1])
}
/**
 * 剑指 Offer II 062. 实现前缀树
 * https://leetcode.cn/problems/QC3q1f/
 */

var Trie = function () {
  this.children = {}
}
Trie.prototype.insert = function (word) {
  let node = this.children
  // 字典树处理 {"a":{"p":{"p":{"l":{"e":{"isEnd":true}}}}}}
  for (const ch of word) {
    if (!node[ch]) {
      node[ch] = {}
    }
    node = node[ch]
  }
  node.isEnd = true
}
Trie.prototype.searchPrefix = function (prefix) {
  let node = this.children
  for (let ch of prefix) {
    if (!node[ch]) {
      return false
    }
    node = node[ch]
  }
  return node
}
Trie.prototype.search = function (word) {
  const node = this.searchPrefix(word)
  return node !== undefined && node.isEnd !== undefined
}
Trie.prototype.startsWith = function (prefix) {
  return this.searchPrefix(prefix)
}

/**
 * 剑指 Offer II 063. 替换单词
 * https://leetcode.cn/problems/UhWRSj/
 */
var replaceWords = function (dictionary, sentence) {
  const tries = {}
  const build = (word) => {
    let n = tries
    for (let c of word) {
      if (!n[c]) {
        n[c] = {}
        n[c].isWord = false
      }
      n = n[c]
    }
    n.isWord = true
  }
  const search = (word) => {
    let result = ''
    let n = tries
    for (let c of word) {
      if (!n[c]) {
        return word
      }
      result += c
      n = n[c]
      if (n.isWord) {
        break
      }
    }
    return result
  }
  for (let word of dictionary) {
    build(word)
  }
  return sentence
    .split(' ')
    .map((w) => search(w))
    .join(' ')
}
/**
 * 剑指 Offer II 064. 神奇的字典
 * https://leetcode.cn/problems/US1pGT/
 */
var MagicDictionary = function () {
  this.dict = []
}
MagicDictionary.prototype.buildDict = function (dictionary) {
  this.dict = dictionary
}
MagicDictionary.prototype.search = function (searchWord) {
  for (let i = 0; i < this.dict.length; i++) {
    if (searchWord.length !== this.dict[i].length) continue
    let diff = 0
    for(let j = 0; j< searchWord.length;j++){
      if(diff > 1)break
      if(searchWord[j] !== this.dict[i][j])diff++
    }
    if(diff === 1)return true
  }
  return false
}

/**
 * 剑指 Offer II 065. 最短的单词编码
 * @return {number}
 */
 var minimumLengthEncoding = function(words) {
  const map = new Map()
  for(let i = 0; i< words.length;i++){
    let w = words[i]
    if(map.has(w)){
      continue
    }
    map.set(w,1)
    // 把每个单词的子单词加进去
    for(let j = 1; j< w.length;j++){
      map.set(w.substr(j),0)
    }
  }
  let ans = 0
  for(let [k,v] of map){
    if(v === 1){
      ans += k.length + 1
    }
  }
  return ans
};
/**
 * 剑指 Offer II 066. 单词之和
 * https://leetcode.cn/problems/z1R5dt/
 */
 var MapSum = function() {
  this.obj = {}
}
MapSum.prototype.insert = function(key, val) {
  this.obj[key] = val
}
MapSum.prototype.sum = function(prefix) {
  let result = 0
  // prefix 存入前缀树
  let root = {}
  let cur = root
  for(let s of prefix){
    if(!cur[s]){
      cur[s] = {}
    }
    cur = cur[s]
  }
  cur.isPrefix = true
  for(let key in this.obj){
    let current = root;
    for(let s of key){
      if(!current[s]) break
      current = current[s]
    }
    if(current.isPrefix){
      result += this.obj[key]
    }
  }
  return result
};
/**
 * 剑指 Offer II 067. 最大的异或
 * https://leetcode.cn/problems/ms70jA/
 */
 var findMaximumXOR = function(nums) {

};