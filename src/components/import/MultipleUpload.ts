import { defineComponent, h, PropType } from "vue"
import { Button } from "ant-design-vue"
import { ButtonType } from "ant-design-vue/es/button"
import { notice } from "complex-plugin"
import { uploadFileDataType } from "complex-data/src/dictionary/DefaultEditFile"
import { FileView } from "complex-component"
import { ImportProps } from "../../ImportView"
import icon from "../../../icon"

export default defineComponent({
  name: 'MultipleFile',
  props: {
    value: {
      type: Object as PropType<string[]>
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
      type: Object as PropType<ImportProps['render']>,
      required: false
    },
    upload: {
      type: Function as PropType<ImportProps['upload']>,
      required: true
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
    multiple: {
      type: Object as PropType<ImportProps['multiple']>,
      required: false
    },
    disabled: {
      type: Boolean,
      required: false
    }
  },
  watch: {
    value: {
      immediate: true,
      handler: function() {
        this.syncData()
      }
    }
  },
  computed: {
    max() {
      if (this.multiple) {
        return this.multiple.max || 0
      } else {
        return 0
      }
    }
  },
  data() {
    return {
      operate: false,
      currentValue: [] as string[],
      data: [] as uploadFileDataType[]
    }
  },
  methods: {
    syncData() {
      if (this.value !== this.currentValue) {
        this.currentValue = this.value || []
        this.data = this.currentValue.map(item => {
          return {
            data: item,
            name: item,
            url: undefined
          }
        })
      }
    },
    setData(file: uploadFileDataType[], emit?: boolean) {
      file.forEach(fileItem => {
        if (this.currentValue.indexOf(fileItem.data) === -1) {
          this.currentValue.push(fileItem.data)
          this.data.push(fileItem)
        }
      })
      if (this.max && this.currentValue.length > this.max) {
        this.currentValue.length = this.max
        this.data.length = this.max
        notice.showMsg(`当前选择的文件数量超过限制值${this.max}，超过部分已被删除！`, 'error')
      }
      if (emit) {
        this.emitData()
      }
    },
    removeData(index: number) {
      this.currentValue.splice(index, 1)
      this.data.splice(index, 1)
      this.emitData()
    },
    emitData() {
      this.$emit('select', this.currentValue)
    },
    renderFile() {
      let disabled = this.disabled
      if (this.max && this.currentValue.length >= this.max) {
        disabled = true
      }
      return h(FileView, {
        class: 'complex-import-file',
        ref: 'file',
        accept: this.accept,
        multiple: this.multiple,
        disabled: disabled,
        size: this.size,
        onFile: (file: File[]) => {
          this.operate = true
          this.upload!(file).then(res => {
            this.setData(res.file as uploadFileDataType[], true)
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
    renderList() {
      return h('div', {
        class: 'complex-import-content-list'
      }, {
        default: () => this.data.map((file, index) => {
          return this.renderContent(file, index)
        })
      })
    },
    renderContent(file: uploadFileDataType, index: number) {
      return this.currentValue ? h('div', {
        class: 'complex-import-content'
      }, {
        default: () => [
          h('span', {
            class: 'complex-import-content-name'
          }, {
            default: () => file.name
          }),
          h('span', {
            class: 'complex-import-content-delete',
            onClick: () => {
              this.removeData(index)
            }
          }, [icon.parse('close')]),
        ]
      }) : null
    }
  },
  render() {
    return h('div', {
      class: 'complex-import-multiple-upload'
    }, {
      default: () => [
        this.renderFile(),
        this.renderMenu(),
        this.renderList()
      ]
    })
  }
})
