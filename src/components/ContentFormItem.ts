import { defineComponent, h, PropType, VNode } from "vue"
import { ButtonValue } from "complex-data"
import ButtonEdit from "complex-data/src/dictionary/ButtonEdit"
import ButtonView from "../ButtonView"
import config from "../../config"
import { FormItemPayloadType } from "./AutoFormItem"

export const bindButtonClick = function(prop: string, option: ButtonEdit['$option'], payload: FormItemPayloadType) {
  if (!option.upload) {
    return function() {
      payload.target.$emit('menu', prop, payload)
      if(option.click) {
        return option.click(payload)
      }
    }
  } else {
    return option.click
  }
}

export default defineComponent({
  name: 'ContentFormItem',
  props: {
    payload: {
      type: Object as PropType<FormItemPayloadType>,
      required: true
    }
  },
  /**
   * 主要模板

   * @returns {VNode}
  */
  render() {
    const targetRender = config.component.parseData(this.payload.data.$renders, 'target')
    if (targetRender) {
      return targetRender({
        ...this.payload
      })
    } else if (this.payload.data.type === 'button') {
      const option = {
        ...this.payload.data.$option
      }
      if (!option.name) {
        option.name = this.payload.data.$name
      }
      if (!option.prop) {
        option.prop = this.payload.prop
      }
      if (this.payload.loading) {
        option.loading = true
      } else if (this.payload.data.$option.loading && typeof this.payload.data.$option.loading === 'function') {
        option.loading = this.payload.data.$option.loading(this.payload)
      }
      if (this.payload.disabled || this.payload.data.disabled) {
        option.disabled = true
      } else if (this.payload.data.$option.disabled && typeof this.payload.data.$option.disabled === 'function') {
        option.disabled = this.payload.data.$option.disabled(this.payload)
      }
      option.click = bindButtonClick(this.payload.data.$prop, this.payload.data.$option, this.payload)
      return h(ButtonView, {
        data: option as ButtonValue
      })
    } else if (this.payload.data.type === 'buttonGroup') {
      const $data = this.payload.data
      return h('div', {}, [
        $data.$list.map((buttonOption, index) => {
          const interval = (index !== $data.$list.length - 1) ? $data.interval : undefined
          const option = {
            ...buttonOption
          }
          if (this.payload.loading) {
            option.loading = true
          } else if (buttonOption.loading && typeof buttonOption.loading === 'function') {
            option.loading = buttonOption.loading(this.payload)
          }
          if (this.payload.disabled || this.payload.data.disabled) {
            option.disabled = true
          } else if (buttonOption.disabled && typeof buttonOption.disabled === 'function') {
            option.disabled = buttonOption.disabled(this.payload)
          }
          option.click = bindButtonClick(buttonOption.prop!, buttonOption, this.payload)
          return h(ButtonView, {
            style: {
              marginRight: interval
            },
            data: option
          })
        })
      ])
    } else if (this.payload.data.type === 'content') {
      const $data = this.payload.data
      h('div', {
        ...$data.$option.style
      }, [$data.$option.data])
    }
  }
})
