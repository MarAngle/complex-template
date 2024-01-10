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
      type: Function as PropType<ImportProps['upload']>,
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
    size: { // MB
      type: Number,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    }
  },
  watch: {
    value: function() {
      this.syncData()
    }
  },
  data() {
    return {
      operate: false,
      currentValue: this.value,
      data: this.value ? { data: this.value, name: this.value, url: undefined } : undefined as undefined | uploadFileDataType
    }
  },
  methods: {
    syncData() {
      if (this.currentValue !== this.value) {
        this.currentValue = this.value
        this.data = this.value ? { data: this.value, name: this.value, url: undefined } : undefined
      }
    },
    setData(file: uploadFileDataType, emit?: boolean) {
      if (this.currentValue !== file.data) {
        this.currentValue= file.data
        this.data = file
        if (emit) {
          this.emitData()
        }
      }
    },
    clearData() {
      this.currentValue = undefined
      this.data = undefined
      this.emitData()
    },
    emitData() {
      this.$emit('select', this.currentValue)
    },
    renderFile() {
      return h(FileView, {
        class: 'complex-import-file',
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
        class: 'complex-import-menu',
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
        class: 'complex-import-content'
      }, {
        default: () => [
          h('span', {
            class: 'complex-import-content-name'
          }, {
            default: () => this.data!.name
          }),
          h('span', {
            class: 'complex-import-content-delete',
            onClick: () => {
              this.clearData()
            }
          }, [icon.parse('close')]),
        ]
      }) : null
    }
  },
  render() {
    return h('div', {
      class: 'complex-import-single-upload'
    }, {
      default: () => [
        this.renderFile(),
        this.renderMenu(),
        this.renderContent()
      ]
    })
  }
})
