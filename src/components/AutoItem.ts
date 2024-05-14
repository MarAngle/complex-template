import { defineComponent, h, PropType, VNode } from "vue"
import { FormItem, Row, Tooltip } from "ant-design-vue"
import { AttrsValue, FormValue, DefaultInfo } from "complex-data"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import DefaultEdit from "complex-data/src/dictionary/DefaultEdit"
import GridParse from "complex-data/src/lib/GridParse"
import { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import config from "../../config"
import EditView from "../EditView"
import InfoView from "../InfoView"
import AutoEditItem from "./AutoEditItem"
import AutoInfoItem from "./AutoInfoItem"

export interface AutoItemPayloadType<E = true> {
  prop: string
  type: string
  target: E extends true ? DictionaryEditMod : DefaultInfo
  index: number
  list: ObserveList
  choice?: number
  disabled?: boolean
  loading?: boolean
  targetData: Record<PropertyKey, any>
  form: E extends true ? FormValue : undefined
  data: E extends false ? Record<PropertyKey, any> : undefined
  parent: E extends true ? InstanceType<typeof EditView> : InstanceType<typeof InfoView>
}

export interface AutoItemProps<E = true> {
  edit: E
  target: E extends true ? DictionaryEditMod : DefaultInfo
  index: number
  list: ObserveList
  type: string
  gridParse?: GridParse
  choice?: number
  disabled?: boolean
  loading?: boolean
  form: E extends true ? FormValue : undefined
  data: E extends false ? Record<PropertyKey, any> : undefined
  parent: E extends true ? InstanceType<typeof EditView> : InstanceType<typeof InfoView>
}

export default defineComponent({
  name: 'AutoItem',
  props: {
    edit: {
      type: Boolean as PropType<AutoItemProps<boolean>['edit']>,
      required: true
    },
    target: {
      type: Object as PropType<AutoItemProps<boolean>['target']>,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    list: {
      type: Object as PropType<AutoItemProps<boolean>['list']>,
      required: true
    },
    type: { // formType
      type: String,
      required: true
    },
    gridParse: {
      type: Object as PropType<AutoItemProps<boolean>['gridParse']>,
      required: false
    },
    choice: {
      type: Number,
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
      type: Object as PropType<AutoItemProps<boolean>['form']>,
      required: false
    },
    data: {
      type: Object as PropType<AutoItemProps<boolean>['data']>,
      required: false
    },
    parent: { // EditView实例
      type: Object as PropType<AutoItemProps<boolean>['parent']>,
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
        targetData: this.edit ? this.form!.data : this.data!,
        form: this.form,
        data: this.data,
        parent: this.parent,
      }
    }
  },
  methods: {
    renderTip() {
      const mainRender = config.component.parseData(this.target.$renders, 'main')
      const item = !mainRender ? this.renderItem() : mainRender(this.payload)
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
      return h('div', {
        class: ['complex-auto-item-label', this.target.colon ? 'complex-auto-item-colon-label' : '', `complex-auto-item-${this.parent.labelAlign }-label`]
      }, {
        default: () => this.target.$name
      })
    },
    renderItem() {
      if (this.edit) {
        return h(AutoEditItem, {
          payload: this.payload as AutoItemPayloadType<true>
        })
      } else {
        return h(AutoInfoItem, {
          payload: this.payload as AutoItemPayloadType<false>
        })
      }
    }
  },
  /**
   * 主要模板

   * @returns {VNode}
   */
  render() {
    const parentRender = config.component.parseData(this.target.$renders, 'parent')
    if (!parentRender) {
      if (this.edit && ['button', 'buttonGroup', 'content'].indexOf((this.target as DictionaryEditMod).type) === -1) {
        const parentAttributes = new AttrsValue({
          class: ['complex-auto-item'],
          props: {
            name: this.target.$prop,
            label: this.target.$name,
            colon: this.target.colon,
            required: (this.target as DictionaryEditMod).required,
            rules: this.target instanceof DefaultEdit ? this.target.$rules : undefined
          }
        })
        if (this.gridParse) {
          parentAttributes.props.labelCol = this.gridParse!.parseData(this.target.$grid, 'label', this.type)
          parentAttributes.props.wrapperCol = this.gridParse!.parseData(this.target.$grid, 'content', this.type)
        }
        parentAttributes.merge(config.component.parseData(this.target.$local, 'parent'))
        return h(FormItem, config.component.parseAttrs(parentAttributes), { default: () => this.renderTip() })
      } else {
        const parentAttributes = new AttrsValue({
          class: ['complex-auto-item']
        })
        parentAttributes.merge(config.component.parseData(this.target.$local, 'parent'))
        if (this.gridParse) {
          return h(Row, config.component.parseAttrs(parentAttributes), { default: () => this.renderTip() })
        } else {
          return h('div', config.component.parseAttrs(parentAttributes), { default: () => this.renderTip() })
        }
      }
    } else {
      return parentRender(this.payload)
    }
  }
})
