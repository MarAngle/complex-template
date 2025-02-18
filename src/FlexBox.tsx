import { PropType, defineComponent, h } from 'vue'
import config from "../config"

const paddingPropList = ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'] as const

export default defineComponent({
  name: 'FlexBox',
  props: {
    direction: {
      type: String as PropType<'row' | 'column'>,
      validator(value: string) {
        return ['row', 'column'].includes(value)
      },
      required: false,
      default: 'row'
    },
    height: {
      type: Number,
      required: true
    },
    width: {
      type: Number,
      required: true
    },
    paddingTop: {
      type: Number,
      required: false,
      default: 0
    },
    paddingRight: {
      type: Number,
      required: false,
      default: 0
    },
    paddingBottom: {
      type: Number,
      required: false,
      default: 0
    },
    paddingLeft: {
      type: Number,
      required: false,
      default: 0
    }
  },
  render() {
    const content = []
    const contentHeight = this.height - this.paddingTop - this.paddingBottom
    const contentWidth = this.width - this.paddingLeft - this.paddingRight
    if (this.$slots) {
      for (const prop in this.$slots) {
        content.push(this.$slots[prop]?.({
          width: contentWidth,
          height: contentHeight
        }))
      }
    }
    const style = {
      width: config.component.data.formatPixel(this.width),
      height: config.component.data.formatPixel(this.height)
    } as Record<string, string>
    paddingPropList.forEach(paddingProp => {
      const paddingValue = this[paddingProp]
      if (paddingValue) {
        style[paddingProp] = config.component.data.formatPixel(paddingValue)
      }
    })
    const render = h('div', {
      class: ['complex-flex-box', 'complex-flex-box-' + this.direction],
      style: style
    }, content)
    return render
  }
})
