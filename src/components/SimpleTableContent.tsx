import { defineComponent, PropType, h, VNode } from 'vue'
import { DefaultInfo, PaginationData } from 'complex-data'
import DefaultList from 'complex-data/src/dictionary/DefaultList'
import { tablePayload } from '../TableView'
import { SimpleTableProps } from '../SimpleTableView'
import TableMenu from './TableMenu'
import config from '../../config'

export default defineComponent({
  name: 'SimpleTableContent',
  props: {
    columns: {
      type: Object as PropType<NonNullable<SimpleTableProps['columnList']>>,
      required: true
    },
    data: {
      type: Array as PropType<SimpleTableProps['data']>,
      required: true
    },
    menu: { // 单独制定分页器数据，不从listData中取值
      type: Object as PropType<SimpleTableProps['menu']>,
      required: false
    },
    listProp: {
      type: String,
      required: false,
      default: 'list'
    },
    id: {
      type: [String, Number, Symbol],
      required: false
    },
    index: {
      type: Object as PropType<{ prop: string, pagination?: PaginationData }>,
      required: false
    },
    lineHeight: {
      type: Number as PropType<SimpleTableProps['lineHeight']>,
      required: false
    }
  },
  data () {
    return {}
  },
  methods: {
    rowWidth(target: DefaultList | DefaultInfo) {
      const style: Record<string, string | number> = {}
      if (target.$width != undefined) {
        if (typeof target.$width === 'number') {
          style.width = config.component.data.formatPixel(target.$width)
        } else {
          style.width = target.$width
        }
      }
      return style
    },
    renderContent(column: DefaultList | DefaultInfo, record: Record<PropertyKey, unknown>, index: number) {
      const payload: tablePayload = {
        targetData: record,
        type: this.listProp,
        index: index,
        payload: { column: column }
      }
      const text = config.table.renderTableValue(record[column.$prop], payload)
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
      } else if (this.index && column.$prop === this.index.prop) {
        return config.table.renderIndex(record, index, this.index!.pagination)
      } else if ((column as DefaultList).ellipsis) {
        // 自动省略切自动换行
        return config.table.renderAutoText(text as string, column, payload, config.component.parseData(column.$local, 'autoText'))
      } else {
        return h('p', config.component.parseAttrs(config.component.parseData(column.$local, 'target')), {
          default: () => text
        })
      }
    },
    renderColumn(column: DefaultList | DefaultInfo) {
      return h('div', {
        class: 'complex-simple-table-content-column complex-simple-table-content-column-' + ((column as DefaultList).align || 'left'),
        style: this.rowWidth(column)
      }, [
        h('div', {
          class: 'complex-simple-table-content-header'
        }, column.$name),
        this.data?.map((val, index) => {
          return h('div', {
            class: 'complex-simple-table-content-row'
          }, [
            this.renderContent(column, val, index)
          ])
        })
      ])
    }
  },
  render() {
    return h('div', {
      class: 'complex-simple-table-content'
    }, this.columns.map(column => this.renderColumn(column)))
  }
})
