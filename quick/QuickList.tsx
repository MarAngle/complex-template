import { defineComponent, h, PropType } from "vue"
import { notice } from "complex-plugin"
import { ComplexList } from "complex-data"
import { resetOptionType, triggerMethodOption } from "complex-data/src/data/BaseData"
import AutoSpin from "./../src/components/AutoSpin.vue"
import TableView, { tablePayload, TableViewProps } from "./../src/TableView"
import SimpleTableView from "./../src/SimpleTableView"
import ModalView, { ModalViewProps } from "./../src/ModalView"
import SearchArea, { SearchAreaProps } from "./../src/SearchArea"
import EditArea, { EditAreaProps, EditAreaSubmitOption } from "./../src/EditArea"
import InfoArea, { InfoAreaProps } from "./../src/InfoArea"
// import CollapseArea, { CollapseAreaProps } from "./../src/CollapseArea"
import { AutoItemPayloadType } from "./../src/dictionary/AutoItem"
import FloatData, { FloatValue } from "./data/FloatData"
import config from "./../config"

export interface ListModalViewProps extends ModalViewProps {
  formatName?: (name: string, payload?: unknown) => string
}

export type componentsProps = {
  search?: Partial<SearchAreaProps>
  // searchCollapse?: Partial<CollapseAreaProps>
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
  editThrottle?: triggerMethodOption['throttle']
  float?: FloatData
  render?: renderType
  reset?: resetOptionType
  destroy?: resetOptionType
}

export default defineComponent({
  name: 'QuickList',
  emits: {
    search: (prop: string, _payload: AutoItemPayloadType<'edit'>)  => {
      return !!prop
    },
    table: (prop: string, _payload: tablePayload)  => {
      return !!prop
    }
  },
  data() {
    return {
      floatValue: undefined as undefined | FloatValue
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
    editThrottle: {
      type: Object as PropType<QuickListProps['editThrottle']>,
      required: false,
      default: () => {
        return config.list.editThrottle
      }
    },
    float: {
      type: Object as PropType<QuickListProps['float']>,
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
        const searchArea = h(SearchArea, {
          ref: 'search',
          search: this.listData.$module.search!,
          choice: this.choiceSize,
          loading: this.operate === 'ing',
          onMenu: this.onSearchMenu,
          onEnter: this.onSearchEnter,
          ...this.currentComponentsProps.search
        })
        return searchArea
        // if (this.currentComponentsProps.searchCollapse) {
        //   return h(CollapseArea, {
        //     ref: 'collapse',
        //     height: config.search.lineHeight,
        //     ...this.currentComponentsProps.searchCollapse
        //   }, {
        //     default: () => searchArea
        //   })
        // } else {
        //   return searchArea
        // }
      } else {
        return null
      }
    },
    onSearchEnter(_prop: string, _payload: AutoItemPayloadType<'edit'>) {
      // 回车自动检索
      this.listData.setSearch()
    },
    onSearchMenu(prop: string, payload: AutoItemPayloadType<'edit'>) {
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
        this.listData.triggerMethod('$exportData', [], {
          strict: true
        })
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
            this.listData.triggerMethod('$deleteData', [payload!.targetData], {
              strict: true,
              throttle: this.editThrottle
            })
          }
        })
      } else if (prop === '$info') {
        this.openInfo(payload!.targetData)
      }
    },
    renderList() {
      const content = [this.renderSpin(), this.renderSearch(), this.renderTop(), this.renderTable()]
      if (content.some(item => item != null)) {
        return h('div', { class: 'complex-quick-list', style: { position: 'relative' } }, {
          default: () => content
        })
      }
      return null
    },
    renderInfo() {
      if (this.currentComponents.indexOf('info') > -1 && !this.float) {
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
      if (this.currentComponents.indexOf('edit') > -1 && !this.float) {
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
            this.listData.triggerMethod('$multipleDeleteData', [this.currentChoice], {
              strict: true,
              throttle: this.editThrottle
            }).then(() => {
              this.listData.resetChoice()
            })
          }
        })
      } else {
        notice.message('请先选择要删除的数据！', 'error')
      }
    },
    refreshData(record: Record<PropertyKey, any>, next: (record: Record<PropertyKey, any>) => void) {
      if (!this.listData.$refreshData) {
        next(record)
      } else {
        this.listData.triggerMethod('$refreshData', [record], {
          strict: true
        }).then(() => {
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
          notice.message('详情界面需要先选择一条数据！', 'error')
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
        (this.$refs['info'] as InstanceType<typeof InfoArea>).$show(type, record)
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
      if (!this.float) {
        (this.$refs['edit-modal'] as InstanceType<typeof ModalView>).show(name)
        this.$nextTick(() => {
          (this.$refs['edit'] as InstanceType<typeof EditArea>).$show(type, record)
        })
      } else {
        this.floatValue = this.float.push({
          type: 'edit',
          name: name,
          modal: {
            props: {
              title: name,
              menu: ['cancel', 'submit'],
              submit: this.onEditSubmit,
              ...this.currentComponentsProps.editModal
            }
          },
          component: {
            data: EditArea,
            props: {
              dictionary: this.listData.$module.dictionary!,
              ...this.currentComponentsProps.edit
            },
            show: [type, record]
          }
        })
      }
    },
    onEditSubmit() {
      return new Promise((resolve, reject) => {
        if (!this.float) {
          const edit = this.$refs['edit'] as InstanceType<typeof EditArea>
          edit.$submit().then(res => {
            this.$onEditSubmit(res).then(() => {
              resolve(res)
            }).catch((err: unknown) => {
              reject(err)
            })
          }).catch((err: unknown) => {
            reject(err)
          })
        } else {
          this.floatValue!.ref!.submit().then(res => {
            this.$onEditSubmit(res).then(() => {
              resolve(res)
            }).catch((err: unknown) => {
              reject(err)
            })
          }).catch((err: unknown) => {
            reject(err)
          })
        }
      })
    },
    $onEditSubmit(res: EditAreaSubmitOption) {
      return new Promise((resolve, reject) => {
        if (res.type === 'build') {
          this.listData.triggerMethod('$buildData', [res.targetData, res.type], {
            strict: true,
            throttle: this.editThrottle
          }).then(() => {
            resolve(res)
          }).catch((err: unknown) => {
            reject(err)
          })
        } else if (res.type === 'change') {
          this.listData.triggerMethod('$changeData', [res.targetData, res.originData, res.type], {
            strict: true,
            throttle: this.editThrottle
          }).then(() => {
            resolve(res)
          }).catch((err: unknown) => {
            reject(err)
          })
        } else {
          this.listData.triggerMethod('$editData', [res.targetData, res.originData, res.type], {
            strict: true,
            throttle: this.editThrottle
          }).then(() => {
            resolve(res)
          }).catch((err: unknown) => {
            reject(err)
          })
        }
      })
    },
  },
  /**
   * 主要模板

   * @returns {VNode}
   */
  render() {
    return [this.renderList(), this.renderEdit(), this.renderInfo()]
  }
})
