import { defineComponent, h, PropType } from "vue"
import { FormValue } from "complex-data"
import ListEdit from "complex-data/src/dictionary/ListEdit"
import EditTable, { EditTableProps } from "./EditTable"
import MenuView from "./MenuView"
import { tablePayload } from "./TableView"

export default defineComponent({
  name: 'ListEditView',
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
      type: Object as PropType<EditTableProps>,
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
      return h('div', { class: 'complex-list-edit-content' }, {
        default: () => [
          h(EditTable, {
            observeList: this.runtime.observeList!,
            data: this.currentValue,
            listProp: this.type,
            lineHeight: 32,
            parent: this,
            menu: this.menu as EditTableProps['menu'],
            disabled: this.disabled,
            loading: this.loading,
            onMenu: (prop: string, payload: tablePayload) => {
              if (prop === '$delete') {
                this.currentValue.splice(payload.index, 1)
                this.runtime.formList!.splice(payload.index, 1)
              }
              this.$emit('menu', prop, payload)
            }
          })
        ]
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
    const render = h('div', { class: 'complex-list-edit' }, {
      default: () => [this.renderHeader(), this.renderTable()]
    })
    return render
  }
})
