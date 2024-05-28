import { defineComponent, h, PropType } from "vue"
import { DictionaryValue, FormValue } from "complex-data"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import EditView, { EditViewDefaultProps } from "./EditView"
import { AutoItemPayloadType } from "./components/AutoItem"
import { InfoAreaDefaultProps } from "./InfoArea"
import config from "../config"

type dataType = undefined | Record<PropertyKey, unknown>

export interface EditAreaDefaultProps extends EditViewDefaultProps {
  form?: FormValue
}
export type EditAreaProps = EditViewDefaultProps & InfoAreaDefaultProps & {
  form?: FormValue
}

export default defineComponent({
  name: 'EditArea',
  emits: {
    menu: (prop: string, payload: AutoItemPayloadType<true>)  => {
      return typeof prop === 'string'
    }
  },
  props: {
    dictionary: {
      type: Object as PropType<EditAreaProps['dictionary']>,
      required: true
    },
    type: {
      type: String,
      required: false
    },
    observe: {
      type: Boolean,
      required: false,
      default: () => {
        return config.edit.observe
      }
    },
    inline: {
      type: Boolean,
      required: false,
      default: () => {
        return config.edit.inline
      }
    },
    form: {
      type: Object as PropType<EditAreaProps['form']>,
      required: false
    },
    formProps: { // form-model-view设置项
      type: Object as PropType<EditAreaProps['formProps']>,
      required: false
    },
    menu: {
      type: Object as PropType<EditAreaProps['menu']>,
      required: false
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String as PropType<EditAreaProps['labelAlign']>,
      required: false
    },
    gridParse: {
      type: Object as PropType<EditAreaProps['gridParse']>,
      required: false
    },
    gridRowProps: { // form-model-view设置项
      type: Object as PropType<EditAreaProps['gridRowProps']>,
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
      localForm: new FormValue(),
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
      this.dictionaryList = this.dictionary.getList(this.currentType) 
      const list = this.dictionary.buildObserveList(this.currentType, this.dictionaryList as DictionaryValue[])
      this.dictionary.createEditData(this.dictionaryList as DictionaryValue[], this.currentType, this.data).then(res => {
        this.currentForm.setData(res.data)
        // data生成完成后再进行list赋值，避免list提前赋值导致的EditView提前加载导致的数据为空的加载
        this.list = list
        if (this.observe) {
          this.list!.startObserve(this.currentForm.getData(), this.currentType)
        }
      })
    },
    submit(): Promise<{ targetData: Record<PropertyKey, unknown>, originData: dataType, type: string }> {
      return new Promise((resolve, reject) => {
        this.currentForm.validate().then(() => {
          const postData = this.dictionary.createPostData(this.currentForm.getData(), this.dictionaryList as DictionaryValue[], this.currentType, this.observe ?( this.list as ObserveList) : undefined)
          resolve({ targetData: postData, originData: this.data, type: this.currentType })
        }).catch(err => {
          reject(err)
        })
      })
    },
    renderEdit() {
      if (this.list) {
        const form = h(EditView, {
          form: this.currentForm!,
          list: this.list as ObserveList,
          menu: this.menu,
          type: this.currentType,
          labelAlign: this.labelAlign!,
          gridParse: this.inline ? undefined : (this.gridParse || this.dictionary.$layout.grid.getValue(this.currentType)),
          gridRowProps: this.gridRowProps!,
          formProps: this.formProps,
          disabled: this.disabled,
          loading: this.loading,
          onMenu: (prop: string, payload: AutoItemPayloadType<true>) => {
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
    return h('div', { class: 'complex-edit-area' }, [this.renderEdit()])
  }
})
