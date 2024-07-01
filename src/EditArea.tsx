import { defineComponent, h, PropType } from "vue"
import { DictionaryValue, FormValue } from "complex-data"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import EditView, { EditViewDefaultProps } from "./EditView"
import { AutoItemPayloadType } from "./dictionary/AutoItem"
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
    menu: (prop: string, _payload: AutoItemPayloadType<true>)  => {
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
      observeList: undefined as undefined | ObserveList,
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
  beforeUnmount() {
    if (this.observeList) {
      this.observeList.reset()
      this.observeList = undefined
    }
  },
  methods: {
    show(type?: string, data?: dataType) {
      this.localType = type
      this.data = data || undefined
      this.init()
    },
    init() {
      this.dictionaryList = this.dictionary.getList(this.currentType) 
      const observeList = this.dictionary.getObserveList(this.currentType, this.dictionaryList as DictionaryValue[], this.observe)
      this.dictionary.parseData(this.dictionaryList as DictionaryValue[], this.currentForm, this.currentType, this.data, '$edit').then(() => {
        // data生成完成后再进行list赋值，避免list提前赋值导致的EditView提前加载导致的数据为空的加载
        this.observeList = observeList
        if (this.observe) {
          this.observeList!.startObserve(this.currentForm.getData(), this.currentType)
        }
        this.$nextTick(() => {
          this.currentForm.clearValidate()
        })
      })
    },
    submit(): Promise<{ targetData: Record<PropertyKey, unknown>, originData: dataType, type: string }> {
      return new Promise((resolve, reject) => {
        this.currentForm.validate().then(() => {
          const postData = this.dictionary.collectData(this.currentForm.getData(), this.dictionaryList as DictionaryValue[], this.currentType, this.observe ? (this.observeList as ObserveList) : undefined)
          resolve({ targetData: postData, originData: this.data, type: this.currentType })
        }).catch(err => {
          reject(err)
        })
      })
    },
    renderEdit() {
      if (this.observeList) {
        const form = h(EditView, {
          form: this.currentForm!,
          list: this.observeList as ObserveList,
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
