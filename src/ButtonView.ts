import { defineComponent, h, PropType } from "vue"
import { ButtonValue } from "complex-data/src/type"
import { FileView } from "complex-component"
import MenuView from "./components/MenuView"

export default defineComponent({
  name: 'ButtonView',
  props: {
    data: {
      type: Object as PropType<ButtonValue<any, [any]>>,
      required: true
    }
  },
  methods: {
    renderMenu() {
      return h(MenuView, {
        ...this.$attrs,
        data: this.data
      })
    },
    renderFile() {
      return h(FileView, {
        class: 'complex-menu-file',
        ref: 'file',
        ...this.data.fileOption,
        onChange: (file: File) => {
          (this.$refs.menu as InstanceType<typeof MenuView>).operate = true
          this.data.upload!(file).finally(() => {
            (this.$refs.menu as InstanceType<typeof MenuView>).operate = false
          })
        }
      })
    },
    renderUploadMenu() {
      return h(MenuView, {
        ...this.$attrs,
        ref: 'menu',
        data: this.data,
        onClick: () => {
          (this.$refs.file as InstanceType<typeof FileView>).$el.click()
        }
      })
    }
  },
  render() {
    if (!this.data.upload) {
      return this.renderMenu()
    } else {
      return [this.renderFile(), this.renderUploadMenu()]
    }
  }
})
