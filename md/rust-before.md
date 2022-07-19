# 内存：值放堆上还是放栈上，这是一个问题
## 栈

每当一个函数被调用时，一块连续的内存就会在栈顶被分配出来，这块内存被称为帧。栈是自顶向下增长的，一个程序的调用栈最底部，除去入口帧，就是 mian 函数的对应的帧，而随着 main 函数一层层的调用，栈会一层层扩展；调用结束，栈优惠一层层回溯，释放内存。
在调用过程中，*一个新的帧会分配足够的空间存储寄存器的上下文*。在函数里使用到的通用寄存器会在栈保存一个符文，当这个函数调用结束，通过副本，可以恢复出原本的寄存器的上下文，就像什么事都没有经历一样。此外，函数所需要使用到的局部变量，也都会在帧分配的时候预留出来。
### 栈的内存分配
只需要改动栈指针，就可以预留响应的空间。把栈指针改动回来，预留的空间又会被释放。预留和释放就只是改变寄存器，不涉及额外计算、系统调用。所以效率很高。
*考虑调用栈的大小，避免栈溢出*，一单当前程序的调用栈超出了系统允许的最大栈空间，无法创建新的帧执行后续的函数，就会栈溢出，导致程序被系统终止，产生崩溃。
### 确定需要多大的帧
通过编译器，在编译优化代码的时候，一个函数就是一个最小的编译单元。在这个函数里，编译器得知道用到哪些寄存器、放哪些局部变量，都要在编译时确定。
*在编译时，一切无法确定大小或者大小可以改变的数据，都无法安全的放在栈上，最好放在堆上*

# 堆