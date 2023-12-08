import { defineComponent, PropType } from "vue"

export default defineComponent({
  name: 'AutoRender',
  props: {
    render: {
      type: Function as PropType<() => unknown>,
      required: true
    }
  },
  /**
   * 主要模板
   * @param {*} h createElement
   * @returns {VNode}
   */
  render() {
    return this.render()
  }
})
