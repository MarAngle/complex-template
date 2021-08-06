import _func from 'complex-func'
import AutoText from './../mod/AutoText'
import PaginationView from './../mod/PaginationView'

const className = 'complex-table-view'
const refName = 'TableView'

export default {
  name: 'TableView',
  props: {
    maindata: {
      // ListData的实例
      type: Object,
      required: true
    },
    columnList: {
      // 定制列配置
      type: Array,
      required: true
    },
    formatColumn: {
      type: Function,
      required: false
    },
    listType: {
      type: String,
      required: false,
      default: 'list'
    },
    listData: {
      // 定制列表数据
      type: Array,
      required: false
    },
    size: {
      type: String,
      required: false,
      default: 'default' // default / middle / small
    },
    bordered: {
      type: Boolean,
      required: false,
      default: true
    },
    tableOption: {
      type: Object,
      required: false,
      default: null
    },
    autoTextTipOption: {
      type: [String, Object],
      required: false,
      default: ''
    },
    paginationData: {
      type: Object,
      required: false,
      default: null
    },
    paginationChange: {
      type: [Boolean, Function],
      required: false,
      default: true
    }
  },
  data() {
    return {
    }
  },
  computed: {
    currentTableOption() {
      let currentTableOption = this.tableOption
      if (!currentTableOption) {
        currentTableOption = {}
      }
      if (!currentTableOption.props) {
        currentTableOption.props = {}
      }
      if (!currentTableOption.props.columns) {
        currentTableOption.props.columns = this.currentColumnList
      }
      if (!currentTableOption.props.dataSource) {
        currentTableOption.props.dataSource = this.currentListData
      }
      if (!currentTableOption.props.rowKey) {
        currentTableOption.props.rowKey = this.maindata.getDictionaryPropData('prop', 'id')
      }
      if (currentTableOption.props.pagination === undefined) {
        currentTableOption.props.pagination = false
      }
      if (!currentTableOption.props.size) {
        currentTableOption.props.size = this.size
      }
      if (!currentTableOption.props.bordered) {
        currentTableOption.props.bordered = this.bordered
      }
      if (!currentTableOption.props.rowSelection) {
        currentTableOption.props.rowSelection = this.rowSelection
      }
      if (this.$scopedSlots.expandedRowRender) {
        currentTableOption.props.expandedRowRender = this.$scopedSlots.expandedRowRender
      }
      if (!currentTableOption.ref) {
        currentTableOption.ref = refName
      }
      return currentTableOption
    },
    currentListData () {
      if (this.listData) {
        return this.listData
      } else {
        return this.maindata.data.list
      }
    },
    currentColumnList() {
      // JSX语法使用需要在此进行
      let list = []
      for (let i = 0; i < this.columnList.length; i++) {
        let pitem = this.columnList[i]
        if (!pitem.customRender) {
          pitem.customRender = (text, record, index) => {
            let data = pitem.func.show(text, { item: pitem, targetitem: record, type: this.listType, index: index })
            let type = _func.getType(data)
            if (type == 'object') {
              data = JSON.stringify(data)
            } else if (type == 'array') {
              data = data.join(',')
            }
            let contentSlotProp = pitem.dataIndex
            let contentSlot = this.$scopedSlots[contentSlotProp]
            if (contentSlot) {
              return contentSlot({
                text: data,
                record: record,
                index: index,
                item: pitem,
                list: this.columnList
              })
            } else if (pitem.ellipsis && pitem.autoText) {
              // 自动省略切自动换行?
              let AutoTextOption = {
                props: {
                  text: data,
                  auto: true,
                  tip: this.formatAutoTextTipOption(pitem.tip, this.autoTextTipOption)
                }
              }
              return this.$createElement(AutoText, AutoTextOption)
            } else {
              return data
            }
          }
          let titleSlotProp = pitem.dataIndex + '-title'
          let titleSlot = this.$scopedSlots[titleSlotProp]
          if (titleSlot) {
            pitem.title = titleSlot({
              item: pitem,
              list: this.columnList
            })
          }
        }
        if (this.formatColumn) {
          this.formatColumn(pitem, this.columnList, this.listType)
        }
        list.push(pitem)
      }
      return list
    },
    rowSelection() {
      let choice = this.maindata.getModule('choice')
      if (choice.getShow()) {
        let option = choice.getOption()
        return {
          ...option,
          selectedRowKeys: choice.data.id,
          onChange: this.onChoiceChange
        }
      } else {
        return null
      }
    },
    currentPaginationData() {
      if (this.paginationData) {
        return this.paginationData
      } else {
        return this.maindata.getModule('pagination')
      }
    }
  },
  mounted() {
  },
  methods: {
    formatAutoTextTipOption(pitemTip, mainTip) {
      let tipOption = pitemTip || mainTip
      return tipOption
    },
    renderList() {
      let renderList = []
      return renderList
    },
    renderPagination() {
      let renderPagination = null
      if (this.currentPaginationData) {
        const paginationSlotList = [
          {
            prop: 'pagination_default',
            originProp: 'default'
          },
          {
            prop: 'pagination_front',
            originProp: 'front'
          },
          {
            prop: 'pagination_end',
            originProp: 'end'
          }
        ]
        let option = {
          props: {
            data: this.currentPaginationData
          },
          on: {
            change: this.onPaginationChange
          },
          scopedSlots: {}
        }
        for (let n in paginationSlotList) {
          let dictData = paginationSlotList[n]
          let slotData = this.$scopedSlots[dictData.prop]
          option.scopedSlots[dictData.originProp] = slotData
        }
        renderPagination = this.$createElement(PaginationView, option)
      }
      return renderPagination
    },
    // 分页回调
    onPaginationChange(prop, current) {
      this.$emit('pagination', prop, current)
      if (this.paginationChange) {
        if (this.paginationChange === true) {
          // auto
          this.maindata.reloadData({
            prop: prop,
            data: current
          }, {
            from: 'page',
            act: prop
          }, true).then(() => {}, (err) => { console.error(err) })
        } else {
          this.paginationChange(prop, current)
        }
      }
    },
    onChoiceChange(idList, currentList) {
      this.$emit('choice', idList, currentList)
      this.maindata.changeChoice(idList, currentList, 'auto')
    }
  },
  // 主模板
  render(h) {
    let renderList = this.renderList()
    let renderPagination = this.renderPagination()
    let mainRenderList = [
      h('a-table', this.currentTableOption, renderList)
    ]
    if (renderPagination) {
      mainRenderList.push(renderPagination)
    }
    let render = h('div', {
      class: className
    }, mainRenderList)
    return render
  }
}
