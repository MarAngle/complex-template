import { defineComponent, h, PropType, VNode } from "vue"
import { Empty } from "ant-design-vue"
import { deepCloneData, updateData } from "complex-utils"
import { DefaultInfo } from "complex-data"
import DefaultList from "complex-data/src/dictionary/DefaultList"
import PaginationView from "./components/PaginationView"
import TableMenu from "./components/TableMenu"
import { tablePayload, TableViewDefaultProps } from "./TableView"
import config from "../config"

export interface SimpleTableProps extends TableViewDefaultProps {
  lineHeight?: number
}

export default defineComponent({
  name: 'SimpleTable',
  emits: {
    menu: (prop: string, _payload: tablePayload) => {
      return typeof prop === 'string'
    },
    pagination: (prop: 'page' | 'size', _page: number, _size: number) => {
      return prop === 'page' || prop === 'size'
    },
  },
  props: {
    listData: {
      type: Object as PropType<SimpleTableProps['listData']>,
      required: false
    },
    columnList: { // 定制列配置
      type: Object as PropType<SimpleTableProps['columnList']>,
      required: false
    },
    data: { // 单独指定列表数据，不从listData.$list中取值
      type: Array as PropType<SimpleTableProps['data']>,
      required: false
    },
    paginationData: { // 单独制定分页器数据，不从listData中取值
      type: Object as PropType<SimpleTableProps['paginationData']>,
      required: false,
      default: null
    },
    menu: {
      type: Object as PropType<SimpleTableProps['menu']>,
      required: false
    },
    listProp: {
      type: String,
      required: false,
      default: 'list'
    },
    auto: {
      type: Object as PropType<SimpleTableProps['auto']>,
      required: false
    },
    lineHeight: {
      type: Number as PropType<SimpleTableProps['lineHeight']>,
      required: false
    }
  },
  computed: {
    currentData () {
      if (this.data) {
        return this.data
      } else {
        return this.listData?.$list!
      }
    },
    currentIdList() {
      return this.currentData.map(item => {
        return item[this.listData!.getDictionaryProp('id')]
      })
    },
    currentAuto() {
      return updateData(deepCloneData(config.table.auto), this.auto)
    },
    currentPaginationData() {
      if (this.paginationData) {
        return this.paginationData
      } else {
        return this.listData?.$module.pagination
      }
    },
    currentColumnList() {
      return this.columnList || this.listData!.getDictionaryPageList(this.listProp, this.listData!.getDictionaryList(this.listProp)) as DefaultList[]
    },
    isEmpty() {
      return !this.currentData || this.currentData.length === 0
    }
  },
  methods: {
    rowWidth(column: DefaultList | DefaultInfo) {
      if (column.$width) {
        return {
          width: typeof column.$width === 'number' ? config.component.data.formatPixel(column.$width) : column.$width
        }
      } else {
        return undefined
      }
    },
    renderTable() {
      return h('div', { class: 'complex-table-content complex-simple-table-content' }, {
        default: () => [
          this.currentColumnList.map(column => this.renderColumn(column))
        ]
      })
    },
    renderColumn(column: DefaultList | DefaultInfo) {
      return h('div', {
        class: 'complex-simple-table-content-column complex-simple-table-content-column-' + ((column as DefaultList).align || 'left'),
        style: this.rowWidth(column)
      }, [
        h('div', {
          class: 'complex-simple-table-content-header'
        }, column.$name),
        !this.isEmpty ? this.currentData.map((val, index) => {
          return h('div', {
            class: 'complex-simple-table-content-row'
          }, [
            this.renderContent(column, val, index)
          ])
        }) : null
      ])
    },
    renderEmpty() {
      return !this.isEmpty ? null : h('div', {
        class: 'complex-simple-table-content-empty'
      }, [
        h(Empty, {
          "image": Empty.PRESENTED_IMAGE_SIMPLE
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
      } else if (column.$prop === this.currentAuto.index.prop) {
        return config.table.renderIndex(record, index, this.currentAuto.index.pagination ? this.currentPaginationData : undefined)
      } else if ((column as DefaultList).ellipsis) {
        // 自动省略切自动换行
        return config.table.renderAutoText(text as string, column, payload, config.component.parseData(column.$local, 'autoText'))
      } else {
        return h('p', config.component.parseAttrs(config.component.parseData(column.$local, 'target')), {
          default: () => text
        })
      }
    },
    renderFooter() {
      const render = h('div', { class: 'complex-table-footer complex-simple-table-footer' }, {
        default: () => [this.renderFooterLeft(), this.renderFooterRight()]
      })
      return render
    },
    renderFooterLeft() {
      const render = h('div', { class: 'complex-table-footer-left complex-simple-table-footer-left' }, {
        default: () => null
      })
      return render
    },
    renderFooterRight() {
      const render = h('div', { class: 'complex-table-footer-right complex-simple-table-footer-right' }, {
        default: () => [this.renderPagination()]
      })
      return render
    },
    renderPagination() {
      if (this.currentPaginationData) {
        const data = h(PaginationView, {
          pagination: this.currentPaginationData,
          style: {
            padding: '10px 0'
          },
          onCurrent: (page: number, size: number) => {
            if (this.currentAuto.pagination.auto) {
              this.listData?.reloadData({
                data: true,
                ing: true,
                sync: true,
                trigger: {
                  from: 'pagination',
                  action: 'page'
                }
              })
            }
            this.$emit('pagination', 'page', page, size)
          },
          onSize: (page: number, size: number) => {
            if (this.currentAuto.pagination.auto) {
              this.listData?.reloadData({
                data: true,
                ing: true,
                sync: true,
                trigger: {
                  from: 'pagination',
                  action: 'size'
                }
              })
            }
            this.$emit('pagination', 'size', page, size)
          }
        })
        return data
      } else {
        return null
      }
    }
  },
  /**
   * 主要模板

   * @returns {VNode}
   */
  render() {
    const render = h('div', { class: 'complex-table complex-simple-table' }, {
      default: () => [this.renderTable(), this.renderEmpty(), this.renderFooter()]
    })
    return render
  }
})
