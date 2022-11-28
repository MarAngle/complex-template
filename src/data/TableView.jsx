import _func from 'complex-func'
import AutoIndex from './../mod/AutoIndex'
import AutoText from './../mod/AutoText'
import PaginationView from './../mod/PaginationView'
import config from '../../config'
import utils from '../utils'

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
      default: function() {
        return config.TableView.size
      }
    },
    bordered: { // 是否网格
      type: Boolean,
      required: false,
      default: function() {
        return config.TableView.bordered
      }
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
    auto: {
      type: Object,
      required: false,
      default: null
    }
  },
  data() {
    return {
      layout: {
        main: {
          width: 0,
          height: 0
        },
        tableHead: {
          width: 0,
          height: 0
        },
        pagination: {
          width: 0,
          height: 0
        }
      }
    }
  },
  computed: {
    currentAuto() {
      return _func.setDataByDefault(this.auto, config.TableView.auto)
    },
    currentInOption() {
      let currentInOption = { ...this.inOption } || {}
      if (this.currentScrollOption.layout == 'count') {
        if (!currentInOption.style) {
          currentInOption.style = {}
        }
        if (currentInOption.style.minWidth === undefined) {
          currentInOption.style.minWidth = this.minWidth + 'px'
        }
      }
      utils.addClass(currentInOption, config.TableView.inClassName)
      currentInOption.ref = config.TableView.inRef
      return currentInOption
    },
    currentTableOption() {
      let currentTableOption = { ...this.tableOption } || {
        props: {}
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
      const defaultScrollOption = {
        recount: 0,
        layout: '',
        width: {
          type: '',
          data: 0,
          offset: config.TableView.scroll.width.offset
        },
        height: {
          type: '',
          data: 0,
          offset: config.TableView.scroll.height.offset
        }
      }
      if (this.scrollOption) {
        let type = _func.getType(this.scrollOption)
        let currentScrollOption
        if (type === 'object') {
          currentScrollOption = this.scrollOption
        } else {
          currentScrollOption = {
            layout: this.scrollOption
          }
        }
        utils.parseScrollProp(currentScrollOption, 'width')
        utils.parseScrollProp(currentScrollOption, 'height')
        currentScrollOption = _func.mergeData(defaultScrollOption, currentScrollOption)
        return currentScrollOption
      } else {
        return defaultScrollOption
      }
    },
    minWidth() {
      let width = 0
      for (let i = 0; i < this.currentColumnList.length; i++) {
        const pitem = this.currentColumnList[i]
        width += pitem.scrollWidth
      }
      if (this.rowSelection) {
        width += this.currentAuto.choiceWidth
      }
      if (this.$scopedSlots.expandedRowRender) {
        width += this.currentAuto.expandWidth
      }
      width += this.currentScrollOption.width.offset
      return width
    },
    currentScroll() {
      let currentScroll = null
      if (this.currentScrollOption.layout == 'auto') {
        currentScroll = {
          x: true
        }
      } else if (this.currentScrollOption.layout != 'count' && this.currentScrollOption.width.type) {
        if (this.currentScrollOption.width.type == 'fixed') {
          currentScroll = {
            x: this.currentScrollOption.width.data
          }
        } else {
          let width
          if (this.currentScrollOption.width.type == 'number') {
            width = this.currentScrollOption.width.data
          } else if (this.currentScrollOption.width.type == 'auto') {
            width = this.layout.main.width
          }
          if (this.minWidth > width) {
            if (!currentScroll) {
              currentScroll = {}
            }
            currentScroll.x = this.minWidth
          }
        }
      }
      if (this.currentScrollOption.height.type) {
        if (this.currentScrollOption.width.type == 'fixed') {
          if (!currentScroll) {
            currentScroll = {}
          }
          currentScroll.y = this.currentScrollOption.height.data
        } else {
          let height
          if (this.currentScrollOption.height.type == 'number') {
            height = this.currentScrollOption.height.data
          }
          if (height) {
            height = height - this.layout.pagination.height - this.layout.tableHead.height + this.currentScrollOption.height.offset
            if (height > 0) {
              if (!currentScroll) {
                currentScroll = {}
              }
              currentScroll.y = height
            }
          }
        }
      }
      return currentScroll
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
            let contentProp = pitem.dataIndex
            let contentSlot = this.$scopedSlots[contentProp] || pitem.localRender
            if (contentProp === this.currentAuto.index.prop && !contentSlot) {
              // 自动index
              let AutoIndexOption = {
                props: {
                  index: index,
                  format: pitem.$format
                }
              }
              if (this.currentAuto.index.pagination) {
                let buildAutoIndexPagination = true
                let currentPrototype = Object.getPrototypeOf(record)
                if (currentPrototype && currentPrototype !== Object.prototype) {
                  if (currentPrototype.$depth !== 0) {
                    buildAutoIndexPagination = false
                  }
                }
                if (buildAutoIndexPagination) {
                  AutoIndexOption.props.pagination = this.currentPaginationData
                }
              }
              return this.$createElement(AutoIndex, AutoIndexOption)
            }
            let data = pitem.func.show(text, { item: pitem, targetitem: record, type: this.listType, index: index })
            let dataType = _func.getType(data)
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
            if (pitem.ellipsis && pitem.autoText) {
              // 自动省略且自动换行
              let autoTextOption = {
                props: {
                  text: data,
                  auto: true,
                  recount: _func.page.recount.main,
                  tip: this.formatAutoTextTipOption(pitem.tip, this.currentAuto.tip)
                }
              }
              if (typeof pitem.autoText == 'function') {
                pitem.autoText(autoTextOption, record, index)
              }
              return this.$createElement(AutoText, autoTextOption)
            }
            return data
          }
          let titleSlotProp = pitem.dataIndex + '-title'
          let titleSlot = this.$scopedSlots[titleSlotProp]
          if (titleSlot && !pitem.title) {
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
      this.countCurrentLayout()
    }
  },
  mounted() {
    this.countCurrentLayout()
  },
  methods: {
    countCurrentLayout() {
      this.countTargetLayout('main', config.TableView.mainRef, false, (dom) => {
        let tableHead = dom.getElementsByTagName('thead')[0]
        this.layout.tableHead.width = tableHead.clientWidth
        this.layout.tableHead.height = tableHead.clientHeight
      })
      if (this.currentPaginationData) {
        this.countTargetLayout('pagination', config.TableView.PaginationView.ref, true)
      } else {
        this.countTargetLayout('pagination')
      }
    },
    countTargetLayout(prop, target, isVNode, cb) {
      if (target) {
        this.$nextTick(() => {
          let dom = this.$refs[target]
          if (dom && isVNode) {
            dom = dom.$el
          }
          if (dom) {
            this.layout[prop].width = dom.clientWidth
            this.layout[prop].height = dom.clientHeight
            if (cb) {
              cb(dom)
            }
          } else {
            this.countTargetLayout(prop, target, isVNode, cb)
          }
        })
      } else {
        this.layout[prop].width = 0
        this.layout[prop].height = 0
      }
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
        let h = this.$createElement
        for (let n in paginationSlotList) {
          let dictData = paginationSlotList[n]
          let slotData = this.$scopedSlots[dictData.prop]
          if (!slotData) {
            let autoSlot = this.currentAuto.pagination[dictData.originProp]
            if (autoSlot) {
              let type = _func.getType(autoSlot)
              if (type !== 'object') {
                autoSlot = {
                  type: autoSlot
                }
              }
              if (config.slot.pagination[autoSlot.type]) {
                let listdata = this.maindata
                slotData = function(payload) {
                  return config.slot.pagination[autoSlot.type](h, payload, autoSlot.option, listdata)
                }
              }
            }
          }
          option.scopedSlots[dictData.originProp] = slotData
        }
        renderPagination = h(PaginationView, option)
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
            force: {
              ing: true
            },
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
      h('a-table', { ...this.currentTableOption }, [])
    ]
    if (renderPagination) {
      mainRenderList.push(renderPagination)
    }
    let inRender = h('div', { ...this.currentInOption }, mainRenderList)
    let render = h('div', {
      class: config.TableView.className,
      ref: config.TableView.mainRef
    }, [ inRender ])
    return render
  }
}
