import { defineComponent, h, PropType } from "vue"
import { FormLayout, FormProps } from "ant-design-vue/es/form/Form"
import { FormLabelAlign } from "ant-design-vue/es/form/interface"
import { SearchData } from "complex-data"
import { DictionaryEditMod, DictionaryEditModInitOption } from "complex-data/src/lib/DictionaryValue"
import FormView from "./FormView"
import { FormItemPayloadType } from "./components/AutoFormItem"
import AntdFormValue from "./class/AntdFormValue"

export default defineComponent({
  name: 'SearchView',
  props: {
    search: {
      type: Object as PropType<SearchData>,
      required: true
    },
    menu: {
      type: Object as PropType<(DictionaryEditMod | DictionaryEditModInitOption)[]>,
      required: false
    },
    layout: { // 表单布局'horizontal'|'vertical'|'inline'
      type: String as PropType<FormLayout>,
      required: false
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String as PropType<FormLabelAlign>,
      required: false
    },
    layoutOption: { // layout != inline时的a-row的参数设置项
      type: Object,
      required: false
    },
    formOption: { // form-model-view设置项
      type: Object as PropType<FormProps>,
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
  },
  methods: {
    renderForm() {
      const form = h(FormView, {
        form: this.search.$search.form as AntdFormValue,
        list: this.search.$search.observe,
        type: this.search.$prop,
        menu: this.menu,
        layout: this.layout!,
        labelAlign: this.labelAlign!,
        layoutOption: this.layoutOption!,
        formOption: this.formOption,
        disabled: this.disabled,
        loading: this.loading,
        onMenu: (prop: string, payload: FormItemPayloadType) => {
          this.$emit('menu', prop, payload)
        }
      })
      return form
    }
  },
  render() {
    return h('div', { class: 'complex-search' }, [this.renderForm()])
  }
})
