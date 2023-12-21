import { defineComponent, h, PropType } from "vue"
import { Table, TableColumnType, TableProps } from 'ant-design-vue'
import { deepCloneData, updateData } from "complex-utils"
import { ComplexList, PaginationData } from "complex-data"
import DefaultList from "complex-data/src/dictionary/DefaultList"
import Pagination from "./components/Pagination"
import ChoiceInfo from "./components/ChoiceInfo.vue"
import config, { LayoutLifeData } from "../config"

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

export type renderDataType = { text: unknown, record: Record<PropertyKey, unknown>, index: number }

export type ColumnItemType = TableColumnType

export default defineComponent({
  name: 'TableView',
  props: {
    listData: {
      type: Object as PropType<ComplexList>,
      required: true
    },
    columnList: { // 定制列配置
      type: Object as PropType<DefaultList[]>,
      required: true
    },
    data: { // 单独指定列表数据，不从listData.$list中取值
      type: Array as PropType<Record<PropertyKey, unknown>[]>,
      required: false
    },
    paginationData: { // 单独制定分页器数据，不从listData中取值
      type: Object as PropType<PaginationData>,
      required: false,
      default: null
    },
    tableOption: { // 单独制定分页器数据，不从listData中取值
      type: Object as PropType<TableProps>,
      required: false,
      default: () => {
        return {}
      }
    },
    listType: {
      type: String,
      required: false,
      default: 'list'
    },
    auto: {
      type: Object as PropType<autoType>,
      required: false,
      default: () => {
        return {}
      }
    }
  },
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
        return item[this.listData.$getDictionaryProp('id')]
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
      for (let i = 0; i < this.columnList.length; i++) {
        const column = this.columnList[i]
        const currentProp = column.$prop
        const targetRender = this.$slots[currentProp] || config.component.parseData(column.$renders, 'target')
        const pureRender = config.component.parseData(column.$renders, 'pure')
        const attrs = config.component.parseData(column.$local, 'target')
        const pitem: ColumnItemType = {
          dataIndex: currentProp,
          title: column.$name.getValue(this.listType),
          align: column.align,
          width: column.width,
          ellipsis: column.ellipsis,
          ...config.component.parseAttrs(attrs)
        }
        if (!pureRender) {
          pitem.customRender = ({ text, record, index }: renderDataType) => {
            if (currentProp === this.currentAuto.index.prop && !targetRender) {
              // 自动index
              return config.table.renderIndex(record, index, this.currentAuto.index.pagination ? this.currentPaginationData : undefined)
            }
            const payload = {
              targetData: record,
              type: this.listType,
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
          pitem.customRender = ({ text, record, index }: renderDataType) => {
            const payload = {
              targetData: record,
              type: this.listType,
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
    currentTableOption() {
      const currentTableOption = { ...this.tableOption }
      if (!currentTableOption.columns) {
        currentTableOption.columns = this.currentColumnList
      }
      if (!currentTableOption.dataSource) {
        currentTableOption.dataSource = this.currentData
      }
      if (!currentTableOption.rowKey) {
        currentTableOption.rowKey = this.listData.$getDictionaryProp('id')
      }
      if (currentTableOption.pagination === undefined) {
        currentTableOption.pagination = false
      }
      const choice = this.listData.$module.choice
      if (choice) {
        currentTableOption.rowSelection = {
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
      return currentTableOption
    },
  },
  mounted() {
    this.layoutLifeData.bind()
  },
  beforeMount() {
    this.layoutLifeData.unbind()
  },
  methods: {
    renderTable() {
      const table = h(Table, {
        ...this.currentTableOption
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
        const data = h(Pagination, {
          pagination: this.currentPaginationData,
          style: {
            padding: '10px 0'
          },
          onCurrent: (current: number) => {
            if (this.currentAuto.pagination.auto) {
              this.listData.$reloadData({
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
            this.$emit('pagination', 'current', current)
          },
          onSize: (size: number, current: number) => {
            if (this.currentAuto.pagination.auto) {
              this.listData.$reloadData({
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
            this.$emit('pagination', 'size', size, current)
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
