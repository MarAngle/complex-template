import { defineComponent, h, PropType } from "vue"
import { Table, TableColumnType, TableProps } from 'ant-design-vue'
import { getType, setDataByDefault } from "complex-utils"
import { layout } from "complex-plugin"
import { ComplexList, PaginationData } from "complex-data"
import DefaultList from "complex-data/src/dictionary/DefaultList"
import ComplexDataConfig from "complex-data/config"
import { AutoIndex } from "complex-component"
import Pagination from "./components/Pagination"
import AutoText from "./AutoText.vue"
import config from "../config"

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

export interface ColumnItemType extends TableColumnType {
  $auto: boolean
  $tip: DefaultList['tip']
  $show: DefaultList['show']
}

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
    optionProps: { // 单独制定分页器数据，不从listData中取值
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
      layoutData: {
        lifeId: 0 as PropertyKey,
        count: 0
      }
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
      return setDataByDefault(this.auto, config.table.auto) as Required<autoType>
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
        const listMod = this.columnList[i]
        const currentProp = listMod.$prop
        const targetRender = this.$slots[currentProp] || config.component.parseData(listMod.$renders, 'target')
        const pureRender = config.component.parseData(listMod.$renders, 'pure')
        const $attrs = config.component.parseData(listMod.$local, 'target')
        const pitem: ColumnItemType = {
          dataIndex: currentProp,
          title: listMod.$name.getValue(this.listType),
          align: listMod.align,
          width: listMod.width,
          ellipsis: listMod.ellipsis,
          $auto: listMod.auto,
          $tip: listMod.tip,
          $show: listMod.show,
          ...config.component.parseAttrs($attrs)
        }
        if (!pureRender) {
          pitem.customRender = ({ text, record, index }: renderDataType) => {
            if (currentProp === this.currentAuto.index.prop && !targetRender) {
              // 自动index
              const autoIndexProps = {
                index: index,
                pagination: undefined as undefined | PaginationData
              }
              if (this.currentAuto.index.pagination) {
                let buildAutoIndexPagination = true
                const depth = record[ComplexDataConfig.dictionary.depth]
                if (depth !== undefined && depth !== 0) {
                  buildAutoIndexPagination = false
                }
                if (buildAutoIndexPagination) {
                  autoIndexProps.pagination = this.currentPaginationData
                }
              }
              return h(AutoIndex, autoIndexProps)
            }
            if (pitem.$show) {
              text = pitem.$show(text, {
                targetData: record,
                type: this.listType,
                index: index,
                payload: {
                  mod: listMod
                }
              })
            }
            if (getType(text) === 'object') {
              text = JSON.stringify(text)
            }
            if (targetRender) {
              // 插槽
              return targetRender({
                text: text,
                record: record,
                index: index,
                target: pitem,
                list: this.columnList
              })
            }
            if (pitem.ellipsis && pitem.$auto) {
              // 自动省略切自动换行
              return h(AutoText, {
                text: text as string,
                auto: true,
                recount: this.layoutData.count,
                tip: pitem.$tip
              })
            }
            return text
          }
        } else {
          pitem.customRender = ({ text, record, index }: renderDataType) => {
            return pureRender({
              text: text,
              record: record,
              index: index,
              target: pitem,
              list: this.columnList
            })
          }
        }
        list.push(pitem)
      }
      return list
    },
    currentOptionProps() {
      const currentOptionProps = { ...this.optionProps }
      if (!currentOptionProps.columns) {
        currentOptionProps.columns = this.currentColumnList
      }
      if (!currentOptionProps.dataSource) {
        currentOptionProps.dataSource = this.currentData
      }
      if (!currentOptionProps.rowKey) {
        currentOptionProps.rowKey = this.listData.$getDictionaryProp('id')
      }
      if (currentOptionProps.pagination === undefined) {
        currentOptionProps.pagination = false
      }
      if (this.listData.$module.choice) {
        currentOptionProps.rowSelection = {
          columnWidth: 50,
          selectedRowKeys: this.listData.$module.choice.data.id as (string | number)[],
          onChange: (selectedRowKeys: (string | number)[], selectedRows: Record<string, unknown>[]) => {
            const currentIdList = this.currentIdList
            const choice = this.listData.$module.choice!
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
          ...this.listData.$module.choice.$local?.target?.props
        }
      }
      return currentOptionProps
    },
  },
  mounted() {
    this.layoutData.lifeId = layout.$onLife('recount', {
      data: () => {
        this.layoutData.count++
      }
    }) as PropertyKey
  },
  beforeMount() {
    layout.$offLife('recount', this.layoutData.lifeId)
    this.layoutData.lifeId = 0
  },
  methods: {
    renderTable() {
      const table = h(Table, {
        ...this.currentOptionProps
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
        default: () => [this.renderChoice()]
      })
      return render
    },
    renderChoice() {
      if (this.listData.$module.choice) {
        const choiceSize = this.listData.$module.choice.getId().length
        const render = h('div', { class: 'complex-table-choice' }, {
          default: () => [
            h('span', { }, {
              default: () => `已选择${choiceSize}条数据`
            })
          ]
        })
        return render
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
   * @param {*} h createElement
   * @returns {VNode}
   */
  render() {
    const render = h('div', { class: 'complex-table' }, {
      default: () => [this.renderTable(), this.renderFooter()]
    })
    return render
  }
})
