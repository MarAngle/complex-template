/**
 * 事件处理
 */
 class EventData {
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
  build(name, target, prop, list = []) {
    this.data[name] = list
    this.on[name] = (...args) => {
      target.$emit('event', prop, name, args)
      this.trigger(name, ...args)
      target.$emit('eventEnd', prop, name, args)
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
  add(name, target, prop, data, method = 'push') {
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
  trigger(name, ...args) {
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
