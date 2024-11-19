import { defineComponent, h, PropType } from "vue"
import { ModalProps } from "ant-design-vue"
import ModalView, { ModalViewProps, ModalViewSlotProps } from "../src/ModalView"
import FloatData, { FloatValue } from "./data/FloatData"
import { contentRef } from "./QuickFloatValue"

export interface QuickFloatModalProps {
  modal: ModalViewProps
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
      return !this.float ? this.$refs[contentRef] : this.floatValue!.ref!.getContent()
    },
    show(showArgs?: any[], title?: string, option?: ModalProps) {
      console.log(showArgs, this.float)
      if (!this.float) {
        (this.$refs.modal as InstanceType<typeof ModalView>).show(title, option)
        this.$nextTick(() => {
          if (this.content.onShow) {
            this.content.onShow(this.getContent(), showArgs)
          }
        })
      } else {
        this.floatValue = this.float.push({
          name: title || this.modal.title || '浮窗',
          modal: {
            props: {
              title: title,
              ...this.modal
            }
          },
          content: {
            ...this.content,
            show: showArgs
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
