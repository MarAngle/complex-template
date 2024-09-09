import { defineComponent, h, PropType, VNode } from "vue"
import { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import TableMenu from "./components/TableMenu"
import AutoItem, { AutoItemProps } from "./dictionary/AutoItem"
import { tablePayload } from "./TableView"
import ListEditView from "./ListEditView"
import { SimpleTableProps } from "./SimpleTable"
import config from "../config"

export interface EditTableProps {
  observeList: ObserveList
  data: Record<PropertyKey, unknown>[]
  type: string
  parent: InstanceType<typeof ListEditView>
  menu?: SimpleTableProps['menu']
  lineHeight?: number
  disabled?: boolean
  loading?: boolean
}

export default defineComponent({
  name: 'EditTable',
  emits: {
    menu: (prop: string, _payload: tablePayload) => {
      return typeof prop === 'string'
    }
  },
  props: {
    observeList: {
      type: Object as PropType<EditTableProps['observeList']>,
      required: true
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
    lineHeight: {
      type: Number as PropType<EditTableProps['lineHeight']>,
      required: false
    },
    menu: {
      type: Object as PropType<EditTableProps['menu']>,
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
    currentData () {
      return this.data
    },
    currentColumnList() {
      return this.observeList.data as DictionaryEditMod[]
    }
  },
  methods: {
    rowWidth(column: DictionaryEditMod) {
      const style: Record<string, string | number> = {}
      const width = column.$width === undefined ? config.table.width : column.$width
      if (typeof width === 'number') {
        style.width = config.component.data.formatPixel(width)
      } else {
        style.width = width
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
    renderColumn(column: DictionaryEditMod) {
      return h('div', {
        class: 'complex-simple-table-content-column complex-edit-table-content-column complex-simple-table-content-column-left',
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
    renderContent(column: DictionaryEditMod, record: Record<PropertyKey, unknown>, index: number) {
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
    $renderContent(column: DictionaryEditMod, record: Record<PropertyKey, unknown>, index: number) {
      const payload: tablePayload<DictionaryEditMod> = {
        targetData: record,
        type: this.type,
        index: index,
        payload: { column: column }
      }
      const text = record[column.$prop]
      const targetRender = config.component.parseData(column.$renders, 'target')
      const pureRender = config.component.parseData(column.$renders, 'pure')
      const menuOption = config.component.parseData(this.menu, column.$prop)
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
      } else if (menuOption) {
        return h(TableMenu, {
          list: menuOption,
          payload: payload,
          onMenu: (prop: string, payload: tablePayload) => {
            this.$emit('menu', prop, payload)
          }
        })
      } else if (column.$prop === config.table.auto.index.prop) {
        return config.table.renderIndex(record, index)
      } else {
        return h(AutoItem, {
          parser: 'list',
          target: column,
          index: index,
          list: this.observeList!,
          type: this.type!,
          form: undefined,
          data: record,
          disabled: this.disabled,
          loading: this.loading,
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
