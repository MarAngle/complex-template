import { defineComponent, h, PropType } from "vue"
import { FileProps } from "complex-component/src/type"
import { DefaultEditFileOption, uploadFileDataType } from "complex-data/src/dictionary/DefaultEditFile"
import { DefaultEditButtonOption } from "complex-data/src/dictionary/DefaultEditButton"

export interface ImportProps extends FileProps{
  name?: string
  type?: string
  icon?: DefaultEditButtonOption['icon']
  loading?: boolean
  upload?: DefaultEditFileOption['upload']
  render?: {
    menu?: () => unknown
    content?: () => unknown
  }
}

export interface fileDataType {
  data: File
  url?: string
  name: string
}

export type importDataType = uploadFileDataType | fileDataType

export default defineComponent({
  name: 'ImportView',
  props: {
    value: {
      type: [String, Number, File, Object]
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
      type: Object as PropType<ImportProps['upload']>,
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
  render() {
    return h('div', {
      class: 'complex-import'
    }, {
      // default: () => [
      //   this.renderFile(),
      //   this.renderMenu(),
      //   this.renderList()
      // ]
    })
  }
})
