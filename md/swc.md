# 什么是 swc
swc 是一个用 Rust 写的高性能 ts/js 转义器,类似于 babel.
## Rust 项目
rust 是一个无 GC(垃圾回收)的高性能编程语言.
Rust 高效的原因就是他处理垃圾回收的方式,通过不再使用数据对象释放内存资源.在 Rust 在编译时决定不再需要哪些内存资源并且不再运行.因此处理时间减少使性能提升.