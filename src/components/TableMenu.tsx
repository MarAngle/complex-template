import { defineComponent, h, PropType } from "vue"
import { camelToLine, debounce } from "complex-utils"
import { MenuValue } from "complex-data/type"
import { tablePayload } from "../TableView"
import config, { colorKeys } from "../../config"

export interface TableMenuValue extends MenuValue<never, [tablePayload]> {
  color?: | colorKeys
  class?: string[] | ((payload: tablePayload) => string[])
  option?: Record<string, unknown>
  children?: TableMenuValue[]
}

export default defineComponent({
  name: 'TableMenu',
  props: {
    list: {
      type: Object as PropType<TableMenuValue[]>,
      required: true
    },
    payload: {
      type: Object as PropType<tablePayload>,
      required: true
    }
  },
  methods: {
    renderList(menuList: TableMenuValue[], payload: tablePayload) {
      const list: unknown[] = []
      for (let i = 0; i < menuList.length; i++) {
        const menuItem = menuList[i]
        let hidden = menuItem.hidden
        if (hidden) {
          if (typeof hidden === 'function') {
            hidden = hidden(payload)
          }
          if (hidden) {
            break
          }
        }
        let disabled = menuItem.disabled
        if (disabled) {
          if (typeof disabled === 'function') {
            disabled = disabled(payload)
          }
        }
        let classList = ['complex-table-menu-item']
        if (menuItem.color) {
          classList.push('complex-color-' + camelToLine(menuItem.color, '-'))
        }
        if (disabled) {
          classList.push('complex-disabled complex-color-disabled')
        }
        if (menuItem.class) {
          if (typeof menuItem.class === 'function') {
            classList = classList.concat(menuItem.class(payload))
          } else {
            classList = classList.concat(menuItem.class)
          }
        }
        const onClick = () => {
          config.parseMenuConfirm(menuItem.confirm, () => {
            this.$emit('menu', menuItem.prop, payload)
          })
        }
        list.push(h('span', {
          class: classList.join(' '),
          onClick: menuItem.debounce ? debounce(onClick, menuItem.debounce, true) : onClick,
          ...menuItem.option
        }, {
          default: () => menuItem.name
        }))
      }
      return list
    },
  },
  /**
   * 主要模板

   * @returns {VNode}
   */
  render() {
    return h('span', {
      class: 'complex-table-menu'
    }, {
      default: () => {
        return this.renderList(this.list, this.payload)
      }
    })
  }
})
