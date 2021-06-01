//llist.js
//Node对象定义
function Node(element) {
  this.element = element
  this.next = null
}
//LList对象定义
function ListNode() {
  this.head = new Node('head')
  this.find = find
  this.insert = insert
  this.remove = remove
  this.findPrevious = findPrevious
  this.display = display
}

function find(item) {
  var currNode = this.head
  while (currNode.element != item) {
    currNode = currNode.next
  }
  return currNode
}

function insert(element, item) {
  var newNode = new Node(element)
  var current = this.find(item)
  newNode.next = current.next
  current.next = newNode
}

function findPrevious(item) {
  var current = this.head
  while (current.next.element != item && current.next != null) {
    current = current.next
  }
  return current
}

function remove(item) {
  var prevNode = this.findPrevious(item)
  if (prevNode.next != null) prevNode.next = prevNode.next.next
}

function display() {
  var str = ''
  var current = this.head
  while (current.next != null) {
    str += current.next.element + '\n'
    current = current.next
  }
  return str
}

function ListNode(num) {
  var head = new Node(1)
  var p = head
  for (var i = 2; i < num; i++) {
    var temp = new Node(i)
    p.next = temp
    p = temp
  }
  p.next = head
  return head
}
var cirLinkList = new ListNode(41)
function getList(){
  var current = cirLinkList
  var str = ""
  while(current.next.element != current.element){
    var temp
    for(var i = 1; i < 3;i++){
      temp = current
      current = current.next
    }
    // 删除节点的本质就是跳过这一个节点去和后面节点连接
    temp.next = current.next
    str += current.element + " "
    current = temp.next
  }
  str += current.element
  console.log(str);
}
getList()