const action = {
  'base': () => {
    obj.myShow = true
  },
  'onlinetcp': () =>{
    obj.onlinestatus = obj[item] == 3 ? '离线': '在线'
  },
  'stateModal': () =>{
    const modal = ['Modal1','Modal2','...']
    const index = obj[item]
    obj.modalType = modal[index]
  },
  'battery': ()=>{
    obj[item] += '%'
  },
  'calculatstate': () => {
    if(obj[item] > -1){
      const Arr = ['text1','text2','text3']
      obj.calculates = Arr[obj[item]]
    }
  },
  'fun': () => {

  }
}

const show = ['posx','posy','posh']
const isFun = ['lasttime','timerange']
// 统一处理方法
item = arr.includes(item) ? 'base':item
const isItem = isFun.includes(item) ? [isItem,item] = [item,'fun'] : ''
action[item]()
