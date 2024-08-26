import { defineComponent, h, PropType } from "vue"
import { Col, FormItem, FormItemRest, Row, Tooltip } from "ant-design-vue"
import { AttrsValue, FormValue, DefaultInfo } from "complex-data"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import DefaultEdit from "complex-data/src/dictionary/DefaultEdit"
import GridParse from "complex-data/src/lib/GridParse"
import { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import EditView from "../EditView"
import InfoView from "../InfoView"
import ListEditArea from "../ListEditArea"
import AutoEditItem from "./AutoEditItem"
import AutoInfoItem from "./AutoInfoItem"
import config from "../../config"

export type AutoItemParser = 'info' | 'edit' | 'list'

export interface AutoItemPayloadType<P extends AutoItemParser = 'edit'> {
  prop: string
  type: string
  target: P extends 'edit' | 'list' ? DictionaryEditMod : DefaultInfo
  index: number
  list: ObserveList
  choice?: number
  disabled?: boolean
  loading?: boolean
  targetData: Record<PropertyKey, any>
  form: P extends 'edit' ? FormValue : undefined
  data: P extends 'info' | 'list' ? Record<PropertyKey, any> : undefined
  parent: P extends 'edit' ? InstanceType<typeof EditView> : P extends 'info' ? InstanceType<typeof InfoView> : InstanceType<typeof ListEditArea>
}

export interface AutoItemProps<P extends AutoItemParser = 'edit'> {
  parser: P
  target: P extends 'edit' | 'list' ? DictionaryEditMod : DefaultInfo
  index: number
  list: ObserveList
  type: string
  gridParse?: GridParse
  choice?: number
  collapse?: boolean
  disabled?: boolean
  loading?: boolean
  form: P extends 'edit' ? FormValue : undefined
  data: P extends 'info' | 'list' ? Record<PropertyKey, any> : undefined
  parent: P extends 'edit' ? InstanceType<typeof EditView> : P extends 'info' ? InstanceType<typeof InfoView> : InstanceType<typeof ListEditArea>
}

export default defineComponent({
  name: 'AutoItem',
  props: {
    parser: {
      type: String as PropType<AutoItemProps<AutoItemParser>['parser']>,
      required: true
    },
    target: {
      type: Object as PropType<AutoItemProps<AutoItemParser>['target']>,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    list: {
      type: Object as PropType<AutoItemProps<AutoItemParser>['list']>,
      required: true
    },
    type: { // formType
      type: String,
      required: true
    },
    gridParse: {
      type: Object as PropType<AutoItemProps<AutoItemParser>['gridParse']>,
      required: false
    },
    choice: {
      type: Number,
      required: false
    },
    collapse: {
      type: Boolean,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    },
    loading: {
      type: Boolean,
      required: false
    },
    form: {
      type: Object as PropType<AutoItemProps<AutoItemParser>['form']>,
      required: false
    },
    data: {
      type: Object as PropType<AutoItemProps<AutoItemParser>['data']>,
      required: false
    },
    parent: { // EditView实例
      type: Object as PropType<AutoItemProps<AutoItemParser>['parent']>,
      required: true
    }
  },
  computed: {
    payload() {
      return {
        prop: this.target.$prop,
        type: this.type,
        target: this.target,
        index: this.index,
        list: this.list,
        choice: this.choice,
        disabled: this.disabled,
        loading: this.loading,
        targetData: this.form ? this.form.data : this.data!,
        form: this.form,
        data: this.data,
        parent: this.parent,
      }
    },
    isEdit() {
      return this.parser === 'edit' && ['button', 'buttonGroup', 'content'].indexOf((this.target as DictionaryEditMod).type) === -1
    },
    isList() {
      return this.parser === 'list'
    }
  },
  methods: {
    renderTip() {
      const mainRender = config.component.parseData(this.target.$renders, 'main')
      const item = !mainRender ? this.renderContent() : mainRender(this.payload)
      if (this.target.$tip) {
        return h(Tooltip, {
          title: this.target.$tip.getData ? this.target.$tip.getData(this.payload) : this.target.$tip.data,
          placement: this.target.$tip.location,
          ...config.component.parseAttrs(this.target.$tip.$attrs)
        }, {
          default: () => item
        })
      } else {
        return item
      }
    },
    renderLabel() {
      if (!this.isList) {
        const labelAttrs = config.component.parseData(this.target.$local, 'label') || new AttrsValue()
        labelAttrs.pushClass('complex-auto-item-label')
        labelAttrs.pushClass(`complex-auto-item-${(this.parent as InstanceType<typeof EditView> | InstanceType<typeof InfoView>).labelAlign}-label`)
        if (this.target.colon && this.target.$name) {
          labelAttrs.pushClass('complex-auto-item-colon-label')
        }
        return h('div', config.component.parseAttrs(labelAttrs), {
          default: () => this.target.$name
        })
      } else {
        return null
      }
    },
    renderContent() {
      if (this.isEdit || this.isList) {
        return h(AutoEditItem, {
          payload: this.payload as AutoItemPayloadType<'edit' | 'list'>
        })
      } else {
        return h(AutoInfoItem, {
          payload: this.payload as AutoItemPayloadType<'info'>
        })
      }
    }
  },
  /**
   * 主要模板

   * @returns {VNode}
   */
  render() {
    if (config.parseCollapse(this.collapse, this.target.$collapse)) {
      const mainRender = config.component.parseData(this.target.$renders, 'main')
      if (!mainRender) {
        if (!this.isList) {
          if (this.isEdit) {
            // edit
            const mainAttributes = new AttrsValue({
              class: ['complex-auto-item'],
              props: {
                name: this.target.$prop,
                label: this.target.$name,
                colon: this.target.colon,
                required: (this.target as DictionaryEditMod).required,
                rules: this.target instanceof DefaultEdit ? this.target.getRuleList(this.payload.targetData) : undefined
              }
            })
            if (this.gridParse) {
              mainAttributes.props.labelCol = this.gridParse!.parseData(this.target.$grid, 'label', this.type)
              mainAttributes.props.wrapperCol = this.gridParse!.parseData(this.target.$grid, 'content', this.type)
            }
            mainAttributes.merge(config.component.parseData(this.target.$local, 'main'))
            return h(FormItem, config.component.parseAttrs(mainAttributes), { default: () => this.renderTip() })
          } else {
            // info
            const mainAttributes = new AttrsValue({
              class: ['complex-auto-item', 'complex-auto-item-info']
            })
            mainAttributes.merge(config.component.parseData(this.target.$local, 'main'))
            if (this.gridParse) {
              return h(Row, config.component.parseAttrs(mainAttributes), {
                default: () => [
                  h(Col, config.parseGrid((this.payload.parent as InstanceType<typeof EditView> | InstanceType<typeof InfoView>).gridParse!.parseData(this.payload.target.$grid, 'label', this.payload.type)), {
                    default: () => this.renderLabel()
                  }),
                  h(Col, config.parseGrid((this.payload.parent as InstanceType<typeof EditView> | InstanceType<typeof InfoView>).gridParse!.parseData(this.payload.target.$grid, 'content', this.payload.type)), {
                    default: () => this.renderTip()
                  })
                ]
              })
            } else {
              return h('div', config.component.parseAttrs(mainAttributes), {
                default: () => [
                  this.renderLabel(),
                  this.renderTip()
                ]
              })
            }
          }
        } else {
          // list
          const mainAttributes = new AttrsValue({
            class: ['complex-auto-item', 'complex-auto-item-list']
          })
          mainAttributes.merge(config.component.parseData(this.target.$local, 'main'))
          return h(FormItemRest, config.component.parseAttrs(mainAttributes), {
            default: () => [
              h(FormItemRest, {}, {
                default: () => [
                  this.renderTip()
                ]
              })
            ]
          })
        }
      } else {
        return mainRender(this.payload)
      }
    } else {
      return null
    }
  }
})
