import { defineComponent, h, PropType } from "vue"
import { notice } from "complex-plugin"
import { ComplexList } from "complex-data"
import { DictionaryEditMod, DictionaryEditModInitOption } from "complex-data/src/lib/DictionaryValue"
import AutoSpin from "./components/AutoSpin.vue"
import SearchView from "./SearchView"
import TableView, { tablePayload } from "./TableView"
import SimpleTableView from "./SimpleTableView"
import ModalView from "./ModalView"
import EditView from "./EditView"
import { FormItemPayloadType } from "./components/AutoFormItem"
import config from "./../config"

export type optionType = {
  search?: Record<string, unknown>
  table?: Record<string, unknown>
  editModal?: Record<string, unknown>
  edit?: Record<string, unknown>
  infoModal?: Record<string, unknown>
  info?: Record<string, unknown>
  childModal?: Record<string, unknown>
  child?: Record<string, unknown>
}

export type renderType = {
  top?: (...args: unknown[]) => unknown
  search?: Record<string, (...args: unknown[]) => unknown>
  table?: Record<string, (payload: tablePayload) => unknown>
  edit?: Record<string, (...args: unknown[]) => unknown>
  info?: Record<string, (...args: unknown[]) => unknown>
  child?: Record<string, (...args: unknown[]) => unknown>
}

export type menuValue = {
  name: string
  prop: string
  hidden?: boolean | ((payload: tablePayload) => boolean)
  class?: string[] | ((payload: tablePayload) => string[])
  option?: Record<string, unknown>
  children?: menuValue[]
}

