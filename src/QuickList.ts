import { defineComponent, h, PropType } from "vue"
import { notice } from "complex-plugin"
import { ComplexList } from "complex-data"
import { resetOptionType } from "complex-data/src/data/BaseData"
import AutoSpin from "./components/AutoSpin.vue"
import TableView, { tablePayload, TableViewProps } from "./TableView"
import SimpleTableView from "./SimpleTableView"
import ModalView, { ModalViewProps } from "./ModalView"
import SearchArea, { SearchAreaProps } from "./SearchArea"
import EditArea, { EditAreaProps } from "./EditArea"
import InfoArea, { InfoAreaProps } from "./InfoArea"
import { AutoItemPayloadType } from "./dictionary/AutoItem"
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
  info?: Partial<InfoAreaProps>
}

export type renderType = {
  top?: (...args: unknown[]) => unknown
  search?: Record<string, (...args: unknown[]) => unknown>
  table?: Record<string, (payload: tablePayload) => unknown>
  edit?: Record<string, (...args: unknown[]) => unknown>
  info?: Record<string, (...args: unknown[]) => unknown>
}

export interface QuickListProps {
  listData: ComplexList
  simpleTable?: boolean
  components?: ('spin' | 'search' | 'table' | 'info' | 'edit')[]
  componentsProps?: componentsProps
  render?: renderType
  reset?: resetOptionType
  destroy?: resetOptionType
}

