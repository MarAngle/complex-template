<template>
  <div class="complex-table-view">
    <Table ref="table-view" v-bind="currentOptionProps" ></Table>
  </div>
</template>

<script lang="ts">
import { defineComponent, h, PropType } from "vue"
import { Table, TableColumnType } from 'ant-design-vue'
import { getType, setDataByDefault } from "complex-utils"
import { layout } from "complex-plugin"
import { ComplexList, DefaultList, PaginationData } from "complex-data-next"
import ComplexDataConfig from "complex-data-next/config"
import config from "./../config"
import AutoIndex from "../../base/data/AutoIndex.vue"
import AutoText from "./AutoText.vue"

type renderDataType = { text: any, record: Record<PropertyKey, any>, index: number }

export interface ColumnItemType extends TableColumnType {
  $auto: boolean
  $tip: DefaultList['tip']
  $show: DefaultList['show']
}

export default defineComponent({
  name: 'ComplexTableView',
  components: {
    Table
  },
  data () {
    return {}
  },
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
      type: Array,
      required: false
    },
    paginationData: { // 单独制定分页器数据，不从listData中取值
      type: Object as PropType<PaginationData>,
      required: false,
      default: null
    },
    optionProps: { // 单独制定分页器数据，不从listData中取值
      type: Object,
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
      type: Object,
      required: false,
      default: null
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
    currentAuto() {
      return setDataByDefault(this.auto, config.TableView.auto)
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
        const ditem = listMod.$getParent()!
        const currentProp = listMod.prop || ditem.$prop
        const contentSlot = this.$slots[currentProp] || listMod.render
        const pitem: ColumnItemType = {
          dataIndex: currentProp,
          title: listMod.name,
          align: listMod.align,
          width: listMod.width,
          ellipsis: listMod.ellipsis,
          $auto: listMod.auto,
          $tip: listMod.tip,
          $show: listMod.show,
          ...listMod.local
        }
        if (!listMod.pureRender) {
          pitem.customRender = ({ text, record, index }: renderDataType) => {
            if (currentProp === this.currentAuto.index.prop && !contentSlot) {
              // 自动index
              const autoIndexProps : {
                index: number,
                pagination: undefined | PaginationData
              } = {
                index: index,
                pagination: undefined
              }
              if (this.currentAuto.index.pagination) {
                let buildAutoIndexPagination = true
                const depth = record[ComplexDataConfig.DictionaryList.format.depth]
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
            const dataType = getType(text)
            if (dataType === 'object') {
              text = JSON.stringify(text)
            } else if (dataType === 'array') {
              text = text.join(',')
            }
            if (contentSlot) {
              // 插槽
              return contentSlot({
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
                text: text,
                auto: true,
                recount: layout.recount.main,
                tip: pitem.$tip
              })
            }
            return text
          }
        } else {
          pitem.customRender = ({ text, record, index }: renderDataType) => {
            return listMod.pureRender!({
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
        currentOptionProps.rowKey = this.listData.$getDictionaryPropData('prop', 'id')
      }
      if (currentOptionProps.pagination === undefined) {
        currentOptionProps.pagination = false
      }
      return currentOptionProps
    }
  },
  methods: {
    /**
     * 获取Tips设置项
     * @param {object} pitemTip pitem定义的设置项
     * @param {object} mainTip 总设置项
     * @returns {object}
     */
    formatAutoTextTipOption(pitemTip?: Record<PropertyKey, any>, mainTip?: Record<PropertyKey, any>) {
      const tipOption = pitemTip || mainTip
      return tipOption
    },
  }
})
</script>
