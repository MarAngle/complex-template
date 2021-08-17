let config = {
  TableView: {
    mainRef: 'MainTableView',
    className: 'complex-table-view',
    ref: 'TableView',
    size: 'default',
    autoLayout: true,
    bordered: true,
    expandWidth: 50,
    choiceWidth: 60
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
    itemWidth: {
      inline: '100px',
      horizontal: '100%',
      vertical: '100%'
    },
    footMenu: {
      style: {
        multiple: {
          flex: 'none',
          marginLeft: '8px',
          marginRight: '8px'
        },
        single: {}
      },
      mainStyle: {
        multiple: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center'
        },
        single: {}
      }
    },
    select: {
      paginationAreaOption: {
        style: {
          borderTop: '1px #ccc solid',
          display: 'flex',
          justifyContent: 'flex-end',
          padding: '4px 12px',
          alignItems: 'center'
        },
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
