import { PaginationData } from "complex-data"

const config = {
  TableView: {
    size: 'default',
    bordered: true,
    auto: {
      expandWidth: 50,
      choiceWidth: 60,
      index: {
        prop: '$index',
        pagination: true
      },
      pagination: {
        auto: true,
        default: 'choice',
        front: 'total',
        end: false
      }
    }
  },
  Pagination: {
    formatInfo(data: PaginationData) {
      return `共${data.total}页/${data.num}条`
    }
  },
  FormView: {
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
          mousedown: function (e: Event) {
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
}

export default config
