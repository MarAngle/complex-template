import { defineComponent, h, PropType, VNode } from "vue"
import { DefaultInfo, SearchData } from "complex-data"
import { DictionaryEditMod } from "complex-data/src/lib/DictionaryValue"
import EditView, { EditViewDefaultProps } from "./EditView"
import { AutoItemPayloadType } from "./dictionary/AutoItem"
import config from "../config"

export interface SearchAreaProps extends EditViewDefaultProps {
  search: SearchData
  searchMenu?: (string | DictionaryEditMod)[]
  inline?: boolean
  collapseMenuRender?: (collapse: boolean) => null | VNode | VNode[]
}

// 首先先进行非折叠的加载，完成后如长度超出预期，则展示折叠按钮区域，否则不展示折叠按钮区域
// 默认不进行自动判断，存在折叠逻辑直接进行折叠的展示，可通过适配参数实现自动判断
// 自动判断在特殊的hide，frozen等逻辑时可能会出现问题，谨慎使用

export default defineComponent({
  name: 'SearchArea',
  emits: {
    menu: (prop: string, _payload: AutoItemPayloadType<true>) => {
      return !!prop
    },
    enter: (prop: string, _payload: AutoItemPayloadType<true>) => {
      return !!prop
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
    enter: {
      type: Boolean,
      required: false,
      default: true
    },
    collapseMenuRender: {
      type: Object as PropType<SearchAreaProps['collapseMenuRender']>,
      required: false
    },
    collapse: {
      type: Boolean,
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
    }
  },
  methods: {
    renderEdit() {
      return h(EditView, {
        form: this.search.$runtime.form,
        list: this.search.$runtime.list,
        type: this.search.$prop,
        menu: this.currentMenu,
        labelAlign: this.labelAlign,
        gridParse: this.inline ? undefined : (this.gridParse || this.search.$layout.grid.getValue(this.search.$prop)),
        gridRowProps: this.gridRowProps!,
        formProps: this.formProps,
        choice: this.choice,
        enter: this.enter,
        collapse: this.search.$collapse,
        disabled: this.disabled,
        loading: this.loading,
        onMenu: (prop: string, payload: AutoItemPayloadType<true>) => {
          this.$emit('menu', prop, payload)
        },
        onEnter: (prop: string, payload: AutoItemPayloadType<true>) => {
          this.$emit('enter', prop, payload)
        }
      })
    },
    renderCollapseMenu() {
      if (this.collapse && this.search.$collapse !== undefined) {
        // 存在值时则进行展示
        return h('div',
          {
            class: 'complex-search-area-collapse-menu'
          },
          [
            !this.collapseMenuRender ? config.collapseMenuRender(this.search.$collapse, this.search) : this.collapseMenuRender(this.search.$collapse)
          ]
        )
      } else {
        return null
      }
    }
  },
  render() {
    return h('div',
      {
        class: 'complex-search-area'
      },
      [
        this.renderEdit(),
        this.renderCollapseMenu()
      ]
    )
  }
})
