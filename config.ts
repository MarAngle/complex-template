import componentConfig from "complex-component/config"
import { PaginationData } from "complex-data"

const config = {
  component: componentConfig,
  pagination: {
    formatInfo(data: PaginationData) {
      return `共${data.page.total}页/${data.count}条`
    }
  }
}

export default config
