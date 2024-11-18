import { defineComponent, h, PropType } from "vue"
import { getEnv } from "complex-utils"
import { DictionaryData, DictionaryValue, FormValue } from "complex-data"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import { AttrsValueInitOption } from "complex-data/src/lib/AttrsValue"
import InfoView, { InfoViewDefaultProps } from "./InfoView"
import { AutoItemPayloadType } from "./dictionary/AutoItem"
import config from "../config"

export interface InfoAreaDefaultProps extends InfoViewDefaultProps {
  dictionary: DictionaryData
  type?: string
  observe?: boolean
  inline?: boolean
  onInit?: (observeList: ObserveList, form: FormValue, type: string, editArea: any) => void
}

export interface InfoAreaProps extends InfoAreaDefaultProps {
  data?: Record<PropertyKey, any>
  infoAttrs?: AttrsValueInitOption
}

export interface InfoAreaOption extends InfoAreaProps {
  ref?: string
  onMenu?: (prop: string, payload: AutoItemPayloadType<'info'>) => unknown
}

export default defineComponent({
  name: 'InfoArea',
  emits: {
    menu: (prop: string, _payload: AutoItemPayloadType<'info'>)  => {
      return !!typeof prop
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
    onInit: {
      type: Function as PropType<InfoAreaProps['onInit']>,
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
      form: new FormValue(),
      dictionaryList: [] as DictionaryValue[],
      observeList: undefined as undefined | ObserveList,
    }
  },
  computed: {
    currentType() {
      return this.localType || this.type
    },
    currentData() {
      return this.localData || this.data
    }
  },
  mounted() {
    if (this.currentType && this.currentData) {
      this.$show()
    }
  },
  beforeUnmount() {
    if (this.observeList) {
      this.observeList.reset()
      this.observeList = undefined
    }
  },
  methods: {
    $show(type?: string, data?: Record<PropertyKey, any>) {
      this.localType = type
      this.localData = data || undefined
      this.init()
    },
    init() {
      this.dictionaryList = this.dictionary.getList(this.currentType!) 
      const observeList = this.dictionary.getObserveList(this.currentType!, this.dictionaryList as DictionaryValue[], this.observe)
      this.dictionary.parseData(this.dictionaryList as DictionaryValue[], this.form, this.currentType!, this.currentData, '$info').then(() => {
        // data生成完成后再进行list赋值，避免list提前赋值导致的EditView提前加载导致的数据为空的加载
        if (this.onInit) {
          this.onInit(observeList, this.form, this.currentType!, this)
        }
        this.observeList = observeList
        if (this.observe) {
          this.observeList!.startObserve(this.form.getData(), this.currentType)
        } else if (getEnv('real') === 'development') {
          // 开发环境下
          const list: string[] = []
          this.observeList.$map.forEach(item => {
            if (item.$observe) {
              list.push(item.$prop)
            }
          })
          if (list.length > 0) {
            console.error(`[${list.join('/')}]模块存在observe监控函数，当前observe未开启，请确认！`)
          }
        }
      })
    },
    renderInfo() {
      if (this.observeList) {
        const info = h(InfoView, {
          data: this.form.getData(),
          list: this.observeList as ObserveList,
          menu: this.menu,
          type: this.currentType!,
          labelAlign: this.labelAlign,
          gridParse: this.inline ? undefined : (this.gridParse || this.dictionary.$layout.grid.getValue(this.currentType!)),
          gridRowProps: this.gridRowProps!,
          infoAttrs: this.infoAttrs,
          collapse: this.dictionary.$collapse,
          disabled: this.disabled,
          loading: this.loading,
          onMenu: (prop: string, payload: AutoItemPayloadType<'info'>) => {
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
