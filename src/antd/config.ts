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
  }
}

export default config
