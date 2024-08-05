import { Component, markRaw } from "vue"
import { Data } from "complex-data"
import { ModalViewProps } from "../../src/ModalView"
import QuickFloatValue from "../QuickFloatValue"

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
  ref?: InstanceType<typeof QuickFloatValue>
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
    this.component = {
      data: markRaw(initOption.component.data),
      props: initOption.component.props,
      show: initOption.component.show
    }
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
  close(floatValue: FloatValue, _from: string) {
    const index = this.list.indexOf(floatValue)
    floatValue.destroy()
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
