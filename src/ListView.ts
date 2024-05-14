import { defineComponent, h, PropType } from "vue"
import { notice } from "complex-plugin"
import { ComplexList } from "complex-data"
import AutoSpin from "./components/AutoSpin.vue"
import { AutoItemPayloadType } from "./components/AutoItem"
import SearchArea, { SearchAreaProps } from "./SearchArea"
import TableView, { tablePayload, TableViewProps } from "./TableView"
import SimpleTableView from "./SimpleTableView"
import ModalView, { ModalViewProps } from "./ModalView"
import EditArea, { EditAreaProps } from "./EditArea"
import config from "./../config"

export interface ListModalViewProps extends ModalViewProps {
  formatName?: (name: string, payload?: unknown) => string
}

export type componentsProps = {
  search?: Partial<SearchAreaProps>
  table?: Partial<TableViewProps>
  editModal?: Partial<ListModalViewProps>
  edit?: Partial<EditAreaProps>
  infoModal?: Partial<ListModalViewProps>
  info?: Record<string, unknown>
  childModal?: Partial<ListModalViewProps>
  child?: Partial<ListViewProps>
}

export type renderType = {
  top?: (...args: unknown[]) => unknown
  search?: Record<string, (...args: unknown[]) => unknown>
  table?: Record<string, (payload: tablePayload) => unknown>
  edit?: Record<string, (...args: unknown[]) => unknown>
  info?: Record<string, (...args: unknown[]) => unknown>
  child?: Record<string, (...args: unknown[]) => unknown>
}

export interface ListViewProps {
  listData: ComplexList
  simpleTable?: boolean
  components?: ('spin' | 'search' | 'table' | 'info' | 'edit' | 'child')[]
  componentsProps?: componentsProps
  render?: renderType
}

export default defineComponent({
  name: 'ListView',
  props: {
    listData: {
      type: Object as PropType<ListViewProps['listData']>,
      required: true
    },
    simpleTable: {
      type: Boolean,
      required: false
    },
    components: {
      type: Array as PropType<ListViewProps['components']>,
      required: false
    },
    componentsProps: {
      type: Object as PropType<ListViewProps['componentsProps']>,
      required: false
    },
    render: {
      type: Object as PropType<ListViewProps['render']>,
      required: false
    },
  },
  computed: {
    operate() {
      return this.listData.getStatus('operate')
    },
    currentComponents() {
      return this.components || [...config.list.components]
    },
    currentComponentsProps() {
      return this.componentsProps || {}
    },
    currentRender() {
      return this.render || {}
    },
    currentChoice() {
      return this.listData.$module.choice ? this.listData.$module.choice.getData() : undefined
    },
    choiceSize() {
      return this.currentChoice ? this.currentChoice.id.length : undefined
    },
    currentSimpleTable() {
      if (this.simpleTable && this.currentChoice) {
        console.error('SimpleTable无法实现选择功能，无法启用SimpleTable！')
        return false
      } else {
        return this.simpleTable
      }
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
        return h(SearchArea, {
          ref: 'search-view',
          search: this.listData.$module.search,
          choice: this.choiceSize,
          inline: true,
          loading: this.operate === 'ing',
          onMenu: this.onSearchMenu,
          ...this.currentComponentsProps.search
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
          onMenu: (prop: string, payload: tablePayload) => {
            this.onTableMenu(prop, payload)
          },
          ...this.currentComponentsProps.table
        }
        return h(!this.currentSimpleTable ? TableView : SimpleTableView, tableOption, {
          ...this.currentRender.table
        })
      } else {
        return null
      }
    },
    renderEdit() {
      if (this.currentComponents.indexOf('edit') > -1) {
        const editModalOption = {
          ref: 'edit-modal',
          menu: ['cancel', 'submit'],
          submit: this.editSubmit,
          ...this.currentComponentsProps.editModal
        }
        const editModalSlot = {
          default: () => {
            const editFormOption = {
              ref: 'edit-view',
              dictionary: this.listData.$module.dictionary!,
              loading: this.operate === 'ing',
              ...this.currentComponentsProps.edit
            }
            return h(EditArea, editFormOption)
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
    onSearchMenu(prop: string, payload: AutoItemPayloadType) {
      this.$emit('menu', 'search', prop, payload)
      if (prop === '$search') {
        this.listData.setSearch()
      } else if (prop === '$reset') {
        this.listData.resetSearch()
      } else if (prop === '$build') {
        this.onEdit()
      } else if (prop === '$delete') {
        notice.confirm('确认进行删除操作吗？', '警告', (act: string) => {
          if (act === 'ok') {
            this.listData.triggerMethod('$multipleDeleteData', [this.currentChoice ? this.currentChoice.list : []], true)
          }
        })
      } else if (prop === '$export') {
        this.listData.triggerMethod('$exportData', [], true)
      }
    },
    onTableMenu(prop: string, payload?: tablePayload) {
      this.$emit('menu', 'table', prop, payload)
      if (prop === '$change') {
        this.onEdit(payload!.targetData)
      } else if (prop === '$delete') {
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
      if (this.currentComponentsProps.editModal && this.currentComponentsProps.editModal.formatName) {
        name = this.currentComponentsProps.editModal.formatName(name, type)
      }
      (this.$refs['edit-modal'] as InstanceType<typeof ModalView>).show(name)
      this.$nextTick(() => {
        (this.$refs['edit-view'] as InstanceType<typeof EditArea>).show(type, record)
      })
    },
    editSubmit() {
      return new Promise((resolve, reject) => {
        (this.$refs['edit-view'] as InstanceType<typeof EditArea>).submit().then(res => {
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
