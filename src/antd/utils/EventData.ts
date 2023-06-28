
class EventData {
  data: {
    [prop: string]: ((...args: any[]) => any)[]
  }
  on: {
    [prop: string]: (...args: any[]) => any
  }
  constructor () {
    this.data = {}
    this.on = {}
  }
  /**
   * 创建事件对象
   * @param {string} name 事件名称
   * @param {*} target Vue实例
   * @param {*} prop Vue emit prop
   * @param {*} list data[name]初始值
   */
  build(name: string, target: any, prop: string) {
    this.data[name] = [] as unknown as ((...args: any[]) => any)[]
    this.on[name] = (...args: any[]) => {
      target.$emit('event', prop, name, ...args)
      this.trigger(name, ...args)
      target.$emit('eventEnd', prop, name, ...args)
    }
  }
  /**
   * 添加事件
   * @param {string} name 事件名称
   * @param {*} target Vue实例
   * @param {*} prop Vue emit prop
   * @param {*} data 事件回调
   * @param {*} method 加入事件回调列表的方法
   */
  add(name: string, target: any, prop: string, data: false | ((...args: any[]) => any), method: 'push' | 'unshift' = 'push') {
    if (!this.data[name]) {
      this.build(name, target, prop)
    }
    if (data) {
      this.data[name][method](data)
    }
  }
  /**
   * 触发事件
   * @param {string} name 事件名称
   * @param  {...any} args 参数
   */
  trigger(name: string, ...args: any[]) {
    if (this.data[name]) {
      for (let n = 0; n < this.data[name].length; n++) {
        this.data[name][n](...args)
      }
    }
  }
  /**
   * 获取事件对象on{event}
   * @returns {object}
   */
  getData() {
    return this.on
  }
}

export default EventData
