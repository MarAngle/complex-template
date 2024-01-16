import { defineComponent, h, PropType, VNode } from "vue"
import { FormItem, Tooltip, Input, InputNumber, Textarea, Switch, Select, Divider, Cascader, DatePicker, RangePicker } from "ant-design-vue"
import { camelToLine } from "complex-utils"
import { AttrsValue } from "complex-data"
import { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import AntdFormValue from "./../class/AntdFormValue"
import ButtonView from "../ButtonView"
import { bindButtonClick, parseEditAttrs } from "../../format"
import config from "../../config"
import FormView from "../FormView"
import ImportView from "../ImportView"
import PaginationView from "./PaginationView"

export interface FormItemPayloadType {
  prop: string
  type: string
  data: DictionaryEditMod
  index: number
  form: AntdFormValue
  targetData: Record<PropertyKey, unknown>
  list: ObserveList
  target: InstanceType<typeof FormView>
  disabled?: boolean
  loading?: boolean
}

export interface BaseFormItemProps {
  data: DictionaryEditMod
  index: number
  form: AntdFormValue
  list: ObserveList
  type: string
  target: InstanceType<typeof FormView>
  disabled?: boolean
  loading?: boolean
}

export default defineComponent({
  name: 'BaseFormItem',
  props: {
    data: {
      type: Object as PropType<BaseFormItemProps['data']>,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    list: {
      type: Object as PropType<BaseFormItemProps['list']>,
      required: true
    },
    form: { // form数据{ data, num }
      type: Object as PropType<BaseFormItemProps['form']>,
      required: true
    },
    type: { // formType
      type: String,
      required: true
    },
    target: { // FormView实例
      type: Object as PropType<BaseFormItemProps['target']>,
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
      let children: any = undefined
      const itemAttrs = parseEditAttrs(this.data, this.payload)!
      itemAttrs.pushClass('complex-form-item-type')
      itemAttrs.pushClass('complex-form-item-' + camelToLine(this.data.type))
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
        const $data = this.data
        children = {}
        const dropdownRender = config.component.parseData(this.data.$renders, 'dropdown')
        const optionRender = config.component.parseData(this.data.$renders, 'option')
        const tagRender = config.component.parseData(this.data.$renders, 'tag')
        if (dropdownRender) {
          children.dropdownRender = dropdownRender
        } else {
          const dropdownTopRender = config.component.parseData(this.data.$renders, 'dropdownTop')
          const dropdownBottomRender = config.component.parseData(this.data.$renders, 'dropdownBottom')
          if (dropdownTopRender || $data.$pagination || dropdownBottomRender) {
            children.dropdownRender = (payload: { menuNode: VNode }) => {
              const vNodes = [payload.menuNode]
              if (dropdownTopRender) {
                vNodes.unshift(dropdownTopRender({
                  payload: this.payload
                }) as VNode)
                vNodes.unshift(h(Divider, {
                  style: {
                    margin: '4px 0'
                  }
                }))
              }
              if (dropdownBottomRender) {
                vNodes.push(h(Divider, {
                  style: {
                    margin: '4px 0'
                  }
                }))
                vNodes.push(dropdownBottomRender({
                  payload: this.payload
                }) as VNode)
              }
              if ($data.$pagination) {
                vNodes.push(h(Divider, {
                  style: {
                    margin: '4px 0'
                  }
                }))
                vNodes.push(h(PaginationView, {
                  pagination: $data.$pagination,
                  simple: true,
                  onPage() {
                    $data.loadData(true).then(() => { /* */}, () => { /* */})
                  },
                  onSize() {
                    $data.loadData(true).then(() => { /* */}, () => { /* */})
                  }
                }))
                const dropdownPaginationBottomRender = config.component.parseData(this.data.$renders, 'dropdownPaginationBottom')
                if (dropdownPaginationBottomRender) {
                  vNodes.push(h(Divider, {
                    style: {
                      margin: '4px 0'
                    }
                  }))
                  vNodes.push(dropdownPaginationBottomRender({
                    payload: this.payload
                  }) as VNode)
                }
              }
              return vNodes
            }
          }
        }
        if (optionRender) {
          children.option = optionRender
        }
        if (tagRender) {
          children.tagRender = tagRender
        }
      } else if (this.data.type === 'cascader') {
        tag = Cascader
      } else if (this.data.type === 'date') {
        tag = DatePicker
      } else if (this.data.type === 'dateRange') {
        tag = RangePicker
      } else if (this.data.type === 'file') {
        tag = ImportView
      } else if (this.data.type === 'button') {
        tag = ButtonView
      } else if (this.data.type === 'buttonGroup') {
        tag = 'div'
        const $data = this.data
        children = {
          default: () => {
            $data.$list.map((buttonOption, index) => {
            const interval = (index !== $data.$list.length - 1) ? $data.interval : undefined
            const option = {
              ...buttonOption
            }
            if (this.loading) {
              option.loading = true
            } else if (option.loading && typeof option.loading === 'function') {
              option.loading = option.loading(this.payload)
            }
            if (this.disabled || this.data.disabled.getValue(this.type)) {
              option.disabled = true
            } else if (option.disabled && typeof option.disabled === 'function') {
              option.disabled = option.disabled(this.payload)
            }
            option.click = bindButtonClick(buttonOption.prop, buttonOption, this.payload)
            return h(ButtonView, {
              style: {
                marginRight: interval
              },
              data: option
            })
          })
          }
        }
      } else if (this.data.type === 'content') {
        tag = 'div'
        const $data = this.data
        children = {
          default: () => [$data.$option.data]
        }
      } else if (this.data.type === 'custom') {
        tag = this.data.$custom
      }
      if (tag) {
        // if (!children) {
        //   item = h(tag, config.component.parseAttrs(itemAttrs))
        // } else {
          item = h(tag, config.component.parseAttrs(itemAttrs), children)
        // }
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
