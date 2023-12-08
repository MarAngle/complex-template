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
import { PaginationData } from 'complex-data'
import DefaultList from 'complex-data/src/dictionary/DefaultList'
import { getType } from "complex-utils"
import AutoRender from './AutoRender'
import config, { LayoutLifeData } from '../../config'

export default defineComponent({
  name: 'SimpleTable',
  components: {
    AutoRender
  },
  data () {
    return {
      layoutLifeData: new LayoutLifeData()
    }
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
  mounted() {
    this.layoutLifeData.bind()
  },
  beforeMount() {
    this.layoutLifeData.unbind()
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
      const payload = {
        targetData: record,
        type: this.type,
        index: index,
        payload: { column: column }
      }
      const text = config.table.renderTableValue(record[column.$prop], payload)
      const targetRender = config.component.parseData(column.$renders, 'target')
      const pureRender = config.component.parseData(column.$renders, 'pure')
      const attrs = config.component.parseData(column.$local, 'target')
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
      } else if (this.index && column.$prop === this.index.prop) {
        return () => {
          return config.table.renderIndex(record, index, this.index!.pagination)
        }
      } else if (column.ellipsis && column.auto) {
        // 自动省略切自动换行
        return () => {
          return config.table.renderAutoText(text as string, column, this.layoutLifeData, attrs)
        }
      } else {
        return () => {
          return h('p', config.component.parseAttrs(attrs), {
            default: () => text
          })
        }
      }
    }
  }
})
</script>
