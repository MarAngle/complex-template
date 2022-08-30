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
      tips: null,
      pagination: {
        default: 'choice',
        front: 'total',
        end: false
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