export default defineComponent({
  name: 'QuickList',
  emits: {
    search: (prop: string, payload: AutoItemPayloadType<true>)  => {
      return !!prop
    },
    table: (prop: string, payload: tablePayload)  => {
      return !!prop
    }
  },
  props: {
    listData: {
      type: Object as PropType<QuickListProps['listData']>,
      required: true
    },
    simpleTable: {
      type: Boolean,
      required: false
    },
    components: {
      type: Array as PropType<QuickListProps['components']>,
      required: false
    },
    componentsProps: {
      type: Object as PropType<QuickListProps['componentsProps']>,
      required: false
    },
    render: {
      type: Object as PropType<QuickListProps['render']>,
      required: false
    },
    reset: {
      type: Object as PropType<QuickListProps['reset']>,
      required: false
    },
    destroy: {
      type: Object as PropType<QuickListProps['destroy']>,
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
    currentComponentsProps() {
      return this.componentsProps || {}
    },
    currentRender() {
      return this.render || {}
    },
    currentChoice() {
      return this.listData.getChoiceList()
    },
    choiceSize() {
      return this.currentChoice ? this.currentChoice.length : undefined
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
  beforeMount() {
    if (this.destroy) {
      this.listData.destroy(this.destroy)
    } else if (this.reset) {
      this.listData.reset(this.reset)
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
          ref: 'search',
          search: this.listData.$module.search,
          choice: this.choiceSize,
          loading: this.operate === 'ing',
          onMenu: this.onSearchMenu,
          ...this.currentComponentsProps.search
        })
      } else {
        return null
      }
    },
    onSearchMenu(prop: string, payload: AutoItemPayloadType<true>) {
      this.$emit('search', prop, payload)
      if (prop === '$search') {
        this.listData.setSearch()
      } else if (prop === '$reset') {
        this.listData.resetSearch()
      } else if (prop === '$refresh') {
        this.listData.reloadData({
          data: true,
          sync: true,
          module: {
            choice: 'reload'
          }
        })
      } else if (prop === '$build') {
        this.openEdit()
      } else if (prop === '$info') {
        this.openInfo()
      } else if (prop === '$delete') {
        this.deleteChoiceList()
      } else if (prop === '$export') {
        this.listData.triggerMethod('$exportData', [], true)
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
          ref: 'table',
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
    onTableMenu(prop: string, payload: tablePayload) {
      this.$emit('table', prop, payload)
      if (prop === '$change') {
        this.openEdit(payload!.targetData)
      } else if (prop === '$delete') {
        notice.confirm('确认进行删除操作吗？', '警告', (act: string) => {
          if (act === 'ok') {
            this.listData.triggerMethod('$deleteData', [payload!.targetData], true)
          }
        })
      } else if (prop === '$info') {
        this.openInfo(payload!.targetData)
      }
    },
    renderInfo() {
      if (this.currentComponents.indexOf('info') > -1) {
        return h(
          ModalView,
          {
            ref: 'info-modal',
            menu: ['close'],
            ...this.currentComponentsProps.infoModal
          },
          {
            default: () => {
              return h(InfoArea, {
                ref: 'info',
                dictionary: this.listData.$module.dictionary!,
                loading: this.operate === 'ing',
                ...this.currentComponentsProps.info
              })
            }
          }
        )
      } else {
        return null
      }
    },
    renderEdit() {
      if (this.currentComponents.indexOf('edit') > -1) {
        return h(
          ModalView,
          {
            ref: 'edit-modal',
            menu: ['cancel', 'submit'],
            submit: this.onEditSubmit,
            ...this.currentComponentsProps.editModal
          },
          {
            default: () => {
              return h(EditArea, {
                ref: 'edit',
                dictionary: this.listData.$module.dictionary!,
                loading: this.operate === 'ing',
                ...this.currentComponentsProps.edit
              })
            }
          }
        )
      } else {
        return null
      }
    },
    deleteChoiceList() {
      if (this.choiceSize) {
        notice.confirm('确认进行删除操作吗？', '警告', (act: string) => {
          if (act === 'ok') {
            this.listData.triggerMethod('$multipleDeleteData', [this.currentChoice], true).then(() => {
              this.listData.resetChoice()
            })
          }
        })
      } else {
        notice.showMsg('请先选择要删除的数据！', 'error')
      }
    },
    refreshData(record: Record<PropertyKey, any>, next: (record: Record<PropertyKey, any>) => void) {
      if (!this.listData.$refreshData) {
        next(record)
      } else {
        this.listData.triggerMethod('$refreshData', [record], true).then(() => {
          next(record)
        }).catch((err: unknown) => {
          console.error(err)
        })
      }
    },
    openInfo(record?: Record<PropertyKey, any>) {
      if (!record) {
        if (this.currentChoice && this.currentChoice.length === 1) {
          record = this.currentChoice[0]
        } else {
          notice.showMsg('详情界面需要先选择一条数据！', 'error')
          return
        }
      }
      this.refreshData(record, (record) => {
        this.showInfo(record)
      })
    },
    showInfo(record: Record<PropertyKey, any>, type = 'info') {
      let name = '详情'
      if (this.currentComponentsProps.infoModal && this.currentComponentsProps.infoModal.formatName) {
        name = this.currentComponentsProps.infoModal.formatName(name, type)
      }
      (this.$refs['info-modal'] as InstanceType<typeof ModalView>).show(name)
      this.$nextTick(() => {
        (this.$refs['info'] as InstanceType<typeof InfoArea>).show(type, record)
      })
    },
    openEdit(record?: Record<PropertyKey, any>) {
      let type = 'build'
      let name = '新增'
      if (record) {
        type = 'change'
        name = '编辑'
      }
      if (this.currentComponentsProps.editModal && this.currentComponentsProps.editModal.formatName) {
        name = this.currentComponentsProps.editModal.formatName(name, type)
      }
      if (record) {
        this.refreshData(record, (record) => {
          this.showEdit(name, type, record)
        })
      } else {
        this.showEdit(name, type, record)
      }
    },
    showEdit(name: string, type: string, record?: Record<PropertyKey, any>) {
      (this.$refs['edit-modal'] as InstanceType<typeof ModalView>).show(name)
      this.$nextTick(() => {
        (this.$refs['edit'] as InstanceType<typeof EditArea>).show(type, record)
      })
    },
    onEditSubmit() {
      return new Promise((resolve, reject) => {
        (this.$refs['edit'] as InstanceType<typeof EditArea>).submit().then(res => {
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
    const render = h('div', { class: 'complex-quick-list', style: { position: 'relative' } }, {
      default: () => [this.renderSpin(), this.renderSearch(), this.renderTop(), this.renderTable(), this.renderEdit(), this.renderInfo()]
    })
    return render
  }
})
