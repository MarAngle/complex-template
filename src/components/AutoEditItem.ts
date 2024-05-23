import { defineComponent, h, PropType, VNode } from "vue"
import { Input, InputNumber, Textarea, Switch, Select, Divider, Cascader, DatePicker, RangePicker } from "ant-design-vue"
import { camelToLine } from "complex-utils"
import { parseEditAttrs } from "../../format"
import config from "../../config"
import ImportView from "../ImportView"
import PaginationView from "./PaginationView"
import { AutoItemPayloadType } from "./AutoItem"

export default defineComponent({
  name: 'AutoEditItem',
  props: {
    payload: {
      type: Object as PropType<AutoItemPayloadType<true>>,
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
    const itemAttrs = parseEditAttrs(this.payload.target, this.payload)!
    itemAttrs.pushClass('complex-edit-item')
    itemAttrs.pushClass('complex-edit-item-' + camelToLine(this.payload.target.type, '-'))
    itemAttrs.merge(config.component.parseData(this.payload.target.$local, 'target'))
    let item = null
    if (!this.payload.parent.gridParse) {
      const width = this.payload.target.$width
      if (width) {
        itemAttrs.style.width = width
      }
    }
    const targetRender = config.component.parseData(this.payload.target.$renders, 'target')
    const option = config.component.parseAttrs(itemAttrs)
    // 考虑一个默认的值，inline模式下和其他模式下的默认值，避免出现问题
    if (targetRender) {
      item = targetRender({
        ...this.payload,
        option: option
      })
    } else if (this.payload.target.type === 'input') {
      tag = Input
    } else if (this.payload.target.type === 'inputNumber') {
      tag = InputNumber
    } else if (this.payload.target.type === 'textArea') {
      tag = Textarea
    } else if (this.payload.target.type === 'switch') {
      tag = Switch
    } else if (this.payload.target.type === 'select') {
      tag = Select
      const $data = this.payload.target
      children = {}
      const dropdownRender = config.component.parseData(this.payload.target.$renders, 'dropdown')
      const optionRender = config.component.parseData(this.payload.target.$renders, 'option')
      const tagRender = config.component.parseData(this.payload.target.$renders, 'tag')
      if (dropdownRender) {
        children.dropdownRender = dropdownRender
      } else {
        const dropdownTopRender = config.component.parseData(this.payload.target.$renders, 'dropdownTop')
        const dropdownBottomRender = config.component.parseData(this.payload.target.$renders, 'dropdownBottom')
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
              const dropdownPaginationBottomRender = config.component.parseData(this.payload.target.$renders, 'dropdownPaginationBottom')
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
    } else if (this.payload.target.type === 'cascader') {
      tag = Cascader
    } else if (this.payload.target.type === 'date') {
      tag = DatePicker
    } else if (this.payload.target.type === 'dateRange') {
      tag = RangePicker
    } else if (this.payload.target.type === 'file') {
      tag = ImportView
    } else if (this.payload.target.type === 'custom') {
      tag = this.payload.target.$custom
    }
    if (tag) {
      item = h(tag, option, children)
    }
    return item
  }
})
