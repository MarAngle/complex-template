import { defineComponent, h, PropType } from "vue"
import { FormValue } from "complex-data"
import { MenuValue } from "complex-data/type"
import EditTable, { EditTableProps } from "./EditTable"
import MenuView from "./components/MenuView"
import ListEdit from "complex-data/src/dictionary/ListEdit"

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
    build: {
      type: [Boolean, Object] as PropType<false | MenuValue>,
      required: false
    },
    delete: {
      type: [Boolean, Object] as PropType<false | MenuValue>,
      required: false
    },
    id: {
      type: [String, Number, Symbol] as PropType<PropertyKey>,
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
    },
  },
  methods: {
    createItemValue() {
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
            disabled: this.disabled,
            loading: this.loading,
          })
        ]
      })
    },
    renderBuild() {
      if (this.build && !this.disabled) {
        const build = this.build
        const render = h('div', { class: 'complex-list-edit-menu' }, {
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
      default: () => [this.renderBuild(), this.renderTable()]
    })
    return render
  }
})
