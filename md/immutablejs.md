# 什么是 immutablejs?
 通过 tree + sharing 解决了数据可变性带来的问题,顺便优化了性能.
 采用了持久化数据结构,保证每一个对象是不可变的.任何添加、修改、删除等操作都会生成一个新的对象,且通过结果共享等方式大幅度提高性能.
 ## 持久化数据结构
 对于一个持久化数据结构,每次修改后我们都会得到一个新的版本,且旧的版本可以完好的保留.
 我们新生成一个根节点,对于有修改的部分,把相应路径上所有的节点全部重新生成,对于本次操作没有修改的部分,我们把相应旧的节点拷贝过去.这就是结构共享.
 ## 原理 把所有的 key 通过映射转换为数字