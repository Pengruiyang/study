/*
 * 可读流,为 I/O 源提供灵活的 API
 * @Author: pengruiyang
 * @Date: 2020-08-28 16:36:38
 * @Last Modified by: pengruiyang
 * @Last Modified time: 2020-08-28 16:55:13
 */

const stream = require('stream');
const fs = require('fs');
const util = require('util');
class JSONLineReader extends stream.Readable {
  constructor(source) {
    super();
    this._source = source;
    this._foundLineEnd = false;
    this._buffer = '';
    source.on('readable', () => {
      this.read();
    });
  }

  // 所有定制 stream.Readable 类都需要实现 _read 方法
  _read(size) {
    let chunk, line, result;
    if (this._buffer.length === 0) {
      chunk = this._source.read();
      this._buffer += chunk;
    }
    const lineIndex = this._buffer.indexOf('\n');
    if (lineIndex !== -1) {
      // 从 buffer 开始截取第一行来获得文本进行解析
      line = this._buffer.slice(0, lineIndex);
      if (line) {
        result = JSON.parse(line);
        this._buffer = this._buffer.slice(lineIndex + 1);
        // 当第一个 JSON 记录解析出来的时候,触发一个 Object 事件
        this.emit('object', result);
        // 将解析好的 JSON 发回内部队列
        this.push(util.inspect(result));
      } else {
        this._buffer = this._buffer.slice(1)
      }
    }
  }
}
const input = fs.createReadStream(`${__dirname}/json-lines.txt`,{
  encoding: 'utf8'
})
// 创建一个 JSONLineReader 实例，传递一个文件流给它处理
const jsonLineReader = new JSONLineReader(input)
jsonLineReader.on('object',obj => {
  console.log(`pos:${obj.position} - letter: ${obj.letter}`)
})
