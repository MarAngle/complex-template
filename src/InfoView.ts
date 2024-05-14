import { defineComponent, h, PropType } from "vue"
import { Col, Row, RowProps } from "ant-design-vue"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import DefaultInfo from "complex-data/src/dictionary/DefaultInfo"
import AttrsValue, { AttrsValueInitOption } from "complex-data/src/lib/AttrsValue"
import GridParse from "complex-data/src/lib/GridParse"
import AutoItem, { AutoItemProps } from "./components/AutoItem"
import config from "../config"

export interface InfoViewDefaultProps {
  menu?: DefaultInfo[]
  labelAlign?: 'middle' | 'right' | 'left'
  gridParse?: GridParse
  gridRowProps?: RowProps
  disabled?: boolean
  loading?: boolean
}

export interface InfoViewProps extends InfoViewDefaultProps {
  data: Record<PropertyKey, any>
  list: ObserveList
  type: string
  infoAttrs?: AttrsValueInitOption
}

export default defineComponent({
  name: 'InfoView',
  props: {
    data: {
      type: Object as PropType<InfoViewProps['data']>,
      required: true
    },
    list: {
      type: Object as PropType<InfoViewProps['list']>,
      required: true
    },
    menu: {
      type: Object as PropType<InfoViewProps['menu']>,
      required: false
    },
    type: {
      type: String,
      required: true
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String as PropType<InfoViewProps['labelAlign']>,
      required: false,
      default: 'right'
    },
    gridParse: {
      type: Object as PropType<InfoViewProps['gridParse']>,
      required: false
    },
    gridRowProps: { // gridRowProps设置项
      type: Object as PropType<InfoViewProps['gridRowProps']>,
      required: false
    },
    infoAttrs: {
      type: Object as PropType<InfoViewProps['infoAttrs']>,
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
    currentInfoAttrs() {
      const layoutClass = `complex-info-${this.gridParse ? 'grid' : 'inline'}`
      const currentInfoAttrs = new AttrsValue(this.infoAttrs)
      currentInfoAttrs.pushClass(layoutClass)
      return currentInfoAttrs
    },
    currentMenu() {
      if (this.menu) {
        return this.menu
      } else {
        return null
      }
    },
    currentList() {
      if (this.currentMenu && this.currentMenu.length > 0) {
        return this.list.data.concat(this.currentMenu)
      } else {
        return this.list.data
      }
    }
  },
  methods: {
    parseGrid(data: DefaultInfo) {
      return config.parseGrid(this.gridParse!.parseData(data.$grid, 'main', this.type))
    },
    getItemProps(data: DefaultInfo, index: number) {
      return {
        edit: false,
        target: data,
        index: index,
        list: this.list,
        type: this.type,
        gridParse: this.gridParse,
        disabled: this.disabled,
        loading: this.loading,
        data: this.data,
        form: undefined,
        parent: this
      } as AutoItemProps<false>
    },
    renderItem(item: DefaultInfo, index: number) {
      return h(AutoItem, this.getItemProps(item, index))
    },
    renderList() {
      if (!this.gridParse) {
        return this.currentList.map((item, index) => {
          return this.renderItem(item, index)
        })
      } else {
        return this.currentList.map((item, index) => {
          return h(Col, this.parseGrid(item), {
            default: () => this.renderItem(item, index)
          })
        })
      }
    }
  },
  /**
   * 主要模板

   * @returns {VNode}
   */
  render() {
    const list = this.renderList()
    const render = h('div', config.component.parseAttrs(this.currentInfoAttrs), {
      default: () => {
        if (!this.gridParse) {
          return list
        } else {
          return h(Row, { ...this.gridRowProps }, {
            default: () => list
          })
        }
      }
    })
    return render
  }
})
