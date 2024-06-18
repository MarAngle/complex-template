import { defineComponent, h, PropType, VNode } from "vue"
import { Button } from "ant-design-vue"
import { ButtonType } from "ant-design-vue/es/button"
import { downloadFile, isFile } from "complex-utils"
import { notice } from "complex-plugin"
import { fileDataType } from "complex-data/type"
import { FileEditOption } from "complex-data/src/dictionary/FileEdit"
import { FileMultipleValue, FileValue, fileValueType } from "complex-data/src/lib/FileValue"
import { FileView } from "complex-component"
import { FileProps } from "complex-component/type"
import icon from "../../icon"

export const defaultUpload = function(file: File) {
  return Promise.resolve({ file: { value: file, name: file.name } })
} as NonNullable<FileEditOption<false>['upload']>

export const defaultMultipleUpload = function(fileList: File[]) {
  return Promise.resolve({ file: fileList.map(file => { return { value: file, name: file.name} } ) })
} as NonNullable<FileEditOption<true>['upload']>

export interface ImportProps<M extends boolean = false> extends FileProps{
  value?: fileValueType | fileValueType[]
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
  name: 'MultipleImport',
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
      this.syncValue()
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
    return {
      operate: false,
      currentValue: this.value,
      data: this.parseValue(this.value) as FileValue | FileMultipleValue
    }
  },
  methods: {
    syncValue() {
      // 此处基于外部数据整合内部数据
      if (this.value !== this.currentValue) {
        this.currentValue = this.value
      }
      this.syncData()
    },
    parseValue(value?: fileValueType | fileValueType[]) {
      if (!this.multiple) {
        return new FileValue(value as fileValueType)
      } else {
        return new FileMultipleValue((value as fileValueType[] || []).map(valueItem => new FileValue(valueItem)))
      }
    },
    syncData() {
      // 校准data
      if (!this.multiple) {
        this.data = this.parseValue(this.value)
      } else {
        // 多选模式下，value可能存在splice的改变或者是splice后重新赋值，此时需要将额外数据删除
        if (this.value) {
          const currentList = this.parseValue(this.value) as FileMultipleValue
          (this.data as FileMultipleValue).assign(currentList)
        } else {
          (this.data as FileMultipleValue).reset()
        } 
      }
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
    setSingleUpload(file: fileDataType, emit?: boolean) {
      if (this.currentValue !== file.value) {
        this.currentValue = file.value
        this.data = new FileValue(file)
        if (emit) {
          this.emitData()
        }
      }
    },
    setMultipleUpload(fileList: fileDataType[], emit?: boolean) {
      fileList.forEach(file => {
        if ((this.currentValue as any[]).indexOf(file.value) === -1) {
          (this.currentValue as any[]).push(file.value);
          (this.data as FileMultipleValue).push(new FileValue(file))
        }
      })
      if (this.max && (this.currentValue as string[]).length > this.max) {
        (this.currentValue as string[]).length = this.max;
        (this.data as FileMultipleValue).truncation(this.max)
        notice.showMsg(`当前选择的文件数量超过限制值${this.max}，超过部分已被删除！`, 'error')
      }
      if (emit) {
        this.emitData()
      }
    },
    emitData() {
      this.$emit('select', this.currentValue)
    },
    renderFile() {
      let disabled = this.disabled
      if (this.max && (this.currentValue as fileValueType[]).length >= this.max) {
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
    renderList(list: FileMultipleValue) {
      return h('div', {
        class: 'complex-import-content-list'
      }, {
        default: () => list.value.map((file, index) => {
          return this.renderContent(file, index)
        })
      })
    },
    removeData(key: any, index?: number) {
      if (this.disabled || this.loading) {
        return
      }
      if (!index) {
        this.currentValue = undefined
        this.data.reset()
      } else {
        (this.currentValue as File[]).splice(index, 1);
        (this.data as FileMultipleValue).delete(key)
      }
      this.emitData()
    },
    renderContent(file?: FileValue, index?: number) {
      const isFileValue = isFile(file)
      const canDownload = !isFileValue && file && file.url
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
              this.removeData(file.value!, index)
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
      content = !this.multiple ? this.renderContent(this.data as undefined | FileValue) : this.renderList(this.data as FileMultipleValue)
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
