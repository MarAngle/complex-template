import { defineComponent, h, PropType } from "vue"
import { DefaultInfo, SearchData } from "complex-data"
import { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import EditView, { EditViewDefaultProps } from "./EditView"
import { AutoItemPayloadType } from "./components/AutoItem"
import config from "../config"

export interface SearchAreaProps extends EditViewDefaultProps {
  search: SearchData
  searchMenu?: (string | DictionaryEditMod)[]
  inline?: boolean
}

export default defineComponent({
  name: 'SearchArea',
  emits: {
    menu: (prop: string, payload: AutoItemPayloadType) => {
      return typeof prop === 'string'
    }
  },
  props: {
    search: {
      type: Object as PropType<SearchAreaProps['search']>,
      required: true
    },
    searchMenu: {
      type: Object as PropType<SearchAreaProps['searchMenu']>,
      required: false
    },
    inline: {
      type: Boolean,
      required: false,
      default: () => {
        return config.search.inline
      }
    },
    formProps: { // form-model-view设置项
      type: Object as PropType<SearchAreaProps['formProps']>,
      required: false
    },
    choice: {
      type: Number,
      required: false
    },
    menu: {
      type: Object as PropType<SearchAreaProps['menu']>,
      required: false
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String as PropType<SearchAreaProps['labelAlign']>,
      required: false
    },
    gridParse: {
      type: Object as PropType<SearchAreaProps['gridParse']>,
      required: false
    },
    gridRowProps: { // form-model-view设置项
      type: Object as PropType<SearchAreaProps['gridRowProps']>,
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
      }) as DefaultInfo[]
    },
    currentMenu() {
      if (this.menu) {
        return this.currentSearchMenu!.concat(this.menu)
      } else {
        return this.currentSearchMenu
      }
    },
  },
  methods: {
    renderEdit() {
      const form = h(EditView, {
        form: this.search.$search.form,
        list: this.search.$search.list,
        type: this.search.$prop,
        menu: this.currentMenu,
        labelAlign: this.labelAlign,
        gridParse: this.inline ? undefined : (this.gridParse || this.search.$layout.grid.getValue(this.search.$prop)),
        gridRowProps: this.gridRowProps!,
        formProps: this.formProps,
        choice: this.choice,
        disabled: this.disabled,
        loading: this.loading,
        onMenu: (prop: string, payload: AutoItemPayloadType) => {
          this.$emit('menu', prop, payload)
        }
      })
      return form
    }
  },
  render() {
    return h('div', { class: 'complex-search-area' }, [this.renderEdit()])
  }
})
