import { VNode } from "vue"
import { Data } from "complex-data"
import { MenuValue } from "complex-data/type"
import { ModalViewProps, ModalViewSlotProps } from "../../src/ModalView"
import QuickFloatValue from "../QuickFloatValue"

let id = 1

export interface FloatValueInitOption {
  label: {
    icon?: MenuValue['icon']
    value: string | (() => VNode)
  }
  modal: ModalViewProps
  content: {
    render: (ref: string, modalSlotProps: ModalViewSlotProps,...args: any[]) => VNode
    show?: {
      args: any[]
      trigger: (content: any, args: any[]) => void
    }
  }
}

export class FloatValue extends Data {
  static $formatConfig = { name: 'FloatValue', level: 80, recommend: true } // 不通过通用格式化函数格式化实例判断值
  id: number
  label: FloatValueInitOption['label']
  target?: InstanceType<typeof QuickFloatValue>
  modal: FloatValueInitOption['modal']
  content: FloatValueInitOption['content']
  show: boolean
  init: boolean
  constructor(initOption: FloatValueInitOption, show = true) {
    super()
    this.id = id++
    this.label = initOption.label
    this.modal = initOption.modal
    this.content = initOption.content
    this.show = show
    this.init = false
  }
  close() {
    this.show = false
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
    this.list.splice(index, 1)
    floatValue.close()
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
