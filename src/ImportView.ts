import { defineComponent, h, PropType, VNode } from "vue"
import { Button } from "ant-design-vue"
import { ButtonType } from "ant-design-vue/es/button"
import { downloadFile, isFile } from "complex-utils"
import { notice } from "complex-plugin"
import { FileEditOption } from "complex-data/src/dictionary/FileEdit"
import { fileDataType } from "complex-data/type"
import { FileView } from "complex-component"
import { FileProps } from "complex-component/type"
import icon from "../icon"

export const defaultUpload = function(file: File) {
  return Promise.resolve({ file: { data: file, name: file.name } })
} as NonNullable<FileEditOption<false>['upload']>

export const defaultMultipleUpload = function(fileList: File[]) {
  return Promise.resolve({ file: fileList.map(file => { return {data: file, name: file.name} } ) })
} as NonNullable<FileEditOption<true>['upload']>

export interface ImportProps<M extends boolean = false> extends FileProps{
  value?: any
  name?: NonNullable<FileEditOption<M>['button']>['name']
  type?: NonNullable<FileEditOption<M>['button']>['type']
  icon?: NonNullable<FileEditOption<M>['button']>['icon']
  complex?: FileEditOption<M>['complex']
  upload?: FileEditOption<M>['upload']
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
      type: [String, Object, Array] as PropType<ImportProps<boolean>['value']>
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
      type: Function as PropType<ImportProps<boolean>['upload']>,
      required: false
    },
    render: {
      type: Object as PropType<ImportProps<boolean>['render']>,
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
      type: Object as PropType<ImportProps<boolean>['multiple']>,
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
    },
    currentUpload() {
      if (!this.upload) {
        return !this.multiple ? defaultUpload : defaultMultipleUpload
      } else {
        return this.upload
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
    setMultipleUpload(fileList: fileDataType[], emit?: boolean) {
      fileList.forEach(file => {
        if ((this.currentValue as any[]).indexOf(file.data) === -1) {
          (this.currentValue as any[]).push(file.data);
          (this.data as fileDataType[]).push(file)
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
    removeData(index?: number) {
      if (this.disabled || this.loading) {
        return
      }
      if (index === undefined) {
        this.currentValue = undefined
        this.data = undefined
      } else {
        (this.currentValue as File[]).splice(index, 1);
        (this.data as fileDataType[]).splice(index, 1)
      }
      this.emitData()
    },
    emitData() {
      this.$emit('select', this.currentValue)
    },
    onSingleSelect(file: File) {
      this.operate = true;
      (this.currentUpload as NonNullable<ImportProps<false>['upload']>)(file).then(res => {
        this.setSingleUpload(res.file, true)
      }).catch((err: unknown) => {
        console.error(err)
      }).finally(() => {
        this.operate = false
      })
    },
    onMultipleSelect(file: File[]) {
      this.operate = true;
      (this.currentUpload as NonNullable<ImportProps<true>['upload']>)(file).then(res => {
        this.setMultipleUpload(res.file, true)
      }).catch((err: unknown) => {
        console.error(err)
      }).finally(() => {
        this.operate = false
      })
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
        onSelect: this.multiple ? this.onMultipleSelect : this.onSingleSelect
      })
    },
    renderMenu() {
      const props = {
        class: 'complex-import-menu',
        loading: this.loading || this.operate,
        type: this.type === 'danger' ? 'primary' : this.type as ButtonType,
        danger: this.type === 'danger',
        icon: icon.parse(this.icon as ImportProps<boolean>['icon']),
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
    renderList(list: fileDataType[]) {
      return h('div', {
        class: 'complex-import-content-list'
      }, {
        default: () => list.map((file, index) => {
          return this.renderContent(file, index)
        })
      })
    },
    renderContent(file?: fileDataType, index?: number) {
      const isFileData = isFile(file)
      const canDownload = !isFileData && file && file.url
      return file ? h('div', {
        class: 'complex-import-content'
      }, {
        default: () => [
          h('span', {
            class: canDownload ? 'complex-import-content-name complex-color-link' : 'complex-import-content-name',
            onClick: () => {
              if (canDownload) {
                // 文件对象类型以及存在下载链接时，点击下载
                downloadFile(file.url!, file.name)
              }
            }
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
      content = !this.multiple ? this.renderContent(this.data as undefined | fileDataType) : this.renderList(this.data as fileDataType[])
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