export default defineComponent({
  name: 'ListView',
  props: {
    listData: {
      type: Object as PropType<ComplexList>,
      required: true
    },
    simpleTable: {
      type: Boolean,
      required: false
    },
    components: {
      type: Array as PropType<('spin' | 'search' | 'table' | 'info' | 'edit' | 'child')[]>,
      required: false
    },
    option: {
      type: Object as PropType<optionType>,
      required: false
    },
    render: {
      type: Object as PropType<renderType>,
      required: false
    },
    menu: {
      type: Object as PropType<{ search?: (DictionaryEditMod | DictionaryEditModInitOption)[], table?: menuValue[] }>,
      required: false
    }
  },
  computed: {
    operate() {
      return this.listData.getStatus('operate')
    },
    currentComponents() {
      return this.components || [...config.list.components]
    },
    currentOption() {
      return this.option || {}
    },
    currentRender() {
      return this.render || {}
    },
    currentMenu() {
      return this.menu || {}
    }
  },
  methods: {
    renderSpin() {
      if (this.currentComponents.indexOf('spin') > -1) {
        return h(AutoSpin, { spinning: this.operate === 'ing' })
      } else {
        return null
      }
    },
    renderSearch() {
      if (this.currentComponents.indexOf('search') > -1 && this.listData.$module.search) {
        return h(SearchView, {
          ref: 'search-view',
          search: this.listData.$module.search,
          layout: 'inline',
          menu: this.currentMenu.search,
          onMenu: this.onSearchMenu,
          ...this.currentOption.search
        })
      } else {
        return null
      }
    },
    renderTop() {
      const render = this.$slots.top || this.currentRender.top
      if (render) {
        return render()
      } else {
        return null
      }
    },
    renderTable() {
      if (this.currentComponents.indexOf('table') > -1) {
        const tableOption = {
          listData: this.listData,
          ...this.currentOption.table
        }
        const tableSlot = {
          menu: ({ payload }: { payload: tablePayload }) => {
            return this.renderTableMenu(payload)
          },
          ...this.currentRender.table
        }
        return h(!this.simpleTable ? TableView : SimpleTableView, tableOption, tableSlot)
      } else {
        return null
      }
    },
    renderTableMenu(payload: tablePayload) {
      if (this.currentMenu.table) {
        return h('span', {
          class: 'complex-list-table-menu'
        }, {
          default: () => {
            return this.renderTableMenuList(this.currentMenu.table!, payload)
          }
        })
      }
    },
    renderTableMenuList(menuList: menuValue[], payload: tablePayload) {
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
            this.onTableMenu(menuItem.prop, payload)
          },
          ...menuItem.option
        }, {
          default: () => menuItem.name
        }))
      }
      return list
    },
    renderEdit() {
      if (this.currentComponents.indexOf('edit') > -1) {
        const editModalOption = {
          ref: 'edit-modal',
          menu: ['cancel', 'submit'],
          submit: this.editSubmit,
          ...this.currentOption.editModal
        }
        const editModalSlot = {
          default: () => {
            const editFormOption = {
              ref: 'edit-view',
              dictionary: this.listData.$module.dictionary!
            }
            return h(EditView, editFormOption)
          }
        }
        return h(ModalView, editModalOption, editModalSlot)
      } else {
        return null
      }
    },
    renderChild() {
      if (this.currentComponents.indexOf('child') > -1) {
        //
      } else {
        return null
      }
    },
    onSearchMenu(prop: string, payload: FormItemPayloadType) {
      this.$emit('menu', 'search', prop, payload)
      if (prop === 'search') {
        this.listData.setSearch()
      } else if (prop === 'reset') {
        this.listData.resetSearch()
      } else if (prop === 'build') {
        this.onEdit()
      } else if (prop === 'delete') {
        notice.confirm('确认进行删除操作吗？', '警告', (act: string) => {
          if (act === 'ok') {
            this.listData.triggerMethod('$multipleDeleteData', [this.listData.$module.choice ? this.listData.$module.choice.getList() : []], true)
          }
        })
      } else if (prop === 'export') {
        this.listData.triggerMethod('$exportData', [], true)
      }
    },
    onTableMenu(act: string, payload?: tablePayload) {
      this.$emit('menu', 'table', act, payload)
      if (act === 'build') {
        this.onEdit()
      } else if (act === 'change') {
        this.onEdit(payload!.targetData)
      } else if (act === 'delete') {
        notice.confirm('确认进行删除操作吗？', '警告', (act: string) => {
          if (act === 'ok') {
            this.listData.triggerMethod('$deleteData', [payload!.targetData], true)
          }
        })
      }
    },
    onEdit(record?: Record<PropertyKey, unknown>) {
      let type = 'build'
      let name = '新增'
      if (record) {
        type = 'change'
        name = '编辑'
      }
      if (this.currentOption.editModal && this.currentOption.editModal.formatName) {
        name = (this.currentOption.editModal.formatName as any)(name, type) as string
      }
      (this.$refs['edit-modal'] as InstanceType<typeof ModalView>).show(name)
      this.$nextTick(() => {
        (this.$refs['edit-view'] as InstanceType<typeof EditView>).show(type, record)
      })
    },
    editSubmit() {
      return new Promise((resolve, reject) => {
        (this.$refs['edit-view'] as InstanceType<typeof EditView>).submit().then(res => {
          if (res.type === 'build') {
            this.listData.triggerMethod('$buildData', [res.targetData], true).then(() => {
              resolve(res)
            }).catch((err: unknown) => {
              reject(err)
            })
          } else if (res.type === 'change') {
            this.listData.triggerMethod('$changeData', [res.targetData, res.originData, res.type], true).then(() => {
              resolve(res)
            }).catch((err: unknown) => {
              reject(err)
            })
          } else {
            console.error(`${res.type}对应的submit函数未定义，请单独定义ListView.option.editModal.submit的函数逻辑`)
            reject({})
          }
        }).catch((err: unknown) => {
          reject(err)
        })
      })
    }
  },
  /**
   * 主要模板

   * @returns {VNode}
   */
  render() {
    const render = h('div', { class: 'complex-list', style: { position: 'relative' } }, {
      default: () => [this.renderSpin(), this.renderSearch(), this.renderTop(), this.renderTable(), this.renderEdit(), this.renderChild()]
    })
    return render
  }
})
