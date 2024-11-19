import { VNode } from "vue"
import { Data } from "complex-data"
import { ModalViewProps, ModalViewSlotProps } from "../../src/ModalView"
import QuickFloatValue from "../QuickFloatValue"

let id = 1

export interface FloatValueInitOption {
  name: string
  modal: {
    props: ModalViewProps
  }
  render: (...args: any[]) => VNode
  onShow?: (content: any) => void
  onSubmit?: (content: any) => Promise<any>
}

export class FloatValue extends Data {
  static $formatConfig = { name: 'FloatValue', level: 80, recommend: true } // 不通过通用格式化函数格式化实例判断值
  id: number
  name: string
  ref?: InstanceType<typeof QuickFloatValue>
  modal: {
    props: ModalViewProps
  }
  render: (modalSlotProps: ModalViewSlotProps) => VNode
  onShow?: (content: any) => void
  onSubmit?: (content: any) => Promise<any>
  show: boolean
  init: boolean
  constructor(initOption: FloatValueInitOption, show = true) {
    super()
    this.id = id++
    this.name = initOption.name
    this.modal = initOption.modal
    this.render = initOption.render
    this.onShow = initOption.onShow
    this.onSubmit = initOption.onSubmit
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
