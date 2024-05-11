import { defineComponent, h, PropType } from "vue"
import { camelToLine } from "complex-utils"
import { MenuValue } from "complex-data/src/type"
import { tablePayload } from "../TableView"
import { colorKeys } from "../../config"

export interface TableMenuValue extends MenuValue<never, [tablePayload]> {
  color?: | colorKeys
  hidden?: boolean | ((payload: tablePayload) => boolean)
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
        let classList = ['complex-list-table-menu-item']
        if (menuItem.color) {
          classList.push('complex-color-' + camelToLine(menuItem.color, '-'))
        }
        if (menuItem.class) {
          if (typeof menuItem.class === 'function') {
            classList = classList.concat(menuItem.class(payload))
          } else {
            classList = classList.concat(menuItem.class)
          }
        }
        list.push(h('span', {
          class: classList.join(' '),
          onClick: () => {
            this.$emit('menu', menuItem.prop, payload)
          },
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
      class: 'complex-list-table-menu'
    }, {
      default: () => {
        return this.renderList(this.list, this.payload)
      }
    })
  }
})
