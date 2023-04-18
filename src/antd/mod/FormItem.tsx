import { defineComponent, h, PropType, Slot } from "vue"
import { ObserveList, DefaultEdit, AttributesData } from "complex-data-next"
import { ComplexFormData } from "../data/EditForm.vue"
// import FormView from "./../data/FormView"
import { getAttributes } from "../utils/format"
import { DefaultEditOptionType } from "complex-data-next/src/mod/DefaultEdit"
import { mergeAttributes, parseAttributes } from "../utils"
import { FormItem, Tooltip, Input, InputNumber, Textarea, Switch, Select, SelectOption, Cascader, DatePicker, RangePicker, Button } from "ant-design-vue"


export interface FormItemPayloadType {
  prop: string
  type: string
  data: DefaultEdit
  index: number
  form: ComplexFormData
  list: ObserveList
  target: any
}

export default defineComponent({
  name: 'FormItem',
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
      type: Object as PropType<ComplexFormData>,
      required: true
    },
    type: { // formType
      type: String,
      required: true
    },
    target: { // FormView实例
      type: Object,
      required: true
    }
  },
  computed: {
    payload() {
      return {
        prop: this.data.prop,
        type: this.type,
        data: this.data,
        index: this.index,
        form: this.form,
        list: this.list,
        target: this.target
      }
    }
  },
  methods: {
    renderTip(slot: undefined | Slot) {
      let typeItem: any = null
      // auto/data模式下替换内部数据，此时保存外部的tips
      if (slot && (this.data.$slot.type == 'auto' || this.data.$slot.type == 'data')) {
        typeItem = slot(this.payload)
      } else {
        typeItem = this.renderItem(slot)
      }
      if (this.data.tip.data) {
        return h(Tooltip, {
          title: this.data.tip.getData ? this.data.tip.getData(this.payload) : this.data.tip.data,
          placement: this.data.tip.location,
          ...this.data.tip.localOption
        }, {
          default: () => typeItem
        })
      } else {
        return typeItem
      }
    },
    renderItem(slot: undefined | Slot) {
      let tag: any
      const itemAttributes = getAttributes(this.data.type, this.data, this.payload)
      itemAttributes.class.push('complex-form-item-type')
      itemAttributes.class.push('complex-form-item-' + this.data.type)
      let children: any
      let item = null
      // 考虑一个默认的值，inline模式下和其他模式下的默认值，避免出现问题
      if (slot && this.data.$slot.type == 'model') {
        item = slot({
          ...this.payload,
          option: itemAttributes
        })
      } else if (this.data.type == 'input') {
        tag = Input
      } else if (this.data.type == 'inputNumber') {
        tag = InputNumber
      } else if (this.data.type == 'textArea') {
        tag = Textarea
      } else if (this.data.type == 'switch') {
        tag = Switch
      } else if (this.data.type == 'select') {
        tag = Select
        // 设置字典
        const dict = {
          key: (this.data.$option as DefaultEditOptionType<'select'>).optionValue || 'value',
          value: (this.data.$option as DefaultEditOptionType<'select'>).optionValue || 'value',
          label: (this.data.$option as DefaultEditOptionType<'select'>).optionLabel || 'label',
          disabled: (this.data.$option as DefaultEditOptionType<'select'>).optionDisabled || 'disabled'
        }
        children = (this.data.$option as DefaultEditOptionType<'select'>).list.map((itemData: Record<string, any>) => {
          const optionAttributes = new AttributesData({
            props: {
              key: itemData[dict.key],
              value: itemData[dict.value],
              disabled: itemData[dict.disabled] || false
            }
          })
          mergeAttributes(optionAttributes, this.data.$local.child)
          // return h(SelectOption, parseAttributes(optionAttributes), [ itemData[dict.label] ])
          return h(SelectOption, parseAttributes(optionAttributes), {
            default: () => itemData[dict.label]
          })
        })
      } else if (this.data.type == 'cascader') {
        tag = Cascader
      } else if (this.data.type == 'date') {
        tag = DatePicker
      } else if (this.data.type == 'dateRange') {
        tag = RangePicker
      } else if (this.data.type == 'file') {
        // tag = UploadFile
      } else if (this.data.type == 'button') {
        tag = Button
        const text = (this.data.$option as DefaultEditOptionType<'button'>).name || this.data.$getParent()!.$getInterface('label', this.type)
        children = text
      } else if (this.data.type == 'customize') {
        tag = this.data.$customize as any
      } else if (this.data.type == 'slot') {
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
    let render = null
    // 获取主要插槽，存在插槽会根据type在指定位置替换
    const slot = this.target.$slots[this.data.$slot.name] || this.data.$slot.render
    if (this.data.$slot.type != 'main') {
      const ditem = this.data.$getParent()!
      const label = ditem.$getInterface('label', this.type)
      const mainAttributes = new AttributesData({
        props: {
          name: this.data.prop,
          label: label,
          colon: this.data.colon,
          required: this.data.required.getData(this.payload.type),
          rules: this.data.$rules.getData(this.payload.type)
        },
        class: ['complex-form-item']
      })
      if (this.payload.target.layout == 'horizontal') {
        const layout = ditem.$layout.getData(this.payload.type)
        mainAttributes.props.labelCol = layout.label
        mainAttributes.props.wrapperCol = layout.content
      }
      mergeAttributes(mainAttributes, this.data.$local.parent)
      render = h(FormItem, parseAttributes(mainAttributes), { default: () => this.renderTip(slot) })
    } else if (slot) {
      // 主要模式下替换
      render = slot({
        ...this.payload
      })
    } else {
      console.error(`${this.data.$prop}/${this.data.$name}需要设置插槽!`)
    }
    return render
  }
})
