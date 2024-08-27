import { defineComponent, PropType, h } from 'vue'
import { PaginationData } from 'complex-data'
import DefaultList from 'complex-data/src/dictionary/DefaultList'
import AutoRender from './AutoRender'
import { tablePayload } from '../TableView'
import { SimpleTableProps } from '../SimpleTableView'
import TableMenu from './TableMenu'
import config from '../../config'

export default defineComponent({
  name: 'SimpleTableContent',
  components: {
    AutoRender
  },
  props: {
    columns: {
      type: Object as PropType<DefaultList[]>,
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
    }
  },
  data () {
    return {}
  },
  methods: {
    rowWidth(target: DefaultList) {
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
    parseRender(target: DefaultList, record: Record<PropertyKey, unknown>, index: number) {
      const payload: tablePayload = {
        targetData: record,
        type: this.listProp,
        index: index,
        payload: { target: target }
      }
      const text = config.table.renderTableValue(record[target.$prop], payload)
      const targetRender = config.component.parseData(target.$renders, 'target')
      const pureRender = config.component.parseData(target.$renders, 'pure')
      const menuOption = config.component.parseData(this.menu, target.$prop)
      if (pureRender) {
        return () => {
          return pureRender({
            text: text,
            payload
          })
        }
      } else if (targetRender) {
        return () => {
          return targetRender({
            text: text,
            payload
          })
        }
      } else if (menuOption) {
        return () => {
          return h(TableMenu, {
            list: menuOption,
            payload: payload,
            onMenu: (prop: string, payload: tablePayload) => {
              this.$emit('menu', prop, payload)
            }
          })
        }
      } else if (this.index && target.$prop === this.index.prop) {
        return () => {
          return config.table.renderIndex(record, index, this.index!.pagination)
        }
      } else if (target.ellipsis) {
        // 自动省略切自动换行
        return () => {
          return config.table.renderAutoText(text as string, target, payload, config.component.parseData(target.$local, 'autoText'))
        }
      } else {
        return () => {
          return h('p', config.component.parseAttrs(config.component.parseData(target.$local, 'target')), {
            default: () => text
          })
        }
      }
    },
    renderColumn(column: DefaultList) {
      return h('div', {
        class: 'complex-simple-table-content-column complex-simple-table-content-column-' + (column.align || 'left'),
        style: this.rowWidth(column)
      }, [
        h('div', {
          class: 'complex-simple-table-content-header'
        }, column.$name),
        this.data?.map((val, index) => {
          return h('div', {
            class: 'complex-simple-table-content-row'
          }, [
            h(AutoRender, {
              render: this.parseRender(column, val, index)
            })
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
