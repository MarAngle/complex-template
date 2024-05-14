import { defineComponent, h, PropType } from "vue"
import { DictionaryData, DictionaryValue, FormValue } from "complex-data"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import InfoView, { InfoViewProps } from "./InfoView"
import { AutoItemPayloadType } from "./components/AutoItem"

type dataType = undefined | Record<PropertyKey, unknown>

export interface InfoAreaProps extends InfoViewProps {
  dictionary: DictionaryData
  observe?: boolean
  inline?: boolean
}

export default defineComponent({
  name: 'InfoArea',
  props: {
    dictionary: {
      type: Object as PropType<InfoAreaProps['dictionary']>,
      required: true
    },
    observe: {
      type: Boolean,
      required: false,
      default: false
    },
    inline: {
      type: Boolean,
      required: false
    },
    data: {
      type: Object as PropType<InfoAreaProps['data']>,
      required: true
    },
    list: {
      type: Object as PropType<InfoAreaProps['list']>,
      required: true
    },
    menu: {
      type: Object as PropType<InfoAreaProps['menu']>,
      required: false
    },
    type: {
      type: String,
      required: true
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String as PropType<InfoAreaProps['labelAlign']>,
      required: false,
      default: 'right'
    },
    gridParse: {
      type: Object as PropType<InfoAreaProps['gridParse']>,
      required: false
    },
    gridRowProps: { // gridRowProps设置项
      type: Object as PropType<InfoAreaProps['gridRowProps']>,
      required: false
    },
    infoAttrs: {
      type: Object as PropType<InfoAreaProps['infoAttrs']>,
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
  data() {
    return {
      localType: undefined as undefined | string,
      localData: undefined as dataType,
      dictionaryList: [] as DictionaryValue[],
      list: undefined as undefined | ObserveList,
    }
  },
  computed: {
    currentType() {
      return (this.localType || this.type) as string
    },
    currentData() {
      return this.localData || this.data
    },
  },
  mounted() {
    if (this.type) {
      this.show()
    }
  },
  methods: {
    show(type?: string, data?: dataType) {
      this.localType = type
      this.localData = data || undefined
      this.init()
    },
    init() {
      this.dictionaryList = this.dictionary.getList(this.currentType) 
      this.list = this.dictionary.buildObserveList(this.currentType, this.dictionaryList as DictionaryValue[])
    },
    renderInfo() {
      if (this.list) {
        const form = h(InfoView, {
          data: this.currentData,
          list: this.list as ObserveList,
          menu: this.menu,
          type: this.currentType,
          labelAlign: this.labelAlign,
          gridParse: this.inline ? undefined : (this.gridParse || this.dictionary.$layout.grid.getValue(this.currentType)),
          gridRowProps: this.gridRowProps!,
          infoAttrs: this.infoAttrs,
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
    return h('div', { class: 'complex-info-area' }, [this.renderInfo()])
  }
})
