import { Component } from "vue"
import { Data } from "complex-data"
import { ModalViewProps } from "../../src/ModalView"

let id = 1

export interface FloatValueInitOption<P extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>> {
  type: string
  name: string
  modalProps: ModalViewProps
  component: {
    data: Component
    show?: any[]
  }
  props?: P
}

export class FloatValue<P extends Record<PropertyKey, unknown> = Record<PropertyKey, unknown>> extends Data {
  id: number
  type: string
  name: string
  modalProps: ModalViewProps
  component: {
    data: Component
    show?: any[]
  }
  props?: P
  show: boolean
  init: boolean
  constructor(initOption: FloatValueInitOption<P>, show = true) {
    super()
    this.id = id++
    this.type = initOption.type
    this.name = initOption.name
    this.modalProps = initOption.modalProps
    this.props = initOption.props
    this.component = initOption.component
    this.show = show
    this.init = false
  }
  destroy() {
    //
  }
}

class FloatData extends Data {
  list: FloatValue[]
  constructor() {
    super()
    this.list = []
  }
  push(floatValueInitOption: FloatValueInitOption, show?: boolean) {
    this.list.push(new FloatValue(floatValueInitOption, show))
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
