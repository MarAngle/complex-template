import { defineComponent, h, PropType, markRaw } from "vue"
import { FloatValue } from "./data/FloatData"
import ModalView, { ModalViewSlotProps } from "./../src/ModalView"

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
    this.floatValue.ref = markRaw(this) as any
  },
  beforeUnmount() {
    this.floatValue.ref = undefined
  },
  methods: {
    show() {
      (this.$refs.modal as InstanceType<typeof ModalView>).show()
      if (!this.floatValue.init) {
        this.floatValue.init = true
        this.$nextTick(() => {
          if (typeof (this.$refs.content as any).$show === 'function') {
            (this.$refs.content as any).$show(...(this.floatValue.component.show || []))
          }
        })
      }
    },
    close(from = 'float') {
      (this.$refs.modal as InstanceType<typeof ModalView>).close(from)
    },
    submit(...args: any[]): Promise<any> {
      if ((this.$refs.content as any).$submit) {
        return (this.$refs.content as any).$submit(...args)
      } else {
        return Promise.resolve({})
      }
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
        ...this.floatValue.modal.props
      }, {
        default: (modalSlotProps: ModalViewSlotProps) => {
          return h(this.floatValue.component.data, {
            class: 'complex-quick-float-item-content',
            ref: 'content',
            modalSlotProps: modalSlotProps,
            floatValue: this.floatValue,
            ...this.floatValue.component.props
          })
        }
      })
    },
    renderName() {
      return h('div', {
        class: 'complex-quick-float-item-name',
        onClick: () => {
          if (!this.floatValue.show) {
            this.floatValue.show = true
          }
        }
      }, {
        default: () => this.floatValue.name
      })
    },
  },
  render() {
    return h('div', { class: ['complex-quick-float-item', this.floatValue.show ? 'complex-quick-float-item-active' : ''] }, [ this.renderContent(), this.renderName() ])
  }
})
