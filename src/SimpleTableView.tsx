import { defineComponent, h, PropType } from "vue"
import { deepCloneData, updateData } from "complex-utils"
import DefaultList from "complex-data/src/dictionary/DefaultList"
import SimpleTableContent from "./components/SimpleTableContent.vue"
import PaginationView from "./components/PaginationView"
import { tablePayload, TableViewDefaultProps } from "./TableView"
import config from "../config"

export type SimpleTableProps = TableViewDefaultProps

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
      required: true
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
    menu: { // 单独制定分页器数据，不从listData中取值
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
    }
  },
  computed: {
    currentData () {
      if (this.data) {
        return this.data
      } else {
        return this.listData.$list
      }
    },
    currentIdList() {
      return this.currentData.map(item => {
        return item[this.listData.getDictionaryProp('id')]
      })
    },
    currentAuto() {
      return updateData(deepCloneData(config.table.auto), this.auto)
    },
    currentPaginationData() {
      if (this.paginationData) {
        return this.paginationData
      } else {
        return this.listData.$module.pagination
      }
    },
    currentColumnList() {
      return this.columnList || this.listData.getDictionaryPageList(this.listProp, this.listData.getDictionaryList(this.listProp)) as DefaultList[]
    }
  },
  methods: {
    renderTable() {
      return h('div', { class: 'complex-table-content complex-simple-table-content' }, {
        default: () => [
          h(SimpleTableContent, {
            columns: this.currentColumnList,
            data: this.currentData,
            listProp: this.listProp,
            menu: this.menu,
            id: this.listData.getDictionaryProp('id'),
            index: {
              prop: this.currentAuto.index.prop,
              pagination: this.currentAuto.index.pagination ? this.currentPaginationData : undefined
            },
            onMenu(prop: string, payload: tablePayload) {
              this.$emit('menu', prop, payload)
            }
          })
        ]
      })
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
              this.listData.reloadData({
                data: true,
                ing: true,
                sync: true,
                module: {
                  choice: {
                    from: 'pagination',
                    act: 'page'
                  }
                }
              })
            }
            this.$emit('pagination', 'page', page, size)
          },
          onSize: (page: number, size: number) => {
            if (this.currentAuto.pagination.auto) {
              this.listData.reloadData({
                data: true,
                ing: true,
                sync: true,
                module: {
                  choice: {
                    from: 'pagination',
                    act: 'size'
                  }
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
      default: () => [this.renderTable(), this.renderFooter()]
    })
    return render
  }
})
