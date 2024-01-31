import { defineComponent, h, PropType } from "vue"
import { Table, TableColumnType, TableProps } from 'ant-design-vue'
import { deepCloneData, updateData } from "complex-utils"
import { PluginLayout } from "complex-plugin"
import { ComplexList, PaginationData } from "complex-data"
import DefaultList from "complex-data/src/dictionary/DefaultList"
import PaginationView from "./components/PaginationView"
import ChoiceInfo from "./components/ChoiceInfo.vue"
import TableMenu, { tableMenuType } from "./components/TableMenu"
import config, { LayoutLifeData } from "../config"

type customRenderPayload = { text: unknown, record: Record<PropertyKey, unknown>, index: number }

export type ColumnItemType = TableColumnType

export type autoType = {
  expandWidth?: number
  choiceWidth?: number
  index?: {
    prop: string
    pagination: boolean
  },
  pagination?: {
    auto?: boolean
    default: string
    front: string
    end: boolean
  }
}

export type tablePayload = {
  targetData: Record<PropertyKey, unknown>
  type: string
  index: number
  payload: {
    column: DefaultList
  }
}

export interface TableViewDefaultProps {
  listData: ComplexList
  columnList?: DefaultList[]
  data?: Record<PropertyKey, unknown>[]
  paginationData?: PaginationData
  menu?: Record<string, tableMenuType[]>
  listProp?: string
  auto?: autoType
}

export interface TableViewProps extends TableViewDefaultProps {
  tableProps?: TableProps
}

