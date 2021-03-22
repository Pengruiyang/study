

const localPath = require('path')
module.exports = function({types: t}){
  return {
    visitor: {
      ImportDeclaration(path,state){
        // 从state中拿到外界传进的参数,这里我们外界设置了alias
        const {alias} = state.opts
        if(!alias){
          return
        }
        // 拿到当前文件的信息
        const {filename,root} = state.file.opts
        // 找到相对地址
        const relativePath = localPath.relative(root, localPath.dirname(filename))
        // 利用path获取当前节点中source中的value,这里对应的就是'@/common'
        let importSource = path.node.source.value
        // 遍历我们的配置 进行关键字替换
        Object.keys(alias).forEach( key => {
          const reg = new RegExp(`${key}`)
          if(reg.test(importSource)){
            importSource = importSource.replace(reg,alias[key])
            importSource = localPath.relative(relativePath, importSource)
          }
        })
        // 利用t.StringLiteral构建器构建一个StringLiteral类型节点,赋值给source
        path.node.source = t.StringLiteral(importSource)
      }
    }
  }
}