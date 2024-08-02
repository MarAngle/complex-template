import { defineComponent, h, PropType } from "vue"
import FloatData, { FloatValue } from "./data/FloatData"
import QuickFloatValue from "./QuickFloatValue"

export default defineComponent({
  name: 'QuickFloat',
  props: {
    float: {
      type: Object as PropType<FloatData>,
      required: true
    }
  },
  methods: {
    renderValue(floatValue: FloatValue) {
      return h(QuickFloatValue, {
        floatValue,
        onRemove: (floatValue: FloatValue) => {
          this.onRemove(floatValue)
        }
      })
    },
    renderList() {
      return this.float.list.map(floatValue => {
        return this.renderValue(floatValue)
      })
    },
    onRemove(floatValue: FloatValue) {
      floatValue.destroy()
      this.float.remove(floatValue)
    },
  },
  render() {
    return h('div', { class: 'complex-quick-float' }, [ this.renderList() ])
  }
})
