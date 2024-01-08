import { defineComponent, h, PropType } from "vue"
import { FileProps } from "complex-component/src/type"
import { DefaultEditButtonOption } from "complex-data/src/dictionary/DefaultEditButton"
import { FileView } from "complex-component"
import { Button } from "ant-design-vue"
import { ButtonType } from "ant-design-vue/es/button"
import icon from "../../../icon"

export interface SingleFileProps extends FileProps{
  name?: string
  type?: string
  icon?: DefaultEditButtonOption['icon']
  loading?: boolean
  render?: {
    menu?: () => unknown
    content?: () => unknown
  }
}

export default defineComponent({
  name: 'SingleFile',
  props: {
    value: {
      type: File
    },
    name: {
      type: String,
      required: false,
      default: '上传'
    },
    type: {
      type: String,
      required: false
    },
    icon: {
      type: [String, Function],
      required: false,
      default: 'upload'
    },
    render: {
      type: Object as PropType<SingleFileProps['render']>,
      required: false
    },
    loading: {
      type: Boolean,
      required: false
    },
    accept: {
      type: String,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    },
    size: { // MB
      type: Number,
      required: false
    }
  },
  watch: {
    value: function(value) {
      this.syncData(value)
    }
  },
  data() {
    return {
      operate: false,
      data: this.value
    }
  },
  methods: {
    syncData(file?: File) {
      this.setData(file, false)
    },
    setData(file?: File, emit?: boolean) {
      if (this.data !== file) {
        this.data = file
        if (emit) {
          this.emitData()
        }
      }
    },
    clearData() {
      this.data = undefined
      this.emitData()
    },
    emitData() {
      this.$emit('change', this.data)
    },
    renderFile() {
      return h(FileView, {
        class: 'complex-import-single-file-file',
        ref: 'file',
        accept: this.accept,
        disabled: this.disabled,
        size: this.size,
        onFile: (file: File) => {
          this.setData(file, true)
        }
      })
    },
    renderMenu() {
      return h(Button, {
        class: 'complex-import-single-file-menu',
        loading: this.loading || this.operate,
        type: this.type === 'danger' ? 'primary' : this.type as ButtonType,
        danger: this.type === 'danger',
        icon: icon.parse(this.icon as SingleFileProps['icon']),
        disabled: this.disabled,
        onClick: () => {
          (this.$refs.file as InstanceType<typeof FileView>).$el.click()
        }
      }, {
        default: () => this.name
      })
    },
    renderContent() {
      return this.data ? h('div', {
        class: 'complex-import-single-file-item'
      }, {
        default: () => [
          h('span', {
            class: 'complex-import-single-file-item-name'
          }, {
            default: () => this.data!.name
          }),
          h('span', {
            class: 'complex-import-single-file-item-delete',
            onClick: () => {
              this.clearData()
            }
          }, {
            default: () => icon.parse('close')
          }),
        ]
      }) : null
    }
  },
  render() {
    return h('div', {
      class: 'complex-import-single-file'
    }, {
      default: () => [
        this.renderFile(),
        this.renderMenu(),
        this.renderContent()
      ]
    })
  }
})
