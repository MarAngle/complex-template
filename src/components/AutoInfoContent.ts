import { defineComponent, h, PropType } from "vue"
import { AttrsValue, ButtonEdit, ButtonGroupEdit, ContentEdit } from "complex-data"
import { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import ButtonView from "../ButtonView"
import { AutoItemPayloadType } from "./AutoItem"
import config from "../../config"
import { ButtonEditOption } from "complex-data/src/dictionary/ButtonEdit"

export const bindButtonClick = function(prop: string, option: ButtonEdit['$option'], payload: AutoItemPayloadType<boolean>) {
  if (!option.upload) {
    return function() {
      payload.parent.$emit('menu', prop, payload)
      if(option.click) {
        return option.click(payload)
      }
    }
  } else {
    return option.click
  }
}

export default defineComponent({
  name: 'AutoInfoContent',
  props: {
    payload: {
      type: Object as PropType<AutoItemPayloadType<boolean>>,
      required: true
    }
  },
  /**
   * 主要模板

   * @returns {VNode}
  */
  render() {
    const targetRender = config.component.parseData(this.payload.target.$renders, 'target')
    if (targetRender) {
      return targetRender({
        ...this.payload
      })
    } else {
      const targetAttrs = config.component.parseData(this.payload.target.$local, 'target') || new AttrsValue()
      if (this.payload.target instanceof ButtonEdit) {
        const option = {
          ...this.payload.target.$option
        }
        if (!option.name) {
          option.name = this.payload.target.$name
        }
        if (!option.prop) {
          option.prop = this.payload.prop
        }
        if (this.payload.loading) {
          option.loading = true
        } else if (this.payload.target.$option.loading && typeof this.payload.target.$option.loading === 'function') {
          option.loading = this.payload.target.$option.loading(this.payload)
        }
        if (this.payload.disabled || this.payload.target.disabled) {
          option.disabled = true
        } else if (this.payload.target.$option.disabled && typeof this.payload.target.$option.disabled === 'function') {
          option.disabled = this.payload.target.$option.disabled(this.payload)
        }
        option.click = bindButtonClick(this.payload.target.$prop, this.payload.target.$option, this.payload)
        targetAttrs.props.data = option
        return h(ButtonView, config.component.parseAttrs(targetAttrs) as { data: ButtonEditOption })
      } else if (this.payload.target instanceof ButtonGroupEdit) {
        const $data = this.payload.target
        return h('div', config.component.parseAttrs(targetAttrs), [
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
            if (this.payload.disabled || (this.payload.target as DictionaryEditMod).disabled) {
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
      } else if (this.payload.target instanceof ContentEdit) {
        const $data = this.payload.target
        targetAttrs.pushStyle($data.$option.style)
        return h('div', config.component.parseAttrs(targetAttrs), [$data.$option.data])
      } else {
        // 额外则直接解析数据
        return h('div', config.component.parseAttrs(targetAttrs), [this.payload.target.parse ? this.payload.target.parse(this.payload.targetData, this.payload) : this.payload.targetData[this.payload.prop]])
      }
    }
  }
})
