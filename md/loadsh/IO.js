/*
 * Filename: d:\code\study\md\函数式\IO.js
 * Path: d:\code\study\md\函数式
 * Created Date: Monday, August 2nd 2021, 9:04:57 pm
 * Author: pry
 * IO函子中的_value是一个函数,这里把函数作为值来处理
 * IO函子可以把不纯的动作存储到_value中,延迟执行这个不纯的操作(惰性执行),包装当前的操作
 * 把不纯的操作交给调用者来处理
 * Copyright (c) 2021 Your Company
 */

const fp = require('loadsh/fp')
const fs = require('fs')
const { toUpper, first, split, find } = fp
const { compose, curry } = require("folktale/core/lambda");
class IO {
    static of(x) {
        return new IO(() => x);
    }
    constructor(fn) {
        this._value = fn;
    }
    map(fn) {
        console.log(fn);
        return new IO(fp.flowRight(fn, this._value));
    }
    join() {
        return this._value();
    }
    flatMap(fn) {
        return this.map(fn).join();
    }
}
// let readFile = function (filename) {
//     return new IO(function () {
//         return fs.readFileSync(filename, "utf-8");
//     });
// };
let readFile = filename => IO.of(filename).map(() => fs.readFileSync(filename, "utf-8"))
let print = x => IO.of(x)

let r = readFile(__dirname + '/package.json').flatMap(print).join();
console.log(r);

// let  readFile = filename => IO.of()
// let f = compose(toUpper,first)
// console.log(f(["one", "two"]));

// 读取文件
// task 处理异步任务
// const fs = require("fs")
// const { task } = require("folktale/concurrency/task");
// function readFile(filename) {
//     return task((resolver) => {

//         fs.readFile(filename, 'utf-8', (err, data) => {
//             if (err) {
//                 resolver.reject(err)
//             } else {
//                 resolver.resolve(data)
//             }
//         })
//     })
// }
// readFile(__dirname + '/package.json')
//     .map(split("\n"))
//     .map(find(x => x.includes("author")))
//     .run()
//     .listen({
//         onRejected: (err) => {
//             console.log(err);
//         },
//         onResolved: (value) => {
//             console.log(value);
//         },
//     });
