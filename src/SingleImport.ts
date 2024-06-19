import { defineComponent, h, PropType, VNode } from "vue"
import { defaultFileOption, fileDataType } from "complex-data/type"
import { FileEditOption } from "complex-data/src/dictionary/FileEdit"
import { FileMultipleValue, FileValue, fileValueType } from "complex-data/src/lib/FileValue"
import { FileView } from "complex-component"
import { FileProps } from "complex-component/type"
import config from "../config"

export interface DefaultImportProps {
  button?: defaultFileOption['button']
  complex?: defaultFileOption['complex']
  loading?: boolean
  render?: {
    menu?: () => (VNode | VNode[])
    content?: () => (VNode | VNode[])
  }
}

export interface SingleImportProps extends FileProps, DefaultImportProps {
  value?: fileValueType
  upload?: FileEditOption<false>['upload']
}

export const defaultUpload = function(file: File) {
  return Promise.resolve({ file: { value: file, name: file.name } })
} as NonNullable<SingleImportProps['upload']>

export default defineComponent({
  name: 'SingleImport',
  props: {
    value: {
      type: [String, Object] as PropType<SingleImportProps['value']>
    },
    button: {
      type: Object as PropType<SingleImportProps['button']>,
      required: false
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
      return value ? new FileValue(value) : undefined
    },
    syncData() {
      // 校准data
      this.data = this.parseValue(this.value)
    },
    onSelect(file: File) {
      this.operate = true;
      this.currentUpload(file).then(res => {
        this.onUpload(res.file, true)
      }).catch((err: unknown) => {
        console.error(err)
      }).finally(() => {
        this.operate = false
      })
    },
    onUpload(file: fileDataType, emit?: boolean) {
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
      return h(FileView, {
        class: 'complex-import-file',
        ref: 'file',
        accept: this.accept,
        disabled: this.disabled,
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
        default: () => list.value.map((file) => {
          return this.renderContent(file)
        })
      })
    },
    deleteData() {
      if (this.disabled || this.loading) {
        return
      }
      this.currentValue = undefined
      this.data = undefined
      this.emitData()
    },
    renderContent(file?: FileValue) {
      return file ? config.import.renderContent(file, this.disabled, () => {
        this.deleteData()
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
      content = this.renderContent(this.data)
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
