"use strict"
var a = function () {}
a.b = 3
var c = new a();
a.prototype.b = 9;
var b = 7;
a();

console.log(a);
console.log(c);
console.log(c.b);

/**
 *
 *
 */
function a(){

}