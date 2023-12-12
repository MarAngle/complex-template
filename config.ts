import { h } from "vue"
import { layout } from "complex-plugin"
import { ChoiceData, PaginationData, AttrsValue } from "complex-data"
import dataConfig from "complex-data/config"
import DefaultList from 'complex-data/src/dictionary/DefaultList'
import InterfaceLayoutValue from "complex-data/src/lib/InterfaceLayoutValue"
import { AutoIndex } from "complex-component"
import componentConfig from "complex-component/config"
import AutoText from "./src/AutoText.vue"
import { getType } from "complex-utils"

export class LayoutLifeData {
  life: number
  data: number
  constructor() {
    this.life = 0
    this.data = 0
  }
  bind() {
    this.life = layout.$onLife('recount', {
      data: () => {
        this.data++
      }
    }) as number
  }
  unbind() {
    layout.$offLife('recount', this.life)
    this.data = 0
    this.life = 0
  }
}

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
    },
    renderTableValue(text: unknown, payload: {
      targetData: Record<PropertyKey, unknown>
      type: string
      index: number
      payload: {
        column: DefaultList
      }
    }) {
      if (payload.payload.column.show) {
        text = payload.payload.column.show(text, payload)
      }
      if (getType(text) === 'object') {
        text = JSON.stringify(text)
      }
      return text
    },
    renderAutoText(text: string, column: DefaultList, layoutLifeData: LayoutLifeData, attrs?: AttrsValue) {
      return h(AutoText, {
        text: text,
        auto: true,
        recount: layoutLifeData.data,
        tip: column.tip,
        ...componentConfig.parseAttrs(attrs)
      })
    },
    renderIndex(record: Record<PropertyKey, unknown>, index: number, pagination?: PaginationData) {
      let buildPagination = !!pagination
      if (pagination) {
        const depth = record[dataConfig.dictionary.depth]
        if (depth !== undefined && depth !== 0) {
          buildPagination = false
        }
      }
      return h(AutoIndex, {
        index: index,
        pagination: buildPagination ? pagination : undefined
      })
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
  },
  form: {
    layout: 'horizontal',
    layoutOption: {
      gutter: 24
    },
    labelAlign: 'right',
    checkOnRuleChange: true,
    checkOnInit: false,
    clearCheckOnInit: true,
    grid: {
      main: {
        span: 24
      },
      label: {
        span: 8
      },
      content: {
        span: 16
      }
    }
  },
  parseLayout(interfaceLayout: undefined | InterfaceLayoutValue, type?: string) {
    if (interfaceLayout) {
      return interfaceLayout.getValue(type)
    } else {
      return null
    }
  },
  parseGrid(interfaceLayout: undefined | InterfaceLayoutValue, prop: 'main' | 'label' | 'content', type?: string) {
    const layout = this.parseLayout(interfaceLayout, type)
    if (layout && layout.grid[prop]) {
      return layout.grid[prop]
    } else {
      return this.form.grid[prop]
    }
  },
  parseWidth(interfaceLayout: undefined | InterfaceLayoutValue, prop: string, type?: string) {
    const layout = this.parseLayout(interfaceLayout, type)
    if (layout && layout.width[prop]) {
      return layout.width[prop]
    }
  }
}

export default config
