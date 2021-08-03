
/**
 * ehiter 两者挑选一个.类似于if else
 * 异常会让函数变得不纯，either函子可以用来做异常处理
 */
class Left {
    static of(value){
        return new Left(value)
    }
    constructor(value){
        this.value = value
    }
    map(fn){
        return this
    }
}

class Right {
    static of(value){
        return new Right(value)
    }
    constructor(value){
        this.value = value
    }
    map(fn){
        return Right.of(fn(this.value))
    }
}

function parseJSON(str){
    try {
        return Right.of(JSON.parse(str))
    }catch(error){
        // 用来储存错误的信息
        return Left.of({
            error: error.message
        })
    }
}