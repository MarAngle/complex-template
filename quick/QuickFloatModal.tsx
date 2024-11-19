import { defineComponent, h, PropType } from "vue"
import { ModalProps } from "ant-design-vue"
import ModalView, { ModalViewProps, ModalViewSlotProps } from "../src/ModalView"
import FloatData, { FloatValue } from "./data/FloatData"

export interface QuickFloatModalProps {
  modal: ModalViewProps
  render: FloatValue['render']
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
    render: {
      type: Function as PropType<QuickFloatModalProps['render']>,
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
      return !this.float ? this.$refs['content'] : this.floatValue!.ref
    },
    submit(...args: any[]) {
      const content = this.getContent() as any
      if (content.$submit) {
        return content.$submit(...args) as Promise<any>
      } else {
        return Promise.resolve({})
      }
    },
    showModal(showArgs?: any[], title?: string, option?: ModalProps) {
      if (!this.float) {
        (this.$refs.modal as InstanceType<typeof ModalView>).show(title, option)
        this.$nextTick(() => {
          if (typeof (this.$refs.content as any).$show === 'function') {
            (this.$refs.content as any).$show(...(showArgs || []))
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
          render: this.render
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
          return this.render(modalSlotProps)
        }
      })
    } else {
      return null
    }
  }
})
