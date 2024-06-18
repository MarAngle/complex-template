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
import icon from "../icon"

export const defaultUpload = function(file: File) {
  return Promise.resolve({ file: { value: file, name: file.name } })
} as NonNullable<FileEditOption<false>['upload']>

export interface SingleImportProps extends FileProps<false>{
  value?: fileValueType
  name?: NonNullable<FileEditOption<false>['button']>['name']
  type?: NonNullable<FileEditOption<false>['button']>['type']
  icon?: NonNullable<FileEditOption<false>['button']>['icon']
  complex?: FileEditOption<false>['complex']
  upload?: FileEditOption<false>['upload']
  loading?: boolean
  render?: {
    menu?: () => (VNode | VNode[])
    content?: () => (VNode | VNode[])
  }
}
// 考虑单选为限制情况的多选
// 考虑添加complex，接收一个复杂对象实现，具体的名称和URL解析考虑单独参数或者额外包装
export default defineComponent({
  name: 'SingleImport',
  props: {
    value: {
      type: [String, Object] as PropType<SingleImportProps['value']>
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
      type: Function as PropType<SingleImportProps['upload']>,
      required: false
    },
    render: {
      type: Object as PropType<SingleImportProps['render']>,
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
      this.syncValue()
    }
  },
  computed: {
    currentUpload() {
      return this.upload || defaultUpload
    }
  },
  data() {
    return {
      operate: false,
      currentValue: this.value,
      data: this.parseValue(this.value) as undefined | FileValue
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
    parseValue(value?: fileValueType) {
      return value ? new FileValue(value as fileValueType) : undefined
    },
    syncData() {
      // 校准data
      this.data = this.parseValue(this.value)
    },
    onSingleSelect(file: File) {
      this.operate = true;
      this.currentUpload(file).then(res => {
        this.setSingleUpload(res.file, true)
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
    emitData() {
      this.$emit('select', this.currentValue)
    },
    renderFile() {
      let disabled = this.disabled
      return h(FileView, {
        class: 'complex-import-file',
        ref: 'file',
        accept: this.accept,
        disabled: disabled,
        size: this.size,
        onSelect: this.onSingleSelect
      })
    },
    renderMenu() {
      const props = {
        class: 'complex-import-menu',
        loading: this.loading || this.operate,
        type: this.type === 'danger' ? 'primary' : this.type as ButtonType,
        danger: this.type === 'danger',
        icon: icon.parse(this.icon as SingleImportProps['icon']),
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
    removeData() {
      if (this.disabled || this.loading) {
        return
      }
      this.currentValue = undefined
      this.data = undefined
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
              this.removeData()
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
          upload: this.upload,
          value: this.currentValue,
          data: this.data
        }
      })
    } else {
      content = this.renderContent(this.data as undefined | FileValue)
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
