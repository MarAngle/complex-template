import { defineComponent, h, PropType } from "vue"
import { FormLayout, FormProps } from "ant-design-vue/es/form/Form"
import { FormLabelAlign } from "ant-design-vue/es/form/interface"
import { DictionaryData, DictionaryValue } from "complex-data"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import DefaultEditButtonGroup, { DefaultEditButtonGroupInitOption } from "complex-data/src/dictionary/DefaultEditButtonGroup"
import AntdFormValue from "./class/AntdFormValue"
import FormView from "./FormView"
import { FormItemPayloadType } from "./components/AutoFormItem"

type dataType = undefined | Record<PropertyKey, unknown>

export default defineComponent({
  name: 'EditView',
  props: {
    dictionary: {
      type: Object as PropType<DictionaryData>,
      required: true
    },
    type: {
      type: String,
      required: false
    },
    menu: {
      type: Object as PropType<DefaultEditButtonGroup | DefaultEditButtonGroupInitOption>,
      required: false
    },
    observe: {
      type: Boolean,
      required: false,
      default: true
    },
    form: {
      type: Object as PropType<AntdFormValue>,
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
  data() {
    return {
      localType: undefined as undefined | string,
      localForm: new AntdFormValue(),
      data: undefined as dataType,
      dictionaryList: [] as DictionaryValue[],
      list: undefined as undefined | ObserveList,
    }
  },
  computed: {
    currentType() {
      return (this.localType || this.type) as string
    },
    currentForm() {
      return this.form || this.localForm
    }
  },
  mounted() {
    if (this.type) {
      this.show()
    }
  },
  methods: {
    show(type?: string, data?: dataType) {
      this.localType = type
      this.data = data || undefined
      this.init()
      this.$nextTick(() => {
        this.currentForm.clearValidate()
      })
    },
    init() {
      this.dictionaryList = this.dictionary.$getList(this.currentType) 
      this.list = this.dictionary.$buildObserveList(this.currentType, this.dictionaryList as DictionaryValue[])
      this.dictionary.$createEditData(this.dictionaryList as DictionaryValue[], this.currentType, this.data).then(res => {
        this.currentForm.setData(res.data)
        if (this.observe) {
          this.list!.setForm(this.currentForm.getData(), this.currentType)
        }
      })
    },
    submit(): Promise<{ targetData: Record<PropertyKey, unknown>, originData: dataType, type: string }> {
      return new Promise((resolve, reject) => {
        this.currentForm.validate().then(() => {
          const postData = this.dictionary.$createPostData(this.currentForm.getData(), this.dictionaryList as DictionaryValue[], this.currentType)
          resolve({ targetData: postData, originData: this.data, type: this.currentType })
        }).catch(err => {
          reject(err)
        })
      })
    },
    renderForm() {
      if (this.list) {
        const form = h(FormView, {
          form: this.currentForm!,
          list: this.list as ObserveList,
          menu: this.menu,
          type: this.currentType,
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
      } else {
        return null
      }
    }
  },
  render() {
    return h('div', { class: 'complex-edit' }, [this.renderForm()])
  }
})
