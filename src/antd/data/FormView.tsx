import $func from "complex-func";
import { PageList } from "complex-data";
import { h, defineComponent, PropType } from "vue";

export default defineComponent({
  name: 'ComplexFormView',
  props: {
    list: {
      type: Object as PropType<PageList>,
      required: true
    }
  },
  /**
   * 主要模板
   * @param {*} h createElement
   * @returns {VNode}
   */
  render() {
    return h('a-form')
  }
})
