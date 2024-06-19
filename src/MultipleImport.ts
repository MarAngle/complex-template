import { defineComponent, h, PropType, VNode } from "vue"
import { notice } from "complex-plugin"
import { fileDataType } from "complex-data/type"
import { FileEditOption } from "complex-data/src/dictionary/FileEdit"
import { FileMultipleValue, FileValue, fileValueType } from "complex-data/src/lib/FileValue"
import { FileView } from "complex-component"
import { FileProps, MultipleFileProps } from "complex-component/type"
import { DefaultImportProps } from "./SingleImport"
import config from "../config"

export interface MultipleImportProps extends FileProps, MultipleFileProps, DefaultImportProps{
  value?: fileValueType[]
  upload?: FileEditOption<true>['upload']
}

export const defaultMultipleUpload = function(fileList: File[]) {
  return Promise.resolve({ file: fileList.map(file => { return { value: file, name: file.name} } ) })
} as NonNullable<MultipleImportProps['upload']>

export default defineComponent({
  name: 'MultipleImport',
  props: {
    value: {
      type: Array as PropType<MultipleImportProps['value']>
    },
    button: {
      type: Object as PropType<MultipleImportProps['button']>,
      required: false
    },
    complex: {
      type: Boolean,
      required: false
    },
    upload: {
      type: Function as PropType<MultipleImportProps['upload']>,
      required: false
    },
    render: {
      type: Object as PropType<MultipleImportProps['render']>,
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
      type: Object as PropType<MultipleImportProps['multiple']>,
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
      return this.upload || defaultMultipleUpload
    }
  },
  data() {
    return {
      operate: false,
      currentValue: this.value,
      data: this.parseValue(this.value) as FileMultipleValue
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
    parseValue(value?: fileValueType[]) {
      return new FileMultipleValue((value || []).map(valueItem => new FileValue(valueItem)))
    },
    syncData() {
      // 多选模式下，value可能存在splice的改变或者是splice后重新赋值，此时需要将额外数据删除
      if (this.value) {
        this.data.assign(this.parseValue(this.value))
      } else {
        this.data.reset()
      }
    },
    onSelect(file: File[]) {
      this.operate = true
      this.currentUpload(file).then(res => {
        this.onUpload(res.file, true)
      }).catch((err: unknown) => {
        console.error(err)
      }).finally(() => {
        this.operate = false
      })
    },
    onUpload(fileList: fileDataType[], emit?: boolean) {
      if (this.currentValue) {
        fileList.forEach(file => {
          if (this.currentValue!.indexOf(file.value) === -1) {
            this.currentValue!.push(file.value)
            this.data.push(new FileValue(file))
          }
        })
      } else {
        this.currentValue = []
        fileList.forEach(file => {
          this.currentValue!.push(file.value)
          this.data.push(new FileValue(file))
        })
      }
      if (this.max && this.currentValue.length > this.max) {
        this.currentValue.length = this.max
        this.data.truncation(this.max)
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
      if (this.max && this.currentValue && this.currentValue.length >= this.max) {
        disabled = true
      }
      return h(FileView, {
        class: 'complex-import-file',
        ref: 'file',
        accept: this.accept,
        multiple: this.multiple,
        disabled: disabled,
        size: this.size,
        onSelect: this.onSelect
      })
    },
    renderMenu() {
      return config.import.renderMenu(this)
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
    deleteData(key: any, index: number) {
      if (this.disabled || this.loading) {
        return
      }
      this.currentValue!.splice(index, 1)
      this.data.delete(key)
      this.emitData()
    },
    renderContent(file: FileValue, index: number) {
      return config.import.renderContent(file, this.disabled, () => {
        this.deleteData(file.value, index)
      })
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
      content = this.renderList(this.data)
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
