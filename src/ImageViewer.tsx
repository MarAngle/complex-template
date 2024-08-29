import { defineComponent, h, PropType, VNode } from "vue"
import ModalView, { ModalViewProps } from "./ModalView"
import icon, { localIconProps } from "../icon"
import config from "../config"

type renderType = (payload: localIconProps) => VNode | VNode[]

export default defineComponent({
  name: 'ImageViewer',
  props: {
    src: {
      type: String,
      required: false
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
  computed: {
    currentHeight() {
      return this.height || this.width
    },
    currentSize() {
      return this.width >= this.currentHeight ? this.width : this.currentHeight
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
          onClick: this.modal ? () => {
            (this.$refs.modal as InstanceType<typeof ModalView>).show()
          } : undefined
        })
      } else {
        return h('div', {
          class: 'complex-image-viewer-empty'
        }, [
          !this.emptyRender ? icon.local('emptyPic', { size: this.currentSize, color: config.style.color.disabled }) : this.emptyRender({ size: this.currentSize, color: config.style.color.disabled })
        ])
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
    const height = config.component.data.formatPixel(this.currentHeight)
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
