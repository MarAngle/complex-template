import $func from 'complex-func';
import { PageList } from "complex-data";
import { h, defineComponent, PropType } from "vue";
import { editType } from "../implement";

export type payloadType = {
  prop: string;
  type: string;
  item: editType;
  index: number;
  form: Record<string, any>;
  list: PageList;
  target: Record<string, any>;
}

const typeFormat = {
  data: {
    base: {
      option: function(itemProps: Record<string, any>) {
        return itemProps
      }
    },
    $input: {
      option: function(itemProps: Record<string, any>, item: editType, payload: payloadType) {
        itemProps = {
          type: item.edit.$option.type,
          allowClear: !item.edit.$option.hideClear,
          maxLength: item.edit.$option.maxLength,
          disabled: item.edit.disabled.getData(payload.type),
          placeholder: item.edit.placeholder!.getData(payload.type)
        }
        itemProps = $func.mergeData(itemProps, item.edit.$localProps.item)
        return itemProps
      }
    }
  },
  getData(type: string) {
    const typeName = '$' + type
    if ((this.data as any)[typeName]) {
      return (this.data as any)[typeName]
    } else {
      return this.data.base
    }
  }
}

const className = 'complex-form-item'

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
    form: {
      type: Object,
      required: true
    },
    list: {
      type: Object as PropType<PageList>,
      required: true
    },
    layout: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    target: {
      type: Object,
      required: true
    }
  },
  computed: {
    currentProps() {
      let currentProps: Record<PropertyKey, any> = {
        prop: this.data.prop,
        label: this.data.label,
        colon: this.data.edit.colon,
        rules: this.data.edit.$rules.getData(this.type)
      }
      if (this.layout != 'inline' && this.data.layout.type == 'grid') {
        if ($func.getType(this.data.layout.label) == 'object') {
          currentProps.labelCol = this.data.layout.label
        } else {
          currentProps.labelCol = {
            span: this.data.layout.label
          }
        }
        if ($func.getType(this.data.layout.content) == 'object') {
          currentProps.wrapperCol = this.data.layout.content
        } else {
          currentProps.wrapperCol = {
            span: this.data.layout.content
          }
        }
      }
      currentProps = $func.mergeData(currentProps, this.data.edit.$localProps.main)
      return currentProps
    },
    payload() {
      return {
        prop: this.data.prop,
        type: this.type,
        item: this.data,
        index: this.index,
        form: this.form,
        list: this.list,
        target: this.target
      }
    }
  },
  methods: {
    renderMain() {
      let render = null
      const slot = this.target.$scopedSlots[this.data.edit.$slot.name] || this.data.edit.$slot.render
      if (this.data.edit.$slot.type != 'main') {
        let option: any = {
          class: [className],
          style: {}
        }
        if (this.data.edit.$option.multiple) {
          option.class.push(className + '-multiple')
        }
        // 布局
        if (this.layout != 'inline' && this.data.layout.type == 'grid') {
          if ($func.getType(this.data.layout.label) == 'object') {
            option.labelCol = this.data.layout.label
          } else {
            option.labelCol = {
              span: this.data.layout.label
            }
          }
          if ($func.getType(this.data.layout.content) == 'object') {
            option.wrapperCol = this.data.layout.content
          } else {
            option.wrapperCol = {
              span: this.data.layout.content
            }
          }
        }
        if (this.target.$scopedSlots[this.data.edit.$slot.label]) {
          // 存在label插槽则替换label
          option.label = this.target.$scopedSlots[this.data.edit.$slot.label](this.payload)
        }
        option = $func.mergeData(option, this.data.edit.$localProps.main)
        // 获取tips插槽
        render = h('a-form-model-item', option, [ this.renderTip(slot) ])


      } else if (slot) {
        // 主要模式下替换
        render = slot(this.payload)
      } else {
        console.error(`${this.data.prop}/${this.data.label}需要设置插槽!`)
      }
      return render
    },
    renderTip(slot: any) {
      let typeItem = null
      // auto/item模式下替换内部数据，此时保存外部的tips
      if (slot && (this.data.edit.$slot.type == 'auto' || this.data.edit.$slot.type == 'item')) {
        typeItem = slot(this.payload)
      } else {
        typeItem = this.renderItem(slot)
      }
      if (this.data.edit.$tips.data) {
        const tipProps = {
          title: this.data.edit.$tips.data,
          placement: this.data.edit.$tips.location,
          ...this.data.edit.$tips.localProps
        }
        return h('a-tooltip', tipProps, [ typeItem ])
      } else {
        return typeItem
      }
    },
    renderItem(slot: any) {
      let tag: undefined | string
      const itemProps = {}
      const typeFormatData = typeFormat.getData(this.data.edit.type)
      typeFormatData.option(itemProps, this.data, this.payload)
      let children
      let item = null
      // 考虑一个默认的值，inline模式下和其他模式下的默认值，避免出现问题
      if (slot && this.data.edit.$slot.type == 'model') {
        item = slot({
          ...this.payload,
          option: itemProps
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
          optionProps = $func.mergeData(optionProps, this.data.edit.$localProps.option)
          return h('a-select-option', optionProps, [ itemData[dict.label] ])
        })
        // if (this.data.edit.$module.pagination) {
        //   // 分页器相关设置
        //   let paginationOption = {
        //     props: {
        //       data: this.data.edit.$module.pagination,
        //       option: {
        //         props: {
        //           simple: true
        //         }
        //       },
        //       mainOption: {
        //         props: {}
        //       }
        //     },
        //     on: {
        //       change: function (...args) {
        //         this.data.edit.func.page(...args)
        //       }
        //     }
        //   }
        //   paginationOption = $func.mergeData(paginationOption, this.data.edit.localOption.pagination)
        //   let paginationAreaOption = config.FormView.select.paginationAreaOption
        //   paginationAreaOption = $func.mergeData(paginationAreaOption, this.data.edit.localOption.paginationArea)
        //   const className = utils.countClass(config.FormView.className, 'item', 'content', 'select', 'pagination')
        //   utils.addClass(paginationAreaOption, className)
        //   let pagination = h(PaginationView, paginationOption)
        //   itemProps.dropdownRender = (menuNode, props) => {
        //     return h('div', [
        //       h('div', [ menuNode ]),
        //       h('div', paginationAreaOption, [ pagination ])
        //     ])
        //   }
        // }
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
        item = h(tag, itemProps, children)
      }
      return item
    }
  },
  /**
   * 主要模板
   * @returns {VNode}
   */
  render() {
    return h('a-form-item', this.currentProps)
  }
})
