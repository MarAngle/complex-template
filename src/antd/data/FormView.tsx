import $func from "complex-func";
import { PageList } from "complex-data";
import { h, defineComponent } from "vue";
import FormItem from "./../mod/FormItem";
import config from '../config';
import { editType } from "../implement";

const formRef = 'form'

export default defineComponent({
  name: 'ComplexFormView',
  props: {
    form: {
      type: Object,
      required: true
    },
    list: {
      type: PageList,
      required: true
    },
    type: {
      type: String,
      required: true
    },
    layout: { // 表单布局	'horizontal'|'vertical'|'inline'
      type: String,
      required: false,
      default: 'horizontal'
    },
    labelAlign: { // label 标签的文本对齐方式
      type: String,
      required: false,
      default: 'right'
    },
    layoutOption: { // layout != inline时的a-row的参数设置项
      type: Object,
      required: false,
      default: () => {
        return config.FormView.layoutOption
      }
    },
    formOption: { // form-model-view设置项
      type: Object,
      required: false,
      default: null
    },
  },
  computed: {
    currentFormOption() {
      // formOption格式化
      const defaultFormOption = {
        props: {
          model: this.form.data,
          layout: this.layout,
          labelAlign: this.labelAlign
        }
      }
      const currentFormOption = $func.mergeData(defaultFormOption, this.formOption)
      currentFormOption.ref = formRef
      return currentFormOption
    }
  },
  mounted() {
    this.setFormRef()
  },
  methods: {
    /**
     * 设置form的ref
     * @param {*} check 是否进行规则检查
     * @param {*} clear 在不进行规则检查的基础上是否清除规则检查
     */
    setFormRef() {
      // eslint-disable-next-line vue/no-mutating-props
      this.form.ref = this.$refs.form
    },
    getItemGrid(data: any) {
      console.log(data)
      const gridType = $func.getType(data.layout.grid)
      let gridOption
      if (gridType != 'object') {
        gridOption = {
          span: data.layout.grid
        }
      } else {
        gridOption = { ...data.layout.grid }
      }
      return gridOption
    },
    renderList() {
      const list = this.list.data.map((item, index) => {
        return this.renderItem(item as editType, index)
      })
      return list
    },
    /**
     * 构建forviewItem模板
     * @param {*} item 数据
     * @param {*} index index
     * @returns {VNode}
     */
    renderItem(data: editType, index: number) {
      return h(FormItem, {
        props: {
          data: data,
          index: index,
          type: this.type,
          list: this.list,
          form: this.form,
          layout: this.layout,
          target: this
        }
      })
    }
  },
  /**
   * 主要模板
   * @param {*} h createElement
   * @returns {VNode}
   */
  render() {
    const list = this.renderList()
    let listOption
    if (this.layout == 'inline') {
      listOption = list
    } else {
      listOption = [
        h('a-row', { ...this.layoutOption } as any, list)
      ]
    }
    return h('a-form', this.currentFormOption as any, listOption)
  }
})
