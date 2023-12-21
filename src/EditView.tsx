import { defineComponent, h, PropType } from "vue"
import { FormLayout, FormProps } from "ant-design-vue/es/form/Form"
import { FormLabelAlign } from "ant-design-vue/es/form/interface"
import { DictionaryData } from "complex-data"
import DictionaryValue from "complex-data/src/dictionary/DictionaryValue"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import DefaultEditButtonGroup, { DefaultEditButtonGroupInitOption } from "complex-data/src/dictionary/DefaultEditButtonGroup"
import AntdFormValue from "./class/AntdFormValue"
import FormView from "./FormView"
import { FormItemPayloadType } from "./components/AutoFormItem"

type dataType = undefined | Record<PropertyKey, unknown>

export type submitNextType = (postData: Record<PropertyKey, unknown>, targetData: dataType, type: string) => unknown

export default defineComponent({
  name: 'EditView',
  props: {
    dictionary: {
      type: Object as PropType<DictionaryData>,
      required: true
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
      type: '',
      edit: '',
      localForm: new AntdFormValue(),
      data: undefined as dataType,
      dictionaryList: [] as DictionaryValue[],
      list: null as null | ObserveList,
    }
  },
  computed: {
    currentForm() {
      return this.form || this.localForm
    }
  },
  methods: {
    $show(type: string, edit: string, data?: dataType) {
      this.type = type
      this.edit = edit
      this.data = data || undefined
      this.init()
      this.$nextTick(() => {
        this.currentForm.clearValidate()
      })
    },
    init() {
      this.dictionaryList = this.dictionary.$getList(this.type) 
      this.list = this.dictionary.$buildObserveList(this.type, this.dictionaryList as DictionaryValue[])
      this.dictionary.$createFormData(this.dictionaryList as DictionaryValue[], this.type, this.data).then(res => {
        this.currentForm.setData(res.data)
        if (this.observe) {
          this.list!.setForm(this.currentForm.getData(), this.type)
        }
      })
    },
    submit(next: submitNextType) {
      this.currentForm.validate().then(() => {
        const postdata = this.dictionary.$createPostData(this.currentForm.getData(), this.dictionaryList as DictionaryValue[], this.type)
        next(postdata, this.data, this.type)
      })
    },
    renderForm() {
      if (this.list) {
        return h(FormView, {
          form: this.currentForm!,
          list: this.list as ObserveList,
          menu: this.menu,
          type: this.edit,
          layout: this.layout!,
          labelAlign: this.labelAlign!,
          layoutOption: this.layoutOption!,
          formOption: this.formOption,
          disabled: this.disabled,
          loading: this.loading,
          onMenu(prop: string, payload: FormItemPayloadType) {
            this.$emit('menu', prop, payload)
          }
        })
      }
    }
  },
  render() {
    return h('div', { class: 'complex-edit' }, {
      default: () => this.renderForm()
    })
  }
})
