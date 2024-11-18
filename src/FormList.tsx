import { defineComponent, h, PropType } from "vue"
import { Form, FormItemRest, Table, TableColumnType, TableProps } from "ant-design-vue"
import { FormValue } from "complex-data"
import ListEdit from "complex-data/src/dictionary/ListEdit"
import MenuView from "./MenuView"
import { customRenderPayload, tablePayload } from "./TableView"
import config from "../config"
import AutoEditItem from "./dictionary/AutoEditItem"
import { AutoItemPayloadType } from "./dictionary/AutoItem"
import AutoInfoItem from "./dictionary/AutoInfoItem"

export default defineComponent({
  name: 'FormList',
  props: {
    runtime: {
      type: Object as PropType<ListEdit['$runtime']>,
      required: true
    },
    value: {
      type: Object as PropType<Record<PropertyKey, any>[]>,
      required: false
    },
    type: {
      type: String,
      required: true
    },
    header: {
      type: Object as PropType<ListEdit['$option']['header']>,
      required: false
    },
    menu: {
      type: Object as PropType<ListEdit['$option']['menu']>,
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
  emits: ['update:value', 'header'],
  setup() {
    const formItemContext = Form.useInjectFormItemContext()
    console.log(formItemContext)
  },
  data () {
    return {
      currentValue: this.value || []
    }
  },
  computed: {
    currentColumnList() {
      const list = []
      const columnList = this.runtime.observeList?.data
      if (columnList) {
        for (let i = 0; i < columnList.length; i++) {
          const column = columnList[i]
          const currentProp = column.$prop
          const targetRender = this.$slots[currentProp] || config.component.parseData(column.$renders, 'target')
          const pureRender = config.component.parseData(column.$renders, 'pure')
          const attrs = config.component.parseData(column.$local, 'target')
          const columnItem: TableColumnType = {
            dataIndex: currentProp,
            title: column.$name,
            width: column.$width,
            ellipsis: false,
            ...config.component.parseAttrs(attrs)
          }
          if (!pureRender) {
            if (!targetRender) {
              columnItem.customRender = ({ record, index }: customRenderPayload) => {
                if (currentProp === config.table.auto.index.prop) {
                  // 自动index
                  return config.table.renderIndex(record, index, undefined)
                }
                const form = this.runtime.formList![index]
                if (config.isEdit(column)) {
                  return h(FormItemRest, {}, {
                    default: () => [
                     h(AutoEditItem, {
                        payload: {
                          prop: currentProp,
                          type: this.type,
                          target: column,
                          index: index,
                          list: this.runtime.observeList!,
                          disabled: this.disabled,
                          loading: this.loading,
                          targetData: form.data,
                          form: form,
                          data: undefined,
                          parent: this as any,
                        } as AutoItemPayloadType<'edit'>
                      })
                    ]
                  })
                } else {
                  return h(AutoInfoItem, {
                    payload: {
                      prop: currentProp,
                      type: this.type,
                      target: column,
                      index: index,
                      list: this.runtime.observeList!,
                      disabled: this.disabled,
                      loading: this.loading,
                      targetData: form.data,
                      form: undefined,
                      data: form.data,
                      parent: this as any,
                    } as AutoItemPayloadType<'info'>
                  })
                }
              }
            } else {
              columnItem.customRender = ({ text, record, index }: customRenderPayload) => {
                const payload: tablePayload = {
                  targetData: record,
                  type: this.type,
                  index: index,
                  payload: { column: column }
                }
                text = config.table.renderTableValue(text, payload)
                if (targetRender) {
                  // 插槽
                  return targetRender({
                    text: text,
                    payload
                  })
                }
                if (columnItem.ellipsis) {
                  // 自动省略切自动换行
                  return config.table.renderAutoText(text as string, column, payload, config.component.parseData(column.$local, 'autoText'))
                }
                return text
              }
            }
          } else {
            columnItem.customRender = ({ text, record, index }: customRenderPayload) => {
              const payload: tablePayload = {
                targetData: record,
                type: this.type,
                index: index,
                payload: { column: column }
              }
              return pureRender({
                text: text,
                payload
              })
            }
          }
          list.push(columnItem)
        }
      }
      return list
    },
  },
  watch: {
    value(val?: Record<PropertyKey, any>[]) {
      console.log('value change', val)
      if (val) {
        if (val !== this.currentValue) {
          this.currentValue = val
        }
      } else {
        this.currentValue = []
      }
    },
    currentValue(val: Record<PropertyKey, any>[]) {
      console.log('currentValue change', val)
      this.$emit('update:value', val)
    }
  },
  methods: {
    buildValue() {
      const form = new FormValue()
      this.runtime.dictionary!.parseData(this.runtime.dictionaryList!, form, this.type).then(res => {
        this.currentValue.push(res.data)
        this.runtime.formList!.push(form)
      })
    },
    renderTable() {
      return h(Table, {
        rowKey: this.runtime?.dictionary?.getProp('id') as string,
        pagination: false,
        columns: this.currentColumnList,
        dataSource: this.currentValue
      })
    },
    renderHeader() {
      if (this.header) {
        return this.header.map(headerMenu => {
          return h(MenuView, {
            data: headerMenu,
            disabled: this.disabled,
            loading: this.loading,
            onClick: () => {
              if (headerMenu.prop === '$build') {
                this.buildValue()
              }
              this.$emit('header', headerMenu.prop)
            }
          })
        })
      }
    }
  },
  /**
   * 主要模板

   * @returns {VNode}
   */
  render() {
    const render = h('div', { class: 'complex-form-list' }, {
      default: () => [this.renderHeader(), this.renderTable()]
    })
    return render
  }
})
