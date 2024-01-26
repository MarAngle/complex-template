import { defineComponent, h, PropType } from "vue"
import { ButtonValue } from "complex-data/src/dictionary/DefaultEditButton"
import { FileView } from "complex-component"
import PureButton from "./components/PureButton"

export default defineComponent({
  name: 'ButtonView',
  props: {
    data: {
      type: Object as PropType<ButtonValue<any>>,
      required: true
    }
  },
  methods: {
    renderFile() {
      return h(FileView, {
        class: 'complex-button-file',
        ref: 'file',
        ...this.data.uploadOption,
        onChange: (file: File) => {
          (this.$refs.button as InstanceType<typeof PureButton>).operate = true
          this.data.upload!(file).finally(() => {
            (this.$refs.button as InstanceType<typeof PureButton>).operate = false
          })
        }
      })
    },
    renderPureButton() {
      return h(PureButton, {
        ...this.$attrs,
        data: this.data
      })
    },
    renderUploadButton() {
      return h(PureButton, {
        ...this.$attrs,
        ref: 'button',
        data: this.data,
        onClick: () => {
          (this.$refs.file as InstanceType<typeof FileView>).$el.click()
        }
      })
    }
  },
  render() {
    if (!this.data.upload) {
      return this.renderPureButton()
    } else {
      return [this.renderFile(), this.renderUploadButton()]
    }
  }
})
