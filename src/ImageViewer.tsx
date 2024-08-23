import { defineComponent, h, PropType, VNode } from "vue"
import ModalView, { ModalViewProps } from "./ModalView"
import config from "../config"

type renderType = () => VNode | VNode[]

export default defineComponent({
  name: 'ImageViewer',
  props: {
    src: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      required: false,
      default: 100
    },
    height: {
      type: Number,
      required: false
    },
    modal: {
      type: Object as PropType<ModalViewProps>,
      required: false
    },
    emptyRender: {
      type: Function as PropType<renderType>,
      required: false
    }
  },
  methods: {
    renderImage() {
      if (this.src) {
        return h('img', {
          class: 'complex-image-viewer-content',
          src: this.src,
          style: {
            width: '100%',
            height: '100%'
          },
          on: this.modal ? {
            click: () => {
              (this.$refs.modal as InstanceType<typeof ModalView>).show()
            }
          } : {}
        })
      } else if (this.emptyRender) {
        return this.emptyRender()
      } else {
        return config.imageViewer.emptyRender()
      }
    },
    renderModal() {
      if (this.modal) {
        return h(ModalView, {
          ref: 'modal',
          title: '图片查看',
          ...this.modal
        }, {
          default: ({ width }: { width: number }) => {
            const currentWidth = config.component.data.formatPixel(width)
            return h('img', {
              src: this.src,
              style: {
                width: currentWidth,
                height: 'auto'
              }
            })
          }
        })
      }
    }
  },
  render() {
    const width = config.component.data.formatPixel(this.width)
    const height = this.height ? config.component.data.formatPixel(this.height) : width
    return h('div', {
      class: 'complex-image-viewer',
      style: {
        width: width,
        height: height
      }
    }, [
      this.renderImage(),
      this.renderModal()
    ])
  }
})
