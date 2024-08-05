import { Component } from "vue"
import { Data } from "complex-data"
import ModalView, { ModalViewProps } from "../../src/ModalView"

let id = 1

export interface FloatValueInitOption {
  type: string
  name: string
  modal: {
    props: ModalViewProps
  }
  component: {
    data: Component
    props?: Record<PropertyKey, unknown>
    show?: any[]
  }
}

export class FloatValue extends Data {
  static $formatConfig = { name: 'FloatValue', level: 80, recommend: true } // 不通过通用格式化函数格式化实例判断值
  id: number
  type: string
  name: string
  modal: {
    props: ModalViewProps
  }
  component: {
    data: Component
    props?: Record<PropertyKey, unknown>
    show?: any[]
  }
  show: boolean
  init: boolean
  constructor(initOption: FloatValueInitOption, show = true) {
    super()
    this.id = id++
    this.type = initOption.type
    this.name = initOption.name
    this.modal = initOption.modal
    this.component = initOption.component
    this.show = show
    this.init = false
  }
  destroy() {
    //
  }
}

class FloatData extends Data {
  static $formatConfig = { name: 'FloatData', level: 80, recommend: true } // 不通过通用格式化函数格式化实例判断值
  list: FloatValue[]
  constructor() {
    super()
    this.list = []
  }
  push(floatValueInitOption: FloatValueInitOption, show?: boolean) {
    const floatValue = new FloatValue(floatValueInitOption, show)
    this.list.push(floatValue)
    return floatValue
  }
  remove(floatValue: FloatValue) {
    const index = this.list.indexOf(floatValue)
    this.list.splice(index, 1)
    return index
  }
  replace(floatValue: FloatValue, floatValueInitOption?: Partial<FloatValueInitOption>, show?: boolean) {
    const index = this.list.indexOf(floatValue)
    this.list.splice(index, 1, new FloatValue({
      ...floatValue,
      ...floatValueInitOption
    }, show))
  }
}


export default FloatData
