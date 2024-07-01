import { h } from "vue"
import { getType, camelToLine, downloadFile } from "complex-utils"
import { PluginLayout } from "complex-plugin"
import { ChoiceData, PaginationData, AttrsValue, DictionaryData, DictionaryValue } from "complex-data"
import DefaultList from 'complex-data/src/dictionary/DefaultList'
import { GridValue } from "complex-data/src/lib/GridParse"
import { FileValue } from "complex-data/src/lib/FileValue"
import { MenuValue } from "complex-data/type"
import { AutoIndex, FileView } from "complex-component"
import componentConfig from "complex-component/config"
import AutoText from "./src/AutoText.vue"
import { modalLayoutOption } from "./src/ModalView"
import { tablePayload } from "./src/TableView"
import $icon from "./icon"
import MultipleImport from "./src/MultipleImport"
import SingleImport from "./src/SingleImport"
import { Button } from "ant-design-vue"
import { ButtonType } from "ant-design-vue/es/button"

export class LayoutLifeData {
  life: string
  data: number
  constructor() {
    this.life = ''
    this.data = 0
  }
  bind(layout: PluginLayout) {
    this.life = layout.onLife('recount', {
      data: () => {
        this.data++
      }
    })!
  }
  unbind(layout: PluginLayout) {
    layout.offLife('recount', this.life)
    this.data = 0
    this.life = ''
  }
}

export type colorKeys = keyof typeof config.style.color

const config = {
  component: componentConfig,
  initStyle() {
    const style = document.createElement('style')
    let innerHTML = ''
    for (const name in config.style.color) {
      const styleName = 'complex-color-' + camelToLine(name, '-')
      innerHTML += `\n.${styleName}{ color: ${config.style.color[name as colorKeys]}; }`
    }
    innerHTML += `\n.complex-auto-index{ color: ${config.style.color.primary}; }`
    // 设置样式规则
    style.innerHTML = innerHTML
    // 将样式元素节点添加到页面头部
    document.head.appendChild(style)
  },
  parseGrid(gridValue: GridValue) {
    return gridValue
  },
  showValue(value: unknown): string | number | undefined {
    if (getType(value) !== 'object') {
      return value as string | number | undefined
    } else {
      return JSON.stringify(value)
    }
  },
  style: {
    color: {
      primary: '#1677ff',
      link: '#1677ff',
      success: '#52c41a',
      warning: '#faad14',
      danger: '#ff4d4f',
      disabled: 'rgba(0, 0, 0, 0.25)',
      text: 'rgba(0, 0, 0, 0.88)',
      secondaryText: 'rgba(0, 0, 0, 0.45)'
    }
  },
  search: {
    inline: false
  },
  edit: {
    inline: false,
    observe: false
  },
  info: {
    inline: false,
    observe: false
  },
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
    renderTableValue(text: unknown, payload: tablePayload) {
      const target = payload.payload.target
      if (target.parse) {
        text = target.parse(text, payload)
      }
      const parent = target.$getParent() as DictionaryValue
      if (parent && parent.parse) {
        text = parent.parse(text, payload)
      }
      return config.showValue(text)
    },
    renderAutoText(text: string, column: DefaultList, layoutLifeData: LayoutLifeData, payload: tablePayload, attrs?: AttrsValue) {
      return h(AutoText, {
        text: text,
        auto: true,
        recount: layoutLifeData.data,
        tip: column.$tip,
        ...componentConfig.parseAttrs(attrs, payload)
      })
    },
    renderIndex(record: Record<PropertyKey, unknown>, index: number, pagination?: PaginationData) {
      let buildPagination = !!pagination
      if (pagination) {
        const depth = record[DictionaryData.$depth]
        if (depth != undefined && depth !== 0) {
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
    show: true,
    menu: true,
    emptyContent: '未选择',
    formatInfo(payload: { choice: ChoiceData, size: number, menu: boolean }) {
      return `已选择 ${payload.size}条数据`
    }
  },
  pagination: {
    formatInfo(payload: { pagination: PaginationData }) {
      return `共${payload.pagination.page.total}页/${payload.pagination.count}条`
    }
  },
  form: {
    checkOnRuleChange: true,
    checkOnInit: false,
    clearCheckOnInit: true
  },
  modal: {
    width: 520,
    layout: {
      type: 'auto',
      top: 100,
      bottom: 100,
      header: 24 + 8,
      menu: 32 + 12,
      padding: [24, 24, 24, 24],
      mainPadding: [20, 24, 20, 24]
    } as modalLayoutOption,
    menu: {
      close: {
        type: 'default',
        name: '关闭',
        prop: 'close',
        debounce: 200
      },
      cancel: {
        type: 'default',
        name: '取消',
        prop: 'close',
        debounce: 200
      },
      submit: {
        type: 'primary',
        name: '确认',
        prop: 'submit',
        debounce: 200
      }
    } as Record<string, MenuValue>,
    getMenu(prop: string, targetOption?: Partial<MenuValue>): MenuValue {
      const data = this.menu[prop as keyof typeof config.modal.menu]
      if (data) {
        return {
          ...data,
          ...targetOption
        }
      } else {
        console.error(`${prop}未获取到menu初始化参数，请检查代码！`)
        return {
          type: 'default',
          name: prop,
          prop: prop,
          ...targetOption
        }
      }
    }
  },
  list: {
    components: ['spin', 'search', 'table', 'edit'] as ('spin' | 'search' | 'table' | 'info' | 'edit' | 'child')[]
  },
  import: {
    renderMenu(target: (InstanceType<typeof MultipleImport> | InstanceType<typeof SingleImport>)) {
      const { icon = 'upload', type = 'default', name = '上传' } = target.button || {}
      const props = {
        class: 'complex-import-menu',
        loading: target.loading || target.operate,
        type: type === 'danger' ? 'primary' : type as ButtonType,
        danger: type === 'danger',
        icon: $icon.parse(icon),
        disabled: target.disabled,
        onClick: () => {
          (target.$refs.file as InstanceType<typeof FileView>).$el.click()
        }
      }
      const menuRender = target.$slots.menu || (target.render && target.render.menu)
      if (menuRender) {
        return menuRender({
          props,
          name: name,
          payload: {
            value: target.currentValue
          }
        })
      }
      return h(Button, props, {
        default: () => name
      })
    },
    renderContent(file: FileValue, disabled: boolean, onDelete: (file: FileValue) => void) {
      return h('div', {
        class: 'complex-import-content'
      }, {
        default: () => [
          h('span', {
            class: file.url ? 'complex-import-content-name complex-color-link' : 'complex-import-content-name',
            onClick: () => {
              if (file.url) {
                // 文件对象类型以及存在下载链接时，点击下载
                downloadFile(file.url, file.name)
              }
            }
          }, {
            default: () => file.name
          }),
          h('span', {
            class: 'complex-import-content-delete complex-color-danger',
            onClick () {
              onDelete(file)
            }
          }, disabled ? [] : [$icon.parse('close')]),
        ]
      })
    }
  }
}


export default config
