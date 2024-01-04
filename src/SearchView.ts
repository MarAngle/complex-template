import { defineComponent, h, PropType } from "vue"
import { FormLayout, FormProps } from "ant-design-vue/es/form/Form"
import { FormLabelAlign } from "ant-design-vue/es/form/interface"
import { SearchData } from "complex-data"
import { ChoiceDataData } from "complex-data/src/module/ChoiceData"
import { DefaultEditButtonInitOption } from "complex-data/src/dictionary/DefaultEditButton"
import { searchMenuType } from "complex-data/src/module/SearchData"
import FormView from "./FormView"
import { FormItemPayloadType } from "./components/AutoFormItem"
import AntdFormValue from "./class/AntdFormValue"

export default defineComponent({
  name: 'SearchView',
  props: {
    search: {
      type: Object as PropType<SearchData>,
      required: true
    },
    menu: {
      type: Object as PropType<(string | searchMenuType)[]>,
      required: false
    },
    choice: {
      type: Object as PropType<ChoiceDataData>,
      required: false
    },
    layout: { // 表单布局'horizontal'|'vertical'|'inline'
      type: String as PropType<FormLayout>,
      required: false
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String as PropType<FormLabelAlign>,
      required: false
    },
    layoutOption: { // layout != inline时的a-row的参数设置项
      type: Object,
      required: false
    },
    formOption: { // form-model-view设置项
      type: Object as PropType<FormProps>,
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
    currentMenuList() {
      const menuList = this.menu ? this.search.$menu.list.concat(this.menu) : this.search.$menu.list
      const choiceSize = this.choice ? this.choice.id.length : -1
      return menuList.map(menuOption => {
        if (typeof menuOption === 'string') {
          menuOption = SearchData.$getMenu(menuOption)!
        }
        const menuInitOption = {
          $format: 'edit',
          prop: menuOption.prop,
          type: 'button',
          option: {
            ...menuOption
          }
        }
        const choice = menuOption.choice
        if (choice !== undefined && choiceSize > -1) {
          if (choice === true) {
            menuInitOption.option!.disabled = function() {
              return choiceSize === 0
            }
          } else if (choice === false) {
            menuInitOption.option!.disabled = function() {
              return choiceSize > 0
            }
          } else {
            menuInitOption.option!.disabled = function() {
              return choiceSize !== choice
            }
          }
        }
        return menuInitOption as DefaultEditButtonInitOption
      })
    }
  },
  methods: {
    renderForm() {
      const form = h(FormView, {
        form: this.search.$search.form as AntdFormValue,
        list: this.search.$search.observe,
        type: this.search.$prop,
        menu: this.currentMenuList,
        layout: this.layout!,
        labelAlign: this.labelAlign!,
        layoutOption: this.layoutOption!,
        formOption: this.formOption,
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
