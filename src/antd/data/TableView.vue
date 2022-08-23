<template>
  <div class="complex-table-view">
    <a-table ref="table-view" v-bind="currentOptionProps" ></a-table>
  </div>
</template>

<script lang="ts">
import { defineComponent, h } from "vue"
import { ListData, PaginationData } from "complex-data"
import $func from 'complex-func'
import { objectAny } from "complex-func/src/ts"
import config from "./../config"
import AutoIndexVue from "../../base/data/AutoIndex.vue"
import AutoTextVue from "./AutoText.vue"

type renderDataType = { text: any, record: objectAny, index: number, column: objectAny }

export default defineComponent({
  name: 'ComplexTableView',
  data () {
    return {}
  },
  props: {
    listData: {
      type: ListData,
      required: true
    },
    columnList: { // 定制列配置
      type: Array,
      required: true
    },
    data: { // 单独指定列表数据，不从listData.$data.list中取值
      type: Array,
      required: false
    },
    paginationData: { // 单独制定分页器数据，不从listData中取值
      type: PaginationData,
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
        return this.listData.$data.list
      }
    },
    currentAuto() {
      return $func.setDataByDefault(this.auto, config.TableView.auto)
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
        const pitem = { ...this.columnList[i] as objectAny }
        const contentProp = pitem.dataIndex
        const contentSlot = this.$slots[contentProp] || pitem.$render
        if (!pitem.customRender) {
          pitem.customRender = ({ text, record, index }: renderDataType) => {
            if (contentProp === this.currentAuto.index.prop && !contentSlot) {
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
                const currentPrototype = Object.getPrototypeOf(record)
                if (currentPrototype && currentPrototype !== Object.prototype) {
                  if (currentPrototype.$depth !== 0) {
                    buildAutoIndexPagination = false
                  }
                }
                if (buildAutoIndexPagination) {
                  autoIndexProps.pagination = this.currentPaginationData
                }
              }
              return h(AutoIndexVue, autoIndexProps)
            }
            let data = pitem.$func.show(text, { item: pitem, targetitem: record, type: this.listType, index: index })
            const dataType = $func.getType(data)
            if (dataType === 'object') {
              data = JSON.stringify(data)
            } else if (dataType === 'array') {
              data = data.join(',')
            }
            if (contentSlot) {
              // 插槽
              return contentSlot({
                text: data,
                record: record,
                index: index,
                item: pitem,
                list: this.columnList
              })
            }
            if (pitem.ellipsis && pitem.$auto) {
              // 自动省略切自动换行
              return h(AutoTextVue, {
                props: {
                  text: data,
                  auto: true,
                  recount: $func.page.recount.main,
                  tip: this.formatAutoTextTipOption(pitem.tip, this.currentAuto.tip)
                }
              })
            }
            return data

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
  mounted() {
    console.log(this.$refs)
  },
  methods: {
    /**
     * 获取Tips设置项
     * @param {object} pitemTip pitem定义的设置项
     * @param {object} mainTip 总设置项
     * @returns {object}
     */
    formatAutoTextTipOption(pitemTip?: objectAny, mainTip?: objectAny) {
      const tipOption = pitemTip || mainTip
      return tipOption
    },
  }
})
</script>
