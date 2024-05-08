import { defineComponent, h, PropType } from "vue"
import { SearchData } from "complex-data"
import { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import FormView, { FormViewDefaultProps } from "./FormView"
import { FormItemPayloadType } from "./components/AutoFormItem"

export interface SearchViewProps extends FormViewDefaultProps {
  search: SearchData
  searchMenu?: (string | DictionaryEditMod)[]
}

export default defineComponent({
  name: 'SearchView',
  props: {
    search: {
      type: Object as PropType<SearchViewProps['search']>,
      required: true
    },
    searchMenu: {
      type: Object as PropType<SearchViewProps['searchMenu']>,
      required: false
    },
    menu: {
      type: Object as PropType<SearchViewProps['menu']>,
      required: false
    },
    layout: { // 表单布局'horizontal'|'vertical'|'inline'
      type: String as PropType<SearchViewProps['layout']>,
      required: false
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String as PropType<SearchViewProps['labelAlign']>,
      required: false
    },
    layoutProps: { // layout != inline时的a-row的参数设置项
      type: Object,
      required: false
    },
    formProps: { // form-model-view设置项
      type: Object as PropType<SearchViewProps['formProps']>,
      required: false
    },
    choice: {
      type: Number,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    },
    loading: {
      type: Boolean,
      required: false
    },
  },
  computed: {
    currentSearchMenu() {
      const currentSearchMenu = this.searchMenu ? this.search.$menu.list.concat(this.searchMenu) : this.search.$menu.list
      return currentSearchMenu.map(menuOption => {
        if (typeof menuOption === 'string') {
          menuOption = SearchData.$getMenu(menuOption)!
        }
        return menuOption
      })
    },
    currentMenu() {
      if (this.menu) {
        return (this.currentSearchMenu as FormViewDefaultProps['menu'])!.concat(this.menu)
      } else {
        return this.currentSearchMenu
      }
    },
  },
  methods: {
    renderForm() {
      const form = h(FormView, {
        form: this.search.$search.form,
        list: this.search.$search.observe,
        type: this.search.$prop,
        menu: this.currentMenu,
        layout: this.layout,
        labelAlign: this.labelAlign,
        layoutProps: this.layoutProps,
        formProps: this.formProps,
        choice: this.choice,
        disabled: this.disabled,
        loading: this.loading,
        onMenu: (prop: string, payload: FormItemPayloadType) => {
          this.$emit('menu', prop, payload)
        }
      })
      return form
    }
  },
  render() {
    return h('div', { class: 'complex-search' }, [this.renderForm()])
  }
})
