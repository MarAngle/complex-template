import _func from 'complex-func'
import AutoText from './../mod/AutoText'
import PaginationView from './../mod/PaginationView'
import config from '../../config'
import './FormView.css'

export default {
  name: 'TableView',
  props: {
    maindata: { // ListData的实例
      type: Object,
      required: true
    },
    columnList: { // 定制列配置
      type: Array,
      required: true
    },
    formatColumn: { // 对依照pitem格式化完成的columnItem做格式化
      type: Function,
      required: false
    },
    listType: { // 列表的mod
      type: String,
      required: false,
      default: 'list'
    },
    listData: { // 单独指定列表数据，不从maindata.data.list中取值
      type: Array,
      required: false
    },
    size: { // default / middle / small
      type: String,
      required: false,
      default: config.TableView.size
    },
    bordered: { // 是否网格
      type: Boolean,
      required: false,
      default: config.TableView.bordered
    },
    tableOption: { // table的设置项
      type: Object,
      required: false,
      default: null
    },
    inOption: { // indiv的设置项
      type: Object,
      required: false,
      default: null
    },
    scrollOption: { // tips全局option
      type: [Number, String, Object],
      required: false,
      default: 0
    },
    autoTextTipOption: { // tips全局option
      type: [String, Object],
      required: false,
      default: ''
    },
    paginationData: { // 单独制定分页器数据，不从maindata中取值
      type: Object,
      required: false,
      default: null
    },
    paginationChange: { // 分页器回调，指定则不自动进行回调
      type: [Boolean, Function],
      required: false,
      default: true
    },
    choiceWidth: {
      type: Number,
      required: false,
      default: config.TableView.choiceWidth
    },
    expandWidth: {
      type: Number,
      required: false,
      default: config.TableView.expandWidth
    }
  },
  data() {
    return {
      tableWidth: 0
    }
  },
  computed: {
    currentInOption() {
      let currentInOption = this.inOption
      if (!currentInOption) {
        currentInOption = {}
      }
      if (this.currentScrollOption.layout == 'auto' && this.minWidth) {
        if (!currentInOption.style) {
          currentInOption.style = {}
        }
        if (currentInOption.style.minWidth === undefined) {
          currentInOption.style.minWidth = this.minWidth + 'px'
        }
      }
      currentInOption.class = config.TableView.inClassName
      currentInOption.ref = config.TableView.inRef
      return currentInOption
    },
    currentTableOption() {
      let currentTableOption = this.tableOption
      if (!currentTableOption) {
        currentTableOption = {
          props: {}
        }
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
      if (!currentTableOption.props.scroll && this.currentScroll) {
        currentTableOption.props.scroll = this.currentScroll
      }
      currentTableOption.ref = config.TableView.ref
      return currentTableOption
    },
    currentScrollOption() {
      const defaultOption = {
        type: 'auto',
        layout: '',
        width: 0,
        recount: 0,
        extraWidth: config.TableView.scrollExtraWidth
      }
      let type = this._func.getType(this.scrollOption)
      let currentScrollOption
      if (type === 'object') {
        currentScrollOption = this.scrollOption
      } else if (type === 'number') {
        currentScrollOption = {
          type: 'number',
          width: this.scrollOption
        }
      } else if (type == 'string') {
        currentScrollOption = {
          type: this.scrollOption
        }
      }
      currentScrollOption = this._func.mergeData(defaultOption, currentScrollOption)
      return currentScrollOption
    },
    minWidth() {
      let width = 0
      for (let i = 0; i < this.currentColumnList.length; i++) {
        const pitem = this.currentColumnList[i];
        if (!pitem.width || typeof pitem.width !== 'number') {
          if (!pitem.scrollWidth || typeof pitem.scrollWidth !== 'number') {
            width = 0
            break
          } else {
            width += pitem.scrollWidth
          }
        } else {
          width += pitem.width
        }
      }
      if (width) {
        if (this.rowSelection) {
          width += this.choiceWidth
        }
        if (this.$scopedSlots.expandedRowRender) {
          width += this.expandWidth
        }
        width += this.currentScrollOption.extraWidth
      }
      return width
    },
    currentScroll() {
      if (this.currentScrollOption.type && this.currentScrollOption.layout != 'auto') {
        let tableWidth
        if (this.currentScrollOption.type == 'number') {
          tableWidth = this.currentScrollOption.width
        } else if (this.currentScrollOption.type == 'auto') {
          tableWidth = this.tableWidth
        }
        if (this.minWidth > tableWidth) {
          return {
            x: this.minWidth
          }
        }
      }
      return null
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
  watch: {
    'currentScrollOption.recount': function() {
      this.setCurrentWidth()
    }
  },
  mounted() {
    this.setCurrentWidth()
  },
  methods: {
    setCurrentWidth() {
      this.$nextTick(() => {
        if (this.$refs[config.TableView.mainRef]) {
          this.tableWidth = this.$refs[config.TableView.mainRef].clientWidth
        } else {
          this.setCurrentWidth()
        }
      })
    },
    /**
     * 获取Tips设置项
     * @param {object} pitemTip pitem定义的设置项
     * @param {object} mainTip 总设置项
     * @returns {object}
     */
    formatAutoTextTipOption(pitemTip, mainTip) {
      let tipOption = pitemTip || mainTip
      return tipOption
    },
    /**
     * 加载分页器
     * @returns {VNode}
     */
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
          class: config.TableView.PaginationView.className,
          ref: config.TableView.PaginationView.ref,
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
    /**
     * 分页回调
     */
    onPaginationChange(prop, current) {
      this.$emit('pagination', prop, current)
      if (this.paginationChange) {
        if (this.paginationChange === true) {
          // auto
          this.maindata.reloadData({
            sync: true,
            page: {
              prop: prop,
              data: current
            },
            choice: {
              from: 'page',
              act: prop
            }
          })
        } else {
          this.paginationChange(prop, current)
        }
      }
    },
    /**
     * 选项回调
     * @param {string[]} idList
     * @param {object[]} currentList
     */
    onChoiceChange(idList, currentList) {
      this.$emit('choice', idList, currentList)
      this.maindata.changeChoice(idList, currentList, 'auto')
    }
  },
  /**
   * 主模板
   * @param {*} h createElement
   * @returns {VNode}
   */
  render(h) {
    let renderPagination = this.renderPagination()
    let mainRenderList = [
      h('a-table', this.currentTableOption, [])
    ]
    if (renderPagination) {
      mainRenderList.push(renderPagination)
    }
    let inRender = h('div', this.currentInOption, mainRenderList)
    let render = h('div', {
      class: config.TableView.className,
      ref: config.TableView.mainRef
    }, [ inRender ])
    return render
  }
}
