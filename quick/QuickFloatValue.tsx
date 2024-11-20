import { defineComponent, h, PropType, markRaw } from "vue"
import { FloatValue } from "./data/FloatData"
import ModalView, { ModalViewSlotProps } from "./../src/ModalView"
import icon from "../icon"

export const contentRef = 'content'

export default defineComponent({
  name: 'QuickFloatValue',
  emits: {
    // 关闭
    close: (floatValue: FloatValue, _from: string) => {
      return !!floatValue
    }
  },
  props: {
    floatValue: {
      type: Object as PropType<FloatValue>,
      required: true
    }
  },
  data() {
    return {}
  },
  watch: {
    'floatValue.show': {
      immediate: true,
      handler: function (value) {
        if (value) {
          this.$nextTick(() => {
            this.show()
          })
        }
      }
    }
  },
  mounted() {
    this.floatValue.target = markRaw(this) as any
  },
  beforeUnmount() {
    this.floatValue.target = undefined
  },
  methods: {
    getContent() {
      return this.$refs[contentRef]
    },
    show() {
      (this.$refs.modal as InstanceType<typeof ModalView>).show()
      if (!this.floatValue.init) {
        this.floatValue.init = true
        this.$nextTick(() => {
          if (this.floatValue.content.show) {
            this.floatValue.content.show.trigger(this.getContent(), this.floatValue.content.show.args)
          }
        })
      }
    },
    close(from = 'float') {
      (this.$refs.modal as InstanceType<typeof ModalView>).close(from)
    },
    renderContent() {
      if (!this.floatValue.init && !this.floatValue.show) {
        // 未加载未展示直接不进行构建
        return null
      }
      return h(ModalView, {
        class: 'complex-quick-float-item-modal',
        ref: 'modal',
        onClose: (from: string) => {
          this.$emit('close', this.floatValue, from)
        },
        ...this.floatValue.modal
      }, {
        default: (modalSlotProps: ModalViewSlotProps) => {
          return this.floatValue.content.render('content', modalSlotProps)
        }
      })
    },
    renderName() {
      console.log(this)
      return h('div', {
        class: 'complex-quick-float-item-label',
        onClick: () => {
          if (!this.floatValue.show) {
            this.floatValue.show = true
          }
        }
      }, {
        default: () => [
          this.floatValue.label.icon ? icon.parse(this.floatValue.label.icon) : null,
          typeof this.floatValue.label.value !== 'function' ? this.floatValue.label.value : this.floatValue.label.value()
        ]
      })
    },
  },
  render() {
    return h('div', { class: ['complex-quick-float-item', this.floatValue.show ? 'complex-quick-float-item-active' : ''] }, [ this.renderContent(), this.renderName() ])
  }
})
