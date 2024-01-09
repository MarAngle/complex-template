import { defineComponent, h, PropType } from "vue"
import { FileProps } from "complex-component/src/type"
import { DefaultEditFileOption } from "complex-data/src/dictionary/DefaultEditFile"
import SingleUpload from "./components/import/SingleUpload"
import MultipleUpload from "./components/import/MultipleUpload"
import SingleFile from "./components/import/SingleFile"
import MultipleFile from "./components/import/MultipleFile"

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
      type: [String, Object]
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
  render() {
    if (this.upload) {
      if (!this.multiple) {
        return h(SingleUpload, {
          class: 'complex-import',
          value: this.value as undefined | string,
          name: this.name,
          type: this.type,
          icon: this.icon,
          upload: this.upload,
          render: this.render,
          loading: this.loading,
          accept: this.accept,
          size: this.size,
          disabled: this.disabled
        })
      } else {
        return h(MultipleUpload, {
          class: 'complex-import',
          value: this.value as undefined | string[],
          name: this.name,
          type: this.type,
          icon: this.icon,
          upload: this.upload,
          render: this.render,
          loading: this.loading,
          accept: this.accept,
          size: this.size,
          multiple: this.multiple,
          disabled: this.disabled
        })
      }
    } else {
      if (!this.multiple) {
        return h(SingleFile, {
          class: 'complex-import',
          value: this.value as undefined | File,
          name: this.name,
          type: this.type,
          icon: this.icon,
          render: this.render,
          loading: this.loading,
          accept: this.accept,
          size: this.size,
          disabled: this.disabled
        })
      } else {
        return h(MultipleFile, {
          class: 'complex-import',
          value: this.value as undefined | File[],
          name: this.name,
          type: this.type,
          icon: this.icon,
          render: this.render,
          loading: this.loading,
          accept: this.accept,
          size: this.size,
          multiple: this.multiple,
          disabled: this.disabled
        })
      }
    }
  }
})
