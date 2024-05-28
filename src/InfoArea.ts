import { defineComponent, h, PropType } from "vue"
import { DictionaryData, DictionaryValue } from "complex-data"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import { AttrsValueInitOption } from "complex-data/src/lib/AttrsValue"
import InfoView, { InfoViewDefaultProps } from "./InfoView"
import { AutoItemPayloadType } from "./components/AutoItem"
import config from "../config"

export interface InfoAreaDefaultProps extends InfoViewDefaultProps {
  dictionary: DictionaryData
  type?: string
  observe?: boolean
  inline?: boolean
}

export interface InfoAreaProps extends InfoAreaDefaultProps {
  data?: Record<PropertyKey, any>
  infoAttrs?: AttrsValueInitOption
}

export default defineComponent({
  name: 'InfoArea',
  emits: {
    menu: (prop: string, payload: AutoItemPayloadType<false>)  => {
      return typeof prop === 'string'
    }
  },
  props: {
    dictionary: {
      type: Object as PropType<InfoAreaProps['dictionary']>,
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
        return config.info.observe
      }
    },
    inline: {
      type: Boolean,
      required: false,
      default: () => {
        return config.info.inline
      }
    },
    data: {
      type: Object as PropType<InfoAreaProps['data']>,
      required: false
    },
    infoAttrs: {
      type: Object as PropType<InfoAreaProps['infoAttrs']>,
      required: false
    },
    menu: {
      type: Object as PropType<InfoAreaProps['menu']>,
      required: false
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
      localData: undefined as undefined | Record<PropertyKey, any>,
      dictionaryList: [] as DictionaryValue[],
      list: undefined as undefined | ObserveList,
    }
  },
  computed: {
    currentType() {
      return this.localType || this.type
    },
    currentData() {
      return this.localData || this.data
    },
  },
  mounted() {
    if (this.currentType && this.currentData) {
      this.show()
    }
  },
  methods: {
    show(type?: string, data?: Record<PropertyKey, any>) {
      this.localType = type
      this.localData = data || undefined
      this.init()
    },
    init() {
      this.dictionaryList = this.dictionary.getList(this.currentType!) 
      this.list = this.dictionary.buildObserveList(this.currentType!, this.dictionaryList as DictionaryValue[])
      // 因为数据固定为currentData。list不需要后赋值
      if (this.observe) {
        this.list.startObserve(this.currentData!, this.currentType, false)
      }
    },
    renderInfo() {
      if (this.list) {
        const info = h(InfoView, {
          data: this.currentData!,
          list: this.list as ObserveList,
          menu: this.menu,
          type: this.currentType!,
          labelAlign: this.labelAlign,
          gridParse: this.inline ? undefined : (this.gridParse || this.dictionary.$layout.grid.getValue(this.currentType!)),
          gridRowProps: this.gridRowProps!,
          infoAttrs: this.infoAttrs,
          disabled: this.disabled,
          loading: this.loading,
          onMenu: (prop: string, payload: AutoItemPayloadType<false>) => {
            this.$emit('menu', prop, payload)
          }
        })
        return info
      } else {
        return null
      }
    }
  },
  render() {
    return h('div', { class: 'complex-info-area' }, [this.renderInfo()])
  }
})
