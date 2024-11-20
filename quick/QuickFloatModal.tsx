import { defineComponent, h, PropType } from "vue"
import { ModalProps } from "ant-design-vue"
import ModalView, { ModalViewSlotProps } from "../src/ModalView"
import FloatData, { FloatValue } from "./data/FloatData"
import { contentRef } from "./QuickFloatValue"

export interface QuickFloatModalProps {
  modal: FloatValue['modal']
  content: FloatValue['content']
  float?: FloatData
}

export default defineComponent({
  name: 'QuickFloatModal',
  emits: {
    // 关闭
    close: (from: string) => {
      return typeof from === 'string'
    },
    // 菜单
    menu: (prop: string, _self: any) => {
      return typeof prop === 'string'
    }
  },
  props: {
    modal: {
      type: Object as PropType<QuickFloatModalProps['modal']>,
      required: true
    },
    content: {
      type: Object as PropType<QuickFloatModalProps['content']>,
      required: true
    },
    float: {
      type: Object as PropType<QuickFloatModalProps['float']>,
      required: false
    },
  },
  data() {
    return {
      floatValue: undefined as undefined | FloatValue
    }
  },
  methods: {
    getContent() {
      return !this.float ? this.$refs[contentRef] : this.floatValue?.target?.getContent()
    },
    show(args: any[], title?: string, option?: ModalProps) {
      if (!this.float) {
        (this.$refs.modal as InstanceType<typeof ModalView>).show(title, option)
        this.$nextTick(() => {
          if (this.content.show) {
            this.content.show.trigger(this.getContent(), args)
          }
        })
      } else {
        this.floatValue = this.float.push({
          label: {
            value: title || this.modal.title || '浮窗'
          },
          modal: {
            title: title,
            ...this.modal
          },
          content: {
            render: this.content.render,
            show: this.content.show ? {
              trigger: this.content.show.trigger,
              args: args
            } : undefined
          }
        })
      }
    }
  },
  render() {
    if (!this.float) {
      return h(ModalView, {
        ref: 'modal',
        ...this.modal
      }, {
        default: (modalSlotProps: ModalViewSlotProps) => {
          return this.content.render(contentRef, modalSlotProps)
        }
      })
    } else {
      return null
    }
  }
})
