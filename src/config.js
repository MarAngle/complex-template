let config = {
  TableView: {
    className: 'complex-table-view',
    ref: 'TableView'
  },
  FormView: {
    className: 'complex-form-view',
    ref: 'FormView',
    layout: 'horizontal',
    labelAlign: 'right',
    checkOnRuleChange: true,
    checkOnInit: false,
    clearCheckOnInit: true,
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
