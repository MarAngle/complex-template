import { defineComponent, h, PropType, Slot } from "vue"
import { mergeData } from "complex-utils"
import { ObserveList, DefaultEdit } from "complex-data"

type FormType = {
  ref: any,
  data: Record<string, any>
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
      type: Object as PropType<FormType>,
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
      let typeItem = null
      // auto/data模式下替换内部数据，此时保存外部的tips
      if (slot && (this.data.$slot.type == 'auto' || this.data.$slot.type == 'data')) {
        typeItem = slot({
          ...this.payload
        })
      } else {
        typeItem = this.renderItem(slot)
      }
      if (this.data.$tips.data) {
        return h('a-tooltip', {
          title: this.data.$tips.data,
          placement: this.data.$tips.location,
          ...this.data.$tips.localOption }, [ typeItem ])
      } else {
        return typeItem
      }
    },
    renderItem(slot: undefined | Slot) {
      let tag: undefined | string
      const itemOtion = {}
      let children
      let item = null
      // 考虑一个默认的值，inline模式下和其他模式下的默认值，避免出现问题
      if (slot && this.data.$slot.type == 'model') {
        item = slot({
          ...this.payload,
          option: itemOtion
        })
      } else if (this.data.type == 'input') {
        tag = 'a-input'
      } else if (this.data.type == 'inputNumber') {
        tag = 'a-input-number'
      } else if (this.data.type == 'textArea') {
        tag = 'a-textarea'
      } else if (this.data.type == 'switch') {
        tag = 'a-switch'
      } else if (this.data.type == 'select') {
        tag = 'a-select'
        // 设置字典
        const dict = {
          key: this.data.$option.optionValue || 'value',
          value: this.data.$option.optionValue || 'value',
          label: this.data.$option.optionLabel || 'label',
          disabled: this.data.$option.optionDisabled || 'disabled'
        }
        children = this.data.$option.list.map((itemData: Record<string, any>) => {
          let optionProps = {
            key: itemData[dict.key],
            value: itemData[dict.value],
            disabled: itemData[dict.disabled] || false
          }
          optionProps = mergeData(optionProps, this.data.$localOption.option)
          return h('a-select-option', optionProps, [ itemData[dict.label] ])
        })
      } else if (this.data.type == 'cascader') {
        tag = 'a-cascader'
      } else if (this.data.type == 'date') {
        tag = 'a-date-picker'
      } else if (this.data.type == 'dateRange') {
        tag = 'a-range-picker'
      } else if (this.data.type == 'file') {
        // tag = UploadFile
      } else if (this.data.type == 'button') {
        tag = 'a-button'
        children = [ this.data.$option.name.getData(this.type) ]
      } else if (this.data.type == 'customize') {
        tag = this.data.$customize as string
      } else if (this.data.type == 'slot') {
        console.error(`${this.data.prop}未定义slot`)
      }
      if (tag) {
        item = h(tag, itemOtion, children)
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
    const slot = this.target.$scopedSlots[this.data.$slot.name] || this.data.$slot.render
    if (this.data.$slot.type != 'main') {
      const label = this.data.$getParent()!.$getInterface('label', this.type)
      let mainOption = {
        prop: this.data.prop,
        label: label,
        colon: this.data.colon,
        rules: this.data.$rules.getData(this.payload.type)
      }
      mainOption = mergeData(mainOption, this.data.$localOption.main)
      // 获取tips插槽
      render = h('a-form-model-item', mainOption, [ this.renderTip(slot) ])
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
