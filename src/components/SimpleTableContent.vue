<style lang="less" scoped>
.complex-simple-table-content{
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  align-items: stretch;
  .complex-simple-table-content-column{
    color: rgba(255, 255, 255, 0.85);
    line-height: 32px;
    &.complex-simple-table-content-column-left{
      text-align: left;
    }
    &.complex-simple-table-content-column-right{
      text-align: right;
    }
    &.complex-simple-table-content-column-center{
      text-align: center;
    }
    .complex-simple-table-content-header{
      height: 33px;
      white-space: nowrap; /* 不换行 */
      overflow: hidden; /* 隐藏超出部分 */
      text-overflow: ellipsis; /* 显示省略号 */
      word-wrap: break-word;
      word-break: break-all;
      padding: 0 4px;
      cursor: pointer;
      border-bottom: 1px rgba(255, 255, 255, 0.25) solid;
      background-color: rgba(255, 255, 255, 0.1);
    }
    .complex-simple-table-content-row{
      padding: 0 4px;
      border-bottom: 1px rgba(255, 255, 255, 0.25) solid;
      p{
        height: 33px;
        white-space: nowrap; /* 不换行 */
        overflow: hidden; /* 隐藏超出部分 */
        text-overflow: ellipsis; /* 显示省略号 */
        word-wrap: break-word;
        word-break: break-all;
      }
    }
  }
}
</style>

<template>
  <div class="complex-simple-table-content">
    <div class="complex-simple-table-content-column" v-for="column in columns" :class="'complex-simple-table-content-column-' + column.align || 'left'" :key="column.$prop" :style="rowWidth(column)" >
      <div class="complex-simple-table-content-header">{{ column.$name.getValue(type) }}</div>
      <div class="complex-simple-table-content-row" v-for="(val, key) in data" :key="key" >
        <AutoRender :render="parseRender(column, val, key)" />
        <!-- <p>{{ column.show ? column.show(val[column.$prop], { targetData: val, type: type, index: key, payload: { mod: column } }) : val[column.$prop] }}</p> -->
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, h } from 'vue'
import DefaultList from 'complex-data/src/dictionary/DefaultList'
import ComplexDataConfig from "complex-data/config"
import AutoRender from './AutoRender'
import config from '../../config'
import { PaginationData } from 'complex-data'
import { AutoIndex } from 'complex-component'

export default defineComponent({
  name: 'SimpleTable',
  components: {
    AutoRender
  },
  props: {
    columns: {
      type: Object as PropType<DefaultList[]>,
      required: true
    },
    data: {
      type: Array as PropType<Record<PropertyKey, unknown>[]>,
      required: true
    },
    type: {
      type: String,
      required: false,
      default: 'list'
    },
    id: {
      type: String,
      required: false
    },
    index: {
      type: Object as PropType<{ prop: string, pagination?: PaginationData }>,
      required: false
    }
  },
  methods: {
    rowWidth(column: DefaultList) {
      const style: Record<string, string | number> = {}
      if (column.width !== undefined) {
        if (typeof column.width === 'number') {
          style.width = config.component.formatStyle(column.width)
        } else {
          style.width = column.width
        }
      }
      return style
    },
    parseRender(column: DefaultList, record: Record<PropertyKey, unknown>, index: number) {
      let value = record[column.$prop]
      if (column.show) {
        value = column.show(value, { targetData: record, type: this.type, index: index, payload: { mod: column } })
      }
      const targetRender = config.component.parseData(column.$renders, 'target')
      const pureRender = config.component.parseData(column.$renders, 'pure')
      const attrs = config.component.parseData(column.$local, 'target')
      if (pureRender) {
        return () => {
          return pureRender({
            text: value,
            record: record,
            index: index,
            target: column,
            list: this.columns
          })
        }
      } else if (targetRender) {
        return () => {
          return targetRender({
            text: value,
            record: record,
            index: index,
            target: column,
            list: this.columns
          })
        }
      } else if (this.index && column.$prop === this.index.prop) {
        return () => {
          // 自动index
          const autoIndexProps = {
            index: index,
            pagination: undefined as undefined | PaginationData
          }
          if (this.index!.pagination) {
            let buildAutoIndexPagination = true
            const depth = record[ComplexDataConfig.dictionary.depth]
            if (depth !== undefined && depth !== 0) {
              buildAutoIndexPagination = false
            }
            if (buildAutoIndexPagination) {
              autoIndexProps.pagination = this.index!.pagination
            }
          }
          return h(AutoIndex, autoIndexProps)
        }
      } else {
        return () => {
          return h('p', config.component.parseAttrs(attrs), {
            default: () => value
          })
        }
      }
    }
  }
})
</script>
