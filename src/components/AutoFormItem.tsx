import { defineComponent, h, PropType, Slot } from "vue"
import { AttrsValue } from "complex-data"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import DefaultEdit from "complex-data/src/dictionary/DefaultEdit"
import { FormItem, Tooltip, Input, InputNumber, Textarea, Switch, Select, SelectOption, Cascader, DatePicker, RangePicker, Button } from "ant-design-vue"
import AntdFormValue from "./class/AntdFormValue"
import config from "../../config"

export interface FormItemPayloadType {
  prop: string
  type: string
  data: DefaultEdit
  index: number
  form: AntdFormValue
  list: ObserveList
  target: any
  disabled?: boolean
  loading?: boolean
}

export default defineComponent({
  name: 'AutoFormItem',
  props: {
    data: {
      type: Object as PropType<DefaultEdit>,
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
      let tag: any
      const itemAttributes = getAttributes(this.data.type, this.data, this.payload)
      itemAttributes.pushClass('complex-form-item-type')
      itemAttributes.pushClass('complex-form-item-' + this.data.type)
      let children: any
      let item = null
      if (this.payload.target.layout === 'inline') {
        if (this.data.$width) {
          itemAttributes.style.width = this.data.$width
        }
      }
      // 考虑一个默认的值，inline模式下和其他模式下的默认值，避免出现问题
      if (slot && this.data.$slot.type === 'model') {
        item = slot({
          ...this.payload,
          option: itemAttributes
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
        const dict = {
          key: (this.data.$option as DefaultEditOptionType<'select'>).optionValue || 'value',
          value: (this.data.$option as DefaultEditOptionType<'select'>).optionValue || 'value',
          label: (this.data.$option as DefaultEditOptionType<'select'>).optionLabel || 'label',
          disabled: (this.data.$option as DefaultEditOptionType<'select'>).optionDisabled || 'disabled'
        }
        children = (this.data.$option as DefaultEditOptionType<'select'>).list.map((itemData: Record<string, any>) => {
          const optionAttributes = new AttrsValue({
            props: {
              key: itemData[dict.key],
              value: itemData[dict.value],
              disabled: itemData[dict.disabled] || false
            }
          })
          mergeAttributes(optionAttributes, this.data.$local.child)
          return h(SelectOption, parseAttributes(optionAttributes), {
            default: () => itemData[dict.label]
          })
        })
      } else if (this.data.type === 'cascader') {
        tag = Cascader
      } else if (this.data.type === 'date') {
        tag = DatePicker
      } else if (this.data.type === 'dateRange') {
        tag = RangePicker
      } else if (this.data.type === 'file') {
        // tag = UploadFile
      } else if (this.data.type === 'button') {
        tag = Button
        const text = (this.data.$option as DefaultEditOptionType<'button'>).name || this.data.$getParent()!.$getInterface('label', this.type)
        children = text
      } else if (this.data.type === 'customize') {
        tag = this.data.$customize as any
      } else if (this.data.type === 'slot') {
        console.error(`${this.data.prop}未定义slot`)
      }
      if (tag) {
        if (!children) {
          item = h(tag, parseAttributes(itemAttributes))
        } else {
          item = h(tag, parseAttributes(itemAttributes), {
            default: () => children
          })
        }
      }
      return item
    }
  },
  /**
   * 主要模板
   * @param {*} h createElement
   * @returns {VNode}
   */
  render() {
    const parentRender = config.component.parseData(this.data.$renders, 'parent')
    if (!parentRender) {
      const label = this.data.$name.getValue(this.payload.type)
      const parentAttributes = new AttrsValue({
        class: ['complex-form-item'],
        props: {
          name: this.data.$prop,
          label: label,
          colon: this.data.colon,
          required: this.data.required.getValue(this.payload.type),
          rules: this.data.$rules.getValue(this.payload.type)
        }
      })
      if (this.payload.target.layout === 'horizontal') {
        parentAttributes.props.labelCol = config.parseGrid(this.data.$layout, 'label', this.type)
        parentAttributes.props.wrapperCol = config.parseGrid(this.data.$layout, 'content', this.type)
      } else if (this.payload.target.layout === 'inline') {
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
