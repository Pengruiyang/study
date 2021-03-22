
// Parsing 解析
// 词法解析
// [
//   { type: 'paren', value: '(' },
//   { type: 'name', value: 'add' },
//   { type: 'number', value: '2' },
//   { type: 'paren', value: '(' },
//   { type: 'name', value: 'subtract' },
//   { type: 'number', value: '4' },
//   { type: 'number', value: '2' },
//   { type: 'paren', value: ')' },
//   { type: 'paren', value: ')' },
// ]

// 实现一个tokenizer 函数
const tokenizer = (input) => {
  let current = 0;
  let tokens = [];
  while (current < input.length) {
    let char = input[current];

    // 处理 (
    if (char === '(') {
      tokens.push({ type: 'paren', value: '(' });
      current++;
      continue;
    }
    // 处理 )
    if (char === ')') {
      tokens.push({ type: 'paren', value: ')' });
      current++;
      continue;
    }
    // 处理空白字符
    let WHITE_SPACE = /\s/;
    if (WHITE_SPACE.test(char)) {
      current++;
      continue;
    }
    // 处理数字
    let NUMBERS = /\d/;
    if (NUMBERS.test(char)) {
      let value = '';
      while (NUMBERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: 'number',
        value,
      });
      continue;
    }
    //  处理字符串
    if (char === '"') {
      let value = '';
      char = input[++current];
      while (char !== '"') {
        value += char;
        char = input[++current];
      }
      char = input[++current];
      tokens.push({
        type: 'string',
        value,
      });
      continue;
    }
    // 处理函数名
    let LETTERS = /[a-z]/i;
    if (LETTERS.test(char)) {
      let value = '';
      while (LETTERS.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({
        type: 'name',
        value,
      });
      continue;
    }
    // 抛出异常提示
    throw new TypeError('I dont know what this character is: ' + char);
  }
  return tokens;
};

// 第二步 语法分析
// 第二步，Syntactic Analysis，转化成AST类似如下
// {
//   type: 'Program',
//   body: [{
//       type: 'CallExpression',
//       name: 'add',
//       params: [{
//           type: 'NumberLiteral',
//           value: '2',
//       }, {
//           type: 'CallExpression',
//           name: 'subtract',
//           params: [{
//               type: 'NumberLiteral',
//               value: '4',
//           }, {
//               type: 'NumberLiteral',
//               value: '2',
//           }]
//       }]
//   }]
// }

// 实现一个parser 转换成 AST
const parser = (tokens) => {
  let current = 0;
  function walk() {
    let token = tokens[current];
    // 处理数字
    if (token.type === 'number') {
      current++;
      return {
        type: 'NumberLiteral',
        value: token.value,
      };
    }
    // 处理字符串
    if (token.type === 'string') {
      current++;
      return {
        type: 'StringLiteral',
        value: token.value,
      };
    }
    // 处理括号表达式
    if (token.type === 'paren' && token.value === '(') {
      token = tokens[++current];
      let node = {
        type: 'CallExpression',
        name: token.value,
        params: [],
      };
      token = tokens[++current];
      while (
        token.type !== 'paren' ||
        (token.type === 'paren' && token.value !== ')')
      ) {
        node.params.push(walk());
        token = tokens[current];
      }
      current++;
      return node;
    }
    throw new TypeError(token.type);
  }
  let ast = {
    type: 'Program',
    body: [],
  };
  while (current < tokens.length) {
    ast.body.push(walk());
  }
  return ast;
};


/**  
 * 转义
 * traverser遍历器
 * 转换得到我们想要的代码,遍历ast,利用深度优先遍历的方法获得所有节点.当遍历到某个节点时,再去
调用这个节点对应的方法,再方法里面改变这些节点的值.
 * 
*/
const traverser = (ast, visitor) => {
  // 遍历一个数组的节点
  function traverseArray(array, parent) {
    array.forEach((child) => {
      traverseNode(child, parent);
    });
  }
  // 遍历节点
  function traverseNode(node, parent) {
    let methods = visitor[node.type];
    // 先执行enter方法
    if (methods && methods.enter) {
      methods.enter(node, parent);
    }
    switch (node.type) {
      // 一开始节点的类型是Program 顶级 去接着解析body字段
      case 'Program':
        traverseArray(node.body, node);
        break;
      // 当节点类型是CallExpression 括号, 去解析params字段
      case 'CallExpression':
        traverseArray(node.params, node);
        break;
      // 字符串和数字类型没有子节点, 直接执行enter 个 exit 就好
      case 'NumberLiteral':
      case 'StringLiteral': 
        break;
      // 容错处理
      default: 
        throw new TypeError(node.type)
    }
    // 后执行exit方法
    if(methods && methods.exit){
      methods.exit(node,parent)
    }
  }
  // 开始从根部遍历
  traverseNode(ast, null)
};

/**
 * 转 化
  */
 const transformer = ast => {
   let newAst = {
     type: 'Program',
     body: []
   }
   // 给节点一个_context 让遍历到子节点时可以push内容到parent._context中
   ast._context = newAst.body
   traverser(ast, {
    CallExpression: {
     enter(node,parent){
       let expression = {
         type: 'CallExpression',
         callee: {
           // Identifier: 标识符
           type: 'Identifier',
           name: node.name
         },
         arguments: []
       }
       // 让子节点可以push自己到expression.arguments中
       node._context = expression.arguments
       // 如果父节点不是 CallExpression,则外层包裹一层ExpressionStatement
       if(parent.type !== 'CallExpression'){
         expression = {
           type: 'ExpressionStatement',
           expression: expression
         }
       }
       parent._context.push(expression)
     }
   },
   NumberLiteral: {
     enter(node,parent){
       parent._context.push({
         type: 'NumberLiteral',
         value: node.value
       })
     }
   },
   StringLiteral: {
     enter(node,parent){
       parent._context.push({
         type: 'StringLiteral',
         value: node.value
       })
     }
   }
   
  })
  return newAst
 }


 // CodeGeneration 代码生成阶段
 // 通过Ast生成我们最后的代码 生成Ast的反过程

 const codeGeneration = node => {
   switch(node.type){
     // 针对于Program, 处理其中的body属性,依次再递归调用codeGenerator
    case 'Program': 
      return node.body.map(codeGeneration).join('\n')
      // 针对于ExpressionStatement,处理其中的expression属性,再后面添加一个分号
    
    case 'ExpressionStatement':
      return (
        codeGeneration(node.expression) + ';'
      )
    // 针对CallExpression, 左侧处理callee 括号中处理arguments数组
    case 'CallExpression': 
      return (
        codeGeneration(node.callee) + '(' + node.arguments.map(codeGeneration).join(',') + ')'
      )
    //  直接返回name
    case 'Identifier':
      return node.name
    
    // 返回数字的value
    case 'NumberLiteral': 
      return node.value
    // string类型添加双引号
    case 'StringLiteral':
      return '"' + node.value + '"'
    // 容错处理
    default: 
        throw new TypeError(node.type)
   }
 }



 // tiny-compiler 完成

 let code = `(add 2 (subtract 4 2))`;
function compiler(input){
  let tokens = tokenizer(input)
  let ast = parser(tokens)
  let newAst = transformer(ast)
  // console.log(JSON.stringify(newAst,null,2));
  console.log(newAst);
  let output = codeGeneration(newAst)

  return output
}
compiler(code)