<template>
  <div class="complex-table-view">
    <a-table :columns="currentColumnList" :data-source="currentData"></a-table>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue"
import { ListData, PaginationData } from "complex-data"
import $func from 'complex-func'

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
    currentColumnList() {
      const list = []
      for (let i = 0; i < this.columnList.length; i++) {
        const pitem = this.columnList[i]
        list.push(pitem)
      }
      return list
    }
  },
  methods: {
  }
})
</script>
