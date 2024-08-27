import { defineComponent, h, PropType } from "vue"
import { ButtonValue } from "complex-data/type"
import { FileView } from "complex-component"
import MenuView from "./components/MenuView"

export default defineComponent({
  name: 'ButtonView',
  props: {
    data: {
      type: Object as PropType<ButtonValue<any, [any]>>,
      required: true
    },
    disabled: {
      type: Boolean,
      required: false
    },
    loading: {
      type: Boolean,
      required: false
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
        onSelect: (file: File) => {
          (this.$refs.menu as InstanceType<typeof MenuView>).operate = true
          this.data.upload!(file).finally(() => {
            (this.$refs.menu as InstanceType<typeof MenuView>).operate = false
          })
        }
      })
    },
    renderFileMenu() {
      return h(MenuView, {
        ...this.$attrs,
        ref: 'menu',
        data: this.data,
        disabled: this.disabled,
        loading: this.loading,
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
      return [this.renderFile(), this.renderFileMenu()]
    }
  }
})
