import { defineComponent, h, PropType } from "vue"
import { DictionaryData, FormValue } from "complex-data"
import { MenuValue } from "complex-data/type"
import DictionaryValue, { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import ObserveList from "complex-data/src/dictionary/ObserveList"
import EditTable, { EditTableProps } from "./EditTable"
import MenuView from "./components/MenuView"

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
      console.log(this)
      const form = new FormValue()
      this.dictionary.parseData(this.dictionaryList, form, this.type).then(res => {
        this.currentValue.push(res.data)
        this.formList!.push(form)
      })
    },
    renderTable() {
      return h('div', { class: 'complex-list-edit-content' }, {
        default: () => [
          h(EditTable, {
            observeList: this.list,
            columnList: this.list.data as DictionaryEditMod[],
            data: this.currentValue,
            listProp: this.type,
            lineHeight: 32,
            parent: this
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
