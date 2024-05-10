import { defineComponent, h, PropType, VNode } from "vue"
import { Input, InputNumber, Textarea, Switch, Select, Divider, Cascader, DatePicker, RangePicker, Button } from "ant-design-vue"
import { camelToLine } from "complex-utils"
import { parseEditAttrs } from "../../format"
import config from "../../config"
import ImportView from "../ImportView"
import PaginationView from "./PaginationView"
import { FormItemPayloadType } from "./AutoFormItem"

export default defineComponent({
  name: 'ModelFormItem',
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let tag: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let children: any = undefined
    const itemAttrs = parseEditAttrs(this.payload.data, this.payload)!
    itemAttrs.pushClass('complex-form-item-type')
    itemAttrs.pushClass('complex-form-item-' + camelToLine(this.payload.data.type))
    itemAttrs.merge(config.component.parseData(this.payload.data.$local, 'target'))
    let item = null
    if (!this.payload.target.gridParse) {
      const width = this.payload.data.$width
      if (width) {
        itemAttrs.style.width = width
      }
    }
    const targetRender = config.component.parseData(this.payload.data.$renders, 'target')
    const option = config.component.parseAttrs(itemAttrs)
    // 考虑一个默认的值，inline模式下和其他模式下的默认值，避免出现问题
    if (targetRender) {
      item = targetRender({
        ...this.payload,
        option: option
      })
    } else if (this.payload.data.type === 'input') {
      tag = Input
    } else if (this.payload.data.type === 'inputNumber') {
      tag = InputNumber
    } else if (this.payload.data.type === 'textArea') {
      tag = Textarea
    } else if (this.payload.data.type === 'switch') {
      tag = Switch
    } else if (this.payload.data.type === 'select') {
      tag = Select
      const $data = this.payload.data
      children = {}
      const dropdownRender = config.component.parseData(this.payload.data.$renders, 'dropdown')
      const optionRender = config.component.parseData(this.payload.data.$renders, 'option')
      const tagRender = config.component.parseData(this.payload.data.$renders, 'tag')
      if (dropdownRender) {
        children.dropdownRender = dropdownRender
      } else {
        const dropdownTopRender = config.component.parseData(this.payload.data.$renders, 'dropdownTop')
        const dropdownBottomRender = config.component.parseData(this.payload.data.$renders, 'dropdownBottom')
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
                  $data.$option.open = true
                  $data.loadData(true).then(() => {
                    $data.$option.open = undefined
                  }, () => {
                    $data.$option.open = undefined
                  })
                },
                onSize() {
                  $data.$option.open = true
                  $data.loadData(true).then(() => {
                    $data.$option.open = undefined
                  }, () => {
                    $data.$option.open = undefined
                  })
                },
                onClick(e: Event) {
                  e.preventDefault()
                }
              }))
              const dropdownPaginationBottomRender = config.component.parseData(this.payload.data.$renders, 'dropdownPaginationBottom')
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
    } else if (this.payload.data.type === 'cascader') {
      tag = Cascader
    } else if (this.payload.data.type === 'date') {
      tag = DatePicker
    } else if (this.payload.data.type === 'dateRange') {
      tag = RangePicker
    } else if (this.payload.data.type === 'file') {
      tag = ImportView
    } else if (this.payload.data.type === 'custom') {
      tag = this.payload.data.$custom
    }
    if (tag) {
      item = h(tag, option, children)
    }
    return item
  }
})
