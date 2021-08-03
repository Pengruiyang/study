/*
 * Filename: d:\code\study\md\loadsh\Monad.js
 * Path: d:\code\study\md\loadsh
 * Created Date: Monday, August 2nd 2021, 9:48:08 pm
 * Author: pry
 * 
 * 
 * Copyright (c) 2021 Your Company
 */
const fp = require('lodash/fp')

class Monad {
    static of(value){
        return new Monad(value)
    }
    constructor(value){
        this.value = value
    }

    map(fn){
        return fn(this.value)
    }
}