<style scoped>
.complex-simple-table-content{
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: stretch;
  align-items: stretch;
}
.complex-simple-table-content .complex-simple-table-content-column{


  .complex-simple-table-content-row{
    padding: 16px 16px;
    border-bottom: 1px solid #f0f0f0;
    :deep(p){
      height: 22px;
      white-space: nowrap; /* 不换行 */
      overflow: hidden; /* 隐藏超出部分 */
      text-overflow: ellipsis; /* 显示省略号 */
      word-wrap: break-word;
      word-break: break-all;
    }
  }
}
.complex-simple-table-content .complex-simple-table-content-column.complex-simple-table-content-column-left{
  text-align: left;
}
.complex-simple-table-content .complex-simple-table-content-column.complex-simple-table-content-column-right{
  text-align: right;
}
.complex-simple-table-content .complex-simple-table-content-column.complex-simple-table-content-column-center{
  text-align: center;
}
.complex-simple-table-content .complex-simple-table-content-column .complex-simple-table-content-header{
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 隐藏超出部分 */
  text-overflow: ellipsis; /* 显示省略号 */
  word-wrap: break-word;
  word-break: break-all;
  padding: 16px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  background-color: #fafafa;
  position: relative;
}
.complex-simple-table-content .complex-simple-table-content-column .complex-simple-table-content-header::before{
  position: absolute;
  top: 50%;
  inset-inline-end: 0;
  width: 1px;
  height: 1.6em;
  background-color: #f0f0f0;
  transform: translateY(-50%);
  transition: background-color 0.2s;
  content: "";
}
.complex-simple-table-content .complex-simple-table-content-column:last-child .complex-simple-table-content-header::before{
  display: none;
}
.complex-simple-table-content .complex-simple-table-content-column .complex-simple-table-content-row{
  padding: 16px 16px;
  border-bottom: 1px solid #f0f0f0;
  :deep(p){
    height: 22px;
    white-space: nowrap; /* 不换行 */
    overflow: hidden; /* 隐藏超出部分 */
    text-overflow: ellipsis; /* 显示省略号 */
    word-wrap: break-word;
    word-break: break-all;
  }
}
.complex-simple-table-content .complex-simple-table-content-column .complex-simple-table-content-row:deep(p){
  height: 22px;
  white-space: nowrap; /* 不换行 */
  overflow: hidden; /* 隐藏超出部分 */
  text-overflow: ellipsis; /* 显示省略号 */
  word-wrap: break-word;
  word-break: break-all;
}
</style>

<template>
  <div class="complex-simple-table-content">
    <div class="complex-simple-table-content-column" v-for="target in columns" :class="'complex-simple-table-content-column-' + target.align || 'left'" :key="target.$prop" :style="rowWidth(target)" >
      <div class="complex-simple-table-content-header">{{ target.$name }}</div>
      <div class="complex-simple-table-content-row" v-for="(val, key) in data" :key="key" >
        <AutoRender :render="parseRender(target, val, key)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
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
    }
  }
})
</script>
