import { defineComponent, h, PropType } from "vue"
import { Button } from "ant-design-vue"
import { ButtonType } from "ant-design-vue/es/button"
import { notice } from "complex-plugin"
import { DefaultEditFileOption, uploadFileDataType } from "complex-data/src/dictionary/DefaultEditFile"
import { FileView } from "complex-component"
import { FileProps } from "complex-component/src/type"
import icon from "../icon"

export interface ImportProps extends FileProps{
  name?: NonNullable<DefaultEditFileOption['button']>['name']
  type?: NonNullable<DefaultEditFileOption['button']>['type']
  icon?: NonNullable<DefaultEditFileOption['button']>['icon']
  upload?: DefaultEditFileOption['upload']
  loading?: boolean
  render?: {
    menu?: () => unknown
    content?: () => unknown
  }
}

export default defineComponent({
  name: 'ImportView',
  props: {
    value: {
      type: [String, Object] as PropType<string | string[] | File | File[]>
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
      required: false
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
    value: function() {
      this.syncData()
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
      currentValue: this.value || (!this.multiple ? undefined : []),
      data: this.upload ? (!this.multiple ? undefined : [] as uploadFileDataType[]) : undefined as undefined | uploadFileDataType
    }
  },
  methods: {
    syncData() {
      if (this.upload) {
        if (!this.multiple) {
          if (this.currentValue !== this.value) {
            this.currentValue = this.value
            this.data = this.value ? { data: this.value as string, name: this.value as string, url: undefined } : undefined
          }
        } else {
          if (this.value !== this.currentValue) {
            this.currentValue = this.value || []
            this.data = (this.currentValue as string[]).map(item => {
              return {
                data: item,
                name: item,
                url: undefined
              }
            })
          }
        }
      } else {
        !this.multiple ? this.setSingleData(this.value as undefined | File, false) : this.setMutipleData(this.value as undefined | File[], false, false)
      }
    },
    setSingleUpload(file: uploadFileDataType, emit?: boolean) {
      if (this.currentValue !== file.data) {
        this.currentValue = file.data
        this.data = file
        if (emit) {
          this.emitData()
        }
      }
    },
    setMutipleUpload(file: uploadFileDataType[], emit?: boolean) {
      file.forEach(fileItem => {
        if ((this.currentValue as string[]).indexOf(fileItem.data) === -1) {
          (this.currentValue as string[]).push(fileItem.data);
          (this.data as uploadFileDataType[]).push(fileItem)
        }
      })
      if (this.max && (this.currentValue as string[]).length > this.max) {
        (this.currentValue as string[]).length = this.max;
        (this.data as uploadFileDataType[]).length = this.max
        notice.showMsg(`当前选择的文件数量超过限制值${this.max}，超过部分已被删除！`, 'error')
      }
      if (emit) {
        this.emitData()
      }
    },
    setSingleData(file?: File, emit?: boolean) {
      if (this.currentValue !== file) {
        (this.currentValue as undefined | File) = file
        if (emit) {
          this.emitData()
        }
      }
    },
    setMutipleData(file: undefined | File[], append?: boolean, emit?: boolean) {
      if (this.currentValue !== file) {
        if (!append) {
          this.currentValue = file || []
        } else if (!file) {
          // append模式下file无值不做操作
        } else {
          file.forEach(fileItem => {
            if ((this.currentValue as File[]).indexOf(fileItem) === -1) {
              (this.currentValue as File[]).push(fileItem)
            }
          })
          if (this.max && (this.currentValue as File[]).length > this.max) {
            (this.currentValue as File[]).length = this.max
            notice.showMsg(`当前选择的文件数量超过限制值${this.max}，超过部分已被删除！`, 'error')
          }
        }
        if (emit) {
          this.emitData()
        }
      }
    },
    removeData(index?: number) {
      if (index === undefined) {
        this.currentValue = undefined
        if (this.upload) {
          this.data = undefined
        }
      } else {
        (this.currentValue as File[]).splice(index, 1)
        if (this.upload) {
          (this.data as uploadFileDataType[]).splice(index, 1)
        }
      }
      this.emitData()
    },
    emitData() {
      this.$emit('select', this.currentValue)
    },
    renderFile() {
      let disabled = this.disabled
      if (this.max && (this.currentValue as File[]).length >= this.max) {
        disabled = true
      }
      return h(FileView, {
        class: 'complex-import-file',
        ref: 'file',
        accept: this.accept,
        multiple: this.multiple,
        disabled: disabled,
        size: this.size,
        onSelect: (file: File | File[]) => {
          if (this.upload) {
            this.operate = true
            this.upload!(file).then(res => {
              !this.multiple ? this.setSingleUpload(res.file as uploadFileDataType, true) : this.setMutipleUpload(res.file as uploadFileDataType[], true)
            }).catch((err: unknown) => {
              console.error(err)
            }).finally(() => {
              this.operate = false
            })
          } else {
            !this.multiple ? this.setSingleData(file as File, true) : this.setMutipleData(file as File[], true, true)
          }
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
    renderList(list: File[] | uploadFileDataType[]) {
      return h('div', {
        class: 'complex-import-content-list'
      }, {
        default: () => list.map((file, index) => {
          return this.renderContent(file, index)
        })
      })
    },
    renderContent(file?: File | uploadFileDataType, index?: number) {
      return file ? h('div', {
        class: 'complex-import-content'
      }, {
        default: () => [
          h('span', {
            class: 'complex-import-content-name'
          }, {
            default: () => file.name
          }),
          h('span', {
            class: 'complex-import-content-delete complex-color-danger',
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
      class: 'complex-import'
    }, {
      default: () => [
        this.renderFile(),
        this.renderMenu(),
        !this.multiple ? (this.upload ? this.renderContent(this.data as undefined | uploadFileDataType) : this.renderContent(this.currentValue as undefined | File)) : (this.upload ? this.renderList(this.data as uploadFileDataType[]) : this.renderList(this.currentValue as File[]))
      ]
    })
  }
})
