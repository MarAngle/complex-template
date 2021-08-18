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
    autoIndex: {
      prop: '_index',
      pagination: true
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
  }
}

export default config
