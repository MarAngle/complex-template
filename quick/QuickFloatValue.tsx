import { defineComponent, h, PropType } from "vue"
import { FloatValue } from "./data/FloatData"
import ModalView, { ModalViewSlotProps } from "./../src/ModalView"

export default defineComponent({
  name: 'QuickFloatValue',
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
          if (!this.floatValue.init) {
            this.floatValue.init = true
            this.$nextTick(() => {
              this.show()
            })
          }
        }
      }
    }
  },
  methods: {
    show() {
      (this.$refs.modal as InstanceType<typeof ModalView>).show()
      this.$nextTick(() => {
        if (typeof (this.$refs.content as any).$show === 'function') {
          (this.$refs.content as any).$show(...(this.floatValue.component.show || []))
        }
      })
    },
    close() {
      (this.$refs.modal as InstanceType<typeof ModalView>).hide('float')
      this.$emit('remove', this.floatValue)
    },
    hide() {
      this.floatValue.show = false;
      (this.$refs.modal as InstanceType<typeof ModalView>).hide('float')
    },
    handle(next: (payload: any) => void) {
      if ((this.$refs.content as any).$submit) {
        (this.$refs.content as any).$submit((payload: any) => {
          next(payload)
        })
      } else {
        next({})
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
            this.floatValue.show = true;
            (this.$refs.modal as any).$show()
          }
        }
      }, {
        default: () => this.floatValue.name
      })
    },
  },
  render() {
    return h('div', { class: ['complex-quick-float-item', this.floatValue.show ? 'choice ' : ''] }, [ this.renderContent(), this.renderName() ])
  }
})
