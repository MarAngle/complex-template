import utils from './src/utils'

const TableViewClass = 'complex-table-view'
const TableViewPaginationClass = utils.countClass(TableViewClass, 'pagination')
const TableViewPaginationSlotClass = utils.countClass(TableViewPaginationClass, 'slot')
const FormViewClass = 'complex-form-view'

let config = {
  TableView: {
    mainRef: 'MainTableView',
    inRef: 'InTableView',
    ref: 'TableView',
    className: TableViewClass,
    inClassName: utils.countClass(TableViewClass, 'in'),
    size: 'default',
    bordered: true,
    scroll: {
      width: {
        offset: 3
      },
      height: {
        offset: -1.6
      }
    },
    PaginationView: {
      className: TableViewPaginationClass,
      ref: 'TablePaginationView'
    },
    auto: {
      expandWidth: 50,
      choiceWidth: 60,
      index: {
        prop: '_index',
        pagination: true
      },
      tips: null,
      pagination: {
        default: 'choice',
        front: 'total',
        end: false
      }
    }
  },
  FormView: {
    className: FormViewClass,
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
    },
    auto: {
      zIndex: {
        num: 100,
        act: 'down'
      },
      item: {
        auto: true
      },
      foot: {
        loading: undefined,
        disabled: undefined,
        type: 'auto',
        data: 'props',
        layout: {
          props: {
            span: 24
          }
        },
        option: {}
      }
    }
  },
  slot: {
    pagination: {
      total: function(h, payload, option) {
        let mainClass = utils.countClass(TableViewPaginationSlotClass, 'total')
        let itemClass = utils.countClass(mainClass, 'item')
        return h('span', { class: mainClass }, [
          h('span', {
            class: [
              itemClass,
              utils.countClass(itemClass, 'page')
            ]
          }, `共${payload.total}页`),
          h('span', {
            class: [
              itemClass,
              utils.countClass(itemClass, 'num')
            ]
          }, `${payload.totalNum}条`)
        ])
      },
      choice: function(h, payload, option, listdata) {
        if (listdata.getModule('choice').getShow()) {
          if (!option) {
            option = {}
          }
          let size = listdata.getChoiceData('id').length
          let mainClass = utils.countClass(TableViewPaginationSlotClass, 'choice')
          let itemClass = utils.countClass(mainClass, 'item')
          let emptyItemClass = utils.countClass(itemClass, 'empty')
          let itemClassList = [ itemClass ]
          if (size == 0) {
            itemClassList.push(emptyItemClass)
          }
          let itemList = [
            h('span', {
              class: [
                ...itemClassList,
                utils.countClass(itemClass, 'text')
              ]
            }, `已选择：`),
            h('span', {
              class: [
                ...itemClassList,
                utils.countClass(itemClass, 'size')
              ]
            }, `${size}`)
          ]
          if (option.menu) {
            let menu = h('span', {
              class: [
                ...itemClassList,
                utils.countClass(itemClass, 'menu')
              ],
              on: {
                click: function() {
                  listdata.resetChoice(true)
                }
              }
            }, '取消选择')
            itemList.push(menu)
          }
          return h('span', {
            class: mainClass
          }, itemList)
        }
      }
    }
  },
  AutoModal: {
    defaultWidth: 520,
    top: 100,
    bottom: 100,
    header: 55,
    menu: 53,
    padding: {
      width: 48,
      height: 48
    }
  },
  AutoMenu: {
    auto: {
      menu: {
        width: '100px',
        location: 'right',
        style: null
      },
      open: {
        icon: 'up',
        text: '关闭',
        style: {}
      },
      close: {
        icon: 'down',
        text: '打开',
        style: {}
      }
    }
  }
}

export default config
