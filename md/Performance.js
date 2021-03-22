// 将工具命名为 pMonitor，含义是 performance monitor。

const pMonitor = {};
// Navigation Timing 包括了从请求页面起，到页面完成加载为止，各个环节的时间明细。
// const navTimes = performance.getEntriesByType('navigation')
//getEntriesByType 是我们获取性能数据的一种方式
// const domComplete = navTimes.domComplete
pMonitor.getLoadTime = () => {
  //页面加载
  const [{ domComplete }] = performance.getEntriesByType('navigation');
  return domComplete;
};

//获取资源加载时间的关键字为 'resource',
const [{ startTime, responseEnd }] = performance.getEntriesByType('resource');
const loadTime = responseEnd - startTime;

//获取了所有超时的资源列表
const SEC = 1000;
const TIMEOUT = 10 * SEC;
const setTime = (limit = TIMEOUT) => time => time >= limit;
// 获取加载时间
const getLoadTime = ({ requestStart, responseEnd }) =>
  responseEnd - requestStart;
const getName = ({ name }) => name;
pMonitor.getTimeoutRes = (limit = TIMEOUT) => {
  const isTimeout = setTime(limit);
  const resourceTimes = performance.getEntriesByType('resource');
  return resourceTimes
    .filter(item => isTimeout(getLoadTime(item)))
    .map(getName);
};

// 上报数据
// 生成表单数据
const convert2FormData = (data = {}) =>
  Object.entries(data).reduce((last, [key, value]) => {
    if (Array.isArray(value)) {
      return value.reduce((lastResult, item) => {
        lastResult.append(`${key}[]`, item);
        return lastResult;
      }, last);
    }
    last.append(key, value);
    return last;
  }, new FormData());

// 拼接get时的url
const makeItStr = (data = {}) =>
  Object.entries(data)
    .map(([k, v]) => `${k}=${v}`)
    .join('&');

// 上报数据
pMonitor.log = (url,data={},type='POST') => {
  const method = type.toLowerCase()
  const urlToUse = method === 'get' ? `${url}?${makeItStr(data)}` : url
  const body = method === 'get' ? {} : { body: convert2FormData(data) }
  const option = {
    method,
    ...body
  }
  fetch(urlToUse, option).catch(e => console.log(e))
}

let config = {}
