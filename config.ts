import componentConfig from "complex-component/config"
import { ChoiceData, PaginationData } from "complex-data"

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
  choice: {
    auto: true,
    menu: false,
    formatInfo(payload: { choice: ChoiceData, size: number, auto: boolean, menu: boolean }) {
      return `已选择${payload.size}条数据`
    }
  },
  pagination: {
    formatInfo(payload: { pagination: PaginationData, auto: boolean }) {
      return `共${payload.pagination.page.total}页/${payload.pagination.count}条`
    }
  }
}

export default config
