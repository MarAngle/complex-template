import { defineComponent, h, PropType } from "vue"
import { AttrsValue, ButtonEdit, ButtonGroupEdit, ContentEdit } from "complex-data"
import DictionaryValue, { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import { ButtonEditOption } from "complex-data/src/dictionary/ButtonEdit"
import FormEdit from "complex-data/src/dictionary/FormEdit"
import ButtonView from "../ButtonView"
import { AutoItemPayloadType } from "./AutoItem"
import InfoView, { InfoViewProps } from "../InfoView"
import config from "../../config"

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
      } else if (this.payload.target instanceof FormEdit) {
        // 额外则直接解析数据
        targetAttrs.merge(new AttrsValue({
          props: {
            list: this.payload.target.$runtime.observeList as ObserveList,
            data: this.payload.target.$runtime.form!.getData(),
            type: this.payload.target.$runtime.type!,
            gridParse: this.payload.target.$option.gridParse === false ? undefined : (this.payload.target.$option.gridParse || this.payload.target.$runtime.gridParse),
            menu: this.payload.target.$option.menu,
            disabled: this.payload.disabled || this.payload.target.disabled
          } as InfoViewProps
        }))
        return h(InfoView, config.component.parseAttrs(targetAttrs) as unknown as InfoViewProps)
      } else {
        // 额外则直接解析数据
        let text = this.payload.targetData[this.payload.prop]
        const parent = this.payload.target.$getParent() as DictionaryValue
        if (parent && parent.parse) {
          text = parent.parse(text, this.payload)
        }
        return h('div', config.component.parseAttrs(targetAttrs), config.showValue(text))
      }
    }
  }
})
