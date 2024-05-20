import { defineComponent, h, PropType, VNode } from "vue"
import { Button } from "ant-design-vue"
import { ButtonType } from "ant-design-vue/es/button"
import { notice } from "complex-plugin"
import { FileEditOption } from "complex-data/src/dictionary/FileEdit"
import { FileView } from "complex-component"
import { FileProps } from "complex-component/src/type"
import icon from "../icon"
import { fileDataType } from "complex-data/type"

export interface ImportProps extends FileProps{
  name?: NonNullable<FileEditOption['button']>['name']
  type?: NonNullable<FileEditOption['button']>['type']
  icon?: NonNullable<FileEditOption['button']>['icon']
  complex?: FileEditOption['complex']
  upload?: FileEditOption['upload']
  loading?: boolean
  render?: {
    menu?: () => (VNode | VNode[])
    content?: () => (VNode | VNode[])
  }
}
// 考虑单选为限制情况的多选
// 考虑添加complex，接收一个复杂对象实现，具体的名称和URL解析考虑单独参数或者额外包装
export default defineComponent({
  name: 'ImportView',
  props: {
    value: {
      type: [String, Object, Array] as PropType<any | any[]>
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
    complex: {
      type: Boolean,
      required: false
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
    const currentValue = this.parseValue(this.value)
    return {
      operate: false,
      currentValue: currentValue,
      data: this.parseCurrentValue(currentValue)
    }
  },
  methods: {
    parseValue(value: any) {
      return value || (!this.multiple ? undefined : [])
    },
    parseCurrentValue(currentValue: any) {
      // if (this.complex) {
      //   return currentValue
      // }
      if (this.upload) {
        if (!this.multiple) {
          return currentValue ? { data: currentValue as string, name: currentValue as string, url: undefined } : undefined
        } else {
          return (currentValue as string[]).map(item => {
            return {
              data: item,
              name: item,
              url: undefined
            }
          })
        }
      } else {
        return currentValue
      }
    },
    syncData() {
      if (this.currentValue !== this.value) {
        this.currentValue = this.parseValue(this.value)
        this.data = this.parseCurrentValue(this.currentValue)
      }
    },
    setSingleUpload(file: fileDataType, emit?: boolean) {
      if (this.currentValue !== file.data) {
        this.currentValue = file.data
        this.data = file
        if (emit) {
          this.emitData()
        }
      }
    },
    setMutipleUpload(file: fileDataType[], emit?: boolean) {
      file.forEach(fileItem => {
        if ((this.currentValue as string[]).indexOf(fileItem.data) === -1) {
          (this.currentValue as string[]).push(fileItem.data);
          (this.data as fileDataType[]).push(fileItem)
        }
      })
      if (this.max && (this.currentValue as string[]).length > this.max) {
        (this.currentValue as string[]).length = this.max;
        (this.data as fileDataType[]).length = this.max
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
      if (this.disabled || this.loading) {
        return
      }
      if (index === undefined) {
        this.currentValue = undefined
        if (this.upload) {
          this.data = undefined
        }
      } else {
        (this.currentValue as File[]).splice(index, 1)
        if (this.upload) {
          (this.data as fileDataType[]).splice(index, 1)
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
              !this.multiple ? this.setSingleUpload(res.file as fileDataType, true) : this.setMutipleUpload(res.file as fileDataType[], true)
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
      const props = {
        class: 'complex-import-menu',
        loading: this.loading || this.operate,
        type: this.type === 'danger' ? 'primary' : this.type as ButtonType,
        danger: this.type === 'danger',
        icon: icon.parse(this.icon as ImportProps['icon']),
        disabled: this.disabled,
        onClick: () => {
          (this.$refs.file as InstanceType<typeof FileView>).$el.click()
        }
      }
      if (this.$slots.menu || (this.render && this.render.menu)) {
        return (this.$slots.menu || this.render!.menu)!({
          props,
          name: this.name,
          payload: {
            value: this.currentValue
          }
        })
      }
      return h(Button, props, {
        default: () => this.name
      })
    },
    renderList(list: File[] | fileDataType[]) {
      return h('div', {
        class: 'complex-import-content-list'
      }, {
        default: () => list.map((file, index) => {
          return this.renderContent(file, index)
        })
      })
    },
    renderContent(file?: File | fileDataType, index?: number) {
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
          }, this.disabled ? [] : [icon.parse('close')]),
        ]
      }) : null
    }
  },
  render() {
    let content: null | VNode | VNode[]
    if (this.$slots.content || (this.render && this.render.content)) {
      content = (this.$slots.content || this.render!.content)!({
        props: {
          multiple: this.multiple,
          upload: this.upload,
          value: this.currentValue,
          data: this.data
        }
      })
    } else {
      content = !this.multiple ? (this.upload ? this.renderContent(this.data as undefined | fileDataType) : this.renderContent(this.currentValue as undefined | File)) : (this.upload ? this.renderList(this.data as fileDataType[]) : this.renderList(this.currentValue as File[]))
    }
    return h('div', {
      class: 'complex-import'
    }, {
      default: () => [
        this.renderFile(),
        this.renderMenu(),
        content
      ]
    })
  }
})
