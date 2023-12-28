import { defineComponent, h, PropType } from "vue"
import { FormItem, Tooltip, Input, InputNumber, Textarea, Switch, Select, SelectOption, Cascader, DatePicker, RangePicker } from "ant-design-vue"
import { camelToUnderline } from "complex-utils"
import { AttrsValue } from "complex-data"
import { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import AntdFormValue from "./../class/AntdFormValue"
import ButtonView from "../ButtonView"
import { bindButtonClick, parseEditAttrs } from "../../format"
import config from "../../config"

export interface FormItemPayloadType {
  prop: string
  type: string
  data: DictionaryEditMod
  index: number
  form: AntdFormValue
  targetData: Record<PropertyKey, unknown>
  list: ObserveList
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  target: any
  disabled?: boolean
  loading?: boolean
}

export default defineComponent({
  name: 'AutoFormItem',
  props: {
    data: {
      type: Object as PropType<DictionaryEditMod>,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    list: {
      type: Object as PropType<ObserveList>,
      required: true
    },
    form: { // form数据{ data, num }
      type: Object as PropType<AntdFormValue>,
      required: true
    },
    type: { // formType
      type: String,
      required: true
    },
    target: { // FormView实例
      type: Object,
      required: true
    },
    disabled: {
      type: Boolean,
      required: false
    },
    loading: {
      type: Boolean,
      required: false
    }
  },
  computed: {
    payload() {
      return {
        prop: this.data.$prop,
        type: this.type,
        data: this.data,
        index: this.index,
        form: this.form,
        targetData: this.form.data,
        list: this.list,
        target: this.target,
        disabled: this.disabled,
        loading: this.loading
      }
    }
  },
  methods: {
    renderTip() {
      const mainRender = config.component.parseData(this.data.$renders, 'main')
      const item = !mainRender ? this.renderItem() : mainRender(this.payload)
      if (this.data.tip) {
        return h(Tooltip, {
          title: this.data.tip.getData ? this.data.tip.getData(this.payload) : this.data.tip.data,
          placement: this.data.tip.location,
          ...config.component.parseAttrs(this.data.tip.$attrs)
        }, {
          default: () => item
        })
      } else {
        return item
      }
    },
    renderItem() {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let tag: any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let children: any[] = []
      const itemAttrs = parseEditAttrs(this.data, this.payload)!
      itemAttrs.pushClass('complex-form-item-type')
      itemAttrs.pushClass('complex-form-item-' + camelToUnderline(this.data.type))
      itemAttrs.merge(config.component.parseData(this.data.$local, 'target'))
      let item = null
      if (this.target.layout === 'inline') {
        const width = config.parseWidth(this.data.$layout, 'target', this.type)
        if (width) {
          itemAttrs.style.width = width
        }
      }
      const targetRender = config.component.parseData(this.data.$renders, 'target')
      // 考虑一个默认的值，inline模式下和其他模式下的默认值，避免出现问题
      if (targetRender) {
        item = targetRender({
          ...this.payload,
          option: config.component.parseAttrs(itemAttrs)
        })
      } else if (this.data.type === 'input') {
        tag = Input
      } else if (this.data.type === 'inputNumber') {
        tag = InputNumber
      } else if (this.data.type === 'textArea') {
        tag = Textarea
      } else if (this.data.type === 'switch') {
        tag = Switch
      } else if (this.data.type === 'select') {
        tag = Select
        // 设置字典
        // const dict = {
        //   key: this.data.$option.optionValue || 'value',
        //   value: this.data.$option.optionValue || 'value',
        //   label: this.data.$option.optionLabel || 'label',
        //   disabled: this.data.$option.optionDisabled || 'disabled'
        // }
        // children = this.data.$option.list.map((optionItem: Record<string, unknown>) => {
        //   const optionAttrs = new AttrsValue({
        //     props: {
        //       key: optionItem[dict.key],
        //       value: optionItem[dict.value],
        //       disabled: !!optionItem[dict.disabled]
        //     }
        //   })
        //   optionAttrs.merge(config.component.parseData(this.data.$local, 'child'))
        //   return h(SelectOption, config.component.parseAttrs(optionAttrs), {
        //     default: () => {
        //       console.log(optionItem, dict)
        //       return optionItem[dict.label] + '123'
        //     }
        //   })
        // })
        // console.log(this.data.$option, children)
      } else if (this.data.type === 'cascader') {
        tag = Cascader
      } else if (this.data.type === 'date') {
        tag = DatePicker
      } else if (this.data.type === 'dateRange') {
        tag = RangePicker
      } else if (this.data.type === 'file') {
        // tag = UploadFile
      } else if (this.data.type === 'button') {
        tag = ButtonView
      } else if (this.data.type === 'buttonGroup') {
        tag = 'div'
        const $data = this.data
        children = $data.$list.map((buttonOption, index) => {
          const interval = (index !== $data.$list.length - 1) ? $data.interval : undefined
          if (buttonOption.render) {
            return buttonOption.render({
              ...this.payload,
              style: {
                marginRight: interval
              },
              onClick: () => {
                this.target.$emit('menu', $data.$prop, this.payload)
                if(buttonOption.click) {
                  buttonOption.click!(this.payload)
                }
              },
              option: buttonOption
            })
          } else {
            return h(ButtonView, {
              style: {
                marginRight: interval
              },
              data: {
                type: buttonOption.type,
                icon: buttonOption.icon,
                prop: buttonOption.prop,
                name: buttonOption.name || this.data.$name.getValue(this.type)!,
                loading: this.loading || buttonOption.loading,
                uploader: buttonOption.uploader,
                disabled: this.disabled || this.data.disabled.getValue(this.type) || buttonOption.disabled,
                click: bindButtonClick(this.data.$prop, buttonOption, this.payload)
              }
            })
          }
        })
      } else if (this.data.type === 'content') {
        tag = 'div'
        children = [this.data.$option.data]
      } else if (this.data.type === 'custom') {
        tag = this.data.$custom
      }
      if (tag) {
        if (children.length === 0) {
          item = h(tag, config.component.parseAttrs(itemAttrs))
        } else {
          item = h(tag, config.component.parseAttrs(itemAttrs), {
            default: () => children
          })
        }
      }
      return item
    }
  },
  /**
   * 主要模板

   * @returns {VNode}
   */
  render() {
    const parentRender = config.component.parseData(this.data.$renders, 'parent')
    if (!parentRender) {
      const label = this.data.$name.getValue(this.type)
      const parentAttributes = new AttrsValue({
        class: ['complex-form-item'],
        props: {
          name: this.data.$prop,
          label: label,
          colon: this.data.colon.getValue(this.type),
          required: this.data.required.getValue(this.type),
          rules: this.data.$rules.getValue(this.type)
        }
      })
      if (this.target.layout === 'horizontal') {
        parentAttributes.props.labelCol = config.parseGrid(this.data.$layout, 'label', this.type)
        parentAttributes.props.wrapperCol = config.parseGrid(this.data.$layout, 'content', this.type)
      } else if (this.target.layout === 'inline') {
        const mainWidth = config.parseWidth(this.data.$layout, 'main', this.type)
        if (mainWidth) {
          parentAttributes.style.width = mainWidth
        }
      }
      const attrs = config.component.parseData(this.data.$local, 'parent')
      parentAttributes.merge(attrs)
      return h(FormItem, config.component.parseAttrs(parentAttributes), { default: () => this.renderTip() })
    } else {
      return parentRender(this.payload)
    }
  }
})
