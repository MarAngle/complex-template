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
    <div class="complex-simple-table-content-column" v-for="column in columns" :class="'complex-simple-table-content-column-' + column.align || 'left'" :key="column.$prop" :style="rowWidth(column)" >
      <div class="complex-simple-table-content-header">{{ column.$name }}</div>
      <div class="complex-simple-table-content-row" v-for="(val, key) in data" :key="key" >
        <AutoRender :render="parseRender(column, val, key)" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, h } from 'vue'
import { PluginLayout } from "complex-plugin"
import { PaginationData } from 'complex-data'
import DefaultList from 'complex-data/src/dictionary/DefaultList'
import AutoRender from './AutoRender'
import config, { LayoutLifeData } from '../../config'
import { tablePayload } from '../TableView'
import { SimpleTableProps } from '../SimpleTableView'
import TableMenu from './TableMenu'

export default defineComponent({
  name: 'SimpleTableContent',
  components: {
    AutoRender
  },
  inject: ['pluginLayout'],
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
      type: String,
      required: false
    },
    index: {
      type: Object as PropType<{ prop: string, pagination?: PaginationData }>,
      required: false
    }
  },
  mounted() {
    this.layoutLifeData.bind(this.pluginLayout as PluginLayout)
  },
  beforeMount() {
    this.layoutLifeData.unbind(this.pluginLayout as PluginLayout)
  },
  methods: {
    rowWidth(column: DefaultList) {
      const style: Record<string, string | number> = {}
      if (column.$width !== undefined) {
        if (typeof column.$width === 'number') {
          style.width = config.component.data.formatPixel(column.$width)
        } else {
          style.width = column.$width
        }
      }
      return style
    },
    parseRender(column: DefaultList, record: Record<PropertyKey, unknown>, index: number) {
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
