import componentConfig from "complex-component/config"
import { PaginationData } from "complex-data"

const config = {
  component: componentConfig,
  table: {
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
  pagination: {
    formatInfo(payload: { pagination: PaginationData, auto: boolean }) {
      return `共${payload.pagination.page.total}页/${payload.pagination.count}条`
    }
  }
}

export default config
