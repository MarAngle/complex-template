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
        onClose: (floatValue: FloatValue, from: string) => {
          this.float.close(floatValue, from)
        }
      })
    },
    renderList() {
      return this.float.list.map(floatValue => {
        return this.renderValue(floatValue)
      })
    }
  },
  render() {
    return h('div', { class: 'complex-quick-float' }, [ this.renderList() ])
  }
})