export default defineComponent({
  name: 'TableView',
  props: {
    listData: {
      type: Object as PropType<TableViewProps['listData']>,
      required: true
    },
    columnList: { // 定制列配置
      type: Object as PropType<TableViewProps['columnList']>,
      required: false
    },
    data: { // 单独指定列表数据，不从listData.$list中取值
      type: Array as PropType<TableViewProps['data']>,
      required: false
    },
    paginationData: { // 单独制定分页器数据，不从listData中取值
      type: Object as PropType<TableViewProps['paginationData']>,
      required: false,
      default: null
    },
    menu: { // 单独制定分页器数据，不从listData中取值
      type: Object as PropType<TableViewProps['menu']>,
      required: false
    },
    tableProps: { // 单独制定分页器数据，不从listData中取值
      type: Object as PropType<TableViewProps['tableProps']>,
      required: false
    },
    listProp: {
      type: String,
      required: false,
      default: 'list'
    },
    auto: {
      type: Object as PropType<TableViewProps['auto']>,
      required: false
    }
  },
  inject: ['pluginLayout'],
  data () {
    return {
      layoutLifeData: new LayoutLifeData()
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
      const list = []
      const columnList = this.columnList || this.listData.getDictionaryPageList(this.listProp) as DefaultList[]
      for (let i = 0; i < columnList.length; i++) {
        const column = columnList[i]
        const currentProp = column.$prop
        const targetRender = this.$slots[currentProp] || config.component.parseData(column.$renders, 'target')
        const pureRender = config.component.parseData(column.$renders, 'pure')
        const menuOption = config.component.parseData(this.menu, currentProp)
        const attrs = config.component.parseData(column.$local, 'target')
        const pitem: ColumnItemType = {
          dataIndex: currentProp,
          title: column.$name.getValue(this.listProp),
          align: column.align,
          width: column.width,
          ellipsis: column.ellipsis,
          ...config.component.parseAttrs(attrs)
        }
        if (!pureRender) {
          if (!menuOption || targetRender) {
            pitem.customRender = ({ text, record, index }: customRenderPayload) => {
              if (currentProp === this.currentAuto.index.prop && !targetRender) {
                // 自动index
                return config.table.renderIndex(record, index, this.currentAuto.index.pagination ? this.currentPaginationData : undefined)
              }
              const payload: tablePayload = {
                targetData: record,
                type: this.listProp,
                index: index,
                payload: { column: column }
              }
              text = config.table.renderTableValue(text, payload)
              if (targetRender) {
                // 插槽
                return targetRender({
                  text: text,
                  payload
                })
              }
              if (pitem.ellipsis && column.auto) {
                // 自动省略切自动换行
                return config.table.renderAutoText(text as string, column, this.layoutLifeData, attrs)
              }
              return text
            }
          } else {
            pitem.customRender = ({ record, index }: customRenderPayload) => {
              const payload: tablePayload = {
                targetData: record,
                type: this.listProp,
                index: index,
                payload: { column: column }
              }
              return h(TableMenu, {
                list: menuOption,
                payload: payload,
                onMenu: (prop: string, payload: tablePayload) => {
                  this.$emit('menu', prop, payload)
                }
              })
            }
          }
        } else {
          pitem.customRender = ({ text, record, index }: customRenderPayload) => {
            const payload: tablePayload = {
              targetData: record,
              type: this.listProp,
              index: index,
              payload: { column: column }
            }
            return pureRender({
              text: text,
              payload
            })
          }
        }
        list.push(pitem)
      }
      return list
    },
    currentTableProps() {
      const currentTableProps = this.tableProps ? { ...this.tableProps } : {}
      if (!currentTableProps.columns) {
        currentTableProps.columns = this.currentColumnList
      }
      if (!currentTableProps.dataSource) {
        currentTableProps.dataSource = this.currentData
      }
      if (!currentTableProps.rowKey) {
        currentTableProps.rowKey = this.listData.getDictionaryProp('id')
      }
      if (currentTableProps.pagination === undefined) {
        currentTableProps.pagination = false
      }
      const choice = this.listData.$module.choice
      if (choice) {
        currentTableProps.rowSelection = {
          columnWidth: 50,
          selectedRowKeys: choice.data.id as (string | number)[],
          onChange: (selectedRowKeys: (string | number)[], selectedRows: Record<string, unknown>[]) => {
            const currentIdList = this.currentIdList
            for (let i = 0; i < choice.data.id.length; i++) {
              const rowKey = choice.data.id[i] as (string | number)
              if (currentIdList.indexOf(rowKey) > -1) {
                // 当前页数据
                if (selectedRowKeys.indexOf(rowKey) === -1) {
                  // 已经被取消选择的数据,从数据中删除
                  choice.data.id.splice(i, 1)
                  choice.data.list.splice(i, 1)
                  i--
                }
              }
            }
            choice.pushData(selectedRowKeys, selectedRows)
          },
          ...config.component.parseAttrs(config.component.parseData(choice.$local, 'target'))
        }
      }
      return currentTableProps
    },
  },
  mounted() {
    this.layoutLifeData.bind(this.pluginLayout as PluginLayout)
  },
  beforeMount() {
    this.layoutLifeData.unbind(this.pluginLayout as PluginLayout)
  },
  methods: {
    renderTable() {
      const table = h(Table, {
        ...this.currentTableProps
      })
      return table
    },
    renderFooter() {
      const render = h('div', { class: 'complex-table-footer' }, {
        default: () => [this.renderFooterLeft(), this.renderFooterRight()]
      })
      return render
    },
    renderFooterLeft() {
      const render = h('div', { class: 'complex-table-footer-left' }, {
        default: () => [this.renderChoiceInfo()]
      })
      return render
    },
    renderChoiceInfo() {
      const choice = this.listData.$module.choice
      if (choice) {
        const infoRender = config.component.parseData(choice.$renders, 'info')
        if (!infoRender) {
          return h(ChoiceInfo, {
            class: 'complex-table-choice-info',
            choice: choice,
            ...config.component.parseAttrs(config.component.parseData(choice.$local, 'info'))
          })
        } else {
          return infoRender({
            choice: choice,
            ...config.component.parseAttrs(config.component.parseData(choice.$local, 'info'))
          })
        }
      } else {
        return null
      }
    },
    renderFooterRight() {
      const render = h('div', { class: 'complex-table-footer-right' }, {
        default: () => [this.renderPagination()]
      })
      return render
    },
    renderPagination() {
      if (this.currentPaginationData) {
        const data = h(PaginationView, {
          pagination: this.currentPaginationData,
          assign: true,
          style: {
            padding: '10px 0'
          },
          onPage: (page: number) => {
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
            this.$emit('pagination', 'page', page)
          },
          onSize: (size: number, page: number) => {
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
            this.$emit('pagination', 'size', size, page)
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
    const render = h('div', { class: 'complex-table' }, {
      default: () => [this.renderTable(), this.renderFooter()]
    })
    return render
  }
})
