let config = {
  TableView: {
    mainRef: 'MainTableView',
    inRef: 'InTableView',
    ref: 'TableView',
    className: 'complex-table-view',
    inClassName: 'complex-table-view-in',
    size: 'default',
    autoLayout: false,
    bordered: true,
    expandWidth: 50,
    choiceWidth: 60,
    scroll: {
      width: {
        offset: 3
      },
      height: {
        offset: -1.6
      }
    },
    PaginationView: {
      className: 'complex-table-view-pagination',
      ref: 'TablePaginationView'
    },
    auto: {
      index: {
        prop: '_index',
        pagination: true
      },
      pagination: {
        default: 'choice',
        front: 'total',
        end: false
      }
    }
  },
  FormView: {
    className: 'complex-form-view',
    ref: 'FormView',
    layout: 'horizontal',
    layoutOption: {
      props: {
        gutter: 24
      }
    },
    labelAlign: 'right',
    checkOnRuleChange: true,
    checkOnInit: false,
    clearCheckOnInit: true,
    select: {
      paginationAreaOption: {
        on: {
          mousedown: function (e) {
            e.preventDefault()
          }
        }
      }
    }
  },
  slot: {
    pagination: {
      total: function(h, payload, option) {
        return h('span', { class: 'complex-table-view-pagination-slot-total' }, [
          h('span', { class: ['complex-table-view-pagination-slot-total-item'] }, `共${payload.total}页`),
          h('span', { class: ['complex-table-view-pagination-slot-total-item'] }, `${payload.totalNum}条`)
        ])
      },
      choice: function(h, payload, option, listdata) {
        if (listdata.getModule('choice').getShow()) {
          if (!option) {
            option = {}
          }
          let size = listdata.getChoiceData('id').length
          let style = {}
          if (option.hidden) {
            if (size == 0) {
              style.display = 'none'
            }
          }
          let itemClass = ['complex-table-view-pagination-slot-choice-item']
          if (size == 0) {
            itemClass.push('complex-table-view-pagination-slot-choice-item-empty')
          }
          let itemList = [
            h('span', { class: itemClass }, `已选择：`),
            h('span', { class: itemClass }, `${size}`)
          ]
          if (option.menu) {
            let menu = h('span', {
              class: [...itemClass, 'complex-table-view-pagination-slot-choice-item-menu'],
              on: {
                click: function() {
                  listdata.resetChoice(true)
                }
              }
            }, '取消选择')
            itemList.push(menu)
          }
          return h('span', {
            class: 'complex-table-view-pagination-slot-choice',
            style: style
          }, itemList)
        }
      }
    }
  }
}

export default config
