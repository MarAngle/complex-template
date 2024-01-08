import { defineComponent, h, PropType } from "vue"
import { FileProps } from "complex-component/src/type"
import { DefaultEditButtonOption } from "complex-data/src/dictionary/DefaultEditButton"
import { FileView } from "complex-component"
import { Button } from "ant-design-vue"
import { ButtonType } from "ant-design-vue/es/button"
import icon from "../../../icon"

export interface MultipleFileProps extends FileProps{
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
  name: 'MultipleFile',
  props: {
    value: {
      type: Object as PropType<File[]>
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
      type: Object as PropType<MultipleFileProps['render']>,
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
    multiple: {
      type: Boolean,
      required: false,
      default: false
    },
    max: {
      type: Number,
      required: false
    },
    min: {
      type: Number,
      required: false
    },
    append: {
      type: Boolean,
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
      data: this.value || []
    }
  },
  methods: {
    syncData(file: undefined | File[]) {
      this.setData(file, false, false)
    },
    setData(file: undefined | File[], append?: boolean, emit?: boolean) {
      if (this.data !== file) {
        if (!append) {
          this.data = file || []
        } else if (!file) {
          // append模式下file无值不做操作
        } else {
          file.forEach(fileItem => {
            if (this.data.indexOf(fileItem) === -1) {
              this.data.push(fileItem)
            }
          })
        }
        if (emit) {
          this.emitData()
        }
      }
    },
    removeData(index: number) {
      this.data.splice(index, 1)
      this.emitData()
    },
    emitData() {
      this.$emit('change', this.data)
    },
    renderFile() {
      return h(FileView, {
        class: 'complex-import-multiple-file-file',
        ref: 'file',
        accept: this.accept,
        multiple: this.multiple,
        max: this.max,
        min: this.min,
        append: this.append,
        disabled: this.disabled,
        size: this.size,
        onFile: (file: File[]) => {
          this.setData(file, true, true)
        }
      })
    },
    renderMenu() {
      return h(Button, {
        class: 'complex-import-multiple-file-menu',
        loading: this.loading || this.operate,
        type: this.type === 'danger' ? 'primary' : this.type as ButtonType,
        danger: this.type === 'danger',
        icon: icon.parse(this.icon as MultipleFileProps['icon']),
        disabled: this.disabled,
        onClick: () => {
          (this.$refs.file as InstanceType<typeof FileView>).$el.click()
        }
      }, {
        default: () => this.name
      })
    },
    renderList() {
      return h('div', {
        class: 'complex-import-multiple-file-list'
      }, {
        default: () => this.data.map((file, index) => {
          return this.renderContent(file, index)
        })
      })
    },
    renderContent(file: File, index: number) {
      return this.data ? h('div', {
        class: 'complex-import-multiple-file-item'
      }, {
        default: () => [
          h('span', {
            class: 'complex-import-multiple-file-item-name'
          }, {
            default: () => file.name
          }),
          h('span', {
            class: 'complex-import-multiple-file-item-delete',
            onClick: () => {
              this.removeData(index)
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
      class: 'complex-import-multiple-file'
    }, {
      default: () => [
        this.renderFile(),
        this.renderMenu(),
        this.renderList()
      ]
    })
  }
})
