let a = `
  class AAA {
    // 时间
    time: string
    // 姓名
    name: string
    // 年龄
    age: int 
    money: long
    othen: BBB
  }
  class BBB {
    // 时间
    time: string
    // 姓名
    name: string
  }
`
let stack = a.split('\n').filter((i) => i)

for (let i = 0; i < stack.length; i++) {
  if (stack[i].indexOf('class') > -1) {
    stack[i] = stack[i].replace('class ', 'interface I')
    console.log(stack[i], 'stack[i]')
  }
}
console.log(stack.join('\n'), 'stack')
