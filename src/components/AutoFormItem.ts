import { defineComponent, h, PropType, VNode } from "vue"
import { FormItem, Tooltip } from "ant-design-vue"
import { AttrsValue, FormValue } from "complex-data"
import { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import config from "../../config"
import FormView from "../FormView"
import ModelFormItem from "./ModelFormItem"
import ContentFormItem from "./ContentFormItem"

export interface FormItemPayloadType {
  prop: string
  type: string
  data: DictionaryEditMod
  index: number
  form: FormValue
  targetData: Record<PropertyKey, unknown>
  list: ObserveList
  target: InstanceType<typeof FormView>
  choice?: number
  disabled?: boolean
  loading?: boolean
}

export interface AutoFormItemProps {
  data: DictionaryEditMod
  index: number
  form: FormValue
  list: ObserveList
  type: string
  target: InstanceType<typeof FormView>
  choice?: number
  disabled?: boolean
  loading?: boolean
}

export default defineComponent({
  name: 'AutoFormItem',
  props: {
    data: {
      type: Object as PropType<AutoFormItemProps['data']>,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    list: {
      type: Object as PropType<AutoFormItemProps['list']>,
      required: true
    },
    form: { // form数据{ data, num }
      type: Object as PropType<AutoFormItemProps['form']>,
      required: true
    },
    type: { // formType
      type: String,
      required: true
    },
    target: { // FormView实例
      type: Object as PropType<AutoFormItemProps['target']>,
      required: true
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
        choice: this.choice,
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
      if (['button', 'buttonGroup', 'content'].indexOf(this.data.type) === -1) {
        return h(ModelFormItem, {
          payload: this.payload
        })
      } else {
        return h(ContentFormItem, {
          payload: this.payload
        })
      }
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
