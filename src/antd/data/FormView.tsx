import { defineComponent, h, PropType } from "vue"
import { ObserveList } from "complex-data"
import { Form } from 'ant-design-vue'
import config from '../config'
import { mergeData } from "complex-utils"

type FormType = {
  ref: any,
  data: Record<string, any>
}

export default defineComponent({
  name: 'ComplexFormViewJsx',
  data () {
    return {}
  },
  props: {
    form: {
      type: Object as PropType<FormType>,
      required: true
    },
    list: {
      type: Object as PropType<ObserveList>,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    layout: { // 表单布局	'horizontal'|'vertical'|'inline'
      type: String,
      required: false,
      default: 'horizontal'
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String,
      required: false,
      default: 'right'
    },
    layoutOption: { // layout != inline时的a-row的参数设置项
      type: Object,
      required: false,
      default: () => {
        return config.FormView.layoutOption
      }
    },
    formOption: { // form-model-view设置项
      type: Object,
      required: false,
      default: null
    },
  },
  computed: {
    currentFormOption() {
      // formOption格式化
      const defaultFormOption = {
        model: this.form.data,
        layout: this.layout,
        labelAlign: this.labelAlign
      }
      const currentFormOption = mergeData(defaultFormOption, this.formOption)
      currentFormOption.ref = 'form'
      return currentFormOption
    }
  },
  mounted () {
    //
  },
  methods: {
    renderForm() {
      // return h(Form, this.currentFormOption, this.renderRow())
    },
    // renderRow() {
      
    // }
  },
  /**
   * 主要模板
   * @param {*} h createElement
   * @returns {VNode}
   */
  render() {
    return this.renderForm()
  }
})
