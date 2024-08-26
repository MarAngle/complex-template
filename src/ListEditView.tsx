import { defineComponent, h, PropType } from "vue"
import { Table, TableColumnType, TableProps } from 'ant-design-vue'
import { DictionaryData, FormValue } from "complex-data"
import { MenuValue } from "complex-data/type"
import DictionaryValue, { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import DefaultInfo from "complex-data/src/dictionary/DefaultInfo"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import { customRenderPayload, tablePayload } from "./TableView"
import TableMenu, { TableMenuValue } from "./components/TableMenu"
import MenuView from "./components/MenuView"
import AutoItem, { AutoItemProps } from "./dictionary/AutoItem"
import config from "../config"

export default defineComponent({
  name: 'ListEditView',
  props: {
    dictionary: {
      type: Object as PropType<DictionaryData>,
      required: true
    },
    dictionaryList: {
      type: Object as PropType<DictionaryValue[]>,
      required: true
    },
    value: {
      type: Object as PropType<Record<PropertyKey, any>[]>,
      required: false
    },
    list: {
      type: Object as PropType<ObserveList>,
      required: true
    },
    formList: {
      type: Object as PropType<FormValue[]>,
      required: false
    },
    type: {
      type: String,
      required: true
    },
    build: {
      type: [Boolean, Object] as PropType<false | MenuValue>,
      required: false
    },
    delete: {
      type: [Boolean, Object] as PropType<false | MenuValue>,
      required: false
    },
    index: {
      type: Boolean,
      required: false
    },
    id: {
      type: [String, Number, Symbol] as PropType<PropertyKey>,
      required: false
    },
    tableProps: {
      type: Object as PropType<TableProps>,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    },
    loading: {
      type: Boolean,
      required: false
    }
  },
  data () {
    return {
      currentValue: this.value || []
    }
  },
  watch: {
    value(val?: Record<PropertyKey, any>[]) {
      if (val) {
        if (val !== this.currentValue) {
          this.currentValue = val
        }
      } else {
        this.currentValue = []
      }
    },
    currentValue(val: Record<PropertyKey, any>[]) {
      this.$emit('change', val)
    },
  },
  computed: {
    currentColumnList() {
      const list: TableColumnType[] = []
      const columnList = this.list.data
      for (let i = 0; i < columnList.length; i++) {
        const target = columnList[i] as DictionaryEditMod
        const currentProp = target.$prop
        const attrs = config.component.parseData(target.$local, 'target')
        const columnItem: TableColumnType = {
          dataIndex: currentProp,
          title: target.$name,
          width: target.$width,
          ...config.component.parseAttrs(attrs)
        }
        columnItem.customRender = ({ record, index }: customRenderPayload) => {
          return h(AutoItem, {
            parser: 'list',
            target: target,
            index: index,
            list: this.list,
            type: this.type!,
            disabled: this.disabled,
            loading: this.loading,
            form: undefined,
            data: record,
            parent: this
          } as AutoItemProps<'list'>)
        }
        list.push(columnItem)
      }
      // 添加index/menu
      if (this.index) {
        list.unshift({
          title: '序号',
          dataIndex: 'index',
          width: 64,
          customRender: ({ record, index }) => {
            return config.table.renderIndex(record, index, undefined)
          }
        })
      }
      if (this.delete) {
        list.push({
          title: '操作',
          dataIndex: '$menu',
          width: 64,
          customRender: ({ record, index }) => {
            const payload: tablePayload<DefaultInfo> = {
              targetData: record,
              type: this.type || '',
              index: index,
              payload: { target: {} as any }
            }
            return h(TableMenu, {
              list: [
                this.delete as TableMenuValue
              ],
              payload: payload,
              onMenu: (_prop: string, payload: tablePayload) => {
                // console.log(payload)
                this.currentValue.splice(payload.index, 1)
                this.formList!.splice(payload.index, 1)
              }
            })
          }
        })
      }
      return list
    },
    currentTableProps() {
      const currentTableProps = this.tableProps ? { ...this.tableProps } : {}
      if (!currentTableProps.columns) {
        currentTableProps.columns = this.currentColumnList
      }
      currentTableProps.dataSource = this.currentValue
      if (!currentTableProps.rowKey) {
        currentTableProps.rowKey = '_index'
      }
      if (currentTableProps.pagination == undefined) {
        currentTableProps.pagination = false
      }
      return currentTableProps
    },
  },
  methods: {
    createItemValue() {
      const form = new FormValue()
      this.dictionary.parseData(this.dictionaryList, form, this.type).then(res => {
        this.currentValue.push(res.data)
        this.formList!.push(form)
      })
    },
    renderTable() {
      return h('div', { class: 'complex-list-edit-content' }, {
        default: () => [
          h(Table, {
            ...this.currentTableProps
          })
        ]
      })
    },
    renderBuild() {
      if (this.build && !this.disabled) {
        const build = this.build
        const render = h('div', { class: 'complex-list-edit-build' }, {
          default: () => [
            h(MenuView, {
              data: build,
              onClick: () => {
                this.createItemValue()
              }
            })
          ]
        })
        return render
      }
    }
  },
  /**
   * 主要模板

   * @returns {VNode}
   */
  render() {
    const render = h('div', { class: 'complex-list-edit' }, {
      default: () => [this.renderTable(), this.renderBuild()]
    })
    return render
  }
})
