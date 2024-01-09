import { defineComponent, h, PropType } from "vue"
import { Button } from "ant-design-vue"
import { ButtonType } from "ant-design-vue/es/button"
import { uploadFileDataType } from "complex-data/src/dictionary/DefaultEditFile"
import { FileView } from "complex-component"
import { ImportProps } from "../../ImportView"
import icon from "../../../icon"

export default defineComponent({
  name: 'SingleUpload',
  props: {
    value: {
      type: String
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
    upload: {
      type: Object as PropType<ImportProps['upload']>,
      required: true
    },
    render: {
      type: Object as PropType<ImportProps['render']>,
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
      data: { data: this.value, name: this.value, url: undefined } as Partial<uploadFileDataType>
    }
  },
  methods: {
    syncData(file?: string) {
      if (this.data.data !== file) {
        this.data.data = file
        this.data.name = file
        this.data.url = undefined
      }
    },
    setData(file: uploadFileDataType, emit?: boolean) {
      if (this.data.data !== file.data) {
        this.data.data = file.data
        this.data.name = file.name
        this.data.url = file.url
        if (emit) {
          this.emitData()
        }
      }
    },
    clearData() {
      this.data.data = undefined
      this.data.name = undefined
      this.data.url = undefined
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
          this.operate = true
          this.upload!(file).then(res => {
            this.setData(res.file as uploadFileDataType, true)
          }).catch((err: unknown) => {
            console.error(err)
          }).finally(() => {
            this.operate = false
          })
        }
      })
    },
    renderMenu() {
      return h(Button, {
        class: 'complex-import-single-file-menu',
        loading: this.loading || this.operate,
        type: this.type === 'danger' ? 'primary' : this.type as ButtonType,
        danger: this.type === 'danger',
        icon: icon.parse(this.icon as ImportProps['icon']),
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
