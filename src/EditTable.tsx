import { defineComponent, h, PropType, VNode } from "vue"
import { DefaultInfo } from "complex-data"
import { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import DefaultList from "complex-data/src/dictionary/DefaultList"
import AutoItem, { AutoItemProps } from "./dictionary/AutoItem"
import { tablePayload } from "./TableView"
import ListEditView from "./ListEditView"
import config from "../config"

export interface EditTableProps {
  observeList: ObserveList
  columnList: DictionaryEditMod[]
  data: Record<PropertyKey, unknown>[]
  type: string
  parent: InstanceType<typeof ListEditView>
  lineHeight?: number
}

export default defineComponent({
  name: 'EditTable',
  emits: {
    menu: (prop: string, _payload: tablePayload) => {
      return typeof prop === 'string'
    },
    pagination: (prop: 'page' | 'size', _page: number, _size: number) => {
      return prop === 'page' || prop === 'size'
    },
  },
  props: {
    columnList: { // 定制列配置
      type: Object as PropType<EditTableProps['columnList']>,
      required: false
    },
    data: { // 单独指定列表数据，不从listData.$list中取值
      type: Array as PropType<EditTableProps['data']>,
      required: false
    },
    type: {
      type: String,
      required: false,
      default: 'list'
    },
    parent: {
      type: Object as PropType<EditTableProps['parent']>,
      required: true
    },
    observeList: {
      type: Object as PropType<EditTableProps['observeList']>,
      required: false
    },
    lineHeight: {
      type: Number as PropType<EditTableProps['lineHeight']>,
      required: false
    }
  },
  computed: {
    currentData () {
      return this.data
    },
    currentColumnList() {
      return this.columnList!
    }
  },
  methods: {
    rowWidth(column: DefaultList | DefaultInfo) {
      const style: Record<string, string | number> = {}
      if (column.$width != undefined) {
        if (typeof column.$width === 'number') {
          style.width = config.component.data.formatPixel(column.$width)
        } else {
          style.width = column.$width
        }
      }
      return style
    },
    renderTable() {
      return h('div', { class: 'complex-table-content complex-simple-table-content complex-edit-table-content' }, {
        default: () => [
          this.currentColumnList.map(column => this.renderColumn(column))
        ]
      })
    },
    renderColumn(column: DefaultList | DefaultInfo) {
      return h('div', {
        class: 'complex-simple-table-content-column complex-edit-table-content-column complex-simple-table-content-column-' + ((column as DefaultList).align || 'left'),
        style: this.rowWidth(column)
      }, [
        h('div', {
          class: 'complex-simple-table-content-header complex-edit-table-content-header'
        }, column.$name),
        this.currentData?.map((val, index) => {
          return h('div', {
            class: 'complex-simple-table-content-row complex-edit-table-content-row'
          }, [
            this.renderContent(column, val, index)
          ])
        })
      ])
    },
    renderContent(column: DefaultList | DefaultInfo, record: Record<PropertyKey, unknown>, index: number) {
      const content = this.$renderContent(column, record, index)
      if (!this.lineHeight) {
        return content
      } else {
        return h('div', {
          style: {
            height: config.component.data.formatPixel(this.lineHeight)
          }
        }, content)
      }
    },
    $renderContent(column: DefaultList | DefaultInfo, record: Record<PropertyKey, unknown>, index: number) {
      const payload: tablePayload = {
        targetData: record,
        type: this.type,
        index: index,
        payload: { column: column }
      }
      const text = record[column.$prop]
      const targetRender = config.component.parseData(column.$renders, 'target')
      const pureRender = config.component.parseData(column.$renders, 'pure')
      if (pureRender) {
        return pureRender({
          text: text,
          payload
        }) as VNode | VNode[]
      } else if (targetRender) {
        return targetRender({
          text: text,
          payload
        }) as VNode | VNode[]
      } else if (column.$prop === config.table.auto.index.prop) {
        return config.table.renderIndex(record, index)
      } else if ((column as DefaultList).ellipsis) {
        // 自动省略切自动换行
        return config.table.renderAutoText(text as string, column, payload, config.component.parseData(column.$local, 'autoText'))
      } else {
        return h(AutoItem, {
          parser: 'list',
          target: column as DictionaryEditMod,
          index: index,
          list: this.observeList!,
          type: this.type!,
          form: undefined,
          data: record,
          parent: this.parent
        } as AutoItemProps<'list'>)
      }
    }
  },
  /**
   * 主要模板

   * @returns {VNode}
   */
  render() {
    const render = h('div', { class: 'complex-table complex-simple-table complex-edit-table' }, {
      default: () => [this.renderTable()]
    })
    return render
  }
})
