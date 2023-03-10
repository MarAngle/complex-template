import { defineComponent, h, PropType, Slot } from "vue"
import { mergeData } from "complex-utils"
import { PageList } from "complex-data"
import { editType } from "../implement"

type FormType = {
  ref: any,
  data: Record<string, any>
}

export default defineComponent({
  name: 'FormItem',
  props: {
    data: {
      type: Object as PropType<editType>,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    list: {
      type: Object as PropType<PageList>,
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
      if (slot && (this.data.edit.$slot.type == 'auto' || this.data.edit.$slot.type == 'data')) {
        typeItem = slot({
          ...this.payload
        })
      } else {
        typeItem = this.renderItem(slot)
      }
      if (this.data.edit.$tips.data) {
        return h('a-tooltip', {
          title: this.data.edit.$tips.data,
          placement: this.data.edit.$tips.location,
          ...this.data.edit.$tips.localOption }, [ typeItem ])
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
      if (slot && this.data.edit.$slot.type == 'model') {
        item = slot({
          ...this.payload,
          option: itemOtion
        })
      } else if (this.data.edit.type == 'input') {
        tag = 'a-input'
      } else if (this.data.edit.type == 'inputNumber') {
        tag = 'a-input-number'
      } else if (this.data.edit.type == 'textArea') {
        tag = 'a-textarea'
      } else if (this.data.edit.type == 'switch') {
        tag = 'a-switch'
      } else if (this.data.edit.type == 'select') {
        tag = 'a-select'
        // 设置字典
        const dict = {
          key: this.data.edit.$option.optionValue || 'value',
          value: this.data.edit.$option.optionValue || 'value',
          label: this.data.edit.$option.optionLabel || 'label',
          disabled: this.data.edit.$option.optionDisabled || 'disabled'
        }
        children = this.data.edit.$option.list.map((itemData: Record<string, any>) => {
          let optionProps = {
            key: itemData[dict.key],
            value: itemData[dict.value],
            disabled: itemData[dict.disabled] || false
          }
          optionProps = mergeData(optionProps, this.data.edit.$localOption.option)
          return h('a-select-option', optionProps, [ itemData[dict.label] ])
        })
      } else if (this.data.edit.type == 'cascader') {
        tag = 'a-cascader'
      } else if (this.data.edit.type == 'date') {
        tag = 'a-date-picker'
      } else if (this.data.edit.type == 'dateRange') {
        tag = 'a-range-picker'
      } else if (this.data.edit.type == 'file') {
        // tag = UploadFile
      } else if (this.data.edit.type == 'button') {
        tag = 'a-button'
        children = [ this.data.edit.$option.name.getData(this.type) ]
      } else if (this.data.edit.type == 'customize') {
        tag = this.data.edit.$customize as string
      } else if (this.data.edit.type == 'slot') {
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
    const slot = this.target.$scopedSlots[this.data.edit.$slot.name] || this.data.edit.$slot.render
    if (this.data.edit.$slot.type != 'main') {
      let mainOption = {
        prop: this.data.prop,
        label: this.data.label,
        colon: this.data.edit.colon,
        rules: this.data.edit.$rules.getData(this.payload.type)
      }
      mainOption = mergeData(mainOption, this.data.edit.$localOption.main)
      // 获取tips插槽
      render = h('a-form-model-item', mainOption, [ this.renderTip(slot) ])
    } else if (slot) {
      // 主要模式下替换
      render = slot({
        ...this.payload
      })
    } else {
      console.error(`${this.data.edit.$prop}/${this.data.edit.$name}需要设置插槽!`)
    }
    return render
  }
})
